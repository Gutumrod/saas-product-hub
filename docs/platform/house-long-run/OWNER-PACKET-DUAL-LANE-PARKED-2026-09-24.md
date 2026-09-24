# OWNER PACKET — DUAL LANE, BOTH LANES PARKED AT `PARKED_OWNER_GATE`

Task: `WSTERA-HOUSE-DUAL-LANE-CONVERGENCE-001`
Governing brief: `BRIEF-HOUSE-DUAL-LANE-CONVERGENCE-2026-09-24.md`
Controller / state holder: Hermes · Model: `deepseek-v4.1-flash:cloud`
Opened: 2026-09-24 (Asia/Bangkok) · Written by: Hermes (mechanical record; Hermes does not decide or approve)

State: **NO LANE REACHED CONVERGENCE. NO PRODUCTION MUTATION PERFORMED BY THIS SESSION.**
Per brief §8, both lanes are parked and both exact decisions are reported together in this one packet.

```text
LANE_A: PARKED_OWNER_GATE / awaiting 4 Owner rulings (3 from V3 §11.5 + the release authorization itself)
LANE_B: PARKED_OWNER_GATE / awaiting the protected-skill Owner authorization + the scanner ruling
```

---

## 1. Measured entry state (re-measured this session, not inherited)

| Item | Measured value | Parity |
|---|---|---|
| Lane A planning `work/wstera-control-truth-sync-001` | `710a7a0f9d23a894493ac223e12fda2e87ae4b31` | local = origin = `ls-remote` · dirty 0 |
| Lane A brief commit | `710a7a0` — "converge Lane A and Lane B at one stop gate" (+520, brief only) | — |
| Lane A brief blob sha256 | `6b06ae7d6dcd98dbc3b019821cf41a51704c0b87faeb6b36405da640b7f31352` | working tree = committed blob |
| Lane B planning `work/house-lane-b-longrun-plan-20260922` | `c56f709672415626422e3fb6e65f27a1a2193008` | local = origin = `ls-remote` · dirty 0 |
| Lane B execution `work/house-h3d-h5-20260909` | `53346383faa2a87fac483a7a3bf5233a200e295d` | local = origin = `ls-remote` · dirty 0 |
| Installed canonical Agent Relay | version **`2.5.5`** | verifier `27/27 PASS` (exit 0, run this session) |
| Installed Relay `RELEASE-MANIFEST.json` | `09e606871a09cc8a251b14ff51b977604fcb390eb50705c04ab6fd34cea71a50` | — |
| Installed Relay `SKILL.md` | `9c2e7ccb680f7d8b3d374ceee81f9bdb137bd8e28784def275b4a5f2a8f1aaf0` | — |
| Installed Relay `scripts/direct_external_executors.py` | `c29d09a061dd6edcc1d09b184c6f210afb11c115a343eeba0deaddf312abb99a` | — |
| Installed Relay `scripts/relay_execution_driver.py` | `705710c2327458d06ed5fcd502fc8d9cde4fe5ecdea82bdc4d98c277907c80e9` | — |
| Lane-A reviewed revisions | `A_EXPAND_REV dfcb4be` · `A_CONTRACT_REV dd9a629` · `wstera-workflows fb84b9d` | migration bytes re-verified this session |
| `0009_work_scope_identity.sql` @ dfcb4be & @ dd9a629 | `8f88a7d1e4d3777dd0c2adefa999f61799bd50dd1270407fa025f3c4068d3487` | MATCH (both revisions) |
| `0010_retire_legacy_work_event_rpc.sql` @ dd9a629 | `3963c6a6e6423f006889d87c735e86ef30831680964c19b096f23f2b091a7b30` | MATCH |
| `0010` @ dfcb4be | **absent** — `git cat-file -e` exit 128 | deployment boundary preserved |
| Lane-A helper / harness @ planning HEAD | `d87bd4aa938d0d0a853cea84289e182d29e2cafe6237ff2df3e4fb5a3a77398b` / `f62317c26923a0b41b143e48f0ed71ea8b8c5f8b1f4e2deb52ba89e4440f0b8c` | matches V3 §2 exactly |
| Lane-B gate contract (immutable) | content sha256 `00f0e9e57a620e5ad0a3c51f4596e285dfcf77b8cecdb84980efcff0bc6c1d6a` @ `05442fa` | **byte-identical at HEAD** (working-tree file is CRLF under `core.autocrlf=true`, hence `9ef6758f…` on disk — see §5) |

Owner-hold / incident artifacts are unchanged from the 2026-09-23 record:

