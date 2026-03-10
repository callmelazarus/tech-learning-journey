"""
duplicate_table.py

Finds the top-most table on a Notion page and appends an exact duplicate
of it directly after the original. Designed to run daily via GitHub Actions.

Required environment variables:
  NOTION_TOKEN   — Notion integration secret (starts with "secret_")
  NOTION_PAGE_ID — 32-char hex ID of the target Notion page
"""

import os
import sys
from datetime import datetime, timezone
from notion_client import Client

NOTION_TOKEN = os.environ.get("NOTION_TOKEN")
NOTION_PAGE_ID = os.environ.get("NOTION_PAGE_ID")


def validate_env():
    missing = [v for v in ("NOTION_TOKEN", "NOTION_PAGE_ID") if not os.environ.get(v)]
    if missing:
        print(f"[ERROR] Missing required environment variables: {', '.join(missing)}")
        sys.exit(1)


def get_all_children(client: Client, block_id: str) -> list:
    """Paginate through all children of a block."""
    results = []
    cursor = None
    while True:
        kwargs = {"block_id": block_id}
        if cursor:
            kwargs["start_cursor"] = cursor
        response = client.blocks.children.list(**kwargs)
        results.extend(response["results"])
        if not response.get("has_more"):
            break
        cursor = response["next_cursor"]
    return results


def find_first_table(blocks: list) -> dict | None:
    """Return the first block with type 'table', or None."""
    for block in blocks:
        if block.get("type") == "table":
            return block
    return None


def build_table_row(row_block: dict) -> dict:
    """Build a new table_row block payload from an existing table_row block."""
    cells = row_block["table_row"]["cells"]
    # Deep-copy each cell's rich text to avoid mutating the original
    new_cells = []
    for cell in cells:
        new_cell = []
        for rich_text in cell:
            new_cell.append({
                "type": rich_text.get("type", "text"),
                "text": {
                    "content": rich_text.get("text", {}).get("content", ""),
                    "link": rich_text.get("text", {}).get("link"),
                },
                "annotations": rich_text.get("annotations", {
                    "bold": False,
                    "italic": False,
                    "strikethrough": False,
                    "underline": False,
                    "code": False,
                    "color": "default",
                }),
                "plain_text": rich_text.get("plain_text", ""),
            })
        new_cells.append(new_cell)
    return {
        "type": "table_row",
        "table_row": {"cells": new_cells},
    }


def build_duplicate_table(original_table: dict, row_blocks: list) -> dict:
    """
    Build the new table block payload (with children) that mirrors the original.
    """
    table_meta = original_table["table"]
    new_rows = [build_table_row(row) for row in row_blocks if row.get("type") == "table_row"]
    return {
        "type": "table",
        "table": {
            "table_width": table_meta["table_width"],
            "has_column_header": table_meta.get("has_column_header", False),
            "has_row_header": table_meta.get("has_row_header", False),
        },
        "children": new_rows,
    }


def main():
    validate_env()
    client = Client(auth=NOTION_TOKEN)

    print(f"[{datetime.now(timezone.utc).isoformat()}] Starting Notion table duplication...")
    print(f"  Page ID: {NOTION_PAGE_ID}")

    # 1. Get top-level blocks of the page
    page_blocks = get_all_children(client, NOTION_PAGE_ID)
    print(f"  Found {len(page_blocks)} top-level block(s) on the page.")

    # 2. Find the first (top-most) table
    first_table = find_first_table(page_blocks)
    if not first_table:
        print("[ERROR] No table found on the page. Nothing to duplicate.")
        sys.exit(1)

    table_id = first_table["id"]
    print(f"  Top-most table block ID: {table_id}")

    # 3. Fetch all rows of that table
    row_blocks = get_all_children(client, table_id)
    print(f"  Table has {len(row_blocks)} row(s).")

    # 4. Build the duplicate table payload
    duplicate = build_duplicate_table(first_table, row_blocks)

    # 5. Append the duplicate right after the original table
    client.blocks.children.append(
        block_id=NOTION_PAGE_ID,
        children=[duplicate],
        after=table_id,  # inserts immediately below the original top table
    )

    print(f"[{datetime.now(timezone.utc).isoformat()}] Done! Duplicate table inserted after block {table_id}.")


if __name__ == "__main__":
    main()
