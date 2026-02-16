# Deep Research Audit — 2026-02-16

## Scope
- Repository: `mcp-site`
- Basis: current working tree (including local changes)
- Focus: architecture, bugs/errors, unused code candidates, incomplete areas

## Architecture (current shape)
- `app/` — Next.js App Router pages + API routes.
- `app/api/` — key backend routes:
  - `catalog/auto-sync`
  - `catalog/search`
  - `health-check`
  - `multi-agent/demo`
- `lib/catalog/*` — registry sync, snapshot/search/facets logic.
- `lib/supabase/*` — server/admin/browser clients + env normalization.
- `lib/multi-agent/*` — demo multi-agent pipeline schemas and orchestration.
- `content/` + `contentlayer` — static content pipeline for blog/docs content.
- `tests/` — Playwright e2e suite.

## Verified checks
- `npm run check:utf8:strict` ✅
- `npm run lint` ✅
- `npm run build` ✅
- `npm run test:e2e -- tests/multi-agent-demo.spec.ts` ✅

## Bugs / quality issues (found)
1. Missing default `npm test` script (fixed in this pass).
2. Playwright warning noise: `NO_COLOR` + `FORCE_COLOR` conflict (mitigated in this pass with wrapper script).
3. Test artifacts created as untracked files (`test-results/`) (ignored in this pass via `.gitignore`).

## Unused code candidates (need review)
High-confidence candidates (no repo references found beyond declaration):
- `lib/tools/tools-storage.ts` → `clearRulesHistory`
- `lib/tools/skill-profiles.ts` → `getSkillProfileById`
- `lib/cookie-consent.ts` → `openCookieConsentSettings`
- `lib/i18n.ts` → `getLocaleFromDocumentCookie`
- `lib/legal-content.ts` → `termsSections`
- `components/language-switcher.tsx` → `LanguageSwitcher`
- `components/submission-access-panel.tsx` → `SubmissionAccessPanel`
- `components/submit-server-cta.tsx` → `SubmitServerCta`
- `lib/catalog/query-v2.ts` → `defaultCatalogQueryV2`

Note: list is based on static analysis + local grep and should be validated before deletion in case of dynamic imports.

## Incomplete / not production-complete areas
- `app/api/multi-agent/demo` and `lib/multi-agent/pipeline.ts` are demo-level orchestration:
  - synthetic role output
  - no real model/tool execution path
  - no persistent run history / observability layer
- If intended for production, needs:
  - real agent execution integration
  - retries/timeouts/circuit-breaking
  - structured metrics + run storage
  - auth/rate-limits for endpoint usage

## Recommendations
Short-term:
- Keep `npm test` as canonical entry point.
- Keep Playwright artifact paths ignored.
- Gradually remove confirmed unused exports (small PRs, one module at a time).

Mid-term:
- Define if multi-agent endpoint is demo-only or production feature.
- If production: create ADR and implementation plan for execution/runtime model.
