# Git .git/info/exclude vs skip-worktree: Complete Overview

Git provides multiple ways to ignore files beyond the standard `.gitignore` file. `.git/info/exclude` is a local, repository-specific ignore file that never gets committed, while `skip-worktree` is a flag that tells Git to pretend a tracked file hasn't changed locally. Think of `.git/info/exclude` as a personal "do not track" list for files you never want Git to see, and `skip-worktree` as a "don't tell anyone I changed this" flag for files that are already tracked but you need to modify locally without committing.

## Key Points

- **.git/info/exclude:** Local gitignore, never committed, for untracked files
- **skip-worktree:** Flag for tracked files you want to modify locally without committing
- **Scope:** exclude affects untracked files, skip-worktree affects tracked files
- **Permanence:** exclude persists in repository, skip-worktree can be reset
- **Use Cases:** exclude for local tools/configs, skip-worktree for environment-specific overrides

## High-Level Overview

### What is .git/info/exclude?

`.git/info/exclude` is a file in your local repository that works exactly like `.gitignore`, but it's never committed or shared. It lets you ignore files specific to your local workflow without affecting other developers.

**Core concept:** Personal ignore rules that stay on your machine.

```bash
# Location: .git/info/exclude

# My local IDE files
.vscode/
.idea/

# My personal scripts
my-local-script.sh
test-data/

# My build output location
dist-local/
```

### What is skip-worktree?

`skip-worktree` is a Git flag you set on tracked files to tell Git "ignore local changes to this file." The file remains in the repository, but Git pretends it hasn't been modified locally.

**Core concept:** Modify tracked files locally without Git complaining or committing changes.

```bash
# Mark file to skip worktree
git update-index --skip-worktree config/database.yml

# Now you can modify database.yml locally
# Git won't show it as modified
git status  # Clean working directory

# File stays in repository, but local changes ignored
```

### Why Both Exist

```
.git/info/exclude:
✅ For files that should NEVER be tracked
✅ Personal workflow files
✅ Local-only tools and configurations
✅ Alternative to .gitignore when you can't/shouldn't commit it

skip-worktree:
✅ For files ALREADY tracked that need local modifications
✅ Environment-specific configurations
✅ Temporary overrides for development
✅ Files that need different values per developer
```

## Similarities

### 1. Both Are Local-Only

```bash
# Neither affects other developers

# .git/info/exclude
echo "my-local-folder/" >> .git/info/exclude
# Only affects YOUR repository

# skip-worktree
git update-index --skip-worktree config.json
# Only affects YOUR working directory

# Other developers won't see either change
# These settings don't propagate via push/pull
```

### 2. Both Prevent Commits (In Different Ways)

```bash
# .git/info/exclude: Prevents tracking new files
echo "local-config.json" >> .git/info/exclude
touch local-config.json
git status  # Doesn't show local-config.json

# skip-worktree: Prevents committing changes to tracked files
git update-index --skip-worktree tracked-config.json
# Modify tracked-config.json
git status  # Doesn't show tracked-config.json as modified
```

### 3. Both Survive Git Operations

```bash
# .git/info/exclude persists through:
git pull
git checkout branch
git reset

# skip-worktree persists through:
git pull
git checkout branch
git stash
# (But can be cleared by git reset --hard)
```

### 4. Both Are Repository-Specific

```bash
# Clone same repository twice
git clone https://repo.git repo1
git clone https://repo.git repo2

# Settings in repo1 don't affect repo2
# Each repository has independent:
# - .git/info/exclude file
# - skip-worktree flags
```

## Differences

### 1. Target Files

```bash
# .git/info/exclude: For UNTRACKED files
# File doesn't exist in repository yet

echo "my-notes.txt" >> .git/info/exclude
touch my-notes.txt
git status  # my-notes.txt not shown (ignored)

git add my-notes.txt  # ❌ Ignored, won't be added

# skip-worktree: For TRACKED files
# File already exists in repository

git add config.json
git commit -m "Add config"
# Now config.json is tracked

git update-index --skip-worktree config.json
# Modify config.json locally
git status  # Clean (changes ignored)
```

