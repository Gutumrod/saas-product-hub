# OWNER DECISION — H1 commit authority + H2 F1 closure

Task: `WSTERA-CONTROL-TRUTH-SYNC-001` · Workflow `WF-DEV-01 v1.3.0 / LONG_RUN`
Recorded: 2026-09-21 (Asia/Bangkok) · Recorded by: Hermes (Long-Run Orchestrator / Coordinator / State Holder)
Resumes hold: `OWNER_HOLD_COMMIT_AUTHORITY_AND_T2_F1`
Authority: **Owner decision (both options authorized as Option 1)**

---

## H1 — commit / branch authority: **AUTHORIZED — OPTION 1**

Owner authorizes Hermes to **commit and push for this task only**, on the branch the Manifest already locks:
**`work/wstera-control-truth-sync-001`**.

- No Claude invocation is required for the commit, and **the branch is not renamed mid-task**.
- This is a **task-specific Owner exception**. It does **not** repeal the standing
  `claude-owns-git-commits` rule for any other work.

Pre-commit conditions the Owner attached (all must hold before any commit):

| # | Condition |
|---|---|
| 1 | deterministic gates PASS |
| 2 | evidence matches the real files |
| 3 | `git diff --check` CLEAN |
| 4 | the commit binds an **exact revision** usable by R1 |
| 5 | no unrelated changes may be included |
| 6 | Draft PR #2 must not be merged |

## H2 — F1 closure: **AUTHORIZED — OPTION 1, BEFORE R1**

Close F1 by **explicitly removing the 17-argument superseded function inside the migration**, so the new
contract leaves only the scope-gated path as the callable route.

Regression proof the Owner requires:

1. the legacy 17-argument path **cannot be used to bypass**;
2. the 19-argument contract behaves per the scope invariant;
3. the privilege/grant set leaves **no legacy callable path** behind;
4. Product **and** non-product cases still pass in full;
5. revision / idempotency / atomicity invariants do not regress.

Boundary: **source remediation only.** Live DB apply and any production mutation remain **NOT authorized** by
this decision. Live application still requires the Manifest's later Owner production checkpoint.

## Resume sequence ordered by the Owner

1. Perform the F1 source remediation.
2. Re-run deterministic tests / typecheck / invariants.
3. Commit and push the exact verified revisions per H1.
4. Pin the exact SHA.
5. Send **Codex R1** independent review.
6. If R1 passes, continue **T3 → T4 → T5 automatically** per the Manifest.
7. Stop again only at an Owner checkpoint the Manifest defines.

---

## Standing rules unchanged by this decision

- Agent Relay is still **not** an ordinary execution path; `hermes-native-swarm` remains the ordinary engine.
- Codex is used only at the Manifest's independent-review checkpoints; Claude only under the authorized
  difficult-remediation route.
- No production migration, deploy, or live mutation without the Manifest's Owner production checkpoint.
- No secret values in repo, logs, evidence, or command arguments.
- No `db:push`.
- Product identity, revision, HMAC, atomicity and RLS invariants are preserved, not weakened.
