# 04 - Role-Based Admin Authorization

## Goal

Replace shared-token-only admin gate with role-based authorization tied to user identity.

## Tasks

- [ ] Define admin role model (`is_admin` flag or role table) in Supabase.
- [ ] Add server-side guard that checks authenticated user role for `/admin`.
- [ ] Keep dev-only fallback path explicit and disabled in production.
- [ ] Migrate existing admin access workflow and update docs.

## Done When

- [ ] Production admin access does not depend on a shared browser-submitted token.
- [ ] Unauthorized authenticated user is denied admin actions.
- [ ] Existing moderation actions continue to function.

## Verification

- Unit/integration checks for guard logic
- Manual scenario checks: admin user vs non-admin user
- `npm run lint`
- `npm run build`

## Dependencies

- `02-staging-migration-ownership.md`

