# ANALYSIS — WHY LANE B CANNOT RUN UNATTENDED, AND WHAT WOULD FIX IT

Date: 2026-09-22
Task: `HOUSE-SHARED-RUNTIME-LANE-B-CLOSURE-001`
Author: Claude (Windows) — Lane-B controller
Basis: measured behaviour of the `PRE-01` and `H3D-S` units executed 2026-09-22,
not hypothesis

## 0. Summary

The Lane-B brief describes a `LONG_RUN` that advances automatically through
read-only/source/test/review work and stops only at five Owner checkpoints. In
practice the run stopped **eleven** times across two units, and only two of those
stops were the Owner checkpoints the brief anticipated.

The stops fall into three groups:

- **A — brief defects:** the brief specifies stages, gates or preconditions that
  cannot be satisfied as written. Six issues.
- **B — environment behaviour:** the hosted Supabase platform does not behave the way
  the tooling assumes. Four issues.
- **C — process structure:** how the agents were arranged and how reports were
  trusted. Five issues.

Group A is the one that matters. Group B is discoverable and now documented. Group C
is already partly fixed.

The honest headline: **a continuous unattended run is not achievable for the
remaining stages until the credential strategy and the acceptance gates are
redesigned.** Everything else is friction; those two are contradictions.

---

## A. Brief defects

### A1 — No credential strategy. The single largest cost.

The brief assumes credentials already exist. `HANDOFF-H3D-WINDOWS-TO-MAC` §6 says
SELECT-only verification is allowed "when the required DB credential is already
provided securely in the session", and the Lane-B brief never states what credential
each stage needs, in what privilege shape, who provisions it, or where it lives.

Consequence: each stage discovers its credential requirement *at the moment it is
blocked by it*. `H3D-S` stalled completely on this. The sequence actually required
was: search the secret store → find only a superuser → refuse it → create a role →
fix its password → grant `BYPASSRLS` → run → revoke → drop. None of that was in any
brief; all of it was improvised at the gate.

The remaining stages each need a different shape, and none is specified:

| Stage | Required privilege |
|---|---|
| `H3D-A1` | `INSERT`/`UPDATE`/`DELETE` on `ps01` (rollback-only DML, two sessions) |
| `H3D-LIVE` | writes, Auth admin, runtime grant rows |
| `H4` | a **direct DB LOGIN** credential (see A4) |
| all measurement | reads that RLS cannot filter (see A2) |

Until this is decided once, every remaining stage will stall the same way.

### A2 — The acceptance gates are unsatisfiable under least privilege

`F-GATE-RLS-COUPLING`, HIGH. This is a logical contradiction, not friction.

The gates were authored using a credential that bypasses RLS, and the brief
simultaneously requires least-privilege operation. Measured:

- The expected catalog manifest embeds a data row —
  `ps01.commercial_packages WHERE id = 'starter'` — inside the fingerprint. That
  table has RLS enabled with one policy, scoped to `{authenticated}`. A role that
  respects RLS reads `row: null` and produces a different fingerprint, so
  `--verify` reports permanent false drift. Observed: `d950f6d3…` versus the expected
  `3413b349…`, resolving to identical once and only once `BYPASSRLS` was granted.
- Of the 23 tables the LAB-state gate counts, **12 are RLS-blind** to a
  least-privilege role, including `ps01.camera_access_audit` — the table S5 exists to
  protect — plus `commercial_packages`, `shop_subscriptions`,
  `subscription_audit_log`, `camera_settings`, `room_rate_plans`, `import_batches`
  and `auth.users`. Their baseline expectation is `0`, and a blind role returns `0`.
  Every one of those would have read as a pass while proving nothing.

So the brief's own gates can only be satisfied by violating the brief's own
principle. Worse, the failure is *silent in the passing direction*: the counts go
green. A run that did not stop to check RLS would have produced a clean-looking
`H3D-S PASS` built on twelve meaningless zeros.

### A3 — `H3D-A1` is named but never defined

