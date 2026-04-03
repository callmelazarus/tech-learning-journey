# GUIDs / UUIDs: Complete Overview

A GUID (Globally Unique Identifier) or UUID (Universally Unique Identifier) is a **128-bit value used to uniquely identify something without a central authority**. Think of it as a fingerprint for data — the odds of generating two identical UUIDs are so astronomically low that you can treat them as unique without ever checking. They're the same thing — "GUID" is Microsoft's term, "UUID" is the standard term. You'll see them everywhere: database primary keys, API request IDs, session tokens, distributed system identifiers.

## Key Points

- **128 bits, 32 hex characters.** Displayed as 5 groups separated by hyphens: `550e8400-e29b-41d4-a716-446655440000`.
- **Practically unique without coordination.** Two servers on different continents can generate UUIDs simultaneously and never collide. No database lookup, no central service.
- **Multiple versions.** UUIDv1 (timestamp), v4 (random), v7 (timestamp + random) — each with different trade-offs.
- **Not sequential.** Most UUID versions are random or partially random, meaning they don't sort chronologically. UUIDv7 fixes this.
- **Not secret.** UUIDs are identifiers, not passwords. UUIDv1 leaks your MAC address and timestamp. Even v4 shouldn't be used as a security token.

## The Format

```
550e8400-e29b-41d4-a716-446655440000
│        │    ││   ││
│        │    ││   │└─ 48 bits: node (varies by version)
│        │    ││   └── 2 bits: variant (always 10 in standard UUIDs)
│        │    │└────── 4 bits: version (1, 4, 7, etc.)
│        │    └─────── 16 bits: clock sequence / random
│        └──────────── 16 bits: time or random
└───────────────────── 32 bits: time or random

Total: 128 bits = 32 hex characters + 4 hyphens = 36 characters displayed
```

**The version digit** is always the first character of the third group. You can identify the version at a glance:

```
550e8400-e29b-41d4-a716-446655440000
                   ^ version 4 (random)

018e4f6a-1c3b-7d2e-8f00-a1b2c3d4e5f6
                   ^ version 7 (timestamp + random)

550e8400-e29b-11d4-a716-446655440000
                   ^ version 1 (timestamp + MAC)
```

## UUID Versions

| Version | Based On | Sortable | Use Case | Collisions |
|---|---|---|---|---|
| **v1** | Timestamp + MAC address | Yes (by time) | Legacy systems, Windows COM | Extremely rare, leaks hardware identity |
| **v4** | Pure random | No | General purpose, most common today | ~2.7 quintillion before 50% collision probability |
| **v6** | v1 rearranged for sortability | Yes | Drop-in replacement for v1, newer standard | Same as v1 |
| **v7** | Unix timestamp (ms) + random | Yes | Database primary keys, modern best choice | Extremely rare |
| **v5 / v3** | Namespace + name hash (SHA-1 / MD5) | No | Deterministic IDs — same input always produces same UUID | Deterministic (not random) |

### v4 — Random (Most Common Today)

122 of 128 bits are random. Simple, no coordination needed, no information leaked.

```js
// JavaScript
crypto.randomUUID();
// "f47ac10b-58cc-4372-a567-0e02b2c3d479"

// Node.js
const { v4: uuidv4 } = require("uuid");
uuidv4();
```

```python
# Python
import uuid
str(uuid.uuid4())
# "f47ac10b-58cc-4372-a567-0e02b2c3d479"
```

```sql
-- PostgreSQL
SELECT gen_random_uuid();
-- f47ac10b-58cc-4372-a567-0e02b2c3d479
```

**Collision probability:** You'd need to generate 2.71 × 10¹⁸ (2.71 quintillion) UUIDv4s to have a 50% chance of a single collision. For practical purposes, collisions don't happen.

**Analogy:** Imagine picking a random grain of sand from every beach on Earth. UUIDv4 has more possible values than there are grains of sand — the chance of two people picking the same grain is effectively zero.

### v7 — Timestamp + Random (Modern Best Choice)

