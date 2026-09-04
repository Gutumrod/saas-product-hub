# BK01 Booking by WSTERA — Business/Market Gate — Independent Expert: CANDIDATE

Gate: Business/Market (independent expert input; Codex synthesizes the verdict)
Procedure: `llm-council-gate` v0.3.2
Date of analysis: 2026-09-04
Locked Product source: `PRODUCT-SOURCE-OF-TRUTH.md` (Product Gate = REMEDIATE)
Pricing source: `products/booking/docs/04_PRICING_ENTITLEMENTS.md` (structure LOCKED, prices provisional)

---

## Recommendation

BK01 has a **credible recurring paid market**, but the recurring paid model is **not yet proven** and should not be publicly sold until three economics/evidence gaps are closed. The payer is real, the pain is real, the status-quo (LINE/manual/calendar) is genuinely worse, and the provisional ฿490/฿990 price points are competitive against both global (Fresha, Booksy) and Thai (Suriya, Bookio) peers. However: (1) the Pro tier's entire reason-to-pay — automatic slip verification — is undeliverable until a provider, unit cost, allowance, top-up and failure policy are locked; (2) the merchant-owned LINE OA cost (฿1,280–1,780/mo) exceeds the BK01 subscription itself and is a material adoption/margin risk that the WSTERA-managed allowance decision (OD-003) must resolve; and (3) there is zero pilot evidence for willingness-to-pay, retention, or real no-show reduction. This is consistent with the Product Gate REMEDIATE verdict: the market is credible, but "sellable V1" is not yet true.

Net: **credible recurring paid market = YES, with material unresolved economics. Do not launch public paid until auto-slip economics, LINE-cost model, and pilot WTP/retention evidence are closed.**

---

## Verified facts / evidence used (URL / source / date)

### Market size / target segment
- **24,623 hair salons in Thailand as of July 2026**; Bangkok 4,837 (19.6%), Chon Buri 1,695, Nonthaburi 1,131. Only 3,686 of 24,623 have websites — i.e. the vast majority are offline/manual operations, exactly the status-quo segment BK01 targets. Source: poidata.io/report/hair-salon/thailand (July 2026).
- **LINE is the dominant Thai channel**: 50M+ users in Thailand; 85%+ of Thai internet users active on LINE. Source: foxconnect.app/hair-salon-appointment-booking-crm (2026). This validates the LINE-centric ICP and the "no customer-installed app" requirement.

### Competitors and current pricing (verified 2026)
- **Fresha** (global, salon/barber): Independent plan **$19.95/mo** (1 bookable member); Team plan **$14.95/mo per bookable team member**; no longer free since 2025; 20% new-client marketplace fee (min $6); card processing on top. Source: fresha.com/pricing; pabau.com/blog/fresha-pricing (2026); thesalonbusiness.com/fresha-review (2026).
- **Booksy** (global): **$29.99/mo** base (1 team member) + **$20/mo per additional**; 14-day trial, **no free tier**; Boost = 30% of first-visit revenue; card processing 2.49–2.69% + per-txn. Source: biz.booksy.com/pricing; rzrv.ai/blog/booksy-fees-explained (verified June 2026); heybooked.com/blogs/booksy-pricing (July 2026).
- **ZERVA** (Thai, ZWIZ): **free** Thai-language booking system for salons/restaurants; no paid tier mentioned in marketing. Source: blog.zwiz.app/zerva-app (2026).
- **Bookio** (Thai LINE booking): **free to start** (1 location, up to 2 services); **Growth plan ฿990/mo** with 14-day trial; booking inside LINE, auto reminders. Source: getbookio.com (2026).
- **Suriya** (Thai salon AI platform): **starting at ฿499/mo**; 200+ beauty businesses; LINE/SMS reminders, loyalty, payments. Source: suriya.ai/for/salon (2026).
- **iReadCustomer** (Thai custom LINE booking): custom build **฿70,000–175,000** (10–25 man-days at ฿7,000/day); deposits via Omise/2C2P/PromptPay providers. Source: ireadcustomer.com/en/local/line-booking-system-in-thailand (2026).
- **CherCode** (Thai): general SaaS (Readyplanet/BookingX + LINE Notify) **฿500–3,000/mo**; custom full system **฿25,000–60,000** one-time. Source: chercode.com/en/blog/line-booking-system (2026).

