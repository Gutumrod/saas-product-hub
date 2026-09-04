# WSTERA Product Destination Council — Canonical Round 1 Charter

Procedure authority: canonical runtime `llm-council-gate` v0.3.2. This file supplies topic scope only and must not override the skill.

## Objective
Determine the evidence-backed destination of seven selected commercial products before further implementation. Round 1 is an umbrella containing canonical Product Gate first, then Business / Market Gate only after the relevant Product Gate is PASS.

Products: DC01 DocCraft; BK01 Booking; PS01 Pawstia; WS01 WSM; LK01 WSTERA Link; MT01 Multi-Tenant AI Starter Kit; CM01 Booking Claim & Case Management Module.

## Hermes boundary
Hermes is Coordinator / Clerk only. Hermes may load the canonical skill, freeze briefs, create Kanban tasks, track status, collect raw outputs, anonymize candidates, construct identity-safe bundles, dispatch Codex synthesis, persist outputs, run deterministic renderer, and report factual paths/status.

Hermes MUST NOT perform substantive product investigation, read product repositories in place of experts, interpret evidence, rank experts, declare consensus, recommend destination, cast gate verdicts, or write OWNER-BRIEF content.
## Expert responsibility
Repository, Git, docs, code, implementation evidence, market evidence, and Module Hub inspection belong to the independent experts. Each expert receives the same frozen brief and works independently. If cited evidence is accessible, the expert must inspect it before concluding.

Expert output contract follows the skill exactly: Recommendation; Verified facts/evidence used; Key reasons; Risks/failure cases; Assumptions; Open questions/missing evidence; Confidence 0-100.

Experts do not issue the Council gate verdict. Codex is the independent synthesizer and document author.

## Evidence rules
No inference becomes fact. Missing evidence is `UNKNOWN` or `UNVERIFIED`. Current external evidence is required for changing market, competitor, and pricing claims when available. A status document is evidence, not automatic truth; contradictions must be surfaced by experts.

The failed run at `docs/council-product-destination-2026-09-03/` is audit-only and prohibited as Council input.
## Gate order
Stage A — Product Gate: WHAT / WHO / WHY / V1. Gate verdict by Codex = `PASS`, `REMEDIATE`, or `BLOCK`.

Stage B — Business / Market Gate: payer, revenue, alternatives, competitors, measurable differentiation, pricing hypotheses, reason to pay. It may start for a product only after that product's Product Gate is PASS, unless Owner grants an explicit exception.

`LOCK / REVISE / PAUSE / DROP` are NOT Round 1 gate verdicts. They are reserved for later Portfolio Arbitration after canonical gate evidence exists.

## Module Hub
`D:\AI-Workspace\projects\modules-hub` is read-only capability evidence. Experts may inspect it when relevant. No module may be assumed useful because its name matches a feature. No copying, modification, integration, or new module creation occurs in Council.

## Freeze
No feature implementation, migration, refactor, deploy, production DB apply, merge, or Agent Relay build. Council ends at decision/document artifacts and Owner review.