```text
OWNER-HOLD-PRODUCTION-MUTATION-V3-2026-09-23.md              1f9afb5fc08b9832cb3e9d80700f80ee34f75809f773b48c48565779e3a226a3
INCIDENT-UNAUTHORIZED-CONTROL-DB-MUTATION-W0-2026-09-23.md   e41d6b89514375c223dcd55b1d810f525e3ea3ae526115275745c4e8d2a8a648
W0-PREFLIGHT-LANE-A-RELEASE-V1-2026-09-23.md                  c2bb14e674bca68825ae3062c7636a31e13b23acb0958abedcd09e1b86ea243a
```

Guard/interlock environment at measurement time (presence only, no values read):

```text
LANE_A_LIVE_DB_AUTHORIZED             UNSET
LANE_A_PRODUCTION_APPLY_AUTHORIZED    UNSET
LANE_A_CONTROL_DATABASE_URL           UNSET
```

No live DB contact was made this session. No connection was attempted. No migration, no deploy, no Cloudflare mutation, no skill install, no merge.

---

## 2. LANE A — why it is parked, and the exact decisions required

The brief's A0 requires, before W1, that all of the following exist. **None of them exists** — verified by search across `runtime/briefs`, `runtime/reviews` and the Lane-A docs tree this session:

1. the exposed CLI login-role credential **revoked/rotated** under explicit Owner authority;
2. the temporary CLI login role **remediated** under the Owner's chosen incident action;
3. an explicit Owner **backup/recovery posture** ruling;
4. recorded **human-operator / credential-provisioning** authority;
5. W0 **re-run** without `supabase db dump --dry-run` or any unreviewed mutation path;
6. all W0 gates PASS;
7. no unresolved secret-exposure incident.

Item 7 is **false** and items 1–4 are absent, so A0 cannot start. Per brief A0: `LANE_A = PARKED_OWNER_GATE`.
Per brief §14: a secret exposure is a **hard stop of the owning lane** — Lane A has not been advanced in any way.

### Decisions required — Lane A

| # | Subject | Options | Hermes note |
|---|---|---|---|
| A-0 | 🔴 Incident remediation (unauthorized Control DB CLI login-role created during W0; `PGPASSWORD` printed to session state ⇒ treated as compromised) | (a) `DELETE /v1/projects/plvpbribiomqppfokzir/cli/login-role` · (b) rotate instead of delete · (c) both | (a) was previously recommended; a reversal, not a new change, but still a Control-project mutation. **Not run unasked.** The exposed value must be revoked/rotated regardless. |
| A-1 | Backup / recovery posture (Control project has `backups []`, `pitr_enabled false`; host has no `pg_dump`/`psql`/`docker`) | (a) forward-fix-only, record that no recovery point exists · (b) require a logical dump first · (c) defer W1 | (a) previously recommended — `0009` is additive, `0010` is fail-closed. |
| A-2 | Operator + credential provisioning | name the human operator who sets `LANE_A_LIVE_DB_AUTHORIZED` / `LANE_A_PRODUCTION_APPLY_AUTHORIZED`; confirm the source class for `LANE_A_CONTROL_DATABASE_URL` | The helper refuses any target other than the Control project ref. Authority interlocks are safety interlocks — they do not create authority. |
| A-3 | The release authorization itself: `LANE_A_PRODUCTION_RELEASE_V1` | approve once (ordered windows W0→W5, each conditional on the prior window PASS) / withhold | V3 §10. Any FAIL stops before the next window; no authority is inferred to skip a gate. |

**Lane A does not advance on any answer below full approval of A-0…A-3.**

---

## 3. LANE B — why it is parked, and the exact decisions required

Brief B0 states three premises. Two are confirmed by measurement; **one is false**.

### 3.1 Confirmed — `stdout_sha256` provenance contract defect is still live

Measured against the installed revision:

```text
direct_external_executors.py:1445   "stdout_sha256": _sha256_file(output_file)      # hash of the FILE's bytes
relay_execution_driver.py:286       if metadata["stdout_sha256"] != _sha256_bytes(output.strip().encode("utf-8")):
                                                                                    # hash of the STRIPPED STRING
```

Controlled probe (OS temp dir, no repo file touched) — a reviewer output file containing `"VERDICT: PASS\n\nnotes here\n"`:

```text
executor hashes file bytes     sha256:e3e1305ede53d4c2c10ffede…
driver hashes stripped string  sha256:8ff8aeb4b70056d55dfb41a7…
equal?  False   => IDENTITY_PROVENANCE_MISMATCH:agent-codex:stdout fires whenever a reviewer SUCCEEDS in writing its output file
```

### 3.2 Confirmed — secret-scanner false positive on psql client-variable references is still live

Probe run with the installed adapter's **own** patterns and predicates over the Lane-B runbooks:

