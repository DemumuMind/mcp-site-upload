# Backend Route Standard

Date: 2026-03-06  
Status: Active

## Goal
Keep API routes thin and predictable.

A route should usually do only:
- auth or access check
- request parsing
- call into a core or service function
- response mapping

## Route rules
- Validate or normalize inputs at the boundary.
- Do not hide business decisions in the route body.
- Keep outbound fetch, retry, lock, export, telemetry, and store branching in core helpers when the route grows past trivial shape.
- Prefer explicit error shapes over `null` or generic fallthrough behavior.
- Use stable status mapping:
  - `400` invalid JSON or malformed boundary input
  - `401` unauthorized
  - `404` missing resource
  - `409` conflict or already-running lock
  - `422` schema-valid JSON but invalid payload contract
  - `500` internal failure
  - `207` partial batch or partial automation failure when contract already uses multi-status semantics

## Store and service rules
- Storage adapters should prefer explicit result objects over `null` when `not_found`, `unavailable`, and `invalid_record` must be distinguished.
- Core helpers may stay simple and local; do not add generic frameworks or speculative abstractions.
- Keep DB clients, cookies, headers, env reads, and cache invalidation in adapters unless there is a concrete benefit to lifting them out.

## Testing rules
- Add focused node-level tests for core decision logic.
- Prefer testing:
  - boundary parsing
  - auth gating
  - stable error mapping
  - retry/conflict/partial branches
  - export shaping or cookie/state shaping
- Keep browser or API smoke tests for route reachability and auth contract where relevant.
- Use `docs/api/route-authoring-checklist.md` for new route work.

## Current route clusters already aligned
- `/api/catalog/*`
- `/api/tasks/*`
- `/api/blog/auto-publish`
- `/api/admin/blog-v2/*`
- `/api/auth/security`
- `/api/admin/security-events/export`
- `/api/admin/multi-agent/weekly-export`
- `/api/multi-agent/demo`
- `/api/health-check`
- `/api/server/[slug]/probe`
- `/api/cookie-consent`

## Remaining low-priority surface
- `/api/health`
- `/api/multi-agent/health`

These are already small enough that further extraction is optional unless their behavior expands.
