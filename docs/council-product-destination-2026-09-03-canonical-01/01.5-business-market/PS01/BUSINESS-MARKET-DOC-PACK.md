# PS01 Pawstia - Business / Market Document Pack

Run: WSTERA Product Destination Council - Canonical Run 01  
Gate: 01.5 Business / Market Gate  
Date: 2026-09-04  
Remediation: Targeted BM-1 / BM-2 Owner decision application

## BUSINESS-MODEL.md

### Business model

PS01 Pawstia V1 uses a B2B merchant-paid SaaS model.

The paying customer is the owning operator of a single-location pet hotel/daycare. Owner, manager, and staff use the system daily. Pet-owner customers receive LINE-native Daily Care Reports but do not pay Pawstia in V1.

### Beachhead

Initial beachhead is Bangkok-metro single-location pet hotel/daycare stores that already use LINE heavily and have enough daily/overnight volume for booking conflict prevention and daily owner reporting to matter.

The beachhead is credible but thin. It is sufficient for V1 validation and first revenue learning, but not sufficient as the whole long-term company ceiling without later expansion.

### Value loop

The daily business loop is:

check-in -> no-collision room assignment -> care context recorded -> 15-second Daily Care Report with 1-4 photos plus food/excretion/mood/note -> pet owner receives in LINE -> shop retains operational/customer data through export and Google Sheets replica.

### Revenue model

Primary revenue:

- Monthly subscription per single location.
- Capacity-based tiers.
- Founding Member C2 for first 10 invitation-only closed-beta/founding-cohort stores at 990 THB/month with Pro core room/pet entitlement, subject to continuity.

Secondary revenue:

- Optional onboarding/data-import/setup fee after beta, directionally 3,000-5,000 THB/store.
- Future separately paid add-ons, explicitly excluded from Founding Member C2.

Not V1 revenue:

- Transaction fees.
- B2C pet-owner subscription.
- LINE OA/message charge bundling.
- Clinic/pharmacy modules.
- Grooming queue.
- Multi-branch.
- Marketplace.

### Commercial readiness boundary

Payment collection is not implemented by design. Existing subscription lifecycle work is access-control / entitlement foundation only and must not be presented as payment proof.

Business/Market PASS does not mean paid-launch readiness.

## MONETIZATION.md

### Recommended V1 monetization

Use merchant-paid monthly subscription, per-location, tiered by capacity and operating scale.

The currently approved/provisional general-market pricing direction remains hypothesis-only:

- Starter: 990 THB/month, 10 rooms, 300 pet profiles.
- Pro: 1,490 THB/month, unlimited rooms/pets.
- Enterprise / single-store Pro Plus: 2,490 THB/month, unlimited staff and priority support.
- Annual: 2 months free.
- Onboarding: free during beta / first 10 stores; later 3,000-5,000 THB/store.

### Pricing status

These prices are commercially coherent but not validated. No WTP evidence exists. Do not label Starter/Pro/Enterprise public pricing as final launch pricing.

Founding Member C2 is a bounded acquisition incentive, not pricing validation.

### Founding Member C2 policy

Owner decision BM-1 is applied:

- Preserve CEO-locked Decision C = C2.
- Limit Founding Member to the first 10 stores only.
- Treat it as invitation-only closed-beta / founding-cohort packaging, not a public blanket offer.
- Commercial price remains 990 THB/month.
- Valid Founding Members receive the currently defined Pro core room/pet entitlement.
- Eligibility requires continuous subscription under the existing continuity contract.
- Benefit is shop-bound and non-transferable.
- Future separately paid add-ons are excluded.
- Loss of Founding continuity is terminal.
- THB 990 Founding pricing must not be used as proof of general-market Pro WTP or as the permanent public Pro price.

### LINE OA cost and packaging

Owner decision BM-2 is applied:

- For closed beta and paid production, LINE OA is store-owned / merchant-owned.
- Each merchant owns its own LINE Official Account.
- Each merchant bears its own LINE OA and messaging charges directly.
- Pawstia provides integration, configuration guidance, and setup/support.
- LINE OA/message charges are not bundled into the Pawstia V1 subscription.
- Merchant-side LINE cost must be disclosed clearly during onboarding and commercial packaging.
- WSTERA/Pawstia-owned LINE OA may be used only for internal development, controlled demo, or non-commercial test.
- Pawstia-managed or hybrid commercial LINE allowance is out of V1 scope unless a future explicit Owner decision changes it.

### Avoid in V1

- No transaction fees because payment collection is not implemented.
- No B2C pet-owner charging because the payer is the shop.
- No feature-gating of the core loop. Starter must still include room integrity, Daily Report, and Sheets ownership, or the wedge collapses.
- No claim that Founding C2 validates public WTP.
- No hidden LINE OA/message cost in packaging.

## COMPETITIVE-LANDSCAPE.md

