# MT01 — SYNTHESIS DEVIATION RECORD (Owner Decision 2026-09-03)

**Status: NON-CANONICAL / DO NOT USE AS COUNCIL OUTPUT OR FUTURE COUNCIL INPUT**

## Decision
Owner Decision (2026-09-03): **DO NOT ACCEPT the MT01 `@default` synthesis as a Council exception.**
Codex remains the only authorized Council synthesizer/document author under `llm-council-gate v0.3.2`.

## What is marked NON-CANONICAL
The following artifacts were authored by `@default` (Hermes profile), NOT by `agent-codex`, and are
**excluded from Council output and future Council input**:

- `PRODUCT-SYNTHESIS.md` (17,726 bytes) — authored by `@default`
- `01-PRODUCT-OWNER-BRIEF.md` (34,575 bytes) — authored by `@default`
- `ASSUMPTIONS.md`, `DECISION-LOG.md`, `OPEN-QUESTIONS.md` (Product Pack) — authored by `@default`

These files are preserved for audit only. They are NOT canonical Council output and MUST NOT be
provided to Codex as synthesis input or used as evidence.

## Task IDs involved
- `t_53461c38` — original Codex synthesis task (blocked by Codex backend outage, then auto-decomposed)
- `t_2ab34ed6` — "Read MT01 inputs and write PRODUCT-SYNTHESIS.md" (assignee `default`, created_by `auto-decomposer`)
- `t_1de8ff3c` — "Write 01-PRODUCT-OWNER-BRIEF.md (Thai)" (assignee `default`, created_by `auto-decomposer`)
- `t_65ae9079` — "Write Product Pack as necessary" (assignee `default`, created_by `auto-decomposer`)

## Actual author / profile
`@default` (Hermes profile) — NOT `agent-codex`.

## Reason
1. External OpenAI Codex backend outage (`chatgpt.com/backend-api/codex/responses` HTTP 404, cf-ray BKK,
   auth OK) blocked the canonical Codex synthesis invocation (runs 431/432/433).
2. The Kanban `auto-decomposer` then substituted `@default` as assignee and decomposed the synthesis
   into 3 sub-tasks, bypassing the Codex-only synthesizer doctrine.

## False provenance claim in the old OWNER-BRIEF
The `@default`-authored `01-PRODUCT-OWNER-BRIEF.md` states: "แล้ว **Codex สังเคราะห์รวม**เป็นชุดเดียว"
("then Codex synthesized it into one set"). This is FALSE — the actual author was `@default`, not Codex.
Per Owner Decision, Hermes must NOT manually edit that OWNER-BRIEF to make it look canonical; it is
preserved as-is for audit and marked NON-CANONICAL.

## Pre-deviation artifacts verified CLEAN & CANONICAL (retained for recovery)
- Frozen brief: `COUNCIL-BRIEF.md` (1,494 bytes) ✓
- raw Claude: `raw/claude.md` sha256 `d5cd0227c6dc3615e959dbecdbf4d0262e3cc724789e6ac36798cca3963f732f` ✓
- raw AGY: `raw/agy.md` sha256 `8a951d786617e9d51a36267658560ae496ad7e99668726ab0c2ede0bfc6ec125` ✓
- raw Qwen: `raw/qwen.md` sha256 `734383469e885cdb674aaa818341bcff46a495e22f81388f103ec06835190be4` ✓
- CANDIDATE-A/B/C (identity-anonymized, no leaks) ✓
- `SYNTHESIS-MANIFEST.md` (identity-safe, no AUDIT/mapping reference) ✓
- `AUDIT-MANIFEST.md` (Hermes/Owner only, holds Candidate→expert mapping) ✓

## Recovery plan (per Owner Decision B)
- Retain the pre-deviation inputs above.
- Wait until `agent-codex` backend health is verified.
- Create a fresh Codex synthesis task (do NOT provide the invalid `@default` synthesis/OWNER-BRIEF to Codex).
- Codex produces a new canonical synthesis + Thai OWNER-BRIEF.
- The old MT01 verdict `REMEDIATE` is NOT authoritative until Codex independently returns its verdict.
