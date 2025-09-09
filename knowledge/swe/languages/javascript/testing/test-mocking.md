# Fundamental Jest Unit Testing Principles: Mocking

Mocking is a core concept in Jest that allows you to isolate the code under test by replacing dependencies with controlled, test-specific implementations.

## Key Points

- **Isolation:** Mocks help test units of code without relying on real dependencies.
- **Types of Mocks:** Jest supports function mocks (`jest.fn()`), module mocks (`jest.mock()`), and manual mocks.
- **Control:** Mocks can track calls, return specific values, or simulate errors.
- **Resetting:** Always reset or clear mocks between tests to avoid state leakage.

## Step-by-Step Explanation & Examples

### 1. Mocking Functions

```js
const myMock = jest.fn();
myMock.mockReturnValue(42);

test('calls mock function', () => {
  expect(myMock()).toBe(42);
  expect(myMock).toHaveBeenCalled();
});
```

### 2. Mocking Modules

```js
// math.js
export const add = (a, b) => a + b;

// math.test.js
jest.mock('./math', () => ({
  add: jest.fn(() => 10),
}));

import { add } from './math';

test('mocked add', () => {
  expect(add(2, 3)).toBe(10);
});
```

### 3. Resetting Mocks

```js
beforeEach(() => {
  jest.clearAllMocks();
});
```

## Common Pitfalls

- Forgetting to reset mocks between tests, leading to test pollution.
- Over-mocking, which can make tests less meaningful.
- Not matching the mock’s signature to the real implementation.

## Practical Applications

- Isolating API calls, database access, or third-party services.
- Testing error handling by simulating failures.
- Verifying interactions between components.

## References

- [Jest: Mock Functions](https://jestjs.io/docs/mock-functions)
- [Jest: Manual Mocks](https://jestjs.io/docs/manual-mocks)
- [Jest: ES6 Class Mocks](https://jestjs.io/docs/es6-class-mocks)