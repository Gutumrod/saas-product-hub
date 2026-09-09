# HANDOFF — H3D Windows → Mac

**Date:** 2026-09-09 (Asia/Bangkok)
**Mode:** WSTERA HOUSE / DEVICE HANDOFF
**Target:** MacBook Pro
**Execution boundary:** static remediation only; no live DML/Auth/grant/hook/H3D run

## Canonical resume point

Resume from this brief only:
`docs/platform/shared-runtime/BRIEF-CLAUDE-H3D-STATIC-ACCEPTANCE-REMEDIATION-2026-09-09.md`

The previous F01–F12 implementation exists, but House acceptance found S1–S5 that must be fixed before any rollback-only validation authorization.

Current closure remains:
`LIVE DML NOT AUTHORIZED / H3D NOT PASS / HOUSE-A CLOSED / BK01 QUARANTINED`.## Mac prepared state

House worktree:
`/Users/wachirayachankhonkan/AI-Workspace/runtime/worktrees/house-h3d-h5-20260909`
branch `work/house-h3d-h5-20260909`
prepared from Windows checkpoint `7ecfe11a7dfef1a3686d1612b82b7cdca84dc067`, remote parity `0/0` before this handoff commit.

PS01 worktree:
`/Users/wachirayachankhonkan/AI-Workspace/runtime/worktrees/ps01-h3d-data-api-20260909`
branch `work/ps01-h3d-data-api-20260909`
HEAD `c169e5dfc6ba3da45c653b853f1694355ee8ae88`, remote parity `0/0`.

Mac repo master was intentionally not updated or checked out for execution. Work continues only in isolated worktrees.## Mac toolchain verified

- Node `v22.22.3`
- npm `10.9.8`
- pnpm `11.21.0`
- Git `2.50.1 (Apple Git-155)`
- GitHub fetch for both House and PS01 succeeded.

House `tools/shared-runtime` dependencies installed with `npm ci --ignore-scripts`.

Mac verification already executed:
- `npm run selftest` → PASS
- `node h3d/sql-static-check.mjs` → PASS
- House worktree remained clean after verification.

No secret was copied from Windows as part of this handoff.## Resume instructions on Mac

1. Work only in the House worktree above.
2. Read the static-acceptance brief before editing.
3. Fix S1–S5 only; do not reopen accepted F01–F12 architecture unless required by direct evidence.
4. Keep PS01 unchanged in this pass.
5. Run offline/static gates on Mac after edits.
6. SELECT-only LAB verification is allowed only when the required DB credential is already provided securely in the Mac session.
7. Never put `LAB_DB_URL`, service keys, JWTs, passwords, LINE IDs, or other secrets into repo files, argv evidence, or committed logs.

Required next terminal state after implementation:
`H3D STATIC ACCEPTANCE REMEDIATED / ROLLBACK-ONLY VALIDATION AUTHORIZATION AWAITING OWNER`.## Hard locks after device move

Do not execute:
- fixture seed or teardown SQL;
- Auth identity create/delete probes;
- runtime grant INSERT/DELETE;
- Custom Access Token hook changes;
- H3D live run;
- rollback-only/two-session DML validation until Owner/House explicitly authorizes that separate lane;
- H3E/H3F/H4/H5;
- merge or HOUSE-A/BK01 release.

Windows can be treated as the previous execution machine once this handoff commit is pushed. Mac becomes the active H3D implementation machine.