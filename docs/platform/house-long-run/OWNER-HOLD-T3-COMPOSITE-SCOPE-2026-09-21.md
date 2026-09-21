# OWNER HOLD — T3 remaining work requires a scope decision

Task: `WSTERA-CONTROL-TRUTH-SYNC-001` · Workflow `WF-DEV-01 v1.3.0 / LONG_RUN`
Held: 2026-09-21 (Asia/Bangkok) · Held by: Hermes (Long-Run Orchestrator / Coordinator / State Holder)
State: **`OWNER_HOLD_T3_COMPOSITE_SCOPE`** — the run is stopped, not failed.

One decision is required before T3 can be completed. Hermes holds no authority to resolve it, and
nothing was advanced past the gate while it is open.

## What is already done and pushed

| Revision | Repo | Content |
|---|---|---|
| `fbd3a6274d7ae0100c198f32ce6e952d47940ad1` | hub-web | explicit work-scope contract + F1 overload closure |
| `393af8eac1633f2bb68038a89ddd3bd3062710cf` | hub-web | T3-WU01 production demo substitution removed from service/repo/command path |
| `a507711abde950ba4a8b8a4615cb2d5010522e74` | saas-product-hub | R1 verdict + raw reviewer output |

All pushed, remote parity `0/0`. Draft PR #2 remains OPEN + DRAFT + unmerged.

**R1 = `BATCH_APPROVED`** (Codex, independently reproduced). T3-WU01 verified by the commander:
typecheck PASS, full suite **430/430 PASS**, exactly the in-scope files changed, and the test
assertions were **strengthened** (45 → 52 failure/negative assertions) — the billing-action test now
demands fail-closed rejection where it previously asserted fabricated success.

## The decision required

The manifest lists T3 as **three builder work units plus a tester and an evidence unit**
(`RUN-MANIFEST-WSTERA-CONTROL-TRUTH-SYNC-001.md` §8):

- `T3-WU01` — Overview/Customers/Billing/Operations production paths use production-safe
  live/empty/degraded adapters; no default `DemoControlPlaneRepository`. **(DONE)**
- `T3-WU02` — Owner Inbox, Agent Activity, Portfolio Gates and UI defaults truth-preserving; no
  demo fallback in production. **(NOT STARTED)**
- `T3-WU03` — disable simulation-only command success in production; do not activate payment/billing
  mutation. **(NOT STARTED — partially covered: the fake command success path was already neutralised
  by the WU01 change, but the explicit simulation-only-command disabling is not done)**
- `T3-WU04` — production dependency-closure and runtime-mode tests. **(NOT STARTED)**
- `T3-WU05` — evidence packet. **(NOT STARTED)**

**The problem.** T3-WU02 alone spans the three truth routers
(`owner-inbox-router.ts`, `agent-activity-router.ts`, `portfolio-gates-router.ts`) **plus** the client
UI (`PlatformControlPlane.tsx` and four tab components). That is two distinct repositories' worth of
surface — server truth modes and client rendering — and it is a composite unit.

I have now measured, twice, on this exact host and model, that a **composite builder packet does not
complete**:

1. The original composite `T3-WU01` (4 change requirements across 4+ files, requiring a 64 KB spec
   read first) **timed out at 1700 s with zero mutation**. Per `RUN-MANIFEST` §2 an initial failure is
   an observation, so it consumed no repair budget — but it produced nothing.
2. The same work, split into **narrow single-objective units**, succeeded twice in a row
   (`T3-WU01a` then `T3-WU01b`), each completing in roughly 20–30 minutes.

The skill's own routing rule agrees: "Composite work must be split into separate work units before
routing."

**Dispatched as one `T3-WU02` unit, it will almost certainly time out the same way**, and repeated
timeouts are exactly the failure mode the run's retry budget exists to prevent. But T3-WU02 in the
manifest is **counted as one work unit**, and splitting a manifest-declared work unit changes the
stage's declared unit set. That is a **governance change**, not a technical one — so I will not make
it unilaterally.

## Options

1. **Authorize splitting T3-WU02 into narrower units** (server-side truth modes as one unit;
   client UI truth modes as a second), and treat the extra units as a re-expression of the same
   manifest work unit rather than a scope expansion. Recommended.
2. **Keep T3-WU02 as a single unit** and accept the measured risk of a 1700 s timeout with no
   mutation; on timeout it is an observation, and I re-attempt with a larger lane timeout and/or a
   larger turn budget.
3. **Re-scope T3**: name exactly which T3 items you still want inside this run, and defer the rest.

## Why this is an Owner decision and not mine

The Run Manifest is the locked **plan truth**. I may hold state, dispatch bounded work, run
deterministic checks and persist evidence. I may not reinterpret or expand the governing brief, and
splitting a declared work unit into a different unit set is a change to the plan — which the manifest
reserves to the review/Owner boundary.

## Standing at this hold

Nothing committed beyond the three revisions above. No database contacted. No migration applied. No
production mutation. Draft PR #2 unmerged. No `PRODUCTION_READY`, no `OPERATED_STABLE`, and no stage
PASS asserted by Hermes on its own authority.

**To resume:** answer with an option (1, 2 or 3) and T3 continues immediately.
