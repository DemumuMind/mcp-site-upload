# Python automation (optional, non-runtime)

This folder contains Python-only automation helpers.

## Scope

- ✅ Reporting / ops automation
- ✅ Catalog enrichment / validation helpers
- ❌ Next.js app runtime logic

## Setup (uv)

```bash
cd tools/python
uv sync
```

## Commands

```bash
# Catalog enrichment preview
uv run python scripts/catalog_enrich.py --dry-run

# Ops report snapshot
uv run python scripts/ops_report.py --output docs/python-ops-report.md
```