The first 48 bits are a Unix timestamp in milliseconds, the rest are random. This gives you chronological sorting while retaining randomness.

```
UUIDv7 structure:
018e4f6a-1c3b-7xxx-xxxx-xxxxxxxxxxxx
│              │
│              └─ random bits
└─ millisecond timestamp (sortable!)

Generated in sequence:
018e4f6a-1c3b-7a2e-8f00-a1b2c3d4e5f6  ← 10:30:00.001
018e4f6a-1c3c-7b3f-9a11-b2c3d4e5f6a7  ← 10:30:00.002
018e4f6a-1c3d-7c40-ab22-c3d4e5f6a7b8  ← 10:30:00.003
                                        ↑ naturally sorts by creation time
```

```js
// Node.js (v19+, or use uuid package v9+)
const { v7: uuidv7 } = require("uuid");
uuidv7();
// "018e4f6a-1c3b-7a2e-8f00-a1b2c3d4e5f6"
```

```sql
-- PostgreSQL (v17+ has native support, or use extension)
-- In the meantime, use gen_random_uuid() (v4) or a custom function
```

### v5 / v3 — Deterministic (Name-Based)

Given the same namespace + name, you always get the same UUID. No randomness — it's a hash.

```js
const { v5: uuidv5 } = require("uuid");

// Same input → always the same UUID
uuidv5("alice@example.com", uuidv5.URL);
// always returns "2ed6657d-e927-568b-95e1-2665a8aea6a2"

uuidv5("alice@example.com", uuidv5.URL);
// "2ed6657d-e927-568b-95e1-2665a8aea6a2" ← identical
```

**Use when:** You need a consistent ID derived from a known input — like generating a stable user ID from an email, or a consistent resource ID from a URL.

## UUIDs as Database Primary Keys

This is the most common use case — and the one with the most trade-offs.

### UUID vs Auto-Increment Integer

| Factor | UUID (v4) | Auto-Increment Integer | UUID (v7) |
|---|---|---|---|
| **Uniqueness** | Globally unique across all systems | Unique only within one table | Globally unique |
| **Generation** | Client-side, no DB round trip needed | Requires DB insert to get the ID | Client-side |
| **Sortable** | No | Yes (by creation order) | Yes (by creation time) |
| **Index performance** | Poor — random inserts fragment B-tree indexes | Excellent — sequential inserts append to index | Good — mostly sequential |
| **Size** | 16 bytes | 4 bytes (int) or 8 bytes (bigint) | 16 bytes |
| **Predictability** | Unpredictable (good for security) | Sequential (easy to enumerate) | Partially predictable (timestamp) |
| **Merge/replication** | No conflicts across databases | ID collisions when merging | No conflicts |
| **URL readability** | `/users/550e8400-e29b-41d4-a716-446655440000` | `/users/42` | Same as v4 |

```sql
-- UUID primary key (PostgreSQL)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Integer primary key
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- UUIDv7 gets you the best of both worlds:
-- Global uniqueness + B-tree friendly ordering
-- (requires application-side generation until native DB support)
```

### The B-Tree Index Problem (v4)

UUIDv4 is random, which causes random insertions across the entire B-tree index. This leads to page splits, cache misses, and fragmentation — significantly degrading write performance on large tables.

```
Auto-increment: Always appends to the end of the index
[1] [2] [3] [4] [5] [6] [7] [8] →  [9] (append)

UUIDv4: Inserts randomly across the index
[a1b2] [c3d4] [e5f6] ... [x9y0] [z1a2]
                    ↑
              [d7e8] (random insert — page split!)

UUIDv7: Mostly appends (timestamp prefix), slight randomness within same millisecond
[018e4f6a-1c3b] [018e4f6a-1c3c] [018e4f6a-1c3d] →  [018e4f6a-1c3e] (mostly append)
```

**Rule of thumb:** If your table will have millions of rows with heavy write traffic, use UUIDv7 over v4. For smaller tables or read-heavy workloads, v4 is perfectly fine.

