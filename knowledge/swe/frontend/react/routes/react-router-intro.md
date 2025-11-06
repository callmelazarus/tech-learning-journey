# React Router: A Well-Structured Overview

React Router enables client-side routing in React applications, allowing navigation between views without page reloads by mapping URL paths to components while maintaining browser history functionality.

## Key Points

- **Definition:** Declarative routing library for React that synchronizes UI with URLs using component-based route configuration.
- **Client-Side Routing:** Navigation happens in browser without server requests, providing instant transitions and preserving application state.
- **Core Components:** BrowserRouter (provider), Routes (container), Route (path-to-component mapping), Link/NavLink (navigation).
- **Dynamic Routing:** Supports URL parameters (`:id`), query strings, and nested routes for complex application structures.
- **History Management:** Uses browser History API for back/forward navigation and programmatic routing.
- **Code Splitting:** Lazy load route components to reduce initial bundle size and improve performance.
- **Data Loading:** Modern versions support route-level data fetching with loaders and actions (v6.4+).

## Step-by-Step Explanation & Examples

**Basic Router Setup**
```jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    // BrowserRouter: Wraps app, provides routing context
    // Uses HTML5 history API for clean URLs (/about vs /#/about)
    <BrowserRouter>
      {/* Routes: Container for all Route definitions */}
      <Routes>
        {/* Route: Maps path to component */}
        <Route 
          path="/"              // URL path to match
          element={<Home />}    // Component to render
        />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        
        {/* 404 catch-all route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
```

**Navigation with Links**
```jsx
import { Link, NavLink } from 'react-router-dom';

function Navigation() {
  return (
    <nav>
      {/* Link: Basic navigation without page reload */}
      <Link to="/">Home</Link>
      <Link to="/about">About</Link>
      
      {/* NavLink: Adds active state styling */}
      <NavLink 
        to="/dashboard"
        className={({ isActive }) => isActive ? 'active' : ''}
        // isActive: true when current route matches
      >
        Dashboard
      </NavLink>
      
      {/* Pass state between routes (hidden from URL) */}
      <Link to="/profile" state={{ from: 'nav' }}>
        Profile
      </Link>
    </nav>
  );
}
```

**Dynamic Routes with Parameters**
```jsx
import { useParams } from 'react-router-dom';

// Route definition with parameter
<Route path="/users/:userId" element={<UserProfile />} />
<Route path="/posts/:postId/comments/:commentId" element={<Comment />} />

// Access parameters in component
function UserProfile() {
  const { userId } = useParams();
  // URL: /users/123 → userId = "123"
  
  return <h1>User Profile: {userId}</h1>;
}
```

**Nested Routes with Layouts**
```jsx
import { Outlet } from 'react-router-dom';

// Layout component with persistent elements
function DashboardLayout() {
  return (
    <div>
      <aside>Sidebar</aside>
      <main>
        {/* Outlet: Renders child route components here */}
        <Outlet />
      </main>
    </div>
  );
}

// Route configuration
<Route path="/dashboard" element={<DashboardLayout />}>
  <Route index element={<DashboardHome />} />
  {/* index: default child route at /dashboard */}
  
  <Route path="profile" element={<Profile />} />
  {/* Renders at /dashboard/profile inside Outlet */}
  
  <Route path="settings" element={<Settings />} />
  {/* Renders at /dashboard/settings inside Outlet */}
</Route>
```

**Programmatic Navigation**
```jsx
import { useNavigate } from 'react-router-dom';

function LoginForm() {
  const navigate = useNavigate();
  
  const handleLogin = async (credentials) => {
    await loginUser(credentials);
    
    // Navigate after async operation
    navigate('/dashboard');
    
    // Navigate with options
    navigate('/profile', { 
      replace: true,              // Replace history entry
      state: { from: 'login' }    // Pass hidden data
    });
    
    // Navigate backward/forward
    navigate(-1);  // Go back
    navigate(1);   // Go forward
  };
  
  return <form onSubmit={handleLogin}>...</form>;
}
```