### Status quo competitors

The strongest competitors are not software companies. They are the current workflow:

- LINE/Messenger personal chats.
- Phone calls.
- Paper/notebook/whiteboard.
- Google Calendar.
- Google Sheets / Excel.
- Generic booking tools.
- Existing POS/CRM.

These tools are free or familiar, but they fail at no-overlap room integrity, structured daily reports, retrievable care history, and low-risk adoption.

### Thai competitors

Happy Pet Tech:

- About 149 THB/month or 1,499 THB/year.
- Broad all-in-one grooming/boarding/daycare/vet positioning.
- Primary low-end price anchor.
- Risk: Pawstia must prove it is worth materially more than a cheap all-in-one.

FoxConnect:

- LINE-native booking/CRM with tiers around 690/1,590/2,990 THB/month.
- Closest LINE-native substitute.
- Validates LINE-first buying/usage behavior.
- Risk: may cover enough booking/CRM/reporting needs for some shops.

Vettale Petcare:

- Clinic-centric Thai product with pet hotel/spa module.
- Cited around 25,900 THB/year, about 2,158 THB/month.
- Broader feature set but different ICP and weaker Pawstia-specific data ownership/daily report wedge.

Other Thai clinic-centric substitutes:

- AnyVet SMART.
- Vetpresso.
- VetManage.

### International competitors

International tools validate the pet hospitality software category and merchant-paid monthly model:

- Gingr.
- PawPartner.
- PetExec.
- KennelBooker.
- DoggieDashboard.
- Pupline.
- ProPet.
- MoeGo.
- Anolla.

They are not strong direct Thai V1 substitutes because they are generally not LINE-native, not Thai-micro-merchant native, and often priced in USD with US/UK operating assumptions.

### Differentiation

Pawstia's V1 wedge:

- Thailand-first.
- LINE-native daily customer report.
- Single-location pet hotel/daycare focus.
- DB-backed no-overlap room integrity.
- Google Sheets ownership replica to reduce data lock-in fear.
- Storefront-device workflow for owner/manager/staff.

## POSITIONING.md

### Positioning statement

Pawstia is a Thailand-first operating system for single-location pet hotels and daycares that prevents room conflicts, produces LINE-native daily pet reports, and gives the shop confidence that its customer and booking data remains ownable through Google Sheets replica/export.

### Who it is for

- Single-location pet hotel/daycare owning operators.
- Bangkok-metro first.
- Shops with enough boarding/daycare volume that room conflicts and daily reporting are recurring operational pain.

### Who it is not for in V1

- Veterinary clinics as primary ICP.
- Grooming-only shops.
- Multi-branch chains.
- Marketplaces.
- Broad PMS buyers.
- Consumer pet owners paying directly.

### Positioning risks

- If positioned as "just booking," generic tools and FoxConnect are enough.
- If positioned as "cheap all-in-one," Happy Pet Tech wins on price.
- If positioned as clinic software, Vettale/AnyVet/Vetpresso/VetManage become stronger.
- Pawstia must position around the combined pet-hotel loop: room integrity + LINE Daily Report + Sheets ownership.

## CUSTOMER-VALUE-PROPOSITION.md

### Value proposition

Pawstia helps a single-location pet hotel/daycare run stays without room conflicts, send professional daily pet updates through LINE, and keep owner-controlled data confidence.

### Pain -> capability -> outcome -> business value -> reason to pay

1. Double-booking / room-slot conflicts

- Pain: peak-period overbooking creates refunds, lost room nights, angry customers, and reputation damage.
- Capability: DB-backed no-overlap booking integrity and visual room matrix.
- Outcome: staff can sell true capacity without collision.
- Business value: protects peak revenue and trust.
- Reason to pay: one avoided peak incident can justify a monthly subscription.

2. Daily photo/report chaos

- Pain: staff send photos/status manually across personal LINE chats, creating missed reports, no history, inconsistent quality, and audit problems.
- Capability: 15-second Daily Care Report with 1-4 photos plus structured status, delivered in LINE.
- Outcome: owners get consistent professional updates; shop keeps retrievable history.
- Business value: staff time saved, better perceived care, repeat bookings/referrals, fewer disputes.
- Reason to pay: this is the daily recurring loop that can drive month-2+ retention.

3. Data lock-in fear

- Pain: operators hesitate to adopt software because they fear losing customer/stay records.
- Capability: Google Sheets one-way ownership replica and export.
- Outcome: shop keeps an independent copy.
- Business value: adoption risk decreases.
- Reason to pay: this enables subscription adoption; it is not the standalone revenue driver.

## PRICING-HYPOTHESES.md

### Current pricing hypotheses

