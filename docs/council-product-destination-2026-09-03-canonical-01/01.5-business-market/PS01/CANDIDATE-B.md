


---

# PS01 Pawstia ΓÇö Business/Market Gate ΓÇö Independent Expert Answer

Independent expert seat. Date: 2026-09-04. Scope: Business/Market only (recurring paid market, initial payer, recurring pain, V1 monetization coherence). Effective Product Gate = PASS (EFFECTIVE-PRODUCT-GATE-STATUS.md) ΓÇö not re-litigated. Implementation/architecture/security/pilot-PMF items are downstream gates and are NOT evaluated here. No final gate verdict issued ΓÇö Codex synthesizes.

## Recommendation

**PS01 Pawstia has a credible recurring paid market, directionally ΓÇö with three conditions.**

- **Initial payer: credible and clearly defined.** Single-location pet hotel/daycare owner-operator in Bangkok-metro, ~10ΓÇô30 rooms, paying a merchant monthly subscription. The payer / operator-user / pet-owner-customer split is coherent (owner pays; owner+manager+staff operate; pet owner receives LINE reports).
- **Recurring business pain: credible-inferred, not yet operator-validated.** Daily Care Report chaos and double-booking are *daily-frequency, money-touching* pains consistent with the Thai pet hospitality boom (market ~92B THB 2025, >100B THB 2026, +13% YoY per ttb analytics via multiple sources). But all pain evidence today is product-doc-asserted; zero Thai operator interview evidence exists in PS01 inputs. Pain = hypothesis until store #1.
- **V1 monetization: commercially coherent.** Merchant-paid monthly subscription, tiered by capacity (rooms/pet-history), sits below the only verified Thai competitor's effective price (Vettale Petcare 25,900 THB/year Γëê 2,158 THB/mo) and far below international tools (Gingr Stay $179/mo Γëê 5,900 THB; PawPartner $99.99/mo Γëê 3,300 THB). The price *direction* fits a fragmented micro-merchant market.
- **Conditions:** (1) do not publicly lock the Founding Member 990 THB Pro-forever price before WTP evidence (business-side packaging risk, consistent with Product Gate Card 5 default ΓÇö holding, not re-deciding); (2) resolve LINE OA channel ownership/economics because Daily Report volume likely exceeds the LINE OA free message quota, creating an extra per-shop cost or Pawstia-side COGS; (3) treat beachhead TAM as thin ΓÇö single-location BKK pet hotels are a small niche that sustains V1 but cannot be the endgame.

This is a PASS-direction business market with unvalidated WTP ΓÇö the gap that beta interviews must close, not a reason to reject the market.

## Verified facts / evidence used

**From PS01 repo (PawSpace), read directly:**
- BUSINESS_MODEL.md: Starter 990 THB/mo (10 rooms, 300 pet history), Pro 1,490 THB/mo (unlimited), Enterprise 2,490 THB/mo (unlimited + staff accounts + priority support); annual = 2 months free; Founding Member C2 = 990 THB/mo with Pro entitlement, non-transferable, excludes future paid add-ons; onboarding/data-import free during Founding 10 beta, then optional setup 3,000ΓÇô5,000 THB/shop; hypotheses H1ΓÇôH4 (30-shop interviews, >40% trialΓåÆpaid, 990ΓÇô1,490 WTP test at beta end, B2C add-on later) explicitly marked "to validate".
- PRODUCT_ONE_PAGER.md: 3 pains (booking collision at festival peaks, per-pet photo/report chaos in personal LINE chats, data lock-in fear); 3 product-defining features (iPad room matrix with DB-level no-overlap, 15-second 1ΓÇô4 photo LINE Flex daily report, Google Sheets auto-sync replica); comparison table vs notebook/Excel and "Windows-98-era programs"; DRAFT-DO-NOT-PUBLISH status; LINE OA handle and web address TBD.
- SALES_PLAYBOOK.md: founder-led outreach scripts (LINE OA/FB message, booking-pain opener, 45-second cold call), objection handling (Excel is fine / old staff / lock-in fear / no time to migrate / bad economy), closing script re-offering 990 THB Founding price after 30-day trial.
- ONBOARDING_SOP.md: 4-step daily workflow; LIFF QR claim (TTL 48h, staff can re-issue/reset); check-in same-date rule with early-arrival re-validate path; one-touch report ticks (α╕üα╕┤α╕Ö/α╕éα╕▒α╕Üα╕ûα╣êα╕▓α╕ó/α╕¡α╕▓α╕úα╕íα╕ôα╣î) + 1ΓÇô4 photos + note; manual retry on LINE failure; FAQ states customer needs NO app download.
- COMMERCIAL_READINESS.md: pricing/positioning/playbook marked done; payment collection absent by design; ToS/privacy/DPA, ops monitoring, trademark clearance all open; brand name Pawstia PMS passed initial collision screening only.
- PRD.md: scope = Pet Hotel & Pet Daycare single-store; explicit non-goals incl. grooming queue, clinic/pharmacy, payment/e-tax, multi-branch; LINE delivery with dual idempotency; LINE identity isolation + server-only claim consume.

