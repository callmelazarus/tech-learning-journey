# `package.json` Dependencies & Overrides: Deep Dive

Dependencies define **what your project needs to run**, and overrides let you **forcefully control what gets installed deep in the dependency tree** — even packages you didn't directly install. Understanding these sections in depth prevents version conflicts, security vulnerabilities, and the infamous "works on my machine" problems.

## Dependencies: The Four Types

### 1. `dependencies` — Production Runtime

Packages your application needs to function when deployed. Installed in production, shipped to users (or your server).

```json
{
  "dependencies": {
    "express": "^4.18.2",
    "zod": "^3.22.4",
    "pg": "^8.11.3",
    "@aws-sdk/client-s3": "^3.450.0",
    "jsonwebtoken": "^9.0.2"
  }
}
```

**The test:** If you removed this package, would your app crash in production? If yes → `dependencies`.

```bash
# Install to dependencies (default)
npm install express
npm install zod pg
```

### 2. `devDependencies` — Build & Development Only

Packages needed during development but not at runtime. Not installed when consumers `npm install` your package, and excluded with `npm install --production`.

```json
{
  "devDependencies": {
    "typescript": "^5.3.3",
    "vitest": "^1.2.0",
    "eslint": "^8.56.0",
    "@types/express": "^4.17.21",
    "@types/pg": "^8.10.9",
    "prettier": "^3.2.0",
    "tsx": "^4.7.0",
    "lint-staged": "^15.2.0",
    "husky": "^9.0.0"
  }
}
```

**The test:** Is this only used for building, testing, linting, or developer experience? If yes → `devDependencies`.

```bash
# Install to devDependencies
npm install --save-dev typescript
npm install -D vitest eslint

# Production install skips devDependencies
npm install --production
# or
NODE_ENV=production npm install
```

**Common mistakes:**

```json
// ✗ WRONG — these should be devDependencies
{
  "dependencies": {
    "typescript": "^5.3.3",     // only used at build time
    "@types/node": "^20.11.0",  // only used at build time
    "vitest": "^1.2.0",         // only used for testing
    "eslint": "^8.56.0"         // only used for linting
  }
}

// ✓ CORRECT
{
  "dependencies": {
    "express": "^4.18.2"        // actually needed at runtime
  },
  "devDependencies": {
    "typescript": "^5.3.3",
    "@types/node": "^20.11.0",
    "vitest": "^1.2.0",
    "eslint": "^8.56.0"
  }
}
```

### 3. `peerDependencies` — "You Provide This"

