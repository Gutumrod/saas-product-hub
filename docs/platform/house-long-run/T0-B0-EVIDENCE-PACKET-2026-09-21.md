# T0 (B0) EVIDENCE PACKET — WSTERA-CONTROL-TRUTH-SYNC-001

Task: `WSTERA-CONTROL-TRUTH-SYNC-001` · Work unit `T0-WU03-B0-EVIDENCE-PACKET`
Correlation id: `wstera-cts-001-t0-wu03-20260921` · Role class: `evidence_preparation`
Workflow: `WF-DEV-01 v1.3.0 / LONG_RUN` · Stage: **T0** → B0 AUTO_GATE
Planning worktree: `D:/AI-Workspace/runtime/worktrees/wstera-control-truth-sync-001` @ `c6c7c0ece06aa861c1559afbecdc8368ebc532e1`

This document **normalizes** evidence. It records only values that were read from an artifact, and
names every read it performed so the record can be checked. It contains **no** gate approval, **no**
reviewer verdict, and **no** verdict of its own: B0 acceptance and any stage authorisation remain with
the commander and the manifest's checkpoints. Drift and intermediate values are recorded verbatim,
not normalized.

No source file was modified by this work unit. The single file written is this packet. No commit and
no push occurred. No secret store was read.

---

## A. Stage and revision identity

| Item | Observed value |
|---|---|
| Task | `WSTERA-CONTROL-TRUTH-SYNC-001` |
| Stage / gate | T0 (canonical reconciliation + runtime freeze) → B0 AUTO_GATE (`RUN-MANIFEST-...001.md:57-58`, `:77`, `:91-95`) |
| Workflow / mode | `WF-DEV-01` version `1.3.0`; `execution_mode: LONG_RUN` |
| Packet work unit | `T0-WU03-B0-EVIDENCE-PACKET` (lane `t0-wu03`), capability `evidence_preparation` |
| Work-unit correlation id | `wstera-cts-001-t0-wu03-20260921` |
| Packet revision bound to | `c6c7c0ece06aa861c1559afbecdc8368ebc532e1` |
| Planning branch | `work/wstera-control-truth-sync-001` |
| Mutable workspace | `D:/AI-Workspace/runtime/worktrees/wstera-control-truth-sync-001` (ownership `exclusive_mutable`) |
| Manifest base House revision | `13a2d55b509d15ee5b6375562b029c0dc98dce49` (`RUN-MANIFEST-...001.md:9`) |
| T0 lane 1 | `t0-wu01` / `T0-WU01-CANONICAL-RECONCILIATION` — produced `T0-CANONICAL-RECONCILIATION-2026-09-21.md` |
| T0 lane 2 | `t0-wu02` / `T0-WU02-EVIDENCE-SECRET-REDACTION` — edited that same document (redaction) |
| Packet unit observation window | 2026-09-21 14:56–15:02 +0700 (reads of the reconciliation document and both lane records at ~15:01 +0700 / 08:01Z) |

Observation about the packet unit's own lane (`t0-wu03`), recorded because it is an observed absence,
not an omission: at the moment this packet was written, no `evidence-t0-wu03.json` existed (the
read-only inspection root contained only `out-t0-wu03/t0-wu03/prompt-t0-wu03.txt` and a zero-byte
`t0-wu03.log`). No lane-level value (profile, model, provider, engine, session id, state) is therefore
quoted for `t0-wu03` in this packet. Sections B–H describe only the two lanes named in the work unit.

---

## B. Lane execution ledger

Source of every value below: the two lane evidence records, read with the exact invocations recorded
under "Read invocations" at the end of this section. `lane state` is the record's own `state` field;
`worker-reported state` is the record's `worker_report.state` (self-report, `trusted: false`).

### B.1 Lane `t0-wu01`

