# Daily Closeout Protocol

**Goal:** make every active repository durable before the workday ends, without turning an unfinished gate into a false PASS.

## Sequence
1. Read repo instructions and current Source of Truth.
2. Record branch, HEAD, working tree, upstream divergence, PR and CI state.
3. Inspect actual changed files before deciding what is complete.
4. Reconcile current-status docs against Git/CI/runtime evidence. Preserve historical PASS/FAIL records.
5. Write `docs/daily/YYYY-MM-DD.md` with done, evidence, decisions, blockers and exact next action.
6. Write `docs/daily/WORK-BRIEF-YYYY-MM-DD.md` with the next bounded task and its activation gate.
7. Run `git diff --check`; for code changes also run the repo-required tests, typecheck, lint, build and security gates.
8. Re-read edited docs once to catch stale placeholders, malformed text and contradictions.
9. Commit and push each child repository separately. Merge or deploy only when its own gate explicitly authorizes it.
10. Fetch origin and prove the working tree is clean and local/upstream divergence is `0 0`, or document the intentional exception.
11. Check relevant post-push CI when the repository has it.
12. Close and push the parent `saas-product-hub` last, using the final child commit IDs and gate results as its index.

## Hard rules
- A blocked/red project stays blocked/red with the exact failure point recorded.
- Do not discard an unknown dirty working tree just to make the day look clean.
- Do not carry `$branch`, `$head`, stale run IDs or obsolete blocker text into current status.
- An owner/architecture decision that is still unresolved remains an explicit decision gate.
- Documentation closeout by itself does not authorize production release or data-plane changes.

## Successful end state
Every active repository ends the day as either:
- **Durable/clean:** current docs pushed, local matches origin, next action documented; or
- **Durable/blocked:** unfinished work is safely checkpointed, the exact blocker is documented, and no false PASS is claimed.

The parent portfolio repository is pushed last and records which state each active project is in.
