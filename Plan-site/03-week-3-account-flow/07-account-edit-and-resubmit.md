# 07 - Account: Edit and Resubmit Flow

## Goal

Allow users to update their own submissions and resubmit for moderation.

## Tasks

- [ ] Define allowed editable fields and immutable fields.
- [ ] Add edit form on `/account` for owned submissions only.
- [ ] Add resubmit action that transitions status back to moderation queue.
- [ ] Preserve change history compatibility with moderation audit log.

## Done When

- [ ] Owner can edit and resubmit own record.
- [ ] Non-owner cannot edit or resubmit.
- [ ] Resubmitted entry appears in moderation queue with updated status.

## Verification

- Owner vs non-owner authorization checks
- Manual UX flow from account to admin moderation
- `npm run lint`
- `npm run build`

## Dependencies

- `06-moderation-audit-log.md`

