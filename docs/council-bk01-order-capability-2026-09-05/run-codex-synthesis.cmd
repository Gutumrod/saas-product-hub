@echo off
powershell -NoProfile -ExecutionPolicy Bypass -File "D:\AI-Workspace\agents\codex\invoke-codex-worker.ps1" -PromptFile "D:\AI-Workspace\projects\saas-product-hub\docs\council-bk01-order-capability-2026-09-05\prompt-codex-synthesis.md" -Workdir "D:\AI-Workspace\projects\saas-product-hub" -OutputFile "D:\AI-Workspace\agents\codex\logs\bk01-order-synthesis-final.txt" -ContextMode isolated
