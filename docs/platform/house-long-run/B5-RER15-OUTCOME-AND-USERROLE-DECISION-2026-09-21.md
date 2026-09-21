# B5 RE-REVIEW (post-R15) OUTCOME + OWNER DECISION REQUEST — `user_role` EFFECTIVE PRIVILEGE

Task: `WSTERA-HOUSE-PRODUCTION-CLOSURE-001` · Stage T5 · Review Batch **B5 re-review (post-R15 D0–D4)**
Reviewer: `agent-codex` (independent, **Windows Session-1** — readiness probe `CODEX_REVIEWER_READY`,
provenance_session 1) · Recorded: 2026-09-21 (Asia/Bangkok)

## 1. Verdict

**`OWNER_DECISION_REQUIRED`.**

Codex confirmed the R15 execution is largely correct and the evidence is coherent — schema, role
posture, grants, the switch, runtime identity and rollback all check out — but it will not approve
B5/T6 because of **one security-contract mismatch that my own D1 record already flags**:

> `R15-D1-VERIFY-OUTPUT-2026-09-21.txt:43-53` records `hub_web_app` effective `USAGE` on `user_role = true`
> via the PostgreSQL `PUBLIC` default, while `T1-R15-PUBLIC-PRIVILEGE-MATRIX.md:199-207` lists
> *"USAGE on the `user_role` enum type → (NO - belongs to excluded profiles)"*.

So my wording **"grant set equals the matrix and nothing more"** is true for **explicit ACLs** but not
for **effective privileges**. That is a real overclaim in my record, and Codex is right to hold on it.

## 2. What Codex verified as correct

- `0008` matches `drizzle/schema.ts`: `product_installations` 13 columns, 2 FKs, unique index, enum values.
- `0007` adds 5 fulfillment tables + 4 enums; with `0008` the catalog is 9 tables / 9 enums.
- No evidence of `db:push`, `0002`–`0006`, billing schema or WSTERA_LAB changes.
- Role posture, memberships, table grants, sequence grants and the profiles privilege absence match the record.
- OV-1 is accepted as proved (INSERT with real profile ids, no privilege on `profiles`).
- The `ALTER ROLE … SET search_path` revert is **sufficient**: `rolconfig = null`, other role attributes unchanged.
- Runtime identity and deployed version are recorded consistently — but as **operator-recorded evidence**,
  not independently re-queried live by the reviewer. (Recorded as such, not claimed stronger.)
- Rollback path documented and owner credential retained per P3; not yet executed.
- Billing disposition A is the Owner-approved exception — an **amended acceptance**, not a literal pass of
  the original manifest wording ("explicit DENY proof").

**T6: not yet permitted.** B6 must wait on: (1) this Owner ruling or a safe remediation + re-run of
D1/D2/D3 and a fresh B5, (2) the stale status documents (now fixed — see §5), (3) the root-worktree
untracked shared-runtime documents before final reconciliation.

## 3. The decision required from Owner — and new evidence I gathered for it

I investigated before escalating, so this is not a bare question:

| Fact | Measurement |
|---|---|
| `user_role.typacl` | **`null`** — no explicit ACL exists at all, so **nobody granted this** |
| `acldefault('T', owner)` | `[ '=U/postgres', 'postgres=U/postgres' ]` — i.e. **`=U` = PUBLIC has USAGE by PostgreSQL default for enum types** |
| Effective USAGE on `user_role` | `hub_web_app` true — **but also `anon`, `authenticated`, `service_role`, `postgres` all true** |
| Scope of a blanket revocation | Revoking PUBLIC's default would affect **every enum in `public`** (asset_type, installation_*, product_status, fulfillment_*) and **every role**, not just `hub_web_app` |

**A new, material fact:** the runtime **does** write `profiles.role`, whose type is `user_role` —
`apps/hub-web/server/db.ts:67-72` sets `values.role` / `updateSet.role` in `upsertProfile` (e.g.
`profile.role ?? "admin"` for the owner). Per the binding T1 ruling (OPTION 3), that direct-Postgres profile
path is the **non-production/local** path — production auth/profile sync goes through
`context.fetch.ts` → Supabase PostgREST. So the runtime *code* references the type, while the
*production* path does not use it.

**Three dispositions are conceivable, and the Owner forbade interpreting a security gate unilaterally:**

| | Disposition | Consequence |
|---|---|---|
| **A** | **Accept as a recorded PostgreSQL characteristic, not a grant.** Record `user_role` USAGE as an *effective-privilege exception arising from the PostgreSQL enum default*, name it explicitly as such, and **narrow the claim** to "the explicit grant set equals the matrix exactly; no explicit grant beyond it; one effective-USAGE exception exists via the PG PUBLIC default on enum types". No mutation. | Honest and zero-risk; the mismatch becomes a documented exception rather than an overclaim. |
| **B** | **Remediate**: revoke the PUBLIC default for `user_role` only (`REVOKE USAGE ON TYPE user_role FROM PUBLIC`), then re-verify. | Removes the exception **for every role**, not only `hub_web_app`, and diverges from the reviewed matrix (which grants no `REVOKE` step and does not authorise a type-level ACL change). It also touches an object the T1 ruling ties to `public.profiles`, which this task must not modify. Needs its own review. |
| **C** | **HOLD** and treat the matrix as unsatisfiable as written. | Leaves a documented contradiction in place; blocks T6 indefinitely. |

**Hermes does not choose.** My recommendation on the evidence is **A**, because the privilege is a
PostgreSQL default shared by every role (including `anon` and `service_role`), revoking it would change
a type ACL outside the reviewed matrix and affect unrelated roles, and the production runtime path does
not use `user_role` at all — while the claim wording still needs correcting either way.

## 4. My overclaim, corrected

The record said the grant set equals the matrix "and nothing more". That is true of **explicit ACLs**.
The precise statement is:

> The explicit grant set equals the reviewed matrix exactly, with no explicit grant beyond it. One
> **effective** privilege exists that the matrix lists as excluded — `USAGE` on the `user_role` enum —
> and it arises from **PostgreSQL's default privilege for enum types (PUBLIC `USAGE`)**, not from any
> grant made by this task. The same default applies identically to `anon`, `authenticated`,
> `service_role` and `postgres`.

## 5. Already fixed from this review

The TASK checkpoint had stale fields (named Worker `00bdb1b5` and candidate `679ff27` while D4 records
`9a004fa9` on `4071307`). Corrected: current Worker `9a004fa9-53be-400b-a1ea-c52263faacbc` from
`4071307`, with `00bdb1b5` then `9db4fb70` recorded as rollback-addressable, and the pre-remedy review
candidate kept only as labelled history.

## 6. Still open for B6 / Owner House closure

Capability activation · Control request correlation · Owner-authenticated surfaces · synthetic
fulfillment E2E · the billing re-verification trigger · stability evidence. **No `PRODUCTION_READY`,
`OPERATED_STABLE` or final House closure claim may be made.**

## 7. Current state (unchanged by this review)

Worker `9a004fa9` live · runtime identity `hub_web_app` · schema 9/9 tables and 9/9 enums · both
capabilities inert · owner credential retained and valid · rollback available and not triggered.
