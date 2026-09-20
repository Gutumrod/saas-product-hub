# T1 R15 RLS DECISION SUMMARY — B1 reviewer packet artifact

Work unit: `T1-WU06-RLS-DECISION-RECORD-ARTIFACT`
Correlation id: `house-t1-wu06-20260920`
Task ID: `WSTERA-HOUSE-PRODUCTION-CLOSURE-001`
Stage: T1 (R15 least-privilege preparation) — Review Batch B1
Artifact type: **evidence summary of an Owner ruling. Not a decision, not an approval.**

## Source-of-Truth References

Authoritative inputs for this summary (this artifact adds no new authority):

1. `docs/platform/house-long-run/T1-RLS-DECISION-RECORD-2026-09-20.md` — OWNER DECISION, BINDING
   (OPTION 3 — approved with explicit boundary).
2. `docs/platform/house-long-run/T1-CITATION-PACK.md` — section B (production vs local entry),
   section C (`public.profiles` and the direct-Postgres path), section G (RLS state on
   `public.profiles`).
3. `docs/platform/PORTFOLIO_PRODUCTION_MASTER_PLAN.md:896` — R15 authority (runtime connects as
   Project A `postgres` owner; correct state = dedicated `hub_web_app` login role scoped to exactly
   the `public` objects used — no ownership, no `CREATE`, no escalating membership).

Citation provenance as declared in the Citation Pack:
- Citations verified at revision `61dcdfcc07f8ae5edd493fcde61568e2ef0ca51d`
  (`T1-CITATION-PACK.md:6`), independent re-verification by `agent-codex` (`T1-CITATION-PACK.md:7`),
  architecture verification recorded in `T1-RLS-DECISION-RECORD-2026-09-20.md:42-45`.
- This summary was assembled at revision `1bf9d216ca33bde7eb46205302b0fee377e97f77`. Per the lane
  rule (`T1-CITATION-PACK.md:10-11`), citations were copied, not re-derived. No commit in the range
  `61dcdfc..1bf9d21` touched `apps/hub-web/server`, `apps/hub-web/wrangler.jsonc`, or
  `apps/hub-web/drizzle`, so the cited source lines are unchanged between the verification revision
  and the assembly revision.

---

## 1. Owner R15 RLS ruling (verbatim intent, from the decision record)

Source: `T1-RLS-DECISION-RECORD-2026-09-20.md:16-28`.

**Decision: OPTION 3 — APPROVED WITH EXPLICIT BOUNDARY.**

`hub_web_app` is the scoped **direct-Postgres application role only**.

For `public.profiles`:

- **KEEP RLS enabled.**
- **DO NOT** grant `BYPASSRLS` to `hub_web_app`.
- **DO NOT** create a `hub_web_app` RLS policy merely to make direct-Postgres profile access work.
- `hub_web_app` **must not require access to `public.profiles`** in the production runtime.
- Production authentication/profile synchronization continues through the **existing
  Supabase/PostgREST path**.
- Treat the direct-Postgres `context.ts -> db.upsertProfile/getProfileById` path as
  **non-production/local behavior**; it must not expand production privileges.

## 2. The five boundary rules

Consolidated statement of the ruling's operative boundaries, each with its recorded source:

| # | Boundary rule | Source |
|---|---|---|
| 1 | **Keep RLS** — `public.profiles` stays with RLS enabled and untouched | `T1-RLS-DECISION-RECORD-2026-09-20.md:22`, `:79` |
| 2 | **No `BYPASSRLS`** — `hub_web_app` is not granted `BYPASSRLS` | `T1-RLS-DECISION-RECORD-2026-09-20.md:23`, `:37`, `:79` |
| 3 | **No new policy** — no `hub_web_app` RLS policy is created to enable direct-Postgres profile access | `T1-RLS-DECISION-RECORD-2026-09-20.md:24`, `:79` |
| 4 | **No production profiles access** — `hub_web_app` must not require `public.profiles` in the production runtime; `public.profiles` is excluded from the grant set | `T1-RLS-DECISION-RECORD-2026-09-20.md:25`, `:71`, `:78` |
| 5 | **PostgREST remains the production path** — production authentication/profile synchronization continues through the existing Supabase/PostgREST path | `T1-RLS-DECISION-RECORD-2026-09-20.md:26`, `:61-62` |

Retained R15 least-privilege intent recorded alongside the ruling
(`T1-RLS-DECISION-RECORD-2026-09-20.md:30-40`): `hub_web_app` holds only the minimum public-object
privileges actually required by the production direct-Postgres runtime; no ownership; no `CREATE`;
no escalating role membership; no `BYPASSRLS`; explicit deny on `billing_core`; explicit deny on
`billing_core_staging`; owner `DATABASE_URL` removed from the application runtime.

## 3. The four verified architecture citations

Independent architecture verification by Hermes at revision
`61dcdfcc07f8ae5edd493fcde61568e2ef0ca51d`, recorded verbatim in
`T1-RLS-DECISION-RECORD-2026-09-20.md:42-52` (all four claims verified true). Citations as supplied
in `T1-CITATION-PACK.md` section B (`:28-38`):

