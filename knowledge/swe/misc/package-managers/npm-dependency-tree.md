# NPM Dependency Trees: Complete Overview

NPM dependency trees show the hierarchical structure of packages your project depends on, including nested dependencies (dependencies of dependencies). Running `npm ls` displays this tree, revealing which packages are installed and how they relate. Think of it like a family tree—your direct dependencies are your children, their dependencies are grandchildren, and so on down multiple generations.

## Key Points

- **Dependency Tree:** Hierarchical structure of all packages and their dependencies
- **Direct Dependencies:** Packages listed in your `package.json`
- **Transitive Dependencies:** Dependencies of your dependencies
- **npm ls:** Command to view dependency tree
- **node_modules:** Flat structure on disk, but logical tree in npm

## Basic Concepts

### Direct vs Transitive Dependencies

```json
// package.json
{
  "dependencies": {
    "express": "^4.18.0",      // Direct dependency
    "lodash": "^4.17.21"       // Direct dependency
  }
}

// Dependency tree
your-app
├── express@4.18.0            // Direct
│   ├── body-parser@1.20.0    // Transitive (express's dependency)
│   ├── cookie@0.5.0          // Transitive
│   └── debug@2.6.9           // Transitive
│       └── ms@2.0.0          // Transitive (debug's dependency)
└── lodash@4.17.21            // Direct
```

### Viewing the Tree

```bash
# Full tree (all levels)
npm ls

# Limit depth
npm ls --depth=0      # Only direct dependencies
npm ls --depth=1      # Direct + one level down
npm ls --depth=2      # Two levels down

# Specific package
npm ls express        # Where is express used?
npm ls lodash         # Show lodash and its dependents

# Production only (no devDependencies)
npm ls --prod
npm ls --production

# Show all versions (even duplicates)
npm ls --all
```

## Understanding the Output

### Basic Tree

```bash
npm ls --depth=1

my-app@1.0.0
├── express@4.18.0
│   ├── accepts@1.3.8
│   ├── array-flatten@1.1.1
│   └── body-parser@1.20.0
├── lodash@4.17.21
└── react@18.2.0
    ├── loose-envify@1.4.0
    └── scheduler@0.23.0
```

**Reading the tree:**
```
├── Direct dependency (top level)
│   ├── Transitive dependency (nested)
│   └── Another transitive dependency
└── Last direct dependency
    └── Its dependency
```

### Deduplication

```bash
# Before deduplication
app
├── package-a@1.0.0
│   └── lodash@4.17.21
└── package-b@1.0.0
    └── lodash@4.17.21    # Duplicate!

# After npm install (deduplicated)
app
├── package-a@1.0.0
│   └── lodash@4.17.21 deduped
├── package-b@1.0.0
│   └── lodash@4.17.21 deduped
└── lodash@4.17.21    # Hoisted to top level

# "deduped" means it uses the top-level version
```

### Version Conflicts

```bash
# Different versions needed
app
├── package-a@1.0.0
│   └── lodash@4.17.21
├── package-b@1.0.0
│   └── lodash@3.10.1    # Different version required!
└── lodash@4.17.21       # Hoisted (most common version)

# package-a uses top-level lodash@4.17.21
# package-b gets its own lodash@3.10.1 nested
```

## Common Commands

### Find Package Location

```bash
# Where is a package in the tree?
npm ls express

# Output
my-app@1.0.0
└── express@4.18.0

# Why is this package installed?
npm why lodash

# Output (shows all paths to lodash)
lodash@4.17.21
node_modules/lodash
  lodash@"^4.17.21" from the root project

# Find all versions of a package
npm ls lodash --all

# Output
my-app@1.0.0
├─┬ package-a@1.0.0
│ └── lodash@4.17.21 deduped
├─┬ package-b@2.0.0
│ └── lodash@3.10.1
└── lodash@4.17.21
```

### Check for Issues

