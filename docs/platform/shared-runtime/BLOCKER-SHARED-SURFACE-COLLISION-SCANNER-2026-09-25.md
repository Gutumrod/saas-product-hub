# BLOCKER — SHARED-SURFACE COLLISION ON THE SCANNER CLASSIFIER (B0.2 retry blocked)

Task: `HOUSE-SHARED-RUNTIME-LANE-B-CLOSURE-001` / `WSTERA-HOUSE-DUAL-LANE-CONVERGENCE-001`
Recorded: 2026-09-25 · By: Hermes (Lane-B LONG_RUN controller — mechanical record only)
Governing rule: `BRIEF-HOUSE-DUAL-LANE-CONVERGENCE-2026-09-24.md` §7 shared-surface collision
rule · §14 failure semantics ("shared-surface collision -> serialize, never race")

State: **`LANE_B = BLOCKED_SHARED_SURFACE_COLLISION / B0.2_RETRY_HELD`**

---

## 1. What Lane B completed before the collision (unchanged by this record)

| Step | Result |
|---|---|
| Attempt 5 (Sol-authorized) | FAILED, same fingerprint, root cause proven |
| Sol ruling | `EXECUTION_PROOF_EXCLUSION_PREFIX_STRIP_V1` → ordinary repair #1 |
| Repair #1 source change | `execution_proof.py` ×2 canonical copies @ `d463b9be…` |
| Exact acceptance gate | **PASS 10/10** (`REPAIR1-EXECUTION-PROOF-EXCLUSION-2026-09-25.md`) |
| Focused Codex review | **`LANE_B_EPEXCL_REVIEW_VERDICT=APPROVED`** — provenance valid (exit 0, Session-1, `execution_proof.allowed=true`) |
| B0.2 retry | **NOT STARTED — blocked by this collision** |

Both the repair commit (`6308912`, vault) and the repair record (`5c4e449`, Lane-B planning)
are pushed with parity exact.

## 2. The collision (measured, not inferred)

While the focused review was running, a **second live session** began mutating the **same
protected skill** in the **same canonical vault working tree**:

| Field | Value |
|---|---|
| Other session's claim | `runtime/claims/WSTERA-CONTROL-SYNC-001__hermes__20260925T053431Z.md` |
| Other session id | `20260925_094131_0f6a54` |
| Other session's declared work | "OWNER-APPROVED Option C — bounded remediation of protected skill `kanban-external-agent-dispatch` secret-classifier (class-level synthetic/test-fixture false positive)" |

Files dirty in `hermes-native-vault` at the same time (none of them authored by Lane B):

```text
M skills/kanban-external-agent-dispatch/scripts/direct_external_executors.py   +66
M skills/kanban-external-agent-dispatch/scripts/test_secret_scanner.py        +102 / -13
M tools/agent-relay-adapter/direct_external_executors.py                       +53
```

Measured still-mutating, three consecutive samples while this record was written:

```text
12:51:42  tools/agent-relay-adapter/direct_external_executors.py
12:52:51  skills/.../test_secret_scanner.py
12:53:24  skills/.../direct_external_executors.py
12:55:09  skills/.../direct_external_executors.py        <- advanced again
12:55:16  skills/.../test_secret_scanner.py              <- advanced again
12:55:21  tools/agent-relay-adapter/direct_external_executors.py   <- advanced again
```

Their in-flight change is **scanner classifier logic** — a new `_is_fixture_shaped_phrase()`
branch feeding `_is_synthetic_secret_value()`, i.e. it changes the exemption path of the very
scanner whose false-positive fingerprint Lane B B0.2 must classify.

## 3. Why this blocks B0.2 (not a formality)

B0.2 is defined as *classification of the scanner fingerprint, bound to an exact revision,
provenance-valid/admissible*. Relay loads the executor from the **working tree**, not from a
committed blob:

