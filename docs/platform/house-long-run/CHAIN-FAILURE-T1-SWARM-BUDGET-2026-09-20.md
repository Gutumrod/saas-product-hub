# CHAIN FAILURE — T1 swarm lane budget exhaustion — WSTERA-HOUSE-PRODUCTION-CLOSURE-001

Stage: T1 (R15 least-privilege preparation)
Review Batch: B1 (not yet reached)
Task: `WSTERA-HOUSE-PRODUCTION-CLOSURE-001`
Recorded: 2026-09-20 (Asia/Bangkok)
Orchestrator: Hermes

## Issue Fingerprint

```
SWARM_WORKER_TURN_BUDGET_EXHAUSTED_BEFORE_DELIVERABLE_WRITE
```

Derived from: failure class `executor-resource-envelope` + component `hermes-native-swarm worker
turn budget` + failing gate `deliverable-exists-at-declared-path` + symptom signature
`worker completes inspection, exhausts max_turns, never reaches the write step`.

## Attempt ledger

| # | Lane | Worker | Capability | max_turns | Outcome |
|---|---|---|---|---|---|
| 1 | `t1-wu01` | `swarm-inspector` | `inspection` | 12 | worker self-report `FAIL` — inspection complete, document not written |
| 2 | `t1-wu02` | `swarm-evidence` | `evidence_preparation` | 14 | worker self-report `FAIL` — re-verification complete, document not written |

Budget consumed: **2/2**. Per the Brief's Automatic Technical Recovery, ordinary repair #3 is
**not permitted**. The next required step is Codex exact-evidence classification.

## Common failure signature (identical across both attempts)

Both lanes returned an internally contradictory record:

```
lane state (aggregate)   : SWARM_WORK_UNIT_PASS
worker_report.state      : FAIL
commander_checks         : []            (empty)
artifacts                : []            (empty)
revision.measured        : matches declared revision (no revision drift)
```

Commander-authoritative reading: **NOT PASS.** The declared acceptance check requires the
deliverable to exist at a declared path. It does not exist. An empty `commander_checks` list means
no deterministic check was run against a real artifact, so the aggregate `PASS` field is not
supported by evidence. Hermes does not accept a PASS that no artifact backs.

This is also a **skill-level observation worth recording**: `hermes-native-swarm` v0.1.0 derived
lane state `SWARM_WORK_UNIT_PASS` from a lane that produced no artifact and no commander checks,
while the worker itself reported `FAIL`. That is a potential aggregate-state defect in the skill
(independent of this task), flagged here rather than silently patched — the skill is a released
artifact and any change must go through its own revision-bound review path.

## What each attempt actually achieved

**Attempt 1 (`t1-wu01`)** — completed the read-only inspection. Delivered a file:line-backed
analysis of the hub-web database access path including:
- Path A: direct Postgres via `drizzle-orm/postgres-js` from `DATABASE_URL`
  (`server/db.ts:1-3,20,23-34`; `_core/env.ts:5`; `_core/runtime-env.ts:11-15`).
- Path B: two Supabase PostgREST clients — product project (`_core/supabaseAdmin.ts:9-21`) and
  Control project (`control-plane/adapters/control-db.ts:13-20`).
- Required privileges on `public.profiles`, `public.products`, `public.product_assets`,
  `public.product_installations` with the exact `db.ts` line numbers for SELECT/INSERT/UPDATE.
- No `CREATE`/`ALTER`/`DROP`/`DELETE` anywhere in server code.
- Identity-sequence `USAGE` requirement from `generatedAlwaysAsIdentity()` columns.
- All six migrations inspected; none reference `billing_core`.
- `wrangler.jsonc` declares no `vars` — runtime config arrives as Worker secrets.

**Attempt 2 (`t1-wu02`)** — completed full re-verification of attempt 1's claims against source at
the packet revision, and surfaced **one material fact attempt 1 missed**:

> RLS is enabled on `public.profiles` with policies granted only to `authenticated` and
> `service_role`. A plain `hub_web_app` role therefore cannot use `public.profiles` without an
> explicit decision.

That is a genuine architectural/security decision point: it determines whether R15's `hub_web_app`
role is the PostgREST/authenticated path or a direct-Postgres path, and whether a new policy or a
different consumption mechanism is required. Under the Relay "Decision Gap" contract this must be
recorded, not invented around.

## Assessment (Hermes, for Codex to confirm or overrule)

Two candidate root causes, not mutually exclusive:

- **H1 — packet oversize.** Each packet required (a) re-verifying 15–20 source files and (b)
  writing a multi-section deliverable, inside `max_turns` 12–14. The inspection half alone consumed
  the entire budget, so the write never happened. The skill explicitly warns against repeating a
  known oversized packet.
- **H2 — deliverable too large for one write unit.** Even with a correct packet, a full privilege
  matrix + deny matrix + deploy/rollback plan + decision-gap record is a large single artifact;
  the bounded native worker may need the deliverable split into several smaller write lanes.

The remedy that follows from H1/H2 is to **shrink and split**, not to retry the same shape:
- inspect-then-write must be two lanes with no re-verification burden on the writer lane, or
- the deliverable must be produced in several small bounded lanes (matrix rows, deny matrix,
  deploy/rollback, decision gaps) each with its own small `max_turns`.

## Decision Gap raised (must not be silently resolved)

`public.profiles` RLS policy coverage for a non-`service_role`, non-`authenticated` runtime role.
Whether R15's `hub_web_app` is intended to use PostgREST (authenticated path) or direct Postgres,
and therefore whether a new RLS policy is in scope, is an **architecture/security decision**.
Recorded here for Codex classification and, if Codex concurs, for the Owner.

## No mutation performed

Both lanes were read-only. `git status` after both lanes shows only the three pre-existing
untracked `docs/platform/shared-runtime/` files (deviation D-2) — no source mutation, no database
mutation, no role/grant change, no secret read or printed.

## Next required step

Codex exact-evidence classification with one of the LONG_RUN verdicts, specifically answering:
1. Is the fingerprint correct?
2. Is `H1` (packet oversize) or `H2` (deliverable too large) the operative cause, or both?
3. Does the `public.profiles` RLS finding require `OWNER_DECISION_REQUIRED`, or is it resolvable
   within the locked R15 contract?
4. What is the authorized remedy shape (split/shrink instructions) before any further dispatch?
