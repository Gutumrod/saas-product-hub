# T1 — SCOPE CONTRACT AND PRODUCTION-TRUTH DEPENDENCY CLOSURE

Task: `WSTERA-CONTROL-TRUTH-SYNC-001` · Work unit `T1-WU01-SCOPE-CONTRACT-DEPENDENCY-CLOSURE`
Correlation id: `wstera-cts-001-t1-wu01-20260921` · Role class: `inspection`
Workflow: `WF-DEV-01 v1.3.0 / LONG_RUN` · Stage: **T1**
Worker profile: `swarm-inspector` · Model/provider: `deepseek-v4.1-flash:cloud` / `ollama-cloud`

This document is a **read-only inspection and design specification**. The architecture is already
locked by the Brief; nothing here proposes a new architecture and nothing here is delegated as an
architecture decision.

Inspection root: `D:/AI-Workspace/projects/saas-product-hub/apps/hub-web` at
`407130718646d13630b9789f68522a521fc74483` (worktree clean, `git status --porcelain=v1` empty).
Every line reference below was read from that revision in this work unit.

Declared boundaries of this unit
- **No file was modified** other than this specification document.
- **No commit and no push** occurred.
- **No migration was applied and no database was touched.** Section 5 is a design only. No `.sql`
  file was created; `db:push` was never run; no SQL client, `psql`, Supabase client, or Wrangler
  deploy command was invoked.
- **No secret store was read** and no secret value appears anywhere in this document.
- This document does not approve itself. Stage verification belongs to the commander.

---

## 1. Locked work-scope contract

This section restates the Brief's locked contract **exactly**. Source:
`docs/platform/house-long-run/BRIEF-WSTERA-CONTROL-TRUTH-SYNC-AND-PRODUCTION-MOCK-REMOVAL-2026-09-21.md`
§5 (`:93-107`), read in this unit.

Brief `:95` (verbatim): `Do not overload Product identity to represent House/Platform work.`

Brief `:97` (verbatim): `Introduce an explicit work-scope identity in the event/normalized/RPC/storage path:`

| # | Brief line | Locked clause (verbatim from the Brief) |
|---|---|---|
| 1 | `:98` | `- `scopeType`: one of `product \| house \| platform \| workflow_infrastructure \| shared_runtime`.` |
| 2 | `:99` | `- `scopeKey`: stable non-secret identifier for non-product scope; Product scope may derive/use the canonical Product identity.` |
| 3 | `:100` | `- Product-scoped work MUST retain canonical immutable `productCode + productId` and fail closed on unknown/conflicting identity.` |
| 4 | `:101` | `- Non-product scope MUST carry no Product code/id and MUST carry an explicit non-product `scopeType + scopeKey`.` |
| 5 | `:102` | `- Missing Product identity without explicit non-product scope remains ambiguous and MUST fail closed.` |
| 6 | `:103` | `- Backward compatibility: existing canonical Product events may remain valid without forcing a breaking sender migration, but no new ambiguous unscoped task may be accepted.` |
| 7 | `:104` | `- Persist scope additively; do not repurpose `product_code`.` |
| 8 | `:105` | `- Preserve event idempotency, exact revision N→N+1, atomic ingestion, Owner Inbox effect identity, HMAC verification, and existing Product identity immutability.` |

The five `scopeType` values, in the Brief's own order and casing, are therefore exactly:

```
product | house | platform | workflow_infrastructure | shared_runtime
```

Brief `:107` (verbatim): `Implementation may refine column/field names only if the same semantics and acceptance contract are preserved and the change is revision-bound in review.`

Contract derived from the eight clauses above, stated as the contract this stage must satisfy
(each clause is the Brief clause it comes from):

1. `scopeType` MUST be present and MUST be one of the five values above.
2. For `scopeType = product`: canonical immutable `productCode + productId` MUST be present and MUST
   resolve through the canonical registry authority; unknown or conflicting identity MUST fail closed.
3. For the four non-product `scopeType` values (`house`, `platform`, `workflow_infrastructure`,
   `shared_runtime`): `scopeKey` MUST be a present, stable, non-secret identifier, and the record
   MUST carry no Product code and no Product id.
4. A task with no Product identity AND no explicit non-product scope MUST fail closed (this is the
   ambiguous case, not an implicit non-product case).
5. Persistence is additive; `product_code` is **not** repurposed and is not deleted or renamed.
6. Existing canonical Product events stay valid without a breaking sender migration.
7. The following existing invariants are unchanged by this contract: exact-body HMAC verification,
   event-id idempotency, event-id/payload conflict detection, exact revision N→N+1, atomic
   single-transaction ingestion, Owner Inbox effect identity by `source_event_id`, and Product
   identity immutability once established.

---

## 2. Event schema change map

File: `apps/hub-web/server/control-plane/work-event-schema.ts` (225 lines, read in this unit).

| Line | Observed text | Required change |
|---|---|---|
| `:39` | `export const taskPayloadSchema = z.object({` | Add the scope carrier on the task payload: `scopeType` (enum of the five locked values) and `scopeKey` (bounded trimmed string), both optional at parse time and normalised to an explicit decision by the normalizer. |
| `:89` | `  productCode: z.string().trim().max(20).optional().nullable(),` | In `agentActivityEventSchema`, keep `productCode` unchanged and add the same optional `scopeType`/`scopeKey` pair. |
| `:101` | `  productCode: z.string().trim().max(20).optional().nullable(),` | In `workTrackingEventSchema`, same additive change. |
| `:121` | `export interface CanonicalWorkRecord {` | The canonical record must carry the resolved scope: add `scopeType` and `scopeKey` fields alongside the existing `productCode`/`productId`/`identityState`. |
| `:124` | `  productCode: CanonicalProductCode \| null;` | Unchanged (retained, never repurposed). |
| `:125` | `  productId: string \| null;` | Unchanged. |
| `:126` | `  identityState: IdentityState;` | Unchanged in meaning; the new scope state is resolved in addition to it, not in place of it. |
| `:166`–`:169` | `const taskInfo =` / `eventData.event === "agent.activity"` / `? eventData.taskProjection` / `: eventData.task;` | No structural change: the scope carrier rides on the same `taskInfo` object for both event families. |
| `:179` | `  const { productCode, productId, identityState } = resolveProductIdentity(eventData.productCode);` | This single resolution expression is the change site. It must become a scope resolution that (a) keeps the existing `resolveProductIdentity` result for the product branch, and (b) resolves the non-product branch from `scopeType + scopeKey` without touching `eventData.productCode`. |
| `:192`–`:215` | `const normalizedWork: CanonicalWorkRecord = {` … | Add the resolved `scopeType`/`scopeKey` to the constructed record; do not remove or rename any existing field. |
| `:217`–`:222` | `return {` / `success: true,` / `event: eventData,` / `normalizedWork,` / `normalizedRecord: normalizedWork,` | Unchanged shape; the additional fields travel inside `normalizedWork`. |
| `:225` | `export const parseAndNormalizeWorkEvent = parseAndNormalizeIncomingEvent;` | Unchanged alias. |

Observed parsing behaviour that constrains the change (verified by command, not assumed):
`grep -n "\.strict()" server/control-plane/work-event-schema.ts` returned **no matches**
(exit 1), so neither event schema is `strict`. Under zod's default object behaviour an unknown key
such as a sender-supplied `scopeType` is **silently stripped today** rather than rejected. That is
why the contract must be enforced by the schema + normalizer, not by a request-shape assertion, and
why a sender that already emits scope fields gets no error today — it gets them dropped.

---

## 3. Identity handling change map

File: `apps/hub-web/server/control-plane/identity.ts` (54 lines, read in this unit).

This file is the canonical Product Identity Authority. Its stated rules (`:7-11`) include
`:10` `- If identity is missing or ambiguous, preserve product_code = null with identity_state = unresolved.`
and `:11` `- Never invent, infer or derive a Product code.`

