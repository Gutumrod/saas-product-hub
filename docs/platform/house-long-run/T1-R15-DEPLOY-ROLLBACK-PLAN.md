# T1-R15 DEPLOY / ROLLBACK PLAN — `hub_web_app` role transition and the `DATABASE_URL` switch

Task ID: `WSTERA-HOUSE-PRODUCTION-CLOSURE-001`
Stage: T1 (R15 least-privilege preparation)
Work unit: `T1-WU05-DEPLOY-ROLLBACK-PLAN-R2`
Correlation id: `house-t1-wu05r2-20260920`
Role class: `evidence_preparation`
Record type: **EVIDENCE PREPARATION ARTIFACT — NOT AN EXECUTION PLAN AUTHORIZATION, NOT AN APPROVAL**
Recorded: 2026-09-20 (Asia/Bangkok)

Citations source: `docs/platform/house-long-run/T1-CITATION-PACK.md` (sections **A, I, J** only).
Governing ruling: `docs/platform/house-long-run/T1-RLS-DECISION-RECORD-2026-09-20.md`
(Owner decision OPTION 3, binding).

> **Lane rule applied:** every citation-pack reference below is **copied** from
> `T1-CITATION-PACK.md` sections A, I, J. Nothing here was re-derived, re-verified, or re-read from
> source by this lane. No citation was introduced from any citation-pack section other than A, I, J.
> Per this work unit's authority, **no git provenance or revision check was run** by this lane.

Cross-references (non-pack, read as inputs or as sibling lane artifacts):

- `docs/platform/house-long-run/T1-RLS-DECISION-RECORD-2026-09-20.md` — governing ruling.
- `docs/platform/house-long-run/T1-R15-PUBLIC-PRIVILEGE-MATRIX.md` (`T1-WU03`) — the grant scope this
  plan activates.
- `docs/platform/house-long-run/T1-R15-BILLING-DENY-MATRIX.md` (`T1-WU04`) — the deny requirement
  and its verification command forms.

---

## 1. Purpose and boundary

This document states, in order:

- the **deployment sequence** for the R15 transition (provision `hub_web_app`, activate the grant
  scope, switch the application runtime credential from the owner to the scoped role), with the
  **explicit precondition of every step**;
- the **owner `DATABASE_URL` removal step** and its preconditions;
- the **rollback sequence** that returns the system to the prior credential/role state.

**This document executes nothing.** No database connection was opened, no role was created, altered,
or dropped, no `GRANT`/`REVOKE` was issued, no secret was set, read, or printed, no Worker was
deployed, and no command in this document was run. Every "expect:" line is a **proposed expectation
of a future run**, not an observed result. One documentation file was written, inside
`docs/platform/house-long-run/` only.

R15 remains **open**. This plan is an input to the B1 review, not evidence that the transition
happened.

## 2. What is being changed (two coupled changes, one window)

R15 corrects one defect by means of **two coordinated changes that must land in the same window**:

1. **Role change.** The application runtime currently connects to Project A as the `postgres`
   **owner** identity; the correct state is a dedicated `hub_web_app` **login role** scoped to
   exactly the `public` objects used — no ownership, no `CREATE`, no escalating membership.
   - Citation (pack §J): `docs/platform/PORTFOLIO_PRODUCTION_MASTER_PLAN.md:896` — R15: runtime
     connects as Project A `postgres` **owner**; correct state = dedicated `hub_web_app` **login
     role** scoped to exactly the `public` objects used — no ownership, no `CREATE`, no escalating
     membership.
2. **Credential change.** The runtime's `DATABASE_URL` must stop being the owner credential and
   become the `hub_web_app` credential.
   - Governing ruling §1 (`T1-RLS-DECISION-RECORD-2026-09-20.md`): R15 least-privilege intent
     includes "owner `DATABASE_URL` removed from application runtime".
   - Governing ruling §3: "Owner `DATABASE_URL` must be removed from the application runtime in
     favour of the scoped role."

**Coupling constraint (the reason the order below is not arbitrary):** the scoped credential must be
**proven working before** the working owner credential stops being used. `hub_web_app` carries only
the minimum `public` privileges required by the production direct-Postgres runtime (governing ruling
§1; grant scope in sibling lane `T1-WU03` §4.1). Activating the switch before that scope is
correctly granted produces a production outage on the objects the runtime actually needs
(`public.products`, `public.product_assets`, `public.product_installations`), not a subtle
degradation.

