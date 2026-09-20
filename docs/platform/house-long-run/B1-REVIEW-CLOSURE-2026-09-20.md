# B1 REVIEW CLOSURE — WSTERA-HOUSE-PRODUCTION-CLOSURE-001

Review Batch: **B1 — R15 Security Boundary**
Stage: T1 (R15 least-privilege preparation)
Reviewer: `agent-codex` (independent, INDEPENDENT-QA)
Recorded: 2026-09-20 (Asia/Bangkok)

## Verdict history

| Round | Verdict | Revision | Basis |
|---|---|---|---|
| B1 R1 | `WORKER_FIX` | `6a9ca6c` | 3 blocking findings (enum overreach, invalid denial probe, incomplete denial proof) |
| B1 R2 | **`BATCH_APPROVED`** | `857a5d0` | 0 blocking, 0 unsupported claims |

`B1 = BATCH_APPROVED`. Transition: **T1 approved -> T2 READY.**

## Why R2 was legitimate (not reviewer shopping)

- **Same reviewer identity** (`agent-codex`), same batch, same critical focus.
- R1's findings were fixed **at their root cause** and R2 verified the fixes independently rather
  than accepting the artifacts' self-descriptions.
- No verdict was requested or implied in the R2 dispatch.

## R1 blocking findings — closure evidence

| Finding | Fix | R2 verification |
|---|---|---|
| **BLK-1** `user_role` granted although it belongs to the excluded `public.profiles` | Root cause was a Hermes citation defect (`schema.ts:12-34` spans the excluded enum). Pack §F corrected to F.1/F.2/F.3; matrix regenerated | R2 grep-confirmed **no grant-positive `USAGE` on `user_role`**; granted set is exactly `product_status`, `asset_type`, `installation_status`, `installation_source`; re-derived the enum→column mapping from source |
| **BLK-2** `SET search_path TO billing_core, public` presented as a `42501` denial proof | Probe removed as a denial proof; replaced by probes that actually attempt schema access; removal note recorded | R2 confirmed no search-path assignment is used as a denial proof |
| **BLK-3** denial proof did not cover ownership, effective/transitive membership, or object-level `PUBLIC` ACLs | Added ownership probe (§3.1h), effective/transitive membership closure (§3.1i), object-level `PUBLIC` ACL scan for relations/sequences/routines/types (§3.1j) | R2 confirmed all three probe families exist, cover both schemas, and include positive controls plus runtime `42501` probes, so they can genuinely prove or falsify denial |

Non-blocking **NB-1** (attribution mislabel) closed at source: pack §J.1 carries the verbatim Master
Plan strings with the correct citation `PORTFOLIO_PRODUCTION_MASTER_PLAN.md:896`; the regenerated
billing matrix attributes accordingly.

## Newly surfaced item accepted as a live verification requirement

The FK caveat Hermes raised is now a **recorded open item**, and R2 independently confirmed it cannot
be settled from source alone:

- `apps/hub-web/server/routers.ts:388` sets `uploadedBy`; `:406` sets `recordedBy`.
- `drizzle/schema.ts:100-102` — `product_assets.uploadedBy → profiles.id`, `ON DELETE RESTRICT`,
  `.notNull()`. `:142` — `product_installations.recordedBy → profiles.id`, `ON DELETE SET NULL`.
- So the production direct-Postgres runtime writes values that trigger referential-integrity lookups
  on `public.profiles`, even though it never selects from it.

R2's own words: whether the FK check passes without privilege or RLS impact **cannot be confirmed
from source alone**, and the matrix correctly classifies it as a live verification item without
widening the grant set.

Carried to T5 as a **pre-apply live verification requirement**. The Owner's exclusion decision is not
reopened; only its live behaviour needs confirmation.

## R2 non-blocking observations

- **FK referential-integrity behaviour remains to be live-verified** before R15 apply (as above).
- **`apps/hub-web` is git-ignored in the House repository**, so there is no source git object binding
  line-level source claims to this revision; R2 verified source from the workspace and confirmed the
  fix commit changed no `apps/hub-web` path. Recorded as a permanent evidence characteristic of this
  repo layout, not a defect.

## Untested areas (permanent, carried forward)

- Live PostgreSQL privilege behaviour for `hub_web_app`.
- FK checks on `public.profiles` with no privilege on that table.
- Actual existence/ownership state of `billing_core` / `billing_core_staging`.
- Runtime credential identity and Worker secret state.
- Deployment/rollback execution.

## Scope confirmation

R2 verified commit `857a5d0` changed **only** `docs/platform/house-long-run/**`: no `apps/hub-web`
path changed, and no role/grant/migration/deploy operation occurred. Working tree has no source diff;
only the pre-existing untracked `shared-runtime` documents remain, untouched.

## Counters

```
Issue Fingerprint (R1 findings): corrected at source, 1 local-fix attempt used (1/2)
Reviewer Remediation Attempts: 0/2
Senior Escalations: 0/1
```

## Transition

`B1 BATCH_APPROVED` -> **T2 (product-event signer hardening) READY.**

Reviewer independence for B2 must be preserved. Note the standing constraint recorded in the run:
implementation on this host routes through the native-swarm pool because `agent-opencode` fails the
external CLI health gate with the pre-existing `OPENCODE_PROVIDER_PATH_UNAVAILABLE` condition
(deviation D-1).
