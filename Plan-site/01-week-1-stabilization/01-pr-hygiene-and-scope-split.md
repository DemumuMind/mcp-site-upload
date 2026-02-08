# 01 - PR Hygiene and Scope Split

## Goal

Split current mixed local changes into clean, reviewable PRs with no scope leakage.

## Tasks

- [ ] Group changed files by feature domain (`auth/account`, `submit`, `ui/content`, `infra`).
- [ ] Create isolated branch for each domain and move only relevant files.
- [ ] Ensure each PR has explicit risk notes and rollback notes.
- [ ] Keep each PR under ~400 effective lines where possible.

## Done When

- [ ] No PR contains unrelated files.
- [ ] Each PR title and description match actual file diff.
- [ ] Reviewers can validate each PR independently.

## Verification

- `git diff --name-only origin/main...<branch>`
- `npm run lint`
- `npm run build`

## Dependencies

- None