## 3. How the runtime receives `DATABASE_URL` (pack §A, §I) — basis for the switch mechanics

| Fact | Citation (copied from pack §A / §I) |
|---|---|
| direct-Postgres client library | `apps/hub-web/server/db.ts:1-3` — imports `drizzle-orm/postgres-js`, `postgres` |
| lazily cached client | `apps/hub-web/server/db.ts:20` — lazily cached `_db` |
| client construction from the URL | `apps/hub-web/server/db.ts:23-34` — `getDb()` = `postgres(ENV.databaseUrl, { prepare: false })` + `drizzle(client)`; **returns `null` when URL absent** |
| where the URL is read | `apps/hub-web/server/db.ts:18` → `apps/hub-web/server/_core/env.ts:5` — `databaseUrl` = `getRuntimeEnvString("DATABASE_URL")` |
| binding-vs-process precedence | `apps/hub-web/server/_core/runtime-env.ts:11-15` — Worker binding first, else `process.env[name] ?? ""` |
| deployed Worker / entry / routes | `apps/hub-web/wrangler.jsonc:3-11` — deploys Worker `hub-web` at `server/worker.ts`, routes `wstera.com` + `platform.wstera.com` |
| no `vars`, no secret bindings in config | `wrangler.jsonc` declares **no** `vars` and **no** secret bindings → `DATABASE_URL`, `SUPABASE_*`, `WSTERA_CONTROL_*` arrive as Worker **secrets** (`keep_vars: true` at `:7`), read via `runtime-env.ts:11-15` |
| deploy command form | `apps/hub-web/package.json` scripts: `build` = `vite build && esbuild server/_core/index.ts …`, `cf:deploy` = `vite build && wrangler deploy`, `test` = `vitest run`, `check` = `tsc --noEmit` |

Three consequences this plan relies on, all copied from the rows above rather than inferred from
source:

- **C1.** The switch is performed by changing the value behind the `DATABASE_URL` name (a Worker
  secret per §I), because that is exactly the name `env.ts:5` reads via `runtime-env.ts:11-15`. No
  code change is required by §A/§I for the credential swap.
- **C2.** `getDb()` returns `null` when the URL is absent (`db.ts:23-34`). So an *absent* URL is a
  distinct state from a *wrong* URL: absence disables the direct-Postgres path, while a
  wrong-but-present URL fails at query time. Both are failures for the required objects. **Neither
  is an acceptable target state**, and neither is a rollback target.
- **C3.** Because `DATABASE_URL` arrives as a Worker secret and `wrangler.jsonc` carries no secret
  bindings (§I), the switch is a **secret operation plus a deployment**, not a config-file edit. The
  exact secret-setting command is **not carried by this lane's citation set** (see §9, U3).

The two other database access paths are **out of scope for this transition** and are unchanged by
it — recorded here so the plan's blast radius is explicit:

- Path B, product project: `apps/hub-web/server/_core/supabaseAdmin.ts:9-21` —
  `createClient(ENV.supabaseUrl, ENV.supabaseServiceRoleKey)`; env at `env.ts:6-7` (pack §A).
- Path B, control project: `apps/hub-web/server/control-plane/adapters/control-db.ts:13-20` —
  `createClient(ENV.wsteraControlSupabaseUrl, ENV.wsteraControlSecretKey)`; env at `env.ts:13-14`
  (pack §A).

## 4. Deploy sequence — ordered, with explicit preconditions

Notation: **PRE** = precondition that must hold before the step runs; **VERIFY** = the check that
must pass before the next step runs; **MUTATES** = whether the step changes production state.

### Phase D0 — Pre-flight, read-only (no mutation)

**D0.1 — Pin the transition target.**
- PRE: an Owner/provisioning-authority decision naming the target environment (Project A
  production), the target Worker, and the Worker version id to be superseded.
- VERIFY: the pinned values are recorded in the run record before any mutation.
- MUTATES: no.

