# Cloudflare: Complete Overview

Cloudflare is a global network that sits between website visitors and hosting servers, providing CDN (Content Delivery Network), DDoS protection, DNS, and security services. It speeds up websites by caching content globally and protects against attacks by filtering malicious traffic. Think of Cloudflare as a smart security guard and delivery service—it blocks bad actors, caches your content worldwide for faster access, and routes traffic efficiently.

## Key Points

- **CDN:** Caches content on 300+ servers worldwide for faster delivery
- **DDoS Protection:** Blocks malicious traffic and attacks
- **DNS:** Fast, free DNS hosting (1.1.1.1)
- **SSL/TLS:** Free SSL certificates for HTTPS
- **Free Tier:** Generous free plan for most websites

## Core Services

### 1. CDN (Content Delivery Network)

Caches static content globally for faster loading.

```
Without Cloudflare:
User in Tokyo → Server in New York → 200ms latency

With Cloudflare:
User in Tokyo → Cloudflare Tokyo data center → 20ms latency
```

**What Gets Cached:**
```
✅ Cached by default:
- Images (.jpg, .png, .webp)
- CSS files (.css)
- JavaScript (.js)
- Static HTML (with page rules)

❌ Not cached by default:
- HTML pages
- API responses
- Dynamic content
```

**Cache Control:**
```html
<!-- Server sets cache headers -->
Cache-Control: public, max-age=3600

<!-- Cloudflare respects and extends -->
```

### 2. DDoS Protection

Automatically blocks malicious traffic.

```
Attack Types Protected:
- Layer 3/4: Network floods (SYN, UDP)
- Layer 7: HTTP floods, slowloris
- Volumetric: Bandwidth exhaustion

Free tier includes:
- Unlimited DDoS mitigation
- Rate limiting (100 rules)
- IP blocking
```

### 3. DNS Hosting

Fast, reliable DNS with free tier.

```bash
# Cloudflare's public DNS
1.1.1.1 (primary)
1.0.0.1 (secondary)

# Fastest DNS resolver globally
# Privacy-focused (no logging)
```

**DNS Records in Cloudflare:**
```
Type    Name              Value              Proxy Status
A       example.com       192.0.2.1          ☁️ Proxied
CNAME   www               example.com        ☁️ Proxied
A       direct            192.0.2.1          🔘 DNS Only
MX      example.com       mail.google.com    🔘 DNS Only

Proxied (☁️): Traffic goes through Cloudflare
DNS Only (🔘): Direct to origin server
```

### 4. SSL/TLS

Free SSL certificates for all sites.

```
SSL Modes:

1. Off (not secure)
   Browser → Cloudflare → Server
   HTTP      HTTP         HTTP

2. Flexible (⚠️ not recommended)
   Browser → Cloudflare → Server
   HTTPS     HTTP         HTTP
   
3. Full (basic security)
   Browser → Cloudflare → Server
   HTTPS     HTTPS        HTTPS (self-signed OK)

4. Full (Strict) (✅ recommended)
   Browser → Cloudflare → Server
   HTTPS     HTTPS        HTTPS (valid cert required)
```

**Auto HTTPS Rewrites:**
```html
<!-- Your HTML -->
<img src="http://example.com/image.jpg">

<!-- Cloudflare rewrites to -->
<img src="https://example.com/image.jpg">
```

## Setup Process

### 1. Add Site to Cloudflare

```
1. Sign up at cloudflare.com
2. Click "Add a Site"
3. Enter domain: example.com
4. Choose plan (Free)
5. Cloudflare scans existing DNS records
6. Review and confirm records
```

### 2. Update Nameservers

```
Change nameservers at domain registrar:

Old (GoDaddy example):
ns1.godaddy.com
ns2.godaddy.com

New (Cloudflare):
aria.ns.cloudflare.com
todd.ns.cloudflare.com

Wait for propagation (usually <1 hour)
```

### 3. Configure Settings

```
Recommended settings:

SSL/TLS:        Full (Strict)
Always Use HTTPS: On
Auto Minify:    HTML, CSS, JS
Brotli:         On
```

## Page Rules

