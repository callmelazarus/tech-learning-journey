# Code Complexity: Complete Overview

Code complexity measures how difficult code is to understand, test, and maintain, primarily through cyclomatic complexity (counting decision paths). A function with many `if`, `else`, `switch`, `for`, and `while` statements has high complexity. Think of it like navigating a city—a straight road is simple (low complexity), while a maze of intersecting streets with many turns is complex (high complexity).

## Key Points

- **Cyclomatic Complexity:** Counts independent paths through code
- **Formula:** Complexity = branches + 1
- **Good Target:** 1-10 (simple), avoid 15+ (too complex)
- **Impacts:** Testability, maintainability, bug risk
- **Tools:** ESLint, SonarQube, CodeClimate

## Cyclomatic Complexity

### Calculation

```javascript
// Complexity = 1 (no branches)
function add(a, b) {
  return a + b;
}

// Complexity = 2 (1 if = 1 branch)
function isPositive(num) {
  if (num > 0) {
    return true;
  }
  return false;
}

// Complexity = 3 (2 branches)
function checkAge(age) {
  if (age < 18) {
    return 'minor';
  } else if (age < 65) {
    return 'adult';
  } else {
    return 'senior';
  }
}

// Complexity = 5 (4 branches)
function validateUser(user) {
  if (!user) return false;           // +1
  if (!user.name) return false;       // +1
  if (!user.email) return false;      // +1
  if (user.age < 0) return false;     // +1
  return true;
}
```

### What Counts as a Branch

```javascript
// Each adds +1 to complexity:
if (condition) {}           // +1
else if (condition) {}      // +1
else {}                     // +1
for (;;) {}                 // +1
while (condition) {}        // +1
do {} while (condition)     // +1
case:                       // +1 per case
condition ? a : b           // +1
&&                          // +1
||                          // +1
catch                       // +1
```

## Complexity Ratings

```
1-5:   Simple (easy to test, low risk)
6-10:  Moderate (acceptable, consider refactoring)
11-20: Complex (hard to test, higher risk)
21-50: Very complex (difficult to maintain)
50+:   Extremely complex (refactor immediately)

Industry Standards:
Google: Recommends < 10
NASA: Critical software < 10, preferably < 5
SonarQube: Major issue at 10+, critical at 15+
```

## Examples by Complexity

### Low Complexity (Good)

```javascript
// Complexity = 3
function getDiscount(price, isPremium) {
  if (isPremium) {
    return price * 0.2;
  }
  if (price > 100) {
    return price * 0.1;
  }
  return 0;
}

// Complexity = 2
function formatCurrency(amount) {
  if (amount < 0) {
    return `-$${Math.abs(amount)}`;
  }
  return `$${amount}`;
}
```

### Medium Complexity (Acceptable)

```javascript
// Complexity = 8
function calculateShipping(order) {
  let cost = 0;
  
  if (order.isPremium) {                    // +1
    return 0;
  }
  
  if (order.weight > 50) {                  // +1
    cost += 20;
  } else if (order.weight > 20) {           // +1
    cost += 10;
  }
  
  if (order.isInternational) {              // +1
    cost += 15;
  }
  
  if (order.isExpress && !order.isPremium) { // +2 (&&)
    cost *= 2;
  }
  
  return cost;
}
```

### High Complexity (Bad)

```javascript
// Complexity = 15+ (too complex!)
function processOrder(order) {
  if (!order) return null;                          // +1
  
  if (order.status === 'pending') {                 // +1
    if (order.paymentMethod === 'card') {           // +1
      if (order.amount > 1000) {                    // +1
        if (verifyCard()) {                         // +1
          if (checkFraud()) {                       // +1
            // process...
          } else {
            // fraud detected
          }
        }
      } else {
        // small amount
      }
    } else if (order.paymentMethod === 'paypal') {  // +1
      // paypal logic
    }
  } else if (order.status === 'shipped') {          // +1
    // shipping logic
  }
  
  // More branches...
  return result;
}
```

## Refactoring High Complexity

### Extract Functions

```javascript
// Before: Complexity = 12
function processPayment(order) {
  if (!order) return null;
  if (!order.amount) return null;
  if (order.amount < 0) return null;
  
  if (order.type === 'card') {
    if (validateCard(order.card)) {
      if (checkBalance(order.card, order.amount)) {
        return chargeCard(order);
      }
    }
  } else if (order.type === 'paypal') {
    if (validatePayPal(order.paypal)) {
      return chargePayPal(order);
    }
  }
  
  return null;
}

// After: Complexity = 3 (per function)
function processPayment(order) {
  if (!isValidOrder(order)) return null;
  
  if (order.type === 'card') {
    return processCardPayment(order);
  }
  
  if (order.type === 'paypal') {
    return processPayPalPayment(order);
  }
  
  return null;
}

function isValidOrder(order) {
  return order && order.amount && order.amount > 0;
}

function processCardPayment(order) {
  if (!validateCard(order.card)) return null;
  if (!checkBalance(order.card, order.amount)) return null;
  return chargeCard(order);
}
```

### Strategy Pattern

```javascript
// Before: High complexity with many conditionals
function calculatePrice(type, base) {
  if (type === 'premium') {
    return base * 0.8;
  } else if (type === 'standard') {
    return base * 0.9;
  } else if (type === 'basic') {
    return base;
  }
}

// After: Low complexity with strategy pattern
const pricingStrategies = {
  premium: (base) => base * 0.8,
  standard: (base) => base * 0.9,
  basic: (base) => base
};

function calculatePrice(type, base) {
  const strategy = pricingStrategies[type];
  return strategy ? strategy(base) : base;
}
```

### Early Returns