### 2. Purpose and Intent

```bash
# .git/info/exclude: "Don't track these files"
# Use for files that should never enter repository

# Personal IDE settings
.vscode/
.idea/

# Local build artifacts
dist-local/
build-temp/

# Personal scripts
my-deploy-script.sh


# skip-worktree: "Track this file, but ignore my local changes"
# Use for files in repository that need local modifications

# Database config (tracked, but different per developer)
git update-index --skip-worktree config/database.yml

# API keys (tracked template, real keys local-only)
git update-index --skip-worktree .env

# Development settings (tracked defaults, custom per dev)
git update-index --skip-worktree settings.json
```

### 3. How to Set/Remove

```bash
# .git/info/exclude: Edit file directly
echo "pattern" >> .git/info/exclude
vim .git/info/exclude  # Edit like any text file

# Remove: Delete line from file
vim .git/info/exclude  # Remove the pattern


# skip-worktree: Use git commands
git update-index --skip-worktree path/to/file  # Set

git update-index --no-skip-worktree path/to/file  # Remove

# List files with skip-worktree
git ls-files -v | grep ^S
```

### 4. Visibility and Discovery

```bash
# .git/info/exclude: Easy to view
cat .git/info/exclude
# Shows all patterns

# skip-worktree: Requires specific command
git ls-files -v | grep ^S
# S indicates skip-worktree flag set

# Example output:
# S config/database.yml
# S .env
# S settings.json
```

### 5. When They Take Effect

```bash
# .git/info/exclude: Immediate effect
echo "new-ignore.txt" >> .git/info/exclude
touch new-ignore.txt
git status  # new-ignore.txt not shown (immediate)


# skip-worktree: Only affects already-tracked files
touch new-file.txt
git update-index --skip-worktree new-file.txt  # ❌ Error
# fatal: Unable to mark file new-file.txt

# Must be tracked first:
git add new-file.txt
git commit -m "Add file"
git update-index --skip-worktree new-file.txt  # ✅ Works
```

### 6. Behavior with Git Operations

```bash
# .git/info/exclude: Simple ignore behavior
git add ignored-file.txt  # ❌ Ignored, can't add

# Can force add:
git add -f ignored-file.txt  # ✅ Forces tracking


# skip-worktree: More complex behavior
git update-index --skip-worktree config.json

# Modify config.json locally
git status  # Clean

# Try to pull changes to config.json
git pull
# If remote has changes: ⚠️ Warning or conflict
# error: Your local changes to the following files would be overwritten

# Must handle manually:
git update-index --no-skip-worktree config.json
git stash
git pull
git stash pop
git update-index --skip-worktree config.json
```

### 7. Sharing and Collaboration

```bash
# .git/info/exclude: Cannot be shared
# Each developer maintains their own .git/info/exclude
# No way to share these patterns automatically

# If you need shared ignore patterns:
echo "pattern" >> .gitignore  # Use .gitignore instead
git commit -m "Add to gitignore"


# skip-worktree: Cannot be shared
# Each developer must set skip-worktree independently

# Documentation approach:
# README.md
echo "Setup for development:" >> README.md
echo "git update-index --skip-worktree config/database.yml" >> README.md

# Or setup script:
# setup.sh
#!/bin/bash
git update-index --skip-worktree config/database.yml
git update-index --skip-worktree .env
```

## Practical Examples

### Example 1: .git/info/exclude for Local Tools

```bash
# Scenario: Using local development tools not used by team

# .git/info/exclude
# My local development database
postgres-data/

# My personal deployment scripts
deploy-local.sh
backup-*.sql

# My debugging output
debug-logs/
*.debug

# My IDE's scratch files
.vscode/scratch/
.idea/workspace.xml

# Now these files won't show in git status
# Even though they're in your working directory
```

