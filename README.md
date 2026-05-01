# MAG7 Atomic Supply Chain Command Center

This repository now merges all improvement streams into a single deploy-ready static intelligence platform.

## Merged capability set
- Executive company risk cards + ranking
- Deep-dive risk radar + chain narrative + sankey
- Atomic material explorer with ledger table
- Supplier-route linkage map
- Shared supplier-route concentration clustering
- Scenario simulator with channel + beneficiaries
- Provenance/confidence-aware data records

## Data architecture
- `data/companies.json`
- `data/materialLedger.json`
- `data/scenarios.json`
- `js/linkageEngine.js` for shared-linkage aggregation

## Deploy-ready workflow
GitHub Actions now has two stages:
1. **validate-data**: runs `node scripts/validate-data.js`
2. **deploy**: publishes to GitHub Pages only if validation passes

Workflow file:
- `.github/workflows/deploy-pages.yml`

## Local run
```bash
python -m http.server 8000
```
Open `http://localhost:8000`

## Data disclaimer
All numbers are simulated/prototype demonstration values (not investment advice).
For decision use, replace with audited procurement, customs, and contract data.

## Target Pages URL
`https://hw6476ym.github.io/supplychain_NASDAQ100/`
