# JWT Public & Private Key Signing: Overview

A JWT (JSON Web Token) is a self-contained token that proves who a user is. The question is: **how does the server know the token is legitimate and hasn't been tampered with?** The answer is cryptographic signing — specifically, asymmetric key pairs.

---

## Two Ways to Sign a JWT

| Method | Algorithm | Keys involved | Who can verify? |
|---|---|---|---|
| **Symmetric** | `HS256` | One shared secret | Anyone with the secret |
| **Asymmetric** | `RS256`, `ES256` | Private key + Public key | Anyone with the public key |

This article focuses on **asymmetric signing** — the more secure and scalable approach.

---

## The Key Pair — One Lock, One Key

> **Analogy:** A private key is like a unique stamp. A public key is like the stamp's impression in a catalog — anyone can look up the impression to verify the stamp was used, but only *you* can make new stamps. The stamp creates the seal; the catalog verifies it.

- **Private key** — kept secret on the auth server. Used to *sign* (stamp) tokens.
- **Public key** — shared freely. Used to *verify* the signature. Can't create new tokens.

```
Auth Server (has private key) → signs token → gives to user
API Server  (has public key)  → verifies token → trusts or rejects
```

The API server **never needs the private key** — it only verifies. This is the core advantage over symmetric signing.

---

## What Gets Signed

A JWT has three parts, separated by dots:

```
header.payload.signature
```

```
eyJhbGciOiJSUzI1NiJ9   ← header  (base64: {"alg":"RS256"})
.eyJ1c2VySWQiOjEyM30   ← payload (base64: {"userId":123, "exp":...})
.SflKxwRJSMeKKF2QT4fw  ← signature
```

The signature is computed over the header + payload using the private key:

```
signature = RSA_sign(privateKey, base64(header) + "." + base64(payload))
```

When verifying, the receiver recomputes the expected signature using the public key and checks it matches. If anyone modifies even one character of the payload, the signature check fails.

---

## The Flow

```
1. User logs in with credentials
         ↓
2. Auth server validates credentials
         ↓
3. Auth server signs a JWT with its PRIVATE key
         ↓
4. Token is sent to the client (stored in memory or HttpOnly cookie)
         ↓
5. Client sends token on every API request (Authorization: Bearer <token>)
         ↓
6. API server verifies the signature using the PUBLIC key
         ↓
7. If valid → trust the payload, process the request
   If invalid → 401 Unauthorized
```

---

## Why Asymmetric Over Symmetric?

With **symmetric** (`HS256`), every service that needs to verify a token must hold the shared secret. If you have 10 microservices all verifying JWTs, all 10 hold a secret that can *also create tokens*. A compromise of any one service means an attacker can mint their own tokens.

With **asymmetric** (`RS256`):

```
Auth Service     → holds private key (signs tokens)  ← only 1 service
All other APIs   → hold public key  (verify only)    ← can't create tokens
```

Distributing the public key is safe — it's designed to be public.

---

## Simple Code Example (Node.js)

```bash
# Generate a key pair
openssl genrsa -out private.pem 2048
openssl rsa -in private.pem -pubout -out public.pem
```

```js
const jwt = require('jsonwebtoken');
const fs  = require('fs');

const privateKey = fs.readFileSync('./private.pem');
const publicKey  = fs.readFileSync('./public.pem');

// Auth server — SIGN with private key
const token = jwt.sign(
  { userId: 123, role: 'admin' },
  privateKey,
  { algorithm: 'RS256', expiresIn: '1h' }
);

// API server — VERIFY with public key
try {
  const payload = jwt.verify(token, publicKey, { algorithms: ['RS256'] });
  console.log(payload); // { userId: 123, role: 'admin', iat: ..., exp: ... }
} catch (err) {
  // Invalid signature, expired token, etc.
  res.status(401).send('Unauthorized');
}
```

---

## What Makes the Signature Tamper-Proof

The math behind RSA means:
- Signing with a private key produces a signature only *that* private key could have created
- Verifying with the public key confirms the signature is authentic
- Changing even one bit of the payload produces a completely different signature — the check fails

You don't need to understand the math. The guarantee is: **if verification passes, the payload is exactly what the auth server originally signed.**

---

## Common Pitfalls

- **Using `HS256` across microservices** — all services share a secret that can mint tokens. Prefer `RS256` for distributed systems.
- **Storing the private key in the repo** — private keys belong in secrets managers (AWS Secrets Manager, Vault), not `.pem` files committed to git.
- **Not validating `exp`** — always check token expiry. Most JWT libraries do this by default, but verify your config.
- **Accepting any algorithm** — some older libraries accept `alg: none` if not explicitly configured. Always specify `{ algorithms: ['RS256'] }` in verify options.
- **Putting sensitive data in the payload** — the payload is base64-encoded, not encrypted. Anyone who has the token can read it. Never store passwords, PII, or secrets in JWT claims.

---

## References

- [JWT.io](https://jwt.io/) — decode and inspect JWTs in the browser
- [RFC 7519: JSON Web Token](https://datatracker.ietf.org/doc/html/rfc7519)
- [jsonwebtoken npm](https://www.npmjs.com/package/jsonwebtoken)
- [OWASP: JWT Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html)