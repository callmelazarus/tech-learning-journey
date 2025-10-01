# Intermediate Jest Unit Testing: Advanced Mocking Concepts

Mocking at an intermediate level involves understanding partial mocks, spy functionality, implementation details, and timing control. These techniques allow you to test complex scenarios while maintaining clean, maintainable test suites.

## Key Points

- **Partial Mocks:** Mock only specific functions within a module while keeping others real
- **Spies:** Track calls to real functions without changing their behavior
- **Mock Implementations:** Control return values dynamically based on input parameters
- **Timer Mocks:** Test time-dependent code without actual delays
- **Clear vs Reset vs Restore:** Each serves distinct purposes in mock lifecycle management
- **Mock Modules with Dependencies:** Handle nested module imports and side effects
- **Constructor Mocking:** Control class instantiation and method behavior

## Step-by-Step Explanation & Examples

### 1. Partial Module Mocking

Real-world scenario: Testing a service that uses some utility functions but not others.

```js
// utils.js
export const formatDate = (date) => date.toISOString();
export const validateEmail = (email) => email.includes('@');

// service.test.js
jest.mock('./utils', () => ({
  ...jest.requireActual('./utils'),
  validateEmail: jest.fn(() => true), // Mock only this
}));

import { formatDate, validateEmail } from './utils';

test('partial mock preserves real implementation', () => {
  expect(formatDate(new Date('2025-01-01'))).toContain('2025');
  expect(validateEmail('invalid')).toBe(true); // Mocked behavior
});
```

### 2. Spy on Real Implementations

Anecdote: I once debugged a caching issue where the cache was being called but returning stale data. Using spies, I could verify the cache function was invoked correctly while still using the real logic.

```js
import * as mathUtils from './math';

test('spy tracks calls to real function', () => {
  const addSpy = jest.spyOn(mathUtils, 'add');
  
  const result = mathUtils.add(2, 3);
  
  expect(result).toBe(5); // Real implementation
  expect(addSpy).toHaveBeenCalledWith(2, 3);
  expect(addSpy).toHaveBeenCalledTimes(1);
  
  addSpy.mockRestore(); // Clean up
});
```

### 3. Dynamic Mock Implementations

```js
const fetchUser = jest.fn((id) => {
  if (id === 1) return { name: 'Alice', admin: true };
  return { name: 'Bob', admin: false };
});

test('different behaviors for different inputs', () => {
  expect(fetchUser(1).admin).toBe(true);
  expect(fetchUser(2).admin).toBe(false);
});
```

### 4. Timer Mocking

```js
jest.useFakeTimers();

function delayedGreeting(callback) {
  setTimeout(() => callback('Hello'), 1000);
}

test('fast-forwards time', () => {
  const mockCallback = jest.fn();
  delayedGreeting(mockCallback);
  
  expect(mockCallback).not.toHaveBeenCalled();
  jest.advanceTimersByTime(1000);
  expect(mockCallback).toHaveBeenCalledWith('Hello');
});
```

### 5. Mock Implementations with Promises

```js
const apiCall = jest.fn()
  .mockResolvedValueOnce({ data: 'first' })
  .mockRejectedValueOnce(new Error('Network error'))
  .mockResolvedValue({ data: 'default' });

test('handles multiple async scenarios', async () => {
  await expect(apiCall()).resolves.toEqual({ data: 'first' });
  await expect(apiCall()).rejects.toThrow('Network error');
  await expect(apiCall()).resolves.toEqual({ data: 'default' });
});
```

### 6. Clear vs Reset vs Restore

```js
const mock = jest.fn(() => 'original');

mock.mockImplementation(() => 'changed');
mock('test');

// clearAllMocks: Clears call history but keeps implementation
jest.clearAllMocks();
expect(mock).not.toHaveBeenCalled();
expect(mock()).toBe('changed');

// resetAllMocks: Clears history AND implementation
jest.resetAllMocks();
expect(mock()).toBeUndefined();

// restoreAllMocks: Only works on spies, returns to original
const spy = jest.spyOn(console, 'log').mockImplementation();
jest.restoreAllMocks();
// console.log now works normally again
```

## Common Pitfalls

- **Forgetting `jest.requireActual()`** in partial mocks, causing all functions to be undefined
- **Not using `mockRestore()`** on spies, causing real implementations to stay mocked across tests
- **Mixing fake and real timers** without proper cleanup (use `jest.useRealTimers()`)
- **Incorrect mock placement**: `jest.mock()` must be at the top level, not inside tests
- **Assuming mock order**: `mockReturnValueOnce` calls are consumed in sequence; plan accordingly

## Practical Applications

- **API Testing:** Mock HTTP clients to test different response codes without network calls
- **Database Testing:** Mock ORM methods to verify queries without database setup
- **Third-Party Services:** Simulate payment gateways, email services, or analytics
- **Time-Dependent Logic:** Test scheduled tasks, rate limiting, or debouncing
- **Error Recovery:** Verify retry logic by simulating intermittent failures

## References

- [Jest: Mock Functions](https://jestjs.io/docs/mock-functions)
- [Jest: Timer Mocks](https://jestjs.io/docs/timer-mocks)
- [Jest: ES6 Class Mocks](https://jestjs.io/docs/es6-class-mocks)

---

## Greater Detail: Advanced Concepts

### Factory Functions and Manual Mocks

Create reusable mock factories for complex objects:

```js
// __mocks__/database.js
export const createMockDb = (overrides = {}) => ({
  query: jest.fn().mockResolvedValue([]),
  insert: jest.fn().mockResolvedValue({ id: 1 }),
  transaction: jest.fn((callback) => callback(this)),
  ...overrides,
});
```

### Mocking Constructor Functions

For class-based dependencies:

```js
jest.mock('./UserService');
import UserService from './UserService';

UserService.mockImplementation(() => ({
  getUser: jest.fn().mockResolvedValue({ id: 1, name: 'Test' }),
  deleteUser: jest.fn(),
}));

test('uses mocked class instance', () => {
  const service = new UserService();
  expect(service.getUser()).resolves.toEqual({ id: 1, name: 'Test' });
});
```

### Advanced Spy Techniques

Spy on getters/setters:

```js
const obj = {
  get value() { return this._value; },
  set value(v) { this._value = v; },
};

const getSpy = jest.spyOn(obj, 'value', 'get').mockReturnValue(42);
const setSpy = jest.spyOn(obj, 'value', 'set');

obj.value = 100;
expect(setSpy).toHaveBeenCalledWith(100);
expect(obj.value).toBe(42); // Mocked getter
```

### Mocking Module Side Effects

When modules execute code on import:

```js
// analytics.js (has side effect on import)
window.analytics = { track: () => {} };

// In test file
jest.mock('./analytics', () => {
  const originalModule = jest.requireActual('./analytics');
  window.analytics = { track: jest.fn() };
  return originalModule;
});
```

### Testing Mock Call Context

Verify `this` binding and call context:

```js
const obj = {
  method: jest.fn(),
};

obj.method.call({ custom: 'context' }, 'arg1');

expect(obj.method.mock.contexts[0]).toEqual({ custom: 'context' });
expect(obj.method.mock.instances[0]).toBe(obj.method.mock.contexts[0]);
```

### Complex Async Patterns

Mock with delays and race conditions:

```js
const slowApi = jest.fn(() => 
  new Promise(resolve => setTimeout(() => resolve('data'), 500))
);

jest.useFakeTimers();

test('handles race condition', async () => {
  const promise = slowApi();
  jest.advanceTimersByTime(500);
  await expect(promise).resolves.toBe('data');
});
```