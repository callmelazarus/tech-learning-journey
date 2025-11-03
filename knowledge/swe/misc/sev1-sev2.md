# SEV1/SEV2 Incidents: A Well-Structured Overview

SEV1 and SEV2 incidents are critical system outages or degradations that require immediate response, following structured escalation processes to restore service quickly while maintaining communication with stakeholders.

## Key Points

- **Definition:** Severity-based classification system for production incidents, where SEV1 is most critical (complete outage) and SEV2 is high priority (major degradation).
- **SEV1 Criteria:** Complete service outage, data loss, security breach, or issues affecting all users with significant business impact.
- **SEV2 Criteria:** Partial service degradation, significant performance issues, or problems affecting subset of users with moderate business impact.
- **Response Time:** SEV1 requires immediate response (minutes), SEV2 requires urgent response (within 1 hour).
- **Incident Command:** Structured roles including Incident Commander, Communications Lead, and Technical Lead coordinate response.
- **War Room:** Dedicated channel (Slack, Zoom) where responders collaborate in real-time during active incident.
- **Postmortem:** Blameless retrospective analyzing root cause, timeline, and prevention measures after resolution.

## Step-by-Step Explanation & Examples

**Incident Severity Classification**
```
SEV1 (Critical - P1 Priority)
├─ Complete service outage affecting all users
├─ Data loss or corruption impacting customer data
├─ Security breach or unauthorized access
├─ Payment processing completely down
├─ SLA breach with contractual penalties
└─ Response: Immediate (within 5-15 minutes)

SEV2 (High - P2 Priority)
├─ Significant performance degradation (>50% slowdown)
├─ Major feature unavailable (login works, checkout broken)
├─ Affecting specific region or user segment
├─ Elevated error rates (>5% of requests failing)
├─ Critical third-party integration down
└─ Response: Urgent (within 30-60 minutes)

SEV3 (Medium - P3 Priority)
├─ Minor feature degradation
├─ Affecting small percentage of users
└─ Response: Next business day

SEV4 (Low - P4 Priority)
├─ Cosmetic issues, minor bugs
└─ Response: Planned sprint work
```

**Incident Response Process**
```bash
# 1. DETECTION & DECLARATION
# Alert fires from monitoring (PagerDuty, Datadog, CloudWatch)
# On-call engineer acknowledges within 5 minutes

# 2. DECLARE INCIDENT
# Create incident in management tool
incident create --severity=sev1 --title="API gateway returning 503 errors"

# 3. ASSEMBLE RESPONSE TEAM
# Incident Commander (IC): Coordinates response, makes decisions
# Technical Lead (TL): Drives technical investigation and fixes
# Communications Lead (CL): Updates stakeholders, customers, status page
# Subject Matter Experts (SMEs): Database, networking, security specialists as needed

# 4. ESTABLISH WAR ROOM
# Create dedicated Slack channel: #incident-2024-11-03-api-outage
# Start Zoom bridge for voice communication
# Pin key links: dashboards, runbooks, status page

# 5. INITIAL ASSESSMENT (First 10 minutes)
TTD: Time to Detect - When did issue start?
TTR: Time to Respond - When did team engage?
Impact: How many users/requests affected?
Scope: Which services/regions impacted?

# 6. INVESTIGATION & MITIGATION
# Follow runbooks, check recent deployments
# Example commands during investigation:
kubectl get pods -n production  # Check pod health
aws cloudwatch get-metric-statistics  # Check metrics
git log --since="1 hour ago"  # Recent changes

# 7. STATUS UPDATES (Every 15-30 minutes)
# Communications Lead posts to:
# - Internal Slack channel
# - Status page (status.company.com)
# - Customer support team
# - Executive stakeholders

# 8. RESOLUTION
# Incident Commander declares "all clear"
# Monitor for 15-30 minutes to confirm stability
# Update status page: "Issue resolved"

# 9. POSTMORTEM (Within 48 hours)
# Write blameless incident report covering:
# - Timeline of events
# - Root cause analysis (RCA)
# - Impact assessment
# - Action items to prevent recurrence
```

