# TypeScript `satisfies` Operator: Complete Overview

The `satisfies` operator (introduced in TypeScript 4.9) lets you **validate that a value matches a type without widening it**. Think of it as a type-checking checkpoint — it verifies your value conforms to a type at compile time, but unlike type annotations (`: Type`), it preserves the *specific* type TypeScript inferred rather than broadening it. You get the best of both worlds: type safety *and* precise inference.

## Key Points

- **Validates without widening.** Checks that a value conforms to a type while keeping the narrower inferred type.
- **Catches errors at the definition site.** Mistakes surface where the value is defined, not where it's used.
- **Preserves literal types.** String literals stay as `"red"` instead of widening to `string`.
- **Preserves structure.** Object property types stay specific — you keep autocomplete and narrow type checks.
- **Complement, not replacement.** `satisfies` doesn't replace `: Type` — they solve different problems.

## The Problem `satisfies` Solves

Before `satisfies`, you had two options for typing a value, and both had trade-offs:

```ts
type Color = "red" | "green" | "blue";
type Theme = Record<string, Color>;

// ─────────────────────────────────────────────
// OPTION 1: Type annotation (: Theme)
// ✓ Catches invalid values
// ✗ Loses specific property knowledge
// ─────────────────────────────────────────────

const theme: Theme = {
  primary: "red",
  secondary: "blue",
  accent: "green",
};

theme.primary;           // type: string (Color) — we lost the fact that it's specifically "red"
theme.primary.toUpperCase(); // ✓ works (it's a string)
theme.nonexistent;       // ✗ no error! Record<string, Color> allows any string key

// ─────────────────────────────────────────────
// OPTION 2: No annotation (rely on inference)
// ✓ Keeps specific types
// ✗ No validation against Theme
// ─────────────────────────────────────────────

const theme2 = {
  primary: "red",
  secondary: "blue",
  accent: "greeen",      // ← typo! No error — TS infers it as a string, not Color
};

theme2.primary;          // type: "red" — specific, great!
theme2.accent;           // type: "greeen" — TypeScript has no idea this is wrong
```

Neither option gives you both validation *and* precise inference. That's the gap `satisfies` fills.

## The Solution

```ts
type Color = "red" | "green" | "blue";
type Theme = Record<string, Color>;

const theme = {
  primary: "red",
  secondary: "blue",
  accent: "greeen",        // ✗ ERROR: '"greeen"' is not assignable to type 'Color'
} satisfies Theme;

// Fix the typo:
const theme = {
  primary: "red",
  secondary: "blue",
  accent: "green",
} satisfies Theme;

theme.primary;             // type: "red" (not just Color — the literal is preserved!)
theme.primary.toUpperCase(); // ✓ works
theme.secondary;           // type: "blue"
theme.nonexistent;         // ✗ ERROR: Property 'nonexistent' does not exist
```

**You get everything:**
- Typo in `"greeen"`? Caught immediately.
- `theme.primary` is `"red"`, not just `Color` or `string`.
- `theme.nonexistent` errors because TypeScript knows the exact keys.

## Step-by-Step Explanation & Examples

### 1. Basic Usage — Config Objects

The most common use case: validating a configuration object while preserving specific types.

```ts
type Route = {
  path: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  auth: boolean;
};

type Routes = Record<string, Route>;

// With satisfies — validated AND specific
const routes = {
  getUser: {
    path: "/users/:id",
    method: "GET",
    auth: true,
  },
  createUser: {
    path: "/users",
    method: "POST",
    auth: true,
  },
  health: {
    path: "/health",
    method: "GET",
    auth: false,
  },
} satisfies Routes;

// TypeScript knows exactly which routes exist:
routes.getUser.method;     // type: "GET" (not "GET" | "POST" | "PUT" | "DELETE")
routes.health.auth;        // type: false (not boolean — the literal!)
routes.deleteUser;         // ✗ ERROR: Property 'deleteUser' does not exist

// Compare with annotation (: Routes):
const routes2: Routes = { /* same content */ };
routes2.getUser.method;    // type: "GET" | "POST" | "PUT" | "DELETE" — lost specificity
routes2.anything;          // no error — Record<string, Route> allows any key
```

### 2. Union Types — Narrowing Without Guarding

When a type has union members, `satisfies` preserves which branch was chosen.

