# HTTP Response Status Codes: Overview

Every HTTP response includes a 3-digit status code — the server's way of telling the client what happened. The first digit indicates the class; the remaining two give specifics.

> **Analogy:** Think of status codes like the expressions on a waiter's face. 2xx is a smile — "got it, here you go." 3xx is a redirect — "actually, that's over there." 4xx is a raised eyebrow — "that's on you." 5xx is a grimace — "that's on us."

---

## The 5 Classes

| Class | Meaning | Think of it as |
|---|---|---|
| **1xx** | Informational | "Still working on it..." |
| **2xx** | Success | "Here you go." |
| **3xx** | Redirection | "Go over there." |
| **4xx** | Client Error | "You did something wrong." |
| **5xx** | Server Error | "We did something wrong." |

---

## 1xx — Informational

Rare in everyday development. The server is acknowledging the request before the final response.

| Code | Name | Meaning |
|---|---|---|
| `100` | Continue | Server received the request headers; client should proceed with the body |
| `101` | Switching Protocols | Server is switching protocols (e.g., HTTP → WebSocket upgrade) |

---

## 2xx — Success

The request was received, understood, and accepted.

| Code | Name | Meaning |
|---|---|---|
| `200` | OK | Standard success — GET, POST responses |
| `201` | Created | Resource was created — typical response to POST |
| `204` | No Content | Success, but nothing to return — common for DELETE or PATCH |
| `206` | Partial Content | Server is delivering part of a resource (video streaming, resumable downloads) |

```
GET  /users/1        → 200 OK         (returned the user)
POST /users          → 201 Created    (created a new user)
DELETE /users/1      → 204 No Content (deleted, nothing to return)
```

---

## 3xx — Redirection

The client must take an additional step to complete the request.

| Code | Name | Meaning |
|---|---|---|
| `301` | Moved Permanently | Resource has a new permanent URL — update your bookmarks/links |
| `302` | Found | Temporary redirect — come back to the original URL next time |
| `304` | Not Modified | Cached version is still valid — no need to re-download |
| `307` | Temporary Redirect | Same as 302, but method (POST/GET) must not change |
| `308` | Permanent Redirect | Same as 301, but method must not change |

> **301 vs 302:** Use `301` when you've permanently moved a resource (SEO-important — search engines transfer link equity). Use `302` for temporary redirects (maintenance, A/B tests).

> **301/302 vs 307/308:** The older 301/302 codes allowed browsers to change POST to GET on redirect (a historical quirk). 307/308 explicitly preserve the original HTTP method.

---

## 4xx — Client Errors

The request contains bad syntax, invalid data, or the client lacks permission. The problem is on the **caller's side**.

| Code | Name | Meaning |
|---|---|---|
| `400` | Bad Request | Malformed request syntax, invalid parameters |
| `401` | Unauthorized | Not authenticated — "who are you?" |
| `403` | Forbidden | Authenticated but not authorized — "I know who you are, but no." |
| `404` | Not Found | Resource doesn't exist |
| `405` | Method Not Allowed | Endpoint exists, but not for that HTTP method (e.g., POST on a GET-only route) |
| `408` | Request Timeout | Server timed out waiting for the client |
| `409` | Conflict | Request conflicts with current state (e.g., duplicate username) |
| `410` | Gone | Resource existed but was permanently deleted (stronger than 404) |
| `413` | Payload Too Large | Request body exceeds the server's limit |
| `422` | Unprocessable Entity | Syntactically valid but semantically wrong — common for failed validation |
| `429` | Too Many Requests | Rate limit exceeded |

```
POST /login  (no credentials)  → 401 Unauthorized
GET  /admin  (wrong role)       → 403 Forbidden
GET  /users/999  (doesn't exist)→ 404 Not Found
POST /users  (duplicate email)  → 409 Conflict
POST /users  (invalid email fmt)→ 422 Unprocessable Entity
```

> **401 vs 403:** `401` means "you haven't logged in." `403` means "you're logged in, but you don't have permission." This distinction matters for security — returning `403` instead of `404` on a private resource can leak that it exists.

> **404 vs 410:** Use `410` when you want to signal a resource is permanently gone (search engines will deindex it faster). Use `404` for resources that may return or simply don't exist.

---

## 5xx — Server Errors

The server failed to fulfill a valid request. The problem is on the **server's side**.

| Code | Name | Meaning |
|---|---|---|
| `500` | Internal Server Error | Generic server crash — unhandled exception, bug |
| `501` | Not Implemented | Server doesn't support the requested functionality |
| `502` | Bad Gateway | Upstream server returned an invalid response (reverse proxy issue) |
| `503` | Service Unavailable | Server is down or overloaded — try again later |
| `504` | Gateway Timeout | Upstream server didn't respond in time (reverse proxy timeout) |

```
Unhandled exception in handler  → 500 Internal Server Error
Server under maintenance        → 503 Service Unavailable
Lambda/service timed out        → 504 Gateway Timeout
Nginx can't reach app server    → 502 Bad Gateway
```

> **502 vs 504:** Both involve a proxy talking to an upstream service. `502` = the upstream responded, but with garbage. `504` = the upstream never responded at all (timed out).

---

## Most Important Codes for API Design

If you're building a REST API, these are the ones you'll use most often — and need to use correctly:

| Scenario | Correct Code |
|---|---|
| Successful GET | `200 OK` |
| Successful POST (created) | `201 Created` |
| Successful DELETE | `204 No Content` |
| Validation failed | `422 Unprocessable Entity` |
| Not logged in | `401 Unauthorized` |
| Logged in, wrong permissions | `403 Forbidden` |
| Resource not found | `404 Not Found` |
| Duplicate resource | `409 Conflict` |
| Rate limited | `429 Too Many Requests` |
| Server bug | `500 Internal Server Error` |

---

## Common Pitfalls

- **Returning `200` for everything** — some APIs return `200` with `{"success": false}` in the body. This breaks HTTP semantics and makes client-side error handling painful.
- **Confusing 401 and 403** — returning `403` when the user isn't logged in (should be `401`) breaks auth redirect logic in many clients.
- **Using `404` for authorization errors** — sometimes intentional (hiding that a resource exists), but document this decision explicitly.
- **`500` for validation errors** — validation failures are the client's fault (`400`/`422`), not a server crash. Using `500` here masks real errors in monitoring.
- **Ignoring `429`** — not implementing rate limiting at all, or implementing it but not returning `429` (with a `Retry-After` header), makes your API hard to consume reliably.

---

## References

- [MDN: HTTP Status Codes](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status)
- [RFC 9110: HTTP Semantics](https://www.rfc-editor.org/rfc/rfc9110)
- [httpstatuses.com](https://httpstatuses.com/) — quick reference