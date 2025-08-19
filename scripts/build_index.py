#!/usr/bin/env python3
import pathlib

# run script with: `python scripts/build_index.py`

ROOT = pathlib.Path("knowledge")

def build_index():
    lines = ["# 📚 Knowledge Index\n"]

    for area_dir in sorted(ROOT.iterdir()):
        if not area_dir.is_dir() or area_dir.name.startswith("."):
            continue
        lines.append(f"## {area_dir.name.upper()}")
        for group_dir in sorted(area_dir.iterdir()):
            if not group_dir.is_dir() or group_dir.name.startswith("."):
                continue
            lines.append(f"- {group_dir.name.capitalize()}")
            for topic_dir in sorted(group_dir.iterdir()):
                if not topic_dir.is_dir() or topic_dir.name.startswith("."):
                    continue
                readme = topic_dir / "README.md"
                if readme.exists():
                    title = topic_dir.name.replace("-", " ").capitalize()
                    rel_path = readme.relative_to(ROOT)
                    lines.append(f"  - [{title}]({rel_path.as_posix()})")
        lines.append("")  # blank line between areas

    (ROOT / "INDEX.md").write_text("\n".join(lines), encoding="utf-8")
    print("✅ knowledge/INDEX.md updated")

if __name__ == "__main__":
    build_index()
