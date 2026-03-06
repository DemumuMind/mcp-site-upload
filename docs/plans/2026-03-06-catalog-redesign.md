# Catalog Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rebuild the user-facing catalog into a server-first discovery workspace with simpler search state, richer navigation, and stable verification.

**Architecture:** `/catalog` becomes route-driven: the server resolves search state and results from URL params, while client components only manage ephemeral UI state and URL updates. The search API remains, but it uses the same shared workspace service as the page.

**Tech Stack:** Next.js App Router, React 19, TypeScript, Playwright, existing catalog search/filter utilities.

---

### Task 1: Add regression tests for the redesigned catalog flow

**Files:**
- Modify: `tests/catalog-filters.spec.ts`

**Step 1: Write the failing tests**

Add or update tests for:
- zero-result route renders empty state without API mocking
- shortlist interactions persist across a reload
- route-driven filters still synchronize URL and visible chips

**Step 2: Run test to verify it fails**

Run: `npm run test:e2e -- tests/catalog-filters.spec.ts`

Expected: FAIL in the new or updated catalog behavior assertions.

**Step 3: Write minimal implementation**

Implement only enough catalog UI and state plumbing to satisfy the new expectations.

**Step 4: Run test to verify it passes**

Run: `npm run test:e2e -- tests/catalog-filters.spec.ts`

Expected: PASS for the touched scenarios.

### Task 2: Introduce a shared server-first catalog workspace service

**Files:**
- Create: `frontend/lib/catalog/workspace.ts`
- Modify: `frontend/lib/catalog/page-view-model.ts`
- Modify: `frontend/app/api/catalog/search/route.ts`

**Step 1: Write the failing test**

Add a focused node-level test that proves page and API resolve the same normalized query/result shape from the shared service.

**Step 2: Run test to verify it fails**

Run: `npm run test -- node-tests/catalog-search-route.test.mts`

Expected: FAIL because the new shared service does not exist yet.

**Step 3: Write minimal implementation**

Extract the common “snapshot + normalized query + result + summary” flow into one shared module and wire both page and API to it.

**Step 4: Run test to verify it passes**

Run: `npm run test -- node-tests/catalog-search-route.test.mts`

Expected: PASS.

### Task 3: Replace the monolithic client fetch controller with route-driven workspace state

**Files:**
- Create: `frontend/components/catalog/catalog-workspace-client.tsx`
- Create: `frontend/components/catalog/catalog-insights-panel.tsx`
- Create: `frontend/components/catalog/catalog-shortlist.tsx`
- Modify: `frontend/app/catalog/page.tsx`
- Modify: `frontend/components/catalog-section.tsx`
- Modify: `frontend/components/catalog-filter-bar.tsx`
- Modify: `frontend/components/catalog-section/use-catalog-controller.ts`

**Step 1: Write the failing test**

Use the catalog Playwright spec to assert that search, filters, layout toggles, and shortlist survive navigation and reload.

**Step 2: Run test to verify it fails**

Run: `npm run test:e2e -- tests/catalog-filters.spec.ts`

Expected: FAIL before the new client workspace exists.

**Step 3: Write minimal implementation**

Move the page to server-provided result props, strip out client-side result fetching, and keep only local UI interactions in the client controller.

**Step 4: Run test to verify it passes**

Run: `npm run test:e2e -- tests/catalog-filters.spec.ts`

Expected: PASS.

### Task 4: Redesign the visual catalog surface around a discovery workspace

**Files:**
- Modify: `frontend/app/catalog/page.tsx`
- Modify: `frontend/components/catalog-section.tsx`
- Modify: `frontend/components/catalog-taxonomy-panel.tsx`
- Modify: `frontend/components/catalog-section/catalog-results.tsx`
- Modify: `frontend/components/server-card.tsx`

**Step 1: Write the failing test**

Add expectations for the new workspace sections and stable empty/result states.

**Step 2: Run test to verify it fails**

Run: `npm run test:e2e -- tests/catalog-filters.spec.ts`

Expected: FAIL until the new UI is in place.

**Step 3: Write minimal implementation**

Ship the new layout, sticky controls, insights panel, shortlist surface, and refreshed card presentation without changing ingestion APIs.

**Step 4: Run test to verify it passes**

Run: `npm run test:e2e -- tests/catalog-filters.spec.ts tests/catalog-search-api.spec.ts`

Expected: PASS.

### Task 5: Verify and package the change

**Files:**
- Review touched files only

**Step 1: Run targeted verification**

Run:
- `npm run test:e2e -- tests/catalog-filters.spec.ts tests/catalog-search-api.spec.ts`
- `npm run lint`
- `npm run build`

Expected: all green

**Step 2: Review diff**

Run: `git diff -- frontend/app/catalog frontend/components frontend/lib/catalog tests`

Expected: only catalog redesign changes

**Step 3: Commit**

Run:
```bash
git add docs/plans/2026-03-06-catalog-redesign-design.md docs/plans/2026-03-06-catalog-redesign.md frontend/app/catalog frontend/components frontend/lib/catalog tests
git commit -m "feat(catalog): rebuild discovery workspace"
```
