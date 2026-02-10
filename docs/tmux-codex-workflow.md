# Codex + tmux continuation workflow

Этот workflow делает `docs/session-continuation.md` практической «оперативной памятью» для новых сессий Codex через tmux.

## Что это дает

- Одна постоянная tmux-сессия для репозитория.
- Быстрый ре-старт Codex в фоне и возврат в контекст.
- Автопередача последнего handoff-блока из `docs/session-continuation.md` при старте (режим `continuation`).

## Команды (PowerShell / CMD)

Из корня репозитория:

- Старт и attach:
  - `scripts\codex-tmux.cmd -Action start`
- Только attach к уже запущенной сессии:
  - `scripts\codex-tmux.cmd -Action attach`
- Статус:
  - `scripts\codex-tmux.cmd -Action status`
- Остановить сессию:
  - `scripts\codex-tmux.cmd -Action kill`

## Режимы старта

По умолчанию: `-StartupMode continuation`.

- `continuation` — читает последний блок из `docs/session-continuation.md` и передает его как стартовый prompt.
- `resume-last` — запускает `codex resume --last --cd <repo>`.
- `plain` — обычный `codex --cd <repo>` без стартового контекста.

Примеры:

- `scripts\codex-tmux.cmd -Action start -StartupMode continuation`
- `scripts\codex-tmux.cmd -Action start -StartupMode resume-last`
- `scripts\codex-tmux.cmd -Action start -StartupMode plain`

## Полезные флаги

- `-NoAttach` — оставить tmux-сессию в фоне (не подключаться сразу).
- `-SkipCodexStart` — создать tmux-сессию без автозапуска Codex.
- `-SessionName <name>` — задать имя tmux-сессии вручную.
- `-RepoPath <path>` — запустить для другого репозитория.
- `-ContinuationFile <path>` — использовать другой handoff-файл.

## Важное уточнение про память

`docs/session-continuation.md` не является «системной памятью Codex».  
Это файловый источник контекста в репозитории. Скрипт просто автоматизирует его подхват на старте.
