# Web Performance Metrics: Complete Overview

Web performance metrics are measurements that quantify how fast and responsive a website feels to users. Core Web Vitals—introduced by Google—focus on three key aspects: loading (LCP), interactivity (INP), and visual stability (CLS). These metrics directly impact user experience and SEO rankings. Think of them like vital signs at a doctor's office—just as heart rate, blood pressure, and temperature indicate health, these metrics indicate your website's performance health.

## Key Points

- **LCP (Largest Contentful Paint):** Measures loading speed of main content
- **INP (Interaction to Next Paint):** Measures responsiveness to user interactions
- **CLS (Cumulative Layout Shift):** Measures visual stability during loading
- **FCP (First Contentful Paint):** When first content appears on screen
- **TTFB (Time to First Byte):** Server response time

## High-Level Overview

### What Are Web Performance Metrics?

Web performance metrics are standardized measurements that track how users experience your website. They capture different aspects of the loading process, from server response to final rendering, helping developers identify bottlenecks and optimize user experience.

**Core concept:** These metrics translate technical performance into user-perceived experience. A fast server response means nothing if the page layout keeps shifting while loading.

### Why They Matter

- **User Experience:** 53% of mobile users abandon sites that take over 3 seconds to load
- **SEO Impact:** Google uses Core Web Vitals as ranking factors
- **Conversion Rates:** Amazon found 100ms delay = 1% revenue loss
- **Business Metrics:** Better performance = higher engagement and conversions

### The Three Core Web Vitals

Google prioritizes three metrics that represent the complete user experience:

1. **LCP (Largest Contentful Paint)** - Loading performance
2. **INP (Interaction to Next Paint)** - Responsiveness
3. **CLS (Cumulative Layout Shift)** - Visual stability

## Detailed Metrics Breakdown

### 1. Largest Contentful Paint (LCP)

**What it measures:** Time until the largest visible content element (image, video, or text block) is rendered on screen.

```
Timeline:
0ms ────────────────────── 2500ms ─────────────── 4000ms ──────────→
     [Hero image loads]      ↑                      ↑
                            Good                   Poor
                          (< 2.5s)               (> 4.0s)

Good: < 2.5 seconds
Needs Improvement: 2.5 - 4.0 seconds
Poor: > 4.0 seconds
```

**What counts as LCP:**
- `<img>` elements
- `<image>` elements inside `<svg>`
- `<video>` elements (poster image)
- Background images loaded via CSS `url()`
- Block-level text elements (paragraphs, headings)

**Example scenario:**
```html
<!-- This hero image is likely your LCP element -->
<section class="hero">
  <img src="hero-banner.jpg" alt="Hero" />  <!-- LCP candidate -->
  <h1>Welcome to Our Site</h1>
</section>

<!-- Not counted (too small or not visible) -->
<header>
  <img src="logo.png" alt="Logo" />  <!-- Usually too small -->
</header>
```

**Common causes of poor LCP:**
- Large, unoptimized images (5MB image when 200KB would suffice)
- Slow server response times (TTFB > 600ms)
- Render-blocking JavaScript and CSS
- Client-side rendering (React/Vue without SSR)

**How to improve:**
```html
<!-- ❌ Bad: Large unoptimized image -->
<img src="hero.jpg" />

<!-- ✅ Good: Optimized, modern formats, priority hint -->
<img 
  src="hero.webp"
  srcset="hero-400.webp 400w, hero-800.webp 800w, hero-1200.webp 1200w"
  sizes="(max-width: 600px) 400px, (max-width: 1200px) 800px, 1200px"
  alt="Hero"
  loading="eager"
  fetchpriority="high"
/>

<!-- Preload critical images -->
<link rel="preload" as="image" href="hero.webp" />
```

### 2. Interaction to Next Paint (INP)

**What it measures:** Time from user interaction (click, tap, keystroke) until the browser paints the next frame showing visual feedback.

```
User clicks button → [Processing] → Visual update appears
                     ←─ INP ─→

Good: < 200ms
Needs Improvement: 200 - 500ms
Poor: > 500ms
```

**Example interactions:**
- Clicking a button to open a menu
- Typing in a search box
- Tapping a card to expand details
- Selecting a checkbox

