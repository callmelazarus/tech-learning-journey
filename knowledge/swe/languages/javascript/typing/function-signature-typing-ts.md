# TypeScript Function Signatures: Complete Overview

A function signature in TypeScript defines the shape of a function—its parameters, their types, and its return type. Function signatures enable type safety by ensuring functions are called with correct arguments and return expected values. Think of a function signature as a contract—it specifies exactly what goes in (parameters) and what comes out (return value), preventing misuse and catching errors at compile time rather than runtime.

## Key Points

- **Basic Syntax:** `function name(param: Type): ReturnType { }`
- **Arrow Functions:** `const name = (param: Type): ReturnType => { }`
- **Type Inference:** TypeScript can infer return types (but explicit is clearer)
- **Optional Parameters:** Use `?` for optional parameters
- **Generic Functions:** Use `<T>` for flexible, reusable type-safe functions

## Step-by-Step Explanation & Examples

1. **Basic Function Signature (Explicit Types)**

   ```typescript
   // Function declaration
   function greet(name: string): string {
     return `Hello, ${name}`;
   }
   
   // Arrow function
   const greet = (name: string): string => {
     return `Hello, ${name}`;
   };
   
   // Usage
   greet('Alice');        // ✅ 'Hello, Alice'
   greet(123);            // ❌ Error: Argument of type 'number' not assignable
   const result = greet('Bob'); // result is type 'string'
   ```

2. **Multiple Parameters with Different Types**

   ```typescript
   function createUser(
     name: string,
     age: number,
     isActive: boolean
   ): object {
     return { name, age, isActive };
   }
   
   // Better: Define return type explicitly
   function createUser(
     name: string,
     age: number,
     isActive: boolean
   ): { name: string; age: number; isActive: boolean } {
     return { name, age, isActive };
   }
   
   const user = createUser('Alice', 25, true);
   console.log(user.name);  // ✅ TypeScript knows this exists
   ```

3. **Optional and Default Parameters**

   ```typescript
   // Optional parameter with ?
   function greet(name: string, greeting?: string): string {
     if (greeting) {
       return `${greeting}, ${name}`;
     }
     return `Hello, ${name}`;
   }
   
   greet('Alice');              // ✅ 'Hello, Alice'
   greet('Bob', 'Hi');          // ✅ 'Hi, Bob'
   
   // Default parameter (automatically optional)
   function multiply(a: number, b: number = 1): number {
     return a * b;
   }
   
   multiply(5);      // ✅ 5 (uses default b = 1)
   multiply(5, 3);   // ✅ 15
   
   // Optional must come after required
   function build(name: string, age?: number, city: string) {}  // ❌ Error
   function build(name: string, city: string, age?: number) {}  // ✅ Correct
   ```

4. **Rest Parameters (Variable Number of Arguments)**

   ```typescript
   // Rest parameters are always an array
   function sum(...numbers: number[]): number {
     return numbers.reduce((total, n) => total + n, 0);
   }
   
   sum(1, 2, 3);           // ✅ 6
   sum(10, 20, 30, 40);    // ✅ 100
   
   // Rest params with other parameters
   function logMessage(prefix: string, ...messages: string[]): void {
     messages.forEach(msg => console.log(`${prefix}: ${msg}`));
   }
   
   logMessage('INFO', 'Server started', 'Port 3000');
   // INFO: Server started
   // INFO: Port 3000
   ```

5. **Function Type Aliases and Interfaces**

   ```typescript
   // Type alias for function signature
   type MathOperation = (a: number, b: number) => number;
   
   const add: MathOperation = (a, b) => a + b;
   const subtract: MathOperation = (a, b) => a - b;
   
   // Using the type for callbacks
   function calculate(x: number, y: number, operation: MathOperation): number {
     return operation(x, y);
   }
   
   calculate(10, 5, add);       // ✅ 15
   calculate(10, 5, subtract);  // ✅ 5
   
   // Interface for function (less common)
   interface Comparator {
     (a: string, b: string): number;
   }
   
   const alphabetical: Comparator = (a, b) => a.localeCompare(b);
   ```

