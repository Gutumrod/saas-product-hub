# BRIEF — Central Billing Core Phase 2 Runtime Continuation

## MODE

**WSTERA CENTRAL BILLING CORE / PHASE 2 — IMPLEMENTATION CONTINUATION**

รับช่วงงาน implementation ที่เริ่มแล้วใน SB01 ต่อให้จบแบบ evidence-driven

ห้ามเริ่มใหม่จากศูนย์ ห้ามรื้อ Phase 1 Profile Registry และห้ามเชื่อ brief อย่างเดียว — ต้องตรวจ Git/source/runtime จริงก่อนทำต่อ

## OWNER DIRECTION

Owner ต้องการพยายามปิดงาน Central Billing Core Phase 2 วันนี้

เป้าหมายไม่ใช่แค่ code green แต่ต้องพิสูจน์ thin end-to-end runtime จริงใน Test Mode ให้ครบก่อนเรียก PASS

ห้ามอ้าง completion ถ้ายังไม่มี HTTP + DB + Stripe Test evidence จริง
## CANONICAL REPOS / PATHS

House repo:
`D:\AI-Workspace\projects\saas-product-hub`

SB01 repo:
`D:\AI-Workspace\projects\saas-product-hub\products\stripe-billing`

Original Phase 2 brief:
`D:\AI-Workspace\projects\saas-product-hub\docs\platform\billing-core\BRIEF-CENTRAL-BILLING-CORE-PHASE2-RUNTIME-VERTICAL-SLICE-2026-09-08.md`

Phase 1 implementation:
`D:\AI-Workspace\projects\saas-product-hub\products\stripe-billing\platform\profile-registry`

Phase 2 runtime WIP:
`D:\AI-Workspace\projects\saas-product-hub\products\stripe-billing\platform\runtime`
## VERIFIED GIT BASELINE

SB01 current branch:
`feature/central-billing-phase2-runtime`

SB01 base HEAD:
`397d0b70c33183ce1986ec7024d7d8e1013a7e6b`

Current SB01 status at handoff:
- `?? docs/` — pre-existing untracked content; DO NOT TOUCH / DO NOT COMMIT with Phase 2
- `?? platform/runtime/` — current Phase 2 WIP

Phase 1 commits remain authoritative and must be preserved:
- `96596c6` profile registry foundation
- `d8ad1f7` multi-profile concurrency harness
- `84581ec` Stripe Test concurrency runner
- `397d0b7` full admission evidence activation hardening

Do not reset, replace, or rewrite Phase 1 to make Phase 2 easier.
## VERIFIED PHASE 1 TRUTH

Phase 1 is valid foundation and is NOT being replaced.

Verified current Profile Registry behavior:
- exact `product_id + environment + profile_version` resolution
- immutable/versioned registration
- credential-bound Product identity
- account-bound assertion guard
- activation gate + rollback rule
- PS01 and LK01 Test profiles remain `pending_validation`
- no mutable global current Product/Profile state

Current source was compiled independently and deterministic registry/concurrency tests passed **16/16** before Phase 2 implementation began.

Real Stripe Test provider lifecycle evidence also already exists for PS01/LK01 mappings, but that evidence called Stripe directly and does NOT prove Central Billing HTTP/DB/webhook runtime.
## VERIFIED NON-PRODUCTION DB TARGET

WSTERA LAB is the approved proving runtime for this Phase 2 work.

Supabase project ref:
`ykxlqnshaaxmzzocpjlj`

Project name:
`wstera-lab`

Region:
Southeast Asia (Singapore)

Supabase CLI link + read-only query were verified successfully from House repo.

Existing schemas seen before any Billing Core apply:
- `local_service`
- `ps01`
- `ps01_internal`

No `billing_core` / `billing_core_staging` schema existed at that verification point.

WSTERA LAB secrets are present in canonical vault/registry; never copy values into repo, brief, shell transcript, or source.
## PHASE 2 IMPLEMENTATION ALREADY CREATED

Current WIP under `platform/runtime/` contains:
- `package.json` / `package-lock.json`
- `tsconfig.json`
- `.env.example`
- `server.mjs`
- `src/types.ts`
- `src/security.ts`
- `src/stripe.ts`
- `src/db.ts`
- `src/webhook.ts`
- `src/runtime.ts`
- `src/index.ts`

Runtime dependencies currently installed:
- `postgres@3.4.5`
- `typescript@5.7.3`

