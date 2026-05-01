# MAG7 Atomic Supply Chain Command Center

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