6. **Generic Functions (Type Parameters)**

   ```typescript
   // Basic generic - works with any type
   function identity<T>(value: T): T {
     return value;
   }
   
   identity<string>('hello');  // ✅ Returns string
   identity<number>(42);       // ✅ Returns number
   identity('auto');           // ✅ Type inference - T is string
   
   // Generic with array
   function firstElement<T>(arr: T[]): T | undefined {
     return arr[0];
   }
   
   const first = firstElement([1, 2, 3]);     // number | undefined
   const firstStr = firstElement(['a', 'b']); // string | undefined
   
   // Multiple type parameters
   function pair<T, U>(first: T, second: U): [T, U] {
     return [first, second];
   }
   
   pair<string, number>('age', 25);  // ['age', 25]
   pair('name', true);               // Type inference works
   ```

7. **Generic Constraints (Restricting Type Parameters)**

   ```typescript
   // Constrain T to have a length property
   function logLength<T extends { length: number }>(item: T): void {
     console.log(item.length);
   }
   
   logLength('hello');      // ✅ 5 (string has length)
   logLength([1, 2, 3]);    // ✅ 3 (array has length)
   logLength({ length: 10 }); // ✅ 10
   logLength(123);          // ❌ Error: number has no length
   
   // Constrain to object keys
   function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
     return obj[key];
   }
   
   const user = { name: 'Alice', age: 25 };
   getProperty(user, 'name');    // ✅ Returns 'Alice' (type: string)
   getProperty(user, 'age');     // ✅ Returns 25 (type: number)
   getProperty(user, 'invalid'); // ❌ Error: 'invalid' not in user
   ```

8. **Function Overloads (Multiple Signatures)**

   ```typescript
   // Define multiple signatures
   function format(value: string): string;
   function format(value: number): string;
   function format(value: boolean): string;
   
   // Implementation must handle all cases
   function format(value: string | number | boolean): string {
     if (typeof value === 'string') {
       return value.toUpperCase();
     }
     if (typeof value === 'number') {
       return value.toFixed(2);
     }
     return value ? 'TRUE' : 'FALSE';
   }
   
   format('hello');  // ✅ 'HELLO'
   format(42.567);   // ✅ '42.57'
   format(true);     // ✅ 'TRUE'
   
   // Complex overload example
   function createElement(tag: 'div'): HTMLDivElement;
   function createElement(tag: 'span'): HTMLSpanElement;
   function createElement(tag: string): HTMLElement;
   
   function createElement(tag: string): HTMLElement {
     return document.createElement(tag);
   }
   
   const div = createElement('div');   // Type: HTMLDivElement
   const span = createElement('span'); // Type: HTMLSpanElement
   ```

9. **Callback Functions with Types**

   ```typescript
   // Simple callback
   function fetchData(callback: (data: string) => void): void {
     setTimeout(() => {
       callback('Data loaded');
     }, 1000);
   }
   
   fetchData((data) => {
     console.log(data); // data is typed as string
   });
   
   // Callback with error handling
   type Callback<T> = (error: Error | null, result?: T) => void;
   
   function readFile(path: string, callback: Callback<string>): void {
     // Simulate async operation
     if (path) {
       callback(null, 'file contents');
     } else {
       callback(new Error('Invalid path'));
     }
   }
   
   readFile('file.txt', (err, data) => {
     if (err) {
       console.error(err.message);
       return;
     }
     console.log(data?.toUpperCase()); // data might be undefined
   });
   ```

10. **Async Functions and Promises**

    ```typescript
    // Async function returns Promise<T>
    async function fetchUser(id: number): Promise<{ name: string; age: number }> {
      const response = await fetch(`/api/users/${id}`);
      return response.json();
    }
    
    // Usage
    fetchUser(1).then(user => {
      console.log(user.name); // TypeScript knows user shape
    });
    
    // Generic async function
    async function fetchData<T>(url: string): Promise<T> {
      const response = await fetch(url);
      return response.json();
    }
    
    interface User {
      id: number;
      name: string;
    }
    
    const user = await fetchData<User>('/api/user/1');
    console.log(user.name); // ✅ TypeScript knows user is User type
    
    // Error handling with async
    async function safeDelete(id: number): Promise<boolean> {
      try {
        await fetch(`/api/delete/${id}`, { method: 'DELETE' });
        return true;
      } catch (error) {
        return false;
      }
    }
    ```

## Common Pitfalls