```javascript
// Before: Nested complexity = 5
function validateUser(user) {
  if (user) {
    if (user.name) {
      if (user.email) {
        if (user.age >= 18) {
          return true;
        }
      }
    }
  }
  return false;
}

// After: Reduced complexity = 5 (flatter)
function validateUser(user) {
  if (!user) return false;
  if (!user.name) return false;
  if (!user.email) return false;
  if (user.age < 18) return false;
  return true;
}
```

### Lookup Tables

```javascript
// Before: Complexity = 8
function getStatusMessage(code) {
  if (code === 200) return 'OK';
  else if (code === 201) return 'Created';
  else if (code === 400) return 'Bad Request';
  else if (code === 401) return 'Unauthorized';
  else if (code === 404) return 'Not Found';
  else if (code === 500) return 'Server Error';
  return 'Unknown';
}

// After: Complexity = 2
const STATUS_MESSAGES = {
  200: 'OK',
  201: 'Created',
  400: 'Bad Request',
  401: 'Unauthorized',
  404: 'Not Found',
  500: 'Server Error'
};

function getStatusMessage(code) {
  return STATUS_MESSAGES[code] || 'Unknown';
}
```

## Measuring Complexity

### ESLint

```javascript
// .eslintrc.json
{
  "rules": {
    "complexity": ["error", 10]  // Max complexity 10
  }
}

// Triggers warning:
function tooComplex() {
  // 11+ branches
}
// ESLint: Function has complexity of 11. Maximum allowed is 10
```

### SonarQube

```javascript
// Analyzes entire codebase
// Reports functions with high complexity
// Suggests refactoring targets

// Example output:
// function processOrder(): Complexity 15 (should be <= 10)
```

### Programmatic Check

```bash
# Using complexity-report
npm install -g complexity-report

complexity-report src/**/*.js

# Output:
# src/orders.js
#   processOrder: 15 (high)
#   validateOrder: 3 (good)
```

## Cognitive Complexity

```javascript
// Similar to cyclomatic but accounts for nesting

// Low cyclomatic (4), high cognitive (harder to understand)
function nestedLogic(x) {
  if (x > 0) {              // +1 cyclomatic, +1 cognitive
    if (x < 10) {           // +1 cyclomatic, +2 cognitive (nested)
      if (x % 2 === 0) {    // +1 cyclomatic, +3 cognitive (nested deeper)
        return true;
      }
    }
  }
  return false;
}

// Same cyclomatic (4), lower cognitive (easier to understand)
function flatLogic(x) {
  if (x <= 0) return false;     // +1 each
  if (x >= 10) return false;
  if (x % 2 !== 0) return false;
  return true;
}

// Prefer flat over nested
```

## When Complexity is Acceptable

```javascript
// Complex domain logic may justify higher complexity
function calculateTax(income, state, filingStatus, dependents) {
  // Tax brackets have inherent complexity
  // 10-15 complexity acceptable if well-tested
  
  if (state === 'CA') {
    // California tax logic
  } else if (state === 'NY') {
    // New York tax logic
  }
  // More states...
  
  // Document why complexity is necessary
}

// Parser/compiler code often complex
function parseExpression(tokens) {
  // Grammar rules create branches
  // Complexity 15-20 acceptable for parsers
}
```

## Testing and Complexity

```javascript
// Complexity = paths to test
// Complexity 10 = 10 test cases minimum

function classify(age, income) {  // Complexity = 4
  if (age < 18) return 'minor';         // Test 1
  if (income < 30000) return 'low';     // Test 2
  if (income < 100000) return 'middle'; // Test 3
  return 'high';                        // Test 4
}

// Need 4 tests to cover all paths
test('minor', () => expect(classify(15, 50000)).toBe('minor'));
test('low income', () => expect(classify(25, 20000)).toBe('low'));
test('middle income', () => expect(classify(30, 50000)).toBe('middle'));
test('high income', () => expect(classify(40, 150000)).toBe('high'));
```

## Best Practices

```javascript
// ✅ Keep functions under 10 complexity
function goodComplexity() {
  // 5-8 branches maximum
}

// ✅ Extract complex logic
function process(data) {
  if (!validate(data)) return;  // Validation extracted
  return transform(data);       // Transform extracted
}

// ✅ Use early returns
function check(value) {
  if (!value) return false;
  if (value < 0) return false;
  return true;
}

// ✅ Prefer lookup tables over conditionals
const actions = { create: createFn, update: updateFn };
const action = actions[type] || defaultFn;

// ❌ Deeply nested conditions
function bad() {
  if (x) {
    if (y) {
      if (z) {
        // Too deep
      }
    }
  }
}

// ❌ Many else-if chains
function bad(type) {
  if (type === 'a') {}
  else if (type === 'b') {}
  else if (type === 'c') {}
  // 10+ more cases
}
```

## References

- [Cyclomatic Complexity](https://en.wikipedia.org/wiki/Cyclomatic_complexity)
- [ESLint Complexity Rule](https://eslint.org/docs/latest/rules/complexity)
- [SonarQube Cognitive Complexity](https://www.sonarsource.com/resources/cognitive-complexity/)

---

## Summary

**Complexity:** Measure of code's decision paths (branches).

**Target Values:**
- 1-5: Simple (ideal)
- 6-10: Acceptable
- 11-15: Refactor recommended
- 15+: Refactor required

**Reduces Complexity:**
- Extract functions
- Early returns
- Lookup tables/objects
- Strategy pattern
- Guard clauses

**Measurement:**
```bash
eslint --rule 'complexity: [error, 10]'
```

**Rule of thumb:** Keep functions under 10 complexity. If higher, extract logic into smaller functions. Each function should do one thing well. Complexity = number of test cases needed.