### Example 2: skip-worktree for Environment Configs

```bash
# Scenario: Different database per developer

# 1. Repository has template config
# config/database.yml (committed)
development:
  host: localhost
  username: <%= ENV['DB_USER'] %>
  password: <%= ENV['DB_PASS'] %>

# 2. Each developer customizes locally
git update-index --skip-worktree config/database.yml

# 3. Modify for your local setup
# config/database.yml (local only)
development:
  host: localhost
  username: john_local
  password: my_password
  pool: 10

# 4. Git ignores your local changes
git status  # Clean

# 5. Template updates still work (with care)
git pull  # Gets updates to template
```

### Example 3: Combined Usage

```bash
# Real-world Node.js project

# .git/info/exclude (local-only files)
# My local testing scripts
scripts/test-local.sh

# My personal notes
NOTES.md
TODO-personal.md

# My local environment overrides
.env.local

# Coverage reports I generate locally
coverage-local/


# skip-worktree (tracked but customized)
git update-index --skip-worktree .env
# .env contains real API keys locally
# Repository has .env with placeholders

git update-index --skip-worktree config/webpack.dev.js
# Custom webpack config for local development
# Repository has standard config
```

### Example 4: Large Team Configuration

```bash
# Scenario: 50 developers, each needs custom API endpoints

# Repository structure:
config/
  ├── api.template.json  # Committed template
  └── api.json          # Gitignored, generated locally

# .gitignore (shared)
config/api.json

# setup.sh (committed script)
#!/bin/bash
cp config/api.template.json config/api.json
echo "Edit config/api.json with your settings"

# Each developer:
./setup.sh
vim config/api.json  # Add their API keys

# Alternative approach with skip-worktree:
# If api.json must be tracked (for some reason):
git add config/api.json
git commit -m "Add API config template"

# Each developer:
git update-index --skip-worktree config/api.json
vim config/api.json  # Customize
```

### Example 5: IDE and Build Artifacts

```bash
# .git/info/exclude approach
# .git/info/exclude

# WebStorm/IntelliJ
.idea/workspace.xml
.idea/usage.statistics.xml
.idea/shelf/

# VS Code
.vscode/settings.json
.vscode/*.log

# Build artifacts
dist/
build/
*.log
*.tmp

# OS files
.DS_Store
Thumbs.db

# This is better than skip-worktree because:
# - These files should never be tracked
# - Each developer has different IDE files
# - No need to mark tracked files
```

## Common Pitfalls

