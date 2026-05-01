# MAG7 Atomic Supply Chain Command Center

A premium company-level intelligence dashboard mapping the physical backbone of the AI economy for **Apple, Microsoft, Nvidia, Amazon, Alphabet, Meta, Tesla**.

## Data validation and reproducibility

This repo validates all `data/*.json` records in CI before GitHub Pages deploy.

### What gets validated

- JSON parse and top-level array structure.
- Required `provenance` and `confidence` fields on each record.
- Required `as_of_date` (`YYYY-MM-DD`) and freshness threshold.
- SHA-256 checksum generation for every JSON data file.

### Run validation locally

```bash
node scripts/validate-data.js
```

Optional freshness override:

```bash
MAX_DATA_AGE_DAYS=30 node scripts/validate-data.js
```

On success, checksums are written to:

- `data/checksums.sha256`

## GitHub Actions workflow

`.github/workflows/deploy-pages.yml` has two jobs:

1. `validate-data` (runs first)
2. `deploy` (runs only if `validate-data` succeeds)

This guarantees stale or incomplete data cannot be deployed and that data artifacts are fingerprinted for reproducible dashboard states.

## Run locally

```bash
python -m http.server 8000
```

Open `http://localhost:8000`.
