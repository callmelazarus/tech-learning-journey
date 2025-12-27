# Finding Software Versions in ZSH: Complete Overview

Finding the version of installed software is inconsistent because there's no universal standard—some tools use `--version`, others `-v`, `-V`, `version`, or other patterns. GNU tools standardized on `--version`, but many non-GNU tools use different conventions. Think of it like asking "how old are you?"—the answer is the same, but the phrasing depends on who made the tool.

## Key Points

- **GNU Standard:** `--version` (long form, double dash)
- **BSD/Unix:** Often `-v` or `-V` (short form, single dash)
- **No Flag:** Some tools use subcommands like `version`
- **Try Order:** `--version` → `-v` → `-V` → `version`
- **Fallback:** Use `--help` to find the right flag

## GNU vs Non-GNU

### GNU Tools (Use --version)

GNU (GNU's Not Unix) established the `--version` standard for their tools.

```bash
# GNU tools consistently use --version
git --version       # git version 2.43.0
gcc --version       # gcc (GCC) 13.2.0
grep --version      # grep (GNU grep) 3.11
sed --version       # sed (GNU sed) 4.9
awk --version       # GNU Awk 5.3.0

# Why --version?
# GNU Coding Standards mandate it for consistency
```

### Non-GNU Tools (Vary)

BSD, proprietary, and older Unix tools use different conventions.

```bash
# BSD/Unix tools often use -v or -V
vim -V              # VIM - Vi IMproved 9.0
zsh -V              # zsh 5.9
ssh -V              # OpenSSH_9.0p1
curl -V             # curl 8.4.0 (note: uppercase)

# Programming languages mix conventions
python --version    # Python 3.12.0 (GNU-style)
ruby -v             # ruby 3.2.2 (Unix-style)
node --version      # v20.10.0 (GNU-style)
java -version       # openjdk version "21.0.1" (single dash!)

# Some use subcommands
go version          # go version go1.21.5
cargo version       # cargo 1.75.0
```

## Quick Reference

```bash
# Modern tools (usually GNU-style)
node --version
npm --version
docker --version
kubectl --version
terraform --version

# Unix/BSD tools (often short flags)
vim -V
zsh -V
ssh -V
tmux -V

# Programming languages
python --version    # or python3 --version
ruby -v
php -v
go version          # subcommand, not flag

# Databases
mysql --version
postgres --version
mongod --version
```

## Universal Helper Function

```bash
# Add to ~/.zshrc
ver() {
  local cmd=$1
  
  # Try common patterns
  $cmd --version 2>&1 | head -n1 && return
  $cmd -v 2>&1 | head -n1 && return
  $cmd -V 2>&1 | head -n1 && return
  $cmd version 2>&1 | head -n1 && return
  
  echo "$cmd: version flag unknown. Try: $cmd --help"
}

# Usage
ver node        # Tries --version first
ver vim         # Falls back to -V
ver go          # Falls back to version subcommand
```

## When Nothing Works

```bash
# 1. Check help
command --help | grep -i version
command -h

# 2. Use package manager
brew info node              # macOS
apt-cache policy docker     # Debian/Ubuntu
yum info nginx              # RedHat/CentOS

# 3. Check location
which node
/usr/local/bin/node --version
```

## Common Gotchas

```bash
# curl uses -V (uppercase), not -v
curl -v         # ❌ Verbose mode
curl -V         # ✅ Version

# java uses single dash
java --version  # ❌ Error
java -version   # ✅ Works

# Some output to stderr
python --version 2>&1  # Capture stderr too

# Some need subcommand
go --version    # ❌ Error
go version      # ✅ Works
```

## Why The Inconsistency?

```
GNU (1980s):
- Created --version standard
- Double dash for long options
- Works for: git, gcc, grep, make, etc.

BSD/Unix (1970s):
- Predates GNU, used -v or -V
- Single dash tradition
- Works for: vim, ssh, tmux, etc.

Modern Tools:
- Usually follow GNU (--version)
- But not always (go version, java -version)
- No enforced standard
```

## Decision Guide

```
Try in order:
1. --version    (GNU standard, most common)
2. -v           (common Unix style)
3. -V           (uppercase variant)
4. version      (subcommand style)
5. --help       (find the right flag)
```

## Quick Aliases

```bash
# Add to ~/.zshrc
alias versions='echo "Node: $(node -v)\nGit: $(git --version)\nPython: $(python --version 2>&1)"'

# Or check specific tool
alias nv='node --version'
alias pv='python --version'
alias dv='docker --version'
```

## References

- [GNU Coding Standards](https://www.gnu.org/prep/standards/html_node/Command_002dLine-Interfaces.html)
- [POSIX Utility Conventions](https://pubs.opengroup.org/onlinepubs/9699919799/)

---

## Summary

**No universal standard.** GNU tools use `--version`, but many tools don't follow GNU conventions.

**Default strategy:** Try `--version` first (works ~70% of the time), then `-v`, `-V`, or `version`.

**Make it easy:** Use the `ver()` function above to auto-detect the right flag.