```text
patterns extracted: 2 · runbook files: 8
lane-b-role-lane_b_measure_a1-create.sql   | MATCH="PASSWORD :'role_password" | candidate='role_password' | synthetic=False | would_fire=True
lane-b-role-lane_b_measure_live-create.sql | MATCH="PASSWORD :'role_password" | candidate='role_password' | synthetic=False | would_fire=True
lane-b-role-lane_b_rw_a1-create.sql        | MATCH="PASSWORD :'role_password" | candidate='role_password' | synthetic=False | would_fire=True
lane-b-role-lane_b_rw_live-create.sql      | MATCH="PASSWORD :'role_password" | candidate='role_password' | synthetic=False | would_fire=True
```

No `_PSQL_VAR` exemption exists in the installed revision (grep count 0). The scanner is pristine; the false positive is intact.

### 3.3 🔴 CONTRADICTED — the non-BUILD scope-guard defect is NOT fixed in the installed revision

The brief states the earlier non-BUILD scope-guard defect "is already remediated and is NOT reopened by this brief."
**That is not true of the revision actually installed and actually committed.** The harness-owned evidence root
`.secretary-relay/**` is **not** excluded, so the guard counts the harness's own stage evidence as a worker mutation.

Controlled probe reproducing the driver's exact before/after sequence
(`relay_execution_driver.py:1259`/`1295` snapshot → stage runs → `:1405` compare):

```text
baseline (before execution): []
after execution           : ['.secretary-relay/t_probe/direct-executors/codex-independent-review/DIRECT-EXECUTION.json',
                             '.secretary-relay/t_probe/…/codex-worker.prompt.txt',
                             '.secretary-relay/t_probe/…/codex-worker.stdout.log',
                             '.secretary-relay/t_probe/…/codex-worker.stderr.log',
                             'worker-scratch.log']
harness-owned evidence    : <the four .secretary-relay paths>
worker's own ignored write: ['worker-scratch.log']
exclusion present?        : False
stage verdict would be    : DIRECT_EXECUTOR_UNKNOWN:agent-codex:scope_violation:<those paths>…
```

Confirmed on the real lanes too — `_nonbuild_workspace_changed_paths()` against the live worktrees:

```text
lane-B execution worktree  : 134 changed paths, of which .secretary-relay entries = 1
lane-B planning  worktree  :  25 changed paths, of which .secretary-relay entries = 25  (all 25 are harness evidence)
```

Revision archaeology (sha256 of `direct_external_executors.py`):

| Artifact | sha256 (12) | `.secretary-relay` exclusion |
|---|---|---|
| backup `relay-windows-pre-v2.5.4-20260924-165128` | `beda9e4af07e` | **present (2 occurrences)** |
| backup `relay-windows-pre-v2.5.5-20260924-192103` | `705083a92130` | **absent** (identical hash to the 2026-09-19 pre-v2.5.3 backup) |
| **installed now** (`…/skills/devops/kanban-external-agent-dispatch/scripts/`) | `c29d09a061dd` | **absent** |
| **vault `HEAD` committed blob** | `7a573d63554b` | **absent** |
| vault working tree | `c29d09a061dd` | **absent** (equals installed) |

So the repair that the Lane-B remediation record describes as "present" exists only in a **16:51 backup**, was never committed to the canonical vault source (`git log -S` finds no such commit on any branch), and is **absent from what is installed now**. The live state is a reversion of that repair.

**Consequence, stated plainly:** the B0 baseline in the brief is wrong, and any B1/B2 review dispatched today would fail closed at the harness on its own evidence — exactly the same class of failure recorded on 2026-09-23, only now mis-attributed to "already fixed". This is a correction to the brief's premise, not a new defect invented by this session.

### 3.4 Protected-skill authorization is absent from this task's authority chain

Brief B0.1/B0.2/B0.3 each require mutation of `direct_external_executors.py` / `relay_execution_driver.py`, both listed in the installed `RELEASE-MANIFEST.json` (v2.5.5, protected canonical Relay components). Brief §6: *"Any required protected-skill Owner authorization must be consumed before mutation. If absent: `LANE_B = PARKED_OWNER_GATE`."*

Searched this session and **found no protected-skill Owner authorization** in the Lane-B authority chain (`docs/platform/shared-runtime/**`, `runtime/briefs/*.md`, `runtime/reviews/**`). The standing blocker doc still ends with an unanswered question, quoted verbatim: *"Which option (A / B / C / D) does the Owner rule?"*

Also measured, and relevant because it bounds what "the protected revision" means right now:

```text
vault HEAD  = 62827c4 = origin/master          (16 dirty entries, protected skill among them)
vault HEAD committed protected-skill source    SKILL.md version 2.5.3
installed protected skill                      SKILL.md version 2.5.5
=> canonical source and live runtime are NOT at the same protected-skill revision
```

The vault working tree carries uncommitted mutations to the protected skill and to `tools/agent-relay-adapter/**` (11 modified + 2 untracked in the skill, 3 modified in the adapter). **Hermes did not touch, revert, commit, stash, clean or reset any of it** (brief §3.4).

