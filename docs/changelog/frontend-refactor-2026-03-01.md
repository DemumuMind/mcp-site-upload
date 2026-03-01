# Frontend Refactor Changelog (March 1, 2026)

## Scope
- Completed multi-pass component refactoring across high-size frontend pages/components.
- Kept behavior and visual design unchanged while reducing component complexity by extraction.

## Key Refactor Commits
- `6e76d51` refactor(auth-sign-in-panel): split email auth form into primitives
- `402acd8` refactor(frontend): extract auth panel states and server section extras
- `97e7ea1` refactor(frontend): split admin blog page and footer nav sections
- `4b50531` refactor(frontend): split account page and catalog section UI blocks
- `19aeb61` refactor(frontend): split reset password and server section primitives
- `266bbf6` refactor(frontend): split auth sign-in panel and particles logic
- `8fa88c2` refactor(frontend): split server detail and rules panel components
- `0047400` refactor(frontend): extract account and submit wizard view models

## Final Batch (this run)
- Refactored:
  - `frontend/components/how-to-use/how-to-use-page-content.tsx`
  - `frontend/components/home-v3/sections/trust-proof-section-v3.tsx`
  - `frontend/components/catalog-taxonomy-panel.tsx`
- Added extracted modules:
  - `frontend/components/how-to-use/how-to-use-background.tsx`
  - `frontend/components/how-to-use/how-to-use-hero.tsx`
  - `frontend/components/how-to-use/how-to-use-trust-checks-section.tsx`
  - `frontend/components/how-to-use/how-to-use-troubleshooting-section.tsx`
  - `frontend/components/home-v3/sections/trust-proof-featured-server.tsx`
  - `frontend/components/catalog-taxonomy-panel/parts.tsx`
  - `frontend/components/auth-sign-in-panel/panel-states.tsx`
  - `frontend/app/server/[slug]/page-sections-extra.tsx`

## Verification
- UTF-8: `npm run check:utf8` passed.
- Lint: `npm run lint` passed.
- Build: `npm run build` passed.
