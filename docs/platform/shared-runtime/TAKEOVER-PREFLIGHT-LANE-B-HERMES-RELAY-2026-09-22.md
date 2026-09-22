# TAKEOVER / PREFLIGHT RECORD — LANE B, HERMES + RELAY CONTROLLER

Date: 2026-09-22
Task: `HOUSE-SHARED-RUNTIME-LANE-B-CLOSURE-001`
Governing override: `OWNER-ROUTING-OVERRIDE-LANE-B-HERMES-RELAY-CONTROLLER-2026-09-22.md`
Authority: `source/design/test/evidence/review orchestration only`, until the existing
Owner live-mutation checkpoints
Controller at takeover: Hermes (Lane-B LONG_RUN orchestrator, brief holder, state holder,
gate tracker, integration verifier)
Execution routing at takeover: canonical Agent Relay v2.5.3
State entered: `LANE_B_HERMES_RELAY_TAKEOVER_REQUIRED`
State after this record: **`PACKAGE_RECONSTRUCTION_REQUIRED`**

This record is the §14 mandatory takeover output. No Relay worker card may be released
before it is complete. It is produced read-only: **no file was mutated, no branch was
reset, no work was stashed, no commit or push was made, and no LAB/Supabase/Auth/secret
access occurred.**

---

## 1. Measured reality at takeover (§5, §3)

Re-measured by Hermes at 2026-09-22 22:15 SEAST (+07), not copied from the override.

### 1.1 Planning worktree

| Field | Measured value |
|---|---|
| Path | `D:\AI-Workspace\runtime\worktrees\house-lane-b-longrun-plan-20260922` |
| Branch | `work/house-lane-b-longrun-plan-20260922` |
| HEAD | `1943d1aedb24e8e72ce5845fd038de78e04d62ad` |
| Upstream | `1943d1aedb24e8e72ce5845fd038de78e04d62ad` (exact parity) |
| Remote | `https://github.com/Gutumrod/saas-product-hub.git` |
| Tracked tree | clean (691 tracked files) |
| Untracked | 1 file — see §4 |
| Delta vs override §4 | override recorded HEAD `2db3f89…`; HEAD has since advanced by exactly one commit, `1943d1a` = *"docs(platform): route Lane B through Hermes Relay"*, `1 file changed, 232 insertions(+)` = the override document itself. No other change is present. |

### 1.2 Execution worktree

| Field | Measured value |
|---|---|
| Path | `D:\AI-Workspace\runtime\worktrees\house-h3d-h5-20260909` |
| Branch | `work/house-h3d-h5-20260909` |
| HEAD | `2b1af861aa608f08abb0bd8224821b9ca5ac9981` |
| Upstream | `2b1af861aa608f08abb0bd8224821b9ca5ac9981` (exact parity) |
| Remote | `https://github.com/Gutumrod/saas-product-hub.git` |
| Worktree | clean |
| Top commits | `2b1af86 fix(h3d): non-vacuous manifest-mismatch test…` ← `6928932 fix(h3d): align seed lock order…` ← `2c1ef3a fix(h3d): static acceptance remediation S1-S5` |
| Delta vs override §4 | none — matches exactly. |

### 1.3 Branch topology — material, previously unstated

```
merge-base(planning, execution) = d6707c0c96309f2f0efb8f83f00b5f34aee6d2b5

execution : d6707c0 → 2c1ef3a → 6928932 → 2b1af86                       (source/tests/evidence)
planning  : d6707c0 → 3d532c2 → 4c3210d → 47eab10 → d2c094f → c6c5467 → 675975b → 2db3f89 → 1943d1a
                                                                        (controller contract docs/reviews)
is-ancestor(2b1af86, planning HEAD) = NO
```

The two branches **diverged at `d6707c0` and have never reconverged**. The credential
contract being reconstructed exists **only** on the planning branch
(`CREDENTIAL-STRATEGY-LANE-B-2026-09-22.md` is absent from the execution worktree), and
the source/tests/gates the reconstruction must change exist **only** on the execution
branch. See §10.4 — this directly affects §9's "one exact candidate revision".

### 1.4 No active mutation window (§5)

| Check | Result |
|---|---|
| Lane-B process scan (`psql`, `h3d`, `supabase` in `ps -W`) | 0 matches |
| Execution worktree dirty state | clean, at pushed revision `2b1af86` |
| Planning worktree dirty state | only the untracked review file classified in §4 |
| Control Sync outbox newest event | 2026-09-22 19:37 (activity-only) |
| LAB/Auth/role window | none active |

Residual, stated rather than glossed: the `h3d_ro` role drop is **Owner-reported and not
independently re-measured** (`BATCH-H3D-S-2026-09-22.md` §8 teardown limitation), because
the measurement credential *was* that role. If residue exists, `H3F` is the stage designed
to surface it. This is unchanged by the override and is not a new finding.

---

## 2. Mandatory runtime skill verification (§2, §13)

Both skills located, read in full, version-checked and hash-remeasured by Hermes.

| Item | Measured value |
|---|---|
| Relay skill path | `D:\AI-Workspace\runtime\hermes-native\data\skills\devops\kanban-external-agent-dispatch\SKILL.md` |
| Relay version | `2.5.3` (frontmatter `version:`) |
| Relay SHA256 | `be80473c22ff0eda0f3480b35aa056287983f861c83c6a72a6ef21db721d0d5f` |
| Relay SHA256 vs override §13 | **MATCH** |
| Control Sync path | `D:\AI-Workspace\runtime\hermes-native\data\skills\devops\wstera-control-sync\SKILL.md` |
| Control Sync version | `0.1.0` |
| Control Sync SHA256 | `e1d239032c837c93dccf74f61685383c6972afa689ddcee771125254ab438630` |
| Control Sync SHA256 vs override §13 | **MATCH** |
| Effective `HERMES_HOME` | `D:\AI-Workspace\runtime\hermes-native\data` |
| Canonical orchestrator root required | `D:\AI-Workspace\runtime\hermes-native\data` — **MATCH** |

### 2.1 Relay platform guard — PASS

Windows guard `scripts\assert-relay-runtime.ps1` executed from the orchestrator process:

