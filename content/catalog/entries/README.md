# Catalog entries (disk source)

Put optional catalog server overrides here as JSON files:

- Path pattern: `content/catalog/entries/<slug>.json`
- Purpose:
  - add local entries without DB migration
  - override Supabase/mock fields by `slug`
- Loader: `lib/catalog/disk-content.ts`

## Minimal schema

```json
{
  "name": "My MCP Server",
  "slug": "my-mcp-server",
  "description": "Short server description.",
  "serverUrl": "https://example.com/sse",
  "category": "Developer Tools",
  "authType": "oauth",
  "tags": ["official"],
  "verificationLevel": "community",
  "status": "active",
  "tools": ["list_items", "create_item"]
}
```

Any omitted optional fields are filled with defaults by the loader.
