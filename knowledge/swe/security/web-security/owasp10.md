# OWASP Top 10 (2025): Complete Overview

The **OWASP Top 10** is the most widely cited web application security standard in the world — published by the Open Worldwide Application Security Project (OWASP) and updated roughly every 4 years. It's a data-driven list of the 10 most critical application security risks, backed by analysis of over 175,000 CVE records and input from security practitioners globally.

> **Analogy:** Think of it like a building code for software. You wouldn't construct a building ignoring fire codes and load-bearing requirements — the OWASP Top 10 is the equivalent checklist for software security. Ignoring it doesn't mean you won't get hit; it means you won't see it coming.

The 2025 edition introduced **2 new categories** and consolidated 1, reflecting how modern threats have shifted toward supply chains, misconfigurations, and error handling.

---

## What Changed from 2021 → 2025

| 2025 Rank | Category | vs. 2021 |
|-----------|----------|----------|
| A01 | Broken Access Control | ↔ Stayed #1 |
| A02 | Security Misconfiguration | ↑ Up from #5 |
| A03 | Software Supply Chain Failures | 🆕 New |
| A04 | Cryptographic Failures | ↓ Down from #2 |
| A05 | Injection | ↓ Down from #3 |
| A06 | Insecure Design | ↓ Down from #4 |
| A07 | Authentication Failures | ↔ Stayed #7 |
| A08 | Software or Data Integrity Failures | ↔ Stayed #8 |
| A09 | Security Logging & Alerting Failures | ↔ Stayed #9 |
| A10 | Mishandling of Exceptional Conditions | 🆕 New |

> **Note:** SSRF (Server-Side Request Forgery), previously its own category in 2021, was absorbed into A01 Broken Access Control.

---

## The Full List — Explained

### A01 · Broken Access Control
**What it is:** Users can access data or perform actions they shouldn't be allowed to. This is the #1 risk — found in 100% of tested applications in some form.

> **Analogy:** A hotel guest using their room key to open *any* door in the building.

**Common examples:**
- Changing `?user_id=123` to `?user_id=124` in a URL and seeing someone else's data (IDOR — Insecure Direct Object Reference)
- A regular user accessing `/admin` routes because there's no server-side role check
- CSRF attacks forcing a logged-in user to perform unintended actions
- SSRF — tricking a server into making requests to internal services

**Fix:**
```js
// ❌ Don't trust the client to tell you who they are
app.get('/orders/:id', (req, res) => {
  const order = db.getOrder(req.params.id); // anyone can request any ID
});

// ✅ Verify ownership server-side
app.get('/orders/:id', authenticate, (req, res) => {
  const order = db.getOrder(req.params.id);
  if (order.userId !== req.user.id) return res.status(403).send('Forbidden');
});
```

---

### A02 · Security Misconfiguration
**What it is:** Systems, apps, or cloud services set up incorrectly — leaving defaults in place, exposing debug endpoints, or misconfiguring permissions. Jumped from #5 to #2 in 2025, affecting ~3% of tested apps.

**Common examples:**
- S3 bucket left publicly readable
- Debug mode enabled in production (stack traces leak internals)
- Default credentials never changed (`admin/admin`)
- Missing or misconfigured HTTP security headers
- Unnecessary ports, services, or features left open

**Fix:** Harden your deployment pipeline. Review IaC templates (CDK, Terraform) for unnecessary public exposure. Use tools like `helmet` in Express to set secure headers automatically:
```js
const helmet = require('helmet');
app.use(helmet()); // sets X-Frame-Options, Content-Security-Policy, etc.
```

---

### A03 · Software Supply Chain Failures *(New in 2025)*
**What it is:** Vulnerabilities or malicious code introduced through third-party libraries, build tools, package managers, or CI/CD pipelines. An expansion of the old "Vulnerable & Outdated Components" category — now covering the *entire* supply chain.

> **Analogy:** You built a secure house, but the contractor used counterfeit materials. The flaw isn't in your design — it's in what you trusted.

**Common examples:**
- `npm install` pulling in a dependency with a known CVE
- A malicious package published to PyPI/npm mimicking a popular library (typosquatting)
- A compromised build tool injecting backdoors into compiled output (like the SolarWinds attack)
- No integrity checks (checksums/SBOMs) on third-party packages

**Fix:**
- Use `npm audit` / `snyk` to scan dependencies regularly
- Pin dependency versions and use lock files (`package-lock.json`)
- Verify package integrity with checksums or signed packages
- Generate and maintain a Software Bill of Materials (SBOM)

