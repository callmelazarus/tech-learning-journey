# Currying Functions: Complete Overview

Currying is a functional programming technique that transforms a function with multiple arguments into a sequence of functions, each taking a single argument. Instead of calling `add(2, 3)`, a curried version would be `add(2)(3)`. Think of currying like a vending machine that requires multiple coins inserted one at a time, rather than all at once—each coin (argument) unlocks the next slot until you get your product (result).

## Key Points

- **Definition:** Transforms `f(a, b, c)` into `f(a)(b)(c)`
- **Partial Application:** Create specialized functions by providing arguments incrementally
- **Reusability:** Build new functions from existing ones without rewriting logic
- **Composition:** Makes functions easier to compose and chain
- **Arity:** Each curried function takes exactly one argument

## What is Currying?

Currying converts a function that takes multiple arguments into a series of unary (single-argument) functions.

```javascript
// Regular function
function add(a, b, c) {
  return a + b + c;
}

add(2, 3, 4); // 9

// Curried function
function addCurried(a) {
  return function(b) {
    return function(c) {
      return a + b + c;
    };
  };
}

addCurried(2)(3)(4); // 9

// Arrow function syntax (cleaner)
const addCurried = a => b => c => a + b + c;
addCurried(2)(3)(4); // 9
```

## Why Use Currying?

### 1. Partial Application

Create specialized functions by pre-filling arguments:

```javascript
// Curried multiply function
const multiply = x => y => x * y;

// Create specialized functions
const double = multiply(2);
const triple = multiply(3);
const quadruple = multiply(4);

console.log(double(5));     // 10
console.log(triple(5));     // 15
console.log(quadruple(5));  // 20

// Without currying, you'd need:
function createMultiplier(x) {
  return function(y) {
    return x * y;
  };
}
```

### 2. Function Composition

Curried functions compose naturally:

```javascript
// Curried functions
const add = x => y => x + y;
const multiply = x => y => x * y;
const subtract = x => y => y - x;

// Compose operations
const addThenDouble = x => multiply(2)(add(5)(x));
console.log(addThenDouble(10)); // (10 + 5) * 2 = 30

// More readable with composition helper
const compose = (...fns) => x => fns.reduceRight((v, f) => f(v), x);

const addFive = add(5);
const doubleIt = multiply(2);

const addThenDouble2 = compose(doubleIt, addFive);
console.log(addThenDouble2(10)); // 30
```

### 3. Code Reusability

```javascript
// Generic logger
const log = level => message => timestamp => 
  console.log(`[${timestamp}] ${level}: ${message}`);

// Create specialized loggers
const info = log('INFO');
const error = log('ERROR');
const debug = log('DEBUG');

// Use specialized loggers
info('Server started')(new Date().toISOString());
// [2024-12-19T10:30:00.000Z] INFO: Server started

error('Connection failed')(new Date().toISOString());
// [2024-12-19T10:30:00.000Z] ERROR: Connection failed

// Even more specialized
const errorNow = error('Database connection failed');
errorNow(new Date().toISOString());
```

## Practical Examples

### Example 1: API Request Builder

```javascript
// Curried fetch wrapper
const apiRequest = method => url => headers => body => 
  fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  }).then(res => res.json());

// Create specialized request functions
const get = apiRequest('GET');
const post = apiRequest('POST');
const put = apiRequest('PUT');
const del = apiRequest('DELETE');

// Create API-specific functions
const apiGet = get('https://api.example.com');
const apiPost = post('https://api.example.com');

// Add default headers
const authGet = apiGet({ 'Authorization': 'Bearer token123' });
const authPost = apiPost({ 
  'Authorization': 'Bearer token123',
  'Content-Type': 'application/json'
});

// Use specialized functions
authGet(null);  // GET request with auth
authPost({ name: 'John' });  // POST request with auth and body

// Real usage
const getUsers = authGet;
const createUser = authPost;

getUsers(null);
createUser({ name: 'Alice', email: 'alice@example.com' });
```

### Example 2: Event Handlers

```javascript
// Curried event handler
const handleEvent = eventType => callback => element => 
  element.addEventListener(eventType, callback);

// Specialized handlers
const onClick = handleEvent('click');
const onInput = handleEvent('input');
const onSubmit = handleEvent('submit');

// Create specific callbacks
const logClick = onClick(() => console.log('Clicked!'));
const validateInput = onInput(e => console.log('Value:', e.target.value));

// Apply to elements
const button = document.getElementById('myButton');
const input = document.getElementById('myInput');

logClick(button);
validateInput(input);

// One-liner usage
onClick(() => alert('Hello'))(document.getElementById('btn'));
```

### Example 3: Discount Calculator

```javascript
// Curried discount function
const applyDiscount = discountPercent => price => 
  price * (1 - discountPercent / 100);

// Create discount tiers
const tenPercentOff = applyDiscount(10);
const twentyPercentOff = applyDiscount(20);
const fiftyPercentOff = applyDiscount(50);

// Apply discounts
console.log(tenPercentOff(100));     // 90
console.log(twentyPercentOff(100));  // 80
console.log(fiftyPercentOff(100));   // 50

// Use in pricing system
const prices = [100, 200, 300];
const discountedPrices = prices.map(twentyPercentOff);
console.log(discountedPrices); // [80, 160, 240]
```

### Example 4: Data Validation