```json
{"process_home":"D:\\AI-Workspace\\runtime\\hermes-native\\data","skill_version":"2.5.3",
 "skill_sha256":"BE80473C22FF0EDA0F3480B35AA056287983F861C83C6A72A6EF21DB721D0D5F",
 "user_home":"D:\\AI-Workspace\\runtime\\hermes-native\\data","gateway_pid":15660,
 "gateway_home":"D:\\AI-Workspace\\runtime\\hermes-native\\data","ok":true,
 "expected_home":"D:\\AI-Workspace\\runtime\\hermes-native\\data",
 "checks":{"process_home_matches":true,"skill_version_matches":true,
           "user_home_matches_or_unset":true,"gateway_home_matches_or_unset":true},
 "machine_home":null,"expected_version":"2.5.3"}
exit 0
```

**Guard result: `ok:true`, exit 0. No hard HOLD.**

### 2.2 Guard-execution defect found and resolved (host fact, recorded)

The guard **failed on first execution** under the host's default
`powershell.exe` — Windows PowerShell **5.1.26100.9444, Desktop edition** — with:

```
Get-FileHash : The term 'Get-FileHash' is not recognized as the name of a cmdlet…
  at assert-relay-runtime.ps1:49 char:10
exit 1
```

`Get-Command Get-FileHash` returns nothing in that host's 5.1 session (the Microsoft.PowerShell.Utility
auto-load did not resolve). This is not a runtime-home mismatch and not a Relay version
mismatch: `process_home`/`user_home`/`skill_version` are all correct. Re-running the same
guard with the workspace's PowerShell 7 at
`D:\AI-Workspace\runtime\powershell\7.6.6\pwsh` produced the PASS above.

Classification for the run: **guard tooling/host issue, not a gate failure.** The guard's
own semantics (`ok:true`) passed. Consequence recorded so the failure mode is not
misread later, and so a future controller does not mistake a 5.1 `Get-FileHash`
resolution failure for an environment HOLD.

---

## 3. Control Sync state (§5, §12)

### 3.1 Doctor — PASS, no secret exposed

```json
{"endpoint_configured":true,"endpoint_https":true,"ok":true,
 "outbox":"D:\\AI-Workspace\\runtime\\hermes-native\\data\\.hermes-runtime\\wstera-control-sync.sqlite3",
 "secret_configured":true,"secret_source":"canonical_secret_file",
 "secret_value_exposed":false,"version":"0.1.0"}
```

### 3.2 Outbox status — counted programmatically, not by eye

| Metric | Value |
|---|---|
| Total events | **52** |
| `delivered` | **41** |
| `dead_letter` | **11** |
| Window | 2026-09-21 14:42 → 2026-09-22 19:37 |
| `work.sync` events (Work Queue projection) | **0** |
| dead letters that are not `probe-detaillimit` capacity probes | **1** |

Detail on the two non-clean facts:

- **10 of 11 dead letters are `wcs-activity:probe-detaillimit-*`** — a deliberate payload-size
  capacity probe series (1800 → 2049) recorded on 2026-09-22. These are expected
  probe artifacts, not run failures.
- **1 real dead letter:** `wcs-activity:cc6a86381fb4467a99828bce15988fe7`,
  created 2026-09-22 19:06, `last_status: 400`, `last_error: http_400:invalid payload`,
  `attempt_count: 1`. Recorded as an **observable sync problem**, not as a work verdict.
  No retry is issued by this takeover: `flush` only re-sends durable pending items, and this
  event is terminal `dead_letter` at attempt 1. Its cause is not diagnosed here.

**Work Queue projection: `BLOCKED`, per the installed contract.** Control Sync skill
v0.1.0 `references/EVENT-CONTRACT.md` records that repository RPC
`0006_canonical_product_id_work_truth.sql` rejects any task projection without a canonical
product identity, and that House/Platform work must not invent a product code. Override
§12 and §2 require exactly this handling: **activity-only telemetry, Work Queue projection
recorded as blocked, never a fabricated Product identity.** Confirmed by measurement: the
outbox contains **zero** `work.sync` events, so no unscoped projection was ever attempted.
This compatibility patch remains undeployed and un-deployed by this record.

### 3.3 Takeover sync emitted — read back, not assumed

Mandatory sync moment "takeover/resume" (§12) satisfied with activity-only telemetry:

| Field | Value |
|---|---|
| Command | `control_sync.py activity --activity-type lane_b.takeover_preflight --status blocked` |
| Dry-run first | yes — normalized valid event, no network or DB mutation |
| `event_id` (live) | `wcs-activity:089087fa4d0b43598faab43a1ef6d7fd` |
| Delivery | `state: delivered`, HTTP `200`, `attempt_count: 1` |
| Body sha256 | `63d4d844ff6386b8636d2aec4b0ea65a9576a07526be0bf079708310a202a0a4` |
| Read back from outbox | **confirmed delivered** (not inferred from the HTTP 2xx) |
| Product code | **none** — deliberately omitted for this unscoped House/Platform task |
| `flush` before stopping | run → `[]`, nothing pending |
| Outbox after sync | **53** total = **42** delivered + **11** dead_letter |
| Delta from §3.2 | +1 delivered; the 11 dead letters are unchanged (same pre-existing set) |

Secret handling: no HMAC secret, token or credential value appears in this record, in
command output, or in the event body — `doctor` reports `secret_value_exposed: false` and
the secret is read from the canonical secret file, never passed on a command line.

---

## 4. Untracked / dirty classification (§5)

Exactly one untracked or dirty item exists across both worktrees. Nothing was deleted,
stashed, reset or overwritten.

| # | Path | Status | Classification | Disposition |
|---|---|---|---|---|
| 1 | `docs/platform/shared-runtime/REVIEW-CODEX-LANE-B-CONTROLLER-PACKAGE-ROUND4-2026-09-22.md` | untracked, planning worktree | **Canonical durable Lane-B evidence.** It is Codex round-4's verdict on `675975b`. Content re-read and confirmed to be a complete review record: reviewed SHA, execution source, verdict `FAIL`, mutation `None`, dispositions, and two new findings with file/line/defect/evidence/impact/required-fix. sha256 `fa7526639d36e8e49b70718d4809cbe1689cb488f2fb8fb4ed7ac508f0498a26`. | **PRESERVE. Never clean/reset.** §5 requires persisting it under Lane-B control before relying on it as canonical; §10.6 records that Hermes cannot itself commit it to this repo. |
| — | execution worktree | clean | — | — |
| — | planning tracked tree | clean | — | — |

No unknown or ambiguous work exists on either worktree. No classification required
destructive handling.

---

## 5. Active Owner authority and prohibited actions

### 5.1 What is authorized now

