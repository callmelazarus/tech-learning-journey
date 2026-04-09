# Webhooks: Complete Overview

A webhook is a **mechanism where one system sends an automatic HTTP request to another system when an event happens**. Instead of your application constantly asking "did anything change?" (polling), the other system tells you the moment something happens. Think of it as the difference between refreshing your email inbox every 30 seconds versus getting a push notification — webhooks are the notification.

## Key Points

- **Event-Driven.** Webhooks fire when something happens — a payment succeeds, a commit is pushed, a form is submitted. You don't ask for the data, it comes to you.
- **Just HTTP POST.** A webhook is nothing more than an HTTP POST request with a JSON payload sent to a URL you provide. No special protocol.
- **You're the Server.** Unlike API calls where you *send* requests, with webhooks you *receive* them. You expose an endpoint and the external service calls it.
- **Near Real-Time.** Events are typically delivered within seconds of occurring. Much faster than polling.
- **At-Least-Once Delivery.** Most webhook providers retry on failure, meaning your handler should be idempotent — safe to receive the same event twice.

## How Webhooks Work

```
Traditional Polling (you ask repeatedly):

Your App                         Stripe API
  │── "Any new payments?"  ──→      │
  │←── "Nope"  ──────────────      │
  │── "Any new payments?"  ──→      │
  │←── "Nope"  ──────────────      │
  │── "Any new payments?"  ──→      │
  │←── "Yes! Here's one" ─────      │
  
  Problem: Wasteful. 99% of requests return nothing.

Webhooks (they tell you):

Your App                         Stripe
  │   (waiting)                     │
  │                                 │── payment happens
  │←── POST /webhooks/stripe ──────│
  │   { "type": "payment.completed" }
  │── 200 OK  ───────────────→      │
  
  Efficient. You only process real events.
```

**Analogy:** Polling is like calling a restaurant every 5 minutes to ask "is my table ready?" Webhooks are like giving them your phone number and saying "text me when it's ready."

## Step-by-Step Explanation & Examples

### 1. Receiving a Webhook (The Basics)

You create an endpoint on your server. The external service POSTs to it when events occur.

```js
// Express.js — basic webhook receiver
const express = require("express");
const app = express();

app.use(express.json());

app.post("/webhooks/stripe", (req, res) => {
  const event = req.body;

  console.log(`Received event: ${event.type}`);

  switch (event.type) {
    case "payment_intent.succeeded":
      console.log(`Payment succeeded: ${event.data.object.id}`);
      // fulfill the order, send confirmation email, etc.
      break;

    case "customer.subscription.deleted":
      console.log(`Subscription cancelled: ${event.data.object.id}`);
      // downgrade account, send retention email, etc.
      break;

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  // Always respond 200 quickly — acknowledge receipt
  res.status(200).json({ received: true });
});

app.listen(3000);
```

### 2. What a Webhook Payload Looks Like

Every provider has its own format, but most follow a similar pattern:

```json
// Stripe webhook payload
{
  "id": "evt_1R3abc456DEF",
  "type": "payment_intent.succeeded",
  "created": 1710523200,
  "data": {
    "object": {
      "id": "pi_3R3xyz789GHI",
      "amount": 2999,
      "currency": "usd",
      "status": "succeeded",
      "customer": "cus_abc123",
      "metadata": {
        "order_id": "ord_456"
      }
    }
  }
}
```

```json
// GitHub webhook payload (push event)
{
  "ref": "refs/heads/main",
  "repository": {
    "full_name": "alice/my-app",
    "html_url": "https://github.com/alice/my-app"
  },
  "pusher": {
    "name": "alice",
    "email": "alice@example.com"
  },
  "commits": [
    {
      "id": "a1b2c3d",
      "message": "fix auth bug",
      "timestamp": "2025-03-15T14:32:07-07:00",
      "added": [],
      "modified": ["src/auth.ts"],
      "removed": []
    }
  ]
}
```

```json
// Generic SaaS webhook payload
{
  "event": "user.created",
  "timestamp": "2025-03-15T14:32:07Z",
  "data": {
    "id": "usr_abc123",
    "email": "alice@example.com",
    "name": "Alice"
  },
  "webhook_id": "wh_xyz789"
}
```

### 3. Verifying Webhook Signatures (Critical)

