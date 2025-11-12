# Popular Regex Expressions: A Well-Structured Overview

Regular expressions (regex) are pattern-matching strings used to search, validate, and manipulate text, providing powerful text processing capabilities across programming languages and tools.

## Key Points

- **Definition:** Sequence of characters defining search patterns for string matching, validation, and extraction operations.
- **Metacharacters:** Special characters like `.`, `*`, `+`, `?`, `[]`, `()`, `^`, `$` have special pattern-matching meanings.
- **Character Classes:** Predefined shortcuts—`\d` (digits), `\w` (word characters), `\s` (whitespace)—simplify common patterns.
- **Quantifiers:** Control repetition—`*` (0+), `+` (1+), `?` (0-1), `{n}` (exactly n), `{n,m}` (n to m times).
- **Anchors:** `^` (start of string) and `$` (end of string) constrain matching position.
- **Flags:** Modifiers like `i` (case-insensitive), `g` (global), `m` (multiline) change behavior.
- **Use Cases:** Email/phone validation, data extraction, find-and-replace, URL parsing, form validation.

## Fundamental Regex Characters

**Basic Metacharacters**
```javascript
// . (dot) - matches any single character except newline
/a.c/.test('abc');     // true (dot matches 'b')
/a.c/.test('a*c');     // true (dot matches '*')
/a.c/.test('ac');      // false (dot requires one character)

// * - matches 0 or more of preceding character
/ab*c/.test('ac');     // true (0 b's)
/ab*c/.test('abc');    // true (1 b)
/ab*c/.test('abbbbc'); // true (many b's)

// + - matches 1 or more of preceding character
/ab+c/.test('ac');     // false (requires at least 1 b)
/ab+c/.test('abc');    // true (1 b)
/ab+c/.test('abbc');   // true (2+ b's)

// ? - matches 0 or 1 of preceding character (optional)
/colou?r/.test('color');  // true (0 u's)
/colou?r/.test('colour'); // true (1 u)

// ^ - start of string anchor
/^hello/.test('hello world'); // true (starts with hello)
/^hello/.test('say hello');   // false (doesn't start with hello)

// $ - end of string anchor
/world$/.test('hello world'); // true (ends with world)
/world$/.test('world peace'); // false (doesn't end with world)

// | - alternation (OR)
/cat|dog/.test('cat');    // true
/cat|dog/.test('dog');    // true
/cat|dog/.test('bird');   // false

// \ - escape special characters
/\./.test('.');           // true (matches literal dot)
/\*/.test('*');           // true (matches literal asterisk)
```

**Character Classes**
```javascript
// [] - character set (match any one character inside)
/[abc]/.test('a');        // true
/[abc]/.test('b');        // true
/[abc]/.test('d');        // false

// [^] - negated set (match anything NOT inside)
/[^abc]/.test('d');       // true
/[^abc]/.test('a');       // false

// [a-z] - range
/[a-z]/.test('m');        // true (lowercase letters)
/[0-9]/.test('5');        // true (digits)
/[A-Za-z0-9]/.test('K');  // true (alphanumeric)

// \d - digit [0-9]
/\d/.test('5');           // true
/\d/.test('a');           // false

// \D - non-digit [^0-9]
/\D/.test('a');           // true
/\D/.test('5');           // false

// \w - word character [A-Za-z0-9_]
/\w/.test('a');           // true
/\w/.test('_');           // true
/\w/.test('$');           // false

// \W - non-word character [^A-Za-z0-9_]
/\W/.test('$');           // true
/\W/.test('a');           // false

// \s - whitespace (space, tab, newline)
/\s/.test(' ');           // true
/\s/.test('\t');          // true
/\s/.test('a');           // false

// \S - non-whitespace
/\S/.test('a');           // true
/\S/.test(' ');           // false
```

**Quantifiers**
```javascript
// {n} - exactly n times
/\d{3}/.test('123');      // true (exactly 3 digits)
/\d{3}/.test('12');       // false (only 2 digits)

// {n,} - n or more times
/\d{2,}/.test('12');      // true (2+ digits)
/\d{2,}/.test('12345');   // true (5 digits)

// {n,m} - between n and m times
/\d{2,4}/.test('12');     // true (2 digits)
/\d{2,4}/.test('12345');  // true (matches first 4)
/\d{2,4}/.test('1');      // false (only 1 digit)
```

