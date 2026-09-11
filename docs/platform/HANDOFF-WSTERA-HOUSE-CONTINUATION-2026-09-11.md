# HANDOFF — WSTERA House Continuation

**Date:** 2026-09-11
**Mode:** WSTERA HOUSE / SECRETARY CONTROL
**Purpose:** ส่งต่องานบ้านใหญ่ไปแชทใหม่โดยอิง source-of-truth บนเครื่อง Mac

## Owner operating rules

- Owner คือ final authority.
- ทุกงานต้องเลือก canonical workflow/version ก่อน execute ตาม workflow registry.
- Brief/handoff สำคัญต้องมีไฟล์อ้างอิง; ห้ามใช้ chat-only brief เป็น canonical instruction.
- House ต้องควบคุม architecture/gates/authority boundaries และไม่แย่ง execution ของ product/runtime lane.
- Build-to-Sell ยังเป็น priority แต่ security, isolation, money correctness และ evidence ห้ามลดมาตรฐาน.
- ห้ามสร้าง fixed paid infrastructure โดยไม่มี proven benefit/current need.
- ห้าม mutate live/non-production shared runtime, payment provider หรือ production deployment นอก authority/gate ที่อนุมัติ.

## Active machine

Mac เป็นเครื่อง active สำหรับ House, Control Plane และ SB01 lanes ที่ส่งต่อในเอกสารนี้.

Canonical Mac workspace root:
`/Users/wachirayachankhonkan/AI-Workspace`
## Lane A — Central Billing Core governance

House billing coordination worktree:
`/Users/wachirayachankhonkan/AI-Workspace/runtime/worktrees/house-billing-core-20260909`

Current House billing HEAD at handoff preparation:
`1414896eed944d3a2c55c8d2e7d8ab72aa013fc4`

Central rule:
**SB01 is the single WSTERA Central Billing Core runtime.**
Products use versioned Product Billing Profiles and Product-owned Entitlement Adapters; do not create independent payment engines per Product.

Canonical documents:
- `docs/platform/billing-core/CANONICAL-BILLING-SYSTEM-MAP-2026-09-09.md`
- `docs/platform/billing-core/BRIEF-SB01-WSTERA-CENTRAL-BILLING-CONTINUATION-2026-09-09.md`
- `docs/platform/billing-core/OWNER-DIRECTIVE-CONTROL-PLANE-BILLING-BOUNDARY-2026-09-11.md`
- `docs/platform/billing-core/EVIDENCE-SB01-MAC-HANDOFF-ACCEPTED-2026-09-11.md`

SB01 runtime repo:
`Gutumrod/stripe-billing`

Mac worktree:
`/Users/wachirayachankhonkan/AI-Workspace/runtime/worktrees/sb01-central-billing-20260909`

SB01 baseline SHA:
`4441645991f30f73a4f103f48af29b686a5890c5`
## SB01 current execution state

Mac parity was verified against remote before this handoff:
- SB01 branch tracks `origin/feature/central-billing-phase2-runtime`.
- Git parity was `0/0` and worktree clean.
- `npm ci --ignore-scripts` PASS.
- `npm audit` reported 0 vulnerabilities.
- No `.env` or `.env.local` was copied from Windows.
- Build/typecheck reproduce exactly three known compile errors at baseline.

Known Phase 2A defects:
1. `platform/runtime/src/db.ts:131` — `Record<string, unknown>` vs `JSONValue`.
2. `platform/runtime/src/db.ts:258` — same JSON typing class.
3. `platform/runtime/src/runtime.ts:239` — `providerCustomerId: string | null` must be safely narrowed.

SB01 execution chat must start with Phase 2A only: restore compile clean, rerun build/typecheck, inspect bounded diff, and checkpoint evidence before moving forward.

After Phase 2A, canonical sequence is:
`2B DB contract -> 2C HTTP + Stripe Test -> 2D webhook/reconciliation -> 2E entitlement/isolation -> 2F Control read projection`.

