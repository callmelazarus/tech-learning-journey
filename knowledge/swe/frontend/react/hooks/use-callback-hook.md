# React useCallback Hook: Complete Overview

`useCallback` is a React hook that memoizes (caches) a function definition, returning the same function reference between renders unless dependencies change. Instead of creating a new function on every render, useCallback returns the cached function unless inputs change. Think of it as giving your function a permanent ID—even if you redecorate your house (re-render), the function stays the same person (same reference) unless you specifically change it.

## Key Points

- **Purpose:** Cache function references between renders
- **Syntax:** `const memoizedFn = useCallback(() => doSomething(), [deps])`
- **When:** Only creates new function when dependencies change
- **Use Case:** Prevent unnecessary re-renders of child components that use React.memo
- **Don't Overuse:** Has overhead, only use when needed for optimization

## Basic Usage

```javascript
import { useCallback } from 'react';

function Component({ id }) {
  // ❌ New function every render
  const handleClick = () => {
    console.log('Clicked', id);
  };
  
  // ✅ Same function reference unless id changes
  const handleClick = useCallback(() => {
    console.log('Clicked', id);
  }, [id]);
  
  return <button onClick={handleClick}>Click</button>;
}
```

## When to Use useCallback

### 1. Passing Callbacks to Memoized Children

```javascript
function Parent() {
  const [count, setCount] = useState(0);
  const [text, setText] = useState('');
  
  // ❌ New function every render, child re-renders unnecessarily
  const handleClick = () => {
    console.log('Button clicked');
  };
  
  // ✅ Same function reference, child only re-renders when needed
  const handleClick = useCallback(() => {
    console.log('Button clicked');
  }, []); // No dependencies = never changes
  
  return (
    <>
      <input value={text} onChange={e => setText(e.target.value)} />
      <p>Count: {count}</p>
      <ExpensiveChild onClick={handleClick} />
    </>
  );
}

const ExpensiveChild = React.memo(({ onClick }) => {
  console.log('Child rendered'); // Only logs when onClick changes
  return <button onClick={onClick}>Click Me</button>;
});
```

### 2. Functions as Dependencies

```javascript
function SearchComponent({ initialQuery }) {
  const [results, setResults] = useState([]);
  
  // ❌ fetchResults recreated every render, useEffect runs every render
  const fetchResults = (query) => {
    fetch(`/api/search?q=${query}`)
      .then(res => res.json())
      .then(setResults);
  };
  
  useEffect(() => {
    fetchResults(initialQuery);
  }, [fetchResults]); // fetchResults changes = infinite loop!
  
  // ✅ fetchResults stable, useEffect runs only when initialQuery changes
  const fetchResults = useCallback((query) => {
    fetch(`/api/search?q=${query}`)
      .then(res => res.json())
      .then(setResults);
  }, []); // No deps = function never changes
  
  useEffect(() => {
    fetchResults(initialQuery);
  }, [fetchResults, initialQuery]); // Safe now
}
```

### 3. Event Handlers with Dependencies

```javascript
function TodoList({ todos, onToggle }) {
  const [selectedId, setSelectedId] = useState(null);
  
  const handleToggle = useCallback((id) => {
    console.log('Selected:', selectedId); // Uses selectedId
    onToggle(id);
  }, [selectedId, onToggle]); // Recreates when selectedId or onToggle changes
  
  return (
    <ul>
      {todos.map(todo => (
        <TodoItem 
          key={todo.id} 
          todo={todo} 
          onToggle={handleToggle} 
        />
      ))}
    </ul>
  );
}

const TodoItem = React.memo(({ todo, onToggle }) => {
  console.log('TodoItem rendered:', todo.id);
  return (
    <li onClick={() => onToggle(todo.id)}>
      {todo.text}
    </li>
  );
});
```

## When NOT to Use useCallback

