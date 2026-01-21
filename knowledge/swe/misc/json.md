# JSON (JavaScript Object Notation): Complete Overview

JSON is a lightweight, text-based data format for exchanging information between systems. It uses human-readable key-value pairs and arrays, derived from JavaScript object syntax but language-independent. Think of JSON as the universal language of the web—like English became the common language for international air traffic control, JSON became the standard format for APIs and data exchange.

## Key Points

- **Format:** Text-based, human-readable data structure
- **Syntax:** Key-value pairs `{"key": "value"}` and arrays `[1, 2, 3]`
- **Language-Independent:** Works with any programming language
- **Use Cases:** APIs, configuration files, data storage, message passing
- **Types:** Strings, numbers, booleans, null, objects, arrays

## Brief History

```
1999: Douglas Crockford discovers subset of JavaScript for data exchange
2001: JSON.org published, spec formalized
2005: AJAX popularizes JSON for web APIs (replacing XML)
2013: ECMA-404 standard published
2017: RFC 8259 becomes Internet Standard
Today: De facto standard for web APIs

Why it won: Simpler than XML, human-readable, works everywhere
```

## Basic Syntax

### Data Types

```json
{
  "string": "Hello",
  "number": 42,
  "float": 3.14,
  "boolean": true,
  "null": null,
  "array": [1, 2, 3],
  "object": {
    "nested": "value"
  }
}
```

### Rules

```json
// ✅ Valid JSON
{
  "name": "John",
  "age": 30,
  "active": true,
  "skills": ["JavaScript", "Python"],
  "address": {
    "city": "New York",
    "zip": "10001"
  }
}

// ❌ Invalid JSON
{
  name: "John",           // Missing quotes on key
  'age': 30,              // Single quotes not allowed
  active: true,           // Missing quotes on key
  skills: [1, 2, 3,],     // Trailing comma
  comment: "test"         // Comments not allowed
}
```

## Parsing and Stringifying

### JavaScript

```javascript
// Parse: String → Object
const jsonString = '{"name":"John","age":30}';
const obj = JSON.parse(jsonString);
console.log(obj.name);  // "John"

// Stringify: Object → String
const user = { name: "Alice", age: 25 };
const json = JSON.stringify(user);
console.log(json);  // '{"name":"Alice","age":25}'

// Pretty print with indentation
const prettyJson = JSON.stringify(user, null, 2);
/*
{
  "name": "Alice",
  "age": 25
}
*/

// Stringify with filter
const filtered = JSON.stringify(user, ['name']);  // Only name field
console.log(filtered);  // '{"name":"Alice"}'
```

### Error Handling

```javascript
// Always wrap JSON.parse in try-catch
try {
  const data = JSON.parse(invalidJson);
} catch (error) {
  console.error('Invalid JSON:', error.message);
}

// Safe parse helper
function safeParse(jsonString, fallback = {}) {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    return fallback;
  }
}

const data = safeParse(response, { error: true });
```

### Other Languages

```python
# Python
import json

# Parse
data = json.loads('{"name": "John", "age": 30}')
print(data['name'])  # John

# Stringify
json_str = json.dumps({"name": "Alice", "age": 25})

# Pretty print
pretty = json.dumps(data, indent=2)
```

```java
// Java (using Jackson or Gson)
import com.fasterxml.jackson.databind.ObjectMapper;

ObjectMapper mapper = new ObjectMapper();

// Parse
User user = mapper.readValue(jsonString, User.class);

// Stringify
String json = mapper.writeValueAsString(user);
```

```go
// Go
import "encoding/json"

// Parse
var user User
json.Unmarshal([]byte(jsonString), &user)

// Stringify
jsonBytes, _ := json.Marshal(user)
```

## Common Use Cases

### 1. API Responses

```javascript
// HTTP Response from server
fetch('https://api.example.com/users/123')
  .then(response => response.json())
  .then(data => {
    console.log(data);
    // {
    //   "id": 123,
    //   "name": "John Doe",
    //   "email": "john@example.com"
    // }
  });

// API Request with JSON body
fetch('https://api.example.com/users', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Alice',
    email: 'alice@example.com'
  })
});
```

