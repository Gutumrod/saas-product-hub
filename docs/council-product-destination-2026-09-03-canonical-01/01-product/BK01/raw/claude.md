# BK01 — Booking by WSTERA: Independent Product-Gate Expert Answer (Claude)

Gate question: *What exactly should Booking by WSTERA be, for whom, and where does V1 end?*
Role: independent Council expert. No gate verdict issued. Pricing/revenue/competition left to the Business/Market gate. No Stage 4 code/migration/runtime changes reopened. All evidence below was opened and read from the repo/docs, not recalled from memory.

Repo under review: `D:\AI-Workspace\projects\saas-product-hub\products\booking`
Brief: `docs/council-product-destination-2026-09-03-canonical-01/01-product/BK01/COUNCIL-BRIEF.md`
Branch observed: `feature/bk-a-v1-contract-remediation` @ `213360a` (working tree clean).

---

## Recommendation

BK01 should be a **Thailand-first, single-location appointment-operations SaaS for small hair/barber/beauty/nail businesses**, whose defensible identity is the combination of **(a) reliable staff scheduling, (b) Thai-native PromptPay deposit flow, and (c) merchant-owned LINE operations**, packaged as a **booking + service-operations product** (not a generic queue ticket, not a marketplace, not a clinic/POS/ERP system). The V1 finish line is the **self-service first-value loop end-to-end**, gated on: (1) all `01_PRD.md` "Required" rows closed by BK-A with DB-backed and provider-backed evidence, (2) the auto-slip Pro provider decision, (3) pilot willingness-to-pay and (4) owner approval of final Basic/Pro prices, then (5) full `09_TEST_RELEASE_GATES.md` passage including the DB runtime gates (CONT-04) plus independent review PASS, before public V1 sale.

What BK01 is **not**: medical/clinical, multi-branch, marketplace/commission, POS/inventory/payroll/accounting, full CRM/marketing-automation, or an annual-billing surface. CM01 (Booking Claim & Case Management Module) is an explicitly separate product (dev/agency one-time template buyer); it must **not** be collapsed into BK01 despite the name.

Where V1 ends: BK-D public V1 launch is the finish line for the sellable product, but that launch cannot start until every `V1 REQUIRED` row has passing traceability evidence. So the concrete "V1 ends here" statement is: **V1 ends at a collision-safe public booking page + merchant deposit/review + confirm/change/cancel/complete/no-show + required LINE notifications + monthly Stripe billing + owner export/closure for a single-location primary-ICP shop — with auto-slip as a V1-REQUIRED Pro capability — plus every non-V1 item explicitly excluded below.**

---

## Verified facts / evidence used

All facts opened and read in full from the repo/docs:

1. **Product identity & ICP (LOCKED 00_PRODUCT_VISION.md + 01_PRD.md + PRODUCT_DECISIONS.md):**
   - Vision categorizes BK01 as a "Thailand-first appointment operations SaaS with LINE-assisted customer communication and PromptPay-native deposit workflows" — not queue ticketing, clinic, marketplace, POS, ERP, or multi-branch (Vision lines 7-25).
   - Primary ICP locked PD-001: single-location hair/barber/beauty/nail, ~1-10 providers, Thai, LINE-centric, deposit-required services, no customer-installed app (PRODUCT_DECISIONS PD-001; ICP_JTBD §1-2).
   - Secondary ICP (later): massage/spa/non-medical wellness — kept secondary until resource/rotation/package validation (ICP_JTBD §2).
   - Vision V1 outcome + explicit non-goals (Vision lines 27-40).

2. **Frozen target V1 contract (01_PRD.md) — all rows marked LOCKED 2026-08-28:** FR-* functional, SEC-* security, REL-* reliability, OPS-* operational, NFR-* non-functional requirements. Public-launch blocker statement (§80-81): cannot market until all Required rows have passing traceability evidence; baseline gaps are BK-A work, not doc exceptions.

3. **Domain rules (05_BOOKING_DOMAIN_RULES.md, LOCKED):** canonical statuses `hold/pending_review/confirmed/completed/cancelled/no_show/expired`; deposit statuses `not_required/awaiting/submitted/verified/rejected/refunded`; 7-point bookable-slot rule; fail-closed missing schedule; Any Staff lowest-workload policy; 15-min hold expiry; no-deposit atomic confirm; private slip + no public `promptpay.io`; reschedule V1-REQUIRED with atomic old-release/new-reserve; cancellation within merchant policy; explicit completed/no-show (never inferred from elapsed time); blacklist V1-OPTIONAL; entitlement quota rules; merchant-owned LINE for paid production.

