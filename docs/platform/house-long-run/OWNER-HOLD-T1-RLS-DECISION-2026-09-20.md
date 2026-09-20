# OWNER_HOLD — WSTERA-HOUSE-PRODUCTION-CLOSURE-001 — T1

Task ID: `WSTERA-HOUSE-PRODUCTION-CLOSURE-001`
Stage: T1 (R15 least-privilege preparation)
Review Batch: B1 (not yet reached)
Hold type: **OWNER_DECISION_REQUIRED** (genuine architecture/security authority boundary)
Recorded: 2026-09-20 (Asia/Bangkok)
Orchestrator: Hermes
Classifier: `agent-codex` (independent)

## Why the run stopped here

Per the Brief's Mandatory STOP / OWNER_HOLD list and the Run Manifest Stop Conditions, a stop is
required when a **genuine architecture/security/business authority gap** exists or when the
**reviewer returns `OWNER_DECISION_REQUIRED`**. Both occurred. This is not a normal technical
failure and is not something Hermes may resolve by choosing an option.

Codex's independent classification (verbatim verdict): `OWNER_DECISION_REQUIRED`.

## The decision required from Owner

**R15 requires the Hub runtime to move to a dedicated `hub_web_app` login role. The current
`public.profiles` table has RLS enabled with policies granted only to `authenticated` and
`service_role`. No `hub_web_app` policy exists. The locked R15 contract does not state which
mechanism `hub_web_app` is intended to use, and the three options have materially different
security consequences.**

Verified source facts supporting this:

| Fact | Evidence |
|---|---|
| RLS is enabled on `public.profiles` | `apps/hub-web/drizzle/migrations/0001_rbac_roles.sql:22` (`ALTER TABLE profiles ENABLE ROW LEVEL SECURITY`) |
| Policy `profiles_self_read` targets `authenticated` only | `.../0001_rbac_roles.sql:30-33` (`auth.uid() = id`) |
| Policy `profiles_internal_read` targets `authenticated` only | `.../0001_rbac_roles.sql:36-45` |
| Policy `profiles_service_write` targets `service_role` only | `.../0001_rbac_roles.sql:48-52` |
| `public.profiles` is genuinely used by the runtime | `apps/hub-web/drizzle/schema.ts:40-48`; `apps/hub-web/server/db.ts:83-86` (insert/upsert), `:100` (select) |
| R15 role boundary is locked but the RLS mechanism is not | `docs/platform/PORTFOLIO_PRODUCTION_MASTER_PLAN.md:896` |
| Runtime reaches Postgres directly (Path A) AND via PostgREST (Path B) | `server/db.ts:1-3,20,23-34`; `_core/supabaseAdmin.ts:9-21`; `control-plane/adapters/control-db.ts:13-20` |

### The three candidate options (Owner must choose; Hermes must not)

1. **Add an explicit RLS policy for `hub_web_app`** scoped to exactly the rows the runtime needs.
   Preserves fail-closed posture. Requires defining the row predicate, which is a data-access
   policy decision.
2. **Grant `BYPASSRLS` to `hub_web_app`.** Lets the role see all rows in `public.profiles`.
   Simplest operationally, but weakens the least-privilege and fail-closed posture that R15 exists
   to establish — this directly conflicts with the spirit of the R15 control in the Master Plan.
3. **Keep RLS fully in force and route the runtime's `profiles` access through a path that already
   holds the required privilege** (i.e. treat `hub_web_app` as the direct-Postgres path only, and
   keep `service_role`/`authenticated` semantics for PostgREST). Requires deciding whether the
   direct-Postgres path is even the intended production shape.

Additionally unresolved: whether `hub_web_app` is intended to be the PostgREST/`authenticated`
path or a direct-Postgres path at all. The current code has **two** DB access paths, and the Master
Plan line does not disambiguate them.

## Secondary defect surfaced (separate scoped task proposed, not created)

Both swarm lanes reported aggregate `lane state: SWARM_WORK_UNIT_PASS` while carrying
`worker_report.state: FAIL`, `commander_checks: []` and `artifacts: []`.

- Hermes rejected acceptance because the required deliverable did not exist, so **no false PASS
  entered this task's result**.
- However, any consumer trusting the aggregate state field could accept a false PASS.
- Codex concurs: "Separate scoped Hermes v0.1.0 defect task is warranted… The aggregate state must
  be fail-closed on worker failure or missing artifact/checks."
- **Proposed, not created:** a scoped task against `hermes-native-swarm` v0.1.0 to make aggregate
  state fail-closed. `hermes-native-swarm` is a released artifact; per skill governance, no change
  is made here, and no skill is created or modified without Owner approval. Flagged for Owner.

## What the two failed lanes did achieve (valuable, preserved)

Attempt 1 delivered the complete hub-web DB access inventory with file:line evidence (both access
paths, required SELECT/INSERT/UPDATE per table, absence of any `CREATE`/`ALTER`/`DROP`/`DELETE` in
server code, identity-sequence `USAGE` requirement, all six migrations, `wrangler.jsonc` having no
`vars`). Attempt 2 re-verified all of it at the packet revision and surfaced the RLS gap above.

Preserved in:
- `docs/platform/house-long-run/T1-WU01-CARRYFORWARD-FINDINGS.md`
- `docs/platform/house-long-run/CHAIN-FAILURE-T1-SWARM-BUDGET-2026-09-20.md`

## Authorized remedy shape (Codex, to be applied after the Owner decides)

Do **not** rerun inspection or re-verification. Once the RLS mechanism decision is made, dispatch
four small write-only lanes with citations supplied in the packet and **no re-verification burden**:

1. public privilege matrix
2. billing-core deny matrix (`billing_core`, `billing_core_staging`)
3. deploy/rollback and verification plan
4. explicit RLS decision-gap record (recording the Owner's ruling)

Capability class `evidence_preparation`, `max_turns 8` per lane, one small artifact per lane.
A coordinator assembles them rather than asking one worker to author the entire R15 document.

## Counters

```
Issue Fingerprint: SWARM_WORKER_TURN_BUDGET_EXHAUSTED_BEFORE_DELIVERABLE_WRITE
  (fingerprint confirmed correct by Codex)
Local Fix Attempts: 2/2 (PERMITTED BUDGET EXHAUSTED — no attempt 3)
Reviewer Remediation Attempts: 0/2
Senior Escalations: 0/1 (no escalation warranted; the blocker is an authority decision,
  not a difficult-remediation problem)
```

## State of the repository (verify-at-resume)

```
House branch/HEAD : work/house-production-closure-longrun-20260919
T0 content        : 28f571d  (B0 BATCH_APPROVED, 0 blocking)
Worktree          : D:\AI-Workspace\projects\saas-product-hub
Mutating lanes    : none reached the write step; no source mutation, no DB mutation,
                    no role/grant change, no secret read or printed
```

## Next allowed action

Owner rules on the `public.profiles` RLS / `hub_web_app` mechanism decision. On that ruling, T1
resumes with the four-lane write-only remedy shape above, then proceeds to B1 independent review.

No further T1 dispatch occurs before that ruling.