`npm audit` at install time reported 0 vulnerabilities.
## IMPLEMENTED RUNTIME BEHAVIOR

Already coded in WIP:
- constant-time credential comparison
- account assertion binding to Product/account/action/environment/operation/expiry
- exact Phase 1 Profile Registry resolution
- explicit Test admission execution path for `pending_validation` profiles without mutating canonical activation state
- Test-only Stripe adapter; refuses non-`sk_test_` secret
- Checkout uses profile-owned Stripe Price mapping
- server-selected success/cancel return URLs
- server-owned Product/account/profile/plan metadata
- no caller-controlled amount/currency/Stripe Price/customer/environment authority
- persistent operation fingerprint/idempotency model
- provider customer reservation/recovery model
- bounded raw webhook verification + Stripe signature validation
- durable provider event claim + outbox transaction model
- worker leasing, retry and dead-letter model
- Stripe provider re-fetch reconciliation path
- signed entitlement-transition envelope + deterministic Test sink
- scheduled account reconciliation path intended to prove missing-webhook recovery
## HTTP SURFACE ALREADY WIRED

`server.mjs` currently exposes the runtime host around these intended routes:
- `POST /v1/checkout`
- `GET /v1/subscription/status`
- `GET /v1/entitlements`
- `POST /v1/portal`
- `POST /v1/webhooks/stripe`

Do not declare these usable yet: compile + DB + HTTP integration verification is still incomplete.

## CURRENT BUILD STATE — EXACT

Latest command run from `platform/runtime`:
`npm run build`

Result:
`BUILD_EXIT=2`

Profile Registry compilation stage completed; runtime TypeScript compilation still fails at 3 points.
Current compile errors:

1. `src/db.ts(131,47)`
   - `Record<string, unknown>` passed to `postgres.sql.json(...)`
   - Type is not assignable to postgres `JSONValue`

2. `src/db.ts(258,26)`
   - same `Record<string, unknown>` -> `JSONValue` typing issue

3. `src/runtime.ts(239,9)`
   - `mapping.providerCustomerId` is typed `string | null`
   - Checkout call requires `string`
   - runtime logic has just transitioned mapping to ready; fix with an explicit invariant/narrowing, not blind unsafe casting

Previous `URLSearchParams.keys()` compiler issue was already addressed by adding `DOM.Iterable` to `tsconfig.json` and did not recur in the latest build.

Do not start migration work until these compile errors are fixed and `npm run build` passes.
## GENERATED ARTIFACT HYGIENE — IMPORTANT

Because runtime dependencies/build were executed locally, `platform/runtime/` currently contains generated/untracked artifacts including:
- `node_modules/`
- `dist/`

These MUST NOT be committed.

Before any commit:
1. add/verify runtime `.gitignore` for at least `node_modules/` and `dist/`
2. verify `git status --short`
3. stage explicit source paths only
4. preserve the pre-existing SB01 `docs/` untracked tree untouched

Do not use `git add .` or broad staging from SB01 root.
## DATABASE MIGRATION STATE

Canonical existing baseline:
`D:\AI-Workspace\projects\saas-product-hub\docs\platform\billing-core\migrations\0001_billing_core_schema.sql`

`0001` is historical baseline and has NOT been applied to WSTERA LAB yet.

Phase 2 must create a forward-only migration, expected name:
`docs/platform/billing-core/migrations/0002_multi_product_billing_runtime.sql`

Rules:
- do not rewrite `0001` to fit the new runtime
- `0002` must extend the baseline with the runtime tables/indexes/constraints actually required by current source
- apply only to WSTERA LAB for this phase
- never apply to Project A / production as part of this handoff
- capture preflight and post-apply catalog evidence
## NEXT ACTIONS — REQUIRED ORDER

### Phase 2A — Restore compile clean
1. fix the 3 current TypeScript errors only
2. rerun `npm run build`
3. run `npm run typecheck`
4. inspect diff; no scope expansion

### Phase 2B — Runtime DB contract
1. derive `0002` from actual runtime DB calls, not assumptions
2. static review SQL against canonical Council invariants
3. apply `0001` then `0002` to linked WSTERA LAB only
4. verify expected schemas/tables/constraints/indexes
5. verify no impact to `local_service`, `ps01`, `ps01_internal`

