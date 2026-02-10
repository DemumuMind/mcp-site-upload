@echo off
setlocal

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0codex-tmux.ps1" %*

endlocal
