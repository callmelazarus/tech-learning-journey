# HTTP Request Headers: Complete Overview

HTTP request headers are key-value pairs sent from client to server containing metadata about the request—who's making it, what they accept, authentication credentials, and more. Headers don't contain the actual data being sent (that's in the body), but rather instructions and context. Think of headers like an envelope's addressing and postage—they tell the postal service how to handle the letter, while the body is the actual letter inside.

## Key Points

- **Format:** `Header-Name: value`
- **Purpose:** Metadata about request (auth, content type, caching, etc.)
- **Standard Headers:** Defined by HTTP spec (Authorization, Content-Type)
- **Custom Headers:** Prefixed with `X-` (deprecated) or custom namespace
- **Case-Insensitive:** `Content-Type` same as `content-type`

## Common Request Headers

### Content Headers

```http
# Content-Type: Format of request body
POST /api/users HTTP/1.1
Content-Type: application/json

{"name": "John", "email": "john@example.com"}

# Common values:
Content-Type: application/json           # JSON data
Content-Type: application/x-www-form-urlencoded  # Form data
Content-Type: multipart/form-data        # File uploads
Content-Type: text/html                  # HTML
Content-Type: text/plain                 # Plain text
```

```http
# Content-Length: Size of body in bytes
POST /api/users HTTP/1.1
Content-Type: application/json
Content-Length: 45

{"name": "John", "email": "john@example.com"}
```

### Accept Headers

```http
# Accept: What response formats client accepts
GET /api/users HTTP/1.1
Accept: application/json

# Multiple formats (preference order)
Accept: application/json, text/html, */*

# With quality values (q)
Accept: application/json;q=1.0, text/html;q=0.8, */*;q=0.1
# Prefers JSON, then HTML, then anything
```

```http
# Accept-Encoding: Compression formats accepted
GET /api/data HTTP/1.1
Accept-Encoding: gzip, deflate, br

# Accept-Language: Preferred languages
GET /api/content HTTP/1.1
Accept-Language: en-US, en;q=0.9, es;q=0.8
```

### Authentication

```http
# Authorization: Credentials for authentication
GET /api/profile HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Common schemes:
Authorization: Basic dXNlcjpwYXNzd29yZA==    # Base64(username:password)
Authorization: Bearer <token>                # JWT token
Authorization: Digest username="user"...     # Digest auth
```

```http
# API-Key: Custom authentication (varies by service)
GET /api/data HTTP/1.1
API-Key: sk_live_123456789

# X-API-Key: Alternative naming
X-API-Key: your-api-key-here
```

### Caching

```http
# Cache-Control: Caching directives
GET /api/users HTTP/1.1
Cache-Control: no-cache          # Revalidate before using cache
Cache-Control: no-store          # Don't cache at all
Cache-Control: max-age=3600      # Cache for 1 hour

# If-None-Match: Conditional request with ETag
GET /api/users HTTP/1.1
If-None-Match: "33a64df551425fcc55e4d42a148795d9f25f89d4"
# Server returns 304 Not Modified if ETag matches

# If-Modified-Since: Conditional request with date
GET /api/users HTTP/1.1
If-Modified-Since: Wed, 21 Oct 2023 07:28:00 GMT
# Server returns 304 if not modified since date
```

### Origin/Referer

```http
# Origin: Source of request (CORS)
POST /api/users HTTP/1.1
Origin: https://example.com

# Referer: Previous page URL
GET /page2 HTTP/1.1
Referer: https://example.com/page1

# Note: "Referer" is misspelled in spec (should be "Referrer")
```

### User Agent

```http
# User-Agent: Client identifier (browser, OS, device)
GET /api/data HTTP/1.1
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36

# Mobile example:
User-Agent: Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)

# Custom client:
User-Agent: MyApp/1.0 (https://myapp.com)
```

### Connection

```http
# Connection: Control connection behavior
GET /api/data HTTP/1.1
Connection: keep-alive    # Reuse connection (default in HTTP/1.1)
Connection: close         # Close after response

# Host: Required in HTTP/1.1 (target server)
GET /api/users HTTP/1.1
Host: api.example.com
```

## Custom Headers

```http
# Custom application headers (no standard prefix needed)
GET /api/data HTTP/1.1
X-Request-ID: abc-123-def-456      # Request tracking
X-Correlation-ID: xyz-789          # Distributed tracing
X-Client-Version: 2.1.0            # Client version
X-Feature-Flag: new-ui-enabled     # Feature toggles

# Modern convention: Skip X- prefix
Request-ID: abc-123-def-456
Client-Version: 2.1.0
```

## Setting Headers in Code

### JavaScript (Fetch)

```javascript
// Basic headers
fetch('https://api.example.com/users', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer token123'
  },
  body: JSON.stringify({ name: 'John' })
});

// Multiple headers
const headers = new Headers();
headers.append('Content-Type', 'application/json');
headers.append('X-Custom-Header', 'value');

fetch('https://api.example.com/data', { headers });
```

### Axios

```javascript
// Global defaults
axios.defaults.headers.common['Authorization'] = 'Bearer token123';
axios.defaults.headers.post['Content-Type'] = 'application/json';

// Per-request
axios.post('/api/users', data, {
  headers: {
    'Content-Type': 'application/json',
    'X-Request-ID': generateId()
  }
});

// Interceptor (all requests)
axios.interceptors.request.use(config => {
  config.headers['Authorization'] = `Bearer ${getToken()}`;
  return config;
});
```

### cURL

```bash
# Single header
curl -H "Authorization: Bearer token123" https://api.example.com/users

# Multiple headers
curl -H "Content-Type: application/json" \
     -H "Authorization: Bearer token123" \
     -d '{"name":"John"}' \
     https://api.example.com/users

# From file
curl -H @headers.txt https://api.example.com/data
```

### Node.js (http module)

```javascript
const http = require('http');

const options = {
  hostname: 'api.example.com',
  path: '/users',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer token123',
    'Content-Length': Buffer.byteLength(data)
  }
};

const req = http.request(options, (res) => {
  // Handle response
});
```

### Express (Server-side)

```javascript
// Reading request headers
app.get('/api/data', (req, res) => {
  const authHeader = req.headers.authorization;
  const userAgent = req.headers['user-agent'];
  const customHeader = req.get('X-Custom-Header');
  
  console.log(req.headers); // All headers
});

// Setting response headers
app.get('/api/data', (req, res) => {
  res.set('X-Response-Time', '123ms');
  res.set({
    'Cache-Control': 'no-cache',
    'X-Custom': 'value'
  });
  res.send(data);
});
```

## CORS Headers

```http
# Request (from browser)
OPTIONS /api/users HTTP/1.1
Origin: https://frontend.com
Access-Control-Request-Method: POST
Access-Control-Request-Headers: Content-Type, Authorization

# Response (from server)
HTTP/1.1 200 OK
Access-Control-Allow-Origin: https://frontend.com
Access-Control-Allow-Methods: GET, POST, PUT, DELETE
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Max-Age: 86400
```

```javascript
// Express CORS middleware
app.use((req, res, next) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

// Or use cors package
const cors = require('cors');
app.use(cors({
  origin: 'https://frontend.com',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

## Security Headers

```http
# Request headers for security

# Cookie: Send cookies with request
GET /api/profile HTTP/1.1
Cookie: sessionId=abc123; userId=456

# X-CSRF-Token: CSRF protection
POST /api/users HTTP/1.1
X-CSRF-Token: csrf-token-here
Content-Type: application/json
```

## Common Patterns

### JWT Authentication

```javascript
// Store token
localStorage.setItem('token', jwtToken);

// Send with every request
fetch('/api/data', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
});