The Lane-B brief §5 and the manifest stage table both list `H3D-A1`. Neither says
what it is. The definition had to be recovered from a different document — the
"Acceptance gate A1" section of
`BRIEF-CLAUDE-H3D-STATIC-ACCEPTANCE-REMEDIATION-2026-09-09.md` — which reveals it is
the rollback-only two-session concurrency and failure-injection validation, i.e. the
first stage that issues real DML.

A controller cannot run ahead through a stage whose scope, allowed mutations and exit
criteria are not written down. This also caused a real misjudgement: `BATCH-H3D-S`
initially gated the open findings before `H3D-LIVE` on the belief that it was the
first mutating stage. It is not.

Check the remaining stage names for the same gap before starting: `H3D-LIVE`, `H3E`,
`H3F`, `H4`, `H5`, `HOUSE-A` each need scope, allowed/prohibited mutations, exit
criteria and required evidence written down in Lane-B terms.

### A4 — RETRACTED. There is no `H2`/`H4` contradiction.

**This finding was wrong. Corrected by the Owner in
`OWNER-DECISION-LANE-B-PRE-A1-REMEDIATION-2026-09-22.md` §2, and verified here
against the source.**

The original claim was that
`BRIEF-CLAUDE-H3D-H5-HOUSE-A-LONG-RUN-EXECUTION-2026-09-09.md` line 451 requires the
H4 disposable product to hold a direct DB LOGIN credential, contradicting the `H2`
NOLOGIN boundary.

Line 451 sits under `## 13. Hard Stop Conditions`, whose opening sentence is *"STOP,
write durable evidence, and do not proceed to the next dependent phase if any of
these occurs"*. The clause is therefore a **stop condition**: if H4 turns out to need
a direct DB LOGIN, the run halts. That is a prohibition that *enforces* the H2
boundary, not a requirement that breaks it. The prepared H4 assets are consistent
with it — `h4_migrator` and `h4_runtime` are both NOLOGIN, with forward and rollback
executed through the platform-owned lane.

**How the error was made, because it matters more than the error.** A bullet was
grepped and its meaning inferred without reading the section heading that governs it.
That is the same failure mode as A5 below — specifying from a name or a fragment
rather than from the thing itself — committed in the document that describes A5. The
lesson generalises past this instance: *when a single line is about to become a
finding, read the block it belongs to first.*

Standing correction: **do not redesign H4 around a direct product DB LOGIN.** What is
required instead is an H2/H4 consistency re-verification producing a durable note on
whether the current H4 brief, SQL, probe harness, token-issuance path and teardown
all preserve the H2 boundary. Any inconsistency found *there* is a real finding; none
may be manufactured from the misread sentence.

### A5 — Gate steps were specified from tool names, not tool behaviour

`BRIEF-H3D-S-LIVEGATE-CLOSURE-2026-09-22.md` §5 originally specified
`h3d-live-runner.mjs --preflight-readonly` for Check 2, "rather than ad-hoc SQL". The
mode counts none of the required values, is designed to STOP at fixture discovery on
a LAB with no fixtures, and writes evidence into the repository. The instruction was
written from the mode's name.

This generalises. Before a long run starts, every gate in the stage list must be
checked against what the tool actually does. An unverified gate is a guaranteed stall
at best, and a false pass at worst.

### A6 — Evidence output collides with the clean-tree requirement

The brief requires that no stage be called PASS from a working tree with unclassified
mutation. But `writeEvidence()` writes to `CFG.outDir`, which defaults to the current
directory, so simply running a gate dirties the repository.

`H3D_OUT_DIR` must be set to a scratch path as a standing rule. This is not stated
anywhere; it was discovered by reading the function.

---

## B. Environment behaviour the tooling assumes wrongly

### B1 — The Supabase pooler silently drops connection options

`?options=-c default_transaction_read_only%3Don` has no effect through the pooler,
and `ALTER ROLE … SET default_transaction_read_only = on` does not apply either,
because the pooler does not re-apply role GUCs to its backends. Both were measured on
port 5432 (session mode).

