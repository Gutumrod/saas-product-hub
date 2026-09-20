VERDICT: WORKER_FIX  
REVISION REVIEWED: 432b1abd97aa0a024d2e9175bd5ded39d5b7acdd

CHECKS PERFORMED:
- Revision binding: PASS; `git rev-parse HEAD` matched exactly; worktree clean.
- Signer→product binding: PASS; registry resolves `keyId` server-side and rejects mismatched `productId` (`productEvents.ts:296-306`).
- Envelope/body tamper binding: PASS; canonical HMAC includes envelope fields plus server-computed raw-body SHA-256 (`productEvents.ts:128-145`, `318-326`).
- Digest contract: PASS; `bodyDigest` is absent from schema and rejected as an unrecognized field (`productEvents.ts:50-74`; tests `560-572`).
- Verification ordering: PASS; first DB access is after signature, replay, and rate checks (`productEvents.ts:261-351`).
- Replay window and bounds: PASS by source inspection; past/future timestamps, body size, and per-signer rate are enforced.
- Idempotency implementation: PASS by source inspection; DB uses `(productId, externalEventId)` unique index and `onConflictDoNothing` (`db.ts:224-253`; `drizzle/schema.ts:149-155`).
- Failure modes: PASS by source inspection; unknown/malformed key, invalid product binding, unsupported version, and invalid timestamps fail closed.
- Secret hygiene: PASS by source inspection; no secret is returned or logged; identity accessors omit secrets (`signerRegistry.ts:175-187`).
- Typecheck: PASS; `npx tsc --noEmit` exited 0.
- Vitest: NOT EXECUTED; `npx vitest run` failed at startup with sandbox `spawn EPERM`.
- Changed-path audit: PASS; only the five dispatched files changed; no DB/schema/migration/deploy changes observed.
- `git diff --check`: PASS.

FINDINGS:
- Blocking — idempotency/replay test is tautological. The mock itself deduplicates `(productId, externalEventId)` (`productEvents.test.ts:164-176`), so the test still passes if production DB idempotency is removed. Tests `h` and `h2` therefore do not independently prove the database control. Add an integration/database-backed test or a focused test of the real `recordProductInstallationFromWebhook` conflict behavior.
- Non-blocking — secret-hygiene tests do not invoke `listProductEventSignerIdentities()` or `listKeyIdsForProduct()`. Source inspection confirms those accessors omit `secret`, but the claimed accessor contract lacks direct test coverage (`signerRegistry.ts:175-187`).

UNSUPPORTED CLAIMS:
- Hermes-reported `197/197` Vitest pass was not independently confirmed because of `spawn EPERM`.
- Hermes-reported canonical secret-scan result was not independently rerun; source-level scan found no logging or secret emission in the reviewed files.

UNTESTED AREAS:
- Runtime Vitest execution.
- Real database concurrency/idempotency behavior.
- Runtime deployment/worker behavior and live transport acceptance.