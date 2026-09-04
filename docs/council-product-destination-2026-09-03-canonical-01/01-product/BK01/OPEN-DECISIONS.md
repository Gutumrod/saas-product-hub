# BK01 Open Decisions

Status: Owner decisions blocking fully stable Product Gate / sellable V1

## OD-001 Auto-Slip Provider, Allowance, Cost, and Policy

Decision needed: choose provider and define included Pro allowance, unit economics/top-up, failure handling, and escalation.

Options:

- A: Choose provider now, lock allowance/cost, and require provider-backed evidence before Pro sale.
- B: Keep Pro private/beta until provider and economics are proven.
- C: Remove or defer Pro auto-slip from V1.

Council support: 3/3 agree this is unresolved and blocks Pro sale. 3/3 support preserving auto-slip as V1-required for Pro unless owner changes the contract.

Confidence: High.

## OD-002 Final Basic / Pro Prices

Decision needed: approve final public monthly Basic/Pro prices.

Options:

- A: Keep current pilot-reference prices only for pilot, then decide after WTP and variable-cost model.
- B: Lock public prices now after owner approval despite missing pilot evidence.
- C: Delay public price display until BK-C commercial lock.

Council support: 3/3 agree prices are provisional and not final. 3/3 agree Product Gate must not decide pricing.

Confidence: High.

## OD-003 WSTERA-Managed LINE Allowance Model

Decision needed: define whether WSTERA bears any LINE messaging cost for merchant-owned OA and how allowance/fair use is presented.

Options:

- A: Merchant bears OA/message cost; WSTERA only integrates and documents setup.
- B: WSTERA includes a managed allowance with clear cap and overage/top-up.
- C: Separate managed LINE add-on after V1.

Council support: 3/3 agree merchant-owned LINE is required for paid production and cost/allowance remains unresolved.

Confidence: High.

## OD-004 Cancel / Reschedule Window Defaults

Decision needed: choose default behavior when merchant has not configured change windows.

Options:

- A: Force configuration during onboarding before publishing.
- B: Set conservative product defaults.
- C: Keep nullable fail-closed and make UX explicitly explain unavailable changes.

Council support: 3/3 flag nullable fail-closed policy as unresolved risk; 1/3 explicitly warns this can hollow out the self-service promise.

Confidence: Medium-high.

## OD-005 DB Runtime Approval

Decision needed: provide approved PostgreSQL/Supabase runtime and authorize DB-backed gates.

Options:

- A: Approved local PostgreSQL/Supabase test runtime.
- B: Approved remote Supabase test project with safe scope.
- C: Continue blocking DB gates until infrastructure is ready.

Council support: 3/3 agree DB-backed gates are `BLOCKED_ENVIRONMENT` and public V1 cannot pass without runtime evidence.

Confidence: High.

## OD-006 Blacklist V1 Disposition

Decision needed: decide whether blacklist ships in V1, remains hidden optional, or moves post-V1.

Options:

- A: Ship as V1 optional with clear entitlement and limited surface.
- B: Keep implementation hidden/internal until after pilot.
- C: Defer to post-V1 and remove V1-facing copy.

Council support: 3/3 agree blacklist is V1 optional, not product-defining. 1/3 explicitly calls final disposition unresolved.

Confidence: Medium.
