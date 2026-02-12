# Codex + tmux continuation workflow

This workflow uses `docs/session-continuation.md` as the source of truth for handing context to new Codex sessions started in tmux.

## Why this exists

- Keep one persistent tmux session per repository.
- Resume Codex quickly without losing recent context.
- Keep a compact handoff block in `docs/session-continuation.md` (latest section at the top).

## Commands (PowerShell / CMD)

- Start session and attach:
  - `scripts\codex-tmux.cmd -Action start`
- Attach to an existing session:
  - `scripts\codex-tmux.cmd -Action attach`
- Show status:
  - `scripts\codex-tmux.cmd -Action status`
- Kill session:
  - `scripts\codex-tmux.cmd -Action kill`

## Startup modes

Use `-StartupMode`:

- `continuation` -> reads the latest section from `docs/session-continuation.md` and sends it as startup prompt.
- `resume-last` -> runs `codex resume --last --cd <repo>`.
- `plain` -> runs `codex --cd <repo>`.

Examples:

- `scripts\codex-tmux.cmd -Action start -StartupMode continuation`
- `scripts\codex-tmux.cmd -Action start -StartupMode resume-last`
- `scripts\codex-tmux.cmd -Action start -StartupMode plain`

## Useful flags

- `-NoAttach` -> leave session running in background.
- `-SkipCodexStart` -> create tmux session without launching Codex.
- `-SessionName <name>` -> custom tmux session name.
- `-RepoPath <path>` -> repository root.
- `-ContinuationFile <path>` -> custom handoff file path.
