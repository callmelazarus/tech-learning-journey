# The N+1 Query Problem: Overview

The **N+1 query problem** occurs when code fetches a list of N items, then executes an additional query *for each item* — resulting in N+1 total queries instead of 1 or 2. It's one of the most common performance killers in web applications, and it's easy to introduce without noticing.

> **Analogy:** You ask a librarian for a list of 10 books. Then you go back to the desk 10 separate times — once per book — to ask who wrote each one. You've made 11 trips. One trip with all 10 books would have done it.

---

## The Problem

```js
// Fetch all posts — 1 query
const posts = await db.query('SELECT * FROM posts');

// Then for each post, fetch its author — N queries
for (const post of posts) {
  post.author = await db.query(
    'SELECT * FROM users WHERE id = $1', [post.userId]
  );
}
```

If there are 100 posts, this runs **101 queries**. At 1,000 posts, it's 1,001 queries. The database round-trip cost stacks up fast.

---

## Why It's Easy to Miss

N+1 problems are invisible in development — you're usually working with a handful of records. It only surfaces under real data volume, making it a classic "works on my machine" issue that hits production hard.

ORMs make it especially sneaky:

```js
// Sequelize — looks innocent, is N+1
const posts = await Post.findAll();
for (const post of posts) {
  const author = await post.getUser(); // fires a query every iteration
}
```

---

## The Fix: Eager Loading / Joins

The solution is to fetch related data in the same query — or in one additional batched query — rather than one query per item.

### Option 1 — SQL JOIN (one query total)

```sql
SELECT posts.*, users.name AS author_name
FROM posts
JOIN users ON users.id = posts.user_id;
```

```js
// One query, all data included
const posts = await db.query(`
  SELECT posts.*, users.name AS author_name
  FROM posts
  JOIN users ON users.id = posts.user_id
`);
```

### Option 2 — Eager Loading in an ORM

```js
// Sequelize — include association upfront
const posts = await Post.findAll({
  include: [{ model: User, as: 'author' }]
});
// 1 query (or 2 at most) — not N+1
```

```js
// Prisma — use `include`
const posts = await prisma.post.findMany({
  include: { author: true }
});
```

### Option 3 — Batch Query (DataLoader pattern)

Instead of one query per item, collect all the IDs and fetch them in one round trip:

```js
// ❌ N queries
for (const post of posts) {
  post.author = await getUser(post.userId);
}

// ✅ 1 query — batch all IDs together
const userIds = posts.map(p => p.userId);
const users = await db.query(
  'SELECT * FROM users WHERE id = ANY($1)', [userIds]
);
const userMap = Object.fromEntries(users.map(u => [u.id, u]));
posts.forEach(p => p.author = userMap[p.userId]);
```

This is exactly what **DataLoader** (popularized by GraphQL) automates — it batches and deduplicates queries within a single request tick.

---

## N+1 in GraphQL

GraphQL is especially prone to N+1 because each field resolver runs independently:

```js
// Each post resolver triggers a separate user query
const resolvers = {
  Post: {
    author: (post) => db.getUser(post.userId) // called once per post
  }
};
```

**DataLoader** is the standard fix:

```js
const userLoader = new DataLoader(async (userIds) => {
  const users = await db.query(
    'SELECT * FROM users WHERE id = ANY($1)', [userIds]
  );
  return userIds.map(id => users.find(u => u.id === id));
});

const resolvers = {
  Post: {
    author: (post) => userLoader.load(post.userId) // batched automatically
  }
};
```

DataLoader collects all `load()` calls within the same event loop tick and fires a single batched query for all of them.

---

## How to Detect N+1

- **Query logging** — enable SQL logging in development and watch for repeated identical queries with different IDs.
- **Bullet gem (Ruby on Rails)** — alerts you to N+1 queries at runtime during development.
- **`sequelize-log`** / Prisma `log: ['query']`** — log all queries to spot patterns.
- **APM tools** — New Relic, Datadog, and Scout all surface N+1 patterns in production traces.

```js
// Prisma query logging
const prisma = new PrismaClient({ log: ['query'] });
// watch the console — repeated queries with different IDs = N+1
```

---

## Common Pitfalls

- **Lazy loading in a loop** — any `await` inside a `for` loop that hits the DB is a red flag.
- **Forgetting nested relations** — you fixed post → author, but now post → comments → author is N+1 again.
- **Over-eager loading** — the opposite problem: loading deeply nested associations you don't need bloats the query and response. Fetch only what the endpoint actually uses.
- **Hidden N+1 in serializers** — transforming a list of objects into JSON can silently trigger lazy loads if your serializer accesses unloaded relations.

---

## Quick Mental Check

Before any loop that touches a database, ask: **"Could I fetch all of this in one query instead?"** If yes — do it.

---

## References

- [DataLoader GitHub](https://github.com/graphql/dataloader)
- [Prisma: Solving N+1](https://www.prisma.io/docs/guides/performance-and-optimization/query-optimization-performance)
- [Sequelize: Eager Loading](https://sequelize.org/docs/v6/advanced-association-concepts/eager-loading/)