- Forgetting to specify return type (leads to `any` or incorrect inference)
- Using `any` type instead of proper types (defeats TypeScript's purpose)
- Not handling optional parameters correctly (forgetting `undefined` checks)
- Overusing function overloads when union types would work better
- Ignoring TypeScript errors and using `@ts-ignore` (hides real issues)
- Not constraining generics when specific properties are needed
- Mixing optional and required parameters in wrong order

## Practical Applications

- API client functions (typed request/response)
- Event handlers with proper event types
- Array manipulation with generic utilities
- Form validation with type-safe schemas
- Database query builders with inferred return types
- React component prop functions

## References

- [TypeScript Handbook: Functions](https://www.typescriptlang.org/docs/handbook/2/functions.html)
- [TypeScript Handbook: Generics](https://www.typescriptlang.org/docs/handbook/2/generics.html)
- [TypeScript Deep Dive: Functions](https://basarat.gitbook.io/typescript/type-system/functions)
- [TypeScript Playground](https://www.typescriptlang.org/play) - Interactive testing

---

## Greater Detail

### Advanced Concepts

- **Conditional Types in Function Signatures:**
  ```typescript
  // Return different types based on input
  type Response<T> = T extends string ? string[] : number[];
  
  function process<T extends string | number>(value: T): Response<T> {
    if (typeof value === 'string') {
      return value.split('') as Response<T>;
    }
    return [value, value * 2] as Response<T>;
  }
  
  const strResult = process('hello'); // string[]
  const numResult = process(42);      // number[]
  ```

- **Utility Types with Functions:**
  ```typescript
  // ReturnType - Extract return type
  function createUser() {
    return { id: 1, name: 'Alice', age: 25 };
  }
  
  type User = ReturnType<typeof createUser>;
  // { id: number; name: string; age: number }
  
  // Parameters - Extract parameter types
  function login(email: string, password: string) {}
  
  type LoginParams = Parameters<typeof login>;
  // [string, string]
  
  // Use with spread
  function authenticate(...args: LoginParams) {
    login(...args);
  }
  
  // Partial - Make all properties optional
  type UpdateUser = Partial<User>;
  
  function updateUser(id: number, updates: UpdateUser): User {
    // updates can have any combination of User properties
  }
  ```

- **Type Guards in Functions:**
  ```typescript
  // User-defined type guard
  function isString(value: unknown): value is string {
    return typeof value === 'string';
  }
  
  function process(input: string | number) {
    if (isString(input)) {
      console.log(input.toUpperCase()); // ✅ TypeScript knows it's string
    } else {
      console.log(input.toFixed(2));    // ✅ TypeScript knows it's number
    }
  }
  
  // Generic type guard
  function isArray<T>(value: unknown): value is T[] {
    return Array.isArray(value);
  }
  
  // Discriminated unions with type guards
  type Success = { status: 'success'; data: string };
  type Failure = { status: 'error'; error: string };
  type Result = Success | Failure;
  
  function handleResult(result: Result): string {
    if (result.status === 'success') {
      return result.data;  // ✅ TypeScript knows it's Success
    }
    return result.error;   // ✅ TypeScript knows it's Failure
  }
  ```

- **Higher-Order Functions (Functions that Return Functions):**
  ```typescript
  // Function that returns a function
  function createMultiplier(factor: number): (x: number) => number {
    return (x: number) => x * factor;
  }
  
  const double = createMultiplier(2);
  const triple = createMultiplier(3);
  
  double(5);  // 10
  triple(5);  // 15
  
  // Generic higher-order function
  function createFormatter<T>(
    formatter: (value: T) => string
  ): (values: T[]) => string[] {
    return (values: T[]) => values.map(formatter);
  }
  
  const formatNumbers = createFormatter<number>(n => n.toFixed(2));
  formatNumbers([1.234, 5.678]); // ['1.23', '5.68']
  ```

- **Function Composition with Types:**
  ```typescript
  // Compose two functions
  function compose<A, B, C>(
    f: (b: B) => C,
    g: (a: A) => B
  ): (a: A) => C {
    return (a: A) => f(g(a));
  }
  
  const addOne = (x: number) => x + 1;
  const double = (x: number) => x * 2;
  
  const addOneThenDouble = compose(double, addOne);
  addOneThenDouble(5); // 12 (5 + 1 = 6, 6 * 2 = 12)
  
  // Pipe (reverse composition)
  function pipe<A, B, C>(
    f: (a: A) => B,
    g: (b: B) => C
  ): (a: A) => C {
    return (a: A) => g(f(a));
  }
  
  const doubleThenAddOne = pipe(double, addOne);
  doubleThenAddOne(5); // 11 (5 * 2 = 10, 10 + 1 = 11)
  ```

- **Variadic Tuple Types (Advanced Rest Parameters):**
  ```typescript
  // Prepend element to tuple
  function prepend<T, U extends unknown[]>(
    first: T,
    ...rest: U
  ): [T, ...U] {
    return [first, ...rest];
  }
  
  const result = prepend('hello', 1, true, [1, 2]);
  // Type: [string, number, boolean, number[]]
  
  // Generic function that preserves tuple types
  function concat<T extends unknown[], U extends unknown[]>(
    arr1: [...T],
    arr2: [...U]
  ): [...T, ...U] {
    return [...arr1, ...arr2];
  }
  
  const combined = concat(['a', 'b'], [1, 2, 3]);
  // Type: [string, string, number, number, number]
  ```

- **This Parameter Typing:**
  ```typescript
  // Explicitly type 'this'
  interface Database {
    connection: string;
    query(this: Database, sql: string): void;
  }
  
  const db: Database = {
    connection: 'postgres://localhost',
    query(this: Database, sql: string) {
      console.log(`Executing on ${this.connection}: ${sql}`);
    }
  };
  
  db.query('SELECT * FROM users'); // ✅ Works
  
  const queryFn = db.query;
  queryFn('SELECT * FROM users');  // ❌ Error: 'this' is undefined
  
  // Fix with bind
  const boundQuery = db.query.bind(db);
  boundQuery('SELECT * FROM users'); // ✅ Works
  ```

- **Assertion Functions (Control Flow Analysis):**
  ```typescript
  // Assertion function narrows type
  function assert(condition: unknown, message: string): asserts condition {
    if (!condition) {
      throw new Error(message);
    }
  }
  
  function processValue(value: string | null) {
    assert(value !== null, 'Value cannot be null');
    // After assert, TypeScript knows value is string
    console.log(value.toUpperCase());
  }
  
  // Assert specific type
  function assertIsString(value: unknown): asserts value is string {
    if (typeof value !== 'string') {
      throw new Error('Not a string');
    }
  }
  
  function process(input: unknown) {
    assertIsString(input);
    console.log(input.toUpperCase()); // ✅ TypeScript knows it's string
  }
  ```

- **Template Literal Types in Functions:**
  ```typescript
  // Type-safe event emitter
  type EventName = 'user:login' | 'user:logout' | 'order:created';
  
  function emit(event: EventName, data: unknown): void {
    console.log(`Event: ${event}`, data);
  }
  
  emit('user:login', { id: 1 });    // ✅
  emit('invalid:event', {});        // ❌ Error
  
  // Generate types from template
  type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';
  type Endpoint = `/api/${string}`;
  
  function request(method: HTTPMethod, endpoint: Endpoint): void {
    console.log(`${method} ${endpoint}`);
  }
  
  request('GET', '/api/users');     // ✅
  request('GET', '/users');         // ❌ Error: must start with /api/
  ```

- **Best Practices:**
  ```typescript
  // ✅ Good: Explicit return type
  function calculateTotal(items: number[]): number {
    return items.reduce((sum, n) => sum + n, 0);
  }
  
  // ❌ Bad: Implicit return (harder to catch errors)
  function calculateTotal(items: number[]) {
    return items.reduce((sum, n) => sum + n, 0);
  }
  
  // ✅ Good: Narrow types
  type Status = 'pending' | 'success' | 'error';
  function setStatus(status: Status): void {}
  
  // ❌ Bad: Too broad
  function setStatus(status: string): void {}
  
  // ✅ Good: Use generics for reusability
  function wrapInArray<T>(value: T): T[] {
    return [value];
  }
  
  // ❌ Bad: Specific types (less reusable)
  function wrapStringInArray(value: string): string[] {
    return [value];
  }
  
  // ✅ Good: Optional parameter last
  function createUser(name: string, age?: number): User {}
  
  // ❌ Bad: Optional parameter first
  function createUser(age?: number, name: string): User {}
  ```

- **Real-World Example (API Client):**
  ```typescript
  interface ApiResponse<T> {
    data: T;
    status: number;
    message: string;
  }
  
  interface User {
    id: number;
    name: string;
    email: string;
  }
  
  async function fetchAPI<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<ApiResponse<T>> {
    const response = await fetch(endpoint, options);
    return response.json();
  }
  
  // Usage with type inference
  async function getUser(id: number): Promise<User> {
    const response = await fetchAPI<User>(`/api/users/${id}`);
    return response.data;
  }
  
  const user = await getUser(1);
  console.log(user.name); // ✅ TypeScript knows all User properties
  ```