- Starter 990 THB/month may be acceptable for smaller shops if the core loop is included.
- Pro 1,490 THB/month may be acceptable for shops with enough room/pet volume.
- Enterprise / single-store Pro Plus 2,490 THB/month may be acceptable when staff count/support need is high.
- Annual with 2 months free is directionally normal.
- Onboarding at 3,000-5,000 THB/store after beta is plausible if it replaces real migration/setup burden.

### Founding C2 classification

- Founding Member C2 remains 990 THB/month for the first 10 invitation-only stores.
- It is a closed-beta / founding-cohort acquisition incentive.
- It preserves the current Pro core room/pet entitlement while the shop maintains continuity.
- It is shop-bound, non-transferable, excludes future paid add-ons, and is terminal after continuity loss.
- It must not be interpreted as validation of public Pro WTP.
- It must not be presented as the permanent public Pro price.

### LINE OA economics classification

- Pawstia V1 subscription excludes LINE OA/message charges.
- Merchant owns and pays for its own LINE Official Account and messaging.
- Packaging and onboarding must disclose merchant-side LINE cost clearly.
- Actual message volume and merchant-side LINE cost still require downstream validation.

### Unvalidated

- WTP for Starter/Pro/Enterprise public pricing.
- Willingness to pay above Happy Pet Tech / FoxConnect alternatives.
- Trial-to-paid conversion.
- Churn/retention.
- ARPU versus support/onboarding cost.
- Measured staff-time saving.
- Measured revenue lift.
- CAC/payback.
- LINE OA message volume per merchant.
- Media storage cost.
- Seasonality.
- Long-term PMF.

### Required pricing guardrails

- Do not call public pricing final.
- Do not treat Founding C2 as public Pro WTP proof.
- Do not hide LINE OA costs from packaging.
- Do not bundle LINE OA/message charges into Pawstia V1 subscription.
- Do not promise unlimited media economics until storage cost is modeled.

## MARKET-ASSUMPTIONS.md

### Assumptions to validate

- Bangkok-metro single-location pet hotel/daycare beachhead is plausibly enough for V1 validation.
- Qualifying shop count is likely limited and fragmented; exact count is unverified.
- Operators are owner-led buyers, not self-serve SaaS buyers.
- LINE is the default communication channel for pet-owner updates.
- Shops are currently using LINE, paper/notebook, Sheets, Calendar, or generic tools.
- Daily reports and peak booking conflicts are painful enough to support paid subscription.
- 990-1,490 THB/month is inside WTP for target operators.
- Manual onboarding is affordable for first 10-30 shops but must become templated.
- Merchant-owned LINE OA onboarding is acceptable to shops.
- Merchant-side LINE OA/message charges do not materially suppress adoption once disclosed.
- Seasonality may affect churn.
- Happy Pet Tech/FoxConnect may be good-enough substitutes for price-sensitive shops.

### Evidence to collect next

- 30 target-shop interviews.
- Store #1 closed beta.
- WTP reactions to 990/1,490/2,490 THB.
- LINE OA tier/current cost confirmation.
- Per-shop report message volume.
- Media storage cost.
- Competitor feature-depth check for Happy Pet Tech and FoxConnect in overnight boarding.
- Bangkok-metro qualifying shop list.
- Onboarding/support hours per merchant-owned LINE OA setup.

## GATE VERDICT

Verdict: PASS

Reason:

PS01 has a credible recurring paid market, clear payer, recurring pain, and coherent V1 subscription direction. It is not blocked by missing post-build metrics.

The two prior Business/Market blockers are closed:

- BM-1 resolves Founding Member packaging by preserving C2 as a first-10-store, invitation-only, continuity-dependent, shop-bound founding-cohort incentive that is not public Pro WTP evidence.
- BM-2 resolves LINE OA ownership/economics by making LINE OA store-owned / merchant-owned, merchant-paid, disclosed, and excluded from Pawstia V1 subscription.

This PASS does not approve launch, build, paid production, public pricing validation, payment integration, implementation readiness, security, architecture, or PMF.

## DOWNSTREAM BLOCKER CLASSIFICATION

### Business/Market blockers for this gate

None remain after BM-1 and BM-2.

### Closed Business/Market blockers

- Founding Member 990 THB Pro-forever handling: closed by BM-1.
- LINE OA ownership/economics: closed by BM-2.
- Pricing labeling: closed by preserving Starter/Pro/Enterprise as hypotheses and Founding C2 as bounded acquisition incentive only.

### Downstream validation items, not this gate's blockers

- Real-store retention.
- Churn.
- Measured staff time saving.
- Measured revenue lift.
- CAC/payback.
- Long-term PMF.
- Trial-to-paid conversion.
- Actual paid launch pricing.
- WTP for Starter/Pro/Enterprise public pricing.
- Onboarding/support cost.
- Seasonality.
- Media/storage economics.
- Actual LINE message volume per merchant.
- Payment collection implementation.
- Database, schema, architecture, auth, RLS, security, provider, runtime, deployment, UI, migration, and launch readiness.