- Using skip-worktree on files frequently updated upstream (causes conflicts)
- Forgetting to document skip-worktree flags for team members
- Using .git/info/exclude when .gitignore would be better (team-wide patterns)
- Not removing skip-worktree before git pull when conflicts expected
- Committing .git/info/exclude (impossible, but trying to share it)
- Using skip-worktree as security (it's not—files still in history)
- Losing track of which files have skip-worktree set

## Practical Applications

**.git/info/exclude:**
- Personal IDE configurations
- Local build artifacts
- Developer-specific scripts
- Temporary testing files
- OS-specific files
- Local documentation notes

**skip-worktree:**
- Environment-specific configs (dev/staging/prod)
- API keys and secrets (with committed templates)
- Database connection strings
- Feature flags for local testing
- Performance tuning configs
- Debug settings

## Decision Guide

```bash
# Use .git/info/exclude when:
✅ File is NOT tracked
✅ File is personal/local-only
✅ File should NEVER be in repository
✅ Pattern applies to multiple files
✅ Similar to .gitignore but local-only

Example:
echo "my-local-tools/" >> .git/info/exclude


# Use skip-worktree when:
✅ File IS tracked
✅ File needs local modifications
✅ File must exist in repository (template/default)
✅ Changes are environment-specific
✅ You need different values per developer

Example:
git update-index --skip-worktree config/settings.json


# Use .gitignore when:
✅ Pattern should be shared with team
✅ Files are build artifacts
✅ Files are dependency folders
✅ Standard ignore patterns

Example:
echo "node_modules/" >> .gitignore
git add .gitignore
git commit -m "Ignore node_modules"


# Use assume-unchanged when:
✅ Performance optimization for large files
✅ File won't change (99% certain)
✅ Temporary optimization (unlike skip-worktree)

Example:
git update-index --assume-unchanged large-static-file.dat
```

## Management Scripts

### List All Ignored Files

```bash
#!/bin/bash
# list-ignores.sh

echo "=== .gitignore patterns ==="
cat .gitignore

echo -e "\n=== .git/info/exclude patterns ==="
cat .git/info/exclude

echo -e "\n=== skip-worktree files ==="
git ls-files -v | grep ^S | cut -c3-

echo -e "\n=== assume-unchanged files ==="
git ls-files -v | grep ^h | cut -c3-
```

### Setup Script for New Developers

```bash
#!/bin/bash
# setup-local-dev.sh

echo "Setting up local development environment..."

# Copy template configs
cp config/database.template.yml config/database.yml
cp .env.template .env

# Set skip-worktree flags
echo "Setting skip-worktree flags..."
git update-index --skip-worktree config/database.yml
git update-index --skip-worktree .env

# Add to local exclude
echo "Configuring local excludes..."
cat >> .git/info/exclude << EOF
# Local development files
*.local.js
coverage-local/
test-results-local/
EOF

echo "Setup complete!"
echo "Edit the following files with your local settings:"
echo "  - config/database.yml"
echo "  - .env"
```

### Cleanup Script

```bash
#!/bin/bash
# cleanup-local.sh

echo "Removing all skip-worktree flags..."
git ls-files -v | grep ^S | cut -c3- | while read file; do
  echo "Removing skip-worktree from: $file"
  git update-index --no-skip-worktree "$file"
done

echo "Cleanup complete!"
```

## Best Practices

```bash
# ✅ Document skip-worktree in README
# README.md
## Local Development Setup

After cloning, run these commands:

```bash
# Mark config files as skip-worktree
git update-index --skip-worktree config/database.yml
git update-index --skip-worktree .env

# Copy and customize templates
cp .env.template .env
vim .env  # Add your API keys
```

# ✅ Use .git/info/exclude for truly local files
# .git/info/exclude
# My testing data
test-data-local/

# My scratch files
scratch/
notes.txt

# ✅ Provide templates for skip-worktree files
# Commit: config.template.json
# Ignore: config.json (or use skip-worktree)

# ✅ List skip-worktree files regularly
git ls-files -v | grep ^S

# ✅ Remove skip-worktree before major updates
git update-index --no-skip-worktree config.yml
git pull
git update-index --skip-worktree config.yml
```

## References

- [Git Documentation: gitignore](https://git-scm.com/docs/gitignore)
- [Git Documentation: git-update-index](https://git-scm.com/docs/git-update-index)
- [Git FAQ: Ignoring Files](https://git-scm.com/book/en/v2/Git-Basics-Recording-Changes-to-the-Repository#_ignoring)
- [Skip-worktree vs Assume-unchanged](https://stackoverflow.com/questions/13630849/git-difference-between-assume-unchanged-and-skip-worktree)

---

## Quick Reference

| Feature | .git/info/exclude | skip-worktree |
|---------|-------------------|---------------|
| **Target** | Untracked files | Tracked files |
| **Purpose** | Ignore new files | Ignore local changes |
| **Syntax** | File patterns | File paths |
| **Set** | Edit file | `git update-index --skip-worktree` |
| **Remove** | Edit file | `git update-index --no-skip-worktree` |
| **View** | `cat .git/info/exclude` | `git ls-files -v \| grep ^S` |
| **Shared** | No (local only) | No (local only) |
| **Use Case** | Local tools, IDE files | Environment configs |