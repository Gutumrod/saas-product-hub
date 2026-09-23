# FOP-WU6 REQUALIFICATION — RESULT

Task: `WSTERA-CONTROL-TRUTH-SYNC-001` · Workflow `WF-DEV-01 v1.3.0 / LONG_RUN`
Governing brief: `BRIEF-LANE-A-FOP-WU6-REQUALIFICATION-2026-09-23.md` (`be36ab8`, sha256 `0acb58d36a7eb76d678a0dbb4533dbbd3f07d6fb6184f447d0f77e595d4ebb14`)
Recorded: 2026-09-23 (Asia/Bangkok) · Recorded by: Hermes (Long-Run Orchestrator / State Holder)
Entry state: `OWNER_HOLD_PRODUCTION_MUTATION_V3 / GOVERNANCE_REQUALIFICATION_REQUIRED`
Terminal state: **`FOP_WU6_REQUALIFIED / SWARM_WORK_UNIT_PASS / OWNER_HOLD_PRODUCTION_MUTATION_V3_RESTORED`**

---

## 1. Why this was required

The original FOP-WU6 lane ended `SWARM_WORK_UNIT_FAIL`. The Commander then wrote a disposition
document (`FOP-WU6-LANE-FAIL-DISPOSITION-2026-09-23.md`) explaining that both failing checks were
commander-authored defects. The Owner ruled that this is **not a valid substitute** for a Swarm PASS:
the installed `hermes-native-swarm` contract explicitly forbids converting a lane FAIL into PASS, and
requires advancement only from explicitly validated states. A genuine new lane was therefore required.

This record is that lane's result. It is a **separate requalification**, not a retroactive conversion.

## 2. Exact new work unit

```text
work_unit_id    FOP-WU6-RQ-REQUALIFY
lane_id         fop-wu6-rq
correlation_id  wstera-cts-001-fop-wu6-requal-20260923
engine          hermes-native-swarm (relay_path_used: false)
model           deepseek-v4.1-flash:cloud  (model_substitution_authorized: false)
capability      testing  -> swarm-tester
ownership       exclusive_read_only  (collision ledger: mutable=false)
base revision   be36ab8a42709ad8ed800bf56b41e63a0dfb7bb8
expected_mutations  []          (read-only lane; artifacts recorded: none)
worker exit     0
LANE STATE      SWARM_WORK_UNIT_PASS      reasons: PASS_CONSTRUCTED_FROM_POSITIVE_PROOF
SWARMCTL_EXIT   0
```

Evidence file:

```text
D:/AI-Workspace/runtime/hermes-native/workspace/wstera-cts-001/fop-amendment/out-wu6-rq/fop-wu6-rq/evidence-fop-wu6-rq.json
```

Commander-side deterministic checks, all observed by the commander (not self-reported):

```text
corrected-checker-passes                exit 0
helper-hash-exact                       exit 0
harness-hash-exact                      exit 0
no-reviewed-artifact-modified           exit 0
diff-check-clean                        exit 0
worktree-at-brief-revision              exit 0
git diff --check                        exit 0
```

## 3. The corrected checks (brief §5) and how each defect was closed

### Defect (a) — a prohibition was read as an authorization claim

The original check was `! grep -niE 'live access is authorized'`, which matched sentences that
**forbid** live access. The corrected checker (`check_wu6_requalification.py`, run by the lane and
re-run independently by the commander) is **negation-aware**: it splits prose into sentences and a
sentence whose matched phrase is preceded by `no`, `not`, `never`, `pending`, `without`, `absent`,
etc. is **not** counted as a claim.

The lane did not simply trust that logic — it independently classified every real hit itself:

```text
FOP-01-AMENDMENT-EVIDENCE-PACKET-2026-09-23.md:528
  "no live access is authorized by this packet, by the helper, or by the runbook;"
  -> PROHIBITION (negator "no " precedes the match)
FINDING-MIGRATION-RUNNER-CONTRADICTS-BRIEF-2026-09-23.md:198
  "...operator-contract level**, and no live access is authorized by this document."
  -> PROHIBITION (negator "no " precedes the match)
```

and it classified 12 additional `approved`/`approval` phrase hits as **0 positive claims**
(prohibitions, descriptive revision labels, or quoted preconditions for a future verdict).

**New root-cause detail the requalification surfaced** — this is stronger than the Commander's own
earlier analysis and is why the lane was worth running:

```text
RUNBOOK-LANE-A-EXPAND-DEPLOY-CONTRACT-2026-09-23.md:18
  "> approved** (see §10 and that finding's §8.1)."
  -> PROHIBITION: line 18 is the WRAPPED TAIL of the sentence that begins on line 17
     "...the second independent review is **pending**, and **`F-OP-01` is not / approved**"
```