// Axios interceptor
axios.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### Request Tracking

```javascript
// Generate unique ID per request
function generateRequestId() {
  return `${Date.now()}-${Math.random().toString(36)}`;
}

fetch('/api/data', {
  headers: {
    'X-Request-ID': generateRequestId(),
    'X-Client-Version': '1.2.3'
  }
});

// Server logs request ID for debugging
app.use((req, res, next) => {
  const requestId = req.headers['x-request-id'];
  console.log(`[${requestId}] ${req.method} ${req.path}`);
  next();
});
```

### Content Negotiation

```javascript
// Request JSON or XML based on user preference
const format = user.preferredFormat;

fetch('/api/data', {
  headers: {
    'Accept': format === 'xml' 
      ? 'application/xml' 
      : 'application/json'
  }
});

// Server responds with requested format
app.get('/api/data', (req, res) => {
  if (req.accepts('json')) {
    res.json(data);
  } else if (req.accepts('xml')) {
    res.type('xml').send(toXML(data));
  }
});
```

## Debugging Headers

```javascript
// Browser DevTools
// Network tab → Select request → Headers tab

// Log all request headers (fetch)
fetch('/api/data', {
  headers: myHeaders
}).then(res => {
  console.log('Request headers:', myHeaders);
  console.log('Response headers:', res.headers);
});

// Proxy tool (Charles, Fiddler)
// Intercept and inspect all headers

// cURL with verbose output
curl -v https://api.example.com/data
# Shows all headers sent and received
```

## Best Practices

```javascript
// ✅ Use standard headers when available
headers: {
  'Content-Type': 'application/json',      // Standard
  'Authorization': 'Bearer token'          // Standard
}

// ✅ Set appropriate Content-Type
fetch('/api/users', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data)
});

// ✅ Include authentication
headers: {
  'Authorization': `Bearer ${token}`
}

// ✅ Add request tracking
headers: {
  'X-Request-ID': generateId(),
  'X-Client-Version': version
}

// ❌ Don't send sensitive data in headers (except Authorization)
headers: {
  'X-Password': password  // ❌ Never do this
}

// ❌ Don't ignore CORS headers
// Configure server properly

// ❌ Don't hardcode tokens
headers: {
  'Authorization': 'Bearer abc123'  // ❌ Use env vars
}
```

## References

- [MDN: HTTP Headers](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers)
- [HTTP Header Registry](https://www.iana.org/assignments/http-fields/http-fields.xhtml)
- [CORS Specification](https://fetch.spec.whatwg.org/#http-cors-protocol)

---

## Summary

**HTTP Headers:** Key-value metadata sent with requests.

**Common Headers:**
- `Content-Type`: Format of body (`application/json`)
- `Authorization`: Auth credentials (`Bearer token`)
- `Accept`: Accepted response formats
- `User-Agent`: Client identifier

**Setting Headers:**
```javascript
fetch(url, {
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }
});
```

**Custom Headers:**
```javascript
'X-Request-ID': generateId()
'X-Custom-Header': 'value'
```

**Rule of thumb:** Use standard headers when available. Always set `Content-Type` for POST/PUT. Include `Authorization` for protected endpoints. Add custom headers for tracking/debugging. Don't send sensitive data except in `Authorization`.