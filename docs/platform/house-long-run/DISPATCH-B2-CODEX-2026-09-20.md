# AGENT DISPATCH — B2 Independent Review — WSTERA-HOUSE-PRODUCTION-CLOSURE-001

Agent: `agent-codex` (independent batch reviewer)
Review Batch: **B2 — Product Event Trust Boundary**
Stage: T2 (product-event signer hardening)
Critical focus (Run Manifest): signer→product binding, replay, tamper, idempotency
Context mode: **INDEPENDENT-QA**
Recorded: 2026-09-20

## Revision under review

**Source under review lives in a separate repository.**

Repository: `Gutumrod/hub-web`
Branch: `work/house-platform-closure-20260919`
Revision: **`432b1abd97aa0a024d2e9175bd5ded39d5b7acdd`**
Worktree: `D:\AI-Workspace\projects\saas-product-hub\apps\hub-web`
Base before T2: `125af8435f4c80b9525c72405b44807206905fc5`

Note: `apps/hub-web` is git-ignored inside `Gutumrod/saas-product-hub`, so the source under review
cannot be bound through a House-side git object. Bind it through the hub-web revision above, and
verify the working tree matches it:

```
cd D:/AI-Workspace/projects/saas-product-hub/apps/hub-web
git rev-parse HEAD              # expect 432b1abd97aa0a024d2e9175bd5ded39d5b7acdd
git status --short              # expect empty
```

Task coordination records: `Gutumrod/saas-product-hub` @ `work/house-production-closure-longrun-20260919`.

## What T2 delivered

| File | Change |
|---|---|
| `server/webhooks/signerRegistry.ts` | new — `keyId -> { productId, secret }` registry, each keyId bound server-side to exactly one product |
| `server/webhooks/productEvents.ts` | rewritten to the per-product signer contract |
| `server/webhooks/productEvents.test.ts` | 6 → 29 cases |
| `server/_core/env.ts` | adds `productEventSigners` + bounded controls; shared secret deprecated for this endpoint |
| `.env.example` | documents `PRODUCT_EVENT_SIGNERS` (placeholder only) |

Orchestrator-run gates (Hermes, in the project workspace):
`npx tsc --noEmit` exit 0; `npx vitest run` 197/197 passing across 18 files (pre-T2 baseline 174).
Secret scan of all five changed files: 0 findings.

## B2 questions to answer

1. **Signer→product binding.** Is the authorized product genuinely resolved server-side from the
   registry by `keyId`, with any caller-supplied product treated as a claim that must match? Is
   wrong-product impersonation impossible? Verify both directions from the code.
2. **Envelope binding completeness.** Does the signed material bind version, keyId, productId,
   eventId, issuedAt and a body digest such that neither the body nor any envelope field can be
   tampered with independently? Look for any field that is read before verification or not covered
   by the HMAC.
3. **Digest contract.** The digest is now computed server-side (`sha256(rawBody)`) and passed to
   `canonicalSigningPayload` as an explicit argument, not carried in the body. Confirm the
   self-referential defect is actually gone and that a body still carrying `bodyDigest` is rejected.
   Confirm the `X-Hub-Signature` transport shape still works.
4. **Verification ordering.** Does signature and envelope verification complete **before any**
   database access on every path? Are there early-return paths that touch the DB first?
5. **Replay, idempotency, bounds, rate.** Are the replay window (both directions), idempotency scope,
   body-size limit and per-signer rate limit actually enforced, and are the tests meaningful rather
   than tautological? Check for tests that would pass even if the control were removed.
6. **Failure modes.** Unknown `keyId`, malformed `keyId`, unknown product binding, unsupported
   version, unparseable `issuedAt` — do all fail closed?
7. **Secret hygiene.** Can any secret reach a response body, an error body, or a log line? Check the
   registry accessors and the handler's error paths. Do the tests genuinely assert absence?
8. **Regression risk.** The retired caller-selected product field and the retired shared secret:
   are they truly no longer accepted for this endpoint, and is any other consumer of
   `productEventsHmacSecret` still working (it is retained, deprecated, for non-product-event use)?
9. **Test suite integrity.** Confirm the suite passes as reported, and identify any test that does
   not actually exercise the contract it claims to.
10. **Scope discipline.** Confirm no source outside `apps/hub-web/server/**` (plus `.env.example`)
    changed, and that no database mutation, deploy or migration occurred.

## Prohibited

- No file modification. Read-only review.
- **Do not modify the workspace.** If you need to run tests, run them read-only; note that the
  previous classification attempt hit `spawn EPERM` in your sandbox — if that recurs, say so and rely
  on source inspection, stating clearly which checks you could not execute.
- No secret values in the report.
- Do not repair findings.

## Required verdict (LONG_RUN contract)

Exactly one of:

```text
BATCH_APPROVED
WORKER_FIX
SENIOR_REMEDIATION_REQUIRED
OWNER_DECISION_REQUIRED
STOP
```

Report exactly:

```text
VERDICT: <one of the five>
REVISION REVIEWED: <sha>
CHECKS PERFORMED: <list with observed results>
FINDINGS: <blocking and non-blocking, each with evidence>
UNSUPPORTED CLAIMS: <none, or list>
UNTESTED AREAS: <list>
```
