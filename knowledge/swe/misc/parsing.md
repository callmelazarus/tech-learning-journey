# Parsing: Complete Overview

Parsing is the process of **taking raw input (usually text) and converting it into a structured format** that a program can understand and work with. Think of it like reading a sentence — your brain takes a stream of letters, groups them into words, identifies grammar, and extracts meaning. Parsing is the programmatic equivalent. It's foundational to nearly everything in software: compilers, APIs, configuration files, web browsers, databases, and CLI tools all depend on parsing.

## Key Points

- **Input → Structure:** Parsing transforms raw text/data into a structured representation (objects, trees, tokens).
- **Two Phases:** Most parsing involves **lexing** (breaking input into tokens) and **parsing** (organizing tokens into a structure).
- **Everywhere in Software:** JSON parsing, HTML rendering, SQL queries, compilers, regex, URL routing — all parsing.
- **Error Handling Matters:** Robust parsers handle malformed input gracefully, with clear error messages.
- **Trade-offs:** Hand-written parsers offer control; parser generators and libraries offer speed of development.

## The Two Phases of Parsing

Almost all parsing can be broken into two steps. Think of it like sorting mail — first you separate envelopes from junk (lexing), then you organize them into folders by category (parsing).

```
Raw Input (string)
      ↓
  ┌─────────┐
  │  Lexer  │  Phase 1: Break input into tokens (tokenization)
  └────┬────┘
       ↓
  Token Stream
       ↓
  ┌─────────┐
  │ Parser  │  Phase 2: Organize tokens into a meaningful structure
  └────┬────┘
       ↓
  Structured Output (AST, object, etc.)
```

### Phase 1: Lexing (Tokenization)

The lexer reads raw characters and groups them into **tokens** — the smallest meaningful units. Like how your eye groups letters into words before your brain processes grammar.

```js
// Input string
"const x = 42 + y;"

// After lexing → token stream
[
  { type: "keyword",    value: "const" },
  { type: "identifier", value: "x" },
  { type: "operator",   value: "=" },
  { type: "number",     value: "42" },
  { type: "operator",   value: "+" },
  { type: "identifier", value: "y" },
  { type: "semicolon",  value: ";" }
]
```

The lexer doesn't care about *meaning* — it doesn't know if `const x = 42 + y` makes sense. It just chunks the characters into labeled pieces.

### Phase 2: Parsing (Structural Analysis)

The parser takes the token stream and organizes it into a **tree structure** that represents the relationships between tokens. This is typically an **Abstract Syntax Tree (AST)**.

```js
// Token stream from above → AST
{
  type: "VariableDeclaration",
  kind: "const",
  declarations: [{
    type: "VariableDeclarator",
    id: { type: "Identifier", name: "x" },
    init: {
      type: "BinaryExpression",
      operator: "+",
      left: { type: "NumericLiteral", value: 42 },
      right: { type: "Identifier", name: "y" }
    }
  }]
}
```

Now the program understands: "declare a constant `x` whose value is the result of adding `42` and `y`."

## Step-by-Step Explanation & Examples

### 1. JSON Parsing (The Most Common Example)

JSON parsing is something you do daily, often without thinking about it. `JSON.parse()` is a parser.

```js
// Raw input — just a string
const raw = '{"name": "Alice", "age": 30, "hobbies": ["photography", "hiking"]}';

// Parsing — string → JavaScript object
const user = JSON.parse(raw);

// Now you have structured data
console.log(user.name);       // "Alice"
console.log(user.hobbies[0]); // "photography"
```

What `JSON.parse()` does under the hood:

```
'{"name": "Alice"}'
      ↓ lexer
["{", "name", ":", "Alice", "}"]
      ↓ parser
{ name: "Alice" }  ← usable JavaScript object
```

The reverse operation — `JSON.stringify()` — is called **serialization** (structured data → string). Parsing and serialization are opposites.

### 2. URL Parsing

```js
// Raw URL string
const raw = "https://api.example.com:8080/users/42?format=json&verbose=true#section1";

// Parsing with the URL constructor
const url = new URL(raw);

console.log(url.protocol); // "https:"
console.log(url.hostname); // "api.example.com"
console.log(url.port);     // "8080"
console.log(url.pathname); // "/users/42"
console.log(url.search);   // "?format=json&verbose=true"
console.log(url.hash);     // "#section1"

// Query parameter parsing
const params = new URLSearchParams(url.search);
console.log(params.get("format")); // "json"
```

A URL is just a string with a specific structure. Parsing it extracts the meaningful parts so you can work with them individually instead of doing string manipulation.

### 3. Building a Simple Parser by Hand

Let's parse a simple math expression like `"3 + 5 * 2"` step by step. This shows the core mechanics that every parser uses.

