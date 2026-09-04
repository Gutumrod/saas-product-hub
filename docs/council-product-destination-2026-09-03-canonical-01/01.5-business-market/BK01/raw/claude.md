# BK01 Booking by WSTERA — Business/Market Gate Expert Answer (Claude)

**Date:** 2026-09-04
**Role:** Independent expert, WSTERA Product Destination Council, Business/Market Gate
**Procedure:** `llm-council-gate` v0.3.2
**Scope:** Determine whether BK01 has a credible recurring paid market, using the locked Product Gate definition. This is NOT a gate verdict (Codex synthesizes). No product/pricing document modified.

---

## Recommendation

BK01 has a **credible but conditional recurring paid market** in the Thai single-location hair/barber/beauty/nail segment. The market is real, active, and already monetized by multiple Thai LINE-booking competitors at ฿299–฿990/month, so a recurring paid model is viable in principle. However, the recurring paid market is credible **only if** three conditions are met before commercial lock: (1) the scheduling-integrity + reliability + low-setup-burden differentiation is actually executed and evidenced (it is currently a hypothesis, not a proven outcome); (2) pilot willingness-to-pay is measured (currently UNPROVEN); and (3) the provisional ฿490/฿990 prices are re-anchored to current competitive reality, because fresh evidence shows direct competitors undercut them while offering comparable or better automation. The payer is the shop owner/manager (merchant), not the customer. Do not lock final prices or launch public paid V1 until these are closed.

---

## Verified facts / evidence used (with URL/source/date)

All competitor prices below were **re-fetched directly from official vendor pricing pages on 2026-09-04** (today) and match the internal 2026-08-28 ledger, confirming the internal evidence is current (within the 60-day refresh window).

### Thai direct competitors — current pricing (fetched 2026-09-04)
- **Onque** — https://www.onquethai.com/ — starts ฿299/mo; 30-day trial no card; 0% GP; merchant LINE OA; **SlipOK automatic slip verification**; export anytime. (Auto-slip is a standard paid feature here.)
- **MeQueue** — https://mequeue.app/pricing/ and /promotions/ — Free (1,200 queues/mo, 3 services, 2 staff); **Pro ฿399/mo** (promo from ฿599) or ฿3,900/yr, unlimited queues, **10 staff**, reminders, revenue/no-show reports; Business ฿599/mo (promo from ฿899) or ฿6,900/yr, multi-branch.
- **QueueBooking** — https://queuebooking.com/pricing — Starter free (50 bookings, 1 branch, 3 services); **Professional ฿990/mo** (2,000 bookings, 5 branches); Business ฿2,490/mo (10,000 bookings, multi-branch). VAT excluded; **LINE message cost excluded** (merchant pays LINE directly).
- **JongQ** — https://jongq.tech/ — ฿499/mo; 14-day trial; unlimited queues/staff/customers; LINE OA cost separate.
- **EikQueue** — https://eikqueue.com/pricing — Starter free (50 bookings, 1 staff); **Pro ฿590/mo** (unlimited staff, deposit + slip upload, points/membership, reports); Business ฿1,290/mo (multi-branch). 14-day trial no card.
- **Bookio** — https://getbookio.com/ — Free ฿0 (1 location, 2 services); **Growth ฿990/mo** (unlimited locations/services, automatic LINE reminders, analytics). Vendor claims "7h saved weekly", "35% fewer no-shows", "2 min setup" — these are **vendor claims, not independent evidence**.
- **FoxConnect** — https://foxconnect.app/pricing/ — Solo ฿690/mo (200 bookings, 1 branch, 3 staff); Plus ฿1,590/mo (600 bookings, 3 branches, 10 staff); Premium ฿2,990/mo (2,000 bookings, 10 branches, 25 staff). 3-month minimum.
- **Bangkok Boost** — https://bkkboost.com/pricing/ — Booking ฿990/mo (unlimited LINE bookings, custom UI, auto reminders); Essential ฿990/mo (3 staff, 5 services); **Professional ฿1,590/mo (deposits + PromptPay QR, multiple durations, auto reminders)**; Enterprise ฿2,590+/mo. Setup from ฿3,000 often waived.

### LINE OA cost (merchant bears) — fetched 2026-09-04
- https://lineforbusiness.com/th/service/line-oa-features — **Free 300 broadcast messages/mo; Basic ฿1,280/15,000 messages (฿0.10/extra); Pro ฿1,780/35,000 messages (฿0.06/extra)**. LINE reach claim: 56 million Thai accounts.