```ts
type ColorValue = string | { r: number; g: number; b: number };
type Palette = Record<string, ColorValue>;

const palette = {
  background: "#ffffff",
  primary: { r: 0, g: 100, b: 255 },
  accent: "#ff6600",
} satisfies Palette;

// TypeScript remembers the specific branch for each property:
palette.background.toUpperCase();  // ✓ — TS knows it's a string
palette.primary.r;                 // ✓ — TS knows it's the object form
palette.primary.toUpperCase();     // ✗ ERROR — it's an object, not a string

// Without satisfies (using : Palette):
const palette2: Palette = { /* same content */ };
palette2.background.toUpperCase(); // ✗ ERROR — TS only knows it's string | {r,g,b}
                                   //   You'd need a type guard to narrow it
```

This is one of the most powerful use cases. With `: Palette`, every property is `string | { r, g, b }` and you need `if (typeof x === 'string')` guards everywhere. With `satisfies`, TypeScript already knows which branch each property uses.

### 3. Arrays and Tuples

```ts
type Coordinate = [number, number];
type NamedLocation = Record<string, Coordinate>;

const locations = {
  office: [34.0522, -118.2437],
  home: [34.0195, -118.4912],
} satisfies NamedLocation;

// With satisfies: TypeScript knows these are tuples of exactly 2 numbers
locations.office[0];   // type: number ✓
locations.office[2];   // ✗ ERROR: Tuple type has no element at index 2

// With : NamedLocation, this would be number[] and index 2 would be allowed
```

### 4. Ensuring Exhaustive Records

`satisfies` is excellent for making sure you've covered every case in a union.

```ts
type Status = "pending" | "active" | "suspended" | "deleted";

// Make sure every status has a label and color
const statusConfig = {
  pending: { label: "Pending Review", color: "#f59e0b" },
  active: { label: "Active", color: "#10b981" },
  suspended: { label: "Suspended", color: "#ef4444" },
  // ✗ ERROR: Property 'deleted' is missing
} satisfies Record<Status, { label: string; color: string }>;

// Add the missing entry:
const statusConfig = {
  pending: { label: "Pending Review", color: "#f59e0b" },
  active: { label: "Active", color: "#10b981" },
  suspended: { label: "Suspended", color: "#ef4444" },
  deleted: { label: "Deleted", color: "#6b7280" },
} satisfies Record<Status, { label: string; color: string }>;

// Now if someone adds a new Status (e.g., "archived"), TypeScript will
// flag this object as incomplete — you can't forget to handle it.
```

### 5. Interface Implementation for Plain Objects

```ts
interface APIEndpoint {
  url: string;
  method: "GET" | "POST";
  headers?: Record<string, string>;
}

const userEndpoint = {
  url: "/api/users",
  method: "POST",
  headers: { "Content-Type": "application/json" },
  timeout: 5000,          // ✗ ERROR: 'timeout' does not exist in type 'APIEndpoint'
} satisfies APIEndpoint;
```

This catches excess properties — something that plain inference wouldn't flag.

### 6. `satisfies` with `as const`

`satisfies` and `as const` are powerful together. `as const` makes everything deeply readonly and literal, while `satisfies` validates the shape.

```ts
type NavItem = {
  label: string;
  href: string;
  icon?: string;
};

const navigation = [
  { label: "Home", href: "/", icon: "house" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact", icon: "mail" },
] as const satisfies readonly NavItem[];

// You get:
// ✓ Validation: typo in a property name → caught
// ✓ Literal types: navigation[0].label is "Home", not string
// ✓ Readonly: can't accidentally push/mutate
// ✓ Exact length: TypeScript knows there are exactly 3 items

navigation[0].label;   // type: "Home"
navigation[0].href;    // type: "/"
navigation.length;     // type: 3
```

### 7. Function Return Validation

```ts
type APIResponse<T> = {
  data: T;
  status: number;
  message: string;
};

function getUser(id: string) {
  // satisfies validates the return shape without annotating the function
  return {
    data: { id, name: "Alice", role: "admin" as const },
    status: 200,
    message: "OK",
  } satisfies APIResponse<{ id: string; name: string; role: string }>;
}

const result = getUser("42");
result.data.role;        // type: "admin" (not just string!)
result.status;           // type: number
```

### 8. Error Handling Patterns