4. **UX flows (06_UX_USER_FLOWS.md, LOCKED TARGET V1):** customer booking, change/cancel/reschedule, owner onboarding, owner/admin daily, staff self-scope, platform operator flows.

5. **Roadmap (10_DEVELOPMENT_ROADMAP.md):** rules that roadmap governs future build order; BK-A (V1 contract remediation), BK-B pilot readiness, BK-C commercial lock, BK-D public V1 launch; post-V1 candidates explicitly annual/multi-branch/CRM/marketplace/API/advanced analytics/medical (excluded). 2026-09-03 reconciliation: Stage 4 Option A migration reconciliation CLOSED at `836943a`; CONT-03 all-non-DB gates PASS at HEAD `908108c`.

6. **LOCKED owner decisions (PRODUCT_DECISIONS.md, approved 2026-08-28):** PD-001 ICP; PD-002 retire paid 100/500 walls; PD-003 ฿490/฿990 are pilot/reference, not final; PD-004 auto-slip V1-REQUIRED for Pro before sale; PD-005 merchant LINE OA for paid; PD-006 staff explicit identity + own scope; PD-007 private slip storage; PD-008 annual POST-V1; PD-009 customer reschedule/cancel V1-REQUIRED; PD-010 reminders V1-REQUIRED; PD-011 controlled QR, no `promptpay.io`; PD-012 CSV export + closure flow; PD-013 no-show V1 action; PD-014 blacklist V1-OPTIONAL; PD-015 multi-branch POST-V1; PD-016 medical excluded; PD-017 canonical host `bk01.wstera.com` two-Worker routing; PD-018 ticket module = V1 operational/support capability, not lead marketing feature.

7. **Pricing/entitlements (04_PRICING_ENTITLEMENTS.md, LOCKED structure / price provisional):** Trial ฿0/14d/50 eval bookings/≤5 staff; Basic pilot-ref ฿490/mo not final; Pro pilot-ref ฿990/mo not final; monthly-only billing V1; effectively-unlimited paid booking + fair-use; staff ≤5/≤10; merchant-owned LINE paid; auto-slip Pro V1-REQUIRED; price-lock gate defined (final price requires V1 contract + variable-cost model + pilot WTP + competitor refresh + owner approval).

8. **Current status (CURRENT_STATUS.md, 2026-09-03):** BK-A remains open; CONT-03 still requires remediation + independent review (CONT-04 DB gates env-blocked); no production deploy/DB apply verified; P0a-C1 now PASS, BK01 eligible as next heavy track.

9. **Contradiction register (audit/CURRENT_TRUTH_AND_CONTRADICTIONS.md):** baseline gaps inventoried and RESOLVED at product-contract level via the locked decisions; BK-A carries implementation gaps (private slip, staff mapping, annual removal, legacy quota removal, LINE boundary, reminders, auto-slip, QR, reschedule, no-show, export, ticket scope, absolute-copy removal, commercial copy reconciliation). ROLE-003 staff ticket scope narrowed; CLAIM-001 `ปลอดภัย 100%` removed; COMM-001 stale commercial copy. Section 5 confirms no verified cross-tenant bypass.

10. **BK-A implementation evidence (audit/BK-A-IMPLEMENTATION-EVIDENCE-2026-08-29.md) + daily log 2026-09-03:** A1-A14 implemented; `npm test` 19/19 PASS, lint PASS (0 errors, 13 warnings), build PASS (consumer+admin, Next.js 16.3.0), `git diff --check` PASS, static absence (no `promptpay.io`, no annual offer, no legacy 100/500, no absolute claim), secret scan PASS — all re-verified at CONT-03 HEAD `908108c`. Independent review (agent-codex) verdict PASS, 0 P0/P1, 2 P2. DB-backed gates G2 + DB portions of G3-G9 **BLOCKED_ENVIRONMENT** (no local PostgreSQL/psql/Docker per brief). No real LINE/Stripe/PromptPay/auto-slip provider call made.

