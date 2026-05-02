# Top 100 Company Supply Chain Intelligence Platform

A serious static intelligence dashboard prototype for company-level supply-chain analysis (simulated data).

## Clean architecture (single active entrypoint)
- `index.html` loads only `js/main.js`.
- `app.js` has been removed to eliminate stale/duplicate logic.
- `js/dataStore.js` is the single data loader.

## Data sources (single source of truth)
All active dashboard content is loaded from `data/*.json`:
- `data/companies.json` (Top 25 seeded; model supports Top 100)
- `data/materials.json`
- `data/suppliers.json`
- `data/scenarios.json`
- `data/relationships.json`
- `data/materialLedger.json`

## Visible product sections
- Executive Command Center
- Company Deep Dive (with CEO-style panel)
- Atomic Input Explorer
- Supplier Network Explorer
- Sankey Flow View
- Risk Heatmap
- Scenario Simulator
- Sector View
- Watchlist
- Strategic Insight Panel

## Run locally
```bash
python -m http.server 8000
```
Open `http://localhost:8000`.

## Deploy
GitHub Pages workflow: `.github/workflows/deploy-pages.yml`.
Validation gate: `node scripts/validate-data.js`.

## How to explain this project in class
1. Open Executive Command Center for portfolio-level exposure summary.
2. Pick a company and walk the deep-dive + supply-chain stack narrative.
3. Show supplier network and Sankey to explain where physical bottlenecks live.
4. Use heatmap and scenarios to show first-order vs second-order effects.
5. End with watchlist and strategic moves.

## Disclaimer
Educational prototype with simulated data. Not investment advice.
