# Axios: Complete Overview

Axios is a promise-based HTTP client for browser and Node.js that simplifies making API requests with features like automatic JSON transformation, interceptors, request/response handling, and error management. Unlike the native `fetch` API, Axios automatically parses JSON responses, provides better error handling, and offers built-in request/response interceptors. Think of Axios as a Swiss Army knife for HTTP requests—while fetch is a basic knife, Axios includes extra tools like automatic transformations, timeout handling, and progress tracking built-in.

## Key Points

- **Promise-Based:** Uses async/await or .then()/.catch()
- **Auto JSON:** Automatically stringifies requests and parses responses
- **Interceptors:** Modify requests/responses globally (auth, logging)
- **Cancellation:** Cancel requests with AbortController
- **Works Everywhere:** Browser and Node.js

## Installation

```bash
npm install axios

# Or with yarn
yarn add axios

# CDN (browser)
<script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>
```

## Basic Usage

### GET Request

```javascript
import axios from 'axios';

// Simple GET
const response = await axios.get('https://api.example.com/users');
console.log(response.data); // Parsed JSON automatically

// With query parameters
const response = await axios.get('https://api.example.com/users', {
  params: {
    page: 1,
    limit: 10,
    sort: 'name'
  }
});
// Requests: /users?page=1&limit=10&sort=name

// .then() syntax
axios.get('https://api.example.com/users')
  .then(response => console.log(response.data))
  .catch(error => console.error(error));
```

### POST Request

```javascript
// POST with JSON body
const newUser = {
  name: 'John Doe',
  email: 'john@example.com'
};

const response = await axios.post('https://api.example.com/users', newUser);
console.log(response.data); // Created user

// With headers
const response = await axios.post(
  'https://api.example.com/users',
  newUser,
  {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer token123'
    }
  }
);
```

### PUT/PATCH/DELETE

```javascript
// PUT (full update)
await axios.put('https://api.example.com/users/123', {
  name: 'Jane Doe',
  email: 'jane@example.com'
});

// PATCH (partial update)
await axios.patch('https://api.example.com/users/123', {
  name: 'Jane Doe'
});

// DELETE
await axios.delete('https://api.example.com/users/123');

// DELETE with body (uncommon)
await axios.delete('https://api.example.com/users/123', {
  data: { reason: 'User requested deletion' }
});
```

## Response Object

```javascript
const response = await axios.get('/api/users');

console.log(response.data);       // Response body (parsed JSON)
console.log(response.status);     // HTTP status code (200)
console.log(response.statusText); // Status text ('OK')
console.log(response.headers);    // Response headers
console.log(response.config);     // Request config used
console.log(response.request);    // Original XMLHttpRequest

// Example response:
{
  data: { id: 1, name: 'John' },
  status: 200,
  statusText: 'OK',
  headers: { 'content-type': 'application/json' },
  config: { /* request config */ },
  request: { /* XMLHttpRequest */ }
}
```

## Request Configuration

```javascript
// Full config object
const config = {
  url: '/api/users',
  method: 'post',
  baseURL: 'https://api.example.com',
  
  // Request headers
  headers: {
    'Authorization': 'Bearer token',
    'Content-Type': 'application/json'
  },
  
  // Query parameters
  params: {
    page: 1,
    limit: 10
  },
  
  // Request body
  data: {
    name: 'John'
  },
  
  // Timeout (ms)
  timeout: 5000,
  
  // Response type
  responseType: 'json', // 'json', 'blob', 'arraybuffer', 'text', 'stream'
  
  // Validate status codes
  validateStatus: (status) => status >= 200 && status < 300,
  
  // Max redirects
  maxRedirects: 5,
  
  // Auth credentials
  auth: {
    username: 'user',
    password: 'pass'
  }
};

const response = await axios(config);
```

## Instance Creation

```javascript
// Create instance with defaults
const api = axios.create({
  baseURL: 'https://api.example.com',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Use instance
const users = await api.get('/users');
const user = await api.post('/users', { name: 'John' });

// Multiple instances for different APIs
const apiV1 = axios.create({ baseURL: 'https://api.example.com/v1' });
const apiV2 = axios.create({ baseURL: 'https://api.example.com/v2' });
```

## Interceptors

### Request Interceptors

```javascript
// Add token to all requests
axios.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// Logging
axios.interceptors.request.use(
  config => {
    console.log(`${config.method.toUpperCase()} ${config.url}`);
    return config;
  }
);

// Multiple interceptors
const requestInterceptor = axios.interceptors.request.use(config => config);

// Remove interceptor
axios.interceptors.request.eject(requestInterceptor);
```

