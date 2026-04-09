# Wiz: Complete Overview

Wiz is a **cloud security platform** that scans your entire cloud environment (AWS, Azure, GCP, OCI, Kubernetes) without deploying agents and surfaces risks in a single, prioritized view. Think of it as a security X-ray machine for your cloud — it sees across VMs, containers, serverless functions, storage buckets, IAM roles, and networking, then connects the dots to show you which combinations of issues create real attack paths, not just isolated findings.

## Key Points

- **Agentless Scanning:** Wiz connects via cloud APIs and snapshots — no software installed on your workloads.
- **Security Graph:** The core data model. Wiz maps every resource and relationship in your cloud, then queries across them to find toxic combinations.
- **Attack Path Analysis:** Instead of 10,000 isolated alerts, Wiz shows you "this publicly exposed VM has a critical CVE, an admin IAM role, and access to a database with PII" — one actionable finding.
- **Broad Coverage:** CSPM, CWPP, CIEM, DSPM, vulnerability management, container security, and IaC scanning — all in one platform.
- **No Performance Impact:** Because it's agentless (reads snapshots, not live workloads), there's zero runtime overhead.

## How Wiz Works

Wiz connects to your cloud accounts via read-only API access, takes snapshots of your environment, and builds a graph of everything.

```
Cloud Environment (AWS/Azure/GCP)
        ↓
  Read-only API connection + disk snapshots
        ↓
  ┌──────────────────────────┐
  │     Wiz Security Graph   │
  │                          │
  │  VMs ↔ IAM Roles         │
  │  Containers ↔ Networks   │
  │  Storage ↔ Data          │
  │  Secrets ↔ Permissions   │
  │  Vulnerabilities ↔ Exposure│
  └────────────┬─────────────┘
               ↓
  Prioritized Issues + Attack Paths
               ↓
  Dashboard / Alerts / Tickets
```

**Analogy:** Traditional security tools are like checking each room in a building for fire hazards independently. Wiz looks at the whole building at once — it sees that the room with oily rags is next to the room with a faulty heater, which is next to the room with a blocked fire exit. That *combination* is the real risk.

## Core Concepts

### 1. The Security Graph

The graph is Wiz's foundation. Every cloud resource becomes a **node**, and every relationship becomes an **edge**. This lets Wiz answer questions that span multiple domains.

```
Traditional tool: "VM has a critical CVE" (isolated finding)
Wiz graph query: "VM has a critical CVE
                   + is publicly exposed
                   + has an admin IAM role attached
                   + can access an S3 bucket with PII
                   + the bucket has no encryption"

→ That's an attack path, not just a vulnerability.
```

You can query the graph yourself in the Wiz console using the **Explorer** — it's like a search engine for your cloud infrastructure.

```
# Example graph queries (Wiz Explorer)

# Find all public-facing VMs with critical vulnerabilities
type = VirtualMachine AND isExposedToInternet = true AND vulnerabilities.severity = CRITICAL

# Find S3 buckets with PII that lack encryption
type = Bucket AND dataFindings.category = PII AND encryption = None

# Find IAM roles with admin access that haven't been used in 90 days
type = IAMRole AND permissions = Admin AND lastUsed > 90d
```

### 2. Issues and Severity

Wiz categorizes findings as **Issues**, each with a severity based on the combination of factors — not just the vulnerability itself.

```
┌──────────────────────────────────────────────────┐
│ CRITICAL ISSUE                                   │
│                                                  │
│ "Publicly exposed EC2 instance with RCE          │
│  vulnerability and access to production database"│
│                                                  │
│ Factors:                                         │
│  ✗ CVE-2024-XXXX (RCE, CVSS 9.8)               │
│  ✗ Security group allows 0.0.0.0/0 on port 443  │
│  ✗ IAM role can read from RDS prod-users-db      │
│  ✗ Database contains PII (emails, SSNs)          │
│                                                  │
│ → Any ONE of these alone = medium risk           │
│ → All FOUR together = critical attack path       │
└──────────────────────────────────────────────────┘
```

This contextual prioritization is the main differentiator — it cuts through alert fatigue by surfacing what actually matters.

### 3. Wiz Categories (The Alphabet Soup)

