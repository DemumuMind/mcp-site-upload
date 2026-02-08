# Plan-site

This folder contains the future implementation roadmap for `mcp-site`, split into execution-ready tracks.

## Structure

- `00-overview/` - global roadmap, priorities, assumptions, KPIs
- `01-week-1-stabilization/` - codebase stabilization and migration safety
- `02-week-2-security/` - admin/auth hardening and auditability
- `03-week-3-account-flow/` - account and submission lifecycle improvements
- `04-week-4-reliability/` - CI E2E, monitoring, operational runbooks
- `05-week-5-growth/` - SEO and analytics funnel improvements

## Execution Order

1. Week 1: `01` -> `02` -> `03`
2. Week 2: `04` -> `05` -> `06`
3. Week 3: `07` -> `08`
4. Week 4: `09` -> `10`
5. Week 5: `11` -> `12`

## Global Verification Gate

Before marking any track complete:

```bash
npm run lint
npm run build
npm run smoke:check -- <staging-or-prod-url>
```

