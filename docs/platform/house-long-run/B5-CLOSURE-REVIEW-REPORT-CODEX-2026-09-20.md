VERDICT: `OWNER_DECISION_REQUIRED`

REVISION REVIEWED: frozen hub-web `679ff279e5ff2a9a3006bea79ccc6ccde90715ec`

## Disposition

The R15 apply was correctly not executed.

The R15 document explicitly says it is an evidence-preparation artifact, not execution authorization, and leaves P3, P4, U3, U5, and credential provisioning to the appropriate authority. Executing it without those decisions or a Billing Core read credential would have been an unauthorized, improvised production mutation.

The missing R15 authority is an `OWNER_HOLD`, not merely a non-blocking note. The manifest requires T5 to perform the approved R15 transition, and its stop conditions include a genuine business/security authority gap. T6 requires B5 approval; therefore progression to T6 is not permitted yet.

## Verified

- `apps/hub-web` is on branch `work/house-platform-closure-20260919` at exactly `679ff279e5ff2a9a3006bea79ccc6ccde90715ec`.
- Nested worktree is clean and upstream-parity evidence is consistent.
- The coordination record is committed at root SHA `bfdd221`.
- The frozen candidate correctly identifies `679ff279` as the sole candidate revision.
- The record honestly documents the initial Cloudflare `1010` edge-block mistake and the corrected observed result: application-level `401 {"error":"invalid signature"}`.
- The raw final result records 16/16 PASS.
- Capability activation was correctly skipped because required configuration material was absent and activation was explicitly sequenced after R15.

## BLOCKING findings

1. **R15 authority is missing.**  
   P3/P4/U3/U5 and `hub_web_app` provisioning are unresolved. The R15 plan itself forbids inventing these inputs. This blocks the R15 transition and therefore blocks B5 closure/T6 entry.

2. **T5 acceptance contract is not met.**  
   T5-WU05’s objective includes applying the approved R15 transition. That did not occur. Several WU06 contract items also remain untested, including Owner-authenticated surfaces and the synthetic fulfillment path.

3. **Capability activation remains blocked.**  
   Signer and Billing Core credentials are absent; activation cannot safely proceed before the required R15 sequence and verification programme.

## NON-BLOCKING findings

- The code-only deploy and zone hardening were within the prior R7 authorization.
- The live proof result is credible for the recorded probes because the final output contains the application’s actual `401 invalid signature`, not merely the edge `1010` response.
- The deployed version ID and rollback target are recorded, but cannot be independently proven from repository evidence alone under this read-only review.

## UNSUPPORTED CLAIMS

The statement that the corrected script “requires the application’s own 401 invalid-signature response” is too strong. The script actually accepts any `400/401/403` response whose body does not contain `error code: 1010`. The recorded run did produce the stronger `401 invalid signature` result, so this is a script-contract weakness, not evidence that this particular observed response was an edge block.

The repository also cannot independently establish that version `00bdb1b5-70d2-4e41-b97d-f1f238e9bf31` was built from `679ff279`; that remains operator/live evidence.

## UNTESTED AREAS

- R15 role, grants, denies, credential switch, and post-switch identity.
- Capability activation and its valid/invalid/kill-switch checks.
- Owner login and authenticated Work Queue, Owner Inbox, and Agent Activity.
- Synthetic fulfillment path.
- Independent live confirmation of deployed version, rollback addressability, and secret absence.
- Control request correlation, which remains design-only.

## T5 contract

`NOT MET`.

The code-only deploy/live-proof sub-lane completed, but the full T5 stage did not close. It must remain `PENDING / OWNER_HOLD`, not `BATCH_APPROVED`.

## What B6 may claim

No B6 review is authorized yet under the manifest. After Owner/provisioning authority resolves R15 and B5 is re-reviewed, B6 may claim only:

- exact repository and deployed-state reconciliation;
- explicit R15/capability status;
- the bounded 16/16 live-proof result;
- remaining blockers and untested areas.

It may not claim House final closure, `PRODUCTION_READY`, or `OPERATED_STABLE` while R15, activation, correlation, and required live acceptance evidence remain open.

