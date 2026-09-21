# T6-WU01 — REPO / PR / CURRENT STATUS RECONCILE

Task: `WSTERA-HOUSE-PRODUCTION-CLOSURE-001` · Stage **T6** · Work Unit **T6-WU01**
Worker Rule: OpenCode · Objective: reconcile docs, branch/default-branch state and current status.
Status: **PREPARED — entered only on B5 `BATCH_APPROVED`**

---

## 1. Repository truth (measured, 2026-09-21)

### Coordination repository — `Gutumrod/saas-product-hub`

| Item | Value |
|---|---|
| Branch | `work/house-production-closure-longrun-20260919` |
| HEAD | `35d1d6c69e6f05f3654965d6917e11d6b5ff8bb1` |
| `origin/master` | `1556d8a29ce5fa2f408bed981f26d9ef7d61aa33` |
| Commits ahead of `master` | **115** |
| Ancestry | `origin/master` is an ancestor of HEAD (T0 merge, verified) |
| Untracked | 3 files under `docs/platform/shared-runtime/` — **another workstream's**, dispositioned in `B5-RER15-OUTCOME-AND-USERROLE-DECISION-2026-09-21.md` §8; left untouched |

### Application repository — `Gutumrod/hub-web` (nested, gitignored by the parent)

| Item | Value |
|---|---|
| Branch | `work/house-platform-closure-20260919` |
| HEAD | `407130718646d13630b9789f68522a521fc74483` |
| `origin/main` | `8a3e49330e6cc1d52d6ad3d96fd0d291a66b4f56` |
| Commits ahead of `main` | **45** |
| Worktree | clean |
| Deployed from | this revision — Worker `9a004fa9-53be-400b-a1ea-c52263faacbc` |

## 2. Draft PR #1 / default-branch disposition (required by the acceptance contract)

**Measured fact:** the only open PR is

```
PR #1  "feat: add WSTERA Platform Control Plane Demo V2"
       head: feature/platform-control-plane  ->  base: main   [DRAFT]
```

That PR head is **not** this closure branch, and it does not contain the T1–T5 work (the closure branch
is 45 commits ahead of `main`, PR #1's branch is a different line).

**Consequence, stated plainly:** the production-only code that this task verified and deployed
(the R15 schema remedy `0008`, the T2 signer registry, the T3 fulfillment hardening, the T4 Control read
adapter and the WU02 security/build-env work) currently exists **only on `work/house-platform-closure-20260919`**.
It is deployed and live, but it is not merged to `main` and is not proposed by any PR.

**Disposition options (an Owner/architecture call, not taken here):**

| | Option | Effect |
|---|---|---|
| 1 | Open a PR from `work/house-platform-closure-20260919` → `main` | Brings the deployed and verified line into review on the default branch; PR #1 is left as its own demo-V2 proposal |
| 2 | Retarget/close PR #1 and replace it with the closure branch | One PR representing the deployed state; the demo-V2 work must be dealt with separately |
| 3 | Explicitly accept the branch as canonical without merging | Requires a recorded ruling, because "no stale unmerged production-only code is silently left as canonical" is an acceptance-contract line |

## 2.1 DISPOSITION RECORDED — Owner decision 2026-09-21 (Option 1)

**Owner chose Option 1** and it has been executed:

| Item | Value |
|---|---|
| PR | **#2** — https://github.com/Gutumrod/hub-web/pull/2 |
| Base | `main` @ `8a3e49330e6cc1d52d6ad3d96fd0d291a66b4f56` |
| Head | `work/house-platform-closure-20260919` |
| **Exact head SHA** | **`407130718646d13630b9789f68522a521fc74483`** |
| Commits covered | **45** above `origin/main` |
| Draft | **yes** (opened as Draft per the Owner's requirement) |
| Mergeable | MERGEABLE (not merged — Owner holds the merge decision) |
| PR #1 | **left untouched** — still OPEN/Draft on `feature/platform-control-plane`, a different development line |

Opened without rebase, rewrite or history surgery; the exact current closure branch was used. The PR body
states that the production Worker was built from this line, limits claims to `BUILD_PASS` and code-only
`LIVE_PROVEN` (explicitly not `PRODUCTION_READY`, not `OPERATED_STABLE`), lists the inert capabilities and
the known limitations from the T6 evidence, and notes that this branch's history already contains PR #1's
head (`125af843`) as an ancestor so the relationship is not discovered later.

**Verified from GitHub, not asserted:** head SHA, base, draft status and commit count were read back via
the API after creation, and PR #1's state was re-checked to confirm it was untouched.

No merge was performed and none is proposed. The earlier "three options" text below is retained as the
context in which the decision was made.

**Hermes does not choose.** The contract requires that this be *explicitly dispositioned*; the
disposition itself is an Owner/repo-governance decision. What must not happen is the current state being
left unstated — a deployed production line with no PR and no ruling.

## 3. `docs/CURRENT_STATUS.md` reconciliation

The current overlay names `a502421` as the parent HEAD and describes the T0 state. It is **stale**
relative to everything since: T1–T5 approvals, the deploy, and R15 D0–D4.

Required updates (to be applied in T6, not now):

| Field in the overlay | Current (stale) | Should become |
|---|---|---|
| Parent branch/HEAD | `a502421` (T0) | `35d1d6c` (with the T0 merge preserved as history) |
| House state | "T0 reconciliation" | T5 complete pending B5 re-review; R15 D0–D4 executed |
| hub-web revision | absent / earlier | `4071307` (deployed as `9a004fa9`) |
| Worker | absent | `9a004fa9-53be-400b-a1ea-c52263faacbc`, rollback `00bdb1b5` → `9db4fb70` |
| R15 state | "prepared" | **applied** — `hub_web_app` live, `DATABASE_URL` switched, runtime verified |
| Schema | absent | 9/9 tables, 9/9 enums on Project A |
| Capabilities | absent | `PRODUCT_EVENT_SIGNERS` inert · `Billing Core read` inert |
| Claims | absent | `BUILD_PASS`, `LIVE_PROVEN` (code-only scope) only; **not** `PRODUCTION_READY`, **not** `OPERATED_STABLE` |

Historical plan authority (`docs/platform/PORTFOLIO_PRODUCTION_MASTER_PLAN.md`) is **not** rewritten —
only the current-state overlay is updated, per the contract.

## 4. AUTO_GATE checks for this work unit (to run in T6)

1. `docs/CURRENT_STATUS.md` vs exact refs consistency
2. no stale HOLD/PASS contradictions in the current overlay
3. branch/upstream parity (both repos)
4. `git diff --check`
5. exact evidence links resolve
6. no product-source changes in the House diff

## 5. What this work unit must NOT do

- Must not commit or delete the other workstream's untracked shared-runtime documents.
- Must not rewrite historical plan authority.
- Must not merge, push to `main`, or open a PR without an explicit Owner/governance decision on §2.
- Must not claim any product lane is `PRODUCTION_READY` from House evidence.
