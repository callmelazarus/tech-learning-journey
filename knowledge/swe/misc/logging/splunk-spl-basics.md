# Splunk SPL: Complete Overview

SPL (Search Processing Language) is Splunk's query language for **searching, filtering, transforming, and visualizing machine data**. Think of it as SQL for log files — but instead of querying structured tables, you're querying semi-structured events (logs, metrics, traces) that flow in as raw text. SPL is a pipeline-based language where you chain commands together with pipes (`|`), each command transforming the data for the next.

## Key Points

- **Pipeline Architecture:** Commands are chained with `|` — each command takes input from the previous and passes output to the next.
- **Search-First:** Every SPL query starts with a search, then refines with transformations.
- **Time-Oriented:** Splunk indexes data with timestamps. Time range is the single biggest factor in query performance.
- **Schema on Read:** Unlike databases, Splunk doesn't enforce a schema at ingest. You define structure at query time using field extractions.
- **Case Sensitivity:** Field *names* are case-sensitive. Field *values* in searches are case-insensitive by default.

## How SPL Works

Every SPL query follows a left-to-right pipeline. Data flows from the index through each command, getting filtered and transformed along the way.

```
index=web_logs status=500
    |  ← raw events matching the search
| stats count by uri_path
    |  ← table of uri_path + count
| sort -count
    |  ← sorted by count descending
| head 10
    ↓
  Top 10 URLs returning 500 errors
```

**Analogy:** SPL works like a factory assembly line. Raw materials (events) enter on one end, and each station (command) shapes, filters, or aggregates them until a finished product (result) comes out the other end.

## Step-by-Step Explanation & Examples

### 1. Basic Searching

The foundation of every SPL query — filtering raw events from the index.

```spl
# Search an index for events (simplest possible query)
index=web_logs

# Search for a keyword anywhere in the event
index=web_logs "connection refused"

# Filter by field values
index=web_logs status=500 method=POST

# Multiple values for a field (OR)
index=web_logs (status=500 OR status=503)

# Wildcard matching
index=web_logs uri_path="/api/v2/*"

# Exclude results
index=web_logs status!=200
index=web_logs NOT status=200

# Combine conditions
index=web_logs status=500 method=POST host="prod-web-*"
```

**How Splunk evaluates this:** Bare terms next to each other are implicitly `AND`. So `status=500 method=POST` means "events where status is 500 AND method is POST."

### 2. Time Filtering

Time range is the most important performance lever. Always constrain it.

```spl
# Using the time picker (most common — set in the UI)
index=web_logs status=500

# Inline time modifiers
index=web_logs status=500 earliest=-24h latest=now

# Relative time shortcuts
earliest=-1h          # last hour
earliest=-7d          # last 7 days
earliest=-30m         # last 30 minutes
earliest=@d           # since start of today
earliest=-1w@w        # since start of last week

# Specific time range
earliest="2025-03-01T00:00:00" latest="2025-03-02T00:00:00"
```

The `@` symbol snaps to a time boundary. `@d` means "round down to the start of the day." `-1d@d` means "start of yesterday."

### 3. Fields and Field Extraction

Splunk auto-extracts some fields (like `host`, `source`, `sourcetype`, `_time`). For custom fields, you extract them at search time.

```spl
# See what fields Splunk auto-extracted
index=web_logs | fields

# Keep only specific fields (improves performance)
index=web_logs | fields host, status, uri_path, response_time

# Remove fields
index=web_logs | fields - _raw, _time

# Extract custom fields with regex
index=app_logs
| rex field=_raw "user=(?<username>\w+)"
| table _time, username

# Extract with key=value pattern
index=app_logs
| rex field=_raw "duration=(?<duration_ms>\d+)ms"
| eval duration_s = duration_ms / 1000
```

**`_raw`** is the entire raw event text. **`rex`** uses regex to carve out named capture groups as new fields — similar to regex in any other language, but the `?<fieldname>` syntax creates a Splunk field on the fly.

### 4. Stats Commands (Aggregation)

`stats` is the workhorse command — it aggregates events into a table, like `GROUP BY` in SQL.

```spl
# Count events by status code
index=web_logs
| stats count by status

# Multiple aggregations
index=web_logs
| stats count, avg(response_time) as avg_response, max(response_time) as max_response by uri_path

# Count distinct values
index=web_logs
| stats dc(client_ip) as unique_visitors by uri_path

# Sum, min, max, median, percentile
index=web_logs
| stats sum(bytes) as total_bytes,
        median(response_time) as p50,
        perc95(response_time) as p95
  by host

# Count with a time dimension (timechart is better for this — see below)
index=web_logs
| stats count by status, host
```

Common stats functions:

| Function | Description | Example |
|---|---|---|
| `count` | Number of events | `stats count by host` |
| `dc(field)` | Distinct count | `stats dc(user) as unique_users` |
| `avg(field)` | Average | `stats avg(response_time)` |
| `sum(field)` | Sum | `stats sum(bytes)` |
| `min(field)` / `max(field)` | Min / Max | `stats max(cpu_pct) by host` |
| `median(field)` | Median (50th percentile) | `stats median(duration)` |
| `perc95(field)` | 95th percentile | `stats perc95(latency)` |
| `values(field)` | List of distinct values | `stats values(status) by host` |
| `latest(field)` | Most recent value | `stats latest(version) by service` |

