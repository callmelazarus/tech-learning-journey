# JavaScript JSON Revivers & Replacers: Complete Overview

`JSON.parse()` and `JSON.stringify()` are workhorses you use every day — but most developers never touch their optional second arguments: the **reviver** and the **replacer**. These functions give you a hook into the serialization/deserialization process, letting you transform data on the way in and out of JSON.

> **Analogy:** Think of JSON like a shipping container. `stringify` packs the box, `parse` unpacks it. The **replacer** decides what goes *in* the box and how it's labeled. The **reviver** inspects each item *coming out* and can swap it for something better before handing it to you.

---

## Key Points

- **Replacer** is the 2nd argument to `JSON.stringify()` — controls what gets serialized and how.
- **Reviver** is the 2nd argument to `JSON.parse()` — transforms values as they're deserialized.
- Both receive every key-value pair and return the value to use (or `undefined` to omit it).
- Primary use cases: handling `Date` objects, filtering sensitive fields, type restoration, BigInt support.
- Neither is commonly needed for simple data — but invaluable when types matter.

---

## JSON.stringify() + Replacer

### Signature
```js
JSON.stringify(value, replacer, space)
```

The replacer can be:
- A **function** `(key, value) => newValue` — called for every key-value pair
- An **array** of strings — a whitelist of keys to include

### Examples

1. **Function Replacer — Redact Sensitive Fields**
   ```js
   const user = { name: "Alice", password: "secret123", age: 30 };

   JSON.stringify(user, (key, value) => {
     if (key === 'password') return undefined; // omit this key entirely
     return value;
   });
   // '{"name":"Alice","age":30}'
   ```

2. **Function Replacer — Serialize Dates as ISO Strings**
   ```js
   const event = { title: "Launch", date: new Date('2025-06-01') };

   JSON.stringify(event, (key, value) => {
     if (value instanceof Date) return value.toISOString();
     return value;
   });
   // '{"title":"Launch","date":"2025-06-01T00:00:00.000Z"}'
   ```
   > Note: `JSON.stringify` already calls `.toISOString()` on Dates by default — but a replacer lets you customize the format (e.g., Unix timestamps).

3. **Function Replacer — Convert BigInt**
   ```js
   const data = { id: 9007199254740993n, name: "Record" };

   JSON.stringify(data, (key, value) => {
     if (typeof value === 'bigint') return value.toString();
     return value;
   });
   // '{"id":"9007199254740993","name":"Record"}'
   ```
   > Without this, `JSON.stringify` throws a `TypeError` on BigInt values.

4. **Array Replacer — Whitelist Keys**
   ```js
   const product = { id: 1, name: "Widget", internalCode: "X-99", price: 49.99 };

   JSON.stringify(product, ['id', 'name', 'price']);
   // '{"id":1,"name":"Widget","price":49.99}'
   ```
   > Clean and declarative — great for controlling API response shapes.

---

## JSON.parse() + Reviver

### Signature
```js
JSON.parse(text, reviver)
```

The reviver is a function `(key, value) => newValue` called bottom-up for every key-value pair as the JSON is parsed. Return the transformed value, or `undefined` to delete the key.

### Examples

1. **Revive Date Strings into Date Objects**
   ```js
   const json = '{"title":"Launch","date":"2025-06-01T00:00:00.000Z"}';

   const event = JSON.parse(json, (key, value) => {
     if (key === 'date') return new Date(value);
     return value;
   });

   event.date instanceof Date; // true
   event.date.getFullYear();   // 2025
   ```
   > This is the most common real-world use of revivers — JSON has no native Date type, so round-tripping them requires this pattern.

2. **Revive Nested Type with a Pattern Match**
   ```js
   const ISO_DATE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;

   const data = JSON.parse(json, (key, value) => {
     if (typeof value === 'string' && ISO_DATE.test(value)) {
       return new Date(value);
     }
     return value;
   });
   ```
   > More flexible — automatically revives any ISO date string regardless of key name.

3. **Restore BigInt from String**
   ```js
   const json = '{"id":"9007199254740993","name":"Record"}';

   const record = JSON.parse(json, (key, value) => {
     if (key === 'id') return BigInt(value);
     return value;
   });

   typeof record.id; // "bigint"
   ```

