// Practice: JavaScript Array.filter()

// --- Array.filter Signature ---
// array.filter(callback(currentValue, index, array), thisArg?)
// - callback: function to test each element, receives (currentValue, index, array)
// - thisArg (optional): value to use as 'this' inside callback

// The callback function for filter can take up to three arguments: currentValue, index, and array.
// In practice, you only need to use the arguments you care about.


// 1. Filter even numbers from an array
// Example: Keep only even numbers
const numbers = [1, 2, 3, 4, 5, 6];
const evens = numbers.filter(n => n % 2 === 0);
console.log('Evens:', evens); // [2, 4, 6]

// 2. Filter strings longer than 5 characters
const words = ['hello', 'world', 'javascript', 'cat'];
const longWords = words.filter(word => word.length > 5);
console.log('Long Words:', longWords); // ['javascript']

// 3. Filter objects based on a property
const users = [
  { name: 'Alice', active: true },
  { name: 'Bob', active: false },
  { name: 'Carol', active: true }
];
const activeUsers = users.filter(user => user.active);
console.log('Active Users:', activeUsers); // [{ name: 'Alice', ... }, { name: 'Carol', ... }]

// 4. Use index in the callback
// Example: Keep elements at even indexes
const evenIndex = numbers.filter((_, idx) => idx % 2 === 0);
console.log('Elements at Even Indexes:', evenIndex); // [1, 3, 5]

// 5. Practice: Write your own filter example below
// Example: Filter numbers greater than 3
const greaterThanThree = numbers.filter(n => n > 3);
console.log('Greater Than Three:', greaterThanThree); // [4, 5, 6]

// --- Advanced: Using thisArg ---
// Example: Use a context object as 'this' in the callback
const threshold = {
  min: 4
};
const aboveThreshold = numbers.filter(function(n) {
  return n >= this.min;
}, threshold);
console.log('Above Threshold (using thisArg):', aboveThreshold); // [4, 5, 6]