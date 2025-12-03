# URL Parameter Types: Complete Overview

URL parameters are different methods of passing data through URLs to servers or applications. The main types are path parameters (embedded in the URL path), query parameters (key-value pairs after `?`), and fragments (after `#` for client-side routing). Understanding when to use each type ensures clean, RESTful API design and proper data handling. Think of them like different ways to address a letter—path parameters are the street address (required location), query parameters are delivery instructions (optional filters), and fragments are notes for the recipient (client-side only).

## Key Points

- **Path Parameters:** `/users/:id` - Required, identify specific resources
- **Query Parameters:** `/users?role=admin` - Optional, filter/modify results
- **Fragments:** `/page#section` - Client-side only, not sent to server
- **Matrix Parameters:** `/users;role=admin` - Rare, alternative to query params
- **Body Parameters:** POST/PUT request body - For large/sensitive data

## Step-by-Step Explanation & Examples

1. **Path Parameters (Resource Identification)**

   ```
   URL Pattern: /users/:id/posts/:postId
   Example: /users/123/posts/456
   
   Express.js:
   app.get('/users/:id/posts/:postId', (req, res) => {
     const userId = req.params.id;        // '123'
     const postId = req.params.postId;    // '456'
   });
   
   React Router:
   <Route path="/users/:id" element={<UserProfile />} />
   
   function UserProfile() {
     const { id } = useParams();  // Access path param
   }
   
   Use when: Identifying specific resources (user ID, product ID)
   ```

2. **Query Parameters (Filtering/Options)**

   ```
   URL: /products?category=electronics&minPrice=100&sort=price&order=asc
   
   Express.js:
   app.get('/products', (req, res) => {
     const category = req.query.category;    // 'electronics'
     const minPrice = req.query.minPrice;    // '100'
     const sort = req.query.sort;            // 'price'
   });
   
   JavaScript (Building):
   const params = new URLSearchParams({
     category: 'electronics',
     minPrice: 100,
     sort: 'price'
   });
   fetch(`/products?${params}`);
   
   Use when: Optional filters, pagination, sorting, search
   ```

3. **Combining Path and Query Parameters**

   ```
   URL: /users/123/orders?status=pending&page=2
   
   Express.js:
   app.get('/users/:userId/orders', (req, res) => {
     const userId = req.params.userId;     // '123' (required)
     const status = req.query.status;      // 'pending' (optional)
     const page = req.query.page || 1;     // '2' with default
   });
   
   Pattern: Path params identify resource, query params filter it
   ```

4. **Fragment/Hash Parameters (Client-Side Only)**

   ```
   URL: /docs#getting-started
   URL: /page#section-2
   
   JavaScript:
   // Fragments NOT sent to server
   window.location.hash;           // '#getting-started'
   
   React Router:
   <Link to="/docs#api">API Docs</Link>
   
   useEffect(() => {
     const hash = window.location.hash.substring(1);
     const element = document.getElementById(hash);
     element?.scrollIntoView();
   }, []);
   
   Use when: In-page navigation, client-side routing, scroll positions
   Note: Never reaches server - browser only
   ```

5. **Matrix Parameters (Semicolon-Separated)**

   ```
   URL: /products;color=red;size=large/reviews
   
   Express (requires custom parsing):
   // Less common, mainly in Java/Spring
   
   Angular Router:
   this.router.navigate(['/products', {color: 'red', size: 'large'}]);
   // Generates: /products;color=red;size=large
   
   Use when: Multiple parameters for same path segment (rare in practice)
   ```

6. **Body Parameters (POST/PUT Requests)**

   ```
   // Not in URL - sent in request body
   fetch('/api/users', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({
       name: 'Alice',
       email: 'alice@example.com',
       password: 'secret123'
     })
   });
   
   Express.js:
   app.post('/api/users', (req, res) => {
     const { name, email, password } = req.body;
   });
   
   Use when: Creating/updating resources, sensitive data, large payloads
   ```

## Common Pitfalls

