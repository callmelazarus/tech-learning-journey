# Observability: Logs, Metrics & Traces

**Observability** is your ability to understand what's happening inside a system from the outside — by looking at the data it produces. A system is observable if you can answer "what's wrong and why?" without deploying new code.

The three pillars each answer a different question:

| Pillar | Question | Example |
|---|---|---|
| **Logs** | What happened? | `"user 42 failed login at 3:04am"` |
| **Metrics** | How is it trending? | `CPU at 94%, error rate spiking` |
| **Traces** | Where did it slow? | `Request took 2s — 1.8s was the DB query` |

> **Analogy:** Imagine your app is a car. **Metrics** are the dashboard — speed, RPM, fuel level. **Logs** are the black box recorder — a timestamped record of every event. **Traces** are the GPS replay — showing exactly which roads were taken and how long each leg took.

None of the three alone is sufficient. You need all three to debug effectively.

---

## Logs — What Happened?

A log is a timestamped, discrete record of an event. Logs are the most granular data — the raw narrative of your system's behavior.

```json
{
  "timestamp": "2025-06-01T03:04:12Z",
  "level": "warn",
  "message": "Failed login attempt",
  "userId": 42,
  "ip": "203.0.113.45",
  "reason": "invalid_password",
  "attemptCount": 5
}
```

### Log Levels

| Level | When to use |
|---|---|
| `debug` | Detailed dev-time information — disabled in production |
| `info` | Normal operation events (user logged in, order created) |
| `warn` | Something unexpected but non-fatal (retry succeeded, high latency) |
| `error` | A failure that needs attention (payment failed, DB connection dropped) |
| `fatal` | System is unrecoverable — about to crash |

### Structured vs. Unstructured

```bash
# ❌ Unstructured — hard to query or alert on
[2025-06-01 03:04:12] WARNING: user 42 failed login from 203.0.113.45

# ✅ Structured JSON — queryable, parseable, filterable
{"timestamp":"2025-06-01T03:04:12Z","level":"warn","userId":42,"ip":"203.0.113.45"}
```

Always log structured JSON in production. Log aggregation tools (Datadog, CloudWatch, Splunk) can index and query fields — unstructured text is a dead end.

### What to Log

- Authentication events (login, logout, failures)
- State changes (order created, payment processed, user deleted)
- Errors and exceptions with stack traces
- External service calls and their outcomes
- Security-relevant actions (permission changes, admin access)

### What NOT to Log

- Passwords, tokens, or secrets (even accidentally)
- PII without a clear compliance and retention policy
- High-frequency debug noise left on in production
- Raw request bodies that may contain sensitive data

---

## Metrics — How Is It Trending?

A metric is a **numeric measurement over time** — a number attached to a timestamp, usually aggregated. Where logs capture individual events, metrics capture the *shape* of behavior across many events.

```
http_request_duration_ms{route="/api/users", method="GET"} p99=240ms
error_rate{service="payments"} = 3.2%
db_connection_pool_used = 94/100
```

### Types of Metrics

| Type | What it measures | Example |
|---|---|---|
| **Counter** | Ever-increasing total | Total requests served, total errors |
| **Gauge** | A value that goes up and down | Current CPU %, active connections |
| **Histogram** | Distribution of values | Request latency percentiles (p50, p95, p99) |

> **Percentiles matter more than averages.** An average latency of 100ms looks fine. A p99 of 4,000ms means 1 in 100 users is waiting 4 seconds. Averages hide the tail.

### The Four Golden Signals (Google SRE)

A minimal but complete set of metrics for any service:

| Signal | What it tells you |
|---|---|
| **Latency** | How long requests take (especially failures vs. successes separately) |
| **Traffic** | How much demand your system is under (requests/sec) |
| **Errors** | Rate of failed requests (5xx, timeouts, explicit errors) |
| **Saturation** | How "full" your system is (CPU %, queue depth, connection pool usage) |

If you instrument nothing else, instrument these four.

### Common Tools

**Prometheus** — open-source metrics collection and storage. Scrapes metrics endpoints from your services.
**Grafana** — dashboarding layer on top of Prometheus (or Datadog, CloudWatch, etc.).
**Datadog / New Relic / CloudWatch** — managed, all-in-one solutions.

