# Cache Architecture

## Goal
- One cache policy registry for the whole repository.
- One runtime adapter layer for Next.js code.
- One script-side adapter for Node operational scripts.
- No new ad-hoc TTLs, tags, `Cache-Control` strings, or browser storage keys outside the shared layer.

## Runtime Root
- Application runtime code lives under `frontend/*`.
- Older references to bare `app/*` or `lib/*` paths are stale and should be read as `frontend/app/*` and `frontend/lib/*`.
- Operational scripts consume the same registry from `scripts/*`.

## Source Of Truth
- Registry file: `frontend/lib/cache/repo-cache-policy.json`

## Runtime Adapters
- `frontend/lib/cache/policy.ts`
  - Server data TTL/tag lookup
  - Invalidation domain policy lookup
  - Fetch cache helpers
  - `Cache-Control` header builders
  - Rate-limit config lookup
  - Browser storage key constants
  - Operational freshness/TTL constants
- `frontend/lib/cache/server-data-cache.ts`
  - Shared `unstable_cache(...)` config builder for server read models
- `frontend/lib/cache/next-runtime.ts`
  - Single import boundary for Next cache runtime APIs
- `frontend/lib/cache/invalidation.ts`
  - Registry-backed catalog invalidation
  - Registry-backed blog invalidation
  - Registry-backed admin dashboard invalidation
- `scripts/_shared/cache-policy.mjs`
  - Reads the same JSON registry for scripts and ops tooling

## Current Reality
- The current cache layer is registry-driven and tag-based.
- Redis, external KV, or another L2 cache is not part of the shipped implementation today.
- If a future L2 cache is introduced, it must remain behind the same registry and invalidation APIs.

## Cached Read Models
- Catalog:
  - `frontend/lib/servers.ts`
  - `frontend/lib/catalog/snapshot.ts`
- Blog:
  - `frontend/lib/blog/service.ts`
- Admin:
  - `frontend/lib/admin-dashboard.ts`
- GitHub enrichment:
  - `frontend/lib/github-server-details.ts`

## Mutation Rules
- Catalog mutations must invalidate through `invalidateCatalogCaches(...)`.
- Blog mutations must invalidate through `invalidateBlogCaches(...)`.
- Admin mutations must invalidate through `invalidateAdminDashboardCaches(...)`.
- Server Actions use immediate tag updates through the invalidation helper.
- Route Handlers use `revalidateTag(..., "max")` through the same helper.
- Base invalidation paths and tag mapping live in `frontend/lib/cache/repo-cache-policy.json`.

## Script Rules
- Scripts that need no-store fetch semantics or freshness thresholds must read them from `scripts/_shared/cache-policy.mjs`.
- Current consumers:
  - `scripts/catalog-count-guard.mjs`
  - `scripts/ops-health-report.mjs`
  - `scripts/backup-verify.mjs`

## Guardrails
- `npm run check:cache-discipline`
  - fails new inline `cache: "no-store"` in source files
  - fails direct `next/cache` imports outside `frontend/lib/cache/next-runtime.ts`
  - fails direct `revalidatePath(...)`, `revalidateTag(...)`, and `updateTag(...)` outside `frontend/lib/cache/invalidation.ts`

## Extension Rules
1. Add the new policy or key to `frontend/lib/cache/repo-cache-policy.json`.
2. Consume it via `frontend/lib/cache/policy.ts` or `scripts/_shared/cache-policy.mjs`.
3. Add or update tests if behavior changes.
4. Update docs when a new cache domain or invalidation rule appears.
