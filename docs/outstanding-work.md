## Outstanding work / out-of-scope items

1. **Existing `how-to-use` content** (`app/how-to-use/page.tsx`, `components/how-to-use/*`, `content/how-to-use/*`, `lib/content/how-to-use.ts`, `tests/how-to-use.spec.ts`, `components/how-to-use/execution-runbook.tsx`) was part of a different initiative; оставил без изменений в рамках этого редизайна.
2. **`test-results/`** — временный каталог от Playwright. Удалён из комита; если нужно, можно повторно сгенерировать при следующем прогоне.
3. **MCP `filesystem` MCP в `codex-health`** — инструментарий просит доступ к MCP-серверу, которого нет. Пока это инфраструктурный warning, и дополнительная настройка сервера нужна отдельно.

Если требуется сделать что-то из перечисленного (например, синхронизировать `how-to-use` или настроить MCP `filesystem`), дай знать — добавлю отдельный таск.
