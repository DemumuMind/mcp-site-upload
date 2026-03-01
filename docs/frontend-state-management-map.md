# Frontend State Management Map

## Scope
- Owner: FE Lead
- Start: 2026-03-23
- Deadline: 2026-04-10

## State Domains
- Server state:
  - Catalog snapshot and search responses (`app/api/catalog/*`, `lib/catalog/*`).
  - Must be treated as source of truth and invalidated through revalidation tags/paths.
- Client state:
  - UI filters, mobile drawers, wizard step navigation, transient animation flags.
  - Must be serializable and URL-synced for filterable pages.
- Local ephemeral state:
  - Focus states, hover state, temporary form draft fields before submit.
  - Must not leak across routes.

## Fetch/Cache Boundaries
- API routes returning live catalog/search data must use `Cache-Control: no-store`.
- Route handlers that mutate catalog must call tag/path revalidation.
- Frontend filter/search requests must tolerate stale network and retryable failures.

## Hydration Safety Rules
- Never render browser-only values during SSR without guards.
- Keep locale-dependent text deterministic between server/client.
- Keep interactive components behind stable props and avoid random values in render.

## Optimistic Update Rules
- Allowed only for local UI acknowledgement.
- Persisted catalog mutations require server confirmation before UI truth changes.
- On failure, rollback UI state and surface clear error messaging.

## Verification Gate
- `npm run check:utf8`
- `npm run lint`
- `npm run build`
- `npm test`
