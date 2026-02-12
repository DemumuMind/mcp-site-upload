# Content infrastructure (section-based content)

This project supports a section-oriented content layout inspired by `sereja.tech`:

- section-level metadata in `content/<section>/_index.json`
- section item storage in predictable subfolders

## 1) Section metadata

Used by page metadata and hero blocks.

- `content/blog/_index.json`
- `content/catalog/_index.json`
- `content/categories/_index.json`
- `content/tools/_index.json`
- `content/mcp/_index.json`
- `content/how-to-use/_index.json`
- `content/how-to-use/paths.json` (structured setup scenarios, client reference, trust checks, troubleshooting, CTA rail)

Schema is handled by `lib/content/section-index.ts`:

```json
{
  "section": "blog",
  "locale": {
    "en": {
      "title": "Blog",
      "description": "..."
    }
  }
}
```

## 2) Blog content

Blog posts use JSON files:

- `content/blog/posts/*.json`
- tags: `content/blog/tags.json`

Scaffold command:

```bash
npm run blog:new -- --slug my-post --title-en "My Post" --tags "ai,workflow"
```

## 3) Catalog content (disk source)

Catalog supports optional disk entries:

- `content/catalog/entries/*.json`
- loader: `lib/catalog/disk-content.ts`
- merge point: `lib/servers.ts`

Priority rule:

1. Supabase (if available)
2. Disk overrides by matching `slug`
3. Mock servers fallback

Scaffold command:

```bash
npm run catalog:new -- --slug my-server --name "My Server" --auth oauth --category "Developer Tools" --tags "official" --tools "list_items,create_item"
```

Current real infrastructure entries included in this repo:

- `content/catalog/entries/openai-developer-docs.json`
- `content/catalog/entries/exa-search.json`
- `content/catalog/entries/playwright-browser-automation.json`
- `content/catalog/entries/chrome-devtools-inspector.json`
- `content/catalog/entries/local-filesystem-ops.json`

## 4) How-to-use content (structured page copy)

`/how-to-use` consumes a structured content file:

- `content/how-to-use/paths.json`
- loader: `lib/content/how-to-use.ts`

This enables:

- role-based setup paths (`quick_start`, `production_ready`)
- client setup reference without duplicated page blocks
- centralized trust/troubleshooting/CTA copy in EN
