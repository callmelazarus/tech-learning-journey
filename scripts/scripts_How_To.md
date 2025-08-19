# knowledge.py 

## Purpose
Constructs the tree of directories


### 1. First time: bootstrap the full tree

This builds all the **SWE / ML / AI** sub-folders with `.gitkeep` files so Git tracks them.

```bash
python scripts/knowledge.py bootstrap
```

After running, you’ll see:

```
knowledge/
├─ swe/
│  ├─ frontend/
│  ├─ backend/
│  ├─ languages/
│  ├─ devops/
│  ├─ security/
│  └─ misc/
├─ ml/
│  ├─ fundamentals/
│  ├─ data-engineering/
│  ├─ mlops/
│  ├─ frameworks/
│  └─ misc/
├─ ai/
│  ├─ llms/
│  ├─ nlp-classic/
│  ├─ agents/
│  ├─ applications/
│  └─ misc/
└─ INDEX.md
```

---

### 2. Add a new topic (with README + examples)

General pattern:

```bash
python scripts/knowledge.py add <area> <group> "Your Topic Title" --lang <language>
```

Where:

* `<area>` is `swe`, `ml`, or `ai`
* `<group>` matches one of the sub-folders (`frontend`, `backend`, `llms`, `mlops`, etc.)
* `"Your Topic Title"` is free-text (will be slugified into the folder name)
* `--lang` picks example file type (`python`, `typescript`, `javascript`, `bash`)

---

### Examples

#### SWE → Frontend → React

```bash
python scripts/knowledge.py add swe frontend "AG Grid getRowData vs rowData" --lang typescript
```

Creates:

```
knowledge/swe/frontend/ag-grid-getrowdata-vs-rowdata/
├─ README.md
└─ examples/
   └─ main.ts
```

#### SWE → DevOps → Git

```bash
python scripts/knowledge.py add swe devops "Git rebase vs merge" --lang bash
```

Creates:

```
knowledge/swe/devops/git-rebase-vs-merge/
├─ README.md
└─ examples/
   └─ main.sh
```

#### AI → Agents → LangChain

```bash
python scripts/knowledge.py add ai agents "LangChain basics" --lang python
```

Creates:

```
knowledge/ai/agents/langchain-basics/
├─ README.md
└─ examples/
   └─ main.py
```

---

### 3. Commit the results

```bash
git add -A
git commit -m "docs: add new knowledge topics"
```

---

⚡️ Pro tip: if you find yourself adding the same groups over and over (e.g. always `swe frontend` for React stuff), I can help bake a **keyword → category routing table** into `knowledge.py` so you can just run:

```bash
python scripts/knowledge.py auto "React hooks vs useEffect"
```

Would you like me to extend your script with that `auto` command so you don’t have to type `swe frontend …` every time?

# study_agent.py

Here’s a **concise README** you can drop in at `scripts/README.md` or the project root to document `study_agent`:

---

# 📘 Study Agent

`study_agent.py` turns your **journal entries** into structured knowledge notes.
It parses a yearly Markdown journal, generates topic directories under `knowledge/`, and commits them to your repo.

---

## ✍️ Journal Format

`journal/2025.md`

```md
# 2025 Journal

## 2025-08-18
Topics:
- AG Grid getRowData vs rowData
- Git rebase vs merge
- LangChain basics

Notes:
- struggled with grid state
- diverged branches warning
```

---

## 🚀 Usage

### 1. Bootstrap knowledge tree (one-time)

```bash
python scripts/knowledge.py bootstrap
```

### 2. Process today’s entry

```bash
python scripts/study_agent.py journal/2025.md
```

### 3. Process a specific date

```bash
python scripts/study_agent.py journal/2025.md --date 2025-08-18
```

---

## 📂 Output Structure

For the example above, you’ll get:

```
knowledge/
├─ swe/frontend/ag-grid-getrowdata-vs-rowdata/
│  ├─ README.md
│  └─ examples/main.ts
├─ swe/devops/git-rebase-vs-merge/
│  ├─ README.md
│  └─ examples/main.sh
├─ ai/agents/langchain-basics/
│  ├─ README.md
│  └─ examples/main.py
```

Each topic has:

* `README.md` → starter notes template
* `examples/` → small code snippet (language inferred)

---

## 🔧 Routing Logic

* **React/TypeScript/Frontend** → `swe/frontend`
* **Git/Docker/Zsh/CI/CD** → `swe/devops`
* **Java/Spring** → `swe/backend/java`
* **Python/Django** → `swe/backend/python`
* **LangChain/Agents** → `ai/agents`
* **RAG/Prompt/Fine-tuning** → `ai/llms`
* Others → `swe/misc`

---

## ✅ Commit

The agent stages and commits generated files:

```bash
git add -A && git commit -m "study: 2025-08-18 topics"
```

---

Would you like me to also include a **Quickstart section** at the top (copy-paste 3 commands to set up and run), so it’s even easier for future you?
