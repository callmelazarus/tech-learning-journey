// Practice: JavaScript Array.reduce()

// --- Array.reduce Signature ---
// array.reduce(callback(accumulator, currentValue, index, array), initialValue)
// - callback: function to execute on each element, receives (accumulator, currentValue, index, array)
// - initialValue: value to use as the first argument to the first call of the callback

// The callback function for filter can take up to three arguments: currentValue, index, and array.
// In practice, you only need to use the arguments you care about.

// 1. Sum all numbers in an array
const numbers = [1, 2, 3, 4, 5];
const sum = numbers.reduce((acc, n) => acc + n, 0);
console.log('Sum:', sum); // 15

// 2. Multiply all numbers in an array
const product = numbers.reduce((acc, n) => acc * n, 1);
console.log('Product:', product); // 120

// 3. Flatten an array of arrays
const arrays = [[1, 2], [3, 4], [5]];
const flat = arrays.reduce((acc, arr) => acc.concat(arr), []);
console.log('Flattened:', flat); // [1, 2, 3, 4, 5]

// 4. Count occurrences of values in an array
const fruits = ['apple', 'banana', 'apple', 'orange', 'banana', 'apple'];
const count = fruits.reduce((acc, fruit) => {
  acc[fruit] = (acc[fruit] || 0) + 1;
  return acc;
}, {});
console.log('Fruit Count:', count); // { apple: 3, banana: 2, orange: 1 }

// 5. Practice: Write your own reduce example below
// Example: Find the maximum value in an array
const max = numbers.reduce((acc, n) => (n > acc ? n : acc), numbers[0]);
console.log('Max:', max); // 5

// --- Advanced: Using index and array in the callback ---
// Example: Log each step of reduction
const logSteps = numbers.reduce((acc, n, idx, arr) => {
  console.log(`Step ${idx}: acc=${acc}, n=${n}, arr=${arr}`);
  return acc + n;
}, 0);
console.log('Logged Sum:', logSteps);