**From locked Product Gate inputs (01-product/PS01/):**
- EFFECTIVE-PRODUCT-GATE-STATUS.md: effective verdict PASS (meta-audit acceptance + Owner Decision 2026-09-03).
- PRODUCT-SYNTHESIS.md / 01-PRODUCT-OWNER-BRIEF.md: 3/3 identity agreement ΓÇö Thailand-first, single-location Pet Hotel/Daycare OS; core daily value loop = check-in ΓåÆ no-collision room assignment ΓåÆ care recording ΓåÆ 15-second report (1ΓÇô4 photos) ΓåÆ LINE delivery ΓåÆ Sheets replica; strongest pain stack (double-booking at peaks, daily photo/report chaos, lock-in fear); beta metrics list (onboarding time, staff learning, conflicts, LINE delivery success/failure, support burden, WTP signal); open owner decisions incl. Store #1, Founding Member price, LINE OA ownership.

**External (fetched 2026-09-04, sources quoted):**
- Gingr (gingrapp.com/pricing): Stay plan (boarding) **$179/mo** with active Integrated Payments, **$209/mo** without; annual $154/mo; **no free trial** (demo-only); 2-Way SMS and Messaging Bundle add-ons priced on contact, **2-Way SMS available in U.S. and Canada only**; Enterprise quote-based per portfolio.
- PawPartner (pawpartner.com/pricing): Boarding/Daycare/Multi-service **$99.99/mo** ($1,079.88 annual, ΓêÆ10%); grooming-only/training-only $44.99/mo; **flat rate, no per-pet/per-staff fees**; no free trial but free onboarding/data migration/no setup fee; **Text Messaging add-on $10.99/mo for 700 texts, $0.02/message after**; white-label custom app $300 setup + $99.99/mo; one-month deposit at account build; annual prepay non-refundable.
- MoeGo (moego.pet/pricing + ?companyType=2/3/4): mobile grooming **Basic $49/mo (1 member), Growth $99/mo per van, Ultimate $159/mo per van**; boarding and daycare vertical pages show **no published prices** (demo-only) with SMS quota "1350 SMS / location" and unlimited clients/pets/appointments/devices; salon/mobile plans show "Custom".
- PetExec (petexec.net): no public pricing; free-trial CTA routes through Gingr-owned inquiry path; pricing behind sales funnel.
- PetDesk (petdesk.com): veterinary-adjacent communications; **no public pricing**, demo-only; 12,000+ vet practices claim.
- Vettale (vettale.com ΓÇö Thai competitor): veterinary clinic system with pet hotel/spa segment; **Petcare package 25,900 THB/year (~2,158 THB/mo equiv.), 3 users, 5GB media, unlimited records**; add-ons: additional branch 10,000 THB, additional user 3,000 THB, storage 600 THB/5GB, SMS 5,000 credits/3,000 THB; no free trial (demo only); **data deleted within 15 days after expiry**; features incl. boarding records, grooming, POS, e-payment, LINE OA integration, TeleVet remote viewing; no Google Sheets export; no standalone daily customer-facing report feature.
- Thailand market: pet market **~74.8B THB 2024** (Marketeer), **~92B THB 2025 (+13.2%)** and **>100B THB 2026** (ttb analytics via ttbbank.com/nationthailand.com/thairath.co.th); "pet parent" spend **41,100 THB/pet/year** vs 7,745 THB for free-roaming pets (thairath/ttb); pet food = 68% of industry, 19.7% CAGR since 2019 (efeedlink); pet hotel named a high-growth segment for 2026 (ofm.co.th, brandthink.me, chiangraitimes.com ΓÇö trust/daily-communication emphasis).
- LINE: **~54M users in Thailand** (bangkokbiznews); **LINE OA conversations 12B in 2025, OA additions 800M+ in H1 2026** (telecomlover, LINE Thailand Business Insight 2026); **LINE OA Free plan = 300 free messages/month** (help2.line.me TH help center; revised down from 500, earlier 1,000); Basic plan referenced at 1,200 THB/mo in pre-Aug-2024 pricing (today.line.me article ΓÇö current 2026 tiers not verified).
- Directory proxies (not registry counts): PetHub lists **285 pet-service providers in Bangkok** (price range α╕┐60ΓÇôα╕┐2,190/service; common types incl. daytime boarding); PETTO Zone instant-booking boarding at **300ΓÇô400 THB/night**; Thonglor Pet operates 21 branches.
- Global kennel/boarding software market-size reports diverge wildly (USD 90MΓÇô4B for 2025 across verifiedmarketreports/market.us/researchandmarkets/dataintelo etc.) ΓÇö **low-quality, conflicting definitions; use only as "category exists and grows mid-single to low-double digit CAGR" signal, not as sizing.**

