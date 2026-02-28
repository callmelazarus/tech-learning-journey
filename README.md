# ~/tech-learning-journey

A personal knowledge base documenting learnings across software engineering, AI, machine learning, and more — displayed as a minimal, programming-focused static web app.

---

## Running the App

The frontend is a zero-dependency static site. There are two steps: generate the data file, then open it in a browser.

### 1. Generate the data file

The site reads all `.md` files from `knowledge/` and bundles them into a single `frontend/data.js` file.

```bash
cd frontend
python3 generate_data.py
```

This writes `frontend/data.js`. Re-run it any time you add or update a knowledge file.

> **Requires:** Python 3.7+

### 2. Open in a browser

**Option A — directly (simplest):**

```bash
open frontend/index.html        # macOS
xdg-open frontend/index.html   # Linux
start frontend/index.html      # Windows
```

**Option B — local server (recommended, avoids any CORS quirks):**

```bash
# Python (built-in)
cd frontend && python3 -m http.server 8080
# then visit http://localhost:8080

# Node (if you have npx)
cd frontend && npx serve .
# then visit the URL printed in the terminal
```

---

## Project Structure

```
tech-learning-journey/
├── knowledge/              # All markdown learning notes
│   ├── swe/                # Software engineering
│   ├── ai/                 # Artificial intelligence
│   ├── ml/                 # Machine learning
│   └── misc/               # Everything else
├── frontend/
│   ├── index.html          # App shell
│   ├── style.css           # Dark, monospace theme
│   ├── app.js              # SPA logic (search, sidebar, routing)
│   ├── data.js             # Auto-generated — do not edit manually
│   └── generate_data.py    # Script that builds data.js
├── scripts/                # Study and indexing utilities
└── journal/                # Personal learning journal
```

---

## Adding Knowledge

1. Create a `.md` file anywhere under `knowledge/`.
2. Start the file with a `# Title` heading — this becomes the article title.
3. Re-run `generate_data.py` to pick up the new file.

---

## Features

- Full-text search (`ctrl+k`)
- Collapsible sidebar navigation
- Syntax-highlighted code blocks
- Hash-based routing (shareable article URLs)
- No build step, no framework dependencies