### 2. Configuration Files

```json
// package.json
{
  "name": "my-app",
  "version": "1.0.0",
  "scripts": {
    "start": "node index.js",
    "test": "jest"
  },
  "dependencies": {
    "express": "^4.18.0",
    "react": "^18.2.0"
  }
}

// .eslintrc.json
{
  "extends": "eslint:recommended",
  "rules": {
    "semi": ["error", "always"],
    "quotes": ["error", "single"]
  }
}

// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "strict": true
  }
}
```

### 3. Data Storage

```javascript
// LocalStorage
const user = { name: 'John', preferences: { theme: 'dark' } };
localStorage.setItem('user', JSON.stringify(user));

// Retrieve
const stored = JSON.parse(localStorage.getItem('user'));

// MongoDB (stores as BSON, but JSON-like)
db.users.insertOne({
  name: 'John',
  age: 30,
  skills: ['JavaScript', 'Python']
});
```

### 4. Message Passing

```javascript
// WebSocket message
const message = {
  type: 'chat',
  userId: 123,
  text: 'Hello',
  timestamp: Date.now()
};
socket.send(JSON.stringify(message));

// Receive
socket.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log(data.text);
};

// AWS EventBridge
const event = {
  Source: 'myapp',
  DetailType: 'User Created',
  Detail: JSON.stringify({
    userId: '123',
    email: 'user@example.com'
  })
};
```

## Advanced Techniques

### Custom Serialization

```javascript
// toJSON method controls serialization
class User {
  constructor(name, password) {
    this.name = name;
    this._password = password;
  }
  
  toJSON() {
    return {
      name: this.name
      // Password excluded from JSON
    };
  }
}

const user = new User('John', 'secret');
JSON.stringify(user);  // '{"name":"John"}'

// Replacer function
const obj = { name: 'John', password: 'secret', age: 30 };

JSON.stringify(obj, (key, value) => {
  if (key === 'password') return undefined;  // Exclude password
  return value;
});
// '{"name":"John","age":30}'
```

### Custom Parsing

```javascript
// Reviver function
const json = '{"name":"John","joined":"2024-01-19T10:30:00Z"}';

const obj = JSON.parse(json, (key, value) => {
  // Convert ISO strings to Date objects
  if (key === 'joined') {
    return new Date(value);
  }
  return value;
});

console.log(obj.joined instanceof Date);  // true
```

### Deep Clone

```javascript
// Simple deep clone (loses functions, dates become strings)
const original = { a: 1, b: { c: 2 } };
const clone = JSON.parse(JSON.stringify(original));

// What gets lost:
const complex = {
  date: new Date(),           // Becomes string
  func: () => {},             // Lost
  undefined: undefined,       // Lost
  symbol: Symbol('id'),       // Lost
  regex: /test/,              // Becomes {}
};

JSON.parse(JSON.stringify(complex));
// { date: "2024-01-19T10:30:00.000Z", regex: {} }
```

## JSON vs Other Formats

### JSON vs XML

```json
// JSON - concise
{
  "user": {
    "name": "John",
    "age": 30,
    "skills": ["JS", "Python"]
  }
}
```

```xml
<!-- XML - verbose -->
<user>
  <name>John</name>
  <age>30</age>
  <skills>
    <skill>JS</skill>
    <skill>Python</skill>
  </skills>
</user>
```

**JSON wins:** Smaller size, easier to parse, native JavaScript support

### JSON vs YAML

```json
// JSON - stricter syntax
{
  "name": "John",
  "age": 30,
  "active": true
}
```

```yaml
# YAML - more readable, supports comments
name: John
age: 30
active: true
# This is a comment
```

**Use JSON:** APIs, data exchange, strict validation
**Use YAML:** Config files (Kubernetes, Docker Compose), human editing

## Common Pitfalls

