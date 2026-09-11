# SB01 Mac Handoff Acceptance Evidence

**Date:** 2026-09-11 (Asia/Bangkok)
**Mode:** WSTERA HOUSE / SB01 MACHINE HANDOFF VERIFICATION
**Verdict:** `MAC HANDOFF ACCEPTED / PHASE 2A READY`

## Canonical checkpoints

House remote branch:
`work/billing-core-systemize-20260909`

House accepted source commit before this receipt:
`f57ddc46c291152ed2d2d99a794b9d54a136803d`

SB01 remote branch:
`feature/central-billing-phase2-runtime`

SB01 runtime checkpoint:
`4441645991f30f73a4f103f48af29b686a5890c5`

Both Mac worktrees were created directly from these remote branches and verified at `0/0` parity before execution.
## Mac paths

House worktree:
`/Users/wachirayachankhonkan/AI-Workspace/runtime/worktrees/house-billing-core-20260909`

SB01 worktree:
`/Users/wachirayachankhonkan/AI-Workspace/runtime/worktrees/sb01-central-billing-20260909`

Runtime path:
`/Users/wachirayachankhonkan/AI-Workspace/runtime/worktrees/sb01-central-billing-20260909/platform/runtime`

Toolchain observed:
- Node `v22.22.3`
- npm `10.9.8`
- Git `2.50.1 (Apple Git-155)`

No `.env` or `.env.local` existed in the SB01 runtime worktree. No secret material was copied from Windows.
## Reproduced runtime state on Mac

`npm ci --ignore-scripts` -> PASS

`npm audit` -> 0 vulnerabilities

`npm run build` -> EXIT 2

`npm run typecheck` -> EXIT 2

The exact three known Phase 2A TypeScript defects reproduced:
1. `src/db.ts(131,47)` — `Record<string, unknown>` is not assignable to postgres `JSONValue`.
2. `src/db.ts(258,26)` — same `Record<string, unknown>` to `JSONValue` mismatch.
3. `src/runtime.ts(239,9)` — `string | null` cannot be assigned where `string` is required for `providerCustomerId`.

This matches the Windows checkpoint. No new Mac-only compiler defect was observed.
## Resume point

The next SB01 implementation chat must begin from:
`BRIEF-SB01-WSTERA-CENTRAL-BILLING-CONTINUATION-2026-09-09.md`

Immediate execution scope is **Phase 2A only**:
- fix the three reproduced TypeScript defects;
- rerun build + typecheck;
- review the exact diff;
- do not expand into DB migration, Stripe Test HTTP execution, webhook mutation, entitlement activation, BK01 extraction, or production deployment before the corresponding gates.

Control Plane remains a read-only downstream consumer contract. BK01 remains the compatibility/parity source and future staged extraction target. Central Billing Core remains the single billing authority.

No LAB DB mutation, Stripe provider mutation, live charge, production deploy, or Product entitlement mutation was performed during this Mac handoff verification.