# 06 - Moderation Audit Log

## Goal

Create auditable history for moderation actions (approve/reject/edit).

## Tasks

- [ ] Add moderation audit table/schema.
- [ ] Record actor, action, target submission, reason, timestamp.
- [ ] Attach audit writes to existing moderation server actions.
- [ ] Expose audit timeline in admin UI for each submission.

## Done When

- [ ] Every moderation action creates one immutable audit entry.
- [ ] Admin UI can show chronological audit history.
- [ ] Audit data survives retries and partial failures.

## Verification

- DB-level checks for insert per action
- Manual admin action replay and timeline validation
- `npm run lint`
- `npm run build`

## Dependencies

- `04-role-based-admin-auth.md`