| Field | Observed value |
|---|---|
| lane id | `t0-wu01` |
| work unit id | `T0-WU01-CANONICAL-RECONCILIATION` |
| worker profile | `swarm-inspector` (capability `inspection`) |
| model | `deepseek-v4.1-flash:cloud` |
| provider | `ollama-cloud` |
| engine | `hermes-native` |
| session id | `20260921_144230_30a739` |
| lane state | `SWARM_WORK_UNIT_PASS` |
| record reasons | `PASS_CONSTRUCTED_FROM_POSITIVE_PROOF` |
| worker-reported state | `PASS` (`trusted: false`, `note: worker self-report; never converted into an approval`) |
| evidence record sha256 | `b26ccac448e689eabb3bff49c8f60f64b88f43bbe8f7255e7856d2ae366b69ad` |
| evidence record bytes | `26038` |
| record correlation id | `wstera-cts-001-t0-wu01-20260921` |
| record invariant status | `CLEAN`, findings `[]` |
| invocation argv shape | `hermes.EXE -p swarm-inspector chat --query-file prompt-t0-wu01.txt -Q --oneshot --max-turns 40 --in wstera-control-truth-sync-001 --source tool` |
| record started / finished (UTC) | `2026-09-21T07:42:29Z` / `2026-09-21T07:51:19Z` |

### B.2 Lane `t0-wu02`

| Field | Observed value |
|---|---|
| lane id | `t0-wu02` |
| work unit id | `T0-WU02-EVIDENCE-SECRET-REDACTION` |
| worker profile | `swarm-builder` (capability `implementation`) |
| model | `deepseek-v4.1-flash:cloud` |
| provider | `ollama-cloud` |
| engine | `hermes-native` |
| session id | `20260921_145352_f471ab` |
| lane state | `SWARM_WORK_UNIT_PASS` |
| record reasons | `PASS_CONSTRUCTED_FROM_POSITIVE_PROOF` |
| worker-reported state | `PASS` (`trusted: false`, `note: worker self-report; never converted into an approval`) |
| evidence record sha256 | `c8f694e369a2acf6c5d0dc8e4add31d287f7473683c35d278bb245fb47e00e87` |
| evidence record bytes | `19997` |
| record correlation id | `wstera-cts-001-t0-wu02-20260921` |
| record invariant status | `CLEAN`, findings `[]` |
| invocation argv shape | `hermes.EXE -p swarm-builder chat --query-file prompt-t0-wu02.txt -Q --oneshot --max-turns 25 --in wstera-control-truth-sync-001 --source tool` |
| record started / finished (UTC) | `2026-09-21T07:53:52Z` / `2026-09-21T07:57:20Z` |

### B.3 Lane-envelope observations read from the read-only inspection root

Read (masked only for credential-shaped literals) from `t0-wu01.log` and `t0-wu02.log`, first lines of
each envelope:

| Lane | Envelope `state` | Envelope `reasons` (as observed) |
|---|---|---|
| `t0-wu01` | `SWARM_REVIEW_REQUIRED` | `PASS_CONSTRUCTED_FROM_POSITIVE_PROOF` + `DECLARED_REVIEW_CHECKPOINT_PENDING:{'id': 'R1-AFTER-T2', ...}` (reason list content observed in `t0-wu02.log`; `t0-wu01.log` observed as `SWARM_REVIEW_REQUIRED` with a `reasons` list opening at line 12) |
| `t0-wu02` | `SWARM_REVIEW_REQUIRED` | `PASS_CONSTRUCTED_FROM_POSITIVE_PROOF`, `DECLARED_REVIEW_CHECKPOINT_PENDING:{'id': 'R1-AFTER-T2', 'reviewer': 'agent-codex', 'revision_bound': True}` |

Both run envelopes are therefore **review-required**, not final: the declared R1 checkpoint
(`R1-AFTER-T2`, reviewer `agent-codex`) is still pending. This is recorded as read; it is not a
verdict and is not resolved here.

### Read invocations used for this section

```
read_file(path=D:/AI-Workspace/runtime/hermes-native/workspace/wstera-cts-001/out-t0-wu01/t0-wu01/evidence-t0-wu01.json)
read_file(path=D:/AI-Workspace/runtime/hermes-native/workspace/wstera-cts-001/out-t0-wu02/t0-wu02/evidence-t0-wu02.json)
sha256sum /d/AI-Workspace/runtime/hermes-native/workspace/wstera-cts-001/out-t0-wu01/t0-wu01/evidence-t0-wu01.json \
          /d/AI-Workspace/runtime/hermes-native/workspace/wstera-cts-001/out-t0-wu02/t0-wu02/evidence-t0-wu02.json
stat -c '%s bytes %n' <same two paths>
sed -n '1,12p' t0-wu01.log ; sed -n '1,12p' t0-wu02.log
```

