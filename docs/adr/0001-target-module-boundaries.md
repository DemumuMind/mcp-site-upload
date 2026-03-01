# ADR 0001: Target Module Boundaries

- Date: 2026-03-01
- Status: Accepted
- Owner: BE Lead

## Context
The codebase has multiple vertical implementations (`blog` + `blog-v2`, `home` + `home-v3`) and legacy route artifacts.
Without explicit import boundaries, API and UI layers can couple accidentally and increase regression risk.

## Decision
Adopt and enforce these boundaries:

1. `app/api/*` is transport-only and cannot import UI modules (`@/components/*`).
2. `components/*` cannot import route modules (`@/app/*`).
3. Active public routes must keep only canonical pages; non-routable legacy variants are removed from `app/blog/*`.
4. Domain-centric code moves incrementally toward `lib/domains/*` with feature parity checks before cutover.

## Consequences
- Faster reviews and safer refactors due to explicit dependency direction.
- Lower risk of accidental server/client coupling.
- Legacy route cleanup reduces duplicate vertical surface.

## Follow-ups
- Migrate `lib/blog-v2/*`, `lib/blog/*`, `lib/home/*` toward `lib/domains/*` facades.
- Add architecture test for cyclic imports in CI.
