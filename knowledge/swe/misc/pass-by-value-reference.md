# Passing by Value vs Passing by Reference in JavaScript: A Well-Structured Overview

JavaScript uses pass-by-value for primitives (copying the value) and pass-by-reference for objects (copying the reference pointer), affecting how function arguments behave when modified inside functions.

## Key Points

- **Definition:** Pass-by-value creates a copy of the data, while pass-by-reference passes a pointer to the original data's memory location.
- **Primitives (Pass-by-Value):** Numbers, strings, booleans, `null`, `undefined`, symbols, and BigInts are copied when passed to functions.
- **Objects (Pass-by-Reference):** Objects, arrays, functions, dates, and other non-primitives pass references to the original data.
- **Immutability:** Reassigning a parameter breaks the reference, but mutating object properties affects the original.
- **Memory Efficiency:** References avoid copying large data structures, but create potential for unintended side effects.
- **Common Confusion:** JavaScript is technically always pass-by-value, but for objects it passes the reference value itself.
- **Best Practice:** Treat function parameters as immutable—avoid modifying objects passed as arguments to prevent bugs.

## Step-by-Step Explanation & Examples

**Pass-by-Value (Primitives)**
```javascript
// Primitives: number, string, boolean, null, undefined, symbol, BigInt

function modifyPrimitive(num) {
  num = num + 10;        // Creates new value, doesn't affect original
  console.log("Inside:", num);
}

let x = 5;
modifyPrimitive(x);      // Inside: 15
console.log("Outside:", x); // Outside: 5 (unchanged)

// Explanation:
// 1. x holds value 5
// 2. Function receives COPY of 5 in parameter 'num'
// 3. num = num + 10 creates new value 15, stored in 'num'
// 4. Original x remains 5 (no connection to 'num')

// Same behavior with strings
function modifyString(str) {
  str = str + " World";  // Creates new string, doesn't affect original
  return str;
}

let greeting = "Hello";
modifyString(greeting);    // Returns "Hello World"
console.log(greeting);     // "Hello" (unchanged)
```

**Pass-by-Reference (Objects)**
```javascript
// Objects: objects, arrays, functions, dates, etc.

function modifyObject(obj) {
  obj.name = "Bob";      // Modifies ORIGINAL object via reference
  obj.age = 30;
  console.log("Inside:", obj);
}

let user = { name: "Alice", age: 25 };
modifyObject(user);       // Inside: { name: "Bob", age: 30 }
console.log("Outside:", user); // Outside: { name: "Bob", age: 30 } (CHANGED!)

// Explanation:
// 1. user points to object in memory at address 0x001
// 2. Function receives COPY of reference (also points to 0x001)
// 3. obj.name modifies object at 0x001
// 4. Original user still points to 0x001, sees modifications

// Reassignment breaks the reference
function reassignObject(obj) {
  obj = { name: "Charlie", age: 35 };  // Creates NEW object, breaks reference
  console.log("Inside:", obj);
}

let person = { name: "Alice", age: 25 };
reassignObject(person);    // Inside: { name: "Charlie", age: 35 }
console.log("Outside:", person); // Outside: { name: "Alice", age: 25 } (unchanged)

// Explanation:
// 1. person points to 0x001
// 2. Function receives copy of reference (points to 0x001)
// 3. obj = {...} creates NEW object at 0x002, reassigns 'obj' to point there
// 4. Original 'person' still points to 0x001, unaffected

// Arrays behave identically
function modifyArray(arr) {
  arr.push(4);           // Modifies original array
  arr[0] = 99;           // Modifies original array
  console.log("Inside:", arr);
}

let numbers = [1, 2, 3];
modifyArray(numbers);     // Inside: [99, 2, 3, 4]
console.log("Outside:", numbers); // Outside: [99, 2, 3, 4] (CHANGED!)

function reassignArray(arr) {
  arr = [7, 8, 9];       // Creates new array, breaks reference
  console.log("Inside:", arr);
}

let nums = [1, 2, 3];
reassignArray(nums);      // Inside: [7, 8, 9]
console.log("Outside:", nums); // Outside: [1, 2, 3] (unchanged)
```

**Avoiding Unintended Mutations**
```javascript
// Problem: Function mutates original object
function updateUser(user) {
  user.lastLogin = new Date();
  user.loginCount++;
  return user;  // Returns same object reference
}

const currentUser = { name: "Alice", loginCount: 5 };
const updated = updateUser(currentUser);
console.log(currentUser === updated);  // true (same object!)
console.log(currentUser.loginCount);   // 6 (mutated!)

// Solution 1: Spread operator (shallow copy)
function updateUserSafe(user) {
  return {
    ...user,                    // Copy all properties
    lastLogin: new Date(),      // Add/override properties
    loginCount: user.loginCount + 1
  };
}

const safeUpdated = updateUserSafe(currentUser);
console.log(currentUser === safeUpdated);    // false (different objects)
console.log(currentUser.loginCount);         // 6 (unchanged from before)
console.log(safeUpdated.loginCount);         // 7 (new object modified)

// Solution 2: Object.assign (shallow copy)
function updateUserAssign(user) {
  const copy = Object.assign({}, user);
  copy.lastLogin = new Date();
  copy.loginCount++;
  return copy;
}

// Solution 3: Deep copy for nested objects
function deepCopy(obj) {
  return JSON.parse(JSON.stringify(obj));  // Simple but has limitations
  // OR use structuredClone(obj) in modern browsers
}

const nested = { user: { name: "Bob", settings: { theme: "dark" } } };
const deepCopied = structuredClone(nested);
deepCopied.user.settings.theme = "light";
console.log(nested.user.settings.theme);     // "dark" (unchanged)
console.log(deepCopied.user.settings.theme); // "light" (independent copy)
```

