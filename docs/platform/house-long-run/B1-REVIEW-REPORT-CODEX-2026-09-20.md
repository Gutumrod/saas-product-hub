VERDICT: WORKER_FIX

REVISION REVIEWED: 6a9ca6ca724f817b322a8d83dcb540d97e7077fa

CHECKS PERFORMED:

- Read dispatch packet and all required T1 artifacts.
- Verified exact House diff: documentation-only changes; no source, migration, role, grant, or revoke changes.
- Verified hub-web source at `125af843`: Worker uses `context.fetch.ts`; `context.ts` is imported only by local `index.ts`; profile sync uses PostgREST.
- Traced routers/webhook/database usage. Required table operations generally match, but the matrix includes unnecessary `user_role` type usage.
- Reviewed billing denial SQL. Catalog checks are partial; runtime command `SET search_path TO billing_core, public` does not prove denial and normally does not fail merely because schema usage is denied.
- Reviewed rollback. Sequence is conditionally viable if the owner credential remains valid, but rollback depends on an external secret-setting command and retained credential.
- Verified WU-05 attribution issue: quoted facts are present at `PORTFOLIO_PRODUCTION_MASTER_PLAN.md:896`, but not actually present in citation-pack §J. Facts are correct; attribution is wrong.

FINDINGS:

- Blocking — `T1-R15-PUBLIC-PRIVILEGE-MATRIX.md:87-89,117-118` includes `user_role` in the required type privileges. `user_role` belongs to `public.profiles`, which is explicitly excluded; production tables use `product_status`, `asset_type`, `installation_status`, and `installation_source`. This violates “no more” least privilege.
- Blocking — `T1-R15-BILLING-DENY-MATRIX.md:149-151` treats `SET search_path TO billing_core, public` as an expected `42501` denial. PostgreSQL can accept the search-path assignment without granting schema access; this command cannot prove denial.
- Blocking — The billing verification does not fully prove the stated denial invariant. It does not directly verify schema/object ownership, does not enumerate effective/transitive role membership, and does not scan object-level `PUBLIC` ACLs. The matrix claims stronger proof than the commands provide.
- Non-blocking — WU-05 attribution is mislabelled. The underlying R15 owner/deny/pre-data facts are true at `docs/platform/PORTFOLIO_PRODUCTION_MASTER_PLAN.md:896`, but citation-pack §J only reproduces a shorter citation and does not contain all quoted text.
- Non-blocking — Rollback is viable only conditionally. It depends on retaining the owner credential and supplying an external secret-update command; the packet correctly records these as execution-time prerequisites.
- Non-blocking — The current checkout is not at the reviewed SHA and contains unrelated untracked files. Review was therefore performed through exact git objects, not current working-tree state.

UNSUPPORTED CLAIMS:

- “Only the operations listed in §4.1 are required” is unsupported as written because the matrix grants the unnecessary `user_role` type usage.
- The claim that the listed billing runtime commands can prove denial is unsupported, specifically the `SET search_path` expectation and the incomplete effective-privilege coverage.
- No claim that production state was actually mutated is supported; all T1 artifacts consistently describe preparation only.

UNTESTED AREAS:

- Live PostgreSQL privilege behavior for the proposed `hub_web_app` role.
- Whether foreign-key checks involving `public.profiles` succeed without any profile privilege under the target PostgreSQL/Supabase configuration.
- Actual existence and ownership state of `billing_core` and `billing_core_staging`.
- Actual runtime credential identity and Worker secret state.
- Actual deployment and rollback execution.
- External confirmation that no database role/grant/migration was applied; repository evidence shows no such mutation in this stage.