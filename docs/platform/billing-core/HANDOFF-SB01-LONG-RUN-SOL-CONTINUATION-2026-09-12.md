# HANDOFF — SB01 LONG-RUN — SOL CONTINUATION — 2026-09-12

Program: `SB01 — WSTERA Central Billing Core`
Task ID: `SB01-LONG-RUN-2C-2F-001`
Owner: `Free`
Commander / Final Verify: `Sol`
Orchestrator: `Hermes`
Workflow: `WF-RELAY-01 v1.2.0`
Supporting workflow: `WF-DEV-01 v1.1.0`
Runtime procedure: `kanban-external-agent-dispatch v2.3.8`
Current phase: `LR-2C — FIX-01 real LAB + Stripe TEST vertical-slice`

## Mandatory continuation rule

Do not create a new Task ID. Continue `SB01-LONG-RUN-2C-2F-001`.
Do not infer execution authority from chat. Read the canonical files and current repo state first.
Do not reuse a stale worker dispatch across checkpoints; every resumed material round needs a fresh dispatch pinned to the exact current revision.
Hermes remains Clerk/Orchestrator only; AGY/Qwen are primary workers; Codex is verifier/routing authority; Claude is difficult-work closer only; Sol/Owner retain final authority.

## House canonical state

House repo: `Gutumrod/saas-product-hub`
House worktree: `D:\AI-Workspace\runtime\worktrees\house-billing-core-20260909`
House branch: `work/billing-core-systemize-20260909`
Current House HEAD at handoff: `5ff34caec51ef29ebdf9501bd467af02d326dc58`
Canonical long-run brief: `docs/platform/billing-core/BRIEF-SB01-LONG-RUN-RELAY-PHASE2C-2F-2026-09-12.md`

Production portability rule was added and pushed at House commit `5ff34caec51ef29ebdf9501bd467af02d326dc58`.
It locks LAB as temporary proof infrastructure and requires tracked source/migrations/contracts to remain portable to Production without redesign.
LAB/Test-specific values must stay behind config/profile/secret boundaries. LAB test data must not be promoted as production data.
Stripe CLI localhost listener/signing secret is TEST-only; Production requires a separately provisioned public endpoint and signing secret after explicit Owner authorization.

## SB01 execution repo state

Repo: `Gutumrod/stripe-billing`
Worktree: `D:\AI-Workspace\runtime\worktrees\sb01-central-billing-20260909`
Branch: `work/sb01-central-billing-pc-20260911`
Tracking target: `origin/feature/central-billing-phase2-runtime`
Local HEAD read directly from the worktree ref at handoff: `87dc09480c72ffc3701c655cb4f04166a9cd5c5e`
GitHub remote branch observed during handoff at `e102e3f7679202930cee995b8499b286b8125ab7`.
Therefore remote parity MUST be revalidated before the next material dispatch; do not assume 0/0 from older reports.

Canonical task file:
`docs/tasks/TASK-SB01-LONG-RUN-2C-2F-001.md`

Important: that task file still contains the older FAIL-CLOSED credential HOLD text when last inspected. It is stale relative to the newly proven credential state below. Hermes must persist a fresh checkpoint before releasing Qwen.

## Accepted LR-2C repair state before credential unblock

Fresh Codex QA previously routed `FIX_BY_QWEN`.
Qwen repaired FIX-02/FIX-03:
- repair material SHA `e61a8f736e1d3077f550c4b597a157bcabf59293`
- returned branch checkpoint SHA `6309a08f7c125609217f2d64e93a6d7c68810e04`
- runtime build PASS
- typecheck PASS
- runtime tests `42/42 PASS`
- profile registry `16/16 PASS`
- material-range `git diff --check` PASS

FIX-01 remained blocked only because the real TEST credentials/runtime evidence were unavailable to Qwen at that time.

## Credential blocker status — now unblocked

### WSTERA LAB database
Owner/Claude subsequently validated the canonical `BILLING_DATABASE_URL` successfully after switching away from the unusable Direct IPv6 path.
Treat the DB credential blocker as resolved, but Hermes must persist sanitized verification evidence/checkpoint before worker release.
Never expose or commit the database URI/password.

### Stripe TEST account
Known TEST key corresponds to Stripe account:
`acct_1U2L8zHB4GRCffd9`

Read-only Stripe verification found zero existing webhook endpoints in the TEST account before local listener setup. No historical webhook signing secret existed to recover.

