# Repository Guidelines

## Vibe-Coding Contract (Mandatory)
- Write tasks in plain language; no heavy prompt templates required.
- For non-trivial tasks always follow: **Plan v1 -> Check v1 -> Plan v2 -> Implement -> Verify**.
- Commit after each completed task with an atomic diff.
- Before claiming "done", always run verification commands and report outputs.
- Prefer reversible iterations; `revert` is normal if a branch of work is weak.
- For large/independent workstreams, use `git worktree` and parallelize safely.

## Slide-Mapped Operating Rules (5/9/11/12/13/15/16/17/19/20/22/23/24)
### 5) Project brain file
- `AGENTS.md` is the project contract and must be read first.
- `AGENTS.local.md` is personal/local-only and must stay out of git.

### 9) Prompt style
- Prefer short natural prompts:
  - "add dark mode to settings page"
  - "fix mobile upload bug"
  - "migrate X to Y"
- Translate work into conventional commits after implementation.

### 11) Agent loop
- Execute agent cycle explicitly: read files -> plan -> edit -> run checks -> fix -> done.
- Do not answer as chat-only when code execution is required.

### 12/13) Subagents and parallelism
- If task has 2+ independent parts, split and run in parallel.
- Merge outputs into one final validated result.
- Keep responsibilities isolated (API/UI/tests/docs lanes).

### 15/16/17) Skills usage
- Use available skills/rules before custom ad-hoc flow.
- Process order: process-skill -> implementation-skill -> verification-skill.
- For missing capability, add a reusable skill/rule instead of one-off behavior.

### 19) MCP-first routing
- Prefer MCP-backed tools for docs/search/browser work.
- Current baseline MCP set for this workflow:
  - `openaiDeveloperDocs`
  - `exa`
  - `playwright`
  - `chrome-devtools`

### 20) Permissions + safety
- Never run destructive commands without explicit request.
- Keep sensitive values in env vars; never commit secrets.
- Local personal overrides belong in `AGENTS.local.md` only.

### 22) Typical session flow
1. Open repo and restate task in plain language.
2. Implement with minimal reversible diffs.
3. Run verification gates.
4. Review diff.
5. Atomic commit.
6. Move to next task with fresh context.

### 23) Revert discipline
- Revert is acceptable and expected when an iteration underperforms.
- Keep commit granularity small to make rollback cheap.

### 24) Worktrees for large features
- Default pattern:
  - `git worktree add .worktrees/<name> -b feature/<name>`
  - work in isolated context
  - merge after verification

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
- Commit frequency rule: one logical task -> one commit.
- PRs should include:
  - concise summary and motivation,
  - linked issue/task (if available),
  - verification steps/command output,
  - screenshots for visual/UI changes.

## Security & Configuration Tips
- Never commit secrets; use `.env.example` as the template.
- Keep production tokens in environment variables (`SUPABASE_SERVICE_ROLE_KEY`, cron secrets, admin token).
- Validate auth-protected and cron endpoints via documented runbooks before deployment.
