# React useMemo Hook: Complete Overview

`useMemo` is a React hook that memoizes (caches) the result of an expensive computation, only recalculating when dependencies change. Instead of running expensive calculations on every render, useMemo returns the cached result unless inputs change. Think of it as a smart calculator that remembers previous answers—if you ask "what's 2+2?" again, it just says "4" without recalculating.

## Key Points

- **Purpose:** Cache expensive computation results between renders
- **Syntax:** `const result = useMemo(() => expensiveFunc(), [deps])`
- **When:** Only recalculates when dependencies change
- **Use Case:** Optimize performance for slow calculations or prevent referential inequality
- **Don't Overuse:** Has overhead, only use for actual performance issues

## Basic Usage

```javascript
import { useMemo } from 'react';

function Component({ numbers }) {
  // Without useMemo: Runs on every render
  const sum = numbers.reduce((a, b) => a + b, 0);
  
  // With useMemo: Only recalculates when numbers changes
  const sum = useMemo(() => {
    return numbers.reduce((a, b) => a + b, 0);
  }, [numbers]);
  
  return <div>Sum: {sum}</div>;
}
```

## When to Use useMemo

### 1. Expensive Calculations

```javascript
function ProductList({ products, searchTerm }) {
  // ❌ Filters on every render (even if searchTerm unchanged)
  const filtered = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // ✅ Only filters when products or searchTerm changes
  const filtered = useMemo(() => {
    console.log('Filtering...'); // Only logs when recalculating
    return products.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products, searchTerm]);
  
  return <ul>{filtered.map(p => <li key={p.id}>{p.name}</li>)}</ul>;
}
```

### 2. Referential Equality

```javascript
function Parent() {
  const [count, setCount] = useState(0);
  
  // ❌ New array every render, child re-renders unnecessarily
  const items = [1, 2, 3];
  
  // ✅ Same array reference unless dependencies change
  const items = useMemo(() => [1, 2, 3], []);
  
  return (
    <>
      <button onClick={() => setCount(count + 1)}>Count: {count}</button>
      <ExpensiveChild items={items} />
    </>
  );
}

const ExpensiveChild = React.memo(({ items }) => {
  console.log('Child rendered'); // Only logs when items reference changes
  return <ul>{items.map(i => <li key={i}>{i}</li>)}</ul>;
});
```

### 3. Derived State

```javascript
function ShoppingCart({ items }) {
  const total = useMemo(() => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [items]);
  
  const itemCount = useMemo(() => {
    return items.reduce((count, item) => count + item.quantity, 0);
  }, [items]);
  
  const tax = useMemo(() => total * 0.1, [total]);
  
  return (
    <div>
      <p>Items: {itemCount}</p>
      <p>Subtotal: ${total}</p>
      <p>Tax: ${tax}</p>
      <p>Total: ${total + tax}</p>
    </div>
  );
}
```

## When NOT to Use useMemo

```javascript
// ❌ Simple calculations (useMemo overhead worse than calculation)
const doubled = useMemo(() => count * 2, [count]);
const doubled = count * 2; // ✅ Just calculate it

// ❌ Primitives (already compared by value)
const text = useMemo(() => 'Hello', []);
const text = 'Hello'; // ✅ No benefit

// ❌ Every single computation (premature optimization)
const a = useMemo(() => x + y, [x, y]);
const b = useMemo(() => a * 2, [a]);
const c = useMemo(() => b - 5, [b]);
// ✅ Only memoize if there's a proven performance issue
```

## Common Patterns

### Filtering Large Lists

```javascript
function UserTable({ users, searchTerm, filters }) {
  const filteredUsers = useMemo(() => {
    return users
      .filter(u => u.name.includes(searchTerm))
      .filter(u => filters.active ? u.isActive : true)
      .filter(u => filters.role ? u.role === filters.role : true)
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [users, searchTerm, filters]);
  
  return (
    <table>
      {filteredUsers.map(u => <UserRow key={u.id} user={u} />)}
    </table>
  );
}
```

### Complex Object Creation

```javascript
function Chart({ data }) {
  const chartConfig = useMemo(() => ({
    type: 'line',
    data: {
      labels: data.map(d => d.date),
      datasets: [{
        label: 'Sales',
        data: data.map(d => d.amount),
        borderColor: 'rgb(75, 192, 192)'
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { position: 'top' } }
    }
  }), [data]);
  
  return <LineChart config={chartConfig} />;
}
```

