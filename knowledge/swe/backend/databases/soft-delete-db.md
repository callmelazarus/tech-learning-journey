# Soft Deletes in Databases: A Well-Structured Overview

Soft deletes are a technique for marking records as deleted without actually removing them from the database. This approach preserves data for auditing, recovery, and historical analysis.

## Key Points

- **Definition:** Soft deletes flag records as deleted (e.g., with a `deleted` or `is_active` column) instead of physically removing them.
- **Data Retention:** Enables recovery of deleted data and supports audit trails.
- **Implementation:** Typically uses a boolean or timestamp column to indicate deletion.
- **Query Filtering:** All queries must exclude soft-deleted records unless explicitly requested.
- **Performance:** Can impact query performance if not indexed or filtered properly.
- **Compliance:** Useful for meeting regulatory requirements for data retention.
- **Cascade Deletes:** Related records may also need soft delete logic.

## Step-by-Step Explanation & Examples

1. **Schema Example**
   ```sql
   CREATE TABLE users (
     id INT PRIMARY KEY,
     name VARCHAR(100),
     deleted_at TIMESTAMP NULL
   );
   ```

2. **Soft Delete Operation**
   ```sql
   UPDATE users SET deleted_at = NOW() WHERE id = 123;
   ```

3. **Querying Non-Deleted Records**
   ```sql
   SELECT * FROM users WHERE deleted_at IS NULL;
   ```

4. **Restoring a Soft-Deleted Record**
   ```sql
   UPDATE users SET deleted_at = NULL WHERE id = 123;
   ```

## Common Pitfalls

- Forgetting to filter out soft-deleted records in queries.
- Not indexing the soft delete column, leading to slow queries.
- Overcomplicating logic for cascade deletes or restoration.
- Failing to handle unique constraints (e.g., re-adding a \"deleted\" username).

## Practical Applications

- Audit trails and historical data analysis.
- Data recovery and undo functionality.
- Regulatory compliance for data retention.
- Avoiding accidental data loss in production systems.

## References

- [Soft Deletes in SQL: Best Practices](https://www.sqlshack.com/soft-delete-vs-hard-delete-in-sql-server/)
- [PostgreSQL: Soft Deletes](https://wiki.postgresql.org/wiki/Soft_delete)
- [Laravel Docs: Soft Deletes](https://laravel.com/docs/10.x/eloquent#soft-deleting)

---

## Greater Detail

### Advanced Concepts

- **Paranoid Models:** ORMs (e.g., Sequelize, Laravel Eloquent) offer built-in support for soft deletes.
- **Archiving:** Move soft-deleted records to a separate archive table for performance.
- **Event Sourcing:** Use event logs to track deletes and restores.
- **Security:** Ensure soft-deleted data is not exposed in APIs or UIs.
- **Automated Cleanup:** Periodically purge old soft-deleted