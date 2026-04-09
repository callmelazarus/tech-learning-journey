# SQL `ON CONFLICT DO NOTHING`: Complete Overview

`ON CONFLICT DO NOTHING` is a clause that tells the database to **silently skip rows that would violate a unique constraint instead of throwing an error**. Think of it as a bouncer at a club — if someone's already on the guest list (a duplicate), the bouncer just turns them away quietly instead of causing a scene. It's one of the most practical tools for writing idempotent inserts — operations you can safely run multiple times without side effects.

## Key Points

- **Prevents duplicate errors.** Inserts that would violate a unique or primary key constraint are silently skipped instead of failing.
- **Part of `UPSERT` syntax.** `ON CONFLICT` is the mechanism behind "insert or update" patterns. `DO NOTHING` is the simplest form — insert or ignore.
- **PostgreSQL syntax.** `ON CONFLICT` is PostgreSQL-specific. MySQL uses `INSERT IGNORE` or `ON DUPLICATE KEY UPDATE`. SQLite supports `ON CONFLICT` with similar syntax.
- **Idempotent inserts.** Run the same insert 10 times — you get one row, no errors. Essential for retry logic, event processing, and data pipelines.
- **No partial failures.** In a multi-row insert, conflicting rows are skipped and non-conflicting rows are inserted. The statement doesn't fail.

## The Problem It Solves

Without `ON CONFLICT`, inserting a duplicate row throws an error and the entire statement fails:

```sql
-- Table with a unique constraint
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL
);

-- First insert — works fine
INSERT INTO users (email, name) VALUES ('alice@example.com', 'Alice');
-- ✓ 1 row inserted

-- Second insert — same email — ERROR
INSERT INTO users (email, name) VALUES ('alice@example.com', 'Alice');
-- ✗ ERROR: duplicate key value violates unique constraint "users_email_key"
-- The entire statement fails. In a multi-row insert, ALL rows are rejected.
```

This is a problem when you're processing events that might fire more than once, syncing data from an external source, or running an insert in a retry loop.

## The Solution

```sql
-- Insert, but skip if email already exists
INSERT INTO users (email, name)
VALUES ('alice@example.com', 'Alice')
ON CONFLICT DO NOTHING;
-- ✓ 0 rows inserted (no error, just silently skipped)

-- First time: inserts the row
-- Second time: skips silently
-- Third time: skips silently
-- Always safe. Always idempotent.
```

## Step-by-Step Explanation & Examples

### 1. Basic `DO NOTHING`

```sql
-- Skip any row that conflicts on ANY unique constraint
INSERT INTO users (email, name)
VALUES ('alice@example.com', 'Alice')
ON CONFLICT DO NOTHING;
```

When you don't specify which constraint, `DO NOTHING` catches conflicts on *any* unique or primary key constraint on the table. The row is silently skipped.

### 2. Specifying the Conflict Target

You can specify exactly *which* constraint to handle. This is more explicit and recommended for clarity.

```sql
-- Skip only if the email conflicts (specific column)
INSERT INTO users (email, name)
VALUES ('alice@example.com', 'Alice')
ON CONFLICT (email) DO NOTHING;

-- Skip only if the primary key conflicts
INSERT INTO users (id, email, name)
VALUES (1, 'alice@example.com', 'Alice')
ON CONFLICT (id) DO NOTHING;

-- Skip on a named constraint
INSERT INTO users (email, name)
VALUES ('alice@example.com', 'Alice')
ON CONFLICT ON CONSTRAINT users_email_key DO NOTHING;
```

**Why specify?** A table might have multiple unique constraints. Being explicit about which one you're targeting makes your intent clear and catches bugs when schema changes add new constraints.

### 3. Multi-Row Inserts

This is where `DO NOTHING` really shines. Conflicting rows are skipped individually — non-conflicting rows still get inserted.

```sql
-- Insert 5 users — 2 already exist
INSERT INTO users (email, name)
VALUES
  ('alice@example.com', 'Alice'),     -- already exists → skipped
  ('bob@example.com', 'Bob'),         -- new → inserted
  ('carol@example.com', 'Carol'),     -- already exists → skipped
  ('dave@example.com', 'Dave'),       -- new → inserted
  ('eve@example.com', 'Eve')          -- new → inserted
ON CONFLICT (email) DO NOTHING;
-- ✓ 3 rows inserted (2 skipped, no error)
```