Anyone can POST to your webhook endpoint. Without verification, an attacker could forge fake events ("this user paid" when they didn't). Most providers sign their payloads using a shared secret.

```js
// Stripe signature verification
const stripe = require("stripe")("sk_live_...");

app.post("/webhooks/stripe",
  express.raw({ type: "application/json" }),  // need raw body for verification
  (req, res) => {
    const sig = req.headers["stripe-signature"];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;
    try {
      // Stripe reconstructs the signature from the raw body + your secret
      // If someone tampered with the payload, the signatures won't match
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
      console.error("Signature verification failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Event is verified — safe to trust
    console.log(`Verified event: ${event.type}`);
    res.status(200).json({ received: true });
  }
);
```

**How signature verification works under the hood:**

```
Provider (Stripe):
  1. Takes the raw payload + a timestamp
  2. Signs it with HMAC-SHA256 using a shared secret
  3. Sends the signature in a header

Your server:
  1. Receives the payload + signature header
  2. Recomputes the HMAC using the same shared secret
  3. Compares: computed signature === received signature?
     Match → legitimate event
     No match → forged or tampered, reject
```

```js
// Manual signature verification (for providers without an SDK)
const crypto = require("crypto");

function verifyWebhookSignature(payload, signature, secret) {
  const computed = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");

  // Use timing-safe comparison to prevent timing attacks
  return crypto.timingSafeEqual(
    Buffer.from(computed),
    Buffer.from(signature)
  );
}

app.post("/webhooks/generic",
  express.raw({ type: "application/json" }),
  (req, res) => {
    const signature = req.headers["x-webhook-signature"];
    const isValid = verifyWebhookSignature(
      req.body,
      signature,
      process.env.WEBHOOK_SECRET
    );

    if (!isValid) {
      return res.status(401).send("Invalid signature");
    }

    const event = JSON.parse(req.body);
    // Process verified event...
    res.status(200).send("OK");
  }
);
```

### 4. Idempotency (Handling Duplicates)

Webhook providers retry failed deliveries. This means your endpoint *will* receive the same event more than once. Your handler must be idempotent — processing the same event twice should have no additional effect.

```js
// ✗ BAD — not idempotent. Charges the customer twice if webhook is retried.
app.post("/webhooks/payment", async (req, res) => {
  const { order_id, amount } = req.body.data;
  await db.query(
    "INSERT INTO payments (order_id, amount) VALUES ($1, $2)",
    [order_id, amount]
  );
  await sendConfirmationEmail(order_id);
  res.status(200).send("OK");
});

// ✓ GOOD — idempotent. Safe to receive multiple times.
app.post("/webhooks/payment", async (req, res) => {
  const event = req.body;

  // 1. Check if we've already processed this event
  const existing = await db.query(
    "SELECT id FROM processed_events WHERE event_id = $1",
    [event.id]
  );

  if (existing.rows.length > 0) {
    // Already processed — return 200 so provider stops retrying
    return res.status(200).send("Already processed");
  }

  // 2. Process the event
  const { order_id, amount } = event.data;
  await db.query(
    "INSERT INTO payments (order_id, amount) VALUES ($1, $2) ON CONFLICT (order_id) DO NOTHING",
    [order_id, amount]
  );

  // 3. Record that we processed this event
  await db.query(
    "INSERT INTO processed_events (event_id, processed_at) VALUES ($1, NOW())",
    [event.id]
  );

  await sendConfirmationEmail(order_id);
  res.status(200).send("OK");
});
```

The `processed_events` table acts as a deduplication log. Combined with `ON CONFLICT DO NOTHING` on the payments table, this handler is safe to call any number of times.

### 5. Respond Fast, Process Later

Webhook providers have timeout limits (typically 5-30 seconds). If your endpoint doesn't respond in time, the provider considers it a failure and retries. **Acknowledge receipt immediately, process the event asynchronously.**

```js
// ✗ BAD — does heavy processing before responding
app.post("/webhooks/order", async (req, res) => {
  const order = req.body.data;
  await updateDatabase(order);           // 200ms
  await generateInvoicePDF(order);       // 2s
  await sendEmail(order);                // 1s
  await notifyWarehouse(order);          // 500ms
  await updateAnalytics(order);          // 300ms
  res.status(200).send("OK");           // 4+ seconds later — might timeout!
});

// ✓ GOOD — respond immediately, process in background
app.post("/webhooks/order", async (req, res) => {
  const event = req.body;

  // Respond immediately
  res.status(200).send("OK");

  // Process asynchronously (queue, background job, etc.)
  try {
    await processOrderEvent(event);
  } catch (err) {
    console.error("Failed to process webhook:", err);
    // Log for manual retry — don't let this crash the server
  }
});

// Even better — use a proper job queue
app.post("/webhooks/order", async (req, res) => {
  // Store the raw event in a queue for reliable processing
  await messageQueue.send("webhook-events", {
    source: "stripe",
    payload: req.body,
    received_at: new Date().toISOString(),
  });

  res.status(200).send("OK");
});
```

The queue pattern is the most resilient. A dedicated worker processes events from the queue with proper retry logic, error handling, and idempotency — completely decoupled from the HTTP handler.

### 6. Production Architecture

```
                    ┌──────────────────────────────┐
                    │  External Service (Stripe)    │
                    │  "payment.succeeded"          │
                    └──────────────┬───────────────┘
                                   │ POST
                                   ▼
                    ┌──────────────────────────────┐
                    │  API Gateway / Load Balancer  │
                    └──────────────┬───────────────┘
                                   │
                                   ▼
                    ┌──────────────────────────────┐
                    │  Webhook Handler              │
                    │  1. Verify signature           │
                    │  2. Check idempotency key      │
                    │  3. Enqueue event              │
                    │  4. Return 200 immediately     │
                    └──────────────┬───────────────┘
                                   │
                                   ▼
                    ┌──────────────────────────────┐
                    │  Message Queue (SQS, Redis)   │
                    └──────────────┬───────────────┘
                                   │
                                   ▼
                    ┌──────────────────────────────┐
                    │  Worker                       │
                    │  1. Dequeue event              │
                    │  2. Process business logic     │
                    │  3. Update database            │
                    │  4. Send notifications         │
                    │  5. Mark event as processed    │
                    │  6. Retry on failure (w/ backoff)│
                    └──────────────────────────────┘
```

### 7. AWS Lambda Webhook Handler

Serverless functions are a natural fit for webhooks — they scale to zero when idle and handle bursts automatically.

```js
// AWS Lambda + API Gateway
const crypto = require("crypto");
const { SQSClient, SendMessageCommand } = require("@aws-sdk/client-sqs");

const sqs = new SQSClient({});

exports.handler = async (event) => {
  const body = event.body;
  const signature = event.headers["stripe-signature"];

  // 1. Verify signature
  if (!verifySignature(body, signature, process.env.WEBHOOK_SECRET)) {
    return { statusCode: 401, body: "Invalid signature" };
  }

  // 2. Enqueue for processing
  await sqs.send(new SendMessageCommand({
    QueueUrl: process.env.QUEUE_URL,
    MessageBody: body,
    MessageAttributes: {
      source: { DataType: "String", StringValue: "stripe" },
    },
    // SQS deduplication (prevents duplicate processing)
    MessageDeduplicationId: JSON.parse(body).id,
    MessageGroupId: "webhooks",
  }));

  // 3. Respond immediately
  return { statusCode: 200, body: JSON.stringify({ received: true }) };
};
```

### 8. Sending Webhooks (Being the Provider)

If your app needs to notify other systems of events, you become the webhook provider.

```js
const crypto = require("crypto");

async function sendWebhook(url, event, secret) {
  const payload = JSON.stringify({
    id: `evt_${crypto.randomUUID()}`,
    type: event.type,
    timestamp: new Date().toISOString(),
    data: event.data,
  });

  // Sign the payload
  const signature = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Webhook-Signature": signature,
        "X-Webhook-Timestamp": Date.now().toString(),
      },
      body: payload,
      signal: AbortSignal.timeout(10000), // 10s timeout
    });

    if (!response.ok) {
      throw new Error(`Webhook failed: ${response.status}`);
    }

    return { success: true, statusCode: response.status };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// Usage
await sendWebhook(
  "https://customer-app.com/webhooks",
  { type: "order.shipped", data: { order_id: "ord_123", tracking: "1Z999" } },
  "whsec_customer_secret_key"
);
```

**Building a robust webhook delivery system:**

```js
// Retry with exponential backoff
async function deliverWithRetry(url, payload, secret, maxRetries = 5) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const result = await sendWebhook(url, payload, secret);

    if (result.success) {
      await db.query(
        "UPDATE webhook_deliveries SET status = 'delivered', delivered_at = NOW() WHERE id = $1",
        [payload.id]
      );
      return result;
    }

    // Exponential backoff: 1s, 2s, 4s, 8s, 16s
    const delay = Math.pow(2, attempt) * 1000;
    console.log(`Webhook delivery failed (attempt ${attempt + 1}), retrying in ${delay}ms`);

    await db.query(
      "UPDATE webhook_deliveries SET status = 'retrying', attempts = $1, last_error = $2 WHERE id = $3",
      [attempt + 1, result.error, payload.id]
    );

    await new Promise(resolve => setTimeout(resolve, delay));
  }

  // All retries exhausted
  await db.query(
    "UPDATE webhook_deliveries SET status = 'failed' WHERE id = $1",
    [payload.id]
  );

  return { success: false, error: "Max retries exceeded" };
}
```

### 9. Testing Webhooks Locally

Webhooks need a publicly accessible URL, but your local dev server is behind NAT. Several tools create tunnels to solve this.

```bash
# ngrok — expose local port to the internet
ngrok http 3000
# Forwarding: https://a1b2c3d4.ngrok.io → http://localhost:3000

# Then register https://a1b2c3d4.ngrok.io/webhooks/stripe
# in the Stripe dashboard as your webhook URL

# Stripe CLI — built-in webhook forwarding
stripe listen --forward-to localhost:3000/webhooks/stripe
# Ready! Your webhook signing secret is whsec_abc123...

# Trigger test events
stripe trigger payment_intent.succeeded
```

```js
// Automated testing — mock the webhook POST
const request = require("supertest");

describe("Webhook Handler", () => {
  it("processes payment.succeeded events", async () => {
    const payload = {
      id: "evt_test_123",
      type: "payment_intent.succeeded",
      data: {
        object: { id: "pi_123", amount: 2999, currency: "usd" },
      },
    };

    const response = await request(app)
      .post("/webhooks/stripe")
      .set("Content-Type", "application/json")
      .set("stripe-signature", generateTestSignature(payload))
      .send(payload);

    expect(response.status).toBe(200);

    // Verify side effects
    const payment = await db.query("SELECT * FROM payments WHERE stripe_id = $1", ["pi_123"]);
    expect(payment.rows).toHaveLength(1);
    expect(payment.rows[0].amount).toBe(2999);
  });

  it("rejects invalid signatures", async () => {
    const response = await request(app)
      .post("/webhooks/stripe")
      .set("stripe-signature", "invalid")
      .send({ type: "payment_intent.succeeded" });

    expect(response.status).toBe(401);
  });

  it("handles duplicate events idempotently", async () => {
    const payload = { id: "evt_test_456", type: "payment_intent.succeeded", /* ... */ };

    // Send twice
    await request(app).post("/webhooks/stripe").send(payload);
    await request(app).post("/webhooks/stripe").send(payload);

    // Should only have one record
    const payments = await db.query("SELECT * FROM payments WHERE event_id = $1", ["evt_test_456"]);
    expect(payments.rows).toHaveLength(1);
  });
});
```

### 10. Common Webhook Providers

```
Provider          Events You'd Listen For
──────────────────────────────────────────────────────────
Stripe            payment.succeeded, subscription.cancelled, invoice.paid
GitHub            push, pull_request.opened, issues.created
Twilio            message.received, call.completed
SendGrid          email.delivered, email.bounced, email.opened
Shopify           orders/create, products/update, app/uninstalled
Slack             message.posted, channel_created, team_join
AWS SNS           CloudWatch alarms, S3 events, CodePipeline state changes
Jira              issue_created, issue_updated, sprint_started
Salesforce        Account.created, Opportunity.closed
```

## Webhooks vs Polling vs WebSockets vs Server-Sent Events

| Approach | Direction | Connection | Best For |
|---|---|---|---|
| **Webhooks** | Server → Your Server | One-off HTTP POST per event | Backend-to-backend event notification |
| **Polling** | Your App → Server | Repeated requests on interval | Simple integrations, no webhook support |
| **WebSockets** | Bidirectional | Persistent connection | Real-time UI (chat, live updates, gaming) |
| **SSE** | Server → Browser | Persistent one-way stream | Live feeds, dashboards, notifications |

**When to use webhooks:** You need to react to events in another system's backend (payments, deployments, form submissions). The consumer is a server, not a browser.

**When NOT to use webhooks:** You need real-time updates in a browser UI (use WebSockets/SSE). You need to query data on-demand (use a REST API). The provider doesn't support webhooks (fall back to polling).

## The Webhook Handler Checklist

```
Every production webhook handler should:

✓ Verify the signature before processing
✓ Respond with 200 within 5 seconds
✓ Process the event asynchronously (queue + worker)
✓ Handle duplicate events idempotently (dedup by event ID)
✓ Log the raw event for debugging and audit
✓ Handle unknown event types gracefully (don't crash)
✓ Use HTTPS for the endpoint URL
✓ Monitor for delivery failures and alert on prolonged outages
✓ Have a mechanism to replay missed events
```

## Common Pitfalls

- **Not verifying signatures.** Without verification, anyone who discovers your webhook URL can forge events. Always validate the HMAC signature using the provider's shared secret.
- **Processing synchronously before responding.** If your handler takes more than a few seconds, the provider will timeout, consider it a failure, and retry — creating duplicate processing. Respond 200 immediately, process in the background.
- **Not handling retries (no idempotency).** Providers retry failed deliveries. If your handler isn't idempotent, you'll double-charge customers, send duplicate emails, or create duplicate records.
- **Using `express.json()` middleware globally.** Signature verification requires the *raw* request body. If `express.json()` parses it first, the raw bytes are lost and the signature won't match. Use `express.raw()` for webhook routes.
- **Hardcoding webhook secrets.** Store secrets in environment variables or a secrets manager, never in code. Rotate them periodically.
- **No monitoring or alerting.** If your webhook endpoint goes down, events queue up and eventually get dropped. Monitor delivery success rates and alert on sustained failures.

## Practical Applications

- **Payment Processing:** Stripe webhook confirms payment → fulfill order, grant access, send receipt.
- **CI/CD Pipelines:** GitHub webhook on push → trigger build, run tests, deploy.
- **Notification Systems:** User action in one service → webhook → send Slack message, email, or SMS.
- **Data Synchronization:** CRM updates a contact → webhook → sync to your database.
- **Audit Logging:** Any significant event → webhook → log to security monitoring system.
- **Chatbots:** Message received in Slack/Teams → webhook → process with AI → respond.

## References

- [Stripe Webhook Documentation](https://stripe.com/docs/webhooks)
- [GitHub Webhooks Guide](https://docs.github.com/en/developers/webhooks-and-events/webhooks)
- [Webhook.site (Test Receiver)](https://webhook.site)
- [ngrok Documentation](https://ngrok.com/docs)
- [Standard Webhooks Spec](https://www.standardwebhooks.com)

---

## Greater Detail

### Advanced Concepts

- **Webhook Fan-Out:** When a single event needs to notify multiple subscribers, use a fan-out pattern: the event publishes to SNS/EventBridge, which distributes to multiple SQS queues or Lambda functions. Each consumer processes independently with its own retry and idempotency logic.
- **Dead Letter Queues (DLQ):** Events that fail processing after all retries go to a DLQ for manual investigation. This prevents data loss — failed events sit in the DLQ until an engineer reviews them, fixes the underlying issue, and replays them.
- **Replay and Recovery:** Production webhook systems need a way to replay missed events. Some providers offer event replay in their dashboard (Stripe, GitHub). For your own webhooks, store every received event in a log table, so you can reprocess any time window on demand.
- **Standard Webhooks:** The [Standard Webhooks](https://www.standardwebhooks.com) initiative aims to standardize webhook signing, headers, and retry behavior across providers. Libraries like `standardwebhooks` implement this spec — useful if you're building your own webhook delivery system.
- **Webhook Rate Limiting:** When receiving webhooks at scale (thousands per second), your handler can become a bottleneck. Use API Gateway throttling, SQS buffering, or application-level rate limiting to absorb spikes. When sending webhooks, respect the consumer's capacity — implement per-subscriber rate limits and back off if they return 429 (Too Many Requests).