## Initial payer + beachhead

**Payer (distinct):** owning operator of a single-location pet hotel/daycare (overnight capacity), 10ΓÇô30 rooms, Bangkok-metro or comparable urban Thai store. The owner pays because the pains land on the P&L: refunded/goodwilled collisions at festival peaks, staff hours burned on per-pet chat reporting, and fear that their customer/stay history is trapped or lost.

**Operator-users (distinct):** owner, manager, and floor/care staff on storefront devices (iPad/mobile). They don't buy; they must adopt in Γëñ minutes/day or the payer churns. Old-technician-staff objection is pre-answered in the playbook.

**Pet-owner customer (distinct):** LINE recipient; zero app download; gets the Flex report. They create no revenue directly in V1 but are the perceived-value amplifier that makes the shop defend the subscription (B2C add-on revenue is future, H4, not V1).

**Beachhead:** the ~285-provider Bangkok pet-service directory (PetHub proxy, mixed incl. clinics) implies the boardable single-location subset is plausibly only **150ΓÇô400 shops** ΓÇö **UNVERIFIED estimate; no official registry count found**. At 990ΓÇô1,490 THB/mo, full beachhead penetration Γëê 0.18ΓÇô0.6M THB/mo. Thin but sufficient to sustain V1 and validate; expansion (upcountry singles, grooming-adjacent stays, later multi-branch) is required for a real business. Revenue sanity check (hypothesis): a 10-room shop at ~50% occupancy ├ù ~350 THB/night Γëê 52K THB/mo service revenue ΓåÆ 990 THB subscription Γëê 1.9% of revenue ΓÇö cheap enough to defend if the loop runs daily.

## Current market / competitor evidence

