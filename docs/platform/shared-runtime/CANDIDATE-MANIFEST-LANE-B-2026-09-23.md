# CANDIDATE MANIFEST — LANE B RECONSTRUCTION (BOUND PAIR) — RE-FROZEN

Task: `HOUSE-SHARED-RUNTIME-LANE-B-CLOSURE-001`
Candidate identity: **immutable bound pair** `(planning_sha, execution_sha)`
Re-frozen at: 2026-09-23 — planning revision changed because Sol's amendments were applied
Authority: `OWNER-RULING-LANE-B-HERMES-RELAY-TAKEOVER-2026-09-22.md` §2;
`SOL_GATE_VERDICT = READY_TO_LOCK_WITH_AMENDMENTS` (2026-09-23)

**This manifest supersedes the prior re-freeze at planning `2bb3ebf` / execution `54327b1`.**
That candidate expired when Sol Amendment 4 changed the approval-bound planning revision to
`05442fa76cd83e3dc97955b501f8d2e0723a61cb`; execution remains unchanged.

---

## 1. The bound pair

```text
planning_sha  = 05442fa76cd83e3dc97955b501f8d2e0723a61cb
execution_sha = 54327b1459bdecff1d00b19ca3b8099c5fc4f09a
```

### 1.1 Exact SHAs

| Branch | SHA | Remote parity | Dirty |
|---|---|---|---|
| `work/house-lane-b-longrun-plan-20260922` | recorded in §1.2 (this manifest is committed onto it) | EXACT | 0 |
| `work/house-h3d-h5-20260909` | `54327b1459bdecff1d00b19ca3b8099c5fc4f09a` | EXACT | 0 |

Repo: `github.com/Gutumrod/saas-product-hub`

### 1.2 Planning SHA binding

The planning revision that this pair binds to is the final authority-contract commit
`05442fa76cd83e3dc97955b501f8d2e0723a61cb` (`docs(platform): preserve later Owner ruling precedence`).
This commit preserves the three original Sol amendments and adds Sol Amendment 4: a later explicit
Owner ruling outranks the standing contract for task-specific authority while canonical Relay
execution/safety invariants remain authoritative. Later manifest/request commits are bookkeeping
and do not change the approval-bound contract content.

## 2. Invalidation rule

If **either** SHA changes, this candidate expires immediately: the prior review must not be
inherited, and a new manifest is created for the exact new pair. The two branches are **not**
merged merely to manufacture one SHA.

## 3. What changed in this re-freeze (vs the previous freeze)

| Item | Previous freeze | This re-freeze |
|---|---|---|
| planning_sha | `2bb3ebf6ae33c6a75f6d4057c87c358e0cd56984` | `05442fa76cd83e3dc97955b501f8d2e0723a61cb` |
| execution_sha | `54327b1459bdecff1d00b19ca3b8099c5fc4f09a` | unchanged |
| Trigger | original three Sol amendments | final Sol precedence correction in §2 |

The U-R3 execution-branch content is **unchanged**: `54327b1` is identical to the previous
freeze.

## 4. Changed-file set — planning branch

### 4.1 Authority-contract commit (`05442fa`)

```text
M  docs/platform/shared-runtime/OWNER-DECISION-GATE-CONTRACT-LANE-B-2026-09-23.md
```

The original three Sol-directed amendment sites remain, plus one final Sol precedence correction in §2:

| Site | Amendment |
|---|---|
| Header | provenance corrected (proposed in Owner identity before Sol review; Sol is not the original author); state → `SOL_REVIEW_PASS / OWNER_ONE_TIME_APPROVAL_REQUIRED` |
| §2 | canonical Agent Relay `SKILL.md` remains authoritative for execution/safety; final correction also places explicit later Owner rulings above the standing contract for task-specific authority |
| §12 | automatic closure limited to evidence-backed technical stages/child cards/work units; Hermes must not mark the governing Lane-B / Secretary / Owner-acceptance task `done`; `HOUSE-A PASS` and Owner acceptance remain Owner-gated |

**Verified:** sections **§4–§10 remain byte-identical** to the pre-amendment authority matrix.
The final `05442fa` correction changes only §2 precedence (4 insertions / 2 deletions vs `600aa9c`).

### 4.2 Planning files carried in this candidate (vs base `8cf4315`)

```text
A  docs/platform/shared-runtime/BACKLOG-LANE-B-FOLLOWUP-HARDENING-2026-09-23.md
A  docs/platform/shared-runtime/BLOCKER-LANE-B-U-R1-OPCODE-PROVIDER-AUTH-2026-09-23.md
A  docs/platform/shared-runtime/BRIEF-U-R2-LANE-B-CONTRACT-RECONSTRUCTION-2026-09-23.md
M  docs/platform/shared-runtime/CREDENTIAL-STRATEGY-LANE-B-2026-09-22.md
A  docs/platform/shared-runtime/LEDGER-LANE-B-FINDING-FAMILIES-2026-09-22.md
A  docs/platform/shared-runtime/RECONSTRUCTION-LANE-B-CREDENTIAL-BOUNDARY-2026-09-23.md
A  docs/platform/shared-runtime/RUNTIME-HARDENING-OPENCODE-PROVIDER-CONTRACT-2026-09-23.md
A  docs/platform/shared-runtime/OWNER-DECISION-GATE-CONTRACT-LANE-B-2026-09-23.md
A  docs/platform/shared-runtime/BRIEF-RESUME-LANE-B-HERMES-RELAY-AFTER-OPENCODE-RECOVERY-2026-09-23.md
A  docs/platform/shared-runtime/SOL-REVIEW-REQUEST-LANE-B-GATE-CONTRACT-2026-09-23.md
A  tools/shared-runtime/opencode-runtime/README.md
A  tools/shared-runtime/opencode-runtime/opencode-provider-config.canonical.json
A  tools/shared-runtime/opencode-runtime/opencode_contract.py
```

