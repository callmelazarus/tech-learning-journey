# Database Indexing: A Well-Structured Overview

Database indexes are data structures that improve the speed of data retrieval operations by creating optimized lookup paths, similar to how a book's index helps you find topics without reading every page.

## Key Points

- **Definition:** Auxiliary data structures that store a subset of table data in a format optimized for fast searches and lookups.
- **Performance Trade-off:** Dramatically speeds up reads but slows down writes (INSERT, UPDATE, DELETE) due to index maintenance.
- **Types:** Common types include B-tree (default), Hash, GiST, GIN, and BRIN, each suited for different query patterns.
- **Selectivity:** Most effective on columns with high cardinality (many unique values) and frequently used in WHERE, JOIN, or ORDER BY clauses.
- **Storage Overhead:** Indexes consume additional disk space, sometimes as much as the table itself.
- **Maintenance:** Require periodic rebuilding or vacuuming to maintain efficiency, especially after bulk operations.
- **Query Planner:** The database optimizer decides whether to use an index based on cost estimates.

## Step-by-Step Explanation & Examples

1. **Creating a Basic Index**
   ```sql
   CREATE INDEX idx_users_email ON users(email);
   
   -- Unique index (also enforces uniqueness)
   CREATE UNIQUE INDEX idx_users_username ON users(username);
   ```

2. **Composite (Multi-Column) Index**
   ```sql
   CREATE INDEX idx_orders_user_date ON orders(user_id, created_at);
   
   -- Efficient for queries like:
   SELECT * FROM orders WHERE user_id = 123 AND created_at > '2024-01-01';
   ```

3. **Partial Index (Filtered)**
   ```sql
   CREATE INDEX idx_active_users ON users(email) WHERE active = true;
   
   -- Only indexes active users, saving space and improving performance
   ```

4. **Checking Index Usage**
   ```sql
   EXPLAIN ANALYZE SELECT * FROM users WHERE email = 'john@example.com';
   
   -- Look for "Index Scan" vs "Seq Scan" in output
   ```

5. **Viewing Existing Indexes**
   ```sql
   \di                   -- In psql: list all indexes
   
   SELECT indexname, indexdef 
   FROM pg_indexes 
   WHERE tablename = 'users';
   ```

6. **Dropping an Index**
   ```sql
   DROP INDEX idx_users_email;
   ```

## Common Pitfalls

- Over-indexing tables, which slows down writes and wastes storage without improving read performance.
- Wrong column order in composite indexes—the leftmost column must match your query filters.
- Indexing low-cardinality columns (e.g., boolean fields) where sequential scans are often faster.
- Ignoring unused indexes—they still consume resources during writes.
- Not accounting for index bloat after heavy UPDATE/DELETE operations.
- Assuming indexes always help—small tables often perform better with sequential scans.

## Practical Applications

- **API Performance:** Indexing foreign keys and commonly filtered columns to reduce response times.
- **Search Features:** Full-text search indexes (GIN) for text search functionality.
- **Reporting Queries:** Covering indexes that include all columns needed, avoiding table lookups.
- **Unique Constraints:** Enforcing data integrity while providing lookup optimization.

**Example anecdote:** On a project with a growing users table, our login endpoint started timing out at 50k users. Adding a simple index on the email column (which we filtered on every login) dropped query time from 1.2 seconds to 3ms—problem solved in one line of SQL.

## References

- [PostgreSQL: Indexes](https://www.postgresql.org/docs/current/indexes.html)
- [Use The Index, Luke](https://use-the-index-luke.com/)
- [MySQL Indexing Best Practices](https://dev.mysql.com/doc/refman/8.0/en/optimization-indexes.html)
- [MongoDB Index Strategies](https://www.mongodb.com/docs/manual/indexes/)

---

## Greater Detail

### Advanced Concepts

- **Covering Indexes:** Include all columns needed by a query to avoid accessing the table (e.g., `CREATE INDEX idx_cover ON users(id, email, name)`).
- **Index-Only Scans:** Query satisfied entirely from index without touching the table data.
- **Expression Indexes:** Index computed values (e.g., `CREATE INDEX idx_lower_email ON users(LOWER(email))`).
- **Index Types Deep Dive:**
  - **B-tree:** Default, balanced tree structure for equality and range queries
  - **Hash:** Fast equality lookups only, no range queries
  - **GiST/GIN:** For full-text search, arrays, JSON, and geometric data
  - **BRIN:** Block Range INdexes for very large tables with natural ordering
- **Fill Factor:** Control how densely packed index pages are to reduce page splits during writes.
- **Concurrent Indexing:** Use `CREATE INDEX CONCURRENTLY` to build indexes without blocking writes (PostgreSQL).
- **Index Statistics:** Analyze index usage with `pg_stat_user_indexes` to identify unused indexes.
- **Bitmap Index Scans:** Database combines multiple indexes for complex queries.
- **Clustered vs Non-Clustered:** Clustered indexes determine physical row order (one per table), non-clustered are separate structures.
- **Index Fragmentation:** Monitor and rebuild fragmented indexes for optimal performance.
- **Partitioned Table Indexes:** Strategy for indexing across table partitions efficiently.
- **Cost-Based Optimization:** Understand how the query planner estimates costs to use indexes effectively.