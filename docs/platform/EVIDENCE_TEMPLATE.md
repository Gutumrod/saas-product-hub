# Evidence Template

**Satisfies:** P0a item 5 (`PORTFOLIO_PRODUCTION_MASTER_PLAN.md` §5).

**Source:** the required fields below are reproduced verbatim from `PORTFOLIO_PRODUCTION_MASTER_PLAN.md`
§8, "Checkpoint record format", read directly in this session. No field has been reworded, reordered,
added, or removed from that section.

## Required fields (verbatim from master plan §8)

```text
Checkpoint ID:
Product / service:
Repository and commit:
Default branch and clean-tree status:
Runtime/package-manager versions:
Lockfile hash:
Environment:
Scope tested:
Commands and automated results:
Manual scenarios and observations:
Security/negative-path results:
Dependency/license/secret scan results:
Migration/restore and RTO/RPO results:
SLO/alert/degraded-mode results:
Known limitations:
Open P0/P1 issues:
Reviewer:
CEO decision: GO / NO-GO / CONDITIONAL
Artifact/tag/checksum:
Evidence links:
```

The master plan states, immediately following this block: "`GO` applies only to the named commit and
environment. A later change invalidates affected evidence and reruns the relevant gates." That
sentence is not a field — it is a rule, restated in full below.

## (a) Filled-in example

The example below shows the expected level of detail. It is illustrative — it is **not** a real
checkpoint record for any product's current state, and it must not be read or cited as an actual
CEO decision. The commit and figures are representative, not verified against a live release.

```text
Checkpoint ID: CM01-L1-2026-09-15
Product / service: CM01 — booking_ticket_module (Booking Claim & Case Management Module)
Repository and commit: Gutumrod/booking-ticket-module @ be37b0a0db6ade372797ce890b523aa18063475c
Default branch and clean-tree status: main, clean (git status --short empty at capture time)
Runtime/package-manager versions: Node 22.11.0, npm 11.11.1 (packageManager pin added under P0b)
Lockfile hash: sha256:4f8a...c21e (package-lock.json, computed at capture time)
Environment: clean-machine buyer simulation, Windows 11, no access to WSTERA internal repos/secrets
Scope tested: L0-L5 one-time-product ladder; G0-G6 as they apply to source-only delivery
Commands and automated results:
  - npm ci: pass
  - npm run typecheck: pass
  - npm test (vitest run): 61/61 pass
  - npm run build: pass
Manual scenarios and observations:
  - Buyer clone-to-running-demo in <15 min following only README.md: pass
  - Theme override via documented config point: pass
  - Thai/English i18n toggle on intake and case-detail screens: pass
Security/negative-path results:
  - No WSTERA secret, internal URL, or customer record found in a full-history secret scan of the
    release tag: pass
  - License audit of all direct/transitive dependencies: no redistribution-incompatible license found
Dependency/license/secret scan results:
  - npm audit: 0 high/critical (as of scan date; counts are time-sensitive per master plan §2)
  - License scan: MIT-compatible throughout; module's own LICENSE file present and correct
Migration/restore and RTO/RPO results: not applicable — source product, buyer owns persistence
SLO/alert/degraded-mode results: not applicable — source product, no hosted uptime obligation
Known limitations:
  - Local-storage adapter is a documented demo only (per §10 D6); no backend adapter ships
Open P0/P1 issues: none open
Reviewer: [independent reviewer name, not the implementer]
CEO decision: CONDITIONAL — approved for L4 fulfillment-path testing only, buyer acceptance script
  to be re-run against the exact tagged artifact before public sale
Artifact/tag/checksum: v1.0.0-cm01, sha256:9b21...44af (release zip)
Evidence links: docs/platform/evidence/CM01-L1-2026-09-15.md; CI run URL; reviewer notes doc
```

## (b) File naming convention and storage location

- Evidence documents live under `docs/platform/evidence/`. This directory does not exist yet as of
  this session — creating it and populating it is checkpoint work, not part of this brief, which
  creates only the three files named in its scope.
- File name: `<CODE>-<CHECKPOINT-ID>-<YYYY-MM-DD>.md`, where `<CODE>` is the product/service code
  from `REPOSITORY_MAP.md` (e.g. `CM01`, `BK01`, `HUB`, `BILLING-CORE`) and `<CHECKPOINT-ID>` matches
  the checkpoint names already defined in the master plan (e.g. `P0a-C1`, `BK-L1`, `P1-C1`,
  `L1`/`L2`/etc. for the one-time-product ladder rungs). Example: `CM01-L1-2026-09-15.md`.
- One file per checkpoint attempt. A `REMEDIATE`/`NO-GO` attempt is not overwritten by the next
  attempt's file — each attempt gets its own dated file, so the history of what was tried and
  rejected stays readable. The most recent file for a given checkpoint ID is the current status;
  older ones remain as history.
- `docs/platform/HANDOFF.md`-equivalent index behavior (linking to the latest evidence file per
  checkpoint) is left to whoever creates the first evidence file — this template does not mandate an
  index file, since none exists yet to describe.

## (c) Rules

- **Evidence must name an exact commit.** A checkpoint record that says "current main" or "latest
  deploy" instead of a specific SHA is incomplete and cannot support a GO decision. Every "Repository
  and commit" field is a full or unambiguous short SHA, not a branch name alone (a branch name may
  move; a commit does not).
- **A `GO` applies only to that commit and environment.** It does not extend to a later commit on
  the same branch, a different environment (e.g. staging evidence does not cover production), or a
  redeploy of "the same code" if the deploy pipeline, configuration, or provider changed in between.
- **A later code, dependency, configuration, or provider change invalidates affected evidence.** This
  is restated directly from master plan §8 and §4's verification protocol ("No public/live release
  occurs between V1 and V5. A later code, dependency, configuration or provider change invalidates
  the affected evidence and reruns the relevant stages."). Practically: if a dependency bump, an
  environment variable change, a provider (Stripe/Supabase/Cloudflare/LINE/etc.) API version change,
  or any code change touches what a given gate covered, that gate's evidence is stale for the new
  state and must be rerun before the next GO — even if no new checkpoint record was otherwise due.
- A checkpoint record is written by the implementer or reviewer who actually ran the commands and
  observed the results in this session/environment — not assembled from memory of a prior session,
  and not copied from another product's evidence file with fields substituted.