Without `ON CONFLICT`, this entire statement would fail because of Alice and Carol, and Bob, Dave, and Eve would *also* not be inserted. With `DO NOTHING`, the non-conflicting rows succeed independently.

### 4. `DO NOTHING` vs `DO UPDATE` (Upsert)

`DO NOTHING` skips conflicts. `DO UPDATE` overwrites them. These solve different problems.

```sql
-- DO NOTHING: Insert if new, skip if exists
-- Use when: you want to keep the EXISTING data
INSERT INTO users (email, name)
VALUES ('alice@example.com', 'Alice Smith')
ON CONFLICT (email) DO NOTHING;
-- Alice's name stays whatever it was before (not updated to 'Alice Smith')

-- DO UPDATE: Insert if new, update if exists (full upsert)
-- Use when: you want the INCOMING data to win
INSERT INTO users (email, name)
VALUES ('alice@example.com', 'Alice Smith')
ON CONFLICT (email) DO UPDATE SET
  name = EXCLUDED.name;
-- Alice's name is now 'Alice Smith' (overwritten)
```

`EXCLUDED` is a special table reference that refers to the row that *would have been inserted* — the incoming data. It's how you reference the new values inside the `DO UPDATE` clause.

```sql
-- Full upsert with multiple columns
INSERT INTO users (email, name, updated_at)
VALUES ('alice@example.com', 'Alice Smith', NOW())
ON CONFLICT (email) DO UPDATE SET
  name = EXCLUDED.name,
  updated_at = EXCLUDED.updated_at;

-- Conditional upsert — only update if the incoming data is newer
INSERT INTO events (event_id, payload, received_at)
VALUES ('evt_123', '{"action": "click"}', NOW())
ON CONFLICT (event_id) DO UPDATE SET
  payload = EXCLUDED.payload,
  received_at = EXCLUDED.received_at
WHERE events.received_at < EXCLUDED.received_at;
```

### 5. Composite Unique Constraints

When uniqueness is defined by a combination of columns:

```sql
CREATE TABLE enrollments (
  student_id INT NOT NULL,
  course_id INT NOT NULL,
  enrolled_at TIMESTAMP DEFAULT NOW(),
  UNIQUE (student_id, course_id)    -- unique together, not individually
);

-- A student can't enroll in the same course twice
INSERT INTO enrollments (student_id, course_id)
VALUES (42, 101)
ON CONFLICT (student_id, course_id) DO NOTHING;

-- student 42 in course 101 already exists → skipped
-- student 42 in course 102 would insert fine (different combination)
```

### 6. Returning Affected Rows

`RETURNING` with `DO NOTHING` only returns rows that were *actually inserted* — not skipped rows.

```sql
-- Only returns newly inserted rows
INSERT INTO users (email, name)
VALUES
  ('alice@example.com', 'Alice'),     -- exists → skipped, NOT returned
  ('frank@example.com', 'Frank')      -- new → inserted, returned
ON CONFLICT (email) DO NOTHING
RETURNING id, email;

-- Result:
-- id | email
-- 6  | frank@example.com
-- (only 1 row — Alice was skipped)
```

If you need the IDs of *all* rows (both inserted and existing), you need `DO UPDATE` with a no-op update:

```sql
-- Returns ALL rows — inserted or already existing
INSERT INTO users (email, name)
VALUES
  ('alice@example.com', 'Alice'),
  ('frank@example.com', 'Frank')
ON CONFLICT (email) DO UPDATE SET
  email = EXCLUDED.email      -- no-op update (sets email to itself)
RETURNING id, email;

-- Result:
-- id | email
-- 1  | alice@example.com     ← already existed, "updated" (no actual change)
-- 6  | frank@example.com     ← newly inserted
```

This is a common trick — the `DO UPDATE SET email = EXCLUDED.email` technically performs an update (setting a field to its own value), which makes `RETURNING` include it. Beware that this does acquire a row lock and fires update triggers even though no data actually changes.

### 7. Real-World Patterns

**Event deduplication (message queues, webhooks):**

