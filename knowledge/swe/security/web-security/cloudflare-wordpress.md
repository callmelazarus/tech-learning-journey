# Summary

**What we did:** Set up Cloudflare as a CDN/security layer for a website

**Why:** 
- Faster load times (content cached globally)
- DDoS protection
- Free SSL management
- Reduced server load on InMotion

---

# Glossary

**DNS (Domain Name System):** Phone book for the internet - translates `website.name` to server IP `216.x.x.x`

**Nameservers:** Servers that store DNS records and answer "where does this domain point?"

**DNS Records:**
- **A Record:** Points domain to IP address
- **CNAME:** Alias pointing to another domain
- **MX:** Mail server routing
- **TXT:** Verification/security data

**Proxy (Orange Cloud):** Traffic routes through Cloudflare first (caching, security)

**DNS Only (Gray Cloud):** Direct connection, bypasses Cloudflare

**CDN (Content Delivery Network):** Distributed servers that cache your site closer to visitors

---

# Steps Taken

1. Created Cloudflare account, imported DNS records
2. Set website records to proxied (orange), admin/email to DNS only (gray)
3. Changed nameservers at Squarespace: InMotion → Cloudflare
4. Verified DNSSEC off
5. Now waiting for DNS propagation

---

# Flow Comparison

**Old:** Visitor → Squarespace DNS → InMotion nameservers → InMotion server → Site

**New:** Visitor → Squarespace DNS → Cloudflare nameservers → Cloudflare CDN (cache/security) → InMotion server → Site