**Common causes of poor INP:**
- Heavy JavaScript execution blocking the main thread
- Long-running event handlers
- Large DOM updates
- Excessive re-renders in React/Vue

**How to improve:**
```javascript
// ❌ Bad: Blocking the main thread
button.addEventListener('click', () => {
  // Processes 10,000 items synchronously
  const result = processLargeDataset(data);
  updateUI(result);
});

// ✅ Good: Break work into chunks
button.addEventListener('click', async () => {
  // Show immediate feedback
  button.classList.add('loading');
  
  // Yield to main thread
  await new Promise(resolve => setTimeout(resolve, 0));
  
  // Process in chunks
  const result = await processInChunks(data);
  updateUI(result);
  button.classList.remove('loading');
});

// ✅ Good: Use Web Workers for heavy computation
button.addEventListener('click', () => {
  const worker = new Worker('process-worker.js');
  worker.postMessage(data);
  
  worker.onmessage = (e) => {
    updateUI(e.data);
  };
});

// ✅ Good: Debounce rapid inputs
const searchInput = document.getElementById('search');
const debouncedSearch = debounce((value) => {
  performSearch(value);
}, 300);

searchInput.addEventListener('input', (e) => {
  debouncedSearch(e.target.value);
});
```

### 3. Cumulative Layout Shift (CLS)

**What it measures:** Sum of all unexpected layout shifts that occur during the page's lifetime. A layout shift happens when visible elements change position.

```
Good: < 0.1
Needs Improvement: 0.1 - 0.25
Poor: > 0.25

CLS Score = (Impact Fraction) × (Distance Fraction)
```

**Visual example:**
```
User about to click "Accept"
┌──────────────────┐
│  [Accept]        │  ← Button is here
└──────────────────┘

Ad loads, button shifts down
┌──────────────────┐
│  [Advertisement] │  ← Ad appears
│  [Accept]        │  ← Button moved (user clicks ad by accident!)
└──────────────────┘

Result: Poor user experience, layout shift recorded
```

