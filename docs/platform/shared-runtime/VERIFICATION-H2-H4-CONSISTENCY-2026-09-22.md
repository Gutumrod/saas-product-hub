# VERIFICATION — H2 / H4 CONSISTENCY

Date: 2026-09-22
Task: `HOUSE-SHARED-RUNTIME-LANE-B-CLOSURE-001`
Author: Claude (Windows) — Lane-B controller
Authority: `OWNER-DECISION-LANE-B-PRE-A1-REMEDIATION-2026-09-22.md` §2, §3.C
Status: `CONTROLLER DRAFT REV3 — CORRECTS NEW-DEFECT-01 FROM CODEX ROUND 2 (REVIEW-CODEX-LANE-B-CONTROLLER-PACKAGE-ROUND2-2026-09-22.md) — AWAITING CODEX INDEPENDENT REVIEW`
Mutation: none. No H4 object was applied, and no LAB access was made.

## 1. Question

Do the current H4 brief, forward/rollback SQL, probe harness, token-issuance path and
teardown preserve the H2 boundary (product roles `NOLOGIN`, no reusable product DB
LOGIN, execution through the platform lane, H4 tests only product-available
interfaces)? This is a re-verification, not a redesign. Retracted finding A4 is not
re-opened.

## 2. Inspected — exact revision

Repo `github.com/Gutumrod/saas-product-hub`, branch `work/house-h3d-h5-20260909`,
`2b1af861aa608f08abb0bd8224821b9ca5ac9981`.

**Correction (Codex round 1, DEFECT-01):** the claim "the H4 files were last changed
at `7ab7b6c` and are unchanged in `d6707c0..2b1af86`" was false for one file in the
table. Verified independently:

```
git log d6707c0..2b1af86 -- docs/platform/shared-runtime/OPERATOR-ACTION-PACK-H3D-TO-H5-2026-09-09.md
  -> 2c1ef3a044b0d31ed09efeb0c416583936eb3759
```

`2c1ef3a` is the H3D-S commit; the change to this file is confined to the H3D section
(the catalog-manifest command syntax correction, `--verify` usage), not to the §H4
block.

**Second correction (Codex round 2, NEW-DEFECT-01):** the round-1 fix above still
claimed the other seven files share one last-change commit (`7ab7b6c`). That is false
for the Design doc. Re-verified per file, individually — no shared-SHA claim:

```
git log -1 --format='%H %s' -- docs/platform/shared-runtime/DESIGN-H2-SHARED-RUNTIME-ISOLATION-EXECUTION-BOUNDARY-2026-09-08.md
  -> c0d95b532ffc447b59cbc72c3cfa5c3cca1a0df8 docs(platform): lock H2 isolation execution boundary
git log -1 --format='%H %s' -- docs/platform/shared-runtime/BRIEF-H4-DISPOSABLE-PRODUCT-PROOF-2026-09-09.md
  -> 7ab7b6c471c227b24364b7d92d32ae7bfb421f07 docs(platform): prepare H4 + H5 packages + consolidated operator pack
git log -1 --format='%H %s' -- docs/platform/shared-runtime/migrations/h4_disposable_product_forward.sql
  -> 7ab7b6c471c227b24364b7d92d32ae7bfb421f07 (same)
git log -1 --format='%H %s' -- docs/platform/shared-runtime/migrations/h4_disposable_product_rollback.sql
  -> 7ab7b6c471c227b24364b7d92d32ae7bfb421f07 (same)
git log -1 --format='%H %s' -- tools/shared-runtime/h4/h4-probe-harness.mjs
  -> 7ab7b6c471c227b24364b7d92d32ae7bfb421f07 (same)
git log -1 --format='%H %s' -- tools/shared-runtime/h4/h4-privilege-snapshot.sql
  -> 7ab7b6c471c227b24364b7d92d32ae7bfb421f07 (same)
git log -1 --format='%H %s' -- docs/platform/shared-runtime/evidence/H4-DISPOSABLE-PRODUCT-PROOF-2026-09-09.md
  -> 7ab7b6c471c227b24364b7d92d32ae7bfb421f07 (same)
```

So: six of the seven files (everything except the Design doc) share last-change
`7ab7b6c`; the Design doc's last change is the earlier `c0d95b5` ("lock H2 isolation
execution boundary"). What matters for this unit is not the shared-SHA claim but
**presence in the reviewed range**, which is independently confirmed for all seven:

```
for f in DESIGN-H2-SHARED-RUNTIME-ISOLATION-EXECUTION-BOUNDARY-2026-09-08.md \
         BRIEF-H4-DISPOSABLE-PRODUCT-PROOF-2026-09-09.md \
         migrations/h4_disposable_product_forward.sql \
         migrations/h4_disposable_product_rollback.sql \
         ../../../tools/shared-runtime/h4/h4-probe-harness.mjs \
         ../../../tools/shared-runtime/h4/h4-privilege-snapshot.sql \
         evidence/H4-DISPOSABLE-PRODUCT-PROOF-2026-09-09.md; do
  git log --oneline d6707c0..2b1af86 -- "$f"
done
# -> empty for all seven — none of them changed in the reviewed range,
#    regardless of when each was last touched before it
```