The negators sit on the **previous physical line**. A line-oriented check cannot see them — which is
the precise mechanical reason the original inline check produced a false FAIL. The corrected checker
handles it because it reasons over sentences, not lines.

The lane also demonstrated **discrimination on synthetic strings of its own construction**: a
constructed sentence that positively claims live authorization was flagged, and one that forbids it was
not. A check that cannot fail is not a check, and this is the evidence that this one can.

### Defect (b) — the scope check counted another work unit's uncommitted files

The original check compared the working tree against a three-document allowlist while WU5's helper and
harness changes were still uncommitted. The corrected check measures against the **baseline revision**
`f68af6973c41b55b69e3b46fea555128e0c4c045` (the state before WU5 and WU6 ran) and classifies **every**
changed path:

```text
13 paths changed since f68af697 -- all attributable:
  WU5-owned        6  (the helper, the harness, four fop-wu3-artifacts JSONs)
  WU6-owned        3  (the runbook, the F-OP-01 finding, the F-OP-01 evidence packet)
  workstream docs  3  (Codex R2 verdict record, the lane-FAIL disposition, the V3 hold)
  Owner brief      1  (the requalification brief itself)
```

**Direct answer to the brief's question:** WU6 owned **no** path under
`docs/platform/house-long-run/tools/` — proven by
`git diff --name-only f68af697... -- docs/platform/house-long-run/tools/`, which lists 6 paths, all
WU5-owned.

### Positive identity checks (brief §5.3)

```text
helper  sha256 d87bd4aa938d0d0a853cea84289e182d29e2cafe6237ff2df3e4fb5a3a77398b   == Codex-R2 value
harness sha256 f62317c26923a0b41b143e48f0ed71ea8b8c5f8b1f4e2deb52ba89e4440f0b8c   == Codex-R2 value
runbook contains WORKER_LIVE_PROOF_MISSING                                      present
no positive live-authorization claim across runbook / packet / finding           confirmed
git diff --check                                                                clean
```

## 4. Codex R2 preservation (brief §7)

The requalification changed **none** of: the helper bytes, the harness bytes, the active runbook
bytes, the F-OP-01 operator-contract semantics, or the reviewed migration identities. Measured:

```text
helper  d87bd4aa...  unchanged
harness f62317c2...  unchanged
worktree clean (0 entries), HEAD be36ab8 == the brief revision
```

Therefore the independent technical review recorded at `4ca08f2` (`FOP-01-CODEX-VERDICT-R2-2026-09-23.md`,
verdict `APPROVED_WITH_FINDINGS`, *none requiring artifact change*) **remains the valid review of those
artifacts**. No additional Codex run is required for this evidence-only Swarm PASS. Had any reviewed
artifact changed, that review would be invalidated for the changed artifact and a new review would be
required before returning to V3.

## 5. Historical FAIL preserved, not rewritten

The prior lane's evidence is untouched on disk and still reads:

```text
.../out-fop-wu6/fop-wu6/evidence-fop-wu6.json   state: SWARM_WORK_UNIT_FAIL
```

It was **not** rewritten, re-labelled, or deleted. The disposition document explaining why its two
checks were wrong also remains in place. This requalification is a **new, separate** lane that reached
its own PASS against corrected checks — it does not retroactively convert the earlier FAIL, and it does
not claim the earlier failure was invalid. Both facts stand side by side.

## 6. Live boundary — verified, not asserted

```text
no database connection              (helper never invoked; no live-mode run in any log)
no authority variable set           `env | grep -c '^LANE_A'` -> 0
no backup created
no migration dry-run
no deploy / no Cloudflare mutation / no Control Sync skill install / no PR merge
no file created or modified by the lane   (expected_mutations: []; artifacts: []; worktree clean)
```

## 7. Restored state

```text
OWNER_HOLD_PRODUCTION_MUTATION_V3
```

`LANE_A_PRODUCTION_RELEASE_V1` may now be considered by the Owner. It remains **unauthorized** and no
live access, backup, apply, deploy, Cloudflare mutation or skill install is authorized by this document.

## 8. Non-claims

- This is a qualification/evidence result. It is **not** deployment approval, **not** DB-migration
  approval, **not** authorization to set either authority variable, **not** runtime-skill installation
  approval, and **not** live behaviour evidence.
- The helper has still **never been run in live mode**.
- F-OP-01 remains closed at operator-contract level only.
- No `PRODUCTION_READY`, no `OPERATED_STABLE`, no `READY FOR OWNER CONTROL TRUTH REVIEW`.
- `work.sync` remains blocked by GAP-A; no fake Product code was invented.
- The two harness runtime gates remain commander-executed (`44/44 PASS`) and reviewer code-inspected;
  no single environment has yet exhibited both.
