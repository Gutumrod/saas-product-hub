# STATUS — LANE B PRE-A1 CONTROLLER PACKAGE, END OF SESSION 2026-09-22 (later block)

Task: `HOUSE-SHARED-RUNTIME-LANE-B-CLOSURE-001`
Controller: Claude (Windows)
Stopped by: explicit CEO instruction — "ถ้ารอบนี้ยังไม่ผ่าน หยุดก่อนนะ" (if this round doesn't pass, stop first)
Current state: **BLOCKED — package not yet Codex-PASS. AGY has not been dispatched. No LAB access occurred at any point.**

## 1. What this session did

Executed the Owner-authorized pre-A1 controller unit
(`OWNER-DECISION-LANE-B-PRE-A1-REMEDIATION-2026-09-22.md` §3): wrote one bounded
controller/design package —

- **A** — `CREDENTIAL-STRATEGY-LANE-B-2026-09-22.md`: run-wide credential policy
  (classes M/W/A/P/T, per-stage map, runbook templates, window-open verification
  checks, RLS-measurability handling, provenance, gates).
- **B** — `BRIEF-AGY-LANE-B-PRE-A1-FINDINGS-REMEDIATION-2026-09-22.md`: the AGY
  execution brief closing the three open H3D-S findings
  (`F-GATE-RLS-COUPLING`, `F-CATALOG-PROVENANCE`, `auth.users` measurability).
- **C** — `VERIFICATION-H2-H4-CONSISTENCY-2026-09-22.md`: the H2/H4 consistency
  re-verification the Owner decision required (correcting the retracted A4 finding),
  concluding H4 preserves the H2 NOLOGIN boundary and recording real (non-H2-breaking)
  gaps as G-H4-1..5.

Per the loop rule (`OWNER-DECISION` §4.1 / Brief §4), Codex reviewed this
Claude-authored package before any AGY dispatch — required because it is a
design/security-contract change. **Four review rounds ran; none passed.**

## 2. Review trail

| Round | Reviewed SHA | Verdict | Review file |
|---|---|---|---|
| 1 | `4c3210d` | FAIL — 10 defects | `REVIEW-CODEX-LANE-B-CONTROLLER-PACKAGE-2026-09-22.md` |
| 2 | `47eab10` | FAIL — 5 new defects (round-1 items mostly closed) | `REVIEW-CODEX-LANE-B-CONTROLLER-PACKAGE-ROUND2-2026-09-22.md` |
| 3 | `c6c5467` | FAIL — 2 new defects (round-2 items mostly closed) | `REVIEW-CODEX-LANE-B-CONTROLLER-PACKAGE-ROUND3-2026-09-22.md` |
| 4 | `675975b` | FAIL — 2 new defects (round-3 items closed/materially improved) | `REVIEW-CODEX-LANE-B-CONTROLLER-PACKAGE-ROUND4-2026-09-22.md` |

Every round: Codex made no mutation; every fix in between was Claude's, independently
re-verified against source before writing (not accepted from Codex prose — e.g. this
session independently ran `git log` and read the runner source to confirm DEFECT-01,
NEW-DEFECT-04, NEW-DEFECT-06/07/09 before touching the docs). One self-caught defect
not flagged by Codex: a `JOIN pg_namespace n ON n.relnamespace = n.oid` typo (always
zero rows, would have made a supposedly-strict check vacuously pass) — fixed before
round 4 was sent.

**Pattern across rounds:** each fix closed the named defects but the corrected
mechanism exposed a new, real, narrower defect one layer down (RLS-coupling wording
→ effective-privilege enumeration → catalog-query correctness → relation-identity
qualification). This is convergence, not drift — round 4's remaining items are two
SQL-precision defects in checks that are already structurally correct, not a new
policy-level problem.

## 3. Exact open items (block round 5)

Both are in `CREDENTIAL-STRATEGY-LANE-B-2026-09-22.md`, current tip `675975b`:

- **NEW-DEFECT-08 (MEDIUM):** the `H3D-LIVE` forbidden-reach enumeration query for
  `wstera_platform_internal` (§3 checks table, "forbidden reach (W)" row) selects
  only `c.relname`, not a schema-qualified identity. The exception comparison
  (`r = 'wstera_platform_internal.runtime_token_grants'`) can therefore fail to match
  the bare name the query actually returns, or resolve a different same-named
  relation via `search_path`. Fix: return `c.oid` (or explicit `n.nspname || '.' ||
  c.relname`) and call `has_table_privilege` with that, not a bare `relname`.
- **NEW-DEFECT-09 (MEDIUM):** the "no real-table write privilege" row's separate
  positive assertion (that the accepted `cron`/`net` exposure is exactly the
  documented four relations) enumerates every `r/p/S` relation in those two schemas
  from `pg_catalog`, which conflates *catalog presence* with *effective reach*.
  Codex's concrete counterexample: `cron.job_run_details` exists in the catalog with
  `PUBLIC` object grants, but PS01 identities have no `USAGE` on schema `cron`
  (`H1-EFFECTIVE-PRIVILEGE-INVENTORY-2026-09-08.md:81-85`), so it is not reachable —
  yet the query as written would count it as an unexpected fifth relation and fail
  the assertion even on a correctly-shaped role. Fix: pick one contract explicitly —
  either assert *effective reach* (schema-qualified identity + the actual privilege
  set, including the `USAGE`-vs-object-grant distinction) or assert *catalog
  inventory* (include every such object in the documented baseline) — and do not
  call the catalog-only version "effective reach" as the current text does.

Full detail, evidence citations, and required fixes are in round 4's review file
(§"Further NEW-DEFECT findings").

## 4. What is NOT blocked / not in question

- No LAB, Supabase, Auth, or secret access occurred at any point this session.
- No LAB role, credential, grant, or Auth setting was created or changed.
- AGY has not been dispatched; brief **B** has not started executing.
- The H2/H4 consistency conclusion (**C**) is not in dispute — all four Codex rounds
  confirmed H4 preserves the H2 NOLOGIN boundary; the retracted A4 finding stays
  retracted.
- Brief **B** (the AGY remediation brief) has had no defect raised against it since
  round 2 (DEFECT-07/08 closed there) — it is not the source of the remaining block.
- `H3D-A1` is not authorized by anything in this package and was never attempted.

## 5. Options for the next instruction

1. **Continue — round 5.** Both remaining items are narrow, mechanical SQL/contract
   fixes (not new design decisions); a fifth round is the likely path to a real PASS
   given the convergence pattern in §2.
2. **Pause here, resume later** — this status file plus the four round files are a
   complete, re-checkable record; nothing decays by waiting.
3. **Owner override** — accept the package with NEW-DEFECT-08/09 noted as open,
   scoped out before whichever live checkpoint first exercises the `H3D-LIVE`
   exception path or the accepted-exposure assertion (neither is exercised by
   `H3D-A1`). This is a real option because neither defect affects `H3D-A1`'s own
   checks; it would be an explicit Owner call, not a default.

No option is taken without explicit instruction — this file only reports.

## 6. File locations

Planning branch `work/house-lane-b-longrun-plan-20260922`, pushed, current tip
`675975b85d4ccb106a39a9d2166b7dbbab70edb0`. All paths under
`D:\AI-Workspace\runtime\worktrees\house-lane-b-longrun-plan-20260922\docs\platform\shared-runtime\`:

- `CREDENTIAL-STRATEGY-LANE-B-2026-09-22.md` (A, REV4)
- `BRIEF-AGY-LANE-B-PRE-A1-FINDINGS-REMEDIATION-2026-09-22.md` (B, REV2)
- `VERIFICATION-H2-H4-CONSISTENCY-2026-09-22.md` (C, REV3)
- `REVIEW-CODEX-LANE-B-CONTROLLER-PACKAGE-2026-09-22.md` (Codex round 1)
- `REVIEW-CODEX-LANE-B-CONTROLLER-PACKAGE-ROUND2-2026-09-22.md` (Codex round 2)
- `REVIEW-CODEX-LANE-B-CONTROLLER-PACKAGE-ROUND3-2026-09-22.md` (Codex round 3)
- `REVIEW-CODEX-LANE-B-CONTROLLER-PACKAGE-ROUND4-2026-09-22.md` (Codex round 4)
- this file
