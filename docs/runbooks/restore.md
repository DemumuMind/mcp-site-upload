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
- `npm run ops:backup-verify-remote`
- `npm run ops:backup-verify-remote -- --json`
- Override manifest path:
  - `npm run ops:backup-verify -- --manifest <path>`
  - `npm run ops:backup-verify-remote -- --manifest <path>`
- Override remote location:
  - `npm run ops:backup-verify-remote -- --location <https://...|s3://bucket/key>`

## Remote Artifact Verification (recommended)
- Enable automatic checks in CI/nightly with:
  - `BACKUP_REMOTE_CHECK_ENABLED=true` (repo variable)
  - `BACKUP_REMOTE_CHECK_URL` (repo variable, optional if manifest location works from runner)
- Optional auth secrets:
  - `BACKUP_REMOTE_AUTH_HEADER` (format: `Header-Name: value`)
  - `BACKUP_REMOTE_BEARER_TOKEN`
- For S3 paths, set region when needed:
  - `BACKUP_REMOTE_S3_REGION`
- Preferred method:
  - `BACKUP_REMOTE_CHECK_METHOD=auto|http|aws-cli` (default: `auto`)

## Scheduled Backup Upload Workflow
- Workflow: `.github/workflows/nightly-backup.yml`
- Purpose: create daily `pg_dump` backup and upload:
  - `backups/postgres/latest.sql.gz`
  - `backups/postgres/<timestamp>.sql.gz`
- Required repository secrets:
  - `BACKUP_DATABASE_URL`
  - `BACKUP_SUPABASE_URL`
  - `BACKUP_SUPABASE_SERVICE_ROLE_KEY`

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
