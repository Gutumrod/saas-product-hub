VERDICT: WORKER_FIX

REVISION REVIEWED: `e6d367ceb431a806eb4ab8a859f644a6af7efac3`

CHECKS PERFORMED:
- `HEAD`, branch, upstream, and clean source worktree verified at exact SHA.
- Freeze and readiness records agree on SHA and 366 tests.
- WU03 remains stale: records 358 tests and old “not yet recorded” gaps.
- BLK-1 source/tests reviewed: whole-config fail-closed works.
- BLK-2 source/tests reviewed: plaintext HTTP rejected before credential lookup; no test carve-out.
- Static billing-action closure and mutation probes reviewed.
- Operational runbook, kill-switch, and correlation records reviewed.
- Source diff checked: no `drizzle/` or `server/fulfillment/` changes.
- Targeted Vitest could not start in this sandbox: `spawn EPERM`. Hermes’ 25 files/366 tests result was not independently rerun.

BLK-1..4 CLOSURE:
- BLK-1: verified. Malformed entries, duplicate `keyId`, reused secrets, and mixed valid/invalid configurations return zero signers (`signerRegistry.ts:146-150`; tests around `installIdempotency.test.ts:471-507`).
- BLK-2: verified. HTTPS is required during config parsing and again before transport credential use (`billing-core-transport.ts:85-98`, `:448-471`). No plaintext/test carve-out exists.
- BLK-3: not verified. Freeze/readiness bind to `e6d367c`, but WU03 still states `25 files / 358 tests` and says the runbook, kill-switch, and correlation records are not yet created (`T5-WU03...:29`, `:105-107`). The three records do not agree.
- BLK-4: not fully verified. Direct DB, indirect neutral-helper, and direct Stripe mutation probes are present. However, external imports are ignored (`control-plane.test.ts:84`, `:120`) and the forbidden-source regex is name-based (`:126-131`). A reachable provider/database call through an unrecognized external module or generic `fetch` would not necessarily fail the guard. The universal wording is therefore unsupported.

SCANNER FALSE-POSITIVE READING: agree, with qualification. Word-shaped placeholder secrets in pre-existing test fixtures are not evidence of leaked credentials, especially when the scanner match is inside the wrapper log. The runner correctly failed closed, but this review did not independently reproduce a clean scanner run.

CODE-ONLY DEPLOY RULING: approved conditionally, not executable until the WU03 record is corrected. Conditions: exact SHA, clean worktree, upstream parity, build/typecheck, rollback version, artifact identity, and both new configuration sets absent. No R15/database mutation, migration, or capability activation may be bundled.

CAPABILITY ACTIVATION RULING: must be sequenced. Order:

1. Deploy code with both capability configurations absent; verify both remain fail-closed.
2. Activate `PRODUCT_EVENT_SIGNERS`; verify presence only, valid signing, wrong-product rejection, malformed/duplicate/reused-secret rejection, and removal rollback.
3. Only after step 2 passes, activate Billing Core configuration; verify HTTPS, presence-only secret indicators, truthful/degraded read behaviour, `canExecutePaymentActions === false`, no enumeration, and independent removal rollback.
4. Run the required WU06 live smoke before any `PRODUCTION_READY` or `LIVE_PROVEN` claim.

CONDITIONS SATISFIED / NOT:
- Satisfied: signer whole-config rejection.
- Satisfied: HTTPS transport enforcement.
- Satisfied: exact candidate freeze and source cleanliness.
- Satisfied: operational runbook exists.
- Satisfied: kill-switch record describes correct fail-closed operator-visible states.
- Satisfied: correlation gap is honestly recorded as partial/unimplemented.
- Not satisfied: WU03 evidence is synchronized with freeze/readiness.
- Not satisfied: static guard fully supports the broad “no DB/provider reachability” wording.
- Not satisfied: live transport, deployment, rollback, and activation evidence.
- Not satisfied: production readiness; record correctly limits status to `BUILD_PASS` at most.

FINDINGS:
- Blocking — WU03 is stale. Its test count and open-gap table contradict the freeze/readiness records.
- Blocking — BLK-4 remains overclaimed. The guard does not inspect arbitrary external modules or generic provider/network calls, despite the invariant wording.
- Non-blocking — Control request correlation remains unimplemented, correctly marked `PARTIAL`.
- Non-blocking — live Billing Core transport and alerting remain untested.
- Non-blocking — existing admin `customersTree` and demo in-memory payment/subscription simulation remain; the ruling only supports absence of production-authoritative mutation.
- Non-blocking — targeted Vitest execution is sandbox-blocked by `spawn EPERM`.

UNSUPPORTED CLAIMS:
- “The three candidate records now agree.”
- “The static regression test catches any database/provider call reachable from `executeBillingAction`.”
- A whole-Control-surface claim of no enumeration or mutation; only the narrow billing-action path is fixture-scoped.

UNTESTED AREAS:
- Full Vitest rerun in this sandbox.
- Live deployment and Cloudflare rollback.
- Live Billing Core request and degraded/ready behaviour.
- Runtime proof that production configuration cannot substitute the demo repository.
- Secret presence/fingerprint verification.
- WU06 live smoke and end-to-end correlation.