| Authority | Source | Scope |
|---|---|---|
| Lane-B LONG_RUN orchestration, brief/state/gate/integration ownership | override §1 | controller routing |
| Canonical Agent Relay as primary execution/review routing | override §1 | execution + review routing |
| source / design / test / evidence / review work | override header; `OWNER-DECISION-LANE-B-PRE-A1-REMEDIATION-2026-09-22.md` §7 | planning, source/tool remediation, tests, evidence |
| Codex independent exact-revision review | override §10 | review of a frozen revision |
| Claude bounded difficult remediation | override §6, §9 | **only** after Codex returns `SEND_TO_CLAUDE` |
| OpenCode ordinary implementation | override §1, §9 | `PRIMARY_GENERAL_IMPLEMENTATION_WORKER` |
| Qwen bounded secondary remediation/testing support | override §1 | bounded specialist/testing only |

### 5.2 Explicitly prohibited — unchanged, and each is a hard stop

| Prohibited | Source |
|---|---|
| `H3D-A1` DML | override §5, §11; Owner decision §7 |
| `H3D-LIVE` Auth/grant/hook mutation | override §5, §11; Owner decision §7 |
| `H3E` role retirement | override §5, §11; Owner decision §7 |
| `H4` disposable-product live mutation | override §5, §11; Owner decision §7 |
| Production mutation | override §5, §11; brief §6, §7 |
| `BK01` Junction A retry — BK01 stays quarantined | override §5; brief §7 |
| Creation/mutation of any LAB role or credential | Owner decision §7 |
| Creating an ephemeral writable LAB role | Owner decision §7 |
| Making a role or credential persistent in the secret store | credential strategy §1 inv. 2 |
| Agent holding class **P** (LAB `postgres`) | credential strategy §1, §2 |
| AGY on backend/database/auth/security-contract remediation | override §1 (**no UI work exists in this package**) |
| Swarm owning Lane-B state or remediation reasoning | override §1 (bounded mechanical inspection/testing/evidence only) |
| Reviewer self-approval of a revision it mutated | override §1, §10; Relay skill |
| Fallback to Swarm, direct CLI, Claude-controller mode, or an older Relay copy | override §2 |
| Inventing a Product code to force Control sync | override §2, §12 |
| `git clean` / `reset` / `rebase` / stash of unknown work | brief §7; Relay skill |

### 5.3 Owner checkpoints — all five remain hard stops

`OWNER-CP-H3D-A1` · `OWNER-CP-H3D-LIVE` · `OWNER-CP-H3E` · `OWNER-CP-H4` · `OWNER-CP-HOUSE-A`

Confirmed verbatim from override §11: **no silence, prior approval, reviewer PASS, Relay
PASS, Swarm PASS, or Control telemetry counts as Owner approval.** No reviewer PASS
authorizes an Owner checkpoint automatically.

---

## 6. Root-cause / finding-family ledger — Codex rounds 1–4 (§14)

Complete inventory of all 26 findings across four FAIL rounds, grouped by root-cause
family. Every review carried **Mutation: None** and **no LAB/Auth/secret access**; no
review's verdict is invalidated by reviewer mutation.

Reviewed revisions: R1 `4c3210d` · R2 `47eab10` · R3 `c6c5467` · R4 `675975b`.
Execution source checked every round: `2b1af86` (unchanged throughout).

### 6.1 Round-by-round finding counts

| Round | Reviewed SHA | Verdict | Findings raised | Still open at that round's end |
|---|---|---|---|---|
| R1 | `4c3210d` | FAIL | `DEFECT-01`…`DEFECT-10` (10) | 10 |
| R2 | `47eab10` | FAIL | `NEW-DEFECT-01`…`NEW-DEFECT-05` (5) | 0 fully closed from R1's set were added; 5 new raised, 2 carried partial |
| R3 | `c6c5467` | FAIL | `NEW-DEFECT-06`, `NEW-DEFECT-07` (2) | `NEW-DEFECT-03`, `-05`, `-06`, `-07` |
| R4 | `675975b` | FAIL | `NEW-DEFECT-08`, `NEW-DEFECT-09` (2) | `NEW-DEFECT-03`, `-05`, `-06`, `-08`, `-09` |

### 6.2 Family F1 — exact-revision provenance of evidence claims

| Finding | Sev | R1 | R2 | R3 | R4 | Final |
|---|---|---|---|---|---|---|
| `DEFECT-01` C's false unchanged-range claim | HIGH | raised | **NOT CLOSED** → `NEW-DEFECT-01` | CLOSED | — | **CLOSED** |
| `NEW-DEFECT-01` C still asserts a false common last-change SHA | HIGH | — | raised | CLOSED (per-file SHAs recorded; loop empty for all seven) | — | **CLOSED** |
| `DEFECT-07` provenance negative controls don't reject a constant identity | MED | raised | CLOSED | — | — | **CLOSED** |
| `DEFECT-10` F7 overstates the ACL evidence | LOW | raised | CLOSED | — | — | **CLOSED** |
| `DEFECT-09` / `G-H4-5` operator pack assigns H4 platform SQL to "Agent" | HIGH | raised | CLOSED as recorded gap | — | — | **CLOSED as a finding; remediation debt remains, scheduled before `OWNER-CP-H4`** |

### 6.3 Family F2 — **effective privilege / credential boundary model** ← the reconstructed root cause

| Finding | Sev | R1 | R2 | R3 | R4 | Final |
|---|---|---|---|---|---|---|
| `DEFECT-02` W is not the exact "no other schema" boundary claimed | HIGH | raised | PARTIALLY CLOSED → `NEW-DEFECT-02` | CLOSED *as policy-table correction* (gate still under-specified → `NEW-DEFECT-06`) | — | reopened downstream |
| `NEW-DEFECT-02` W boundary contradicts the `H3D-LIVE` grant and its own forbidden-reach gate | HIGH | — | raised | CLOSED as policy-table correction | — | see `NEW-DEFECT-06` |
| `DEFECT-03` M is not actually read-only under the managed ACL | HIGH | raised | CLOSED | — | — | **CLOSED** |
| `NEW-DEFECT-03` "no real-table write privilege" check tests only `INSERT` | MED | — | raised | PARTIALLY CLOSED | **PARTIALLY CLOSED** | **OPEN** |
| `DEFECT-04` window-open write probe is not harmless (`ROW EXCLUSIVE` lock) | MED | raised | PARTIALLY CLOSED | — | — | superseded by `NEW-DEFECT-09` / §3a rewrite |
| `NEW-DEFECT-06` `H3D-LIVE` exception gate cannot prove an exhaustive object boundary | MED | — | — | raised | **PARTIALLY CLOSED** | **OPEN** |
| `NEW-DEFECT-07` revised all-privilege check includes accepted managed-surface writes in the forbidden set | MED | — | — | raised | **CLOSED** | **CLOSED** |
| `NEW-DEFECT-08` `H3D-LIVE` relation checks cannot identify the exception relation reliably | MED | — | — | — | raised | **OPEN** |
| `NEW-DEFECT-09` accepted-exposure positive query is not an exact reachable-relation assertion | MED | — | — | — | raised | **OPEN** |