```sql
-- Webhook events can fire multiple times
-- Use event_id as the natural deduplication key
CREATE TABLE webhook_events (
  event_id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  received_at TIMESTAMP DEFAULT NOW()
);

-- Safe to call multiple times with the same event
INSERT INTO webhook_events (event_id, event_type, payload)
VALUES ('evt_abc123', 'payment.completed', '{"amount": 99.99}')
ON CONFLICT (event_id) DO NOTHING;

-- Process only if the insert actually happened
WITH inserted AS (
  INSERT INTO webhook_events (event_id, event_type, payload)
  VALUES ('evt_abc123', 'payment.completed', '{"amount": 99.99}')
  ON CONFLICT (event_id) DO NOTHING
  RETURNING event_id
)
SELECT COUNT(*) > 0 AS is_new FROM inserted;
-- is_new = true → process the event
-- is_new = false → already processed, skip
```

**Tag/category assignment:**

```sql
-- Assign tags to articles — same tag can't be assigned twice
CREATE TABLE article_tags (
  article_id INT NOT NULL,
  tag_id INT NOT NULL,
  PRIMARY KEY (article_id, tag_id)
);

-- Idempotent: safe to run even if some tags already assigned
INSERT INTO article_tags (article_id, tag_id)
VALUES
  (1, 10),
  (1, 20),
  (1, 30)
ON CONFLICT DO NOTHING;
```

**User preferences with defaults:**

```sql
-- Set default preferences, don't overwrite if user already customized
INSERT INTO user_preferences (user_id, theme, language, notifications)
VALUES (42, 'dark', 'en', true)
ON CONFLICT (user_id) DO NOTHING;
-- Only sets preferences if none exist yet
```

**Sync from external API:**

```sql
-- Periodically sync users from an external system
-- New users get inserted, existing users are left alone
INSERT INTO synced_contacts (external_id, name, email, synced_at)
SELECT external_id, name, email, NOW()
FROM staging_contacts
ON CONFLICT (external_id) DO NOTHING;

-- Or use DO UPDATE to refresh data:
INSERT INTO synced_contacts (external_id, name, email, synced_at)
SELECT external_id, name, email, NOW()
FROM staging_contacts
ON CONFLICT (external_id) DO UPDATE SET
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  synced_at = EXCLUDED.synced_at;
```

### 8. Cross-Database Equivalents

`ON CONFLICT` is PostgreSQL syntax. Other databases have equivalent features with different syntax:

```sql
-- PostgreSQL
INSERT INTO users (email, name)
VALUES ('alice@example.com', 'Alice')
ON CONFLICT (email) DO NOTHING;

-- MySQL
INSERT IGNORE INTO users (email, name)
VALUES ('alice@example.com', 'Alice');

-- MySQL (upsert)
INSERT INTO users (email, name)
VALUES ('alice@example.com', 'Alice')
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- SQLite
INSERT OR IGNORE INTO users (email, name)
VALUES ('alice@example.com', 'Alice');

-- SQLite (also supports ON CONFLICT)
INSERT INTO users (email, name)
VALUES ('alice@example.com', 'Alice')
ON CONFLICT (email) DO NOTHING;

-- SQL Server (MERGE)
MERGE INTO users AS target
USING (VALUES ('alice@example.com', 'Alice')) AS source (email, name)
ON target.email = source.email
WHEN NOT MATCHED THEN
  INSERT (email, name) VALUES (source.email, source.name);
```

### 9. With Partial Indexes

PostgreSQL supports conflict detection on partial unique indexes — unique constraints that only apply to a subset of rows.

```sql
-- Only one "active" subscription per user (but multiple inactive are fine)
CREATE UNIQUE INDEX idx_one_active_sub
  ON subscriptions (user_id)
  WHERE status = 'active';

-- Prevent a second active subscription
INSERT INTO subscriptions (user_id, plan, status)
VALUES (42, 'premium', 'active')
ON CONFLICT (user_id) WHERE status = 'active' DO NOTHING;
-- Skipped if user 42 already has an active subscription
-- Inserted if they only have inactive ones
```

## Performance Considerations

```
Operation                    Relative Cost
──────────────────────────────────────────
INSERT (no conflict)         1x (baseline)
INSERT + DO NOTHING (skip)   ~1x (checks index, skips — very cheap)
INSERT + DO UPDATE           ~1.5x (checks index + performs update)
Try/catch in application     ~2-5x (full error round trip, rollback)
SELECT then INSERT           ~2x (two round trips, race condition risk)
```

