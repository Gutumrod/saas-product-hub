# CANDIDATE MANIFEST — LANE B RECONSTRUCTION (BOUND PAIR, FROZEN)

Task: `HOUSE-SHARED-RUNTIME-LANE-B-CLOSURE-001`
Candidate identity: **immutable bound pair** `(planning_sha, execution_sha)`
Frozen at: 2026-09-23 (after U-R3 stage gate PASS)
Authority: `OWNER-RULING-LANE-B-HERMES-RELAY-TAKEOVER-2026-09-22.md` §2; Owner instruction
"run through U-R3 → freeze pair → Codex review → final closure"

---

## 1. The bound pair

```text
planning_sha  = 959605b38a4917a18f7218a97393d78030e164ce
execution_sha = 54327b1459bdecff1d00b19ca3b8099c5fc4f09a
```

| Branch | SHA | Remote parity | Dirty |
|---|---|---|---|
| `work/house-lane-b-longrun-plan-20260922` | `959605b38a4917a18f7218a97393d78030e164ce` | EXACT | 0 |
| `work/house-h3d-h5-20260909` | `54327b1459bdecff1d00b19ca3b8099c5fc4f09a` | EXACT | 0 |

Repo: `github.com/Gutumrod/saas-product-hub`

## 2. Invalidation rule

If **either** SHA changes, this candidate expires immediately: the prior review must not be
inherited, a new manifest is created, and the exact new pair is reviewed afresh.
The two branches are **not** merged merely to manufacture one SHA.

## 3. Changed-file set — planning branch (`959605b`, vs base `8cf4315`)

```text
A  docs/platform/shared-runtime/BACKLOG-LANE-B-FOLLOWUP-HARDENING-2026-09-23.md
A  docs/platform/shared-runtime/BLOCKER-LANE-B-U-R1-OPCODE-PROVIDER-AUTH-2026-09-23.md
A  docs/platform/shared-runtime/BRIEF-U-R2-LANE-B-CONTRACT-RECONSTRUCTION-2026-09-23.md
M  docs/platform/shared-runtime/CREDENTIAL-STRATEGY-LANE-B-2026-09-22.md
A  docs/platform/shared-runtime/LEDGER-LANE-B-FINDING-FAMILIES-2026-09-22.md
A  docs/platform/shared-runtime/RECONSTRUCTION-LANE-B-CREDENTIAL-BOUNDARY-2026-09-23.md
A  docs/platform/shared-runtime/RUNTIME-HARDENING-OPENCODE-PROVIDER-CONTRACT-2026-09-23.md
A  tools/shared-runtime/opencode-runtime/README.md
A  tools/shared-runtime/opencode-runtime/opencode-provider-config.canonical.json
A  tools/shared-runtime/opencode-runtime/opencode_contract.py
A  docs/platform/shared-runtime/BRIEF-RESUME-LANE-B-HERMES-RELAY-AFTER-OPENCODE-RECOVERY-2026-09-23.md   (*)
A  docs/platform/shared-runtime/OWNER-DECISION-GATE-CONTRACT-LANE-B-2026-09-23.md                       (*)
```

`(*)` — these two files were **not authored by Hermes** and appeared in `959605b`, a commit
made by the Owner identity at 2026-09-23 11:06 +0700. See §6.