Wiz consolidates multiple security disciplines that are traditionally separate tools:

| Category | Full Name | What It Does | Traditional Tool Equivalent |
|---|---|---|---|
| **CSPM** | Cloud Security Posture Management | Misconfigurations (open ports, public buckets, missing MFA) | AWS Config, Prisma Cloud |
| **CWPP** | Cloud Workload Protection Platform | Vulnerabilities, malware, secrets in VMs/containers | CrowdStrike, Qualys |
| **CIEM** | Cloud Infrastructure Entitlement Management | Over-permissioned IAM roles, unused access | CloudKnox, Ermetic |
| **DSPM** | Data Security Posture Management | Find and classify sensitive data (PII, PHI, secrets) | BigID, Varonis |
| **IaC Scanning** | Infrastructure as Code | Misconfigurations in Terraform/CloudFormation before deploy | Checkov, tfsec |
| **Container Security** | — | Vulnerabilities in container images, K8s misconfigs | Trivy, Snyk Container |
| **CDR** | Cloud Detection & Response | Real-time threat detection and investigation | GuardDuty, SentinelOne |

You don't need to know all these acronyms to use Wiz — the platform unifies them into a single experience. But you'll encounter the terms in security conversations and compliance reviews.

### 4. Policies and Controls

Wiz comes with hundreds of built-in policies mapped to compliance frameworks. You can also create custom policies.

```
Built-in Policy Examples:
├── AWS S3 bucket is publicly accessible
├── EC2 instance has no IMDSv2 enforcement
├── IAM user has console access without MFA
├── RDS instance is not encrypted at rest
├── Security group allows unrestricted SSH access
├── EKS cluster endpoint is publicly accessible
└── Lambda function has admin IAM permissions

Compliance Frameworks Mapped:
├── SOC 2
├── PCI-DSS
├── HIPAA
├── CIS Benchmarks (AWS, Azure, GCP, K8s)
├── NIST 800-53
├── ISO 27001
└── GDPR
```

### 5. Inventory and Explorer

The Inventory view is a searchable, filterable catalog of every resource in your cloud. Think of it as `Cmd+F` for your infrastructure.

```
# Example: How many EC2 instances are running in production?
Filter: Type = EC2 Instance, Tag:Environment = production, Status = running

# Example: Find all resources in a specific VPC
Filter: VPC ID = vpc-0abc123def

# Example: List all Lambda functions using Python 3.8 (EOL)
Filter: Type = Lambda, Runtime = python3.8
```

The Explorer extends this with graph-based queries, letting you traverse relationships:

```
# "Show me all databases that this compromised EC2 instance could reach"
Start: EC2 instance i-0abc123
Traverse: Network access → Subnets → Security Groups → RDS instances
Result: 3 RDS instances reachable (2 production, 1 staging)
```

### 6. Vulnerabilities

Wiz scans OS packages, application dependencies, and container images for known CVEs — all without agents.

```
Vulnerability View:
┌────────────────────────────────────────────────┐
│ CVE-2024-XXXX  │ Critical │ CVSS 9.8          │
│ Package: openssl 3.0.2                         │
│ Fix: upgrade to 3.0.14                         │
│ Affected: 12 VMs, 34 containers               │
│ Exploitable: Yes (public exploit available)    │
│ Exposed to Internet: 3 instances               │
│                                                │
│ Context (what makes Wiz different):            │
│ → 3 of these are internet-facing               │
│ → 1 has an admin role + database access         │
│ → That 1 instance is your critical priority     │
│   (the other 11 are internal-only, lower risk)  │
└────────────────────────────────────────────────┘
```

Without the graph context, a traditional scanner would tell you "12 VMs are affected" and leave you to triage all 12 equally.

### 7. Integrations and Workflows

Wiz integrates with your existing tools so findings become actionable:

```
Wiz Issue Detected
      ↓
┌─────────────────────┐
│  Notification        │  Slack, Teams, Email, PagerDuty
│  Ticketing           │  Jira, ServiceNow, Azure DevOps
│  SIEM                │  Splunk, Sentinel, Sumo Logic
│  CI/CD               │  GitHub Actions, GitLab CI, Jenkins
│  IaC                 │  Terraform, CloudFormation
│  Automation          │  AWS Lambda, Azure Functions, webhooks
└─────────────────────┘
```

