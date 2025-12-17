# SQL LIKE vs ILIKE and Collation: Complete Overview

LIKE and ILIKE are SQL pattern-matching operators used in WHERE clauses to search for patterns in text. LIKE is case-sensitive (in most databases), while ILIKE is case-insensitive. Their behavior is influenced by collation—the rules that determine how characters are compared, sorted, and whether comparisons are deterministic (consistent) or non-deterministic (context-dependent). Think of LIKE as an exact pattern match and ILIKE as a flexible one, while collation is the rulebook that defines what "matching" means.

## Key Points

- **LIKE:** Case-sensitive pattern matching (standard SQL)
- **ILIKE:** Case-insensitive pattern matching (PostgreSQL, not standard SQL)
- **Collation:** Rules for character comparison (sorting, equality, case sensitivity)
- **Deterministic Collation:** Same input always produces same result
- **Non-Deterministic Collation:** Results may vary based on context or locale

## High-Level Overview

### What is LIKE?

LIKE is a SQL operator for pattern matching using wildcards: `%` (any sequence of characters) and `_` (single character).

```sql
-- Case-sensitive in most databases
SELECT * FROM users WHERE name LIKE 'John%';
-- Matches: 'John', 'Johnson', 'Johnny'
-- Does NOT match: 'john', 'JOHN'

SELECT * FROM products WHERE code LIKE 'A_B';
-- Matches: 'A1B', 'A9B', 'AXB'
-- Does NOT match: 'AB', 'A12B'
```

### What is ILIKE?

ILIKE is a PostgreSQL-specific operator for case-insensitive pattern matching.

```sql
-- Case-insensitive (PostgreSQL only)
SELECT * FROM users WHERE name ILIKE 'john%';
-- Matches: 'John', 'JOHN', 'john', 'Johnny', 'JOHNNY'

-- Standard SQL alternative (other databases)
SELECT * FROM users WHERE LOWER(name) LIKE LOWER('john%');
-- Or use COLLATE (if supported)
SELECT * FROM users WHERE name LIKE 'john%' COLLATE Latin1_General_CI_AS;
```

### What is Collation?

Collation defines the rules for comparing and sorting strings: case sensitivity, accent sensitivity, character order.

```sql
-- Example collations:
-- Latin1_General_CS_AS: Case-Sensitive, Accent-Sensitive
-- Latin1_General_CI_AS: Case-Insensitive, Accent-Sensitive
-- Latin1_General_CI_AI: Case-Insensitive, Accent-Insensitive

-- Different collation = different results
SELECT * FROM users 
WHERE name = 'Café' COLLATE Latin1_General_CS_AS;
-- Matches: 'Café'
-- Does NOT match: 'café', 'CAFÉ'

SELECT * FROM users 
WHERE name = 'Café' COLLATE Latin1_General_CI_AS;
-- Matches: 'Café', 'café', 'CAFÉ'
-- Does NOT match: 'Cafe' (accent different)
```

## Similarities

### 1. Both Are Pattern Matching Operators

```sql
-- Both use same wildcard syntax
SELECT * FROM products WHERE name LIKE 'Apple%';
SELECT * FROM products WHERE name ILIKE 'Apple%';

-- Both support _ and % wildcards
LIKE 'a_c'   -- Matches: 'abc', 'a1c', 'aXc'
ILIKE 'a_c'  -- Same matches, but case-insensitive
```

### 2. Both Affected by Collation

```sql
-- LIKE respects collation
SELECT * FROM users 
WHERE name LIKE 'José%' COLLATE Latin1_General_CS_AS;

-- ILIKE also respects collation (for non-case aspects)
SELECT * FROM users 
WHERE name ILIKE 'josé%' COLLATE Latin1_General_AS;
-- Still case-insensitive, but collation affects accent handling
```

### 3. Both Support Escape Characters

```sql
-- Escaping wildcards
SELECT * FROM files WHERE name LIKE '%.txt';
-- Matches: 'any.txt', 'document.txt'

SELECT * FROM files WHERE name LIKE '50\%' ESCAPE '\';
-- Matches literal: '50%'
-- '\' tells SQL that % is literal, not wildcard

-- Same for ILIKE
SELECT * FROM files WHERE name ILIKE '50\%' ESCAPE '\';
```

### 4. Both Can Use Indexes (With Limitations)