- Using query params for resource identification (`/users?id=123` ❌ → `/users/123` ✅)
- Putting sensitive data in query params (logged in URLs, visible in browser history)
- Forgetting to URL-encode special characters in query params
- Assuming fragments are sent to server (they're client-side only)
- Using path params for optional filters (makes routing complex)
- Not validating/sanitizing parameters (security risk)

## Practical Applications

- RESTful APIs (path params for resources, query for filters)
- Pagination and sorting (query params: `?page=2&limit=20&sort=date`)
- Search functionality (query params: `?q=javascript&category=tutorials`)
- Single-page app routing (fragments for client-side navigation)
- Analytics tracking (query params: `?utm_source=google&utm_campaign=spring`)

## References

- [MDN: URL API](https://developer.mozilla.org/en-US/docs/Web/API/URL)
- [RFC 3986: URI Syntax](https://www.rfc-editor.org/rfc/rfc3986)
- [Express.js: Routing](https://expressjs.com/en/guide/routing.html)
- [REST API Best Practices](https://restfulapi.net/resource-naming/)

---

## Greater Detail

### Advanced Concepts

- **RESTful URL Design Patterns:**
  ```
  ✅ Good REST design:
  GET    /users              → List all users
  GET    /users/123          → Get specific user (path param)
  GET    /users?role=admin   → Filter users (query param)
  GET    /users/123/posts    → User's posts (nested resource)
  POST   /users              → Create user (data in body)
  PUT    /users/123          → Update user (data in body)
  DELETE /users/123          → Delete user
  
  ❌ Bad REST design:
  GET /getUser?id=123        → Don't use verbs in path
  GET /users?action=delete   → Don't use query for actions
  POST /users/123/delete     → Use DELETE method instead
  ```

- **Parameter Priority and Override:**
  ```
  URL: /api/users/123?id=456
  
  // Path parameter takes precedence
  app.get('/api/users/:id', (req, res) => {
    const pathId = req.params.id;      // '123' (use this)
    const queryId = req.query.id;      // '456' (ignore)
  });
  
  Rule: Path params > Query params when both present
  ```

- **Array Values in Different Parameter Types:**
  ```
  Path params (not ideal for arrays):
  /users/1,2,3/messages  ❌ Hard to parse
  
  Query params (multiple approaches):
  /products?ids=1,2,3              → Comma-separated
  /products?ids[]=1&ids[]=2&ids[]=3 → Array notation
  /products?ids=1&ids=2&ids=3      → Repeated keys
  
  Express parsing:
  app.get('/products', (req, res) => {
    const ids = req.query.ids;  // ['1', '2', '3'] or '1,2,3'
    const idsArray = Array.isArray(ids) 
      ? ids 
      : ids.split(',');
  });
  ```

- **OpenAPI/Swagger Parameter Types:**
  ```yaml
  # Path parameter
  /users/{userId}:
    get:
      parameters:
        - name: userId
          in: path          # 'path' location
          required: true
          schema:
            type: integer
  
  # Query parameter
  /products:
    get:
      parameters:
        - name: category
          in: query         # 'query' location
          required: false
          schema:
            type: string
  
  # Header parameter
  parameters:
    - name: X-API-Key
      in: header          # 'header' location
      required: true
  
  # Cookie parameter
  parameters:
    - name: sessionId
      in: cookie          # 'cookie' location
  ```

- **TypeScript Type Safety:**
  ```typescript
  // Path params with type safety
  type UserRouteParams = {
    userId: string;
  };
  
  // React Router
  const { userId } = useParams<UserRouteParams>();
  
  // Express with TypeScript
  interface RequestParams {
    id: string;
  }
  
  interface RequestQuery {
    status?: string;
    page?: string;
  }
  
  app.get('/users/:id', (
    req: Request<RequestParams, {}, {}, RequestQuery>,
    res: Response
  ) => {
    const id = req.params.id;        // Type: string
    const status = req.query.status; // Type: string | undefined
  });
  ```

- **Security Considerations:**
  ```
  ❌ Avoid in URLs (visible in logs, history):
  /login?password=secret123
  /api/users?apiKey=xyz789
  /checkout?creditCard=1234567890
  
  ✅ Use request body or headers instead:
  POST /login
  Body: { username: 'alice', password: 'secret123' }
  
  Headers: { 'Authorization': 'Bearer token123' }
  
  Safe for URLs:
  - Public IDs (user IDs, product IDs)
  - Filter criteria (categories, dates)
  - Pagination (page numbers)
  - Non-sensitive search terms
  ```

- **Encoding and Decoding:**
  ```javascript
  // Manual encoding
  const search = 'coffee & tea';
  const encoded = encodeURIComponent(search);
  // 'coffee%20%26%20tea'
  
  fetch(`/search?q=${encoded}`);
  
  // URLSearchParams handles automatically
  const params = new URLSearchParams({
    q: 'coffee & tea',
    category: 'drinks/hot'
  });
  // q=coffee+%26+tea&category=drinks%2Fhot
  
  // Decoding (Express does automatically)
  const decoded = decodeURIComponent('coffee%20%26%20tea');
  // 'coffee & tea'
  ```

- **Parameter Validation:**
  ```typescript
  // Express with validation middleware
  import { param, query, validationResult } from 'express-validator';
  
  app.get('/users/:id',
    param('id').isInt().toInt(),
    query('page').optional().isInt().toInt(),
    query('limit').optional().isInt().toInt().custom(val => val <= 100),
    (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      
      const id = req.params.id;     // Validated integer
      const page = req.query.page || 1;
      const limit = req.query.limit || 10;
    }
  );
  ```

- **Real-World Comparison:**
  ```
  GitHub API Examples:
  
  Path params (resource identification):
  GET /repos/:owner/:repo
  → /repos/facebook/react
  
  Query params (filtering/pagination):
  GET /repos/:owner/:repo/issues?state=open&page=2&per_page=50
  
  Combined:
  GET /search/repositories?q=language:javascript&sort=stars&order=desc
  
  Stripe API Examples:
  
  Path params:
  GET /v1/customers/:id
  → /v1/customers/cus_123abc
  
  Query params (expansion):
  GET /v1/charges?customer=cus_123&limit=10
  
  Body params (creating):
  POST /v1/customers
  Body: { email: 'user@example.com', name: 'Alice' }
  ```

- **Best Practices Summary:**
  ```
  Path Parameters:
  ✅ Required resource identifiers
  ✅ Hierarchical relationships (/users/123/posts/456)
  ✅ RESTful resource paths
  ❌ Optional filters or metadata
  ❌ Lists or arrays
  
  Query Parameters:
  ✅ Optional filters and search
  ✅ Pagination (page, limit, offset)
  ✅ Sorting (sort, order)
  ✅ Multiple values (tags, categories)
  ❌ Required resource identifiers
  ❌ Sensitive data
  
  Body Parameters:
  ✅ Creating/updating resources
  ✅ Sensitive data (passwords, tokens)
  ✅ Large payloads (file uploads, complex objects)
  ✅ Structured data (nested objects, arrays)
  ❌ Simple GET requests
  ❌ Idempotent operations better suited for URL
  
  Fragments:
  ✅ Client-side navigation
  ✅ Scroll positions
  ✅ SPA routing
  ❌ Server-side logic (not sent to server)
  ❌ SEO-critical content
  ```