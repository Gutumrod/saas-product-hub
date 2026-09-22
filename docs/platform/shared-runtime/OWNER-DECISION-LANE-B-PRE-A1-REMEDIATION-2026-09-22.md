# OWNER DECISION — LANE B PRE-A1 REMEDIATION PACKAGE

Date: 2026-09-22
Task: `HOUSE-SHARED-RUNTIME-LANE-B-CLOSURE-001`
Decision: **AUTHORIZED WITH CORRECTION**
Authority scope: source/design/test/evidence only before `OWNER-CP-H3D-A1`

## 1. Basis

This decision responds to:

`ANALYSIS-LANE-B-LONG-RUN-BLOCKERS-2026-09-22.md`

and the controller proposal to prepare in one controller unit:

1. a credential strategy for the remaining Lane-B run;
2. a remediation brief for the three open H3D findings;
3. a resolution of the claimed H2/H4 contradiction.

Items 1 and 2 are approved.

Item 3 is corrected below.

## 2. Correction — H2 and H4 are not currently contradictory

The analysis misread the H4 hard-stop clause.

The existing long-run brief says the run must STOP if:

`H4 disposable product requires a direct DB LOGIN credential or product-controlled global migration authority`

That sentence is a prohibition / hard-stop condition, not a requirement that H4 use direct LOGIN.

The canonical H2 design requires:

- product runtime roles = `NOLOGIN`;
- product migration roles = `NOLOGIN`;
- no reusable direct product DB LOGIN credential;
- H4 must test only interfaces actually available to a product.

The prepared H4 forward SQL is consistent with H2:

- `h4_migrator = NOLOGIN`
- `h4_runtime = NOLOGIN`
- forward/rollback is executed through the platform-owned lane.

Therefore Claude MUST NOT redesign H4 around a direct product DB LOGIN credential.

Instead, Claude shall perform a **H2/H4 consistency re-verification** and persist a correction note confirming whether the current H4 brief, SQL, probe harness, token-issuance path and teardown all preserve the H2 boundary. Any real inconsistency discovered during that re-verification becomes a new finding; do not manufacture one from the misread sentence.

## 3. Authorized controller unit

Claude may perform one bounded controller/design unit now containing:

### A. Run-wide credential strategy

Write one durable credential policy for all remaining stages.

It must define, per stage:

- credential/role shape required;
- whether the role is read-only, write-scoped, Auth-admin/operator, platform-admin, or product-facing;
- exact privilege boundary;
- creation authority;
- injection method;
- verification method;
- explicit revoke list;
- teardown/drop order;
- whether the credential/role is ephemeral;
- prohibition on persisting secret values;
- evidence allowed to record only non-secret metadata;
- how Supabase managed-ACL behaviour and RLS measurability are handled;
- how no-product-direct-LOGIN invariants are preserved.

The policy may define future ephemeral roles/runbooks but MUST NOT create or mutate any LAB role/credential under this authorization.

### B. Three-finding remediation brief

Prepare one execution brief that closes, before `H3D-A1`:

1. `F-GATE-RLS-COUPLING`
2. `F-CATALOG-PROVENANCE`
3. `auth.users` measurability

The brief must make each acceptance check non-vacuous and falsifiable.

At minimum:

- no RLS-blind zero may be treated as proof of zero residue;
- schema/catalog drift capture must be separated from RLS-protected data claims where needed;
- project/database provenance must be measured, not stamped from a literal;
- Auth-identity residue must have a measurable platform-supported proof path before any stage creates Auth identities;
- negative/falsification controls must prove each measurement would fail under the wrong target or hidden residue.

### C. H2/H4 consistency re-verification

Review the existing H4 design/forward/rollback/probe assets against H2.

Output one durable correction/verification document with:

- exact files/revisions inspected;
- whether current H4 remains `NOLOGIN`-preserving;
- any actual gap found;
- exact remediation if a real gap exists;
- no live H4 mutation.

## 4. Execution after Claude's controller unit

After Claude persists the controller package:

1. **Codex reviews the Claude-authored controller package before AGY implementation.**
   - This is required because Claude authored design/security contract changes.
   - Codex must verify evidence-vs-reality claims, not only code shape.

2. If Codex PASSes without mutation:
   - Claude checks the exact reviewed revision and dispatches AGY.

3. If Codex mutates the controller package:
   - the new exact SHA returns to Claude;
   - `CLAUDE_REVIEW_PASS` is required before AGY dispatch.

4. **AGY performs all ordinary source/tool/test/evidence remediation** for the three findings.
   - No live LAB role/Auth/DML/config mutation is authorized in this remediation unit.
   - AGY must verify actual diffs and deterministic gates; executor prose is not evidence.

5. Codex reviews the exact AGY revision.
   - Codex may apply bounded fixes.
   - If Codex mutates, Claude must review the new exact SHA before the unit can close.

6. Claude performs final consistency check.

If all three findings are closed at source/tooling/evidence-contract level and the credential strategy + H2/H4 verification are approved, advance to:

`OWNER-CP-H3D-A1`

and STOP for Owner authorization before any H3D-A1 live/rollback-only DML or ephemeral writable-role creation.

## 5. No extra Owner stops for this package

Do not return to Owner for routine questions inside this pre-A1 package.

Claude owns technical decomposition and may split AGY work into smaller single-objective units without changing the locked acceptance criteria.

Stop early only for:

- a genuinely new security/architecture decision not covered here;
- a required Production mutation;
- inability to prove one of the three findings closed without a live mutation that belongs to a later Owner checkpoint;
- secret exposure;
- unexplained cross-product/shared-runtime drift.

## 6. Standing throughput rules

- `H3D_OUT_DIR` must point outside the repo for gate evidence that would otherwise dirty the tree.
- Verify gate behaviour, not gate names.
- Do not rely on pooler/session settings as proof of read-only enforcement where measured behaviour disproves them.
- Teardown must use explicit mirrored REVOKEs; do not assume `DROP OWNED BY` can clean managed Supabase privileges.
- Executor reports are claims; compare every report to the actual diff/runtime evidence.
- Reviewer must inspect evidence claims against reality, not only source code.
- Preserve exact revision binding across every review.

## 7. Hard boundary

This decision authorizes planning, source/tool remediation, tests, evidence, commit and push only.

It does NOT authorize:

- H3D-A1 DML;
- creation of an ephemeral writable LAB role;
- H3D-LIVE Auth/grant/hook mutation;
- H3E role retirement;
- H4 disposable-product live mutation;
- Production mutation;
- BK01 Junction A retry.

Next Owner boundary:

`OWNER-CP-H3D-A1`