Control caching and behavior per URL.

```
Free tier: 3 page rules

Example 1: Cache everything on blog
URL: blog.example.com/*
Settings:
- Cache Level: Cache Everything
- Edge Cache TTL: 1 day

Example 2: Bypass cache for admin
URL: example.com/admin/*
Settings:
- Cache Level: Bypass

Example 3: Force HTTPS redirect
URL: http://example.com/*
Settings:
- Always Use HTTPS: On
```

## Caching Strategies

### Cache Static Assets

```
Automatic for:
*.jpg, *.png, *.css, *.js

Custom cache with Page Rules:
URL: example.com/assets/*
Cache Level: Cache Everything
Edge Cache TTL: 1 month
```

### Cache HTML Pages

```
Page Rule:
URL: example.com/*
Cache Level: Cache Everything
Edge Cache TTL: 2 hours

⚠️ Watch for dynamic content
✅ Good for: Blogs, marketing sites
❌ Bad for: User dashboards, real-time data
```

### Bypass Cache

```javascript
// Set in server response headers
Cache-Control: no-cache, no-store, private

// Or via Page Rule
URL: example.com/api/*
Cache Level: Bypass
```

### Purge Cache

```bash
# Purge everything (free tier)
Cloudflare Dashboard → Caching → Purge Everything

# Purge by URL (Pro+)
https://example.com/style.css

# Purge by tag (Business+)
Cache-Tag: product-123

# Via API
curl -X POST "https://api.cloudflare.com/client/v4/zones/{zone_id}/purge_cache" \
  -H "Authorization: Bearer {token}" \
  -d '{"purge_everything":true}'
```

## Security Features

### Firewall Rules

```
Free tier: 5 rules

Example 1: Block country
Field: Country
Operator: equals
Value: XX
Action: Block

Example 2: Challenge suspicious traffic
Field: Threat Score
Operator: greater than
Value: 10
Action: Challenge

Example 3: Allow only specific IPs to admin
Field: URI Path
Operator: contains
Value: /admin
AND
Field: IP Address
Operator: is not in
Value: 203.0.113.0/24
Action: Block
```

### Rate Limiting

```
Free tier: 1 rule

Example: Protect API
Match: api.example.com/login
Requests: 5 per minute
Action: Block for 10 minutes
```

### Bot Protection

```
Free tier: Basic bot fight mode
- Blocks bad bots automatically
- Invisible to legitimate users

Pro+: Advanced bot management
- Machine learning detection
- Custom rules
```

## Workers (Edge Computing)

Serverless JavaScript at edge locations.

```javascript
// Free tier: 100,000 requests/day

// Simple example: Redirect
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  
  // Redirect www to non-www
  if (url.hostname.startsWith('www.')) {
    url.hostname = url.hostname.substring(4)
    return Response.redirect(url.toString(), 301)
  }
  
  return fetch(request)
}

// Deploy via Cloudflare Dashboard or CLI
wrangler publish
```

### Common Worker Use Cases

```javascript
// A/B testing
if (Math.random() > 0.5) {
  return fetch('https://variant-a.com')
} else {
  return fetch('https://variant-b.com')
}

// Custom headers
const response = await fetch(request)
const newHeaders = new Headers(response.headers)
newHeaders.set('X-Custom-Header', 'value')
return new Response(response.body, {
  headers: newHeaders
})

// Geo-redirect
const country = request.cf.country
if (country === 'US') {
  return fetch('https://us.example.com')
}
```

## Analytics

```
Free tier includes:

- Traffic analytics (24 hours)
- Security events
- Performance metrics
- Top requests

Pro+ includes:
- 30+ days history
- GraphQL API access
- Detailed bot analytics
```

## Common Configurations

### Basic WordPress

```
Page Rules:
1. example.com/wp-admin/*
   Cache Level: Bypass

2. example.com/wp-login.php
   Cache Level: Bypass

3. example.com/*
   Cache Level: Cache Everything
   Edge Cache TTL: 2 hours

Settings:
- SSL: Full (Strict)
- Auto Minify: HTML, CSS, JS
- Brotli: On
```