**Groups and Capture**
```javascript
// () - capturing group
const match = '123-456'.match(/(\d+)-(\d+)/);
// match[1] = '123'
// match[2] = '456'

// (?:) - non-capturing group
/(?:ab)+/.test('ababab'); // true (groups 'ab', doesn't capture)

// \1, \2 - backreferences to captured groups
/(\w)\1/.test('aa');      // true (same character twice)
/(\w)\1/.test('ab');      // false (different characters)
```

**Lookahead/Lookbehind**
```javascript
// (?=) - positive lookahead (assert what follows)
/\d(?=px)/.test('10px');  // true (digit followed by 'px')
/\d(?=px)/.test('10em');  // false

// (?!) - negative lookahead (assert what doesn't follow)
/\d(?!px)/.test('10em');  // true (digit NOT followed by 'px')
/\d(?!px)/.test('10px');  // false

// (?<=) - positive lookbehind (assert what precedes)
/(?<=\$)\d+/.test('$50'); // true (digits preceded by $)
/(?<=\$)\d+/.test('50');  // false

// (?<!) - negative lookbehind (assert what doesn't precede)
/(?<!\$)\d+/.test('50');  // true (digits NOT preceded by $)
/(?<!\$)\d+/.test('$50'); // false
```

## Common Regex Patterns

**Email Validation**
```javascript
/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test('user@example.com');  // true
```

**Phone Number (US)**
```javascript
/^\(?(\d{3})\)?[-.\s]?(\d{3})[-.\s]?(\d{4})$/.test('555-123-4567');  // true
```

**URL**
```javascript
/https?:\/\/[^\s]+$/.test('https://example.com');  // true
```

**Password (8+ chars, uppercase, lowercase, digit, special)**
```javascript
/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
  .test('Strong123!');  // true
```

**Date (MM/DD/YYYY)**
```javascript
/^(0[1-9]|1[0-2])[/-](0[1-9]|[12]\d|3[01])[/-]\d{4}$/
  .test('12/31/2024');  // true
```

**Username (3-16 chars, alphanumeric + underscore)**
```javascript
/^[a-zA-Z0-9_]{3,16}$/.test('user_123');  // true
```

**IPv4 Address**
```javascript
/^((25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)\.){3}(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)$/
  .test('192.168.1.1');  // true
```

**Credit Card (with optional separators)**
```javascript
/^(\d{4}[-\s]?){3}\d{4}$/.test('1234-5678-9012-3456');  // true
```

## Common Pitfalls

- Forgetting to escape metacharacters—use `\.` for literal dot, `\*` for asterisk.
- Using greedy quantifiers—`.*` matches maximum, use `.*?` for minimal match.
- Not anchoring patterns—without `^` and `$`, matches anywhere in string.
- Over-complicating—simple validation often better than perfect but unreadable regex.
- Missing edge cases—test empty strings, special characters, extreme lengths.
- Performance issues—complex patterns with backtracking can be catastrophically slow.
- Wrong flags—remember `i` (case-insensitive), `g` (global), `m` (multiline).

## Practical Applications

- **Form Validation:** Email, phone, password strength checks.
- **Data Extraction:** Parse logs, extract URLs, phone numbers from text.
- **Search/Replace:** Find and modify patterns in editors and scripts.
- **URL Routing:** Match route patterns in web frameworks.

## References

- [MDN Regular Expressions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions)
- [Regex101 (Testing Tool)](https://regex101.com/)
- [RegExr (Interactive)](https://regexr.com/)

---

## Greater Detail

### Advanced Concepts

- **Named Capture Groups:** `(?<name>...)` for readable references—`match.groups.name`.
- **Non-Greedy Quantifiers:** `*?`, `+?`, `??` match minimum instead of maximum.
- **Word Boundaries:** `\b` matches position between word/non-word character.
- **Unicode Support:** `\p{L}` (letters), `\p{N}` (numbers) with `u` flag.
- **Atomic Groups:** `(?>...)` prevent backtracking for performance.
- **Case-Insensitive Flag:** `/pattern/i` ignores case.
- **Global Flag:** `/pattern/g` finds all matches, not just first.
- **Multiline Flag:** `/pattern/m` makes `^` and `$` match line boundaries.
- **Testing Tools:** Regex101 and RegExr visualize patterns and provide explanations.
- **Performance:** Avoid nested quantifiers and catastrophic backtracking with atomic groups.