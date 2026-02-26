# Git Reflog: Complete Overview

`git reflog` (reference log) records every time a branch tip or `HEAD` moves in your local repository. Think of it as **git's undo history** — while `git log` shows your commit history (the story you're telling), `reflog` shows every action *you actually took*, including the ones that don't appear in `git log` anymore. It's the safety net that makes "I lost my work" almost never permanently true.

## Key Points

- **Local Only:** Reflog exists only on your machine — it's not pushed to remotes or shared with collaborators.
- **Records HEAD Movement:** Every checkout, commit, rebase, reset, merge, cherry-pick, and amend is logged.
- **Default Retention:** Entries expire after 90 days (30 days for unreachable commits).
- **Recovery Tool:** The primary use case is recovering from mistakes — bad rebases, accidental resets, lost commits.
- **Not a Branch History:** `git log` shows commit ancestry. `reflog` shows a chronological diary of *your actions*.

## How It Works

Every time `HEAD` moves, Git appends an entry to `.git/logs/HEAD`. Each entry records: the previous SHA, the new SHA, who did it, when, and what action caused it.

```
git commit → reflog entry
git checkout → reflog entry
git rebase → reflog entry (one per step)
git reset → reflog entry
git pull → reflog entry
git merge → reflog entry
git cherry-pick → reflog entry
git commit --amend → reflog entry
```

**Analogy:** If `git log` is the published version of a book, `reflog` is the author's notebook with every draft, deleted paragraph, and rewrite — all timestamped.

## Step-by-Step Explanation & Examples

### 1. Viewing the Reflog

```bash
# Basic reflog output
git reflog

# Output:
a1b2c3d (HEAD -> main) HEAD@{0}: commit: add user validation
f4e5d6c HEAD@{1}: commit: update API routes
8g7h9i0 HEAD@{2}: checkout: moving from feature/auth to main
b2c3d4e HEAD@{3}: commit: implement JWT refresh tokens
e5f6g7h HEAD@{4}: rebase (finish): returning to refs/heads/feature/auth
k8l9m0n HEAD@{5}: reset: moving to HEAD~3
```

Each line reads as: **SHA** — **reference** — **action**: **description**

The `HEAD@{n}` syntax means "where HEAD was `n` moves ago." This is a first-class Git reference — you can use it anywhere you'd use a commit SHA.

### 2. Recovering a Lost Commit After `reset --hard`

The most common "oh no" moment. You ran `git reset --hard` and commits seem gone.

```bash
# You accidentally nuked the last 3 commits
git reset --hard HEAD~3

# Your commits aren't in git log anymore. But reflog has them:
git reflog
# a1b2c3d HEAD@{0}: reset: moving to HEAD~3
# x9y8z7w HEAD@{1}: commit: add payment processing    ← here it is
# p6q5r4s HEAD@{2}: commit: add order validation
# m3n2o1p HEAD@{3}: commit: add cart service

# Recover by resetting back to where you were
git reset --hard x9y8z7w

# Or cherry-pick specific commits
git cherry-pick p6q5r4s x9y8z7w
```

### 3. Undoing a Bad Rebase

Rebases rewrite history, which makes them scary. Reflog makes them reversible.

```bash
# You rebased feature branch onto main and it went wrong
git rebase main
# ... conflicts everywhere, you resolved them incorrectly

# Find the commit right before the rebase started
git reflog
# d4e5f6g HEAD@{0}: rebase (finish): returning to refs/heads/feature/auth
# c3d4e5f HEAD@{1}: rebase (pick): implement login
# b2c3d4e HEAD@{2}: rebase (pick): add auth middleware
# a1b2c3d HEAD@{3}: rebase (start): checkout main
# ★ f7g8h9i HEAD@{4}: commit: implement JWT refresh tokens  ← pre-rebase state

# Reset to the pre-rebase state
git reset --hard f7g8h9i
```

The commit at `HEAD@{4}` is where your branch was *before* the rebase started. Resetting to it completely undoes the rebase.

### 4. Recovering a Deleted Branch

```bash
# You deleted a branch before merging it
git branch -D feature/payments
# Deleted branch feature/payments (was a1b2c3d)

# The SHA is right there in the output, but if you missed it:
git reflog | grep payments
# a1b2c3d HEAD@{12}: commit: finalize payment flow
# b2c3d4e HEAD@{13}: checkout: moving from main to feature/payments

# Recreate the branch at that commit
git branch feature/payments a1b2c3d

# Or use reflog reference directly
git checkout -b feature/payments HEAD@{12}
```

### 5. Undoing a Bad `commit --amend`

You amended a commit and accidentally overwrote the wrong message or included wrong files.

```bash
git commit --amend -m "wrong message, overwrote my good commit"

# Reflog shows the pre-amend commit
git reflog
# n3w5ha0 HEAD@{0}: commit (amend): wrong message, overwrote my good commit
# 0rig1na HEAD@{1}: commit: add user authentication  ← the original

# Restore the original
git reset --hard 0rig1na
```

