# WSTERA Product Evolution — Layer Model

**Status:** OWNER ACCEPTED STRATEGY BASELINE — LAYER 1 ACTIVE
**Owner direction date:** 2026-09-05
**Scope:** WSTERA SaaS portfolio strategy
**Authority:** Strategy direction only; does not authorize build, migration, deployment, or Agent Relay work.
**Owner decisions applied:** D1–D6 (2026-09-05)

**Council review:** docs/council-strategy-layer-model-2026-09-05/ — original Codex recommendation **REMEDIATE**, confidence **89/100**. Owner decisions D1–D6 applied below. Targeted Codex re-evaluation (2026-09-05): **ACCEPT/PASS**, confidence **93/100**. Strategy baseline accepted; Layer 1 remains active. This does not authorize Layer 2/3, Agent Relay, implementation, or product dispatch.

## Purpose

WSTERA will evolve products in explicit layers so reliable SaaS foundations are completed before AI-agent operation is introduced.

The governing principle is:

> First build products that humans can use safely and completely. Then make approved capabilities of those products operable by authorized AI agents.

This prevents AI features from masking incomplete product, business, security, billing, or operational foundations.

## Layer 1 — Product Foundation

Goal: build reliable, sellable SaaS products that work correctly without requiring AI.

Layer 1 includes the existing product-definition and delivery pipeline:

- Product Gate
- Business / Market Gate
- Architecture Gate
- Risk / Invariant Gate where applicable
- Pre-Build Gate
- implementation and verification
- billing / entitlement integration
- deployment and operational readiness
- pilot / launch validation
- audit evidence and release closeout

Layer 1 completion means a product can be used by humans as an authoritative system of record and workflow system without AI dependency.

### Layer 1 agent-readiness constraint

Layer 1 must not build Agent features merely to prepare for Layer 2. New or materially refactored capabilities should preserve contracts that make later agent operation safe and practical only when doing so is independently justified by the current human-facing product requirement.

**Objective anti-scope-creep test (Owner Decision D4):**

A future-Agent-friendly design choice may remain inside Layer 1 only when it is independently justified by the current human-facing product requirement AND does not require a new Agent-specific endpoint, schema, service, provider, credential model, orchestration system, MCP surface, or infrastructure component.

If Agent use is the primary reason something exists: **DEFER TO LAYER 2.**

**Allowed in Layer 1 when product-required:**
- deterministic mutations
- stable resource IDs
- tenant isolation
- authorization / RBAC
- idempotency
- structured errors
- audit history
- business state machines
- rollback / failure behavior
- explicit approval steps when humans already require them
- domain services that are independently necessary for the product

**Not automatically allowed in Layer 1** (unless independently required by current Layer 1 human product requirements):
- Agent tool schemas
- MCP
- AI-specific endpoints
- Agent action routers
- autonomous workflow engines
- AI proposal tables
- Agent memory databases
- model-provider integrations
- Agent token issuance
- cross-product Agent buses

### Read / Propose / Execute clarification

Do not force every Layer 1 product to implement `read → propose → approve → execute` solely because future Agents may use that shape.

This separation belongs in Layer 1 only where the human workflow already requires the same business control.

Example: a destructive financial operation may legitimately require human approval in Layer 1. A normal CRUD action must not be artificially expanded into a proposal workflow merely to prepare for AI.

Layer 2 may introduce additional Agent-specific proposal/approval orchestration later.

### Layer 1 closeout

Layer 1 closeout is evaluated **per product** when that product completes release closeout. `LAYER-1-CLOSEOUT.md` records each product's state and evidence. A portfolio-level synthesis may summarize these records when the current portfolio cycle concludes.

**Closeout authority (Owner Decision D2):** `L1 COMPLETE` is NOT automatic. Required authority chain:
1. Product provides objective Layer 1 closeout evidence.
2. Council reviews the evidence against the Layer 1 closeout contract.
3. Council issues its recommendation.
4. Owner is Final Authority and signs the final L1 state.

**Allowed final states:**
- `L1 COMPLETE — AGENTIZATION ELIGIBLE`
- `L1 INCOMPLETE`
- `L1 BLOCKED`
- `NOT CONTINUING`

The final state, date, evidence references, Council recommendation, and Owner decision must be recorded in `LAYER-1-CLOSEOUT.md`.

**Current Layer 1 closeout cycle (Owner Decision D3):** covers the canonical products currently governed by the WSTERA Product Destination pipeline:
- DC01 — DocCraft
- BK01 — Booking
- PS01 — Pawstia
- WS01 — WSTERA Supply Management
- LK01 — WSTERA Link
- MT01 — Multi-Tenant AI Starter Kit
- CM01 — Booking Claim & Case Management

