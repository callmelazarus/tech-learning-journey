# The 4 Storage Paradigms: A Developer's Guide

Every storage decision in software comes down to one question: **what shape is your data, and how do you need to access it?** The four core storage paradigms — In-Memory, Block, Object, and Relational — each answer that question differently. Knowing when to reach for which one separates good architecture from expensive mistakes.

---

## The 4 Paradigms at a Glance

| | In-Memory Cache | Block Storage | Object Storage | Relational DB |
|---|---|---|---|---|
| **Example** | Redis, Memcached | EBS, SSD volumes | S3, GCS, Azure Blob | PostgreSQL, MySQL |
| **Data shape** | Key → Value | Raw bytes (blocks) | Files + metadata | Tables + rows |
| **Access pattern** | Key lookup | Byte-range reads/writes | Whole file GET/PUT | SQL queries |
| **Speed** | Microseconds | Milliseconds | Seconds | Milliseconds |
| **Persistent?** | Optional | ✅ Yes | ✅ Yes | ✅ Yes |
| **Best for** | Hot data, sessions, rate limits | OS volumes, databases | Files, media, backups | Structured, relational data |

---

## 1. In-Memory Cache (Redis)

**What it is:** Data stored entirely in RAM — no disk involved. Access is measured in microseconds because RAM is orders of magnitude faster than any disk.

> **Analogy:** Your desk. Everything on your desk is immediately reachable — no filing cabinet, no walking to the archive room. But when you go home, the desk is cleared.

**How it works:** Data lives as key-value pairs. You ask for a key, you get the value — no parsing, no joins, no query planning. Just a direct lookup.

```
SET session:user_42 '{"name":"Alice","role":"admin"}' EX 3600
GET session:user_42  → '{"name":"Alice","role":"admin"}'
```

**Characteristics:**
- Blazing fast — microsecond reads
- Volatile by default — data is lost on restart (Redis offers optional persistence)
- Size-limited — RAM is expensive; you can't store terabytes here
- Supports rich data structures: strings, lists, sets, sorted sets, hashes, pub/sub

**When to use:**
- Session storage
- Rate limiting counters
- Caching expensive DB query results
- Leaderboards and real-time features
- Pub/sub message queuing

**When NOT to use:**
- Primary data store for anything you can't afford to lose
- Large files or binary data
- Complex queries across multiple keys

---

## 2. Block Storage (EBS / SSD Volumes)

**What it is:** Raw storage exposed to an operating system as a disk volume — the OS then formats it with a filesystem (ext4, NTFS, etc.) and treats it like any other hard drive.

> **Analogy:** A raw plot of land. It has no structure until you build on it — pave roads, dig foundations, lay pipes. The OS is the developer that builds the neighborhood on top.

**How it works:** Data is split into fixed-size **blocks** (typically 512B–4KB each). The OS and filesystem manage which blocks belong to which files — the storage layer itself doesn't know about files or folders, just blocks.

```
App → OS → Filesystem → Block Device → Physical/Virtual Disk
           (manages blocks)
```

**Characteristics:**
- Low-level — the foundation every database and OS runs on top of
- Fast random read/write access (SSDs in microseconds to milliseconds)
- Must be attached to a single compute instance (not natively shareable)
- Billed by provisioned size, not used size
- Durable and persistent

**When to use:**
- The disk your database (PostgreSQL, MySQL) runs on
- OS boot volumes
- Any application that needs a traditional filesystem
- High-IOPS workloads (databases, video rendering)

**When NOT to use:**
- Storing many discrete files for direct web access (use Object Storage)
- Sharing files across multiple servers simultaneously (use a network filesystem or Object Storage)
- Large-scale archival (expensive per GB vs. object storage)

---

## 3. Object Storage (S3)

**What it is:** A flat namespace of **objects** — each object is a file bundled with metadata, identified by a unique key. No hierarchy, no filesystem — just a massive bucket of named blobs, accessible over HTTP.

> **Analogy:** A post office with infinite storage. You label a package (key + metadata), drop it off, and it disappears into the warehouse. When you want it back, you give them the label — they find it, no matter how many billions of packages are in there. You never see the warehouse floor plan.

**How it works:** You interact via a REST API — `PUT` to store, `GET` to retrieve. There are no folders (just key prefixes that *look* like paths). Internally the storage system handles redundancy, distribution, and retrieval — you never see the underlying disks.

```
PUT /my-bucket/user-uploads/profile/alice.jpg  → 200 OK
GET /my-bucket/user-uploads/profile/alice.jpg  → binary data
```