**Protected Routes Pattern**
```jsx
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children }) {
  const isAuthenticated = useAuth();
  
  // Redirect to login if not authenticated
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

// Usage
<Route 
  path="/dashboard" 
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  }
/>
```

**Query Parameters and Location**
```jsx
import { useSearchParams, useLocation } from 'react-router-dom';

function SearchPage() {
  // Read query params: /search?q=react&sort=newest
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q');      // "react"
  const sort = searchParams.get('sort');    // "newest"
  
  // Update query params
  setSearchParams({ q: 'javascript', sort: 'popular' });
  
  // Access full location object
  const location = useLocation();
  const { pathname, search, hash, state } = location;
  
  return <div>Searching for: {query}</div>;
}
```

## Common Pitfalls

- Forgetting to wrap app with BrowserRouter—causes "useNavigate may only be used in context of Router" errors.
- Not using `index` prop for default child routes—results in empty Outlet rendering.
- Using `<a>` tags instead of Link—causes full page reloads and loses SPA benefits.
- Placing Routes outside BrowserRouter context—routing won't work.
- Not handling 404s with catch-all route (`path="*"`)—shows blank page for invalid URLs.
- Over-nesting routes unnecessarily—makes route structure complex and hard to maintain.
- Forgetting `end` prop on parent NavLinks—shows parent as active on all child routes.

## Practical Applications

- **Multi-Page SPAs:** Separate views (home, about, contact) without server round-trips.
- **Dashboards:** Nested layouts with persistent sidebars and tabbed content sections.
- **E-commerce:** Product listings, detail pages, cart, and checkout flows with dynamic routes.
- **Authentication Flows:** Login, signup, password reset with protected routes and redirects.

## References

- [React Router Documentation](https://reactrouter.com/)
- [React Router Tutorial](https://reactrouter.com/en/main/start/tutorial)
- [React Router v6 Migration Guide](https://reactrouter.com/en/main/upgrading/v5)

---

## Greater Detail

### Advanced Concepts

- **Router Types:** BrowserRouter (clean URLs), HashRouter (hash-based URLs for static hosting), MemoryRouter (testing).
- **Lazy Loading Routes:** Reduce bundle size with code splitting.
  ```jsx
  const Dashboard = lazy(() => import('./Dashboard'));
  <Route path="/dashboard" element={
    <Suspense fallback={<Loading />}>
      <Dashboard />
    </Suspense>
  } />
  ```
- **Route Loaders (v6.4+):** Fetch data before rendering route.
  ```jsx
  const router = createBrowserRouter([{
    path: '/users/:id',
    element: <UserProfile />,
    loader: async ({ params }) => fetchUser(params.id)
  }]);
  // Access data: const user = useLoaderData();
  ```
- **Route Actions:** Handle form submissions and mutations.
  ```jsx
  action: async ({ request, params }) => {
    const formData = await request.formData();
    return updateUser(params.id, formData);
  }
  ```
- **Relative Routing:** Navigate relative to current route, not URL.
  ```jsx
  <Link to="..">Up one level</Link>
  <Link to="../sibling">Sibling route</Link>
  ```
- **ScrollRestoration:** Automatically restore scroll position on navigation (v6.4+).
- **Error Boundaries:** Handle routing errors with errorElement prop.
- **Search Params Handling:** useSearchParams hook for query string management.
- **Location State:** Pass data between routes without URL exposure.
- **Basename:** Configure base URL for apps deployed in subdirectories.
  ```jsx
  <BrowserRouter basename="/my-app">
  ```
- **Navigation Blocking:** Prevent navigation with unsaved changes (unstable_useBlocker).
- **Active Route Detection:** useMatch hook for custom active state logic.
- **Route Matching:** Routes match in order—more specific routes should come first.
- **Index Routes:** Default child route when parent path is matched exactly.
- **Outlet Context:** Pass data from parent to child routes via Outlet context.
- **Form Component:** Enhanced form handling with navigation integration (v6.4+).
- **Prefetching:** Preload route data on hover for faster navigation.