The recurrence is the finding: **`DEFECT-02 → NEW-DEFECT-02 → NEW-DEFECT-06 → NEW-DEFECT-08/09`**
is one root cause surviving four revisions — the contract keeps modelling privilege as a
*declared grant list* when the measured truth is a *reachability relation over qualified
objects, schema `USAGE`, ownership capability, and RLS visibility*. Each repair moved the
error one layer down instead of changing the model.

### 6.4 Family F3 — non-vacuous, harmless, guarantee-backed check contracts

| Finding | Sev | R1 | R2 | R3 | R4 | Final |
|---|---|---|---|---|---|---|
| `DEFECT-05` W sufficiency for trigger DDL is asserted, not proven | MED | raised | PARTIALLY CLOSED | PARTIALLY CLOSED | **PARTIALLY CLOSED** | **OPEN** |
| `NEW-DEFECT-05` trigger capability probe not operationally harmless; guaranteed-rollback model is prose | MED | — | raised | PARTIALLY CLOSED | **PARTIALLY CLOSED** | **OPEN** |
| `DEFECT-06` per-stage cleanup incomplete for Auth/grant/token surfaces | MED | raised | PARTIALLY CLOSED → `NEW-DEFECT-04` | CLOSED | — | **CLOSED** |
| `NEW-DEFECT-04` H3D-LIVE teardown sequence is not the source execution order | MED | — | raised | CLOSED | — | **CLOSED** |
| `DEFECT-08` Auth measurement can pass without a complete measurement object | MED | raised | CLOSED | — | — | **CLOSED** |

### 6.5 Open finding set — **five, not two**

`NEW-DEFECT-03` · `NEW-DEFECT-05` · `NEW-DEFECT-06` · `NEW-DEFECT-08` · `NEW-DEFECT-09`

**Discrepancy recorded as a finding in its own right:**
`STATUS-LANE-B-PRE-A1-CONTROLLER-PACKAGE-2026-09-22.md` §3 states *"Both are in
`CREDENTIAL-STRATEGY-LANE-B-2026-09-22.md`"* and names only `NEW-DEFECT-08` and
`NEW-DEFECT-09` as blocking. Codex round 4's own dispositions leave three further findings
`PARTIALLY CLOSED` (`NEW-DEFECT-03`, `-05`, `-06`). **The status document under-reports the
open set by three.** Consequence: any reconstruction scoped only to `-08`/`-09` — which is
what override §9's warning against "patch `NEW-DEFECT-08/09` in isolation" guards against —
would leave three known-open, same-family defects in place. The reconstruction inventory
therefore uses Codex's disposition table, not the status summary, as its finding set.

---

## 7. Issue fingerprints (§6, §14)

Derived as `failure_class | component | failing_gate | root_cause/symptom signature`.
Counters are per-fingerprint and are **not** reset by wording or filename changes.

| ID | Fingerprint |
|---|---|
| `IF-01` | `security_contract_model | CREDENTIAL-STRATEGY §1a + §3 forbidden-reach/accepted-exposure gates | relation identity + effective reach vs catalog presence | declared-grant-list model cannot express reachability: same family across R1 DEFECT-02 → R2 ND-02 → R3 ND-06 → R4 ND-08/09` |
| `IF-02` | `nonvacuous_probe_contract | CREDENTIAL-STRATEGY §3a trigger-DDL capability probe | guaranteed rollback / bounded lock | harmlessness rests on prose; no executable wrapper contract: R1 DEFECT-05 → R2 ND-05 → R3 ND-05 → R4 ND-05` |
| `IF-03` | `evidence_provenance | VERIFICATION-H2-H4 §2 exact-revision claims | unchanged-range assertion | claim-vs-reality on revisions: R1 DEFECT-01 → R2 ND-01 → closed R3` |
| `IF-04` | `operator_authority_actor | OPERATOR-ACTION-PACK §H4 vs credential class P | who executes platform SQL | documentation/authority gap G-H4-5; closed as finding, remediation owed before OWNER-CP-H4` |

### 7.1 Circuit-breaker audit — the legacy loop breached its own limit

Per §6, an issue fingerprint allows **at most two** ordinary bounded repairs, then Codex
classification, then at most one bounded Claude repair. Measured history for the shared
fingerprint `IF-01`:

| Step | Act | Revision |
|---|---|---|
| R1 FAIL | repair **#1** | `47eab10` |
| R2 FAIL | repair **#2** | `d2c094f` |
| R3 FAIL | repair **#3** ← **NOT PERMITTED under §6** | `675975b` |
| R4 FAIL | (no further patch was made; Owner issued this override) | — |

**Recorded deviation: ordinary repair #3 was executed under the legacy Claude-controller
loop.** That is a direct, mechanical explanation of why four rounds produced no PASS: the
loop kept patching a model it had already failed to repair twice, exactly the failure mode
§6 and §7 exist to stop. The new controller must not repeat it.

---

## 8. Reconstruction trigger (§7) — `PACKAGE_RECONSTRUCTION_REQUIRED`

§7 lists five triggers. **Four of five are independently satisfied**, so the state is
mandatory, not discretionary:

| # | Trigger | Satisfied | Evidence |
|---|---|---|---|
| 1 | an independent review returns 3+ material findings | **YES** | R1 returned 10 |
| 2 | any HIGH finding shows a foundational invariant/model is wrong | **YES** | `DEFECT-02` (HIGH) and `DEFECT-03` (HIGH): the privilege model described an intended grant list as if it were effective privilege |
| 3 | the same root-cause family survives across two reviewed revisions | **YES** | `IF-01` survives `675975b` and `c6c5467` (and `47eab10`, `4c3210d`) |
| 4 | two consecutive independent reviews FAIL | **YES** | R3 FAIL, R4 FAIL |
| 5 | a fix for one finding creates another finding in the same invariant family | **YES** | repairing `DEFECT-02` produced `NEW-DEFECT-02`; repairing that produced `NEW-DEFECT-06`; repairing that produced `NEW-DEFECT-08`/`-09` |

