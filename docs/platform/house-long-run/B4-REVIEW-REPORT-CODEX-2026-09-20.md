VERDICT: WORKER_FIX

REVISION REVIEWED: 32daeea60dfbc0c7465ed4c92ea61cba1352ba6d

CHECKS PERFORMED:

- HEAD and branch verified: `work/house-platform-closure-20260919`, exact requested SHA.
- Commit scope verified: exactly four named files; `drizzle/`, `server/webhooks/`, and `server/fulfillment/` untouched.
- `git diff --check`: PASS.
- `npx tsc --noEmit`: PASS.
- Targeted Vitest execution: BLOCKED by sandbox `spawn EPERM` while loading esbuild/Vite config.
- HTTP transport: one outbound `GET` only, approved route, no provider SDK or mutation imports.
- Explicit `accountId` required before network call; no enumeration parameter.
- Assertion payload binds product, environment, account, operation ID, and action.
- Provider mapping verified:
  - accepted: `trialing`, `active`, `past_due`, `canceled`, `cancelled`
  - rejected: `unpaid`, `incomplete`, `incomplete_expired`, `paused`, empty, unknown values
- Connection, timeout, non-2xx, malformed JSON, and contract violations reject with typed errors.
- `canExecutePaymentActions` is literal `false` on ready and degraded TransportBacked paths.
- No token/assertion secret appears in URL, fixed error text, or readiness reason.
- No production call site for `getBillingCoreAdapter()` was found; it is only exported and referenced by tests.

FINDINGS:

- BLOCKING — malformed partial credential configuration is not fail-closed. `parseBillingCoreTransportConfig()` skips malformed entries with `continue` and returns a valid config if another entry is valid (`server/control-plane/adapters/billing-core-transport.ts:107-119`). The test explicitly approves this behavior (`billing-core-transport.test.ts:108-123`), contradicting the stated contract that any structural problem drops the whole config. A malformed product entry can therefore leave the adapter configured.

- BLOCKING — unconfigured reads return an empty successful snapshot instead of rejecting. `UnconfiguredBillingCoreAdapter.getSnapshot()` resolves with `connected: false`, empty subscriptions/payments, and a warning (`server/control-plane/adapters/billing-core-adapter.ts:153-174`). Readiness is `waiting_for_billing_core`, not degraded. This violates the requested “missing/invalid config read rejects” and “no empty success” criterion.

- BLOCKING — the claimed Control consumption has no production caller. Repository-wide search found no production use of `getBillingCoreAdapter()`, `TransportBackedBillingCoreAdapter`, or `BillingCoreControlSnapshot`; references are limited to the adapter and tests. The transport is implemented but not demonstrably consumed by a Control route/service.

- BLOCKING — per-product credential structure exists, but the parser does not reject reuse of the same assertion secret across products. A single shared secret can therefore be configured for multiple product IDs. The code provides product-keyed lookup, but does not enforce cryptographic per-product separation (`server/control-plane/adapters/billing-core-transport.ts:106-119`).

- NON-BLOCKING — mutation probes do not execute a mutated subject. They modify source text and assert regex absence (`billing-core-transport.test.ts:448-484`); they do not load or invoke the modified transport. Thus they prove the text probe itself, not runtime behavior after a method/route mutation.

UNSUPPORTED CLAIMS:

- “49 new cases” is structurally plausible: 40 test declarations plus parameterized cases, but Vitest could not execute in this sandbox.
- “Control now consumes” is unsupported by production call-site evidence.
- “Any malformed credential entry drops the whole config” is contradicted by implementation and its test.

UNTESTED AREAS:

- Full Vitest suite and targeted tests due `spawn EPERM`.
- Live SB01 HTTP integration.
- Runtime verification of assertion rejection for a mismatched caller account.
- Runtime production route/service consumption.
- Cross-product duplicate-secret rejection, which is currently absent in code.
- Live readiness behavior under all network failure modes.