| Competitor | Model | Verified pricing (2026 fetch) | LINE/customer app | Fit vs Pawstia ICP |
|---|---|---|---|---|
| **Gingr** (US) | Per-vertical plans, boarding "Stay" | $179/mo w/ their payments; $209/mo without; annual $154/mo; no free trial; SMS add-on US/Canada only | Customer portal + app; SMS geo-locked | No Thai localization, no LINE, USD rails ΓåÆ effectively absent from Thai segment (verified geo-limit on SMS) |
| **PawPartner** (US) | Flat monthly by service mix | $99.99/mo boarding/daycare/multi; texting $10.99/mo┬╖700 texts + $0.02/extra; free onboarding/migration; no trial | Customer app; white-label $300+$99.99/mo | Same ΓÇö USD, no LINE; price ~3.3K THB/mo |
| **MoeGo** (US/SEA) | Per-van/per-location tiers; boarding/daycare verticals exist | Mobile grooming verified $49/$99/$159 per van; boarding/daycare prices demo-only (UNVERIFIED numbers) | Branded app, SMS quotas | Grooming-first DNA; boarding positioning demo-gated |
| **PetExec** (US) | Pricing behind sales funnel | No public numbers (UNVERIFIED) | Unlimited texting feature | US-market tool |
| **PetDesk** (US) | Vet-clinic communications | No public pricing, demo-only | Two-way texting | Vet-PMS adjacent; brief says do not treat clinic PMS as ICP |
| **Vettale** (TH) | Annual THB license, per-user/branch add-ons | Petcare 25,900 THB/yr, 3 users, 5GB; +user 3,000 THB; +branch 10,000; SMS 5,000 credits/3,000 THB; no trial; data deleted Γëñ15d after expiry | LINE OA integration; TeleVet remote viewing | **Closest direct Thai competitor**; clinic-centric DNA; no Sheets ownership story; no customer-facing daily report product |
| Status quo | LINE chat/notebook/Excel | ~0 THB | Personal staff LINE | The real incumbent |

**Reading of the landscape (analysis):** the international players are priced 3ΓÇô6├ù Pawstia's Starter, charge for messaging add-ons, and are structurally excluded from Thailand by LINE dependence and THB payment rails. Vettale is the only verified Thai priced threat ΓÇö stronger feature breadth (POS, e-payment, multi-branch, TeleVet) but clinic-shaped, priced ~2.2├ù Pawstia Pro, no daily customer-facing report, no data-ownership replica, and no free trial. The wedge "LINE-native daily report + Sheets replica for the single-store operator" is open on current evidence. Global market reports confirm the category exists and grows (mid-single to low-double-digit CAGR) but their absolute numbers conflict (90MΓÇô4B USD) ΓÇö treat category size as low-confidence.

## Free / status-quo alternatives

What shops actually run on today (per PS01 docs; prevalence itself is hypothesis H1 pending 30-shop interviews): **personal/staff LINE chats for photos and updates, notebook/paper or Excel for bookings, Google Calendar/Sheets for schedules, phone calls for coordination, maybe a generic POS for retail.**

- **Why they stay:** zero baht, zero learning, staff already live in LINE, the owner already "owns" the data in their own Sheets/notebook, festival chaos feels like a once-a-year problem.
- **Why they must eventually move (the argument Pawstia sells, not the features):** (1) the status quo's failure mode is *silent* ΓÇö double-booking is discovered at the door with a paying customer present, and personal-chat reporting produces no retrievable history when staff leave or a dispute arises; (2) the cost compounds with volume ΓÇö 15ΓÇô25 pets/day ├ù per-pet photos in N separate chats cannot become an operations record; (3) the lock-in fear cuts both ways: shops already fear losing their *own* records, which free tools don't solve. The Sheets replica is explicitly designed to neutralize the "no, my data" objection rather than fight the status quo head-on.
- **Honest boundary:** a shop that only takes walk-ins, runs <10 pets, and doesn't send daily reports gains little ΓÇö the product needs a minimum operational volume to be worth 990 THB. Free generic booking tools (Calendar/Calendly-class) cover booking-only but nothing on care reporting, pet history, or room state; Vettale-class covers operations but at clinic price/breadth with no LINE-native customer touchpoint.

## Pain -> Capability -> Outcome -> Business Value -> Reason to Pay

