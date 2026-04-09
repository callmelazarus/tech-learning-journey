# Regression Testing: Complete Overview

Regression testing is the practice of **re-running existing tests after code changes to verify that previously working functionality hasn't broken**. Think of it like proofreading an entire essay after editing one paragraph — you're not just checking the new paragraph, you're making sure your edits didn't accidentally introduce errors elsewhere. It's one of the most important (and most tedious) categories of testing, which is exactly why it's heavily automated.

## Key Points

- **Purpose:** Catch unintended side effects of code changes — bugs in things that *used to work*.
- **When:** After every code change — feature additions, bug fixes, refactors, dependency updates, config changes.
- **Automation Is Essential:** Manual regression testing doesn't scale. Automated regression suites run in CI/CD on every commit.
- **Scope Varies:** Can range from running a handful of targeted tests to running the entire test suite, depending on the change.
- **Not a Test Type:** Regression testing is a *strategy* (when and why you test), not a technique. It uses unit tests, integration tests, E2E tests, etc.

## Why Regression Testing Matters

Software is deeply interconnected. A change in one place can break something in a seemingly unrelated place.

```
You fix a bug in the payment service:
  → The fix changes how amounts are rounded
    → The order summary now shows $9.999999 instead of $10.00
      → The invoice PDF generator crashes on the extra decimal places
        → Customers get 500 errors on their receipt page

One line changed. Four things broke.
Regression tests catch this before your customers do.
```

**Analogy:** Imagine a Jenga tower. Every code change is pulling out a block and putting it somewhere else. Regression testing is checking that the tower is still standing after each move — not just looking at the block you moved.

## How It Fits Into the Testing Landscape

```
┌─────────────────────────────────────────────┐
│             Testing Strategy                │
│                                             │
│  ┌─────────────┐  ┌──────────────────────┐  │
│  │ New Feature  │  │ Regression Testing   │  │
│  │ Tests        │  │ (re-run existing)    │  │
│  │             │  │                      │  │
│  │ "Does the   │  │ "Does everything     │  │
│  │  new thing  │  │  that USED to work   │  │
│  │  work?"     │  │  STILL work?"        │  │
│  └─────────────┘  └──────────────────────┘  │
│                                             │
│  Both run on every change in CI/CD          │
└─────────────────────────────────────────────┘
```

Regression tests aren't a separate category of test — they're your **existing tests running again** after a change. A unit test you wrote last month becomes a regression test when it catches a break caused by today's commit.

## Step-by-Step Explanation & Examples

### 1. The Simplest Example

```js
// Original function — works fine, tests pass
function calculateDiscount(price, percentage) {
  return price * (percentage / 100);
}

// Test (written when the function was created)
test("calculates 20% discount on $100", () => {
  expect(calculateDiscount(100, 20)).toBe(20);
});
```

```js
// Months later, someone "improves" the function to handle edge cases
function calculateDiscount(price, percentage) {
  if (percentage > 100) return price; // new: cap at 100%
  return Math.round(price * (percentage / 100)); // new: round result
}

// The existing test NOW FAILS — regression detected!
test("calculates 20% discount on $100", () => {
  expect(calculateDiscount(100, 20)).toBe(20); // ✓ still passes
});

test("calculates 15% discount on $49.99", () => {
  expect(calculateDiscount(49.99, 15)).toBe(7.4985); // ✗ FAILS — returns 7 (rounded)
  // This test was passing before. The "improvement" broke existing behavior.
});
```

The second test is now a **regression test** — it passed before, fails now, and the failure tells us the refactor introduced an unintended side effect.

### 2. Levels of Regression Testing

Regression testing happens at every level of the test pyramid:

```
         ╱  ╲          E2E / UI Tests
        ╱ Few ╲        Slow, expensive, catch integration regressions
       ╱───────╲
      ╱  Some   ╲     Integration Tests
     ╱  moderate ╲    Test service interactions, API contracts
    ╱─────────────╲
   ╱    Many fast   ╲  Unit Tests
  ╱  run on every    ╲ Test individual functions/modules
 ╱   commit in CI/CD  ╲
╱───────────────────────╲
```

