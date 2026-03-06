# API Testing Matrix

Date: 2026-03-06

## Purpose
This file records how API routes are covered today so new work can extend the right layer instead of duplicating tests.

## Test layers
- Node core tests: decision logic, validation, error mapping, retry/conflict rules, CSV shaping, SSRF guards.
- Playwright API smoke: live route reachability, auth contract, stable response shape.
- Build gates: `check:utf8`, `lint`, `build`.

## Coverage by cluster
- Catalog:
  - Node core tests cover search, auto-sync, sync-all, npm-sync, smithery-sync, automation-status, export helpers.
  - Playwright covers catalog auth routes and search success path.
- Tasks:
  - Node core tests cover create/get request handling and bearer auth.
- Blog:
  - Node core tests cover auto-publish and blog-v2 route-core behavior.
  - Playwright covers auto-publish auth and blog page behavior.
- Auth/Security:
  - Node core tests cover auth security request decisions and security export parsing/CSV masking.
- Multi-agent:
  - Node core tests cover demo request handling and weekly export formatting.
  - Playwright covers `/api/multi-agent/health` and `/api/multi-agent/demo`.
- Health and probe:
  - Node core tests cover `/api/health-check` logic and `/api/server/[slug]/probe`.
  - Playwright covers `/api/health`.
- Cookie consent:
  - Node core tests cover payload parsing, state resolution, and delete/reset behavior.

## Default expectation for new route work
- Add or update node-level tests when route logic moves into a core/helper.
- Add Playwright smoke when the route is production-facing and contract-sensitive.
- Follow `docs/api/route-authoring-checklist.md`.
- Always rerun:
  - `npm run check:utf8`
  - `npm run lint`
  - `npm run build`

## Remaining gaps
- Admin routes mostly have auth or core coverage, but not all have live success-path smoke due to session/token requirements.
- OpenAPI is intentionally lightweight; if SDK generation or stricter contract tooling is needed, promote `openapi-lite.yaml` into a fuller spec.
