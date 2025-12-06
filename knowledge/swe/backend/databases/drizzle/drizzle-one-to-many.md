# Drizzle ORM One-to-One Relationships: Complete Overview

Drizzle is a TypeScript ORM (Object-Relational Mapping) that lets you define database schemas and relationships using TypeScript code instead of writing raw SQL. A one-to-one relationship means one record in Table A connects to exactly one record in Table B—like one user having exactly one account profile. Think of it like a marriage certificate—each person has exactly one certificate, and each certificate belongs to exactly one person.

## Key Points

- **One-to-One:** Each user has exactly one account, each account belongs to one user
- **Foreign Key:** Column in one table that references primary key in another table
- **Schema Definition:** Use `relations()` to define how tables connect
- **Type Safety:** Drizzle generates TypeScript types from your schema
- **Queries:** Use `.with()` to fetch related data in one query

## Step-by-Step Explanation & Examples

1. **Database Concept: Tables and Primary Keys**

   ```
   Imagine a filing cabinet with two drawers:
   
   Drawer 1 (Users Table):
   ┌────┬────────┬───────────────────┐
   │ id │ name   │ email             │
   ├────┼────────┼───────────────────┤
   │ 1  │ Alice  │ alice@example.com │
   │ 2  │ Bob    │ bob@example.com   │
   └────┴────────┴───────────────────┘
   
   Drawer 2 (Accounts Table):
   ┌────┬─────────┬──────────┬────────┐
   │ id │ userId  │ provider │ token  │
   ├────┼─────────┼──────────┼────────┤
   │ 10 │ 1       │ google   │ abc123 │
   │ 11 │ 2       │ github   │ xyz789 │
   └────┴─────────┴──────────┴────────┘
   
   Primary Key (id): Unique identifier for each row
   Foreign Key (userId): References id in Users table
   
   Relationship: Account with userId=1 belongs to User with id=1
   ```

2. **Basic Drizzle Setup**

   ```typescript
   // db/schema.ts
   import { pgTable, serial, text, integer } from 'drizzle-orm/pg-core';
   
   // Users table definition
   export const users = pgTable('users', {
     id: serial('id').primaryKey(),           // Auto-incrementing ID
     name: text('name').notNull(),            // Required text field
     email: text('email').notNull().unique()  // Required, must be unique
   });
   
   // Accounts table definition
   export const accounts = pgTable('accounts', {
     id: serial('id').primaryKey(),
     userId: integer('user_id').notNull(),    // Foreign key to users.id
     provider: text('provider').notNull(),    // e.g., 'google', 'github'
     token: text('token').notNull()
   });
   ```

3. **Defining One-to-One Relationship**

   ```typescript
   // db/schema.ts
   import { pgTable, serial, text, integer } from 'drizzle-orm/pg-core';
   import { relations } from 'drizzle-orm';
   
   export const users = pgTable('users', {
     id: serial('id').primaryKey(),
     name: text('name').notNull(),
     email: text('email').notNull().unique()
   });
   
   export const accounts = pgTable('accounts', {
     id: serial('id').primaryKey(),
     userId: integer('user_id')
       .notNull()
       .references(() => users.id),  // ← Foreign key reference
     provider: text('provider').notNull(),
     token: text('token').notNull()
   });
   
   // Define relationships
   export const usersRelations = relations(users, ({ one }) => ({
     account: one(accounts, {
       fields: [users.id],           // This table's field
       references: [accounts.userId] // References account's userId
     })
   }));
   
   export const accountsRelations = relations(accounts, ({ one }) => ({
     user: one(users, {
       fields: [accounts.userId],    // This table's field
       references: [users.id]        // References user's id
     })
   }));
   ```

4. **Database Connection Setup**

   ```typescript
   // db/index.ts
   import { drizzle } from 'drizzle-orm/node-postgres';
   import { Pool } from 'pg';
   import * as schema from './schema';
   
   // Create PostgreSQL connection pool
   const pool = new Pool({
     host: 'localhost',
     port: 5432,
     user: 'postgres',
     password: 'password',
     database: 'myapp'
   });
   
   // Create Drizzle instance with schema
   export const db = drizzle(pool, { schema });
   ```

