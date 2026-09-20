# AGENT DISPATCH — B1 RE-REVIEW (R2) — WSTERA-HOUSE-PRODUCTION-CLOSURE-001

Agent: `agent-codex` (same independent reviewer)
Review Batch: **B1-R2 — R15 Security Boundary (re-review after WORKER_FIX)**
Stage: T1 (R15 least-privilege preparation)
Context mode: **INDEPENDENT-QA**
Recorded: 2026-09-20

## Why this re-review exists

You returned `WORKER_FIX` on B1 with 3 blocking findings against
`T1-R15-PUBLIC-PRIVILEGE-MATRIX.md` and `T1-R15-BILLING-DENY-MATRIX.md`. Those two artifacts have
been regenerated. This re-review covers **only the corrected artifacts and the fixes' correctness** —
it does not reopen WU-05/WU-06, which raised no blocking finding.

## Your blocking findings and what was changed

**BLK-1 — `user_role` wrongly granted.**
Root cause was a Hermes defect: `T1-CITATION-PACK.md §F` cited the whole range `schema.ts:12-34`,
which spans the excluded enum. The write lanes faithfully copied the bad citation.
Fixed at source: pack §F rewritten as F.1/F.2/F.3 with the enum list restricted to
`product_status`, `asset_type`, `installation_status`, `installation_source` and `user_role`
explicitly marked EXCLUDED; errata K-1 recorded. The matrix was regenerated from the corrected pack.

**BLK-2 — `SET search_path TO billing_core, public` cannot prove denial.**
The invalid probe was removed/replaced in the regenerated deny matrix.

**BLK-3 — denial verification did not prove ownership, effective/transitive membership, or
object-level `PUBLIC` ACLs.**
Those three probes were added to the regenerated deny matrix.

**NB-1 — attribution mislabel (carried into WU-04's artifact).**
Fixed at source: pack §J.1 added with the verbatim Master Plan strings and the correct citation
`docs/platform/PORTFOLIO_PRODUCTION_MASTER_PLAN.md:896`; errata K-2 recorded.

## Newly surfaced item for your judgement

Hermes surfaced a foreign-key caveat while preparing the fix round. Verify it independently:

- `apps/hub-web/server/routers.ts:388` sets `uploadedBy: ctx.user.id` (production tRPC procedure).
- `apps/hub-web/server/routers.ts:406` sets `recordedBy: ctx.user.id` (production tRPC procedure).
- `apps/hub-web/drizzle/schema.ts:100-102` — `product_assets.uploadedBy` references `profiles.id`
  with `ON DELETE RESTRICT`, `.notNull()`.
- `apps/hub-web/drizzle/schema.ts:142` — `product_installations.recordedBy` references `profiles.id`
  with `ON DELETE SET NULL`.

So the production direct-Postgres runtime **does** write values that trigger a referential-integrity
check against `public.profiles`, even though it never issues a `SELECT` on `profiles` itself.

Question for you: does the Owner's exclusion of `public.profiles` from the `hub_web_app` grant set
remain correct and safe, given this? Consider at least:
(a) whether PostgreSQL referential-integrity checks run with the referenced table owner's
    privileges (so no grant on `profiles` is needed by the inserting role), and
(b) whether RLS applies to the referential-integrity query in the target PostgreSQL/Supabase
    configuration, and what `ON DELETE RESTRICT` / `SET NULL` imply for delete paths.

If the answer is not determinable from source alone, say so explicitly and classify it as a live
verification requirement rather than asserting either way. Do **not** treat this as a licence to
widen the grant set.

## Revision under review

`Gutumrod/saas-product-hub` branch `work/house-production-closure-longrun-20260919`
T1 fix revision: see `TASK-WSTERA-HOUSE-PRODUCTION-CLOSURE-001.md` `Current Commit` at the moment
of review; the regenerated artifacts and the corrected citation pack are the delta since
`6a9ca6ca724f817b322a8d83dcb540d97e7077fa`.

Files to read:
- `docs/platform/house-long-run/T1-R15-PUBLIC-PRIVILEGE-MATRIX.md` (regenerated)
- `docs/platform/house-long-run/T1-R15-BILLING-DENY-MATRIX.md` (regenerated)
- `docs/platform/house-long-run/T1-CITATION-PACK.md` (corrected: §F.1-3, §J.1, §K errata)
- `docs/platform/house-long-run/B1-REVIEW-OUTCOME-2026-09-20.md` (your findings + dispositions)
- `docs/platform/house-long-run/T1-RLS-DECISION-RECORD-2026-09-20.md` (binding Owner ruling)
- `docs/platform/house-long-run/T1-R15-DEPLOY-ROLLBACK-PLAN.md` (unchanged, no blocking finding)
- `docs/platform/house-long-run/T1-R15-RLS-DECISION-SUMMARY.md` (unchanged, no blocking finding)

## Required verdict (LONG_RUN contract)

Exactly one of:

```text
BATCH_APPROVED
WORKER_FIX
SENIOR_REMEDIATION_REQUIRED
OWNER_DECISION_REQUIRED
STOP
```

## Prohibited

- No file modification. Read-only review.
- No secret values in the report.
- Do not repair findings.
