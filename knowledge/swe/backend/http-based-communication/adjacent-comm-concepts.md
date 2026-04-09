# Adjacent System Communication Concepts: Overview

Beyond the HTTP patterns themselves, there's a layer of **infrastructure, protocols, and architectural patterns** that sit alongside or underneath them. These are the concepts that come up when you're designing, scaling, or debugging real systems.

## At a Glance

```
┌──────────────────────────────────────────────────────────┐
│                   Application Layer                       │
│  REST, GraphQL, WebSockets, Webhooks, gRPC, SSE          │
├──────────────────────────────────────────────────────────┤
│                   Routing & Gateway                       │
│  API Gateways, Load Balancers, Reverse Proxies, CDNs     │
├──────────────────────────────────────────────────────────┤
│                   Messaging & Async                       │
│  Message Queues, Pub/Sub, Event Buses, Streaming          │
├──────────────────────────────────────────────────────────┤
│                   Resilience & Reliability                 │
│  Retries, Circuit Breakers, Rate Limiting, Backpressure   │
├──────────────────────────────────────────────────────────┤
│                   Observability                            │
│  Logging, Tracing, Metrics, Health Checks                 │
├──────────────────────────────────────────────────────────┤
│                   Security                                 │
│  Auth (OAuth, JWT, API Keys), mTLS, CORS, HMAC Signing    │
├──────────────────────────────────────────────────────────┤
│                   Serialization & Contracts                │
│  JSON, Protobuf, Avro, OpenAPI, JSON Schema               │
└──────────────────────────────────────────────────────────┘
```

## Routing & Gateway Layer

| Concept | What It Does | When You Encounter It |
|---|---|---|
| **API Gateway** | Single entry point for all API traffic. Handles routing, auth, rate limiting, request transformation. | AWS API Gateway, Kong, Apigee. The "front door" to your backend. |
| **Load Balancer** | Distributes incoming requests across multiple server instances. | ALB/NLB (AWS), Nginx, HAProxy. Needed once you have more than one server. |
| **Reverse Proxy** | Sits in front of your server, forwards requests, handles TLS termination, caching, compression. | Nginx, Caddy, Traefik. Often the same box as your load balancer. |
| **CDN** | Caches static and dynamic content at edge locations close to users. | CloudFront, Cloudflare, Fastly. Reduces latency and origin server load. |
| **Service Mesh** | Manages service-to-service communication in microservices (routing, mTLS, retries, observability) as infrastructure rather than application code. | Istio, Linkerd. Relevant when you have dozens of internal services. |
| **DNS** | Resolves domain names to IP addresses. Also used for load balancing (round-robin DNS), failover, and geo-routing. | Route 53, Cloudflare DNS. The first hop of every request. |

## Messaging & Async

| Concept | What It Does | Examples | Best For |
|---|---|---|---|
| **Message Queue** | Point-to-point: Producer sends message, one consumer processes it. Guarantees delivery and ordering. | SQS, RabbitMQ, Redis Queue | Background jobs, task distribution, webhook processing |
| **Pub/Sub** | One-to-many: Publisher broadcasts, all subscribers receive. Decouples producers from consumers. | SNS, Google Pub/Sub, Redis Pub/Sub | Fan-out notifications, event broadcasting, microservice events |
| **Event Bus / Broker** | Central hub for events. Producers emit, consumers subscribe by event type. Often combines queue + pub/sub semantics. | EventBridge, Kafka, NATS | Event-driven architecture, cross-service communication |
| **Streaming Platform** | Ordered, durable, replayable event log. Consumers read at their own pace. Events persist for days/weeks. | Kafka, Kinesis, Redpanda | High-throughput data pipelines, audit logs, event sourcing |
| **Dead Letter Queue (DLQ)** | Captures messages that fail processing after all retries. Prevents data loss, enables manual investigation. | SQS DLQ, RabbitMQ DLX | Error recovery, debugging failed events |

**When to use what:**

```
Need one consumer to process each message?  → Message Queue (SQS)
Need multiple consumers to all get the event? → Pub/Sub (SNS)
Need both?                                     → SNS → SQS (fan-out to queues)
Need replay, ordering, high throughput?        → Streaming (Kafka)
Need to route events by type/rules?            → Event Bus (EventBridge)
```

## Resilience & Reliability

| Concept | What It Does | Analogy |
|---|---|---|
| **Retry with Backoff** | Automatically retry failed requests with increasing delays (1s, 2s, 4s, 8s...). Prevents overwhelming a recovering service. | Knocking on a door — wait longer between knocks instead of pounding continuously. |
| **Circuit Breaker** | After N consecutive failures, stop calling the failing service entirely for a cooldown period. Prevents cascading failures. | An electrical circuit breaker — trips to protect the system, resets after conditions improve. |
| **Rate Limiting** | Cap the number of requests a client can make in a time window (e.g., 100 req/min). Protects servers from overload. | A bouncer controlling how many people enter per hour. |
| **Backpressure** | When a consumer can't keep up, it signals the producer to slow down rather than dropping messages or crashing. | A sink drain — if water flows in faster than it drains, you turn down the faucet. |
| **Idempotency** | Ensuring that performing an operation multiple times has the same effect as performing it once. Critical for retries and webhooks. | Pressing an elevator button 10 times — the elevator only comes once. |
| **Timeout** | Set a maximum time to wait for a response. Prevents requests from hanging indefinitely. | A phone call — if nobody picks up in 30 seconds, you hang up. |
| **Bulkhead** | Isolate failures to one part of the system so they don't affect others. Separate thread pools or connection pools per service. | Ship bulkheads — if one compartment floods, the others stay dry. |
| **Health Checks** | Endpoints that report whether a service is alive and ready. Load balancers use these to route traffic away from unhealthy instances. | A heartbeat monitor — if it flatlines, divert traffic. |

