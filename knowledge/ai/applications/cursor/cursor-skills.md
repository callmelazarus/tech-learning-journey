# Cursor IDE Skills: Complete Overview

Cursor is an AI-powered code editor (forked from VS Code) that augments your development workflow with inline AI assistance, codebase-aware chat, and agentic code generation. Think of it as pair programming with an AI that actually knows your codebase — not just generic knowledge. Mastering Cursor's features is less about memorizing shortcuts and more about **learning how to communicate intent effectively** to an AI collaborator.

## Key Points

- **VS Code Foundation:** Cursor inherits all VS Code extensions, keybindings, and settings. If you know VS Code, the basics are familiar.
- **AI-Native:** AI is embedded into every workflow — editing, searching, debugging, and refactoring.
- **Codebase-Aware:** Cursor indexes your project and uses it as context, so suggestions are grounded in *your* code, not just general patterns.
- **Three Core Interactions:** Tab (autocomplete), Cmd+K (inline edit), and Chat (conversational).
- **Context Is King:** The quality of Cursor's output is directly proportional to how well you provide context.

## Core Features & How to Use Them

### 1. Tab Autocomplete

Cursor's autocomplete goes beyond single-line suggestions — it predicts multi-line completions based on surrounding context.

```
# What you type:
def calculate_total(items):
    |  ← cursor here

# What Cursor suggests (multi-line):
    subtotal = sum(item.price * item.quantity for item in items)
    tax = subtotal * 0.0875
    return subtotal + tax
```

**Tips:**
- Just start typing and let Tab do the work. It learns from patterns in your codebase.
- Press `Tab` to accept, `Esc` to dismiss.
- It's context-aware — if you have a `Tax` constant defined elsewhere, it'll use that instead of hardcoding.

### 2. Cmd+K (Inline Editing)

Select code (or place your cursor) and press `Cmd+K` to give natural language instructions for editing. This is your **surgical tool** — precise, targeted changes without leaving your flow.

```js
// Before: Select this function and Cmd+K → "add input validation and error handling"
function getUser(id) {
  const user = db.query(`SELECT * FROM users WHERE id = ${id}`);
  return user;
}

// After Cursor applies the edit:
function getUser(id) {
  if (!id || typeof id !== "string") {
    throw new Error("Invalid user ID");
  }
  const user = await db.query("SELECT * FROM users WHERE id = $1", [id]);
  if (!user) {
    throw new NotFoundError(`User ${id} not found`);
  }
  return user;
}
```

**Common Cmd+K prompts:**
- `"add TypeScript types"`
- `"refactor to use async/await"`
- `"add error handling"`
- `"optimize this query"`
- `"add JSDoc comments"`

### 3. Chat (Cmd+Shift+L / Cmd+Shift+I)

Conversational AI for broader tasks — explaining code, planning architecture, debugging, or generating new files. Chat has full awareness of your codebase when you reference files with `@`.

```
You:  @userService.js Why is this function returning null
      for users with special characters in their name?

Cursor: Looking at your `getUser` function in userService.js,
        the issue is on line 42 — you're using string interpolation
        in your SQL query instead of parameterized queries. Special
        characters like O'Brien break the SQL syntax...
```

### 4. The `@` Symbol — Context References

The `@` symbol is how you point Cursor to specific context. This is arguably the **most important skill** to master.

| Reference | What It Does | Example |
|---|---|---|
| `@filename` | Includes a specific file | `@userService.js explain the auth flow` |
| `@folder` | Includes a directory | `@src/services what patterns are used here?` |
| `@codebase` | Searches the full indexed codebase | `@codebase where is the Stripe webhook handled?` |
| `@web` | Searches the web for external info | `@web latest AWS SDK v3 syntax for DynamoDB` |
| `@docs` | Searches documentation you've added | `@docs how do we handle auth in our API?` |
| `@git` | References git history | `@git what changed in the last commit?` |

### 5. Agent Mode

Agent mode lets Cursor autonomously execute multi-step tasks — creating files, running terminal commands, installing dependencies, and iterating on errors. Think of it as handing off a work order rather than pair programming.

```
You:  Create a new Express endpoint at /api/reports that queries
      our DynamoDB reports table, filters by date range from
      query params, and returns paginated results. Follow the
      patterns in @src/handlers/getUser.js

Agent: I'll create this endpoint step by step:
       1. Creating src/handlers/getReports.js...
       2. Adding route to src/routes/index.js...
       3. Creating src/services/reportService.js...
       4. Adding tests in tests/handlers/getReports.test.js...
       5. Running tests... ✓ All passing
```

**When to use Agent vs Cmd+K:**
- **Cmd+K:** Editing existing code, targeted changes, single-file work.
- **Agent:** Multi-file tasks, scaffolding, refactors that touch many files, tasks requiring terminal commands.

### 6. `.cursorrules` File

A project-level configuration file that tells Cursor how your team works. Place it in your project root. This is like giving your AI pair programmer a team onboarding doc.

