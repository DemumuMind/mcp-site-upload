# Assumptions and KPIs

## Assumptions

- Supabase is the primary source of truth in production mode.
- `/submit-server` and `/account` stay authenticated-only.
- Admin capabilities will evolve from shared token to role-based controls.
- Daily health checks remain enabled through Vercel cron.

## Product KPIs

- Submit success rate (authenticated): target `> 95%`
- Moderation lead time (submit -> final status): target `< 24h`
- Auth callback error rate: target `< 1%`
- E2E pass rate in CI: target `>= 98%`
- Organic landing to auth conversion: baseline first, then `+15%`

## Operational KPIs

- Mean time to detect auth/admin incident: `< 10 min`
- Mean time to resolve P1 auth/admin incident: `< 60 min`
- Health-check failure alerting coverage: `100%` for production

