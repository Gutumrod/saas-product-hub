# W0 PREFLIGHT — LANE_A_PRODUCTION_RELEASE_V1 — RESULT: **FAIL (STOP before W1)**

Task: `WSTERA-CONTROL-TRUTH-SYNC-001` · Workflow `WF-DEV-01 v1.3.0 / LONG_RUN`
Release authorization: **`LANE_A_PRODUCTION_RELEASE_V1` — GIVEN by Owner (2026-09-23, this session)**
Runbook authority: `RUNBOOK-LANE-A-EXPAND-DEPLOY-CONTRACT-2026-09-23.md` §3 ("If any item fails: **STOP.**
Do not open the window.")
Operator: Hermes (orchestrator / state holder / gate controller) — **not** the human operator of the guards
Recorded: 2026-09-23 (Asia/Bangkok)

| Item | Result |
|---|---|
| W0 | **FAIL** — 6 of 7 items PASS, item 1 (backup / recovery point) FAILS |
| W1 | **NOT OPENED** — runbook §3 stop rule + the two authority interlocks are unset |
| W2–W5 | **NOT REACHED** |

**No production mutation of any kind occurred.** No DB contact, no connection attempt, no credential read
by the operator helper (proven by refusal evidence), no migration, no deploy, no Cloudflare mutation,
no skill install, no PR merge.

---

## 1. W0 checklist, item by item (runbook §3, in the runbook's order)

### ❌ Item 1 — "Take a Control DB backup / recovery point and record its identifier." — **FAIL (BLOCKER)**

Measured, read-only, against the Control project `plvpbribiomqppfokzir`:

```text
GET /v1/projects/plvpbribiomqppfokzir/database/backups
-> {"region":"ap-northeast-1","walg_enabled":true,"pitr_enabled":false,"backups":[],"physical_backup_data":{}}
```

- `backups: []` — **there is no recovery point to record.** The runbook requires the identifier of a
  backup/recovery point; there is none, and the response shape is the platform's "none exist" shape, not
  "not available" (a second project returns the identical shape, confirming the response is not an
  error artefact).
- `pitr_enabled: false` — no point-in-time recovery window exists either.
- No alternative on this host: `pg_dump` and `psql` are **not installed** (not in PATH, no PostgreSQL
  install directory); `docker` is **not installed**, so `supabase db dump` cannot run either (verified:
  the CLI's own dry-run resolves to a Docker-backed `pg_dump` path).
- Creating a logical dump with the `postgres`-family client would require a **live Control DB
  connection**, i.e. the authority interlock, which §4 of this document shows is not available to Hermes.

**Consequence:** the release's own entry condition cannot be satisfied, so per runbook §3 the window must
not be opened. This is a contract-mandated **Owner decision** condition, not a discretionary stop.

### ⏸ Item 2 — "Record the DB migration baseline and current function signatures (expect exactly one with 17)." — **NOT MEASURED**

Requires a live Control DB read, therefore gated by the two interlocks (§4). Not attempted. No baseline
number is claimed anywhere in this packet because none was measured.

### ✅ Item 3 — "Record the currently serving Worker version/revision." — **PASS**

```text
wrangler deployments list --name hub-web   -> exit 0, 10 deployment entries recorded
current (100% traffic): 5dc81232-c116-4722-a6c1-74c15ad50385
            created:   2026-09-21T01:20:14.630Z
known rollback chain:  5dc81232 -> 9a004fa9 -> 6426d0b5 -> ...
raw evidence: workspace/wstera-cts-001/lane-a-release-v1/w0-wrangler-deployments-list.txt
              sha256 bf87b3f5317eaf3f4c1599b7ee0ab175ce385fc36bb213ed5aa660e49257ff3d
```

Boundary declared: `deployments list` prints version UUIDs and timestamps; it does **not** print a source
revision, so the Worker→source SHA linkage is not re-derived here (same limitation recorded at T0 O-6).

### ✅ Item 4 — "Record installed Control Sync hashes (rollback targets, per T4-WU03 §2)." — **PASS**

Installed runtime = `D:/AI-Workspace/runtime/hermes-native/data/skills/devops/wstera-control-sync` (4 files):

| File | Installed sha256 |
|---|---|
| `scripts/control_sync.py` | `ad330dd5d4c3571c85a7ae33ba820157fd392c7c938d05fba746abfa66ad4e1c` |
| `references/EVENT-CONTRACT.md` | `e763e48821a90f314fb0d81a40580431cd2b2f6dd008c8b2555d4a424a1c448f` |
| `tests/test_control_sync.py` | `9a8c054b35286f56982d8204e7e80141d60bb98d249780c32d0abd94a704493e` |
| `SKILL.md` | `e1d239032c837c93dccf74f61685383c6972afa689ddcee771125254ab438630` |

These four are the **pre-install rollback targets** required by runbook §7 / §9.

Source (Window 4 target) = `work/wstera-control-truth-sync-001-t4` @ `fb84b9d6517186246dacde2871937d98c52ec7a6`,
parity 0/0, worktree clean.

**Still-live defect confirmed:** `grep -c MAX_ACTIVITY_DETAIL_CHARS <installed>/scripts/control_sync.py` = **0**.
The installed sender still has no `activity.detail` bound, so the dead-letter root cause remains live until
Window 4 runs. Mitigation stays procedural.

### ✅ Item 5 — "Collision check against Lane B: confirm no Lane-B live mutation window is open." — **PASS**

- Lane-B planning `work/house-lane-b-longrun-plan-20260922`: no window-open marker; one untracked
  **documentation** file (`REMEDIATION-AND-RE-FREEZE-LANE-B-R2-2026-09-23.md`) — doc-only, not a live window.
- Lane-B execution `work/house-h3d-h5-20260909`: clean.
- No `*LIVE-WINDOW*` / `*WINDOW-OPEN*` artefact anywhere in the workspace tree.
- BK01 `feature/bk01-real-shop-hardening-r4`: clean (and R4 is already CLOSED, Hermes not the committer).

### ✅ Item 6 — "Confirm both reviewed revisions are available and match the hashes in §0." — **PASS**

Re-measured from the pinned revisions, not the working tree:

```text
dfcb4be4ac8b488ef740e2147f83b5c19251fbd8   present (commit)  on origin/work/wstera-control-truth-sync-001
dd9a629eaa4e75c29fe0b8aa31698b5f9c4e1dae   present (commit)  on origin/work/wstera-control-truth-sync-001
fde38f64e6bd72de9af549a88777bf276933c051   present (commit)

0009_work_scope_identity.sql @ EXPAND & CONTRACT   8f88a7d1e4d3777dd0c2adefa999f61799bd50dd1270407fa025f3c4068d3487  MATCH
0010_retire_legacy_work_event_rpc.sql @ CONTRACT   3963c6a6e6423f006889d87c735e86ef30831680964c19b096f23f2b091a7b30  MATCH
0010 @ A_EXPAND_REV                                ABSENT (confirmed) — deployment boundary preserved
git ls-files -s drizzle/migrations/ digest          538f873b164abb180bf4d249289b1f1e949caa5c9cd5e3b4c2f7df3bfa1cf361
hub-web worktree dirty                              0
```

Release evidence control (re-measured this window, independently of the packet's earlier claim):

```text
esbuild bundle server/_core/index.ts @ dd9a629
  -> 6e596d6ecde0ca7e92a99bd8ab9b2aab7a1587f831ece52831839a803f2bae11  (byte-identical to the reviewed hash)
```

### ✅ Item 7 — "Confirm the apply mechanism from §2 is in force and the helper is present at the exact
revision/hash recorded in the Owner package. The Owner release authorization must already exist before
either authority guard is set." — **PASS**

```text
helper   docs/platform/house-long-run/tools/lane-a-exact-file-postgres-apply.mjs
  sha256 d87bd4aa938d0d0a853cea84289e182d29e2cafe6237ff2df3e4fb5a3a77398b   (matches Owner package)
harness  docs/platform/house-long-run/tools/tests/fop-helper-verify.mjs
  sha256 f62317c26923a0b41b143e48f0ed71ea8b8c5f8b1f4e2deb52ba89e4440f0b8c   (matches Owner package)
both tracked at planning HEAD bf5e8fd8cbf95729d5a77b0df5d5e9bd8dafe243
planning parity 0/0 · dirty 0
```

Harness re-run in **read-only** mode this window:

```text
LANE_A_FOP_READONLY=1 node tests/fop-helper-verify.mjs
  -> exit 0 · FOP_HELPER_VERIFY_TOTAL: 44/44 PASS
  -> HARNESS_SCRATCH_REMOVED_ON_EXIT: true
  -> git porcelain before=0 after=0   (no in-repo file written)
raw log sha256 c1d98ef2afd6a8ef3fd66c98a431e44e7c75a1dc8c567928b94e373940702e6f
```

Owner release authorization (`LANE_A_PRODUCTION_RELEASE_V1`) now **exists** — this is the precondition §3
requires to hold *before* a guard may be set. The guards themselves are still unset (§4).

---

## 2. Refusal evidence — the helper's fail-closed ordering, exercised in this window

Three real invocations were run **without** the guards. All exited non-zero **before reading any
credential and before any connection attempt**, reproducing the reviewed refusal order exactly:

| Invocation | Observed classification | Refused at | exit |
|---|---|---|---|
| `0009` dry-run, guards unset | `AUTHORITY_GUARD_REFUSAL` | `check_5_live_db_authority` | 2 |
| `0009` apply, guards unset | `AUTHORITY_GUARD_REFUSAL` | `check_5_live_db_authority` | 2 |
| `0010` apply, no `--require-evidence` | `SEQUENCING_EVIDENCE_MISSING` | `check_4_sequencing_evidence` | 2 |

Both `0009` refusals carry the helper's own recorded reason: *"LANE_A_LIVE_DB_AUTHORIZED must be exactly
'YES'; no credential was read and no connection was attempted"*. The `0010` refusal fired at check 4 —
i.e. **before** the authority guards — confirming the sequencing gate is evaluated first, as reviewed.

Evidence: `lane-a-release-v1/w0-refusal-0009-dryrun.json`
· `w0-refusal-0009-apply-guards.json` · `w0-refusal-0010-noevid.json`

**This is not a gate PASS.** It is a measured demonstration that the interlocks work as reviewed; the
release itself is stopped at W0 by item 1.

---

## 3. Credential source class — as authorized, and what is still missing

Authorized class: **existing approved out-of-band secret source**, injected into the process environment as
`LANE_A_CONTROL_DATABASE_URL` at run time only. No credential in argv, repo, docs, evidence or log.

Measured facts:

- The canonical out-of-band source **does** carry the Control project's material: project reference,
  DB password and secret key are all present as separate named keys. **No value is recorded here.**
- The canonical source **does not** contain a ready-made `LANE_A_CONTROL_DATABASE_URL`. The helper
  requires the assembled connection string in that exact variable, and the Owner package explicitly
  states the provisioning path "is an Owner/operator decision and is deliberately not invented here."
  **Hermes did not invent one.** The human operator must assemble and inject it in the production window.
- Target identity cross-check (identifier only, not a secret): the runbook's declared expected target ref
  `plvpbribiomqppfokzir` matches the canonical source's Control project reference **exactly**, and the
  Management API reports that project `ACTIVE_HEALTHY`, region `ap-northeast-1`, Postgres `17.6.1.166`.
  A different ref belongs to the hub-web application database — a **different project in a different
  role**, so there is no contradiction: the helper expects the Control project and will refuse the app DB.
- The pooler host for the Control region resolves over IPv4 (measured); the direct host is IPv6-only as
  the source itself records.

---

## 4. Authority interlocks — state measured, and who may set them

```text
LANE_A_LIVE_DB_AUTHORIZED          UNSET  (shell, HKCU\Environment, HKLM, shell profiles: absent)
LANE_A_PRODUCTION_APPLY_AUTHORIZED UNSET  (same)
LANE_A_CONTROL_DATABASE_URL        UNSET
```

The Owner's authorization for this release states the two interlocks are to be set **by the human operator,
only in the approved production window**. Hermes therefore must not and did not set them. Because they are
unset, no live DB read (W0 item 2) and no apply (W1) can proceed regardless of item 1.

---

## 5. Two findings raised by this window (neither is a mutation)

### FINDING-W0-A — Control DB has no recovery point, and none is creatable on this host

Covered in §1 item 1. The release's rollback/recovery contract (runbook §9) presumes a recoverable
pre-mutation state; with `backups: []`, `pitr_enabled: false` and no dump tooling, the only recovery path
for `0009`/`0010` is the reviewed forward-fix contract. **This is the decision the Owner must make.**

### FINDING-W0-B — `/health` is not a health endpoint; the T5 "platform health endpoint 200" check is satisfied by the SPA fallback

`server/worker.ts` routes only `/api/webhooks/product-events`, `/api/webhooks/agent-events`,
`/api/agent/owner-decisions/{poll,ack}`, `/api/trpc/*`; every other path returns `404 "Not found"`.
The deployed asset layer serves the SPA with `single-page-application` not-found handling, so
`https://platform.wstera.com/health` returns **200 with the SPA HTML**, not a health payload.

Measured this window:

```text
/health            -> 200, body = the SPA index.html (ServiceBooking shell)
/api/health        -> 404
/api/status|version|v1/health|control/health -> 404
```

T5-WU06's live-proof check `"platform health endpoint 200"` was therefore satisfied by the SPA fallback.
It is a weak check, not a false claim by the earlier stage — but W5 requirement 9 ("public health /
security baseline intact") **must not** rely on `/health` == 200. Recommended: bind W5 item 9 to the
unsigned-webhook fail-closed probe (measured: `401 {"error":"invalid signature"}`) plus security headers,
which are real signals.

### FINDING-W0-C (security) — `supabase db dump --dry-run` prints the DB password in cleartext to stdout

The CLI's dry-run resolved a login role and **printed the plaintext `PGPASSWORD`** into terminal output.
No wrapper may pass this command's stdout through in this release, and the value that reached this
session's tool output must be treated as exposed. Recommend rotation via the canonical path before any
window that would use a dump. The value is deliberately **not** recorded anywhere in this packet.

---

## 6. Public / live baseline captured (unchanged by this window — read-only)

```text
https://wstera.com/                 200   HTTPS, HSTS + CSP + XCTO + XFO + Referrer-Policy
https://platform.wstera.com/        200   HTTPS, same header set
unsigned agent-events POST          401 {"error":"invalid signature"}   (fail-closed, correct)
raw: lane-a-release-v1/w0-security-baseline.txt  sha256 a1ed4e47b270088bc22a4a0977714adad33d390e267ee42db157d42c3ac20871
     lane-a-release-v1/w0-health-baseline.txt    sha256 5c617569f81fac65b8c7c9237f734d9e609156ee7cbd0b10cfa968e0e5b254f2
```

Draft PR #2 verified still `OPEN` + `DRAFT` (not merged). PR #1 likewise `OPEN`/`DRAFT`.

---

## 7. Control-plane state (canonical outbox — shared across lanes, read as a whole)

```text
outbox 76 = 64 delivered + 12 dead_letter
12 dead_letter = the classified set (1 original task event + 10 detail-limit probes + 1 BK01 lane event)
  wcs:BK01-R4-CLOSE-LONG-RUN-2026-09-23:1 -> HTTP 422 unresolved product identity  (NOT this lane's work)
0 new dead letters from this window
```

`work.sync` remains **BLOCKED by GAP-A** (unscoped House/Platform projections are refused by Control RPC
0006). No fake Product code was invented; telemetry for this transition is emitted as `activity` only.

---

## 8. What is required from the Owner now — two decisions, both bounded

1. **Backup / recovery posture.** W0 item 1 cannot be satisfied as written. Choose one:
   (a) accept **forward-fix-only** recovery for the Control DB for this release, recording explicitly that
   no recovery point exists (matches runbook §9's pre/post-CONTRACT contract, and `0010` fails closed on
   its own) — **recommended**, since `0009` is additive and `0010` applies nothing when its preconditions
   fail; or (b) require a logical dump first — which needs the human operator to provide a dump-capable
   path on the window host (Docker or `pg_dump`) and a rotated credential per FINDING-W0-C; or
   (c) defer W1 until the platform exposes a recovery point.
2. **Operator + credential provisioning.** Name the human operator who will set
   `LANE_A_LIVE_DB_AUTHORIZED=YES` / `LANE_A_PRODUCTION_APPLY_AUTHORIZED=YES` and assemble/inject
   `LANE_A_CONTROL_DATABASE_URL` **in the production window only**. Hermes will not set either guard and
   will not invent the connection string.

Once both are answered, W0 items 1–2 can be completed and W1 can be opened in order, with the same
stop-on-FAIL discipline.

---

## 9. Non-claims

- No production mutation: no DB connection, no connection attempt, no credential read, no migration, no
  deploy, no Cloudflare mutation, no runtime skill install, no PR merge.
- No `PRODUCTION_READY`, no `OPERATED_STABLE`, no `READY FOR OWNER CONTROL TRUTH REVIEW`.
- No `0009`/`0010` file byte was changed; both reviewed revisions are untouched (parity 0/0, dirty 0).
- W0 item 2 (migration baseline / `pronargs`) is **not measured** and is not claimed.
- `FINDING-W0-B` is scoped to the health-check signal only; it is not a claim that the deployed Worker is
  unhealthy — the unsigned-webhook probe and headers are healthy.
- Mac parity remains `MAC_PARITY_UNVERIFIED`.
- T6 is partially entered (release windows) but **not** advanced past W0; R3 and T7 have not started.

## 10. Evidence index

| Artefact | Path |
|---|---|
| This packet | `docs/platform/house-long-run/W0-PREFLIGHT-LANE-A-RELEASE-V1-2026-09-23.md` |
| Worker deployment baseline | `…/lane-a-release-v1/w0-wrangler-deployments-list.txt` |
| Health baseline | `…/lane-a-release-v1/w0-health-baseline.txt` |
| Security baseline | `…/lane-a-release-v1/w0-security-baseline.txt` |
| Helper refusals (3) | `…/lane-a-release-v1/w0-refusal-0009-dryrun.json` · `w0-refusal-0009-apply-guards.json` · `w0-refusal-0010-noevid.json` |
| Harness re-run log (read-only) | `…/lane-a-release-v1/w0-harness-readonly.log` |
| Bundle control | `…/lane-a-release-v1/w0-bundle-dd9a629.js` |
| Outbox snapshot + summary | `…/lane-a-release-v1/w0-outbox-status.json` · `w0-outbox-summary.json` |

All under `D:/AI-Workspace/runtime/hermes-native/workspace/wstera-cts-001/`.
