# AI-Lean Development: Overview

**AI-lean development** is a approach to building software where AI tools are embedded into the development workflow — not as a crutch, but as a force multiplier. The goal isn't to write less code; it's to spend less time on the low-value parts so you can focus on the high-value ones: architecture, product decisions, and the work that actually requires a human.

> **Analogy:** A seasoned contractor doesn't hand-saw every board. They use power tools for the repetitive cuts and spend their skill on the joints, the finish, and the decisions that make the structure sound. AI is the power tool. You're still the contractor.

---

## What AI Actually Helps With

Not all tasks benefit equally. The leverage is highest where the work is repetitive, pattern-based, or well-defined.

| High Leverage | Lower Leverage |
|---|---|
| Boilerplate and scaffolding | System design and architecture |
| Unit test generation | Security threat modeling |
| Refactoring and renaming | Novel business logic |
| Translating pseudocode to code | Ambiguous product decisions |
| Debugging error messages | Performance investigation at scale |
| Writing docs and comments | Code review judgment calls |
| Converting between formats/types | Understanding your specific codebase |

The pattern: AI is strong at *what*, weaker at *why*.

---

## The Core Workflow Shift

Traditional development: **think → write → test → repeat**
AI-lean development: **think → prompt → review → refine → own**

The critical word is **own**. AI-generated code that you can't read, explain, or debug is a liability. The goal is to move fast on generation and invest the saved time in deeper review and understanding.

```
You define the problem clearly
        ↓
AI generates a first draft
        ↓
You review, question, and validate
        ↓
You refine and integrate
        ↓
You own the result
```

---

## Prompting Well is a Skill

The quality of AI output is directly proportional to the quality of your input. Vague prompts produce vague code.

```
# ❌ Vague
"Write a login function"

# ✅ Specific
"Write a Node.js Express POST /login handler that:
- accepts email and password in the request body
- validates input with Zod
- checks credentials against a PostgreSQL users table using bcrypt
- returns a signed JWT (RS256) on success
- returns 401 on invalid credentials, 422 on validation failure
- uses async/await and proper error handling"
```

The more context you give — language, framework, constraints, expected behavior, edge cases — the less you have to fix.

### Useful Prompting Patterns

- **Role framing:** `"You are a senior Node.js engineer reviewing this for security issues..."`
- **Constraints first:** `"Without using any external libraries, write a..."`
- **Iterative refinement:** `"Now add input validation"` / `"Now add error handling"` / `"Now write tests for this"`
- **Explain before generating:** `"Explain your approach before writing the code"`
- **Ask for tradeoffs:** `"What are the tradeoffs of this approach vs. using X?"`

---

## Where AI Fits in the Dev Lifecycle

### Planning
- Generating ERD or API design drafts from plain-English requirements
- Asking "what edge cases am I missing in this design?"
- Comparing architectural approaches with tradeoffs

### Writing Code
- Scaffolding new services, routes, or components
- Generating repetitive CRUD handlers
- Translating business rules into code
- Converting between data shapes (e.g., API response → internal model)

### Testing
- Generating unit test cases (especially edge cases and error paths)
- Writing test data factories and fixtures
- Suggesting what to mock and why

### Reviewing & Debugging
- Explaining error messages and stack traces
- Spotting missing edge cases in a PR
- Suggesting refactors for readability or performance
- "What's wrong with this code?" often works surprisingly well

### Documentation
- Generating JSDoc / docstrings from function signatures
- Writing README sections from code
- Explaining complex logic in plain English

---

## The Risks — What to Watch For

### Hallucinated APIs
AI confidently generates calls to functions, packages, or APIs that don't exist. Always verify method signatures against actual docs.

```js
// AI might generate this — looks plausible, doesn't exist
await prisma.user.findManyWithPagination({ page: 2 });
```

### Plausible but Wrong Logic
AI-generated code often passes a visual review but fails on edge cases — off-by-one errors, missing null checks, incorrect async handling.

```js
// Looks fine, breaks when users array is empty
const oldest = users.sort((a, b) => a.age - b.age)[0].name;
```

### Security Blind Spots
AI trained on historical codebases generates patterns that predate modern security practices. It may generate SQL without parameterization, store secrets in code, or skip input validation. Always run AI-generated code through the OWASP mental checklist.

### Over-reliance and Skill Atrophy
The most subtle risk. If you never struggle with a problem because AI always solves it first, you stop building the mental models that let you debug, architect, and make good decisions independently. Use AI to go faster — not to avoid thinking.

---

## A Practical Mindset

**Use AI for the first draft, not the final word.**
Generate fast, review hard. The 30 seconds you save generating code is wasted if you don't spend 2 minutes reading it properly.

**Stay in the driver's seat.**
You define the architecture, the constraints, and the acceptance criteria. AI fills in the implementation. The moment you're copy-pasting code you don't understand, you're accumulating debt.

