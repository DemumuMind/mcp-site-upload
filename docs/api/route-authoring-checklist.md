# Route Authoring Checklist

Date: 2026-03-06

Use this checklist when adding or changing an API route.

## Before coding
- Confirm the route really needs custom logic and is not already covered by an existing helper.
- Identify route class:
  - public
  - bearer
  - cron
  - admin
  - outbound probe/export
- Decide which parts belong in the route adapter and which belong in a core helper.

## Route adapter
- Keep the route thin.
- Route should usually do only:
  - auth/access check
  - request parsing
  - call into a core or service helper
  - response mapping
- Keep direct env reads, cookies, headers, Supabase clients, cache invalidation, and redirects in the adapter unless there is a concrete reason to lift them.

## Boundary and errors
- Handle invalid JSON with `400`.
- Handle invalid payload contract with `422` when JSON shape is structurally valid but business schema fails.
- Handle unauthorized access with `401`.
- Handle missing resources with `404`.
- Handle conflicts and locks with `409`.
- Use `207` only for deliberate partial-success batch semantics.
- Prefer explicit error objects over `null`, implicit fallthrough, or untyped strings.

## Core helper
- Put branching, retry, throttling, export shaping, masking, SSRF checks, and workflow decisions in core helpers.
- Keep helpers local and boring; do not add generic frameworks.
- Prefer explicit result objects when the caller must distinguish:
  - unavailable
  - not_found
  - invalid_record
  - db_error

## Tests
- Add node-level tests for the core/helper when logic is non-trivial.
- Add API smoke tests when the route is production-facing or auth-sensitive.
- Re-run:
  - `npm run check:utf8`
  - `npm run lint`
  - `npm run build`

## Documentation
- Update `docs/api/endpoint-inventory-v2.md` and `docs/api/endpoint-inventory-v2.json` when the public surface changes.
- Keep `docs/api/openapi-lite.yaml` aligned for stable production routes.
- Keep `docs/api/testing-matrix.md` aligned if a new test layer is added.
- Follow `docs/api/backend-route-standard.md`.
