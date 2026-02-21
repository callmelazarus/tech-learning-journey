# DoS and DDoS Attacks: Complete Overview

DoS (Denial of Service) attacks overwhelm a target system with traffic or requests to make it unavailable to legitimate users. DDoS (Distributed Denial of Service) is the same attack but launched from multiple sources simultaneously, making it harder to block. Think of DoS like one person repeatedly calling a restaurant to tie up the phone line—annoying but manageable. DDoS is like thousands of people calling at once from different numbers—the phone system becomes completely unusable.

## Key Points

- **DoS:** Single source attack overwhelming target
- **DDoS:** Multiple sources (botnet) attacking simultaneously
- **Goal:** Make service unavailable, not steal data
- **Types:** Volume (bandwidth), Protocol (resources), Application (logic)
- **Mitigation:** Rate limiting, CDN, WAF, traffic filtering

## DoS vs DDoS

```
DoS (Denial of Service)
┌─────────┐
│ Attacker│ ─────────────► ┌──────────┐
└─────────┘                 │  Target  │
Single source               │  Server  │
                           └──────────┘
Easier to block (one IP)

DDoS (Distributed Denial of Service)
┌─────────┐
│Attacker │
└────┬────┘
     │ Commands botnet
     ▼
┌─────────┐  ┌─────────┐  ┌─────────┐
│ Bot 1   │  │ Bot 2   │  │ Bot 3   │
└────┬────┘  └────┬────┘  └────┬────┘
     │            │            │
     └────────────┴────────────┘
                  │
                  ▼
            ┌──────────┐
            │  Target  │
            │  Server  │
            └──────────┘
            
Thousands/millions of sources
Much harder to block
```

## Attack Types

### Volume-Based (Layer 3/4)

```
Goal: Consume bandwidth

UDP Flood
├─ Attacker sends massive UDP packets
├─ No handshake needed (stateless)
├─ Target overwhelmed processing packets
└─ Example: 100 Gbps of UDP traffic

ICMP Flood (Ping Flood)
├─ Continuous ping requests
├─ Target busy responding
└─ Example: 10,000 pings/second

DNS Amplification
├─ Attacker spoofs victim's IP
├─ Sends small DNS query to open resolvers
├─ DNS responds with large response to victim
├─ Amplification: 50x-100x
└─ Example: 1 GB query → 50 GB response
```

### Protocol-Based (Layer 3/4)

```
Goal: Exhaust server resources (connections, memory)

SYN Flood
├─ Send SYN packets (start TCP handshake)
├─ Never complete handshake (no ACK)
├─ Server holds half-open connections
├─ Connection table fills up
└─ Legitimate users can't connect

Diagram:
Attacker → SYN → Server (waits for ACK)
Attacker → SYN → Server (waits for ACK)
(Repeat thousands of times)
Server connection table full ❌

Ping of Death
├─ Send oversized/malformed ping
├─ Crashes or freezes target
└─ Mostly patched in modern systems

Smurf Attack
├─ Send ICMP to broadcast address
├─ Spoof victim's IP as source
├─ All hosts reply to victim
└─ Amplification attack
```

### Application Layer (Layer 7)

```
Goal: Exhaust application resources

HTTP Flood
├─ Legitimate-looking HTTP requests
├─ Target resource-intensive pages
├─ Example: Search, database queries, reports
└─ Harder to detect (looks like real traffic)

Slowloris
├─ Open many connections to server
├─ Send partial HTTP requests slowly
├─ Keep connections alive indefinitely
├─ Server runs out of connection slots
└─ Low bandwidth required

Example:
POST /upload HTTP/1.1
Host: target.com
Content-Length: 1000000
Content-Type: application/x-www-form-urlencoded

(Send 1 byte every 10 seconds)
(Keep connection open forever)

Low and Slow Attacks
├─ Slow HTTP headers
├─ Slow POST
├─ Slow read
└─ Mimic legitimate slow connections
```

## Real-World Examples

### HTTP Flood Attack

```javascript
// What attacker does (simplified)
for (let i = 0; i < 100000; i++) {
  fetch('https://target.com/expensive-search?q=test')
    .catch(() => {}); // Don't care about response
}

// Target server overwhelmed:
// - Database queries pile up
// - CPU at 100%
// - Memory exhausted
// - Legitimate users get timeouts
```

### SYN Flood

```bash
# What attacker sends (pseudo-code)
while true; do
  send_packet(
    type: SYN,
    source_ip: random_ip(),  # Spoofed
    destination: target_server,
    source_port: random_port()
  )
done

# Server state:
netstat -an | grep SYN_RECV
# Shows thousands of half-open connections
```

