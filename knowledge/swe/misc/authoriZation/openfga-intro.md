# OpenFGA: Fine-Grained Authorization Overview

**OpenFGA** is an open-source authorization solution that lets developers build granular access control using a readable modeling language and friendly APIs. Originally developed by Auth0/Okta and donated to the Cloud Native Computing Foundation in 2022, it is currently maintained by Okta and Grafana employees and adopted by companies like Docker, Grafana Labs, and Canonical.

> **Analogy:** Most apps handle authorization like a bouncer with a list of job titles — "only managers get in." OpenFGA is more like a social graph — "you can see this document *because* Alice shared it with you, and Alice owns it *because* she created the folder." Relationships, not just roles.

---

## The Problem It Solves

Traditional **RBAC** (Role-Based Access Control) breaks down when access depends on *relationships* between users and resources — not just their role:

- A user can edit a document because they created it — not because of their job title
- A manager inherits access to all their team's projects — transitively
- An external collaborator gets view-only access to one specific file
- A team's permissions dissolve when the project ends

OpenFGA takes the best ideas from Google's Zanzibar paper for Relationship-Based Access Control (ReBAC), and also handles Role-Based and Attribute-Based Access Control use cases.

---

## Key Concepts

### 1. Store
A store is a logical container that holds your authorization model, relationship tuples, and associated schema. Separating environments (dev, staging, production) using stores keeps authorization rules organized and prevents unintended interactions.

### 2. Authorization Model
The model defines the types of objects in your system (users, documents, teams, organizations) and how they relate through relationships like `viewer`, `editor`, or `owner`. It is declarative and composable — the single source of truth for access logic.

```python
# DSL example: a simple document model
model
  schema 1.1

type user

type document
  relations
    define owner: [user]
    define editor: [user] or owner
    define viewer: [user] or editor
```

### 3. Relationship Tuples
The actual data — who has what relationship to what object. Written as `(user, relation, object)`:

```
user:alice  →  owner   →  document:roadmap
user:bob    →  viewer  →  document:roadmap
user:carol  →  editor  →  document:roadmap
```

### 4. Check API
The core question OpenFGA answers: **"Can user X perform action Y on object Z?"**

```bash
POST /stores/{store_id}/check
{
  "tuple_key": {
    "user": "user:bob",
    "relation": "viewer",
    "object": "document:roadmap"
  }
}
# → { "allowed": true }
```

OpenFGA is designed to answer authorization check calls in milliseconds, scaling from small startups to enterprise companies on a global scale.

---

## Transitive Permissions

By enabling transitive permissions — for example, if you're an editor of a folder you can edit its documents — OpenFGA supports both direct and inherited access patterns, ideal for collaboration and enterprise systems.

```python
type folder
  relations
    define editor: [user]

type document
  relations
    define parent_folder: [folder]
    define editor: [user] or editor from parent_folder
    # ↑ inherits editor access from the parent folder
```

So granting `user:alice editor on folder:engineering` automatically gives her editor access to every document inside.

---

## Getting Started

```bash
# Run locally with Docker
docker pull openfga/openfga
docker run -p 8080:8080 openfga/openfga run
```

```bash
# Create a store
curl -X POST http://localhost:8080/stores \
  -H 'Content-Type: application/json' \
  -d '{"name": "my-app"}'
```

SDKs are available for Java, Node.js, Go, Python, and .NET, with HTTP and gRPC API options. There's also a CLI for testing models and a playground for modeling relationships in real time.

---

## RBAC vs. ReBAC vs. ABAC

| | RBAC | ReBAC (OpenFGA) | ABAC |
|---|---|---|---|
| **Access based on** | User role | Relationships between entities | User/resource attributes |
| **Example** | `admin` can delete | `owner` of document can delete | `if department == "finance"` |
| **Scales to complex perms?** | ❌ | ✅ | ⚠️ Complex rules quickly |
| **OpenFGA supports?** | ✅ | ✅ | ✅ (via conditions) |

---

## Common Pitfalls

- **Modeling too early** — get your domain relationships clear before writing DSL. A bad model is hard to migrate.
- **Tuple bloat** — storing redundant tuples instead of using relationship inheritance leads to stale, inconsistent data.
- **Checking too broadly** — `ListObjects` (find all objects a user can access) is expensive at scale. Prefer `Check` for specific queries.
- **Forgetting to delete tuples** — when access is revoked (user leaves a team, document is deleted), the corresponding tuples must be removed manually.

---

## Practical Applications

- Multi-tenant SaaS with per-resource permissions (Google Docs-style sharing)
- Microservice authorization — centralize access logic instead of duplicating it across services
- GitHub/Jira-style org/team/repo hierarchies
- Replacing scattered `if (user.role === 'admin')` checks with a single source of truth

---

## References

- [OpenFGA Official Docs](https://openfga.dev/docs)
- [OpenFGA GitHub](https://github.com/openfga/openfga)
- [OpenFGA Playground](https://play.fga.dev/) — model and test in the browser
- [Google Zanzibar Paper](https://research.google/pubs/zanzibar-googles-consistent-global-authorization-system/) — the original inspiration
- [OWASP Top 10: A01 Broken Access Control](https://owasp.org/Top10/) — why authorization matters