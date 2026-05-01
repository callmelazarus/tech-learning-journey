# Hot Reloading: Complete Overview

**Hot reloading** (also called **Hot Module Replacement** or HMR) is the ability to update running code in a live application — pushing changes to the browser or runtime *without a full page refresh*. The app stays alive, state is preserved, and you see your changes near-instantly.

> **Analogy:** Think of a live music performance. A full reload is like stopping the concert, clearing the stage, and starting over from the top. Hot reloading is like swapping out the guitarist mid-song — the band keeps playing, the audience never loses the beat.

Hot reloading is a development-time feature only. It dramatically tightens the feedback loop between writing code and seeing results — one of the biggest levers on developer productivity.

---

## Key Points

- **State is preserved** — form inputs, scroll position, UI state survive the update.
- **Only changed modules are replaced** — not the entire application.
- **Development only** — never shipped to production.
- **Framework-aware** — React, Vue, Svelte, and others have their own HMR integrations.
- **Not the same as live reload** — live reload refreshes the entire page; HMR surgically replaces modules.
- **Powered by the bundler** — Webpack, Vite, Parcel, and esbuild all implement HMR differently, with varying speed and reliability.

---

## Hot Reload vs. Live Reload vs. Full Restart

| | Hot Reload (HMR) | Live Reload | Full Restart |
|---|---|---|---|
| **What changes** | Only modified module | Entire page | Entire process |
| **State preserved** | ✅ Yes | ❌ No | ❌ No |
| **Speed** | Near-instant | Fast (seconds) | Slow |
| **Dev server needed** | ✅ Yes | ✅ Yes | ❌ No |
| **Example tools** | Vite, Webpack HMR | BrowserSync | `nodemon` restart |

---

## How It Works — Under the Hood

At a high level, HMR follows this flow on every file save:

```
1. File saved
      ↓
2. Bundler detects change (file watcher)
      ↓
3. Only the changed module(s) are recompiled
      ↓
4. Bundler sends an update payload to the browser via WebSocket
      ↓
5. HMR runtime in the browser receives the update
      ↓
6. Old module is swapped out, new module is applied
      ↓
7. Component re-renders — state intact
```

> The bundler keeps a **module graph** — a map of how every file depends on every other file. When you change `Button.jsx`, it knows exactly which parts of the app need updating, and touches nothing else.

---

## Hot Reloading in Practice

### React + Vite (Most Common Today)

Vite uses native ES modules and a highly optimized HMR layer. Changes to React components reflect in the browser in milliseconds.

```bash
npm create vite@latest my-app -- --template react
cd my-app && npm install && npm run dev
```

```jsx
// Edit this component and save — browser updates instantly, no refresh
export default function Counter({ count }) {
  return <button>{count} clicks</button>;
}
```

Vite's `@vitejs/plugin-react` uses **React Fast Refresh** under the hood — a React-specific HMR protocol that preserves component state across updates.

---

### React Fast Refresh vs. Classic HMR

Before Fast Refresh, React HMR was fragile — hooks didn't survive updates reliably, and you'd get stale closures or broken state. Fast Refresh (introduced ~2019) solved this by making HMR React-aware:

- Only re-renders the component that changed
- Preserves `useState` and `useRef` values across edits
- Resets state only when the component's *shape* changes fundamentally (e.g., adding/removing a hook)
- Errors in a component don't crash the whole app — just that component's subtree

```jsx
// Fast Refresh preserves this count across edits to the JSX
function Counter() {
  const [count, setCount] = useState(0); // ← survives hot reload

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(c => c + 1)}>Increment</button>
    </div>
  );
}
```

---

### Webpack HMR

The original HMR implementation. Still widely used in Create React App and custom Webpack configs.

```js
// webpack.config.js
module.exports = {
  mode: 'development',
  devServer: {
    hot: true, // enable HMR
  }
};
```

Webpack HMR is more configurable but slower than Vite for large projects — it bundles everything before serving, whereas Vite serves native ES modules directly.

---

### CSS Hot Reloading

CSS changes are the simplest form of HMR — style sheets can be swapped without touching JS at all. Vite and Webpack both handle this by replacing the `<link>` tag or injecting updated `<style>` blocks directly.

```css
/* Save this — browser updates instantly, no flicker, state intact */
.button {
  background: coral;
  border-radius: 8px;
}
```

---

### Node.js — `nodemon` and HMR

On the server side, traditional "hot reloading" is handled by `nodemon` — which watches files and restarts the process on change. This is *live reload*, not true HMR (state is lost on restart).

```bash
nodemon server.js
```

Node.js 18+ added experimental `--watch` mode, making `nodemon` optional for simple use cases:

```bash
node --watch server.js
```

True server-side HMR (without process restart) is emerging in frameworks like **Bun** and **Vite SSR**, but full state preservation on the server remains a harder problem.

---

### React Native — Fast Refresh

React Native ships Fast Refresh built-in. Edit a component, save, and the simulator updates in place — no rebuild cycle, no app restart. Native state (like navigation stack) is preserved.

