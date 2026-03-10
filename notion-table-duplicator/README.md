# notion-table-duplicator

A GitHub Actions automation that runs every day at **4:00 AM PST** and duplicates the top-most table on a specified Notion page. The copy is inserted directly below the original table. Useful for maintaining a daily snapshot log of a Notion table.

---

## How it works

1. Connects to the Notion API using your integration token.
2. Fetches all top-level blocks on your target page.
3. Finds the very first `table` block.
4. Reads all rows from that table.
5. Appends an exact copy of the table directly after the original.

---

## Setup

### 1. Create a Notion Integration

1. Go to [https://www.notion.so/profile/integrations](https://www.notion.so/profile/integrations)
2. Click **New integration** and give it a name (e.g. `table-duplicator`).
3. Set the capabilities: **Read content** and **Update content** (Insert content is needed to append blocks).
4. Click **Save**. Copy the **Internal Integration Secret** — this is your `NOTION_TOKEN`.

### 2. Share your Notion page with the integration

1. Open the target Notion page.
2. Click the **...** menu (top right) → **Connect to** → select your integration.
3. The integration now has access to that page.

### 3. Get your Notion Page ID

The Page ID is the 32-character hex string at the end of the page URL:

```
https://www.notion.so/My-Page-Title-<PAGE_ID>
```

Copy the `<PAGE_ID>` part (with or without hyphens — both formats work).

### 4. Add GitHub Secrets

In this repository, go to **Settings → Secrets and variables → Actions → New repository secret** and add:

| Secret name      | Value                                      |
|------------------|--------------------------------------------|
| `NOTION_TOKEN`   | Your Notion integration secret             |
| `NOTION_PAGE_ID` | The 32-char ID of your target Notion page  |

---

## Running manually

You can trigger the workflow at any time without waiting for the schedule:

1. Go to the **Actions** tab of this repository.
2. Select **Daily Notion Table Duplication**.
3. Click **Run workflow** → **Run workflow**.

---

## Schedule

The workflow runs daily at `0 12 * * *` (UTC), which equals:

| Timezone | Time         |
|----------|--------------|
| PST      | 4:00 AM      |
| PDT      | 5:00 AM      |
| UTC      | 12:00 PM     |
| EST      | 7:00 AM      |

> GitHub Actions cron jobs run in UTC. During US daylight saving time (March–November), the local time will be 5:00 AM PDT instead of 4:00 AM PST.

---

## Local development

```bash
# Install dependencies
pip install -r requirements.txt

# Set env vars
export NOTION_TOKEN="secret_..."
export NOTION_PAGE_ID="your-page-id"

# Run the script
python scripts/duplicate_table.py
```