11. **Native capability before Module Hub overlap — verified on disk:**
   - Booking has its **own native in-app ticket/support system**: `supabase/migrations/20260818000000_local_service_tickets.sql` (tickets + ticket_timeline_entries in `local_service` schema) and admin ticket UI (`apps/booking-admin/src/app/dashboard/tickets/page.tsx`, `.../new/page.tsx`, `.../[id]/page.tsx`, `src/lib/ticket-service.ts`, `src/lib/ticket-domain.ts`, `src/i18n/ticket-i18n.ts`). This is the basis for FR-SUP-001 / PD-018 (V1 REQUIRED operational/support capability; staff restricted to own scope per ROLE-003/PD-006; owner/admin only shop-wide tickets).
   - Product registry (`docs/products/registry.yaml`): CM01 `booking_ticket_module` is its OWN family, explicitly NOT grouped with booking/BK01 despite the name; owner decision 2026-08-26; disjoint customer bases (dev/agency template buyer vs booking SME tenant), no shared live code path (historical ancestor port only). Booking's native ticket system is Supabase-RLS-backed; CM01 is a local-first React template with no backend. **Do not collapse CM01 into BK01.**

12. **Feature traceability (audit/FEATURE_REQUIREMENT_TRACEABILITY.md):** disposition register maps each feature to requirement, role, entitlement, authority/API, UX negatives, analytics, release evidence, marketing claim — the traceability rule and the cross-cutting security rows (tenant isolation, public minimization, secret handling, collision reliability, provider fail-safe) are V1 gates.

13. **Registry deployment facts:** BK01 `deployment_model: shared_runtime`, `runtime_project: Project B`, `schema: local_service`, `commercial_status: sellable` (registry); canonical host `bk01.wstera.com` reserved, **not live**; two-Worker OpenNext@cloudflare (wstera-consumer/wstera-admin) scaffolded but not deployed, subdomain not attached.

---

## Key reasons

1. **Identity is operations + deposits + LINE, not just "booking."** The vision and PD decisions converge on that combination as the defensible differentiator; LINE or PromptPay alone are commodity in Thailand, and the core value is keeping staff availability/deposits/changes/communication consistent — which is service-operations, not a ticketing tool (Vision §8-9, core value; ICP_JTBD §4-6).

2. **The ICP is deliberately narrow and well-evidenced.** Single-location primary-ICP (PD-001) fits the current staff/time/deposit domain, 29-migration schema and two-app surface. Broader verticals (clinic, multi-branch) are explicitly POST-V1/excluded to avoid scope creep (PD-015, PD-016; Vision non-goals).

3. **V1 finish line is already contractually defined and traceable.** 01_PRD.md, 05, 06, traceability, and pricing entitlement collectively define exactly what "done V1" means; the roadmap makes BK-A→BK-B→BK-C→BK-D the ordered path. The finish line is therefore not ambiguous, only not-yet-achieved due to DB-env and owner-decision blockers.

4. **Product-defining capabilities are already locked by owner decisions:** merchant-owned LINE (PD-005) and PromptPay-native deposit with private slips + controlled QR (PD-007, PD-011) define the money/communication trust surface; staff explicit identity + own scope (PD-006) and tenant safety define the tenancy/security surface; auto-slip is treated as table-stakes Pro capability (PD-004) rather than optional; reschedule/cancel/reminders are V1-REQUIRED (PD-009, PD-010). This answers the gate's "which capabilities are product-defining" point with the owner's own locked decisions.

5. **Booking/ticket/support is native and must be distinguished from CM01.** FR-SUP-001/PD-018 scope support tickets as a V1 operational capability (owner/admin), not a lead feature; and the registry/CM01 disambiguation requires separation from the standalone CM01 template. Native capability verified in the booking repo source, so Module Hub overlap must be evaluated read-only for genuine reuse, not assumed.

6. **The remaining blockers to a stable Product Gate are concrete, not speculative:** DB-backed gates need an approved PostgreSQL/Supabase runtime; final prices/auto-slip provider/LINE cost-model are owner decisions; pilot evidence for WTP is unproven. These are the exact "unresolved owner decisions that prevent a stable Product Gate" the brief asks for.

---

## Risks / failure cases

1. **DB-backed release claims without runtime proof.** G2 and DB-backed G3-G9 cannot be labeled PASS (BLOCKED_ENVIRONMENT). A product gate that treats the non-DB static/build surface as release-complete risks shipping collision-safety, tenancy/RLS, concurrency-overlap, Stripe ordering and provider fail-safe before they are actually proven under PostgreSQL. This is the single largest release-integrity risk.