**Chain 1 ΓÇö booking collision (payer: owner)**
- Pain: festival/peak double-bookings force overbooking, refunds, or turned-away revenue; discovered at check-in, in front of the customer. (Recurring, seasonal-amplified, direct revenue loss.)
- Capability: DB-level no-overlap integrity + real-time room matrix on iPad; check-in/cleaning lifecycle prevents re-releasing a dirty room.
- Outcome: zero room-collision bookings structurally; capacity sold up to the true limit on peak days.
- Business value: saved peak-day revenue + avoided goodwill refunds + fewer owner escalations.
- Reason to pay: one avoided festival-day collision (1ΓÇô2 refunded nights + reputation) Γëê a month or more of subscription ΓÇö **this is the acute, seasonal hook that starts the subscription.**

**Chain 2 ΓÇö daily report chaos (payer: owner; operator: staff)**
- Pain: per-pet photos/statuses scattered across personal LINE chats, every day, every pet; no history, staff-dependent quality, owner can't audit.
- Capability: 15-second one-tick report (1ΓÇô4 photos + α╕üα╕┤α╕Ö/α╕éα╕▒α╕Üα╕ûα╣êα╕▓α╕ó/α╕¡α╕▓α╕úα╕íα╕ôα╣î + note) auto-delivered as LINE Flex to the right owner; delivery retry/idempotency; reports stored with the stay.
- Outcome: every paying pet gets a professional daily card; the shop has a retrievable care history.
- Business value: differentiation customers actually see (trust ΓåÆ repeat bookings, the top revenue driver in a trust-driven segment), staff time back (minutes/pet/day), dispute protection.
- Reason to pay: this is the *daily-use* engine ΓÇö value recurs every single day of every stay, which is what makes the subscription defensible in month 2+, and what customers of the shop perceive.

**Chain 3 ΓÇö lock-in fear (payer: owner, objection not trigger)**
- Pain: switching from Sheets/paper to any SaaS = "my data is hostage."
- Capability: Google Sheets one-way ownership replica + export.
- Outcome: the shop keeps an independent copy continuously.
- Business value: removes the #1 stated adoption blocker; shortens trialΓåÆpaid.
- Reason to pay: not a standalone reason ΓÇö it's what lets chains 1+2 close the sale. (All three chains match the product core: the three-pain stack is exactly what V1 ships.)

## Recommended monetization direction

Keep the **merchant-paid monthly subscription, tiered by capacity** as the V1 model ΓÇö it is commercially coherent with everything above. Direction (not final price, not implementation):

1. **Tier by operational capacity, not by features** ΓÇö the current room/pet-history limits (Starter 10 rooms/300 pets ΓåÆ Pro unlimited) match how operators think about size and match the value driver (more pets flowing = more value). Competitor pattern confirms capacity/staff-based tiers are the category norm (MoeGo per-van, Vettale per-user/branch). Do NOT gate the core loop (room integrity, daily report, Sheets) behind tiers ΓÇö it must exist on Starter or the beachhead pitch dies.
2. **Monthly default, annual discount** ΓÇö matches Thai micro-merchant cash behavior; annual = 2 months free is a fine direction.
3. **Founding Member 990 Pro-forever: hold public commitment until beta WTP evidence** (consistent with Product Gate Card 5 default). Business reasoning: it converts an unknown WTP into a permanent ARPU ceiling; the reversible move is to run beta at 990 *without the forever lock* or with an explicit cap.
4. **Onboarding fee as optional setup add-on (3,000ΓÇô5,000 THB) after beta** ΓÇö coherent; data migration is the #2 adoption blocker and free migration is PawPartner's proven wedge; keep waiving it for early cohort.
5. **Resolve LINE cost location before pricing final:** if reports/day (~10ΓÇô30 pets/day) exceed the OA free 300 messages/mo, shops either buy LINE Basic (~1,200 THB/mo pre-2024-revision reference, UNVERIFIED current) or Pawstia routes via a Pawstia-managed OA (Card 7 decision). Either way someone pays ~1K THB/mo extra ΓÇö it must be surfaced in packaging (bundle guidance, not silent surprise). This is a real COGS/pricing input, not a detail.
6. **Future add-ons (Drive backup, SlipOK/e-tax, camera, multi-branch) stay out of V1 pricing** ΓÇö correct per approved docs; revisit only post-beta.
7. **No transaction fee in V1** ΓÇö payment collection doesn't exist by design (downstream gates); introducing a take-rate without a payment rail is incoherent.

