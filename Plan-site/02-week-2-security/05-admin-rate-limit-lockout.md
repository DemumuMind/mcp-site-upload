# 05 - Admin Login Rate Limit and Lockout

## Goal

Reduce brute-force risk on admin auth entrypoints.

## Tasks

- [ ] Add request-level rate limit for `/admin/login`.
- [ ] Add short lockout window after repeated failed attempts.
- [ ] Return safe, non-enumerable error messages.
- [ ] Log failed attempts with timestamp and request metadata.

## Done When

- [ ] Repeated invalid attempts are throttled.
- [ ] Lockout behavior is deterministic and testable.
- [ ] No sensitive auth detail leaks in response body.

## Verification

- Automated negative tests for repeated failures
- Manual test with rapid invalid submissions
- Confirm logs/metrics emitted

## Dependencies

- `04-role-based-admin-auth.md`

