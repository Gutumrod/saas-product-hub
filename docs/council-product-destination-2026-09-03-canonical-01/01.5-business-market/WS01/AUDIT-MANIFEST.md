# AUDIT MANIFEST — WS01 WSTERA Supply Management — Business/Market Gate

Run: `council-product-destination-2026-09-03-canonical-01` — Canonical Run 01
Product: WS01 WSTERA Supply Management (WSM)
Gate: Business / Market Gate (Release 1B, Product #5)
Freeze/Brief: `01.5-business-market/WS01/COUNCIL-BRIEF.md` (CURRENT / AUTHORIZED, freeze 2026-09-05)

**RESTRICTED — Hermes / Owner audit only.**
**This file MUST NOT be sent to the synthesizer (Codex).** It contains the Candidate→Expert mapping.

## Purpose

Trace each anonymized Candidate back to its raw expert source for audit/identity-reconciliation. The Codex synthesis input is identity-blind by design; this manifest restores the mapping only for the Owner and Hermes verification gate.

## Expert completion

- Expected: 3 experts (Claude, AGY, Qwen)
- Completed: **3/3**
- Degraded: NO

## Candidate mapping (randomized 2026-09-05)

| Candidate | Raw source file | Expert |
|-----------|-----------------|--------|
| CANDIDATE-A | `raw/claude-expert-answer.md` | Claude |
| CANDIDATE-B | `raw/qwen.md` | Qwen |
| CANDIDATE-C | `raw/agy.md` | AGY |

## Raw evidence files (preserved, identity-labeled)

- `raw/claude-expert-answer.md` — 32,484 bytes (276 lines)
- `raw/agy.md` — 26,951 bytes (225 lines)
- `raw/qwen.md` — 40,758 bytes (298 lines)

## Anonymized candidates (Codex receive)

- `CANDIDATE-A.md` — 32,731 bytes
- `CANDIDATE-B.md` — 41,165 bytes
- `CANDIDATE-C.md` — 27,269 bytes

## Identity leak check

- PASS — no Claude/AGY/Qwen/DeepSeek, code, path, or raw-file-name tokens detected in CANDIDATE-A/B/C.
- Reverse identity from synthesis input: not feasible.

## Codex input boundary (what Codex may NOT see)

- ✗ AUDIT-MANIFEST.md
- ✗ raw/ files (identity-labeled)
- ✗ `.candidate-mapping.json`
- ✗ any Hermes recommendation/consensus/gate verdict

Codex may see only:
- ✓ frozen `COUNCIL-BRIEF.md`
- ✓ CANDIDATE-A.md / CANDIDATE-B.md / CANDIDATE-C.md
- ✓ `SYNTHESIS-MANIFEST.md` (identity-safe)

## Verification note

Counts above are read from the real filesystem at manifest write time. Do not treat hard-coded counts as authoritative if the filesystem changes; re-verify before dispatch.
