# MAG7 Atomic Supply Chain Command Center

Interactive static dashboard for MAG7 supply-chain intelligence, from company strategy to material-level linkage.

## What was fully upgraded
- Added external data loading (`data/materialLedger.json`) instead of all-inline ledger records.
- Added a linkage engine module (`js/linkageEngine.js`) to detect shared supplier+route clusters.
- Added map + shared-cluster table to explicitly show when multiple companies rely on the same supplier and medium/path at different volumes and costs.
- Added provenance-style fields to ledger records (`source_type`, `confidence_score`, `as_of_date`).

## Data warning
Current records are simulated planning data for demonstration. Not investment advice.

## Run locally
Use a local server (module imports + fetch require it):

```bash
python -m http.server 8000
```

Open `http://localhost:8000`.

## Deploy
GitHub Pages workflow is in `.github/workflows/deploy-pages.yml`.
Expected URL:
`https://hw6476ym.github.io/supplychain_NASDAQ100/`
