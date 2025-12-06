# Drizzle ORM: A Well-Structured Overview

Drizzle is a TypeScript-first ORM that provides type-safe database operations with a SQL-like query builder, offering zero-cost abstractions and automatic type inference from schema definitions.

## Key Points

- **Definition:** Lightweight TypeScript ORM with SQL-like syntax, emphasizing type safety and developer experience without runtime overhead.
- **Type Safety:** Automatic TypeScript types derived from schema—no code generation or type declaration files needed.
- **SQL-Like Syntax:** Query builder mirrors SQL structure, making it familiar for developers with SQL knowledge.
- **Database Support:** PostgreSQL, MySQL, SQLite with consistent API across different databases.
- **Migrations:** Built-in migration system with auto-generation from schema changes.
- **Performance:** Minimal runtime overhead with direct SQL generation—no query parsing at runtime.
- **Relations:** Type-safe joins and relations with automatic type inference for nested queries.

## Step-by-Step Explanation & Examples

**Schema Definition**
```typescript
import { pgTable, serial, text, integer, timestamp } from 'drizzle-orm/pg-core';

// Define table schema
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  // serial: Auto-incrementing integer, primary key
  
  name: text('name').notNull(),
  // text: String type, notNull() makes it required
  
  email: text('email').notNull().unique(),
  // unique(): Enforces unique constraint
  
  age: integer('age'),
  // Optional field (nullable by default)
  
  createdAt: timestamp('created_at').defaultNow(),
  // defaultNow(): Automatic timestamp on insert
});

export const posts = pgTable('posts', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  content: text('content'),
  userId: integer('user_id').references(() => users.id),
  // references(): Foreign key to users.id
  
  publishedAt: timestamp('published_at'),
});

// TypeScript types automatically inferred
type User = typeof users.$inferSelect;  // Select type
type NewUser = typeof users.$inferInsert; // Insert type
```

**Basic CRUD Operations**
```typescript
import { drizzle } from 'drizzle-orm/node-postgres';
import { eq, and, or, gt, like } from 'drizzle-orm';

const db = drizzle(pool);

// INSERT - Create new records
await db.insert(users).values({
  name: 'Alice',
  email: 'alice@example.com',
  age: 30
});
// values(): Object matching schema types

// Insert multiple
await db.insert(users).values([
  { name: 'Bob', email: 'bob@test.com' },
  { name: 'Charlie', email: 'charlie@test.com' }
]);

// SELECT - Query records
const allUsers = await db.select().from(users);
// Returns: User[] with full type safety

// Specific columns
const names = await db
  .select({ name: users.name, email: users.email })
  .from(users);
// Returns: { name: string, email: string }[]

// WHERE conditions
const user = await db
  .select()
  .from(users)
  .where(eq(users.email, 'alice@example.com'));
// eq(): Equality operator (=)

// Multiple conditions
const filteredUsers = await db
  .select()
  .from(users)
  .where(
    and(
      gt(users.age, 25),        // Greater than (>)
      like(users.email, '%@example.com')  // LIKE pattern
    )
  );

// UPDATE - Modify records
await db
  .update(users)
  .set({ age: 31 })
  .where(eq(users.id, 1));
// set(): Object with fields to update

// DELETE - Remove records
await db
  .delete(users)
  .where(eq(users.id, 1));
```

**Joins and Relations**
```typescript
// Define relations (separate from schema)
import { relations } from 'drizzle-orm';

export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
  // one-to-many: user has many posts
}));

export const postsRelations = relations(posts, ({ one }) => ({
  author: one(users, {
    fields: [posts.userId],
    references: [users.id],
  }),
  // many-to-one: post belongs to one user
}));

// Query with joins
const usersWithPosts = await db
  .select()
  .from(users)
  .leftJoin(posts, eq(users.id, posts.userId));
// Returns: Array of { users: User, posts: Post | null }

// Relational queries (simpler syntax)
const result = await db.query.users.findMany({
  with: {
    posts: true,
    // Automatically includes related posts
  },
});
// Returns: User[] with nested posts array

// Filtered relations
const usersWithPublishedPosts = await db.query.users.findMany({
  with: {
    posts: {
      where: (posts, { isNotNull }) => isNotNull(posts.publishedAt),
    },
  },
});
```