```sql
-- Indexes can optimize LIKE/ILIKE with prefix patterns
CREATE INDEX idx_name ON users(name);

SELECT * FROM users WHERE name LIKE 'John%';  -- ✅ Can use index
SELECT * FROM users WHERE name ILIKE 'john%'; -- ✅ Can use index (with special index)

-- Leading wildcard prevents index usage
SELECT * FROM users WHERE name LIKE '%John';  -- ❌ Can't use regular index
```

## Differences

### 1. Case Sensitivity

```sql
-- LIKE: Case-sensitive by default
SELECT * FROM users WHERE name LIKE 'john';
-- Matches: 'john'
-- Does NOT match: 'John', 'JOHN'

-- ILIKE: Always case-insensitive
SELECT * FROM users WHERE name ILIKE 'john';
-- Matches: 'john', 'John', 'JOHN', 'JoHn'
```

### 2. Database Support

```sql
-- ILIKE: PostgreSQL only
-- PostgreSQL
SELECT * FROM users WHERE name ILIKE 'john%';  -- ✅ Works

-- MySQL
SELECT * FROM users WHERE name ILIKE 'john%';  -- ❌ Error

-- SQL Server
SELECT * FROM users WHERE name ILIKE 'john%';  -- ❌ Error

-- Standard SQL alternative for case-insensitive:
-- MySQL (case-insensitive by default with some collations)
SELECT * FROM users WHERE name LIKE 'john%';

-- SQL Server (use COLLATE)
SELECT * FROM users WHERE name LIKE 'john%' COLLATE Latin1_General_CI_AS;

-- Cross-database (works everywhere)
SELECT * FROM users WHERE LOWER(name) LIKE LOWER('john%');
```

### 3. Performance

```sql
-- LIKE: Direct comparison, faster
SELECT * FROM users WHERE name LIKE 'John%';
-- Execution time: ~10ms

-- ILIKE: Case conversion overhead
SELECT * FROM users WHERE name ILIKE 'john%';
-- Execution time: ~15ms (slightly slower)

-- LOWER() approach: Function call overhead
SELECT * FROM users WHERE LOWER(name) LIKE LOWER('john%');
-- Execution time: ~20ms (slowest, can't use regular indexes)
```

### 4. Index Requirements

```sql
-- LIKE: Standard B-tree index works
CREATE INDEX idx_name ON users(name);
SELECT * FROM users WHERE name LIKE 'John%';  -- ✅ Uses index

-- ILIKE: Requires special index (PostgreSQL)
CREATE INDEX idx_name_lower ON users(LOWER(name));
SELECT * FROM users WHERE name ILIKE 'john%';  -- ❌ Doesn't use idx_name

-- Or use trigram index
CREATE EXTENSION pg_trgm;
CREATE INDEX idx_name_trgm ON users USING gin(name gin_trgm_ops);
SELECT * FROM users WHERE name ILIKE '%john%';  -- ✅ Uses trigram index
```

### 5. Collation Override

```sql
-- LIKE with collation: Can override case sensitivity
SELECT * FROM users 
WHERE name LIKE 'john%' COLLATE Latin1_General_CI_AS;
-- Now case-insensitive like ILIKE

-- ILIKE with collation: Stays case-insensitive
SELECT * FROM users 
WHERE name ILIKE 'john%' COLLATE Latin1_General_CS_AS;
-- Still case-insensitive (ILIKE always is)
-- Collation only affects other aspects (accents, sorting)
```

## Deterministic vs Non-Deterministic Collation

### What is Deterministic Collation?

Deterministic collation produces consistent, predictable results—same input always gives same output.

```sql
-- Deterministic collation
SELECT * FROM users 
WHERE name = 'Müller' COLLATE Latin1_General_CS_AS;
-- Always matches: 'Müller' exactly
-- Never matches: 'Mueller', 'MÜLLER', 'müller'

-- Indexable and predictable
CREATE INDEX idx_name ON users(name COLLATE Latin1_General_CS_AS);
-- ✅ Index works reliably
```

### What is Non-Deterministic Collation?

Non-deterministic collation may produce different results based on context, locale, or linguistic rules.

```sql
-- Non-deterministic collation (SQL Server 2019+)
SELECT * FROM users 
WHERE name = 'Müller' COLLATE Latin1_General_100_CI_AS_SC_UTF8;
-- May match: 'Mueller' (ü = ue in German)
-- Context-dependent linguistic matching

-- Cannot be used for indexes in some databases
CREATE INDEX idx_name ON users(name COLLATE Latin1_General_100_CI_AS_SC_UTF8);
-- ❌ Error: Cannot create index on non-deterministic collation
```

