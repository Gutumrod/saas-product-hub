# HANDOFF — SB01 Central Billing / Windows to Mac

**Date:** 2026-09-09 (Asia/Bangkok)
**Status:** `REMOTE-READY / MAC WORKTREE PENDING DEVICE ONLINE`

## Source checkpoints

House coordination branch:
`work/billing-core-systemize-20260909`

House commit containing canonical system map + continuation brief:
`0a2556deadd21898e126aae973c51def63c05b7e`

SB01 runtime branch:
`feature/central-billing-phase2-runtime`

SB01 runtime checkpoint:
`4441645991f30f73a4f103f48af29b686a5890c5`

Both remote branches are pushed. House is clean `0/0`. SB01 tracked branch is `0/0`; Windows SB01 has only pre-existing untracked `docs/`, which must not be swept into Phase 2 work.
## Canonical files to open first on Mac

House system map:
`docs/platform/billing-core/CANONICAL-BILLING-SYSTEM-MAP-2026-09-09.md`

Execution brief:
`docs/platform/billing-core/BRIEF-SB01-WSTERA-CENTRAL-BILLING-CONTINUATION-2026-09-09.md`

The new SB01 execution chat must use those files as the brief/source-of-truth. Do not reconstruct the brief from chat memory.

## Expected Mac worktrees

House:
`/Users/wachirayachankhonkan/AI-Workspace/runtime/worktrees/house-billing-core-20260909`

SB01:
`/Users/wachirayachankhonkan/AI-Workspace/runtime/worktrees/sb01-central-billing-20260909`

Create/fetch them from the exact remote branches above. Verify exact SHAs before implementation.
## Verified execution baseline

From SB01 `platform/runtime/` on Windows:
- `npm ci --ignore-scripts` PASS; audit reported 0 vulnerabilities.
- `npm run build` exits 2.
- `npm run typecheck` exits 2.

Exactly three compile defects remain:
1. `src/db.ts:131` JSONValue typing.
2. `src/db.ts:258` JSONValue typing.
3. `src/runtime.ts:239` nullable `providerCustomerId` invariant.

The first Mac implementation checkpoint is Phase 2A only: fix these without unsafe casts/scope expansion, then build/typecheck/tests and checkpoint.

## Machine/security rules

- Do not copy `.env` or secret files from Windows ad hoc.
- Resolve approved Test credentials through the canonical secret process only when the later provider-test phase requires them.
- No live Stripe key, live charge, production deploy or production DB mutation.
- WSTERA LAB is the proving DB only when the relevant Phase 2 DB/runtime step is reviewed and authorized.
- Control Plane remains a downstream read-only Billing consumer.
- BK01 remains authoritative for BK01 until compatibility/parity extraction gates pass.
## Mac acceptance before declaring machine switch complete

On Mac, verify:
- House SHA matches the latest pushed House billing branch.
- SB01 SHA matches the latest pushed SB01 runtime branch.
- both worktrees have expected upstream/parity and no unintended tracked dirt.
- install/runtime toolchain is present.
- SB01 build/typecheck reproduces the same 3 known errors before any source edit.

Only after that baseline reproduction should Mac become the active SB01 execution machine.

Windows remains the prior checkpoint source until the Mac baseline is verified. No new Windows SB01 implementation should start after the switch.