```javascript
// ❌ Trailing commas
const bad = '{"name": "John", "age": 30,}';
JSON.parse(bad);  // Error

// ❌ Single quotes
const bad = "{'name': 'John'}";
JSON.parse(bad);  // Error

// ❌ Comments
const bad = '{"name": "John" /* comment */}';
JSON.parse(bad);  // Error

// ❌ Undefined values
JSON.stringify({ a: undefined });  // '{}'
JSON.stringify({ a: null });       // '{"a":null}'

// ❌ Circular references
const obj = {};
obj.self = obj;
JSON.stringify(obj);  // TypeError: Converting circular structure

// ✅ Handle circular refs
function safeStringify(obj) {
  const seen = new WeakSet();
  return JSON.stringify(obj, (key, value) => {
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) return '[Circular]';
      seen.add(value);
    }
    return value;
  });
}
```

## Performance Tips

```javascript
// For large objects, streaming is better
// Node.js streams
const fs = require('fs');
const { Transform } = require('stream');

// Parse large JSON file
fs.createReadStream('large.json')
  .pipe(JSONStream.parse('*'))  // Streaming parser
  .on('data', (item) => {
    processItem(item);
  });

// For browsers, use response.json()
fetch('/api/large-data')
  .then(res => res.json())  // Optimized parsing
  .then(data => process(data));

// Avoid repeated stringify in loops
// ❌ Slow
for (let i = 0; i < 1000; i++) {
  const json = JSON.stringify(obj);  // Stringified 1000 times
  send(json);
}

// ✅ Fast
const json = JSON.stringify(obj);  // Stringified once
for (let i = 0; i < 1000; i++) {
  send(json);
}
```

## Validation

```javascript
// JSON Schema for validation
const schema = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    age: { type: 'number', minimum: 0 },
    email: { type: 'string', format: 'email' }
  },
  required: ['name', 'email']
};

// Using Ajv (validator library)
const Ajv = require('ajv');
const ajv = new Ajv();
const validate = ajv.compile(schema);

const data = { name: 'John', email: 'john@example.com' };
const valid = validate(data);

if (!valid) {
  console.log(validate.errors);
}
```

## Security Considerations

```javascript
// ❌ Never use eval() on JSON
const data = eval('(' + jsonString + ')');  // Dangerous!

// ✅ Always use JSON.parse
const data = JSON.parse(jsonString);  // Safe

// Validate untrusted JSON
function safeParse(text) {
  try {
    const obj = JSON.parse(text);
    
    // Validate structure
    if (typeof obj !== 'object') throw new Error('Invalid');
    if (obj === null) throw new Error('Invalid');
    
    return obj;
  } catch (error) {
    console.error('Invalid JSON:', error);
    return null;
  }
}

// Prevent prototype pollution
const parsed = JSON.parse('{"__proto__":{"polluted":"yes"}}');
// Safe - JSON.parse doesn't execute code

// But be careful with Object.assign
Object.assign({}, parsed);  // Could pollute prototype
```

## Tools

```bash
# CLI tools
echo '{"name":"John","age":30}' | jq '.name'  # Query JSON
cat file.json | jq .  # Pretty print

# Online tools
# - jsonlint.com - Validate JSON
# - jsonformatter.org - Format/validate
# - json-schema-validator.herokuapp.com - Schema validation
```

## References

- [JSON.org](https://www.json.org/)
- [RFC 8259 Standard](https://www.rfc-editor.org/rfc/rfc8259)
- [MDN: JSON](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON)
- [JSON Schema](https://json-schema.org/)

---

## Summary

**JSON:** Universal data format for exchanging information between systems.

**Syntax:** `{"key": "value"}` - keys in double quotes, six data types (string, number, boolean, null, object, array)

**Common Use:** APIs (request/response), config files, data storage, message passing

**In JavaScript:**
```javascript
JSON.parse(string)      // String → Object
JSON.stringify(object)  // Object → String
```

**Rule of thumb:** Use JSON for APIs and data exchange. Use YAML for human-edited configs. Always validate untrusted JSON.