### 8.1 Legacy `Round 5` patch-loop routing — **DISABLED** (§14)

Explicitly disabled and replaced. There will be **no incremental patch-by-finding round
five**. The next review is a **new reconstructed-package review bound to a new baseline**,
not a continuation of the four-round loop, and must not be labelled "Round 5" as such.
Incremental reviewer-driven patching of the current `CREDENTIAL-STRATEGY` §1a/§3 text is
prohibited for the remainder of this reconstruction.

---

## 9. Reconstruction contract the package must satisfy (§8)

The reconstructed package must distinguish explicitly, as **separate, individually
asserted and individually falsifiable** layers:

```
catalog presence  !=  object grant  !=  schema USAGE  !=  effective reach
                  !=  RLS visibility  !=  ownership capability
```

And must preserve, without weakening, all of:

| # | Preserved element | Source |
|---|---|---|
| 1 | stage-specific exceptions (per-stage allowlist, not one constant list) | §8; R3 `NEW-DEFECT-02` disposition |
| 2 | exact **qualified** relation identity (`schema.relation`, or relation OID) — never a bare `relname` | §8; R4 `NEW-DEFECT-08` |
| 3 | managed `cron` / `net` residual exposure, described as accepted + bounded + re-measured — never as absent | §8; credential strategy §1a inv. 5 |
| 4 | non-vacuous checks (a check that cannot fail is not a check) | §8 |
| 5 | harmless/bounded capability probes (bounded lock + guaranteed rollback, as an executable contract) | §8; R4 `NEW-DEFECT-05` |
| 6 | no LAB/role/Auth mutation and no class-P-on-agent | Owner decision §7; credential strategy §1 |
| 7 | H2 `NOLOGIN` boundary and the no-product-direct-LOGIN invariant | Owner decision §2; H2 invariants 1–3 |

### 9.1 Contract choice resolved by the override (not a Decision Gap)

R4 `NEW-DEFECT-09` requires the author to *"choose and state one contract"* between
(a) effective-reach assertion and (b) catalog-surface inventory. **The override already
decides this** in §8/§9 by requiring both *exact qualified relation identity* **and**
*managed `cron`/`net` residual exposure preserved*. The reconstruction therefore must state
**both contracts separately and label them**: an **effective-reach** assertion (schema-qualified
identity + schema `USAGE` distinction + object privilege set) and, separately, a
**catalog-surface inventory** that is never described as effective reach. They are not
alternatives; conflating them is the defect. No Owner ruling is needed for this.

---

## 10. Relay preflight packet (§5) — `work_type=OTHER`

Filled per `references/agent-relay-preflight-template.md`; canonical procedure
`SKILL.md` v2.5.3 governs if this differs.

```text
AGENT RELAY PREFLIGHT
Canonical skill:  D:\AI-Workspace\runtime\hermes-native\data\skills\devops\kanban-external-agent-dispatch\SKILL.md
                  / 2.5.3 / be80473c22ff0eda0f3480b35aa056287983f861c83c6a72a6ef21db721d0d5f
Hermes runtime home: D:\AI-Workspace\runtime\hermes-native\data   (canonical orchestrator root; guard ok:true)
Work type: OTHER  (explicit Owner-approved Relay shape and scope — override §1/§5/§9)
Source of Truth: docs/platform/shared-runtime/CREDENTIAL-STRATEGY-LANE-B-2026-09-22.md (planning branch)
                 docs/platform/shared-runtime/BRIEF-AGY-LANE-B-PRE-A1-FINDINGS-REMEDIATION-2026-09-22.md
                 docs/platform/shared-runtime/VERIFICATION-H2-H4-CONSISTENCY-2026-09-22.md
                 docs/platform/shared-runtime/REVIEW-CODEX-LANE-B-CONTROLLER-PACKAGE{,-ROUND2,-ROUND3,-ROUND4}-2026-09-22.md
                 docs/platform/shared-runtime/evidence/H1-EFFECTIVE-PRIVILEGE-INVENTORY-2026-09-08.md
                 execution source @ 2b1af861aa608f08abb0bd8224821b9ca5ac9981
Implementation Gate: N/A   (this is not a COUNCIL-BUILD; no Council gate governs it)
Owner Build Approval: N/A  (Owner routing override + Owner decision supply authority)
Release policy: RELAY_STANDARD   (not COUNCIL_RELEASE)
Workspace: D:\AI-Workspace\runtime\worktrees\house-lane-b-longrun-plan-20260922   (contract artifacts)
           D:\AI-Workspace\runtime\worktrees\house-h3d-h5-20260909                (source/tests/gates)
Git target: planning  work/house-lane-b-longrun-plan-20260922 @ 1943d1aedb24e8e72ce5845fd038de78e04d62ad
            execution work/house-h3d-h5-20260909              @ 2b1af861aa608f08abb0bd8224821b9ca5ac9981
            both: remote parity exact at takeover
Allowed paths: see §10.2
Prohibited paths: see §10.2
Execution stages: see §10.3
Agents: Hermes=CONTROLLER/INTEGRATION-VERIFIER ; agent-opencode=PRIMARY_GENERAL_IMPLEMENTATION_WORKER ;
        agent-codex=INDEPENDENT-QA / defect classifier (withheld until candidate frozen) ;
        agent-claude=SENIOR_DIFFICULT_REMEDIATION_ENGINEER (withheld pending Codex SEND_TO_CLAUDE) ;
        agent-qwen=bounded secondary remediation/testing (not selected for this unit) ;
        agent-agy=NOT USED (no UI work in this package) ; swarm=not used for this unit
Context mode: per stage — U-R1/U-R2 BUILD ; pre-review falsification INFORMED-VERIFY ; Codex review INDEPENDENT-QA
QA mode: INDEPENDENT (Codex, bound to the frozen revision pair)
External CLI health: see §10.5
Parallelism: sequential, one writer per worktree, no overlapping write scope — Owner cost policy
             ("ปล่อยทีละ module") and override §1
Failure behavior: STOP   (outside the §6 remediation authority)
```

### 10.1 External CLI health — measured at takeover

