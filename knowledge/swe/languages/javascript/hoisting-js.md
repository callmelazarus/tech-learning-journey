# JavaScript Hoisting: Complete Overview

Hoisting is JavaScript's behavior of moving variable and function declarations to the top of their scope during compilation, before code execution. This means you can reference variables and functions before they appear in the code, though the behavior differs between `var`, `let`, `const`, and function declarations. Think of it like JavaScript reading through your entire script first, making note of all declarations, then executing—it "knows about" things before it reaches them.

## Key Points

- **What Happens:** Declarations move to top of scope, assignments stay in place
- **var:** Hoisted and initialized to `undefined`
- **let/const:** Hoisted but not initialized (Temporal Dead Zone)
- **Functions:** Fully hoisted (declaration + definition)
- **Not Magic:** Happens during compilation phase, not runtime

## Basic Examples

### var Hoisting

```javascript
// What you write
console.log(x);  // undefined (not error!)
var x = 5;
console.log(x);  // 5

// How JavaScript interprets it (conceptually)
var x;           // Declaration hoisted
console.log(x);  // undefined
x = 5;           // Assignment stays in place
console.log(x);  // 5
```

### let/const Hoisting (Temporal Dead Zone)

```javascript
// What you write
console.log(y);  // ❌ ReferenceError: Cannot access 'y' before initialization
let y = 10;

// How it works
// let y is hoisted, but NOT initialized
// Accessing it before declaration = Temporal Dead Zone (TDZ)
let y;           // Declaration hoisted but in TDZ
console.log(y);  // ❌ Error - still in TDZ
y = 10;          // Now initialized

// Same for const
console.log(z);  // ❌ ReferenceError
const z = 20;
```

### Function Hoisting

```javascript
// Function declarations are fully hoisted
greet();  // ✅ "Hello!" (works before declaration)

function greet() {
  console.log("Hello!");
}

// Function expressions are NOT fully hoisted
sayHi();  // ❌ TypeError: sayHi is not a function

var sayHi = function() {
  console.log("Hi!");
};

// Interpreted as:
var sayHi;           // Variable hoisted (undefined)
sayHi();             // ❌ undefined() - not a function yet
sayHi = function() { // Assignment happens here
  console.log("Hi!");
};
```

## Hoisting by Declaration Type

### var (Hoisted + Initialized to undefined)

```javascript
console.log(a);  // undefined
var a = 1;
console.log(a);  // 1

// Hoisting in loops
console.log(i);  // undefined
for (var i = 0; i < 3; i++) {
  // i is hoisted to function/global scope
}
console.log(i);  // 3 (still accessible!)

// Hoisting in functions
function test() {
  console.log(x);  // undefined
  var x = 10;
  console.log(x);  // 10
}
```

### let (Hoisted but TDZ)

```javascript
console.log(b);  // ❌ ReferenceError
let b = 2;

// Block scoped - not hoisted out of block
{
  console.log(c);  // ❌ ReferenceError
  let c = 3;
}
// console.log(c);  // ❌ ReferenceError: c is not defined

// Loops - block scoped
for (let i = 0; i < 3; i++) {
  // i is scoped to this block
}
// console.log(i);  // ❌ ReferenceError: i is not defined
```

### const (Same as let, but must initialize)

```javascript
console.log(d);  // ❌ ReferenceError
const d = 4;

// Must initialize when declared
const e;  // ❌ SyntaxError: Missing initializer
e = 5;

// Also block scoped with TDZ
{
  const f = 6;
}
// console.log(f);  // ❌ ReferenceError
```

### Function Declarations (Fully Hoisted)

```javascript
// ✅ Works - function fully hoisted
doSomething();

function doSomething() {
  console.log("Doing something");
}

// Functions hoist above variables
console.log(typeof myFunc);  // "function"
console.log(typeof myVar);   // "undefined"

function myFunc() {}
var myVar = 1;
```

### Function Expressions (Not Fully Hoisted)

```javascript
// ❌ TypeError: notHoisted is not a function
notHoisted();

var notHoisted = function() {
  console.log("Won't work");
};

// With let/const
alsoNotHoisted();  // ❌ ReferenceError

const alsoNotHoisted = function() {
  console.log("Still won't work");
};

// Arrow functions same as function expressions
arrowFunc();  // ❌ ReferenceError

const arrowFunc = () => console.log("Nope");
```

## Scope and Hoisting

### Function Scope (var)

```javascript
function example() {
  console.log(x);  // undefined (hoisted to function top)
  
  if (true) {
    var x = 10;
  }
  
  console.log(x);  // 10
}

// Interpreted as:
function example() {
  var x;           // Hoisted to function scope
  console.log(x);  // undefined
  
  if (true) {
    x = 10;        // Assignment
  }
  
  console.log(x);  // 10
}
```

