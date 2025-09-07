# JavaScript `map`, `filter`, and `reduce`: A Practical Overview

JavaScript’s `map`, `filter`, and `reduce` are powerful ARRAY methods for transforming, selecting, and aggregating data. Mastering them leads to cleaner, more expressive code.

## Key Points

- **`map`** transforms each element in an array and returns a new array.
- **`filter`** selects elements based on a condition and returns a new array.
- **`reduce`** accumulates array values into a single result (e.g., sum, object).

- All three methods are non-mutating—they do not change the original array.
- They are often chained for complex data processing.

## Step-by-Step Explanation & Examples

### 1. `map`
Transforms each element.
```js
const nums = [1, 2, 3];
const squares = nums.map(n => n * n); // [1, 4, 9]
```

### 2. `filter`
Selects elements that match a condition.
```js
const nums = [1, 2, 3, 4];
const evens = nums.filter(n => n % 2 === 0); // [2, 4]
```

### 3. `reduce`
Reduces the array to a single value.
```js
const nums = [1, 2, 3, 4];
const sum = nums.reduce((acc, n) => acc + n, 0); // 10
```

## Common Pitfalls

- Forgetting to return a value in the callback (especially with `map` and `filter`).
- Using `reduce` without an initial value can cause errors with empty arrays.
- Expecting these methods to mutate the original array—they do not.

## Practical Applications

- Data transformation (e.g., formatting API results).
- Filtering lists (e.g., search, permissions).
- Aggregating data (e.g., totals, grouping).

## References

- [MDN: Array.prototype.map()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map)
- [MDN: Array.prototype.filter()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter)
- [MDN: Array.prototype.reduce()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce)