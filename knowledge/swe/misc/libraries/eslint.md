
# ESLint: Complete Overview

ESLint is a JavaScript linter that analyzes code for errors, style issues, and potential bugs based on configurable rules. It catches problems like unused variables, missing semicolons, and dangerous patterns before runtime. Think of ESLint as a code reviewer that works instantly—flagging issues the moment you save a file, enforcing team standards automatically.

## Key Points

- **Purpose:** Find and fix JavaScript code problems automatically
- **Configurable:** Enable/disable rules, set severity levels
- **Fixable:** Many issues auto-fixed with `--fix` flag
- **Extensible:** Plugins for React, TypeScript, Vue, etc.
- **IDE Integration:** Real-time feedback in VS Code, WebStorm

## Installation

```bash
# Install ESLint
npm install --save-dev eslint

# Initialize configuration
npx eslint --init

# Or manual install with config
npm install --save-dev eslint eslint-config-airbnb-base

# Run ESLint
npx eslint src/
npx eslint src/ --fix  # Auto-fix issues
```

## Basic Configuration

### .eslintrc.json

```json
{
  "env": {
    "browser": true,
    "es2021": true,
    "node": true
  },
  "extends": "eslint:recommended",
  "parserOptions": {
    "ecmaVersion": "latest",
    "sourceType": "module"
  },
  "rules": {
    "semi": ["error", "always"],
    "quotes": ["error", "single"],
    "no-unused-vars": "warn",
    "no-console": "off"
  }
}
```

### Rule Severity Levels

```json
{
  "rules": {
    "semi": "off",           // 0: Disabled
    "quotes": "warn",        // 1: Warning (doesn't fail build)
    "no-unused-vars": "error" // 2: Error (fails build)
  }
}

// Or with options:
{
  "rules": {
    "semi": ["error", "always"],        // Require semicolons
    "quotes": ["warn", "single"],       // Prefer single quotes
    "max-len": ["error", { "code": 80 }] // Max line length 80
  }
}
```

## Common Rules

### Code Quality

```javascript
// no-unused-vars
const unused = 5;  // ❌ Warning: 'unused' is never used
const used = 10;
console.log(used); // ✅ OK

// no-undef
console.log(undefinedVar);  // ❌ Error: 'undefinedVar' is not defined

// no-redeclare
let x = 1;
let x = 2;  // ❌ Error: 'x' is already declared

// no-unreachable
function example() {
  return true;
  console.log('never runs');  // ❌ Error: Unreachable code
}
```

### Best Practices

```javascript
// eqeqeq (require === and !==)
if (x == 5) {}   // ❌ Error: Use === instead
if (x === 5) {}  // ✅ OK

// no-var (use let/const)
var x = 1;    // ❌ Error: Use let or const
let y = 2;    // ✅ OK
const z = 3;  // ✅ OK

// prefer-const
let constant = 5;  // ❌ Warning: Use const
const constant = 5; // ✅ OK

// no-eval
eval('alert("bad")');  // ❌ Error: eval is dangerous
```

### Style Rules

```javascript
// semi (semicolons)
const x = 5   // ❌ Error: Missing semicolon
const x = 5;  // ✅ OK

// quotes
const str = "double";  // ❌ Error: Use single quotes
const str = 'single';  // ✅ OK

// indent
function bad() {
if (true) {  // ❌ Error: Expected indentation of 2 spaces
console.log('test');
}
}

function good() {
  if (true) {  // ✅ OK
    console.log('test');
  }
}

// comma-dangle
const obj = {
  a: 1,
  b: 2,  // ❌ or ✅ depending on config
};
```

## Extending Configurations

### Popular Configs

```bash
# Airbnb (strict, popular)
npm install --save-dev eslint-config-airbnb-base

# Standard (no semicolons)
npm install --save-dev eslint-config-standard

# Google
npm install --save-dev eslint-config-google
```

```json
// .eslintrc.json
{
  "extends": [
    "eslint:recommended",
    "airbnb-base"
  ],
  "rules": {
    // Override specific Airbnb rules
    "no-console": "off"
  }
}
```

### Multiple Extends

```json
{
  "extends": [
    "eslint:recommended",    // Base ESLint rules
    "plugin:react/recommended", // React rules
    "airbnb",                // Airbnb style guide
    "prettier"               // Disable style rules (Prettier handles)
  ]
}
```

## Plugins

### React

```bash
npm install --save-dev eslint-plugin-react
```

```json
{
  "extends": ["plugin:react/recommended"],
  "plugins": ["react"],
  "rules": {
    "react/prop-types": "warn",
    "react/jsx-uses-react": "error"
  },
  "settings": {
    "react": {
      "version": "detect"
    }
  }
}
```

### TypeScript

```bash
npm install --save-dev @typescript-eslint/parser @typescript-eslint/eslint-plugin
```

```json
{
  "parser": "@typescript-eslint/parser",
  "extends": ["plugin:@typescript-eslint/recommended"],
  "plugins": ["@typescript-eslint"],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/explicit-function-return-type": "off"
  }
}
```

### Import Plugin

```bash
npm install --save-dev eslint-plugin-import
```

```json
{
  "plugins": ["import"],
  "rules": {
    "import/order": ["error", {
      "groups": ["builtin", "external", "internal"]
    }],
    "import/no-unresolved": "error"
  }
}
```