Relay `readiness()` was **not** run in full at takeover: its step 3 (the non-substantive
invocation probe) spends tokens, which the Owner's cost policy forbids spending without a
dispatch. Layers 1–2 were measured directly.

| Identity | Executable | Observed version | Auth / session readiness |
|---|---|---|---|
| `agent-opencode` | `D:\AI-Workspace\runtime\opencode\bin\opencode.cmd` | `opencode v2.0.3` | **PASS** — `ollama_list_model_present` |
| `agent-codex` | `D:\AI-Workspace\runtime\npm-global\npm\codex.cmd` | `codex-cli 0.147.0` | **PASS** — `text_authenticated` |
| `agent-claude` | `…\node_modules\@anthropic-ai\claude-code\bin\claude.exe` | `2.1.269 (Claude Code)` | **PASS** — `json_logged_in_true` |
| `agent-qwen` | `D:\AI-Workspace\runtime\npm-global\npm\qwen.cmd` | `0.23.3` | **PASS** — `settings:glm-5.3-flash:cloud` |
| `agent-agy` | `D:\AI-Workspace\runtime\npm-global\npm\agy.EXE` | `1.2.7` | **PASS** — `agy_models` (not selected; no UI work exists) |

Wrappers and pins recorded for provenance binding:

| Identity | Wrapper | Wrapper SHA-256 |
|---|---|---|
| `agent-codex` | `…\scripts\invoke-codex-worker.ps1` | `d50e07e4374c88e525a0c3bd20874701b0067d39726a9316904b075d221c5b39` |
| `agent-qwen` | `…\scripts\invoke-qwen-worker.ps1` | `9f3791762c2435590552ad63cc930984ac7cd69f35d3497611af272bde829e24` |

**Layer 3 (`READY` sentinel invocation probe) = `DEFERRED_TO_DISPATCH` for every identity**,
to be executed by `direct_external_executors.py` immediately before that identity's first
substantive dispatch, per the installed v2.4.1 Executor Readiness Preflight Contract. No
identity is released substantively on the strength of layers 1–2 alone.

### 10.2 Allowed / prohibited paths — exact

Contract workstream (planning worktree, Hermes + one designated writer):

- allowed: `docs/platform/shared-runtime/CREDENTIAL-STRATEGY-LANE-B-2026-09-22.md`
- allowed (new): `docs/platform/shared-runtime/LEDGER-LANE-B-FINDING-FAMILIES-2026-09-22.md`
- allowed (new): `docs/platform/shared-runtime/RECONSTRUCTION-LANE-B-CREDENTIAL-BOUNDARY-2026-09-22.md`
- allowed (new): `docs/platform/shared-runtime/TAKEOVER-PREFLIGHT-LANE-B-HERMES-RELAY-2026-09-22.md`
  (this record — written; uncommitted)
- allowed: `docs/platform/shared-runtime/BRIEF-AGY-LANE-B-PRE-A1-FINDINGS-REMEDIATION-2026-09-22.md`
  (only where the reconstructed contract requires it to change)
- **prohibited:** every `REVIEW-CODEX-*` file — reviews are immutable evidence and must never
  be edited by any agent; `STATUS-*`, `OWNER-*`, `RUN-MANIFEST-*`, `ANALYSIS-*`, the override;
  all of `HANDOFF-*`, `PRE-01-*`, `ADDENDUM-*`, `ADR-*`, `BLOCKER-*`, `DESIGN-*`,
  `OPERATOR-*`, `REPORT-*`, `BATCH-*`, `VERIFICATION-*`, `fixtures/`, `migrations/`,
  `evidence/**` other than the one new path above; and everything outside
  `docs/platform/shared-runtime/`.

Source workstream (execution worktree, one designated writer):

- allowed: `tools/shared-runtime/h3d/**`, `tools/shared-runtime/inventory/**`,
  `tools/shared-runtime/lib/**` (new shared helpers), `tools/shared-runtime/h3c/h3c-privilege-snapshot.sql`
  and `tools/shared-runtime/h4/h4-privilege-snapshot.sql` (provenance field only),
  `tools/shared-runtime/package.json` (script entries only, **no new dependency**),
  `docs/platform/shared-runtime/fixtures/**`, `docs/platform/shared-runtime/runbooks/**` (new)
- **prohibited:** `docs/platform/shared-runtime/migrations/*` (class P, platform lane, not
  authorized), `tools/shared-runtime/h4/h4-probe-harness.mjs`, anything under
  `products/`, `ps01/**`, any PS01 worktree, and everything outside the list above.
- `H3D_OUT_DIR` **must** point outside the repo on every tool run (standing rule, `ANALYSIS` A6).
- Scaffolders, `git clean`, `git reset`, `rm -rf`, `DROP OWNED BY` — prohibited.

### 10.3 Selected Relay graph — roles, not identities

```
[U-R1] finding-family ledger + source verification        agent-opencode   BUILD
   -> deterministic gate: ledger covers all 26 findings, every open claim re-checked vs 2b1af86
[U-R2] contract reconstruction (planning contract)        agent-opencode   BUILD
   -> deterministic gate: falsification selftests authored + repo gates
[U-R3] executable checks + runbooks (source/tests)        agent-opencode   BUILD
   -> deterministic gate: npm run selftest / sql-static-check / catalog-manifest --selftest / git diff --check
   -> PRE-REVIEW FALSIFICATION across the whole reconstructed surface   Hermes  INFORMED-VERIFY
   -> FREEZE candidate revision pair
   -> ONE fresh independent review bound to the frozen pair             agent-codex  INDEPENDENT-QA
   -> [Hermes] integration/state consistency verification
   -> advance only to the next already-authorized technical state
```

Minimum sufficient team: **one ordinary implementation worker, one independent reviewer,
one controller.** No Architect stage (locked docs are the source of truth). No UI stage
(there is no UI work). No Final-Auditor stage for this unit. Qwen, AGY and Swarm are not
selected — no capability gap this unit needs them to fill.

Escalation ladder per override §6: after two bounded ordinary repairs on one fingerprint →
Codex classification → Claude only on `SEND_TO_CLAUDE` → rerun the exact failed gate.

### 10.4 Structural blocker found at takeover — two divergent branches vs §9's "one revision"

**Fact.** planning HEAD and execution HEAD diverged at `d6707c0`; neither is an ancestor of
the other. The contract to reconstruct exists only on planning; the source/tests/gates the
reconstruction must change exist only on execution.