### Phase 2C — HTTP + Stripe Test vertical slice
1. configure secrets from canonical local vault/process only
2. start Core API host
3. exercise valid PS01 Test checkout through HTTP
4. verify operation/customer mapping persisted in WSTERA LAB
5. verify Stripe Test object directly from provider
6. do not treat browser redirect as payment truth
### Phase 2D — Webhook durability + reconciliation
1. send a real Stripe Test-signed webhook through `/v1/webhooks/stripe`
2. prove raw-body signature verification
3. prove durable provider-event claim + outbox persistence before 2xx
4. replay duplicate event and prove no double transition
5. prove retry/lease recovery and dead-letter behavior
6. prove out-of-order / ambiguous state causes provider re-fetch before transition
7. prove scheduled reconciliation repairs missing-webhook state

### Phase 2E — Entitlement + isolation proof
1. verify signed entitlement transition into deterministic Test sink
2. verify idempotent replay
3. verify monotonic transition version behavior
4. rerun PS01 + LK01 multi-profile isolation through the actual runtime path
5. prove same account text across two Products cannot cross customer/subscription/outbox/entitlement state
## NEGATIVE AUTHORITY TESTS — MANDATORY

Through HTTP, prove fail-closed for attempts to override or spoof at least:
- `product_id`
- environment
- account identity / invalid account assertion
- Stripe Price ID
- amount
- currency
- Stripe Customer ID
- arbitrary success/cancel/portal return URL
- wrong profile version
- cross-Product credential usage

Negative tests must prove the denied request does not create provider or durable billing side effects.
## OUT OF SCOPE / DO NOT TOUCH

This continuation must NOT expand into:
- MT01 billing integration
- BK01 billing extraction/migration
- PromptPay
- live Stripe keys or live charges
- production deployment
- PS01 Product-owned entitlement/business-state mutation
- LK01 Product-owned state mutation
- public pricing decisions
- Council reopening unless a genuine architecture contradiction is proven from source/runtime evidence

Phase 2 Test entitlement sink is evidence infrastructure only; do not claim Product integration from it.
## ACCEPTANCE CRITERIA FOR PHASE 2 PASS

Do not mark Phase 2 PASS unless all of the following have evidence:
- runtime build/typecheck/tests PASS
- WSTERA LAB migrations applied and catalog verified
- HTTP server exercised as the integration boundary
- real Stripe Test Checkout path through Central Billing Core
- durable webhook intake before 2xx
- duplicate/out-of-order behavior proven
- provider re-fetch used as financial truth
- reconciliation repair proof including missing webhook case
- entitlement Test sink signed/idempotent/monotonic proof
- PS01/LK01 cross-product and cross-account isolation proof through runtime
- negative caller-authority tests
- Stripe Test cleanup and DB test-fixture cleanup/retention recorded
- no live/production mutation
- Git state bounded and unrelated dirt excluded

Green unit tests alone are NOT sufficient.
## EVIDENCE / CLOSEOUT OUTPUT

When runtime verification is complete, create a canonical Phase 2 evidence document under:
`D:\AI-Workspace\projects\saas-product-hub\docs\platform\billing-core\`

Evidence must distinguish:
- source/static verification
- local deterministic tests
- WSTERA LAB DB evidence
- HTTP evidence
- Stripe Test direct-provider evidence
- cleanup evidence
- known limitations / unproven production assumptions

Do not fill `entitlementEvidenceRef` or activate canonical PS01/LK01 profiles unless the required evidence represented by those fields has actually been produced and the activation action is separately authorized.
## COMMIT / PUSH DISCIPLINE

Keep SB01 and House changes separated.

SB01 commit should contain only intended runtime source/config/tests and no pre-existing `docs/`, `node_modules/`, or `dist/`.

House commit should contain only intended Billing Core migration/evidence/status documents using explicit path staging because House repo already contains unrelated dirt.

Before push, prove:
- `git diff --cached --name-status`
- relevant test/build results
- branch divergence
- working-tree leftovers are identified and unrelated artifacts remain unstaged

## CURRENT HANDOFF VERDICT

`PHASE 2 IMPLEMENTATION IN PROGRESS — NOT PASS`

Current blocker is implementation compile correctness only: 3 TypeScript errors listed above.

Architecture blocker: NONE currently proven.
Environment blocker: NONE currently proven — WSTERA LAB read-only preflight succeeded.

Immediate next action: fix those 3 compile errors, make build/typecheck clean, then derive/apply the forward-only WSTERA LAB DB migration and continue the real HTTP/Stripe Test vertical slice.