### Stripe TEST webhook listener
Claude installed Stripe CLI and started a TEST listener forwarding exactly to:
`http://127.0.0.1:8787/webhooks/stripe`

Subscribed TEST events:
- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.paid`
- `invoice.payment_failed`

Listener PID reported: `16168`.
The listener-generated `STRIPE_WEBHOOK_SECRET` was stored in `D:\AI-Workspace\.secrets\keys.txt` and registered in `D:\AI-Workspace\.secrets\registry.tsv` without printing or committing the value.

Claude verified the listener secret against a real Stripe TEST-triggered event with HMAC signature match = true. The temporary verification server was shut down afterward.
The actual SB01 runtime was not running during the first trigger, so the listener correctly reached `/webhooks/stripe` but got connection refused. That is expected until Qwen starts the Core runtime during FIX-01.

Critical operational note: the CLI webhook secret is ephemeral and tied to the active `stripe listen` session. If PID `16168` is no longer running, fail closed: start a fresh TEST listener, capture the newly generated signing secret, update vault + registry, then continue. Never reuse a dead-listener secret as if still valid.

## Immediate next action — Hermes

Owner has authorized continuation. Send/allow Hermes to resume the SAME task.
Hermes must first create a new persisted checkpoint:
`LR-2C FIX-01 — REAL TEST CREDS READY`

Before releasing Qwen, Hermes must verify fail-closed:
1. `BILLING_DATABASE_URL` connects to the intended WSTERA LAB target.
2. Stripe TEST secret key is present and account is `acct_1U2L8zHB4GRCffd9`.
3. `STRIPE_WEBHOOK_SECRET` is present in the canonical vault.
4. Stripe listener is alive and forwards to `http://127.0.0.1:8787/webhooks/stripe`.
5. Exact current SB01 HEAD/branch/remote parity are recorded.
6. The stale task checkpoint is updated to the actual credential-ready state.

If any of these fail, HOLD. Do not fabricate, mock, downgrade, or silently regenerate anything without recording the checkpoint transition.

## Fresh worker route

After the credential-ready checkpoint passes, Hermes must create a FRESH Qwen FIX-01 dispatch pinned to the exact current revision. Do not reuse `AGENT-DISPATCH-SB01-LR-2C-QWEN-REPAIR-2026-09-12.md` as the active packet because its credential assumptions/checkpoint are stale.

Qwen scope is the remaining real LR-2C vertical slice only:
- start SB01 Core HTTP boundary;
- execute valid PS01 checkout through Core API;
- use WSTERA LAB + Stripe TEST only;
- persist/verify operation, customer, and provider mappings;
- re-fetch Stripe TEST object as financial truth;
- prove negative-authority constraints remain intact;
- exercise a real Stripe TEST-signed webhook through the Core route where LR-2C evidence requires it;
- record sanitized evidence only.

Then run the deterministic gate and a FRESH Codex verification against the exact returned revision.

Codex routing remains exactly:
- `PASS`
- `FIX_BY_AGY`
- `FIX_BY_QWEN`
- `SEND_TO_CLAUDE`
- `SOL_OWNER_DECISION_REQUIRED`

If Codex returns `PASS` for LR-2C, Hermes may persist closure and advance to LR-2D under the long-run brief.
Do not involve Claude again unless Codex returns `SEND_TO_CLAUDE` or Sol explicitly authorizes another difficult-work closure.

## Remaining long-run route

`LR-2C PASS -> LR-2D webhook durability/reconciliation -> LR-2E entitlement + multi-Product isolation -> LR-2F Control read-contract projection -> HARD STOP for Sol/Owner`

Final mandatory hard stop remains:
`READY FOR SOL/OWNER REVIEW — SB01 PHASE 2F PROJECTION CONTRACT`

Control Plane remains read-only consumer only. Control must not implement billing/payment mutation.

## Absolute prohibitions

No Stripe LIVE mutation. No production database mutation. No production webhook registration. No Control billing implementation. No BK01/MT01/PromptPay expansion. No mock-only downgrade. No worker self-approval. No silent Task ID change. No stale dispatch reuse.

## New-chat first move

The receiving Sol chat must read this handoff, the long-run brief, the current task file, and the exact current repo state before issuing any new directive.
First resolve from evidence whether Hermes has already persisted `LR-2C FIX-01 — REAL TEST CREDS READY` and released the fresh Qwen packet. If not, that is the immediate next action.
