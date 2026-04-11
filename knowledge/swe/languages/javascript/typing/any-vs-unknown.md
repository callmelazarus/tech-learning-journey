# TypeScript `any` vs `unknown`: Complete Overview

`any` and `unknown` are TypeScript's two ways to say **"I don't know what type this value is"** — but they handle that uncertainty in opposite ways. `any` says "trust me, I'll handle it" and turns off type checking. `unknown` says "prove what it is before you use it" and forces you to narrow the type first. Think of `any` as a universal passkey that opens every door without checking credentials, while `unknown` is a locked box that requires you to verify the contents before touching them.

## Key Points

- **`any` disables type checking.** You can do anything with it — call methods, access properties, assign to anything. TypeScript stops helping you.
- **`unknown` requires narrowing.** You can't do anything with it until you prove what it is (typeof check, instanceof, type guard, etc.).
- **`unknown` is the type-safe alternative to `any`.** Same flexibility at the boundary, but forces you to handle uncertainty explicitly.
- **`any` is contagious.** It spreads through your code — anything touched by `any` becomes `any`. `unknown` doesn't spread.
- **Prefer `unknown` in almost all cases.** The only reason to use `any` is migrating legacy JS or intentionally opting out of type safety.

## The Core Difference

```ts
// ─────────────────────────────────────────────
// any — TypeScript trusts you completely
// ─────────────────────────────────────────────
let value: any = "hello";

value.toUpperCase();      // ✓ no error (might crash at runtime)
value.nonexistentMethod(); // ✓ no error (will definitely crash!)
value.foo.bar.baz;         // ✓ no error (no checking at all)

const n: number = value;   // ✓ no error (even though it's a string!)

// ─────────────────────────────────────────────
// unknown — TypeScript forces you to check
// ─────────────────────────────────────────────
let value: unknown = "hello";

value.toUpperCase();       // ✗ ERROR: 'value' is of type 'unknown'
value.foo;                 // ✗ ERROR: 'value' is of type 'unknown'

const n: number = value;   // ✗ ERROR: Type 'unknown' is not assignable to 'number'

// You MUST narrow the type first:
if (typeof value === "string") {
  value.toUpperCase();     // ✓ now it's string, safe to use
}
```

**Analogy:** `any` is like accepting a package from a stranger and immediately using whatever's inside — trusting the label without verifying. `unknown` is like accepting the same package but refusing to open it until you confirm what's inside. Both handle uncertain input, but only one protects you from surprises.

## How Narrowing Works with `unknown`

To use an `unknown` value, you must "prove" its type with a type guard. TypeScript then narrows the type within that branch.

```ts
function handleInput(value: unknown) {
  // ── typeof guard ──
  if (typeof value === "string") {
    value.toUpperCase();     // ✓ value is string here
  }

  if (typeof value === "number") {
    value.toFixed(2);        // ✓ value is number here
  }

  // ── instanceof guard ──
  if (value instanceof Date) {
    value.getFullYear();     // ✓ value is Date here
  }

  if (value instanceof Error) {
    value.message;           // ✓ value is Error here
  }

  // ── property check (in operator) ──
  if (value && typeof value === "object" && "name" in value) {
    // value is narrowed to object with 'name' property
  }

  // ── custom type guard ──
  if (isUser(value)) {
    value.email;             // ✓ value is User here
  }
}

// Custom type guard
function isUser(value: unknown): value is User {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    "email" in value
  );
}
```

## `any` vs `unknown` Comparison

| Operation | `any` | `unknown` |
|---|---|---|
| Assign any value to it | ✓ | ✓ |
| Access properties without checking | ✓ | ✗ (must narrow first) |
| Call as function | ✓ | ✗ |
| Assign to a specific type | ✓ (silently) | ✗ (must narrow or assert) |
| Pass to function expecting a type | ✓ | ✗ |
| Use in arithmetic operations | ✓ | ✗ |
| Spreads through code | ✓ (contagious) | ✗ (contained) |
| Type safety | None | Full |

```ts
// any is CONTAGIOUS — once something is any, everything it touches becomes any
function processAny(input: any) {
  const result = input.value;  // result is any
  const upper = result.toString().toUpperCase();  // still any
  return upper;  // function returns any, infecting callers
}

const x = processAny(42);  // x is any — no type safety downstream

// unknown is CONTAINED — forces explicit handling at each step
function processUnknown(input: unknown) {
  if (typeof input === "object" && input !== null && "value" in input) {
    const value = input.value;  // still unknown (could be anything)
    if (typeof value === "string") {
      return value.toUpperCase();  // safe, returns string
    }
  }
  throw new Error("Invalid input");
}

const y = processUnknown({ value: "hello" });  // y is string — type safety preserved
```

## When to Use `unknown`

### 1. API Responses and External Data

Any data crossing a trust boundary (network, files, user input) should start as `unknown`.

```ts
async function fetchUser(id: string) {
  const response = await fetch(`/api/users/${id}`);
  const data: unknown = await response.json();  // ← unknown, not any

  // Validate before using
  if (isUser(data)) {
    return data;  // now typed as User
  }

  throw new Error("Invalid user data from API");
}

// Even better — use a runtime validation library like Zod
import { z } from "zod";

const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
});

async function fetchUser(id: string) {
  const response = await fetch(`/api/users/${id}`);
  const data = await response.json();  // any by default
  return UserSchema.parse(data);       // validates + types in one step
}
```

### 2. Catching Errors

TypeScript 4.4+ types catch parameters as `unknown` by default (with `useUnknownInCatchVariables` enabled). This is correct — you can throw anything in JavaScript.