**Treat AI like a fast but junior dev.**
It produces a lot, quickly, with occasional confident mistakes. Your job is the senior engineer reviewing the PR — catching the subtle bugs, the missing error handling, the security gaps.

**Invest saved time wisely.**
If AI saves you an hour on boilerplate, spend that hour on architecture, tests, or understanding the domain more deeply. Don't just use the time to ship more boilerplate faster.

---

## Tools Worth Knowing

| Tool | Best for |
|---|---|
| **Claude / ChatGPT** | Reasoning, explanation, complex prompts, architecture discussion |
| **GitHub Copilot** | Inline code completion while typing |
| **Claude Code** | Agentic coding — multi-file edits, terminal, full context |
| **Cursor** | AI-native IDE — chat + inline edits with full repo context |
| **v0 (Vercel)** | UI scaffolding from natural language descriptions |
| **Codeium** | Free Copilot alternative |

---

## Choosing the Right Claude Model

Claude comes in three tiers — **Haiku**, **Sonnet**, and **Opus** — each making different tradeoffs between speed, capability, and cost. Using the wrong one means paying a 5–10x cost premium for capability you don't need, or getting output that isn't good enough for the task.

> **Analogy:** Haiku is a scalpel — fast and precise for well-defined cuts. Sonnet is a Swiss Army knife — versatile enough for almost everything. Opus is a full workshop — maximum power for the hardest problems.

### The Three Tiers

**Haiku 4.5 — Speed & Volume**
The fastest and cheapest model. Built for high-throughput, well-defined tasks where the problem is clear and the output is simple.

Best for:
- Classifying or tagging large batches of data
- Extracting structured fields from documents
- Simple code completions and syntax help
- Chatbot routing and triage
- Any pipeline processing thousands of requests per day

Not great for: multi-step reasoning, ambiguous problems, or anything that requires judgment.

---

**Sonnet 4.6 — The Daily Driver**
The model most developers should use most of the time. It delivers near-Opus quality at roughly 40% lower cost and meaningfully faster output. As of 2026, Sonnet 4.6 handles 90%+ of coding tasks without meaningful compromise.

Best for:
- Writing and refactoring application code
- Debugging and explaining errors
- PR reviews and code explanations
- Building features end-to-end
- Writing docs, tests, and comments
- Architecture discussions with moderate complexity

This is the right default. Reach for Opus only when Sonnet genuinely falls short.

---

**Opus 4.8 — Deep Reasoning**
The most capable model in the lineup — reserved for tasks that truly require it. Higher cost, slightly slower, but noticeably better on problems that require sustained multi-step reasoning or nuanced judgment.

Best for:
- Complex architectural decisions with many tradeoffs
- Multi-file refactoring across a large codebase
- Hard debugging where the root cause isn't obvious
- Security and threat modeling analysis
- Research-heavy or highly ambiguous problems
- When Sonnet's output isn't good enough

---

### Quick Decision Guide

```
Is the task well-defined and high-volume?
  → Haiku

Is it a typical coding or reasoning task?
  → Sonnet 4.6 (default — right 90% of the time)

Is it genuinely complex — multi-step, ambiguous, or high-stakes?
  → Opus 4.8
```

### In Practice (API)

```js
// High-volume classification pipeline → Haiku
const response = await anthropic.messages.create({
  model: 'claude-haiku-4-5-20251001',
  max_tokens: 256,
  messages: [{ role: 'user', content: 'Classify this support ticket: ...' }]
});

// Daily development work → Sonnet (default)
const response = await anthropic.messages.create({
  model: 'claude-sonnet-4-6',
  max_tokens: 4096,
  messages: [{ role: 'user', content: 'Refactor this auth middleware...' }]
});

// Complex architectural analysis → Opus
const response = await anthropic.messages.create({
  model: 'claude-opus-4-8',
  max_tokens: 4096,
  messages: [{ role: 'user', content: 'Review this distributed system design...' }]
});
```

---

## Common Pitfalls

- **Accepting the first output without reading it** — AI is a starting point, not a final answer.
- **Prompting without context** — the more the AI knows about your stack, constraints, and goal, the better the output.
- **Using AI for problems you don't understand yet** — if you can't evaluate the output, you can't catch the mistakes. Learn first, accelerate second.
- **Skipping tests on AI-generated code** — AI-generated code has the same failure modes as any other code. Test it.
- **Not reviewing for security** — AI will not reliably flag its own security gaps. That's your job.

---

## References

- [Anthropic Claude Code](https://docs.anthropic.com/en/docs/claude-code/overview)
- [GitHub Copilot Docs](https://docs.github.com/en/copilot)
- [OpenAI Prompting Guide](https://platform.openai.com/docs/guides/prompt-engineering)
- [ThoughtWorks Technology Radar — AI-Assisted Development](https://www.thoughtworks.com/radar)