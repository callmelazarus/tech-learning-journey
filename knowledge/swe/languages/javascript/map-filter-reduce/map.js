// Practice: JavaScript Array.map()

// 1. Square each number in the array
const numbers = [1, 2, 3, 4, 5];
const squares = numbers.map(n => n * n);
console.log('Squares:', squares); // [1, 4, 9, 16, 25]

// 2. Convert an array of strings to uppercase
const words = ['hello', 'world', 'javascript'];
const upperWords = words.map(word => word.toUpperCase());
console.log('Uppercase Words:', upperWords); // ['HELLO', 'WORLD', 'JAVASCRIPT']

// 3. Extract a property from an array of objects
const users = [
  { name: 'Alice', age: 25 },
  { name: 'Bob', age: 30 },
  { name: 'Carol', age: 22 }
];
const names = users.map(user => user.name);
console.log('Names:', names); // ['Alice', 'Bob', 'Carol']

// 4. Add index to each element
const indexed = numbers.map((num, idx) => `${idx}: ${num}`);
console.log('Indexed:', indexed); // ['0: 1', '1: 2', ...]

// 5. Practice: Write your own map example below
// Example: Double each number
const doubled = numbers.map(n => n * 2);
console.log('Doubled:', doubled); // [2, 4,