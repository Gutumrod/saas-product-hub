# AUDIT MANIFEST — BK01 Business/Market Gate

Run: WSTERA Product Destination Council — Canonical Run 01
Gate: Business/Market Gate — BK01 Booking by WSTERA
Date: 2026-09-04
Procedure: `llm-council-gate` v0.3.2

## Purpose

This manifest is for Hermes and Owner audit only. It contains the Candidate→Expert mapping and MUST NOT be sent to Codex. Codex receives only the identity-safe `SYNTHESIS-MANIFEST.md` plus anonymized Candidate A/B/C.

## Expert completion

Completed experts: **3/3** (Claude, AGY, Qwen). Qwen run 462 timed out (iteration budget), retried as run 463 which completed.

| Expert | Task ID | Run | Status | Raw answer |
|--------|---------|-----|--------|------------|
| Claude | t_2c4ed771 | 460 | done | `raw/claude.md` (13,391 bytes) |
| AGY | t_b1cec591 | 461 | done | `raw/agy.md` (16,350 bytes) |
| Qwen | t_e161f0f0 | 462 (timed out) → 463 (done) | done | `raw/qwen.md` (19,519 bytes) |

## Candidate → Expert mapping (CONFIDENTIAL — do not send to Codex)

| Candidate | Expert |
|-----------|--------|
| Candidate A | Qwen |
| Candidate B | AGY |
| Candidate C | Claude |

## Identity anonymization

- Raw answers copied to `CANDIDATE-{A,B,C}.md` with identity headers stripped.
- Verified no identity leak terms (agent-*/AGY/Claude/Qwen) remain in any candidate.
- Candidate mapping generated AFTER all 3 raw answers were persisted (per procedure).

## Evidence provenance

- All experts required current external evidence (Thai booking market, competitors, pricing, free/status-quo alternatives, reason to pay, retention, acquisition friction) with URL/source/date.
- External evidence fetched 2026-09-04 by experts with web capability (e.g. EikQueue, SeeU, OneRun, Fresha, Booksy, LINE OA, SlipOK, Suriya, Bookio, ZERVA).
- Claims not externally verifiable labeled UNVERIFIED by the experts.

## Files

- `raw/agy.md`, `raw/claude.md`, `raw/qwen.md` — raw identity answers (audit)
- `CANDIDATE-A.md`, `CANDIDATE-B.md`, `CANDIDATE-C.md` — anonymized (Codex input)
- `SYNTHESIS-MANIFEST.md` — identity-safe manifest (Codex input)
- `.candidate-mapping.json` — machine-readable mapping (audit only)
