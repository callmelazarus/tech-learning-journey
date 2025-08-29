# React Redux: A Concise Overview

Redux is a predictable state container for JavaScript apps, commonly used with React to manage application state in a centralized, consistent way.

## Key Points

- **Centralized State:** Redux stores all application state in a single object.
- **Unidirectional Data Flow:** State changes via dispatched actions and reducers.
- **Pure Functions:** Reducers are pure functions that determine state updates.
- **Middleware Support:** Redux can handle async logic and side effects via middleware (e.g., redux-thunk).
- **React Integration:** The `react-redux` library connects Redux state to React components.

## Step-by-Step Explanation

1. **Create a Redux Store**
   ```js
   import { createStore } from 'redux';
   const store = createStore(reducer);
   ```

2. **Define Actions**
   ```js
   const increment = { type: 'INCREMENT' };
   ```

3. **Write a Reducer**
   ```js
   function counter(state = 0, action) {
     switch (action.type) {
       case 'INCREMENT':
         return state + 1;
       default:
         return state;
     }
   }
   ```

4. **Connect React Components**
   ```js
   import { Provider, useSelector, useDispatch } from 'react-redux';

   function Counter() {
     const count = useSelector(state => state);
     const dispatch = useDispatch();
     return (
       <button onClick={() => dispatch({ type: 'INCREMENT' })}>
         {count}
       </button>
     );
   }
   ```

## Common Pitfalls

- **Mutating State:** Always return new state objects in reducers; never mutate.
- **Overusing Redux:** Use Redux only for global/shared state, not for local UI state.
- **Forgetting to Wrap with `<Provider>`:** React components need access to the Redux store via the Provider.

## Practical Applications

- Managing global UI state (e.g., authentication, theme).
- Handling complex state transitions.
- Sharing state across deeply nested components.

## References

- [Redux Official Documentation](https://redux.js.org/)
- [React Redux Documentation](https://react-redux.js.org/)
-