# Common Git Commands: Overview

Git is a distributed version control system — every developer has a full copy of the repository, including its entire history. Commands fall into a few natural categories: setting up, tracking changes, branching, syncing with remotes, and undoing mistakes.

> **Analogy:** Git is like a time machine for your codebase. Every commit is a snapshot you can return to. Branches are parallel timelines. Merging combines timelines back together.

---

## Setup & Config

```bash
git config --global user.name "Your Name"
git config --global user.email "you@example.com"

git init              # initialize a new repo in current directory
git clone <url>       # copy a remote repo locally
```

---

## Daily Workflow

```bash
git status            # see what's changed, staged, or untracked
git diff              # see unstaged changes line by line
git diff --staged     # see staged changes before committing

git add <file>        # stage a specific file
git add .             # stage all changes
git add -p            # interactively stage chunks (very useful)

git commit -m "message"         # commit staged changes
git commit --amend              # edit the last commit message or add missed changes
```

> **`git add -p`** is one of the most underused commands — it lets you selectively stage specific hunks within a file, keeping commits focused and clean.

---

## Branching

```bash
git branch                    # list local branches
git branch <name>             # create a new branch
git switch <name>             # switch to a branch (modern syntax)
git switch -c <name>          # create and switch in one step

git merge <branch>            # merge branch into current branch
git rebase <branch>           # rebase current branch onto another

git branch -d <name>          # delete a merged branch
git branch -D <name>          # force delete (even if unmerged)
```

> **Merge vs. Rebase:** Merge preserves the full history with a merge commit — good for shared branches. Rebase replays your commits on top of another branch for a linear history — good for cleaning up local work before a PR. Never rebase a branch others are working on.

---

## Stashing

Temporarily shelve changes without committing — useful when you need to switch context fast.

```bash
git stash             # stash all uncommitted changes
git stash pop         # re-apply the most recent stash and remove it
git stash list        # see all stashes
git stash drop        # discard the most recent stash
```

---

## Remote Sync

```bash
git remote -v                  # list remotes
git fetch                      # download remote changes (don't apply yet)
git pull                       # fetch + merge remote into current branch
git pull --rebase              # fetch + rebase instead of merge

git push origin <branch>       # push branch to remote
git push -u origin <branch>    # push and set upstream (first push)
git push --force-with-lease    # safe force push — fails if remote has new commits
```

> **`--force-with-lease` over `--force`** — `--force` overwrites the remote blindly. `--force-with-lease` checks that nobody else has pushed since your last fetch. Always prefer it when force-pushing a rebased branch.

---

## Viewing History

```bash
git log                          # full commit history
git log --oneline                # compact one-line view
git log --oneline --graph        # visual branch/merge graph
git log --oneline -10            # last 10 commits

git show <commit>                # show changes introduced by a commit
git blame <file>                 # see who last modified each line
```

---

## Undoing Things

```bash
# Unstage a file (keep changes in working directory)
git restore --staged <file>

# Discard unstaged changes to a file (destructive — can't undo)
git restore <file>

# Undo last commit, keep changes staged
git reset --soft HEAD~1

# Undo last commit, keep changes unstaged
git reset --mixed HEAD~1

# Undo last commit and discard all changes (destructive)
git reset --hard HEAD~1

# Safely undo a commit by creating a new one that reverses it
git revert <commit>
```

> **`reset` vs `revert`:** `reset` rewrites history — never use it on shared/pushed commits. `revert` creates a new commit that undoes the changes, leaving history intact. Use `revert` on anything already pushed.

---

## Searching

```bash
git grep "pattern"              # search file contents across the working tree
git log --grep="fix"            # find commits by message keyword
git log -S "functionName"       # find commits that added/removed a string (pickaxe)
```

> **`git log -S`** (the "pickaxe") is invaluable for tracking down when a specific function or variable was introduced or removed.

---

## Tags

```bash
git tag                          # list all tags
git tag v1.0.0                   # create a lightweight tag
git tag -a v1.0.0 -m "Release"   # annotated tag (includes metadata)
git push origin --tags           # push all tags to remote
```

---

## Useful Shortcuts

```bash
# See what changed in a file between two commits
git diff <commit1> <commit2> -- <file>

# Find which commit introduced a bug (binary search)
git bisect start
git bisect bad           # current state is broken
git bisect good <commit> # known good commit
# Git checks out midpoints; you mark good/bad until it finds the culprit
git bisect reset         # exit bisect mode

# Apply a specific commit from another branch
git cherry-pick <commit>
```

> **`git bisect`** is one of Git's most powerful and underused features. Given a good and bad commit, it binary-searches your history to pinpoint exactly which commit introduced a bug — in O(log n) steps.

---

## Common Pitfalls

- **Committing directly to `main`** — always branch. Even solo projects benefit from the habit.
- **Vague commit messages** — `"fix stuff"` is useless history. Write what and why: `"fix: prevent null pointer in auth middleware when user session expires"`.
- **Staging everything with `git add .`** — you may accidentally commit debug logs, `.env` files, or unrelated changes. Use `git add -p` or stage files individually.
- **Force pushing to shared branches** — always use `--force-with-lease`, and never force push `main`.
- **Not using `.gitignore`** — `node_modules`, `.env`, `dist/`, build artifacts, and OS files (`.DS_Store`) should never be tracked.
- **Merge conflicts left unresolved** — always verify with `git status` after a merge or rebase that no conflict markers (`<<<<<<<`) remain before committing.

---

## References

- [Pro Git Book (free)](https://git-scm.com/book/en/v2)
- [Git Official Docs](https://git-scm.com/docs)
- [Oh Shit, Git!](https://ohshitgit.com/) — plain-English fixes for common Git mistakes