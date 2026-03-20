# Webflow API Setup

## GitHub Secrets Required

Add in **GitHub → Settings → Secrets and variables → Actions**:

| Secret | Description |
|--------|-------------|
| `WEBFLOW_API_TOKEN` | Webflow API token (Site Settings → Integrations → API Access) |
| `WEBFLOW_SITE_ID` | Webflow Site ID (Project Settings → General) |

## How It Works

On every push to `main` that changes `embed-snippets/webflow-head.html` or
`embed-snippets/webflow-footer-script.html`, the workflow:

1. Reads both embed files
2. Calls `PUT /v2/sites/{id}/custom-code` to update Webflow head + footer
3. Calls `POST /v2/sites/{id}/publish` to publish the site

Can also be triggered manually via GitHub Actions → Run workflow.