### 5. Timechart (Time-Series Aggregation)

`timechart` is like `stats` but automatically buckets results by time — built for line charts and trend analysis.

```spl
# Request count over time
index=web_logs
| timechart count

# Error count over time, split by status
index=web_logs status>=400
| timechart count by status

# Average response time per host, in 5-minute buckets
index=web_logs
| timechart span=5m avg(response_time) by host

# p95 latency over time
index=web_logs
| timechart span=1h perc95(response_time) as p95_latency
```

The `span` parameter controls bucket size. Splunk auto-selects a span if you don't specify one, but being explicit gives you predictable results.

### 6. Eval (Computed Fields)

`eval` creates new fields or transforms existing ones — like adding a calculated column in a spreadsheet.

```spl
# Create a new field
index=web_logs
| eval response_s = response_time / 1000

# Conditional logic (if/case)
index=web_logs
| eval status_category = case(
    status < 300, "success",
    status < 400, "redirect",
    status < 500, "client_error",
    status >= 500, "server_error"
  )
| stats count by status_category

# String manipulation
index=web_logs
| eval short_uri = substr(uri_path, 1, 30)

# Combine fields
index=web_logs
| eval request = method . " " . uri_path

# Math
index=web_logs
| eval error_rate = round((error_count / total_count) * 100, 2)

# Coalesce (first non-null value)
index=app_logs
| eval user = coalesce(authenticated_user, anonymous_id, "unknown")
```

### 7. Where (Post-Search Filtering)

`where` filters results *after* transformations — like SQL's `HAVING` vs `WHERE`.

```spl
# Filter aggregated results
index=web_logs
| stats count by uri_path
| where count > 1000

# String functions in where
index=web_logs
| where like(uri_path, "/api/%")

# Comparison operators
index=web_logs
| stats avg(response_time) as avg_rt by host
| where avg_rt > 500

# Null checking
index=web_logs
| where isnotnull(user_id)

# Regex matching
index=web_logs
| where match(uri_path, "^/api/v[0-9]+/users")
```

**Key difference from search-level filters:** The initial search (`index=web_logs status=500`) is evaluated at the indexer level and is fast. `where` runs after data is retrieved, so it's slower but more flexible (supports functions, computed fields, etc.).

### 8. Table, Rename, Sort (Output Formatting)

```spl
# Display specific fields as a table
index=web_logs
| stats count, avg(response_time) as avg_rt by uri_path, status
| table uri_path, status, count, avg_rt

# Rename fields for readability
index=web_logs
| stats count by uri_path
| rename uri_path as "URL Path", count as "Request Count"

# Sort results
index=web_logs
| stats count by uri_path
| sort -count           # descending (the - prefix)
| head 20               # top 20

# Sort ascending
| sort +response_time   # or just: sort response_time

# Sort by multiple fields
| sort -count, +uri_path
```

### 9. Transaction (Grouping Related Events)

`transaction` groups events that belong together — like grouping all log lines from a single user session or a single request flow across microservices.

```spl
# Group events by session ID
index=web_logs
| transaction session_id
| table session_id, duration, eventcount

# Group events with start/end conditions
index=app_logs
| transaction session_id startswith="login" endswith="logout"
| stats avg(duration) as avg_session_duration

# Set max time gap between events in a transaction
index=web_logs
| transaction client_ip maxspan=30m maxpause=5m
```

**When to use `transaction` vs `stats`:** `stats` is faster and preferred for simple aggregation. Use `transaction` when you need to correlate events that share a key and care about duration, event order, or grouping by start/end patterns.

### 10. Lookup (Enrichment)

Lookups let you join external data (CSV files, database tables) to your search results — like a `VLOOKUP` in a spreadsheet or a `JOIN` in SQL.

```spl
# Enrich events with data from a CSV lookup
# (assume status_codes.csv has columns: status, description)
index=web_logs
| lookup status_codes.csv status OUTPUT description
| table _time, status, description, uri_path

# Enrich with host metadata
index=web_logs
| lookup host_inventory.csv host OUTPUT team, environment
| stats count by team, environment

# Automatic lookup (defined in Splunk config, runs on every search)
# No explicit | lookup needed — fields appear automatically
```

### 11. Subsearch

A search within a search — the inner search runs first, and its results feed into the outer search. Like a subquery in SQL.

```spl
# Find all events from hosts that had errors
index=web_logs
  [ search index=web_logs status=500
    | dedup host
    | fields host ]

# The subsearch in brackets runs first, returning a list of hosts
# Then the outer search filters for events from those hosts

# Find users who accessed both endpoint A and endpoint B
index=web_logs uri_path="/api/payments"
  [ search index=web_logs uri_path="/api/admin"
    | dedup user_id
    | fields user_id ]
```

### 12. Common Full Queries (Real-World Patterns)