```bash
# List missing dependencies
npm ls
# Shows UNMET DEPENDENCY if something missing

# List extraneous packages
npm ls --parseable --depth=0 | grep -v node_modules
# Shows packages in node_modules not in package.json

# Check for vulnerabilities
npm audit
npm audit --production  # Only prod dependencies
```

## Dependency Types

### dependencies

```json
{
  "dependencies": {
    "express": "^4.18.0"
  }
}
```
**Used:** Production runtime
**Installed:** `npm install` (always)

### devDependencies

```json
{
  "devDependencies": {
    "jest": "^29.0.0",
    "eslint": "^8.0.0"
  }
}
```
**Used:** Development/testing only
**Installed:** `npm install` (only if not `--production`)

### peerDependencies

```json
{
  "peerDependencies": {
    "react": "^18.0.0"
  }
}
```
**Used:** Package requires this to be installed by parent
**Example:** React plugin needs React installed

### optionalDependencies

```json
{
  "optionalDependencies": {
    "fsevents": "^2.3.0"
  }
}
```
**Used:** Package works without it, but better with it
**Install fails:** Doesn't break installation

## Understanding node_modules Structure

### Flat vs Nested

```bash
# Old npm (< v3): Nested structure
node_modules/
├── express/
│   └── node_modules/
│       ├── body-parser/
│       │   └── node_modules/
│       │       └── debug/
│       └── cookie/
└── lodash/

# Modern npm (v3+): Flat structure
node_modules/
├── express/
├── body-parser/    # Hoisted to top level
├── debug/          # Hoisted
├── cookie/         # Hoisted
└── lodash/

# Benefits: Smaller disk usage, faster installs
```

### Hoisting Rules

```
npm hoists dependencies to highest possible level

Example:
app needs express@4.18.0
express needs body-parser@1.20.0

Result:
node_modules/
├── express/
└── body-parser/  ← Hoisted to top (no version conflict)

If version conflict:
app needs body-parser@1.19.0
express needs body-parser@1.20.0

Result:
node_modules/
├── express/
│   └── node_modules/
│       └── body-parser/  ← 1.20.0 (stays nested)
├── body-parser/  ← 1.19.0 (top level, direct dependency)
```

## Troubleshooting

### Duplicate Dependencies

```bash
# Find duplicates
npm ls lodash

# If multiple versions shown:
app
├─┬ package-a
│ └── lodash@4.17.21
├─┬ package-b
│ └── lodash@4.17.20
└── lodash@4.17.21

# Fix: Deduplicate
npm dedupe

# Or update to align versions
npm update lodash
```

### Missing Peer Dependencies

```bash
npm ls

# Warning shown:
npm WARN eslint-plugin-react@7.28.0 requires a peer of eslint@^3 || ^4 || ^5 || ^6 || ^7 || ^8
but none is installed. You must install peer dependencies yourself.

# Fix: Install the peer dependency
npm install eslint@^8.0.0
```

### Phantom Dependencies

```bash
# package.json doesn't list 'lodash'
# But code uses it because transitive dependency

// app.js
import _ from 'lodash';  // Works but dangerous!

# Problem: If transitive dependency stops using lodash,
# your code breaks

# Fix: Add explicit dependency
npm install lodash
```

### Conflicting Versions

```bash
npm ls debug

# Shows multiple versions
app
├─┬ package-a
│ └── debug@4.3.0
├─┬ package-b
│ └── debug@2.6.9    # Old version
└── debug@4.3.0

# Fix: Try to update package-b
npm update package-b

# Or override (package-lock.json)
{
  "overrides": {
    "debug": "^4.3.0"
  }
}
```

## Analyzing Bundle Size

```bash
# See what contributes to bundle size
npm ls --depth=0 --long

# Use tools
npx npm-consider install <package>  # Before installing
npm-bundle-size <package>            # Check size

# Visualize dependencies
npx webpack-bundle-analyzer
npx source-map-explorer bundle.js
```