## 4. Changed-file set — execution branch (`54327b1`, vs base `b8a8f47`)

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
A  docs/platform/shared-runtime/fixtures/lane-b-per-stage-allowlist.json
A  docs/platform/shared-runtime/evidence/LANE-B-U-R3-EXECUTABLE-CHECKS-2026-09-23.md
```

(8 runbook files total: `lane_b_measure_a1`, `lane_b_measure_live`, `lane_b_rw_a1`,
`lane_b_rw_live`, each with a create/teardown pair.)

## 5. Artifact / evidence hashes

| Artifact | SHA-256 |
|---|---|
| `CREDENTIAL-STRATEGY-LANE-B-2026-09-22.md` (REV5, reconstructed) | `9f49ea1a5bfb229143658d7fc6176fd5cb3e0ca521471ddca64f5d17566ff490` |
| `RECONSTRUCTION-LANE-B-CREDENTIAL-BOUNDARY-2026-09-23.md` | `9e6904154df8ae6e7f7897e9e6cd7686d0b7bdfb6d0d800c88d4dd64eb12dda8` |
| `LEDGER-LANE-B-FINDING-FAMILIES-2026-09-22.md` (U-R1) | `1477ff5acdd07c36bbfe929f57de58eeaa7c3514daae41357dc7d507afae35a2` |
| `tools/shared-runtime/lib/six-layer-privileges.mjs` | `b87165951c2cd026526aebe2834ae0206ab5f7e7c549fe3e93dc990a40947bad` |
| `tools/shared-runtime/lib/probe-contract.mjs` | `b43a6ad2dc176b01053851cf5d7e6adfa903500b1952dbc551e71865bca11dd0` |
| `tools/shared-runtime/h3d/lane-b-gates.mjs` | `9ef94f6c67c6e1662fffbd0b09e2a1bac28dbdbd682fac9e8d64e70da7f1a3c3` |
| `tools/shared-runtime/inventory/lane-b-effective-reach.mjs` | `66ec3e628f3dc6189b4e28cbc98666664290997e9d43515effb1786625a982df` |
| `docs/…/evidence/LANE-B-U-R3-EXECUTABLE-CHECKS-2026-09-23.md` | `62f9ed6b097753df923790b0bf5c9f9bc4a709e92178efb04d3283ec144aacc7` |
| OpenCode runtime contract (pinned) | commit `931e3711f0fec19860be1e59769674a4981b7e4a` |

## 6. UNAUTHORED COMMITS ON THE PLANNING BRANCH — requires Owner decision

`959605b` is **not a Hermes commit**. It was authored in the Owner identity
(`Gutumrod <titazmth@gmail.com>`) at **2026-09-23 11:06 +0700** and contains exactly two new
files that Hermes did not request and did not create:

- `OWNER-DECISION-GATE-CONTRACT-LANE-B-2026-09-23.md` (242 lines)
- `BRIEF-RESUME-LANE-B-HERMES-RELAY-AFTER-OPENCODE-RECOVERY-2026-09-23.md` (203 lines)

**Material content, stated factually:**

- The gate contract declares a new authority layer ("Sol") between Owner and Hermes, a new
  authority-state vocabulary, and a rule that Hermes MUST NOT stop for Owner input outside
  §8's twelve gates after a one-time approval.
- §14 of that contract says it **"becomes canonical only after one explicit Owner approval of
  this exact revision"** and names the canonical state `SOL_DECISION_GATES_LOCKED`. That
  approval has **not been given in this session**.
- The resume brief's measured entry snapshot (`planning b80f813`, `execution b8a8f47`) was
  accurate when written; both have since advanced by exactly the expected work
  (`b80f813 → 959605b` is the governance commit itself; `b8a8f47 → 54327b1` is Hermes's
  U-R3 commit).

**Why this is reported rather than absorbed:**

1. It changes the **authority/routing model** — exactly the category the Owner's own
   stop-list for this round names ("ต้องเปลี่ยน architecture / routing / locked contract").
2. It is **in the frozen candidate**: because it lives on the planning branch, any
   `(planning_sha, execution_sha)` pair that includes `959605b` hands Codex a governing
   document that is not yet canonically approved.
3. Hermes must not silently treat an unapproved governance document as binding, nor silently
   exclude it from a frozen candidate.

**Options put to the Owner (not decided by Hermes):**

- **(a)** Approve the gate contract as-is → `SOL_DECISION_GATES_LOCKED`; the pair in §1 stands
  and the review proceeds with that contract in-scope.
- **(b)** Hold the gate contract out of scope for this review; freeze the pair at a planning
  SHA **before** `959605b` (e.g. `b80f813`) so the reviewed package is exactly the
  reconstruction, and handle the governance question separately.
- **(c)** Amend the contract first; then re-freeze and review.

Until the Owner answers, the pair in §1 is **recorded but not released for review**.

## 7. Status

| Field | Value |
|---|---|
| U-R3 | COMPLETE (stage gate PASS, controller-run) |
| Pair frozen | yes, §1 |
| Pair released for Codex review | **NO** — pending §6 decision |
| LAB / Auth / role mutation | NONE |
| Secret persisted | NONE |