### How They Affect LIKE/ILIKE

```sql
-- DETERMINISTIC COLLATION
-- Predictable behavior
SELECT * FROM products 
WHERE name LIKE 'café%' COLLATE Latin1_General_CS_AS;
-- Matches: 'café', 'caféine'
-- Does NOT match: 'Café', 'CAFÉ', 'cafe'
-- Always the same results

-- NON-DETERMINISTIC COLLATION
-- Context-dependent behavior
SELECT * FROM products 
WHERE name LIKE 'café%' COLLATE Latin1_General_100_CI_AI_SC_UTF8;
-- May match: 'café', 'cafe', 'Café', 'CAFE'
-- Accent-insensitive, case-insensitive
-- Results depend on linguistic rules
```

## Practical Examples

### Example 1: User Search Feature

```sql
-- PostgreSQL: Case-insensitive search
SELECT * FROM users 
WHERE 
  name ILIKE '%john%' OR 
  email ILIKE '%john%';
-- Finds: John, JOHN, john, Johnson

-- SQL Server: Case-insensitive with collation
SELECT * FROM users 
WHERE 
  name LIKE '%john%' COLLATE Latin1_General_CI_AS OR 
  email LIKE '%john%' COLLATE Latin1_General_CI_AS;

-- MySQL: Often case-insensitive by default
SELECT * FROM users 
WHERE 
  name LIKE '%john%' OR 
  email LIKE '%john%';
```

### Example 2: Product Filtering

```sql
-- Case-sensitive product codes
SELECT * FROM products 
WHERE code LIKE 'ABC-%';
-- Matches: 'ABC-001', 'ABC-XYZ'
-- Does NOT match: 'abc-001'

-- Case-insensitive product names
SELECT * FROM products 
WHERE name ILIKE '%laptop%';
-- Matches: 'Laptop', 'LAPTOP', 'Gaming Laptop'
```

### Example 3: International Names

```sql
-- Deterministic: Exact matching
SELECT * FROM customers 
WHERE name LIKE 'José%' COLLATE Latin1_General_CS_AS;
-- Matches: 'José Garcia'
-- Does NOT match: 'Jose Garcia', 'josé garcia'

-- Non-deterministic: Flexible matching
SELECT * FROM customers 
WHERE name LIKE 'Jose%' COLLATE Latin1_General_100_CI_AI_SC;
-- Matches: 'José Garcia', 'Jose Garcia', 'JOSÉ GARCIA'
-- Accent-insensitive, case-insensitive
```

### Example 4: Performance Optimization

```sql
-- ❌ Slow: Function on column
SELECT * FROM users 
WHERE LOWER(name) LIKE '%john%';
-- Can't use index on 'name'

-- ✅ Better: Functional index
CREATE INDEX idx_name_lower ON users(LOWER(name));
SELECT * FROM users 
WHERE LOWER(name) LIKE '%john%';
-- Uses functional index

-- ✅ Best: Native ILIKE with GIN index (PostgreSQL)
CREATE INDEX idx_name_trgm ON users USING gin(name gin_trgm_ops);
SELECT * FROM users 
WHERE name ILIKE '%john%';
-- Uses trigram index, fastest
```

### Example 5: Escaping Special Characters

```sql
-- Matching literal wildcards
SELECT * FROM files 
WHERE filename LIKE '%.txt';
-- Matches: 'any.txt', 'document.txt', 'a-txt' (. is not special)

SELECT * FROM files 
WHERE filename LIKE '%\_%' ESCAPE '\';
-- Matches: 'my_file.txt', 'data_2024.csv'
-- Literal underscore, not wildcard

SELECT * FROM discount_codes 
WHERE code LIKE '50\%OFF' ESCAPE '\';
-- Matches: '50%OFF' (literal percent sign)
```

## Collation Quick Reference