## Acquisition / activation / retention

- **Acquisition:** founder-led direct outreach is the only model that fits (fragmented micro-merchants, no procurement, LINE-first contact). The playbook's 3 scripts + 30-day trial + free data import are the right wedge; the trust play ("your data stays in your Sheets") doubles as acquisition copy. Channel risk: LINE OA handle/channel ownership is unresolved (Card 7) ΓÇö for outreach that's tolerable, for product delivery it isn't. **UNVERIFIED:** whether Thai operators of this segment respond to cold LINE/FB outreach at meaningful rates ΓÇö measure replyΓåÆtrial rate in the 50-name list build (H-phase of playbook).
- **Activation:** CSV import + assisted room-matrix setup is the make-or-break step; the claim "staff learn in 3 minutes" is a hypothesis until store #1 measures it. Define activation as: first collision-free booking + first LINE report delivered within week 1. LIFF claim (48h TTL QR) adds a customer-side step at onboarding ΓÇö friction to watch in delivery success/failure metrics (already a beta metric).
- **Retention (month 2+):** the daily loop is the retention engine ΓÇö every stay produces a report, every report deepens pet history, every pet history raises switching cost; the Sheets replica keeps trust while the real lock-in (care profiles, booking history, repeat customers) accumulates silently. Secondary drivers: occupancy visibility for the owner, staff coordination, festival-season capacity planning. Realistic churn watch: seasonal dips (low season + quiet months) will test whether shops pause or churn; a shop that stops overnight boarding churns regardless ΓÇö the retention base must be shops whose daily volume persists.

## Risks / failure cases

1. **Vettale (and Thai-clone successors) adds a real daily-report/LINE feature** ΓÇö their breadth (POS/e-payment/TeleVet/multi-branch) + 25,900 THB/yr anchor could squeeze Pawstia from above. Mitigation is the single-store + LINE-native + Sheets-ownership focus, but it's a race, not a moat. No moat is provable pre-beta.
2. **LINE quota economics backfire:** if every shop needs a paid OA plan (~1,200 THB/mo UNVERIFIED) on top of 990 THB Pawstia, total cost of adoption doubles and the pitch ("cheaper than you think") breaks. Channel-ownership decision (Card 7) is a business decision, not just ops.
3. **Beachhead is thin:** 150ΓÇô400 BKK boardable singles (UNVERIFIED) caps revenue; churn replaces growth in a saturated niche. Expansion path (upcountry, grooming-adjacent, multi-branch upsell) must exist in roadmap but is out of V1.
4. **Status-quo stickiness + low WTP:** H1ΓÇôH3 are entirely unvalidated. If trialΓåÆpaid lands at 15% instead of 40%, unit economics with manual onboarding (each shop = hours of assisted setup + support) don't work. This is the single most likely failure mode.
5. **Fragmented micro-merchant base, owner-led buying:** no self-serve motion at this segment size in Thailand (hypothesis); manual sales/support cost per shop must stay < 12-month ARPU (~12ΓÇô18K THB) or growth eats cash.
6. **Seasonality:** festival peaks drive the acute pain but low months test renewal; pricing model must survive troughs.
7. **Free-tool inertia:** LINE+Sheets+notebook is genuinely good enough for small volumes; Pawstia wins only above a minimum daily volume ΓÇö mis-targeting sub-threshold shops wastes the founding cohort.
8. **Media/storage COGS:** 1ΓÇô4 photos ├ù 10ΓÇô30 pets/day = real storage cost growth; currently unbudgeted in pricing (no per-pet/media pricing anywhere in package). Must be sized before any all-inclusive "unlimited" promise hardens (Pro is already unlimited).
9. **Over-breadth temptation:** adding grooming/payment/multi-branch to chase deals would break the Product Gate identity and slow the loop; breadth creep is the known death pattern of micro-SaaS in this segment.
10. **Trust/liability creep:** daily care reports raise customer expectations of care quality; a missed report or lost pet incident becomes a Pawstia-visible liability conversation. Positioning must stay "operations + communication," not "guarantee of care."
11. **Generic booking tools (Calendar/Calendly-class) substitute the booking slice for price-sensitive shops** ΓÇö acceptable; they can't touch chain 2's care-report loop, but they cap what the booking-only pitch can sell alone.

