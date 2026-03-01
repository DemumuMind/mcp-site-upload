# Release Rollout Strategy

## Owner
- DevOps Lead

## Start / Deadline
- Start: 2026-03-09
- Deadline: 2026-03-13 (framework), then ongoing

## Rollout model
1. Canary rollout for 5% traffic.
2. Expand to 25%, 50%, then 100% only after health checks stay green.
3. Stop rollout immediately on abort criteria.

## Abort criteria
- Error rate +2% over baseline for 10 minutes.
- P95 latency +30% over baseline for 10 minutes.
- Any critical checkout/auth flow failure.

## Rollback readiness
- Keep previous stable deployment ID.
- Maintain rollback playbook owner on-call.
- Run monthly rollback drill and record duration.