Neither failure is visible: `SHOW default_transaction_read_only` simply returns
`off`. The only reason this was caught is that the gate included a negative control —
a probe write that had to fail. It succeeded.

**Consequence:** a connection-level read-only guardrail cannot be enforced against
this platform at all. Where one is wanted, the substitute is source-level
verification that the tool issues no write SQL.

**Generalisation worth keeping:** assert behaviour, never settings. A `SHOW` that
returns the desired value proves the string, not the enforcement.

### B2 — Supabase `postgres` is not a true superuser

`DROP ROLE` failed with `2BP01` (dependent privileges), and the standard remedy
`DROP OWNED BY` then failed with `42501`: *"Only roles with privileges of role
h3d_ro may drop objects owned by it."*

This is the same constraint H1 recorded at the start of the programme: `postgres`
here does not own the managed objects and cannot act over other roles by fiat.
Teardown must explicitly `REVOKE` each grant, mirroring what was granted, before
`DROP ROLE` will succeed.

Every remaining stage that creates a role or grant inherits this. Teardown runbooks
must carry the explicit revoke list, not assume `DROP OWNED BY`.

### B3 — `auth.users` cannot be granted to a new role

`GRANT SELECT ON auth.users` reported success but reads still fail with `42501`; the
`auth` schema is managed by `supabase_auth_admin`. The baseline expects
`auth.users = 5` and the `H3D-A1` exit criterion explicitly names Auth identities.

**That criterion is currently unprovable.** It was recorded as `UNMEASURED` rather
than passed. It must be measurable before any stage that creates Auth identities.

### B4 — H1 is still open, and wider than recorded

A role created with nothing but `SELECT` on `ps01`, `wstera_platform_internal` and
`auth` had write privilege on `cron` (1 table) and `net` (2 tables) **at the moment
of creation**, inherited through the managed `PUBLIC` ACL.

The original H1 finding described this as product roles inheriting write access.
The measurement shows it is broader: *any* role in this database receives it, and a
role cannot be created without it. It cannot be avoided by scoping grants carefully,
because nothing was granted.

---

## C. Process structure

### C1 — Splitting the controller across machines multiplies relay cost

Moving the controller to the Mac was intended to remove human relay by co-locating
Claude, AGY and Codex. It did not: the Owner still relayed every credential decision,
every preflight result and every brief by hand, because the blocking work was
provisioning, not agent-to-agent dispatch.

**Rule worth keeping:** relocate the controller only when uncommitted work is
stranded on the other machine — which was true at `PRE-01` and false afterwards.
Once everything is pushed, the machine choice is free and should default to wherever
the Owner can talk to the controller directly.

### C2 — The Mac agent runs without the workspace's rules

`.claude/hooks/session-bootstrap.mjs` hardcodes `const ROOT = "D:\\AI-Workspace"` and
exits when that path is absent, so the Commander bootstrap can never fire on macOS.
`MEMORY_DIR` similarly hardcodes the `D--AI-Workspace` project key. `restore.mjs` is
cross-platform and would link the global rules, but had never been run there.

A Mac-side agent therefore operates with no iron rules, no memory index, and no
language contract. It performed well regardless — but that was competence, not a
guarantee, and it is not a state to run a security programme from.

### C3 — Executor reports do not reliably match the code

AGY reported modifying `houseCommit()`. It had not. The claim was caught only by
reading the diff.

**Standing rule for the rest of the run:** check the executor's report against the
actual diff every unit. A report is a claim, not evidence — which is what the
Independent Verification policy already says, and this is a concrete instance of why.

### C4 — The reviewer is strong on code and weak on evidence claims

Codex found a real deadlock and a vacuous test. It passed over an evidence document
that asserted a fingerprint had been "captured" with "no drift" when it had only been
recomputed offline and never compared to LAB. The controller caught that.

**Standing rule:** direct the reviewer explicitly at evidence-versus-reality claims,
not only at code. Note also that the deadlock was found *because* the handoff named
lock ordering as a review focus item. Directed review demonstrably works; undirected
review missed the evidence defect.