```
# Example Jira integration workflow:
# Wiz detects critical issue
#   → Auto-creates Jira ticket assigned to the resource owner
#   → Ticket includes remediation steps
#   → When fix is deployed, Wiz rescans and auto-closes the ticket
```

### 8. CLI and API

Wiz provides a GraphQL API and CLI (`wizcli`) for automation and CI/CD integration.

```bash
# Scan a container image before deploying
wizcli docker scan --image my-app:latest

# Scan IaC templates
wizcli iac scan --path ./terraform/

# Scan a directory for secrets
wizcli dir scan --path ./src/
```

```graphql
# GraphQL API — query issues programmatically
{
  issues(
    filter: {
      severity: CRITICAL
      status: OPEN
    }
  ) {
    nodes {
      id
      title
      severity
      resource {
        name
        type
        cloudAccount
      }
    }
  }
}
```

## Common Pitfalls

- **Ignoring context in triage.** Don't treat all "critical CVEs" equally. A critical CVE on an air-gapped internal VM is far less urgent than a medium CVE on a public-facing server with database access. Use Wiz's attack paths to prioritize.
- **Not setting up ownership.** Wiz can auto-assign issues to teams based on resource tags, cloud accounts, or projects. Without ownership mapping, issues pile up with no one responsible.
- **Alert fatigue from low-severity noise.** Start by focusing on critical and high severity issues with proven attack paths. Tune notification policies so teams aren't flooded with informational findings.
- **Skipping CI/CD integration.** Wiz is most powerful when it catches issues *before* they reach production. Integrate `wizcli` scans into your build pipeline to shift left.
- **Treating Wiz as "set and forget."** Cloud environments change constantly. Review the dashboard regularly, track remediation progress, and update policies as your architecture evolves.

## Practical Applications

- **Incident Response:** "We think credentials were leaked — what can they access?" — use the Security Graph to map blast radius from a compromised identity.
- **Compliance Audits:** Generate reports mapped to SOC 2, HIPAA, or PCI-DSS controls with evidence of current posture and remediation history.
- **Vulnerability Management:** Prioritize patching based on real exploitability and exposure, not just CVSS scores.
- **Cloud Migration Security:** Assess the security posture of newly migrated workloads — catch misconfigurations before they become incidents.
- **Developer Self-Service:** Give engineering teams access to their own Wiz projects so they can see and fix security issues without waiting for the security team.

## References

- [Wiz Documentation](https://docs.wiz.io/)
- [Wiz Academy (Free Training)](https://www.wiz.io/academy)
- [Wiz Blog](https://www.wiz.io/blog)
- [Wiz CLI Reference](https://docs.wiz.io/wiz-docs/docs/wizcli-overview)
- [Cloud Security Alliance: Cloud Controls Matrix](https://cloudsecurityalliance.org/research/cloud-controls-matrix/)

---

## Greater Detail

### Advanced Concepts

- **Custom Graph Queries (OQL):** Wiz's query language lets you write complex queries across the security graph. For example, find all Lambda functions that can assume a role with S3 write access to buckets without versioning. This is where Wiz becomes a power tool for security engineers.
- **Sensor (Optional Agent):** While Wiz is agentless by default, the Wiz Sensor is an optional lightweight agent for real-time runtime monitoring — detecting active threats like cryptominers, reverse shells, or lateral movement that snapshot-based scanning would miss.
- **Projects and Scoping:** Wiz Projects let you segment your cloud by team, business unit, or environment. Each project gets its own dashboard, policies, and user access. Essential for large organizations with hundreds of cloud accounts.
- **Admission Controller (Kubernetes):** Wiz can act as a K8s admission controller, blocking non-compliant container images from being deployed to your clusters. A hard gate rather than just an alert.
- **Data Security (DSPM):** Wiz scans storage services (S3, RDS, BigQuery, etc.) to classify data — finding PII, credentials, API keys, and PHI. This feeds into the graph, so a "public bucket" finding becomes "public bucket containing 50,000 Social Security numbers."