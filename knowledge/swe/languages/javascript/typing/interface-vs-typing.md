# TypeScript Types vs Interfaces: Complete Overview

Types and interfaces in TypeScript both define the shape of data structures, but they have different origins and capabilities. Interfaces come from object-oriented programming and define contracts for objects and classes, while types are aliases that can represent any TypeScript type including primitives, unions, and complex compositions. Think of interfaces as blueprints for buildings (structured, extendable, formal) and types as mathematical equations (flexible, can represent anything, composable).

## Key Points

- **Interfaces:** Object contracts, extendable, declaration merging, OOP-focused
- **Types:** Type aliases, highly flexible, can represent unions/intersections
- **Similarities:** Both define object shapes, both support generics, most features overlap
- **Differences:** Types handle unions/tuples, interfaces merge declarations
- **Recommendation:** Know both, choose based on use case and team convention

## High-Level Overview

### What is an Interface?

An interface defines a contract—a blueprint that describes what properties and methods an object must have. Interfaces are designed for object-oriented programming patterns, focusing on defining the structure of objects and classes.

```typescript
interface User {
  id: number;
  name: string;
  email: string;
}

// Contract: Any object of type User MUST have these exact properties
const user: User = {
  id: 1,
  name: 'Alice',
  email: 'alice@example.com'
};
```

**Core concept:** Interfaces describe *what* an object looks like and can be extended or implemented by other interfaces or classes.

### What is a Type?

A type is an alias—a name given to any TypeScript type. Types can represent primitives, objects, unions, intersections, tuples, or any combination. They're more flexible and can describe complex type compositions.

```typescript
type User = {
  id: number;
  name: string;
  email: string;
};

// Same usage as interface for objects
const user: User = {
  id: 1,
  name: 'Alice',
  email: 'alice@example.com'
};

// But types can also represent other things:
type ID = string | number;           // Union
type Status = 'pending' | 'done';    // Literal union
type Point = [number, number];       // Tuple
```

**Core concept:** Types create aliases for *any* type expression, not just objects.

## Similarities

Both interfaces and types share many capabilities and can often be used interchangeably for defining object shapes.

### 1. Defining Object Shapes

```typescript
// Interface
interface Product {
  id: number;
  name: string;
  price: number;
}

// Type
type Product = {
  id: number;
  name: string;
  price: number;
};

// Usage is identical
const laptop: Product = {
  id: 1,
  name: 'Laptop',
  price: 999
};
```

### 2. Optional and Readonly Properties

```typescript
// Interface
interface User {
  id: number;
  name: string;
  email?: string;          // Optional
  readonly createdAt: Date; // Cannot be modified
}

// Type
type User = {
  id: number;
  name: string;
  email?: string;
  readonly createdAt: Date;
};

// Both work the same way
```

### 3. Function Signatures

```typescript
// Interface
interface Calculate {
  (a: number, b: number): number;
}

// Type
type Calculate = (a: number, b: number) => number;

// Both work
const add: Calculate = (a, b) => a + b;
```

### 4. Generics

```typescript
// Interface
interface Box<T> {
  value: T;
}

// Type
type Box<T> = {
  value: T;
};

// Usage identical
const numberBox: Box<number> = { value: 42 };
const stringBox: Box<string> = { value: 'hello' };
```

### 5. Index Signatures

```typescript
// Interface
interface StringDictionary {
  [key: string]: string;
}

// Type
type StringDictionary = {
  [key: string]: string;
};

// Both allow dynamic keys
const dict: StringDictionary = {
  firstName: 'Alice',
  lastName: 'Smith'
};
```

### 6. Extension/Composition

```typescript
// Interface - extends
interface Animal {
  name: string;
}

interface Dog extends Animal {
  breed: string;
}

// Type - intersection
type Animal = {
  name: string;
};

type Dog = Animal & {
  breed: string;
};

// End result is the same
const myDog: Dog = {
  name: 'Buddy',
  breed: 'Labrador'
};
```