The §H4 block of the operator pack itself (lines 154-176, including the `Agent: psql -f`
instructions DEFECT-09/G-H4-5 address below) is unchanged in the range; only the
unrelated H3D-section line moved. The table below is re-read at `2b1af86` directly,
not carried over from any prior commit.

| File | Role |
|---|---|
| `docs/platform/shared-runtime/DESIGN-H2-SHARED-RUNTIME-ISOLATION-EXECUTION-BOUNDARY-2026-09-08.md` | boundary definition (§Security Invariants 1–10, §H4) |
| `docs/platform/shared-runtime/BRIEF-H4-DISPOSABLE-PRODUCT-PROOF-2026-09-09.md` | H4 execution design |
| `docs/platform/shared-runtime/migrations/h4_disposable_product_forward.sql` | forward |
| `docs/platform/shared-runtime/migrations/h4_disposable_product_rollback.sql` | rollback / teardown |
| `tools/shared-runtime/h4/h4-probe-harness.mjs` | Data API probe harness |
| `tools/shared-runtime/h4/h4-privilege-snapshot.sql` | privilege snapshot |
| `docs/platform/shared-runtime/evidence/H4-DISPOSABLE-PRODUCT-PROOF-2026-09-09.md` | evidence template |
| `docs/platform/shared-runtime/OPERATOR-ACTION-PACK-H3D-TO-H5-2026-09-09.md` §H4 | operator sequence |

## 3. Verdict against each H2 requirement

| H2 requirement | Result | Evidence |
|---|---|---|
| Product runtime role `NOLOGIN` (inv. 2) | **HOLDS** | forward: `CREATE ROLE h4_runtime NOLOGIN NOINHERIT … NOBYPASSRLS`; post-check raises on `rolcanlogin`. |
| Product migration role `NOLOGIN` (inv. 3) | **HOLDS** | same for `h4_migrator`. |
| No reusable product DB LOGIN credential (inv. 1) | **HOLDS** | no `PASSWORD` clause anywhere in H4 SQL; harness env takes only `H4_RUNTIME_JWT` / `H4_EXPIRED_JWT` / publishable key; evidence template row "direct DB login … no credential exists". |
| Migrations are platform-executed proposals (§Migration Execution Boundary) | **HOLDS at the SQL level; actor is contradicted in the operator pack — see G-H4-5** | forward and rollback assert `current_user = 'postgres'`; positive migrator proof is `SET ROLE h4_migrator` from the platform session, not a product credential. `CREDENTIAL-STRATEGY-LANE-B` requires these to run as class P, Owner-only, in the SQL editor — but the operator pack literally instructs `Agent: psql -f migrations/h4_disposable_product_forward.sql` and `agent psql -f migrations/h4_disposable_product_rollback.sql`. The SQL's own `current_user = 'postgres'` guard means an agent process cannot actually execute it without holding the platform credential, which the credential strategy forbids — so the two documents cannot both be followed as written. |
| Token authority is House-owned (§Token Authority, inv. 4–5) | **HOLDS** | separate `h4_runtime_token_grants` (owner-only, `SELECT` to `supabase_auth_admin`) + `h4_custom_access_token_hook` caps `exp` ≤ 5 min and refuses a login-capable/privileged target role. No signing material leaves the platform. |
| Exposure limited (inv. 6) | **HOLDS** | only `h4_probe` added to exposed schemas; teardown restores the exact prior string. |
| Exact operation grants (inv. 7) | **HOLDS** | post-check: `h4_runtime` EXECUTE count = 1, direct table writes = 0. |
| No dynamic schema/SQL/role at the boundary (inv. 8) | **HOLDS** | both functions have fixed bodies and pinned `search_path`. |
| H4 tests only product-available interfaces (§H4) | **HOLDS** | runtime probes are Data API calls with an Auth-issued token; metadata/`SET ROLE` checks are labelled platform-admin evidence, as H2 permits. |
| Teardown preserves the boundary | **HOLDS, with G-H4-2 below** | rollback drops hook → grant table → membership → schema → roles, asserts zero residue and that the ps01 H3C contract and the 3-EXECUTE `ps01_line_runtime` boundary are intact. |

**Conclusion: the current H4 SQL design preserves the H2 NOLOGIN boundary.** No
contradiction exists in the SQL and none is recorded. H4 must not be redesigned
around a direct product DB LOGIN.

**A separate, real contradiction exists between the operator pack and the credential
strategy over *who* runs the platform SQL** — recorded as G-H4-5. This is a
documentation/authority gap, not an H2 breach, and it does not authorize an agent to
hold `postgres` under the current contract.

## 4. Real gaps found during re-verification

None of these breaks H2. Each would stall or weaken H4 when it runs, so each is
recorded as a finding with a bounded remediation. None is fixed in this unit; they are
scheduled before `OWNER-CP-H4`, not before `OWNER-CP-H3D-A1`.

### G-H4-1 — MEDIUM — token-issuance path exists only as prose

