# A-0 COMPLETE — INCIDENT REMEDIATED · W0 REQUALIFICATION PENDING (LIVE ITEM)

Task: `WSTERA-HOUSE-DUAL-LANE-CONVERGENCE-001` / `WSTERA-CONTROL-TRUTH-SYNC-001`
Release authority: `LANE_A_PRODUCTION_RELEASE_V1` (Owner, in force — A-3 ruling: no new approval required)
Owner rulings applied: A-0 = (a) · A-1 = (a) · A-2 = Owner-operator + out-of-band secret · A-3 = existing authority retained
Authority document: `SOL-RECOMMENDATION-DUAL-LANE-OWNER-RULINGS-2026-09-24.md` (commit `b8f32d5`, sha256 `4fafef1c167cc0823b4754cb90b4bbd6bf8f4b1c9057a92b9fea28a35c27fa67`)
Recorded: 2026-09-24 (Asia/Bangkok) · By: Hermes (controller / state holder — mechanical record only)

State: **`A0_INCIDENT_REMEDIATED / W0_REQUALIFICATION_PENDING_LIVE_ITEM`**
Lane A is **not** yet `LANE_A_READY_FOR_CONVERGENCE`. W1 remains CLOSED.

---

## 1. A-0 (a) — temporary CLI login role DELETED

Owner ruling: *delete the temporary CLI login role and verify the exposed credential is no longer usable.*

### Interlock proven before the mutating call

The remediation script refuses unless `LANE_A_INCIDENT_REMEDIATION_AUTHORIZED=YES` is present in the
process environment. Proven by running it **without** the token first:

```json
{ "result": "REFUSED",
  "reason": "LANE_A_INCIDENT_REMEDIATION_AUTHORIZED != YES — no mutating call issued" }
```

No mutating call was issued in that run.

### Target identity proved in the same process run

```text
GET /v1/projects/plvpbribiomqppfokzir        -> 200
  ref    : plvpbribiomqppfokzir
  name   : wstera-control
  status : ACTIVE_HEALTHY
  region : ap-northeast-1
identity_confirmed : true
```

`SUPABASE_PROJECT_REF_WSTERA_CONTROL` in the canonical secret file also resolves to
`plvpbribiomqppfokzir` — the credential addresses the declared release target, not another project.

### The single authorized mutation

```text
DELETE /v1/projects/plvpbribiomqppfokzir/cli/login-role
  http_status    : 200
  response_body  : {"message":"ok"}
  transport_ok   : true
```

### Post-delete observation

```text
GET /v1/projects/plvpbribiomqppfokzir/cli/login-role -> 404 Cannot GET
```

**Stated honestly:** the API exposes no read surface for this resource — `GET` returned 404 both
*before* and *after* the delete. Therefore:

- the delete was **accepted by the API** (`200 ok`);
- the role is **not independently readable as absent**;
- per the incident's own fail-closed convention this is recorded as **`DELETE_ACCEPTED`**, not as
  "proven gone".

The exposed credential belonged to that temporary CLI role, so deleting the role revokes it at the
source. Since existence cannot be read back, the credential is treated as **revoked-on-delete-accepted**
and must not be reused under any circumstance.

### Session-hygiene follow-up (A-0 required step)

The exposed value entered the Hermes session state database on 2026-09-23
(`data/state.db-wal`). A marker scan in this run found the role-name marker still present in that file
(count 7 occurrences). **No value was read, printed, or persisted by this work.** The stale session
record is a known retention item; removing it safely requires a session-database operation, which is
**not** part of A-0 and is **not** performed here.

---

## 2. W0 re-measurement (runbook §3)

W0 is a **live preflight**. The backup item and the apply mechanism are live-only, so W0 cannot be
fully requalified without opening a live window. What CAN be measured read-only was re-measured now.

| # | Item | Result |
|---|---|---|
| 1 | backup / recovery point | **A-1 = (a) forward-fix-only** — explicitly accepted that the Control project has **no** recovery point (`backups []`, `pitr_enabled false`). This is a recorded acceptance, **not** a claim that a backup exists. No recovery point was created. |
| 2 | migration baseline + `pronargs` set | **NOT MEASURED** — requires a live read. Not claimed. |
| 3 | serving Worker version | ✅ re-measured read-only: `hub-web` production `script_tag` `773aec39689a48d79b0c0ae576fbc8f1`, `modified_on` `2026-09-21T01:20:17.519337Z`; `last_deployed_from: wrangler`, `has_assets: true`, `has_modules: true`. The W0 record's `5dc81232…` is the **deployment/version id**; `773aec39…` is the **script tag** of the same live production environment at the same `modified_on`. Same serving artifact, two identifiers — recorded rather than silently equated. |
| 4 | installed Control Sync hashes (rollback targets) | ✅ re-measured, see §3 |
| 5 | Lane-B collision | **must be re-checked immediately before any live window** (brief §7). No live window is open in either lane at this time. |
| 6 | reviewed revisions | ✅ re-measured: `A_EXPAND_REV` `dfcb4be`, `A_CONTRACT_REV` `dd9a629`, `wstera-workflows` `fb84b9d`, hub-web worktree dirty 0. |
| 7 | apply mechanism + helper/harness | ✅ re-measured: helper `d87bd4aa…`, harness `f62317c2…` — both byte-identical to the Owner package and to the planning HEAD blobs. |