## Differences

While interfaces and types overlap significantly, they have distinct capabilities that make each better suited for certain scenarios.

### 1. Union Types (Types Only)

```typescript
// ✅ Type can represent unions
type Status = 'pending' | 'loading' | 'success' | 'error';
type ID = string | number;

type Result = 
  | { success: true; data: string }
  | { success: false; error: string };

// ❌ Interface cannot represent unions
interface Status = 'pending' | 'loading';  // Syntax error
interface ID = string | number;            // Syntax error

// Why: Interfaces define object contracts, not alternatives
```

### 2. Primitive Types and Tuples (Types Only)

```typescript
// ✅ Type can alias primitives
type Email = string;
type Count = number;
type IsActive = boolean;

// ✅ Type can define tuples
type Point = [x: number, y: number];
type RGB = [red: number, green: number, blue: number];

const color: RGB = [255, 0, 128];

// ❌ Interface cannot represent primitives or tuples
interface Email = string;  // Error
interface Point = [number, number];  // Error
```

### 3. Declaration Merging (Interfaces Only)

```typescript
// ✅ Interface - can be declared multiple times, merges automatically
interface User {
  name: string;
}

interface User {
  email: string;
}

// Merged result
const user: User = {
  name: 'Alice',
  email: 'alice@example.com'  // Both properties required
};

// ❌ Type - cannot be re-declared
type User = {
  name: string;
};

type User = {  // Error: Duplicate identifier 'User'
  email: string;
};

// Use case: Augmenting third-party library types
```

### 4. Computed Properties (Types More Flexible)

```typescript
// ✅ Type can use computed property names
type Keys = 'firstName' | 'lastName';

type Person = {
  [K in Keys]: string;
};
// Result: { firstName: string; lastName: string; }

// ❌ Interface cannot use computed properties this way
interface Person {
  [K in Keys]: string;  // Error
}

// Interfaces require literal property names
```

### 5. Extends vs Intersection Behavior

```typescript
// Interface extends - strict checking at declaration
interface A {
  prop: string;
}

interface B extends A {
  prop: number;  // ❌ Error: Property 'prop' must be string
}

// Type intersection - merges, can create impossible types
type A = {
  prop: string;
};

type B = A & {
  prop: number;  // ✅ Compiles but creates impossible type
};

// prop is now (string & number) = never
const b: B = { prop: ??? };  // No valid value
```

### 6. Utility Types and Mapped Types

```typescript
// ✅ Types excel at transformation and utilities
type Nullable<T> = T | null;
type ReadOnly<T> = { readonly [K in keyof T]: T[K] };
type PickTwo<T> = Pick<T, 'prop1' | 'prop2'>;

interface User {
  id: number;
  name: string;
  email: string;
}

type PartialUser = Partial<User>;
// { id?: number; name?: string; email?: string; }

type UserKeys = keyof User;
// 'id' | 'name' | 'email'

// Interfaces cannot create these transformations directly
```

### 7. Class Implementation

```typescript
// Both can be implemented by classes, but interfaces are more idiomatic

// Interface (traditional OOP pattern)
interface Repository {
  save(data: any): void;
  findById(id: string): any;
}

class UserRepository implements Repository {
  save(data: any) { /* ... */ }
  findById(id: string) { /* ... */ }
}

// Type (less common, but works)
type Repository = {
  save(data: any): void;
  findById(id: string): any;
};

class UserRepository implements Repository {
  save(data: any) { /* ... */ }
  findById(id: string) { /* ... */ }
}

// Both work, but interface is convention for class contracts
```

### 8. Performance (Negligible Difference)

```typescript
// Interfaces are cached by name (slightly faster compilation)
interface User {
  name: string;
}

// Types are evaluated structurally each time
type User = {
  name: string;
};

// In practice: Difference is negligible
// Choose based on features, not performance
```

## Common Pitfalls

