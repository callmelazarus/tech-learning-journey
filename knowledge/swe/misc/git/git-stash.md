# Git Stash: A Well-Structured Overview

Git stash temporarily shelves uncommitted changes in your working directory, allowing you to switch branches or pull updates without committing incomplete work, then reapply those changes later.

## Key Points

- **Definition:** A command that saves your uncommitted modifications (staged and unstaged) to a stack, reverting your working directory to match HEAD.
- **Use Case:** Switch contexts without committing half-finished work, pull updates without conflicts, or clean your working directory temporarily.
- **Stack-Based:** Multiple stashes can be stored, organized as a stack (LIFO - Last In, First Out).
- **Includes Staging:** Preserves both staged and unstaged changes, maintaining their status when reapplied.
- **Non-Destructive:** Changes remain in stash even after applying, allowing safe experimentation.
- **Branch Independence:** Stashes can be applied to any branch, not just where they were created.
- **Untracked Files:** By default excludes untracked files unless explicitly included.

## Step-by-Step Explanation & Examples

**Basic Stash Operations**
```bash
# Stash current changes with automatic message
git stash
# Creates: "WIP on branch_name: commit_hash commit_message"

# Stash with custom descriptive message
git stash push -m "work in progress on user authentication feature"
# Message helps identify stashes later

# List all stashes (newest first)
git stash list
# Output:
# stash@{0}: On main: work in progress on user authentication
# stash@{1}: WIP on feature: abc1234 add validation
# stash@{2}: On main: temporary changes

# Apply most recent stash (keeps it in stash list)
git stash apply
# Or apply specific stash by reference
git stash apply stash@{1}

# Apply and remove stash in one command
git stash pop
# Equivalent to: git stash apply && git stash drop

# Remove specific stash without applying
git stash drop stash@{0}

# Clear all stashes (careful - irreversible)
git stash clear
```

**Advanced Stash Usage**
```bash
# Stash including untracked files (new files not yet added)
git stash -u
# Or --include-untracked

# Stash everything including ignored files
git stash -a
# Or --all

# Stash only specific files (partial stash)
git stash push -m "stash styles only" src/styles.css src/theme.js

# Create branch from stash (useful for complex changes)
git stash branch new-feature-branch stash@{0}
# Creates branch, applies stash, then drops it

# View stash contents without applying
git stash show
# Shows summary: 2 files changed, 15 insertions(+), 3 deletions(-)

# View detailed diff of stash
git stash show -p stash@{0}
# Shows full patch/diff of changes

# Apply stash but preserve staged/unstaged status
git stash apply --index
# Without --index, all changes become unstaged
```

## Common Pitfalls

- Forgetting which stash contains what—always use descriptive messages with `-m`.
- Using `pop` on stashes with conflicts—conflicts prevent automatic drop, leaving stash duplicated.
- Not including untracked files with `-u`, then wondering why new files disappeared.
- Assuming stashes are branch-specific—they're global and can cause confusion across branches.
- Stashing when you should commit—stashes aren't backups, they're temporary storage.
- Letting stashes accumulate without cleanup—old stashes become hard to identify.
- Applying stash to wrong branch, creating merge conflicts unnecessarily.

## Practical Applications

- **Context Switching:** Stash feature work to quickly fix production bug on main branch.
- **Pulling Updates:** Clean working directory before pulling to avoid merge conflicts.
- **Experimentation:** Try different approaches without committing, reverting via stash if needed.
- **Code Review:** Temporarily remove local changes to test teammate's branch cleanly.

**Example anecdote:** While building a complex feature, your team lead asks you to urgently fix a typo on the production branch. Rather than committing incomplete code or losing 2 hours of work, `git stash -u` saves everything. You switch branches, fix the typo, deploy, then `git stash pop` and continue exactly where you left off—like hitting pause on your work.

## References

- [Git Stash Documentation](https://git-scm.com/docs/git-stash)
- [Atlassian Git Stash Tutorial](https://www.atlassian.com/git/tutorials/saving-changes/git-stash)
- [Git Stash Best Practices](https://www.git-tower.com/learn/git/faq/save-changes-with-git-stash)

---

## Greater Detail

### Advanced Concepts

- **Stash Stack Structure:** Stashes stored as special commit objects with references to working tree, index, and parent commit states.
- **Partial Stashing (Interactive):** Use `git stash -p` for interactive patch mode, choosing which hunks to stash.
- **Conflict Resolution:** When applying stashes with conflicts, Git marks conflicts like merge conflicts—resolve and manually `git stash drop`.
- **Stash References:** `stash@{0}` is newest, `stash@{n}` is older. References update when stashes are dropped.
- **WIP vs Index Commits:** Each stash contains multiple commits: working directory state and index (staging) state.
- **Recovery:** Recently dropped stashes can be recovered via `git fsck --unreachable | grep commit` and `git show`.
- **Stash vs Commit:** Commits are permanent history, stashes are temporary—use commits for checkpoints, stashes for interruptions.
- **Automation Scripts:** Integrate `git stash` in deployment scripts to ensure clean working directory.
- **Pre-stash Hooks:** No built-in hooks, but can wrap stash commands in scripts for custom workflows.
- **Stash with Pathspec:** Target specific paths: `git stash push -m "message" -- path/to/file`.
- **Keep Index:** Use `git stash --keep-index` to stash unstaged changes while keeping staged changes in working directory.
- **Creating Patches:** Export stash as patch file: `git stash show -p stash@{0} > changes.patch`.
- **Multiple Worktrees:** Each worktree has independent stash stack in older Git versions; newer versions share stashes.
- **Stash in Detached HEAD:** Works normally, but be aware stashes aren't tied to specific branch or commit.
- **GUI Tools:** GitKraken, SourceTree, and VS Code provide visual stash management interfaces.