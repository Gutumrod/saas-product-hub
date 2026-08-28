# P0a-B4 Evidence — Document/Code Reconciliation

**Satisfies:** P0a item 6 (`PORTFOLIO_PRODUCTION_MASTER_PLAN.md` §5).

**Method:** each worklist item was independently verified against the actual repository state
(`git log`, `grep`, direct file reads) before any edit — several items were already fixed by prior
commits and are recorded as such, not silently skipped, per the brief's instruction.

**Parent repository HEAD at start:** `0c296f0273ee97261105bf129c582d8378dca72a`
(`docs: rename PawSpace public brand to Pawstia (§10 D8)`), working tree otherwise clean except the
nine untracked P0a-B1/B2/B3 files listed in the brief.

**Parent repository HEAD at end:** `0c296f0273ee97261105bf129c582d8378dca72a` — unchanged. No
collision with the parent-repo session. (`products/PawSpace` is edited in its own nested repo,
independent HEAD, unaffected by and not affecting the parent's HEAD.)

---

## Item 1 — BK01 status wording

**Stale.** `docs/platform/ROADMAP.md` §A1's `booking` row Effort column read `Done`, with no
qualifier, despite the master plan §2 finding that BK01 has no application test layer and currently
fails clean lint/build.

- **File:line:** `docs/platform/ROADMAP.md`, the `booking` row in the §A1 table (originally line 243
  before other edits in this pass; unchanged position after — no earlier lines in that table were
  inserted/removed).
- **Before:** `...products/booking/docs/platform/PHASE_0_BASELINE_SNAPSHOT_2026-08-20.md`. | Done |`
- **After:** `...products/booking/docs/platform/PHASE_0_BASELINE_SNAPSHOT_2026-08-20.md`. **Corrected
  under P0a-B4:** this "Done" was feature-completion only — BK01 has no application test layer and
  currently fails clean lint/build (see `PORTFOLIO_PRODUCTION_MASTER_PLAN.md` §2). | Feature complete,
  not production safe |`
- **Evidence for correction:** `PORTFOLIO_PRODUCTION_MASTER_PLAN.md` §2 evidence table, BK01 row:
  "Clean lint fails, clean build depends on untracked environment state, and there is no application
  test suite or CI." Independently confirmed by `docs/platform/PRODUCTION_LAUNCH_PLAN_2026-08-27.md`
  §1.1 item 1, which flags the exact same `ROADMAP.md` §A1 "Done" wording.

## Item 2 — PS01 `COMMERCIAL_READINESS.md`

**Stale.** `products/PawSpace/docs/COMMERCIAL_READINESS.md` had both "Subscription lifecycle
implemented" and "Payment collection process defined" unchecked under one "Before Paid Launch"
heading, conflating two different facts: the lifecycle schema exists, payment collection does not.

- **File:line:** `products/PawSpace/docs/COMMERCIAL_READINESS.md:21-22` (own nested repo, clean
  working tree before edit, independent of the parent HEAD tracked above).
- **Before:**
  ```
  - [ ] Subscription lifecycle implemented.
  - [ ] Payment collection process defined.
  ```
- **After:**
  ```
  - [x] Subscription lifecycle schema implemented (Phase 13: `shop_subscriptions`,
        `subscription_audit_log`, transition RPCs — `supabase/migrations/20260825141500_phase13_subscription_lifecycle.sql`,
        `20260825141600_phase13_subscription_hardening.sql`). This is the state-machine schema only;
        it is not connected to any payment collection.
  - [ ] Payment collection absent. No payment/billing integration exists anywhere in the product by
        design (Phase 9/11 both explicitly scoped it out) — do not read the schema item above as
        revenue-collection capability.
  ```
- **Evidence for correction:** `supabase/migrations/20260825141500_phase13_subscription_lifecycle.sql`
  (671 lines, `CREATE TABLE shop_subscriptions`, `CREATE TABLE subscription_audit_log`) and
  `20260825141600_phase13_subscription_hardening.sql` (274 lines) exist and are committed
  (`products/PawSpace` at `master@97c9fd6`). `grep -rli stripe` over `src/` and `package.json` returns
  no hits — no payment integration exists. Matches `docs/products/registry.yaml`'s `pawspace`
  description, which already states this split correctly, and
  `PORTFOLIO_PRODUCTION_MASTER_PLAN.md` §2's PS01 row.

## Item 3 — `ROADMAP.md` HC01 reference server

**Stale.** The "Active scope — locked 2026-08-27" section's HC01 bullet read "four modules +
reference server + 14/14 tests already exist" in present tense with no branch qualifier, implying
this is true of the default branch.

- **File:line:** `docs/platform/ROADMAP.md`, HC01 bullet under "Sell outright (one-time license)"
  (line 175 before this pass's edits).
- **Before:** `` 3. **`headless_commerce`** (`HC01`) — four modules + reference server + 14/14 tests
  already exist; REVENUE-STRATEGY.md already prices a one-time self-host source-license option ($99)
  alongside its SaaS-tier option. ``
- **After:** `` 3. **`headless_commerce`** (`HC01`) — four modules exist on default branch `master`; a
  reference server exists only on open PR #1 (`feat/reference-server`), not merged, and reproducibly
  passes 13/14 tests on the audit host (see line 185 below and master plan §2), not 14/14.
  REVENUE-STRATEGY.md already prices a one-time self-host source-license option ($99) alongside its
  SaaS-tier option. ``
- **Evidence for correction:** `PORTFOLIO_PRODUCTION_MASTER_PLAN.md` §2, HC01 row: "Default branch has
  no integrated product; PR server has no auth/persistent DB and reproducibly passes only 13/14 tests
  on the audit host." `docs/platform/REVIEW-P0a-B1-2026-08-27.md` §3 independently confirms
  `products/headless-commerce` is on branch `feat/reference-server` (`79c1d7c`), not the default
  branch `master` (`3147162`).
- Also updated the file's own top-of-file "2026-08-27 revision 3" note (originally lines 9-15) from
  describing this (and items 1 and 4) as outstanding to recording them as corrected under P0a-B4.

## Item 4 — `ROADMAP.md` §A1 CM01 removal

**Stale.** The `booking_ticket_module` row in §A1 still carried its 2026-08-21 "no clear sell
path — dropped from the near-term sell-first shortlist" removal, unqualified, contradicting the
2026-08-27 seven-product lock in which CM01 is explicitly in scope as a sell-outright one-time-license
product (`PORTFOLIO_PRODUCTION_MASTER_PLAN.md` §1, §6.6; `ROADMAP.md`'s own "Active scope" section
above §A1).

- **File:line:** `docs/platform/ROADMAP.md`, §A1 `booking_ticket_module` row (line 238 before this
  pass's edits).
- **Before (relevant clause):** `**Current status: no clear sell path** — dropped from the near-term
  "sell first" shortlist entirely (final shortlist: `booking`, `pawspace`). Standalone
  template-market sale remains theoretically possible but weak (no distribution channel); revisit
  only if a concrete buyer/channel appears.`
- **After:** the same clause struck through (`~~...~~`) with an appended sentence: `**Superseded
  2026-08-27:** the seven-product lock (`PORTFOLIO_PRODUCTION_MASTER_PLAN.md` §1, this file's "Active
  scope" above) puts `booking_ticket_module` (`CM01`) back in scope as a sell-outright
  one-time-license product, sold as a UI/source template (§10 D6) — the "no clear sell path" removal
  above no longer holds.`
- **Evidence for correction:** `PORTFOLIO_PRODUCTION_MASTER_PLAN.md` §1 table lists CM01 in the seven
  in-scope repositories; §6.6 gives CM01 a full work-package/release-checkpoint section; §10 D6 locks
  its deliverable boundary. `ROADMAP.md`'s own "Active scope — locked 2026-08-27" section (line 171)
  independently lists `booking_ticket_module` (`CM01`) under "Sell outright."

## Item 5 — `ROADMAP.md` "Project B routing truth" table

**Already correct — no change made to `ROADMAP.md`.** The table's `booking` row already reads
`canonical host is bk01.wstera.com`, not `booking.wstera.com`.

- **Verification:** `git log -p -S "bk01.wstera.com" -- docs/platform/ROADMAP.md` shows commit
  `4385017` ("docs(platform): lock CEO decisions D1-D3") already replaced the stale
  `booking.wstera.com` line with `bk01.wstera.com` on 2026-08-27, before this brief started. Direct
  read of the current file confirms the row is correct.
- **However, the claim describing this as still-broken was itself stale, in three other files** (the
  master plan's own §10 D1 text, `HANDOFF.md`, and `PRODUCTION_LAUNCH_PLAN_2026-08-27.md`) — see the
  "additional contradictions found" section below for the fix. This is a case of the fix commit
  (`4385017`) correcting `ROADMAP.md` but not correcting its own residual-work sentence describing
  `ROADMAP.md` as still broken.

## Item 6 — DC01 registry description

**Already correct — no change made.** `docs/products/registry.yaml`'s `doccraft` entry `description`
field already reads: "Phase 4 is independently closed and the 2026-08-27 clean rerun passed 118 unit
tests, build, and 32 browser tests; Gate 3 manual Chrome/Edge native-print acceptance and later
cloud/auth/billing/operations phases remain open" — matching `PORTFOLIO_PRODUCTION_MASTER_PLAN.md`
§2's DC01 row exactly (Phase 4 head, not Phase 1-2).

- **Verification:** `git log --oneline -- docs/products/registry.yaml` shows this description was
  last updated at commit `8a13054` ("docs: harden production plan after clean-slate audit"), before
  the P0 revision-3 plan (`da2502b`) that names this item, and well before this brief. No Phase 1-2
  language exists anywhere in the current entry.

## Item 7 — Mixed-case paths

**Partially stale.** Fixed in the parent repo's platform documents, registry, and `.gitignore`
(reference corrections only — no directory was renamed, moved, or created).

- **`.gitignore:22`** — before: `/products/wstera-link/` (lowercase duplicate). After: removed.
  Kept `/products/WSTERA-Link/` (now line 50), which matches the actual on-disk directory name (the
  physical rename is explicitly out of this brief's scope). **Evidence:** `git log --follow -p --
  .gitignore` shows `/products/WSTERA-Link/` was added first ("chore: gitignore products/WSTERA-Link
  nested repo") and `/products/wstera-link/` was added later as an "add missing" line that duplicated
  it without matching any real directory — removing the non-functional, premature lowercase line
  preserves the file's actual ignore behavior (`ls products/` confirms `WSTERA-Link` is still the real
  directory name) while eliminating the stale duplicate the brief names.
- **`docs/products/registry.yaml:614`** `path: "products/DocCraft"` → `path: "products/doccraft"`.
  **`docs/products/registry.yaml:616`** comment `Runtime/tooling locked in
  products/DocCraft/docs/SYSTEM_ARCHITECTURE.md.` → `products/doccraft/docs/SYSTEM_ARCHITECTURE.md.`
  **Evidence:** D5 (master plan §10) requires all-lowercase canonical paths; `pawspace` (line 508) and
  `wstera-link` (line 471) entries were already lowercase (confirmed by
  `docs/platform/REVIEW-P0a-B1-2026-08-27.md` §4b), leaving `doccraft` as the one stale field.
- **`docs/products/registry.yaml`, `booking` entry comment** (originally lines ~78-80): replaced a
  stale routing comment ("will deploy under booking.wstera.com... corrected 2026-08-24 after being
  misrecorded") with the current D1 hostname (`bk01.wstera.com`). Not a casing fix but the same class
  of stale-fact-vs-decision drift found while reading this entry for item 7; recorded under "additional
  contradictions" below.
- **`docs/platform/BILLING_CORE_PLAN.md:68,328,455,458,472,473`** — six `products/PawSpace` /
  `products/DocCraft` references lowercased to `products/pawspace` / `products/doccraft`.
  **Evidence:** exact line numbers matched `docs/platform/REPOSITORY_MAP.md`'s independently-cited
  worklist (lines 163-168) before editing; re-grepped after editing — zero mixed-case hits remain in
  this file.
- **`docs/platform/ROADMAP.md`** — two references: line 105's `products/PawSpace/registry.yaml` (also
  factually wrong regardless of casing — no `registry.yaml` file exists inside `products/pawspace`;
  corrected to point at `docs/products/registry.yaml`'s pawspace entry) and line 162's
  `products/DocCraft/docs/BUSINESS_MODEL.md` → `products/doccraft/docs/BUSINESS_MODEL.md`.
  **Evidence for the nonexistent-file correction:** `docs/platform/REPOSITORY_MAP.md` lines 182-184
  independently found and recorded that no `registry.yaml` exists inside `products/PawSpace/`.
- **Deliberately left unchanged (frozen evidence/review documents, not live references):**
  `docs/platform/REPOSITORY_MAP.md`, `docs/platform/RUNTIME_MATRIX.md`,
  `docs/platform/REVIEW-P0a-B1-2026-08-27.md`, `docs/platform/REVIEW-P0a-B3-2026-08-27.md`, and
  `docs/platform/ENVIRONMENT_AND_SECRETS_POLICY.md`. The first four are dated audit/review records of
  a past state (their own mixed-case citations are what they found, not a live claim of correctness);
  rewriting them would corrupt the evidence trail. `ENVIRONMENT_AND_SECRETS_POLICY.md`'s citations are
  literal file paths as read during its own P0a-B2 session and are technically accurate as filesystem
  paths today (the directory has not been renamed) — left alone as a judgment call; flagged for
  reviewer re-check below.
- **Not touched, out of worklist scope:** `docs/platform/PRODUCTION_LAUNCH_PLAN_2026-08-27.md` §1.1's
  discussion of these same issues (a historical finding record, non-authoritative per master plan §1)
  was read but left as-is except the one D1/ROADMAP residual-work sentence (§10 D1 fix, below) since
  its content is a past-tense finding, not a live incorrect claim.
- **PawSpace's own nested repo** (`products/PawSpace/`) was not swept for internal mixed-case
  self-references — out of this brief's parent-repo scope, consistent with
  `docs/platform/REPOSITORY_MAP.md`'s explicitly declared scope boundary.

## Item 8 — `canonical_host` claim in §10 D1

**Stale — the factual claim, not the decision.** §10 D1 stated *"`registry.yaml` already reserves
each `canonical_host`."* Verified false as a blanket claim: only BK01 (`registry.yaml:64`) and LK01
(`registry.yaml:456`, pre-edit numbering) carry a `canonical_host` free-text comment; PS01 and DC01
had none. The decision itself (canonical host = product code) is unchanged.

- **File:line:** `docs/platform/PORTFOLIO_PRODUCTION_MASTER_PLAN.md`, §10 D1 (lines 846-854 before
  this pass).
- **Before:**
  ```
  ...2026-08-26 with the `product_id`/`product_code` adoption (commit `45e6f23`); `registry.yaml`
  already reserves each `canonical_host`. Stripe redirect URLs, OAuth callbacks and LINE callbacks
  ...alias (`pawspace.wstera.com` → PS01) may be added later pointing at the same product and blocks
  nothing. Residual work is documentation only: `ROADMAP.md`'s "Project B routing truth" table still
  says `booking` deploys under `booking.wstera.com` — that line is stale and is corrected under P0a,
  not treated as a live fork.
  ```
- **After:**
  ```
  ...2026-08-26 with the `product_id`/`product_code` adoption (commit `45e6f23`); `registry.yaml`
  records the `canonical_host` reservation as a free-text comment for BK01 and LK01, and the same
  free-text comment was added for PS01 and DC01 under P0a-B4 (`docs/platform/PHASE_P0a_B4_EVIDENCE.md`
  item 8) — it is not a structured YAML field for any of the four, which is recorded as an open
  question for the CEO. Stripe redirect URLs, OAuth callbacks and LINE callbacks
  ...alias (`pawspace.wstera.com` → PS01) may be added later pointing at the same product and blocks
  nothing. `ROADMAP.md`'s "Project B routing truth" table already reads `bk01.wstera.com` (corrected
  in commit `4385017`); no residual documentation work remains on that line.
  ```
- **Evidence for correction:** `docs/platform/REVIEW-P0a-B3-2026-08-27.md` §4 (lines 60-80) — direct
  read of `registry.yaml` confirming only BK01/LK01 carry `canonical_host` comments, that both are
  unstructured comments not a queryable field, and that the master plan's blanket claim is "not
  accurate as written." This review was itself an authoritative P0a-B3 input for this brief.
- **Reservation completed for PS01 and DC01, same free-text-comment convention:**
  - `docs/products/registry.yaml:498` (new): `# canonical_host ps01.wstera.com reserved (docs-only,
    no DNS record created).` — added immediately after the `pawspace` entry's `delivery_model` field,
    matching LK01's placement/wording pattern exactly.
  - `docs/products/registry.yaml:606` (new): `# canonical_host dc01.wstera.com reserved (docs-only,
    no DNS record created).` — same placement/wording pattern, added to the `doccraft` entry.
  - No new YAML field or schema was invented; the exact comment convention already used by BK01/LK01
    was reused verbatim in form.
- **Same false claim found and fixed in two more places (not on the original worklist, found while
  reconciling item 8):**
  - `HANDOFF.md:61-64` — the D1 summary bullet repeated the same "`registry.yaml` already reserves
    each `canonical_host`" claim and the same stale "fix the one stale `ROADMAP.md` routing line"
    residual-work sentence. Corrected identically to the master plan fix above.
  - `docs/platform/PRODUCTION_LAUNCH_PLAN_2026-08-27.md:138` — the P3 "RESOLVED" note still said the
    ROADMAP routing-table fix was outstanding ("ที่ค้างคือแก้ ROADMAP routing table..."), when the
    same commit that added this note (`4385017`) had already made that exact fix. Corrected to say
    the fix landed in commit `4385017` and nothing is outstanding on that line.
- **Note for the CEO (not acted on — recording only, per brief instruction):** the portfolio currently
  represents `canonical_host` as a free-text YAML comment for all four products with any reservation
  recorded (BK01, LK01, and now PS01, DC01 under this brief). A comment cannot be validated by
  tooling — nothing fails CI if a comment goes stale or a new product is added without one. Whether
  `canonical_host` should become a real structured field (with a schema check) is a decision worth
  making later; this brief did not invent a new field because the brief's instructions require
  reusing the existing convention exactly, not designing a new one.

---

## Additional document-versus-code contradictions found, not on the original worklist

1. **`docs/products/registry.yaml`, `booking` entry comment (fixed)** — a stale comment described
   `booking` as "will deploy under booking.wstera.com," predating the D1 hostname decision
   (`bk01.wstera.com`). Corrected to name the current canonical host and cite §10 D1, consistent with
   the identical fix already made in `ROADMAP.md`, `BILLING_CORE_PLAN.md` and elsewhere for the same
   decision. This is a stale fact (an outdated domain claim), not a decision, so it was fixed directly.
2. **`docs/platform/ROADMAP.md:105`, stale file reference (fixed)** — cited
   `products/PawSpace/registry.yaml`'s "pawspace entry," but no `registry.yaml` file exists inside
   `products/PawSpace/` at all (only casing was in question for other items; this one pointed at a
   file that does not exist regardless of case). Corrected to point at
   `docs/products/registry.yaml`, the only registry file that actually exists, per
   `docs/platform/REPOSITORY_MAP.md` lines 182-184's independent finding of the same gap.
3. **`HANDOFF.md` and `PRODUCTION_LAUNCH_PLAN_2026-08-27.md`, duplicate D1 claim (fixed)** — see item
   8 above. Both repeated the master plan's stale "`registry.yaml` already reserves..." /
   "ROADMAP routing line still stale" claims; both fixed identically.

No other document-versus-code contradiction was found and left unfixed as a mere observation; the
items above were unambiguous stale facts (not decisions) and were corrected directly per the brief's
"minimum edit" rule.

## Places where fixing a stale fact would have required changing a CEO decision

None found. Every stale claim identified above was a factual assertion about document/registry state
(what `ROADMAP.md` says, what `registry.yaml` contains, what branch code lives on) — not a decision
itself. No §10 decision's substance (D1-D8) was altered; only false factual claims embedded in D1's
own text were corrected, per the brief's explicit permission to do so.

## Items reviewers should re-check first (lowest confidence)

1. **`.gitignore` stale-duplicate direction (item 7).** I judged the lowercase
   `/products/wstera-link/` line (not the mixed-case `/products/WSTERA-Link/` line) to be the stale
   duplicate, because the physical directory is still `WSTERA-Link` (rename out of scope) and removing
   the mixed-case line would have stopped `.gitignore` from actually excluding the real directory —
   a functional regression, not just a doc fix. This reasoning is mine, not spelled out verbatim in
   the brief; a reviewer should confirm the intent was "keep the line that matches disk today,
   remove the one that doesn't" rather than the reverse.
2. **`ENVIRONMENT_AND_SECRETS_POLICY.md` left untouched (item 7).** I treated this P0a-B2 deliverable
   as a frozen evidence/review artifact like `REPOSITORY_MAP.md`/`RUNTIME_MATRIX.md`, rather than a
   living reference like `BILLING_CORE_PLAN.md`/`ROADMAP.md`, and left its mixed-case file citations
   alone. It is arguably closer to a living policy document than a dated audit; a reviewer may
   reasonably want its citations lowercased too for full D5 consistency, even though they are
   currently accurate filesystem paths.
3. **Item 5's "already correct" finding.** I found `ROADMAP.md`'s routing table already fixed by a
   prior commit (`4385017`), predating this brief, and instead redirected the fix to three other files
   that still carried the stale claim about it. Worth a second read to confirm `ROADMAP.md`'s current
   table text (`bk01.wstera.com`, not `booking.wstera.com`) really is what a fresh clone shows, since
   this conclusion is load-bearing for the item-8/D1 fix and the `HANDOFF.md`/`PRODUCTION_LAUNCH_PLAN`
   fixes riding on it.