## 5. Changed-file set — execution branch (`54327b1`, vs base `b8a8f47`)

```text
A  tools/shared-runtime/lib/six-layer-privileges.mjs
A  tools/shared-runtime/lib/provenance.mjs
A  tools/shared-runtime/lib/probe-contract.mjs
A  tools/shared-runtime/h3d/lane-b-gates.mjs
A  tools/shared-runtime/h3d/generate-runbooks.mjs
M  tools/shared-runtime/h3d/sql-static-check.mjs
A  tools/shared-runtime/inventory/lane-b-effective-reach.mjs
M  tools/shared-runtime/package.json
A  docs/platform/shared-runtime/runbooks/lane-b-role-lane_b_measure_a1-create.sql
A  docs/platform/shared-runtime/runbooks/lane-b-role-lane_b_measure_a1-teardown.sql
A  docs/platform/shared-runtime/runbooks/lane-b-role-lane_b_measure_live-create.sql
A  docs/platform/shared-runtime/runbooks/lane-b-role-lane_b_measure_live-teardown.sql
A  docs/platform/shared-runtime/runbooks/lane-b-role-lane_b_rw_a1-create.sql
A  docs/platform/shared-runtime/runbooks/lane-b-role-lane_b_rw_a1-teardown.sql
A  docs/platform/shared-runtime/runbooks/lane-b-role-lane_b_rw_live-create.sql
A  docs/platform/shared-runtime/runbooks/lane-b-role-lane_b_rw_live-teardown.sql
A  docs/platform/shared-runtime/fixtures/lane-b-per-stage-allowlist.json
A  docs/platform/shared-runtime/evidence/LANE-B-U-R3-EXECUTABLE-CHECKS-2026-09-23.md
```

## 6. Authoritative SHAs for the review

```text
planning_sha  = 05442fa76cd83e3dc97955b501f8d2e0723a61cb
execution_sha = 54327b1459bdecff1d00b19ca3b8099c5fc4f09a
```

The planning SHA bound by this candidate is the **authority-contract commit `05442fa76cd83e3dc97955b501f8d2e0723a61cb`**. Its full
40-character value is recorded in the Owner approval request
(`OWNER-APPROVAL-REQUEST-…`) so the Owner approves an exact revision.

## 7. Artifact / evidence hashes (unchanged by the amendment)

| Artifact | SHA-256 |
|---|---|
| `CREDENTIAL-STRATEGY-LANE-B-2026-09-22.md` (REV5) | `9f49ea1a5bfb229143658d7fc6176fd5cb3e0ca521471ddca64f5d17566ff490` |
| `RECONSTRUCTION-LANE-B-CREDENTIAL-BOUNDARY-2026-09-23.md` | `9e6904154df8ae6e7f7897e9e6cd7686d0b7bdfb6d0d800c88d4dd64eb12dda8` |
| `LEDGER-LANE-B-FINDING-FAMILIES-2026-09-22.md` (U-R1) | `1477ff5acdd07c36bbfe929f57de58eeaa7c3514daae41357dc7d507afae35a2` |
| `tools/shared-runtime/lib/six-layer-privileges.mjs` | `b87165951c2cd026526aebe2834ae0206ab5f7e7c549fe3e93dc990a40947bad` |
| `tools/shared-runtime/lib/probe-contract.mjs` | `b43a6ad2dc176b01053851cf5d7e6adfa903500b1952dbc551e71865bca11dd0` |
| `tools/shared-runtime/h3d/lane-b-gates.mjs` | `9ef94f6c67c6e1662fffbd0b09e2a1bac28dbdbd682fac9e8d64e70da7f1a3c3` |
| `tools/shared-runtime/inventory/lane-b-effective-reach.mjs` | `66ec3e628f3dc6189b4e28cbc98666664290997e9d43515effb1786625a982df` |
| `docs/…/evidence/LANE-B-U-R3-EXECUTABLE-CHECKS-2026-09-23.md` | `62f9ed6b097753df923790b0bf5c9f9bc4a709e92178efb04d3283ec144aacc7` |
| OpenCode runtime contract (pinned) | commit `931e3711f0fec19860be1e59769674a4981b7e4a` |

## 8. Non-blocking operational gap (Sol-directed, preserved)

`SOL_VERIFY_OR_RESOLVE` has **no direct automated Hermes→Sol transport**. Recorded as a
follow-up infrastructure item and linked to `FU-02` in
`BACKLOG-LANE-B-FOLLOWUP-HARDENING-2026-09-23.md`.

**Per Sol: the authority contract must NOT be changed to work around it.**

Measured basis: Sol has no CLI, no Hermes profile, and no kanban assignee; the direct executor
registry contains `agent-opencode`, `agent-codex`, `agent-claude`, `agent-qwen`, `agent-agy`
only; S-Bridge `notify` targets Telegram and carries no Sol-review state.

## 9. Status

| Field | Value |
|---|---|
| Pair re-frozen | yes |
| Planning revision changed | yes (Sol amendments) — previous candidate expired |
| Released to Codex review | **NO** — pending `OWNER_ONE_TIME_APPROVAL_REQUIRED` |
| U-R1 / U-R2 / U-R3 evidence | preserved, unchanged |
| Live checkpoint execution | **not started** |
| LAB / Auth / role mutation | **NONE** |
| Secret persisted | **NONE** |
| Amendment scope | verified limited to header + §2 + §12; §§4–10 byte-identical |
