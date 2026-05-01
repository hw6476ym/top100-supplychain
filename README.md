# MAG7 Atomic Supply Chain Command Center

A premium static intelligence dashboard for MAG7 supply chains, designed to be more informative through layered narratives, concentration analytics, and material-level linkage interpretation.

## What is improved (deep-detail upgrade)
- Added `data/materials.json` with importance, substitution difficulty, recovery horizon, and strategic interpretation fields.
- Upgraded material explorer to compute:
  - exposed companies,
  - total tracked volume,
  - largest supplier concentration,
  - strategic implication text.
- Upgraded company deep dive to include top 3 risk drivers from the 12-factor vector.
- Upgraded shared-linkage table with systemic implication text (simultaneous multi-company disruption logic).
- Upgraded scenario panel with proxy severity ranking and analyst-style interpretation.
- Added explicit company-focused supplier network visualization with criticality narratives.

## Data files
- `data/companies.json`
- `data/materialLedger.json`
- `data/materials.json`
- `data/scenarios.json`
- `data/tradeBenchmarks.json` (global trade/market proxy context)

## Validation and deploy
- `scripts/validate-data.js` checks required fields for all datasets.
- `.github/workflows/deploy-pages.yml` runs validation first, then deploys to GitHub Pages.

## Local run
```bash
python -m http.server 8000
```
Open `http://localhost:8000`.

## Disclaimer
Data is simulated/prototype for educational analytics, not investment advice.
For decision use, replace with audited procurement, customs, and contract data.


## Trade volume context
Material panels now include benchmark trade/market volumes and values to provide global context beyond company-specific ledger flows.
