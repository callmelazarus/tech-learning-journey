# TypeScript Type Casting: Complete Overview

Type casting (type assertion) tells TypeScript to treat a value as a specific type, overriding its inferred type. Using `as Type` or `<Type>`, you assert "I know this is actually Type X, trust me." Think of it like showing your real ID after wearing a disguise—you're revealing the true identity TypeScript couldn't see on its own.

## Key Points

- **Syntax:** `value as Type` or `<Type>value` (prefer `as`)
- **Purpose:** Override TypeScript's type inference
- **Not Runtime:** Doesn't change JavaScript, only TypeScript's understanding
- **Use Sparingly:** Bypasses type safety, can hide bugs
- **Safer Alternative:** Type guards and type predicates

## Basic Syntax

```typescript
// as syntax (preferred)
const input = document.getElementById('email') as HTMLInputElement;

// Angle bracket syntax (avoid in TSX/React)
const input = <HTMLInputElement>document.getElementById('email');

// Both identical, use 'as' for consistency
```

## Common Use Cases

### DOM Elements

```typescript
// TypeScript infers HTMLElement (generic)
const button = document.getElementById('submit');
// button.value  // ❌ Error: Property 'value' doesn't exist

// Cast to specific element type
const input = document.getElementById('email') as HTMLInputElement;
input.value = 'user@example.com';  // ✅ Works

const canvas = document.querySelector('canvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d');  // ✅ TypeScript knows it's canvas
```

### API Responses

```typescript
interface User {
  id: number;
  name: string;
}

// API returns 'any' or 'unknown'
const response = await fetch('/api/user');
const data = await response.json();  // Type: any

// Cast to expected type
const user = data as User;
console.log(user.name);  // ✅ TypeScript knows structure

// Better: Validate first
function isUser(obj: any): obj is User {
  return obj && typeof obj.id === 'number' && typeof obj.name === 'string';
}

if (isUser(data)) {
  console.log(data.name);  // ✅ Type-safe
}
```

### Union Types

```typescript
type Result = string | number;

function process(value: Result) {
  // TypeScript doesn't know which type
  // value.toUpperCase();  // ❌ Error: might be number
  
  // Assert specific type
  if (typeof value === 'string') {
    (value as string).toUpperCase();  // ✅ But unnecessary here
  }
  
  // Better: Type guard narrows automatically
  if (typeof value === 'string') {
    value.toUpperCase();  // ✅ No cast needed!
  }
}
```

### Third-Party Libraries

```typescript
// Library has incomplete/wrong types
import { someFunction } from 'poorly-typed-lib';

const result = someFunction() as CustomType;

// Window extensions
declare global {
  interface Window {
    myApp: {
      config: object;
    };
  }
}

const config = window.myApp.config as AppConfig;
```

## const Assertions

```typescript
// Regular inference
const colors = ['red', 'blue'];
// Type: string[]

// const assertion - readonly, literal types
const colors = ['red', 'blue'] as const;
// Type: readonly ['red', 'blue']

// Object const assertion
const user = {
  name: 'John',
  role: 'admin'
} as const;
// Type: { readonly name: 'John'; readonly role: 'admin' }

// Useful for enum-like values
const STATUS = {
  PENDING: 'pending',
  DONE: 'done'
} as const;

type Status = typeof STATUS[keyof typeof STATUS];
// Type: 'pending' | 'done'
```

## Double Casting (Escape Hatch)

```typescript
// Can't cast directly between unrelated types
const num = 123;
const str = num as string;  // ❌ Error: types not compatible

// Double cast via 'unknown' or 'any'
const str = num as unknown as string;  // ✅ Works but dangerous!

// Only use when absolutely necessary
// Usually indicates a design problem
```

## Non-Null Assertion

```typescript
// Tell TypeScript "this is definitely not null/undefined"
const button = document.getElementById('submit')!;
//                                               ^ Non-null assertion

// Equivalent to:
const button = document.getElementById('submit') as HTMLElement;

// Use carefully - crashes at runtime if actually null
const value = maybeNull!.property;  // Runtime error if null
```

## Casting vs Type Guards