| Line | Observed text | Required change |
|---|---|---|
| `:28` | `export type IdentityState = "canonical" \| "unresolved";` | Extend the state vocabulary so a non-product scope is a first-class resolved state rather than being coerced into `unresolved`. The existing two values and their meaning for the product branch must remain unchanged. |
| `:30`–`:34` | `export interface ResolvedProductIdentity {` / `  productCode: CanonicalProductCode \| null;` / `  productId: string \| null;` / `  identityState: IdentityState;` / `}` | Add the resolved scope to the resolution result (or add a sibling resolver that returns it) without changing the meaning of the three existing fields. |
| `:36` | `export function resolveProductIdentity(code?: string \| null): ResolvedProductIdentity {` | Kept as the **product-branch** authority. Its fail-closed behaviour is preserved exactly; the new scope decision must call it rather than bypass it. |
| `:37`–`:39` | `if (!code \|\| typeof code !== "string") {` / `return { productCode: null, productId: null, identityState: "unresolved" };` | Preserved. This is the branch that must now be disambiguated against an explicit non-product scope instead of terminating the decision. |
| `:41`–`:51` | `if (CANONICAL_PRODUCT_CODES.has(normalized)) {` … `return {` / `productCode: normalized as CanonicalProductCode,` / `productId: product.productId,` / `identityState: "canonical",` | Preserved exactly. The canonical registry lookup (`generated-product-registry.ts:25,31,37,43,49,55,61` — `"productId": "prd_…"` entries) remains the only authority for the product branch. |
| `:52`–`:53` | `// Strict non-negotiable rule: Never infer or invent.` / `return { productCode: null, productId: null, identityState: "unresolved" };` | Preserved exactly. An unknown or retired product code must still never be promoted, and must still fail closed at the ingestion gate (section 4). |

Required decision table (all five rows are new-or-preserved behaviour the contract demands; the
fail-closed rows are the existing behaviour that must survive):

| Incoming | Required outcome |
|---|---|
| canonical `productCode` present, registry match | product scope; `productCode` + `productId` retained; accepted |
| `productCode` present but not in the canonical registry | fail closed (unchanged) |
| `productCode` present and canonical but DB `productId` disagrees | fail closed (unchanged, `product_identity_conflict`) |
| `productCode` absent + explicit non-product `scopeType` + non-empty `scopeKey` | non-product scope; null Product code/id; accepted |
| `productCode` absent + no explicit non-product scope | fail closed as ambiguous (unchanged 422) |
| non-product `scopeType` + a Product code/id present | fail closed (no Product identity in a non-product scope) |
| `scopeType = product` + no `productCode` | fail closed (product scope demands canonical identity) |

---

## 4. Webhook ingestion change map

File: `apps/hub-web/server/webhooks/agentEvents.ts` (223 lines, read in this unit).
Route: `POST /api/webhooks/agent-events`, exact-body HMAC-SHA256 verified at `:109`
(`const isValid = await verifySignature(rawBody, signatureHeader, ENV.agentEventsHmacSecret);`) —
this line is **not** changed by the scope contract.

| Line | Observed text | Required change |
|---|---|---|
| `:119` | `  const normalized = parseAndNormalizeIncomingEvent(payload);` | Unchanged call; the new scope arrives inside `normalized`. |
| `:131` | `  // Product-scoped work is canonical only with an explicit registered identity.` | Comment must be widened to state the full scope contract; the guarantee it describes is retained. |
| `:133`–`:138` | `if (normalizedWork && normalizedWork.identityState !== "canonical") {` / `return {` / `status: 422,` / `body: { error: "unresolved product identity", eventId },` | This is the change site. It must become a three-way scope gate: product+canonical → continue; explicit non-product scope with no Product identity → continue with null Product identity; anything else (missing Product identity with no explicit non-product scope, unknown/conflicting Product identity, non-product scope carrying Product identity, `scopeType = product` without `productCode`) → fail closed **before any durable write**, preserving the existing 422 semantics and the existing error-code family. |
| `:140`–`:143` | `if (!db) {` / `if (ENV.isProduction) {` / `return { status: 503, body: { error: "Control datastore unavailable" } };` | Unchanged — this is the existing production-empty/no-substitution behaviour and it is the model to preserve. |
| `:174`–`:182` | `const auditPayload = normalizedWork` / `? {` / `        ...eventData,` / `        canonicalIdentity: {` / `          productCode: normalizedWork.productCode,` / `          productId: normalizedWork.productId,` / `        },` | Additive: the audit payload must also carry the resolved scope so the stored event envelope is self-describing. Existing `canonicalIdentity` sub-object stays. |
| `:187` | `  const { data, error } = await (db as any).rpc("ingest_agent_work_event_atomic", {` | Unchanged call; parameter list grows additively (section 5). |
| `:196`–`:197` | `    p_product_code: normalizedWork?.productCode ?? null,` / `    p_identity_state: normalizedWork?.identityState ?? null,` | Kept **as-is** for the product branch (`product_code` is not repurposed). Add `p_scope_type` / `p_scope_key` arguments. |
| `:69`–`:97` | `function mapRpcError(error: RpcErrorLike): AgentEventResult {` | Add the new fail-closed error tags (scope ambiguity / non-product-carrying-product-identity) to the non-retryable mapping; existing `revision_conflict` `:71`, `concurrency_conflict` `:74`, `event_id_payload_conflict` `:77` and `product_identity_invalid`/`product_identity_conflict` `:83` branches are unchanged. |

The same handler is invoked from **two** runtime entry points, both of which must keep working and
neither of which is changed by this contract:
- `server/worker.ts:29`–`:32` — `if (url.pathname === "/api/webhooks/agent-events" && request.method === "POST") {` … `const result = await handleAgentEventPayload(rawBody, signature, getControlDb() ?? undefined);`
- `server/_core/index.ts:26`–`:31` — the local-dev Express route with the same call shape.

Evidence that the agent-events endpoint is reachable in the deployed Worker: `wrangler.jsonc:4`
`  "main": "server/worker.ts",` and `wrangler.jsonc:9-10` bind `wstera.com` and
`platform.wstera.com` as custom domains.

---

## 5. Additive migration and RPC design

**Status of this section: DESIGN ONLY. No migration is applied. No `.sql` file was created by this
work unit. No database was contacted, no SQL was executed, no `db:push` was run, and no live
migration is qualified. The design below is a proposal for T2 (`swarm-db` qualification) and is not
an applied change.**

Existing state the design must extend additively (all read in this unit):

- `drizzle/migrations/0002_control_plane_schema.sql:19-37` — `CREATE TABLE IF NOT EXISTS work_queue_items (` … ends with `updated_at timestamptz NOT NULL DEFAULT now()`.
- `drizzle/migrations/0003_work_tracking_truth_pipeline.sql:25-37` — `ALTER TABLE work_queue_items` with `ADD COLUMN IF NOT EXISTS product_code varchar(20),`, `identity_state varchar(30) NOT NULL DEFAULT 'unresolved',`, `control_status varchar(50),`, `execution_state varchar(50) NOT NULL DEFAULT 'queued',` and the rest of the truth-pipeline columns.
- `drizzle/migrations/0006_canonical_product_id_work_truth.sql:26-30` — `ALTER TABLE public.work_queue_items` / `ADD COLUMN IF NOT EXISTS product_id varchar(100);` plus `work_queue_product_id_idx`.
- `drizzle/migrations/0006_canonical_product_id_work_truth.sql:32-50` — the current RPC signature `CREATE OR REPLACE FUNCTION public.ingest_agent_work_event_atomic(` with 17 parameters ending `p_owner_inbox_description text`.
- `drizzle/migrations/0006_canonical_product_id_work_truth.sql:69-78` — the current Product-scope gate:
  `:70` `  IF v_task_id IS NOT NULL THEN`, `:71` `    IF p_identity_state IS DISTINCT FROM 'canonical'`, `:72` `       OR p_product_code IS NULL`, `:73` `       OR v_product_id IS NULL`, `:75` `       OR v_product_id !~ '^prd_[0-9a-f]{32}$' THEN`, `:76` `      RAISE EXCEPTION 'product_identity_invalid: task=% code=%', v_task_id, p_product_code;`