```bash
# Already enabled by default in Expo and React Native CLI
npx expo start
```

Press `r` in the terminal to force a full reload when HMR gets into a bad state.

---

## When HMR Breaks (And What to Do)

HMR is best-effort. Some changes can't be hot-replaced and will trigger a full reload or require a manual refresh:

| Change Type | HMR Behavior |
|---|---|
| Edit JSX / template | ✅ Hot replaced |
| Edit CSS / styles | ✅ Hot replaced |
| Add/remove a hook | ⚠️ State reset for that component |
| Edit a context provider | ⚠️ May reset subtree state |
| Edit `index.html` | ❌ Full reload |
| Add a new dependency | ❌ Restart dev server |
| Change `vite.config.js` | ❌ Restart dev server |
| Edit a non-component JS module | ⚠️ Depends on HMR boundary |

**When things go wrong:**
- Force a full page refresh (`Cmd+Shift+R` / `Ctrl+Shift+R`)
- Restart the dev server (`Ctrl+C` → `npm run dev`)
- Check the browser console — HMR errors are usually logged there with context

---

## HMR Boundaries

A core concept in HMR: a **boundary** is a module that knows how to accept and handle its own updates. React components are natural HMR boundaries — Fast Refresh treats each component file as one.

If a changed module has no HMR boundary, the update **bubbles up** the module graph until it finds one (or falls back to a full page reload).

```js
// Vite's HMR API — rarely needed in React/Vue apps, but available for vanilla JS
if (import.meta.hot) {
  import.meta.hot.accept((newModule) => {
    // handle the updated module yourself
  });

  import.meta.hot.dispose(() => {
    // cleanup before the old module is replaced (clear timers, close sockets)
  });
}
```

---

## Common Pitfalls

- **Side effects in module scope** — code that runs at module load time (event listeners, timers, global state) may run again on hot update, causing duplicates or stale references. Use `import.meta.hot.dispose` to clean up.

  ```js
  const interval = setInterval(tick, 1000);

  if (import.meta.hot) {
    import.meta.hot.dispose(() => clearInterval(interval)); // prevent duplicates
  }
  ```

- **State preserved when you don't want it** — sometimes a stale state from before your code change masks the bug you're trying to fix. Force a full reload to get a clean slate.

- **HMR in non-React contexts** — vanilla JS, Svelte, and Vue have HMR, but the boundary rules differ. Don't assume React behavior transfers.

- **Confusing HMR errors with runtime bugs** — HMR errors are noisy. A component failing to hot-replace doesn't mean your code is broken; it may just need a manual refresh.

- **`useEffect` with dependencies** — on hot reload, effects may re-fire depending on how the module is replaced. If you notice unexpected side effects during development, this is often why.

---

## Practical Applications

- Iterating on UI styling and layout (tightest feedback loop possible)
- Debugging component logic without losing form state or navigation position
- Rapidly prototyping new features in a running app
- Tweaking animations and transitions where timing is sensitive to state

---

## References

- [Vite: Hot Module Replacement](https://vitejs.dev/guide/api-hmr)
- [Webpack: Hot Module Replacement](https://webpack.js.org/concepts/hot-module-replacement/)
- [React Fast Refresh (Dan Abramov)](https://github.com/facebook/react/issues/16604)
- [MDN: WebSockets](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API) — the transport layer behind HMR

---

## Greater Detail

### Advanced Concepts

- **Vite vs. Webpack HMR Speed:** Vite's speed advantage comes from serving native ES modules directly to the browser during development — no bundling step. When a file changes, only that one module is re-fetched. Webpack must re-bundle the changed chunk before sending it, making HMR slower as the project grows.

- **Module graph invalidation:** When a file deep in the dependency tree changes, HMR must walk up the module graph to find the nearest accepting boundary. A deeply nested utility file changing can trigger a broader re-render than expected. Good HMR performance means keeping boundaries shallow and well-defined.

- **HMR + Zustand / Redux:** Global state managers (Zustand, Redux) require special HMR handling. Redux recommends re-running the root reducer with `store.replaceReducer()` on hot update. Zustand stores typically survive HMR naturally since they live outside the React tree.

  ```js
  // Redux HMR pattern
  if (import.meta.hot) {
    import.meta.hot.accept('./rootReducer', () => {
      store.replaceReducer(rootReducer);
    });
  }
  ```

- **HMR in Monorepos:** Shared packages in a monorepo (e.g., a component library) don't HMR by default — changes require a rebuild of the package. Tools like `pnpm` workspaces with Vite's `optimizeDeps.include` or Turborepo's watch mode can bridge this gap.

- **Source Maps + HMR:** For HMR to point errors to the right source file (not the bundled output), source maps must be enabled in your dev config. Vite enables them by default; Webpack requires `devtool: 'eval-source-map'` or similar.

- **Bun's native HMR:** Bun (the JS runtime) ships HMR built into its bundler with no configuration, including for server-side code — a sign that native-speed HMR without tooling overhead is where the ecosystem is heading.