### DNS Amplification

```
1. Attacker → DNS Server: "What's all the DNS info for example.com?"
   (Small request ~60 bytes, source IP spoofed as victim)

2. DNS Server → Victim: [Huge DNS response ~3000 bytes]
   
3. Repeat with 10,000 DNS servers
   
Result: 60 KB request → 30 MB response to victim
Amplification factor: 50x
```

## Detection

### Traffic Patterns

```javascript
// Unusual traffic indicators
{
  requests_per_second: 10000,  // Normal: 100
  unique_ips: 5000,            // Normal: 50
  geographic_spread: 'global', // Normal: regional
  user_agents: ['', '', ''],   // Missing or repeated
  request_patterns: 'identical' // Same endpoint repeatedly
}

// Monitoring example
const metrics = {
  normal_rps: 100,
  current_rps: 10000,
  threshold: 500
};

if (metrics.current_rps > metrics.threshold) {
  alert('Possible DDoS attack detected');
}
```

### Server Symptoms

```bash
# High CPU usage
top
# Load average: 50.0 (normal: 2.0)

# Memory exhaustion
free -h
# Available: 100MB (normal: 8GB)

# Connection table full
netstat -an | wc -l
# 65535 connections (max reached)

# Slow response times
curl -w "@curl-format.txt" https://site.com
# Total time: 30s (normal: 0.5s)

# Error logs flooded
tail -f /var/log/nginx/error.log
# Thousands of connection errors per second
```

## Mitigation Strategies

### Rate Limiting

```javascript
// Express rate limiter
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  message: 'Too many requests from this IP'
});

app.use('/api/', limiter);

// Advanced: Different limits per endpoint
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // Only 5 login attempts
  skipSuccessfulRequests: true
});

app.post('/api/auth/login', authLimiter, loginHandler);

// IP-based blocking
const blockedIPs = new Set();

app.use((req, res, next) => {
  if (blockedIPs.has(req.ip)) {
    return res.status(403).send('Blocked');
  }
  next();
});
```

### CDN (Content Delivery Network)

```
Without CDN:
All traffic → Origin Server (overwhelmed)

With CDN (Cloudflare, Akamai):
Traffic → CDN Edge Servers → Origin Server
         ↓
    CDN absorbs attack
    Only legitimate traffic reaches origin
    
Benefits:
- Massive bandwidth capacity
- DDoS protection built-in
- Geographic distribution
- Automatic mitigation
```

### WAF (Web Application Firewall)

```
WAF Rules:

1. Block known bad IPs
   if (ip in blacklist) block()

2. Challenge suspicious requests
   if (no_user_agent || suspicious_pattern) {
     return captcha();
   }

3. Rate limit per IP
   if (requests_per_minute > 100) {
     return 429; // Too Many Requests
   }

4. Signature detection
   if (matches_attack_pattern) block()

5. Behavioral analysis
   if (abnormal_behavior) challenge()
```

### Firewall Rules

```bash
# iptables: Limit connections per IP
iptables -A INPUT -p tcp --dport 80 -m connlimit \
  --connlimit-above 20 -j REJECT

# Limit SYN packets (SYN flood protection)
iptables -A INPUT -p tcp --syn -m limit \
  --limit 1/s --limit-burst 3 -j ACCEPT
iptables -A INPUT -p tcp --syn -j DROP

# Block specific IP
iptables -A INPUT -s 192.168.1.100 -j DROP

# nginx: Connection limiting
limit_conn_zone $binary_remote_addr zone=addr:10m;
limit_conn addr 10; # Max 10 connections per IP

# nginx: Request rate limiting
limit_req_zone $binary_remote_addr zone=req:10m rate=10r/s;
limit_req zone=req burst=20;
```

### Application-Level Defenses

```javascript
// CAPTCHA for suspicious traffic
app.use((req, res, next) => {
  if (isHighTrafficPeriod() && !req.session.verified) {
    return res.render('captcha');
  }
  next();
});

// Connection draining (Slowloris defense)
const server = app.listen(3000);
server.setTimeout(30000); // 30 second timeout
server.headersTimeout = 40000;

// Request size limits
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ limit: '1mb', extended: true }));

// Timeouts
const timeout = require('connect-timeout');
app.use(timeout('5s'));
app.use((req, res, next) => {
  if (!req.timedout) next();
});
```

### DNS Protection

