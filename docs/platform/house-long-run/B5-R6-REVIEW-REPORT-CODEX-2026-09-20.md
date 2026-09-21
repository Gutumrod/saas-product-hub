VERDICT: WORKER_FIX

REVISION REVIEWED: `679ff279e5ff2a9a3006bea79ccc6ccde90715ec`

CHECKS PERFORMED: HEAD/branch/upstream match; worktree clean; reviewed R1 outcome, ruling, readiness record, WU03 qualification, freeze record, signer parser/tests, HTTPS transport guard/tests, billing-action closure guard/tests, kill-switch/runbook/correlation records, forbidden-path diff, and capability invariants. Static review only; vitest was not rerun in this read-only sandbox.

BLK-1..4 CLOSURE: BLK-1 verified whole-config fail-closed for malformed, duplicate `keyId`, reused secret, and mixed entries. BLK-2 verified plaintext URLs are rejected before credential lookup/use; no test-scheme carve-out exists. BLK-3 not fully verified: WU03 still says `PASS 25/358` while its command evidence and readiness/freeze records say `25/366`. BLK-4 verified wording, bounded static closure, empty external allowlist, undeclared-import probe, and generic `fetch()` probe.

SCANNER FALSE-POSITIVE READING: agree. The matched values are repository test fixtures/placeholders in the wrapper log, not leaked credentials. The scanner correctly failed closed; this is a scanner classification/tooling issue, not evidence of secret exposure.

CODE-ONLY DEPLOY RULING: not approved yet. Approve after correcting the WU03 `25/358` stale result and rechecking the exact candidate. Conditions: exact SHA `679ff279...`, clean worktree, upstream parity, successful typecheck/build, rollback version captured, both new config sets absent, no secrets printed, and post-deploy artifact/health/redirect/fail-closed checks pass.

CAPABILITY ACTIVATION RULING: must be sequenced.  
1. Code-only deploy with both configs absent; verify artifact, rollback identity, HTTP→HTTPS, health, headers, and both capabilities remain fail-closed.  
2. Activate `PRODUCT_EVENT_SIGNERS`; verify valid, wrong-product, malformed, duplicate, and reused-secret behaviour plus secret-free output.  
3. Activate Billing Core configuration; verify HTTPS-only transport, truthful/degraded response, per-account scope, `canExecutePaymentActions: false`, and no mutation/provider path.  
4. Run WU06 live smoke. Do not claim `PRODUCTION_READY` while correlation remains design-only.

CONDITIONS SATISFIED / NOT: Satisfied: BLK-1, BLK-2, Finding-4 wording and bounded guard, runbook, kill-switch, rollback records, candidate freeze, clean scope, no DB/deploy/migration performed, no provider SDK/checkout/payment/customer mutation/entitlement write, and inert configuration state. Not satisfied: WU03 exact test-count consistency; HTTP→HTTPS live enforcement remains a deployment-time gap; request correlation is not implemented; live transport and WU06 smoke remain unproven.

FINDINGS: Blocking: WU03 current gate table incorrectly records `PASS 25/358` at line 38 while the same document records `25/366`; exact-candidate evidence is internally inconsistent. Non-blocking: WU03 checklist remains unchecked and contains the placeholder “the frozen candidate” despite the freeze record being complete. The kill-switch procedure is practical and its operator-visible claims match the code’s absent-config fail-closed behaviour.

UNSUPPORTED CLAIMS: The current WU03 `25/358` gate-table result is unsupported/stale. No unsupported source-isolation claim found within the explicitly bounded billing-action closure.

UNTESTED AREAS: Fresh vitest/typecheck execution in this sandbox; live deployment; live HTTP→HTTPS enforcement; live Billing Core transport; live config activation; end-to-end request correlation; WU06 production smoke.