```js
// UNIT — regression test for a utility function
test("formatCurrency handles zero", () => {
  expect(formatCurrency(0)).toBe("$0.00");
});

// INTEGRATION — regression test for API endpoint
test("GET /users/:id returns user with all fields", async () => {
  const res = await request(app).get("/users/42");
  expect(res.status).toBe(200);
  expect(res.body).toHaveProperty("name");
  expect(res.body).toHaveProperty("email");
  expect(res.body).toHaveProperty("createdAt");
});

// E2E — regression test for a full user flow
test("user can complete checkout flow", async () => {
  await page.goto("/products");
  await page.click('[data-testid="add-to-cart"]');
  await page.click('[data-testid="checkout"]');
  await page.fill("#card-number", "4242424242424242");
  await page.click('[data-testid="pay"]');
  await expect(page.locator(".confirmation")).toContainText("Order confirmed");
});
```

### 3. What Triggers Regression Testing

```
Code Change                              Regression Risk
────────────────────────────────────────────────────────
Bug fix                                  High — fixes often break adjacent logic
New feature                              Medium — new code can conflict with existing
Refactor (no behavior change)            Medium — "no behavior change" is the claim to verify
Dependency update (npm update, etc.)     High — transitive changes you didn't write
Config change (env vars, feature flags)  Medium — different code paths activated
Database migration                       High — schema changes ripple through queries
Merge/rebase                             Medium — conflict resolution can introduce bugs
Performance optimization                 Medium — optimized code may handle edge cases differently
```

### 4. Regression Testing Strategies

Not every change requires running every test. The strategy depends on the change scope and risk.

**Strategy 1: Run Everything (Brute Force)**

```yaml
# CI/CD — run full suite on every push
on: [push]
jobs:
  test:
    steps:
      - run: npm test              # all unit tests
      - run: npm run test:integration  # all integration tests
      - run: npm run test:e2e      # all E2E tests
```

Simple, thorough, but slow. Works well for small-to-medium projects where the full suite runs in under 10 minutes.

**Strategy 2: Selective / Impact Analysis**

```yaml
# Only run tests related to changed files
on: [push]
jobs:
  test:
    steps:
      - run: npx jest --changedSince=origin/main
      # Jest analyzes file dependencies and only runs affected tests
```

Faster, but requires tooling that understands your dependency graph. Jest's `--changedSince` flag does this for JavaScript projects.

**Strategy 3: Tiered Pipeline**

```yaml
# Fast feedback first, thorough checks later
on:
  push:
    # Tier 1: Unit tests on every push (fast — 1-2 min)
    - run: npm run test:unit

  pull_request:
    # Tier 2: Integration tests on PR (moderate — 5-10 min)
    - run: npm run test:unit
    - run: npm run test:integration

  merge to main:
    # Tier 3: Full regression suite including E2E (slow — 15-30 min)
    - run: npm run test:unit
    - run: npm run test:integration
    - run: npm run test:e2e
```

This is the most common real-world pattern — fast feedback on every push, full confidence before merging.

**Strategy 4: Risk-Based Selection**

Prioritize tests based on the criticality of what they cover:

```
Priority 1 (always run):  Payment processing, auth, data integrity
Priority 2 (run on PR):   Core features, API contracts, user flows
Priority 3 (run nightly): Edge cases, non-critical features, UI polish
Priority 4 (run weekly):  Performance benchmarks, cross-browser, accessibility
```

### 5. Automating Regression Tests in CI/CD

```yaml
# GitHub Actions — typical regression testing pipeline
name: Regression Tests

on:
  pull_request:
    branches: [main]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run test:unit -- --coverage
      - name: Upload coverage
        uses: actions/upload-artifact@v4
        with:
          name: coverage
          path: coverage/

  integration-tests:
    runs-on: ubuntu-latest
    needs: unit-tests
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_PASSWORD: test
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm run test:integration

  e2e-tests:
    runs-on: ubuntu-latest
    needs: integration-tests
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npx playwright install
      - run: npm run test:e2e
```

### 6. When Regression Tests Fail — The Workflow

```
Regression test fails on your PR
        ↓
  Is the failure related to your change?
   ├── YES → You introduced a regression. Fix it before merging.
   │         ├── Unintentional? Fix the code.
   │         └── Intentional behavior change? Update the test.
   │
   └── NO → It's a "flaky test" or a pre-existing issue.
             ├── Confirm it fails on main too (not just your branch)
             ├── Flag it to the team
             └── Don't just re-run and hope — investigate
```

**The hardest question:** "Did we break it, or was it already broken?" This is why trunk health matters — if `main` always passes, any failure on your branch is your responsibility.

### 7. Regression Test Maintenance

Regression suites grow over time and need pruning. Without maintenance, they become slow, flaky, and ignored.