- `drizzle/migrations/0006_canonical_product_id_work_truth.sql:122-138` — existing-task immutability (`:126` `      IF v_existing_work.product_id IS NOT NULL AND (` … `:130` `        RAISE EXCEPTION 'product_identity_conflict: task=% existing_code=% incoming_code=%',`).
- `drizzle/migrations/0006_canonical_product_id_work_truth.sql:142-145` — `:142` `      IF v_incoming_rev <> v_existing_work.revision + 1 THEN` / `:143` `        RAISE EXCEPTION 'revision_conflict: current=% incoming=% expected=%',`
- `drizzle/migrations/0006_canonical_product_id_work_truth.sql:152-176` — the UPDATE write path (`:159` `product_code = p_product_code,` / `:160` `product_id = v_product_id,` / `:161` `identity_state = p_identity_state,`).
- `drizzle/migrations/0006_canonical_product_id_work_truth.sql:194-210` — the INSERT write path (same columns at `:205`).
- `drizzle/migrations/0006_canonical_product_id_work_truth.sql:229-250` — Owner Inbox effect creation keyed by `source_event_id` (`:233` `      WHERE source_event_id = p_event_id;`), with the unique partial index established by `drizzle/migrations/0005_atomic_work_event_rpc.sql:27-34`.
- `drizzle/migrations/0006_canonical_product_id_work_truth.sql:265-288` — the executable privilege block: `REVOKE EXECUTE … FROM PUBLIC;` (`:265`), `FROM anon;` (`:271`), `FROM authenticated;` (`:276`), `GRANT EXECUTE … TO service_role;` (`:285`). **Any signature change re-creates the function and must re-issue this whole block with the new arity.**

### 5.1 Proposed additive schema change (design only)

Proposed migration file name for T2 (not created in this unit): `drizzle/migrations/0009_work_scope_identity.sql`.

```
-- DESIGN ONLY — NOT WRITTEN, NOT APPLIED
ALTER TABLE public.work_queue_items
  ADD COLUMN IF NOT EXISTS scope_type varchar(30),
  ADD COLUMN IF NOT EXISTS scope_key  varchar(200);

CREATE INDEX IF NOT EXISTS work_queue_scope_idx
  ON public.work_queue_items (scope_type, scope_key);
```

Additivity requirements this design must satisfy:
1. `product_code` and `product_id` are neither renamed, dropped, nor repurposed (Brief `:104`). The
   existing columns remain the product-branch storage.
2. Both new columns are nullable, so every pre-existing row remains valid without a rewrite in the
   same statement.
3. `scope_type` MUST carry a DB-level constraint restricted to the five locked values (the Brief's
   five-value vocabulary), so a non-product scope cannot silently hold an arbitrary string.
4. A row-level consistency constraint is required so these states are impossible in storage:
   `scope_type = 'product'` with null `product_code`; and any non-product `scope_type` with a
   non-null `product_code` or `product_id`.
5. No `NOT NULL DEFAULT` on the new columns: a default would silently fabricate a scope for rows
   whose true scope is not yet decided.

### 5.2 Proposed backfill rule (design only)

Existing rows already carry `product_code` and `product_id` (`0006:159-160,205`) and were only
admitted while `p_identity_state = 'canonical'` (`0006:71`). The design therefore proposes, as a
**separate and explicitly reviewed statement in the same migration**:

```
-- DESIGN ONLY — NOT WRITTEN, NOT APPLIED
UPDATE public.work_queue_items
   SET scope_type = 'product'
 WHERE scope_type IS NULL
   AND product_code IS NOT NULL
   AND product_id IS NOT NULL
   AND identity_state = 'canonical';
```

Rows that do not satisfy that predicate keep `scope_type IS NULL`, which the design treats as the
**unresolved/legacy state** and not as a valid new-write state. No legacy row is deleted, rewritten
in any other column, or assigned a fabricated non-product scope. Whether this backfill is included
at all, and whether legacy unresolved rows are to be surfaced or left untouched, is an open question
recorded in section 10.

### 5.3 Proposed RPC change (design only)

`CREATE OR REPLACE FUNCTION public.ingest_agent_work_event_atomic(...)` gains two parameters,
additively, after `p_owner_inbox_description`:

```
  p_scope_type text,
  p_scope_key  text
```

Required semantics inside the function (design):

1. Replace the single product-only gate at `0006:70-78` with the three-way decision:
   - `p_scope_type = 'product'` → the existing gate applies unchanged
     (`p_identity_state = 'canonical'` AND `p_product_code IS NOT NULL` AND `v_product_id IS NOT NULL`
     AND the code match AND the `^prd_[0-9a-f]{32}$` shape check).
   - `p_scope_type IN ('house','platform','workflow_infrastructure','shared_runtime')` →
     require `p_scope_key` non-null and non-empty, require `p_product_code IS NULL`,
     require `v_product_id IS NULL`, require `p_identity_state` not `canonical`.
   - anything else (null `p_scope_type`, `p_scope_type = 'product'` without product identity,
     or product identity present with a non-product scope) → `RAISE EXCEPTION` with a new
     non-retryable tag, aborting the whole transaction.
2. The UPDATE (`0006:152-176`) and INSERT (`0006:194-210`) statements gain
   `scope_type = p_scope_type` / `scope_key = p_scope_key` in the same column position pattern.
3. The existing-task immutability check (`0006:126-138`) must be extended to scope: once
   `scope_type` is established on a task it is immutable; a later event may not move a task from
   product scope to non-product scope or between non-product scopes, and may not attach a Product
   identity to a non-product task.
4. The revision rule (`0006:142-145`) and the concurrency CAS (`0006:176-182`) are untouched:
   exact N→N+1 only, one atomic transaction.
5. Idempotency and event-id/payload conflict detection (`0006:85-114`) are untouched.
6. Owner Inbox effect identity (`0006:229-250`, index from `0005:27-34`) is untouched: one effect
   per `source_event_id`.
7. `SECURITY DEFINER` with `SET search_path = pg_catalog, public` (`0006:52-53`) is preserved, and
   the full REVOKE/GRANT block (`0006:265-288`) is re-issued with the new 19-parameter signature
   so execution stays restricted to the Supabase backend `service_role` only.
8. No `RETURNING`-style fabricated success: the function's success return remains
   `jsonb_build_object('ok', true, 'deduplicated', …)` (`0006:93,113,256`).

**Design-only declaration.** None of 5.1, 5.2 or 5.3 exists on disk. This section is a specification
input for `swarm-db` qualification at T2, which under the Run Manifest must qualify the migration
independently with **no live apply** (`RUN-MANIFEST-WSTERA-CONTROL-TRUTH-SYNC-001.md:114`), and live
application may only happen at T6 after independent review and the explicit Owner production
checkpoint (`:187-197`).

---

## 6. Work Queue mapping and test change map

### 6.1 Work Queue mapping — `apps/hub-web/server/control-plane/work-queue-router.ts` (435 lines, read in this unit)

