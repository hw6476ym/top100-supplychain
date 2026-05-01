# MAG7 Atomic Supply Chain Command Center

<<<<<<< codex/build-mag7-atomic-supply-chain-dashboard-65uv6o
A premium company-level intelligence dashboard mapping the physical backbone of the AI economy for:
**Apple, Microsoft, Nvidia, Amazon, Alphabet, Meta, Tesla**.

## Scope (what this dashboard does)
This project maps supply chains from top strategy to bottom-layer physical constraints:

**Company → Segment → Product/System → Component/Supplier → Region/Facility → Raw Material/Input → Chokepoint → Risk Driver → Strategic Implication**

This is explicitly **not** a country trade dashboard.

## What is now modeled
- Executive Command Center with per-company risk and resilience cards
- Deep dive narrative with full-chain storytelling
- Full 12-factor risk radar per company
- Sankey flow mapping to bottom-layer inputs/chokepoints
- Supplier network explorer (company/supplier/material node classes)
- Atomic Input Explorer for 30 critical materials/components
- Cross-company heatmap with click-to-explain logic
- Scenario simulator with severity ranking + channel + possible winners
- Strategic analyst takeaway panel

## Data model
`app.js` includes structured objects for:
- `companies`
- `suppliers`
- `materials`
- `regions`
- `riskFactors`
- `scenarios`
- `sankeyFlows`

## Disclaimer
- Data is simulated/prototype data for education and analytical demonstration.
- Not investment advice.

## Run locally
```bash
python -m http.server 8000
```
Open: `http://localhost:8000`

## GitHub Pages
Includes:
- `.github/workflows/deploy-pages.yml`
- `.nojekyll`

After pushing to `main` and enabling Pages via Actions, expected URL:
`https://hw6476ym.github.io/supplychain_NASDAQ100/`

## Ideas to make it even more comprehensive (next iteration)
1. Add explicit Tier-2/3 supplier drill-down and path tracing per clicked node.
2. Add facility-level coordinates and true route overlays (ports, straits, rail, air hubs).
3. Add dynamic scenario sliders (severity/time horizon/inventory buffers).
4. Add BOM-weighted material intensity per product line.
5. Add confidence scores and source annotations for each dependency edge.
6. Add historical snapshots to compare risk posture by quarter.
=======
A premium, company-level supply-chain intelligence dashboard for the Magnificent 7:
Apple, Microsoft, Nvidia, Amazon, Alphabet (Google), Meta, and Tesla.

## What this project is
This dashboard models physical supply-chain dependencies from strategy to atomic/material inputs:

**Company → segment → product/system → component → supplier → region/chokepoint → input/material → risk driver → strategic implication**.

It is intentionally separate from a country-trade dashboard and focuses on company-level risk architecture.

## Important disclaimer
- Data is **simulated/prototype data** for educational and analytical demonstration.
- This is **not investment advice**.

## Features
- Executive Command Center cards + ranking chart
- Company Deep Dive (profile, risk radar, regional chart, sankey flow, supplier network, critical input table)
- Atomic Input Explorer
- Supplier Network Explorer
- Risk Heatmap (clickable cell explanation)
- Scenario Simulator
- Strategic Insight panel

## Tech stack
- Static site only (`index.html`, `styles.css`, `app.js`)
- Vanilla JavaScript
- Plotly CDN
- No backend

## Run locally
Open the project in a static server, e.g.:

```bash
python -m http.server 8000
```

Then visit `http://localhost:8000`.

## GitHub Pages deployment
This repo includes:
- `.github/workflows/deploy-pages.yml`
- `.nojekyll`

Push to `main`, enable Pages in repository settings using GitHub Actions source, and the site publishes automatically.

Expected URL:
`https://hw6476ym.github.io/supplychain_NASDAQ100/`
>>>>>>> main
