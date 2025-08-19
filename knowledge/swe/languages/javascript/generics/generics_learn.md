# TypeScript Generics — A Pragmatic README

## Difficulty

**Medium**

## Why this matters

Generics let you write **reusable, type‑safe** code without losing information. You get better autocomplete, fewer casts, and fewer runtime bugs while keeping APIs flexible.

---

## Key concepts

### 1) Generic functions

```ts
function id<T>(value: T): T {
  return value;
}
const n = id(42);        // T inferred as number
const s = id<string>("x"); // explicit type arg (rarely needed)
```

### 2) Generic interfaces & types

```ts
type Box<T> = { value: T };
const nBox: Box<number> = { value: 123 };
```

### 3) Constraints (`extends`)

```ts
function getProp<T extends object, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}
const len = getProp({ name: "Ada", age: 36 }, "name"); // string
```

### 4) Default type parameters

```ts
type ApiResponse<T = unknown> = { ok: boolean; data: T };
const r1: ApiResponse = { ok: true, data: null };          // T = unknown
const r2: ApiResponse<number> = { ok: true, data: 200 };
```

### 5) Generic classes

```ts
class Cache<K, V> {
  private m = new Map<K, V>();
  get(k: K) { return this.m.get(k); }
  set(k: K, v: V) { this.m.set(k, v); }
}
```

### 6) Inference helpers (`infer`)

```ts
type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;
type A = UnwrapPromise<Promise<number>>; // number
```

### 7) Distributive conditional types

When the checked type is a **naked** type parameter in a conditional, unions distribute:

```ts
type Nullable<T> = T | null;
type NonNullable<T> = T extends null | undefined ? never : T;

type X = NonNullable<string | null>; // string (distributes over union)
```

### 8) Variance & assignability (intuitive take)

* Function **parameters** are effectively *contravariant*.
* Function **returns** are *covariant*.
* Collections like `Array<T>` are *covariant* in `T` for reads, but mutation narrows what’s safe:

```ts
const numbers: number[] = [1,2];
const values: (number | string)[] = numbers; // ❌ would be unsafe if allowed
```

TypeScript protects you here via assignability rules.

### 9) Narrowing with generic APIs

Use constraints and overloads to preserve info:

```ts
function first<T extends readonly unknown[]>(xs: T): T[number] | undefined;
function first<T>(xs: readonly T[]): T | undefined;
function first(xs: readonly unknown[]) { return xs[0]; }

const t = first([1, "x"] as const); // 1 | "x"
```

### 10) Utility types use generics

* `Partial<T>`, `Required<T>`, `Readonly<T>`, `Record<K, T>`, `Pick<T, K>`, `Omit<T, K>`
* `ReturnType<F>`, `Parameters<F>`, `InstanceType<C>`
* These are great examples of generics + conditionals + `keyof`.

---

## Quick patterns you’ll use a lot

### Map in, map out (preserve shape)

```ts
function mapValues<T extends object, R>(
  obj: T,
  fn: (value: T[keyof T], key: keyof T) => R
): { [K in keyof T]: R } {
  const out = {} as { [K in keyof T]: R };
  for (const k in obj) out[k] = fn(obj[k], k);
  return out;
}
```

### Typed event bus

```ts
type Events = {
  login: { userId: string };
  logout: void;
};
class Emitter<E extends Record<string, any>> {
  private handlers: { [K in keyof E]?: Array<(p: E[K]) => void> } = {};
  on<K extends keyof E>(type: K, h: (p: E[K]) => void) {
    (this.handlers[type] ??= []).push(h);
  }
  emit<K extends keyof E>(type: K, payload: E[K]) {
    this.handlers[type]?.forEach(h => h(payload));
  }
}
const bus = new Emitter<Events>();
bus.on("login", p => p.userId); // payload is typed
```

### Branded primitives

```ts
type Brand<T, B extends string> = T & { readonly __brand: B };
type UserId = Brand<string, "UserId">;

function getUser(id: UserId) { /* ... */ }
// getUser("abc") ❌
// getUser("abc" as UserId) ✅
```