---

### A04 · Cryptographic Failures
**What it is:** Sensitive data not protected properly — weak encryption, missing encryption, leaked keys, or data transmitted in plaintext. Previously called "Sensitive Data Exposure" in 2017 (a symptom); renamed to focus on the root cause.

**Common examples:**
- Passwords stored as MD5 or SHA1 hashes (easily cracked)
- Sensitive data sent over HTTP instead of HTTPS
- Hardcoded API keys or secrets in source code
- Weak or predictable encryption keys
- Using deprecated algorithms like DES or RC4

**Fix:**
```js
// ❌ Never store plain or weakly hashed passwords
db.save({ password: md5(userPassword) });

// ✅ Use bcrypt or argon2 with proper salt rounds
const bcrypt = require('bcrypt');
const hash = await bcrypt.hash(userPassword, 12);
```

---

### A05 · Injection
**What it is:** Untrusted input sent to an interpreter (SQL, shell, LDAP, etc.) as part of a command or query. Still a critical risk despite dropping from #3 to #5 — XSS is also classified here in 2025.

> **Analogy:** Leaving a blank check on the counter. An attacker fills in whatever amount (or command) they want.

**Common examples:**
```js
// ❌ SQL Injection — attacker inputs: ' OR 1=1; DROP TABLE users; --
const query = `SELECT * FROM users WHERE name = '${userInput}'`;

// ✅ Parameterized query — input is treated as data, never code
const query = 'SELECT * FROM users WHERE name = ?';
db.execute(query, [userInput]);
```

**Fix:** Always use parameterized queries or prepared statements. Validate and sanitize all inputs. Use an ORM that handles escaping by default.

---

### A06 · Insecure Design
**What it is:** Architectural weaknesses baked into the design of a system — security problems that can't be fixed by patching code alone. Added in 2021, this category targets the *design phase*, not just implementation.

> **Analogy:** You can't fix a building with no fire exits by repainting the walls. The flaw is structural.

**Common examples:**
- No rate limiting on password reset or login endpoints (enables brute force/credential stuffing)
- Business logic that allows a user to skip payment in a checkout flow
- Relying on client-side validation as the only security check
- Missing threat modeling during system design

**Fix:** Adopt secure-by-design practices — threat modeling (STRIDE), design reviews, and use security requirements from the start of a project, not as an afterthought.

---

### A07 · Authentication Failures
**What it is:** Weaknesses in login flows, session management, or identity verification that allow attackers to impersonate other users. Previously called "Identification & Authentication Failures."

**Common examples:**
- No rate limiting on login → enables credential stuffing attacks
- Session tokens not invalidated after logout
- Weak or no MFA
- JWT tokens with `alg: none` accepted by the server
- Session IDs exposed in URLs (cached in logs, referrer headers)

**Fix:**
```js
// ✅ Invalidate session on logout
app.post('/logout', (req, res) => {
  req.session.destroy();
  res.clearCookie('sessionId');
  res.redirect('/login');
});
```
Use battle-tested auth libraries (Passport.js, Auth0, Cognito). Never roll your own auth system.

---

### A08 · Software or Data Integrity Failures
**What it is:** Code or data processed without verifying its integrity — insecure deserialization, tampered software updates, or compromised CI/CD pipelines. Introduced in 2021.

**Common examples:**
- Auto-updating software from an untrusted source without verifying signatures
- Deserializing untrusted user input without validation (can lead to RCE)
- A CI/CD pipeline with no integrity checks on build artifacts
- Using plugins/extensions from unverified sources

**Fix:**
- Sign and verify release artifacts
- Never deserialize untrusted data directly into objects
- Secure CI/CD pipelines with proper access controls and audit logs
- Use `Content-Security-Policy` headers to prevent unauthorized script injection

---

### A09 · Security Logging & Alerting Failures
**What it is:** Insufficient logging, monitoring, or alerting — making it impossible to detect attacks in progress or investigate breaches after the fact. Slightly renamed in 2025 to emphasize *alerting* (logs without alerts are near-useless).

> **Analogy:** A store with security cameras but nobody watching the feed and no alarm system.

**Common examples:**
- Failed login attempts not logged → brute force goes undetected
- No alerting configured when privilege escalation occurs
- Logs stored in a location attackers can modify or delete
- No correlation between logs and incident response playbooks

**Fix:**
- Log all authentication events, privilege changes, and critical errors
- Set up SIEM alerting rules for suspicious patterns
- Store logs in write-once, immutable storage (CloudWatch, Splunk)
- Test your incident response process — not just your logging