```
Healthy regression suite:
  ✓ Runs in < 10 minutes (unit + integration)
  ✓ Passes on main 100% of the time
  ✓ Every test has a clear purpose
  ✓ Flaky tests are quarantined and fixed promptly
  ✓ Redundant tests are removed

Unhealthy regression suite:
  ✗ Takes 45 minutes to run
  ✗ 3-5 tests fail randomly on every run ("flaky")
  ✗ Nobody knows what half the tests actually verify
  ✗ Developers skip the suite locally and wait for CI
  ✗ Failures are ignored because "it's probably flaky"
```

### 8. The Bug-to-Regression-Test Pattern

One of the most effective testing habits: **every bug fix gets a test**.

```js
// Bug report: "Users with a '+' in their email can't log in"

// Step 1: Write a test that reproduces the bug (it should FAIL)
test("handles email with plus sign", () => {
  const result = validateEmail("alice+work@example.com");
  expect(result).toBe(true); // ✗ FAILS — confirms the bug
});

// Step 2: Fix the bug
function validateEmail(email) {
  // Before: /^[a-zA-Z0-9.]+@/  ← missing + character
  // After:
  return /^[a-zA-Z0-9.+]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
}

// Step 3: Test passes. This test is now a permanent regression guard.
// If anyone changes the email regex in the future, this test catches it.
```

This pattern guarantees that every fixed bug can never silently reappear. Over time, your regression suite becomes a living history of every bug your team has encountered and resolved.

## Common Pitfalls

- **No automation.** Manual regression testing is slow, error-prone, and gets skipped under deadline pressure — exactly when regressions are most likely. Automate.
- **Flaky tests erode trust.** If tests fail randomly, developers stop paying attention to failures. Quarantine flaky tests immediately and fix them as a priority.
- **Testing implementation instead of behavior.** Tests that break whenever you refactor internals (but behavior hasn't changed) create noise. Test what the code *does*, not how it does it.
- **Growing suite without pruning.** A test suite that takes 30+ minutes to run discourages developers from running it. Regularly audit for redundant, slow, or low-value tests.
- **Not testing the fix.** Fixing a bug without adding a corresponding regression test is an invitation for that bug to return. Make the bug-to-test pattern a team habit.
- **Only testing the happy path.** Regressions often lurk in edge cases — null values, empty arrays, boundary conditions, concurrent access. Make sure your suite covers these.

## Practical Applications

- **CI/CD Pipelines:** Run the regression suite on every pull request to catch breaks before they reach production.
- **Dependency Updates:** Run full regression after `npm update` or Dependabot PRs to verify nothing broke from transitive dependency changes.
- **Refactoring Confidence:** A strong regression suite lets you restructure code aggressively, knowing you'll catch any behavioral changes immediately.
- **Release Validation:** Run the full E2E regression suite against a staging environment before production deploys.
- **Compliance Evidence:** In regulated industries (healthcare, finance), regression test results serve as evidence that changes don't impact existing validated functionality.

## References

- [Martin Fowler: Test Pyramid](https://martinfowler.com/articles/practical-test-pyramid.html)
- [Google Testing Blog: Testing on the Toilet](https://testing.googleblog.com/)
- [Jest Docs: --changedSince](https://jestjs.io/docs/cli#--changedsince)
- [Playwright Docs: CI/CD Integration](https://playwright.dev/docs/ci)
- [ISTQB: Regression Testing](https://www.istqb.org/)

---

## Greater Detail

### Advanced Concepts

- **Visual Regression Testing:** Tools like Percy, Chromatic, and Playwright's screenshot comparison detect unintended visual changes — pixel-level diffs of rendered UI. Essential for frontend-heavy applications where a CSS change can silently break layouts across pages.
- **Mutation Testing:** Tests your tests. Tools like Stryker (JS) or PIT (Java) introduce small code changes ("mutants") and check if your test suite catches them. If a mutant survives (tests still pass), your regression coverage has a gap.
- **Test Impact Analysis:** Advanced CI systems (like Microsoft's, or tools like Launchable) use code change analysis and historical test data to predict which tests are most likely to fail, running those first. This gives fast feedback without running the full suite.
- **Contract Testing:** For microservices, contract tests (Pact) verify that API contracts between services haven't changed. This is regression testing for service boundaries — catching breaking changes before integration.
- **Canary Deployments as Regression Testing:** Deploy the new version to a small percentage of traffic and monitor error rates, latency, and key metrics. If metrics regress, auto-rollback. This is regression testing in production using real user traffic as the test suite.