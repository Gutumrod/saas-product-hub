# BRIEF — MAC PRE-01 DIRTY-STATE MEASUREMENT & PRESERVATION

Date: 2026-09-22
Parent task: `HOUSE-SHARED-RUNTIME-LANE-B-CLOSURE-001`
Parent brief: `BRIEF-LANE-B-SHARED-RUNTIME-LONG-RUN-CLAUDE-AGY-CODEX-2026-09-22.md`
Stage: `PRE-01` (currently `PRE-01 BLOCKED`)
Issued by: Claude (Windows) — Lane-B LONG_RUN controller
Executor: Claude (Mac)
Mode: `READ-ONLY MEASUREMENT + NON-DESTRUCTIVE PRESERVATION`

## 0. Why this brief exists

Lane-B `PRE-01` requires classifying the dirty tracked file
`tools/shared-runtime/h3d/h3d-live-runner.mjs` in the Mac House worktree before any
mutation. That file exists only in the Mac working tree. It is uncommitted and
unpushed, so the Lane-B controller on Windows has no read path to it.

Measured from Windows on 2026-09-22:

- `origin/work/house-h3d-h5-20260909` = `d6707c0c96309f2f0efb8f83f00b5f34aee6d2b5`,
  last pushed 2026-09-09 22:03 +0700.
- No Mac commit has ever been pushed since the Windows→Mac handoff.
- Committed blob of `h3d-live-runner.mjs` is `899d9cbf24d3a8445e483b364e44ec9ffb22e6e4`
  at both `7ecfe11` and `d6707c0` (the intervening commit is docs-only).

Therefore every unit of Mac work in this lane exists on exactly one machine, with no
backup, in a single uncommitted file.

Per `RUN-MANIFEST-LANE-B-SHARED-RUNTIME-LONG-RUN-2026-09-22.md`: if dirty-state
provenance cannot be resolved safely, the stage is `PRE-01 BLOCKED`. This brief
resolves that blocker.

## 1. Scope — what you are authorized to do

Authorized:
- read-only measurement of the Mac House and PS01 worktrees;
- construction of a preservation commit object using a temporary index;
- a single push of that object to a new `preserve/*` ref;
- reporting provenance of the dirty edit.

## 2. Hard prohibitions

Do NOT:
- `git reset`, `git clean`, `git checkout --`, `git restore`, `git rebase`, or any
  other command that discards or rewrites the dirty working-tree content;
- `git stash push` / `git stash save` (these mutate the working tree — `stash create`
  is different and is not used as a mutation here);
- commit onto, move, or push `work/house-h3d-h5-20260909`;
- modify the real index, the working tree, or `HEAD`;
- modify the PS01 worktree in any way;
- resume or continue S1–S5 implementation work in this pass;
- run any LAB DML, fixture seed/teardown, Auth identity probe, runtime grant
  INSERT/DELETE, Custom Access Token hook change, or H3D live run;
- place `LAB_DB_URL`, service keys, JWTs, passwords, LINE IDs, or any other secret
  into repo files, command arguments, evidence, or the report;
- push anything if the secret scan in Step B is non-zero.

Owner authority is unchanged by this brief. No Production authority is granted.

## 3. Step A — read-only measurement

Run from the Mac House worktree root:

```bash
cd /Users/wachirayachankhonkan/AI-Workspace/runtime/worktrees/house-h3d-h5-20260909
echo "== HEAD ==";        git rev-parse HEAD
echo "== PARITY ==";      git fetch -q origin && git status -sb | head -1
echo "== DIRTY ==";       git status --porcelain
echo "== DIFF STAT ==";   git diff --stat
echo "== MTIME ==";       ls -l tools/shared-runtime/h3d/h3d-live-runner.mjs
echo "== BLOB NOW ==";    git hash-object tools/shared-runtime/h3d/h3d-live-runner.mjs
```

Then measure PS01 (read-only, required by `PRE-01`):

```bash
cd /Users/wachirayachankhonkan/AI-Workspace/runtime/worktrees/ps01-h3d-data-api-20260909
git rev-parse HEAD; git fetch -q origin; git status -sb | head -1; git status --porcelain
```

