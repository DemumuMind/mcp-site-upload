# 08 - Submission Status and Rejection Reason UX

## Goal

Make submission outcomes explicit for users with actionable next steps.

## Tasks

- [ ] Define status model shown to users (`pending`, `approved`, `rejected`, `needs_changes`).
- [ ] Show moderation reason text and update timestamp in account UI.
- [ ] Add UX copy for what user should do next per status.
- [ ] Ensure EN/RU locale parity for all status text.

## Done When

- [ ] Every user submission card shows status and last update.
- [ ] Rejected/needs_changes entries show moderator reason.
- [ ] No status ambiguity in account UI.

## Verification

- Visual QA for each status variant
- Locale QA for EN and RU
- `npm run lint`

## Dependencies

- `07-account-edit-and-resubmit.md`

