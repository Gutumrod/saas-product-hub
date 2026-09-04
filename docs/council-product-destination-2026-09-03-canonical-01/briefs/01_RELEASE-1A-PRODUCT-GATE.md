# OWNER RELEASE — 1A PRODUCT GATE ONLY

Authorized scope when Owner sends this release: Product Gate only for DC01, BK01, PS01, WS01, LK01, MT01, CM01.

Hermes must use canonical `llm-council-gate` v0.3.2 and Kanban fan-out. No generic delegation.

For each product create exactly three independent expert tasks from that product's `01-product/<CODE>/COUNCIL-BRIEF.md`: `agent-claude`, `agent-agy`, `agent-qwen`. Experts must not see each other's answers.

Hermes does not inspect the product repository itself. It tracks cards, collects raw artifacts, then anonymizes completed answers into Candidate A/B/C only after all actual completed expert outputs for that product are persisted.

For each product create identity-separated `AUDIT-MANIFEST.md` and identity-safe `SYNTHESIS-MANIFEST.md`. Candidate mapping must never enter Codex input.

Then create one `agent-codex` synthesis task per product using only frozen brief + anonymized candidates + synthesis manifest. Codex authors Product Gate synthesis, Product Pack as needed, Thai OWNER-BRIEF, and gate verdict `PASS/REMEDIATE/BLOCK`.

Do not release Business / Market Gate, Module Hub scan, Portfolio Arbitration, Architecture, Risk, Pre-Build, or Agent Relay in Release 1A.

After all seven Product Gate syntheses are persisted, run deterministic OWNER-BRIEF HTML renderer, verify artifacts from filesystem, update factual pipeline status, and STOP for Owner review.