```javascript
// ❌ Internal handlers (not passed to children)
function Form() {
  const handleSubmit = useCallback(() => {
    console.log('Submitted');
  }, []); // Unnecessary overhead
  
  return <form onSubmit={handleSubmit}>...</form>;
}

// ✅ Just use regular function
function Form() {
  const handleSubmit = () => {
    console.log('Submitted');
  };
  
  return <form onSubmit={handleSubmit}>...</form>;
}

// ❌ Child not memoized
function Parent() {
  const handleClick = useCallback(() => {
    console.log('Clicked');
  }, []); // Useless if Child isn't memoized
  
  return <Child onClick={handleClick} />;
}

// ❌ No dependencies
const handleClick = useCallback(() => {
  doSomething();
}, []); // Might as well define outside component

// ✅ Define outside if no dependencies
const handleClick = () => doSomething();

function Component() {
  return <button onClick={handleClick}>Click</button>;
}
```

## Common Patterns

### Form Handlers

```javascript
function UserForm() {
  const [formData, setFormData] = useState({ name: '', email: '' });
  
  const handleChange = useCallback((field) => (e) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  }, []); // No dependencies, uses functional setState
  
  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    console.log('Submitting:', formData);
  }, [formData]); // Depends on formData
  
  return (
    <form onSubmit={handleSubmit}>
      <input value={formData.name} onChange={handleChange('name')} />
      <input value={formData.email} onChange={handleChange('email')} />
      <button type="submit">Submit</button>
    </form>
  );
}
```

### Debounced Functions

```javascript
function SearchInput() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  
  const fetchResults = useCallback(async (searchQuery) => {
    const res = await fetch(`/api/search?q=${searchQuery}`);
    const data = await res.json();
    setResults(data);
  }, []);
  
  const debouncedFetch = useCallback(
    debounce(fetchResults, 300),
    [fetchResults]
  );
  
  const handleChange = useCallback((e) => {
    const value = e.target.value;
    setQuery(value);
    debouncedFetch(value);
  }, [debouncedFetch]);
  
  return <input value={query} onChange={handleChange} />;
}
```

### Event Listeners

```javascript
function ScrollTracker() {
  const [scrollY, setScrollY] = useState(0);
  
  const handleScroll = useCallback(() => {
    setScrollY(window.scrollY);
  }, []); // No dependencies, uses setState
  
  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]); // handleScroll stable = no re-subscription
  
  return <div>Scroll position: {scrollY}</div>;
}
```

### Callback Props Chain

```javascript
function GrandParent() {
  const handleAction = useCallback((data) => {
    console.log('Action:', data);
  }, []);
  
  return <Parent onAction={handleAction} />;
}

const Parent = React.memo(({ onAction }) => {
  const handleClick = useCallback((id) => {
    onAction({ id, timestamp: Date.now() });
  }, [onAction]); // Depends on onAction
  
  return <Child onClick={handleClick} />;
});

const Child = React.memo(({ onClick }) => {
  return <button onClick={() => onClick('item-123')}>Click</button>;
});
```

## useCallback vs useMemo

```javascript
// useCallback: Returns memoized function
const handleClick = useCallback(() => {
  doSomething();
}, [deps]);

// useMemo: Returns memoized value
const value = useMemo(() => computeValue(), [deps]);

// These are equivalent:
useCallback(fn, deps) === useMemo(() => fn, deps)

// Example
function Component({ data }) {
  // Memoized function
  const handleClick = useCallback(() => {
    console.log('Clicked with', data);
  }, [data]);
  
  // Memoized value
  const processedData = useMemo(() => {
    return data.map(item => item * 2);
  }, [data]);
  
  // Equivalent to useCallback
  const handleClick2 = useMemo(() => {
    return () => console.log('Clicked with', data);
  }, [data]);
}
```

## Common Pitfalls

```javascript
// ❌ Missing dependencies
const handleClick = useCallback(() => {
  console.log(count); // Stale count
}, []); // Should include [count]

// ❌ Inline object/array in dependency
const handleSubmit = useCallback(() => {
  submitForm(formData);
}, [{ name: 'John' }]); // New object every render = always new function

// ❌ Using without React.memo
function Parent() {
  const handleClick = useCallback(() => {}, []); // Pointless
  return <Child onClick={handleClick} />; // Child not memoized
}

// ✅ With React.memo
const Child = React.memo(({ onClick }) => <button onClick={onClick}>Click</button>);

// ❌ Overusing for every function
const a = useCallback(() => {}, []);
const b = useCallback(() => {}, []);
const c = useCallback(() => {}, []);
// Only use when passing to memoized children or as effect dependencies

// ❌ Dependencies change every render
const obj = { id: 1 }; // New object every render
const handleClick = useCallback(() => {
  doSomething(obj);
}, [obj]); // Always creates new function

// ✅ Stable dependency
const obj = useMemo(() => ({ id: 1 }), []);
const handleClick = useCallback(() => {
  doSomething(obj);
}, [obj]);
```

