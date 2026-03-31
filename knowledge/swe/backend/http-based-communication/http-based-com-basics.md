# HTTP Communication Patterns: Overview

A quick reference for when to use each pattern, what you trade off, and where each fits.

## At a Glance

```
               Pull (client asks)          Push (server sends)
             ┌────────────────────┬─────────────────────────┐
One-off      │ REST, GraphQL, RPC │ Webhooks                │
             ├────────────────────┼─────────────────────────┤
Continuous   │ Polling,           │ SSE, WebSockets,        │
             │ Long Polling       │ gRPC Streams            │
             └────────────────────┴─────────────────────────┘
```

## Pattern Comparison

| Pattern | How It Works | Best For | Pros | Cons |
|---|---|---|---|---|
| **REST** | Client sends request, server responds. Stateless, resource-oriented, uses HTTP verbs (GET/POST/PUT/DELETE). | CRUD, standard APIs, most web apps | Simple, cacheable, universal tooling, well-understood | Client must initiate, no real-time, can over/under-fetch |
| **GraphQL** | Client sends a query specifying exactly what fields it needs. Single endpoint, typed schema. | Complex data needs, mobile apps, varied clients consuming the same API | No over-fetching, flexible queries, self-documenting schema | Complex caching (all POSTs), can expose expensive queries, steeper backend setup |
| **Polling** | Client repeatedly hits an endpoint on a fixed interval (e.g., every 5s). | Simple dashboards, low-frequency checks, when server doesn't support push | Dead simple, works everywhere, no persistent connections | Wasteful (most requests return nothing), delayed updates, doesn't scale well at high frequency |
| **Long Polling** | Client sends request, server *holds it open* until data is available, then responds. Client immediately reconnects. | Chat, notifications when WebSockets aren't available | Near real-time, works through firewalls/proxies, no special protocol | Ties up server connections, awkward to scale, more complex than regular polling |
| **SSE (Server-Sent Events)** | Server pushes events over a single persistent HTTP connection. One-directional (server → client). | Live feeds, dashboards, notifications, log streaming, AI token streaming | Simple (just HTTP), auto-reconnect built in, lightweight | Server → client only (no upstream), limited browser connections per domain (~6) |
| **WebSockets** | Persistent bidirectional connection. Either side can send at any time after the initial HTTP handshake. | Chat, gaming, collaborative editing, live trading, any full-duplex need | True real-time, bidirectional, low latency | Stateful connections (harder to scale/load-balance), not cacheable, more infrastructure complexity |
| **Webhooks** | Server A POSTs to Server B's URL when an event occurs. Server-to-server push. | Payment callbacks, CI/CD triggers, third-party integrations, event-driven architecture | Efficient (no polling), near real-time, decouples systems | Receiver must be publicly accessible, needs signature verification, delivery isn't guaranteed without retries |
| **gRPC** | Binary protocol (Protocol Buffers) over HTTP/2. Supports unary calls, client/server/bidirectional streaming. | Microservice-to-microservice, high-throughput internal APIs, polyglot services | Very fast (binary, multiplexed), strong typing, streaming built in | Not browser-native (needs proxy), harder to debug (binary), tighter coupling via proto files |

## Decision Flowchart

```
"How should these two systems communicate?"

Who initiates?
├── Client needs data on demand
│   ├── Simple resource CRUD? → REST
│   ├── Complex/flexible queries? → GraphQL
│   └── Internal service-to-service, high performance? → gRPC
│
├── Client needs ongoing updates
│   ├── Server → client only?
│   │   ├── Browser can use EventSource? → SSE
│   │   └── Need polling fallback? → Long Polling
│   ├── Need bidirectional? → WebSockets
│   └── Just need "good enough" updates? → Polling
│
└── Server needs to notify another server
    ├── Event-driven, async? → Webhooks
    ├── Streaming data between services? → gRPC Streams
    └── Simple notification? → Webhooks
```

## Quick Examples

```js
// REST — fetch a resource
await fetch("/api/users/42");

// GraphQL — query specific fields
await fetch("/graphql", {
  method: "POST",
  body: JSON.stringify({ query: `{ user(id: 42) { name email } }` }),
});

// Polling — check every 5 seconds
setInterval(async () => {
  const data = await fetch("/api/notifications").then(r => r.json());
}, 5000);

// SSE — server pushes events
const source = new EventSource("/api/stream");
source.onmessage = (e) => console.log(JSON.parse(e.data));

// WebSocket — bidirectional
const ws = new WebSocket("wss://example.com/ws");
ws.onmessage = (e) => console.log(e.data);
ws.send(JSON.stringify({ action: "subscribe", channel: "prices" }));

// Webhook — you receive a POST from an external service
app.post("/webhooks/stripe", (req, res) => {
  handleEvent(req.body);
  res.status(200).send("OK");
});
```

## Common Combinations

Most production systems use multiple patterns together:

| Stack | Example |
|---|---|
| REST + Webhooks | Stripe: REST API to create payments, webhooks to receive payment confirmations |
| REST + WebSockets | Slack: REST for history/CRUD, WebSockets for live messages |
| REST + SSE | ChatGPT: REST to submit a prompt, SSE to stream the response tokens |
| GraphQL + WebSockets | Real-time apps: GraphQL queries + GraphQL subscriptions over WebSocket |
| REST + Polling | Legacy dashboards: REST API with client polling every 30 seconds |
| gRPC + Webhooks | Microservices: gRPC between internal services, webhooks for external integrations |

## References

- [MDN: Server-Sent Events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events)
- [MDN: WebSockets API](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API)
- [GraphQL.org](https://graphql.org/)
- [gRPC Documentation](https://grpc.io/docs/)
- [Standard Webhooks](https://www.standardwebhooks.com/)