4. **Strip Keys on Parse**
   ```js
   const json = '{"name":"Alice","__meta":"internal","age":30}';

   JSON.parse(json, (key, value) => {
     if (key.startsWith('__')) return undefined; // drop internal keys
     return value;
   });
   // { name: 'Alice', age: 30 }
   ```

---

## Reviver Call Order: Bottom-Up

The reviver is called **leaf-first**, working up to the root. The final call is always with an empty string key `""` representing the root object.

```js
JSON.parse('{"a":{"b":1}}', (key, value) => {
  console.log(`key: "${key}", value:`, value);
  return value;
});
// key: "b", value: 1
// key: "a", value: { b: 1 }
// key: "",  value: { a: { b: 1 } }   ← root
```

> This matters when writing revivers that operate on nested structures — children are transformed before parents see them.

---

## Paired Pattern: Stringify + Parse Round-Trip

The real power comes from pairing a replacer with a reviver — serialize custom types out and restore them back in seamlessly.

```js
// Replacer: tag Dates with a type marker
const replacer = (key, value) => {
  if (value instanceof Date) return { __type: 'Date', iso: value.toISOString() };
  return value;
};

// Reviver: restore tagged Dates
const reviver = (key, value) => {
  if (value?.__type === 'Date') return new Date(value.iso);
  return value;
};

const original = { name: "Event", date: new Date('2025-06-01') };
const json = JSON.stringify(original, replacer);
const restored = JSON.parse(json, reviver);

restored.date instanceof Date; // true
```

---

## Common Pitfalls

- **Forgetting to `return value`** — if your replacer/reviver doesn't return for every case, keys silently disappear. Always have a default `return value`.
- **Reviver receives primitives too** — it's called for strings, numbers, booleans, not just objects. Guard with `typeof` checks.
- **`undefined` removes the key** — returning `undefined` from a replacer or reviver *deletes* that key. Intentional when redacting, a silent bug when accidental.
- **Root key is `""`** — the reviver's final call passes `""` as the key with the entire parsed object as the value. Don't accidentally filter it out.
- **Array replacer doesn't deep-filter** — it only controls top-level keys. Nested objects are included in full if their parent key is whitelisted.

---

## Practical Applications

- Safely serializing/deserializing `Date`, `Map`, `Set`, `BigInt`, or custom class instances
- Redacting sensitive fields (passwords, tokens) before logging or transmitting
- Whitelisting API response fields for lean payloads
- Building a lightweight custom serialization layer without a full library (e.g., `class-transformer`)
- Restoring typed domain objects from cached localStorage or IndexedDB JSON

---

## References

- [MDN: JSON.stringify() — replacer](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#the_replacer_parameter)
- [MDN: JSON.parse() — reviver](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse#using_the_reviver_parameter)
- [JavaScript.info: JSON methods](https://javascript.info/json)

---

## Greater Detail

### Advanced Concepts

- **Custom Class Serialization:** Implement a `toJSON()` method on any class — `JSON.stringify` calls it automatically before the replacer runs. Useful for controlling how instances of a class serialize without needing a replacer at the call site:
  ```js
  class Money {
    constructor(amount, currency) {
      this.amount = amount;
      this.currency = currency;
    }
    toJSON() {
      return `${this.amount} ${this.currency}`; // serialize as a string
    }
  }
  JSON.stringify({ price: new Money(49.99, 'USD') });
  // '{"price":"49.99 USD"}'
  ```

- **Performance:** For high-throughput serialization (e.g., large API responses), replacer functions add overhead per key. For hot paths, consider pre-shaping data before `stringify` rather than using a replacer.

- **`space` argument:** `JSON.stringify`'s third argument formats output with indentation — useful for debugging and log output:
  ```js
  JSON.stringify({ a: 1, b: [2, 3] }, null, 2);
  ```

- **Replacer + Reviver for Versioned Schemas:** In long-lived apps where stored JSON schemas evolve over time, a reviver can act as a migration layer — detecting old shapes and upgrading them to the current structure on read, without a separate migration script.