### C5 — Five Owner checkpoints are a designed ceiling

`OWNER-CP-H3D-A1`, `OWNER-CP-H3D-LIVE`, `OWNER-CP-H3E`, `OWNER-CP-H4`,
`OWNER-CP-HOUSE-A`. Plus the paired Dashboard toggles A–F in the Operator Action
Pack, which cannot be pre-armed because each pair brackets a measurement window, and
the mandatory wait past `residualNarrowAuthorityUntil` after each disable.

This is correct design and should not be optimised away. It does mean "run it
straight through" has a hard ceiling: the run is structurally a sequence of
supervised windows, not a batch job. Expectations should be set accordingly.

---

## D. What would actually enable a long run

Ranked by how much stalling each removes.

1. **Decide the credential strategy once, for every remaining stage.** One document:
   what privilege shape each stage needs, that roles are ephemeral and created per
   unit, the exact create/verify/revoke/drop runbook including the explicit revoke
   list from B2, and the rule that a role is never written to the secret store. This
   alone removes the largest observed stall.

2. **Fix the three open findings before `H3D-A1`, not after.** `F-GATE-RLS-COUPLING`,
   `F-CATALOG-PROVENANCE`, and `auth.users` measurability. This is not a detour: a
   stage whose exit criterion is "nothing was left behind" cannot be evidenced while
   twelve of the counted tables are blind, so running `H3D-A1` first means running it
   twice.

3. **Re-verify H2/H4 consistency** (revised — see the retraction in A4). There is no
   contradiction to resolve. What is needed is a durable note confirming that the
   current H4 brief, forward and rollback SQL, probe harness, token-issuance path and
   teardown all preserve the H2 NOLOGIN boundary, with any genuine gap recorded as a
   new finding.

4. **Write the missing stage definitions in Lane-B terms** — scope, allowed and
   prohibited mutations, exit criteria, required evidence — for `H3D-A1`,
   `H3D-LIVE`, `H3E`, `H3F`, `H4`, `H5`, `HOUSE-A`. A controller cannot advance
   through a stage it has to reverse-engineer.

5. **Verify every gate against tool behaviour before the run starts,** per A5, and
   set `H3D_OUT_DIR` as a standing rule, per A6.

6. **Use the prepare-only packages that already exist.** H3E forward/rollback/rehearsal
   SQL, the H3F inventory tool and comparator, the H4 design brief, SQL and probe
   harness, and the H5 probes and regression template were all built on 2026-09-09.
   The tail of this run is execution and evidence, not design — provided those
   packages are first re-verified against the current revision, which has changed
   substantially since they were written.

7. **Keep the controller, AGY and Codex on one machine, and keep that machine the one
   the Owner is talking to.**

Items 1–4 are prerequisites. Items 5–7 are throughput.

---

## E. Stops recorded in this session

| # | Unit | Stop | Group |
|---|---|---|---|
| 1 | `PRE-01` | dirty file readable only on the Mac | C1 |
| 2 | `PRE-01` | secret-scan gate false positive on the token `password` | A5 |
| 3 | `PRE-01` | `refs/preserve/*` creation not pre-authorised | A5 |
| 4 | `H3D-S` | no credential on the Mac session | A1 |
| 5 | `H3D-S` | `keys.txt` absent on the Mac | A1 |
| 6 | `H3D-S` | stored credential is the `postgres` superuser | A1 |
| 7 | `H3D-S` | `options=` dropped by the pooler | B1 |
| 8 | `H3D-S` | `ALTER ROLE … SET` not applied by the pooler | B1 |
| 9 | `H3D-S` | `--verify` false drift under RLS | A2 |
| 10 | `H3D-S` | `auth.users` ungrantable | B3 |
| 11 | teardown | `DROP ROLE` / `DROP OWNED BY` refused | B2 |

Two Owner checkpoints were reached as designed. Nine of the eleven stops were not
anticipated by any brief.
