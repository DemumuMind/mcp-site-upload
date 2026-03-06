# Catalog Redesign Design

Date: 2026-03-06

## Approved Direction

Take the catalog to a server-first workspace model:

1. The URL query becomes the single source of truth for discovery state.
2. The server page resolves the catalog result and summary on every catalog navigation.
3. Client code manages only interaction state that is not worth persisting in the URL:
   - debounced search input
   - mobile filter drawer
   - shortlist state

The ingestion and automation routes stay intact in this iteration. The redesign scope is the user-facing discovery flow and its search/data plumbing.

## Alternatives Considered

### Option A: Server-first workspace

Keep `/catalog` as a server-rendered route that recomputes the result from search params. Use client components only for URL updates and small local state.

Pros:
- removes SSR/API/client duplication
- makes deep links and empty states deterministic
- simplifies tests because the page state comes from the route

Cons:
- requires a deeper refactor of current page/controller boundaries

### Option B: API-first SPA shell

Keep the current client fetch loop but split the hook into smaller pieces and restyle the page.

Pros:
- lower migration risk
- smaller code churn

Cons:
- keeps duplicate page/API search paths
- preserves current state-sync complexity

### Option C: Visual refresh only

Keep the current architecture and mostly redesign layout and card presentation.

Pros:
- fastest
- lowest risk

Cons:
- does not solve the core catalog-system issues

## Recommended Architecture

### Search flow

1. `frontend/app/catalog/page.tsx` parses `searchParams`.
2. A shared catalog workspace service loads the snapshot and resolves:
   - normalized query
   - search result
   - page summary
   - featured shortlist seeds
3. The page renders the full workspace from server data.
4. Client controls call `router.replace()` with normalized params.
5. App Router refreshes server props for the next route state.

### UI shape

The catalog becomes a three-part workspace:

1. Compact hero with clear task framing and live summary.
2. Insights rail with featured servers and current search context.
3. Filter + results workbench with:
   - sticky search toolbar
   - desktop filter sidebar / mobile drawer
   - richer results header
   - shortlist panel

### State model

- URL state: query, filters, sort, layout, page size, page
- local state: search input draft, mobile drawer, shortlist
- no client-side catalog fetch loop for page rendering

### Backend/search model

- introduce a shared catalog workspace/search service used by both page and API
- keep `/api/catalog/search` available, but make it call the same service
- keep ingestion and sync routes unchanged

## Testing Strategy

1. Update Playwright coverage for the new workspace surface.
2. Replace the fragile mocked empty-state test with a deterministic zero-result route case.
3. Add focused tests for shortlist persistence and server-driven filter navigation.
4. Run catalog e2e plus lint/build gates.

## Risks

1. Route-driven navigation can feel laggy if transitions are not surfaced clearly.
2. Shortlist state can become noisy if it is not scoped and persisted carefully.
3. Existing tests that assume client-side API fetch on page load will need revision.
