@echo off
setlocal
set "PROMPT_FILE=D:\AI-Workspace\projects\saas-product-hub\docs\council-bk01-order-capability-2026-09-05\prompt-qwen.md"
set "WORKDIR=D:\AI-Workspace\projects\saas-product-hub"
set "OUTPUT_FILE=D:\AI-Workspace\projects\saas-product-hub\docs\council-bk01-order-capability-2026-09-05\raw\qwen.md"
set "WRAPPER=D:\AI-Workspace\runtime\hermes-native\data\skills\devops\kanban-external-agent-dispatch\scripts\invoke-qwen-worker.ps1"
powershell -NoProfile -ExecutionPolicy Bypass -File "%WRAPPER%" -PromptFile "%PROMPT_FILE%" -Workdir "%WORKDIR%" -Mode trusted-repo -OutputFile "%OUTPUT_FILE%"
exit /b %ERRORLEVEL%
