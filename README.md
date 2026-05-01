# Top 100 Company Supply Chain Intelligence Platform

A serious static intelligence dashboard prototype (simulated data) that explains supply-chain risk from company strategy down to suppliers, materials, regions, chokepoints, and scenario implications.

## What this platform does
- Executive Risk Command Center with top-level risk KPIs
- Company deep dive with analyst narratives
- Multi-level supply stack (company → segment → system → supplier → region → material → risk)
- Supplier network explorer
- Atomic input explorer
- Risk heatmap with explanation panel
- Scenario simulator with first-order and second-order effects
- Sankey supply-chain flow
- Sector view and watchlist
- CEO-style executive explanation panel

## Data model (simulated/prototype)
- `data/companies.json`
- `data/materials.json`
- `data/materialLedger.json`
- `data/scenarios.json`
- `data/tradeBenchmarks.json`

## Deploy and validation
- Data schema check: `scripts/validate-data.js`
- GitHub Pages deployment workflow: `.github/workflows/deploy-pages.yml`

## Run locally
```bash
python -m http.server 8000
```
Open `http://localhost:8000`.

## How to explain this project in class
1. Start with the Executive Command Center to show where aggregate risk is concentrated.
2. Select one company (e.g., Nvidia or Tesla) and walk through the deep-dive narrative.
3. Use the supply stack + Sankey to show bottom-up dependencies.
4. Use the supplier network and atomic input explorer to explain shared chokepoints.
5. Trigger scenarios to explain first-order vs second-order effects.
6. Conclude with the watchlist and strategic actions.

## Disclaimer
Educational prototype with simulated data. Not investment advice.