## Observability

| Concept | What It Captures | Tools |
|---|---|---|
| **Logging** | Discrete events — what happened, when, context. Human-readable records of system behavior. | CloudWatch, Datadog, Splunk, ELK |
| **Metrics** | Numeric measurements over time — request count, latency p95, error rate, CPU usage. | Prometheus, Grafana, CloudWatch Metrics, Datadog |
| **Tracing** | End-to-end request path across services. Shows where time is spent and where failures occur in a distributed system. | Jaeger, X-Ray, Datadog APM, OpenTelemetry |
| **Alerting** | Automated notifications when metrics cross thresholds (error rate > 5%, latency > 2s, disk > 90%). | PagerDuty, OpsGenie, CloudWatch Alarms |

These three together — logs, metrics, traces — are called the **three pillars of observability**. Each answers a different question: logs tell you *what* happened, metrics tell you *how much*, and traces tell you *where* in the chain.

## Security

| Concept | What It Does | When You Use It |
|---|---|---|
| **API Keys** | Simple token identifying the caller. Sent in a header. No user identity, just "which app is calling." | Third-party API access, internal service identification |
| **OAuth 2.0** | Delegated authorization framework. Users grant limited access to their data without sharing credentials. | "Sign in with Google", third-party app integrations |
| **JWT (JSON Web Token)** | Self-contained, signed token carrying claims (user ID, roles, expiry). Server verifies without a database lookup. | Stateless auth for APIs, session replacement |
| **mTLS (Mutual TLS)** | Both client and server present certificates. Verifies identity in both directions. | Service-to-service auth in microservices, zero-trust networks |
| **CORS** | Browser security mechanism controlling which domains can call your API from JavaScript. Server specifies allowed origins. | Any frontend calling a backend on a different domain |
| **HMAC Signing** | Signing request payloads with a shared secret to verify authenticity and integrity. | Webhook verification, API request signing (AWS Signature V4) |
| **Rate Limiting / Throttling** | Security + reliability — prevents abuse, brute force, and DDoS at the API level. | Public APIs, auth endpoints, any exposed endpoint |

## Serialization & Contracts

| Format | Type | Human-Readable | Best For |
|---|---|---|---|
| **JSON** | Text | Yes | REST APIs, configuration, general data exchange |
| **Protocol Buffers** | Binary | No | gRPC, high-performance inter-service communication |
| **Avro** | Binary | No | Kafka, data pipelines, schema evolution |
| **MessagePack** | Binary | No | Compact JSON replacement, embedded systems |
| **XML** | Text | Yes | Legacy APIs, SOAP, enterprise integrations |

| Contract / Spec | What It Defines |
|---|---|
| **OpenAPI (Swagger)** | REST API structure — endpoints, parameters, request/response schemas |
| **GraphQL Schema** | Query types, mutations, subscriptions, field types |
| **Proto Files (.proto)** | gRPC service definitions, message types |
| **JSON Schema** | Validation rules for JSON data structures |
| **AsyncAPI** | Event-driven API structure (message queues, pub/sub, WebSockets) |

## Architectural Patterns

| Pattern | What It Means | Trade-off |
|---|---|---|
| **Synchronous** | Caller waits for a response before proceeding. REST, gRPC unary calls. | Simple to reason about, but caller is blocked and failures cascade. |
| **Asynchronous** | Caller fires and forgets (or gets notified later). Queues, webhooks, events. | Better resilience and decoupling, but harder to debug and track request flow. |
| **Request-Response** | One request, one response. The fundamental HTTP pattern. | Clean and predictable, but doesn't fit streaming or real-time needs. |
| **Event-Driven** | Systems emit events, other systems react. No direct coupling between producer and consumer. | Highly decoupled and scalable, but eventual consistency and harder to trace. |
| **CQRS** | Separate models for reads (queries) and writes (commands). Optimized independently. | Great for read-heavy or complex domain systems, but adds complexity. |
| **Saga** | Distributed transaction as a sequence of local transactions with compensating actions on failure. | Handles cross-service consistency without distributed locks, but complex to implement and debug. |

## How They Connect

A single user action often touches many of these concepts:

```
User clicks "Place Order"
    ↓
Browser → CORS check → API Gateway → Load Balancer
    ↓
Auth middleware validates JWT
    ↓
Order Service (REST) → creates order in DB
    ↓
Publishes "order.created" event to SNS (Pub/Sub)
    ├─→ SQS → Payment Worker (retries + idempotency)
    ├─→ SQS → Email Worker (sends confirmation)
    └─→ SQS → Inventory Worker (reserves stock)
    ↓
Stripe processes payment → sends Webhook back
    ↓
Webhook handler verifies HMAC signature
    ↓
Publishes "payment.succeeded" to EventBridge
    ↓
SSE/WebSocket pushes "order confirmed" to browser
    ↓
All steps traced via OpenTelemetry → Datadog
All steps logged → CloudWatch → Splunk
Metrics (latency, error rate) → Grafana dashboards
```

## References

- [AWS Well-Architected: Reliability Pillar](https://docs.aws.amazon.com/wellarchitected/latest/reliability-pillar/)
- [Martin Fowler: Circuit Breaker](https://martinfowler.com/bliki/CircuitBreaker.html)
- [OpenTelemetry Documentation](https://opentelemetry.io/docs/)
- [OAuth 2.0 Simplified](https://www.oauth.com/)
- [AsyncAPI Specification](https://www.asyncapi.com/)
- [Microsoft: Cloud Design Patterns](https://learn.microsoft.com/en-us/azure/architecture/patterns/)