| Line | Observed text | Required change |
|---|---|---|
| `:24` | `export type TruthMode = "live" \| "live_empty" \| "stale" \| "degraded" \| "simulation" \| "demo_fallback";` | Retain the union but make `simulation`/`demo_fallback` unreachable from the production path (section 7). The Work Queue already returns `degraded` in production; `:24` must not be the type that lets a production response be typed `simulation`. |
| `:39`–`:69` | `export interface WorkQueueItem {` … `  productCode: CanonicalProductCode \| null;` `:47` … `  productId: string \| null;` `:48` … `  identityState: IdentityState;` `:49` … | Add `scopeType` / `scopeKey` to the mapped shape. |
| `:71` | `export function mapDbItem(row: Record<string, unknown>): WorkQueueItem {` | The single mapping change site. |
| `:77`–`:83` | `  const dbProductCode = typeof row.product_code === "string" ? row.product_code : null;` … `  const resolvedIdentity = resolveProductIdentity(dbProductCode);` … `  const canonicalIdentityMatches =` `:80` … `    resolvedIdentity.productId === dbProductId;` `:83` | Extend the mapping so a row with an explicit non-product `scope_type` + `scope_key` and null product identity maps as an explicit **non-product scope** instead of collapsing to `unresolved`. The `canonicalIdentityMatches` conjunction at `:80-83` is unchanged for product rows. |
| `:93`–`:95` | `    productCode: canonicalIdentityMatches ? resolvedIdentity.productCode : null,` / `    productId: canonicalIdentityMatches ? dbProductId : null,` / `    identityState: canonicalIdentityMatches ? "canonical" : "unresolved",` | Preserved for product rows: an unknown or mismatched product identity still maps to null/null/`unresolved` and is never promoted. The new scope fields are mapped from the new columns. |
| `:119` | `const SIMULATION_WORK_ITEMS: WorkQueueItem[] = [` | Test-only fixture. May remain only outside the production dependency closure (section 7). |
| `:180`–`:198` | `      if (!db) {` / `        // Strict guardrail: In production, never return simulation rows` / `        if (ENV.isProduction) {` … `            mode: "degraded" as TruthMode,` `:186` … `          mode: "simulation" as TruthMode,` `:196` | **This is the model to preserve.** Production already refuses simulation; the non-production branch keeps fixtures. |
| `:211`–`:218` | `      if (error) {` / `        // Production error: NEVER return demo rows. Return degraded mode.` … `          mode: "degraded" as TruthMode,` | Preserved. |
| `:221`–`:227` | `      if (!data \|\| data.length === 0) {` … `          mode: "live_empty" as TruthMode,` | Preserved. |
| `:246`–`:247` | `        if (ENV.isProduction) return null;` / `        return SIMULATION_WORK_ITEMS.find(i => i.id === input.id) ?? null;` | Preserved pattern; the non-production fixture branch stays test-only. |
| `:258`–`:279` | `        if (ENV.isProduction) {` … `            mode: "degraded" as TruthMode,` `:266` … `          mode: "simulation" as TruthMode,` `:277` | Preserved. |
| `:363`–`:382` | `        if (ENV.isProduction) {` / `          return { ok: false, error: "Control database not available in production", mode: "degraded" as const };` `:365` … `        return { ok: true, id: input.id, newStatus: input.status, revision: item.revision, mode: "simulation" as const };` `:382` | Preserved. |
| `:385`–`:433` | `      // Blocker R3: Atomic Compare-and-Swap (CAS) on id AND expectedRevision` … `.eq("revision", input.expectedRevision)` `:398` | Untouched: optimistic concurrency and revision CAS are contract invariants. |

Type propagation note: the client types the router through `client/src/lib/trpc.ts:2`
`import type { AppRouter } from "../../../server/routers";`, so adding fields to `WorkQueueItem`
is a compile-time-visible change on the client and must be handled in the same revision.

### 6.2 Test change map

Test runner: `vitest.config.ts:17` `    include: ["server/**/*.test.ts", "server/**/*.spec.ts"],`

| File | Lines read | Change required |
|---|---|---|
| `server/control-plane/work-event-schema.test.ts` | `:1-70` | `:33-56` currently asserts that a **random, unlisted** product code is accepted at parse time with `identityState` `unresolved` (`:52`). That parse-level expectation stays true; the new tests must add the non-product cases (explicit scope accepted; scope + product identity rejected; neither → rejected at the ingestion gate, not at parse). |
| `server/control-plane/work-queue-router.test.ts` | `:1-186` | `:53-80` asserts the unresolved-identity row maps to null product identity. That row must now be distinguished from an explicit non-product row, so a new case must prove a non-product row maps with its `scopeType`/`scopeKey` and still null Product identity. `:82-103` (mismatched canonical id fails closed) must keep passing unchanged. `:106-173` concurrency cases unchanged. |
| `server/control-plane/work-truth-migration.test.ts` | `:1-41` | `:16-22` asserts the migration contract strings (`ADD COLUMN IF NOT EXISTS product_id varchar(100)`, `product_id = v_product_id`, `product_identity_conflict`). These stay; new assertions must cover the additive scope columns, the five-value constraint, and the new RPC parameters. `:32-40` privilege assertions (`) FROM PUBLIC;` `:36`, `) FROM anon;` `:37`, `) FROM authenticated;` `:38`, `) TO service_role;` `:39`) must be extended to the new signature arity. |
| `server/webhooks/agentEvents.test.ts` | `:1-45`, `:150-170` | `:157-166` proves an unresolved identity is rejected with 422 and `db.rpc` not called (`:165` `    expect(db.rpc).not.toHaveBeenCalled();`). This is the fail-closed case that must be extended, not weakened: new cases are (a) explicit non-product scope reaches the RPC, (b) ambiguous task still rejects before any write, (c) non-product scope carrying a product code rejects. |
| `server/control-plane/identity.test.ts` | `:41-62` | `:41-61` locks null/undefined/empty/whitespace → `unresolved`. Those exact expectations must survive unchanged; the non-product resolution is additive and must not change any of them. |
| `server/control-plane/control-plane.test.ts` | `:1-62`, `:155-200`, `:205-250`, `:336-348` | `:48-62` declares `BILLING_ACTION_SAFE_MODULES` including `server/control-plane/fixtures/demo-data.ts` `:55` and `server/control-plane/repositories/demo-repository.ts` `:56`; `:177-178` asserts those two modules are in the billing-action import closure; `:243-244` asserts `new DemoControlPlaneRepository()` and `new DemoCommandExecutor(repo)` are present in source. These assertions must be rewritten in T3 when the demo default is removed — they currently **require** the demo closure to exist. |
| `server/control-plane/wstera-rbac.test.ts` | `:35-70` (read), `:47,52,57,62` (grep) | `:47,52,57,62` assert `expect(result.mode).toBe("simulation");` for owner/operator/support/admin listing the work queue. Those assertions change when the production/non-production fallback behaviour is re-typed. |
| `server/control-plane/control-plane.test.ts` | `:223`, `:342` | `expect(overview.mode).toBe("simulation");` (and `:224` `      expect(overview.banner).toContain("SIMULATION");`) — these pin the Overview simulation contract and must change in T3. |
| `client/src/pages/PlatformControlPlane.tsx` | `:483, :496, :509, :520` | Four `?? "simulation"` defaults — see section 7.5. |

---

## 7. Production demo dependency closure

This section enumerates the **exact** production dependency closure that must be broken, each entry
with the file and line read in this unit. "Production entry" is the deployed Worker:
`wrangler.jsonc:4` `  "main": "server/worker.ts",`.

### 7.1 The production import chain (why the demo code is reachable at all)

| Step | File:line | Observed text |
|---|---|---|
| 1 | `server/worker.ts:5` | `import { appRouter } from "./routers.js";` |
| 2 | `server/routers.ts:4` | `import { controlPlaneService } from "./control-plane/service.js";` |
| 3 | `server/control-plane/service.ts:14` | `import { DemoControlPlaneRepository } from "./repositories/demo-repository.js";` |
| 4 | `server/control-plane/repositories/demo-repository.ts:17-30` | `import {` … `} from "../fixtures/demo-data.js";` (`:30`) |

Every module in that chain is in the deployed Worker bundle. There is no lazy/dynamic import on the
path: all four are static top-level `import` statements.

### 7.2 Demo repository default