```js
// Step 1: Lexer — break string into tokens
function tokenize(input) {
  const tokens = [];
  let i = 0;

  while (i < input.length) {
    // Skip whitespace
    if (input[i] === " ") { i++; continue; }

    // Numbers (could be multi-digit)
    if (/[0-9]/.test(input[i])) {
      let num = "";
      while (i < input.length && /[0-9]/.test(input[i])) {
        num += input[i++];
      }
      tokens.push({ type: "number", value: Number(num) });
      continue;
    }

    // Operators
    if ("+-*/".includes(input[i])) {
      tokens.push({ type: "operator", value: input[i] });
      i++;
      continue;
    }

    throw new Error(`Unexpected character: ${input[i]}`);
  }

  return tokens;
}

tokenize("3 + 5 * 2");
// [
//   { type: "number", value: 3 },
//   { type: "operator", value: "+" },
//   { type: "number", value: 5 },
//   { type: "operator", value: "*" },
//   { type: "number", value: 2 }
// ]
```

```js
// Step 2: Parser — organize tokens into a tree (respecting operator precedence)
function parse(tokens) {
  let pos = 0;

  function parseExpression() {
    let left = parseTerm();
    while (pos < tokens.length && (tokens[pos].value === "+" || tokens[pos].value === "-")) {
      const op = tokens[pos++].value;
      const right = parseTerm();
      left = { type: "BinaryExpression", operator: op, left, right };
    }
    return left;
  }

  function parseTerm() {
    let left = parsePrimary();
    while (pos < tokens.length && (tokens[pos].value === "*" || tokens[pos].value === "/")) {
      const op = tokens[pos++].value;
      const right = parsePrimary();
      left = { type: "BinaryExpression", operator: op, left, right };
    }
    return left;
  }

  function parsePrimary() {
    const token = tokens[pos++];
    return { type: "NumberLiteral", value: token.value };
  }

  return parseExpression();
}

parse(tokenize("3 + 5 * 2"));
// {
//   type: "BinaryExpression",
//   operator: "+",
//   left: { type: "NumberLiteral", value: 3 },
//   right: {
//     type: "BinaryExpression",
//     operator: "*",
//     left: { type: "NumberLiteral", value: 5 },
//     right: { type: "NumberLiteral", value: 2 }
//   }
// }
```

Notice how `*` is nested deeper in the tree than `+` — this naturally encodes operator precedence. The tree evaluates bottom-up: `5 * 2 = 10`, then `3 + 10 = 13`.

```js
// Step 3: Evaluator — walk the tree and compute the result
function evaluate(node) {
  if (node.type === "NumberLiteral") return node.value;

  const left = evaluate(node.left);
  const right = evaluate(node.right);

  switch (node.operator) {
    case "+": return left + right;
    case "-": return left - right;
    case "*": return left * right;
    case "/": return left / right;
  }
}

const ast = parse(tokenize("3 + 5 * 2"));
evaluate(ast); // 13
```

This three-step pipeline — **tokenize → parse → evaluate** — is the same fundamental pattern used by JavaScript engines, SQL databases, and compilers.

### 4. Parsing in the Real World: Common Formats

```js
// CSV parsing
const csv = `name,age,city
Alice,30,LA
Bob,25,NYC`;

const rows = csv.split("\n").map(row => row.split(","));
// [["name","age","city"], ["Alice","30","LA"], ["Bob","25","NYC"]]

// For production, use a library — CSV has edge cases (quoted commas, newlines in fields)
// const Papa = require('papaparse');
// Papa.parse(csv, { header: true });

// HTML parsing (what browsers do)
// "<p class='intro'>Hello <b>world</b></p>"
//   → lexer: ["<p>", "class='intro'", ">", "Hello ", "<b>", "world", "</b>", "</p>"]
//   → parser: DOM tree with nested elements

// SQL parsing (what databases do)
// "SELECT name FROM users WHERE age > 25 ORDER BY name"
//   → lexer: [SELECT, name, FROM, users, WHERE, age, >, 25, ORDER, BY, name]
//   → parser: query plan tree
```

### 5. Parsing API Responses

One of the most common real-world parsing scenarios — handling data that arrives as a string over HTTP.

```js
// API response comes as a string
const response = await fetch("/api/users/42");
const text = await response.text();
// '{"id":42,"name":"Alice","createdAt":"2025-01-15T08:30:00Z"}'

// Parse JSON
const user = JSON.parse(text);

// Parse the date string into a Date object (another layer of parsing)
const createdAt = new Date(user.createdAt);

// Parse with validation (using Zod)
import { z } from "zod";

const UserSchema = z.object({
  id: z.number(),
  name: z.string(),
  createdAt: z.string().datetime().transform(s => new Date(s)),
});

const validatedUser = UserSchema.parse(JSON.parse(text));
// Throws ZodError if the shape doesn't match
```

Validation libraries like Zod are essentially parsers — they take unknown input and produce typed, validated output (or throw).

### 6. Abstract Syntax Trees (ASTs) in Practice