5. **Creating Records (Insert)**

   ```typescript
   import { db } from './db';
   import { users, accounts } from './db/schema';
   
   // Create a user
   async function createUser() {
     const [newUser] = await db
       .insert(users)
       .values({
         name: 'Alice',
         email: 'alice@example.com'
       })
       .returning(); // Returns the created user with id
     
     console.log('Created user:', newUser);
     // { id: 1, name: 'Alice', email: 'alice@example.com' }
     
     return newUser;
   }
   
   // Create an account for the user
   async function createAccount(userId: number) {
     const [newAccount] = await db
       .insert(accounts)
       .values({
         userId: userId,        // Links to user
         provider: 'google',
         token: 'abc123xyz'
       })
       .returning();
     
     console.log('Created account:', newAccount);
     // { id: 10, userId: 1, provider: 'google', token: 'abc123xyz' }
     
     return newAccount;
   }
   
   // Usage
   const user = await createUser();
   const account = await createAccount(user.id);
   ```

6. **Querying with Relationships (Join)**

   ```typescript
   import { db } from './db';
   import { users } from './db/schema';
   import { eq } from 'drizzle-orm';
   
   // Get user with their account
   async function getUserWithAccount(userId: number) {
     const result = await db.query.users.findFirst({
       where: eq(users.id, userId),
       with: {
         account: true  // Include related account
       }
     });
     
     console.log(result);
     /* {
       id: 1,
       name: 'Alice',
       email: 'alice@example.com',
       account: {
         id: 10,
         userId: 1,
         provider: 'google',
         token: 'abc123xyz'
       }
     } */
     
     return result;
   }
   
   // Get account with its user
   async function getAccountWithUser(accountId: number) {
     const result = await db.query.accounts.findFirst({
       where: eq(accounts.id, accountId),
       with: {
         user: true  // Include related user
       }
     });
     
     return result;
     /* {
       id: 10,
       userId: 1,
       provider: 'google',
       token: 'abc123xyz',
       user: {
         id: 1,
         name: 'Alice',
         email: 'alice@example.com'
       }
     } */
   }
   ```

7. **Updating and Deleting**

   ```typescript
   import { db } from './db';
   import { users, accounts } from './db/schema';
   import { eq } from 'drizzle-orm';
   
   // Update user
   async function updateUser(userId: number, newName: string) {
     const [updated] = await db
       .update(users)
       .set({ name: newName })
       .where(eq(users.id, userId))
       .returning();
     
     return updated;
   }
   
   // Delete account (must delete child before parent)
   async function deleteUserAndAccount(userId: number) {
     // Delete account first (has foreign key to user)
     await db
       .delete(accounts)
       .where(eq(accounts.userId, userId));
     
     // Then delete user
     await db
       .delete(users)
       .where(eq(users.id, userId));
     
     console.log('Deleted user and account');
   }
   
   // Alternative: Use CASCADE in schema to auto-delete
   export const accounts = pgTable('accounts', {
     id: serial('id').primaryKey(),
     userId: integer('user_id')
       .notNull()
       .references(() => users.id, { onDelete: 'cascade' })  // ← Auto-delete
   });
   ```

## Common Pitfalls