```sql
-- Common SQL Server collations
Latin1_General_CS_AS     -- Case-Sensitive, Accent-Sensitive
Latin1_General_CI_AS     -- Case-Insensitive, Accent-Sensitive
Latin1_General_CI_AI     -- Case-Insensitive, Accent-Insensitive
Latin1_General_CS_AI     -- Case-Sensitive, Accent-Insensitive

-- Check database collation
-- SQL Server
SELECT DATABASEPROPERTYEX('MyDatabase', 'Collation');

-- PostgreSQL
SHOW LC_COLLATE;

-- MySQL
SHOW VARIABLES LIKE 'collation%';

-- Set column collation
-- SQL Server
CREATE TABLE users (
  name NVARCHAR(100) COLLATE Latin1_General_CI_AS
);

-- PostgreSQL
CREATE TABLE users (
  name TEXT COLLATE "en_US"
);

-- MySQL
CREATE TABLE users (
  name VARCHAR(100) COLLATE utf8mb4_unicode_ci
);
```

## Common Pitfalls

- Using ILIKE in non-PostgreSQL databases (syntax error)
- Not considering performance impact of case-insensitive searches
- Forgetting to escape wildcards when matching literal `%` or `_`
- Using non-deterministic collation in indexed columns
- Mixing collations in joins (causes errors or performance issues)
- Not understanding default collation of database/table

## Decision Guide

```sql
-- Use LIKE when:
✅ Need case-sensitive matching
✅ Pattern is fixed/known
✅ Performance critical
✅ Working with product codes, IDs

Example:
SELECT * FROM orders WHERE order_id LIKE 'ORD-%';


-- Use ILIKE when:
✅ User-facing search (PostgreSQL)
✅ Case doesn't matter
✅ Searching names, descriptions
✅ PostgreSQL database

Example:
SELECT * FROM products WHERE name ILIKE '%laptop%';


-- Use LOWER() + LIKE when:
✅ Need portability across databases
✅ Can't use ILIKE
✅ Case-insensitive needed

Example:
SELECT * FROM users WHERE LOWER(email) LIKE LOWER('%@example.com');


-- Use Deterministic Collation when:
✅ Need predictable results
✅ Need indexable comparisons
✅ Exact matching required

Example:
WHERE name = 'Smith' COLLATE Latin1_General_CS_AS


-- Use Non-Deterministic Collation when:
✅ Need linguistic/cultural matching
✅ Flexible name matching
✅ Don't need indexes on comparison

Example:
WHERE name LIKE 'José%' COLLATE Latin1_General_100_CI_AI_SC
```

## Best Practices

```sql
-- ✅ Use appropriate index type
-- PostgreSQL: GIN index for ILIKE with wildcards
CREATE INDEX idx_name_trgm ON users USING gin(name gin_trgm_ops);

-- PostgreSQL: B-tree on LOWER() for prefix matching
CREATE INDEX idx_name_lower ON users(LOWER(name));

-- ✅ Be explicit about collation in critical queries
SELECT * FROM users 
WHERE name LIKE 'John%' COLLATE Latin1_General_CS_AS;

-- ✅ Document collation choices
-- In schema documentation:
-- name column uses Latin1_General_CI_AS for case-insensitive user searches

-- ✅ Test with international characters
-- Test data:
INSERT INTO users VALUES ('José'), ('Müller'), ('Björk'), ('Łukasz');

-- ✅ Use parameterized queries with wildcards
-- ❌ SQL injection risk
query = f"SELECT * FROM users WHERE name LIKE '%{user_input}%'"

-- ✅ Safe
query = "SELECT * FROM users WHERE name LIKE ?"
params = [f"%{user_input}%"]
```

## References

- [PostgreSQL Pattern Matching](https://www.postgresql.org/docs/current/functions-matching.html)
- [SQL Server Collation](https://docs.microsoft.com/en-us/sql/relational-databases/collations/collation-and-unicode-support)
- [MySQL Pattern Matching](https://dev.mysql.com/doc/refman/8.0/en/pattern-matching.html)
- [SQL Standard LIKE](https://www.iso.org/standard/63555.html)

---

## Quick Reference Table

| Feature | LIKE | ILIKE | Deterministic | Non-Deterministic |
|---------|------|-------|---------------|-------------------|
| **Case Sensitive** | Yes (usually) | No | Depends | Depends |
| **Standard SQL** | Yes | No (PostgreSQL) | Yes | No |
| **Indexable** | Yes | Yes* | Yes | No** |
| **Performance** | Fast | Slower | Fast | Slower |
| **Predictable** | Yes | Yes | Yes | No |
| **Linguistic Rules** | No | No | No | Yes |

*Requires special index (GIN/trigram)
**Most databases don't allow indexes on non-deterministic collations