## UUIDs in Application Code

### Generating

```js
// JavaScript (browser + Node 19+)
crypto.randomUUID();

// Node.js (uuid package — most popular)
const { v4, v7 } = require("uuid");
v4();  // random
v7();  // timestamp + random

// Validate
const { validate } = require("uuid");
validate("550e8400-e29b-41d4-a716-446655440000");  // true
validate("not-a-uuid");                              // false
```

```python
# Python
import uuid
uuid.uuid4()      # random
uuid.uuid5(uuid.NAMESPACE_URL, "https://example.com")  # deterministic
```

```bash
# Command line (Linux)
uuidgen
# macOS
uuidgen | tr '[:upper:]' '[:lower:]'   # lowercase convention
```

### Storing

```sql
-- PostgreSQL: native UUID type (16 bytes, indexed efficiently)
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  total DECIMAL NOT NULL
);

-- MySQL: BINARY(16) is more efficient than CHAR(36)
CREATE TABLE orders (
  id BINARY(16) PRIMARY KEY,
  total DECIMAL NOT NULL
);
-- Use UUID_TO_BIN() and BIN_TO_UUID() for conversion

-- SQLite: TEXT (no native UUID type)
CREATE TABLE orders (
  id TEXT PRIMARY KEY,
  total REAL NOT NULL
);
```

**Storage size comparison:**

```
Type          Size      Example
──────────────────────────────────────────
UUID (native)  16 bytes  stored as binary internally
CHAR(36)       36 bytes  "550e8400-e29b-41d4-a716-446655440000"
BINARY(16)     16 bytes  raw bytes (most compact)
INTEGER        4 bytes   42
BIGINT         8 bytes   9223372036854775807
```

### In URLs and APIs

```
# UUID in REST API paths
GET /api/users/550e8400-e29b-41d4-a716-446655440000

# UUID as API request ID (for tracing and idempotency)
X-Request-Id: 550e8400-e29b-41d4-a716-446655440000

# UUID as idempotency key
Idempotency-Key: 550e8400-e29b-41d4-a716-446655440000
```

## UUID Alternatives

UUIDs aren't the only option for unique identifiers. Several alternatives optimize for specific needs:

| Alternative | Length | Sortable | Format | Best For |
|---|---|---|---|---|
| **ULID** | 26 chars | Yes | `01ARZ3NDEKTSV4RRFFQ69G5FAV` | Sortable IDs, Crockford base32, case-insensitive |
| **nanoid** | 21 chars (default) | No | `V1StGXR8_Z5jdHi6B-myT` | Short, URL-safe, customizable alphabet |
| **KSUID** | 27 chars | Yes | `0ujtsYcgvSTl8PAuAdqWYSMnLOv` | Sortable by time, base62 |
| **Snowflake ID** | 18-19 digits | Yes | `1234567890123456789` | High-throughput distributed systems (Twitter, Discord) |
| **CUID2** | 24 chars | No | `clh3am5r70000...` | Secure, collision-resistant, horizontal scaling |
| **Auto-increment** | variable | Yes | `42` | Simple apps, single database, no merge needs |

```js
// nanoid — shorter, URL-safe alternative
import { nanoid } from "nanoid";
nanoid();      // "V1StGXR8_Z5jdHi6B-myT" (21 chars)
nanoid(10);    // "IRFa-VaY2b" (custom length)

// ULID — sortable, case-insensitive
import { ulid } from "ulid";
ulid();        // "01ARZ3NDEKTSV4RRFFQ69G5FAV"

// crypto.randomUUID() — built-in, no dependency
crypto.randomUUID();  // "550e8400-e29b-41d4-a716-446655440000"
```

**Decision guide:**

```
Need global uniqueness + no coordination?         → UUID v4/v7
Need sortable + global uniqueness?                 → UUID v7 or ULID
Need short, URL-friendly IDs?                      → nanoid
Need high-throughput sequential IDs (1M+/sec)?     → Snowflake
Need simple, readable IDs for a single database?   → Auto-increment
Need deterministic IDs from known input?            → UUID v5
```