---

## Pitfalls

* **JSX angle‑bracket clash:**
  In `.tsx`, `<T>(x: T) => x` can be parsed as JSX. Use a comma to disambiguate:

  ```ts
  const id = <T,>(x: T) => x; // note the comma
  ```

* **No runtime generics:**
  Types are erased. You can’t do `if (T === string)`. Pass *values* when you need runtime behavior (e.g., a parser) or use tagged unions.

* **Over‑constraining:**
  `T extends string` blocks numbers even when your code doesn’t require it. Prefer `unknown` + narrowing inside the function.

* **Accidentally widening:**
  `const x = []` is `any[]` under `noImplicitAny: false`. Use `as const`, explicit generics, or initial elements to guide inference.

* **Distributive conditionals surprises:**
  `T extends U ? X : Y` distributes over `T = A | B`. If you want **non‑distributive**, wrap `T`:

  ```ts
  type NonDist<T> = [T] extends [U] ? X : Y;
  ```

* **Inferring the wrong thing from arrays/tuples:**
  `T[number]` turns a tuple into a union of its element types. Use `as const` to preserve literal types.

* **Generic type args on callbacks:**
  You can’t write `arr.map<T>(...)` for inference on inline callbacks. Extract helper functions or annotate parameters.

* **`any` vs `unknown`:**
  `any` opts out of type safety and spreads. `unknown` forces you to narrow—prefer it for safe generics.

---

## Cheat sheet

* Prefer **inference** over explicit `<T>` arguments.
* Start with `T extends unknown` (or just `T`) and **add constraints only when needed**.
* Use **default type params** to keep public APIs ergonomic.
* For APIs transforming shapes, use **mapped types**: `{ [K in keyof T]: ... }`.
* Reach for **utility types** (`Pick`, `Omit`, `Record`) before writing your own.
* When a conditional type is “doing too much,” make it **non‑distributive** with `[T]`.

---

## Minimal practice (5 minutes)

1. Write `pluck<T, K extends keyof T>(arr: T[], key: K): Array<T[K]>`.
2. Create `DeepReadonly<T>` that recursively readonly‑ifies objects and arrays.
3. Implement `TupleToObject<T extends readonly string[]>` that maps each string to `true`.

---

## Further reading

* *TypeScript Handbook*: “Generics”, “Keyof”, “Mapped Types”, “Conditional Types”
* *Effective TypeScript* (Dan Vanderkam): Items on generics & type design
* Type-level patterns by community libraries (e.g., how `@types/react` models props)
* Utility types in `lib.es5.d.ts`—read the source to see real‑world generic techniques

---

## FAQ

**Q: When should I use overloads vs generics?**
Use **generics** when one implementation works for many types. Use **overloads** when you need different **call‑site** signatures (e.g., different return types based on argument shapes).

**Q: How do I expose a “fluent” API without losing types?**
Carry the generic through the chain and use `this` types or return new generic types at each step (builders often use mapped types + `as const`).

**Q: Are generics slower?**
No—erased at runtime. They can **speed you up** by catching bugs at compile time.

---

## Example: typed fetch helper

```ts
// Define your API responses centrally
interface Endpoints {
  "/users/:id": { params: { id: string }; response: { id: string; name: string } };
  "/posts":    { params: void;           response: { id: string; title: string }[] };
}

type PathParams<P> = P extends { params: infer R } ? R : void;
type PathResp<P>   = P extends { response: infer R } ? R : never;

async function api<K extends keyof Endpoints>(
  path: K,
  params: PathParams<Endpoints[K]>
): Promise<PathResp<Endpoints[K]>> {
  // (Pretend) build URL with params, call fetch, parse json...
  return {} as any;
}

const user = await api("/users/:id", { id: "42" }); // typed { id: string; name: string }
const posts = await api("/posts", undefined);       // typed array of posts
```
