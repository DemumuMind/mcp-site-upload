# Page Templates and Hero System Rules

## Scope
- Owner: FE Lead
- Start: 2026-03-16
- Deadline: 2026-03-27

## Page Frame Variants
- `default`: generic content pages.
- `directory`: catalog and category browsing flows.
- `ops`: admin and operational controls.
- `content`: legal/blog/docs reading flows.
- `marketing`: landing and conversion-first pages.

Each page frame must expose a stable variant contract via `data-page-variant`.

## Hero System
- All hero blocks use `PageHero` with:
  - eyebrow -> title -> description -> actions -> metrics order.
  - explicit surface contract via `data-hero-surface`.
- Surface tokens:
  - `steel`, `mesh`, `rail`, `plain`.

## Responsive Hierarchy
- H1 remains primary narrative anchor.
- Description width remains constrained for readability.
- Actions stay grouped and wrap safely on mobile.

## Route Family Mapping
- Marketing: `/`, `/pricing`, `/mcp`, `/how-to-use`
- Content: `/blog/*`, `/terms`, `/privacy`, `/about`
- Directory: `/catalog`, `/categories`, `/server/[slug]`
- Ops: `/admin/*`

## Verification Gate
- `npm run check:utf8`
- `npm run lint`
- `npm run build`
- `npm test`