Expected PS01 baseline per handoff: `c169e5dfc6ba3da45c653b853f1694355ee8ae88`,
clean, parity `0/0`. Report any deviation instead of correcting it.

## 4. Step B — non-destructive preservation

This procedure writes a commit object without touching the working tree, the real
index, `HEAD`, or any branch. It captures tracked modifications **and** untracked
non-ignored files.

```bash
cd /Users/wachirayachankhonkan/AI-Workspace/runtime/worktrees/house-h3d-h5-20260909

TMPIDX="$(mktemp -t preserve-idx)"; rm -f "$TMPIDX"
GIT_INDEX_FILE="$TMPIDX" git read-tree HEAD
GIT_INDEX_FILE="$TMPIDX" git add -A
TREE="$(GIT_INDEX_FILE="$TMPIDX" git write-tree)"
PRESERVE="$(git commit-tree "$TREE" -p HEAD -m 'preserve: mac h3d dirty state 2026-09-22 (PRE-01, no review, no approval)')"
rm -f "$TMPIDX"

echo "PRESERVE_COMMIT=$PRESERVE"
echo "== CONTENT SUMMARY =="
git diff --stat HEAD "$PRESERVE"
echo "== SECRET SCAN (must print 0) =="
git diff HEAD "$PRESERVE" | grep -cEi 'LAB_DB_URL|service_role|postgres://|eyJ[A-Za-z0-9_-]{10}|password|ANON_KEY|SUPABASE_[A-Z_]*KEY|BEGIN [A-Z ]*PRIVATE KEY'
```

**Gate:** if the secret-scan count is not `0`, STOP. Do not push. Report the hit
count and the file/line numbers only — never the matched values.

If and only if the count is `0`:

```bash
git push origin "$PRESERVE":refs/heads/preserve/mac-h3d-dirty-20260922
```

Then confirm the working tree is still dirty and unchanged:

```bash
git status --porcelain
git hash-object tools/shared-runtime/h3d/h3d-live-runner.mjs
```

The blob hash must equal the value recorded in Step A, and `HEAD` must still be
`d6707c0c96309f2f0efb8f83f00b5f34aee6d2b5`. If either changed, STOP and report.

## 5. Step C — provenance

`PRE-01` requires classification, not just preservation. Report what you can
establish from evidence on the Mac, and mark anything you cannot establish as
unknown rather than inferring it:

1. Which session authored the dirty edit, and on what date.
2. What it was attempting — specifically whether it targets findings S1–S5 of
   `BRIEF-CLAUDE-H3D-STATIC-ACCEPTANCE-REMEDIATION-2026-09-09.md`, and which of
   S1/S2/S3/S4/S5 appear addressed versus untouched.
3. Whether the edit is complete, partial, or abandoned mid-change.
4. Whether any verification gate was run against it on the Mac
   (`npm run selftest`, `node h3d/sql-static-check.mjs`), and the result.
5. Any Mac-side agent log or handoff note covering this work — check
   `vault/06-Agent-Logs/` and any local handoff directories, and cite exact paths.

Do not run the verification gates now if they were not run before; this pass is
measurement and preservation only. Report gate status as unknown if unknown.

## 6. Required report back

Return exactly these fields:

- House worktree HEAD, upstream parity, `git status --porcelain` output;
- dirty blob hash before and after Step B;
- `git diff --stat` summary;
- file mtime;
- `PRESERVE_COMMIT` SHA and whether the push succeeded;
- secret-scan count;
- PS01 HEAD, parity, dirty state;
- provenance answers from Step C, with unknowns marked as unknown;
- any deviation from this brief, and why.

Do not include diff content, secret values, or connection strings in the report.
The Lane-B controller will read the preserved content directly from
`origin/preserve/mac-h3d-dirty-20260922`.

## 7. Terminal state

On success:

`PRE-01 MAC STATE PRESERVED / AWAITING CLAUDE-WINDOWS CLASSIFICATION`

On secret-scan failure or any unexpected state:

`PRE-01 MAC PRESERVATION BLOCKED` plus the exact measured reason.

Do not advance to `H3D-S` from the Mac. Stage advancement is the Lane-B
controller's decision after classification.
