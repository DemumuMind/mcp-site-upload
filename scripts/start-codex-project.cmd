@echo off
setlocal

set "ACTION=%~1"
set "MODE=%~2"
set "CLIENT=%~3"

if "%ACTION%"=="" set "ACTION=next"
if "%CLIENT%"=="" set "CLIENT=codex"

set "MULTI_RULE=Use a single-agent flow unless true parallelism is clearly beneficial."
if /I "%MODE%"=="multi" set "MULTI_RULE=Use parallel sub-agents for independent subtasks and then merge validated results into one final output."

set "TASK=Find the next highest-priority Todo item in the project and start execution with Plan v1 -> Check v1 -> Plan v2 before edits."
if /I "%ACTION%"=="plan" set "TASK=Build a phased plan from project items and write it back to GitHub Project: create/update planning issue, update relevant issue handoff sections, and set project statuses/priorities/effort if missing."
if /I "%ACTION%"=="backlog" set "TASK=Propose and create a structured backlog of issues for this repo, add them to the project, and set Status/Priority/Effort/Task Type."
if /I "%ACTION%"=="sync" set "TASK=Sync project board and issues: ensure each active issue has up-to-date handoff (done/left/next commands/risks) and correct status."

set "PROMPT=Context:^n- Project URL: https://github.com/orgs/DemumuMind/projects/1^n- Repo: DemumuMind/mcp-site-upload^n^nOperating rules:^n- Issues are durable memory.^n- Before completion, update issue handoff (done, left, next commands, risks).^n- Follow: Plan v1 -> Check v1 -> Plan v2 -> Final verification.^n- %MULTI_RULE%^n^nTask:^n- %TASK%"

echo [start-codex-project] Action=%ACTION% Mode=%MODE% Client=%CLIENT%

if /I "%CLIENT%"=="exec" (
  codex exec "%PROMPT%"
  goto :eof
)

if /I "%CLIENT%"=="cx" (
  echo %PROMPT% | clip
  echo Prompt copied to clipboard. Launching cx... Paste prompt after start.
  cx
  goto :eof
)

echo %PROMPT% | clip
echo Prompt copied to clipboard. Launching codex... Paste prompt after start.
codex

endlocal