```markdown
# .cursorrules

## Project Context
This is a Node.js serverless API using AWS SAM, TypeScript, and DynamoDB.

## Code Style
- Use async/await, never raw Promises or callbacks
- All handlers follow the thin-handler pattern (delegate to services)
- Use Zod for runtime validation on all inputs
- Error responses must use our standard format: { error: string, code: string }

## File Structure
- Handlers go in src/handlers/
- Business logic goes in src/services/
- Shared types in src/types/
- Tests mirror the src/ structure under tests/

## Testing
- Use vitest for all tests
- Every handler needs unit tests and at least one integration test
- Mock AWS services using aws-sdk-client-mock

## Don't
- Don't use AWS SDK v2 — we use v3 exclusively
- Don't hardcode table names — use environment variables
- Don't put business logic in handlers
```

## Effective Prompting Patterns

The quality gap between a vague prompt and a precise one is enormous in Cursor — the same tool, wildly different results.

### Bad vs Good Prompts

```
❌ "Fix this"
✅ "This function throws a TypeError when `items` is an empty array.
    Add a guard clause and return an empty result instead."

❌ "Make this better"
✅ "Refactor this to use early returns instead of nested if/else,
    and extract the validation logic into a separate function."

❌ "Write tests"
✅ "Write vitest unit tests for calculateTotal covering:
    empty cart, single item, multiple items, and negative quantities.
    Follow the pattern in @tests/services/orderService.test.ts"
```

### The Context Sandwich

For complex tasks, structure your prompt in three layers:

```
1. WHAT: What you want done
2. WHERE: Reference files/patterns with @
3. HOW: Constraints, patterns, or style to follow

Example:
"Create a new Lambda handler for DELETE /users/{id}     ← WHAT
 following the same pattern as @src/handlers/getUser.ts  ← WHERE
 with Zod validation, proper error handling, and a        ← HOW
 corresponding unit test file."
```

## Common Pitfalls

- **Under-specifying context.** Cursor can't read your mind — if the output is wrong, you probably didn't give it enough context. Use `@` references liberally.
- **Accepting code without reading it.** AI-generated code can look correct but have subtle bugs. Review diffs carefully, especially around edge cases, null handling, and security.
- **Not using `.cursorrules`.** Without it, Cursor defaults to generic patterns that may not match your team's conventions. Ten minutes writing this file saves hours of correcting output.
- **Treating Cmd+K like Chat.** Cmd+K is for targeted edits on selected code. For broader questions or multi-file tasks, use Chat or Agent mode.
- **Ignoring codebase indexing.** If `@codebase` returns poor results, your project may not be fully indexed. Check Cursor Settings → Features → Codebase Indexing.

## Keyboard Shortcuts (macOS / Windows)

| Action | macOS | Windows |
|---|---|---|
| Inline edit | `Cmd+K` | `Ctrl+K` |
| Open Chat panel | `Cmd+Shift+L` | `Ctrl+Shift+L` |
| Inline Chat | `Cmd+Shift+I` | `Ctrl+Shift+I` |
| Accept autocomplete | `Tab` | `Tab` |
| Reject autocomplete | `Esc` | `Esc` |
| Toggle Agent mode | In Chat panel | In Chat panel |
| Add file to context | `@filename` in chat | `@filename` in chat |

## Practical Applications

- **Onboarding to a new codebase.** Use `@codebase` + Chat to ask "how does auth work in this project?" or "where are database queries made?" instead of grep-and-pray.
- **Refactoring at scale.** Agent mode can update dozens of files to match a new pattern — rename an interface, migrate from one library to another, add error handling everywhere.
- **Writing tests faster.** Point Cursor at a function with `@` and ask for tests covering specific scenarios. It'll match your existing test patterns if you reference them.
- **Debugging.** Paste an error message into Chat with `@` references to the relevant files — Cursor often identifies the root cause faster than manually tracing.
- **Code review prep.** Ask Chat to review your changes for bugs, security issues, or style violations before opening a PR.

## References

- [Cursor Documentation](https://docs.cursor.com)
- [Cursor Changelog](https://cursor.com/changelog)
- [.cursorrules Examples (Community)](https://github.com/PatrickJS/awesome-cursorrules)
- [Prompt Engineering for Code (Anthropic)](https://docs.claude.com/en/docs/build-with-claude/prompt-engineering/overview)

---

## Greater Detail

### Advanced Concepts

- **Custom Docs (`@docs`):** You can index external documentation (API docs, internal wikis, library references) so Cursor can reference them. Add URLs in Cursor Settings → Features → Docs. Especially useful for niche or internal libraries that the AI wouldn't otherwise know about.
- **Multi-File Diffs:** When Agent mode touches multiple files, review the diff holistically. A change in a type definition might ripple through services and handlers — make sure all the pieces are consistent.
- **Model Selection:** Cursor supports multiple underlying models (Claude, GPT-4, etc.). Experiment to find which works best for your use case — some models are better at certain languages or frameworks.
- **Composer Workflows:** For very large tasks (new feature across 10+ files), break the work into phases and give Cursor one phase at a time. This mimics how you'd delegate to a junior developer — clear scope, one deliverable at a time.
- **Privacy & Codebase Indexing:** Cursor's codebase indexing sends code to their servers for embedding. If working with sensitive code, review Cursor's privacy settings and consider using Privacy Mode, which disables cloud-based indexing.