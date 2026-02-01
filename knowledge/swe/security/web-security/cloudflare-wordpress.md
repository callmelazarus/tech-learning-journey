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

---

Question: How can cloudflare get in front of this traffic? is it because squarespace nameservers are now pointing to cloudeflare?



# Exactly Right!

**Yes - it's all because of the nameserver change.**

---

# How It Works:

1. **Visitor types `sola.network` in browser**

2. **Browser asks:** "Where is sola.network?"

3. **Squarespace (registrar) says:** "Ask Cloudflare's nameservers" ← *This is the key*

4. **Cloudflare's nameservers respond:** "sola.network is at this IP... but route through us first"

5. **Traffic flows through Cloudflare**, then to InMotion

---

# The Critical Piece:

**Nameservers control who answers DNS queries.**

- When nameservers were InMotion's → InMotion gave the IP, traffic went direct
- Now nameservers are Cloudflare's → Cloudflare gives *their* IP for proxied records, intercepts traffic

**For proxied (orange) records:** Cloudflare returns *Cloudflare's IP*, not InMotion's IP directly

**For DNS only (gray) records:** Cloudflare returns InMotion's actual IP, traffic goes direct

---

# Analogy:

**Squarespace = Property deed** (proves you own the domain)

**Nameservers = GPS coordinator** (decides what address to give when someone asks for directions)

You just changed the GPS coordinator from InMotion to Cloudflare.