# Business/Market Document Pack - LK01 WSTERA Link

Verdict carried from synthesis: **PASS**
Confidence: **65/100**
Product identity: **Thai-first branded campaign-link + first-party outbound click attribution**
Authoritative verdict source: `.secretary-relay/t_f10edf03/LK01-GATE-VERDICT.json`
Original Council recommendation source: `.secretary-relay/t_f10edf03/council-decision/DECISION-SYNTHESIS.CODEX-ORIGINAL.json` (`CONDITIONAL MARKET-DIRECTION CREDIBLE`, confidence 65/100)
Boundary: **no implementation, schema, migration, deployment, pricing change, architecture change, Agent Relay, launch, Layer 2, or CM01 dispatch**

## 1. Business model

LK01's credible model is recurring SaaS subscription for Thai sellers, creators, agencies, affiliates, page admins, and SMB operators that repeatedly distribute campaign links or QR codes across Thai social-commerce channels.

Primary paid value:

- stable branded link/QR;
- destination switching without replacing distributed links or printed QR;
- first-party outbound click attribution;
- cross-channel source/referrer/UTM visibility;
- redirect reliability independent from analytics/billing/dashboard availability;
- Thai-first workflow, language, onboarding, and support.

The product should be sold as campaign-link control and outbound attribution, not as generic URL shortening.

## 2. Payer / user profile

| Role | Description | Pays? | Notes |
|---|---|---:|---|
| Thai seller / SMB operator | Runs social-commerce campaigns across Facebook, LINE, TikTok, marketplace affiliate links, and QR | Yes | Core initial payer if destination changes and attribution matter |
| Creator / affiliate operator | Shares destination links across multiple channels and needs source-level performance | Yes | Good fit when links are recurring and commercially meaningful |
| Agency / page admin | Manages links for clients, campaigns, or multiple pages | Yes | Stronger Business-tier hypothesis if reporting/support load exists |
| End customer / follower | Clicks the published link or scans QR | No | Must get reliable redirect; not a buyer |
| Marketplace / social platform | Destination or distribution channel | No | Native analytics is a substitute, not LK01 payer |

Best-fit first paid users have at least one recurring condition:

- they publish links/QRs in multiple places;
- destination changes after distribution;
- channel/source attribution affects decisions;
- reporting currently requires manual consolidation;
- brand trust/custom URL matters;
- replacing posts, bios, ads, chat messages, printed QR, or offline media is painful.

Poor-fit users:

- one-off personal links;
- one stable link with no business outcome;
- users satisfied with free shorteners;
- users whose platform-native analytics already answer the business question;
- users seeking full web analytics, ad-pixel replacement, link-in-bio, affiliate network, or marketing automation.

## 3. Revenue and monetization

Revenue direction: recurring subscription with a free entry tier.

Reported locked commercial inputs from Product Gate sources:

- Free: 0 THB.
- Pro: 199 THB/month.
- Business: 590 THB/month.

Business / Market interpretation:

- These prices are plausible hypotheses, not validated willingness-to-pay.
- This gate does not change, approve, or finalize public pricing.
- Later pricing work must validate real WTP, conversion, retention, click-cost margin, support cost, billing rails, and competitive pressure.

Potential packaging dimensions:

- active links/QRs;
- tracked clicks/month;
- analytics visibility/retention;
- number of destination edits;
- custom domain / branded domain when verified;
- users/team/client scale;
- campaign/export/reporting needs;
- support and onboarding tier.

Avoid pricing against raw free limits alone. Short.io's free tier creates strong pressure, so paid packaging should attach to workflow value and reliability.

## 4. Free / paid boundary

Free should prove the loop and filter out low-value users.

Free value:

- create stable branded campaign links/QRs within low limits;
- see enough analytics to understand the product;
- experience destination switching within the locked Product Gate boundaries;
- keep redirects reliable.

Paid upgrade trigger:

- higher recurring link/QR volume;
- more tracked clicks;
- longer analytics visibility/history;
- recurring destination changes;
- branded/custom-domain workflow when later verified;
- agency/client scale;
- operational reporting value;
- Thai support/onboarding;
- reduced risk from printed or widely distributed links going stale.

Free must not be interpreted as evidence of WTP. Free usage without recurring destination changes or attribution actionability may never convert.

## 5. Competitive landscape

### Status quo

The strongest competitor is the current manual stack:

- free shorteners;
- direct platform links;
- Facebook/TikTok/LINE/native platform analytics;
- manual UTM links;
- spreadsheets;
- admin/agency memory;
- manually replacing links where possible;
- static QR for simple use cases.

Status quo is free, familiar, and often good enough. LK01 should target users whose pain recurs enough that manual work becomes a business cost.

### Direct / near-direct alternatives

- Bitly: global link management, short links, QR, analytics, paid tiers.
- Rebrandly: branded links, destination edits, custom domains, paid tiers.
- Short.io: branded links, tracking, custom domains, generous free tier, paid tiers.
- Dub and other link-management/open-core products.
- Dynamic QR providers and QR analytics tools.

### Competitive conclusion

LK01 should not claim any single feature is unique. The market thesis depends on a workflow combination:

`Thai-first seller workflow + stable branded link/QR + destination switching + first-party outbound attribution + cross-channel source view + hot-path redirect reliability`

## 6. Positioning

Position LK01 as:

**Thai-first campaign-link control for sellers and creators who need stable links, editable destinations, and outbound click attribution across social-commerce channels.**

Do not position LK01 as:

- generic shortener;
- full web analytics;
- ad attribution/pixel replacement;
- link-in-bio builder;
- affiliate network;
- marketing automation suite;
- QR-only tool;
- enterprise link-governance platform.

