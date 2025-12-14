# Redux Toolkit Reducers vs Extra Reducers: Complete Overview

Reducers and extra reducers in Redux Toolkit are functions that specify how application state changes in response to actions. Regular reducers handle actions defined within the same slice, while extra reducers handle actions from other slices or async thunks. Think of reducers as your own department handling internal tasks, while extra reducers are like interdepartmental coordination—responding to events happening in other parts of your application.

## Key Points

- **Reducers:** Handle actions defined in the same slice, auto-generate action creators
- **Extra Reducers:** Handle external actions (other slices, thunks), no action creators
- **Syntax:** Reducers use object notation, extra reducers use builder pattern
- **Immer:** Both use Immer for safe "mutating" syntax
- **Use Cases:** Reducers for local state, extra reducers for shared/async state

## High-Level Overview

### What are Reducers?

Reducers are functions defined within a slice that handle actions specific to that slice. They automatically generate action creators and manage local state.

```typescript
createSlice({
  name: 'counter',
  initialState: { value: 0 },
  reducers: {
    increment(state) {
      state.value += 1;  // Immer makes this safe
    }
  }
});
```

### What are Extra Reducers?

Extra reducers handle actions from outside the slice—async thunks, other slices, or external action creators. They don't generate action creators.

```typescript
createSlice({
  name: 'notifications',
  initialState: { list: [] },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(userLoggedIn, (state, action) => {
      state.list.push('User logged in!');
    });
  }
});
```

## Similarities

Both reducers and extra reducers share core characteristics:

### 1. Immutable Updates with Immer

```typescript
const slice = createSlice({
  name: 'example',
  initialState: { count: 0 },
  reducers: {
    increment(state) {
      state.count += 1;  // Safe "mutation"
    }
  },
  extraReducers: (builder) => {
    builder.addCase(someAction, (state) => {
      state.count += 1;  // Same Immer magic
    });
  }
});
```

### 2. Same Function Signature

```typescript
// Both receive state and action
reducers: {
  update(state, action: PayloadAction<number>) {
    state.value = action.payload;
  }
},
extraReducers: (builder) => {
  builder.addCase(externalAction, (state, action: PayloadAction<number>) => {
    state.value = action.payload;
  });
}
```

### 3. Must Be Pure Functions

```typescript
// ✅ Good - no side effects
reducers: {
  addItem(state, action) {
    state.items.push(action.payload);
  }
}

// ❌ Bad - side effects
reducers: {
  addItem(state, action) {
    state.items.push(action.payload);
    fetch('/api/track');  // ❌ Use middleware/thunks
  }
}
```

## Differences

### 1. Action Creator Generation

```typescript
const slice = createSlice({
  name: 'counter',
  initialState: { value: 0 },
  reducers: {
    increment(state) { }  // ✅ Generates slice.actions.increment()
  },
  extraReducers: (builder) => {
    builder.addCase(externalAction, (state) => { });  // ❌ No action creator
  }
});

// Usage
dispatch(slice.actions.increment());  // ✅ Works
dispatch(slice.actions.externalAction());  // ❌ Doesn't exist
```

### 2. Syntax

```typescript
// Reducers: Object notation
reducers: {
  increment(state) { },
  decrement(state) { }
}

// Extra Reducers: Builder pattern
extraReducers: (builder) => {
  builder
    .addCase(action1, (state) => { })
    .addMatcher(isPending, (state) => { });
}
```

### 3. Source of Actions

```typescript
// Reducers: Handle OWN actions
const counterSlice = createSlice({
  name: 'counter',
  reducers: {
    increment(state) { }  // Handles counter/increment
  }
});

// Extra Reducers: Handle EXTERNAL actions
const notificationsSlice = createSlice({
  name: 'notifications',
  extraReducers: (builder) => {
    builder.addCase(counterSlice.actions.increment, (state) => {
      // Responds to counter/increment from different slice
    });
  }
});
```

### 4. Use Cases

```typescript
// Reducers: Internal state management
reducers: {
  toggleSidebar(state) {
    state.sidebarOpen = !state.sidebarOpen;
  },
  updateForm(state, action) {
    state.form[action.payload.field] = action.payload.value;
  }
}

// Extra Reducers: Cross-cutting concerns
extraReducers: (builder) => {
  builder
    .addCase(fetchData.fulfilled, (state, action) => {
      state.data = action.payload;
    })
    .addCase(logout, (state) => {
      return initialState;  // Reset on logout
    });
}
```

### 5. Flexibility

```typescript
// Reducers: Simple object keys only
reducers: {
  action1(state) { },
  action2(state) { }
}

// Extra Reducers: Matchers and default cases
extraReducers: (builder) => {
  builder
    .addCase(action, handler)
    .addMatcher(isPending, handler)
    .addDefaultCase(handler);
}
```

## Common Examples

### Basic Reducers