```spl
# Top 10 slowest endpoints
index=web_logs
| stats avg(response_time) as avg_rt, count by uri_path
| where count > 100
| sort -avg_rt
| head 10

# Error rate by service over time
index=app_logs
| eval is_error = if(log_level="ERROR", 1, 0)
| timechart span=5m avg(is_error) as error_rate by service

# Spike detection — find hosts with 3x their normal error rate
index=web_logs status>=500
| timechart span=1h count by host
| foreach *
  [ eval <<FIELD>> = if(<<FIELD>> > 3 * avg(<<FIELD>>), <<FIELD>>, null()) ]

# User activity timeline
index=web_logs user_id="u_12345"
| table _time, method, uri_path, status, response_time
| sort _time

# Compare this week to last week
index=web_logs status=500
| timechart span=1h count
| addtotals
| appendcols
  [ search index=web_logs status=500 earliest=-2w@w latest=-1w@w
    | timechart span=1h count as last_week_count ]
```

## SPL Command Cheat Sheet

| Command | Purpose | SQL Equivalent |
|---|---|---|
| `search` | Filter raw events | `WHERE` (on raw data) |
| `where` | Filter transformed results | `HAVING` |
| `stats` | Aggregate | `GROUP BY` + aggregate functions |
| `timechart` | Time-bucketed aggregation | `GROUP BY time_bucket` |
| `eval` | Computed fields | `SELECT field * 2 AS computed` |
| `rex` | Regex field extraction | N/A (regex in application code) |
| `table` | Select and display columns | `SELECT col1, col2` |
| `rename` | Rename fields | `AS` |
| `sort` | Order results | `ORDER BY` |
| `head` / `tail` | Limit results | `LIMIT` |
| `dedup` | Remove duplicates | `DISTINCT` |
| `lookup` | Enrich with external data | `JOIN` |
| `transaction` | Group related events | Self-`JOIN` with window functions |
| `chart` | Pivot-style aggregation | `PIVOT` |
| `top` / `rare` | Most/least common values | `ORDER BY count DESC LIMIT` |

## Common Pitfalls

- **Not constraining time range.** Searching `index=web_logs` across "All Time" can scan terabytes. Always set the narrowest time window possible — it's the biggest performance lever.
- **Using `transaction` when `stats` works.** `transaction` is resource-intensive because it holds events in memory. If you just need counts or averages by a key, `stats` is orders of magnitude faster.
- **Wildcards at the start of values.** `uri_path="*/users"` forces Splunk to scan every event. Leading wildcards kill performance. Trailing wildcards (`uri_path="/api/*"`) are fine.
- **Forgetting that search terms are implicit AND.** `status=500 status=200` returns nothing (an event can't be both). Use `OR`: `(status=500 OR status=200)`.
- **Case sensitivity confusion.** Field *names* like `Status` vs `status` are different. Field *values* are case-insensitive in search but case-sensitive in `where` and `eval`. Use `lower()` to normalize.
- **Over-using subsearch.** Subsearches have a 10,000 result limit and a 60-second timeout by default. For large joins, use `lookup` or `join` instead.

## Practical Applications

- **Incident Response:** "What happened at 3 AM?" — filter by time range, error codes, and affected hosts to reconstruct a timeline.
- **Performance Monitoring:** Track p95 latency, error rates, and throughput over time with `timechart`.
- **Security Analysis:** Detect anomalous login patterns, failed auth attempts, or unusual API access with `stats`, `transaction`, and `where`.
- **Business Analytics:** Count user signups, track feature usage, or measure conversion funnels from application logs.
- **Capacity Planning:** Trend resource utilization (CPU, memory, disk) over weeks or months to forecast infrastructure needs.

## References

- [Splunk Docs: Search Reference](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference)
- [Splunk Docs: SPL2 (next generation)](https://docs.splunk.com/Documentation/SplunkCloud/latest/SearchReference/AboutSPL2)
- [Splunk Quick Reference Guide (PDF)](https://www.splunk.com/en_us/resources/search-quick-reference-guide.html)
- [Splunk Lantern (Use Case Library)](https://lantern.splunk.com/)

---

## Greater Detail

### Advanced Concepts

- **Accelerated Data Models:** For dashboards that query frequently, data models with acceleration pre-compute summaries, making searches near-instant instead of scanning raw data every time.
- **`tstats` Command:** Queries indexed metadata and accelerated data models. Dramatically faster than `stats` for common patterns because it skips reading raw events. Use it for high-performance dashboards.
- **`map` Command:** Runs a search for each result of a previous search — like a for-each loop. Powerful but expensive. Use sparingly.
- **SPL2:** Splunk's next-generation query language, available in Splunk Cloud. It's more SQL-like with better syntax consistency, but classic SPL remains dominant in most environments.
- **Macros:** Reusable SPL snippets defined in Splunk settings. Call them with backticks: `` `my_error_search(500)` ``. Essential for DRY-ing up frequently used query patterns across dashboards and alerts.
- **Event Sampling:** For exploratory queries on massive datasets, use `| sample 1000` or set sampling in the search job inspector to get fast approximate results before running the full query.