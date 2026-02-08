# Security Runbook

## Automated Security Controls
- Workflow: `.github/workflows/security.yml`
  - dependency review on PR
  - `npm audit --omit=dev --audit-level=high`
  - gitleaks secret scanning

## Triage Matrix
- `Critical/High`:
  - block merge/release
  - patch or mitigate before deployment
- `Medium`:
  - create remediation issue with owner and deadline
- `Low`:
  - backlog with periodic review

## Secret Management Rules
- Do not commit tokens/secrets to repository.
- Store deployment credentials only in GitHub/Vercel secrets.
- Rotate immediately when leak is suspected.

## Response Steps for Security Alert
1. Validate finding (real vs false positive).
2. If real:
   - rotate affected secret
   - remove leaked value from history if required
   - apply patch and re-run security workflow
3. Document timeline and corrective actions.

## Required Artifacts
- Incident note with:
  - affected scope
  - exploitability
  - remediation PRs
  - post-fix verification output
