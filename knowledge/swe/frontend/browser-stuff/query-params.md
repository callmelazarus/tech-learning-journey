# URL Query Parameters: Complete Overview

Query parameters (query strings) are key-value pairs appended to a URL after a `?` symbol, used to send additional data to a server without modifying the URL path. They enable filtering, sorting, pagination, and customization of API responses or web pages. Think of them as optional settings you attach to a request—like adding filters to a camera lens to change what you capture.

## Key Points

- **Format:** `?key1=value1&key2=value2` appended to URL
- **Purpose:** Pass data to server for filtering, searching, sorting, pagination
- **Encoding:** Special characters must be URL-encoded (`%20` for space)
- **Optional:** Usually optional parameters (unlike path params which are required)
- **Access:** Retrieved server-side via request object, client-side via `URLSearchParams`

## Step-by-Step Explanation & Examples

1. **Basic Query Parameter**

   ```js
   // URL
   https://api.example.com/products?category=electronics
   
   // Express.js (server)
   app.get('/products', (req, res) => {
     const category = req.query.category; // 'electronics'
     // Filter products by category
   });
   
   // Fetch API (client)
   fetch('https://api.example.com/products?category=electronics');
   ```

2. **Multiple Query Parameters**

   ```js
   // URL
   https://api.example.com/products?category=electronics&minPrice=100&maxPrice=500
   
   // JavaScript (parsing)
   const url = new URL('https://api.example.com/products?category=electronics&minPrice=100');
   const params = new URLSearchParams(url.search);
   console.log(params.get('category')); // 'electronics'
   console.log(params.get('minPrice')); // '100'
   ```

3. **Pagination with Query Params**

   ```js
   // URL pattern
   https://api.example.com/users?page=2&limit=20
   
   // Express.js implementation
   app.get('/users', (req, res) => {
     const page = parseInt(req.query.page) || 1;
     const limit = parseInt(req.query.limit) || 10;
     const offset = (page - 1) * limit;
     
     // SELECT * FROM users LIMIT 20 OFFSET 20
     const users = db.users.findMany({ skip: offset, take: limit });
     res.json(users);
   });
   ```

4. **Building Query Strings Programmatically**

   ```js
   // Using URLSearchParams
   const params = new URLSearchParams({
     search: 'laptop',
     sort: 'price',
     order: 'asc'
   });
   
   fetch(`https://api.example.com/products?${params.toString()}`);
   // https://api.example.com/products?search=laptop&sort=price&order=asc
   
   // React example
   const [filters, setFilters] = useState({ category: 'books', minPrice: 10 });
   
   useEffect(() => {
     const params = new URLSearchParams(filters);
     fetch(`/api/products?${params}`);
   }, [filters]);
   ```

5. **Array Values in Query Params**

   ```js
   // Multiple values for same key
   https://api.example.com/products?tags=sale&tags=featured&tags=new
   
   // Express.js (returns array automatically)
   app.get('/products', (req, res) => {
     const tags = req.query.tags; // ['sale', 'featured', 'new']
   });
   
   // Alternative formats
   ?ids=1,2,3          // Comma-separated
   ?ids[]=1&ids[]=2    // Array notation
   ?filters={"color":"red","size":"M"}  // JSON (needs encoding)
   ```

6. **URL Encoding Special Characters**

   ```js
   // Manual encoding
   const search = 'coffee & tea';
   const encoded = encodeURIComponent(search);
   // 'coffee%20%26%20tea'
   
   fetch(`/api/search?q=${encoded}`);
   
   // URLSearchParams handles encoding automatically
   const params = new URLSearchParams({ q: 'coffee & tea' });
   // Automatically becomes: q=coffee+%26+tea
   ```

## Common Pitfalls

- Forgetting to URL-encode special characters (`&`, `=`, `?`, spaces, `#`)
- Not validating/sanitizing query params (security risk: SQL injection, XSS)
- Using query params for sensitive data (they appear in URLs, logs, browser history)
- Treating query values as correct types (they're always strings—convert manually)
- Not handling missing/undefined query params gracefully
- Building query strings with string concatenation instead of `URLSearchParams`

## Practical Applications

- Search and filtering (e-commerce product filters, search results)
- Pagination and sorting (data tables, infinite scroll)
- Analytics and tracking (UTM parameters: `?utm_source=google&utm_campaign=spring`)
- API versioning and feature flags (`?api_version=2&beta=true`)
- Sharing application state (shareable filtered views, map coordinates)

## References

- [MDN: URLSearchParams](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams)
- [MDN: encodeURIComponent](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent)
- [Express.js: req.query](https://expressjs.com/en/api.html#req.query)
- [RFC 3986: URI Syntax](https://www.rfc-editor.org/rfc/rfc3986)

---

## Greater Detail

### Advanced Concepts

- **Query Params vs Path Params:**
  - **Path params:** `/users/:id` - Required, identify specific resources (`/users/123`)
  - **Query params:** `/users?role=admin` - Optional, filter/modify results
  - Use path params for resource identification, query params for optional filtering

- **Nested Objects in Query Strings:**
  ```js
  // qs library (popular for complex params)
  import qs from 'qs';
  
  const params = qs.stringify({
    filter: { status: 'active', role: 'admin' },
    sort: { createdAt: 'desc' }
  });
  // filter[status]=active&filter[role]=admin&sort[createdAt]=desc
  
  // Server parsing
  const parsed = qs.parse(queryString);
  // { filter: { status: 'active', role: 'admin' }, sort: { createdAt: 'desc' } }
  ```

- **Security Considerations:**
  - Never pass passwords, tokens, or sensitive data in query params
  - Always validate and sanitize input to prevent injection attacks
  - Be aware query params are logged in server logs and browser history
  - Use POST with request body for sensitive/large data

- **Performance & Caching:**
  - Query params affect browser and CDN caching (different params = different cache entries)
  - Keep query strings short for better caching and URL sharing
  - Use consistent param ordering for cache efficiency

- **Best Practices:**
  ```js
  // ✅ Good: Descriptive, consistent naming
  /api/products?category=electronics&sortBy=price&order=asc&page=1
  
  // ❌ Bad: Unclear, inconsistent
  /api/products?cat=elec&s=p&o=a&pg=1
  
  // ✅ Good: Type conversion and defaults
  const page = parseInt(req.query.page) || 1;
  const limit = Math.min(parseInt(req.query.limit) || 10, 100); // Cap at 100
  
  // ✅ Good: Validation
  const validSortFields = ['price', 'name', 'date'];
  const sortBy = validSortFields.includes(req.query.sortBy) 
    ? req.query.sortBy 
    : 'date';
  ```

- **React Router Integration:**
  ```js
  import { useSearchParams } from 'react-router-dom';
  
  function ProductList() {
    const [searchParams, setSearchParams] = useSearchParams();
    const category = searchParams.get('category') || 'all';
    
    const updateFilter = (newCategory) => {
      setSearchParams({ category: newCategory });
      // URL updates to ?category=electronics
    };
  }
  ```

- **OpenAPI Documentation:**
  ```yaml
  paths:
    /products:
      get:
        parameters:
          - name: category
            in: query
            required: false
            schema:
              type: string
          - name: page
            in: query
            schema:
              type: integer
              minimum: 1
              default: 1
  ```