Products outside this canonical cycle are not automatically included. If a product is later intentionally discontinued, deferred indefinitely, or removed from the active portfolio, its closeout state may be `NOT CONTINUING`; that state must be explicit and Owner-approved.

**Layer 2 progression (Owner Decision D1):** Layer 2 is a portfolio-level strategic program, but products may become eligible and enter Layer 2 evaluation individually. A product does NOT need to wait until every active product in the portfolio has completed Layer 1. A product may be considered for Layer 2 only after that specific product has achieved `L1 COMPLETE — AGENTIZATION ELIGIBLE` and the Owner explicitly releases Layer 2 evaluation for that product. This does NOT automatically authorize Layer 2 implementation. Products that remain incomplete, blocked, paused, or not continuing do not prevent another fully completed product from later entering Layer 2 evaluation.

**No retroactive Agent retrofit (Owner Decision D4):** Existing products must NOT be retrofitted merely to satisfy future Agent compatibility. Layer 1 Agent-readiness requirements apply only where the underlying product-quality capability is independently required by the human-facing product or where the capability is materially reopened/refactored for a legitimate Layer 1 reason. Do NOT reopen completed architecture or implementation solely to add Agent APIs, Agent-specific endpoints, Agent-specific schemas, MCP servers, Agent credentials, Agent orchestration, speculative action surfaces, Agent-specific event buses, or provider-specific abstractions. For existing products, Agent readiness is assessed during Layer 1 closeout using the system that genuinely exists. Any missing Agent-specific capability may be deferred to Layer 2.

### L1 COMPLETE — Minimum Evidence Contract

`L1 COMPLETE — AGENTIZATION ELIGIBLE` requires objective evidence that the product is complete as a normal SaaS/product without AI. At minimum evaluate:

1. Product definition is closed.
2. Business/Market direction is closed for the intended release.
3. Architecture boundaries are approved.
4. Required Risk/Invariant gates are closed.
5. Required Pre-Build gates are closed.
6. Authorized implementation scope is complete.
7. Required tests/verifications pass.
8. Tenant isolation and authorization are evidenced where applicable.
9. Billing/entitlement boundary is implemented or explicitly classified according to the product's approved commercial model.
10. Deployment/runtime state is known and evidenced.
11. Product can execute its authoritative human workflows without AI dependency.
12. Critical mutations have deterministic success/failure semantics.
13. Required audit/history exists for business-critical decisions.
14. Open blockers are classified and do not contradict the claimed L1 state.
15. Current Source of Truth, release evidence, and repository state are consistent.

Agent-specific infrastructure is NOT required for Layer 1 completion.

`AGENTIZATION ELIGIBLE` means: sufficiently authoritative and well-governed to begin a separate Layer 2 evaluation. It does NOT mean already Agent-enabled. No Agent work is authorized merely by receiving `AGENTIZATION ELIGIBLE`.

## Layer 2 — Agentic Operations

Goal: make approved product capabilities operable by authorized AI agents on behalf of users.

Target operating pattern:

`User Intent → Authorized Agent → Product Capability Contract → Authoritative Business Action → Audit Evidence`

Layer 2 is not "AI clicking the UI." The product remains the authority for validation, permissions, invariants, state transitions, and auditability.

**Layer 2 is a new program (Owner Decision D5):** Layer 2 must be treated as a separately governed program. Layer 2 does NOT inherit implementation authorization from Layer 1. Before any Agent execution capability is built, Layer 2 must establish its own explicit governance and gate sequence. At minimum, future Layer 2 must define:
- Agentic Product/Capability Scope
- Agent Architecture
- Authority / Delegation Model
- Risk / Invariant Gate
- Human-in-the-loop policy
- execution containment / blast-radius controls
- audit attribution
- tenant isolation
- credential/token boundaries
- failure / rollback behavior
- Pre-Build Gate
- Owner Build Approval

Exact Layer 2 pipeline names may be decided when Layer 2 is formally opened. This strategy document does NOT open those gates now.

**Tenant opt-in + delegated authority (Owner Decision D6):** Future Agent execution must be tenant opt-in by default. No tenant receives autonomous Agent execution merely because the product technically supports it. Fundamental authorization rule: An Agent may never possess more product authority than the user/service principal that explicitly delegated the action. Layer 2 must distinguish: delegating tenant, delegating user/service principal, acting Agent identity, requested action, proposed action, approved action where approval is required, and executed authoritative action. Agent execution must remain tenant-scoped. Cross-tenant authority is forbidden unless a future explicitly approved platform-control capability defines otherwise.