**D0.2 — Capture the pre-transition baseline (the rollback reference).**
- PRE: D0.1 complete.
- Capture, read-only, using an **auditing role that is not `hub_web_app`**:
  - current runtime identity: `SELECT current_user, session_user;` on the current runtime credential;
  - whether `hub_web_app` exists: `SELECT rolname FROM pg_roles WHERE rolname = 'hub_web_app';`
    (expect, at baseline: **zero rows** — the role does not yet exist);
  - RLS state on `public.profiles` is as recorded by the governing ruling §3 ("RLS on
    `public.profiles` stays enabled and untouched. No new policy.") — the pre-transition state to be
    preserved, not changed;
  - the current Worker version id serving `wstera.com` / `platform.wstera.com` (routes per pack §I).
- VERIFY: the baseline is written down **before** mutation. A rollback with no baseline is not a
  rollback.
- MUTATES: no.

**D0.3 — Confirm owner-credential retention (rollback viability gate).**
- PRE: D0.1, D0.2 complete.
- Required: the owner credential that the application runtime is currently using remains **available
  out-of-band** for the whole transition and the rollback window; it must **not** be rotated,
  revoked, or deactivated as part of this transition. The governing ruling §1/§3 require removal
  "from application runtime" — i.e. removal of its **use by the runtime**, not destruction of the
  credential.
- VERIFY: retention confirmed by the credential's owner (provisioning authority). If retention
  cannot be confirmed, **STOP — the transition is not reversible** and must not begin (see §9, F2).
- MUTATES: no.

**D0.4 — Confirm the R15 ordering constraint.**
- PRE: D0.1–D0.3 complete.
- The R15 deny/gate ordering constraint that governs whether the transition window may open is
  carried by the sibling lane `T1-R15-BILLING-DENY-MATRIX.md` §7 (finding F5) and by pack §J's R15
  control text. This lane does not re-derive or restate it beyond cross-reference; the opening of
  the window is a provisioning-authority call.
- VERIFY: the constraint's disposition is recorded for this run by the authority that owns it.
- MUTATES: no.

### Phase D1 — Provision the scoped role (privileged, mutating)

**D1.1 — Create the `hub_web_app` login role with the R15 posture.**
- PRE: Phase D0 complete; D0.3 passed (rollback viability).
- Required attributes (governing ruling §1; R15 control text in pack §J): it is a **login role**,
  scoped to exactly the `public` objects used; **no ownership**, **no `CREATE`**, **no escalating
  role membership**, **no `BYPASSRLS`**.
- Note: `public.profiles` is **excluded** and RLS on it stays enabled with **no** `hub_web_app`
  policy (governing ruling §1 and §3).
- VERIFY: catalog check — role exists with the required attribute posture (expect
  `rolbypassrls`/`rolsuper`/`rolcreatedb`/`rolcreaterole` all false), and **zero** rows for
  `hub_web_app` in `pg_auth_members` as member (no membership that could escalate). Command forms:
  use the sibling lane `T1-R15-BILLING-DENY-MATRIX.md` §3.1e and §3.1f rather than re-deriving
  them.
- MUTATES: yes.

**D1.2 — Apply the positive grant scope for `public`.**
- PRE: D1.1 verified.
- Scope is exactly the required-privilege matrix of sibling lane `T1-R15-PUBLIC-PRIVILEGE-MATRIX.md`
  §4.1/§6: `public.products` SELECT+INSERT; `public.product_assets` SELECT+INSERT;
  `public.product_installations` SELECT+INSERT+UPDATE; supporting `USAGE` on the schema, the
  identity sequences, and the referenced enum types. `public.profiles` is **NOT GRANTED**.
- Nothing here is re-derived by this lane: the matrix artifact owns the scope.
- VERIFY: catalog check that the **explicit** granted set equals the matrix **and nothing more**; in
  particular zero explicit `hub_web_app` entries for `public.profiles`, and no DDL/`DELETE` privilege
  present. NOTE (Owner ruling 2026-09-21): the check is on **explicit** grants. One effective
  privilege exists outside that explicit set — `USAGE` on `public.user_role`, inherited through
  PostgreSQL's PUBLIC default for enum types, held identically by every role. It is not an explicit
  grant and is recorded as an accepted exception, not remediated. See
  `B5-RER15-OUTCOME-AND-USERROLE-DECISION-2026-09-21.md` and
  `OWNER-DECISION-USERROLE-EFFECTIVE-PRIVILEGE-2026-09-21.md`.
  zero `hub_web_app` entries for `public.profiles`, and no DDL/`DELETE` privilege present.
- MUTATES: yes.

**D1.3 — Establish the explicit deny on `billing_core` and `billing_core_staging`.**
- PRE: D1.1 verified.
- The requirement, the effective-deny conditions, and the command forms are owned by sibling lane
  `T1-R15-BILLING-DENY-MATRIX.md` §3/§4. Per that artifact the deny is an **absence-invariant** to
  be asserted at provisioning time, not a migration reversal.
- VERIFY: the deny forms of `T1-WU04` §3.1/§4.1 (catalog) and §3.2/§4.2 (runtime, with the §3.3
  positive control) are executed and their results interpreted by the §3.4 table. A positive result
  on the positive control is required for any deny to be recorded as confirmed.
- MUTATES: yes (only in the sense of withholding/not granting; see that artifact for shape).

**D1.4 — Freeze the `public.profiles` boundary.**
- PRE: D1.1 verified.
- Required end state: RLS on `public.profiles` **enabled and untouched**; **no** `hub_web_app`
  policy; **no** `BYPASSRLS` (governing ruling §1, §3).
- VERIFY: catalog check showing RLS still enabled on `public.profiles` and no policy naming
  `hub_web_app`.
- MUTATES: no (it is an absence to be preserved).

### Phase D2 — Prepare the replacement credential (no runtime change yet)

**D2.1 — Create the `hub_web_app` credential.**
- PRE: D1.1–D1.4 verified (the role is correctly scoped *before* any credential for it is used).
- The credential value is created and held by the provisioning/secret authority. It must never be
  printed into a run log, a document, a commit, or this artifact.
- VERIFY: credential exists and is retrievable only through the approved secret channel.
- MUTATES: yes (credential creation), but production runtime behaviour is unchanged.

**D2.2 — Prove the scoped credential serves the required objects (pre-switch control).**
- PRE: D2.1 complete; D1.2, D1.3 verified.
- Using **the `hub_web_app` credential itself** (not `SET ROLE` from a privileged session), execute
  a positive control against each required object listed in `T1-WU03` §4.1, in the same run as the
  negative controls.
- VERIFY: every required operation succeeds; identity check reports `hub_web_app` as the session
  user (not the owner); `billing_core` / `billing_core_staging` probes return SQLSTATE `42501` for
  real, enumerated objects.
- **Gate:** if any required operation fails, **STOP**. Do not proceed to Phase D3. Rollback is not
  yet needed, because production state has not changed.
- MUTATES: no (read/verify only; the writes required to prove INSERT capability, if any are needed,
  must be authorised explicitly by the provisioning authority first — this plan does not authorise
  them).

### Phase D3 — The `DATABASE_URL` switch (owner credential removed from the application runtime)

**D3.1 — Set the `DATABASE_URL` Worker secret to the `hub_web_app` connection string.**
- PRE (all must hold):
  1. Phase D0 complete; D0.3 confirmed owner-credential retention (rollback viability).
  2. D1.1–D1.4 verified: role exists with the R15 posture, positive grant scope applied exactly,
     denies asserted, `public.profiles` boundary frozen.
  3. D2.2 passed: the scoped credential is proven to serve every required operation, with a valid
     positive control and the deny probes returning `42501`.
  4. The prior Worker version id is captured (D0.2) and remains available for rollback.
  5. The exact secret-setting command form is supplied by the deploy authority (§9, U3) — this lane
     does not carry it.
- Action: the value behind the `DATABASE_URL` name is replaced, **in one step**, by the
  `hub_web_app` credential. Setting this name to the scoped credential **is** the removal of the
  owner credential from the application runtime — there is no separate "delete the owner secret"
  step, because §I records `DATABASE_URL` as a single-named Worker secret and §A records that
  `env.ts:5` reads exactly that one name.
- VERIFY (after the associated deployment): see D3.2.
- MUTATES: yes.

**D3.2 — Deploy the Worker so the new secret takes effect.**
- PRE: D3.1 complete.
- Command form (pack §I): `apps/hub-web/package.json` script `cf:deploy` =
  `vite build && wrangler deploy`. (Pack §I also records `build`, `test` = `vitest run`, and
  `check` = `tsc --noEmit` as the available scripts.)
- VERIFY: the new version id is recorded; the previous version id remains rollback-addressable.
- MUTATES: yes.

**D3.3 — Post-switch verification (the acceptance gate).**
- PRE: D3.2 complete.
- Checks, all required:
  - runtime identity is `hub_web_app`, not the owner — `SELECT current_user, session_user;` on the
    application's own credential path;
  - every required operation of `T1-WU03` §4.1 succeeds through the **deployed runtime** (not only
    through an ad-hoc client);
  - the direct-Postgres path is present, i.e. **not** the `null`-URL state of `db.ts:23-34` (the
    secret must be present and correct, not absent — §3 C2);
  - `billing_core` / `billing_core_staging` remain denied, positive control still valid;
  - RLS on `public.profiles` unchanged; no `hub_web_app` policy exists;
  - Path B (Supabase PostgREST, product and control) is unaffected — it is not part of this change
    (§3).
- VERIFY: **all** of the above pass. Any single failure -> **ROLLBACK (§5)**, do not patch forward.
- MUTATES: no.

**D3.4 — Confirm the owner credential is no longer in the application runtime.**
- PRE: D3.3 fully passed.
- Confirm by observation that the runtime's effective identity is the scoped role and that the owner
  credential is retained **out-of-band only** (D0.3), not in use by the Worker.
- VERIFY: recorded. The owner credential is **not** deactivated here — that is a separate decision
  belonging to the Owner/provisioning authority after the rollback window closes (§9, F1/F2).
- MUTATES: no.

### Phase D4 — Close-out

**D4.1 — Record the transition evidence.**
- PRE: D3.4 complete.
- Record: pin from D0.1, baseline from D0.2, the actual catalog results from D1.1–D1.4, the D2.2 and
  D3.3 results, and the Worker version ids before/after.
- MUTATES: no.

**D4.2 — Hand to B1 independent review.**
- PRE: D4.1 complete.
- This lane does not review its own plan or the transition. R15 closes only when the deny and the
  scoped-role evidence pass independent review.
- MUTATES: no.

## 5. Rollback sequence — return to the prior credential/role state

Rollback returns the system to the **D0.2 baseline**: the application runtime uses the owner
`DATABASE_URL`; `hub_web_app` holds no privileges and does not exist as a usable application
identity; `public.profiles` RLS is untouched.

**Rollback triggers (any one):** a D3.3 check fails; required operations return `42501`; the runtime
identity is not `hub_web_app`; `billing_core`/`billing_core_staging` denial is not confirmed; the
`DATABASE_URL` resolves to an absent value (the `null`-state of `db.ts:23-34`); any production error
attributable to the switch; or the provisioning authority calls it.

**Rollback viability window:** rollback is possible only while the owner credential is still valid
and retained (D0.3). Once the owner credential is rotated or deactivated, **this rollback is no
longer executable** — see §9 F1/F2. That rotation is not part of this transition and is not
authorised by this work unit.

### Phase R1 — Restore the runtime credential

**R1.1 — Set the `DATABASE_URL` Worker secret back to the owner credential.**
- PRE: the owner credential is still valid and retrievable from the retention channel (D0.3); the
  R15 role's privileges are **not yet** revoked, so nothing else needs to be true for the runtime to
  work again.
- Action: restore the single-named `DATABASE_URL` secret to the pre-transition owner value.
- MUTATES: yes.

**R1.2 — Deploy the Worker.**
- PRE: R1.1 complete.
- Command form (pack §I): `cf:deploy` = `vite build && wrangler deploy`; alternatively restore the
  captured pre-transition Worker version (D0.2) if the failure is attributable to the code build
  rather than the secret.
- MUTATES: yes.

**R1.3 — Verify the runtime is restored.**
- PRE: R1.2 complete.
- Checks: the runtime's session identity is the owner identity again; every required operation of
  `T1-WU03` §4.1 succeeds; **positive control from the same run** to distinguish a restored runtime
  from a connectivity failure; the direct-Postgres path is present (not the absent-URL `null`
  state).
- VERIFY: restored. If the runtime is **not** restored, this is no longer a credential-scope problem
  — escalate to the provisioning authority; do not continue revoking.
- MUTATES: no.

### Phase R2 — Revert the role state

**R2.1 — Revoke every privilege granted to `hub_web_app`.**
- PRE: R1.3 passed (the runtime no longer depends on the scoped role — do not revoke while it is
  still in use, or the rollback becomes the outage).
- Action: revoke the exact grant set applied in D1.2 — every table/schema/sequence/type privilege
  from `T1-WU03` §4.1/§6 — plus any privilege applied in D1.3. Revoke **exactly** that set; do not
  invent an object list.
- VERIFY: catalog check returns **zero** privileges for `hub_web_app` across `public`,
  `billing_core`, and `billing_core_staging`, i.e. the same zero-row expectations as the sibling
  lane's forms, and no residual schema `USAGE`.
- MUTATES: yes.

**R2.2 — Drop the `hub_web_app` role.**
- PRE (all must hold — `DROP ROLE` fails or is unsafe otherwise):
  1. R2.1 verified: zero residual privileges held by the role;
  2. the role **owns no object** in any schema (it was created with no ownership per R15 — this is
     the check that confirms it, and it must be verified rather than assumed);
  3. no live session is connected as `hub_web_app`;
  4. the role has no members and is a member of no role (no membership that survived).
- Action: `DROP ROLE hub_web_app;` (or the equivalent statement issued by the provisioning
  authority). The exact statement form is the provisioning authority's; this plan states the
  preconditions and the required end state.
- VERIFY: `SELECT rolname FROM pg_roles WHERE rolname = 'hub_web_app';` returns **zero rows** — the
  D0.2 baseline value.
- MUTATES: yes.

**R2.3 — Verify the baseline is restored exactly.**
- PRE: R2.2 verified.
- Checks, compared item-by-item against the D0.2 baseline record: role absent; no `hub_web_app`
  privileges anywhere; runtime identity = owner; routes unaffected; RLS on `public.profiles` still
  enabled and untouched with no new policy; Path B unchanged.
- VERIFY: every baseline item matches. Any mismatch is a **residual state finding** — record it, do
  not close the rollback.
- MUTATES: no.

### Phase R3 — Record the rollback

**R3.1 — Record the outcome and reopen R15.**
- PRE: R2.3 complete.
- The R15 defect returns to **OPEN**; the failed transition, its trigger, and the residual-state
  findings (if any) are recorded as evidence. R15 must not be claimed as improved by a reverted
  attempt.
- MUTATES: no.

### Rollback ordering invariants (stated explicitly, because each has an obvious wrong order)

1. **Restore the runtime credential before revoking the role's privileges.** Reversing this removes
   the privileges the still-active runtime depends on and turns a rollback into an outage.
2. **Revoke before `DROP ROLE`.** Dropping a role that still holds privileges fails; dropping a role
   that owns objects is destructive. Ownership must be verified zero, not assumed from R15 posture.
3. **Never let the direct-Postgres path become the absent-URL state.** `getDb()` returns `null` when
   the URL is absent (`db.ts:23-34`); an "empty secret" is a failure state, not a rollback state. The
   rollback target is the **owner URL value**, not an unset value.
4. **Never rotate or deactivate the owner credential inside this window.** That converts a
   reversible change into an irreversible one without the Owner's decision (§9 F1/F2).

## 6. Preconditions summary (the deploy gate, as one list)

Deployment may begin only when **all** of the following hold:

| # | Precondition | Source |
|---|---|---|
| P1 | Transition target pinned: environment (Project A production), Worker, superseded version id | §4 D0.1 |
| P2 | Pre-transition baseline captured read-only, including `hub_web_app` absent and the current runtime identity | §4 D0.2 |
| P3 | Owner credential confirmed **retained out-of-band** for the rollback window (not rotated/deactivated) | §4 D0.3; governing ruling §1/§3 ("removed from application runtime") |
| P4 | R15 ordering constraint disposition recorded by its owning authority | §4 D0.4; sibling `T1-WU04` §7 F5 |
| P5 | `hub_web_app` created as a login role with no ownership, no `CREATE`, no `BYPASSRLS`, no escalating membership | §4 D1.1; pack §J; ruling §1 |
| P6 | Positive grant scope applied **exactly** as `T1-WU03` §4.1/§6, with `public.profiles` not granted | §4 D1.2; sibling `T1-WU03` |
| P7 | Explicit deny asserted for `billing_core` and `billing_core_staging`, verified per `T1-WU04` §3.4 | §4 D1.3; sibling `T1-WU04` |
| P8 | `public.profiles` RLS enabled and untouched; no `hub_web_app` policy | §4 D1.4; ruling §1/§3 |
| P9 | **Scoped credential proven to serve every required operation** with a valid positive control and `42501` deny probes, before any switch | §4 D2.2 |
| P10 | Secret-setting command form supplied by the deploy authority (not carried by this lane) | §9 U3 |

If any precondition is unmet -> **HOLD**. Do not begin D3; do not partially apply D3.

## 7. Owner `DATABASE_URL` removal step — explicit statement

**Removal step:** D3.1 — set the single-named `DATABASE_URL` Worker secret to the `hub_web_app`
connection string, then D3.2 deploy so it takes effect.

**What "removal" means here:** the owner credential is removed **from the application runtime's
use**, which is the requirement as worded by the governing ruling §1/§3 ("owner `DATABASE_URL`
removed from application runtime" / "must be removed from the application runtime in favour of the
scoped role"). It is **not** deactivation or destruction of the owner credential, which remains
retained out-of-band per P3 for migration/administrative use and for rollback.

**Preconditions (must all hold immediately before D3.1 — nothing is implied by the deploy phase
having started):**

1. P3 — owner credential retained and valid (rollback viability).
2. P5–P8 — `hub_web_app` exists with the R15 posture; positive grant scope applied exactly;
   `billing_core` / `billing_core_staging` denial asserted and interpreted per `T1-WU04` §3.4;
   `public.profiles` boundary frozen.
3. P9 — the scoped credential has been **proven** to serve every required production
   direct-Postgres operation, with positive control and deny probes, in a run recorded before the
   switch. Without P9 the removal is speculative, not verified.
4. The superseded Worker version id is captured and rollback-addressable (P2).
5. The replacement credential is present and correct — i.e. the resulting state is the *scoped-URL*
   state, never the *absent-URL* state (`db.ts:23-34` returns `null` when the URL is absent; §3 C2).

**Why the removal cannot precede P9:** `hub_web_app` is scoped to the minimum `public` privileges
the production direct-Postgres runtime needs (ruling §1; `T1-WU03` §4.1). If the owner credential is
removed before that scope is proven sufficient, the failure surfaces as production permission errors
on `public.products`, `public.product_assets`, or `public.product_installations` — the objects the
runtime actually uses. There is no ordering in which removing the working credential first is safe.

**Post-removal verification:** D3.3 — the runtime identity check must report the scoped role, the
required operations must succeed through the deployed runtime, and the resulting state must not be
the absent-URL state.

## 8. Citation provenance

| Citation pack section | Used in |
|---|---|
| A — two database access paths (`DATABASE_URL` path, PostgREST paths) | §3 (including C1/C2), §4 D3.1, §4 D3.3, §5 R1.3 |
| I — deployment/config facts (Worker, routes, secrets/no `vars`, script command forms) | §3, §4 D1.1-D1.3 (command forms via siblings), §4 D3.1, D3.2, §5 R1.2 |
| J — R15 authority (`PORTFOLIO_PRODUCTION_MASTER_PLAN.md:896`) | §2, §4 D1.1, §4 D1.4, §6 P5, §7 |

Sections B, C, D, E, F, G, H of the citation pack were **not** used by this lane, per this work
unit's authority. Non-pack references used are limited to: the governing ruling
`T1-RLS-DECISION-RECORD-2026-09-20.md` (§1, §3), and the sibling lane artifacts `T1-WU03`
(grant scope / positive-control targets) and `T1-WU04` (deny requirement, its command forms, and
finding F5), all referenced by path rather than re-derived.

## 9. Findings and unknowns (recorded, not resolved by this lane)

| # | Item | Status |
|---|---|---|
| U1 | The concrete owner pooler/connection-string form currently behind `DATABASE_URL` is **not carried by this lane's citation set** (§A records the read path and the env name, not the value form). The plan therefore names the credential by role identity ("the owner credential"), not by a URL literal. | **UNKNOWN — must be established at execution time** |
| U2 | The R15 role's provisioning SQL (role creation, grant, deny statements) is **not authored by this lane**; scope is owned by `T1-WU03` §4.1/§6 and `T1-WU04` §3/§4. | **OWNED ELSEWHERE — cross-referenced** |
| U3 | The exact Worker-secret-setting command form is **not carried by pack §I** (§I records that secrets exist and how they are read; it records only the `package.json` scripts `build`/`cf:deploy`/`test`/`check`). This plan states the switch step and its preconditions but does not supply the secret command. | **UNKNOWN — deploy authority must supply; do not invent** |
| U4 | Whether the transition window may open at all is governed by the R15 ordering constraint carried by `T1-WU04` §7 F5 (time-sensitivity of the deny evidence). This lane records the constraint by cross-reference and does not adjudicate it. | **AUTHORITY DECISION — not taken here** |
| U5 | The length of the rollback viability window — i.e. how long the owner credential is retained before rotation — is **not stated** in this lane's inputs. Before it closes, rollback is available; after it closes, rollback of the credential step is impossible. | **OWNER/PROVISIONING DECISION — not taken here** |
| F1 | Consequence of U5: **the rollback in §5 has an expiry.** It is stated as a time-bounded capability, not an unconditional guarantee. | **RECORDED CONSTRAINT** |
| F2 | If D0.3 (owner-credential retention) cannot be confirmed, the transition is **irreversible from the start**. Required disposition: **HOLD before D1.1** — not "proceed and hope". | **RECORDED GATE** |
| F3 | The switch and the role provisioning are **not atomic** with each other (separate control planes: database vs Worker secret + deploy). The plan therefore serialises them so that both credential paths are simultaneously valid across the change — no window in which neither works. | **RECORDED DESIGN CONSTRAINT** |
| F4 | A `42501` on `billing_core` is only meaningful paired with a passing positive control from the same run and session (`T1-WU04` §3.3). This plan inherits that rule for D2.2 and D3.3. | **RECORDED REQUIREMENT** |
| F5 | No citation in this artifact was re-derived or re-verified by this lane, and no citation-pack error is asserted. U1/U3 are gaps in **this lane's** supplied citation set, not claims of pack error. | **SCOPE STATEMENT** |

## 10. Declarations

- **Ordered deploy sequence with explicit preconditions present.** §4: Phase D0 (read-only
  pre-flight, D0.1–D0.4) -> Phase D1 (role posture, grants, denies, profiles boundary; D1.1–D1.4) ->
  Phase D2 (credential creation and pre-switch proof; D2.1–D2.2) -> Phase D3 (`DATABASE_URL` switch
  and post-switch acceptance; D3.1–D3.4) -> Phase D4 (close-out; D4.1–D4.2). Every step carries PRE,
  VERIFY, and MUTATES flags, and §6 restates the whole deploy gate as one list (P1–P10).
- **Rollback sequence present, returning to the prior credential/role state.** §5: Phase R1
  (restore the owner credential and the runtime; R1.1–R1.3) -> Phase R2 (revoke the exact grant set,
  then `DROP ROLE hub_web_app` under explicit preconditions, then verify the baseline; R2.1–R2.3) ->
  Phase R3 (record and reopen R15; R3.1), with four ordered invariants and an explicit statement
  that the rollback is **time-bounded** (F1).
- **Owner `DATABASE_URL` removal step with its precondition present.** §7: the removal is D3.1 (set
  the single `DATABASE_URL` secret to the `hub_web_app` credential) + D3.2 (deploy); its five
  preconditions are stated explicitly, and the reason the removal cannot precede the scoped-credential
  proof (P9) is stated.
- **Citations copied, not re-derived.** Every citation-pack reference above is copied from
  `T1-CITATION-PACK.md` sections **A, I, J** only, per this work unit's authority. No source file
  was re-read to produce this artifact and no citation was re-verified or re-derived by this lane.
- **No git provenance or revision check was run.** Per the work unit's explicit instruction, this
  lane did not run any git revision or provenance command; the revision named in the packet is taken
  as given.
- **No production mutation occurred.** This work unit produced **one documentation file** under
  `docs/platform/house-long-run/`. No database connection was opened; no role was created, altered,
  or dropped; no `GRANT` or `REVOKE` was issued; no schema or object was created; no migration was
  run; no Worker was deployed; no secret was set, read, printed, or required; and no file outside
  `docs/platform/house-long-run/` was written or modified.
- **No secret is required to record this plan.** Every step and command form in this document is
  expressed against role name `hub_web_app`, schema/object names from the sibling artifacts, and
  `<placeholder>` forms. No connection string, password, service-role key, or pooler URL appears in
  this artifact (see U1).
- **No execution performed.** No command in §4, §5, or §7 of this document was run. Every "expect:"
  line is a **proposed expectation of a future run**, not an observed result.
- **No approval is implied.** This is a normalized evidence-preparation record. It is not an
  authorization to execute the deploy, not a review PASS, and not a production-readiness claim. R15
  remains **open** until the transition is executed and its evidence recorded under independent
  review (`BUILD_PASS != PRODUCTION_READY != LIVE_PROVEN != OPERATED_STABLE`).