---

### A10 · Mishandling of Exceptional Conditions *(New in 2025)*
**What it is:** Programs that fail to properly handle unexpected or abnormal situations — leading to crashes, unexpected behavior, or exploitable states. Covers improper error handling, logical errors, and "failing open" (defaulting to permissive when something goes wrong).

> **Analogy:** A security door that unlocks itself when it loses power, instead of staying locked.

**Common examples:**
- An exception causes the app to skip authorization checks entirely ("fail open")
- Verbose error messages returning stack traces, DB schema, or internal paths
- Division-by-zero or null reference crashes exposing system state
- Missing edge case handling in business logic (e.g., negative quantities in cart)

**Fix:**
```js
// ❌ Failing open — if auth check throws, user gets access
try {
  const allowed = await checkPermission(user, resource);
  if (allowed) grantAccess();
} catch (e) {
  grantAccess(); // dangerous default
}

// ✅ Failing closed — deny access on any error
try {
  const allowed = await checkPermission(user, resource);
  if (allowed) grantAccess();
  else denyAccess();
} catch (e) {
  denyAccess(); // safe default
  logger.error('Permission check failed', e);
}
```

---

## Common Pitfalls for Developers

- **Security as an afterthought** — most A06 (Insecure Design) issues are unfixable without a rewrite. Bake security into the design phase.
- **Trusting the client** — input validation on the frontend is UX, not security. Always validate server-side.
- **Rolling your own crypto or auth** — use established libraries. The failure rate of homebrew auth is very high.
- **Over-permissive defaults** — default to least privilege: deny everything, then explicitly allow. Applies to IAM roles, DB permissions, API scopes.
- **No dependency hygiene** — `npm install` and forget is a supply chain risk. Audit regularly.
- **Logging too little *and* too much** — too little means you can't detect attacks; too much (logging passwords, PII, tokens) creates new vulnerabilities.

---

## Practical Applications

- Use the OWASP Top 10 as a **security checklist** during code review and PR reviews
- Map it to your CI/CD pipeline: SAST catches A04/A05/A07, SCA catches A03, DAST catches A01/A02
- Use it in **threat modeling** sessions to frame "what could go wrong?"
- Onboard new engineers to security concepts with the Top 10 as a curriculum baseline
- Reference it when pushing back on product pressure to skip security work

---

## References

- [OWASP Top 10:2025 Official Site](https://owasp.org/Top10/2025/)
- [OWASP Top 10 GitHub](https://github.com/OWASP/Top10)
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/) — implementation-level defense guides
- [OWASP Dependency-Check](https://owasp.org/www-project-dependency-check/) — A03 tooling
- [OWASP ZAP](https://www.zaproxy.org/) — free DAST scanner

---

## Greater Detail

### Advanced Concepts

- **CWE Mapping:** Each OWASP category maps to a set of Common Weakness Enumerations (CWEs). The 2025 edition covers 589 CWEs across 10 categories — up from ~400 in 2021. Understanding the underlying CWEs helps you apply targeted fixes at the code level.

- **CVSS Scoring:** The list is weighted using CVSS (Common Vulnerability Scoring System) scores for exploitability and impact. High exploitability + high impact = higher ranking. Note that CVSS v3 shifted impact scoring ~1.5 points higher than v2, so older scores aren't directly comparable.

- **Data-Driven + Community:** 8 of the 10 categories are purely data-driven from real CVE/CWE analysis. The other 2 come from community survey — capturing risks the industry knows are important but testing tooling hasn't yet fully automated (like Insecure Design).

- **AI-Generated Code Risk:** The 2025 edition explicitly notes that LLM coding assistants frequently generate code containing A05 Injection patterns, A07 Authentication Failures, and A04 Cryptographic weaknesses — because they're trained on historical codebases that predate modern security practices. Every line of AI-generated code needs the same SAST review as human-written code.

- **Shift Left:** The trend across the 2025 Top 10 is clear — security needs to shift left into design, architecture, and the build pipeline. A02 (Misconfiguration), A03 (Supply Chain), and A10 (Error Handling) are all hard to patch after the fact. They require process changes, not just code fixes.

- **OWASP ASVS:** For teams wanting a more granular standard beyond awareness, the [Application Security Verification Standard (ASVS)](https://owasp.org/www-project-application-security-verification-standard/) provides detailed, testable security requirements that map to the Top 10 categories.