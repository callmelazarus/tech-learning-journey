# React useEffect Dependency List: A Well-Structured Overview

The dependency list in React’s `useEffect` hook determines when the effect runs by specifying which values to watch for changes. Understanding how to use and manage this list is crucial for writing predictable, efficient React components.

## Key Points

- **Purpose:** Controls when the effect runs—on mount, on update, or on specific value changes.
- **Syntax:** `useEffect(effectFn, [dep1, dep2, ...])`
- **Empty Array:** Runs effect only once after initial render (componentDidMount).
- **No Array:** Runs effect after every render (not recommended for most cases).
- **Specific Dependencies:** Runs effect when any listed dependency changes.
- **Reference Equality:** Dependencies are compared using reference equality (`===`).
- **Best Practices:** Always include all values used inside the effect in the dependency list.

## Step-by-Step Explanation & Examples

1. **Run Once on Mount**
   ```js
   useEffect(() => {
     // Runs only once after initial render
     fetchData();
   }, []);
   ```

2. **Run on Specific Value Change**
   ```js
   useEffect(() => {
     // Runs when 'userId' changes
     fetchUser(userId);
   }, [userId]);
   ```

3. **Run on Multiple Dependencies**
   ```js
   useEffect(() => {
     // Runs when either 'a' or 'b' changes
     calculate(a, b);
   }, [a, b]);
   ```

4. **No Dependency Array**
   ```js
   useEffect(() => {
     // Runs after every render
     logRender();
   });
   ```

5. **Reference Equality Example**
   ```js
   const obj = { value: 1 };
   useEffect(() => {
     // Will not re-run unless 'obj' reference changes
     doSomething(obj);
   }, [obj]);
   ```

## Common Pitfalls

- Omitting dependencies used inside the effect, causing stale values or bugs.
- Including functions or objects that change on every render, causing infinite loops.
- Misunderstanding reference equality—new objects/arrays/functions trigger effects.
- Overusing effects for logic that could be handled elsewhere (e.g., in event handlers).

## Practical Applications

- Fetching data when a parameter changes.
- Subscribing/unsubscribing to events or sockets.
- Synchronizing state with props or external sources.
- Triggering animations or side effects on specific changes.

## References

- [React Docs: useEffect](https://react.dev/reference/react/useEffect)
- [Kent C. Dodds: useEffect and Dependencies](https://kentcdodds.com/blog/useeffect-and-friends)
- [Overreacted: A Complete Guide to useEffect](https://overreacted.io/a-complete-guide-to-useeffect/)

---

## Greater Detail

### Advanced Concepts

- **Custom Hooks:** Encapsulate effect logic and dependency management for reuse.
- **Memoization:** Use `useCallback` and `useMemo` to stabilize function/object references in dependencies.
- **Linting:** Use eslint-plugin-react-hooks to enforce correct dependency lists.
- **Cleanup Functions:** Return a function from `useEffect` to clean up subscriptions or timers.
- **Derived State:** Avoid unnecessary effects by computing derived state outside of