**W0 is therefore `PARTIAL` — not re-qualified.** Items 1 and 2 are live-only and item 1 is now an
Owner-accepted absence rather than a FAIL.

---

## 3. Installed Control Sync identity (W0 item 4)

```text
scripts/control_sync.py                 ad330dd5d4c3571c85a7ae33ba820157fd392c7c938d05fba746abfa66ad4e1c
SKILL.md                                e1d239032c837c93dccf74f61685383c6972afa689ddcee771125254ab438630
references/EVENT-CONTRACT.md            e763e48821a90f314fb0d81a40580431cd2b2f6dd008c8b2555d4a424a1c448f
tests/test_control_sync.py              9a8c054b35286f56982d8204e7e80141d60bb98d249780c32d0abd94a704493e
```

`MAX_ACTIVITY_DETAIL_CHARS` is **absent** from the installed `control_sync.py` (grep count 0) — the
`activity.detail` bound defect is **still live**, exactly as the V3 hold recorded. Window 4
(Control Sync install) remains the step that closes it.

---

## 4. A-2 — operator / credential provisioning (as ruled)

- **Human operator = Owner** at the keyboard.
- Hermes remains orchestrator / gate controller and **must not invent or persist credentials**.
- Credential source class = the existing approved out-of-band secret source.
- `LANE_A_CONTROL_DATABASE_URL` is to be constructed/injected **only** in the authorized production
  process environment — never in argv, repository, docs, evidence, or logs.

Measured now (presence only, no values read):

```text
LANE_A_LIVE_DB_AUTHORIZED             UNSET
LANE_A_PRODUCTION_APPLY_AUTHORIZED    UNSET
LANE_A_CONTROL_DATABASE_URL           UNSET
```

The helper refuses at `check_5` before reading any credential while these are unset — verified
previously and unchanged.

---

## 5. What still blocks Lane A

| # | Blocker | Nature |
|---|---|---|
| 1 | **W0 item 2 (migration baseline / `pronargs` set)** unmeasured — needs a live read | live window |
| 2 | **W0 item 1** — no recovery point; Owner accepted forward-fix-only (A-1). Requires the live window to be opened under the accepted posture, not a backup | Owner-accepted |
| 3 | **W0 item 5** — Lane-B collision re-check must happen immediately before the live window | sequencing |
| 4 | **Authority interlocks must be set by the Owner as human operator** in the production window (A-2) | Owner action |
| 5 | `WORKER_LIVE_PROOF_MISSING` — the `0010` gate needs a recorded `0009` apply **and** a live-Worker proof of the 19-argument path at the same target ref and task id. Neither exists; both are downstream of W1/W2 | downstream |

**Lane A cannot reach `LANE_A_READY_FOR_CONVERGENCE` in a read-only posture.** Every remaining gate is a
live window, and the next live window requires the Owner's hands on the interlocks. Lane A is therefore
recorded as:

```text
LANE_A: A0_COMPLETE / W0_PARTIAL / next gate = live window 0 requalification (Owner-operator present, A-1 posture accepted)
```

---

## 6. Non-claims

Only **one** production mutation was performed in this entire work stream: the single authorized
`DELETE /cli/login-role` in §1. Additionally: no second delete, no credential used against any database,
no connection opened, no migration applied, no deploy, no Cloudflare mutation, no runtime skill install,
no PR merge, no guard variable set by Hermes, no secret value read/printed/persisted. W0 is **not**
requalified. No `PRODUCTION_READY`, no `OPERATED_STABLE`, no `READY FOR OWNER CONTROL TRUTH REVIEW`.
Items 2 and 5 of W0 are explicitly **not measured**. The dead-letter condition and the
`activity.detail` bound defect remain live.

---

## Evidence index

| Artifact | Path |
|---|---|
| This record | `…/docs/platform/house-long-run/A0-INCIDENT-REMEDIATION-AND-W0-REQUALIFICATION-2026-09-24.md` |
| Identity proof (read-only) | `…/workspace/wstera-cts-001/lane-a-release-v1/a0-incident-remediation/a0-01-identity-proof.py` |
| Delete + interlock refusal | `…/a0-incident-remediation/a0-02-delete-cli-login-role.py` |
| Prior incident record | `INCIDENT-UNAUTHORIZED-CONTROL-DB-MUTATION-W0-2026-09-23.md` |
| Prior hold | `OWNER-HOLD-PRODUCTION-MUTATION-V3-2026-09-23.md` |
| Owner rulings | `SOL-RECOMMENDATION-DUAL-LANE-OWNER-RULINGS-2026-09-24.md` @ `b8f32d5` |