### SPA (React/Vue)

```
Page Rules:
1. example.com/api/*
   Cache Level: Bypass

2. example.com/*
   Cache Level: Cache Everything
   Edge Cache TTL: 1 hour

Settings:
- SSL: Full (Strict)
- Always Use HTTPS: On
```

### API

```
Page Rules:
1. api.example.com/*
   Cache Level: Bypass
   OR
   Cache Level: Cache Everything (for GET only)
   Edge Cache TTL: 5 minutes

Firewall Rules:
1. Rate limit: 100 req/min per IP
2. Block bad bots
```

## Troubleshooting

### Site Not Loading

```bash
# Check DNS propagation
dig example.com @1.1.1.1

# Check if proxied
dig example.com
# Should return Cloudflare IPs (104.x.x.x or 172.x.x.x)

# Temporarily bypass Cloudflare
Set DNS record to "DNS Only" mode
```

### SSL Errors

```
Error: "Too many redirects"
Cause: SSL mode mismatch
Fix: Set to Full or Full (Strict)

Error: "Invalid certificate"
Cause: Origin server has no SSL
Fix: Install SSL on origin or use Flexible mode (not recommended)
```

### Cache Not Working

```
Check:
1. Page Rules order (top = highest priority)
2. Cache-Control headers from origin
3. Cookies (Cloudflare bypasses cache if cookies present)
4. Query strings (cache varies by query string)

Debug:
curl -I https://example.com/page.html | grep -i cf-cache
# cf-cache-status: HIT (cached)
# cf-cache-status: MISS (not cached)
# cf-cache-status: BYPASS (cache disabled)
```

## Pricing Tiers

```
Free ($0/month):
✅ Unlimited DDoS protection
✅ CDN
✅ Free SSL
✅ 3 page rules
✅ Basic analytics (24h)
❌ No SLA
❌ No image optimization

Pro ($20/month):
✅ Everything in Free
✅ 20 page rules
✅ Image optimization
✅ Mobile optimization
✅ Analytics (30 days)

Business ($200/month):
✅ Everything in Pro
✅ 50 page rules
✅ Advanced DDoS
✅ WAF (Web Application Firewall)
✅ PCI compliance

Enterprise (Custom):
✅ Everything in Business
✅ Custom rules/configs
✅ 24/7 support
✅ Custom SSL
✅ 100% uptime SLA
```

## Best Practices

```javascript
// ✅ Use "Proxied" for web traffic
A    example.com    192.0.2.1    ☁️ Proxied

// ✅ Use "DNS Only" for mail, SSH, FTP
MX   example.com    mail.host    🔘 DNS Only
A    ssh            192.0.2.1    🔘 DNS Only

// ✅ Enable Always Use HTTPS
// ✅ Use Full (Strict) SSL mode
// ✅ Enable Brotli compression
// ✅ Set appropriate cache TTLs
// ✅ Purge cache after deployments

// ❌ Don't proxy non-HTTP services
// ❌ Don't use Flexible SSL (insecure)
// ❌ Don't cache user-specific content
// ❌ Don't cache without testing
```

## References

- [Cloudflare Documentation](https://developers.cloudflare.com/)
- [Cloudflare Speed Test](https://speed.cloudflare.com/)
- [Community Forum](https://community.cloudflare.com/)
- [Status Page](https://www.cloudflarestatus.com/)

---

## Summary

**Cloudflare:** Global network providing CDN, security, and DNS services.

**Core Features:**
- **CDN:** Cache content globally for speed
- **DDoS Protection:** Block attacks automatically
- **SSL:** Free certificates
- **DNS:** Fast 1.1.1.1 resolver

**Free Tier:** Generous—suitable for most websites.

**Setup:**
1. Add site to Cloudflare
2. Update nameservers at registrar
3. Configure SSL (Full Strict)
4. Set page rules for caching

**Quick Win:** Free SSL + DDoS protection + global CDN for any website.

**Rule of thumb:** Proxy web traffic (☁️), DNS-only for mail/SSH (🔘). Use Full (Strict) SSL. Cache static assets, bypass cache for dynamic content.