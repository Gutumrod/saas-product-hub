VERDICT: WORKER_FIX

REVISION REVIEWED: `15b1579040724cd8430041527aedb5fa8b0b7275`

CHECKS PERFORMED:  
- `git rev-parse HEAD`: exact frozen SHA; branch matches; worktree clean.  
- `origin/work/house-platform-closure-20260919`: same SHA.  
- `git diff --check`: PASS.  
- Reviewed T1–T5 records, B0–B4 closures, manifest, security headers, Worker entry, signer parser, Billing Core transport, router paths, build-env gate, CSP consumers, and prohibited-path scans.  
- Vitest not rerun; prior sandbox `spawn EPERM` limitation accepted. Hermes-reported `25 files / 358 tests` treated as recorded evidence only.

CANDIDATE INTEGRITY:  
Source integrity is PASS: current HEAD, branch, origin, and clean worktree bind to the frozen candidate. The rollback UUID is recorded by Hermes but was not independently queried here. Deployment remains vulnerable to operator drift because `wrangler deploy` builds the current checkout, not an immutable artifact; WU05 must reverify SHA and clean status immediately before build/deploy. The Production Readiness Record is stale and still names `381fef3`, so the G1–G10 packet is not currently exact-revision evidence.

NEW ACTIVE BEHAVIOUR RULING:  
- `PRODUCT_EVENT_SIGNERS`: must not activate now. Wrong mapping can authorize a valid signer for the wrong product, causing unauthorized product-installation/event state mutation. `signerRegistry.ts:101-147` partially accepts valid entries when another entry is malformed; this is not whole-config fail-closed behavior.  
- Billing Core config: must not activate now. `billing-core-transport.ts:89-95` accepts any syntactically valid URL, including `http://`; `billing-core-transport.ts:487-492` then sends bearer and HMAC assertion credentials to it. Malformed JSON does fail closed, but insecure URL configuration does not.  
- Deliver separately, after code fix and verification. Deploy code with both capabilities inert, then activate signer config and verify, then Billing Core config and verify. Do not deliver both in the same unverified window.

HEADERS/CSP RULING:  
The Worker/static duplication is conceptually correct: Worker responses receive headers in `server/worker.ts:17-51`; SPA assets receive `client/public/_headers`. `X-Frame-Options: DENY` plus CSP `frame-ancestors 'none'` is correct defense-in-depth. Omitting HSTS `preload` is correct without an explicit Owner decision.

CSP supports same-origin SPA/tRPC, Google Fonts, Supabase Auth, and Supabase Storage. However, `img-src` excludes `https://github.com`; the existing `ComponentShowcase.tsx:699` image would be blocked if that route is exposed. The current `App.tsx` routes do not expose that page, so this is non-blocking for the current routed surface. The drift test only checks that expected lines occur; it does not reject duplicate/conflicting headers or enforce exact parsed equality. That is a non-blocking test weakness.

ZONE CHANGE RULING:  
Zone-level HTTP→HTTPS enforcement is the correct layer and avoids Worker redirect loops. `min_tls_version: 1.2` is appropriate for current browser traffic. Unverified risk remains for legacy HTTP API/webhook consumers and TLS 1.0/1.1 clients; Always Use HTTPS may not preserve POST semantics for clients that do not follow redirects. WU05 must confirm no supported consumer depends on plaintext HTTP.

READINESS GAP RULING:  
- Runbook: blocks `PRODUCTION_READY`; acceptable only as an explicitly recorded risk for a limited `BUILD_PASS` deployment.  
- Kill-switch/escalation: blocks activating the two new capabilities and blocks `PRODUCTION_READY`; the practical secret-removal rollback must be documented before activation.  
- Control request correlation: blocks `PRODUCTION_READY`; not by itself a blocker for code-only deployment with Billing Core still inert.  
- Overall intended window includes capability activation, so the current gaps block approval of the proposed deploy window.