Peer dependencies declare that your package needs a certain package to exist, but the *consumer* should install it. This prevents duplicate installations of packages that must be shared (like React — you can't have two Reacts on the same page).

```json
// A React component library's package.json
{
  "name": "@myorg/ui-components",
  "peerDependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  },
  "peerDependenciesMeta": {
    "react-dom": {
      "optional": true
    }
  },
  "devDependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  }
}
```

**Why not just `dependencies`?** If your library puts React in `dependencies`, and the consumer also has React in their `dependencies`, you get two copies of React — different instances, different state, broken hooks. Peer dependencies say "use whatever version the host app already has."

```
Without peerDependencies:
my-app/
├── node_modules/
│   ├── react@18.2.0           ← app's React
│   └── @myorg/ui-components/
│       └── node_modules/
│           └── react@18.3.0   ← library's own React (DUPLICATE!)

With peerDependencies:
my-app/
├── node_modules/
│   ├── react@18.2.0           ← shared by app AND library
│   └── @myorg/ui-components/  ← uses the parent's React
```

**npm 7+ auto-installs peer dependencies.** Earlier versions just warned. `peerDependenciesMeta` lets you mark some as optional — if the consumer doesn't have `react-dom` (e.g., React Native), no warning is shown.

### 4. `optionalDependencies` — Nice to Have

Dependencies that your package can function without. If installation fails (wrong OS, missing build tools), npm continues instead of erroring.

```json
{
  "optionalDependencies": {
    "fsevents": "^2.3.3"
  }
}
```

`fsevents` is the classic example — it's a macOS-only native module for fast file watching. On Linux/Windows, it fails to install, but tools like Vite and Chokidar fall back to polling.

```js
// Code that handles an optional dependency
let fsevents;
try {
  fsevents = require("fsevents");
} catch {
  // Not available on this platform — use fallback
  fsevents = null;
}
```

## Version Ranges In Depth

### The Symbols

```
Exact:
  "lodash": "4.17.21"            Only this version. No flexibility.

Caret (^) — the default:
  "lodash": "^4.17.21"           ≥4.17.21 and <5.0.0
  "lodash": "^0.4.2"             ≥0.4.2  and <0.5.0  (⚠ pre-1.0 special case)
  "lodash": "^0.0.3"             ≥0.0.3  and <0.0.4  (⚠ pre-0.1 special case)

Tilde (~):
  "lodash": "~4.17.21"           ≥4.17.21 and <4.18.0

Comparison:
  "lodash": ">=4.17.0"           4.17.0 or higher (any major)
  "lodash": ">=4.17.0 <5.0.0"    between 4.17.0 and 5.0.0
  "lodash": "4.17.x"             any patch in 4.17

Range:
  "lodash": "4.17.0 - 4.17.99"   inclusive range

OR:
  "lodash": "^3.0.0 || ^4.0.0"   either major version 3 or 4
```

**The caret pre-1.0 gotcha:** Before version 1.0.0, semver treats minor versions as breaking changes. `^0.4.2` only allows `0.4.x`, not `0.5.0`. This catches many people off guard.

```
^1.2.3  →  >=1.2.3  <2.0.0   (normal — minor+patch updates)
^0.2.3  →  >=0.2.3  <0.3.0   (pre-1.0 — only patch updates!)
^0.0.3  →  >=0.0.3  <0.0.4   (pre-0.1 — effectively pinned!)
```

### Lockfiles: Why Ranges Aren't Enough

`package.json` defines what's *acceptable*. The lockfile records what was *actually installed*.

```
package.json:               package-lock.json:
"express": "^4.18.2"        "express": "4.18.3"  ← exact version frozen

Developer A installs on Jan 1:  gets express 4.18.2
Developer B installs on Mar 1:  gets express 4.18.3 (new patch released)

Without lockfile: Different versions → potential bugs
With lockfile:    Both get 4.18.3 (the locked version)
```

```bash
# Install respecting the lockfile (CI and team consistency)
npm ci          # clean install from lockfile — fastest, strictest
npm install     # resolves from package.json, updates lockfile if needed

# Update a specific package within its allowed range
npm update express

# Update beyond the allowed range (e.g., ^4.x to ^5.x)
npm install express@latest
```

## The Dependency Tree

Your project's dependencies have their own dependencies (transitive dependencies). This creates a tree.

```
your-app
├── express@4.18.2
│   ├── body-parser@1.20.2
│   │   ├── bytes@3.1.2
│   │   ├── content-type@1.0.5
│   │   └── debug@2.6.9
│   │       └── ms@2.0.0        ← you never installed this,
│   ├── cookie@0.6.0             but it's in your node_modules
│   └── ...47 more packages
├── zod@3.22.4
│   └── (no dependencies)       ← some packages have zero deps
└── pg@8.11.3
    ├── pg-protocol@1.6.0
    ├── pg-pool@3.6.1
    └── ...
```

```bash
# See the full dependency tree
npm ls

# See why a specific package is installed
npm explain ms
# ms@2.0.0
#   debug@2.6.9
#     body-parser@1.20.2
#       express@4.18.2
#         your-app@1.0.0

# See just top-level dependencies
npm ls --depth=0

# Find duplicate packages
npm ls --all | grep "deduped"

# Clean up duplicates
npm dedupe
```

## Overrides — Forcing Versions

`overrides` (npm 8.3+) lets you replace any package in the entire dependency tree — even transitive dependencies you don't directly control.

### Why You Need Overrides

```
Scenario: A critical security vulnerability is found in "minimist@1.2.5"

Your dependency tree:
your-app
└── some-tool@3.0.0
    └── build-helper@2.1.0
        └── minimist@1.2.5  ← VULNERABLE

Problem:
- You don't control "some-tool" or "build-helper"
- The maintainers haven't released a fix yet
- You need minimist@1.2.8 (patched) NOW

Solution: Override it
```

```json
{
  "overrides": {
    "minimist": "1.2.8"
  }
}
```

This forces *every* instance of `minimist` in the entire tree to use version `1.2.8`, regardless of what other packages request.

### Override Patterns

```json
{
  "overrides": {

    // 1. Override a package globally (everywhere in the tree)
    "minimist": "1.2.8",

    // 2. Override only when it's a dependency of a specific package
    "some-tool": {
      "minimist": "1.2.8"
    },

    // 3. Override deeply nested — only when minimist comes through a specific chain
    "some-tool": {
      "build-helper": {
        "minimist": "1.2.8"
      }
    },

    // 4. Use a version range
    "debug": "^4.3.4",

    // 5. Force to match your top-level dependency version
    // ($ references the version in your own dependencies)
    "typescript": "$typescript",

    // 6. Replace one package with another entirely
    "underscore": "npm:lodash@^4.17.21"
  }
}
```

### Common Override Use Cases

**Security patching:**

```json
{
  "overrides": {
    "nth-check": ">=2.0.1",
    "postcss": ">=8.4.31",
    "semver": ">=7.5.2"
  }
}
```

**Forcing a single version (deduplication):**

```json
// Multiple packages depend on different versions of "debug"
// Force everyone to use the same one
{
  "overrides": {
    "debug": "4.3.4"
  }
}
```

**Replacing a deprecated package:**

```json
{
  "overrides": {
    "request": "npm:@cypress/request@^3.0.0"
  }
}
```

The `npm:` prefix installs one package under another's name. Every `require("request")` or `import "request"` in the tree resolves to `@cypress/request` instead.

### Yarn and pnpm Equivalents

Each package manager has its own syntax for the same concept:

```json
// npm — overrides
{
  "overrides": {
    "minimist": "1.2.8"
  }
}

// yarn (v1) — resolutions
{
  "resolutions": {
    "minimist": "1.2.8",
    "some-tool/**/minimist": "1.2.8"
  }
}

// pnpm — overrides (same key, in pnpm section or root)
{
  "pnpm": {
    "overrides": {
      "minimist": "1.2.8"
    }
  }
}
```

### Verifying Overrides Work

```bash
# After adding an override, reinstall
rm -rf node_modules package-lock.json
npm install

# Verify the correct version is installed everywhere
npm ls minimist
# your-app@1.0.0
# ├─┬ some-tool@3.0.0
# │ └─┬ build-helper@2.1.0
# │   └── minimist@1.2.8        ← overridden ✓
# └── minimist@1.2.8            ← if you also use it directly

# Check for known vulnerabilities
npm audit
```

## Dependency Management Commands

```bash
# ── Installing ──
npm install                    # install all deps from package.json
npm ci                         # clean install from lockfile (CI-recommended)
npm install express            # add to dependencies
npm install -D vitest          # add to devDependencies
npm install --production       # skip devDependencies

# ── Inspecting ──
npm ls                         # full dependency tree
npm ls --depth=0               # top-level only
npm ls minimist                # where is this package used?
npm explain minimist           # why is this package installed?
npm outdated                   # which packages have newer versions?

# ── Updating ──
npm update                     # update all within allowed ranges
npm update express             # update one package within its range
npm install express@latest     # jump to latest (may cross major version)
npx npm-check-updates -u       # update package.json ranges to latest

# ── Removing ──
npm uninstall express          # remove a package
npm prune                      # remove packages not in package.json

# ── Security ──
npm audit                      # check for known vulnerabilities
npm audit fix                  # auto-fix by updating within ranges
npm audit fix --force          # fix even with breaking changes (⚠️ risky)
```

## Common Pitfalls

- **Not understanding transitive dependencies.** You install 5 packages; your `node_modules` has 500. Every dependency has its own dependencies. Use `npm ls` and `npm explain` to understand what's actually in your tree.
- **Using overrides without cleaning first.** After adding an override, delete `node_modules` and `package-lock.json` and run `npm install` fresh. Otherwise the old version may persist in the lockfile.
- **Overriding to an incompatible version.** Forcing `debug@4.x` when a package requires `debug@2.x` might work — or might crash with obscure errors. Test thoroughly after applying overrides.
- **Forgetting the pre-1.0 caret behavior.** `^0.4.2` doesn't mean "any 0.x" — it means "only 0.4.x." Many teams are bitten by this when depending on pre-1.0 packages that don't update as expected.
- **Not running `npm audit` regularly.** Transitive dependencies accumulate vulnerabilities over time. Run `npm audit` in CI and address findings before they become urgent.
- **Using `npm audit fix --force` blindly.** This can upgrade packages across major versions, introducing breaking changes. Review the proposed changes before applying.

## Practical Applications

- **Security patching:** Use overrides to immediately patch a vulnerable transitive dependency without waiting for upstream maintainers.
- **Deduplication:** Force a single version of a common package (like `debug` or `ms`) to reduce bundle size and avoid conflicts.
- **Migration:** When upgrading a major dependency, overrides can force the entire tree to use the new version while you fix compatibility issues incrementally.
- **CI consistency:** Use `npm ci` (not `npm install`) in pipelines to ensure reproducible builds from the lockfile.
- **Monorepo dependency alignment:** Use overrides to ensure all packages in a monorepo use the same version of shared dependencies, preventing version mismatch bugs.

## References

- [npm Docs: package.json dependencies](https://docs.npmjs.com/cli/v10/configuring-npm/package-json#dependencies)
- [npm Docs: overrides](https://docs.npmjs.com/cli/v10/configuring-npm/package-json#overrides)
- [npm Docs: peer dependencies](https://docs.npmjs.com/cli/v10/configuring-npm/package-json#peerdependencies)
- [Semver Specification](https://semver.org/)
- [npm Docs: npm audit](https://docs.npmjs.com/cli/v10/commands/npm-audit)

---

## Greater Detail

### Advanced Concepts

- **Phantom Dependencies:** In flat `node_modules` structures (npm default), you can accidentally import packages that aren't in your `package.json` — they're there because a dependency installed them. This works locally but breaks when that dependency updates and stops including them. pnpm's strict `node_modules` structure prevents this.
- **`bundleDependencies` / `bundledDependencies`:** Rarely used — packages listed here are included in the tarball when you `npm pack`. Useful for offline installs or bundling specific versions with your package when you can't rely on the registry.
- **`install` Scripts and Security:** Some packages run arbitrary code during `npm install` via `preinstall`/`postinstall` scripts. This is a supply chain attack vector. Tools like `socket.dev` audit install scripts, and `npm install --ignore-scripts` disables them (but may break packages that need native compilation).
- **Aliased Dependencies:** Install multiple versions of the same package under different names: `npm install lodash3@npm:lodash@3 lodash4@npm:lodash@4`. Useful during migration when different parts of your code need different major versions.
- **`npm query`:** npm 8.16+ includes a CSS-selector-like query engine for your dependency tree: `npm query ":type(dev) > :attr(engines, [node>=18])"` finds devDependencies requiring Node 18+. Powerful for auditing and scripting.