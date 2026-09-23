# REVIEW — CODEX INDEPENDENT REVIEW OF THE LANE B RECONSTRUCTED PAIR

Date: 2026-09-23
Task: `HOUSE-SHARED-RUNTIME-LANE-B-CLOSURE-001`
Reviewer: `agent-codex` (codex-cli 0.147.0), context mode `INDEPENDENT-QA`
Verdict (reviewer's own, first line): **`LANE_B_PAIR_VERDICT=REMEDIATE`**
Mutation by reviewer: **none**
Recorded by: Hermes (controller). This file is the controller's transcription and
appraisal; it is **not** a substitute for the reviewer's verbatim output, which is
reproduced in §1.

---

## 1. Reviewer output — verbatim

```text
LANE_B_PAIR_VERDICT=REMEDIATE

reviewed pair: planning `74db7cc8885a0a807019838a4c9c901eba0e4d42` / execution `54327b1459bdecff1d00b19ca3b8099c5fc4f09a`

mutation: none

finding: `NEW-DEFECT-10`, HIGH — generated H3D-LIVE runbook embeds a duplicated `allowed`/`denied` privilege allowlist at `docs/platform/shared-runtime/runbooks/lane-b-role-lane_b_rw_live-create.sql:33-34`. Required fix: bind generated runbook exceptions fail-closed to the sole fixture and add a mutation negative control.

The five original findings were independently verified closed: `NEW-DEFECT-03`, `05`, `06`, `08`, `09`.

Checks:

- targeted selftests/static checks: exit `0`
- `git diff --check`: exit `0`
- `npm run selftest`: exit `1` — sandbox EPERM writing snapshot
- `node h3d/tests.mjs`: exit `1` — sandbox EPERM on snapshot/git subprocess

Untested/deferred: no LAB/live DB access; live reach, RLS, ownership, and trigger probe remain deferred to A1 preflight.

The required review file could not be written because the workspace is read-only; `apply_patch` was rejected.
```

Provenance: `declared_agent_identity = agent-codex`, `execution_backend = direct_external_process`,
`exit_code = 0`, `prompt_sha256 = 67e04336284dc6443…`, `stdout_sha256 = 7bbfc2a9f8303ecff…`.
The reviewer wrote nothing into the workspace — `git status` is clean (confirmed).

---

## 2. The reviewer verified all five previously-open findings CLOSED

`NEW-DEFECT-03`, `NEW-DEFECT-05`, `NEW-DEFECT-06`, `NEW-DEFECT-08`, `NEW-DEFECT-09` —
independently, on the frozen pair. That is the load-bearing result of this review: the
reconstruction's central claim held up under independent inspection.

## 3. Reviewer finding `NEW-DEFECT-10` — CONFIRMED REAL

**Claim.** The generated H3D-LIVE runbook carries its own `allowed` / `denied` privilege
arrays, i.e. a second constant list beside the declared sole allowlist source.

**Controller verification (independent, not accepting the reviewer's word):**

`docs/platform/shared-runtime/runbooks/lane-b-role-lane_b_rw_live-create.sql:33-34`

```sql
  allowed text[] := ARRAY['SELECT','INSERT','DELETE'];
  denied  text[] := ARRAY['UPDATE','TRUNCATE','REFERENCES','TRIGGER'];
```

and the fixture declares itself the only permitted source:

> `docs/platform/shared-runtime/fixtures/lane-b-per-stage-allowlist.json`:
> `"status": "SOLE ALLOWLIST SOURCE — do not add a second constant list anywhere (checks, runbooks, SQL, tools)"`

**So the reviewer is right that the runbook file contains a privilege list.** The finding is
confirmed at the file level.

### 3.1 Where the controller's appraisal differs — the list is generated, not hand-written

Checked the generator rather than only the generated artefact:

```js
tools/shared-runtime/h3d/generate-runbooks.mjs:128-129
  L.push(`  allowed text[] := ${ex ? sqlArray(ex.allowed_privileges) : "ARRAY[]::text[]"};`);
  L.push(`  denied  text[] := ${ex ? sqlArray(ex.denied_privileges)  : "ARRAY[]::text[]"};`);
```

The arrays are **rendered from the fixture**, not independently authored. There is no second
*source*; there is a second *rendering*, which is what a generator is for.

### 3.2 The "bind fail-closed" half of the required fix is ALREADY IMPLEMENTED

The reviewer asked for two things. The first is present and wired into the standard gate set:

`tools/shared-runtime/package.json` → `selftest` includes `node h3d/generate-runbooks.mjs --check`

That check fails closed when the on-disk runbook and the fixture diverge.

### 3.3 Controller negative control — the reviewer's second request is ALSO already satisfied

The reviewer said no mutation negative control existed. Tested directly, since a claim about a
missing control must be settled by running it:

| Step | Action | Observed |
|---|---|---|
| 1 | hand-edit the committed runbook: `allowed` → `ARRAY['SELECT','INSERT','DELETE','UPDATE']` (simulating hand-drift of the array) | edit applied |
| 2 | `node tools/shared-runtime/h3d/generate-runbooks.mjs --check` | **exit `1`** — `DRIFT docs\platform\shared-runtime\runbooks\lane-b-role-lane_b_rw_live-create.sql (on-disk != render from the sole allowlist source)` |
| 3 | restore the committed file | `git status` clean |

A mutation of exactly the kind the reviewer was worried about **is** caught, with a non-zero
exit, by a check that is already part of `npm run selftest`.

### 3.4 What is genuinely not covered (the real, narrower gap)

Honest statement of the residual gap, which is smaller than the finding's wording:

- the **committed runbook can still contain a hand-authored list** and be internally consistent
  — the `--check` proves *"on-disk equals the generator's render"*, not *"no literal list exists
  in the file"*. A future hand-edit that also edited the fixture would stay green;
- `NEW-DEFECT-10`'s wording ("duplicated allowlist ... a second constant list") is therefore
  only partly accurate for a **generated** artefact — but the underlying concern (a literal
  privilege list living in a runbook, decoupled from the contract's single source) is real and
  worth a gate.

## 4. Reviewer's check results — controller appraisal

- `targeted selftests / static checks: exit 0` and `git diff --check: exit 0` — consistent with
  the controller-run stage gate (which passed 6/6 before dispatch).
- `npm run selftest: exit 1 — sandbox EPERM writing snapshot` and
  `node h3d/tests.mjs: exit 1 — sandbox EPERM on snapshot/git subprocess`: **environmental, not
  substantive.** The review stage runs with `context_mode = INDEPENDENT-QA`, which the wrapper
  maps to `--sandbox read-only`; those two suites need to write a snapshot and spawn git, which a
  read-only sandbox refuses. The same suites pass for the controller outside that sandbox
  (`npm run selftest` exit 0, run before dispatch). Recorded as a sandbox-capability limit, not
  a defect in the package.

## 5. Pair-binding discrepancy — controller error, recorded honestly

The reviewer reported reviewing planning `74db7cc8885a0a807019838a4c9c901eba0e4d42`.

The **actual** planning SHA at `materialize` time was `4b792e9794d921f89efd53998bb83ffbd3b06bf8`
(confirmed by `EXECUTION-DRIVER.json` → `"baseline_revision": "4b792e9794d921f89efd53998bb83ffbd3b06bf8"`).

`74db7cc` is the planning revision named in the brief text itself; the brief was then committed,
which advanced the branch by one commit — exactly the ordering mistake this run already caught
once (see `CANDIDATE-MANIFEST-…` §3). The reviewer therefore quoted the SHA it was **told** in the
prompt, not the SHA it actually read.

**Material impact: none measurable.** Verified by comparison:

| Artefact | `74db7cc` vs `4b792e9` |
|---|---|
| `OWNER-DECISION-GATE-CONTRACT-LANE-B-2026-09-23.md` | identical |
| `CREDENTIAL-STRATEGY-LANE-B-2026-09-22.md` | identical |
| `LEDGER-LANE-B-FINDING-FAMILIES-2026-09-22.md` | identical |
| `RECONSTRUCTION-LANE-B-CREDENTIAL-BOUNDARY-2026-09-23.md` | identical |
| changed files between the two | **only the brief itself** |

So the reviewer read the same content either way, and the verdict stands on substance. But under
the contract's invalidation rule — *"if either SHA changes, the prior review cannot be inherited"* —
**a review bound to a misquoted SHA cannot be treated as a clean frozen-pair review.** This is
recorded as a controller process defect, and it is why §7 re-freezes and re-reviews rather than
simply accepting `REMEDIATE` and moving on.

## 6. Disposition

| Item | Decision |
|---|---|
| Five original findings | **independently verified CLOSED** — this is the review's main positive result |
| `NEW-DEFECT-10` | **confirmed as a real gap**, but narrower than stated: the arrays are generated from the fixture, and both the fail-closed binding and a working mutation control already exist. The residual gap is "a literal list may live in the file, consistent with the generator" — worth a real gate |
| Verdict | `REMEDIATE` — accepted as the reviewer's honest verdict; not to be relabelled |
| Pair binding | **invalid for inheritance** — reviewer quoted `74db7cc`, actual `4b792e9`; controller error |
| Reviewer mutation | none — the frozen artefacts are unwritten |

## 7. Next step under the locked contract

Per the contract's invalidation rule and §10.1's ladder, the run does **not** accept this verdict
against the current pair. The path is:

1. remediate `NEW-DEFECT-10` with a real gate (a scan asserting no hand-authored privilege list
   exists in any generated runbook, plus its mutation control);
2. re-freeze an exact pair;
3. obtain **one fresh review bound to the exact new pair** (`§6`), with the prompt carrying the
   frozen SHA so the quoted-SHA defect cannot recur.

No live checkpoint, no LAB access, and no secret was involved at any point in this review.