```javascript
// Curried validators
const isGreaterThan = min => value => value > min;
const isLessThan = max => value => value < max;
const isLength = length => str => str.length === length;
const matches = regex => str => regex.test(str);

// Create specific validators
const isAdult = isGreaterThan(17);
const isValidAge = isLessThan(120);
const isZipCode = isLength(5);
const isEmail = matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);

// Use validators
console.log(isAdult(25));           // true
console.log(isValidAge(150));       // false
console.log(isZipCode('12345'));    // true
console.log(isEmail('test@example.com')); // true

// Combine validators
const validateAge = age => isAdult(age) && isValidAge(age);
console.log(validateAge(25));  // true
console.log(validateAge(15));  // false
```

### Example 5: Array Transformations

```javascript
// Curried map, filter, reduce
const map = fn => arr => arr.map(fn);
const filter = fn => arr => arr.filter(fn);
const reduce = fn => initial => arr => arr.reduce(fn, initial);

// Create transformations
const doubleAll = map(x => x * 2);
const evensOnly = filter(x => x % 2 === 0);
const sum = reduce((acc, x) => acc + x)(0);

const numbers = [1, 2, 3, 4, 5];

console.log(doubleAll(numbers));  // [2, 4, 6, 8, 10]
console.log(evensOnly(numbers));  // [2, 4]
console.log(sum(numbers));        // 15

// Compose transformations
const sumOfDoubledEvens = arr => 
  sum(doubleAll(evensOnly(arr)));

console.log(sumOfDoubledEvens(numbers)); // (2 + 4) * 2 = 12
```

## Auto-Currying Utility

```javascript
// Utility to curry any function
function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) {
      return fn.apply(this, args);
    } else {
      return function(...args2) {
        return curried.apply(this, args.concat(args2));
      };
    }
  };
}

// Use with any function
function add(a, b, c) {
  return a + b + c;
}

const curriedAdd = curry(add);

console.log(curriedAdd(1)(2)(3));        // 6
console.log(curriedAdd(1, 2)(3));        // 6
console.log(curriedAdd(1)(2, 3));        // 6
console.log(curriedAdd(1, 2, 3));        // 6

// Real-world example
function buildUrl(protocol, domain, path) {
  return `${protocol}://${domain}${path}`;
}

const curriedBuildUrl = curry(buildUrl);

const https = curriedBuildUrl('https');
const httpsExample = https('example.com');

console.log(httpsExample('/api/users'));     // https://example.com/api/users
console.log(httpsExample('/api/products'));  // https://example.com/api/products
```

## Currying vs Partial Application

```javascript
// Currying: Always one argument at a time
const curriedAdd = a => b => c => a + b + c;
curriedAdd(1)(2)(3); // 6

// Partial Application: Can take multiple arguments
function add(a, b, c) {
  return a + b + c;
}

const partialAdd = (a, b) => c => add(a, b, c);
partialAdd(1, 2)(3); // 6

// Currying is a special case of partial application
// where each function takes exactly one argument
```

## Common Pitfalls

- Over-currying simple functions (adds unnecessary complexity)
- Confusing currying with partial application
- Loss of performance (function call overhead)
- Debugging difficulties (deep call stacks)
- Not compatible with variadic functions (variable arguments)

## When to Use Currying

```javascript
// ✅ Good: Configuration functions
const createLogger = level => prefix => message => 
  console.log(`[${prefix}] ${level}: ${message}`);

const appLogger = createLogger('INFO')('MyApp');
appLogger('Server started');

// ✅ Good: Reusable transformations
const multiply = x => y => x * y;
const double = multiply(2);
[1, 2, 3].map(double); // [2, 4, 6]

// ✅ Good: Function composition
const add5 = add(5);
const double = multiply(2);
const add5ThenDouble = compose(double, add5);

// ❌ Bad: Unnecessary for simple operations
const add = a => b => a + b;  // Overkill for simple addition
// Just use: (a, b) => a + b
```

## Libraries with Currying

```javascript
// Ramda (functional programming library)
import * as R from 'ramda';

const add = R.add;
const addFive = add(5);
console.log(addFive(10)); // 15

// All Ramda functions are curried
const users = [
  { name: 'Alice', age: 25 },
  { name: 'Bob', age: 30 }
];

const getName = R.prop('name');
const names = R.map(getName)(users);
console.log(names); // ['Alice', 'Bob']

// Lodash (with fp module)
import fp from 'lodash/fp';

const map = fp.map;
const filter = fp.filter;
const flow = fp.flow;

const isEven = x => x % 2 === 0;
const double = x => x * 2;

const processNumbers = flow(
  filter(isEven),
  map(double)
);

console.log(processNumbers([1, 2, 3, 4])); // [4, 8]
```

## References

- [Haskell Curry (Mathematician)](https://en.wikipedia.org/wiki/Haskell_Curry)
- [Functional Programming in JavaScript](https://eloquentjavascript.net/)
- [Ramda Documentation](https://ramdajs.com/)
- [Lodash FP Guide](https://github.com/lodash/lodash/wiki/FP-Guide)

---

## Quick Summary

**Currying transforms:**
```javascript
f(a, b, c) → f(a)(b)(c)
```

**Benefits:**
- Partial application → specialized functions
- Better composition → chainable operations
- Reusability → DRY code

**Use when:**
- Creating function families (loggers, validators)
- Building pipelines (data transformations)
- Functional programming patterns

**Avoid when:**
- Simple, one-off operations
- Performance critical code
- Team unfamiliar with FP concepts