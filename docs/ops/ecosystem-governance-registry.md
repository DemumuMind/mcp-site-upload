# Ecosystem Governance Registry

Date: 2026-03-01  
Owner: Product/Content Lead

## Third-party integration registry (template)
| Integration | Owner | SLA target | Fallback | Security review | Cost center |
|---|---|---|---|---|---|
| Supabase | Data Lead | 99.9% | Read-only mode + queued writes | Required | Data Platform |
| Vercel | DevOps Lead | 99.9% | Rollback to previous deployment | Required | Hosting |
| GitHub Actions | DevOps Lead | 99.9% | Manual release checklist | Required | CI/CD |
| External MCP catalogs | Data Lead | best effort | Cached snapshot + retry queue | Required | Data Ingestion |

## Legal and licensing readiness
- Quarterly dependency license audit is mandatory.
- Blocklisted licenses: GPL-2.0, AGPL-1.0, AGPL-3.0.
- Legal sign-off required before adding new paid vendors.

## Cost/resource loop
- Monthly KPI review: hosting, CI minutes, storage/egress.
- Optimization loop owner: DevOps Lead.
- Trigger incident when monthly spend deviation exceeds 20% without approved change.

## Process maturity
- Use release sign-off template: `ops/release-signoff.template.md`.
- Use incident runbook: `docs/runbooks/incident.md`.
- Maintain backup-owner map for each critical integration.
