# Content infrastructure (Blog + Catalog)

This project now supports a section-oriented content layout inspired by `sereja.tech`:

- section-level metadata in `content/<section>/_index.json`
- section item storage in predictable subfolders

## 1) Section metadata

Used by page metadata and heroes.

- `content/blog/_index.json`
- `content/catalog/_index.json`

Schema is handled by `lib/content/section-index.ts`:

```json
{
  "section": "blog",
  "locale": {
    "en": {
      "title": "Blog",
      "description": "..."
    },
    "ru": {
      "title": "Блог",
      "description": "..."
    }
  }
}
```

## 2) Blog content

Blog posts continue to use existing JSON post files:

- `content/blog/posts/*.json`
- tags: `content/blog/tags.json`

Scaffold command:

```bash
npm run blog:new -- --slug my-post --title-en "My Post" --title-ru "Моя статья" --tags "ai,workflow"
```

## 3) Catalog content (disk source)

Catalog now supports optional disk entries:

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