```text
B0.2 import target = D:\...\hermes-native-vault\skills\kanban-external-agent-dispatch\scripts\direct_external_executors.py
  HEAD blob : c30ac18aad010495   (72235 bytes)
  disk      : 73d274d9b2e03f75   (77708 bytes)   <- DIRTY
```

Committing it now would **not** help, because the authoring session is still writing: any B0.2
dispatch would bind provenance to a revision that changes under it. That is exactly the
`revision/evidence mismatch` class in brief §14 and the T39/T40 class (`commit ทับขณะการ์ดกำลังรัน`
· `protected skill เปลี่ยนกลางงาน`).

Lane B is not the owner of this mutable surface: it needs the classifier **as the subject of
classification**, not as a repair target. The CONTROL-SYNC session holds an explicit
Owner-approved remediation mandate for it, so per brief §7 the surface is theirs and Lane B
freezes.

## 4. Secondary finding — two different scanner remediations now exist

Independent of the collision, the two sessions are pursuing **different discriminators** for
what may or may not be the same defect:

| | Lane B (Owner ruling B-2) | CONTROL-SYNC session (their Option C) |
|---|---|---|
| Discriminator | **raw matched text**: psql client-variable reference vs assigned credential | **structural fixture idiom**: readable separator-joined phrase + short unique tag |
| Scope | psql/runbook false positive | class-level synthetic/test-fixture false positive |
| Position in sequence | B0.3 (Claude) — gated behind B0.2 verdict | in flight now, uncommitted |

Hermes does **not** decide whether these are one defect, two defects, or competing fixes for one
defect. That is an authority question (Sol per Lane-B contract §7; Owner if it changes the
approved B-2 remediation approach). Recording it so the two are not silently merged.

## 5. What was deliberately NOT done

- No B0.2 retry was dispatched.
- No file authored by the other session was staged, committed, reverted, or otherwise touched.
- No attempt to "win" the surface by committing first.
- No card was archived or completed (ruling §7 / T78).
- No install into the live runtime; installed `execution_proof.py` is still the pre-fix byte image.
- Lane A was not touched.

## 6. Requested disposition (serialize, do not race)

Lane B is parked at `BLOCKED_SHARED_SURFACE_COLLISION` and needs one ruling to resume:

1. **Surface ownership** — confirm the CONTROL-SYNC session owns the scanner-classifier surface
   for the duration of its Owner-approved Option C remediation, and that Lane B resumes only
   after that revision is frozen (committed + pushed, tree clean).
2. **Sequence** — confirm B0.2 retries **after** that freeze, on the frozen revision, so the
   classification binds to one exact scanner revision rather than a moving one.
3. **Discriminator conflict** — rule whether the fixture-idiom class (their work) and the
   psql raw-match discriminator (Owner ruling B-2 / Lane-B B0.3) are distinct fingerprints
   (both admissible) or competing fixes for one fingerprint (only one may land).

## 7. Evidence index

| Artifact | Location |
|---|---|
| repair #1 record (gate 10/10) | `docs/platform/shared-runtime/REPAIR1-EXECUTION-PROOF-EXCLUSION-2026-09-25.md` @ Lane-B `5c4e449` |
| attempt-5 failure record | `docs/platform/shared-runtime/ATTEMPT5-FAILURE-RECORD-2026-09-25.md` @ Lane-B `4c66c38` |
| repair source commit | vault `6308912` (`execution_proof.py` ×2 → `d463b9be…`) |
| focused review verdict | Relay card `t_75b3eb86` · `LANE_B_EPEXCL_REVIEW_VERDICT=APPROVED` |
| review provenance | `runtime/worktrees/lane-b-epexcl-review-1/.secretary-relay/t_9570beab/direct-executors/codex-review-execution-proof-repair/DIRECT-EXECUTION.json` |
| collision probe | `runtime/hermes-native/workspace/dual-lane-20260924/collision_probe.py` |
| other session's claim | `runtime/claims/WSTERA-CONTROL-SYNC-001__hermes__20260925T053431Z.md` |
