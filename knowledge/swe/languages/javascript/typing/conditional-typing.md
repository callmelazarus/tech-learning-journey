# TypeScript Conditional Typing: An Introduction

Conditional types in TypeScript allow you to express type relationships and logic based on conditions, making your types more flexible and expressive.

## Key Points

- **Type Logic:** Conditional types use the syntax `T extends U ? X : Y` to choose a type based on a condition.
- **Distributive:** When used with union types, conditional types distribute over each member.
- **Type Inference:** You can infer types within conditional types using the `infer` keyword.
- **Advanced Patterns:** Useful for utility types, API response modeling, and generic libraries.

## Step-by-Step Explanation & Examples

### 1. Basic Conditional Type

```ts
type IsString<T> = T extends string ? true : false;

type A = IsString<"hello">; // true
type B = IsString<42>; // false
```

### 2. Distributive Conditional Types

```ts
type ToArray<T> = T extends any ? T[] : never;

type A = ToArray<number | string>; // number[] | string[]
```

### 3. Using `infer` for Type Extraction

```ts
type ElementType<T> = T extends (infer U)[] ? U : T;

type A = ElementType<string[]>; // string
type B = ElementType<number>; // number
```

### 4. Expanding on `infer`

The `infer` keyword in TypeScript conditional types allows you to introduce a new type variable to capture and extract part of a type within a conditional type expression. This is especially useful for extracting types from complex structures like arrays, functions, or tuples.

#### Example: Extracting Return Type of a Function

```ts
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never;

type A = ReturnType<() => number>; // number
type B = ReturnType<(x: string) => any>; // any
type C = ReturnType<string>; // never (not a function)
```

#### Example: Extracting Promise Value Type

```ts
type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;

type A = UnwrapPromise<Promise<string>>; // string
type B = UnwrapPromise<number>; // number
```

#### Example: Extracting Tuple Element Types

```ts
type FirstElement<T> = T extends [infer U, ...any[]] ? U : never;

type A = FirstElement<[boolean, number, string]>; // boolean
type B = FirstElement<[]>; // never
```

**Summary:**

- `infer` lets you "capture" a type within a conditional type and use it in the true branch.
- It's commonly used in utility types to extract or transform types in a flexible way.

**References:**

- [TypeScript Handbook: Conditional Types - infer](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html#infer)
- [TypeScript Deep Dive: Conditional Types and infer](https://basarat.gitbook.io/typescript/type-system/conditional-types#infer)

## Common Pitfalls

- **Complexity:** Overusing conditional types can make code hard to read and debug.
- **Unexpected Distribution:** Conditional types distribute over unions by default, which may not always be desired.
- **Inference Limits:** TypeScript’s inference may not always behave as expected in deeply nested types.

## Practical Applications

- Creating utility types (e.g., `ReturnType<T>`, `NonNullable<T>`)
- Modeling API responses or data transformations
- Enforcing type constraints in generic libraries

## References

- [TypeScript Handbook: Conditional Types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html)
- [TypeScript Deep Dive: Conditional Types](https://basarat.gitbook.io/typescript/type-system/conditional-types)
-