| # | Verified claim | Citation(s) |
|---|---|---|
| 1 | Production Cloudflare entry = `server/worker.ts` | `apps/hub-web/wrangler.jsonc:4` — `"main": "server/worker.ts"`; routes `wstera.com`, `platform.wstera.com` at `apps/hub-web/wrangler.jsonc:8-10` |
| 2 | Production context = `server/_core/context.fetch.ts` | `apps/hub-web/server/worker.ts:4` — `import { createContext } from "./_core/context.fetch.js"`; used in the tRPC fetch handler as `createContext: () => createContext({ req: request })` |
| 3 | Profile synchronization = `server/_core/profileStore.ts` | `apps/hub-web/server/_core/context.fetch.ts:4` — imports `syncProfileFromSupabase`; used at `apps/hub-web/server/_core/context.fetch.ts:16` as `resolveProfile: async user => (client ? syncProfileFromSupabase(client, user) : null)` |
| 4 | Local Express entry explicitly non-production | `apps/hub-web/server/_core/index.ts:94-95` — "Local dev entry … Production runs on Cloudflare Workers via server/worker.ts instead — this file isn't deployed."; `apps/hub-web/server/_core/index.ts:7` — `import { createContext } from "./context.js"`, the only importer of the direct-Postgres context |

Supporting citation closing the production-path argument: production context imports the
direct-Postgres context **as a type only** — `apps/hub-web/server/_core/context.fetch.ts:3` —
so `context.ts` is not executed on the production path.

## 4. Production `public.profiles` does not use the direct-Postgres path

Source: `T1-CITATION-PACK.md` section C (`:40-50`) and
`T1-RLS-DECISION-RECORD-2026-09-20.md:54-74`.

- `apps/hub-web/server/db.ts:35` — `upsertProfile` definition; `apps/hub-web/server/db.ts:93` —
  `getProfileById` definition.
- Their only callers are `apps/hub-web/server/_core/context.ts:48` (`await db.upsertProfile({...})`)
  and `apps/hub-web/server/_core/context.ts:54` (`await db.getProfileById(data.user.id)`).
- `context.ts` is imported only by `apps/hub-web/server/_core/index.ts:7` — the non-deployed local
  Express entry.
- Production profile reads/writes run over PostgREST:
  `apps/hub-web/server/_core/profileStore.ts:27-62` (`client.from("profiles")`, select/update/insert)
  using the Supabase client `apps/hub-web/server/_core/supabaseAdmin.ts:9-21`.

**Conclusion to state (verbatim intent, `T1-CITATION-PACK.md:48-50`):** in production,
`public.profiles` is reached only through the Supabase PostgREST path (Path B), never through the
direct-Postgres path (Path A). Therefore the production direct-Postgres runtime does not require
`public.profiles`. Excluding `public.profiles` from `hub_web_app` removes no production capability
(`T1-RLS-DECISION-RECORD-2026-09-20.md:73-74`).

## 5. The direct-Postgres profiles path is non-production / local

Recorded ruling: the direct-Postgres `context.ts -> db.upsertProfile/getProfileById` path is
**non-production/local behavior** and must not expand production privileges
(`T1-RLS-DECISION-RECORD-2026-09-20.md:27-28`). The dev-only direct-Postgres profile path stays
functional locally where a broader local credential is used; it is not a production privilege
requirement and must not drive grants (`T1-RLS-DECISION-RECORD-2026-09-20.md:80-81`).

## 6. RLS state on `public.profiles` (decision context)

Source: `T1-CITATION-PACK.md` section G (`:83-89`).

- `apps/hub-web/drizzle/migrations/0001_rbac_roles.sql:22` —
  `ALTER TABLE profiles ENABLE ROW LEVEL SECURITY`
- `apps/hub-web/drizzle/migrations/0001_rbac_roles.sql:30-33` — `profiles_self_read` TO `authenticated`
- `apps/hub-web/drizzle/migrations/0001_rbac_roles.sql:36-45` — `profiles_internal_read` TO `authenticated`
- `apps/hub-web/drizzle/migrations/0001_rbac_roles.sql:48-52` — `profiles_service_write` TO `service_role`
- No `hub_web_app` policy exists anywhere.

This is the state rule 1 ("keep RLS") and rule 3 ("no new policy") leave unchanged.

---

## 7. Non-mutation statement

No production mutation occurred in producing this artifact.

Observed scope of this work unit's actions:
- read-only inspection of the repository (`git rev-parse`, `git merge-base --is-ancestor`,
  `git log`/`git diff --stat` over `apps/hub-web/**`, `ls`) and of the two input documents;
- one file write, confined to the allowed scope `docs/platform/house-long-run/`
  (`T1-R15-RLS-DECISION-SUMMARY.md`).

No database connection was opened. No SQL, DDL, `GRANT`, `REVOKE`, policy change, role change, or
`DATABASE_URL`/secret change was executed. No deployment, `wrangler deploy`, or migration was run.
The only filesystem change is the new documentation file named in this section.

## 8. Not claimed by this artifact

- This artifact does not approve the R15 package, the lanes, or any production-readiness claim.
- It records the Owner ruling and the supplied verified citations; it does not re-verify source code.
- It does not assert that the R15 grant package has been applied anywhere. Applying it is outside
  this work unit.
- Status of the R15 package remains subject to B1 independent review.