`DO NOTHING` is almost free on conflicts — it checks the index (which it would check anyway for the insert), finds the conflict, and skips. No row locking, no triggers fired, no WAL entries for skipped rows.

## Common Pitfalls

- **Not specifying the conflict target.** `ON CONFLICT DO NOTHING` (without specifying a column) catches *any* unique constraint violation. If the table has multiple unique columns, you might silently skip rows for unexpected reasons. Always specify: `ON CONFLICT (email) DO NOTHING`.
- **Assuming `DO NOTHING` returns skipped rows.** `RETURNING` only returns rows that were actually inserted. If you need the IDs of existing rows, use the `DO UPDATE` no-op trick (but be aware of its side effects).
- **Race conditions with separate SELECT + INSERT.** Don't do `SELECT` to check if a row exists, then `INSERT`. Between those two statements, another transaction can insert the same row. `ON CONFLICT` handles this atomically.
- **Using `DO NOTHING` when you mean `DO UPDATE`.** If your intent is "insert new, update existing" (true upsert), `DO NOTHING` silently discards your updates. Use `DO UPDATE SET` instead.
- **Ignoring the difference between unique constraints and indexes.** `ON CONFLICT (column)` requires a unique index or constraint on that column. If the constraint doesn't exist, PostgreSQL throws an error — the conflict target must match a real uniqueness guarantee.
- **Sequence gaps.** Even when `DO NOTHING` skips a row, `SERIAL` / `IDENTITY` sequences still increment. Over time, this creates gaps in auto-generated IDs. This is harmless but can surprise people expecting contiguous IDs.

## Practical Applications

- **Webhook/Event Processing:** Webhooks often fire multiple times. Use `ON CONFLICT (event_id) DO NOTHING` to guarantee exactly-once processing at the database level.
- **Data Pipeline Loads:** ETL jobs that run on a schedule can safely re-insert data without deduplication logic — `DO NOTHING` handles it.
- **User Registration:** Prevent duplicate accounts by email without catching and parsing database errors in application code.
- **Feature Flags / Config Seeding:** Insert default configuration rows on application startup, skip if they already exist. Safe to run on every deploy.
- **Relationship Tables:** Many-to-many join tables (article_tags, user_roles) benefit from `DO NOTHING` — assign a tag idempotently without checking if it's already assigned.

## References

- [PostgreSQL Docs: INSERT ON CONFLICT](https://www.postgresql.org/docs/current/sql-insert.html)
- [PostgreSQL Wiki: UPSERT](https://wiki.postgresql.org/wiki/UPSERT)
- [SQLite Docs: ON CONFLICT](https://www.sqlite.org/lang_conflict.html)
- [MySQL Docs: INSERT IGNORE](https://dev.mysql.com/doc/refman/8.0/en/insert.html)

---

## Greater Detail

### Advanced Concepts

- **`ON CONFLICT` with CTEs:** Combine `DO NOTHING` with `WITH` (CTEs) for complex upsert-and-return patterns. Insert into a CTE, use `RETURNING` to capture inserted rows, then separately query for existing rows and `UNION ALL` the results — a clean way to get IDs for all rows regardless of conflict.
- **Advisory Locks for Complex Upserts:** For upserts that involve multiple tables or business logic beyond a single `INSERT`, `pg_advisory_lock` provides application-level locking. Lock on a hash of the unique key, perform your multi-statement logic, then release. More flexible than `ON CONFLICT` but requires careful lock management.
- **`MERGE` Statement (SQL Standard / PostgreSQL 15+):** PostgreSQL 15 introduced the SQL-standard `MERGE` statement, which provides `WHEN MATCHED` / `WHEN NOT MATCHED` branching. It's more verbose than `ON CONFLICT` but handles more complex conditional logic — update if certain conditions are true, insert otherwise, or even delete on match.
- **Conflict on Expressions:** PostgreSQL supports conflict detection on index expressions, not just columns: `ON CONFLICT (lower(email)) DO NOTHING`. This catches conflicts on a case-insensitive email comparison, matching a unique index defined on `lower(email)`.
- **Trigger Behavior:** `DO NOTHING` does not fire `BEFORE INSERT` or `AFTER INSERT` triggers for skipped rows. `DO UPDATE` fires `BEFORE UPDATE` and `AFTER UPDATE` triggers for conflicting rows, even for no-op updates. This distinction matters for audit logging and materialized view maintenance.