- Trying to create unions with interfaces (use types instead)
- Re-declaring types expecting merge behavior (only interfaces merge)
- Using interfaces for primitives or tuples (not supported)
- Creating impossible types with intersections (interfaces prevent this)
- Not leveraging declaration merging for library augmentation
- Mixing `extends` and `&` inconsistently in a codebase

## Practical Applications

**Use Interfaces for:**
- React component props (convention)
- Class definitions and implementations
- Public APIs that consumers might extend
- Object shapes in object-oriented patterns
- Third-party library augmentation

**Use Types for:**
- Union types and discriminated unions
- Tuple types and primitives
- Function type signatures (convention)
- Utility and helper types
- Complex type transformations
- State machines with unions

## References

- [TypeScript Handbook: Types vs Interfaces](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#differences-between-type-aliases-and-interfaces)
- [TypeScript Deep Dive](https://basarat.gitbook.io/typescript/type-system)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)

---

## Greater Detail

### When to Choose Which

```typescript
// Decision Tree:

// Need union types? → TYPE
type Status = 'idle' | 'loading' | 'success' | 'error';

// Need tuple types? → TYPE
type Coordinate = [latitude: number, longitude: number];

// Defining React props? → INTERFACE (convention)
interface ButtonProps {
  label: string;
  onClick: () => void;
}

// Creating utility types? → TYPE
type Nullable<T> = T | null;
type ReadonlyDeep<T> = { readonly [K in keyof T]: ReadonlyDeep<T[K]> };

// Class contract/implementation? → INTERFACE (convention)
interface DatabaseAdapter {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
}

// Public API for library? → INTERFACE (consumers can extend/merge)
interface PluginConfig {
  name: string;
  version: string;
}

// Discriminated unions? → TYPE
type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string };

// Function signature? → TYPE (convention)
type EventHandler = (event: Event) => void;
```

### Real-World Example: API Client

```typescript
// Interfaces for object contracts
interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface CreateUserRequest {
  name: string;
  email: string;
  role: UserRole;
}

// Types for unions and variants
type UserRole = 'admin' | 'user' | 'guest';

type ApiResponse<T> =
  | { status: 'success'; data: T }
  | { status: 'error'; error: ApiError };

type ApiError = {
  message: string;
  code: number;
};

// Type for function signature
type ApiMethod<TRequest, TResponse> = (
  request: TRequest
) => Promise<ApiResponse<TResponse>>;

// Interface for service contract
interface UserService {
  getUser(id: string): Promise<ApiResponse<User>>;
  createUser(request: CreateUserRequest): Promise<ApiResponse<User>>;
  deleteUser(id: string): Promise<ApiResponse<void>>;
}

// Implementation
class ApiUserService implements UserService {
  async getUser(id: string): Promise<ApiResponse<User>> {
    try {
      const response = await fetch(`/api/users/${id}`);
      const data = await response.json();
      return { status: 'success', data };
    } catch (error) {
      return {
        status: 'error',
        error: { message: error.message, code: 500 }
      };
    }
  }
  
  async createUser(request: CreateUserRequest): Promise<ApiResponse<User>> {
    // Implementation
  }
  
  async deleteUser(id: string): Promise<ApiResponse<void>> {
    // Implementation
  }
}
```

### Declaration Merging in Practice

```typescript
// Extending Express Request type

// Existing Express types (in node_modules)
declare namespace Express {
  interface Request {
    method: string;
    url: string;
  }
}

// Your application - add custom properties
declare namespace Express {
  interface Request {
    user?: {
      id: string;
      role: string;
    };
    correlationId: string;
  }
}

// Now your middleware can use these properties
app.use((req, res, next) => {
  req.correlationId = generateId();
  req.user = authenticateUser(req);
  next();
});

app.get('/profile', (req, res) => {
  // TypeScript knows about user and correlationId
  const userId = req.user?.id;
  const corrId = req.correlationId;
});

// This is only possible with interfaces (declaration merging)
```

### Advanced Type Patterns

```typescript
// Conditional types (types only)
type IsString<T> = T extends string ? 'yes' : 'no';
type A = IsString<'hello'>;  // 'yes'
type B = IsString<42>;       // 'no'

// Extract return type
type GetReturnType<T> = T extends (...args: any[]) => infer R ? R : never;

function getUser() {
  return { id: 1, name: 'Alice' };
}

type User = GetReturnType<typeof getUser>;
// { id: number; name: string }

// Template literal types (types only)
type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';
type Endpoint = `/api/${string}`;
type Route = `${HTTPMethod} ${Endpoint}`;

const route: Route = 'GET /api/users';     // ✅
const invalid: Route = 'PATCH /users';     // ❌ Error

// Mapped types with key remapping (types only)
type Getters<T> = {
  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K]
};

interface User {
  name: string;
  age: number;
}

type UserGetters = Getters<User>;
// {
//   getName: () => string;
//   getAge: () => number;
// }
```

### Interface Extension Patterns

```typescript
// Multiple interface extension
interface Timestamped {
  createdAt: Date;
  updatedAt: Date;
}

interface Auditable {
  createdBy: string;
  updatedBy: string;
}

interface Entity extends Timestamped, Auditable {
  id: string;
}

// Result
const entity: Entity = {
  id: '123',
  createdAt: new Date(),
  updatedAt: new Date(),
  createdBy: 'alice',
  updatedBy: 'bob'
};

// Equivalent with types
type Entity = {
  id: string;
} & Timestamped & Auditable;
```

### Best Practices Summary

```typescript
// ✅ Team Convention Example 1: "Interface-first"
// Use interfaces for all object shapes, types for everything else

interface User { }           // Objects
interface ApiService { }     // Contracts
type UserId = string;        // Primitives
type Status = 'idle' | 'loading';  // Unions

// ✅ Team Convention Example 2: "Type-first"
// Use types by default, interfaces only for OOP patterns

type User = { };             // Objects
type ApiService = { };       // Contracts
type Status = 'idle' | 'loading';  // Unions

interface Repository { }     // Only for class implementations

// ✅ Team Convention Example 3: "Pragmatic"
// Choose based on specific features needed

interface ComponentProps { } // React props (convention)
type State = 'idle' | 'loading';  // Unions (types only)
interface BaseService { }    // Extendable contracts
type Utility<T> = T | null;  // Utilities (types only)

// Key: Pick ONE approach and be consistent across the codebase
```

### Migration Guide

```typescript
// Converting Interface to Type

// Before (interface)
interface User {
  name: string;
  email: string;
}

// After (type) - simple conversion
type User = {
  name: string;
  email: string;
};

// Converting Type to Interface

// Before (type) - simple object
type Product = {
  id: number;
  name: string;
};

// After (interface) - direct conversion
interface Product {
  id: number;
  name: string;
}

// Before (type) - with union (CANNOT convert)
type Status = 'pending' | 'done';

// ❌ Cannot be interface - keep as type
```

### Quick Reference

```typescript
// INTERFACES CAN:
✅ Define object shapes
✅ Extend other interfaces
✅ Be implemented by classes
✅ Merge declarations
✅ Define function signatures
✅ Use generics
✅ Have index signatures

// INTERFACES CANNOT:
❌ Represent unions
❌ Represent primitives
❌ Represent tuples
❌ Use mapped types
❌ Use conditional types

// TYPES CAN:
✅ Define object shapes
✅ Represent unions
✅ Represent primitives
✅ Represent tuples
✅ Use mapped types
✅ Use conditional types
✅ Compose with intersections
✅ Use template literals
✅ Extract/infer types

// TYPES CANNOT:
❌ Merge declarations
❌ Be re-declared (duplicate identifier error)

// BOTH CAN:
✅ Define object shapes
✅ Use generics
✅ Have optional properties
✅ Have readonly properties
✅ Define function signatures
✅ Have index signatures
✅ Be extended/composed
```