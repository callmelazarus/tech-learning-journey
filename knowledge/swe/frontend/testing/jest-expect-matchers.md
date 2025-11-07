# Jest Expect Matchers: A Well-Structured Overview

Jest expect matchers are assertion methods that verify test conditions, providing readable syntax for comparing actual values against expected outcomes with detailed error messages when tests fail.

## Key Points

- **Definition:** Methods chained to `expect()` that perform assertions, validating whether values match expected conditions in unit tests.
- **Basic Matchers:** `toBe()` (strict equality), `toEqual()` (deep equality), `toBeTruthy()`/`toBeFalsy()` (boolean context).
- **Negation:** `.not` modifier inverts any matcher—`expect(value).not.toBe(5)`.
- **Type Checking:** Dedicated matchers for primitives, objects, arrays, null, undefined, and custom types.
- **Async Support:** Matchers work with promises and async/await using `resolves`/`rejects`.
- **Error Messages:** Failed assertions provide detailed diffs showing expected vs actual values.
- **Custom Matchers:** Extend Jest with domain-specific matchers for improved test readability.

## Step-by-Step Explanation & Examples

**Basic Equality Matchers**
```javascript
describe('Equality Matchers', () => {
  test('toBe - strict equality (===)', () => {
    expect(2 + 2).toBe(4);
    // toBe: Uses Object.is() for comparison
    // Best for: primitives (numbers, strings, booleans)
    
    const obj = { name: 'Alice' };
    expect(obj).toBe(obj);  // ✓ Same reference
    
    expect({ name: 'Alice' }).toBe({ name: 'Alice' });  // ✗ Different references
  });
  
  test('toEqual - deep equality', () => {
    expect({ name: 'Alice', age: 30 }).toEqual({ name: 'Alice', age: 30 });
    // toEqual: Recursively compares all properties
    // Best for: objects, arrays with same structure/values
    
    expect([1, 2, 3]).toEqual([1, 2, 3]);  // ✓ Same values
    expect({ user: { id: 1 } }).toEqual({ user: { id: 1 } });  // ✓ Deep match
  });
  
  test('toStrictEqual - strict deep equality', () => {
    expect({ name: 'Bob' }).toStrictEqual({ name: 'Bob' });
    // toStrictEqual: Like toEqual but checks undefined properties and array sparseness
    
    expect({ a: undefined }).toEqual({});  // ✓ Passes
    expect({ a: undefined }).toStrictEqual({});  // ✗ Fails (stricter)
  });
});
```

**Truthiness Matchers**
```javascript
describe('Truthiness Matchers', () => {
  test('boolean context checks', () => {
    expect(true).toBeTruthy();        // Any truthy value
    expect(1).toBeTruthy();
    expect('hello').toBeTruthy();
    expect({}).toBeTruthy();
    
    expect(false).toBeFalsy();        // Any falsy value
    expect(0).toBeFalsy();
    expect('').toBeFalsy();
    expect(null).toBeFalsy();
    
    expect(null).toBeNull();          // Exactly null
    expect(undefined).toBeUndefined(); // Exactly undefined
    expect(value).toBeDefined();      // Not undefined
  });
});
```

**Number Matchers**
```javascript
describe('Number Matchers', () => {
  test('numeric comparisons', () => {
    expect(10).toBeGreaterThan(5);
    expect(10).toBeGreaterThanOrEqual(10);
    expect(5).toBeLessThan(10);
    expect(5).toBeLessThanOrEqual(5);
    
    // Floating point comparison (avoids rounding errors)
    expect(0.1 + 0.2).toBeCloseTo(0.3);  // ✓ Better than toBe(0.3)
    expect(0.1 + 0.2).toBeCloseTo(0.3, 5);  // 5 decimal places precision
  });
});
```

**String Matchers**
```javascript
describe('String Matchers', () => {
  test('string content checks', () => {
    expect('Hello World').toMatch(/World/);  // Regex match
    expect('test@example.com').toMatch(/^[\w.]+@[\w.]+$/);
    
    expect('JavaScript').toContain('Script');  // Substring check
    
    expect('Hello').toHaveLength(5);  // String length
  });
});
```

**Array and Object Matchers**
```javascript
describe('Array and Object Matchers', () => {
  test('array checks', () => {
    const fruits = ['apple', 'banana', 'orange'];
    
    expect(fruits).toContain('banana');  // Item exists in array
    expect(fruits).toHaveLength(3);      // Array length
    
    expect([1, 2, 3]).toContainEqual(2);  // Deep equality check for item
    expect([{ id: 1 }, { id: 2 }]).toContainEqual({ id: 1 });
  });
  
  test('object property checks', () => {
    const user = { name: 'Alice', age: 30, email: 'alice@example.com' };
    
    expect(user).toHaveProperty('name');           // Property exists
    expect(user).toHaveProperty('name', 'Alice');  // Property with value
    expect(user).toHaveProperty('age', 30);
    
    // Nested property path
    const data = { user: { profile: { city: 'LA' } } };
    expect(data).toHaveProperty('user.profile.city', 'LA');
    expect(data).toHaveProperty(['user', 'profile', 'city'], 'LA');
  });
  
  test('partial object matching', () => {
    const user = { id: 1, name: 'Bob', email: 'bob@test.com', age: 25 };
    
    expect(user).toMatchObject({ name: 'Bob', age: 25 });
    // toMatchObject: Checks if subset of properties match
    // Ignores extra properties (id, email)
    
    const users = [
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' }
    ];
    expect(users).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'Bob' })
      ])
    );
  });
});
```