| File:line | Observed text | Effect |
|---|---|---|
| `server/control-plane/service.ts:25` | `    private repo: ControlPlaneRepository = new DemoControlPlaneRepository(),` | The **constructor default** of `ControlPlaneService` is the demo repository. Any construction without an explicit repo yields demo data. |
| `server/control-plane/service.ts:395` | `export const controlPlaneService = new ControlPlaneService();` | The module-level singleton is constructed with that default, i.e. with `new DemoControlPlaneRepository()`. |
| `server/control-plane/service.ts:169`–`:170` | `      mode: "simulation",` / `      banner: "SIMULATION — No production systems connected",` | `getOverview()` hard-codes the simulation truth mode and banner on its return value. |
| `server/control-plane/contracts.ts:48` | `  mode: "simulation";` | The response type itself has no other mode for `PlatformOverviewResponse`; there is no live/empty/degraded branch to select. |
| `server/control-plane/repositories/demo-repository.ts:33` | `export class DemoControlPlaneRepository implements ControlPlaneRepository {` | Implements the full repository interface `server/control-plane/repositories/repository.ts:18-71` entirely from in-memory fixtures. |
| `server/control-plane/repositories/demo-repository.ts:50`–`:52` | `  constructor() {` / `    // Deep clone everything to guarantee complete state isolation across tests` / `    this.products = DEMO_PRODUCTS.map(p => ({ ...p }));` | Every dataset is cloned from the `DEMO_*` fixtures. |

### 7.3 Demo command executor

