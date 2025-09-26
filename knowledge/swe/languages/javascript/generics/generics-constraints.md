# TypeScript Generics with Constraints (`extends`): A Well-Structured Overview

TypeScript generics with constraints (`extends`) allow you to restrict the types that can be used as generic parameters. This makes your code safer, more expressive, and easier to maintain.

## Key Points

- **Generic Constraints:** Use `extends` to restrict generic types to a specific shape or interface.
- **Type Safety:** Prevents invalid types from being used, catching errors at compile time.
- **Versatility:** Constraints work with types, interfaces, and even unions or built-in types.
- **Property Access:** Enables safe property access and method calls on constrained types.
- **Reusable Patterns:** Common in utility functions, classes, and advanced type manipulations.
- **Combining Constraints:** You can use multiple constraints with intersection types (`extends A & B`).
- **Conditional Types:** Constraints can be combined with conditional types for powerful type logic.

## Step-by-Step Explanation & Examples

1. **Basic Constraint with Interface**
   ```ts
   interface HasId {
     id: number;
   }
   function printId<T extends HasId>(obj: T) {
     console.log(obj.id);
   }
   // printId({ id: 123 }); // OK
   // printId({ name: 'Ada' }); // Error: missing 'id'
   ```

2. **Constraint with Built-in Types**
   ```ts
   function getLength<T extends string | any[]>(input: T): number {
     return input.length;
   }
   // getLength('hello'); // 5
   // getLength([1, 2, 3]); // 3
   ```

3. **Constraint with keyof**
   ```ts
   function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
     return obj[key];
   }
   // getProperty({ name: 'Ada' }, 'name'); // 'Ada'
   ```

4. **Generic Class with Constraint**
   ```ts
   interface Identifiable { id: number; }
   class Repository<T extends Identifiable> {
     private items: T[] = [];
     add(item: T) { this.items.push(item); }
     findById(id: number): T | undefined {
       return this.items.find(item => item.id === id);
     }
   }
   ```

5. **Constraint with Intersection Types**
   ```ts
   interface A { a: string; }
   interface B { b: number; }
   function combine<T extends A & B>(obj: T) {
     return `${obj.a} - ${obj.b}`;
   }
   ```

## Common Pitfalls

- Overly restrictive constraints can limit generic flexibility.
- Forgetting to constrain generics can lead to unsafe property access.
- Misusing `keyof` or intersection types can cause confusing errors.
- Constraints do not enforce runtime checks—only compile-time safety.

## Practical Applications

- Utility functions that operate on objects with specific properties.
- Type-safe data access and manipulation.
- Building reusable, type-safe classes and APIs.
- Advanced type logic in libraries and frameworks.

## References

- [TypeScript Handbook: Generic Constraints](https://www.typescriptlang.org/docs/handbook/2/generics.html#generic-constraints)
- [TypeScript Deep Dive: Generics](https://basarat.gitbook.io/typescript/type-system/generics)
- [TypeScript Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html)

---

## Greater Detail

### Advanced Concepts

- **Conditional Constraints:** Use conditional types to create more dynamic constraints.
- **Mapped Types:** Combine constraints with mapped types for advanced transformations.
- **Recursive Constraints:** Constrain generics to recursive types for tree-like structures.
- **Type Inference:** Use constraints to guide type inference in complex scenarios.
- **Extending Multiple Types:** Use intersection (`extends A & B`) for multi