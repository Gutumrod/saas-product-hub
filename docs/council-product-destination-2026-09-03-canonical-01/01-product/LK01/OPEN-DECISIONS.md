# LK01 Product Gate Open Decisions

Gate: Product Gate only  
Verdict carried from synthesis: **REMEDIATE**

## OD-001 - V1 Build-Core Boundary

Decision: Define whether V1 build approval means Phases 1-3 only, or Phases 1-4 for paid-launch language.

Options:

- A (Recommended): Product V1 core = Phases 1-3; Phase 4 billing = monetization gate before paid launch.
- B: Product V1 build core = Phases 1-4 because billing is needed to sell.
- C: Split into Free V1 and Paid V1 with separate gate language.

Council support: 3/3 agree the distinction must be locked; 2/3 favor Phases 1-3 as smallest V1 product core.

## OD-002 - First Paid-Launch Feature Cut

Decision: Confirm which paid features are allowed in first paid launch.

Options:

- A (Recommended): No Phase 5 paid features in V1 core; first paid launch uses billing/higher limits only unless later ADR adds scope.
- B: Include custom domain in first paid launch.
- C: Include custom domain plus campaign/UTM/export/API/team.

Council support: 3/3 agree Phase 5 features are non-V1 by default; 3/3 agree paid-launch cut needs owner confirmation.

## OD-003 - Stripe Thailand / PromptPay Preflight

Decision: Lock the product rule before any billing work is considered launchable.

Options:

- A (Recommended): PromptPay cannot launch until eligible Stripe Thailand account, pinned API version, card and PromptPay test flows, and provider-truth reconciliation are verified.
- B: Launch card first and keep PromptPay disabled until reconciliation is verified.
- C: Allow PromptPay earlier with manual ops reconciliation.

Council support: 3/3 support mandatory preflight and reconciliation before PromptPay release.

## OD-004 - Custom-Domain and Apex Promise

Decision: Define what is promised before Phase 5 verification.

Options:

- A (Recommended): Do not promise apex; promise only verified custom-hostname behavior after Cloudflare re-check in Phase 5.
- B: Promise subdomain support only.
- C: Promise apex and subdomain support now.

Council support: 3/3 agree custom-domain/apex behavior is unresolved and must be re-verified.

## OD-005 - Bot-Filter and Abuse Thresholds

Decision: Lock the initial public redirect abuse stance.

Options:

- A (Recommended): Define conservative initial thresholds for bot filtering, unsafe destination validation, edit-rate limits, and moderation, then refine in Beta.
- B: Defer all thresholds to implementation.
- C: Launch with only generic rate limiting.

Council support: 3/3 agree bot/abuse thresholds are unresolved; 3/3 agree public redirect abuse is a real product risk.

## OD-006 - Analytics Retention and Deletion

Decision: Define whether expired/downgraded analytics is hidden, hard-deleted, aggregated, or retained under policy.

Options:

- A (Recommended): Define separate detail retention, aggregate retention, downgrade visibility, deletion job, and audit/security retention policy before Product Gate PASS.
- B: Hide data beyond plan visibility but decide deletion later.
- C: Keep all aggregate/detail data indefinitely unless user deletes tenant.

Council support: 3/3 agree retention/deletion specifics are unresolved.

## OD-007 - Redirect SLO

Decision: Define how V1 handles redirect performance promises.

Options:

- A (Recommended): Keep public SLO deferred to Beta measurement, but set an internal provisional engineering budget for Phase 2 verification.
- B: Defer all SLOs until Beta.
- C: Lock a public latency/availability SLO now.

Council support: 3/3 agree exact redirect SLO is unresolved/deferred.

## OD-008 - Free Destination Change Limit

Decision: Decide whether the locked "one lifetime destination change per free link" remains untouched for V1.

Options:

- A (Recommended): Keep locked value for V1; monitor Beta evidence and require ADR for change.
- B: Change to one destination edit per month.
- C: Remove the free edit limit.

Council support: 1/3 explicitly raised this as a concern; 3/3 did not dispute the locked current rule.