---

## C. Commander verification summary

Section `commander_checks` of each lane evidence record (command, exit code, expected exit, result),
plus its mirrored `verdict_inputs.required_checks` list:

| Lane | commander_checks entries | PASS | FAIL | failed check ids | mirrored required_checks | PASS | FAIL |
|---|---|---|---|---|---|---|---|
| `t0-wu01` | 19 | 19 | 0 | none (empty) | 19 | 19 | 0 |
| `t0-wu02` | 9 | 9 | 0 | none (empty) | 9 | 9 | 0 |

Observed per-lane detail:

- `t0-wu01` (19 checks): one artifact-existence test, ten level-2 heading `grep` checks (`## 1.` … `## 9.`),
  five pinned-value `grep` checks (`13a2d55…`, `4071307…`, `e711b94…`, `5dc81232…`, Swarm SKILL sha256,
  Control Sync SKILL sha256, `MAC_PARITY_UNVERIFIED`), one untouched-worktree guard
  (`git status --porcelain=v1 | grep -v 'T0-CANONICAL-RECONCILIATION-2026-09-21.md'`), and one
  `mutation-observed:` check. Every entry recorded `"result": "PASS"`, `"exit_code": 0`,
  `"expected_exit": 0`, `"redaction_findings": []`.
- `t0-wu02` (9 checks): artifact-existence test, two heading `grep` checks (`## 1.`, `## 9.`), the retained
  `8d193bbe…` value check, a `redact` presence check, the placeholder-count guard
  (`<redacted-non-secret-identifier>` ≥ 3 occurrences), the commander
  `swarmctl.py secret-scan --paths docs/platform/house-long-run/T0-CANONICAL-RECONCILIATION-2026-09-21.md
  --secret-source 'D:/AI-Workspace/.secrets/keys.txt'` run (recorded output:
  `files_scanned: 1`, `known_credential_values_loaded: 127`, `findings: []`, state `SWARM_WORK_UNIT_PASS`,
  exit 0), the untouched-worktree guard, and one `mutation-observed:` check. Every entry recorded
  `"result": "PASS"`.

**No check failed in either lane.** No check id in either record carries a non-PASS result
(`grep -c '"result": "\(FAIL\|BLOCKED\|ERROR\|SKIP\)"'` → `0` in both files).

Mutation observations recorded inside those checks (verbatim, not reconciled):

| Lane | `mutation-observed` path | before sha256 | after sha256 | changed |
|---|---|---|---|---|
| `t0-wu01` | `docs/platform/house-long-run/T0-CANONICAL-RECONCILIATION-2026-09-21.md` | `null` (file did not exist) | `44da73e43dbdcfe7331acd4af428f258ef40126fa628ff8cd09bc263e76ec088` | `true` |
| `t0-wu02` | same path | `44da73e43dbdcfe7331acd4af428f258ef40126fa628ff8cd09bc263e76ec088` | `fc9fa54fe62aa7cb8186330fc0f491eeca02d3cf88a68fcb195871ea160643d9` | `true` |

Boundary of this section, declared: these are the commander-side deterministic check outcomes **as
recorded in the lane evidence records**. This packet re-read those recorded outcomes; it did not re-run
the checks. The counts above were derived from the records, not from independent execution.

---

## D. Artifact hashes

Final on-disk state measured by this work unit (`sha256sum` + `stat -c '%s'`):