### 6. Finding Work from Days Ago

```bash
# "What was I working on last Tuesday?"
git reflog --date=relative
# a1b2c3d HEAD@{3 days ago}: commit: fix auth bug
# b2c3d4e HEAD@{3 days ago}: checkout: moving from main to fix/auth-bug
# c3d4e5f HEAD@{5 days ago}: pull: Fast-forward

# Or with absolute dates
git reflog --date=iso
# a1b2c3d HEAD@{2025-02-22 14:32:07 -0800}: commit: fix auth bug

# Filter by date
git reflog --since="3 days ago"
```

### 7. Branch-Specific Reflog

Each branch has its own reflog, not just `HEAD`.

```bash
# See reflog for a specific branch
git reflog show main
# a1b2c3d main@{0}: merge feature/auth: Fast-forward
# b2c3d4e main@{1}: commit: update README
# c3d4e5f main@{2}: pull: Fast-forward

# Use branch reflog references
git diff main@{1} main@{0}    # what changed in the last move of main
git log main@{yesterday}..main  # what was added to main since yesterday
```

### 8. Useful Formatting Options

```bash
# One-line with timestamps
git reflog --format='%C(auto)%h %gd %gs (%ci)'

# Only show commits (filter out checkouts, merges, etc.)
git reflog --grep-reflog="commit"

# Show with full diff
git reflog -p

# Limit output
git reflog -n 20
```

## The Reflog Recovery Workflow

When you think you've lost work, follow this mental checklist:

```
1. Don't panic. If you committed it, reflog has it.
        ↓
2. Run `git reflog` and scan for the action before the mistake.
        ↓
3. Identify the SHA of the "good" state.
        ↓
4. Choose your recovery method:
   ├── git reset --hard <sha>     → rewind branch to that state
   ├── git cherry-pick <sha>      → apply specific commit(s) onto current branch
   ├── git branch <name> <sha>    → create new branch at that point
   └── git checkout <sha> -- file → restore a specific file
```

## Common Pitfalls

- **Assuming reflog is shared.** It's strictly local. If you need to recover someone else's work, reflog won't help — you need the remote or their machine.
- **Waiting too long.** Unreachable commits (those not on any branch) expire after 30 days by default. Reachable entries last 90 days. If you lost something weeks ago, recover it sooner rather than later.
- **Confusing `reflog` with `log`.** `git log` follows commit parentage (the DAG). `reflog` follows HEAD movement chronologically. A commit can disappear from `log` after a rebase but still exist in `reflog`.
- **Not committing often enough.** Reflog can only recover *committed* work. Uncommitted changes that are lost to `git checkout -- .` or `git reset --hard` are gone unless they were staged (check `git fsck --lost-found` for staged-but-uncommitted blobs).
- **Running `git gc` prematurely.** Garbage collection permanently removes unreachable objects. Avoid `git gc --prune=now` if you're trying to recover lost commits.

## Practical Applications

- **Undoing mistakes:** Bad rebase, accidental `reset --hard`, wrong `commit --amend`, or deleted branch — reflog covers all of them.
- **Auditing your own workflow:** See exactly what you did in a repo over the last week — useful for writing standup notes or timesheets.
- **Comparing states:** `git diff HEAD@{yesterday} HEAD` shows everything that changed in your working branch since yesterday.
- **Training wheels for risky operations:** Before attempting a complex rebase or history rewrite, note the current reflog position. If anything goes wrong, you know exactly where to reset back to.

## References

- [Git Documentation: git-reflog](https://git-scm.com/docs/git-reflog)
- [Pro Git Book: Data Recovery](https://git-scm.com/book/en/v2/Git-Internals-Maintenance-and-Data-Recovery)
- [Git Documentation: gitrevisions (HEAD@{n} syntax)](https://git-scm.com/docs/gitrevisions)
- [Atlassian: Git Reflog](https://www.atlassian.com/git/tutorials/rewriting-history/git-reflog)

---

## Greater Detail

### Advanced Concepts

- **`git fsck --lost-found`:** When reflog doesn't have what you need (e.g., staged but never committed files), `fsck` finds dangling blobs and commits that are truly orphaned. Recovered objects go to `.git/lost-found/`.
- **Reflog Expiry Configuration:** Customize retention with `git config gc.reflogExpire 180.days` (reachable) and `gc.reflogExpireUnreachable 60.days` (unreachable). Useful for teams that want a longer safety net.
- **Reflog in Scripts:** `git reflog` is scriptable. For example, `git rev-parse HEAD@{1}` returns the SHA of the previous HEAD position — useful in CI/CD scripts to detect what changed.
- **Stash Reflog:** `git stash` has its own reflog. If you accidentally drop a stash, `git fsck --unreachable | grep commit` followed by `git show <sha>` can often recover it.
- **Interactive Recovery with `git log -g`:** Running `git log -g` shows the reflog in standard `git log` format with full commit messages and diffs, which can be easier to scan than the default reflog output.