### Response Interceptors

```javascript
// Handle errors globally
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Transform response data
axios.interceptors.response.use(
  response => {
    // Add timestamp to all responses
    response.data.fetchedAt = new Date();
    return response;
  }
);

// Auto-retry on failure
axios.interceptors.response.use(
  response => response,
  async error => {
    const config = error.config;
    
    if (!config.retry) config.retry = 0;
    
    if (config.retry < 3) {
      config.retry++;
      await new Promise(resolve => setTimeout(resolve, 1000));
      return axios(config);
    }
    
    return Promise.reject(error);
  }
);
```

## Error Handling

```javascript
try {
  const response = await axios.get('/api/users');
} catch (error) {
  if (error.response) {
    // Server responded with error status (4xx, 5xx)
    console.log('Status:', error.response.status);
    console.log('Data:', error.response.data);
    console.log('Headers:', error.response.headers);
  } else if (error.request) {
    // Request made but no response (network error)
    console.log('No response:', error.request);
  } else {
    // Error setting up request
    console.log('Error:', error.message);
  }
}

// Specific error handling
try {
  await axios.get('/api/users');
} catch (error) {
  if (error.response?.status === 404) {
    console.log('User not found');
  } else if (error.response?.status === 500) {
    console.log('Server error');
  } else if (error.code === 'ECONNABORTED') {
    console.log('Request timeout');
  } else {
    console.log('Unknown error:', error.message);
  }
}
```

## Cancellation

```javascript
// Using AbortController
const controller = new AbortController();

axios.get('/api/users', {
  signal: controller.signal
});

// Cancel request
controller.abort();

// React example - cancel on unmount
useEffect(() => {
  const controller = new AbortController();
  
  axios.get('/api/data', { signal: controller.signal })
    .then(response => setData(response.data))
    .catch(error => {
      if (error.name === 'CanceledError') {
        console.log('Request cancelled');
      }
    });
  
  return () => controller.abort();
}, []);
```

## Concurrent Requests

```javascript
// Promise.all with axios
const [users, posts, comments] = await Promise.all([
  axios.get('/api/users'),
  axios.get('/api/posts'),
  axios.get('/api/comments')
]);

console.log(users.data, posts.data, comments.data);

// With error handling
const results = await Promise.allSettled([
  axios.get('/api/users'),
  axios.get('/api/posts'),
  axios.get('/api/comments')
]);

results.forEach((result, index) => {
  if (result.status === 'fulfilled') {
    console.log(`Request ${index} succeeded:`, result.value.data);
  } else {
    console.log(`Request ${index} failed:`, result.reason);
  }
});
```

## File Uploads

```javascript
// Single file upload
const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('description', 'Profile picture');

const response = await axios.post('/api/upload', formData, {
  headers: {
    'Content-Type': 'multipart/form-data'
  },
  onUploadProgress: (progressEvent) => {
    const percentCompleted = Math.round(
      (progressEvent.loaded * 100) / progressEvent.total
    );
    console.log(`Upload: ${percentCompleted}%`);
  }
});

// Multiple files
const formData = new FormData();
Array.from(fileInput.files).forEach(file => {
  formData.append('files', file);
});

await axios.post('/api/upload-multiple', formData);
```

## Download Files

```javascript
// Download as blob
const response = await axios.get('/api/files/report.pdf', {
  responseType: 'blob'
});

// Create download link
const url = window.URL.createObjectURL(new Blob([response.data]));
const link = document.createElement('a');
link.href = url;
link.setAttribute('download', 'report.pdf');
document.body.appendChild(link);
link.click();
link.remove();

// With progress
await axios.get('/api/files/large-file.zip', {
  responseType: 'blob',
  onDownloadProgress: (progressEvent) => {
    const percentCompleted = Math.round(
      (progressEvent.loaded * 100) / progressEvent.total
    );
    console.log(`Download: ${percentCompleted}%`);
  }
});
```

## Authentication Patterns

### JWT Token

```javascript
// Login and store token
const loginResponse = await axios.post('/api/auth/login', {
  email: 'user@example.com',
  password: 'password123'
});

const token = loginResponse.data.token;
localStorage.setItem('token', token);

// Set default header
axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

// Or use interceptor
axios.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### Refresh Token

```javascript
// Interceptor to refresh token on 401
let isRefreshing = false;
let failedQueue = [];