## Common Pitfalls

- **Using UUIDv4 as a primary key on write-heavy tables.** Random UUIDs fragment B-tree indexes and degrade insert performance at scale. Use UUIDv7 or ULID for sortable, index-friendly IDs.
- **Storing UUIDs as `CHAR(36)`.** This wastes 20 bytes per row compared to a native `UUID` type or `BINARY(16)`. On a table with millions of rows and multiple UUID columns, this adds up significantly.
- **Using UUIDs as security tokens.** UUIDs are identifiers, not secrets. UUIDv1 contains your MAC address and timestamp. Even UUIDv4 has only 122 bits of entropy. For API keys, session tokens, or password reset links, use `crypto.randomBytes(32)` or a purpose-built token.
- **Treating UUIDs as always-lowercase.** The spec says UUIDs are case-insensitive (`A1B2` = `a1b2`). Some systems store uppercase, others lowercase. Normalize to lowercase on input to avoid comparison bugs.
- **Exposing sequential IDs in URLs.** Auto-increment IDs like `/users/42` let anyone enumerate all your users by incrementing the number. UUIDs prevent this enumeration — `/users/550e8400-...` reveals nothing about how many users exist or what nearby IDs are.
- **Not validating UUID format.** Accept a UUID from user input → validate it before passing to a database query. An invalid UUID in a SQL query can throw errors or — worse — enable injection if improperly handled.

## Practical Applications

- **Database primary keys:** Generate IDs client-side before insert, no round trip to the DB. Essential for offline-first apps.
- **Distributed systems:** Multiple services generate IDs independently with no coordination and no collision risk.
- **Idempotency keys:** Attach a UUID to each API request so the server can deduplicate retries.
- **Correlation / tracing:** Assign a UUID to each request at the edge, propagate through microservices for end-to-end tracing.
- **File naming:** Upload files as `{uuid}.jpg` to avoid name collisions without a central registry.
- **Session management:** UUIDv4 as session identifiers (paired with proper signing/encryption).

## References

- [RFC 9562 — UUIDs (2024, replaces RFC 4122)](https://www.rfc-editor.org/rfc/rfc9562)
- [npm: uuid package](https://www.npmjs.com/package/uuid)
- [PostgreSQL: UUID Type](https://www.postgresql.org/docs/current/datatype-uuid.html)
- [Wikipedia: UUID](https://en.wikipedia.org/wiki/Universally_unique_identifier)
- [Buildkite: UUIDv7 in Practice](https://buildkite.com/blog/goodbye-integers-hello-uuids)

---

## Greater Detail

### Advanced Concepts

- **UUID Collisions in Practice:** At 1 billion UUIDv4s per second, it would take approximately 100 years to reach a 50% collision probability. In practice, you're more likely to have a hardware failure corrupt a UUID than to generate a duplicate. Don't add collision-handling code — it's wasted effort.
- **UUIDv7 Monotonicity:** Within the same millisecond, UUIDv7 implementations use a random or incrementing counter for the sub-millisecond bits. This ensures that IDs generated in rapid succession on the same machine are still sortable, even if the timestamp is identical.
- **Encoding Optimization:** If 36 characters is too long for URLs, you can base64-encode the 16 raw bytes into 22 characters: `VQ6EAOKbQdSnFkRmVUQAAA`. Or use base62 for alphanumeric-only strings. Libraries like `short-uuid` handle this conversion.
- **Partitioning by UUID:** Some databases partition tables by UUID prefix. UUIDv4's randomness distributes evenly across partitions (good for balance, bad for range scans). UUIDv7's timestamp prefix means partitioning by time range is possible, similar to timestamp-based partitioning.
- **UUID in GraphQL / TypeScript:** Define a custom scalar type for UUIDs so your schema validates format at the boundary. Libraries like `graphql-scalars` provide a `UUID` scalar that rejects malformed values before your resolver runs.