### Block Scope (let/const)

```javascript
function example() {
  console.log(y);  // ❌ ReferenceError (TDZ)
  
  if (true) {
    let y = 20;    // Block scoped
    console.log(y);  // 20
  }
  
  console.log(y);  // ❌ ReferenceError (not in scope)
}

// let/const hoisted to block, not function
```

## Common Gotchas

### 1. var in Loops

```javascript
// ❌ Common mistake with var
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100);
}
// Output: 3, 3, 3 (all closures reference same i)

// ✅ Fix with let (block scoped)
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100);
}
// Output: 0, 1, 2 (each iteration has its own i)
```

### 2. Function vs Variable Name Collision

```javascript
// Functions hoist above variables
console.log(typeof foo);  // "function"

var foo = 'variable';
function foo() {
  return 'function';
}

console.log(typeof foo);  // "string"

// Interpreted as:
function foo() { return 'function'; }  // Function hoisted first
var foo;                               // Variable declaration (ignored - already declared)
console.log(typeof foo);               // "function"
foo = 'variable';                      // Assignment
console.log(typeof foo);               // "string"
```

### 3. Temporal Dead Zone Edge Cases

```javascript
// ❌ TDZ applies even in weird cases
let x = x + 1;  // ReferenceError: x is not defined
// x is in TDZ when trying to read it for assignment

// ✅ Works with var (undefined + 1 = NaN)
var y = y + 1;
console.log(y);  // NaN (undefined + 1)

// TDZ in default parameters
function test(a = b, b = 2) {  // ❌ ReferenceError
  return a + b;
}
// b is in TDZ when evaluating default for a

function test(a = 1, b = a) {  // ✅ Works
  return a + b;
}
```

### 4. Class Hoisting

```javascript
// Classes are hoisted but in TDZ
const instance = new MyClass();  // ❌ ReferenceError

class MyClass {
  constructor() {}
}

// Must declare before use
class MyClass {
  constructor() {}
}
const instance = new MyClass();  // ✅ Works
```

## Best Practices

```javascript
// ✅ Declare variables at top of scope
function good() {
  let x, y, z;  // Clear what's in scope
  
  x = 1;
  y = 2;
  z = x + y;
}

// ❌ Rely on hoisting
function bad() {
  console.log(x);  // Confusing
  var x = 1;
}

// ✅ Use let/const instead of var
let count = 0;
const MAX = 100;

// ❌ Use var (function scoped, hoisting confusion)
var count = 0;

// ✅ Declare functions before use (even though they hoist)
function calculate() {
  return add(1, 2);
}

function add(a, b) {
  return a + b;
}

// ❌ Depend on function hoisting
doSomething();  // Confusing to readers

function doSomething() {}
```

## Hoisting Summary Table

| Type | Hoisted? | Initialized? | TDZ? | Scope |
|------|----------|--------------|------|-------|
| `var` | ✅ Yes | ✅ `undefined` | ❌ No | Function |
| `let` | ✅ Yes | ❌ No | ✅ Yes | Block |
| `const` | ✅ Yes | ❌ No | ✅ Yes | Block |
| Function Declaration | ✅ Yes | ✅ Full definition | ❌ No | Function |
| Function Expression | Depends on `var`/`let`/`const` | ❌ No | Depends | Depends |
| Class | ✅ Yes | ❌ No | ✅ Yes | Block |

## Quick Rules

```javascript
// var - avoid
var x = 1;  // Hoisted, initialized to undefined, function scoped

// let - use for variables that change
let y = 2;  // Hoisted, TDZ, block scoped

// const - use by default
const z = 3;  // Hoisted, TDZ, block scoped, immutable binding

// Function declarations - fully hoisted
function foo() {}  // Can call before declaration (but don't)

// Function expressions/arrows - not fully hoisted
const bar = () => {};  // Must declare before use
```

## References

- [MDN: Hoisting](https://developer.mozilla.org/en-US/docs/Glossary/Hoisting)
- [ES6 Temporal Dead Zone](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/let#temporal_dead_zone_tdz)
- [You Don't Know JS](https://github.com/getify/You-Dont-Know-JS)

---

## Summary

**Hoisting:** Declarations move to top of scope during compilation.

**var:** Hoisted + initialized to `undefined` → can use before declaration (confusing!)

**let/const:** Hoisted but TDZ → can't use before declaration (safer)

**Functions:** Fully hoisted → work before declaration (but declare first anyway)

**Rule of thumb:** Use `const` by default, `let` when needed, avoid `var`. Don't rely on hoisting—declare before use.