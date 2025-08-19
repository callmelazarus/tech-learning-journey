#!/usr/bin/env python3
import re, pathlib, subprocess, sys
from datetime import datetime

ROOT = pathlib.Path(__file__).resolve().parent.parent

DATE_H = r"^##\s*(\d{4}-\d{2}-\d{2})\s*$"
BLOCK = r"(?:(?!^##\s*\d{4}-\d{2}-\d{2}\s*$).)*"  # up to next date heading

def parse_yearly_journal(md_path: pathlib.Path, target_date: str | None):
    text = md_path.read_text(encoding="utf-8")

    # If no date passed, default to today
    if not target_date:
        target_date = datetime.now().strftime("%Y-%m-%d")

    # Grab the section for that date
    sec_re = re.compile(
        rf"{DATE_H}\n({BLOCK})",
        re.MULTILINE | re.DOTALL
    )
    section = None
    for m in sec_re.finditer(text):
        date = m.group(1)
        body = m.group(2)
        if date == target_date:
            section = body
            break

    if not section:
        return {"date": target_date, "topics": [], "notes": []}

    def parse_list(heading: str):
        rx = re.compile(rf"^{heading}:\s*\n({BLOCK})", re.IGNORECASE | re.MULTILINE)
        mm = rx.search(section)
        if not mm:
            return []
        bullets = re.findall(r"^\s*-\s*(.+?)\s*$", mm.group(1), re.MULTILINE)
        return [b.strip() for b in bullets if b.strip()]

    topics = parse_list("Topics")
    notes  = parse_list("Notes")
    return {"date": target_date, "topics": topics, "notes": notes}

def add_topic(area, group, topic, lang="python"):
    subprocess.run(
        ["python", "scripts/knowledge.py", "add", area, group, topic, "--lang", lang],
        check=True
    )

def route(topic: str):
    t = topic.lower()
    if any(k in t for k in ["react", "ag grid", "frontend", "tsx", "typescript"]):
        return ("swe", "frontend", "typescript")
    if any(k in t for k in ["git", "docker", "kubernetes", "ci/cd", "ci-cd", "shell", "zsh", "brew", "homebrew"]):
        return ("swe", "devops", "bash")
    if any(k in t for k in ["java", "spring"]):
        return ("swe", "backend", "java")
    if any(k in t for k in ["django", "python"]):
        return ("swe", "backend", "python")
    if any(k in t for k in ["langchain", "agent", "crewai"]):
        return ("ai", "agents", "python")
    if any(k in t for k in ["rag", "prompt", "fine-tuning", "evals", "transformer", "embedding"]):
        return ("ai", "llms", "python")
    if any(k in t for k in ["sklearn", "regression", "clustering", "pytorch", "tensorflow"]):
        return ("ml", "frameworks", "python")
    return ("swe", "misc", "python")

def main():
    if len(sys.argv) < 2:
        print("Usage: study_agent.py journal/2025.md [--date YYYY-MM-DD]")
        sys.exit(1)

    md_path = pathlib.Path(sys.argv[1])
    target_date = None
    if len(sys.argv) >= 4 and sys.argv[2] == "--date":
        target_date = sys.argv[3]

    data = parse_yearly_journal(md_path, target_date)
    if not data["topics"]:
        print(f"No topics found for {data['date']}. Add a 'Topics:' list under '## {data['date']}'.")
        sys.exit(0)

    for t in data["topics"]:
        area, group, lang = route(t)
        add_topic(area, group, t, lang)

    # Optional: commit
    try:
        subprocess.run(["git", "add", "-A"], cwd=ROOT, check=True)
        subprocess.run(["git", "commit", "-m", f"study: {data['date']} topics"], cwd=ROOT, check=True)
        print("✅ committed changes")
    except subprocess.CalledProcessError:
        print("ℹ️ nothing to commit")

if __name__ == "__main__":
    main()
