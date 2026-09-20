# CHAIN FAILURE — T2 digest contract is self-referential — WSTERA-HOUSE-PRODUCTION-CLOSURE-001

Stage: T2 (product-event signer hardening)
Review Batch: B2 (not reached)
Task: `WSTERA-HOUSE-PRODUCTION-CLOSURE-001`
Recorded: 2026-09-20 (Asia/Bangkok)

## Issue Fingerprint

```
T2_ENVELOPE_BODY_DIGEST_SELF_REFERENTIAL
```

Failure class: `design-defect` · Component: `apps/hub-web/server/webhooks/productEvents.ts`
envelope verification · Failing gate: the happy path (any request that should be accepted)

## The defect (verified by Hermes against the actual file, not taken from the worker's report)

The in-progress handler requires the request body to contain a `bodyDigest` field that equals the
SHA-256 of that same request body:

- `apps/hub-web/server/webhooks/productEvents.ts:53` — `bodyDigest` is a **field of the parsed
  request body** (`z.string()...regex(HEX_SHA256)` inside the body schema).
- `:294` — `const bodyDigest = await sha256Hex(bodyBuffer);`
- `:295` — `if (!timingSafeEqual(bodyDigest, envelope.bodyDigest)) return deny(401, ...)`

`bodyBuffer` is the whole raw request body, and `envelope.bodyDigest` is read out of that body. So the
constraint is `sha256(B) = digest(B)` — a body must contain a value equal to the hash of a body that
contains that value. **No body can satisfy this.** It is a self-referential fixed point.

Consequence: the happy path is unreachable, so idempotency, replay-window and rate-limit behaviour
cannot be exercised at all. The worker measured this: the best-possible well-formed request — correct
registered signer, valid HMAC, current `issuedAt`, self-consistent digest — is denied `401`.

## Why this happened (root cause)

The T2 dispatch required two things that were specified loosely enough to be implemented
incompatibly:

1. "the signed envelope includes … body digest" (Master Plan `:193`)
2. "the signed envelope must bind the body, so body tampering fails"

The implementer satisfied (2) by putting the digest **inside** the signed body **and** re-deriving it
from the raw bytes, which is over-constrained. The Master Plan's phrasing does not say the digest is
carried inside the body being digested; the natural reading is that the digest is a **transport
header or an envelope field supplied alongside the body**, exactly as the existing shared-secret
implementation already does (the signature travels in the `X-Hub-Signature` header, never inside the
signed body).

## Attempt ledger

| # | Lane | Outcome |
|---|---|---|
| 1 | `t2-wu02` | killed by orchestrator foreground timeout (separate fingerprint `T2_IMPLEMENTATION_LANE_KILLED_BEFORE_COMPLETION`) |
| 2 | `t2-wu02b` | worker **BLOCKED** — correctly refused to invent the digest contract. Fixed the typecheck (`npx tsc --noEmit` exit 0) and stopped. |

Local repair budget for this fingerprint: **0/2** — the block is the initial observation, and the
worker's refusal to guess was the correct behaviour.

## Correct behaviour by the worker (recorded as a positive)

The lane did **not** silently rewrite the digest design to make tests pass. It reported the
contradiction, supplied a measured probe, and named the decision it would have had to make. That is
the required behaviour under the Decision Gap contract.

## Remedy shape

The digest/transport contract is a **design decision**, so it is going to Codex for classification
before any further dispatch. The two candidate readings, for the classifier:

- **(A) Digest travels outside the signed body.** `bodyDigest` is removed from the body schema and
  supplied in a transport header (e.g. `X-Event-Body-Digest`) or as a separately-signed envelope
  header, mirroring how the existing implementation carries the signature. The body then needs no
  self-reference and the happy path becomes reachable.
- **(B) Digest is derived, not supplied.** The body carries no digest at all; the server computes
  `sha256(rawBody)` itself and includes **that computed value** in the canonical signed material.
  Tamper resistance then comes from the HMAC covering the computed digest.

Both readings preserve the Master Plan's requirement that the signature covers the body. They differ
in wire contract, so the choice must be made explicitly and recorded, not improvised.

## Verified current state

```
apps/hub-web/server/webhooks/signerRegistry.ts     7700 bytes  (created; TS2802 fixed)
apps/hub-web/server/webhooks/productEvents.ts     13032 bytes  (rewritten; digest defect present)
apps/hub-web/server/webhooks/productEvents.test.ts 3325 bytes  (UNTOUCHED - still old contract)
npx tsc --noEmit  -> exit 0 (PASS)
npx vitest run    -> exit 1 (FAIL)
```

`apps/hub-web/server/_core/env.ts` and `apps/hub-web/.env.example` were also modified by the first
lane to add the signer-registry configuration keys; the deprecated `productEventsHmacSecret` is
retained for non-product-event consumers only, and no real secret value was written.

No DB access, no deploy, no migration, no secret value anywhere.
