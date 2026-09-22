# HANDOFF — LANE B, SESSION OF 2026-09-22

Task: `HOUSE-SHARED-RUNTIME-LANE-B-CLOSURE-001`
Outgoing: Claude (Windows) — Lane-B controller
Incoming: next Lane-B controller session
Stage reached: **`H3D-S PASS`**
Next hard stop: `OWNER-CP-H3D-A1`

This is a pointer document. The substance lives in the records it names; do not
re-derive it.

## 1. Read these, in order

| # | File | Why |
|---|---|---|
| 1 | `BRIEF-LANE-B-SHARED-RUNTIME-LONG-RUN-CLAUDE-AGY-CODEX-2026-09-22.md` | the task, roles, loop, Owner checkpoints |
| 2 | `RUN-MANIFEST-LANE-B-SHARED-RUNTIME-LONG-RUN-2026-09-22.md` | stage ordering |
| 3 | `OWNER-DECISION-LANE-B-PRE-A1-REMEDIATION-2026-09-22.md` | **binding** — what you are authorized to do next, and the correction to finding A4 |
| 4 | `ANALYSIS-LANE-B-LONG-RUN-BLOCKERS-2026-09-22.md` | why the run stops, and what must be fixed before it can continue |
| 4 | `BATCH-H3D-S-2026-09-22.md` | the state you inherit, its evidence, and the open findings |
| 5 | `PRE-01-CLASSIFICATION-AND-CLOSURE-2026-09-22.md` | how the inherited code got here |
| 6 | `BRIEF-CLAUDE-H3D-STATIC-ACCEPTANCE-REMEDIATION-2026-09-09.md` | defines S1–S5 and acceptance gate A1 |
| 7 | `OPERATOR-ACTION-PACK-H3D-TO-H5-2026-09-09.md` | the seven Owner Dashboard actions for the whole run |

All on `work/house-lane-b-longrun-plan-20260922`, readable without checking it out:

```
git show origin/work/house-lane-b-longrun-plan-20260922:docs/platform/shared-runtime/<file>
```

## 2. State

| Item | Value |
|---|---|
| Controller machine | **Windows** (moved Mac → Windows 2026-09-22; see `BATCH-H3D-S` §8) |
| Execution worktree | `D:\AI-Workspace\runtime\worktrees\house-h3d-h5-20260909` |
| Execution branch | `work/house-h3d-h5-20260909` @ `2b1af861aa608f08abb0bd8224821b9ca5ac9981`, clean, `0/0` |
| Planning worktree | `D:\AI-Workspace\runtime\worktrees\house-lane-b-longrun-plan-20260922` |
| Planning branch | `work/house-lane-b-longrun-plan-20260922`, `0/0` |
| PS01 worktree | `…\ps01-h3d-data-api-20260909` @ `c169e5d`, clean, `0/0`, untouched |
| Preserved orphan work | `origin/preserve/mac-h3d-dirty-20260922` @ `db19abd` — keep, do not delete |
| LAB | `ykxlqnshaaxmzzocpjlj`, unchanged; no credential left on disk; `h3d_ro` dropped |
| BK01 | quarantined, untouched |
| Production | no authority granted, none used |

`2b1af86` carries a clean Codex PASS from review round 3, on the full range
`d6707c0..2b1af86`. Codex mutated nothing in that round, so it was eligible to be the
reviewer. **Do not squash that range** — it would mint a new SHA and void the review.

## 3. Open — all three block `H3D-A1`

| Finding | Severity | Record |
|---|---|---|
| `F-GATE-RLS-COUPLING` — the acceptance gates are only satisfiable by a credential that bypasses RLS; 12 of 23 counted tables are blind to a least-privilege role and return meaningless zeros | HIGH | `BATCH-H3D-S` §5 |
| `F-CATALOG-PROVENANCE` — `catalog-manifest.mjs:174` stamps `project_ref` from a string literal, so no capture can prove which database it came from | HIGH | `BRIEF-H3D-S-LIVEGATE-CLOSURE` §9.2 |
| `auth.users` unmeasurable (`42501`) — the `H3D-A1` exit criterion names Auth identities, so that criterion is currently unprovable | MEDIUM | `BATCH-H3D-S` §6, `ANALYSIS` B3 |

Plus two design questions that will halt later stages if left:

- **`H3D-A1` is named but never defined** in Lane-B terms. Same likely true of the
  stages after it. `ANALYSIS` A3.
- **H2/H4: no contradiction — the A4 finding was retracted.** What remains is a consistency re-verification.
  `ANALYSIS` A4.

