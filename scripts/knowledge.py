#!/usr/bin/env python3
import argparse, pathlib, re, sys, textwrap
from datetime import datetime

ROOT = pathlib.Path("knowledge")

CATEGORIES = {
    "swe": {
        "frontend": ["react", "typescript", "css-tailwind"],
        "backend": ["java-spring", "python-django", "node-express"],
        "languages": ["javascript", "python", "java", "rust"],
        "devops": ["git", "ci-cd", "docker-k8s", "cloud-aws", "shell"],
        "security": ["web-security", "authentication", "cryptography"],
        "misc": []
    },
    "ml": {
        "fundamentals": ["linear-regression", "decision-trees", "clustering"],
        "data-engineering": ["preprocessing", "feature-engineering", "pipelines"],
        "mlops": ["model-training", "model-deployment", "monitoring"],
        "frameworks": ["sklearn", "tensorflow", "pytorch"],
        "misc": []
    },
    "ai": {
        "llms": ["prompting", "fine-tuning", "evals", "safety-redteaming"],
        "nlp-classic": ["embeddings", "transformers", "seq2seq"],
        "agents": ["langchain", "crewai", "orchestration"],
        "applications": ["chatbots", "search", "retrieval-augmented-gen"],
        "misc": []
    },
}

def slug(s:str)->str:
    s = s.strip().lower()
    s = re.sub(r"[^a-z0-9]+","-",s).strip("-")
    return re.sub(r"-{2,}","-",s)

def ensure_tree():
    for area, groups in CATEGORIES.items():
        for group, topics in groups.items():
            base = ROOT / area / group
            base.mkdir(parents=True, exist_ok=True)
            (base / ".gitkeep").touch()
            for t in topics:
                (base / t).mkdir(parents=True, exist_ok=True)
                (base / t / ".gitkeep").touch()
    (ROOT / "INDEX.md").touch()

def add_topic(area:str, group:str, topic:str, lang:str="python"):
    area = area.lower()
    group = group.lower()
    tslug = slug(topic)
    dest = ROOT / area / group / tslug
    if not dest.exists():
        dest.mkdir(parents=True, exist_ok=True)
    (dest / "examples").mkdir(exist_ok=True)
    (dest / ".gitkeep").touch()

    # README
    readme = dest / "README.md"
    if not readme.exists():
        readme.write_text(textwrap.dedent(f"""\
        # {topic}

        **Area:** {area} / **Group:** {group}  
        **Created:** {datetime.now().strftime("%Y-%m-%d")}

        ## Difficulty
        (easy|medium|hard)

        ## Why this matters
        (short note)

        ## Key concepts
        - …

        ## Pitfalls
        - …

        ## Further reading
        - …

        """), encoding="utf-8")

    # Example
    ext = {"python":"py","typescript":"ts","javascript":"js","bash":"sh"}.get(lang, "txt")
    ex = dest / "examples" / f"main.{ext}"
    if not ex.exists():
        code = {
            "python": 'print("hello from example")\n',
            "javascript": 'console.log("hello from example")\n',
            "typescript": 'console.log("hello from example")\n',
            "bash": 'echo "hello from example"\n'
        }.get(lang, "Example placeholder.\n")
        ex.write_text(code, encoding="utf-8")

    print(f"✅ Added topic: {dest}")

def main():
    ap = argparse.ArgumentParser(description="Knowledge base scaffolder")
    sub = ap.add_subparsers(dest="cmd", required=True)

    p_boot = sub.add_parser("bootstrap", help="Create the base directory structure")
    p_boot.add_argument("--root", default="knowledge")

    p_add = sub.add_parser("add", help="Add a new topic directory + README + example")
    p_add.add_argument("area", choices=["swe","ml","ai"])
    p_add.add_argument("group", help="e.g., frontend, devops, llms, mlops, misc")
    p_add.add_argument("topic", help="Free-text topic title")
    p_add.add_argument("--lang", default="python", help="example language (python|typescript|javascript|bash)")

    args = ap.parse_args()
    global ROOT
    ROOT = pathlib.Path(args.root) if hasattr(args, "root") else ROOT

    if args.cmd == "bootstrap":
        ensure_tree()
        print(f"✅ Bootstrapped under {ROOT}/")
    elif args.cmd == "add":
        ensure_tree()
        add_topic(args.area, args.group, args.topic, lang=args.lang)

if __name__ == "__main__":
    main()
