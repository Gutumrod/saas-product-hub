VERDICT: WORKER_FIX  
REVISION REVIEWED: `61acf52c6ecb5995f7ae67b7885f4548f40ebaef`

CHECKS PERFORMED: HEAD/branch/clean status verified; source and tests inspected; BLK-1/2 parser and transport paths traced; BLK-4 closure guard and mutation probes inspected; operational documents reviewed; `drizzle/` and `server/fulfillment/` absent from B4→HEAD diff; no deploy, DB mutation, or migration performed; Vitest not rerun in read-only sandbox, Hermes results considered.

BLK-1..4 CLOSURE:  
- BLK-1: Verified. `signerRegistry.ts:103-150` returns an empty configuration for malformed entries, duplicate `keyId`, reused secrets, and mixed valid/invalid input. Tests and mutation probe exist at `server/webhooks/installIdempotency.test.ts:468-512`. No tested configuration shape leaves signers active.  
- BLK-2: Verified. `billing-core-transport.ts:89-96` requires `https:` before credential parsing; `:441-449` repeats the guard before credential lookup/signing/fetch. No test-scheme carve-out exists.  
- BLK-3: Not verified; reopened. The readiness record still binds evidence to `0e4494d...` at lines 7-19, while the qualification document still freezes `15b1579...`. Neither matches reviewed HEAD.  
- BLK-4: Partially verified, not fully closed. The ruled wording is present and the direct/indirect imported-helper probes exist at `server/control-plane/control-plane.test.ts:125-143,193-224`. However, the allowlist does not detect a DB/provider call added directly inside an already-allowlisted module. Therefore the claim that the test will fail for any reachable DB/provider call is too broad.

SCANNER FALSE-POSITIVE READING: Agree, with an evidence limitation. The matched values are pre-existing synthetic test fixtures, not credentials or runtime output. However, the failed-closed scanner run is not a clean PASS; rerun the scanner against the exact candidate while excluding/differentiating known fixture literals and wrapper-log text, without printing values.

CODE-ONLY DEPLOY RULING: Not approved yet. Conditional approval requires: readiness and qualification records updated to `61acf52...`; exact-SHA typecheck/test/build evidence; clean worktree and remote parity; fresh WU05 verification; both new configurations absent; rollback version/artifact captured; secret presence checked only by non-secret indicators; no DB/R15 mutation before the approved boundary.

CAPABILITY ACTIVATION RULING: must be sequenced, not simultaneous. Order: (1) deploy code with both capabilities inert; verify artifact, health, redirects, fail-closed webhook and Billing Core states; (2) activate `PRODUCT_EVENT_SIGNERS` only and verify valid, malformed, wrong-product, tamper, replay, and kill-switch behavior; (3) activate Billing Core URL/credentials and verify HTTPS transport, truthful/degraded response, per-account scope, no secret exposure, and literal `canExecutePaymentActions: false`. Activation is not approved in the current evidence state.

CONDITIONS SATISFIED / NOT: Satisfied: whole-config signer rejection; HTTPS enforcement; exact Finding-4 wording; runbook exists; kill-switch/escalation record exists and matches code behavior; correlation design is honestly documented; expected protected paths are untouched. Not satisfied: exact candidate binding in readiness documents; fully reliable BLK-4 regression claim; live transport/smoke; Control end-to-end correlation implementation; fresh deploy-window WU05/WU06 evidence; HTTP→HTTPS live enforcement remains a measured operational gap.

FINDINGS:  
- Blocking — readiness evidence is revision-inconsistent: current record references `0e4494d...`; qualification references `15b1579...`; reviewed revision is `61acf52...`.  
- Blocking — BLK-4 regression guard has an allowlisted-module blind spot. A DB/provider import from a neutral helper is caught, but a direct call added inside an allowlisted module is not. Narrow the claim or add per-allowlisted-module forbidden-import/content assertions.  
- Non-blocking for code-only, blocking for `PRODUCTION_READY` — correlation remains design-only; the record correctly keeps G6 PARTIAL.  
- Non-blocking — live Billing Core transport, live smoke, and alerting remain untested.  
- Non-blocking evidence issue — scanner interpretation is correct, but a clean scanner PASS must be regenerated.

UNSUPPORTED CLAIMS: The readiness record’s exact-SHA test claims are unsupported for the reviewed revision because they are attached to `0e4494d...`. A whole-Control claim of “no product-wide enumeration” is also unsupported: the pre-existing admin-only `customersTree` endpoint remains. The narrower SB01 read path is per-account and does not enumerate product-wide.

UNTESTED AREAS: Live deployed behavior; live Billing Core request; live secret/config absence; production repository substitution; runtime DB/provider isolation; WU05/WU06 deployment and rollback; end-to-end request correlation; scanner rerun with fixture handling.