**Common causes of poor CLS:**
- Images without dimensions (browser doesn't know how much space to reserve)
- Ads, embeds, or iframes without reserved space
- Fonts loading and changing text size (FOIT/FOUT)
- Content injected above existing content

**How to fix:**
```html
<!-- ❌ Bad: No dimensions, causes layout shift -->
<img src="product.jpg" alt="Product" />

<!-- ✅ Good: Explicit dimensions prevent shift -->
<img 
  src="product.jpg" 
  alt="Product"
  width="800"
  height="600"
  style="aspect-ratio: 4/3;"
/>

<!-- ❌ Bad: Ad slot without reserved space -->
<div id="ad-slot"></div>

<!-- ✅ Good: Reserve space for ad -->
<div id="ad-slot" style="min-height: 250px;">
  <!-- Ad loads here -->
</div>

<!-- ✅ Good: Font loading strategy -->
<style>
  @font-face {
    font-family: 'CustomFont';
    src: url('font.woff2') format('woff2');
    font-display: swap; /* Or 'optional' to prevent layout shift */
  }
</style>
```

### 4. First Contentful Paint (FCP)

**What it measures:** Time when the first DOM content (text, image, SVG) is rendered on screen.

```
Timeline:
0ms ───────────── 1800ms ────────────── 3000ms ──────────→
    [First pixel]    ↑                    ↑
                   Good                  Poor
                 (< 1.8s)              (> 3.0s)

Good: < 1.8 seconds
Needs Improvement: 1.8 - 3.0 seconds
Poor: > 3.0 seconds
```

**What counts:**
- First text rendered
- First image rendered
- First SVG element
- Non-white `<canvas>` elements

**Difference from LCP:**
- **FCP:** First *anything* appears ("page is loading")
- **LCP:** Main content appears ("page is useful")

### 5. Time to First Byte (TTFB)

**What it measures:** Time from navigation start until the browser receives the first byte of the response.

```
User clicks link → [DNS] → [Connection] → [Server Processing] → First byte received
                  ←────────────── TTFB ─────────────────────→

Good: < 800ms
Needs Improvement: 800 - 1800ms
Poor: > 1800ms
```

**What affects TTFB:**
- Server processing time
- Database query performance
- Network latency
- CDN effectiveness

**How to improve:**
```javascript
// ❌ Bad: Slow server-side processing
app.get('/api/products', async (req, res) => {
  const products = await db.query('SELECT * FROM products');
  const enriched = await enrichProductsWithDetails(products); // Slow!
  res.json(enriched);
});

// ✅ Good: Optimized queries and caching
app.get('/api/products', async (req, res) => {
  const cacheKey = 'products:all';
  const cached = await cache.get(cacheKey);
  
  if (cached) {
    return res.json(cached);
  }
  
  const products = await db.query(
    'SELECT * FROM products WHERE active = true LIMIT 50'
  );
  
  await cache.set(cacheKey, products, { ttl: 300 }); // 5 min cache
  res.json(products);
});

// ✅ Good: Use CDN for static assets
// Instead of: https://yourserver.com/logo.png
// Use: https://cdn.yoursite.com/logo.png
```

## Similarities Between Metrics

All web performance metrics share common characteristics:

### 1. User-Centric Focus

All metrics measure real user experience, not just technical benchmarks.

```javascript
// All metrics reflect what users actually experience
LCP: "When can I see the main content?"
INP: "Is the page responding to my clicks?"
CLS: "Is the page stable or jumping around?"
FCP: "Is anything happening?"
```

### 2. Measured in Real User Monitoring (RUM)

All metrics should be tracked with real user data, not just lab testing.

```javascript
// Using web-vitals library
import { onLCP, onINP, onCLS } from 'web-vitals';

onLCP((metric) => {
  console.log('LCP:', metric.value);
  sendToAnalytics({ metric: 'LCP', value: metric.value });
});

onINP((metric) => {
  console.log('INP:', metric.value);
  sendToAnalytics({ metric: 'INP', value: metric.value });
});

onCLS((metric) => {
  console.log('CLS:', metric.value);
  sendToAnalytics({ metric: 'CLS', value: metric.value });
});
```

### 3. Measurable with Browser APIs

All metrics use the Performance API under the hood.

```javascript
// Performance Observer API (basis for all metrics)
const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    console.log(entry.name, entry.startTime);
  }
});

observer.observe({ entryTypes: ['paint', 'largest-contentful-paint'] });
```

### 4. Impact SEO and Rankings

Google uses all Core Web Vitals as ranking signals.

```
Good Core Web Vitals = Better search rankings
Poor Core Web Vitals = Lower search rankings

All three must be "Good" for maximum SEO benefit
```

## Differences Between Metrics

### 1. What They Measure

```
LCP:  Loading performance (time-based)
      → "How long until main content appears?"

INP:  Responsiveness (time-based)
      → "How long until page responds to clicks?"

CLS:  Visual stability (score-based, not time)
      → "How much does the layout shift?"

FCP:  First paint (time-based)
      → "How long until anything appears?"

TTFB: Server performance (time-based)
      → "How long until server responds?"
```

### 2. When They're Measured

```
Timeline:
0ms ─── TTFB ─── FCP ─────── LCP ────────────────────────→
         ↑        ↑           ↑              ↑
       Server   First     Main content   Throughout
      responds  pixel      appears      page lifetime
                                            ↑
                                         INP & CLS
                                     (measured ongoing)
```

### 3. Units of Measurement

```javascript
// Time-based metrics (milliseconds)
LCP: 2300  // 2.3 seconds
INP: 150   // 150 milliseconds
FCP: 1200  // 1.2 seconds
TTFB: 400  // 400 milliseconds

// Score-based metric (unitless)
CLS: 0.05  // Lower is better (not time)
```

### 4. What Causes Poor Scores

```
LCP issues:
- Large unoptimized images
- Slow server response
- Render-blocking resources

INP issues:
- Heavy JavaScript on main thread
- Large DOM updates
- Unoptimized event handlers

CLS issues:
- Images without dimensions
- Dynamic content injection
- Web fonts causing reflow

TTFB issues:
- Slow server processing
- No caching
- Poor network infrastructure
```

### 5. How to Fix Them

```javascript
// LCP: Optimize resources
<link rel="preload" as="image" href="hero.jpg" />
<img loading="eager" fetchpriority="high" src="hero.jpg" />

// INP: Optimize JavaScript
// Break up long tasks, use web workers, debounce inputs

// CLS: Reserve space
<img width="800" height="600" src="image.jpg" />
<div style="min-height: 250px;" id="ad-slot"></div>

// TTFB: Optimize server
// Use caching, CDN, optimize database queries
```

## Common Pitfalls

- Optimizing for lab scores only (use real user data)
- Ignoring mobile performance (often worse than desktop)
- Not setting image dimensions (causes CLS)
- Loading too many third-party scripts (impacts all metrics)
- Not measuring after deployment (metrics change in production)
- Focusing on one metric while ignoring others

## Practical Applications

- E-commerce sites (faster LCP = higher conversions)
- News/media sites (good CLS prevents accidental clicks)
- SaaS applications (good INP = better user experience)
- Mobile-first sites (all metrics critical on slower connections)
- SEO optimization (Core Web Vitals affect rankings)

## References

- [Web Vitals Official Site](https://web.dev/vitals/)
- [Chrome User Experience Report](https://developers.google.com/web/tools/chrome-user-experience-report)
- [PageSpeed Insights](https://pagespeed.web.dev/)
- [Lighthouse Documentation](https://developer.chrome.com/docs/lighthouse/)
- [web-vitals JavaScript Library](https://github.com/GoogleChrome/web-vitals)

---

## Greater Detail

### Measuring Metrics in Your Application

```javascript
// Install: npm install web-vitals

// measure.js
import { onLCP, onINP, onCLS, onFCP, onTTFB } from 'web-vitals';

function sendToAnalytics({ name, value, rating, id }) {
  // Send to your analytics service
  fetch('/analytics', {
    method: 'POST',
    body: JSON.stringify({
      metric: name,
      value: value,
      rating: rating, // 'good', 'needs-improvement', 'poor'
      id: id,
      url: window.location.href,
      userAgent: navigator.userAgent
    })
  });
}

// Measure all Core Web Vitals
onLCP(sendToAnalytics);
onINP(sendToAnalytics);
onCLS(sendToAnalytics);
onFCP(sendToAnalytics);
onTTFB(sendToAnalytics);

// Example output:
// { name: 'LCP', value: 2340, rating: 'good' }
// { name: 'INP', value: 156, rating: 'good' }
// { name: 'CLS', value: 0.02, rating: 'good' }
```

### Real-World Optimization Example

```javascript
// Before: Poor LCP (5.2s), Poor CLS (0.32)

// ❌ Problems:
// - Large hero image (3MB)
// - No image dimensions
// - Render-blocking CSS
// - Ads loaded without space reservation

// HTML Before
<head>
  <link rel="stylesheet" href="styles.css" />
  <script src="analytics.js"></script>
</head>
<body>
  <img src="hero-original.jpg" alt="Hero" />
  <div id="ad-slot"></div>
</body>

// After: Good LCP (1.8s), Good CLS (0.04)

// ✅ Solutions:
<head>
  <!-- Critical CSS inline -->
  <style>
    /* Critical above-the-fold styles */
    .hero { min-height: 400px; }
  </style>
  
  <!-- Preload LCP image -->
  <link rel="preload" as="image" href="hero-optimized.webp" />
  
  <!-- Defer non-critical CSS -->
  <link rel="preload" as="style" href="styles.css" 
        onload="this.rel='stylesheet'" />
  
  <!-- Defer analytics -->
  <script defer src="analytics.js"></script>
</head>
<body>
  <!-- Optimized image with dimensions -->
  <img 
    src="hero-optimized.webp"
    srcset="hero-400.webp 400w, hero-800.webp 800w"
    sizes="(max-width: 768px) 400px, 800px"
    alt="Hero"
    width="800"
    height="400"
    loading="eager"
    fetchpriority="high"
  />
  
  <!-- Reserved space for ad -->
  <div id="ad-slot" style="min-height: 250px; background: #f0f0f0;">
    <!-- Ad loads here -->
  </div>
</body>

// Results:
// LCP: 5.2s → 1.8s (65% improvement)
// CLS: 0.32 → 0.04 (87% improvement)
```

### Performance Monitoring Dashboard

```typescript
// analytics.ts - Track metrics over time

interface MetricData {
  metric: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  timestamp: number;
  url: string;
  device: 'mobile' | 'desktop';
}

class PerformanceMonitor {
  private metrics: MetricData[] = [];
  
  track(data: Omit<MetricData, 'timestamp' | 'device'>) {
    const metricData: MetricData = {
      ...data,
      timestamp: Date.now(),
      device: this.getDeviceType()
    };
    
    this.metrics.push(metricData);
    this.sendToBackend(metricData);
  }
  
  private getDeviceType(): 'mobile' | 'desktop' {
    return /mobile|android|iphone/i.test(navigator.userAgent)
      ? 'mobile'
      : 'desktop';
  }
  
  private async sendToBackend(data: MetricData) {
    try {
      await fetch('/api/metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    } catch (error) {
      console.error('Failed to send metrics:', error);
    }
  }
  
  getAverages() {
    const grouped = this.metrics.reduce((acc, m) => {
      if (!acc[m.metric]) acc[m.metric] = [];
      acc[m.metric].push(m.value);
      return acc;
    }, {} as Record<string, number[]>);
    
    return Object.entries(grouped).map(([metric, values]) => ({
      metric,
      average: values.reduce((a, b) => a + b) / values.length,
      count: values.length
    }));
  }
}

// Usage
const monitor = new PerformanceMonitor();

onLCP((metric) => {
  monitor.track({
    metric: 'LCP',
    value: metric.value,
    rating: metric.rating,
    url: window.location.href
  });
});

// After some time
console.log(monitor.getAverages());
// [
//   { metric: 'LCP', average: 2145, count: 50 },
//   { metric: 'INP', average: 123, count: 50 },
//   { metric: 'CLS', average: 0.03, count: 50 }
// ]
```

### Framework-Specific Optimizations

```javascript
// React: Optimize for INP
import { useState, useTransition } from 'react';

function SearchComponent() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isPending, startTransition] = useTransition();
  
  const handleSearch = (value: string) => {
    setQuery(value); // Immediate update
    
    // Mark expensive update as non-urgent
    startTransition(() => {
      const filtered = expensiveFilter(data, value);
      setResults(filtered);
    });
  };
  
  return (
    <input 
      value={query}
      onChange={(e) => handleSearch(e.target.value)}
      disabled={isPending}
    />
  );
}

// Next.js: Optimize for LCP
import Image from 'next/image';

export default function Hero() {
  return (
    <Image
      src="/hero.jpg"
      alt="Hero"
      width={1200}
      height={600}
      priority  // Loads with high priority
      placeholder="blur"  // Shows blur while loading
    />
  );
}

// Vue: Optimize for CLS
<template>
  <img 
    :src="imageSrc"
    :width="800"
    :height="600"
    :style="{ aspectRatio: '4/3' }"
    alt="Product"
  />
</template>
```

### Testing Metrics Locally

```bash
# Using Lighthouse CLI
npm install -g lighthouse

# Test your site
lighthouse https://yoursite.com --view

# Output includes all Core Web Vitals with scores

# Using PageSpeed Insights API
curl "https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=https://yoursite.com&strategy=mobile"

# Chrome DevTools
# 1. Open DevTools (F12)
# 2. Go to Lighthouse tab
# 3. Click "Analyze page load"
# 4. View Core Web Vitals report
```

### Best Practices Summary

```typescript
// ✅ Optimize LCP:
// 1. Use optimized image formats (WebP, AVIF)
// 2. Implement lazy loading (except LCP image)
// 3. Use CDN for faster delivery
// 4. Preload critical resources
// 5. Minimize server response time

// ✅ Optimize INP:
// 1. Break up long tasks (use setTimeout, requestIdleCallback)
// 2. Debounce/throttle frequent events
// 3. Use Web Workers for heavy computation
// 4. Minimize JavaScript execution time
// 5. Avoid synchronous layout recalculations

// ✅ Optimize CLS:
// 1. Always specify image dimensions
// 2. Reserve space for dynamic content
// 3. Use font-display: optional for web fonts
// 4. Avoid inserting content above existing content
// 5. Use transform animations (not top/left)

// ✅ Optimize TTFB:
// 1. Use CDN
// 2. Implement caching (Redis, CDN cache)
// 3. Optimize database queries
// 4. Use HTTP/2 or HTTP/3
// 5. Enable compression (Gzip, Brotli)

// ✅ General best practices:
// 1. Measure real user data, not just lab data
// 2. Test on real devices (especially mobile)
// 3. Monitor continuously, not just once
// 4. Set performance budgets
// 5. Automate testing in CI/CD
```