# MAG7 Atomic Supply Chain Command Center

Interactive dashboard for exploring supply-chain risk and resilience across Apple, Microsoft, Nvidia, Amazon, Alphabet, Meta, and Tesla.

## Run locally

```bash
python -m http.server 8000
```

Open `http://localhost:8000`.

## Architecture

The app is split into focused browser modules (all loaded from `js/main.js`):

- `js/dataStore.js`: data loading + in-memory caching. Exposes `loadData()` for risk factors, companies, materials, scenarios, and the material ledger JSON.
- `js/state.js`: shared UI selection state for company, material, and scenario.
- `js/charts.js`: Plotly chart rendering helpers (ranking, heatmap, company charts, common layout helpers).
- `js/linkage.js`: linkage visualizations and table rendering (sankey flow, network graph, shared critical-input table).
- `js/scenarios.js`: scenario propagation UI rendering for scenario impact chart + narrative panel.
- `js/main.js`: bootstrap logic, DOM bindings, and orchestration across all modules.

## Notes

- Data is simulated/prototype data for educational demonstration.
- Not investment advice.