| Artifact | Relative / absolute path | sha256 | bytes |
|---|---|---|---|
| T0 reconciliation document | `docs/platform/house-long-run/T0-CANONICAL-RECONCILIATION-2026-09-21.md` | `fc9fa54fe62aa7cb8186330fc0f491eeca02d3cf88a68fcb195871ea160643d9` | `60040` |
| Lane `t0-wu01` evidence record | `D:/AI-Workspace/runtime/hermes-native/workspace/wstera-cts-001/out-t0-wu01/t0-wu01/evidence-t0-wu01.json` | `b26ccac448e689eabb3bff49c8f60f64b88f43bbe8f7255e7856d2ae366b69ad` | `26038` |
| Lane `t0-wu02` evidence record | `D:/AI-Workspace/runtime/hermes-native/workspace/wstera-cts-001/out-t0-wu02/t0-wu02/evidence-t0-wu02.json` | `c8f694e369a2acf6c5d0dc8e4add31d287f7473683c35d278bb245fb47e00e87` | `19997` |

Observed mtimes (`stat`): reconciliation document `2026-09-21 14:56:38 +0700`; `t0-wu01` record
`2026-09-21 14:51:19 +0700`; `t0-wu02` record `2026-09-21 14:57:20 +0700`.

Sha256 values **inside** the records, recorded as quoted (they are not all equal to the final
on-disk state, and this packet does not normalize them):

| Source | Quoted reconciliation-document sha256 | Quoted bytes |
|---|---|---|
| `t0-wu01` record, `artifacts[]` (entry listed twice, identical values) | `44da73e43dbdcfe7331acd4af428f258ef40126fa628ff8cd09bc263e76ec088` | `59514` |
| `t0-wu02` record, `artifacts[]` (entry listed twice, identical values) | `fc9fa54fe62aa7cb8186330fc0f491eeca02d3cf88a68fcb195871ea160643d9` | `60040` |

Reading recorded without normalization: lane `t0-wu01` measured the document at its own write time
(`44da73e4…` / `59514` bytes); lane `t0-wu02` then edited that document (redaction, plus one inserted
disclosure sentence) and measured it at `fc9fa54f…` / `60040` bytes, which is the value this packet
re-measured on disk. Both records also list their single artifact path twice with identical
sha256/bytes values; recorded as observed.

---

## E. B0 acceptance results

The four B0 acceptance lines are quoted from `RUN-MANIFEST-WSTERA-CONTROL-TRUTH-SYNC-001.md:92-95`. The
"observed result" column records what the cited artifact actually contains, with its location. These are
observed results, not this packet's verdict: **no gate approval is asserted here**.