2. **Auto-slip Pro promise ahead of implementation/provider.** PD-004 makes Pro auto-verification V1-REQUIRED before sale, but provider, allowance, unit economics/top-up and failure policy are still open owner decisions, and no provider call has ever been made. Selling Pro before this closed would repeat the exact contradiction the product lock process was meant to end.

3. **CM01/BK01 name-collapse risk.** Booking's native ticket tables + the standalone "Booking Claim & Case Management Module" (CM01) share a "booking ticket" name pattern. If a marketing/shop copy or portfolio reader collapses them, it would misassign capability or create a false claim of reuse/integration that the registry explicitly denies. Must keep them distinct in every surface.

4. **Price/feature mismatch.** ฿490/฿990 presented as final without a locked feature contract + pilot WTP + competitor refresh would violate the price-lock gate and PD-003, repeating COMM-001.

5. **Merchant-owned LINE cost shifting.** LINE is product-defining but the merchant bears OA plan/message cost in paid production; if that cost model and the managed-LINE allowance are not made explicit (PD-005 / pricing §LINE), merchants may churn or feel misled about "LINE-assisted" positioning.

6. **Missing-schedule / cancel-window defaults.** Roadmap notes cancel/reschedule windows are nullable and fail closed until configured; if a production shop is never configured they get a degraded (non-reschedulable) experience, or conversely a shop may assume a default that does not exist.

7. **No-shows and KPI truth if status actions are incomplete.** No-show is V1-REQUIRED but must remain an explicit owner action, never elapsed-time inference — a regression would corrupt the very retention/deposit metrics V1 success evidence depends on.

---

## Assumptions

- "Approved PostgreSQL/Supabase runtime" (per brief, no Docker on the active Windows host) will become available so CONT-04 DB gates can be genuinely run; I assumed Docker-install prohibition is fixed and cannot be worked around.
- The locked docs (Vision/PRD/domain/UX/decisions/entitlements/traceability, all 2026-08-28 LOCKED) remain the governing contract; no later owner override was supplied in this task.
- BK-A remediation scope as recorded in the implementation evidence is the intended close-out path; the independent review PASS (0 P0/P1) is trusted as documented but DB-backed evidence is still required.
- The two junk kanban cards and any dispatch-side noise are irrelevant to product assessment.
- Pricing/revenue/competition remain out of scope here per brief (Business/Market gate).

---

## Open questions / missing evidence

- **Approved test PostgreSQL/Supabase runtime**: when will it be provided so DB gates G2 + DB-backed G3-G9 can actually run? Without it the DB-backed "V1 REQUIRED" rows have no passing evidence.
- **Final Pro auto-slip provider, included allowance, top-up/unit economics, and failure/operational policy** (owner decision, still open).
- **Final public Basic/Pro monthly prices** — currently pilot-reference only (PD-003 / price-lock gate).
- **WSTERA-managed LINE allowance / cost model** for merchant-owned OA (explicit measure of variable-cost automation per FR-BILL-004).
- **Cancel/reschedule policy window defaults** — nullable and fail-closed today; is any default to be established or left operator-configured?
- **Pilot evidence**: time-to-first-value, booking integrity under real concurrency, deposit/notification reliability, WTP — none measured yet; only hypotheses.
- **Live deploy/domain**: `bk01.wstera.com` reserved but not live; no production Worker deploy or DNS attach verified.
- **Module Hub scan for BK01** is on HOLD per `module-scan/COUNCIL-BRIEF.md` STATUS (until owner release after Round 1 evidence); genuine native-vs-reusable overlap for BK01 has not yet been formally mapped.

---

## Confidence 0-100

**72.**

Confidence is moderate-high on product identity, ICP, V1 scope, locked decisions, and the contract-defined finish line (these are all LOCKED, well-evidenced, and internally consistent). It is held down by: (a) DB-backed runtime gates unproven (BLOCKED_ENVIRONMENT), (b) the three open owner decisions (auto-slip provider/cost, final prices, LINE allowance), (c) zero pilot/WTP evidence, and (d) no live deployment to confirm the two-Worker / canonical-host runtime assumptions. Those are exactly the items that must close before a stable Product Gate can be declared.