## Common Pitfalls

- Assuming primitives behave like objects—modifying primitive parameters never affects the original.
- Mutating object parameters unintentionally—side effects cause bugs in other parts of code.
- Confusing reassignment with mutation—`obj = newObj` doesn't affect original, `obj.prop = value` does.
- Using shallow copies for nested objects—spread operator only copies first level, nested objects still share references.
- Forgetting arrays are objects—they behave like objects, not primitives.
- Relying on `JSON.parse(JSON.stringify())` for deep cloning—loses functions, dates, and special objects.
- Not documenting whether functions mutate arguments—leads to confusion about expected behavior.

## Practical Applications

- **Pure Functions:** Return new objects instead of mutating parameters for predictable, testable code.
- **State Management:** React/Redux require immutability—always create new state objects rather than mutating.
- **API Data Transformation:** Clone API responses before modifying to avoid affecting cached data.
- **Array Operations:** Use `.map()`, `.filter()`, `.slice()` instead of `.push()`, `.splice()` to avoid mutations.

**Example anecdote:** On a user profile page, I wrote a function to format user data for display. It modified the `user` object directly by adding formatted fields. Worked fine until another component tried displaying the same user—it showed the formatted data where it needed raw data. The bug was hard to trace because the mutation happened silently in a distant function. After switching to returning a new object with `{ ...user, formattedName: ... }`, both components worked correctly with independent data copies.

## References

- [MDN: Primitive Values](https://developer.mozilla.org/en-US/docs/Glossary/Primitive)
- [MDN: Object References](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)
- [JavaScript.info: Object Copying](https://javascript.info/object-copy)
- [MDN: structuredClone()](https://developer.mozilla.org/en-US/docs/Web/API/structuredClone)

## Greater Detail

### Advanced Concepts

- **Technical Accuracy:** JavaScript is always pass-by-value, but for objects it passes the reference value (pointer) by value—hence "pass-by-sharing."
- **Shallow vs Deep Copy:**
  - Shallow: Copies first level only. Spread `{...obj}`, `Object.assign()`, `[...arr]`
  - Deep: Recursively copies all nested levels. `structuredClone()`, `JSON.parse(JSON.stringify())`, Lodash `_.cloneDeep()`
- **structuredClone() Limitations:** Doesn't copy functions, DOM nodes, or getters/setters, but handles dates, maps, sets, typed arrays.
- **Immutable Data Patterns:** Libraries like Immer, Immutable.js provide efficient immutable operations for complex state.
- **Spread Operator Gotcha:** `{...obj}` creates shallow copy—nested objects still reference originals.
  ```javascript
  const original = { a: 1, nested: { b: 2 } };
  const copy = { ...original };
  copy.nested.b = 99;
  console.log(original.nested.b);  // 99 (nested object shared!)
  ```
- **Array Methods (Mutating vs Non-Mutating):**
  - Mutating: `push()`, `pop()`, `shift()`, `unshift()`, `splice()`, `sort()`, `reverse()`
  - Non-mutating: `map()`, `filter()`, `slice()`, `concat()`, `reduce()`, `toSorted()`, `toReversed()`
- **Const with Objects:** `const` prevents reassignment but allows mutation.
  ```javascript
  const obj = { x: 1 };
  obj = { x: 2 };      // Error: Assignment to constant
  obj.x = 2;           // Works: Mutation allowed
  ```
- **Object.freeze():** Prevents modifications to object properties (shallow freeze).
  ```javascript
  const frozen = Object.freeze({ a: 1, nested: { b: 2 } });
  frozen.a = 99;       // Silently fails (throws in strict mode)
  frozen.nested.b = 99; // Works (nested objects not frozen!)
  ```
- **Object.seal():** Prevents adding/removing properties but allows modifying existing ones.
- **Performance Considerations:** Cloning large objects is expensive—use references when possible, clone only when necessary.
- **WeakMap/WeakSet:** Hold weak references that don't prevent garbage collection—useful for metadata without memory leaks.
- **Proxy Objects:** Intercept and customize operations like property access, useful for immutability enforcement.
- **Copy-on-Write (COW):** Optimization where references are shared until modification, then copy is made (used in Immer).
- **Reference Equality:** `obj1 === obj2` checks if they reference the same object, not if contents are equal.
  ```javascript
  { a: 1 } === { a: 1 }  // false (different references)
  const x = { a: 1 };
  const y = x;
  x === y                // true (same reference)
  ```
- **Deep Equality:** Use libraries like Lodash `_.isEqual()` or custom recursive comparison for value-based equality.
- **Memory Management:** Unused references prevent garbage collection—set large objects to `null` when done.
- **Function Arguments Object:** `arguments` is array-like object containing all passed arguments (not true array).
- **Rest Parameters:** `...args` creates actual array, more modern than `arguments` object.