```ts
try {
  riskyOperation();
} catch (err) {   // err is unknown
  // ✗ err.message — ERROR: err is unknown

  if (err instanceof Error) {
    console.error(err.message);  // ✓ safe
  } else {
    console.error("Unknown error:", err);
  }
}
```

### 3. Generic Containers

```ts
// Storing arbitrary values with type safety at the access point
class SafeCache {
  private store = new Map<string, unknown>();

  set(key: string, value: unknown) {
    this.store.set(key, value);
  }

  get<T>(key: string, guard: (v: unknown) => v is T): T | undefined {
    const value = this.store.get(key);
    return guard(value) ? value : undefined;
  }
}

const cache = new SafeCache();
cache.set("user", { id: "42", name: "Alice" });

const user = cache.get("user", isUser);  // typed as User | undefined
```

## When `any` Is Acceptable (Rare)

`any` has a few legitimate uses:

```ts
// 1. Migrating untyped JavaScript — temporary any while converting
// @ts-expect-error — this will be typed later
declare const legacyLibrary: any;

// 2. Working with deeply dynamic data where narrowing is impractical
function deepClone(obj: any): any {
  return JSON.parse(JSON.stringify(obj));
}

// 3. Explicitly opting out when you know better than the type system
const element = document.getElementById("my-el") as any;
element._customProperty = "value";  // non-standard property
```

**But even these cases usually have better alternatives:**

```ts
// Instead of: function deepClone(obj: any): any
function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

// Instead of: element as any
interface CustomElement extends HTMLElement {
  _customProperty?: string;
}
const element = document.getElementById("my-el") as CustomElement;
```

## The "Top Type" Concept

In type theory, a "top type" is the supertype of every other type — every value is assignable to it. Both `any` and `unknown` are top types in TypeScript, but they behave differently:

```
              any (unsafe top type)
             ╱    │    ╲           ← can flow BOTH directions
            ╱     │     ╲             (any → anything, anything → any)
       string  number  Date ...

              unknown (safe top type)
             ╱    │    ╲           ← can only flow ONE direction
            ╱     │     ╲             (anything → unknown, but unknown requires narrowing)
       string  number  Date ...
```

`unknown` is the "correct" top type — it accepts anything flowing in but requires proof before flowing out. `any` is an escape hatch that breaks the type system in both directions.

## Common Pitfalls

- **Using `any` to "make errors go away."** If TypeScript complains, it usually has a good reason. Slapping `any` on a problem hides bugs rather than fixing them. Use `unknown` + narrowing instead.
- **Not validating `unknown` at boundaries.** Declaring API responses as `unknown` is good — but without runtime validation, you're just postponing the crash. Use Zod, io-ts, or manual type guards to actually verify the shape.
- **Forgetting `value !== null` in object checks.** `typeof null === "object"` in JavaScript, so checking `typeof value === "object"` isn't enough. Always combine with `value !== null` to narrow to a real object.
- **Using type assertions (`as`) instead of narrowing.** `value as string` tells TypeScript to trust you without checking — defeating the purpose of `unknown`. Use type guards (`typeof`, `instanceof`, custom functions) that actually verify the type at runtime.
- **Assuming `unknown[]` is safe to iterate.** `unknown[]` means "array of unknown values" — each element still needs to be narrowed individually before use.

## Practical Applications

- **API boundaries:** Type all `fetch().then(r => r.json())` results as `unknown` and validate with a schema library before use.
- **Error handling:** Let catch parameters default to `unknown` and narrow with `instanceof Error`.
- **Plugin systems:** Accept plugin configs as `unknown` and validate each plugin's expected shape.
- **Deserialization:** JSON parsing, query string parsing, form data — treat all as `unknown` at the boundary.
- **Third-party libraries:** When types are missing or incorrect, use `unknown` + narrowing instead of `any` to maintain safety.

## References

- [TypeScript Handbook: unknown](https://www.typescriptlang.org/docs/handbook/2/functions.html#unknown)
- [TypeScript 3.0 Release Notes: The unknown Type](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-0.html#new-unknown-top-type)
- [TypeScript Deep Dive: unknown](https://basarat.gitbook.io/typescript/type-system/unknown)
- [Zod — Runtime Validation](https://zod.dev)

---

## Greater Detail

### Advanced Concepts

- **`never` vs `unknown` vs `any`:** These are TypeScript's three "special" types. `any` is the unsafe top type (anything goes). `unknown` is the safe top type (accepts anything, but must be narrowed). `never` is the bottom type — a value that can never exist, used for exhaustiveness checks and functions that never return.
- **`useUnknownInCatchVariables`:** This `tsconfig.json` option (default in `strict` mode since TS 4.4) makes catch clause variables `unknown` instead of `any`. Strongly recommended — catches the common bug of assuming `err.message` exists on every caught error.
- **Type Predicates and `is` Keyword:** Custom type guards use the `value is Type` return type to tell TypeScript "if this returns true, treat value as Type." This is how libraries like Zod narrow `unknown` to specific types after validation.
- **Assertion Functions:** An alternative to type guards — functions that throw if the type is wrong. Declared with `asserts value is Type`. After calling `assertIsUser(value)`, TypeScript narrows `value` to `User` for the rest of the scope, no `if` block needed.
- **`any` in Generic Constraints:** `T extends any` is a common but subtle pattern that triggers "distributive conditional types." Using `unknown` in the same position doesn't have the same effect — one of the few places where the behavior meaningfully differs beyond type safety.