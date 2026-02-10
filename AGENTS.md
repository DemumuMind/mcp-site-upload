# Repository Guidelines

## Project Structure & Module Organization
- `app/`: Next.js App Router pages, layouts, and route handlers (`app/api/*`).
- `components/`: Reusable UI and feature components (including `components/ui/*` primitives).
- `lib/`: Shared domain logic, helpers, i18n, auth, and data utilities.
- `supabase/migrations/`: SQL migrations and schema evolution.
- `scripts/`: Operational scripts (smoke checks, health reports, backup verification).
- `docs/` and `ops/`: Runbooks, rollout notes, and operational artifacts.
- `public/`: Static assets and icons.

## Build, Test, and Development Commands
- `npm run dev` — start local dev server on port `3000`.
- `npm run build` — create production build (required before merge).
- `npm run start` — run the production build locally.
- `npm run check:utf8` — verify tracked text files are valid UTF-8.
- `npm run check:utf8:strict` — UTF-8 check + fail if any git-tracked file is missing.
- `npm run lint` — run ESLint across the repo.
- `npm run smoke:check -- <url>` — run deployment smoke checks.
- `npm run ops:health-report -- --base-url <url>` — generate health summary.
- `npm run ops:backup-verify` — validate backup artifacts.

## Coding Style & Naming Conventions
- Language: TypeScript + React (Next.js 16, App Router).
- Indentation: 2 spaces; keep formatting ESLint-compatible.
- Components: `PascalCase` filenames in `components/`.
- Routes: Next.js conventions (`page.tsx`, `layout.tsx`, `route.ts`) under `app/`.
- Utilities/constants: descriptive `camelCase`/`SCREAMING_SNAKE_CASE` by usage.
- Keep changes small, explicit, and consistent with existing patterns.

## Testing Guidelines
- There is no dedicated unit test suite yet; quality gate is:
  1) `npm run check:utf8`
  2) `npm run lint`
  3) `npm run build`
- For release validation, run smoke checks against the target environment.
- For UI-heavy changes, include manual browser verification (mobile + desktop) and capture screenshots when relevant.

## Commit & Pull Request Guidelines
- Follow Conventional Commits style seen in history:
  - `feat(scope): ...`
  - `fix(scope): ...`
  - `chore(scope): ...`
- PRs should include:
  - concise summary and motivation,
  - linked issue/task (if available),
  - verification steps/command output,
  - screenshots for visual/UI changes.

## Security & Configuration Tips
- Never commit secrets; use `.env.example` as the template.
- Keep production tokens in environment variables (`SUPABASE_SERVICE_ROLE_KEY`, cron secrets, admin token).
- Validate auth-protected and cron endpoints via documented runbooks before deployment.