## Package-lock.json Role

```json
// package-lock.json stores exact tree
{
  "name": "my-app",
  "version": "1.0.0",
  "lockfileVersion": 2,
  "requires": true,
  "packages": {
    "": {
      "dependencies": {
        "express": "^4.18.0"
      }
    },
    "node_modules/express": {
      "version": "4.18.0",
      "resolved": "https://registry.npmjs.org/express/-/express-4.18.0.tgz",
      "dependencies": {
        "body-parser": "1.20.0"
      }
    },
    "node_modules/body-parser": {
      "version": "1.20.0",
      "resolved": "https://..."
    }
  }
}
```

**Purpose:**
- Lock exact versions of entire tree
- Ensure reproducible installs
- Faster installs (knows exact versions)

## Best Practices

```bash
# ✅ Keep dependencies minimal
# Only install what you need

# ✅ Use exact versions for critical packages
{
  "dependencies": {
    "critical-package": "1.2.3"  // No ^ or ~
  }
}

# ✅ Audit regularly
npm audit
npm audit fix

# ✅ Update dependencies
npm outdated              # Check for updates
npm update               # Update within semver range
npm update --latest      # Update to latest (ignores semver)

# ✅ Check bundle size before adding
npx npm-consider install lodash

# ✅ Use production flag for deployment
npm install --production
# Skips devDependencies

# ❌ Don't commit node_modules
# Add to .gitignore

# ❌ Don't use global packages in projects
npm install -g package    # ❌ Global
npm install package       # ✅ Local

# ❌ Don't manually edit node_modules
# Changes lost on next install
```

## Common Patterns

### Monorepo Dependencies

```bash
# Workspaces (npm 7+)
my-monorepo/
├── package.json
├── packages/
│   ├── app/
│   │   └── package.json
│   └── shared/
│       └── package.json

# Root package.json
{
  "workspaces": [
    "packages/*"
  ]
}

# Install all workspace dependencies
npm install

# Tree shows workspace links
my-monorepo
├── app -> ./packages/app
├── shared -> ./packages/shared
└── (shared dependencies hoisted to root)
```

### Scoped Packages

```bash
# @scope/package format
npm install @babel/core
npm install @types/react

# Tree
app
├── @babel/core
│   └── @babel/parser
└── @types/react
```

## Debugging Tips

```bash
# Verbose output
npm ls --depth=0 --long

# JSON output (for scripting)
npm ls --json --depth=0

# Check specific dependency path
npm ls --depth=10 | grep -A 5 package-name

# Find why package installed
npm why package-name

# List all files in package
npm ls --parseable

# Check for circular dependencies
npm ls --json | grep -C 3 "circular"
```

## References

- [npm-ls Documentation](https://docs.npmjs.com/cli/v8/commands/npm-ls)
- [npm Dependency Resolution](https://docs.npmjs.com/cli/v8/configuring-npm/package-json#dependencies)
- [package-lock.json](https://docs.npmjs.com/cli/v8/configuring-npm/package-lock-json)

---

## Summary

**Dependency Tree:** Hierarchical view of all packages and their dependencies.

**Key Commands:**
```bash
npm ls                    # View full tree
npm ls --depth=0         # Direct dependencies only
npm ls package-name      # Find specific package
npm why package-name     # Why is it installed
npm dedupe              # Remove duplicates
```

**Structure:**
- Direct dependencies (in package.json)
- Transitive dependencies (dependencies of dependencies)
- Hoisted to top level when possible
- Nested when version conflicts exist

**Common Issues:**
- Duplicate packages → `npm dedupe`
- Missing peers → Install manually
- Outdated packages → `npm update`

**Rule of thumb:** Run `npm ls --depth=0` to see direct dependencies. Use `npm ls package-name` to find where specific packages come from. Keep tree shallow and dependencies minimal.