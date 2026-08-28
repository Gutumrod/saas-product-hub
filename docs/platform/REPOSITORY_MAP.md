# Repository Map

**Satisfies:** P0a item 1 (`PORTFOLIO_PRODUCTION_MASTER_PLAN.md` §5).

**Verification method:** every row below was produced in this session by running `git remote get-url
origin`, `git remote show origin` (for the remote's default branch), `git rev-parse --abbrev-ref HEAD`
and `git rev-parse --short HEAD` inside each checkout, and by listing `products/` on disk with `ls`.
Nothing here is copied from the master plan or `registry.yaml` without being re-checked against the
repository itself. Full 40-character SHAs are recorded alongside the short SHA so the row is
unambiguous.

Workspace root: `D:\AI-Workspace\projects\saas-product-hub` (git repo `Gutumrod/saas-product-hub`,
branch `master`).

## Parent Hub and private control-plane repo

| Item | Value |
|---|---|
| Parent repo | `Gutumrod/saas-product-hub` (this repository) — branch `master`, clean at session start per the git status supplied to this task |
| `hub-web` remote URL | `https://github.com/Gutumrod/hub-web.git` |
| `hub-web` canonical local path (lowercase per D5) | `apps/hub-web` (already lowercase; no remediation needed) |
| `hub-web` actual on-disk path today | `apps/hub-web` (matches canonical) |
| `hub-web` default branch (remote) | `main` |
| `hub-web` currently-checked-out branch | `feature/platform-control-plane` — **not** the default branch |
| `hub-web` HEAD observed | `1b68811` (full: see note) — this is the tip of `feature/platform-control-plane`, not of `main`. `main`'s HEAD (local and `origin/main`, fetched this session) is `8a3e493` (full `8a3e49330e6cc1d52d6ad3d96fd0d291a66b4f56`), matching the master plan §2 intake value exactly. |
| `hub-web` release authority | CEO — no repository document found naming a different release authority. A full-tree grep for "release authority"/"release owner" across `products/*/docs` and `apps/hub-web` completed in this session (it ran past the interactive timeout and finished in the background): the only hit anywhere was `products/PawSpace/docs/PRODUCTION_OPERATIONS.md:24`, `- Release owner identified.` — an unfilled checklist item, naming no one. No repository names a release authority other than CEO. |

`1b68811` full SHA was not separately captured with `rev-parse` in this session (only the short form
surfaced via `status --short --branch`/branch inspection); if a reviewer needs the full SHA, run
`git -C apps/hub-web rev-parse feature/platform-control-plane`. Marking this **UNVERIFIED (full SHA
only)** — the short SHA itself is verified.

## Future `billing-core`

| Item | Value |
|---|---|
| Repository | Does not exist yet. No `billing-core` directory, remote, or checkout was found anywhere under `products/` or `apps/` in this session. |
| Canonical local path (per D3) | Not yet assigned in any document read this session beyond "dedicated schema inside the Hub project (Project A, `apps/hub-web`)" — billing-core is a schema inside the Hub's Supabase project, not necessarily a separate git repository. Whether it gets its own repo/checkout path is **UNVERIFIED** — no repository-map decision for it exists yet, and this brief does not create one. |
| Release authority | CEO (per §10 D3, no contradicting document found) |

## Seven in-scope products

| Code | Registry `key` | Remote URL | Canonical local path (lowercase, D5) | Actual on-disk path today | Default branch (remote) | Checked-out branch | HEAD (short SHA, observed) | Release authority |
|---|---|---|---|---|---|---|---|---|
| BK01 | `booking` | `https://github.com/Gutumrod/booking.git` | `products/booking` | `products/booking` (matches — already lowercase) | `main` | `main` | `e99615d` | CEO |
| PS01 | `pawspace` | `https://github.com/Gutumrod/pawspace.git` | `products/pawspace` | `products/PawSpace` (**mismatch** — see casing remediation) | `master` | `master` | `97c9fd6` | CEO |
| LK01 | `wstera_link` | `https://github.com/Gutumrod/wstera-link.git` | `products/wstera-link` | `products/WSTERA-Link` (**mismatch** — see casing remediation) | `main` | `main` | `bf591e3` | CEO |
| DC01 | `doccraft` | `https://github.com/Gutumrod/doccraft.git` | `products/doccraft` | `products/DocCraft` (**mismatch** — see casing remediation) | `master` | `master` | `22283a0` local checkout; `origin/master` (fetched this session) is `2a8652e`, i.e. the local working copy is **2 commits behind** the remote default branch. See drift note below. | CEO |
| MT01 | `multi_tenant_ai` | `https://github.com/Gutumrod/multi-tenant-ai.git` | `products/multi-tenant-ai` | `products/multi-tenant-ai` (matches — already lowercase) | `master` | `master` | `92139cf` | CEO |
| CM01 | `booking_ticket_module` | `https://github.com/Gutumrod/booking-ticket-module.git` | `products/booking-ticket-module` | `products/booking-ticket-module` (matches — already lowercase) | `main` | `main` | `be37b0a` | CEO |
| HC01 | `headless_commerce` | `https://github.com/Gutumrod/headless-commerce.git` | `products/headless-commerce` | `products/headless-commerce` (matches — already lowercase) | `master` | `feat/reference-server` — **not** the default branch | `79c1d7c` (tip of `feat/reference-server`). `master`'s HEAD (local and `origin/master`, fetched this session) is `3147162`, matching the master plan §2 intake value exactly. | CEO |

Full 40-character SHAs, for the record (all captured via `git rev-parse` in this session):

- BK01 `main`: `e99615de7df94af5fcff10ee1c36bd0c0bf6360c`
- PS01 `master`: `97c9fd6c6151c60ebd3120b14df54232241938b4`
- LK01 `main`: `bf591e31e2007643bf4b080e4228b93f19ef2310`
- DC01 local `master`: `22283a0192942fb3670969ef1de18403edeed2ca`; `origin/master`: `2a8652e6636d773d330dfa7810361e827bad922b`
- MT01 `master`: `92139cfa4697fbade1a023d76dc4734dd82d5862`
- CM01 `main`: `be37b0a0db6ade372797ce890b523aa18063475c`
- HC01 `master`/`origin/master`: `31471627ac3f0a0cceae6f0758bd02db8f2cf043`; `feat/reference-server` (checked-out tip): `79c1d7cf1006fddb9008a8b04d6e7c29bfa603a3`
- `hub-web` `main`/`origin/main`: `8a3e49330e6cc1d52d6ad3d96fd0d291a66b4f56`

**Registered but out of the seven-product production scope** (present under `products/` and/or in
`registry.yaml` but not one of the seven — verified by directory listing and registry `key:` grep):
`line_oa_ai` (`products/line-oa-ai`), `line_oa_ai_sales_service_engine` (`products/LINE OA AI Sales
& Service Engine`) — these are two distinct registry entries with different `product_id` and
different `path:`, not one product with two directories — `tracking`
(`products/ticket-tracking-relay`), `stripe_billing` (`products/stripe-billing`), `feature_flag`
(`products/feature-flag`), `content_autopilot` (`products/content-autopilot`), `it_ops_watchdog`
(`products/it-ops-watchdog`), `bulk_etl_sync` (`products/bulk-etl-sync`), `compliance_audit`
(`products/compliance-audit`), `ai_resilience_gateway` (`products/ai-resilience-gateway`),
`rentmatrix` (`products/RentMatrix`), `omnidesk` (`products/OmniDesk`), `money_leak_buddy`
(`products/money-leak-buddy`). No further action taken on any of these in this brief.

---

## Casing remediation list

Verified by `ls products/` on disk in this session. Three mixed-case directories exist, exactly as
flagged in the brief — confirmed, not assumed:

| Path on disk today | Lowercase canonical target (D5) | Product |
|---|---|---|
| `products/PawSpace` | `products/pawspace` | PS01 |
| `products/DocCraft` | `products/doccraft` | DC01 |
| `products/WSTERA-Link` | `products/wstera-link` | LK01 |

No other mixed-case product directory was found among the 23 entries under `products/` (full listing
captured this session: `DocCraft`, `LINE OA AI Sales & Service Engine`, `OmniDesk`, `PawSpace`,
`RentMatrix`, `WSTERA-Link`, `ai-resilience-gateway`, `booking`, `booking-ticket-module`,
`bulk-etl-sync`, `compliance-audit`, `content-autopilot`, `feature-flag`, `headless-commerce`,
`it-ops-watchdog`, `line-oa-ai`, `money-leak-buddy`, `multi-tenant-ai`, `short-url-analytics`,
`stripe-billing`, `ticket-tracking-relay`). `OmniDesk` and `RentMatrix` are also mixed-case on disk,
but they are out-of-scope products (not one of the seven) — noted here for completeness, not added
to the in-scope remediation table, and not otherwise acted on.

**Do not rename any of these directories.** This list is the worklist; the rename itself is a
separate gated step owned by the Commander, per the brief's hard rules.

---

## Stale-reference list

Every reference to a mixed-case in-scope product path found by searching the parent repository
(`docs/`, root files, `.gitignore`, `registry.yaml`) in this session. File search covered
`docs/platform/*.md`, `docs/products/registry.yaml`, and root-level dotfiles; it did not exhaustively
walk every file under `products/*/docs/` (those are inside the nested product repos, which are out
of scope for this parent-repo stale-reference list, and a mixed-case-path-specific grep of their
full trees was not run in this session (a *different*, narrower grep of those trees — for
"release authority"/"release owner" strings only — did complete in the background; see the
release-authority note above, which is not a substitute for a mixed-case-path search).

### `.gitignore`

`.gitignore` line-by-line for every `products/` entry (verified with `cat -n .gitignore` this
session):

| Line | Entry | Status |
|---|---|---|
| 18 | `/products/PawSpace/` | mixed-case, stale relative to D5 |
| 19 | `/products/DocCraft/` | mixed-case, stale relative to D5 |
| 22 | `/products/wstera-link/` | **already lowercase / correct per D5** |
| 51 | `/products/WSTERA-Link/` | mixed-case, stale relative to D5 |

Confirmed exactly as the brief flagged: `.gitignore` contains **both** `/products/wstera-link/`
(line 22, correct casing) **and** `/products/WSTERA-Link/` (line 51, stale casing) simultaneously.
Line 22 does not need to change under D5; line 51 does. No `/products/pawspace/` (lowercase) line
exists at all — only the mixed-case line 18 ignores PawSpace/pawspace, so a rename to `pawspace`
without also adding a lowercase ignore line would newly track that directory into the parent repo's
git history. Same risk applies to `DocCraft` → `doccraft` (no lowercase line 19 equivalent exists).

### `docs/products/registry.yaml`

| Line | Entry | Status |
|---|---|---|
| 471 | `path: "products/wstera-link"` | already lowercase / correct per D5 (disk directory is the stale side here, not this line) |
| 508 | `path: "products/pawspace"` | already lowercase / correct per D5 (disk directory is the stale side here, not this line) |
| 614 | `path: "products/DocCraft"` | mixed-case, stale relative to D5 |
| 616 | comment: `Runtime/tooling locked in products/DocCraft/docs/SYSTEM_ARCHITECTURE.md.` | mixed-case reference inside a comment, stale relative to D5 |

Note the asymmetry: for LK01 and PS01 the registry's `path:` field is **already correct**
(lowercase) and it is the on-disk directory that is stale. For DC01, the registry's `path:` field
itself is mixed-case and must also be corrected. This matters for whoever executes the rename step:
fixing the three directories alone is not sufficient — DC01's registry line and comment must be
edited too, and PS01/LK01's registry lines must NOT be touched (they are already right).

### `docs/platform/PORTFOLIO_PRODUCTION_MASTER_PLAN.md`

| Line | Text |
|---|---|
| 417 | `...path (`products/PawSpace`, `products/DocCraft`, including `registry.yaml`'s `path:` fields) is` |
| 882 | `using a mixed-case path (`products/PawSpace`, `products/DocCraft`) is corrected under P0a,` |

Both are the master plan describing the remediation it expects (not a functional path reference used
by tooling), so they are historical/self-referential rather than something a script would follow —
recorded here for completeness per the brief's instruction to list every reference, not resolved.

### `docs/platform/BILLING_CORE_PLAN.md`

| Line | Text |
|---|---|
| 68 | `` `products/PawSpace/supabase/migrations/20260825141500_phase13_subscription_lifecycle.sql`. `` |
| 328 | `` `products/DocCraft/docs/MONETIZATION_AND_PAYMENT_FLOW.md` §2 — name billing-core as the intended `` |
| 455 | `/Users/wachirayachankhonkan/AI-Workspace/projects/saas-product-hub/products/PawSpace/supabase/migrations/20260825141500_phase13_subscription_lifecycle.sql` — ... |
| 458 | `/Users/wachirayachankhonkan/AI-Workspace/projects/saas-product-hub/products/wstera-link/docs/02_SYSTEM_ARCHITECTURE.md`, `products/DocCraft/docs/MONETIZATION_AND_PAYMENT_FLOW.md` — doc corrections |
| 472 | `cd products/PawSpace && supabase functions serve` |
| 473 | `cd products/PawSpace && supabase db advisors --local --type security --fail-on error` |

Lines 455 and 458 also carry an absolute macOS path
(`/Users/wachirayachankhonkan/AI-Workspace/...`) that will not resolve on this Windows checkout at
all, independent of the casing question — flagged for the record, not something D5 covers or this
brief fixes.

### `docs/platform/ROADMAP.md`

| Line | Text |
|---|---|
| 161 | `re-reading `products/DocCraft/docs/BUSINESS_MODEL.md`, which is explicit: ...` |

`ROADMAP.md` line 104 (read in full after the initial search truncated it) also references
`` `products/PawSpace/registry.yaml` `` — a second stale mixed-case reference in that file, and note
that the path it names (`products/PawSpace/registry.yaml`) does not exist at all on disk today (no
`registry.yaml` file was found inside `products/PawSpace/`); the only `registry.yaml` in this
workspace is `docs/products/registry.yaml`. That is a separate, pre-existing stale-content problem
in `ROADMAP.md`, not something D5 casing remediation fixes.

No matches for mixed-case in-scope product paths were found in any other root-level file, or under
`docs/platform/` beyond the files listed above, in this session's search.

---

## Drift note — plan-recorded HEAD (§2 intake snapshot) vs observed HEAD (this session)

All seven products' and `hub-web`'s **remote default-branch tip** were re-verified this session by
fetching `origin` and reading `origin/<default-branch>`. Result: **no remote default branch has
moved** from the master plan §2 table. Every short SHA below is identical, old vs new:

| Product | Plan §2 recorded head | Observed remote default-branch head (this session) | Moved? |
|---|---|---|---|
| BK01 | `e99615d` | `e99615d` | No |
| PS01 | `97c9fd6` | `97c9fd6` | No |
| LK01 | `bf591e3` | `bf591e3` | No |
| DC01 | `2a8652e` | `2a8652e` (remote `origin/master`) | No — remote unchanged |
| MT01 | `92139cf` | `92139cf` | No |
| CM01 | `be37b0a` | `be37b0a` | No |
| HC01 | `3147162` | `3147162` (remote `origin/master`) | No — remote unchanged |
| `hub-web` | `8a3e493` | `8a3e493` (remote `origin/main`) | No |

Two repositories show drift **between the plan's table and the local working copy**, not between the
plan and the remote:

- **DC01 (`products/DocCraft`):** the local checkout's `master` is at `22283a0`, which is **two
  commits behind** `origin/master` (`2a8652e`, unchanged from the plan). The two missing commits
  are `42bd70d` (`test(phase4): cover corrupt supported image decode failure`) and `2a8652e`
  (`docs(gate4): record independent remediation PASS`). This means the on-disk DocCraft checkout is
  itself stale relative to both the plan's recorded head and the current GitHub default branch —
  someone (or some earlier automated step) needs to `git pull` this checkout before any DC01 work
  begins, or a future evidence run against the disk copy will silently run against an older commit
  than intended.
- **HC01 (`products/headless-commerce`):** the local checkout is on `feat/reference-server`
  (`79c1d7c`), not the default branch `master` (`3147162`, unchanged from the plan). This is exactly
  the situation the brief warned might exist, and it is confirmed true.

`hub-web` shows the same not-on-default-branch pattern as HC01: the local checkout is on
`feature/platform-control-plane` (`1b68811`), not `main` (`8a3e493`, unchanged from the plan).

**Contradiction worth flagging plainly, not resolved here:** the master plan states "Several have
moved (the plan's table is an intake snapshot ... explicitly not a permanent assertion)" as a
justification for this drift-note requirement. Based on what is actually observable on disk and on
the GitHub remotes today, **no product's remote default branch has actually moved** since the §2
intake. The only real movement found is local-checkout staleness (DC01) and non-default-branch
checkouts (HC01, `hub-web`) — which the plan also anticipated, but as a different phenomenon than
"the head moved." A reviewer should not read this drift note as validating the plan's "several have
moved" framing; on the evidence gathered here, that framing does not hold for any of the eight
repositories as of this session.