## Decision Guide

```
Use useCallback when:
✅ Passing function to React.memo component
✅ Function is dependency of useEffect/useMemo
✅ Passing to child that uses it in its own hooks
✅ Creating custom hooks that return callbacks
✅ Preventing expensive child re-renders

Don't use useCallback when:
❌ Function only used internally (onClick on div/button)
❌ Child component not memoized
❌ Function has no dependencies (define outside component)
❌ Premature optimization (measure first!)
❌ Creating callbacks for every single function
```

## Quick Example: Before/After

```javascript
// Before: Child re-renders unnecessarily
function TodoApp() {
  const [todos, setTodos] = useState([]);
  const [filter, setFilter] = useState('all');
  
  const handleToggle = (id) => {
    setTodos(todos.map(t => 
      t.id === id ? { ...t, done: !t.done } : t
    ));
  };
  
  return (
    <>
      <FilterBar onFilterChange={setFilter} />
      <TodoList todos={todos} onToggle={handleToggle} />
    </>
  );
}
// Every filter change re-creates handleToggle, TodoList re-renders

// After: Child only re-renders when todos change
function TodoApp() {
  const [todos, setTodos] = useState([]);
  const [filter, setFilter] = useState('all');
  
  const handleToggle = useCallback((id) => {
    setTodos(prev => prev.map(t => 
      t.id === id ? { ...t, done: !t.done } : t
    ));
  }, []); // No dependencies with functional setState
  
  return (
    <>
      <FilterBar onFilterChange={setFilter} />
      <TodoList todos={todos} onToggle={handleToggle} />
    </>
  );
}

const TodoList = React.memo(({ todos, onToggle }) => {
  console.log('TodoList rendered');
  return <ul>{todos.map(t => <TodoItem key={t.id} todo={t} onToggle={onToggle} />)}</ul>;
});
```

## Performance Measurement

```javascript
function Parent() {
  const [count, setCount] = useState(0);
  
  // Without useCallback
  const handleClick1 = () => console.log('Clicked');
  
  // With useCallback
  const handleClick2 = useCallback(() => console.log('Clicked'), []);
  
  // Compare references
  console.log(handleClick1 === handleClick1); // false (new each render)
  console.log(handleClick2 === handleClick2); // true (same reference)
  
  return (
    <>
      <button onClick={() => setCount(count + 1)}>Count: {count}</button>
      <MemoizedChild onClick={handleClick2} />
    </>
  );
}
```

## With Custom Hooks

```javascript
// Custom hook returning callback
function useApi() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const fetchData = useCallback(async (endpoint) => {
    setLoading(true);
    const res = await fetch(endpoint);
    const json = await res.json();
    setData(json);
    setLoading(false);
  }, []); // Stable function
  
  return { data, loading, fetchData };
}

// Usage
function UserProfile({ userId }) {
  const { data, loading, fetchData } = useApi();
  
  useEffect(() => {
    fetchData(`/api/users/${userId}`);
  }, [userId, fetchData]); // fetchData stable, only runs when userId changes
  
  if (loading) return <div>Loading...</div>;
  return <div>{data?.name}</div>;
}
```

## References

- [React Docs: useCallback](https://react.dev/reference/react/useCallback)
- [React Docs: React.memo](https://react.dev/reference/react/memo)
- [When to useCallback](https://kentcdodds.com/blog/usememo-and-usecallback)

---

## Summary

**useCallback in one line:** Cache function references to prevent child re-renders

**Syntax:**
```javascript
const memoizedFn = useCallback(() => doSomething(a, b), [a, b]);
```

**Equivalent to:**
```javascript
const memoizedFn = useMemo(() => () => doSomething(a, b), [a, b]);
```

**Rule of thumb:** Only use when passing to React.memo children or as effect dependencies. Profile first, optimize second.