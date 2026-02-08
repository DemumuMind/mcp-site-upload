# 03 - Auth Flow Manual Matrix

## Goal

Lock down expected behavior for user auth and protected routes before further feature work.

## Tasks

- [ ] Test unauthenticated access to `/submit-server` and `/account` (must redirect to `/auth`).
- [ ] Test OAuth flow through `/auth/callback` with valid `next`.
- [ ] Test email/magic-link flow through `/auth/callback`.
- [ ] Test invalid callback/error paths and user-facing error handling.
- [ ] Document matrix and known edge cases.

## Done When

- [ ] Full matrix is documented in a single test artifact.
- [ ] No unresolved P0/P1 auth behavior deviations.
- [ ] Repro steps exist for any deferred bug.

## Verification

- Manual browser checks (desktop + mobile viewport)
- Optional Playwright smoke replay for critical paths

## Dependencies

- `02-staging-migration-ownership.md`