```ts
type ErrorCode = "NOT_FOUND" | "UNAUTHORIZED" | "VALIDATION" | "INTERNAL";

type ErrorConfig = {
  statusCode: number;
  message: string;
  retry: boolean;
};

const errors = {
  NOT_FOUND: { statusCode: 404, message: "Resource not found", retry: false },
  UNAUTHORIZED: { statusCode: 401, message: "Not authenticated", retry: false },
  VALIDATION: { statusCode: 400, message: "Invalid input", retry: false },
  INTERNAL: { statusCode: 500, message: "Internal error", retry: true },
} satisfies Record<ErrorCode, ErrorConfig>;

// Fully typed access:
errors.NOT_FOUND.statusCode;   // type: 404 (literal!)
errors.INTERNAL.retry;         // type: true (literal!)

// If you add a new ErrorCode, TypeScript forces you to add it here too.
```

## `satisfies` vs `: Type` — When to Use Which

```ts
// Use `: Type` when you WANT the wider type
// (e.g., the variable will be reassigned with different values)
let currentColor: Color = "red";
currentColor = "blue";     // ✓ works because type is Color, not "red"

// Use `satisfies` when you want to VALIDATE but keep specific types
// (e.g., config objects, constants, records)
const theme = {
  primary: "red",
} satisfies Record<string, Color>;
theme.primary;             // type: "red" — preserved!
```

| Scenario | Use | Why |
|---|---|---|
| Mutable variable that changes value | `: Type` | Need the wider type for reassignment |
| Function parameter | `: Type` | Parameters should declare what they accept |
| Function return type | `: Type` or `satisfies` | Explicit returns for public APIs, `satisfies` for internal |
| Config / constant object | `satisfies` | Validate shape, keep literal types |
| `Record<K, V>` maps | `satisfies` | Keep exact keys, don't allow arbitrary access |
| Union-typed properties | `satisfies` | Preserve which union branch was chosen |
| Exported constants | `satisfies` + `as const` | Maximum type safety and specificity |

## Common Pitfalls

- **Using `satisfies` on mutable variables.** If you reassign the variable later, the narrow type may prevent valid reassignments. Use `: Type` for variables that change.
- **Confusing `satisfies` with runtime validation.** `satisfies` is purely compile-time. It doesn't validate data at runtime — you still need Zod, io-ts, or similar for API responses and user input.
- **Overusing `satisfies` everywhere.** Not every value needs it. If you're not benefiting from preserved literal types or narrowed unions, a simple `: Type` annotation is clearer and more conventional.
- **Forgetting `as const` for deep immutability.** `satisfies` alone doesn't make values readonly or literal. Pair with `as const` when you want both validation and full literal inference.
- **Ignoring the TypeScript version.** `satisfies` requires TypeScript 4.9+. If your project is on an older version, you'll get a syntax error with no helpful message.

## Practical Applications

- **Feature Flags:** Validate that every flag has a proper config while preserving the exact flag names and default values as literals.
- **Route Definitions:** Ensure all routes have required fields (path, method, auth) while keeping specific method types for type-safe middleware.
- **Theme / Design Tokens:** Validate color and spacing values against a schema while preserving specific values for component-level type safety.
- **Error Code Maps:** Guarantee every error code has a corresponding config, and get literal status codes and messages without type guards.
- **i18n Translation Keys:** Ensure every locale has all required keys, while preserving the exact key names for type-safe translation lookups.

## References

- [TypeScript 4.9 Release Notes: satisfies](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-9.html)
- [TypeScript Handbook: Type Assertions](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#type-assertions)
- [TypeScript Playground (try it live)](https://www.typescriptlang.org/play)

---

## Greater Detail

### Advanced Concepts

- **`satisfies` with Generics:** You can use `satisfies` inside generic functions to validate intermediate values without losing type parameters. Useful in factory patterns where the return type should stay generic but the internal shape needs validation.
- **`satisfies` with Mapped Types:** Combine with `Record`, `Partial`, `Required`, etc. for flexible-yet-validated configurations. For example, `satisfies Partial<Config>` validates known keys without requiring all of them.
- **Chaining `as const satisfies Type`:** The order matters. `as const satisfies Type` first narrows to literals then validates. This gives you the maximum specificity with compile-time guarantees — ideal for exported configuration constants consumed by other modules.
- **Discriminated Unions:** `satisfies` preserves the discriminant field's literal type, so TypeScript can narrow union types automatically downstream without explicit type guards. This eliminates boilerplate `if (x.kind === "...")` checks when the discriminant is already known at the definition site.
- **Compile-Time Exhaustiveness:** Pairing `satisfies Record<UnionType, ...>` with a union type creates a compile-time exhaustiveness check. When the union grows (e.g., a new API error code), every `satisfies` site that maps over that union will fail until updated — acting as a distributed checklist across your codebase.