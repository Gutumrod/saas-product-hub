# OWNER RULING — `user_role` EFFECTIVE PRIVILEGE (disposition A) — 2026-09-21

Task: `WSTERA-HOUSE-PRODUCTION-CLOSURE-001` · Stage T5 · Review Batch B5 re-review (post-R15)
Source: Owner ruling delivered 2026-09-21 (verbatim substance transcribed by Hermes)
Status: **BINDING** · Supersedes the open decision request in
`B5-RER15-OUTCOME-AND-USERROLE-DECISION-2026-09-21.md` §3

---

## Decision

**Disposition A — accepted.** The `user_role` `USAGE` is accepted as a **recorded PostgreSQL
effective-privilege exception**.

**Do not mutate the database for this item.** `REVOKE USAGE ON TYPE user_role FROM PUBLIC` must **not**
be executed under this task: it would be a new type-ACL mutation outside the reviewed R15 matrix and
would affect every role currently inheriting PUBLIC `USAGE` on `user_role`.

## The precise claim (Owner's wording — use verbatim)

> "The explicit grant set for `hub_web_app` equals the reviewed R15 matrix exactly, with no explicit
> grant beyond it. One effective privilege outside that explicit set exists: `USAGE` on
> `public.user_role`, inherited through PostgreSQL's PUBLIC default for that enum type. It was not
> granted by this task and does not confer access to `public.profiles`."

## Verified boundaries that must be preserved

| Boundary | State |
|---|---|
| No explicit `user_role` grant to `hub_web_app` | preserved — `user_role.typacl` is `null` |
| No table privilege on `public.profiles` | preserved — all seven privilege types absent |
| No `hub_web_app` RLS policy on `public.profiles` | preserved — zero policies |
| No `BYPASSRLS` | preserved — `rolbypassrls = false` |
| No `SUPERUSER` | preserved — `rolsuper = false` |
| No escalating membership | preserved — zero `pg_auth_members` rows |
| Production auth/profile sync stays on the approved Supabase/PostgREST path | preserved — no change |

## Wording corrections required, and applied

Every overbroad statement such as *"effective privileges equal the matrix and nothing more"* must
distinguish:

- **explicit grants = exact matrix**
- **effective privileges = exact matrix plus the recorded PostgreSQL PUBLIC-default exception on `user_role`**

Corrected in this ruling's sweep:

| File | Correction |
|---|---|
| `T1-R15-DEPLOY-ROLLBACK-PLAN.md:181` (the plan's own D1.2 verify step) | now reads **explicit** granted set, and carries the exception note with the ruling reference |
| `R15-D1-PROVISION-OUTPUT-2026-09-21.txt` | grant-step header now says *explicit grants*, with the effective-exception note |
| `R15-D1-VERIFY-OUTPUT-2026-09-21.txt` | table-privilege header now says *explicit set equals the exact matrix*, and points to the `user_role` note |
| `R15-D1-VERIFY-PROBE.mjs` (committed evidence source) | header aligned |

A document-wide sweep for the same phrasing class was run, not just these instances.

## Effect on stage state

- **B5 re-review** must now be re-run against this corrected exact state.
- **Only if B5 returns `BATCH_APPROVED`** → enter **T6** → complete **T6-WU01..03** → **B6**
  independent review → stop at **`READY FOR OWNER HOUSE CLOSURE REVIEW`**.
- **Do not infer `PRODUCTION_READY` or `OPERATED_STABLE` from this ruling alone.**

## What this ruling does not authorise

Anything beyond the wording correction and the B5 re-run. In particular: no database mutation, no
type-ACL change, no grant or revoke, no change to `hub_web_app`, `public.profiles`, RLS, roles or
memberships, and no readiness claim.