## Ignoring Files

### .eslintignore

```
# .eslintignore (like .gitignore)
node_modules/
dist/
build/
*.min.js
coverage/
```

### Inline Comments

```javascript
// Disable for entire file
/* eslint-disable */

// Disable specific rule for file
/* eslint-disable no-console */

// Disable for next line
// eslint-disable-next-line no-console
console.log('debug');

// Disable for current line
console.log('debug'); // eslint-disable-line no-console

// Disable multiple rules
// eslint-disable-next-line no-console, no-alert
console.log('test');
```

## Auto-Fixing

```bash
# Fix all auto-fixable issues
npx eslint src/ --fix

# Fix specific file
npx eslint src/app.js --fix

# Dry run (show what would be fixed)
npx eslint src/ --fix-dry-run
```

```javascript
// Auto-fixable examples:

// Before
const x = 5
const str = "double"

// After --fix
const x = 5;
const str = 'single';
```

## IDE Integration

### VS Code

```json
// .vscode/settings.json
{
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact"
  ]
}
```

Install: ESLint extension by Microsoft

### package.json Scripts

```json
{
  "scripts": {
    "lint": "eslint src/",
    "lint:fix": "eslint src/ --fix",
    "lint:check": "eslint src/ --max-warnings 0"
  }
}
```

## CI/CD Integration

```yaml
# .github/workflows/lint.yml
name: Lint
on: [push, pull_request]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm ci
      - run: npm run lint
```

```json
// package.json - fail build on warnings
{
  "scripts": {
    "lint": "eslint src/ --max-warnings 0"
  }
}
```

## Custom Rules

### Local Rule

```javascript
// .eslint-rules/no-foo.js
module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow use of "foo" variable name'
    }
  },
  create(context) {
    return {
      Identifier(node) {
        if (node.name === 'foo') {
          context.report({
            node,
            message: 'Do not use "foo" as variable name'
          });
        }
      }
    };
  }
};
```

```json
// .eslintrc.json
{
  "rules": {
    "no-foo": "error"
  }
}
```

## Common Configurations

### Basic Project

```json
{
  "env": {
    "browser": true,
    "es2021": true
  },
  "extends": "eslint:recommended",
  "rules": {
    "semi": ["error", "always"],
    "quotes": ["error", "single"],
    "no-unused-vars": "warn"
  }
}
```

### React Project

```json
{
  "env": {
    "browser": true,
    "es2021": true
  },
  "extends": [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended"
  ],
  "parserOptions": {
    "ecmaFeatures": { "jsx": true },
    "ecmaVersion": "latest",
    "sourceType": "module"
  },
  "rules": {
    "react/react-in-jsx-scope": "off",
    "react/prop-types": "off"
  }
}
```

### TypeScript Project

```json
{
  "parser": "@typescript-eslint/parser",
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended"
  ],
  "rules": {
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/explicit-module-boundary-types": "off"
  }
}
```

## ESLint + Prettier

```bash
# Install Prettier and ESLint config
npm install --save-dev prettier eslint-config-prettier
```

```json
// .eslintrc.json
{
  "extends": [
    "eslint:recommended",
    "prettier"  // Disables ESLint style rules that conflict
  ]
}
```

```json
// .prettierrc
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "es5"
}
```

## Troubleshooting

```bash
# ESLint not running
npx eslint --print-config src/app.js  # Show effective config

# Cache issues
npx eslint --cache --cache-location .eslintcache src/
rm -rf .eslintcache  # Clear cache

# Debug mode
DEBUG=eslint:* npx eslint src/

# Check specific rule
npx eslint src/ --rule 'no-console: error'
```

## Best Practices

```javascript
// ✅ Use extends for shared configs
{
  "extends": ["airbnb-base", "prettier"]
}

// ✅ Override rules sparingly
{
  "rules": {
    "no-console": "off"  // Only when necessary
  }
}

// ✅ Use .eslintignore
// Ignore generated/build files

// ✅ Run in CI/CD
// Enforce standards automatically

// ✅ Auto-fix on save (IDE)
// Catch issues immediately

// ❌ Don't disable too many rules
// Defeats purpose of linting

// ❌ Don't use /* eslint-disable */ everywhere
// Fix issues instead

// ❌ Don't ignore warnings
// Treat warnings seriously
```

## References

- [ESLint Documentation](https://eslint.org/docs/latest/)
- [ESLint Rules](https://eslint.org/docs/latest/rules/)
- [Awesome ESLint](https://github.com/dustinspecker/awesome-eslint)

---

## Summary

**ESLint:** JavaScript linter that catches errors and enforces code style.

**Setup:**
```bash
npm install --save-dev eslint
npx eslint --init
npx eslint src/ --fix
```

**Key Rules:**
- `semi`: Semicolons
- `quotes`: Quote style
- `no-unused-vars`: Unused variables
- `eqeqeq`: Strict equality

**Popular Configs:**
- `eslint:recommended`: Base rules
- `airbnb-base`: Strict style guide
- `prettier`: Disable style rules

**Severity:**
- `"off"` / `0`: Disabled
- `"warn"` / `1`: Warning
- `"error"` / `2`: Error

**Rule of thumb:** Start with `eslint:recommended`, add project-specific rules. Run in CI/CD, integrate with IDE. Use `--fix` to auto-correct. Combine with Prettier for formatting.