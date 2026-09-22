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
| 3 | `ANALYSIS-LANE-B-LONG-RUN-BLOCKERS-2026-09-22.md` | **read this before planning anything** — why the run stops, and what must be fixed before it can continue |
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
- **`H4` requires a direct DB LOGIN, which the `H2` boundary decision forbids.**
  `ANALYSIS` A4.

And one standing platform fact: **H1 is still open and wider than recorded** — every
new role in LAB inherits write access to `cron` and `net` through the managed
`PUBLIC` ACL, at creation, with nothing granted. `BATCH-H3D-S` §7.

## 4. Recommended next unit — not `H3D-A1`

`H3D-A1` issues real DML in two concurrent sessions and rolls back. Authorising it
now means running it over three known holes, and its own exit criterion — "nothing
left behind" — cannot be evidenced while twelve of the counted tables are blind. It
would have to be run twice.

Recommended instead, as one remediation unit with its own Codex review:

1. a credential strategy document covering every remaining stage (`ANALYSIS` D1);
2. `F-GATE-RLS-COUPLING`, `F-CATALOG-PROVENANCE`, `auth.users` measurability;
3. the `H2`/`H4` contradiction resolved as a design decision;
4. the missing stage definitions written in Lane-B terms.

The Owner may override and authorise `H3D-A1` directly. That is their call, and it
would be recorded as an Owner override of a controller recommendation, not a clean
gate.

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
