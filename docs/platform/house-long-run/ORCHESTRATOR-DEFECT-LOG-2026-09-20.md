# ORCHESTRATOR DEFECT LOG — WSTERA-HOUSE-PRODUCTION-CLOSURE-001

Purpose: a factual, non-defensive record of the defects **Hermes (the orchestrator) itself** introduced
during this task, so T6 can carry them into the handoff and so the same classes do not recur. Every
entry is a defect in an orchestrator-owned artifact or configuration, not a worker failure.

Recorded: 2026-09-20 · Author: Hermes

---

## D-A — Packet contained a factual misdiagnosis (T2/B3 era)

Hermes instructed a remediation lane that the `B3-4d` failure was a "test-local id-ordering assumption"
and told it to assert the returned id instead. The lane **refused**, reporting the diagnosis was wrong
and that following it would make the assertion tautological.

**The lane was right.** The assertion pinned a real invariant (a reissue retry must complete the
existing successor, not mint a new one). Hermes verified this and recorded the correction rather than
quietly moving on. Had the instruction been followed, the only test detecting the defect would have been
removed.

**Lesson:** a diagnosis in a packet is an instruction; it must be verified against the source before
being issued, and a worker refusing a wrong instruction is correct behaviour, not a deviation.

## D-B — `context_mode` selected wrongly, three times

`direct_external_executors.py` maps `context_mode` to per-agent permissions, and **only `BUILD` grants
write authority**:

- `agent-claude` non-BUILD → `--permission-mode plan` (read-only)
- `agent-codex` non-BUILD → `--sandbox read-only`

Hermes dispatched implementation/remediation lanes with `context_mode='isolated'` three times
(Claude ×2, Codex ×1). In every case the agent correctly could not write and produced a plan or a
read-only result instead of edits. Two of these were only diagnosed after a wasted lane run.

**Lesson:** for any lane expected to modify files, `context_mode='BUILD'` is mandatory, together with
explicit `allowed_write_paths` and `forbidden_write_paths`.

## D-C — Closure/record documents not rebound when the candidate moved (five occurrences)

The same defect five consecutive times: a T5 document kept naming an older candidate revision after the
candidate advanced, and each independent B5 review round caught it.

| # | Document | Stale reference |
|---|---|---|
| 1 | `T4-CLOSURE` | `32daeea` with pre-remediation figures |
| 2 | `T4-CLOSURE` correction paragraph | itself named `390ad0f` and a three-file change set |
| 3 | `T5-PRODUCTION-READINESS-RECORD` | `15b1579` + "uncommitted" |
| 4 | readiness record **and** qualification | `0e4494d` / `15b1579` |
| 5 | readiness record **and** qualification | `61acf52` while candidate was `e6d367c` |

It was first fixed case by case, which did not work. The root-cause fix finally applied:

1. **One authoritative file** — `T5-CANDIDATE-FREEZE-2026-09-20.md` — states the frozen revision.
2. The other documents carry an explicit **revision-authority pointer** to it, and state that a document
   naming a different revision is **stale by definition and must be reported, not silently reconciled**.
3. Every figure written was re-derived from the repository (`git show --stat`, re-run gates) rather than
   copied from an earlier document.

**Lesson:** when the same document defect recurs, stop fixing instances and change the structure —
single source of truth plus pointers plus a rule that disagreement is an error state.

## D-D — Evidence referenced but not committed (twice)

- The `B5-R2` review report was referenced by a dispatch but had never been committed; a `cp ... 2>/dev/null`
  swallowed the failure and the commit message claimed it was present. A worker caught it by reporting
  the file absent.
- The `T4-CLOSURE` change-set figures were written from memory rather than measured, and a review caught
  the mismatch.

**Lesson:** never redirect stderr to `/dev/null` on a file-copy that a commit depends on, and never
assert a figure that has not been measured in the same step. Attach the measured output.

## D-E — Scanner false-positive triage took three rounds

Repository-owned synthetic test fixtures (word-shaped placeholder secrets) appeared in relay wrapper logs
whenever a tool printed the test file, so the fail-closed secret scanner aborted the lane after the work
was already complete. Hermes first re-ran the lane, then triaged, and only then fixed the actual cause:
rename the fixture values so they match the scanner's synthetic-fixture exemption shape, **without
changing any assertion or behaviour**, and never touch the scanner (a protected security control).

**Lesson:** when a security control fail-closes on a false positive, fix the *input shape*, not the
control. Also: a fail-closed scanner run is not a clean PASS and must be regenerated, not cited.

## D-F — Long-running lane killed by a foreground wrapper

An early T2 implementation lane was killed by the orchestrator's own foreground terminal cap mid-work.
Work survived only because the packet had been shaped to write files in dependency order.

**Lesson:** dispatch long lanes in the background with a tracked session id and a generous lane timeout
rather than a foreground call; and shape packets so partial progress is durable.

---

## Net effect on the task

None of these defects reached a false PASS: each was caught by a worker refusing a wrong instruction, by
an independent review, or by Hermes's own verification, and each is recorded here rather than smoothed
over. They did cost real time — multiple wasted lane runs, five review rounds on one batch, and repeated
document corrections — which is why they are logged as process defects with the structural fixes above.
