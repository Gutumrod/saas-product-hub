# T1 RLS DECISION RECORD — WSTERA-HOUSE-PRODUCTION-CLOSURE-001

Task ID: `WSTERA-HOUSE-PRODUCTION-CLOSURE-001`
Stage: T1 (R15 least-privilege preparation)
Review Batch: B1
Record type: **OWNER DECISION — BINDING**
Recorded: 2026-09-20 (Asia/Bangkok)
Owner: Free
Orchestrator: Hermes
Supersedes: the open question raised in `OWNER-HOLD-T1-RLS-DECISION-2026-09-20.md`

---

## 1. Owner decision (verbatim intent)

**Decision: OPTION 3 — APPROVED WITH EXPLICIT BOUNDARY.**

`hub_web_app` is the scoped **direct-Postgres application role only**.

For `public.profiles`:

- **KEEP RLS enabled.**
- **DO NOT** grant `BYPASSRLS` to `hub_web_app`.
- **DO NOT** create a `hub_web_app` RLS policy merely to make direct-Postgres profile access work.
- `hub_web_app` **must not require access to `public.profiles`** in the production runtime.
- Production authentication/profile synchronization continues through the **existing Supabase/PostgREST path**.
- Treat the direct-Postgres `context.ts -> db.upsertProfile/getProfileById` path as
  **non-production/local behavior**; it must not expand production privileges.

R15 least-privilege intent remains:

- `hub_web_app` has only the minimum public-object privileges actually required by the
  production direct-Postgres runtime
- no ownership
- no `CREATE`
- no escalating role membership
- **no `BYPASSRLS`**
- explicit deny on `billing_core`
- explicit deny on `billing_core_staging`
- owner `DATABASE_URL` removed from application runtime

## 2. Independent architecture verification performed by Hermes

The Owner-supplied architecture basis was re-verified against actual source at
revision `61dcdfcc07f8ae5edd493fcde61568e2ef0ca51d`. **All four claims verified true.**

| Claim | Verified evidence |
|---|---|
| production Cloudflare entry = `server/worker.ts` | `wrangler.jsonc:4` `"main": "server/worker.ts"`; routes `wstera.com`, `platform.wstera.com` at `:8-10` |
| production context = `server/_core/context.fetch.ts` | `server/worker.ts:4` `import { createContext } from "./_core/context.fetch.js"`; used at `worker.ts` `createContext: () => createContext({ req: request })` |
| profile synchronization = `server/_core/profileStore.ts` | `context.fetch.ts:4` imports `syncProfileFromSupabase`; used at `context.fetch.ts:16` as `resolveProfile` |
| local Express entry explicitly non-production | `server/_core/index.ts:94-95` — "Local dev entry (see package.json's 'dev' script). Production runs on Cloudflare Workers via server/worker.ts instead — this file isn't deployed." |

**Additional verification — the production path does not touch direct-Postgres `profiles`:**

- `db.upsertProfile` / `db.getProfileById` are called **only** from
  `server/_core/context.ts:48,54`.
- `context.ts` is imported only by `server/_core/index.ts:7` (the non-deployed local Express entry).
- The production context (`context.fetch.ts`) imports `context.js` **as a type only**
  (`import type { TrpcContext }`), so it does not execute the direct-Postgres profile path.
- Production profile reads/writes go through `profileStore.ts:27-62` via the Supabase PostgREST
  client (`_core/supabaseAdmin.ts`, service-role key) against the `profiles` table over the Data API.

**Production direct-Postgres object usage (what `hub_web_app` actually needs):**

| Object | Production operation | Evidence |
|---|---|---|
| `public.products` | SELECT, INSERT | `server/routers.ts:10-19` imports `getProductBySlug`, `listProducts`, `createProduct`; `webhooks/productEvents.ts:2` imports `getProductBySlug` |
| `public.product_assets` | SELECT, INSERT | `server/routers.ts:10-19` imports `createProductAsset`, `listProductAssets` |
| `public.product_installations` | SELECT, INSERT, UPDATE | `server/routers.ts:10-19` imports `createProductInstallation`, `listProductInstallations`, `updateProductInstallationStatus`; `webhooks/productEvents.ts:2` imports `recordProductInstallationFromWebhook` |
| `public.profiles` | **NOT USED in production** | no production-path caller; see above |

This confirms the Owner's boundary is consistent with the actual code: excluding
`public.profiles` from `hub_web_app` removes no production capability.

## 3. Consequence for the R15 package

- `public.profiles` is **excluded** from the `hub_web_app` grant set.
- RLS on `public.profiles` stays enabled and untouched. No new policy. No `BYPASSRLS`.
- The dev-only direct-Postgres profile path stays functional locally where a broader local
  credential is used; it is not a production privilege requirement and must not drive grants.
- `billing_core` and `billing_core_staging` must be explicitly denied.
- Owner `DATABASE_URL` must be removed from the application runtime in favour of the scoped role.

## 4. Resume instruction (Owner-authorized)

Resume T1 using the **Codex-authorized four write-only lanes** already recorded in
`OWNER-HOLD-T1-RLS-DECISION-2026-09-20.md`. **Do not rerun the completed inspection /
re-verification work.** Lane shape: `evidence_preparation`, `max_turns 8`, one small artifact
per lane, citations supplied in the packet, no re-verification burden on the writer:

1. public privilege matrix
2. billing-core deny matrix (`billing_core`, `billing_core_staging`)
3. deploy/rollback and verification plan
4. explicit RLS decision-gap record (this ruling)

Then proceed to **B1 independent review** under the locked LONG_RUN manifest.

## 5. Separate defect — acknowledged, explicitly non-blocking

The `hermes-native-swarm` aggregate false-PASS defect (aggregate lane state
`SWARM_WORK_UNIT_PASS` reported alongside `worker_report.state: FAIL`,
`commander_checks: []`, `artifacts: []`) is **acknowledged** and is tracked as a separate scoped
runtime defect.

**It MUST NOT block T1/House continuation.** The released Swarm skill is **not** modified inside
this House task.

## 6. Counters after this decision

```
Issue Fingerprint: SWARM_WORKER_TURN_BUDGET_EXHAUSTED_BEFORE_DELIVERABLE_WRITE
  (fingerprint confirmed correct by Codex; remedy = packet split, mandated above)
Local Fix Attempts: reset for the new packet shape (prior 2/2 applied to the oversized packets)
Reviewer Remediation Attempts: 0/2
Senior Escalations: 0/1
```
