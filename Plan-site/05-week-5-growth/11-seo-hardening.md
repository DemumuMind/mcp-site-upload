# 11 - SEO Hardening for Core Pages

## Goal

Improve discoverability and indexing quality for MCP-related intent pages.

## Tasks

- [ ] Audit and normalize metadata for `/mcp`, `/how-to-use`, categories, tools.
- [ ] Add/validate structured data where appropriate.
- [ ] Improve internal linking between home, catalog, guides, and detail pages.
- [ ] Validate sitemap and robots consistency with route reality.

## Done When

- [ ] No duplicate/contradictory metadata across key pages.
- [ ] Structured data validates without critical errors.
- [ ] Internal link graph supports crawl depth for target pages.

## Verification

- Lighthouse SEO checks (spot sample)
- Rich results/schema validator
- `npm run smoke:check -- <url>`

## Dependencies

- `01-pr-hygiene-and-scope-split.md`

