# Session-Based Authentication: Overview

**Session-based authentication** is a stateful approach where the server creates and stores a session after a user logs in, and the client holds a reference to it via a cookie. Every subsequent request sends that cookie, and the server looks up the session to verify identity.

> **Analogy:** A coat check at a restaurant. When you arrive (log in), they take your coat and hand you a numbered ticket (session cookie). Every time you need something, you show the ticket. When you leave (log out), they take the ticket back and discard the coat.

---

## How It Works — The Flow

```
1. User submits credentials (username + password)
        ↓
2. Server validates credentials against the DB
        ↓
3. Server creates a session, stores it (memory/DB/Redis)
        ↓
4. Server responds with a Set-Cookie header containing the session ID
        ↓
5. Browser stores the cookie, sends it automatically on every request
        ↓
6. Server receives request → looks up session ID → identifies user
        ↓
7. On logout, server destroys the session — cookie becomes invalid
```

---

## Key Components

### Session Store
Where session data lives on the server. Common options:

| Store | Use case |
|---|---|
| In-memory (default) | Development only — lost on restart, doesn't scale |
| Redis | Production standard — fast, supports TTL, scales horizontally |
| Database (PostgreSQL) | When you need session persistence and auditability |

### Session Cookie
The client-side reference. Contains only the session ID — never the actual session data.

```
Set-Cookie: sessionId=abc123xyz; HttpOnly; Secure; SameSite=Strict; Path=/
```

| Attribute | Purpose |
|---|---|
| `HttpOnly` | JS can't access it — prevents XSS token theft |
| `Secure` | Only sent over HTTPS |
| `SameSite=Strict` | Only sent on same-origin requests — prevents CSRF |
| `Max-Age` / `Expires` | Session lifetime |

---

## Basic Implementation (Node.js + Express)

```bash
npm install express express-session connect-redis redis
```

```js
const express = require('express');
const session = require('express-session');
const RedisStore = require('connect-redis').default;
const { createClient } = require('redis');

const redisClient = createClient();
await redisClient.connect();

const app = express();

app.use(session({
  store: new RedisStore({ client: redisClient }),
  secret: process.env.SESSION_SECRET,  // used to sign the session ID cookie
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 1000 * 60 * 60 * 24, // 24 hours
  }
}));
```

```js
// Login
app.post('/login', async (req, res) => {
  const user = await db.findUser(req.body.email);
  const valid = await bcrypt.compare(req.body.password, user.passwordHash);
  if (!valid) return res.status(401).send('Invalid credentials');

  req.session.userId = user.id;   // store only what you need
  req.session.role = user.role;
  res.status(200).send('Logged in');
});

// Auth middleware
function authenticate(req, res, next) {
  if (!req.session.userId) return res.status(401).send('Unauthorized');
  next();
}

// Protected route
app.get('/dashboard', authenticate, (req, res) => {
  res.send(`Welcome, user ${req.session.userId}`);
});

// Logout
app.post('/logout', (req, res) => {
  req.session.destroy();
  res.clearCookie('connect.sid');
  res.redirect('/login');
});
```

---

## Session-Based vs. Token-Based (JWT)

| | Session-Based | JWT (Token-Based) |
|---|---|---|
| **State** | Stateful — server stores session | Stateless — server stores nothing |
| **Revocation** | Instant — delete the session | Hard — token valid until expiry |
| **Storage** | Server (Redis/DB) | Client (localStorage / cookie) |
| **Scalability** | Requires shared session store across servers | Scales easily — no server state |
| **Best for** | Traditional web apps, high-security contexts | SPAs, microservices, mobile APIs |

> **When to choose sessions:** When you need instant logout/revocation (e.g., "log out all devices"), when dealing with sensitive contexts (banking, admin dashboards), or in a traditional server-rendered app where a shared Redis store is already in your stack.

---

## Session Fixation & Regeneration

**Session fixation** is an attack where an attacker sets a known session ID before login, then hijacks it after the victim authenticates. The fix: always regenerate the session ID after login.

```js
app.post('/login', async (req, res) => {
  const user = await validateCredentials(req.body);

  // Regenerate session ID after login to prevent fixation attacks
  req.session.regenerate((err) => {
    if (err) return res.status(500).send('Session error');
    req.session.userId = user.id;
    res.send('Logged in');
  });
});
```

---

## Common Pitfalls

- **Storing sensitive data in the session** — store only a user ID and role. Never store passwords, full user objects, or PII. The session store is another attack surface.
- **Missing `HttpOnly`** — without it, JavaScript can read the cookie, making XSS attacks trivially able to steal sessions.
- **Using in-memory store in production** — sessions are lost on every server restart and don't share across multiple instances. Use Redis.
- **Not regenerating session ID on login** — leaves the door open to session fixation attacks.
- **Forgetting to destroy server-side session on logout** — clearing the cookie client-side isn't enough. The server session must be destroyed too, or the session ID can still be replayed.
- **Long-lived sessions without sliding expiry** — either sessions expire too aggressively (bad UX) or never expire (security risk). Use sliding expiration: reset `maxAge` on every active request.

---

## Practical Applications

- Traditional server-rendered web apps (Express, Rails, Django)
- Admin dashboards where immediate session revocation is required
- Apps requiring "log out all devices" functionality
- Banking and high-security applications where stateless tokens are unacceptable

---

## References

- [MDN: HTTP Cookies](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies)
- [OWASP: Session Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)
- [express-session Docs](https://www.npmjs.com/package/express-session)
- [connect-redis Docs](https://www.npmjs.com/package/connect-redis)