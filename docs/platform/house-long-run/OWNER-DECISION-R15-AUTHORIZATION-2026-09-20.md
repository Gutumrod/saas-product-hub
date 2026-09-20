# OWNER DECISION RECORD — R15 PROVISIONING AUTHORITY — 2026-09-20

Task: `WSTERA-HOUSE-PRODUCTION-CLOSURE-001` · Stage T5
Source: Owner directive delivered 2026-09-20 (verbatim content transcribed below by Hermes)
Status: **BINDING — supersedes the R15-authority OWNER_HOLD of the same date**

## Decision (verbatim substance)

**AUTHORIZE R15 TRANSITION** under the existing approved R15 plan and T5 manifest, bounded to
`T1-R15-DEPLOY-ROLLBACK-PLAN.md` D0 → D1 → D2 → D3 → D4 and the already approved R15 privilege matrices
/ Owner RLS ruling. **No redesign or expansion is authorized.**

| Item | Owner ruling |
|---|---|
| **P3** owner-credential retention | **APPROVED.** The owner credential must remain valid and retained out-of-band for rollback. Do NOT rotate, revoke, deactivate or delete it during this House task. Removal means only that the runtime stops *using* it after a successful switch. Rollback viability stays open through R15 → B5 re-review → T6/B6 → Owner closure, until a later explicit Owner rotation decision. |
| **P4 / U4** pre-data ordering | **APPROVED CONDITIONALLY.** Before D1 begins, D0 must verify the actual production state. Required: verify whether `billing_core` exists in Project A; verify whether `billing_core_staging` exists and where it actually lives; if the schema exists, verify whether billing data already exists; enumerate real objects, never invented probe names. Dispositions: (1) schemas present and pre-data condition satisfiable → continue R15; (2) billing data already exists such that the Master Plan pre-data gate can no longer be truthfully satisfied → STOP as OWNER_HOLD with exact evidence; (3) a required schema absent so the deny matrix yields `3F000`/inconclusive rather than a valid DENY proof → **STOP before D1/D3 and report the exact topology. Do not reinterpret schema absence as DENY PASS.** Hermes is not authorized to weaken or rewrite the R15 security gate to make it pass. |
| **U3** Worker secret command form | **APPROVED:** `npx wrangler secret put DATABASE_URL --name hub-web`. Value only from the canonical approved secret channel. Never print it, never write it into repo/docs/evidence/chat, never persist it to a plaintext artifact; record only secret NAME, operation result, target Worker, and non-secret identity evidence. If the canonical path cannot supply it safely → STOP; do not invent or reconstruct credentials. |
| **U5** rollback window | **RESOLVED.** Open until a separate Owner-authorized credential rotation after House closure. No owner-credential rotation/deactivation authorized by this task. |
| Provisioning authority | Owner delegates **Hermes** as deterministic provisioning operator for this bounded transition, permitted to use the existing authorized production administrative credential from the canonical secret path to inspect role/schema/privilege state, create `hub_web_app`, apply only the exact approved public grants, establish/verify the billing deny boundary, create/provision the scoped runtime credential, set the Worker `DATABASE_URL`, deploy the exact frozen candidate, and execute the approved verification and rollback sequence. **No privilege outside the reviewed R15 matrices is authorized.** |
| **D2.2** test authority | Durable production test data is NOT authorized. To prove write capability use a bounded transaction rolled back before completion (`BEGIN → exact scoped verification → verify → ROLLBACK`). No persistent synthetic business data may remain. If the operation cannot be proven safely without persistent business mutation → STOP and record the blocker. |
| Execution rule | D0 → verify P1–P4 + actual topology → D1 → D2 → D3 → D4 → B5 independent re-review. Any failed required verification: execute documented rollback if the runtime was switched, preserve evidence, do not patch forward outside the contract. |
| Still NOT authorized | destructive DB operations; DROP/DELETE/data clearing outside the documented rollback of the newly created R15 role; billing/provider mutation; Stripe Live changes; PromptPay expansion; Control payment authority; security architecture redesign; paid services; secret disclosure; weakening RLS; granting `hub_web_app` access to `public.profiles`; `BYPASSRLS`; CREATE/ownership/privilege escalation; changing `canExecutePaymentActions: false`. |
| Capability config | R15 authorization does not permit inventing missing application credentials. `PRODUCT_EVENT_SIGNERS` and `BILLING_CORE_CONTROL_READ_*` may only be activated from existing/generated material through their already-approved contract and canonical secret path. If the material or a reviewed provisioning procedure does not exist, keep the capability fail-closed/inert and report the exact blocker. Do not invent a credential protocol to close T5. |
| Owner-authenticated surfaces | Owner login, Work Queue, Owner Inbox, Agent Activity remain **required live-verification items**. Absence of a saved browser credential is not authority to bypass authentication. Preserve as pending Owner-visible verification; do not fabricate PASS evidence. |
| Re-ask rule | Do not ask Owner again for P3/P4/U3/U5 **unless actual D0 evidence contradicts one of the conditions above or exposes a new architecture/security authority gap.** |

## Consequence — what this decision did and did not authorize here

D0 was executed under this authorization and **stopped before D1** under the P4/U4 clause 3
condition, because the deny-target schemas are absent from the project R15 targets. D0 evidence also
exposed a **new architecture gap**, which the re-ask rule explicitly permits being raised:
`billing_core` / `billing_core_staging` live in **WSTERA_LAB**, not in Project A.

The current authoritative state, the exact topology, and the options now requiring an Owner ruling are
in **`R15-D0-PREFLIGHT-OUTCOME-2026-09-20.md`**.

No privilege was exercised beyond the reviewed matrices; no role, grant, deny, credential, secret or
deploy resulted from this authorization.