**Conflict.** Override §9 requires the reconstruction unit to produce *"one exact candidate
revision and complete changed-file list"*. That is not literally achievable across two
divergent branches without either (a) merging them — not authorized and not in scope, or
(b) duplicating artifacts — which would itself create a new provenance defect of exactly
the family `IF-01`/`IF-03` describe.

**Resolved interpretation (controller authority, not a Decision Gap).** The reconstruction is
**one logical unit with two revision-bound workstreams**, sequenced and single-writer per
worktree:

1. U-R2 lands on the planning branch (contract + falsification design);
2. U-R3 lands on the execution branch (executable checks + runbooks implementing that contract);
3. the **candidate revision is the ordered pair**
   `(planning SHA, execution SHA)`, with each workstream's own changed-file list;
4. Codex's single independent review is bound to **both** SHAs — strictly stronger than one
   SHA, since neither can move without invalidating the verdict;
5. any mutation to either SHA invalidates the review (brief §4 rule 7), and the pair is re-frozen.

This preserves §10's exact-revision binding and the "no inherited PASS across a mutated SHA"
rule while honouring §9's intent. It is surfaced here rather than silently assumed because it
changes what "the frozen revision" means for this run. **Owner may override this interpretation.**

Second-order consequence, recorded: the reconstruction's contract changes are **not visible to
anyone reading the execution branch alone**, and vice-versa. Any later reviewer or relay
worker given only one worktree will see an incomplete picture — every card in this run must
name both.

### 10.5 Preflight hard-fail checks

| Check | Result |
|---|---|
| Runtime-home mismatch | none — guard `ok:true` |
| Material conflict | **one**, resolved in §10.4 and surfaced, not hidden |
| Missing required approval | none — override + Owner decision |
| Missing source of truth | none — all paths located and read |
| Dirty/ambiguous target revision | none — both worktrees clean and at pushed revisions; §4 classification complete |
| Overlapping parallel write scopes | none — single writer per worktree, sequential |
| Unavailable mandatory agent | none — all five executors healthy and authenticated |
| Incompatible context policy | none |

---

## 11. First reconstruction unit — acceptance checks (§9, §14)

**Objective.** Do not start `H3D-A1`. Do not patch `NEW-DEFECT-08`/`-09` in isolation. First,
inventory rounds 1–4 by root-cause family, verify every still-open claim against the execution
source `2b1af86`, and reconstruct the credential / effective-privilege contract coherently
from the source-of-truth invariants.

### 11.1 U-R1 — finding-family ledger + source verification

Acceptance checks (each deterministic; a claim with no command output behind it is not evidence):

| # | Acceptance check |
|---|---|
| A1 | All **26** findings from R1–R4 are enumerated with round, severity, disposition history, and final state. |
| A2 | Every finding is assigned to exactly one root-cause family; the assignment is justified from the review text, not from its title. |
| A3 | The **open set is derived from Codex dispositions, not from `STATUS`** — §6.5 requires 5 open (`-03`, `-05`, `-06`, `-08`, `-09`), and the discrepancy with `STATUS`'s 2 is recorded. |
| A4 | Each of the 5 open claims is **re-verified against source at `2b1af86`** with file+line citations (e.g. `CREDENTIAL-STRATEGY:263-265`, `BRIEF-AGY:89-98`, H1 `:57-77`). |
| A5 | Each still-open claim is classified: *still true* / *no longer true* / *cannot be evaluated without LAB*. |
| A6 | `IF-01` and `IF-02` fingerprints are reproduced with their full round history and per-fingerprint repair counters (§7.1). |
| A7 | Any claim in the round reviews that is itself wrong is reported. Reviewers are not assumed correct. |

### 11.2 U-R2 — contract reconstruction (planning branch)

| # | Acceptance check |
|---|---|
| B1 | All six layers of §9 are **separately named, separately asserted, and separately falsifiable**: catalog presence, object grant, schema `USAGE`, effective reach, RLS visibility, ownership capability. |
| B2 | No check compares a bare `relname`. Every relation is addressed by qualified identity (`nspname.relname`) or OID, and `has_table_privilege` is called with that identity. |
| B3 | The per-stage exception table is the sole allowlist source consumed by the forbidden-reach gate — no second constant list exists anywhere. |
| B4 | `wstera_platform_internal` enumeration is **not** privilege-filtered (`pg_catalog`, not `information_schema`), covers `r/p/S` for the table/sequence contract, and covers foreign tables / sequences separately wherever the text claims "every relation". |
| B5 | Accepted `cron`/`net` exposure is asserted as an **exact qualified set** via **effective reach** (schema `USAGE` included), and **catalog-surface inventory is asserted by a separate, differently-named contract** that is never called effective reach (§9.1). |
| B6 | The forbidden-write relation universe is **product/data relations only**, explicitly excluding accepted `cron`/`net`, `ps01_internal` ownership reach, and the stage's named exception — while retaining all four of `INSERT`, `UPDATE`, `DELETE`, `TRUNCATE` for genuinely forbidden relations. |
| B7 | The §3a trigger-DDL probe is an **executable contract**, not prose: bounded `lock_timeout` **and** `statement_timeout` matching the real teardown's `30s`, a wrapper that guarantees session termination on **every** connection path including a failure *inside* `client.connect()`. |
| B8 | The `H3D-LIVE` allowed relation asserts `SELECT/INSERT/DELETE = true` **and** `UPDATE/TRUNCATE/REFERENCES/TRIGGER = false` on that exact relation, and every other enumerated relation asserts all seven false. |
| B9 | Every falsification control would **fail the gate if the logic were removed** (mutation check), and that is demonstrated, not asserted. |
| B10 | H2 `NOLOGIN` / no-product-direct-LOGIN invariants and the no-class-P-on-agent rule are preserved verbatim. |

### 11.3 U-R3 — executable checks + runbooks (execution branch)

| # | Acceptance check |
|---|---|
| C1 | Every reconstructed contract clause that claims enforcement has a **counterpart in code or a gate**, or is explicitly marked as a control that lives elsewhere. |
| C2 | `npm run selftest` PASS (in `tools/shared-runtime`), including every new negative/falsification control. |
| C3 | `node tools/shared-runtime/h3d/sql-static-check.mjs` PASS. |
| C4 | `node tools/shared-runtime/h3d/catalog-manifest.mjs --selftest` PASS. |
| C5 | `git diff --check <base>..HEAD` clean on both workstreams. |
| C6 | Blocking (assignment-shape) secret scan over the diff and evidence = 0. |
| C7 | Changed-file list ⊆ §10.2 allowed scope on **each** workstream — shown, not claimed. |
| C8 | `H3D_OUT_DIR` outside the repo; both worktrees clean after every run; remote parity restored. |
| C9 | Every item that cannot be proven offline is marked `LIVE_DEFERRED_TO_A1_PREFLIGHT` and is **not** described as captured, verified, or matching LAB. |
| C10 | PS01 worktree untouched at `c169e5d`. |

