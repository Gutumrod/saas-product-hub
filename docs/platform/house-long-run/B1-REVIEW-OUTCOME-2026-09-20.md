# B1 REVIEW OUTCOME — WSTERA-HOUSE-PRODUCTION-CLOSURE-001

Review Batch: **B1 — R15 Security Boundary**
Stage: T1 (R15 least-privilege preparation)
Reviewer: `agent-codex` (independent, INDEPENDENT-QA)
Revision reviewed: `6a9ca6ca724f817b322a8d83dcb540d97e7077fa`
Recorded: 2026-09-20 (Asia/Bangkok)

## Verdict

**`WORKER_FIX`** — 3 blocking findings, 3 non-blocking, 3 unsupported claims.

Reviewer confirmed the things that mattered most and that the architecture claims hold:

- House diff is **documentation-only**: no source, migration, role, grant, or revoke change.
- hub-web source at `125af843` verified: Worker uses `context.fetch.ts`; `context.ts` is imported
  only by the local `index.ts`; profile sync uses PostgREST.
- All T1 artifacts consistently describe preparation only — **no claim of production mutation**.

## Blocking findings and their disposition

### BLK-1 — `user_role` wrongly included in the required type privileges

Reviewer: `T1-R15-PUBLIC-PRIVILEGE-MATRIX.md:87-89,117-118` includes `user_role`, which belongs to
`public.profiles` — explicitly excluded. Production tables use only `product_status`, `asset_type`,
`installation_status`, `installation_source`. This violates the "no more" least-privilege rule.

**Verified true by Hermes against source:**
`user_role` declared at `drizzle/schema.ts:12`; used only at `schema.ts:44` (`profiles.role`).
Production tables use `product_status` (`:20`/`:67`), `asset_type` (`:21`/`:94`),
`installation_status` (`:28`/`:136`), `installation_source` (`:34`/`:139`).

**Root cause is a Hermes defect, not a worker defect.** `T1-CITATION-PACK.md §F` cited the whole
range `schema.ts:12-34` as the enum source, and that range spans the excluded enum. The write lanes
faithfully copied the supplied citation.

**Fix applied at source:** citation pack §F rewritten into F.1/F.2/F.3 with the enum list corrected
and `user_role` explicitly marked EXCLUDED, plus an errata entry (K-1). Matrix must be regenerated.

### BLK-2 — `SET search_path TO billing_core, public` cannot prove denial

Reviewer: `T1-R15-BILLING-DENY-MATRIX.md:149-151` treats this statement as an expected `42501`
denial. PostgreSQL accepts a `search_path` assignment without granting schema access, so the command
does not prove denial.

**Verified true.** Setting `search_path` is a session-level GUC change; it does not require `USAGE`
on the named schemas and does not raise `42501` merely because access is denied. The probe is
invalid as a denial proof and must be removed or replaced with an operation that actually attempts
schema access.

### BLK-3 — billing denial verification does not prove the stated invariant

Reviewer: the verification does not directly verify schema/object **ownership**, does not enumerate
**effective/transitive role membership**, and does not scan **object-level `PUBLIC` ACLs**. The
matrix claims stronger proof than its commands provide.

**Accepted.** Denial must be proven against the three ways access can leak: direct grant, inherited
membership, and default/`PUBLIC` ACL. The deny matrix must add those probes.

## Non-blocking findings

- **NB-1 — WU-05 attribution mislabel** (carried from the earlier WU-05 run, confirmed by B1).
  Quoted facts are present at `PORTFOLIO_PRODUCTION_MASTER_PLAN.md:896`, but not in citation pack
  §J. Facts correct, attribution wrong. **Fix applied at source:** pack §J.1 added with the verbatim
  Master Plan strings and the correct citation; errata K-2 recorded.
- **NB-2 — rollback is conditionally viable.** It depends on retaining the owner credential and on
  an external secret-update command. The packet already records these as execution-time
  prerequisites, so this is a recorded limitation, not a defect.
- **NB-3 — review was performed through exact git objects** because the working checkout was one
  commit ahead and carried unrelated untracked files. Correct and disclosed by the reviewer.

## Unsupported claims to remove when regenerating

1. "Only the operations listed in §4.1 are required" — unsupported while `user_role` is granted.
2. The claim that the listed billing runtime commands can prove denial (specifically the
   `SET search_path` expectation and the incomplete effective-privilege coverage).

## Untested areas carried forward (permanent)

- Live PostgreSQL privilege behaviour for the proposed `hub_web_app` role.
- **Whether FK checks involving `public.profiles` succeed without any profile privilege** — surfaced
  by Hermes as the `uploadedBy` / `recordedBy` foreign-key caveat (`schema.ts:100-102`, `:142`).
  Requires live verification before R15 apply; recorded as an open item, not a granted privilege.
- Actual existence/ownership state of `billing_core` and `billing_core_staging`.
- Actual runtime credential identity and Worker secret state.
- Actual deployment/rollback execution.

## Remedy (within the locked manifest)

Regenerate **two** artifacts with corrected citations, then re-review B1:

- `T1-WU03-B-PUBLIC-PRIVILEGE-MATRIX` — corrected enum list (`user_role` excluded), FK caveat noted.
- `T1-WU04-B-BILLING-DENY-MATRIX` — remove the invalid `SET search_path` probe; add ownership,
  effective-membership, and `PUBLIC`-ACL probes.

WU-05 (deploy/rollback) and WU-06 (RLS summary) are **not** regenerated: B1 raised no blocking
finding against their content. NB-1's attribution issue lives in WU-04's artifact, which is being
regenerated anyway.

Local-fix attempt counter for this issue cycle: **1/2**.
