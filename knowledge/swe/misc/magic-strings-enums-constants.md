# Magic Strings, Enums, and Constants: Complete Overview

Magic strings are hard-coded literal values scattered throughout code that have meaning but no clear definition. Enums and constants are solutions that replace these literals with named, reusable values. Think of magic strings like using "$5" everywhere in your code—you have to remember what that $5 means. Constants and enums are like naming it `SHIPPING_COST = 5`—the meaning is clear and easy to change.

## Key Points

- **Magic Strings:** Hard-coded literals (`"admin"`, `"pending"`) with unclear meaning
- **Constants:** Named values that don't change (`const MAX_USERS = 100`)
- **Enums:** Set of related named constants (user roles, order status)
- **Problem:** Magic strings are hard to maintain, typo-prone, unclear
- **Solution:** Replace with constants/enums for clarity and maintainability

## The Problem: Magic Strings

```javascript
// ❌ Magic strings - what do these mean?
function checkAccess(user) {
  if (user.role === "admin") {
    return true;
  }
  if (user.status === "active") {
    return true;
  }
  return false;
}

function updateOrder(order) {
  if (order.status === "pending") {
    order.status = "processing";
  }
}

// Problems:
// 1. What are valid roles? (admin, user, guest?)
// 2. What are valid statuses? (active, inactive, suspended?)
// 3. Typo risk: "admim" vs "admin"
// 4. Hard to change: "admin" appears 50 times
// 5. No autocomplete or type checking
```

## Solution 1: Constants

```javascript
// ✅ Constants - clear and maintainable
const USER_ROLE_ADMIN = "admin";
const USER_ROLE_USER = "user";
const USER_ROLE_GUEST = "guest";

const USER_STATUS_ACTIVE = "active";
const USER_STATUS_INACTIVE = "inactive";

const ORDER_STATUS_PENDING = "pending";
const ORDER_STATUS_PROCESSING = "processing";
const ORDER_STATUS_SHIPPED = "shipped";

function checkAccess(user) {
  if (user.role === USER_ROLE_ADMIN) {
    return true;
  }
  if (user.status === USER_STATUS_ACTIVE) {
    return true;
  }
  return false;
}

// Benefits:
// 1. Clear what values are valid
// 2. Typos caught at runtime (undefined variable)
// 3. Change once, affects everywhere
// 4. Autocomplete helps
```

## Solution 2: Object Constants

```javascript
// Group related constants
const USER_ROLES = {
  ADMIN: "admin",
  USER: "user",
  GUEST: "guest"
};

const USER_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  SUSPENDED: "suspended"
};

const ORDER_STATUS = {
  PENDING: "pending",
  PROCESSING: "processing",
  SHIPPED: "shipped",
  DELIVERED: "delivered"
};

// Usage
function checkAccess(user) {
  if (user.role === USER_ROLES.ADMIN) {
    return true;
  }
  return false;
}

// Get all possible values
Object.values(ORDER_STATUS);  // ["pending", "processing", ...]
```

## Solution 3: Enums (TypeScript)

```typescript
// TypeScript enum
enum UserRole {
  ADMIN = "admin",
  USER = "user",
  GUEST = "guest"
}

enum OrderStatus {
  PENDING = "pending",
  PROCESSING = "processing",
  SHIPPED = "shipped",
  DELIVERED = "delivered"
}

// Type-safe usage
function checkAccess(user: { role: UserRole }): boolean {
  if (user.role === UserRole.ADMIN) {
    return true;
  }
  return false;
}

// ✅ Type checking
checkAccess({ role: UserRole.ADMIN });  // Works
checkAccess({ role: "invalid" });        // ❌ Type error

// Get values
Object.values(OrderStatus);
// ["pending", "processing", "shipped", "delivered"]
```

## Real-World Examples

### HTTP Status Codes

```javascript
// ❌ Magic numbers
if (response.status === 200) {
  // success
}
if (response.status === 404) {
  // not found
}

// ✅ Constants
const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  SERVER_ERROR: 500
};

if (response.status === HTTP_STATUS.OK) {
  // success
}
if (response.status === HTTP_STATUS.NOT_FOUND) {
  // not found
}
```

### API Endpoints

```javascript
// ❌ Magic strings
fetch("/api/users");
fetch("/api/users/123");
fetch("/api/orders");

// ✅ Constants
const API_ENDPOINTS = {
  USERS: "/api/users",
  USER_BY_ID: (id) => `/api/users/${id}`,
  ORDERS: "/api/orders",
  ORDER_BY_ID: (id) => `/api/orders/${id}`
};

fetch(API_ENDPOINTS.USERS);
fetch(API_ENDPOINTS.USER_BY_ID(123));
```

### Configuration

```javascript
// ❌ Magic values
setTimeout(() => {}, 5000);
const users = data.slice(0, 10);
if (password.length < 8) {
  // error
}

// ✅ Named constants
const TIMEOUTS = {
  API_RETRY: 5000,
  DEBOUNCE: 300,
  POLL_INTERVAL: 1000
};

const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100
};

const VALIDATION = {
  MIN_PASSWORD_LENGTH: 8,
  MAX_USERNAME_LENGTH: 20
};

setTimeout(() => {}, TIMEOUTS.API_RETRY);
const users = data.slice(0, PAGINATION.DEFAULT_PAGE_SIZE);
if (password.length < VALIDATION.MIN_PASSWORD_LENGTH) {
  // error
}
```

### Event Types

