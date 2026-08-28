# Checkpoint attempt — P0a-C1 (Portfolio foundation ready)

**Status: NOT PASSED — blocked on one of three criteria. Engineering work for P0a items 1–6 is
complete and independently reviewed; the remaining blocker requires CEO authorization, not more
implementation.**

Format per `docs/platform/EVIDENCE_TEMPLATE.md` (P0a item 5), which reproduces
`PORTFOLIO_PRODUCTION_MASTER_PLAN.md` §8 verbatim.

```text
Checkpoint ID: P0a-C1 (attempt 1)
Product / service: Portfolio-wide foundation (all seven products + Hub + future billing-core)
Repository and commit: Gutumrod/saas-product-hub @ 0c296f0273ee97261105bf129c582d8378dca72a
Default branch and clean-tree status: master; NOT clean — all P0a deliverables are uncommitted
  working-tree changes (7 modified tracked files, 13 new untracked files, plus one modified file in
  the nested products/PawSpace repository at 97c9fd6). Nothing was committed or pushed in any
  repository during P0a.
Runtime/package-manager versions: Node v22.23.2, npm 11.11.1, pnpm 11.21.0 (audit host; captured
  under brief P0a-B2 and independently reproduced under its review)
Lockfile hash: not applicable — this checkpoint covers documentation and CI definition, not a
  built artifact. Per-repository lockfile hashes are required at each product's own release
  checkpoint, not here.
Environment: local development host (Windows 10, bash + PowerShell). No staging environment exists
  anywhere in the portfolio — see Known limitations.
Scope tested: P0a items 1-6 and the three P0a-C1 exit criteria.
```

## Commands and automated results

Each P0a item was implemented by one agent and verified by a separate independent reviewer that
re-derived facts from git and the filesystem rather than accepting the implementer's report.

| Item | Deliverable | Verdict |
|---|---|---|
| 1 | `REPOSITORY_MAP.md` | PASS (`REVIEW-P0a-B1-2026-08-27.md`) |
| 3 | `RUNTIME_MATRIX.md` | PASS (same review; one MAJOR found and remediated before PASS) |
| 5 | `EVIDENCE_TEMPLATE.md` | PASS (same review) |
| 2 | `CI_BASELINE.md`, two `ci.yml`, `PHASE_P0a_B2_EVIDENCE.md` | PASS (`REVIEW-P0a-B2-2026-08-27.md`) |
| 4 | `ENVIRONMENT_AND_SECRETS_POLICY.md`, `EXTERNAL_PROVIDER_INVENTORY.md` | PASS (`REVIEW-P0a-B3-2026-08-27.md`) |
| 6 | Document reconciliation + `PHASE_P0a_B4_EVIDENCE.md` | PASS (`REVIEW-P0a-B4-2026-08-27.md`) |

Pipeline commands executed and independently reproduced under item 2, in both proving repositories
(`apps/hub-web` @ `1b68811`, `products/booking-ticket-module` @ `be37b0a`):

- `npm ci` — pass in both
- typecheck (`npm run check` / `npm run typecheck`) — pass in both
- lint — **NOT AVAILABLE in either repository**; hub-web has no linter installed, CM01 has an
  `.eslintrc.cjs` with no `eslint` dependency and no `lint` script
- test — pass: hub-web 57/57, CM01 61/61
- build — pass in both
- `npm audit` — hub-web 8 findings (5 moderate / 2 high / 1 critical), CM01 6 findings
  (1 moderate / 3 high / 2 critical). Counts independently reproduced by the reviewer and are
  time-sensitive per master plan §2.

## P0a-C1 exit criteria — assessed individually

**Criterion 1 — "The repository map, runtime matrix, environment/secret ownership, evidence
template and CI definition are published and unambiguous."** — **MET.** All five artifacts exist and
each passed independent review.

**Criterion 2 — "The CI definition runs green on `hub-web` and on the first product to adopt it,
from clean clones, with no reliance on an untracked local file."** — **NOT MET.** Three distinct
gaps, none of which is an implementation defect:

1. **No CI run exists.** Pushing was not authorized, and GitHub Actions cannot run without a push.
   What was proven is that the exact command sequence the workflows invoke passes locally. That is
   weaker evidence than the criterion demands and must not be recorded as a green CI run.
2. **Not proven from clean clones.** Commands ran in existing working checkouts, not fresh clones.
3. **"No reliance on an untracked local file" was not tested.** Both repositories have untracked
   local environment files present; whether the pipeline would pass without them is unverified.

Additionally, the lint stage — which the CI baseline requires — is disabled in both proving
workflows because no linter is installed in either repository. A green run with lint disabled does
not prove the lint stage.

**Criterion 3 — "Every document listed in P0a item 6 matches the code at a named commit."** —
**MET** at `0c296f0`, verified under `REVIEW-P0a-B4-2026-08-27.md`, which confirmed against the diff
that no CEO decision (D1–D8) was altered and that two worklist items were already correct and
correctly left unchanged.

## Manual scenarios and observations

- Two concurrency incidents occurred during P0a and are recorded because they affect how future
  briefs must be run: an implementer woke from a backgrounded command and edited a file while its
  review was already in progress; and a separate session committed `0c296f0` to the parent
  repository mid-brief, touching four files that both agents were citing by line number. The
  affected review was re-run against the new HEAD and its evidence basis was confirmed intact.

## Security / negative-path results

- `verifySignature` in `apps/hub-web/server/webhooks/productEvents.ts` opens with
  `if (!secret || !signatureHeader) return false;`. An unset `PRODUCT_EVENTS_HMAC_SECRET` therefore
  **fails closed**, rejecting all requests; it does not accept forged events. An earlier draft
  implied the opposite and was corrected.
- `apps/hub-web/server/_core/env.ts` applies `?? ""` to every field. There is no startup validation
  anywhere in hub-web, so an unset production variable becomes an empty string silently. This
  violates master plan §3.4 and is the clearest required-variable-validation gap in the portfolio.
- No product in the portfolio implements fail-closed startup validation as §3.4 requires. PawSpace
  and headless-commerce are partial; booking is minimal; multi-tenant-ai has no config module.

## Dependency / license / secret scan results

- Dependency: counts above. hub-web's **critical is `vitest`, a devDependency that is not shipped**
  — not a live production exposure. hub-web's **`drizzle-orm` high** (GHSA-gpj5-g38j-94v9, SQL
  injection via identifier escaping) is installed at 0.44.7 **on the live server path of
  `wstera.com`**, with no non-breaking fix available (the fix is semver-major). Reviewed queries use
  parameterized calls, so the specific exploit path was not confirmed reachable — and was not ruled
  out.
- License, secret scan, SAST: **not executed.** No tool is installed, and the tool choice is a CEO
  decision that installing one would have silently pre-empted.
