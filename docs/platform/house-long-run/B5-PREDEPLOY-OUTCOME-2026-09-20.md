# B5 PRE-DEPLOY REVIEW OUTCOME — WSTERA-HOUSE-PRODUCTION-CLOSURE-001

Review Batch: **B5 — Production Readiness / Live Boundary** (pre-deploy gate)
Reviewer: `agent-codex` (independent) · Recorded: 2026-09-20 (Asia/Bangkok)
Candidate reviewed: hub-web `15b1579040724cd8430041527aedb5fa8b0b7275`

## Verdict: `WORKER_FIX` — deploy NOT approved in its current form

The reviewer accepted the zone-level HTTP→HTTPS approach and TLS 1.2 as appropriate, but ruled that
**the intended deploy window is blocked** because it includes activating two new capabilities while
mandatory operational artifacts are missing.

## Blocking findings — each verified by Hermes against the code

### BLK-B5-1 — signer configuration is not whole-config fail-closed

`server/webhooks/signerRegistry.ts:101-147`: malformed entries are skipped while valid ones stay
active. This is the **same defect class** that BLK-B4-1 fixed in the Billing Core config parser, and it
was fixed there but not here. A partially-malformed signer registry leaves Control accepting events
under a configuration the operator believes is invalid.

**Fix:** reject the entire configuration on any malformed entry or ambiguity; add a mixed
valid/malformed test.

### BLK-B5-2 — Billing Core accepts plaintext base URLs and sends credentials to them

`server/control-plane/adapters/billing-core-transport.ts:89-95, 487-492`: the base URL is not required
to be HTTPS, so a mis-configuration could send the `control_read` token and assertion secret over
plaintext HTTP. The T4 review checked the response path; nobody checked the transport scheme.

**Fix:** require HTTPS (permit an explicitly isolated test scheme only), before credentials are used.

### BLK-B5-3 — readiness evidence is revision-inconsistent

The Production Readiness Record names `381fef3` while T5-WU03 freezes `15b1579`. Any G1–G10 statement
tied to the older SHA is therefore not evidence for the candidate. **Hermes's own defect** (third
document-staleness defect in this task).

**Fix:** recreate/update the record against `15b1579`.

### BLK-B5-4 — the repository-wide "no billing/customer mutation" claim is false or insufficiently scoped

The reviewer found that `server/routers.ts:110-112` exposes `customersTree` and `:158-187` exposes
`executeBillingAction`, i.e. customer enumeration and a billing action through the live app router —
which contradicts the invariant claim carried from T3/T4.

**Hermes investigated this directly, because it determines whether the deploy is safe:**

- `controlPlaneService` uses `DemoControlPlaneRepository`
  (`service.ts:14`), backed by `DEMO_*` fixtures.
- `DemoCommandExecutor` is fixture-based and its own code says
  "Deterministic simulation outcome hook (Phase 7)".
- A grep across the whole control-plane for `getDb` / `sql\`` / `drizzle` / `postgres` (excluding tests)
  returns **nothing** — the control plane is **fixture-only and does not touch a database, Stripe, or
  any provider**.

So `executeBillingAction` is a **simulation**, not a payment mutation. The invariant is not violated in
substance — **but the claim as written is wrong**, because it asserts the whole Control surface has no
billing-mutation capability when the router does expose such an endpoint operating on demo fixtures.

**This is classified BLOCKING / OWNER SCOPE by the reviewer.** Two dispositions are possible:

- **(a)** Owner explicitly scopes `customersTree` / `executeBillingAction` as pre-existing
  simulation-only behaviour, and the invariant claim is rewritten to say so precisely
  (`canExecutePaymentActions` false **and** any billing-action endpoint operates only on demo fixtures,
  with no provider/DB path) — then T5 may proceed.
- **(b)** The endpoints are remediated before deploy.

Hermes does **not** have authority to decide that a pre-existing, demo-scoped capability is acceptable
on the Owner's behalf, and must not silently rewrite the claim to make the deploy pass.

### MAJOR findings (block `PRODUCTION_READY`, per the reviewer's explicit ruling)

- **MAJOR-B5-1** — no documented kill-switch/escalation path for the newly-active config capabilities.
  The reviewer ruled this **blocks activating the two new capabilities**. The practical
  secret-removal rollback must be documented before activation.
- **MAJOR-B5-2** — no Control request-correlation evidence: the transport creates an outbound
  `operation_id` but does not establish end-to-end request correlation.

### Readiness-gap ruling (the reviewer answered the question explicitly)

| Gap | Ruling |
|---|---|
| Runbook | **blocks `PRODUCTION_READY`**; acceptable only as a recorded risk for a limited `BUILD_PASS` deployment |
| Kill-switch/escalation | **blocks activating the new capabilities AND blocks `PRODUCTION_READY`** |
| Control request correlation | blocks `PRODUCTION_READY`; not by itself a blocker for a code-only deploy with Billing Core still inert |

> "Overall intended window includes capability activation, so the current gaps block approval of the
> proposed deploy window."

### G1–G10 honesty review — accepted, and it corrects Hermes's own record

The reviewer flagged several entries as **stale or overstated by Hermes**:

- G2 PASS is tied to `381fef3`; overstated for `15b1579` unless the exact-SHA 25/358 run is attached.
- G3 and G9 rollback GAPs are stale — T5-WU03 records a target and procedure.
- G5 dependency-audit GAP is stale — T5-WU03 records the candidate audit.
- G6 Control auditability should stay **PARTIAL**, not full PASS, until correlation evidence exists.
- G8's exact candidate is **stale and incorrect** — must say `15b1579`.
- The "no billing mutation" line is overstated (BLK-B5-4).

### Non-blocking

- CSP blocks a GitHub avatar in the currently unreachable `ComponentShowcase`.
- The header drift guard checks **containment** rather than exact equivalence.
- No HTTP/TLS compatibility inventory exists.

## Conditions the reviewer attached to any approval

1. Fix signer parsing to reject the whole configuration on any malformed entry, with tests.
2. Reject non-HTTPS Billing Core base URLs before credentials are used.
3. Update the readiness record and all G8/G9 rollback references to `15b1579`.
4. Resolve and document the `customersTree` / `executeBillingAction` invariant conflict.
5. Record runbook, kill-switch, escalation owner and Control request-correlation design before
   claiming `PRODUCTION_READY`.
6. WU05 must recheck branch, SHA, clean status, remote parity and build from the exact candidate
   immediately before deployment.
7. **Deploy with both new configs absent**; activate `PRODUCT_EVENT_SIGNERS`, verify
   fail-closed/valid/wrong-product behaviour, **then** activate Billing Core config and verify
   truthful/degraded behaviour. (Sequenced, not simultaneous.)
8. Verify secrets by presence/fingerprint only.
9. Verify the Cloudflare rollback version before mutation and capture the deployed artifact/version
   identity before WU06.

## Hermes's assessment of routing

Three findings (BLK-B5-1, -2, -3) are ordinary technical repairs with clear fixes. BLK-B5-4 plus the
kill-switch MAJOR require an **Owner scope ruling** before the capability activation can proceed, which
is exactly the boundary the Owner's standing direction reserved (conditions unchanged materially).

The reviewer's sequencing condition (gap 7) already gives a safe partial path: a **code-only deploy with
both configs still absent** keeps the new capabilities inert and closes only the hardening gap. Whether
that partial deploy should proceed without the Owner scope ruling is recorded here as the open question,
not decided unilaterally.