```bash
# Disable DNS recursion (prevent amplification)
# named.conf
options {
  recursion no;
  allow-query { localhost; };
};

# Rate limit DNS queries
rate-limit {
  responses-per-second 5;
  window 5;
};
```

## Cloud-Based DDoS Protection

### AWS Shield

```
AWS Shield Standard (Free)
├─ Protection against common attacks
├─ Layer 3/4 protection
└─ Automatic, always-on

AWS Shield Advanced ($3000/month)
├─ Enhanced protection
├─ Layer 7 protection
├─ DDoS Response Team (DRT)
├─ Cost protection (avoid scaling charges)
└─ Real-time attack visibility
```

### Cloudflare

```javascript
// Cloudflare automatically mitigates DDoS

// Enable "Under Attack Mode" via API
const response = await fetch(
  'https://api.cloudflare.com/client/v4/zones/{zone_id}/settings/security_level',
  {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ value: 'under_attack' })
  }
);

// Shows challenge page to all visitors
// Blocks most bots automatically
```

## Best Practices

```javascript
// ✅ Use CDN with DDoS protection
// Cloudflare, AWS CloudFront, Akamai

// ✅ Implement rate limiting
app.use('/api/', rateLimit({ max: 100 }));

// ✅ Enable connection limits
server.maxConnections = 1000;

// ✅ Set timeouts
server.setTimeout(30000);

// ✅ Monitor traffic patterns
setInterval(() => {
  const rps = getRequestsPerSecond();
  if (rps > threshold) alert('High traffic');
}, 60000);

// ✅ Use WAF rules
// Block known attack patterns

// ✅ Keep infrastructure updated
// Patched systems resist known exploits

// ✅ Have incident response plan
// Know what to do when attacked

// ❌ Don't expose origin server IP
// Always behind CDN/proxy

// ❌ Don't ignore small attacks
// Test runs before major attack

// ❌ Don't have single point of failure
// Distribute across regions

// ❌ Don't disable security for convenience
// Keep protections enabled
```

## Incident Response

```javascript
// DDoS Response Checklist

1. Detect
   ├─ Monitor shows traffic spike
   ├─ Users report unavailability
   └─ Alerts triggered

2. Assess
   ├─ Identify attack type (volume/protocol/app)
   ├─ Check affected services
   └─ Estimate impact

3. Mitigate
   ├─ Enable "Under Attack Mode" (Cloudflare)
   ├─ Block malicious IPs
   ├─ Enable stricter rate limits
   └─ Contact DDoS protection service

4. Monitor
   ├─ Watch traffic patterns
   ├─ Verify mitigation working
   └─ Adjust rules as needed

5. Recover
   ├─ Gradually relax restrictions
   ├─ Verify normal operation
   └─ Document incident

6. Post-Mortem
   ├─ Analyze attack patterns
   ├─ Improve defenses
   └─ Update response procedures
```

## Legal Aspects

```
DDoS attacks are illegal in most countries:

US: Computer Fraud and Abuse Act (CFAA)
├─ Up to 10 years prison
└─ Fines up to $500,000

UK: Computer Misuse Act
├─ Up to 10 years prison
└─ Unlimited fines

EU: Network and Information Security Directive
└─ Criminal prosecution

Even "testing" is illegal without authorization
Hiring DDoS services (booters/stressers) is illegal
```

## References

- [Cloudflare DDoS Learning](https://www.cloudflare.com/learning/ddos/what-is-a-ddos-attack/)
- [AWS Shield](https://aws.amazon.com/shield/)
- [OWASP DDoS Prevention](https://owasp.org/www-community/attacks/Denial_of_Service)

---

## Summary

**DoS:** Single source overwhelms target.
**DDoS:** Multiple sources (botnet) attack simultaneously.

**Attack Types:**
- Volume: Bandwidth exhaustion (UDP flood)
- Protocol: Resource exhaustion (SYN flood)
- Application: Logic abuse (HTTP flood, Slowloris)

**Mitigation:**
```javascript
// Rate limiting
app.use(rateLimit({ max: 100 }));

// CDN (Cloudflare, AWS)
// Absorbs attack traffic

// WAF rules
// Block malicious patterns

// Timeouts
server.setTimeout(30000);
```

**Detection:**
- Traffic spike (10x normal)
- Many IPs from different locations
- Identical request patterns
- High CPU/memory/connections

**Rule of thumb:** Use CDN with DDoS protection. Implement rate limiting. Monitor traffic patterns. Have incident response plan. Block at network edge, not application. Contact DDoS protection service during attack.