| File:line | Observed text | Effect |
|---|---|---|
| `server/control-plane/commands/command-service.ts:11` | `import { DemoCommandExecutor } from "./demo-command-executor.js";` | Static import on the command path. |
| `server/control-plane/commands/command-service.ts:26` | `  private executor: DemoCommandExecutor;` | The field type is the demo executor; there is no executor interface and no injection point. |
| `server/control-plane/commands/command-service.ts:33` | `    this.executor = new DemoCommandExecutor(repo);` | Unconditional construction — no production branch. |
| `server/control-plane/commands/demo-command-executor.ts:8` | `export class DemoCommandExecutor {` | The executor class itself. |
| `server/control-plane/commands/demo-command-executor.ts:31`–`:33` | `    const outcomeOverride =` / `      command.simulationOutcome \|\|` / `      (command.payload?.simulationOutcome as "success" \| "failure" \| "timeout" \| undefined);` | Caller-supplied simulation outcome is honoured on the production executor path. |
| `server/control-plane/commands/demo-command-executor.ts:35`–`:44` | `    if (outcomeOverride === "failure") {` … `        message: "SIMULATION: Command failed by deterministic failure injection rule.",` `:38` … `      throw new Error("SIMULATION_TIMEOUT: Command timed out after 30000ms deadline.");` `:43` | Deterministic fake failure/timeout injection. |
| `server/control-plane/commands/demo-command-executor.ts:236`–`:261` | `      case "RETRY_PAYMENT": {` … `            message: \`SIMULATED payment recovery: …\`, `:258` | A payment-shaped command returns fabricated success. |
| `server/control-plane/commands/demo-command-executor.ts:294`–`:299` | `      default:` / `        return {` / `          outcome: "failed",` | Unknown action types fail closed — preserved. |
| `server/control-plane/commands/command-service.ts:144`–`:154` | `    if (result) {` / `      const finalStatus = result.outcome === "failed" ? "FAILED" : "SUCCEEDED";` | Executor outcome `"changed"` becomes terminal `SUCCEEDED`; with the demo executor that success is fabricated. |

### 7.4 Router fallbacks that can resolve to simulation or demo_fallback in production

`server/routers.ts:106`, `:110`, `:114`, `:120`, `:154`, `:158`, `:189`, `:193` expose
`overview`, `customersTree`, `tenantDetails`, `executeTenantAction`, `billingData`,
`executeBillingAction`, `operationsData`, `runDiagnostics` — all `adminProcedure` — and all delegate
to the `controlPlaneService` singleton (`routers.ts:107,111,117,133-134,155,168,172,190,196`).
`simulationOutcome: z.enum(["success", "failure", "timeout"]).optional(),` at `routers.ts:127` is a
client-supplied simulation switch on `executeTenantAction` (wired at `:141`).

The four Control truth routers have **no** production guard — verified by command: grepping
`simulation|demo_fallback|isProduction` in the three files below returns only the fallback lines and
**no `isProduction` check** in any of them.

| File:line | Observed text | Mode returned |
|---|---|---|
| `server/control-plane/owner-inbox-router.ts:51` | `const DEMO_INBOX_ITEMS: OwnerInboxItem[] = [` | demo fixture set |
| `server/control-plane/owner-inbox-router.ts:109`–`:112` | `        let items = [...DEMO_INBOX_ITEMS];` … `        return { items, pendingCount: DEMO_INBOX_ITEMS.filter(i => i.status === "pending").length, mode: "simulation" as const };` | `simulation` (DB absent) |
| `server/control-plane/owner-inbox-router.ts:118`–`:122` | `      if (error) {` … `        return { items, pendingCount: DEMO_INBOX_ITEMS.filter(i => i.status === "pending").length, mode: "demo_fallback" as const };` | `demo_fallback` (DB error) |
| `server/control-plane/owner-inbox-router.ts:133` | `      if (!db) return DEMO_INBOX_ITEMS.find(i => i.id === input.id) ?? null;` | demo item |
| `server/control-plane/owner-inbox-router.ts:148`–`:152` | `      if (!db) {` … `        return { ok: true, id: input.id, selectedOption: input.selectedOption, status: "decided" as InboxItemStatus, mode: "simulation" as const };` | **simulation success on `decide`** |
| `server/control-plane/owner-inbox-router.ts:171`–`:173` | `        const item = DEMO_INBOX_ITEMS.find(i => i.id === input.id);` … `        return { ok: true, id: input.id, status: "acknowledged" as InboxItemStatus, mode: "simulation" as const };` | **simulation success on `acknowledge`** |
| `server/control-plane/owner-inbox-router.ts:5` | ` * Fallback: demo simulation when control DB env vars are absent.` | documented fallback |
| `server/control-plane/agent-activity-router.ts:80`–`:82` | `      if (!db) {` / `        return { items: [], total: 0, mode: "simulation" as const };` | `simulation` |
| `server/control-plane/agent-activity-router.ts:90`–`:92` | `      if (error) {` / `        return { items: [], total: 0, mode: "demo_fallback" as const };` | `demo_fallback` |
| `server/control-plane/agent-activity-router.ts:99`–`:101` | `    if (!db) {` / `      return { total: 0, byAgent: {}, mode: "simulation" as const };` | `simulation` |
| `server/control-plane/agent-activity-router.ts:103`–`:105` | `    if (error \|\| !data) {` / `      return { total: 0, byAgent: {}, mode: "demo_fallback" as const };` | `demo_fallback` |
| `server/control-plane/agent-activity-router.ts:6` | ` * no browser-exposed credentials). Fallback: empty list with mode "simulation"` | documented fallback |
| `server/control-plane/portfolio-gates-router.ts:43`–`:45` | `    if (!db) {` / `      return { items: [], total: 0, mode: "simulation" as const };` | `simulation` |
| `server/control-plane/portfolio-gates-router.ts:53`–`:55` | `    if (error \|\| !data) {` / `      return { items: [], total: 0, mode: "demo_fallback" as const };` | `demo_fallback` |
| `server/control-plane/adapters/product-health-adapter.ts:17` | `  /** True if health was derived from a live check; false if simulated/demo */` | simulated/demo health flag |
| `server/control-plane/adapters/product-health-adapter.ts:60` | `// Returns health status derived from the demo/control-plane heartbeat model.` | demo heartbeat model |

Work Queue, by contrast, is already strict (section 6.1: `work-queue-router.ts:182-189, 211-218,
258-269, 363-366`) — production returns `degraded`/empty and never demo rows. Per Brief `:73` this is
the model to preserve.

### 7.5 UI mode defaults that can resolve to simulation or demo_fallback

| File:line | Observed text | Effect |
|---|---|---|
| `client/src/pages/PlatformControlPlane.tsx:483` | `              mode={workQueueQuery.data?.mode ?? "simulation"}` | missing/loading data ⇒ `simulation` |
| `client/src/pages/PlatformControlPlane.tsx:496` | `              mode={ownerInboxQuery.data?.mode ?? "simulation"}` | missing/loading data ⇒ `simulation` |
| `client/src/pages/PlatformControlPlane.tsx:509` | `              mode={agentActivityQuery.data?.mode ?? "simulation"}` | missing/loading data ⇒ `simulation` |
| `client/src/pages/PlatformControlPlane.tsx:520` | `              mode={portfolioGatesQuery.data?.mode ?? "simulation"}` | missing/loading data ⇒ `simulation` |
| `client/src/components/control-plane/WorkQueueTab.tsx:30` | `  mode: "live" \| "live_empty" \| "stale" \| "degraded" \| "simulation" \| "demo_fallback";` | prop type admits simulation |
| `client/src/components/control-plane/WorkQueueTab.tsx:114` | `      {mode === "simulation" && (` | renders the SIMULATION banner |
| `client/src/components/control-plane/AgentActivityTab.tsx:22` | `  mode: "live" \| "simulation" \| "demo_fallback";` | prop type admits simulation |
| `client/src/components/control-plane/AgentActivityTab.tsx:90` | `          ⚠ {mode === "demo_fallback" ? "DEGRADED" : "SIMULATION"} — Control datastore not connected. No live activity shown.` | renders SIMULATION/DEGRADED text |
| `client/src/components/control-plane/OwnerInboxTab.tsx:34` | `  mode: "live" \| "simulation" \| "demo_fallback";` | prop type admits simulation |
| `client/src/components/control-plane/OwnerInboxTab.tsx:108` | `          ⚠ {mode === "demo_fallback" ? "DEGRADED" : "SIMULATION"} — Control datastore not connected. Showing demo/sample state, NOT production data.` | renders SIMULATION/DEGRADED text |
| `client/src/components/control-plane/PortfolioGateTab.tsx:24` | `  mode: "live" \| "simulation" \| "demo_fallback";` | prop type admits simulation |
| `client/src/components/control-plane/PortfolioGateTab.tsx:76` | `          ⚠ {mode === "demo_fallback" ? "DEGRADED" : "SIMULATION"} — no production gate state is being claimed.` | renders SIMULATION/DEGRADED text |
| `client/src/components/control-plane/OverviewTab.tsx:72` | `            ⚠ SIMULATION (In-Memory Demo)` | hard-coded badge text |
| `client/src/components/control-plane/BillingTab.tsx:32` | `        ⚠ SIMULATION SANDBOX — Actions execute in-memory simulation only. No real payment gateway or banking network is contacted.` | advisory banner |

Required direction (from the Brief `:72` and `:171`, and the manifest `:144`): no production UI may
default an unknown/missing mode to `simulation`; the missing/loading state must resolve to a
non-live truth mode (`degraded`/`not_connected`/`empty`), and the banner text must distinguish
LIVE / EMPTY / DEGRADED / BLOCKED.

### 7.6 Fixture imports (complete inventory)

Command: `grep -rn "fixtures" --include=*.ts --include=*.tsx server client shared scripts` (excluding
`node_modules`). Observed result — **one** non-test importer:

```
server/control-plane/repositories/demo-repository.ts:30:} from "../fixtures/demo-data.js";
```

`find server client -type d -name fixtures` (excluding `node_modules`) returned exactly one
directory: `server/control-plane/fixtures`. The single fixture file is
`server/control-plane/fixtures/demo-data.ts` (25092 bytes) exporting, at these lines:

```
:18   export const DEMO_PRODUCTS: Product[] = [
:119  export const DEMO_CUSTOMERS: Customer[] = [
:162  export const DEMO_TENANTS: Tenant[] = [
:311  export const DEMO_SUBSCRIPTIONS: Subscription[] = [
:436  export const DEMO_PAYMENTS: Payment[] = [
:505  export const DEMO_INTEGRATIONS: Record<number, Integration[]> = {
:602  export const DEMO_HEALTH_SNAPSHOTS: HealthSnapshot[] = [
:682  export const DEMO_ERROR_EVENTS: ErrorEvent[] = [
:705  export const DEMO_INCIDENTS: Incident[] = [
:721  export const DEMO_FEATURE_FLAGS: FeatureFlag[] = [
:756  export const DEMO_AUDIT_LOGS: AuditEvent[] = [
:772  export const DEMO_SUPPORT_CASES: SupportCase[] = [
```

Test-side references (string literals / test imports, not production runtime):
`server/control-plane/control-plane.test.ts:10` (import of the demo repository),
`:46` (`DEMO_EXECUTOR_SOURCE`), `:55` (`"server/control-plane/fixtures/demo-data.ts"`),
`:56` (`"server/control-plane/repositories/demo-repository.ts"`), `:177`–`:178` (closure assertions).

**Closure conclusion.** The fixture set is production-reachable today *only* through
`demo-repository.ts:30`, which in turn is reachable *only* through `service.ts:14` + `service.ts:25`
+ `service.ts:395`. Breaking the default at `service.ts:25`/`:395` removes the entire fixture set
from the production dependency closure in one place; the Owner Inbox fallback fixture
(`owner-inbox-router.ts:51`) is a **separate** in-file fixture set that must be handled in the same
stage.

---

## 8. Owner decision write path and poll/ack integration points

### 8.1 Current Owner decision write path (exact, as it exists)

Locked target: Brief `:111` `Use a server-mediated, audited return path. Hermes MUST NOT receive direct Control DB owner/service-role credentials.`

| Step | File:line | Observed text |
|---|---|---|
| 1. UI decision control | `client/src/pages/PlatformControlPlane.tsx:499` | `              onDecide={(id, optionId) => inboxDecideMutation.mutate({ id, selectedOption: optionId })}` |
| 2. Mutation wired to tRPC | `client/src/pages/PlatformControlPlane.tsx:155` | `  const inboxDecideMutation = trpc.controlPlane.ownerInbox.decide.useMutation({` |
| 3. Router entry + owner-only gate | `server/control-plane/owner-inbox-router.ts:138`–`:145` | `  decide: wsteraOwnerProcedure` … `        selectedOption: z.string().trim().min(1).max(100),` |
| 4. Write | `server/control-plane/owner-inbox-router.ts:156`–`:161` | `      const { data, error } = await (db.from("owner_inbox_items") as any)` / `        .update({ status: "decided", selected_option: input.selectedOption, decision_note: input.note ?? null, decided_at: now, updated_at: now })` / `        .eq("id", input.id)` / `        .eq("status", "pending")` / `        .select("id")` / `        .maybeSingle();` |
| 5. Result | `server/control-plane/owner-inbox-router.ts:163` | `      return { ok: true, id: (data as { id: string }).id, selectedOption: input.selectedOption, status: "decided" as InboxItemStatus, mode: "live" as const };` |
| 6. Owner UI acknowledge | `server/control-plane/owner-inbox-router.ts:166`–`:182` | `  acknowledge: wsteraOwnerProcedure` … `.update({ status: "acknowledged", updated_at: new Date().toISOString() })` `:177` |
| 7. Owner-only tier | `server/_core/trpc.ts:75`–`:85` | `export const wsteraOwnerProcedure = t.procedure.use(` … `if (!ctx.user \|\| !hasRole(ctx.user.role, WSTERA_OWNER_ROLES))` `:79`; roles at `:16` `const WSTERA_OWNER_ROLES = ["admin", "wstera_owner"] as const;` |
| 8. Storage | `drizzle/migrations/0002_control_plane_schema.sql:51`–`:65` | `CREATE TABLE IF NOT EXISTS owner_inbox_items (` … `decision_options  jsonb,` `:59` / `selected_option   varchar(255),` `:60` / `decision_note     text,` `:61` / `decided_at        timestamptz` `:64` |
| 9. Task linkage | `drizzle/migrations/0002_control_plane_schema.sql:58` | `  work_queue_item_id uuid REFERENCES work_queue_items(id) ON DELETE SET NULL,` |
| 10. Effect identity | `drizzle/migrations/0005_atomic_work_event_rpc.sql:27`–`:34` | `ALTER TABLE public.owner_inbox_items` / `  ADD COLUMN IF NOT EXISTS source_event_id text;` + `CREATE UNIQUE INDEX IF NOT EXISTS uq_owner_inbox_source_event_id … WHERE source_event_id IS NOT NULL;` |

**Observed absence of a return path.** Two commands were run to establish this, both negative:

```
grep -n "work_queue_items|rpc(|ingest_|productCode|product_code" server/webhooks/productEvents.ts   → no matches for work_queue/rpc/ingest
grep -rn "consumed|acknowledged_at|ack_by|decision_consumed" drizzle/migrations/                    → no matches
grep -rn "decisions|decision-poll|agent-only|X-Agent-Signature|poll" server/ --include=*.ts (excl. tests)
   → only: owner-inbox-router.ts:2 (doc comment), server/fulfillment/vendor/audit-store-pg.ts:16 (doc comment),
     server/worker.ts:31 and server/_core/index.ts:30 (the existing agent-events signature header),
     server/_core/trpc.ts:74 (doc comment)
```

So: there is **no** consumption column, **no** consumption metadata, and **no** poll endpoint in the
current code. This matches Brief `:77` (GAP-C): the `decide` write exists but no verified command/API
exists for Hermes to poll/consume/acknowledge those decisions.

### 8.2 Proposed agent-only poll and acknowledge integration points

Proposed shapes only — no route, handler, or migration is created in this unit.

| # | Integration point | Proposed surface | Constraint it must satisfy |
|---|---|---|---|
| 1 | Route dispatch | New `if` branch in `server/worker.ts` next to the existing handler at `server/worker.ts:29`; mirror branch in `server/_core/index.ts:26` for local dev so both runtimes keep behaviour parity. | Both entry points already exist for agent-events, so the pattern is proven in-bundle. |
| 2 | Poll endpoint | `POST /api/agent/owner-decisions/poll` — body carries the requesting canonical task/root task identity; returns decided, unconsumed decisions for that task/root only. | Brief `:116` `3. A bounded agent-only decision poll endpoint returns decided, unconsumed decisions for the requesting canonical task/root task.` |
| 3 | Acknowledge endpoint | `POST /api/agent/owner-decisions/ack` — acknowledges consumption **after** Hermes has persisted decision evidence locally. | Brief `:119` `6. Hermes acknowledges consumption only after local persistence; Control records consumption metadata without erasing the original decision.` |
| 4 | Authentication | Agent-only, domain-separated from browser auth. The existing agent-events signature (`X-Agent-Signature`, `server/worker.ts:31`) must **not** be replayable against this endpoint. | Brief `:120` `7. Poll/ack authentication must be agent-only and domain-separated from browser auth. Reuse of the existing HMAC secret is allowed only with endpoint-specific/domain-separated signing so an agent-events signature cannot be replayed against the decision endpoint.` |
| 5 | Distinct secret/domain binding | A separate runtime binding name from `AGENT_EVENTS_HMAC_SECRET` (declared today at `server/_core/env.ts:27` `  get agentEventsHmacSecret() { return getRuntimeEnvString("AGENT_EVENTS_HMAC_SECRET"); },`), or an explicitly domain-prefixed signing string. | Same clause as #4. |
| 6 | Consumption metadata | Additive columns on `owner_inbox_items` (e.g. consumption marker + consumed-at + consuming agent identity). Must not overwrite `status`, `selected_option`, `decision_note`, `decided_at`. | Brief `:119` ("without erasing the original decision"). |
| 7 | Task/root binding for reads | Must join `owner_inbox_items.work_queue_item_id` (`0002:58`) → `work_queue_items.task_id` / `root_task_id` (`0003:34` `  ADD COLUMN IF NOT EXISTS root_task_id varchar(100),`). | Brief `:180` `- polling only returns decisions authorized for the requesting canonical task/root.` |
| 8 | Fail-closed cases | wrong task/root, stale revision, tampered signature, unsupported option → refuse. | Brief `:183` `- wrong-task, stale, tampered or unsupported-option decisions fail closed.`; manifest `:176-183`. |
| 9 | Authorisation tier | The new endpoints are **outside** `wsteraOwnerProcedure`/`wsteraInternalProcedure` (`server/_core/trpc.ts:62,75`) because those are browser-session role tiers, not agent identity. | Brief `:191` `- Decision return path uses agent-only domain-separated authentication; browser session cannot impersonate Hermes and Hermes credential cannot be used as Owner UI authority.` |

### 8.3 Hermes credential boundary

**Hermes receives no direct database credential.**

- Brief `:111`: `Hermes MUST NOT receive direct Control DB owner/service-role credentials.`
- Brief `:121`: `8. No direct database credential is introduced into Hermes.`
- Manifest `:178`: `- Hermes has no Control DB owner/service-role credential.`
- Brief `:137` (non-goal): `- No owner/service-role DB credential in Hermes, repo, logs or evidence.`
- The Control DB is reachable only inside the Worker: `server/control-plane/adapters/control-db.ts:13-21`
  builds the client from Worker runtime bindings
  (`ENV.wsteraControlSupabaseUrl` / `ENV.wsteraControlSecretKey`, declared at
  `server/_core/env.ts:39-40`). Those values are Worker `getRuntimeEnvString` bindings
  (`server/_core/env.ts:1` `import { getRuntimeEnvString } from "./runtime-env.js";`) and are not part
  of any Hermes-side configuration in this repository.
- Consequence for design: Hermes reaches a decision **only** over the authenticated agent HTTP
  surface in 8.2. No DB connection string, service-role key, or Postgres client is introduced on the
  Hermes side by this contract. Any proposal that requires one must be rejected as out of contract.

---

## 9. Backward compatibility proof for canonical Product events

Claim: adding the explicit work-scope contract does not break existing canonical Product events and
does not require a breaking sender migration.

Evidence, each step read from the pinned revision:

1. **The existing product-carrier is already optional and nullable.**
   `work-event-schema.ts:101` `  productCode: z.string().trim().max(20).optional().nullable(),`
   (work-tracking events) and `work-event-schema.ts:89` (agent-activity events). A canonical sender
   that supplies `productCode` parses exactly as before; a sender that supplies nothing also still
   parses, so today's acceptance set is unchanged by adding further optional fields.

2. **Unknown keys are currently stripped, not rejected, so adding fields cannot break old payloads.**
   `grep -n "\.strict()" server/control-plane/work-event-schema.ts` → exit 1, no matches. Neither
   schema is strict. Old senders that omit `scopeType`/`scopeKey` therefore behave identically; new
   fields are additive schema surface, not a request-shape tightening.

3. **Canonical product resolution is unchanged.**
   `work-event-schema.ts:179` `  const { productCode, productId, identityState } = resolveProductIdentity(eventData.productCode);`
   calls `identity.ts:36` whose registry branch (`:41-51`) returns
   `productCode`/`productId`/`identityState: "canonical"` from
   `generated-product-registry.ts` (`:25,31,37,43,49,55,61` hold `"productId": "prd_…"`).
   No line in that path changes meaning.

4. **Existing canonical Product events remain acceptable at the ingestion gate.**
   The current gate `agentEvents.ts:133-138` rejects only `identityState !== "canonical"`. A canonical
   product event passes it. The new contract must keep that exact pass condition for
   `scopeType = product`; the added rejections are only for the new invalid combinations (scope-type
   mismatch and non-product-scope-with-product-identity), none of which a canonical Product event can
   produce. Therefore the set of previously-accepted canonical Product events is still accepted.

5. **Existing stored canonical Product rows remain correctly mapped.**
   `work-queue-router.ts:80-83` builds `canonicalIdentityMatches` from `identity_state === "canonical"`
   AND a registry match AND `resolvedIdentity.productId === dbProductId`. Rows written by the current
   RPC were only admitted with `identity_state = 'canonical'` and a non-null `product_id`
   (`0006:71-78` gate; `0006:159-160` / `:205` writes), so those rows satisfy the predicate today
   and continue to map to `canonical`. The new `scope_type`/`scope_key` columns are read additionally;
   nothing in the existing three-line mapping (`:93-95`) changes for them.

6. **Product identity immutability is preserved, not relaxed.**
   `0006:126-132` rejects a changed code or id once `product_id` is established;
   `0006:133-138` rejects a changed `product_code` when a legacy row already has a code. The new
   scope immutability rule (5.3 item 3) is an **additional** guard on the new columns and does not
   weaken either existing check.

7. **"No new ambiguous unscoped task may be accepted" is already true, and stays true.**
   Today: a task with no resolvable product code normalizes to `identityState = "unresolved"`
   (`identity.ts:37-39,53`) and is rejected before any durable write by `agentEvents.ts:133-138`
   with HTTP 422 (`:135`), proven by the existing test
   `server/webhooks/agentEvents.test.ts:157-166` (`:163` `    expect(result.status).toBe(422);`,
   `:165` `    expect(rpc).not.toHaveBeenCalled();`). After the change, that rejection must remain for
   the ambiguous case and become an acceptance **only** when an explicit non-product
   `scopeType + scopeKey` is present. The ambiguity rule is therefore tightened-or-equal, never
   loosened.

8. **Preserved invariants (Brief `:105`), each with its existing anchor.**
   - exact-body HMAC: `agentEvents.ts:109` (+ `:48-67`).
   - event idempotency and event-id/payload conflict: `0006:85-114` (`:91` `      RAISE EXCEPTION 'event_id_payload_conflict: event_id=%', p_event_id;`).
   - exact revision N→N+1: `0006:142-145`, `:187-189`.
   - atomic ingestion in one transaction: `0006:32-50` (single function, `SECURITY DEFINER`) with all effects committed or rolled back together.
   - Owner Inbox effect identity: `0006:229-250` + `0005:27-34`.
   - Product identity immutability: `0006:122-138`.

Non-claim attached to this proof: this is a **static source-level compatibility argument at
`4071307`**. It is not a runtime proof and no test was executed by this unit; the executable proof
belongs to T2 (`RUN-MANIFEST-…001.md:118-127` required cases, `:115` tester work unit).

---

## 10. Open questions and risks

Every item below is something this unit could **not** resolve from the pinned revision or that
carries a decision reserved to a later stage or to the Owner. None is resolved here.

| # | Type | Item | Why it is unresolved |
|---|---|---|---|
| Q1 | Open question | Exact storage encoding of the non-product scope key: single `scope_key` text column vs. `scopeType`-qualified key (e.g. repo+branch+task for `workflow_infrastructure`) | Not decidable from source; the Brief fixes `scopeType`/`scopeKey` semantics (`:98-99`) but not the key's composition. Requires T2 revision-bound design. |
| Q2 | Open question | Whether the backfill in 5.2 is in scope for the same migration as 5.1 | Both options are additive; the choice changes review surface. Owner/reviewer boundary. |
| Q3 | Open question | Disposition of legacy rows whose `scope_type` stays NULL (rows with a code but no `product_id`, or with neither) | `0006:133-138` shows code-without-id legacy rows are tolerated today, so such rows can exist. How they are surfaced in the UI is a product-surface decision, not an inspection result. |
| Q4 | Open question | Whether the scope carriers live on the task payload (`taskPayloadSchema`) or on the event envelope (next to `productCode`) or both | Both placements are technically possible at `work-event-schema.ts:39,89,101`; the Brief does not fix the placement. Requires an architecture decision already locked elsewhere — not delegated to this unit. |
| Q5 | Open question | Consumption-metadata column names and whether acknowledgement is a status transition or a separate field | Brief `:119` forbids erasing the original decision but does not name the fields. T5 design boundary. |
| R1 | Risk | The existing acceptance test suite actively **requires** the demo closure. `control-plane.test.ts:177-178` asserts `demo-repository.ts` and `demo-command-executor.ts` are in the billing-action import closure, and `:243-244` asserts `new DemoControlPlaneRepository()` and `new DemoCommandExecutor(repo)` are present in source text. Removing the defaults without rewriting those assertions will fail the suite. | Observed, not assumed; this is the main mechanical coupling between T1's closure map and T3. |
| R2 | Risk | `server/control-plane/contracts.ts:48` types `PlatformOverviewResponse.mode` as the literal `"simulation"`. Removing the demo default requires a response-contract change, which widens the T3 diff beyond the repository construction site. | Observed literal type. |
| R3 | Risk | Four mode-typed client props (`WorkQueueTab.tsx:30`, `AgentActivityTab.tsx:22`, `OwnerInboxTab.tsx:34`, `PortfolioGateTab.tsx:24`) admit `"simulation"`/`"demo_fallback"` as valid values, and four call sites default to it (`PlatformControlPlane.tsx:483,496,509,520`). A type-level fix alone is insufficient; the loading/missing branch must be given a real truth mode. | Observed; the Brief's UI requirement (`:72`, `:171`) needs a concrete replacement mode for the "no data yet" state, which is a design choice. |
| R4 | Risk | `mapRpcError` (`agentEvents.ts:69-97`) matches error text with `includes(...)`. New scope error tags must not collide with existing substrings, or an unrelated failure could be mis-mapped to a 422 non-retryable response. | Observed substring-matching implementation. |
| R5 | Risk | Any change to the RPC parameter list invalidates the current `REVOKE`/`GRANT` statements, which name the 17-parameter signature explicitly (`0006:265-288`). Omitting the re-issue would leave the new function with default PUBLIC execute grants. | Observed; the file's own comment at `:260-262` flags this as mandatory-after-create. |
| R6 | Risk | The `work_queue_items.status` legacy enum cast (`0006:155` `        status = p_control_status::public.work_item_status,`) is enum-typed; `0004` adds `'unmapped'` (`0004:25`). A non-product scope cannot be represented by inventing a status value, and must not be. | Observed; scope must be carried by the new columns, never by the status enum. |
| R7 | Risk | `drizzle/schema.ts` does **not** declare the Control tables (`grep -c "work_queue_items\|owner_inbox_items\|agent_activity_events\|portfolio_gates" drizzle/schema.ts` → `0`), while `package.json:16` exposes `db:push` = `drizzle-kit generate && drizzle-kit migrate`. A `db:push` would therefore be able to regenerate migrations from an incomplete schema model. | Observed; reinforces the Brief's `db:push` prohibition (`:136`, `:214`) as a concrete hazard, not a theoretical one. |
| R8 | Risk | There is no migrations journal/meta directory under `drizzle/` (listing shows only `0001`–`0008` `.sql` files), so applied-migration state is not tracked in-repo and the new migration's ordering relative to `0007`/`0008` (which target the *other* database per `0007:2-3`, `0008:2-3`) must be stated explicitly to avoid a cross-database apply. | Observed: `0006:3` and `0008:2-3` show two different target databases across the same migration folder. |
| R9 | Risk | Two runtime entry points call `handleAgentEventPayload` (`server/worker.ts:32`, `server/_core/index.ts:31`). A new agent-only decision endpoint must be added to both or the local-dev and production surfaces diverge. | Observed duplicate route registration. |
| R10 | Risk | The T1 brief requires the new scope to be fail-closed, but the current schema silently strips unknown keys (section 2). A sender that already emits `scopeType` is not currently told it is being ignored. After the change the same payload will start being honoured, which is a behaviour change for that sender. | Observed via `grep .strict()` returning no matches. |
| R11 | Risk | `hermes-native-swarm` / `wstera-control-sync` test baselines and the Control Sync sender contract were **not** read in this unit (out of the allowed inspection root). Any claim about the sender side of the scope contract is therefore absent from this document. | Declared limitation, not an oversight. |
| R12 | Open question | Whether an already-emitted, in-flight Control Sync outbox item with no scope fields would be rejected after deployment | Depends on the sender contract revision (§R11) and on the backfill rule (Q2); cannot be determined from the hub-web source alone. |

Non-claims of this document: it asserts no `PRODUCTION_READY`, no `OPERATED_STABLE`, no `LIVE_PROVEN`,
and no T1 PASS of its own. It does not approve the design in sections 5 or 8, does not authorise any
migration, and does not authorise any production mutation. Stage verification and any downstream
authorisation remain with the commander, the Run Manifest checkpoints, and the Owner.