## Assumptions

- Thai single-store pet hotel/daycare owners behave like LINE-first micro-merchants who buy via founder-led outreach (consistent with playbook design; UNVALIDATED).
- Daily report volume per shop (10ΓÇô30 pets/day) exceeds LINE OA free quota (300/mo) ΓÇö arithmetic from V1 product shape; actual cadence per shop UNVERIFIED.
- 990ΓÇô1,490 THB/mo is inside the WTP band for this segment ΓÇö inferred from Vettale's ~2,158 THB/mo effective price and the ~1.9%-of-revenue calc; no direct Thai operator WTP evidence exists.
- PetHub's 285-provider BKK count is a usable lower-bound proxy for the boardable subset (it includes clinics/daycare; overlap unknown).
- Status-quo prevalence (notebook/Excel/LINE per-pet chats) is the majority condition ΓÇö PS01 hypothesis H1, to be tested in 30-shop interviews.
- Global market reports' divergence means category-growth claims should stay qualitative.
- International competitors' absence from Thailand is structural (LINE, THB rails, Thai-language support), not just a current pricing-page artifact.

## Open questions / missing evidence

- **Thai operator interviews (H1/H3):** 0 of 30 done. Pain intensity, current-tool inventory, and price reaction are all open until run. This is the gate's biggest evidence hole.
- **Store #1 beta metrics:** onboarding time, staff learning curve, conflict prevention rate, report time, LINE delivery success/failure, support burden, WTP signal ΓÇö defined as Product Gate Card 4 metrics; none exist yet (out of this gate to evaluate, but they are the direct inputs to this gate's open hypotheses).
- **Current 2026 LINE OA tier pricing (TH):** Free 300/mo verified via help center; Basic/Pro current THB figures UNVERIFIED (last verified reference 1,200 THB/mo pre-Aug-2024). Needed for the cost-location analysis in condition #2.
- **Exact beachhead count:** no official registry/statistic for pet hotel/boarding establishments found; need a directory crawl (PETTO Zone, PetHub, Google Maps list from playbook) to bound TAM.
- **KennelMate / PetExec pricing:** not retrievable (site not found / sales-funnel-gated) ΓÇö mark UNVERIFIED; not load-bearing given their non-fit, but note as incomplete coverage.
- **MoeGo boarding/daycare THB-equivalent pricing:** demo-gated; UNVERIFIED whether MoeGo actively sells boarding in Thailand at what price.
- **Other Thai pet-business software** beyond Vettale (e.g., local booking/SaaS products for pet services): not surfaced in searches; a systematic Thai-language competitor sweep is missing evidence.
- **TrialΓåÆpaid benchmark for Thai micro-SMB SaaS at this price point:** no evidence; 40% (H2) is aspiration, not benchmark.
- **Storage cost per shop-month** at Pro-unlimited media usage: unsized.

## Confidence: 70

High confidence in the market's existence and the price-direction coherence (external evidence is solid and convergent). Medium-low confidence in PS01-specific WTP and pain prevalence ΓÇö zero Thai operator evidence exists yet, which is exactly what the beta must produce. Beachhead size and LINE economics are the two structural unknowns that could change the recommendation materially. Not higher than 70 because every payer-side number in this analysis is either a hypothesis or a proxy; not lower because the only verified direct competitor anchors Pawstia's price *below* the local incumbent with a sharper single-store wedge.