And one standing platform fact: **H1 is still open and wider than recorded** — every
new role in LAB inherits write access to `cron` and `net` through the managed
`PUBLIC` ACL, at creation, with nothing granted. `BATCH-H3D-S` §7.

## 4. Next unit — authorized, do not start `H3D-A1`

The Owner decided this on 2026-09-22:
`OWNER-DECISION-LANE-B-PRE-A1-REMEDIATION-2026-09-22.md` — **AUTHORIZED WITH
CORRECTION**. Read it before acting; it is binding and it overrides the shape
recommended here.

One bounded controller/design unit, then the normal loop:

- **A — run-wide credential strategy.** One durable policy covering every remaining
  stage: role shape, privilege boundary, creation authority, injection, verification,
  explicit revoke list, teardown order, ephemerality, no persisted secret values, and
  how Supabase managed-ACL and RLS measurability are handled. It may *define* future
  ephemeral roles but **must not create or mutate any LAB role or credential**.
- **B — remediation brief for the three findings**, making each acceptance check
  non-vacuous and falsifiable: no RLS-blind zero may count as proof of zero residue;
  catalog drift capture separated from RLS-protected data claims; provenance measured
  rather than stamped; an Auth-identity residue proof path that exists before any
  stage creates identities; and negative controls proving each measurement would fail
  under a wrong target or hidden residue.
- **C — H2/H4 consistency re-verification**, not a redesign. See §3 and `ANALYSIS`
  A4.

Then: **Codex reviews the Claude-authored controller package before AGY touches
anything**, because Claude authored design and security-contract changes. Codex
mutation → back to Claude for `CLAUDE_REVIEW_PASS`. Then AGY does all ordinary
source/tool/test/evidence work, Codex reviews the exact AGY revision, Claude does the
final consistency check.

No live LAB role, Auth, DML or config mutation is authorized in this unit. Do not
return to the Owner for routine questions inside the package — Claude owns the
technical decomposition and may split AGY work into smaller units without changing
the locked acceptance criteria. Stop early only for a genuinely new
security/architecture decision, a required Production mutation, inability to close a
finding without a mutation belonging to a later checkpoint, secret exposure, or
unexplained shared-runtime drift.

When the three findings are closed at source/tooling/evidence-contract level and the
credential strategy and H2/H4 verification are approved, advance to
`OWNER-CP-H3D-A1` and **stop**.

## 5. Standing rules earned this session — apply them, do not relearn them

- **Assert behaviour, never settings.** A `SHOW` that returns the desired value
  proves the string, not the enforcement. The Supabase pooler silently drops
  `options=` and ignores `ALTER ROLE … SET`; only a probe write that had to fail
  caught it.
- **A negative control must be harmless when it fails.** `CREATE TEMP TABLE`, not an
  `INSERT` into a real table — if the guardrail is broken, the probe must not write.
- **`UNMEASURED` is never `PASS`.** A table that cannot be read is missing evidence,
  not a green check. This is where false greens come from.
- **Check the executor's report against the diff, every unit.** AGY reported changing
  `houseCommit()`; it had not.
- **Direct the reviewer at evidence-versus-reality claims, not only code.** Codex
  found a deadlock because the handoff named lock ordering as a focus item, and
  missed an evidence document that claimed a live verify which had never run.
- **Secret gate:** the blocking pattern is assignment-shape
  (`key\s*[:=]\s*"literal{8,}"`). The broad pattern is advisory only — a bare
  `password` token false-positives on redaction and runtime code.
- **Credentials:** `.secrets/keys.txt` line 412 `BILLING_DATABASE_URL` is the LAB
  `postgres` superuser, writable across 14 schemas including quarantined
  `local_service`. Do not use it. The pattern that worked is an **ephemeral** role
  created in the Supabase SQL editor, used, then revoked and dropped — never stored,
  never synced. Teardown needs explicit `REVOKE`s first; `DROP OWNED BY` is refused
  because Supabase `postgres` is not a true superuser.
- **Set `H3D_OUT_DIR` to a scratch path** before running the runner, or it writes
  evidence into the repository and dirties the tree.
- **Keep controller, AGY and Codex on one machine,** and make it the machine the
  Owner is talking to. Relocate only when uncommitted work is stranded elsewhere.

## 6. Housekeeping, not blocking

The Mac cannot run the Commander bootstrap: `.claude/hooks/session-bootstrap.mjs`
hardcodes `const ROOT = "D:\\AI-Workspace"` and exits when that path is absent, and
`MEMORY_DIR` hardcodes the `D--AI-Workspace` project key. `restore.mjs` is
cross-platform and would link the global rules but has never been run there. Fix both
if Mac-side agents are ever wanted again. `ANALYSIS` C2.