ASTs aren't just academic — they power tools you use daily. ESLint, Prettier, Babel, and TypeScript all parse your code into ASTs, transform them, and output the result.

```js
// You can explore ASTs with tools like @babel/parser
const { parse } = require("@babel/parser");

const ast = parse('const greeting = "hello " + name;');

// The AST lets tools:
// - ESLint: check if 'name' is defined (no-undef rule)
// - Prettier: reformat without changing behavior
// - Babel: transform modern syntax to older syntax
// - TypeScript: check that 'name' is a string
```

You can explore ASTs interactively at [astexplorer.net](https://astexplorer.net) — paste any code and see its tree structure.

### 7. Parsing Strategies

There are several established approaches to building parsers, each with different trade-offs:

| Strategy | How It Works | Used By | Good For |
|---|---|---|---|
| **Recursive Descent** | Functions call each other recursively to match grammar rules | GCC, TypeScript, hand-written parsers | Readable, easy to debug |
| **PEG (Parsing Expression Grammar)** | Define grammar rules, generator builds the parser | Peg.js, Ohm.js | Medium-complexity grammars |
| **Parser Combinators** | Small parsers composed together like building blocks | Parsimmon (JS), Nom (Rust) | Functional style, composable |
| **Regular Expressions** | Pattern matching on strings | Built into every language | Simple, flat patterns |
| **Parser Generators** | Define a grammar file, tool generates code | ANTLR, Yacc, Bison | Complex languages, formal grammars |

**When to use what:**

```
Simple key=value config?        → Regex or split()
JSON/YAML/TOML?                 → Use a library (don't reinvent)
Custom DSL or template language? → Recursive descent or PEG
Programming language?            → Parser generator (ANTLR) or recursive descent
Quick string extraction?         → Regex
```

## Common Pitfalls

- **Parsing with regex when you shouldn't.** Regex works for flat patterns but fails for nested structures. You famously [cannot parse HTML with regex](https://stackoverflow.com/a/1732454) — the nesting makes it a context-free grammar, which regex can't handle.
- **Not handling edge cases.** Malformed input, empty strings, unexpected types, Unicode characters, trailing commas — real-world data is messy. Always assume input can be broken.
- **Building a parser when a library exists.** Don't write a JSON, CSV, XML, or YAML parser from scratch. Use battle-tested libraries. The edge cases will eat you alive.
- **Ignoring error messages.** A parser's error reporting is as important as its happy path. `"Unexpected token"` is useless. `"Expected closing bracket at line 42, column 15"` is actionable.
- **Confusing parsing with validation.** Parsing checks *structure* ("is this valid JSON?"). Validation checks *semantics* ("does this JSON have the fields I expect, with the right types?"). You need both.

## Practical Applications

- **API Development:** Parsing request bodies, query parameters, headers, and URL paths on every incoming request.
- **Configuration Files:** Parsing `.env`, `JSON`, `YAML`, `TOML` files to configure applications.
- **CLI Tools:** Parsing command-line arguments and flags (`--verbose`, `-o output.txt`).
- **Compilers & Transpilers:** Parsing source code → AST → transformed code (Babel, TypeScript, Sass).
- **Data Processing:** Parsing CSVs, log files, or API responses for ETL pipelines.
- **Template Engines:** Parsing `{{variable}}` and `{% if %}` blocks in templates (Handlebars, Jinja, EJS).

## References

- [Crafting Interpreters (Free Online Book)](https://craftinginterpreters.com/) — the gold standard for learning parsing and language implementation.
- [AST Explorer](https://astexplorer.net/) — interactive tool for exploring ASTs in many languages.
- [MDN: JSON.parse()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse)
- [Wikipedia: Parsing](https://en.wikipedia.org/wiki/Parsing)
- [Ohm.js (PEG Parser for JS)](https://ohmjs.org/)

---

## Greater Detail

### Advanced Concepts

- **Grammar Notation:** Parsers are often defined using formal grammars. **BNF** (Backus-Naur Form) and **EBNF** are common notations. For example, `expression ::= term (('+' | '-') term)*` formally describes how addition works.
- **LL vs LR Parsing:** LL parsers (like recursive descent) read left-to-right and build the tree top-down. LR parsers (like those generated by Yacc) build bottom-up. LL is easier to write by hand; LR handles more complex grammars.
- **Streaming Parsers:** For large inputs (multi-GB log files, API streams), streaming parsers process data chunk-by-chunk without loading everything into memory. Libraries like `JSONStream` for Node.js and SAX for XML use this approach.
- **Error Recovery:** Production parsers don't stop at the first error — they attempt to *recover* and continue parsing to report multiple errors at once. TypeScript's parser is a great example, showing all errors in a file rather than just the first.
- **Source Maps:** When a parser transforms code (like Babel or a minifier), source maps maintain a mapping between the original and transformed code so debugging tools can show you the original source. This relies on tracking position information during parsing.