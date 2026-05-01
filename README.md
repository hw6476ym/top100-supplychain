 (cd "$(git rev-parse --show-toplevel)" && git apply --3way <<'EOF' 
diff --git a/README.md b/README.md
new file mode 100644
index 0000000000000000000000000000000000000000..3845853840699ec8defaa70fc0b84a19f64f5010
--- /dev/null
+++ b/README.md
@@ -0,0 +1,62 @@
+# MAG7 Atomic Supply Chain Command Center
+
+A premium company-level intelligence dashboard mapping the physical backbone of the AI economy for:
+**Apple, Microsoft, Nvidia, Amazon, Alphabet, Meta, Tesla**.
+
+## Scope (what this dashboard does)
+This project maps supply chains from top strategy to bottom-layer physical constraints:
+
+**Company → Segment → Product/System → Component/Supplier → Region/Facility → Raw Material/Input → Chokepoint → Risk Driver → Strategic Implication**
+
+This is explicitly **not** a country trade dashboard.
+
+## What is now modeled
+- Executive Command Center with per-company risk and resilience cards
+- Deep dive narrative with full-chain storytelling
+- Full 12-factor risk radar per company
+- Sankey flow mapping to bottom-layer inputs/chokepoints
+- Supplier network explorer (company/supplier/material node classes)
+- Atomic Input Explorer for 30 critical materials/components
+- Cross-company heatmap with click-to-explain logic
+- Scenario simulator with severity ranking + channel + possible winners
+- Strategic analyst takeaway panel
+
+## Data model
+`app.js` includes structured objects for:
+- `companies`
+- `suppliers`
+- `materials`
+- `regions`
+- `riskFactors`
+- `scenarios`
+- `sankeyFlows`
+
+## Disclaimer
+- Data is simulated/prototype data for education and analytical demonstration.
+- Not investment advice.
+
+## Run locally
+```bash
+python -m http.server 8000
+```
+Open: `http://localhost:8000`
+
+## GitHub Pages
+Includes:
+- `.github/workflows/deploy-pages.yml`
+- `.nojekyll`
+
+After pushing to `main` and enabling Pages via Actions, expected URL:
+`https://hw6476ym.github.io/supplychain_NASDAQ100/`
+
+## Ideas to make it even more comprehensive (next iteration)
+1. Add explicit Tier-2/3 supplier drill-down and path tracing per clicked node.
+2. Add facility-level coordinates and true route overlays (ports, straits, rail, air hubs).
+3. Add dynamic scenario sliders (severity/time horizon/inventory buffers).
+4. Add BOM-weighted material intensity per product line.
+5. Add confidence scores and source annotations for each dependency edge.
+6. Add historical snapshots to compare risk posture by quarter.
+
+
+## Precision note
+For decision-grade use, replace simulated ledger values with audited procurement data (contract volumes, realized prices, supplier invoices, and customs data).
 
EOF
)