Operator pack §H4 step 4: "provision H4 Auth identity + `h4_runtime_token_grants` row
+ token (analogous to the H3D runner path)". No tool implements this. The harness
consumes `H4_RUNTIME_JWT` but nothing produces it, and the grant row can be inserted
only by the platform `postgres` session (owner-only by design). This is the
"requirement discovered at the gate" pattern of `ANALYSIS` A1.

Remediation (before `OWNER-CP-H4`): a runbook that splits the step by credential class
— grant-row INSERT/DELETE as a class-P SQL-editor file; identity create/delete and
token issuance by an agent tool using class A, with the same ledger, teardown-on-every-
path and ≤ 300 s token rules as the H3D runner; token passed to the harness through a
minimal child env only.

### G-H4-2 — MEDIUM — forward and rollback are not atomic under `psql -f`

Neither file sets `\set ON_ERROR_STOP on` or wraps in `BEGIN … COMMIT`, and the
operator pack runs them with `psql -f`. Under psql defaults each statement autocommits
and psql continues past errors, so a failed post-check leaves the forward partly
applied, and the rollback's `REVOKE h4_runtime FROM authenticator` errors if the role
is already absent. Contrast: the H3D seed uses `\set ON_ERROR_STOP on` + `BEGIN`.

H2 is not breached — the roles are created `NOLOGIN` on the first statements — but
partial state is exactly what H3F would flag as unexplained drift.

Remediation: `\set ON_ERROR_STOP on` + single transaction for the forward; for the
rollback, guard each step on existence (`DO` blocks) so it is safe on partial state.
Note that under class P (SQL editor) the editor already runs a batch in one
transaction; the fix is still required because the pack names `psql -f`.

### G-H4-3 — LOW — privilege snapshot narrower than the forward post-check

`h4-privilege-snapshot.sql` checks `migrator_foreign_usage` on `ps01`, `local_service`,
`mt01` only, and `runtime_migration_insert` for `h4_runtime` only. The forward
post-check additionally covers `ps01_internal`, `mt01_private`,
`wstera_platform_internal`; nothing in the snapshot checks `h4_migrator` INSERT on
`supabase_migrations.schema_migrations`, which H2 names ("no product-local CLI can
write the global migration ledger"). The evidence template covers it as a manual SQL
row. Remediation: add the missing booleans so the snapshot, not a manual row, carries
the claim.

### G-H4-4 — sibling of `F-CATALOG-PROVENANCE`

`h4-privilege-snapshot.sql:18` stamps `'project_ref', 'ykxlqnshaaxmzzocpjlj'` as a
literal, exactly as `catalog-manifest.mjs:174` does. Handled by the root-cause fix in
the B brief (finding 2 covers every literal-stamped provenance field), not separately.

### G-H4-5 — HIGH — the operator pack assigns H4 platform SQL to "Agent", contradicting class P

Codex round 1, DEFECT-09. `OPERATOR-ACTION-PACK-H3D-TO-H5-2026-09-09.md:154-170`
reads (unchanged at `2b1af86` per §2 above):

```
1. Agent: psql -f migrations/h4_disposable_product_forward.sql
...
   → agent psql -f migrations/h4_disposable_product_rollback.sql
```

`CREDENTIAL-STRATEGY-LANE-B-2026-09-22.md` §1–§2 classifies H4 forward/rollback as
class **P**, run by the **Owner** in the Supabase SQL editor; the agent never holds
`postgres`. The operator pack's own SQL requires `current_user = 'postgres'`
(`h4_disposable_product_forward.sql:14-18`, rollback `:7-12`), so an agent literally
following the pack's instruction as written would need to hold the platform
credential — which the credential strategy exists to forbid. The two documents
cannot both be followed; this is a real authority-actor gap in the source pack, not
an ambiguity in the credential strategy.

**Not an H2 breach:** the SQL's guard already prevents any non-`postgres` session from
running it, so no agent can silently execute it today — the pack's wording is wrong,
not the enforcement.

**Disposition for this unit:** the pre-A1 remediation brief (B) does not touch
`OPERATOR-ACTION-PACK-H3D-TO-H5-2026-09-09.md`, and no agent is authorized to run
`psql -f migrations/h4_*.sql` under any Lane-B credential class. Remediation —
rewriting the operator pack's H4 section to name the Owner/platform SQL-editor actor
explicitly for those two steps — is scheduled before `OWNER-CP-H4`, alongside
G-H4-1..4. Until then, if H4 is ever reached, this batch's controller review must
independently confirm the executing actor before the step is allowed to proceed,
regardless of what the pack's prose says.

## 5. Standing boundary for later stages

- H4 remains class P for DDL and grant rows; the agent never holds `postgres`.
- `h4_runtime` / `h4_migrator` inherit the managed `PUBLIC` cron/net write (H1, F10 of
  the credential strategy). H2 already classifies this as platform-metadata fact, not
  product reachability, because no product-controlled channel addresses those
  surfaces. It stays an open H1 item, not an H4 failure.
- H4 hard stop unchanged: if any step turns out to need a direct DB LOGIN for a
  product role, STOP.