**Function and Error Matchers**
```javascript
describe('Function and Error Matchers', () => {
  test('function throwing errors', () => {
    const throwError = () => { throw new Error('Failed!'); };
    
    expect(throwError).toThrow();                    // Throws any error
    expect(throwError).toThrow('Failed!');           // Specific message
    expect(throwError).toThrow(/Failed/);            // Message regex
    expect(throwError).toThrow(Error);               // Error type
    
    // Must wrap in arrow function
    expect(() => throwError()).toThrow();
  });
  
  test('function call tracking', () => {
    const mockFn = jest.fn();
    mockFn('hello', 123);
    
    expect(mockFn).toHaveBeenCalled();               // Called at least once
    expect(mockFn).toHaveBeenCalledTimes(1);         // Exact call count
    expect(mockFn).toHaveBeenCalledWith('hello', 123); // Specific arguments
    expect(mockFn).toHaveBeenLastCalledWith('hello', 123); // Last call args
  });
});
```

**Async Matchers**
```javascript
describe('Async Matchers', () => {
  test('promise resolution', async () => {
    const fetchData = () => Promise.resolve('data');
    
    // Using async/await
    await expect(fetchData()).resolves.toBe('data');
    
    // Using return
    return expect(fetchData()).resolves.toBe('data');
  });
  
  test('promise rejection', async () => {
    const fetchError = () => Promise.reject(new Error('Failed'));
    
    await expect(fetchError()).rejects.toThrow('Failed');
    await expect(fetchError()).rejects.toThrow(Error);
  });
});
```

**Negation with .not**
```javascript
describe('Negation', () => {
  test('inverting matchers', () => {
    expect(5).not.toBe(10);
    expect('hello').not.toMatch(/world/);
    expect([1, 2, 3]).not.toContain(4);
    expect({ name: 'Alice' }).not.toHaveProperty('age');
    
    const mockFn = jest.fn();
    expect(mockFn).not.toHaveBeenCalled();
  });
});
```

## Common Pitfalls

- Using `toBe()` for objects/arrays—compares references, not values. Use `toEqual()` instead.
- Not wrapping throwing functions in arrow functions—`expect(fn()).toThrow()` executes immediately and fails.
- Forgetting `await` or `return` with async matchers—tests pass incorrectly without waiting for promises.
- Using `toContain()` for object arrays—doesn't do deep equality. Use `toContainEqual()`.
- Comparing floating point numbers with `toBe()`—use `toBeCloseTo()` to avoid rounding errors.
- Not using `.not` correctly—applies to entire matcher, not just part of chain.
- Confusing `toHaveLength()` with array contents—only checks length, not values.

## Practical Applications

- **Unit Tests:** Verify function return values, object shapes, and computed results.
- **Component Testing:** Assert rendered output, prop values, and state changes.
- **API Testing:** Validate response structure, status codes, and data formats.
- **Mock Verification:** Ensure functions are called correctly with expected arguments.

## References

- [Jest Expect API](https://jestjs.io/docs/expect)
- [Jest Matchers Documentation](https://jestjs.io/docs/using-matchers)
- [Jest Mock Functions](https://jestjs.io/docs/mock-functions)

---

## Greater Detail

### Advanced Concepts

- **Custom Matchers:** Extend Jest with domain-specific assertions.
  ```javascript
  expect.extend({
    toBeWithinRange(received, floor, ceiling) {
      const pass = received >= floor && received <= ceiling;
      return {
        pass,
        message: () => `expected ${received} to be within ${floor}-${ceiling}`
      };
    }
  });
  expect(100).toBeWithinRange(90, 110);
  ```
- **Asymmetric Matchers:** Flexible matching with `expect.anything()`, `expect.any(Type)`, `expect.stringContaining()`.
  ```javascript
  expect({ id: expect.any(Number), name: 'Alice' }).toEqual({
    id: expect.any(Number),
    name: 'Alice'
  });
  ```
- **Snapshot Testing:** `toMatchSnapshot()` captures component/object output for regression testing.
- **Inline Snapshots:** `toMatchInlineSnapshot()` writes snapshots directly in test file.
- **Mock Return Values:** `toHaveReturned()`, `toHaveReturnedWith(value)` for mock function returns.
- **Type Matchers:** `expect.any(Constructor)` matches any instance of type.
- **Array Matchers:** `expect.arrayContaining([subset])` for partial array matching.
- **String Matchers:** `expect.stringContaining(substring)`, `expect.stringMatching(regex)`.
- **Object Matchers:** `expect.objectContaining(subset)` for partial object matching.
- **Error Cause:** `toThrow()` supports checking error cause in modern JavaScript.
- **Soft Assertions:** Use `test.failing()` for expected failures during refactoring.
- **Concurrent Assertions:** Multiple expects in single test—all must pass.
- **Custom Error Messages:** Second argument to `expect()` provides custom failure message.
- **Snapshot Matchers:** `toMatchSnapshot()`, `toThrowErrorMatchingSnapshot()`.
- **Performance:** Use `toBeGreaterThan()` for execution time assertions.