G1-G10 HONESTY:  
- G1 escalation/kill-switch GAP: honest.  
- G2 PASS is tied to old `381fef3`; it is overstated for the frozen `15b1579` unless the Hermes 25/358 run is attached as exact-SHA evidence.  
- G3 rollback GAP is stale/understated: T5-WU03 records a rollback target and procedure, though exact live verification remains untested.  
- G4 R15 prepared/not applied: honest.  
- G5 dependency-audit GAP is stale; T5-WU03 records the candidate audit. HTTP/security remain live gaps until WU05. “No billing mutation” is overstated repository-wide.  
- G6 correlation and actionable-alert gaps: honest. Control auditability should remain PARTIAL, not full PASS, until correlation evidence exists.  
- G7 N/A/recorded limits: reasonable, subject to the cited Master Plan evidence.  
- G8 exact candidate is stale and incorrect; it must say `15b1579`.  
- G9 rollback GAP is stale; runbook GAP is honest.  
- G10 not yet proven: honest.  
- Existing claims that the Control surface has no billing/customer mutation are not supported by the deployed router: `server/routers.ts:110-112` exposes `customersTree`, and `:158-187` exposes `executeBillingAction`.

FINDINGS:  
- BLOCKING — signer configuration is not whole-config fail-closed. Evidence: `server/webhooks/signerRegistry.ts:101-147`; malformed entries are skipped while valid entries remain active. Fix parser and add a mixed-valid/malformed test.  
- BLOCKING — Billing Core accepts plaintext base URLs and sends credentials to them. Evidence: `server/control-plane/adapters/billing-core-transport.ts:89-95`, `:487-492`. Require HTTPS, except an explicitly isolated test scheme.  
- BLOCKING — readiness evidence is revision-inconsistent. Evidence: T5 readiness record names `381fef3`; T5-WU03 freezes `15b1579`. Recreate/update the record against `15b1579`.  
- BLOCKING/OWNER SCOPE — repository-wide prohibited-path claim is false or insufficiently scoped. Evidence: `server/routers.ts:110-112` and `:158-187` expose customer enumeration and billing mutations through the live app router. Owner must explicitly scope these as pre-existing simulation-only behavior or remediate before deploy.  
- MAJOR — no documented kill-switch/escalation path for active config capabilities.  
- MAJOR — no Control request-correlation evidence; transport creates an outbound `operation_id` but does not establish end-to-end request correlation.  
- NON-BLOCKING — CSP blocks the GitHub avatar in currently unreachable `ComponentShowcase`; drift guard checks containment rather than exact header equivalence.  
- NON-BLOCKING — HTTP/TLS compatibility inventory is absent.

CONDITIONS FOR APPROVAL:  
- Fix signer parsing to reject the entire configuration on any malformed entry or ambiguity; add exact tests.  
- Reject non-HTTPS Billing Core base URLs before credentials are used.  
- Update the Production Readiness Record and all G8/G9 rollback references to `15b1579040724cd8430041527aedb5fa8b0b7275`.  
- Resolve and document the existing `customersTree`/`executeBillingAction` invariant conflict.  
- Record runbook, kill-switch, escalation owner, and Control request-correlation design before claiming `PRODUCTION_READY`.  
- WU05 must recheck branch, SHA, clean status, remote parity, and build from the exact candidate immediately before deployment.  
- Deploy with both new configs absent; activate `PRODUCT_EVENT_SIGNERS`, verify fail-closed/valid/wrong-product behavior, then activate Billing Core config and verify truthful/degraded behavior.  
- Verify secrets by presence/fingerprint only; never print values.  
- Verify the Cloudflare rollback version before mutation and capture deployed artifact/version identity before WU06.

UNSUPPORTED CLAIMS:  
- “No billing/customer/subscription mutation” across the entire deployed Control surface.  
- Exact-revision G1–G10 readiness, because the readiness record remains bound to `381fef3`.  
- Independent confirmation here that rollback UUID `9db4fb70-a5e5-4989-94b5-1d271ab10055` still exists in Cloudflare.  
- Complete CSP correctness for every source component; the current routed surface is mostly covered.

UNTESTED AREAS:  
- Vitest execution in this sandbox (`spawn EPERM`).  
- Live Cloudflare rollback and artifact identity.  
- Live R15 privilege transition and FK behavior.  
- Live Billing Core transport, credential/environment mismatch, and degraded recovery.  
- Legacy HTTP webhook/API consumers and TLS 1.0/1.1 clients.  
- End-to-end Control request correlation and alerting.