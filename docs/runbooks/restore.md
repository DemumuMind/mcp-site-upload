# Restore Runbook

## Backup Policy
- Daily logical backup (`pg_dump`) of primary Postgres.
- Retention: at least 30 days.
- Store backups in encrypted storage with restricted access.
- Keep machine-readable manifest at `ops/backup-manifest.json` (not committed).

## Manifest Contract
Use `ops/backup-manifest.example.json` as reference. Required fields:
- `lastSuccessfulBackupAt` (ISO timestamp)
- `backupLocation`
- `retentionDays`
- `lastRestoreDrillAt` (ISO timestamp)

## Verification Commands
- `npm run ops:backup-verify`
- `npm run ops:backup-verify -- --json`
- Override manifest path:
  - `npm run ops:backup-verify -- --manifest <path>`

## Monthly Restore Drill
1. Pick latest backup and create isolated staging database.
2. Restore database dump.
3. Run critical checks:
   - row counts for core tables
   - app read paths for catalog and server details
   - `/api/health-check` operational behavior
4. Update `lastRestoreDrillAt` in manifest.
5. Record actual RTO and any gaps.

## Failure Handling
- If `ops:backup-verify` fails:
  1. page on-call owner
  2. trigger manual backup
  3. investigate backup pipeline before next deploy window
