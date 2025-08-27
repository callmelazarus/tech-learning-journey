# Equality Comparisons and Sameness in JavaScript

JavaScript provides multiple ways to compare values for equality, each with its own rules and quirks. Understanding these is crucial for writing reliable code.

## Types of Equality

### 1. Strict Equality (`===`)
- Compares both value and type.
- No type coercion.

```js
0 === false // false
'1' === 1   // false
1 === 1     // true
```

### 2. Loose Equality (`==`)
- Compares values after type coercion.
- Can lead to unexpected results.

```js
0 == false  // true
'1' == 1    // true
null == undefined // true
```

### 3. Object Reference Equality
- Objects and arrays are compared by reference, not by value.

```js
const a = [1];
const b = [1];
a == b      // false
a === b     // false
const c = a;
a === c     // true
```

## Special Cases and Quirks

- `NaN` is not equal to itself:
  ```js
  NaN === NaN // false
  Object.is(NaN, NaN) // true
  ```
- `+0` and `-0` are considered equal by `==` and `===`, but not by `Object.is`:
  ```js
  +0 === -0 // true
  Object.is(+0, -0) // false
  ```
- `null` and `undefined` are loosely equal but not strictly equal:
  ```js
  null == undefined // true
  null === undefined // false
  ```

## Common Mistakes

- Using `==` instead of `===` can cause bugs due to type coercion.
- Comparing objects or arrays by value (use deep comparison libraries if needed).
- Forgetting that `NaN !== NaN`.

## Best Practices

- Prefer `===` for most comparisons.
- Use `Object.is` for edge cases (`NaN`, `+0`, `-0`).
- For deep equality, use libraries like Lodash's `_.isEqual`.

## Resources

- [MDN: Equality comparisons and sameness](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Equality_comparisons_and_sameness)
- [MDN: Object.is()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is)
-