**Advanced Queries**
```typescript
import { desc, asc, count, avg, sum } from 'drizzle-orm';

// Ordering
const sortedUsers = await db
  .select()
  .from(users)
  .orderBy(desc(users.createdAt), asc(users.name));
// desc(): Descending order
// asc(): Ascending order (multiple sorting)

// Pagination
const page = await db
  .select()
  .from(users)
  .limit(10)
  .offset(20);
// limit: Number of records
// offset: Skip records (for page 3: offset = 20)

// Aggregations
const stats = await db
  .select({
    total: count(),
    avgAge: avg(users.age),
    totalAge: sum(users.age),
  })
  .from(users);

// Subqueries
const activeUsers = db
  .select({ id: users.id })
  .from(users)
  .where(gt(users.age, 18));

const postsFromActiveUsers = await db
  .select()
  .from(posts)
  .where(inArray(posts.userId, activeUsers));
// inArray(): SQL IN operator with subquery
```

**Transactions**
```typescript
// Transaction - all or nothing
await db.transaction(async (tx) => {
  const user = await tx
    .insert(users)
    .values({ name: 'Dave', email: 'dave@test.com' })
    .returning();
  // returning(): Returns inserted record
  
  await tx.insert(posts).values({
    title: 'First post',
    userId: user[0].id,
  });
  
  // If any query fails, all changes rollback
});
```

## Common Pitfalls

- Using JavaScript comparison operators instead of Drizzle operators—must use `eq()`, `gt()`, not `===`, `>`.
- Forgetting `await` on queries—returns Promise, not actual data.
- Not defining relations for relational queries—`db.query` requires relations to be defined separately.
- Comparing wrong types in where clauses—TypeScript helps but runtime errors still possible.
- Not using transactions for multi-step operations—partial updates can occur on failures.
- Confusing schema definition with relations—relations are defined separately from table schemas.
- Using `select()` without `from()`—incomplete query chain causes errors.

## Practical Applications

- **API Backends:** Type-safe database queries in REST/GraphQL APIs with automatic type inference.
- **Data Migrations:** Schema versioning and migrations with automatic SQL generation.
- **Admin Dashboards:** CRUD operations with complex filtering and sorting requirements.
- **Multi-Tenant Apps:** Database-per-tenant or schema-per-tenant with consistent query patterns.

## References

- [Drizzle ORM Documentation](https://orm.drizzle.team/docs/overview)
- [Drizzle Schema Definition](https://orm.drizzle.team/docs/sql-schema-declaration)
- [Drizzle Queries](https://orm.drizzle.team/docs/rqb)
- [Drizzle Kit (Migrations)](https://orm.drizzle.team/kit-docs/overview)

---

## Greater Detail

### Advanced Concepts

- **Schema Columns Types:** `serial`, `integer`, `text`, `varchar`, `boolean`, `json`, `timestamp`, `date`, `real`, `doublePrecision`, custom types.
- **Column Modifiers:** `.notNull()`, `.default()`, `.unique()`, `.primaryKey()`, `.references()`, `.onDelete('cascade')`.
- **Operators:** `eq`, `ne`, `gt`, `gte`, `lt`, `lte`, `like`, `ilike`, `inArray`, `notInArray`, `isNull`, `isNotNull`, `between`, `notBetween`.
- **Logical Operators:** `and()`, `or()`, `not()` for combining conditions.
- **Prepared Statements:** Improve performance with reusable parameterized queries.
  ```typescript
  const prepared = db.select().from(users).where(eq(users.id, placeholder('id'))).prepare();
  await prepared.execute({ id: 1 });
  ```
- **Raw SQL:** Escape hatch for complex queries using `sql` template tag.
  ```typescript
  const result = await db.execute(sql`SELECT * FROM users WHERE age > ${25}`);
  ```
- **Database Introspection:** Generate schema from existing database with `drizzle-kit pull`.
- **Migration Generation:** Auto-generate SQL migrations with `drizzle-kit generate:pg`.
- **Multiple Schemas:** Support for PostgreSQL schemas beyond public schema.
- **Indexes:** Define indexes for query performance optimization.
  ```typescript
  index('email_idx').on(users.email)
  ```
- **Composite Keys:** Multi-column primary keys with `.primaryKey()` on multiple columns.
- **Views:** Define database views with type safety.
- **Enum Types:** PostgreSQL enums with `pgEnum()` for constrained values.
- **JSON Operations:** Query JSON/JSONB columns with type-safe operators.
- **Connection Pooling:** Works with pg, postgres.js, better-sqlite3, mysql2 connection pools.
- **Batch Operations:** `db.batch()` for executing multiple queries efficiently.
- **Upsert:** `onConflictDoUpdate()` for insert-or-update operations.
- **Partial Selects:** Select subset of columns with automatic type narrowing.
- **Query Builder Chaining:** Compose queries incrementally for dynamic filtering.
- **Type-Safe Migrations:** Schema changes tracked with TypeScript types.