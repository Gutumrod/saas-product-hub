# OWNER_HOLD — WSTERA-HOUSE-PRODUCTION-CLOSURE-001 — T5 / B5 CLOSURE

> ## ⚠️ SUPERSEDED — READ THIS FIRST
>
> **The R15-authority question in this document was ANSWERED by the Owner on 2026-09-20.**
> The Owner issued an explicit bounded authorization for the R15 transition D0→D4 and delegated
> Hermes as the deterministic provisioning operator. The statement below that "the authorization has
> not been given" was true when written and is **no longer true**.
>
> R15 is now **authorized and D0 is COMPLETE**. D0 stopped the transition before D1 under the
> Owner's own P4/U4 clause 3, and a **new** decision is required — a different one from the one in
> this file. See:
>
> - **`R15-D0-PREFLIGHT-OUTCOME-2026-09-20.md`** ← the current, authoritative state and the new
>   decision required (three options, plus the separate `product_installations` blocker)
> - `R15-D0-BASELINE-EVIDENCE-2026-09-20.json`, `R15-D0-TOPOLOGY-EVIDENCE-2026-09-20.json`
>
> This file is retained for the historical record of the B5-closure OWNER_HOLD only. **Do not act on
> the decision list below** — it is resolved.

Task ID: `WSTERA-HOUSE-PRODUCTION-CLOSURE-001`
Stage: **T5** (Production readiness / controlled apply / deploy / live proof) · Review Batch: **B5 closure**
Hold type: **OWNER_DECISION_REQUIRED** (R15 provisioning authority) — stop condition per manifest
Recorded: 2026-09-20 (Asia/Bangkok) · Orchestrator: Hermes · Classifier: `agent-codex` (independent)

## Why the run stopped here

B5 closure review returned, verbatim: **`OWNER_DECISION_REQUIRED`**, and ruled that the missing R15
authorization *"is an `OWNER_HOLD`, not merely a non-blocking note"* and that **"progression to T6 is not
permitted yet"**. Per the manifest's stop conditions, a genuine security/authority gap stops the run.

This is not a technical failure and not something Hermes may resolve by choosing an option. **No
production mutation was improvised to bypass it.**

## What is actually live right now (measured, reversible)

| Item | State |
|---|---|
| Deployed Worker version | `00bdb1b5-70d2-4e41-b97d-f1f238e9bf31` (2026-09-20T11:34:10.899Z) |
| Superseded (rollback) version | `9db4fb70-a5e5-4989-94b5-1d271ab10055` — still addressable |
| Frozen source candidate | hub-web `679ff279e5ff2a9a3006bea79ccc6ccde90715ec` |
| Zone `wstera.com` | `always_use_https: on`, `min_tls_version: 1.2` |
| Capabilities | **both config sets absent → inert** |
| Live proof (WU06) | **16/16 PASS** (pre-deploy baseline 6/16) |
| Production claims | `BUILD_PASS` ✅ · `LIVE_PROVEN` (code-only scope) ✅ · `PRODUCTION_READY` ❌ · `OPERATED_STABLE` ❌ |

Everything above is reversible: Worker rollback to `9db4fb70`, reverse zone PATCHes to `off` / `1.0`,
and nothing was delivered for the capabilities.

## The decision required from Owner

The manifest's T5-WU05 objective includes *"apply approved R15 least-privilege role/grants/config
transition"*. That apply is **not executable by Hermes** with the inputs that exist, for these specific
reasons — each recorded by the R15 plan itself:

| Gate item | R15 plan's own status |
|---|---|
| **P3** owner-credential retention confirmation | must come from the provisioning authority (rollback viability) |
| **P4** R15 ordering-constraint disposition | *"AUTHORITY DECISION — not taken here"* (U4) |
| **U3** exact Worker-secret-setting command form | *"UNKNOWN — deploy authority must supply; do not invent"* |
| **U5** rollback-viability window length | *"OWNER/PROVISIONING DECISION — not taken here"* |
| `hub_web_app` role + credential provisioning | provisioning authority |

The plan declares itself: *"EVIDENCE PREPARATION ARTIFACT — NOT AN EXECUTION PLAN AUTHORIZATION, NOT AN
APPROVAL"*, and B5 R7 called the apply a *"separately authorized controlled operation"*. **That
authorization has not been given.** The plan explicitly forbids inventing the missing inputs, and P3/F2
make the transition **irreversible from the start** if owner-credential retention cannot be confirmed.

**Owner decision needed (choose one):**

1. **Authorize the R15 transition** — supply/confirm: P3 retention, P4 ordering disposition, U3 secret
   command form, U5 rollback window length, and the provisioning authority that creates `hub_web_app`
   + credential. Then Hermes executes the R15 plan D0→D4 under the R15 gate, and B5 is re-reviewed.
2. **Defer R15** and explicitly accept that T5 cannot close with it open, i.e. the task parks at this
   OWNER_HOLD with the current live state frozen and reversible.
3. **Narrow the task scope** — Owner rules that this closure task may close without the R15 transition,
   with R15 carried as a separate follow-up task.

## The second blocked item (informational, not the stop driver)

**Capability activation** cannot proceed either: no `PRODUCT_EVENT_SIGNERS` and no
`BILLING_CORE_CONTROL_READ_*` material exists in this environment (searched by NAME only; no value read
or printed). Activation also requires the sequenced verification programme B5 specified, which by its own
ordering runs *after* R15. Same authority class as the item above.

## What Codex verified independently (so this hold is evidence-backed)

- hub-web is on `work/house-platform-closure-20260919` at exactly `679ff27`; nested worktree clean;
  coordination record committed at House `bfdd221`.
- The frozen candidate correctly identifies `679ff27` as the sole candidate revision.
- The record **honestly documents** the initial Cloudflare edge-block (`1010`) mistake and the corrected
  observed application response.
- Capability activation was correctly skipped (material absent, and sequenced after R15).
- The R15 apply was correctly not executed: *"Executing it without those decisions or a Billing Core
  read credential would have been an unauthorized, improvised production mutation."*

## Corrections Codex required — both fixed

1. **Unsupported claim (mine).** The record said the corrected probe "requires the application's own 401
   invalid-signature response"; the script actually accepted any `400/401/403` whose body was not an edge
   block. **Fixed**: the assertion is now strict — `status == 401` **and** body contains
   `invalid signature`. Re-ran: **16/16 PASS** under the stricter condition.
2. **Deployed-version provenance.** The repository cannot independently prove that version `00bdb1b5`
   was built from `679ff27`; that remains operator/live evidence. Recorded as a limitation rather than
   claimed as repository-verifiable.

## T5 contract status

**NOT MET** (per the B5 closure review). The code-only deploy and live-proof sub-lane completed, but the
full T5 stage did not close because the R15 transition did not occur and several WU06 contract items
remain untested (Owner-authenticated surfaces, synthetic fulfillment path, live confirmation of deployed
version/rollback/secret-absence, and Control request correlation which is design-only).

T5 therefore remains **PENDING / OWNER_HOLD**, not `BATCH_APPROVED`. **T6 and B6 are not entered.**

## Manifest-correct next step

Owner resolves the R15 authority question above → the authorized work is executed → **B5 re-review** of
the resulting exact state → only then T6 (`T6-WU01..03`) and the final **B6** review.

No automatic Owner acceptance, and no claim of House final closure, is made or implied by this record.
