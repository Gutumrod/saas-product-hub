# OWNER RULING — LANE B HERMES RELAY TAKEOVER

Date: 2026-09-22
Task: `HOUSE-SHARED-RUNTIME-LANE-B-CLOSURE-001`
Issued by: Owner (CEO)
Resolves: `TAKEOVER-PREFLIGHT-LANE-B-HERMES-RELAY-2026-09-22.md` §13 (both blockers)
Persisted by: Hermes — mechanical integration owner / state holder for Lane B
Authority: this ruling only; it does not alter any live-mutation boundary

Decision: **BOTH BLOCKERS IN §13 APPROVED — PROCEED**

---

## 1. COMMIT / PUSH AUTHORITY = APPROVED

Hermes holds commit/push authority **for this task only**, in the capacity of
**mechanical integration owner / state holder of Lane B**.

### 1.1 Authorized scope

| Item | Value |
|---|---|
| Planning branch | `work/house-lane-b-longrun-plan-20260922` |
| Execution branch | `work/house-h3d-h5-20260909` |
| Files | only files inside the current task / Relay card allowed scope |

### 1.2 Persist authorization explicitly includes

- the Round-4 Codex review that was untracked
  (`REVIEW-CODEX-LANE-B-CONTROLLER-PACKAGE-ROUND4-2026-09-22.md`);
- the takeover/preflight record;
- **this Owner ruling**;
- reconstruction evidence / manifests / accepted source changes of this task.

### 1.3 Permitted mechanical git integration

Hermes may perform, in this order:

1. inspect the exact staged list;
2. stage **only** the authorized files;
3. `git diff --cached --check`;
4. secret scan;
5. commit;
6. push;
7. verify local `HEAD` == remote `HEAD`.

### 1.4 Prohibitions (bind Hermes under this authority)

| Prohibited | |
|---|---|
| `git add .` / `git add -A` | staging must name files explicitly |
| force push | |
| reset / clean / rebase of work of unknown origin | |
| touching any other branch or repo under this authority | |
| Hermes performing substantive implementation itself | worker implements per Relay role; Hermes holds state / gate / integration |

### 1.5 Override boundary of the standing rule

Standing rule `claude-owns-git-commits` is **overridden for this task and the two
branches named in §1.1 only**. Outside that boundary the original rule remains in force.

---

## 2. CANDIDATE REVISION PAIR = APPROVED

No merge of the planning branch with the execution branch is required merely to produce a
single SHA.

For the Lane B reconstruction, the canonical candidate identity is an **immutable bound
pair**:

```text
(planning_sha, execution_sha)
```

### 2.1 Candidate manifest must state at minimum

- planning branch + exact SHA;
- execution branch + exact SHA;
- changed-file set **per branch**;
- related artifact/evidence hashes;
- the candidate manifest's own SHA256.

### 2.2 Binding and invalidation rules

- Codex independent review must bind to **both** members of the candidate pair.
- If either SHA changes:
  - the previous candidate **expires immediately**;
  - the previous review/PASS **must not be inherited**;
  - a new candidate manifest is created and the exact new pair is reviewed afresh.

### 2.3 Merge prohibition

Merging branches **solely** to give a review a single SHA is prohibited.
Merge/integration happens only when the House workflow genuinely requires it later.

---

## 3. PROCEED

After persisting this ruling + the Round-4 review + the takeover record:

- **release `U-R1`**;
- use Hermes + Agent Relay per the routing override;
- **legacy Round-5 patch loop remains DISABLED**;
- current state = `PACKAGE_RECONSTRUCTION_REQUIRED`;
- use the **real** open finding set: `ND-03`, `ND-05`, `ND-06`, `ND-08`, `ND-09`;
- perform **root-cause reconstruction first** — **not** patching `ND-08`/`ND-09` in isolation.

All existing Owner checkpoints and live-mutation boundaries remain in force.

### 3.1 Still NOT authorized

| Not authorized |
|---|
| `H3D-A1` live mutation |
| `H3D-LIVE` |
| LAB / Auth / role / config mutation that requires an Owner checkpoint |
| `H3E` |
| `H4` |
| Production |
| BK01 Junction A |

### 3.2 Standing throughput authority granted

The run may proceed per Relay up to the next Owner checkpoint **without returning to the
Owner for bounded technical remediation that falls inside this authority**.

---

## 4. Effect on the takeover record

`TAKEOVER-PREFLIGHT-LANE-B-HERMES-RELAY-2026-09-22.md` §13 is **RESOLVED** by §1 and §2 of
this ruling. Its §10.4 controller interpretation is **confirmed as approved**, not merely
tolerated. See the record's §15 addendum.

Nothing else in the takeover record is changed: the measured state, the finding ledger, the
issue fingerprints, the circuit-breaker audit, and the reconstruction contract all stand as
recorded.