---

## Traces — Where Did It Slow?

A **trace** follows a single request as it travels through your system — across services, databases, queues, and external APIs. Each unit of work is a **span**. Together, spans form a tree showing the full lifecycle of a request.

```
[Total: 2000ms]
 └── API Handler          50ms
      ├── Auth middleware  10ms
      ├── DB query (users) 1800ms  ← 🔴 bottleneck
      └── Format response  5ms
```

Without tracing, you'd see a slow request in your metrics — but not *which part* was slow. Tracing is the "zoom in" that metrics can't give you.

### Key Concepts

- **Trace** — the full end-to-end journey of one request, with a unique `traceId`
- **Span** — a single unit of work within a trace (a DB query, an HTTP call, a function)
- **Context propagation** — passing the `traceId` and `spanId` across service boundaries so distributed systems can reconstruct the full trace

```js
// OpenTelemetry — instrumenting a function as a span
const tracer = opentelemetry.trace.getTracer('my-service');

async function getUser(userId) {
  const span = tracer.startSpan('db.getUser');
  try {
    const user = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
    span.setAttributes({ 'db.rows_returned': user.length });
    return user;
  } catch (err) {
    span.recordException(err);
    throw err;
  } finally {
    span.end();
  }
}
```

### Common Tools

**Jaeger / Zipkin** — open-source distributed tracing backends.
**AWS X-Ray** — managed tracing, integrates natively with Lambda, API Gateway, ECS.
**Datadog APM / Honeycomb** — managed, with powerful trace querying and analysis.
**OpenTelemetry** — the open standard for instrumentation. Write once, send to any backend.

---

## How the Three Work Together

The real power is **correlation** — moving between pillars to answer a complete question.

**Typical debugging workflow:**

```
1. Metrics alert fires — error rate spiked to 8% at 3:04am
         ↓
2. Check logs — filter by "level: error" around 3:04am
   → See: "DB connection timeout" repeating for user requests
         ↓
3. Pull a trace from a failed request
   → See: 1.8s spent waiting on a DB connection from the pool
         ↓
4. Root cause: connection pool exhausted by a slow query surge
```

Each pillar leads you to the next:
- **Metrics** tell you *something is wrong*
- **Logs** tell you *what events preceded it*
- **Traces** tell you *exactly where the time went*

---

## OpenTelemetry — The Standard Worth Knowing

**OpenTelemetry (OTel)** is the emerging industry standard for instrumentation — a vendor-neutral SDK and protocol for emitting logs, metrics, and traces. You instrument your app once with OTel and can route to any backend (Datadog, Jaeger, Honeycomb, CloudWatch) without changing code.

```js
// Node.js — auto-instrumentation (no manual spans needed for HTTP, DB, etc.)
import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';

const sdk = new NodeSDK({
  traceExporter: new OTLPTraceExporter({ url: 'http://collector:4317' }),
  instrumentations: [getNodeAutoInstrumentations()],
});
sdk.start();
```

With auto-instrumentation, HTTP requests, DB queries, and Redis calls are traced automatically — no manual span creation required.

---

## Common Pitfalls

- **Logging everything, observing nothing** — raw volume without structure or alerting is just noise. Structured logs + queries + alerts make logs useful.
- **Only tracking averages** — p99 latency and error rate percentiles reveal what averages hide. Always track tail latency.
- **No correlation IDs** — without a `requestId` or `traceId` flowing through logs, correlating log lines across services is nearly impossible.
- **Traces without sampling strategy** — tracing every request at scale is expensive. Use head-based sampling (sample at entry) or tail-based sampling (sample after seeing the full trace, keep slow/error traces).
- **Treating observability as an afterthought** — retrofitting OTel into a large codebase is painful. Add it early.

---

## References

- [OpenTelemetry Docs](https://opentelemetry.io/docs/)
- [Google SRE Book: The Four Golden Signals](https://sre.google/sre-book/monitoring-distributed-systems/)
- [AWS X-Ray Docs](https://docs.aws.amazon.com/xray/)
- [Prometheus Docs](https://prometheus.io/docs/)
- [Honeycomb: Observability Engineering (free book)](https://info.honeycomb.io/observability-engineering-oreilly-book-2022)