```typescript
interface CounterState {
  value: number;
}

const counterSlice = createSlice({
  name: 'counter',
  initialState: { value: 0 } as CounterState,
  reducers: {
    increment(state) {
      state.value += 1;
    },
    decrement(state) {
      state.value -= 1;
    },
    incrementByAmount(state, action: PayloadAction<number>) {
      state.value += action.payload;
    },
    reset() {
      return { value: 0 };
    }
  }
});

export const { increment, decrement, incrementByAmount, reset } = counterSlice.actions;

// Usage
dispatch(increment());
dispatch(incrementByAmount(5));
```

### Async Thunks with Extra Reducers

```typescript
interface UsersState {
  users: User[];
  loading: boolean;
  error: string | null;
}

export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async () => {
    const response = await fetch('/api/users');
    return response.json();
  }
);

const usersSlice = createSlice({
  name: 'users',
  initialState: {
    users: [],
    loading: false,
    error: null
  } as UsersState,
  reducers: {
    clearError(state) {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch';
      });
  }
});
```

### Cross-Slice Communication

```typescript
// authSlice.ts
const authSlice = createSlice({
  name: 'auth',
  initialState: { user: null },
  reducers: {
    logout(state) {
      state.user = null;
    }
  }
});

export const { logout } = authSlice.actions;

// cartSlice.ts
const cartSlice = createSlice({
  name: 'cart',
  initialState: { items: [] },
  reducers: {
    addItem(state, action: PayloadAction<CartItem>) {
      state.items.push(action.payload);
    }
  },
  extraReducers: (builder) => {
    // Clear cart when user logs out
    builder.addCase(logout, (state) => {
      state.items = [];
    });
  }
});
```

### Using Matchers

```typescript
const todosSlice = createSlice({
  name: 'todos',
  initialState: {
    todos: [] as Todo[],
    loading: false,
    error: null as string | null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Match all pending actions
      .addMatcher(
        isPending(fetchTodos, createTodo, updateTodo),
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )
      // Match all fulfilled actions
      .addMatcher(
        isFulfilled(fetchTodos, createTodo, updateTodo),
        (state) => {
          state.loading = false;
        }
      )
      // Match all rejected actions
      .addMatcher(
        isRejected(fetchTodos, createTodo, updateTodo),
        (state, action) => {
          state.loading = false;
          state.error = action.error.message || 'Error occurred';
        }
      );
  }
});
```

### Prepare Callback (Advanced Reducers)

```typescript
const todosSlice = createSlice({
  name: 'todos',
  initialState: [] as Todo[],
  reducers: {
    addTodo: {
      reducer(state, action: PayloadAction<Todo>) {
        state.push(action.payload);
      },
      prepare(text: string) {
        return {
          payload: {
            id: crypto.randomUUID(),
            text,
            completed: false,
            createdAt: new Date().toISOString()
          }
        };
      }
    }
  }
});

// Usage - only pass text, prepare generates full object
dispatch(addTodo('Buy groceries'));
```

## Common Pitfalls

- Using reducers for async logic (use createAsyncThunk instead)
- Not handling all thunk states (pending, fulfilled, rejected)
- Mutating state outside Immer context
- Using deprecated extraReducers object syntax (use builder)
- Forgetting to export action creators from reducers
- Creating circular dependencies between slices

## Practical Applications

**Reducers:**
- Form state updates
- UI toggles (modals, sidebars)
- Filtering and sorting
- Adding/removing items from lists

**Extra Reducers:**
- API data fetching
- Authentication flow
- Global loading states
- Resetting state on logout
- Cross-slice synchronization

## Quick Decision Guide

```
Use REDUCERS when:
✅ Action is specific to this slice
✅ Need auto-generated action creator
✅ Simple synchronous state update

Use EXTRA REDUCERS when:
✅ Handling async thunks
✅ Responding to other slices' actions
✅ Need matchers or default cases
✅ Cross-slice coordination needed
```

## Best Practices

```typescript
// ✅ Good: Clear separation
const slice = createSlice({
  name: 'todos',
  initialState,
  reducers: {
    // Local actions only
    addTodo(state, action) { },
    toggleTodo(state, action) { }
  },
  extraReducers: (builder) => {
    // External actions only
    builder
      .addCase(fetchTodos.fulfilled, (state, action) => { })
      .addCase(logout, () => initialState);
  }
});

// ✅ Good: Handle all async states
extraReducers: (builder) => {
  builder
    .addCase(fetchData.pending, (state) => {
      state.loading = true;
    })
    .addCase(fetchData.fulfilled, (state, action) => {
      state.loading = false;
      state.data = action.payload;
    })
    .addCase(fetchData.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message;
    });
}

// ✅ Good: Use matchers for patterns
extraReducers: (builder) => {
  builder.addMatcher(
    isPending(fetchA, fetchB, fetchC),
    (state) => { state.loading = true; }
  );
}
```

## References

- [Redux Toolkit: createSlice](https://redux-toolkit.js.org/api/createSlice)
- [Redux Toolkit: createAsyncThunk](https://redux-toolkit.js.org/api/createAsyncThunk)
- [Builder Callback API](https://redux-toolkit.js.org/api/createSlice#the-builder-callback-api)
- [Immer Documentation](https://immerjs.github.io/immer/)