| # | Manifest B0 acceptance line (quoted) | Observed result | Observed where |
|---|---|---|---|
| 1 | "no unknown drift affecting the contract." | The reconciliation document records: "**No unknown drift affecting the contract was found.**", followed by the re-observed pinned values (House `13a2d55…` `0/0`; hub-web `4071307…` `0/0`; wstera-workflows `e711b94…` `0/0`; PR #2 OPEN+DRAFT+unmerged with head `4071307` on base `main@8a3e493`; Worker `5dc81232-c116-4722-a6c1-74c15ad50385` with `/health` HTTP 200; Swarm SKILL `42fe2875…`; Control Sync SKILL `e1d23903…`). The same section lists ten observed differences, each recorded as `Contract-affecting?: No`. | reconciliation §9.1; drift classification column reproduced in section G below |
| 2 | "Windows runtime preflight passes." | Recon §4.1 records the profile-pool preflight exit 0 with `state: SWARM_WORK_UNIT_PASS`, six `swarm-*` profiles each `exists=true`, `model=deepseek-v4.1-flash:cloud`, `provider=ollama-cloud`, `toolsets=[terminal, file]`, `soul_contract_ok=true`, `problems=[]`, `role_check=exact`, `parser: pyyaml`. §4.2 records the governance-header preflight exit 0 with `reasons: ["HEADER_ACCEPTED"]` and check `governance_header_valid: PASS`. §4.5 records "No drift." | reconciliation §4.1, §4.2, §4.5 |
| 3 | "Re-run Control Sync doctor through the Hermes-loaded environment before live sync. Planning-time verification is PASS: endpoint configured + HTTPS-valid, secret configured without exposure. If this regresses, BLOCK live sync; do not fake success." | Recon §5.1 records the doctor run inside the Hermes session, exit 0: `endpoint_configured: true`, `endpoint_https: true`, `secret_configured: true`, `secret_source: canonical_secret_file`, `secret_value_exposed: false`, `ok: true`, `version: 0.1.0`. §5.2 records `outbox-status` → `[]` (no pending, no dead-letter). §5.4 records "No drift." and that no `BLOCK live sync` condition is triggered by that section. §8.4 re-confirms `endpoint_configured=true` / `endpoint_https=true` through the Hermes-loaded environment with the endpoint byte-identical to the pinned value. | reconciliation §5.1, §5.2, §5.4, §8.1, §8.2, §8.4 |
| 4 | "no source mutation." | Recon §9.3 item 4 records §1.1–§1.4 worktrees "in the same state it was found in" and that the only file the work unit created is the reconciliation document. Independently re-observed by this packet: `git rev-parse HEAD` → `c6c7c0ece06aa861c1559afbecdc8368ebc532e1` (identical to the packet revision) and `git status --porcelain=v1` → a single line, `?? docs/platform/house-long-run/T0-CANONICAL-RECONCILIATION-2026-09-21.md`; no tracked file is modified or staged. Recorded precisely, without widening: the one document that differs in the worktree is the reconciliation document itself, which lane `t0-wu02` edited under its own work unit (see section C mutation table); no product/source path is mutated, and no commit or push occurred. | reconciliation §1.1–§1.4, §9.3 item 4; packet unit's own `git` read |

Note carried with line 3, recorded as observed and not resolved here: recon §9.1 row D-9 discloses that a
metadata-only read of `D:/AI-Workspace/.secrets/keys.txt` (existence, size, mtime, key-name occurrence
count) lies outside the recon unit's declared allowed roots; and the `t0-wu02` lane records a commander
`secret-scan` invocation whose `--secret-source` argument names that same path. No secret **value** is
present in any of those outputs (`findings: []`, `secret_value_exposed: false`).

---

## F. Retry and remediation ledger

| Item | Observed value | Observed where |
|---|---|---|
| Budget definition | `local_fix_attempts: 2`, `reviewer_remediation_attempts: 2`, `senior_escalations: 1` per stable Issue Fingerprint | `RUN-MANIFEST-...001.md:37-39` |
| Consumed | **1 local fix attempt of the 2-attempt budget**, on lane `t0-wu02`, for a commander secret-scan failure | `t0-wu02-run.json:10` — `"workflow_state": "T0 REMEDIATION R1 (local fix attempt 1 of 2); finding: commander secret-scan 2 findings"` |
| Remaining local fix budget | **1** (2 declared − 1 consumed) | arithmetic on the two values above; both are quoted, no other source |
| Reviewer remediation budget | `2` declared; **no evidence of use observed** in either lane record | `RUN-MANIFEST-...001.md:38`; absence of any such entry in both records |
| Senior escalations | `1` declared per authorized Codex classification; **no evidence of use observed** | `RUN-MANIFEST-...001.md:39`; absence of any such entry in both records |

Lane outcome recorded: `t0-wu02` closed with `state: SWARM_WORK_UNIT_PASS` and all 9 commander checks
PASS after that one remediation attempt (section C). What the first attempt specifically changed is
recorded by the lane itself, not re-derived here (`t0-wu02` worker report: two credential literals
replaced with `<redacted-non-secret-identifier>` at lines 820 and 822 by positionally scoped, value-blind
`sed` edits, plus one inserted disclosure sentence inside section 9).

---

## G. Drift ledger pointer

Pointer: **`T0-CANONICAL-RECONCILIATION-2026-09-21.md` §9.1 "Drift ledger (observed values, no
normalisation)"** — a ten-row table (`D-1` … `D-10`) with columns `# | Section | Observed difference |
Classification | Contract-affecting?`. Row count observed: 10.

Reproduced below: the **classification column only**, one line per row, verbatim.

```
D-1   Documentation anchoring
D-2   Documentation anchoring (labelled historical)
D-3   Evidence availability change
D-4   Artefact identity
D-5   Unrecorded artefact
D-6   Evidence boundary
D-7   Pre-existing, pinned state
D-8   Evidence boundary
D-9   Scope disclosure
D-10  Environment
```

Recorded alongside the classification column (also from §9.1, for context only): every row's
`Contract-affecting?` value is `No`. §9.3 additionally carries the recon unit's own bounded B0
observations and its open items; §9.4 carries its non-claims. This section reproduces the classification
column as instructed and does not re-classify, adjudicate, or close any row.

---

## H. Non-claims and open items

### H.1 Non-claims carried forward

- `PRODUCTION_READY`: **not claimed** (manifest `:239`; recon §9.4).
- `OPERATED_STABLE`: **not claimed** (manifest `:239`; recon §9.4).
- `LIVE_PROVEN`: **not claimed** beyond what the recon document quotes from the closure record (recon §9.4).
- B0 PASS / any gate approval: **not claimed** by the recon document, and **not claimed by this packet**
  (recon §9.4; this packet's own framing statement at the top).
- Mac parity: `MAC_PARITY_UNVERIFIED` — recorded verbatim, not upgraded (recon §7.2, §9.3 item 5;
  matches the pinned baseline at `TASK-...001.md:35`, `:48-49`).
- Worker→source SHA linkage (`5dc81232…` ← `4071307`): carried forward, **not re-derived** —
  `wrangler deployments list` prints version UUIDs and timestamps only (recon §6.1, row D-6).
- Test-suite baselines (Swarm 260/259/1 skipped; Control Sync 7/7): carried forward as **unverified at
  T0**, not re-asserted (recon §3.4, row D-8).
- Lane states in section B are the records' own values; this packet did not re-execute any lane and does
  not convert them into a review verdict. Both run envelopes recorded `SWARM_REVIEW_REQUIRED` with the
  `R1-AFTER-T2` checkpoint pending (section B.3).
- This packet does not widen any claim, does not resolve any drift row, and makes no Owner decision.

### H.2 Unresolved open items carried forward

From the reconciliation document (recorded so they are not read as omissions):

1. D-1 / D-2 documentation-anchoring differences (`373d4177…` vs pinned `13a2d55…`; `CURRENT_STATUS.md:7`
   `59656d9` labelled `(T6 entry)`) were **not** edited in any document.
2. O-5: deployment-history version `6426d0b5-4a5c-4036-836c-9c45c1e3efaf` was **not** classified as an
   authorised or unauthorised rollback target.
3. O-6: the Worker↔source-SHA linkage was **not** independently re-derived.
4. D-8: the skill test suites were **not** executed in T0.
5. The skill's optional `work-sync --dry-run` self-test was **deliberately not run** (touches local durable
   outbox state outside the read-only unit's authority).
6. PR #2 was **not** merged, closed, converted, or commented on; no GitHub write of any kind occurred
   (recon §9.3 open items).
7. D-9: the metadata-only `.secrets/keys.txt` read inside the recon unit lies outside its declared allowed
   roots — reported for the commander's judgment, no content and no value.
8. R1 (`R1-AFTER-T2`, reviewer `agent-codex`) remains the next declared independent review checkpoint;
   nothing in T0 satisfies or pre-empts it (`RUN-MANIFEST-...001.md:61-66`; lane envelopes `SWARM_REVIEW_REQUIRED`).

Packet-unit open items (this work unit):

9. The packet unit's own lane record (`t0-wu03`) did not exist when this packet was written (section A);
   its values are therefore absent from this packet and must come from the commander's own run record.
10. This packet re-read and normalized recorded results; it did **not** re-execute the lane checks or the
    `secret-scan`, so the counts in section C are as-recorded, not independently reproduced.

---

## Evidence statement for this work unit

- File written by this work unit: `docs/platform/house-long-run/T0-B0-EVIDENCE-PACKET-2026-09-21.md`
  (this file). **No other file was created, modified, moved or deleted.** No commit and no push occurred.
- **No secret store was read.** This work unit did not open, list, hash or otherwise touch
  `D:/AI-Workspace/.secrets/`, any `.env` file, or any credential source. No secret value is reproduced
  here; where a credential-shaped literal had to be referenced, only a placeholder or a key name is used.
- No gate approval and no reviewer verdict is asserted.
