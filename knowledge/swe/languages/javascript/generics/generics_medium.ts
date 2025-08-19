// generics-intermediate.ts

// --- 1. Generic constraints with keyof ---
// Pick a property from an object safely.
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const user = { id: 1, name: "Ada", active: true };

const userName = getProperty(user, "name");   // string
const userActive = getProperty(user, "active"); // boolean
// getProperty(user, "email"); // ❌ Error: "email" not in user


// --- 2. Mapping types with generics ---
// Convert all values of an object into strings
type Stringify<T> = {
  [K in keyof T]: string;
};

type UserStrings = Stringify<typeof user>;
// { id: string; name: string; active: string }


// --- 3. Generic utility function ---
// Transform values of an object
function mapValues<T extends object, R>(
  obj: T,
  fn: (value: T[keyof T], key: keyof T) => R
): { [K in keyof T]: R } {
  const out = {} as { [K in keyof T]: R };
  for (const k in obj) {
    out[k] = fn(obj[k], k);
  }
  return out;
}

const lengths = mapValues(user, (val) => String(val).length);
// { id: number; name: number; active: number }


// --- 4. Conditional types with infer ---
// Extract the type inside a Promise
type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;

type A = UnwrapPromise<Promise<number>>;  // number
type B = UnwrapPromise<string>;           // string


// --- 5. Generic class with constraints ---
// A typed collection that only allows items with an id
interface Identifiable {
  id: number;
}

class Repository<T extends Identifiable> {
  private items: T[] = [];

  add(item: T): void {
    this.items.push(item);
  }

  findById(id: number): T | undefined {
    return this.items.find((item) => item.id === id);
  }
}

const repo = new Repository<{ id: number; name: string }>();
repo.add({ id: 1, name: "Ada" });
repo.add({ id: 2, name: "Grace" });

const found = repo.findById(1); // { id: 1, name: "Ada" } | undefined


// --- 6. Distributive conditional types ---
// Convert a union into nullable types
type Nullable<T> = T | null;

type U1 = Nullable<string>;          // string | null
type U2 = Nullable<string | number>; // (string | null) | (number | null)


// --- 7. Function overloads + generics ---
// Different return types based on input
function wrap<T>(value: T): { kind: "single"; value: T };
function wrap<T>(value: T[]): { kind: "many"; value: T[] };
function wrap<T>(value: T | T[]): any {
  if (Array.isArray(value)) {
    return { kind: "many", value };
  }
  return { kind: "single", value };
}

const w1 = wrap(42);       // { kind: "single"; value: number }
const w2 = wrap([1, 2, 3]); // { kind: "many"; value: number[] }

