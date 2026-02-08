# 02 - Staging Migration for Submission Ownership

## Goal

Safely apply and validate `owner_user_id` ownership migration in staging.

## Tasks

- [ ] Apply `supabase/migrations/20260208194500_user_owned_submissions.sql` to staging.
- [ ] Confirm legacy rows remain readable as designed (or intentionally hidden).
- [ ] Verify insert policy requires authenticated user.
- [ ] Verify select policy returns only owner rows for account view.

## Done When

- [ ] Migration is applied and recorded in staging migration history.
- [ ] Authenticated submit creates row with non-null `owner_user_id`.
- [ ] Unauthorized submit is blocked.

## Verification

- `supabase db push` (or pipeline equivalent)
- Manual SQL checks in staging
- Functional check via `/submit-server` and `/account`

## Dependencies

- `01-pr-hygiene-and-scope-split.md`

