# Frontend State Management Map

## Scope
- Owner: FE Lead
- Updated: 2026-03-06
- Runtime root: `frontend/*`

## State Domains
- Server read models:
  - Catalog server list and derived snapshot live in `frontend/lib/servers.ts` and `frontend/lib/catalog/snapshot.ts`.
  - Blog snapshot lives in `frontend/lib/blog/service.ts`.
  - Admin dashboard snapshot lives in `frontend/lib/admin-dashboard.ts`.
  - GitHub enrichment fetches live in `frontend/lib/github-server-details.ts`.
- Client persistence:
  - Cookie consent choice/profile lives in `frontend/lib/cookie-consent.ts`.
  - Submit-server draft lives in `frontend/components/submit-server-wizard/use-submit-server-wizard-controller.ts`.
  - Tools presets/history lives in `frontend/lib/tools/tools-storage.ts`.
- Local ephemeral UI state:
  - Filters, drawers, wizard step transitions, animation flags, and transient form state stay component-local unless they must survive refresh.

## Shared Cache Contract
- Single source of truth: `frontend/lib/cache/repo-cache-policy.json`.
- Runtime adapters:
  - `frontend/lib/cache/policy.ts` exposes TTL, tags, headers, rate-limit windows, cookie/localStorage keys, and operational freshness values.
  - `frontend/lib/cache/invalidation.ts` is the only place that should orchestrate tag/path invalidation for catalog, blog, and admin domains.
  - `scripts/_shared/cache-policy.mjs` reads the same registry for non-frontend scripts.
- Current cache tags:
  - `catalog-servers`
  - `blog-posts`
  - `admin-dashboard`

## Fetch And Cache Boundaries
- Route handlers that must never serve cached responses use `buildCacheControlHeader("apiNoStore")` or `buildCacheControlHeader("exportNoStore")`.
- Public generated text documents such as `sitemap.xml` and `llms.txt` use `buildCacheControlHeader("publicDocument")`.
- Catalog search reads from the shared catalog cache and no longer bypasses the snapshot layer by default.
- Server actions and route handlers must invalidate through `frontend/lib/cache/invalidation.ts` instead of hardcoding `revalidatePath`/`revalidateTag` calls in each module.

## Client Storage Rules
- Do not introduce new `localStorage` or cookie keys inline.
- New browser-persisted keys must be declared in `frontend/lib/cache/repo-cache-policy.json` and consumed through `frontend/lib/cache/policy.ts`.
- Cookie consent remains dual-written to cookie + localStorage by design so SSR and client hydration stay aligned.

## Verification Gate
- `npm run check:utf8`
- `npm run lint`
- `npm run build`

## Review Checklist
- Does the change add or change any TTL, cache tag, `Cache-Control` header, rate-limit window, cookie key, or localStorage key?
- If yes, is the source of truth updated in `frontend/lib/cache/repo-cache-policy.json`?
- If a mutation changes catalog, blog, or admin read models, does it invalidate through `frontend/lib/cache/invalidation.ts`?
