# AGENT DISPATCH — B1 Independent Review — WSTERA-HOUSE-PRODUCTION-CLOSURE-001

Agent: `agent-codex` (independent batch reviewer)
Review Batch: **B1 — R15 Security Boundary**
Stage: T1 (R15 least-privilege preparation)
Critical focus (Run Manifest): DB owner removal, least privilege, billing schema denial, rollback
Context mode: **INDEPENDENT-QA**
Recorded: 2026-09-20

## Exact revision under review

Repository: `Gutumrod/saas-product-hub`
Branch: `work/house-production-closure-longrun-20260919`
Revision: `6a9ca6ca724f817b322a8d83dcb540d97e7077fa`
Worktree: `D:\AI-Workspace\projects\saas-product-hub`
Remote parity: equal to `origin/work/house-production-closure-longrun-20260919`
Hub/Control: `Gutumrod/hub-web` @ `work/house-platform-closure-20260919` = `125af843` (**unchanged**)

## What T1 produced

Four evidence artifacts, no source change, no production mutation:

| Artifact | Work unit |
|---|---|
| `docs/platform/house-long-run/T1-R15-PUBLIC-PRIVILEGE-MATRIX.md` | T1-WU03 |
| `docs/platform/house-long-run/T1-R15-BILLING-DENY-MATRIX.md` | T1-WU04 |
| `docs/platform/house-long-run/T1-R15-DEPLOY-ROLLBACK-PLAN.md` | T1-WU05 (R2) |
| `docs/platform/house-long-run/T1-R15-RLS-DECISION-SUMMARY.md` | T1-WU06 |

Supporting: `T1-RLS-DECISION-RECORD-2026-09-20.md` (Owner ruling, binding),
`T1-CITATION-PACK.md` (pre-verified citations supplied to the write lanes),
`CHAIN-FAILURE-T1-SWARM-BUDGET-2026-09-20.md`, `T1-CLASSIFICATION-REPORT-CODEX-2026-09-20.md`,
`OWNER-HOLD-T1-RLS-DECISION-2026-09-20.md` (the hold that this ruling closed).

## B1 questions to answer

1. **Owner ruling fidelity.** Does the package implement the Owner's OPTION 3 ruling exactly:
   `hub_web_app` = scoped direct-Postgres application role only; keep RLS enabled on
   `public.profiles`; no `BYPASSRLS`; no new `hub_web_app` RLS policy; `hub_web_app` must not
   require production access to `public.profiles`; production auth/profile sync stays on the
   Supabase/PostgREST path; the direct-Postgres `context.ts -> db.upsertProfile/getProfileById`
   path is non-production/local?
2. **Least-privilege correctness.** Is the public-object privilege set in the privilege matrix
   exactly the set the production direct-Postgres runtime requires — no more (no ownership, no
   `CREATE`, no `ALTER`, no `DROP`, no `DELETE`, no escalating membership) and no less (are
   SELECT/INSERT/UPDATE and the sequence/enum/index requirements correct)?
3. **Exclusion correctness.** Is excluding `public.profiles` from the grant set actually safe?
   Independently verify that no production code path uses the direct-Postgres `profiles` path.
4. **Billing denial.** Is the deny requirement for `billing_core` and `billing_core_staging`
   explicit, and are the proposed verification command forms actually capable of proving or
   falsifying denial?
5. **Rollback viability.** Is the deploy sequence safe and is the rollback sequence genuinely able
   to return to the prior credential/role state? Is the pre-transition baseline requirement
   adequate? Any single point of irreversible failure?
6. **Carried finding — attribution mislabel.** The previous WU-05 run reported that
   `T1-R15-BILLING-DENY-MATRIX.md` attributes certain quoted strings to "citation pack §J" which
   are not present in `T1-CITATION-PACK.md`; they come from
   `docs/platform/PORTFOLIO_PRODUCTION_MASTER_PLAN.md:896`. Verify this. Decide whether the
   underlying facts are correct despite the mislabel, and whether this is blocking.
7. **Scope discipline.** Did T1 change any source file, apply any role/grant/migration, or touch a
   product repository? Confirm from the diff.
8. **Any unsupported claim** in the four artifacts, including any implied production-readiness or
   applied-state claim (T1 is preparation only; nothing has been applied).

## Authorized review surface

Read-only. May read the four artifacts, the decision record, the citation pack, the T1 chain-failure
and classification reports, hub-web source, and git objects of the reviewed revision. Must not
modify any file.

## Verification starting points (do not take on trust)

```
git merge-base --is-ancestor 1556d8a29ce5fa2f408bed981f26d9ef7d61aa33 6a9ca6ca724f817b322a8d83dcb540d97e7077fa
git diff --name-status 28f571de053c6a7433268e707fe9b9244162d31a..6a9ca6ca724f817b322a8d83dcb540d97e7077fa
apps/hub-web/server/_core/context.fetch.ts:3-4,16-17
apps/hub-web/server/_core/context.ts:48,54
apps/hub-web/server/_core/index.ts:7,94-95
apps/hub-web/server/routers.ts:10-19
apps/hub-web/server/webhooks/productEvents.ts:2
apps/hub-web/drizzle/migrations/0001_rbac_roles.sql:22,30-33,36-45,48-52
```

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
- Do not repair findings (they return to the responsible worker/Hermes).