axios.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Wait for refresh to complete
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return axios(originalRequest);
        });
      }
      
      originalRequest._retry = true;
      isRefreshing = true;
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const { data } = await axios.post('/api/auth/refresh', { refreshToken });
        
        localStorage.setItem('token', data.accessToken);
        axios.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`;
        
        // Retry failed requests
        failedQueue.forEach(({ resolve }) => resolve(data.accessToken));
        failedQueue = [];
        
        return axios(originalRequest);
      } catch (err) {
        failedQueue.forEach(({ reject }) => reject(err));
        failedQueue = [];
        
        // Redirect to login
        window.location.href = '/login';
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }
    
    return Promise.reject(error);
  }
);
```

## Common Patterns

### API Service Layer

```javascript
// services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// services/userService.js
import api from './api';

export const userService = {
  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/users/${id}`),
  create: (user) => api.post('/users', user),
  update: (id, user) => api.put(`/users/${id}`, user),
  delete: (id) => api.delete(`/users/${id}`)
};
```

### React Hook

```javascript
// hooks/useApi.js
import { useState, useEffect } from 'react';
import axios from 'axios';

export function useApi(url, options = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const controller = new AbortController();
    
    axios.get(url, { ...options, signal: controller.signal })
      .then(response => {
        setData(response.data);
        setError(null);
      })
      .catch(err => {
        if (err.name !== 'CanceledError') {
          setError(err);
        }
      })
      .finally(() => setLoading(false));
    
    return () => controller.abort();
  }, [url]);
  
  return { data, loading, error };
}

// Usage
function UserList() {
  const { data: users, loading, error } = useApi('/api/users');
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return <ul>{users.map(user => <li key={user.id}>{user.name}</li>)}</ul>;
}
```

## Axios vs Fetch

```javascript
// Fetch
const response = await fetch('https://api.example.com/users', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'John' })
});

if (!response.ok) throw new Error('Request failed');
const data = await response.json();

// Axios (simpler)
const { data } = await axios.post('https://api.example.com/users', {
  name: 'John'
});

// Axios advantages:
// - Auto JSON parsing
// - Throws on error status (no manual check)
// - Interceptors built-in
// - Request cancellation simpler
// - Upload/download progress
// - Better error handling
```

## Best Practices

```javascript
// ✅ Create instance with baseURL
const api = axios.create({
  baseURL: process.env.API_URL,
  timeout: 10000
});

// ✅ Use interceptors for auth
axios.interceptors.request.use(config => {
  config.headers.Authorization = `Bearer ${getToken()}`;
  return config;
});

// ✅ Handle errors globally
axios.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error.response?.data);
    return Promise.reject(error);
  }
);

// ✅ Cancel requests on component unmount
useEffect(() => {
  const controller = new AbortController();
  fetchData({ signal: controller.signal });
  return () => controller.abort();
}, []);

// ✅ Use timeout for slow endpoints
await axios.get('/slow-endpoint', { timeout: 5000 });

// ❌ Don't ignore errors
await axios.get('/api/data'); // Missing .catch()

// ❌ Don't set headers on every request
axios.get('/api/data', {
  headers: { Authorization: `Bearer ${token}` } // Use interceptor instead
});

// ❌ Don't forget to cancel long requests
axios.get('/long-request'); // Should use AbortController
```

## References

- [Axios Documentation](https://axios-http.com/docs/intro)
- [Axios GitHub](https://github.com/axios/axios)
- [Axios API Reference](https://axios-http.com/docs/api_intro)

---

## Summary

**Axios:** Promise-based HTTP client with auto JSON parsing and interceptors.

**Basic Usage:**
```javascript
const { data } = await axios.get('/api/users');
await axios.post('/api/users', { name: 'John' });
```

**Instance:**
```javascript
const api = axios.create({
  baseURL: 'https://api.example.com',
  timeout: 5000
});
```

**Interceptors:**
```javascript
// Request
axios.interceptors.request.use(config => {
  config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response
axios.interceptors.response.use(
  response => response,
  error => handleError(error)
);
```

**Cancellation:**
```javascript
const controller = new AbortController();
axios.get(url, { signal: controller.signal });
controller.abort();
```

**Rule of thumb:** Create instance with baseURL. Use interceptors for auth/errors. Cancel requests on unmount. Handle errors with try/catch. Prefer axios over fetch for complex apps.