- A secret-leak scan of the P0a deliverables themselves returned clean: no credential value appears
  in any produced document. `D:\AI-Workspace\.secrets\` was never opened by any agent.

## Migration / restore and RTO/RPO results

Not applicable at this checkpoint. §10 D7 starting targets (SLO 99%, RTO 4h, RPO 24h; billing-core
RPO 1h) are recorded in `ENVIRONMENT_AND_SECRETS_POLICY.md` and verified to match D7 exactly. No
restore rehearsal has been performed for any product.

## SLO / alert / degraded-mode results

Not applicable at this checkpoint, and a portfolio-wide gap was recorded instead: **every provider
in live production use — Supabase, Cloudflare, Stripe, LINE, Google Sheets — has no documented
degraded mode and no verified per-environment credential separation.**

## Known limitations

- No staging environment exists anywhere in the portfolio. No second Supabase project, no separate
  Workers environment. "Staging" is a thing to build, not a thing that exists — this affects G6 for
  every product.
- No repository in the portfolio pins a Node version; only PS01 and DC01 pin a package manager.
- `.gitignore` deliberately keeps mixed-case entries matching the current on-disk directories. The
  file now carries an in-place warning that these must be lowercased in the same change that renames
  the directories, or the nested repositories silently become untracked.
- Mixed-case path citations were deliberately left in frozen audit/review records. One live policy
  document (`ENVIRONMENT_AND_SECRETS_POLICY.md`) was left inconsistent with that rule; accepted as a
  cosmetic inconsistency with no functional effect, recorded here so it is a decision rather than an
  oversight.
- **Reviewer independence is partial.** Each of the four briefs was implemented and reviewed by
  separate agents. However, the remediation of findings in briefs B1 and B3, and the `.gitignore`
  warning added after B4's review, were applied by the Commander who also gates this checkpoint.
  Those specific edits were verified by command but were not re-reviewed by an independent party.

## Open P0/P1 issues

1. **CEO authorization to push** — required to satisfy criterion 2. Nothing else unblocks it.
2. **Three OPEN tool decisions** blocking the license-audit, secret-scan and SAST stages:
   recommendations recorded are `license-checker`, `gitleaks` and `semgrep`, each with trade-offs
   stated in `CI_BASELINE.md`. No tool was installed, so no choice has been pre-empted.
3. **`PRODUCT_EVENTS_HMAC_SECRET` set or unset in the live Cloudflare Workers secret store** — this
   cannot be determined from the repository, and it decides whether risk R3 is live today or the
   webhook receiver is currently inert. Requires the CEO to inspect the Worker's secret store.
4. **`drizzle-orm` high advisory on the live `wstera.com` server path**, no non-breaking fix.
5. **Directory rename `PawSpace`/`DocCraft`/`WSTERA-Link` to lowercase (§10 D5)** — deliberately not
   executed. It must be done together with the `.gitignore` casing change, and while no other
   session holds those directories.
6. **Lint stage unimplementable portfolio-wide** — no working linter in either proving repository.
   This is P0b work per repository, but it means the CI baseline's lint stage is defined and unproven.

## Reviewer

Four independent per-brief reviewers (`REVIEW-P0a-B1` through `REVIEW-P0a-B4`). This checkpoint
record itself was assembled by the Commander from those reviews and from direct verification, and
has not been independently reviewed as a document.

## CEO decision

**PENDING.** Not `GO`, not `CONDITIONAL`. This record exists to state precisely what is complete and
what is not; the decision is the CEO's and has not been made.

## Artifact / tag / checksum

None. No commit, tag or artifact was produced. All P0a output is uncommitted working-tree state at
parent commit `0c296f0`.

## Evidence links

- `docs/platform/REPOSITORY_MAP.md`, `RUNTIME_MATRIX.md`, `EVIDENCE_TEMPLATE.md`
- `docs/platform/CI_BASELINE.md`, `PHASE_P0a_B2_EVIDENCE.md`
- `docs/platform/ENVIRONMENT_AND_SECRETS_POLICY.md`, `EXTERNAL_PROVIDER_INVENTORY.md`
- `docs/platform/PHASE_P0a_B4_EVIDENCE.md`
- `docs/platform/REVIEW-P0a-B1-2026-08-27.md` … `REVIEW-P0a-B4-2026-08-27.md`
- `apps/hub-web/.github/workflows/ci.yml`, `products/booking-ticket-module/.github/workflows/ci.yml`

## What this means for per-product work

Master plan §5 makes P0a blocking for all product work, and P0a-C1 is not passed. The blocker is
criterion 2, which no amount of further local implementation can close — it needs a push. Once push
is authorized and the CI definition is proven from clean clones, P0a-C1 can be re-attempted, and
each repository then opens its own track by recording its own P0b-C1.

Per the §5 focus gate, at most one heavy track and one bounded track may be open at a time. The
master plan's recommended sequence puts BK01 as the first heavy track with CM01 as the bounded one.
