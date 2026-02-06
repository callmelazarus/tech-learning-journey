# TypeScript Type Predicates: Complete Overview

Type predicates are TypeScript functions that perform runtime checks and narrow types, using the `is` keyword to tell the compiler the specific type of a value. Instead of just returning `boolean`, they return `value is Type`, enabling type narrowing in conditional blocks. Think of type predicates as a security checkpoint that not only checks if someone has valid ID, but also tells the system exactly what kind of ID it is (passport vs driver's license).

## Key Points

- **Syntax:** `function isType(value: unknown): value is Type`
- **Purpose:** Narrow types based on runtime checks
- **Returns:** Boolean, but TypeScript understands type implications
- **Use Case:** Type guards with explicit type information
- **Benefit:** Type safety with runtime validation

## Basic Example

### Without Type Predicate

```typescript
// Regular boolean check - no type narrowing
function isString(value: unknown): boolean {
  return typeof value === 'string';
}

const value: unknown = "hello";

if (isString(value)) {
  console.log(value.toUpperCase());  
  // ❌ Error: Object is of type 'unknown'
  // TypeScript doesn't know value is string
}
```

### With Type Predicate

```typescript
// Type predicate - enables type narrowing
function isString(value: unknown): value is string {
  return typeof value === 'string';
}

const value: unknown = "hello";

if (isString(value)) {
  console.log(value.toUpperCase());  
  // ✅ Works! TypeScript knows value is string
}
```

## Basic Syntax

```typescript
// Pattern
function isType(value: unknown): value is Type {
  // Runtime check
  return /* boolean check */;
}

// Examples
function isNumber(value: unknown): value is number {
  return typeof value === 'number';
}

function isArray(value: unknown): value is Array<any> {
  return Array.isArray(value);
}

function isNull(value: unknown): value is null {
  return value === null;
}
```

## Common Patterns

### Object Type Guards

```typescript
interface User {
  name: string;
  email: string;
}

interface Admin {
  name: string;
  email: string;
  permissions: string[];
}

// Check if object is User
function isUser(value: unknown): value is User {
  return (
    typeof value === 'object' &&
    value !== null &&
    'name' in value &&
    'email' in value &&
    typeof (value as User).name === 'string' &&
    typeof (value as User).email === 'string'
  );
}

// Check if User is Admin
function isAdmin(user: User): user is Admin {
  return 'permissions' in user;
}

// Usage
const data: unknown = fetchData();

if (isUser(data)) {
  console.log(data.name);  // ✅ TypeScript knows it's User
  
  if (isAdmin(data)) {
    console.log(data.permissions);  // ✅ Knows it's Admin
  }
}
```

### Array Type Guards

```typescript
function isStringArray(value: unknown): value is string[] {
  return (
    Array.isArray(value) &&
    value.every(item => typeof item === 'string')
  );
}

function isNumberArray(value: unknown): value is number[] {
  return (
    Array.isArray(value) &&
    value.every(item => typeof item === 'number')
  );
}

// Usage
const data: unknown = ["a", "b", "c"];

if (isStringArray(data)) {
  const upper = data.map(s => s.toUpperCase());  // ✅ Works
}
```

### Discriminated Unions

```typescript
interface Circle {
  kind: 'circle';
  radius: number;
}

interface Square {
  kind: 'square';
  size: number;
}

type Shape = Circle | Square;

function isCircle(shape: Shape): shape is Circle {
  return shape.kind === 'circle';
}

function isSquare(shape: Shape): shape is Square {
  return shape.kind === 'square';
}

// Usage
function getArea(shape: Shape): number {
  if (isCircle(shape)) {
    return Math.PI * shape.radius ** 2;  // ✅ Knows radius exists
  }
  
  if (isSquare(shape)) {
    return shape.size ** 2;  // ✅ Knows size exists
  }
  
  // TypeScript knows all cases handled
  const _exhaustive: never = shape;
  return _exhaustive;
}
```

### Nullable Type Guards

```typescript
function isDefined<T>(value: T | undefined): value is T {
  return value !== undefined;
}

function isNotNull<T>(value: T | null): value is T {
  return value !== null;
}

function isPresent<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

// Usage
const users: (User | undefined)[] = [
  { name: 'Alice', email: 'alice@example.com' },
  undefined,
  { name: 'Bob', email: 'bob@example.com' }
];

const validUsers = users.filter(isDefined);
// Type: User[] (undefined filtered out)

validUsers.forEach(user => {
  console.log(user.name);  // ✅ No undefined check needed
});
```

## Advanced Examples

### Generic Type Predicates

```typescript
// Check if value has specific property
function hasProperty<T, K extends string>(
  obj: T,
  key: K
): obj is T & Record<K, unknown> {
  return typeof obj === 'object' && obj !== null && key in obj;
}

// Usage
const data: unknown = { name: 'John', age: 30 };

if (hasProperty(data, 'name')) {
  console.log(data.name);  // ✅ TypeScript knows name exists
}

if (hasProperty(data, 'email')) {
  console.log(data.email);  // ✅ TypeScript knows email exists
}
```

### Nested Type Guards

```typescript
interface ApiResponse {
  data: unknown;
  error?: string;
}

interface UserData {
  id: number;
  name: string;
}

function isUserData(value: unknown): value is UserData {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'name' in value &&
    typeof (value as UserData).id === 'number' &&
    typeof (value as UserData).name === 'string'
  );
}

function isSuccessResponse(
  response: ApiResponse
): response is ApiResponse & { data: UserData } {
  return !response.error && isUserData(response.data);
}

// Usage
const response: ApiResponse = await fetchUser();

if (isSuccessResponse(response)) {
  console.log(response.data.id);    // ✅ Knows data is UserData
  console.log(response.data.name);  // ✅ No casting needed
}
```

### Class Instance Checks

```typescript
class Dog {
  bark() {
    console.log('Woof!');
  }
}

class Cat {
  meow() {
    console.log('Meow!');
  }
}

type Pet = Dog | Cat;

function isDog(pet: Pet): pet is Dog {
  return pet instanceof Dog;
}

function isCat(pet: Pet): pet is Cat {
  return pet instanceof Cat;
}

// Usage
const pet: Pet = new Dog();

if (isDog(pet)) {
  pet.bark();  // ✅ TypeScript knows it's Dog
}

if (isCat(pet)) {
  pet.meow();  // ✅ TypeScript knows it's Cat
}
```

### Error Type Guards

```typescript
function isError(value: unknown): value is Error {
  return value instanceof Error;
}

function isCustomError(error: Error): error is Error & { code: number } {
  return 'code' in error;
}

// Usage
try {
  throw new Error('Something went wrong');
} catch (e) {
  if (isError(e)) {
    console.log(e.message);  // ✅ Knows it's Error
    
    if (isCustomError(e)) {
      console.log(e.code);  // ✅ Knows code exists
    }
  }
}
```

## Filter with Type Predicates

```typescript
// Array.filter with type narrowing
const mixed: (string | number | null)[] = ['a', 1, null, 'b', 2];

// Without type predicate
const strings1 = mixed.filter(x => typeof x === 'string');
// Type: (string | number | null)[] ❌ No narrowing

// With type predicate
function isString(value: unknown): value is string {
  return typeof value === 'string';
}

const strings2 = mixed.filter(isString);
// Type: string[] ✅ Properly narrowed

// Generic filter helper
function filterByType<T, S extends T>(
  array: T[],
  predicate: (value: T) => value is S
): S[] {
  return array.filter(predicate);
}

// Usage
const numbers = filterByType(mixed, (x): x is number => typeof x === 'number');
// Type: number[]
```

## Assertion Functions vs Type Predicates

```typescript
// Type predicate - returns boolean
function isString(value: unknown): value is string {
  return typeof value === 'string';
}

if (isString(value)) {
  // value is string in this block
}

// Assertion function - throws on false
function assertIsString(value: unknown): asserts value is string {
  if (typeof value !== 'string') {
    throw new Error('Value is not a string');
  }
}

assertIsString(value);
// value is string after this line (or function threw)
console.log(value.toUpperCase());  // ✅ Works
```

## Common Pitfalls

```typescript
// ❌ Type predicate doesn't match implementation
function isNumber(value: unknown): value is number {
  return typeof value === 'string';  // ❌ Says number but checks string!
}

// TypeScript trusts you, runtime breaks
const x: unknown = 'hello';
if (isNumber(x)) {
  const doubled = x * 2;  // Runtime error! x is string
}


// ❌ Incomplete runtime check
interface User {
  name: string;
  email: string;
  age: number;
}

function isUser(value: unknown): value is User {
  return (
    typeof value === 'object' &&
    value !== null &&
    'name' in value
    // ❌ Missing checks for email and age!
  );
}

const data = { name: 'John' };
if (isUser(data)) {
  console.log(data.email.toLowerCase());  // Runtime error!
}


// ✅ Complete runtime check
function isUser(value: unknown): value is User {
  return (
    typeof value === 'object' &&
    value !== null &&
    'name' in value &&
    'email' in value &&
    'age' in value &&
    typeof (value as User).name === 'string' &&
    typeof (value as User).email === 'string' &&
    typeof (value as User).age === 'number'
  );
}
```

## Validation Libraries

```typescript
// Using Zod for runtime validation + type predicates
import { z } from 'zod';

const UserSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  age: z.number()
});

type User = z.infer<typeof UserSchema>;

function isUser(value: unknown): value is User {
  return UserSchema.safeParse(value).success;
}

// Or use Zod's built-in guard
const data: unknown = fetchData();

const result = UserSchema.safeParse(data);
if (result.success) {
  console.log(result.data.name);  // ✅ TypeScript knows type
}
```

## Real-World Example

```typescript
// API response handling
interface ApiSuccess<T> {
  status: 'success';
  data: T;
}

interface ApiError {
  status: 'error';
  message: string;
  code: number;
}

type ApiResponse<T> = ApiSuccess<T> | ApiError;

// Type predicate for success
function isSuccess<T>(
  response: ApiResponse<T>
): response is ApiSuccess<T> {
  return response.status === 'success';
}

// Type predicate for error
function isError<T>(
  response: ApiResponse<T>
): response is ApiError {
  return response.status === 'error';
}

// Usage
async function fetchUser(id: number) {
  const response: ApiResponse<User> = await fetch(`/api/users/${id}`)
    .then(r => r.json());
  
  if (isSuccess(response)) {
    console.log(response.data.name);  // ✅ Knows data is User
    return response.data;
  }
  
  if (isError(response)) {
    console.error(response.message);   // ✅ Knows error properties
    throw new Error(response.message);
  }
}
```

## Best Practices

```typescript
// ✅ Make runtime check match type predicate exactly
function isNumber(value: unknown): value is number {
  return typeof value === 'number';  // Matches predicate
}

// ✅ Check all required properties
function isUser(value: unknown): value is User {
  return (
    typeof value === 'object' &&
    value !== null &&
    'name' in value &&
    'email' in value &&
    typeof (value as User).name === 'string' &&
    typeof (value as User).email === 'string'
  );
}

// ✅ Use generic type predicates for reusability
function hasProperty<K extends string>(
  obj: unknown,
  key: K
): obj is Record<K, unknown> {
  return typeof obj === 'object' && obj !== null && key in obj;
}

// ✅ Combine with validation libraries
import { z } from 'zod';

const schema = z.object({ name: z.string() });
function isValid(data: unknown): data is z.infer<typeof schema> {
  return schema.safeParse(data).success;
}

// ❌ Don't trust type predicates without proper checks
function isBad(value: unknown): value is ComplexType {
  return true;  // ❌ Lying to TypeScript!
}

// ❌ Don't forget null/undefined checks
function isBad(value: unknown): value is User {
  return 'name' in value;  // ❌ Crashes if value is null
}
```

## References

- [TypeScript Handbook: Type Predicates](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates)
- [TypeScript Deep Dive: Type Guards](https://basarat.gitbook.io/typescript/type-system/typeguard)
- [Zod Documentation](https://zod.dev/)

---

## Summary

**Type Predicate:** Function that narrows types using `value is Type` syntax.

**Syntax:**
```typescript
function isType(value: unknown): value is Type {
  return /* runtime check */;
}
```

**Common Uses:**
- Object validation: `value is User`
- Array filtering: `array.filter(isString)`
- Discriminated unions: `shape is Circle`
- Null checks: `value is T` (not undefined)

**Key Points:**
- Runtime check must match type predicate claim
- Check all properties thoroughly
- Use with `filter()` for type-safe arrays
- Combine with validation libraries (Zod)

**Rule of thumb:** Type predicates bridge runtime and compile-time type safety. Always ensure runtime checks match type claims. Use validation libraries for complex types.