**Lane B does not advance on any answer below full approval of B-1 and B-2.**

### Decisions required — Lane B

| # | Subject | Options |
|---|---|---|
| B-1 | Protected-skill Owner authorization to mutate protected canonical Agent Relay components (`direct_external_executors.py`, `relay_execution_driver.py`) inside this task, before any B0.1/B0.2/B0.3 mutation | authorize the bounded mutation on the installed v2.5.5 revision / decline and leave the two defects open / authorize only after a canonical source-vs-live reconciliation |
| B-2 | Scanner false-positive ruling (carried forward unanswered from the 2026-09-23 blocker) | (A) bounded scanner fix keyed on the `:'` prefix **inside the raw match**, shipped with negative controls (stripe live/test, OpenAI project key, GitHub PAT, Slack token, opaque assignment, 32-hex, non-psql colon string) · (B) change the governed runbook convention instead, scanner untouched · (C) exempt the review stage from the wrapper-log scan (**not recommended** — weakens a security control on the independent stage) · (D) different reviewer or waive the R2 review |
| B-3 | The §3.3 correction — the non-BUILD scope guard is NOT fixed in the installed/committed revision, contrary to the brief | (a) treat it as in-scope for B0.1 alongside the provenance contract (it is the same protected file and blocks the same review dispatch) · (b) keep it out of B0 and open a separate bounded task · (c) leave it open |

Note on B-3: the brief explicitly says the scope-guard defect "MUST NOT be reopened". Hermes is not reopening it by interpretation — it is reporting that the claimed repair is **not present in the artifact** and asking the Owner to rule, rather than either silently re-fixing a protected file or silently proceeding on a false premise.

---

## 4. Shared-surface collision table (brief §7)

| Shared surface | Lane A | Lane B | Status |
|---|---|---|---|
| Control DB / roles / grants / functions | owns (parked, no window) | none | no overlap |
| platform Worker / Cloudflare | owns (parked, no window) | none | no overlap |
| installed Control Sync skill | owns at A4 (not reached) | none | no overlap |
| installed canonical Agent Relay skill | not used by Lane A (native-only) | owns at B0 | owned by Lane B; **no live window open in either lane** |
| shared secret / credential material | A-0 is the open incident | none | Lane A holds it; no mutation until A-0 |
| shared task/control records | Lane A revision 1+ | Lane B | no collision measured |

No live mutation window is open in either lane. `ls-remote` on all three lane branches matches the local SHAs.

---

## 5. Recorded facts that are easy to lose

- Working-tree sha256 of the immutable Lane-B gate contract is `9ef6758f…` while its committed blob is `00f0e9e5…` @ `05442fa`. Cause: `core.autocrlf=true` on this host converts LF→CRLF on checkout; **the blob at `HEAD` and at the approval-bound revision `05442fa` is identical to the approved content hash**. The contract's *authority binding is intact*; this is a checkout-encoding artifact, not an edit.
- Lane-B R2's declared frozen pair was `planning 7fee6b05… / execution 5334638…`. Current planning HEAD is `c56f709` — five later docs-only commits. Under the contract's invalidation rule the pair must be **re-frozen** before any dispatch; the brief's B1 already anticipates this.
- Control Sync outbox: 68 delivered, **13 dead-letter**, of which the newest is `wcs:KMO-DOMAIN-BOOKING-READINESS-001:3` (`http_422:unresolved product identity`, created 2026-09-24 23:19) — a `[KMO-D1A]` lane item, **not** a Lane-A/Lane-B item. No fake product code was invented to force it through (skill contract, GAP-A).
- `WORKER_LIVE_PROOF_MISSING` remains an open dependency for A3: the `0010` gate needs a recorded `0009` apply **and** a live-Worker proof of the 19-argument path at the same target ref and task id. Neither exists.

---

## 6. Non-claims

No production mutation of any kind · no DB contact and no connection attempt · no migration applied · no deploy · no Cloudflare mutation · no runtime skill install · no branch merge/rebase/cherry-pick between lanes · no secret value read, printed, or persisted · no protected-skill file edited, reverted, committed, stashed, cleaned or reset · no `git add .` / `git add -A` · no lane reached `LANE_*_READY_FOR_CONVERGENCE` · no convergence packet created (brief §10 is not reachable from this state) · no `HOUSE-A PASS` · no verdict converted from FAIL to PASS by narrative disposition.

Hermes has not decided any of the questions in §2 or §3. They are routed as the brief requires.

---

## 7. Requested next action

Answer **A-0…A-3** and **B-1…B-3**. On receipt, Lane A and Lane B resume independently; neither lane is blocked by the other's answer, and per brief §8 a partial answer resumes only the lane it unblocks.

```text
next-action: Owner ruling on LANE_A (A-0…A-3) and LANE_B (B-1…B-3); both lanes frozen meanwhile
```