Messaging should lead with operational outcomes:

- keep links and QR codes stable after publishing;
- change destinations without rebuilding campaign assets;
- know which source/channel generated outbound clicks;
- keep redirect reliability above analytics completeness;
- use Thai-first workflow/support for local sellers and agencies.

## 7. Customer value proposition

| Customer pain | LK01 capability | Outcome | Business value | Reason to pay |
|---|---|---|---|---|
| Links/QRs become stale | Destination switching behind stable URL/QR | No asset replacement | Avoids lost traffic, bad customer experience, and reprint/repost work | Pays when destinations change repeatedly |
| Cross-channel performance is fragmented | Link-level source attribution | See outbound clicks by source/referrer/UTM/direct | Better channel/campaign decisions | Pays when data changes decisions |
| Reporting is manual | Central link analytics | Less spreadsheet/admin consolidation | Saves operator/agency time | Pays when reporting repeats |
| Free shortener is too generic | Branded link/QR and Thai-first workflow | Better campaign control and trust | Better customer confidence and operational continuity | Pays for workflow, not shortening |
| Printed QR points to old offer | Dynamic destination via stable URL | Re-point without reprint | Saves offline material and campaign recovery cost | Pays when print/offline repeats |
| Analytics system may fail | Redirect hot path independent from analytics/billing/dashboard | Link keeps resolving | Protects live campaigns | Pays when reliability risk has commercial cost |

## 8. Pricing hypotheses

Pricing hypotheses remain unvalidated.

Current evidence supports only that:

- similar categories monetize with subscription tiers;
- Thai social-commerce distribution is large enough to justify testing;
- LK01's target pain can plausibly recur;
- the reported THB prices are low enough to be testable against global SaaS anchors;
- Short.io/free/status quo will pressure conversion.

Before public launch, validate:

- whether 199 THB/month is enough value for Pro users;
- whether 590 THB/month has enough Business-tier differentiation;
- whether free limits produce activation without over-serving non-paying users;
- whether click/storage/analytics/support cost fits ARPU;
- whether custom domain or higher analytics retention is a real upgrade trigger;
- whether annual discount, trial length, onboarding support, and refund policy are needed.

## 9. Market assumptions

Assumptions to carry forward:

- Thai sellers/creators/agencies have enough recurring destination-change pain to pay.
- Cross-channel outbound attribution changes decisions rather than serving as vanity analytics.
- Stable QR/link assets matter enough for print, packaging, offline media, bios, ads, and chat distribution.
- Thai-first UX/support creates adoption advantage despite global competitors.
- Redirect reliability is valued enough to differentiate LK01 from cheap/free tools.
- A narrow seller/creator/agency wedge can be reached before broader SMB expansion.

Unknowns:

- exact segment size;
- WTP;
- retention;
- usage frequency;
- traffic volumes;
- click-cost and storage economics;
- support/onboarding burden;
- CAC/payback;
- payment rail feasibility;
- abuse/compliance cost.

## 10. Risk register

| Risk | Severity | Gate classification | Carry-forward action |
|---|---|---|---|
| Free/status quo good enough | High | Commercial risk, not blocker | Qualify users by recurring destination-change and attribution pain |
| Short.io free-tier pressure | High | Commercial risk, not blocker | Avoid raw-limit competition; lead with Thai workflow/outcomes |
| WTP unverified | High | Downstream Pilot/Launch validation | Interview and paid-pilot test |
| Retention unverified | High | Downstream Pilot/Launch validation | Measure month-2/month-3 usage and repeated destination changes |
| Attribution not actionable | High | Downstream Pilot validation | Confirm users make campaign/channel decisions from data |
| Unit economics unknown | High | Later Business/Launch validation | Measure click/storage/support/onboarding cost |
| Redirect reliability failure | High | Architecture/Risk/Pre-Build | Preserve hot-path invariant and test under degraded dependencies |
| Billing rails unresolved | High | Architecture/Risk/Launch | Verify provider truth, renewals, failed-payment, PromptPay/manual reconciliation |
| Abuse/spam/public redirect misuse | High | Risk/Invariant Gate | Define abuse controls, takedown, bot filtering, quota rules |
| PDPA/data handling | Medium-High | Risk/Invariant/Legal | Define raw-IP, retention, deletion, and privacy expectations |
| Incumbent localization/copying | Medium-High | Competitive risk | Build workflow habit and Thai support proof |
| Scope drift | High | Product/Pre-Build risk | Keep out of analytics/link-in-bio/affiliate/marketing automation |

## 11. Downstream-validation register

These items remain open and must not be lost:

- 5-10 Thai seller/creator/agency discovery interviews.
- At least one real campaign activation.
- Direct WTP signal or paid pilot.
- Free-to-Pro conversion.
- Month-2/month-3 retention.
- Recurring destination-change frequency.
- Attribution actionability.
- Real click volume and cost per click.
- Analytics retention cost.
- Business-tier margin.
- Custom-domain demand.
- Onboarding and Thai support burden.
- CAC, sales channel, sales cycle, and payback.
- Payment rail eligibility and lifecycle.
- Abuse/bot/quota/compliance thresholds.
- Competitive pricing/features re-check before launch/commercial decision.

## 12. Gate closeout

Business / Market Gate verdict: **PASS**.

No Business / Market blocker remains under the frozen gate contract.

This PASS closes only the LK01 Business / Market market-direction gate. It does not authorize build, launch, pricing mutation, architecture, billing, implementation, deployment, Agent Relay, Layer 2, or CM01 dispatch.