**Key Acronyms and Terminology**
```
IC: Incident Commander - Leads response, makes decisions
TL: Technical Lead - Drives technical investigation
CL: Communications Lead - Manages stakeholder updates
SME: Subject Matter Expert - Domain specialists (DB, network, etc.)

RCA: Root Cause Analysis - Investigation into underlying cause
RFO: Reason for Outage - Alternative term for RCA
PIR: Post-Incident Review - Alternative term for postmortem

MTTR: Mean Time to Resolution - Average time to fix incidents
MTTD: Mean Time to Detection - Average time to detect issues
MTTA: Mean Time to Acknowledge - Response time to alerts
MTBF: Mean Time Between Failures - Reliability metric

TTD: Time to Detect - When issue started vs when detected
TTM: Time to Mitigate - When mitigation applied
TTR: Time to Resolve - Total resolution time

SLA: Service Level Agreement - Contractual uptime commitments
SLO: Service Level Objective - Internal target metrics
SLI: Service Level Indicator - Measured metrics (latency, errors)

P1/P2/P3/P4: Priority levels (synonymous with SEV levels)
RPO: Recovery Point Objective - Acceptable data loss window
RTO: Recovery Time Objective - Acceptable downtime window

EOC: Emergency Operations Center - Physical/virtual war room
NOC: Network Operations Center - 24/7 monitoring team
```

## Common Pitfalls

- Declaring incorrect severity—under-escalating SEV1 delays critical response, over-escalating SEV3 causes alert fatigue.
- Poor communication cadence—silence creates panic, update stakeholders regularly even without progress.
- Skipping incident commander role—multiple people making decisions creates chaos and delays.
- Making risky fixes under pressure—"cowboy" changes without review can worsen outages.
- Blame culture in postmortems—fear of punishment prevents honest analysis and learning.
- Not documenting during incident—recreating timeline later is difficult and inaccurate.
- Ignoring action items from postmortems—recurring incidents indicate process failure.

## Practical Applications

- **E-commerce:** Payment gateway down (SEV1), checkout page slow (SEV2), product images missing (SEV3).
- **SaaS Platform:** Login unavailable (SEV1), dashboard loading slowly (SEV2), typo in UI (SEV4).
- **Financial Services:** Trading system offline (SEV1), delayed transactions (SEV2), reporting lag (SEV3).
- **Social Media:** Site completely down (SEV1), feed not updating (SEV2), notification delay (SEV3).

**Example anecdote:** At 2am, monitoring alerts fired showing API latency spiking to 30 seconds. The on-call engineer declared SEV1, assembled the team, and started investigating. We discovered a database connection pool exhaustion from a memory leak in recent deployment. The IC coordinated a rollback while CL updated our status page every 15 minutes. We restored service in 47 minutes. The postmortem revealed we lacked proper load testing—now we load test every deployment, and haven't had a similar incident since.

## References

- [PagerDuty Incident Response Guide](https://response.pagerduty.com/)
- [Atlassian Incident Management](https://www.atlassian.com/incident-management)
- [Google SRE Book: Managing Incidents](https://sre.google/sre-book/managing-incidents/)
- [Blameless Postmortems](https://www.blameless.com/blog/blameless-postmortems)

---

## Greater Detail

### Advanced Concepts

- **Severity Matrix:** Organizations define custom matrices based on impact (users affected) vs urgency (business criticality).
- **Incident Command System (ICS):** Military-derived framework with clear chain of command and role separation.
- **Bridge Etiquette:** Mute when not speaking, IC has final authority, technical discussions in separate threads.
- **Customer Communications:** Balance transparency with precision—avoid promising timelines you can't meet.
- **Escalation Paths:** Define clear escalation to engineering managers, VPs, and C-suite for prolonged SEV1s.
- **Runbooks:** Pre-written procedures for common failure scenarios (database failover, cache invalidation, rollback procedures).
- **Chaos Engineering:** Intentionally inject failures (Netflix's Chaos Monkey) to validate incident response capabilities.
- **War Room Tools:** Incident.io, PagerDuty, Opsgenie, Jira Service Management for structured incident tracking.
- **Status Page Best Practices:** Use services like Statuspage.io or Atlassian Statuspage for transparent customer communication.
- **Blameless Culture:** Focus on systems and processes that failed, not individuals—"what broke" not "who broke it."
- **Action Item Tracking:** Assign owners, deadlines, and priority to postmortem action items; track completion.
- **Incident Metrics:** Track MTTR trends, incident frequency, false positive rates to improve processes.
- **On-Call Rotations:** Typically 1-week shifts with primary and secondary on-call engineers for coverage.
- **Alert Fatigue:** Too many low-priority alerts desensitize teams—tune alerting thresholds carefully.
- **Communication Templates:** Pre-written templates for status updates, customer notifications, and postmortem structure.
- **Major Incident Reviews:** Monthly review of all SEV1/SEV2 incidents with leadership to identify patterns.
- **Incident Taxonomy:** Categorize incidents (infrastructure, application, third-party, human error) for trend analysis.
- **Recovery Procedures:** Automated rollback scripts, blue-green deployments, circuit breakers for fast recovery.
- **Legal Considerations:** Document incidents carefully for regulatory compliance (SOC 2, HIPAA, GDPR breach notifications).