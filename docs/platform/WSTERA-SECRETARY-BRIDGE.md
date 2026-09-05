# WSTERA Secretary Bridge (S-Bridge) — Canonical Reference

Status: ACTIVE / VERIFIED — POINTER ONLY
Declared: 2026-09-05
Owner: Free — Final Authority

## Canonical naming

- Canonical human-facing name: **WSTERA Secretary Bridge (S-Bridge)**
- Short name: **S-Bridge**
- Search aliases: `Secretary Bridge`, `SGPT Bridge`, `Secretary GPT-Hermes Bridge`
- Existing technical identifiers remain unchanged: `SGPT-*`, `.secretary-relay/`, `secretary_bridge.py`

## Source of Truth

This file is a discovery pointer, not a duplicate runtime contract. Canonical authority lives in the private Hermes Vault:

- `04_Technical_Ref/secretary-gpt-hermes-bridge.md`
- `tools/secretary-bridge/README.md`
- Naming checkpoint: `e6f783d6f6e499eb5a66fdb5bea93f50bb801b9b`

Fresh live acceptance `SGPT-live-001` passed the Bridge -> Relay -> Council Release -> native review return loop on 2026-09-05.

## Boundary

S-Bridge is a fail-closed Secretary GPT <-> Hermes transport/coordination boundary. It does not independently interpret or change Owner decisions. Its existence does not alter the WSTERA Layer Model, authorize Layer 2 work, dispatch a product gate, or authorize build/launch. Future chats should inspect the Hermes Vault Source of Truth before relying on remembered Bridge behavior.
