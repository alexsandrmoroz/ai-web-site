# Webflow API Setup

## GitHub Secrets Required

Add this secret in **GitHub → Settings → Secrets and variables → Actions**:

| Secret | Description |
|--------|-------------|
| `WEBFLOW_API_TOKEN` | Your Webflow API token (see below) |

> **Note:** `WEBFLOW_SITE_ID` is hardcoded in the workflow as `659feba459c4ac5ccfc3a195` (TestSite).

---

## Get WEBFLOW_API_TOKEN

1. Go to [webflow.com/dashboard/account/integrations](https://webflow.com/dashboard/account/integrations)
2. Click **Generate API token**
3. Name it (e.g. `GitHub Actions`)
4. Scopes: **Read/Write** for **Sites**, **Pages**, **CMS**
5. Copy the token and add it as `WEBFLOW_API_TOKEN` in GitHub Secrets

---

## How It Works

The workflow `.github/workflows/sync-to-webflow.yml` triggers automatically when:
- `embed-snippets/webflow-head.html` changes on `main`
- `embed-snippets/webflow-footer-script.html` changes on `main`

It then:
1. Reads the head/footer embed files
2. Calls the Webflow API to update the site's **Custom Code** (head + footer)
3. Publishes the Webflow site

You can also trigger it manually via **GitHub → Actions → Sync Custom Code to Webflow → Run workflow**.