- Forgetting `.references()` when defining foreign keys (relationship won't work)
- Not using `.returning()` after insert (can't get the created record's id)
- Trying to delete parent before child (foreign key constraint violation)
- Not defining `relations()` separately (queries won't include related data)
- Using wrong field names in relations (must match exactly)
- Forgetting to import schema when creating db instance

## Practical Applications

- User authentication (user + account provider like Google/GitHub)
- User profiles (user + extended profile data)
- Shopping cart (user + single active cart)
- Settings (user + preferences)
- Subscription (user + subscription details)

## References

- [Drizzle ORM Documentation](https://orm.drizzle.team/docs/overview)
- [Drizzle Relations](https://orm.drizzle.team/docs/rqb#relations)
- [PostgreSQL Foreign Keys](https://www.postgresql.org/docs/current/ddl-constraints.html#DDL-CONSTRAINTS-FK)
- [Database Normalization Basics](https://en.wikipedia.org/wiki/Database_normalization)

---

## Greater Detail

### Advanced Concepts

- **Foreign Key Constraints Explained:**
  ```typescript
  // Without foreign key (❌ Bad - no enforcement)
  userId: integer('user_id').notNull()
  // Can insert userId=999 even if user doesn't exist
  
  // With foreign key (✅ Good - database enforces)
  userId: integer('user_id')
    .notNull()
    .references(() => users.id)
  // Database will reject userId=999 if user doesn't exist
  
  // With cascade delete
  userId: integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' })
  // When user is deleted, their account is automatically deleted
  
  // Options:
  // - cascade: Delete child when parent deleted
  // - set null: Set foreign key to null when parent deleted
  // - restrict: Prevent parent deletion if child exists (default)
  // - no action: Similar to restrict
  ```

- **Primary Key vs Foreign Key:**
  ```typescript
  // PRIMARY KEY: Unique identifier for THIS table
  export const users = pgTable('users', {
     id: serial('id').primaryKey(),  // ← Primary key
     // Each user has unique id: 1, 2, 3, 4...
   });
   
   // FOREIGN KEY: Points to primary key in ANOTHER table
   export const accounts = pgTable('accounts', {
     id: serial('id').primaryKey(),     // ← Primary key (for accounts)
     userId: integer('user_id')
       .references(() => users.id)      // ← Foreign key (points to users)
     // userId must match an existing user.id
   });
   
   Analogy:
   - Primary key = Your passport number (unique to you)
   - Foreign key = Emergency contact's passport number (must exist)
   ```

- **One-to-One vs One-to-Many:**
  ```typescript
  // ONE-TO-ONE: User has ONE account
  export const usersRelations = relations(users, ({ one }) => ({
     account: one(accounts)  // ← "one" means single account
   }));
   
   // ONE-TO-MANY: User has MANY posts
   export const usersRelations = relations(users, ({ many }) => ({
     posts: many(posts)  // ← "many" means multiple posts
   }));
   
   Database difference:
   ONE-TO-ONE: Foreign key has UNIQUE constraint
   export const accounts = pgTable('accounts', {
     userId: integer('user_id')
       .notNull()
       .unique()  // ← Enforces one account per user
       .references(() => users.id)
   });
   
   ONE-TO-MANY: No unique constraint (multiple posts can have same userId)
   export const posts = pgTable('posts', {
     userId: integer('user_id')
       .notNull()
       .references(() => users.id)
     // No .unique() - same user can have many posts
   });
   ```

- **Type Safety in Action:**
  ```typescript
   import { db } from './db';
   import { users, accounts } from './db/schema';
   
   // Drizzle infers types from schema
   async function example() {
     const user = await db.query.users.findFirst({
       with: { account: true }
     });
     
     // TypeScript knows exact structure:
     user?.id         // ✅ number
     user?.name       // ✅ string
     user?.email      // ✅ string
     user?.account    // ✅ { id: number; userId: number; ... } | null
     user?.invalid    // ❌ TypeScript error: Property doesn't exist
     
     // Insert also type-checked
     await db.insert(users).values({
       name: 'Bob',
       email: 'bob@example.com',
       age: 30  // ❌ Error: age doesn't exist in schema
     });
   }
   ```

- **Migration (Creating Tables in Database):**
  ```typescript
   // Install: npm install drizzle-kit
   
   // drizzle.config.ts
   import type { Config } from 'drizzle-kit';
   
   export default {
     schema: './db/schema.ts',
     out: './drizzle',
     driver: 'pg',
     dbCredentials: {
       connectionString: process.env.DATABASE_URL!
     }
   } satisfies Config;
   
   // Generate migration SQL
   // $ npx drizzle-kit generate:pg
   
   // Creates file: drizzle/0000_migration.sql
   CREATE TABLE "users" (
     "id" SERIAL PRIMARY KEY,
     "name" TEXT NOT NULL,
     "email" TEXT NOT NULL UNIQUE
   );
   
   CREATE TABLE "accounts" (
     "id" SERIAL PRIMARY KEY,
     "user_id" INTEGER NOT NULL REFERENCES "users"("id"),
     "provider" TEXT NOT NULL,
     "token" TEXT NOT NULL
   );
   
   // Apply migration to database
   // $ npx drizzle-kit push:pg
   ```

- **Complex Queries:**
  ```typescript
   import { db } from './db';
   import { users, accounts } from './db/schema';
   import { eq, like } from 'drizzle-orm';
   
   // Find users by email pattern with their accounts
   async function findUsersByDomain(domain: string) {
     return await db.query.users.findMany({
       where: like(users.email, `%@${domain}`),
       with: { account: true }
     });
   }
   
   // Count users with Google accounts
   async function countGoogleUsers() {
     const result = await db
       .select({ count: sql`count(*)` })
       .from(users)
       .innerJoin(accounts, eq(users.id, accounts.userId))
       .where(eq(accounts.provider, 'google'));
     
     return result[0].count;
   }
   
   // Get all users, even those without accounts (LEFT JOIN)
   async function getAllUsersWithOptionalAccount() {
     return await db.query.users.findMany({
       with: { account: true }
     });
     // Users without accounts will have account: null
   }
   ```

- **Transaction Example:**
  ```typescript
   import { db } from './db';
   import { users, accounts } from './db/schema';
   
   // Create user and account atomically (all or nothing)
   async function createUserWithAccount(
     userData: { name: string; email: string },
     accountData: { provider: string; token: string }
   ) {
     return await db.transaction(async (tx) => {
       // Insert user
       const [user] = await tx
         .insert(users)
         .values(userData)
         .returning();
       
       // Insert account
       const [account] = await tx
         .insert(accounts)
         .values({
           userId: user.id,
           ...accountData
         })
         .returning();
       
       // If any step fails, both are rolled back
       return { user, account };
     });
   }
   
   // Usage
   try {
     const result = await createUserWithAccount(
       { name: 'Charlie', email: 'charlie@example.com' },
       { provider: 'github', token: 'token123' }
     );
     console.log('Created:', result);
   } catch (error) {
     console.error('Transaction failed, nothing created');
   }
   ```

- **Real-World Complete Example:**
  ```typescript
   // db/schema.ts
   import { pgTable, serial, text, integer, timestamp } from 'drizzle-orm/pg-core';
   import { relations } from 'drizzle-orm';
   
   export const users = pgTable('users', {
     id: serial('id').primaryKey(),
     name: text('name').notNull(),
     email: text('email').notNull().unique(),
     createdAt: timestamp('created_at').defaultNow().notNull()
   });
   
   export const accounts = pgTable('accounts', {
     id: serial('id').primaryKey(),
     userId: integer('user_id')
       .notNull()
       .unique()  // ← Enforces one-to-one
       .references(() => users.id, { onDelete: 'cascade' }),
     provider: text('provider').notNull(),
     providerAccountId: text('provider_account_id').notNull(),
     accessToken: text('access_token'),
     refreshToken: text('refresh_token'),
     createdAt: timestamp('created_at').defaultNow().notNull()
   });
   
   export const usersRelations = relations(users, ({ one }) => ({
     account: one(accounts, {
       fields: [users.id],
       references: [accounts.userId]
     })
   }));
   
   export const accountsRelations = relations(accounts, ({ one }) => ({
     user: one(users, {
       fields: [accounts.userId],
       references: [users.id]
     })
   }));
   
   // services/auth.ts
   import { db } from '../db';
   import { users, accounts } from '../db/schema';
   import { eq } from 'drizzle-orm';
   
   export async function createUserWithGoogleAccount(googleProfile: any) {
     return await db.transaction(async (tx) => {
       // Check if user exists
       const existingUser = await tx.query.users.findFirst({
         where: eq(users.email, googleProfile.email),
         with: { account: true }
       });
       
       if (existingUser) {
         return existingUser;
       }
       
       // Create new user
       const [newUser] = await tx
         .insert(users)
         .values({
           name: googleProfile.name,
           email: googleProfile.email
         })
         .returning();
       
       // Create account
       const [newAccount] = await tx
         .insert(accounts)
         .values({
           userId: newUser.id,
           provider: 'google',
           providerAccountId: googleProfile.id,
           accessToken: googleProfile.accessToken
         })
         .returning();
       
       return { ...newUser, account: newAccount };
     });
   }
   
   export async function getUserProfile(userId: number) {
     return await db.query.users.findFirst({
       where: eq(users.id, userId),
       with: { account: true }
     });
   }
   ```

- **Best Practices Summary:**
  ```typescript
   // ✅ Good practices:
   
   // 1. Always use foreign keys with references
   userId: integer('user_id')
     .notNull()
     .references(() => users.id)
   
   // 2. Add unique constraint for one-to-one
   userId: integer('user_id')
     .notNull()
     .unique()
     .references(() => users.id)
   
   // 3. Use cascade for dependent data
   .references(() => users.id, { onDelete: 'cascade' })
   
   // 4. Define relations separately
   export const usersRelations = relations(users, ({ one }) => ({
     account: one(accounts)
   }));
   
   // 5. Use transactions for multi-step operations
   await db.transaction(async (tx) => {
     // Multiple operations
   });
   
   // 6. Use .returning() to get created records
   const [user] = await db.insert(users).values({...}).returning();
   
   // 7. Use proper naming conventions
   // Table: plural, lowercase (users, accounts)
   // Column: snake_case (user_id, created_at)
   ```