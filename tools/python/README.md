# Python automation (optional, non-runtime)

This folder contains Python-only automation helpers.

## Scope

- Reporting and ops automation
- Catalog enrichment and validation helpers
- Optional Scrapy-based registry crawling
- Not used by Next.js runtime logic

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
uv run python scripts/ops_report.py --output ../../docs/python-ops-report.md

# Scrapy registry crawl snapshot
uv run scrapy crawl mcp_registry -O ../../docs/mcp-registry-scrapy.json
```

## Scrapy environment

- `MCP_SCRAPY_REGISTRY_URL` (optional): override registry endpoint.
- `MCP_SCRAPY_DEDUPE_BY_SLUG` (optional, default `1`): keep one latest entry per slug.