### 11.4 Terminal state of the reconstruction unit

`RECONSTRUCTED PACKAGE READY FOR INDEPENDENT REVIEW` — and nothing stronger. The unit does
not advance any stage, does not touch LAB, does not create a role, and does not claim PASS.

---

## 12. Blockers and risks carried into the run

| # | Item | Severity | Status |
|---|---|---|---|
| R-1 | **Two divergent branches vs §9's "one candidate revision"** | MEDIUM | resolved by controller interpretation (§10.4); Owner may override |
| R-2 | **`STATUS` under-reports the open finding set (2 vs 5)** | MEDIUM | recorded (§6.5); reconstruction uses the Codex disposition set |
| R-3 | **`G-H4-5` remediation debt** — operator pack still assigns H4 platform SQL to "Agent", contradicting class P | HIGH (when H4 is reached) | open, scheduled before `OWNER-CP-H4`; not a blocker for the reconstruction unit |
| R-4 | **Commit authority for `saas-product-hub` is unresolved under the new controller** — this repo is a `claude-owns-git-commits` project; the override grants Hermes orchestration/evidence authority but does **not** name Hermes as committer | HIGH (blocks §5's "persist evidence under Lane-B control" and blocks landing the reconstruction) | **needs an Owner ruling** — see §13 |
| R-5 | `wcs-activity:cc6a86…` real dead letter, HTTP 400 `invalid payload` | LOW | recorded (§3.2); no retry issued; not a work verdict |
| R-6 | Windows PowerShell 5.1 cannot run the Relay guard (`Get-FileHash` unresolved) | LOW | resolved with pwsh 7.6.6 (§2.2); recorded so it is not misread as a HOLD |
| R-7 | `h3d_ro` drop is Owner-reported, not independently re-measured | LOW | known limitation (`BATCH-H3D-S` §8); `H3F` is the designed detector |
| R-8 | `H1` remains open and is wider than first recorded (any new role inherits managed `cron`/`net` write) | MEDIUM | open by design; bounded + re-measured per credential strategy §1a inv. 5; part of what the global PASS must close |

---

## 13. Action required before the first worker card

Two items genuinely block release and cannot be resolved by tool or context:

1. **Commit/push authority for `saas-product-hub` (R-4).** The standing project rule
   (`claude-owns-git-commits`, `04_Technical_Ref/host-tooling-and-git-rules.md` §2) reserves
   commit/push in this repo to Claude. The override gives Hermes orchestration, state and
   evidence authority but does not grant committer authority. §5 requires the round-4 review
   evidence to be persisted under Lane-B control, and the reconstruction must eventually land
   — both require commits. Options: (a) Owner grants Hermes explicit commit authority for this
   task, as was done for `WSTERA-HOUSE-PRODUCTION-CLOSURE-001`; (b) Claude performs the
   commits as a bounded mechanical act on the exact tree Hermes prepared; (c) Hermes writes
   all artifacts and hands the commit set to Claude.

2. **Go/no-go on the §10.4 candidate-revision interpretation** — that the frozen revision for
   this reconstruction is a bound pair `(planning SHA, execution SHA)` rather than one SHA.

Until both are answered, the run stays at **`PACKAGE_RECONSTRUCTION_REQUIRED`** with the
takeover complete and no worker released.

---

## 15. Addendum — §13 RESOLVED by Owner ruling (2026-09-22)

`OWNER-RULING-LANE-B-HERMES-RELAY-TAKEOVER-2026-09-22.md` resolves both blockers.

| §13 item | Owner decision |
|---|---|
| ① Commit/push authority for `saas-product-hub` | **APPROVED for this task only** — Hermes = mechanical integration owner / state holder, restricted to the two named branches and to files inside the task's allowed scope. Standing rule `claude-owns-git-commits` is overridden **within that boundary only**; outside it the rule stands. Prohibited: `git add .`/`-A`, force push, reset/clean/rebase of unknown-origin work, touching any other branch/repo, and Hermes doing substantive implementation. |
| ② Candidate revision = bound pair | **APPROVED** — canonical candidate identity is the immutable pair `(planning_sha, execution_sha)`. §10.4's interpretation is **confirmed as approved**, not merely tolerated. A candidate manifest must state both branches + SHAs, per-branch changed-file sets, related artifact/evidence hashes, and its own SHA256. Either SHA changing **expires the candidate immediately** and forbids inheriting the prior review/PASS. Merging branches solely to give a review one SHA is prohibited. |

**Release authority granted:** after persisting the ruling + Round-4 review + this record,
`U-R1` may be released. The run may proceed per Relay to the next Owner checkpoint
**without returning to the Owner for bounded technical remediation inside this authority.**

**Unchanged by the ruling:** legacy Round-5 patch loop stays **DISABLED**; state stays
`PACKAGE_RECONSTRUCTION_REQUIRED`; the real open set `ND-03`, `ND-05`, `ND-06`, `ND-08`,
`ND-09` is used; reconstruction is root-cause-first, **not** an isolated `ND-08`/`-09` patch.
All Owner checkpoints and live-mutation boundaries remain in force — `H3D-A1` live mutation,
`H3D-LIVE`, LAB/Auth/role/config mutation, `H3E`, `H4`, Production and BK01 Junction A stay
**NOT authorized**.

---

## 16. State after ruling

| Field | Value |
|---|---|
| Takeover preflight | **COMPLETE** |
| §13 blockers | **RESOLVED** (both approved) |
| State | `PACKAGE_RECONSTRUCTION_REQUIRED` |
| Commit/push authority | **GRANTED** — Hermes, this task, 2 branches, allowed-scope files |
| Candidate identity | **bound pair** `(planning_sha, execution_sha)` + manifest |
| Round-4 review persisted | yes |
| This record persisted | yes |
| Owner ruling persisted | yes |
| Next action | **release `U-R1`** (finding-family ledger + source verification) |
| Live mutation | **NONE** |
| LAB / Supabase / Auth / secret access | **NONE** |

`next-action: release U-R1 via Agent Relay`