```javascript
// ❌ Magic strings
button.addEventListener("click", handler);
eventBus.emit("user:login");
eventBus.emit("order:created");

// ✅ Constants
const EVENTS = {
  USER_LOGIN: "user:login",
  USER_LOGOUT: "user:logout",
  ORDER_CREATED: "order:created",
  ORDER_UPDATED: "order:updated"
};

button.addEventListener("click", handler);  // DOM events stay as-is
eventBus.emit(EVENTS.USER_LOGIN);
eventBus.emit(EVENTS.ORDER_CREATED);
```

## TypeScript Enum Patterns

### String Enums

```typescript
enum OrderStatus {
  PENDING = "pending",
  PROCESSING = "processing",
  SHIPPED = "shipped",
  DELIVERED = "delivered"
}

// Use as type
function updateOrder(orderId: string, status: OrderStatus) {
  // status must be one of the enum values
}

updateOrder("123", OrderStatus.SHIPPED);  // ✅
updateOrder("123", "invalid");            // ❌ Type error
```

### Numeric Enums

```typescript
enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3
}

function log(level: LogLevel, message: string) {
  if (level <= LogLevel.WARN) {
    console.error(message);
  }
}

log(LogLevel.ERROR, "Critical issue");
```

### Const Enums (No Runtime Code)

```typescript
// Regular enum - generates JavaScript code
enum Color {
  RED = "red",
  BLUE = "blue"
}

// Const enum - inlined at compile time, no JS code
const enum Color {
  RED = "red",
  BLUE = "blue"
}

// Compiled output:
// Regular: Creates Color object
// Const: Just replaces Color.RED with "red"
```

## JavaScript Alternatives to Enums

### Object.freeze

```javascript
// Prevent modification
const USER_ROLES = Object.freeze({
  ADMIN: "admin",
  USER: "user",
  GUEST: "guest"
});

USER_ROLES.ADMIN = "something";  // Silently fails (strict mode: error)
console.log(USER_ROLES.ADMIN);   // Still "admin"
```

### Symbols (Unique Values)

```javascript
// Guaranteed unique
const STATUS = {
  PENDING: Symbol("pending"),
  DONE: Symbol("done")
};

const task = { status: STATUS.PENDING };

// Can't accidentally match
task.status === STATUS.PENDING;  // ✅ true
task.status === "pending";       // ❌ false (Symbol vs String)
```

## When to Use What

```javascript
// ✅ Constants: Simple values, config
const MAX_RETRIES = 3;
const API_URL = "https://api.example.com";

// ✅ Object Constants: Related string values
const COLORS = {
  PRIMARY: "#007bff",
  DANGER: "#dc3545"
};

// ✅ Enums (TypeScript): Type-safe states
enum UserRole {
  ADMIN = "admin",
  USER = "user"
}

// ✅ Symbols: Truly unique values
const STATUS = {
  INIT: Symbol("init"),
  READY: Symbol("ready")
};
```

## Common Patterns

### Validation

```javascript
const ORDER_STATUS = {
  PENDING: "pending",
  PROCESSING: "processing",
  SHIPPED: "shipped"
};

function isValidStatus(status) {
  return Object.values(ORDER_STATUS).includes(status);
}

isValidStatus("pending");     // true
isValidStatus("invalid");     // false
```

### Switch Statements

```javascript
function getStatusColor(status) {
  switch (status) {
    case ORDER_STATUS.PENDING:
      return "yellow";
    case ORDER_STATUS.PROCESSING:
      return "blue";
    case ORDER_STATUS.SHIPPED:
      return "green";
    default:
      return "gray";
  }
}
```

### React Props

```javascript
const BUTTON_VARIANTS = {
  PRIMARY: "primary",
  SECONDARY: "secondary",
  DANGER: "danger"
};

function Button({ variant = BUTTON_VARIANTS.PRIMARY, children }) {
  return (
    <button className={`btn-${variant}`}>
      {children}
    </button>
  );
}

// Usage
<Button variant={BUTTON_VARIANTS.PRIMARY}>Save</Button>
```

## Migration Strategy

```javascript
// Step 1: Define constants
const USER_ROLES = {
  ADMIN: "admin",
  USER: "user"
};

// Step 2: Replace gradually
// Before:
if (user.role === "admin") { }

// After:
if (user.role === USER_ROLES.ADMIN) { }

// Step 3: Search codebase for remaining magic strings
// Search for: "admin" (in quotes)
// Replace with: USER_ROLES.ADMIN
```

## File Organization

```javascript
// constants/userRoles.js
export const USER_ROLES = {
  ADMIN: "admin",
  USER: "user",
  GUEST: "guest"
};

// constants/orderStatus.js
export const ORDER_STATUS = {
  PENDING: "pending",
  PROCESSING: "processing",
  SHIPPED: "shipped"
};

// constants/index.js
export * from "./userRoles";
export * from "./orderStatus";

// Usage
import { USER_ROLES, ORDER_STATUS } from "./constants";
```

## References

- [TypeScript Enums](https://www.typescriptlang.org/docs/handbook/enums.html)
- [Magic Numbers](https://en.wikipedia.org/wiki/Magic_number_(programming))
- [Clean Code Principles](https://www.amazon.com/Clean-Code-Handbook-Software-Craftsmanship/dp/0132350882)

---

## Summary

**Magic Strings:** Hard-coded literals (`"admin"`, `404`) scattered in code.

**Problems:** Typo-prone, hard to maintain, no IDE support, unclear meaning.

**Solutions:**
- **Constants:** `const MAX_USERS = 100`
- **Object Constants:** `USER_ROLES.ADMIN`
- **Enums (TypeScript):** `enum UserRole { ADMIN = "admin" }`

**Rule of thumb:** If a literal appears more than once or has special meaning, make it a constant. If it's a set of related values, use object constants or enums.

**Quick fix:** Search codebase for quoted strings, replace with named constants.