**Layer 2 audit requirement:** Future Layer 2 audit records must support dual attribution: delegating human/service principal AND acting Agent identity. Where relevant also retain: proposal, approval, execution, resulting authoritative state, and failure/rollback outcome. The Product remains authoritative for final business-state mutation.

**Layer 2 containment requirement:** Before future Agent execute capability is released, Layer 2 must define containment controls appropriate to action risk. Potential controls may include: per-tenant opt-in, capability allowlists, human approval requirements, rate/volume limits, monetary/value limits, execution quotas, reversible-action preference, kill switch, emergency disable, retry/idempotency controls, and blast-radius limits. These are future Layer 2 requirements. Do NOT implement them during current Layer 1 solely because this strategy records them.

Layer 2 capabilities may include:
- agent-safe read tools
- propose / preview operations
- explicit approval workflows
- bounded execute tools
- agent identity and delegated authorization
- scoped credentials / tokens
- machine-readable capability schemas
- execution receipts and audit trails
- policy-aware retries and idempotency
- human override / rollback where the domain supports it

Examples:
- Booking: find a booking, validate policy, propose or perform reschedule, notify, and record evidence.
- Pawstia: find pets missing Daily Reports, prepare/send permitted reports, and record delivery status.
- WSM: read confirmed demand/supply, calculate the gap, propose allocation, execute only within approved authority, and notify affected dealers.
- DocCraft: generate a permitted business document from authoritative product/customer/order data without bypassing document rules.

**Examples are illustrative only. They do not constitute a commitment, priority order, first-wave plan, or authorization.**

Layer 2 begins only after explicit Owner release following Layer 1 closeout.

## Layer 3 — Cross-Product Intelligence

Goal: allow authorized agents to coordinate workflows across multiple WSTERA products while preserving each product's authority boundary.

**Layer 3 quarantine:** Layer 3 remains **Cross-Product Intelligence — FUTURE HORIZON ONLY**. No Layer 3 architecture, implementation, event bus, shared Agent memory, cross-product orchestration, schema, or infrastructure may be introduced during current Layer 1 merely to prepare for Layer 3. Layer 3 examples are illustrative only. They are NOT roadmap commitments, product priorities, approved integrations, or release commitments. Layer 3 may only be formally opened after explicit future Owner authorization and evidence that Layer 2 has safely operated in real product context. Do NOT invent an exact minimum product count as a mandatory prerequisite unless Owner later decides it.

Potential pattern:

`User Intent → Cross-Product Agent → Product A capability → Product B capability → Product C capability → Unified audit trail`

Examples may later span Booking, Order, Claim/Case, Billing, Support, DocCraft, WSM, and other portfolio products.

## Cross-Layer Governance

1. A higher layer must not compensate for an incomplete lower layer.
2. Product authority remains inside the product domain, not inside the AI model.
3. Agent permission can never exceed the delegating user's authorized scope.
4. AI recommendation and authoritative execution must be distinguishable in evidence.
5. High-impact or irreversible actions require explicit policy and, where appropriate, human approval.
6. Cross-product automation must not collapse tenant, billing, security, or audit boundaries.
7. Layer 2/3 work requires its own Council / Architecture / Risk / Pre-Build review before implementation.
8. Audit evidence for delegated operation must identify both the delegating user and the acting agent identity, and must distinguish AI-proposed content from authoritatively executed actions.

## Portfolio Transition Rule

Current portfolio work remains **Layer 1**.

No current Product Gate, Business/Market Gate, Architecture, Pre-Build, implementation, or launch work is automatically expanded by this strategy document.

Layer 2 is a separate future program and requires explicit Owner authorization after Layer 1 closeout.

## Grandfather / Reopen Rule

Products or capabilities closed before adoption of this strategy are not automatically reopened. When an existing product is materially redesigned, materially refactored, reopened for a new release, or evaluated for Layer 1 closeout, then reviewers may assess whether existing product-quality foundations are sufficient. They must not demand Agent-only retrofits during Layer 1.

## Decision State

Owner intent is accepted as strategic direction. Owner decisions D1–D6 applied 2026-09-05.

Targeted Codex re-evaluation (2026-09-05): **ACCEPT/PASS**, confidence **93/100**. No material strategy blockers remain.

**Final strategy status: OWNER ACCEPTED STRATEGY BASELINE — LAYER 1 ACTIVE**

This status accepts the strategy baseline only. It does not authorize Layer 2, Layer 3, Agent Relay, implementation, runtime/database change, migration, deployment, product-gate reopening, or product dispatch. Future Layer 2/3 initiatives require separate explicit Owner authorization and their own governance/gate sequence.