### LINE Official Account costs (Thailand, 2026)
- **Free**: 300 broadcast messages/mo (2026 lineup; was 500 in 2023). **Basic: ฿1,280/mo, 15,000 messages, overage ฿0.10/msg. Pro: ฿1,780/mo, 35,000 messages, overage ฿0.06/msg.** All before 7% VAT. Source: suriya.ai/blog/line-oa-what-is-pricing-thailand (2026); goonlinethailand.com (2026); lineforbusiness.com (2023/2026).
- **Reply API messages (responding to a user's message/tap) are free and unlimited; only account-initiated push (broadcast/narrowcast/push/multicast) consumes quota.** Source: linebot.pro/blog/line-official-account-pricing-guide (July 2026). This matters: booking confirmations/reminders sent in reply to a customer action can be free; proactive reminders consume quota.
- (CherCode lists an alternate Light ฿599/5,000 and Standard ฿1,699/15,000 naming; the current LINE for Business lineup per Suriya/GoOnline is Free/Basic/Pro. Treat exact plan names as volatile; the ฿1,280–1,780/mo paid range is the reliable anchor.)

### PromptPay / slip / payment costs (Thailand, 2026)
- **PromptPay QR merchant acceptance: 1% to 1.65%** (Pay Solutions 1%, Opn Payments 1.65%); cards 3% to 3.65%; TrueMoney 2–2.65%. All before 7% VAT. Source: boldrails.com/payments/thailand (extracted 1 Aug 2026); boldrails.com/blog/best-payment-gateways-thailand (April 2026 Statrys rate cards).
- **Beam Checkout advertises 0% PromptPay, 1.8% cards.** Source: software-listing.com/q/payment-gateway-thailand (verified Jul 2026).
- **Bank of Thailand caps P2P/interbank transfer fees (free under ฿5,000), NOT merchant acceptance** — merchant PromptPay fees are set commercially. Source: software-listing.com (Jul 2026); xendit.co/en-th/blog/qr-payments-in-thailand (2026).
- **Slip verification**: free/unofficial services exist (e.g. GitHub slip-verify, offline thai_promptpay decode of the Mini-QR), but commercial auto-slip verification is a paid per-verification service. Source: github.com/topics/slip-verify; pub.dev/packages/thai_promptpay (May 2026). **BK01's auto-slip provider, unit cost, allowance, top-up and failure policy are UNRESOLVED (OD-001).**

### No-show / retention / outcome evidence (Thai + global)
- **Automated LINE reminders 24h + 1h before reduce no-shows 40–60%**; deposits reduce no-shows further. Source: chercode.com/en/blog/line-booking-system (2026).
- **FoxConnect claims up to 70% no-show reduction** with LINE reminders. Source: foxconnect.app (2026).
- **Suriya reports up to 40% fewer no-shows**; Bookio reports "cut our no-shows by a third." Sources: suriya.ai/for/salon; getbookio.com (2026).
- These are vendor-reported figures (not independent RCTs) — treat as directional, not proven. **No independent pilot evidence exists for BK01 specifically (WTP, retention, real no-show effect).**

### BK01 locked pricing (provisional, from 04_PRICING_ENTITLEMENTS.md)
- **Trial**: ฿0 / 14 days, 50 evaluation bookings, up to 5 providers, WSTERA central OA onboarding mode.
- **Basic**: ฿490/mo pilot reference (NOT final), effectively unlimited bookings, up to 5 providers, merchant-owned LINE OA, manual slip verification.
- **Pro**: ฿990/mo pilot reference (NOT final), effectively unlimited bookings, up to 10 providers, merchant-owned LINE OA, **automatic slip verification REQUIRED before Pro sale**.
- Merchant bears LINE OA plan/message cost in Basic/Pro unless a future managed-messaging add-on says otherwise. Auto-slip allowance/top-up = PENDING COST EVIDENCE.

---

## Key reasons

1. **The payer and segment are concrete and large.** Payer = the owner of a single-location Thai hair/barber/beauty/nail shop (1–10 providers). Hair salons alone number ~24,600 in Thailand, and only ~15% have websites — the rest run on LINE DMs, phone, spreadsheets, and paper. This is a large, under-served, LINE-native status-quo segment.

2. **The outcome is worth recurring payment versus the status quo.** The status quo (LINE/manual/calendar) has real, recurring pain: missed calls, double bookings, no-shows, staff juggling schedules, forgotten appointments, manual deposit chasing. External evidence consistently shows automated LINE reminders cut no-shows 40–70% and deposits cut them further. No-show reduction alone is a measurable, recurring ROI that justifies a monthly subscription — this is the core "reason to pay."

3. **Pricing is competitive.** ฿490/฿990 is below global Fresha ($19.95–14.95/mo ≈ ฿650–1,100) and Booksy ($29.99+$20/staff ≈ ฿1,000+), and at/under Thai peers Suriya (฿499) and Bookio (฿990). It is not out of line with what Thai small salons already pay for LINE OA (฿1,280–1,780/mo).

4. **The combined loop is defensible differentiation.** Collision-safe scheduling + PromptPay deposit/slip handling + merchant-owned LINE operations + low-burden onboarding is more than a generic booking widget. The PromptPay deposit + private slip + verification loop is genuinely differentiated versus free widgets (ZERVA) and generic calendar tools, and it directly attacks the no-show/deposit pain.

5. **The Trial/Basic/Pro structure broadly aligns with customer value.** Trial proves first value (50 bookings, 14 days); Basic is the core ops product (manual slip verification); Pro adds auto-slip for teams where manual deposit verification is the bottleneck. The 5→10 provider step and manual→auto slip step are coherent value tiers.

6. **Upgrade trigger and retention driver are real.** Upgrade: Basic→Pro when manual deposit verification becomes a bottleneck or team exceeds 5 providers. Retention: the booking URL, LINE reminders, deposit handling, and history become operationally embedded; switching back to manual is costly and re-introduces no-shows/double-bookings. No-show reduction is a recurring, visible ROI.

---

## Risks / failure cases

1. **Pro is unsellable until auto-slip economics are locked (HIGH).** The Pro tier's entire reason-to-pay is automatic slip verification, but provider, unit cost, allowance, top-up and failure policy are unresolved (OD-001). If auto-slip per-verification cost is high, Pro margin collapses or the price must rise. This is the single biggest blocker to the recurring paid model's top tier.

2. **Merchant LINE OA cost exceeds the subscription (HIGH).** A Basic merchant pays ฿490/mo to BK01 but ฿1,280/mo (or ฿1,780/mo for Pro) to LINE for the OA. Total ฿1,770–2,770/mo is a meaningful cost for a small Thai salon. If the merchant already has a LINE OA (many do), the marginal cost is lower; if not, this is a real adoption barrier. The WSTERA-managed allowance decision (OD-003) is unresolved and directly affects both adoption and WSTERA's own margin.

3. **Strong free / low-cost alternatives undercut (MEDIUM-HIGH).** ZERVA is free; Bookio is free-to-start (฿990 Growth); Suriya starts at ฿499. A merchant can get "good enough" booking for ฿0–499. BK01 must win on the deposit/slip + LINE operations loop, not on booking alone — otherwise it is a commodity widget with no pricing power.

4. **No pilot evidence for WTP/retention (HIGH).** There is no measured willingness-to-pay, retention, real no-show reduction, or notification/deposit reliability for BK01. The Product Gate explicitly forbids outcome claims (WTP, retention, no-show) without pilot evidence. Launching paid without this risks pricing to a phantom value.

5. **Cancellation risk is real (MEDIUM).** Switching cost back to LINE/manual is low for a small shop. If the merchant perceives the combined LINE OA + subscription cost as too high, or if reminders/deposits don't visibly cut no-shows, churn is likely. Retention depends on the loop being genuinely embedded and the ROI being visible.

6. **Cancel/reschedule window defaults unresolved (MEDIUM).** If nullable fail-closed windows are not configured, the customer self-service change promise silently breaks — undermining the "operations product" value and the reason to pay.

7. **Deposit/slip verification is a support burden (MEDIUM).** Manual verification (Basic) is labor for the merchant; if the merchant doesn't verify promptly, deposits sit in `awaiting` and bookings stall. Auto-slip (Pro) shifts this to a paid provider with its own failure modes. Support cost per merchant could be high relative to ฿490–990/mo.

---

## Assumptions

- The payer is the shop owner (merchant), not the end customer; the customer books via a public URL / LINE, no customer-installed app.
- First segment is single-location hair/barber shops (largest count, most manual), then beauty/nail; 1–10 providers.
- Merchant already uses or is willing to adopt LINE OA; LINE is the primary customer channel.
- PromptPay deposit flow is low-cost for the merchant (receiving PromptPay is typically free for individuals; BK01 does not process payments, so no MDR on BK01's side).
- The ฿490/฿990 figures are pilot references only and will be re-set after WTP/cost evidence (per price-lock gate).
- Vendor-reported no-show reduction figures (40–70%) are directional, not independently verified for BK01.

---

## Open questions / missing evidence

- **Auto-slip (OD-001):** which provider, unit cost per verification, included monthly allowance, top-up price, failure/escalation policy? This determines Pro margin and whether ฿990 is viable.
- **LINE cost model (OD-003):** does the merchant bear the full OA cost, or does WSTERA bundle an allowance with a cap/overage? This determines total merchant cost and WSTERA margin.
- **Final prices (OD-002):** are ฿490/฿990 confirmed after WTP and cost modeling, or do they move?
- **Pilot evidence:** real willingness-to-pay, retention/churn, actual no-show reduction, notification delivery reliability, deposit verification reliability, time-to-first-value.
- **Cancel/reschedule window defaults (OD-004):** force configuration or conservative default, so the self-service change promise holds.
- **Blacklist disposition (OD-006):** ship, hide, or defer.
- **Acquisition/sales friction:** how does a small Thai salon discover and adopt this? No distribution/sales-channel evidence exists. Free alternatives are discoverable; BK01's go-to-market is unproven.
- **Competitor depth:** no verified evidence on how many Thai salons actually pay for ZERVA/Bookio/Suriya (vs free tiers), so real paid conversion in this segment is unmeasured.

---

## Pain → Capability → Outcome → Business Value → Reason to Pay

- **Pain:** missed calls during busy hours; double bookings; no-shows and forgotten appointments; staff mentally juggling who booked which slot with which provider; manual deposit chasing and slip verification; no demand data; lapsed customers never re-engaged.
- **Capability:** collision-safe scheduling at the authoritative data layer; PromptPay deposit QR + private slip storage + verification; merchant-owned LINE confirmations/reminders; staff identity + self-scope; customer cancel/reschedule with policy; history/export.
- **Outcome:** fewer no-shows (external evidence 40–70% with reminders; deposits cut further); no double bookings; customers book 24/7 without a call; deposits secured before service; less admin time; visible demand data.
- **Business Value:** recovered revenue from no-shows and empty slots; saved staff scheduling time; higher fill rate; secured deposits reduce revenue leakage; repeat customers retained via reminders/history.
- **Reason to Pay:** a recurring operational value that compounds monthly — the merchant pays because the loop keeps running (reminders, deposits, no double-booking) and the ROI (no-show reduction, recovered revenue) is measurable and recurring. This is a genuine recurring paid market, provided the economics (auto-slip, LINE cost) and pilot evidence are closed.

---

## Confidence

**70 / 100**

Confidence is moderate-to-good that a credible recurring paid market exists: the payer, segment, pain, status-quo inferiority, and competitive price positioning are all supported by current external evidence. It is capped at 70 because the recurring paid model is not yet proven — auto-slip economics, the LINE-cost model, and pilot WTP/retention evidence are all unresolved, and strong free alternatives (ZERVA, Bookio free tier) could compress pricing power. This mirrors the Product Gate REMEDIATE posture: credible market, not yet sellable V1.