### Sorted/Grouped Data

```javascript
function ProductCatalog({ products }) {
  const groupedByCategory = useMemo(() => {
    return products.reduce((groups, product) => {
      const category = product.category;
      if (!groups[category]) groups[category] = [];
      groups[category].push(product);
      return groups;
    }, {});
  }, [products]);
  
  return (
    <div>
      {Object.entries(groupedByCategory).map(([category, items]) => (
        <div key={category}>
          <h2>{category}</h2>
          <ul>{items.map(p => <li key={p.id}>{p.name}</li>)}</ul>
        </div>
      ))}
    </div>
  );
}
```

## useMemo vs useCallback

```javascript
// useMemo: Memoizes VALUE
const memoizedValue = useMemo(() => computeExpensiveValue(a, b), [a, b]);

// useCallback: Memoizes FUNCTION
const memoizedCallback = useCallback(() => doSomething(a, b), [a, b]);

// These are equivalent:
const memoizedCallback = useCallback(fn, deps);
const memoizedCallback = useMemo(() => fn, deps);

// Example
function Parent() {
  // Memoized value
  const sortedItems = useMemo(() => items.sort(), [items]);
  
  // Memoized function
  const handleClick = useCallback(() => {
    console.log('Clicked');
  }, []);
  
  return <Child items={sortedItems} onClick={handleClick} />;
}
```

## Performance Measurement

```javascript
function ExpensiveComponent({ data }) {
  // Measure without useMemo
  console.time('calculation');
  const result = expensiveCalculation(data);
  console.timeEnd('calculation');
  
  // Measure with useMemo
  const result = useMemo(() => {
    console.time('memoized calculation');
    const r = expensiveCalculation(data);
    console.timeEnd('memoized calculation');
    return r;
  }, [data]);
  
  // First render: Both take ~100ms
  // Subsequent renders (same data):
  // - Without: 100ms every time
  // - With: <1ms (cached)
}
```

## Common Pitfalls

```javascript
// ❌ Missing dependencies
const value = useMemo(() => a + b, [a]); // Stale 'b'

// ❌ Dependencies change too often
const value = useMemo(() => compute(obj), [obj]); // New object every render

// ❌ Unnecessary memoization
const doubled = useMemo(() => count * 2, [count]); // Overkill

// ❌ Inline objects in dependency array
const value = useMemo(() => process(config), [{ x: 1 }]); // New object = always recalculate

// ✅ Stable dependency
const config = useMemo(() => ({ x: 1 }), []);
const value = useMemo(() => process(config), [config]);
```

## Decision Guide

```
Use useMemo when:
✅ Calculation is expensive (>50ms)
✅ Filtering/sorting large arrays (1000+ items)
✅ Creating objects/arrays passed to React.memo children
✅ Complex derived state
✅ Proven performance bottleneck

Don't use useMemo when:
❌ Simple arithmetic (x + y, count * 2)
❌ Creating primitives (strings, numbers, booleans)
❌ No performance issue (measure first!)
❌ Dependencies change every render anyway
```

## Quick Example: Before/After

```javascript
// Before: Slow on every render
function SearchResults({ items, query }) {
  const results = items
    .filter(item => item.name.includes(query))
    .map(item => ({ ...item, score: calculateScore(item, query) }))
    .sort((a, b) => b.score - a.score);
  
  return <List items={results} />;
}

// After: Fast unless items or query changes
function SearchResults({ items, query }) {
  const results = useMemo(() => {
    return items
      .filter(item => item.name.includes(query))
      .map(item => ({ ...item, score: calculateScore(item, query) }))
      .sort((a, b) => b.score - a.score);
  }, [items, query]);
  
  return <List items={results} />;
}
```

## References

- [React Docs: useMemo](https://react.dev/reference/react/useMemo)
- [React Docs: Performance Optimization](https://react.dev/learn/render-and-commit#optimizing-performance)
- [When to useMemo and useCallback](https://kentcdodds.com/blog/usememo-and-usecallback)

---

## Summary

**useMemo in one line:** Cache expensive calculations between renders

**Syntax:**
```javascript
const memoizedValue = useMemo(() => expensiveFunc(a, b), [a, b]);
```

**Rule of thumb:** Only use when you have a proven performance problem. Profile first, optimize second.