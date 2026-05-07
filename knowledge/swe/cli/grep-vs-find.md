# CLI: `grep` vs `find` — Complete Overview

Both `grep` and `find` are search tools, but they search for completely different things. This is the most common source of confusion between them.

- **`find`** — searches for **files and directories** by name, type, size, date, permissions
- **`grep`** — searches for **text patterns inside files**

> **Analogy:** `find` is how you locate a book in a library — by title, section, or shelf. `grep` is how you search *inside* a book for a specific word or phrase. One finds the container; the other searches the contents.

---

## `find` — Locate Files

`find` walks a directory tree and returns files/directories matching criteria you specify. It never looks inside files.

### Syntax
```bash
find [path] [options] [expression]
```

### Common Examples

```bash
# Find all .js files starting from current directory
find . -name "*.js"

# Find files modified in the last 7 days
find . -mtime -7

# Find files larger than 10MB
find . -size +10M

# Find directories only
find . -type d

# Find files only (not directories)
find . -type f -name "*.log"

# Find and delete all .DS_Store files
find . -name ".DS_Store" -delete

# Find files with specific permissions
find . -perm 644
```

### Key Flags

| Flag | Meaning |
|---|---|
| `-name` | Match by filename (case-sensitive) |
| `-iname` | Match by filename (case-insensitive) |
| `-type f` | Files only |
| `-type d` | Directories only |
| `-mtime -N` | Modified within last N days |
| `-size +NM` | Larger than N megabytes |
| `-delete` | Delete matched files |
| `-exec` | Run a command on each match |

---

## `grep` — Search Inside Files

`grep` scans file contents line by line and prints lines that match a pattern. It doesn't care about filenames or directory structure — only what's inside.

### Syntax
```bash
grep [options] "pattern" [file(s)]
```

### Common Examples

```bash
# Find all lines containing "error" in a file
grep "error" app.log

# Case-insensitive search
grep -i "error" app.log

# Search recursively through a directory
grep -r "TODO" ./src

# Show line numbers with matches
grep -n "useState" ./src/App.jsx

# Show only the filename, not the matching line
grep -l "API_KEY" .env*

# Invert match — show lines that do NOT match
grep -v "debug" app.log

# Match whole words only (not substrings)
grep -w "log" app.js   # matches "log" but not "logger"

# Use extended regex
grep -E "error|warning|fatal" app.log

# Count matching lines
grep -c "404" access.log
```

### Key Flags

| Flag | Meaning |
|---|---|
| `-r` | Recursive (search all files in directory) |
| `-i` | Case-insensitive |
| `-n` | Show line numbers |
| `-l` | List filenames only (not matching lines) |
| `-v` | Invert match |
| `-w` | Match whole word only |
| `-E` | Extended regex (`\|`, `+`, `?`, `{}`) |
| `-c` | Count of matching lines |
| `--include` | Limit recursive search to file pattern |

---

## Side-by-Side Comparison

| | `find` | `grep` |
|---|---|---|
| **Searches for** | Files/directories | Text inside files |
| **Looks at** | Metadata (name, size, date) | File contents (line by line) |
| **Output** | File paths | Matching lines (with file/line info) |
| **Regex on** | Filename | File content |
| **Recursive by default?** | ✅ Yes | ❌ No (needs `-r`) |

---

## Using Them Together

The real power comes from combining them — use `find` to locate files, pipe results into `grep` to search their contents.

```bash
# Find all .env files, then search inside them for secrets
find . -name "*.env" | xargs grep "SECRET"

# Search for "console.log" only in .js files (faster than grep -r alone)
find . -name "*.js" | xargs grep -n "console.log"

# Find modified files and search their contents
find . -mtime -1 -name "*.ts" | xargs grep -l "TODO"
```

`xargs` takes the output of `find` and passes it as arguments to `grep`. This is the canonical pattern for scoped content searches.

---

## Modern Alternatives

For most day-to-day development work, faster modern tools have largely replaced `grep` and `find`:

| Tool | Replaces | Why it's better |
|---|---|---|
| `ripgrep` (`rg`) | `grep -r` | 10–100x faster, respects `.gitignore`, smart defaults |
| `fd` | `find` | Simpler syntax, faster, respects `.gitignore` |
| `fzf` | Manual piping | Fuzzy finder for interactive file and content search |

```bash
# ripgrep — recursive grep, gitignore-aware, fast
rg "useEffect" ./src

# fd — simpler find
fd "*.log" --newer 7days

# fzf — interactive fuzzy file finder
find . -type f | fzf
```

These don't replace `grep` and `find` in shell scripts or environments where you can't install tools — but in a dev workflow, they're worth knowing.

---

## Common Pitfalls

- **Using `grep` to find files by name** — `grep "*.js"` searches for the literal string `*.js` inside files. Use `find -name "*.js"` instead.
- **Forgetting `-r` in `grep`** — `grep "pattern" ./src` silently skips subdirectories without `-r`.
- **Grepping binary files** — `grep` will match binary files and output garbage. Use `grep -r --include="*.txt"` or add `grep -I` to skip binary files.
- **`find` quoting** — `find . -name *.js` lets the shell expand `*.js` before `find` sees it. Always quote: `find . -name "*.js"`.
- **`xargs` with spaces in filenames** — filenames with spaces break standard `xargs`. Use `find . -print0 | xargs -0 grep` for safety.

---

## References

- [GNU grep Manual](https://www.gnu.org/software/grep/manual/grep.html)
- [GNU find Manual](https://www.gnu.org/software/findutils/manual/html_mono/find.html)
- [ripgrep GitHub](https://github.com/BurntSushi/ripgrep)
- [fd GitHub](https://github.com/sharkdp/fd)