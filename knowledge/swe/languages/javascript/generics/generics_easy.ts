// generics-example.ts

// --- 1. Generic identity function ---
// Problem with `any`: you lose type info.
//   function identity(value: any): any { return value; }
//   const num = identity(42);  // num is "any", so you don't get autocompletion!
// Generics keep the type.
function identity<T>(value: T): T {
  return value;
}

const num = identity(42);            // type = number
const str = identity("Hello");       // type = string
const explicit = identity<string>("World"); // explicit type arg (rarely needed)


// --- 2. Generic array helper ---
// If you used `any[]`, the return type would always be `any`.
// With generics, TS knows "T" = element type of array.
function firstElement<T>(arr: T[]): T | undefined {
  return arr[0];
}

const n = firstElement([1, 2, 3]);       // number
const s = firstElement(["a", "b", "c"]); // string
const empty = firstElement([]);          // undefined


// --- 3. Generic interface ---
// Instead of making separate "NumberBox", "StringBox", etc.
interface Box<T> {
  value: T;
}

const numberBox: Box<number> = { value: 123 };
const stringBox: Box<string> = { value: "TypeScript" };


// --- 4. Generic constraint ---
// With `any`, you'd be able to pass in nonsense (e.g., 123).
// Adding "extends { length: number }" means T must have a length property.
function logLength<T extends { length: number }>(item: T): void {
  console.log("Length is:", item.length);
}

logLength("Hello");       // ✅ string has length
logLength([1, 2, 3]);     // ✅ array has length
// logLength(123);        // ❌ Error: number has no length


// --- 5. Generic class ---
// Useful when building reusable data structures (maps, queues, caches, etc.)
class KeyValuePair<K, V> {
  constructor(public key: K, public value: V) {}
}

const pair1 = new KeyValuePair("id", 101);    // K=string, V=number
const pair2 = new KeyValuePair(1, "Alice");   // K=number, V=string


// --- 6. Utility with generics ---
// Without generics, you'd return `any` and lose autocomplete.
// With generics + keyof, TypeScript ensures the key actually exists.
function pluck<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const person = { name: "Ada", age: 36 };
const nameVal = pluck(person, "name"); // string
const ageVal = pluck(person, "age");   // number
// pluck(person, "wrong");             // ❌ Error: key not in "person"
