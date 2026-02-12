# Blog Automation Guide

## What is automated now

Blog publishing is **Supabase-first**:

- **Primary:** `public.blog_posts` table in Supabase
- **Automatic fallback (if table is unavailable):** Supabase Storage bucket `blog-automation/posts/*.json`
- **Local/dev fallback:**
  - `content/blog/posts/*.json` — article files
  - `content/blog/tags.json` — tag catalog
  - `content/blog/research/*.json` — deep research packets

This removes the read-only filesystem blocker for production cron runs, even before DB migration is applied.

## Mandatory policy before article creation

Each article must pass deep research before publication:

1. Relevance check — only high-scoring sources
2. Freshness check — only recent sources
3. Diversity check — several domains
4. Corroboration check — repeated cross-source signals

If any check fails, publication is blocked.

## Admin workflow

Open `/admin/blog` and submit:

- topic
- optional angle
- slug
- EN title
- tags
- recency window in days
- max curated sources

The action runs deep research + verification, then persists to Supabase:

- first tries `blog_posts` table
- falls back to Storage bucket automatically if table is missing

If Supabase admin credentials are unavailable in local dev, it falls back to local JSON files.

## Scheduled auto-publishing (4+ posts/day)

- Endpoint: `GET/POST /api/blog/auto-publish`
- Auth: `Authorization: Bearer <BLOG_AUTOPUBLISH_CRON_SECRET>` (or `CRON_SECRET` fallback)

Default Vercel cron schedule:

- 00:15 UTC
- 06:15 UTC
- 12:15 UTC
- 18:15 UTC

Default throughput:

- `BLOG_AUTOPUBLISH_POSTS_PER_RUN=1` → 4 posts/day
- Increase to 2+ for 8+/day

Tuning:

- `BLOG_AUTOPUBLISH_RECENCY_DAYS` (default `14`)
- `BLOG_AUTOPUBLISH_MAX_SOURCES` (default `6`)

## Required environment variables

```bash
EXA_API_KEY=...
BLOG_AUTOPUBLISH_CRON_SECRET=...
NEXT_PUBLIC_SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
```

Without Exa key, deep research is blocked.
Without Supabase admin config in production, automation is blocked (by design).

## Manual trigger example

```bash
curl -X POST "https://your-domain/api/blog/auto-publish?count=1" \
  -H "Authorization: Bearer $BLOG_AUTOPUBLISH_CRON_SECRET"
```

## Validation

- Disk JSON is validated by Zod on load.
- Supabase blog rows are validated on read; invalid rows are skipped.