### Thai market infrastructure — current
- **PromptPay (BOT)** — https://app.bot.or.th/BTWS_STAT/statistics/BOTWEBSTAT.aspx?reportID=921&language=ENG — monthly PromptPay transaction values ~฿4–4.6 trillion in early 2026 (Bangkok Bank note, thailandedition briefings). Confirms PromptPay is mature, free-to-receive infrastructure; does NOT prove deposits reduce no-show.
- **NSO establishment universe** — internal ledger cites 2023 hairdressing 112,996 establishments; beauty/manicure/pedicure 7,589 (https://www.nso.go.th/...). Category universe indicator only, not TAM.

### Locked Product Gate definition (source of truth)
- `PRODUCT-SOURCE-OF-TRUTH.md`, `PRODUCT-SYNTHESIS.md` (verdict REMEDIATE), `01-PRODUCT-OWNER-BRIEF.md`, `00_PRODUCT_VISION.md`, `01_PRD.md`, `04_PRICING_ENTITLEMENTS.md`, `05_BOOKING_DOMAIN_RULES.md`, `PRODUCT_DECISIONS.md` (PD-001..PD-018), `docs/market/*` (COMPETITIVE_LANDSCAPE_2026, ICP_JTBD, MARKET_AND_SEGMENTATION_2026), `docs/audit/MARKET_SOURCE_LEDGER.md`.

---

## Key reasons

1. **Exact payer and first segment are clear and market-validated.** Payer = shop owner/manager (merchant), not the customer. First segment = single-location hair/barber/beauty/nail shops, 1–10 providers (PD-001, 3/3 consensus). Every current Thai competitor targets this exact segment (salons, barbers, nails, spas), confirming active software demand — though this proves category demand, not BK01-specific demand.

2. **The recurring value proposition is real but must be evidenced.** The outcome worth paying for is the combined loop: collision-safe scheduling (no double-booking), PromptPay deposit + slip verification, automated reminders (fewer no-shows), merchant-owned LINE operations, staff self-scope, export. Versus LINE/manual/calendar (free but labor-intensive), the value is staff time saved and fewer schedule errors. But the Product Gate itself flags this as hypothesis until pilot evidence (WTP, no-show effect, reliability) exists. No pilot evidence exists yet.

3. **Competitive pricing is a real risk.** Fresh evidence shows BK01's provisional prices are **not clearly competitive**:
   - MeQueue Pro ฿399/mo (10 staff, unlimited queues, reminders, reports) is **cheaper than BK01 Basic ฿490/mo** (5 staff, manual slip).
   - Onque ฿299/mo **includes automatic slip verification (SlipOK)** — cheaper than BK01 Pro ฿990/mo which requires auto-slip as its headline Pro differentiator.
   - EikQueue Pro ฿590/mo includes deposit + slip upload + membership + reports.
   - The ฿299–฿990 band is crowded; BK01's ฿490/฿990 sits mid-band with no clear price or feature advantage on current evidence.

4. **Differentiation is thin unless executed and evidenced.** The locked definition correctly states LINE/PromptPay alone are not defensible (competitors already offer them). The defensible combination is database-enforced scheduling integrity + reliability + low-friction onboarding + merchant-owned relationship. But competitors (Onque SlipOK, MeQueue, QueueBooking) already offer auto-slip, deposits, reminders, reschedule. BK01's scheduling-integrity and reliability claims are currently **unproven** (DB gates BLOCKED_ENVIRONMENT). This is the single biggest risk to a defensible recurring market.

5. **Trial/Basic/Pro structure aligns with value direction but pricing is unanchored.** The structure (Trial free/limited → Basic manual → Pro auto-slip + more staff) correctly monetizes operational value and variable-cost automation rather than booking rows (PD-002). But ฿490→฿990 is a 2x jump for auto-slip + 5 staff, and both are undercut by competitors. Prices remain provisional (PD-003) — correctly so.

6. **PromptPay/slip/LINE costs are manageable but unresolved.** PromptPay receiving is free for merchants (BOT infrastructure). Auto-slip has a provider variable cost — **unresolved** (OD-001). LINE OA cost is borne by the merchant (Free 300 / Basic ฿1,280/15k / Pro ฿1,780/35k messages); for a small shop sending confirmation + reminder per booking, the free 300 messages may suffice at low volume but not at scale — a real margin/support consideration if WSTERA bundles allowance (OD-003). QueueBooking and JongQ both explicitly state LINE cost is separate and paid by the merchant, so this is an accepted market norm.

7. **Upgrade trigger, retention, cancellation.** Upgrade trigger = deposit-heavy services needing auto-slip, >5 staff, no-show pain. Retention driver = the operational loop becomes embedded (scheduling, deposits, reminders, history). Cancellation risk = **high** because competitors are cheap, monthly billing has no lock-in, and switching is easy; merchants will churn back to LINE/cheaper tools if reliability or value is not proven. Data portability (CSV export, PD-012) mitigates but does not eliminate this.

8. **Pain → Capability → Outcome → Business Value → Reason to Pay:**
   - **Pain:** repeated availability questions, double-booking/schedule mistakes, deposit + slip checking labor, no-show, fragmented history.
   - **Capability:** collision-safe scheduling, PromptPay deposit + slip verification, automated reminders, merchant LINE, staff self-scope, export.
   - **Outcome:** fewer double-bookings, less admin time, fewer no-shows, cleaner records.
   - **Business Value:** staff time saved, fewer lost customers, deposit security.
   - **Reason to Pay:** recurring operational value — credible in principle, but **must be evidenced by pilot**; currently a hypothesis.

---

## Risks / failure cases

1. **Pricing undercut by competitors.** MeQueue Pro ฿399 < BK01 Basic ฿490; Onque ฿299 with auto-slip < BK01 Pro ฿990. If BK01 launches at provisional prices without a clear feature/reliability advantage, it will lose on price to cheaper, established Thai tools.
2. **Thin differentiation.** Auto-slip, deposits, reminders, reschedule are all standard in current competitors. If BK01's scheduling-integrity/reliability is not demonstrably better (and evidenced), there is no defensible reason to switch.
3. **Unproven WTP.** No pilot evidence. The market's existence does not prove BK01's willingness-to-pay. Launching public paid V1 without pilot WTP risks mispricing.
4. **High churn risk.** Cheap competitors + no lock-in + easy switching = merchants churn back to LINE/cheaper tools if value is not proven quickly.
5. **Auto-slip cost/margin.** Unresolved provider cost (OD-001) could erode Pro margin or force a price that is uncompetitive.
6. **LINE cost friction.** If merchants must pay LINE separately (market norm) and WSTERA does not bundle, the total cost of ownership (system + LINE) may exceed the perceived value for very small shops.
7. **Not sellable V1 yet.** Product Gate = REMEDIATE; DB-backed gates BLOCKED_ENVIRONMENT. Any commercial claim before sellable V1 is premature and would violate the locked contract.

---

## Assumptions

- The locked Product Gate definition (identity, ICP, V1 scope, pricing structure) is the binding source of truth; I did not re-decide product scope.
- Current competitor prices fetched 2026-09-04 are accurate as rendered; I did not independently verify vendor outcome/security claims (e.g., Bookio "35% fewer no-shows", Onque support claims) — those are vendor claims.
- PromptPay receiving is free for merchants (standard BOT infrastructure); I did not re-verify per-bank merchant fees.
- The ฿490/฿990 prices are provisional pilot references (PD-003), not final public prices.
- "Effectively unlimited" paid booking capacity (PD-002) is the correct competitive posture given competitors offer unlimited or high caps.

---

## Open questions / missing evidence

1. **Pilot willingness-to-pay** — the single most important missing evidence. No pilot exists.
2. **Auto-slip provider, unit cost, allowance, top-up, failure policy** (OD-001) — unresolved; blocks Pro sale.
3. **Final Basic/Pro prices** (OD-002) — provisional; must be re-anchored to the current competitive band (฿299–฿990) with a defensible value story.
4. **LINE allowance/cost model** (OD-003) — does WSTERA bundle or does merchant bear? Affects total cost of ownership and margin.
5. **Cancel/reschedule default-window behavior** (OD-004) — if fail-closed nulls break the self-service promise, the value proposition is hollow.
6. **Blacklist V1 disposition** (OD-006) — minor, but must be decided.
7. **No-show reduction and notification/deposit reliability** — unmeasured; required before any outcome claim.
8. **Acquisition/sales friction** — no evidence on cost of acquiring a Thai SMB merchant (competitors use assisted setup, done-for-you onboarding, LINE chat sales). BK01's low-setup-burden claim is unproven.
9. **Retention/repeat-usage data** — none; churn risk is real but unquantified.

---

## Confidence

**70/100**

High confidence (85+) on: market existence, exact payer/segment, and current competitor pricing (all re-verified from official pages today). Moderate confidence on: BK01's specific willingness-to-pay and differentiation defensibility — these are unproven hypotheses. The recurring paid market is credible but conditional; it becomes a strong "yes" only after pilot WTP, reliability evidence, and competitive price re-anchoring.
