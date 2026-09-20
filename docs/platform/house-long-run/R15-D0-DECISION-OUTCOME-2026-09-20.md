# R15 D0 — DECISION OUTCOME (Codex) + READY-TO-APPROVE BOUNDED AUTHORIZATION

Task: `WSTERA-HOUSE-PRODUCTION-CLOSURE-001` · Stage T5 · Work Unit R15 D0
Recorded: 2026-09-20 · Decision authority: `agent-codex` (Owner away; Owner directed this class of
decision to Codex) · Status: **BLOCKED pending bounded Owner authorization for schema remediation**

---

## 1. Verdict

**`OWNER_DECISION_REQUIRED`.**

Codex recommends authorizing a **bounded, separate** schema-remediation authorization, but rules that
execution **cannot proceed** under the existing grant, because the Owner's grant states *"No redesign or
expansion is authorized"* and applying migrations to production is a production schema mutation outside
that grant.

It confirmed the disposition taken (stopping rather than acting) was correct.

## 2. Codex answers, recorded

| # | Question | Codex answer |
|---|---|---|
| **A** | Authorize remediation? | **Yes — recommend a separate bounded authorization.** It must name: target = Project A only; only `0007` and additive `0008`; **no `db:push`**; **no `0002`–`0006`**; no touching billing schemas, roles, grants, RLS, secrets, Worker or Cloudflare; **stop immediately if dry-run or verification fails.** |
| **B** | Is the proposed path sound? | **Sound in principle, with corrections.** `0008` must create `installation_status`, `installation_source`, `product_installations`, its FKs to `products`/`profiles`, and the unique index `product_installations_event_unique`, matching `schema.ts:132`. Dry-run must be **per file** (`BEGIN→0007→assert→ROLLBACK`, then `BEGIN→0008→assert→ROLLBACK`). Apply `0007` then `0008`. Verify tables, columns, enums, indexes, FKs, then re-run the D0 probe. **Hand-authoring `0008` is acceptable** — it must simply be reviewed column-by-column against `schema.ts` — but **`drizzle-kit generate`/`migrate`/`db:push` against Project A is unsafe** while there is no `__drizzle_migrations` journal, because it would reconcile the entire schema including objects that belong elsewhere. |
| **C** | Any reason not to apply `0007`? | **None found.** Verified from the file: header targets the hub-web product database (explicitly not LAB/CONTROL), additive-only, `IF NOT EXISTS` on tables and indexes, duplicate-object handling on enums, no billing reference, no grants/revokes, no RLS mutation. Caveat: the dry-run must still confirm Postgres accepts every statement in one transaction and that schema/index/FK match `schema.ts`. |
| **D** | Must `0002`–`0006` stay out of Project A? | **Confirmed, do not apply.** All target WSTERA LAB & CONTROL, a different project. |
| **E** | Billing-deny disposition | **A** — proceed after the schema exists, recording the billing step as *"absence-invariant asserted; not a DENY PASS; mandatory re-verification when `billing_core` / `billing_core_staging` are created in Project A"*. **Not B** (LAB is SB01 dev/staging and hub-web has no connection path there). **Not C** (holding leaves the owner-credential runtime in place, and R15 is a standing security fix). **But A requires explicit Owner acceptance** before it may be adopted, because the Owner previously classified schema absence as INCONCLUSIVE/HOLD and forbade reinterpretation as DENY PASS. |
| **F** | What would exceed the current grant? | Applying `0007` to production; creating and applying `0008`; creating/mutating migration bookkeeping; committing the migration/evidence files; changing the billing-deny interpretation from HOLD to absence-invariant; and any product/fulfillment runtime acceptance beyond schema verification. **Within scope if done as planned:** read-only inspection, rolled-back dry-runs, post-apply catalog verification, re-running the D0 probe, and leaving billing schemas and WSTERA_LAB untouched. |

## 3. Blocking findings (Codex)

1. `product_installations` and the fulfillment tables do not exist in Project A.
2. `D1.2` therefore fails with `42P01`.
3. No `__drizzle_migrations` journal exists.
4. The current billing-deny position is not a valid DENY proof.
5. The schema remediation has no explicit Owner authorization.

## 4. Unsupported claims (Codex) — nothing may be asserted yet

No evidence that a not-yet-written `0008` will generate cleanly; no evidence that the `0007`/`0008`
dry-runs pass; no evidence that post-apply columns, indexes, FKs and enum values match; no valid
billing DENY evidence; no production-readiness or live-fulfillment proof.

## 5. READY-TO-APPROVE AUTHORIZATION TEXT

If the Owner approves, this is the bounded authorization Hermes proposes to operate under. It is
written so it can be approved as-is, and it stays strictly inside the reviewed matrices and the R15 plan.

> **OWNER DECISION — R15 SCHEMA REMEDIATION (BOUNDED)**
>
> Authorize the schema remediation required to unblock R15 D1, bounded to:
>
> **Target:** Project A (`coyelzlgukvpgguqpjdi`, hub-web product database) **only**.
>
> **Authorized actions, in this order:**
> 1. Apply `drizzle/migrations/0007_shared_one_time_fulfillment.sql` to Project A, after a
>    `BEGIN → statements → assertions → ROLLBACK` dry-run passes.
> 2. Create an additive migration `0008` from `drizzle/schema.ts` containing exactly:
>    `installation_status` and `installation_source` enum types, `public.product_installations` with
>    its columns, its foreign keys to `public.products` and `public.profiles`, and the unique index
>    `product_installations_event_unique`; then apply it to Project A after its own rolled-back
>    dry-run passes. Hand-authored DDL is acceptable provided it is verified column-by-column against
>    `schema.ts` before applying.
> 3. Verify tables, columns, enum values, indexes and foreign keys against `schema.ts`; re-run the
>    D0 topology probe; record the result.
> 4. Commit the new migration and the evidence to the House branch.
>
> **Explicitly NOT authorized:** `drizzle-kit generate` / `drizzle-kit migrate` / `npm run db:push`
> against Project A; applying `0002`–`0006` to Project A; creating or mutating any migration journal
> or bookkeeping table; creating `billing_core` / `billing_core_staging` in Project A; any change to
> roles, grants, RLS, secrets, the Worker, or Cloudflare; any product/fulfillment runtime acceptance
> beyond schema verification; any destructive or data-clearing operation.
>
> **Deny disposition accepted:** once the schema exists, R15 D1→D4 proceeds and the billing step is
> recorded as *"absence-invariant asserted; not a DENY PASS; mandatory re-verification when
> `billing_core` / `billing_core_staging` are created in Project A"* — never as a DENY PASS.
>
> **Stop rule:** if any dry-run or any verification fails, stop, preserve evidence, and do not patch
> forward outside this contract.

## 6. Current state (unchanged by D0 or by this decision)

Worker `00bdb1b5` live (authorised code-only deploy) · zone hardened · runtime `DATABASE_URL` still the
owner credential · `hub_web_app` does not exist · capabilities inert · **no role, grant, deny,
credential, secret, migration or deploy resulted from D0**. All rollback targets available.

**Nothing has been executed as a result of this decision.** It records a verdict and prepares the
authorization; it does not act on it.