```typescript
// ❌ Casting - no runtime check
function processCast(value: unknown) {
  const user = value as User;
  console.log(user.name);  // Crashes if not User
}

// ✅ Type guard - runtime check
function processGuard(value: unknown) {
  if (isUser(value)) {
    console.log(value.name);  // Safe
  }
}

function isUser(obj: any): obj is User {
  return obj && typeof obj.name === 'string';
}
```

## When to Avoid Casting

```typescript
// ❌ Bad: Casting to bypass errors
interface User {
  name: string;
}

const user = { email: 'test@example.com' } as User;
// Compiles but wrong - name is missing!

// ✅ Good: Fix the actual type
const user: User = {
  name: 'John',
  email: 'test@example.com'  // ❌ Error: email not in User
};


// ❌ Bad: Unnecessary casting
function double(x: number) {
  return (x * 2) as number;  // Unnecessary - already number
}

// ✅ Good: Let TypeScript infer
function double(x: number) {
  return x * 2;  // TypeScript knows this is number
}
```

## Safe Casting Pattern

```typescript
// Validate before casting
function safeCast<T>(data: unknown, validator: (x: unknown) => x is T): T | null {
  return validator(data) ? data : null;
}

// Usage
const user = safeCast(apiResponse, isUser);
if (user) {
  console.log(user.name);  // Safe
}

// Or with Zod
import { z } from 'zod';

const UserSchema = z.object({
  name: z.string(),
  email: z.string()
});

type User = z.infer<typeof UserSchema>;

function parseUser(data: unknown): User {
  return UserSchema.parse(data);  // Throws if invalid
}

const user = parseUser(apiResponse);  // Type-safe
```

## Common Patterns

```typescript
// Event handlers
const handleClick = (e: Event) => {
  const target = e.target as HTMLButtonElement;
  console.log(target.value);
};

// Better with type guard
if (e.target instanceof HTMLButtonElement) {
  console.log(e.target.value);
}

// JSON parsing
const data = JSON.parse(jsonString) as MyType;

// Better with validation
const result = MyTypeSchema.safeParse(JSON.parse(jsonString));
if (result.success) {
  const data = result.data;  // Type-safe
}

// localStorage
const stored = localStorage.getItem('user') as string;
const user = JSON.parse(stored) as User;

// Better with null check
const stored = localStorage.getItem('user');
if (stored) {
  const user = JSON.parse(stored) as User;
}
```

## TypeScript Configuration

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,        // Catch missing types
    "strictNullChecks": true      // Catch null/undefined
  }
}
```

## Best Practices

```typescript
// ✅ Use 'as' syntax, not angle brackets
const input = value as HTMLInputElement;  // Good
const input = <HTMLInputElement>value;    // Avoid (conflicts with JSX)

// ✅ Validate runtime data before casting
if (isUser(data)) {
  const user = data;  // No cast needed
}

// ✅ Use const assertions for literals
const config = { timeout: 3000 } as const;

// ✅ Prefer type guards over casting
function isString(x: unknown): x is string {
  return typeof x === 'string';
}

// ❌ Don't cast to bypass real type errors
const broken = wrongType as CorrectType;  // Fix wrongType instead

// ❌ Don't double cast without good reason
const sketchy = value as unknown as AnyType;  // Code smell

// ❌ Don't use 'any' to avoid fixing types
const lazy = value as any;  // Defeats TypeScript's purpose
```

## References

- [TypeScript Handbook: Type Assertions](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#type-assertions)
- [TypeScript Deep Dive: Type Assertion](https://basarat.gitbook.io/typescript/type-system/type-assertion)

---

## Summary

**Type Casting:** Tell TypeScript to treat value as specific type using `as Type`.

**Syntax:**
```typescript
value as Type           // Preferred
<Type>value            // Avoid (JSX conflicts)
value as const         // Literal types, readonly
value!                 // Non-null assertion
```

**Common Uses:**
- DOM: `getElementById('x') as HTMLInputElement`
- API: `response.json() as User`
- Literals: `['a', 'b'] as const`

**Warnings:**
- No runtime check—TypeScript only
- Can hide bugs if used incorrectly
- Bypasses type safety

**Rule of thumb:** Avoid casting when possible. Use type guards for validation. Cast only when you have information TypeScript doesn't (DOM types, validated API responses). Never cast to fix type errors—fix the types instead.