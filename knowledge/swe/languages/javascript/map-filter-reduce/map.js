// Practice: JavaScript Array.map()

// --- Array.map Signature ---
// array.map(callback(currentValue, index, array), thisArg?)
// - callback: function to execute on each element, receives (currentValue, index, array)
// - thisArg (optional): value to use as 'this' inside callback

// The callback function for map can take up to three arguments: currentValue, index, and array.
// In practice, you only need to use the arguments you care about.


// 1. Square each number in the array
// Example: Transform each number to its square
const numbers = [1, 2, 3, 4, 5];
const squares = numbers.map(n => n * n);
console.log('Squares:', squares); // [1, 4, 9, 16, 25]

// 2. Convert an array of strings to uppercase
// Example: Use map to transform each string to uppercase
const words = ['hello', 'world', 'javascript'];
const upperWords = words.map(word => word.toUpperCase());
console.log('Uppercase Words:', upperWords); // ['HELLO', 'WORLD', 'JAVASCRIPT']

// 3. Extract a property from an array of objects
// Example: Map over objects to extract the 'name' property
const users = [
  { name: 'Alice', age: 25 },
  { name: 'Bob', age: 30 },
  { name: 'Carol', age: 22 }
];
const names = users.map(user => user.name);
console.log('Names:', names); // ['Alice', 'Bob', 'Carol']

// 4. Add index to each element
// Example: Use both value and index in the callback
const indexed = numbers.map((num, idx) => `${idx}: ${num}`);
console.log('Indexed:', indexed); // ['0: 1', '1: 2', '2: 3', '3: 4', '4: 5']

// 5. Practice: Write your own map example below
// Example: Double each number
const doubled = numbers.map(n => n * 2);
console.log('Doubled:', doubled); // [2, 4, 6, 8, 10]

// --- Advanced: Using thisArg ---
// Example: Use a context object as 'this' in the callback
const multiplier = {
  factor: 3
};
const tripled = numbers.map(function(n) {
  return n * this.factor;
}, multiplier);
console.log('Tripled (using thisArg):', tripled); // [3, 6, 9, 12, 15]