**Characteristics:**
- Effectively unlimited scale — store petabytes without managing infrastructure
- Cheap per GB (especially for infrequently accessed data)
- Eventually consistent (though AWS S3 is now strongly consistent)
- HTTP-native — objects are directly linkable/streamable
- Built-in redundancy and durability (S3 targets 99.999999999% durability)
- No random writes — you replace the whole object, not bytes within it

**When to use:**
- User-uploaded files (images, videos, documents)
- Static website assets (JS bundles, CSS, images)
- Data lake storage (raw logs, ML training data)
- Database and system backups
- Large file distribution (downloads, artifacts)

**When NOT to use:**
- Data you need to update frequently at the byte level (use Block Storage)
- Real-time access patterns requiring millisecond latency
- Data with complex relationships that need querying (use a database)

---

## 4. Relational Database (PostgreSQL)

**What it is:** Data organized into structured **tables** with defined schemas, rows, and typed columns — connected through relationships (foreign keys). Queried with SQL.

> **Analogy:** A highly organized spreadsheet factory. Every spreadsheet has defined column types, rows link to rows in other spreadsheets, and you can ask arbitrarily complex questions across all of them at once. The factory also guarantees that if the power goes out mid-transaction, nothing is half-written.

**How it works:** Data lives in tables. The database engine maintains indexes, manages transactions (ACID guarantees), enforces constraints, and executes query plans that can join, filter, aggregate, and transform data on the fly.

```sql
-- Ask a complex relational question across multiple tables
SELECT u.name, COUNT(o.id) AS order_count, SUM(o.total) AS revenue
FROM users u
JOIN orders o ON o.user_id = u.id
WHERE o.created_at > NOW() - INTERVAL '30 days'
GROUP BY u.id
ORDER BY revenue DESC;
```

**Characteristics:**
- ACID transactions — writes are atomic, consistent, isolated, durable
- Flexible querying — SQL can answer almost any question about your data
- Schema enforcement — data types, constraints, and relationships are guaranteed
- Slower than cache, but far more capable
- Scales vertically well; horizontal scaling requires extra architecture (read replicas, sharding)

**When to use:**
- Core application data (users, orders, products, transactions)
- Any data with relationships between entities
- When you need complex queries, reporting, or aggregations
- When data integrity and consistency are non-negotiable

**When NOT to use:**
- Unstructured or highly variable-schema data (use a document store)
- Caching or ephemeral session data (use In-Memory)
- Large binary files (use Object Storage)
- Extremely high write throughput at the expense of consistency (use time-series DB or NoSQL)

---

## How They Work Together

These aren't competing choices — production systems use all four. A typical web app architecture:

```
User Request
     ↓
[Redis Cache] ← check here first (microseconds)
     ↓ (cache miss)
[PostgreSQL] ← query the source of truth (milliseconds)
     ↓
[S3] ← serve the user's uploaded avatar or file (HTTP)
     ↓
[Block Storage] ← PostgreSQL's data sits on an EBS volume (invisible to the app)
```

**A concrete example — a social media post:**
- The post text, author, timestamp → **PostgreSQL** (structured, relational)
- The attached image → **S3** (binary file, served via URL)
- The post's like count (hot, read constantly) → **Redis** (cached, fast)
- PostgreSQL's data files → **Block Storage** (EBS volume, managed by the OS)

---

## Decision Framework

Ask these questions in order:

1. **How fast does it need to be?**
   → Microseconds → In-Memory Cache

2. **Is it a file (image, video, document, backup)?**
   → Object Storage

3. **Does it have relationships and need querying?**
   → Relational Database

4. **Is it the disk a system runs on?**
   → Block Storage

---

## Common Pitfalls

- **Using a DB as a file store** — storing binary blobs in PostgreSQL instead of S3 bloats the DB, slows backups, and doesn't scale.
- **Over-caching** — caching data that changes frequently leads to stale reads. Cache data that is read often and changes rarely.
- **Block storage for shared access** — a single EBS volume can't be mounted by two servers simultaneously. For shared file access across instances, use object storage or a network filesystem (EFS, NFS).
- **Treating object storage like a filesystem** — there are no real directories in S3. Prefix-based "paths" work for organization but you can't do filesystem operations (rename, move) efficiently at scale.
- **No cache invalidation strategy** — adding Redis without a plan for when to invalidate keys is how you ship bugs that only appear in production.

---

## References

- [AWS: Choosing the right storage](https://aws.amazon.com/products/storage/)
- [Redis Documentation](https://redis.io/docs/)
- [AWS S3 Documentation](https://docs.aws.amazon.com/s3/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Google Zanzibar / distributed systems primer](https://research.google/pubs/zanzibar-googles-consistent-global-authorization-system/)