# Security and Compliance Acceptance

Date: 2026-03-01  
Owner: Sec Lead

## Accepted controls
- Security CI runs on pull requests, every push branch, and daily schedule.
- Secrets scanning is mandatory via gitleaks.
- Dependency risk scanning is mandatory (`npm audit`, OSV, dependency-review).
- Incident response workflow is documented in `docs/runbooks/incident.md`.
- Data retention/redaction baseline is documented in `docs/security/data-protection-policy.md`.

## P1/P0 finding policy
- P0 and P1 findings block release until remediation or explicit risk acceptance.
- Risk acceptance requires owner + expiry date + compensating controls.

## Verification evidence
- Workflow: `.github/workflows/security.yml`
- Quality gate: `npm run check:utf8 && npm run lint && npm run build && npm run test`

## Rotation and governance
- Secrets rotate on incident, scope change, or quarterly schedule.
- Service-role keys and cron secrets must never be committed to git.