House must not implement those runtime steps itself unless explicitly reassigned; House reviews authority, gate evidence and boundary compliance.
## Lane B — Control Plane boundary

Control Plane worktree:
`/Users/wachirayachankhonkan/AI-Workspace/runtime/worktrees/control-plane-20260909`

Control Plane current HEAD:
`125af8435f4c80b9525c72405b44807206905fc5`

Canonical Control directive:
`docs/control-plane/OWNER-DIRECTIVE-BILLING-AUTHORITY-BOUNDARY-2026-09-11.md`

Owner lock:
**Control Plane is a control/observation surface, not a payment system.**

Allowed Billing-related work in Control:
- read authoritative projections from SB01;
- display subscription/payment status;
- health/readiness/availability;
- audit/observability and Owner-facing inspection.

Forbidden in Control:
- Checkout/Portal payment implementation;
- create/cancel/refund payment or subscription mutation;
- Stripe/provider adapter logic;
- billing webhook/reconciliation/ledger/state machine;
- entitlement mutation, provider secrets or billing DB writes.

Current adapter enforces `canExecutePaymentActions: false`; targeted tests are 5/5 PASS and typecheck PASS. If SB01 data is unavailable, Control must show unavailable/degraded, never invent billing truth.
## BK01 relationship to Central Billing

BK01 remains a **Compatibility-First Extraction** target, not a permanently separate billing architecture.

Preserve current BK01 billing while SB01 is immature. Use BK01 as capability/parity evidence for checkout, portal, webhook idempotency, provider re-fetch, ordering protection and subscription lifecycle.

Do not copy BK01-specific identifiers, tables, plans or business rules into Core.
Future migration sequence remains:
`Preserve -> Register Profile -> Facade -> Shadow/Parity -> Extract shared capabilities -> Retire duplicated plumbing after proof`.

BK01 merchant/customer PromptPay deposits are Booking business-payment domain and must remain separate from WSTERA SaaS subscription billing.

## Lane C — H3D shared-runtime House work

Separate House H3D worktree:
`/Users/wachirayachankhonkan/AI-Workspace/runtime/worktrees/house-h3d-h5-20260909`

Current H3D HEAD verified during handoff:
`d6707c0c96309f2f0efb8f83f00b5f34aee6d2b5`

Resume document:
`docs/platform/shared-runtime/BRIEF-CLAUDE-H3D-STATIC-ACCEPTANCE-REMEDIATION-2026-09-09.md`

H3D remains a separate gate lane. Do not mix H3D implementation commits into Billing worktrees. No live seed/DML/Auth/grant/hook mutation is authorized merely by this handoff.
## Instructions for the next House chat

On entry:
1. Read this handoff first.
2. Verify Git HEAD/status of House billing, Control Plane, SB01 and H3D before making claims.
3. Treat SB01 execution as delegated to its dedicated chat; House reviews evidence and prevents scope drift.
4. Enforce the Control Plane billing boundary; reject any attempt to implement a second payment engine there.
5. Keep BK01 extraction staged and evidence-driven; do not force migration before Core parity.
6. Keep H3D and Billing commits/worktrees separate.
7. Preserve file-backed brief/handoff discipline and commit/push House changes as evidence.

Do not reopen Council decisions merely because implementation is difficult. Escalate only when actual source/runtime evidence proves an architecture contradiction or Owner decision is required.

## Handoff verdict

`HOUSE CONTINUATION READY ON MAC`

At handoff time:
- Central Billing ownership/boundaries are systemized.
- SB01 has a dedicated repo/worktree and an explicit execution brief.
- Control Plane payment-development prohibition is recorded in both House and Control repositories.
- Mac has reproduced the SB01 Phase 2A baseline.
- H3D remains isolated in its own House worktree/gate lane.

The next House chat should coordinate, verify and gate these lanes rather than duplicate their implementation.
