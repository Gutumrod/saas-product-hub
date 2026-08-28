# Phase P0a-B2 Evidence — CI Baseline Definition and Local Proof

**Satisfies:** part of P0a-C1 checkpoint evidence (`PORTFOLIO_PRODUCTION_MASTER_PLAN.md` §5),
specifically "the CI definition runs green on `hub-web` and on the first product to adopt it, from
clean clones." Format follows `EVIDENCE_TEMPLATE.md`.

**Hard limitation, stated once:** neither repository below has a GitHub Actions workflow that has
ever executed, and this brief may not push or trigger one. Every result below is a locally executed
command from the repository's actual current checkout, not a captured GitHub Actions run. "Pass"
means the command exited 0 with the output shown; it does not mean "would pass in Actions" for
anything this brief could not run (see the "not executed" rows per repository).

---

## Repository 1 — `apps/hub-web`

```text
Checkpoint ID: P0a-B2-hub-web-2026-08-27
Product / service: hub-web (Hub control plane)
Repository and commit: Gutumrod/hub-web @ 1b688111cbcddee38c221c81e9148f51e113469b
  (branch feature/platform-control-plane — NOT the default branch `main`, which is at
  8a3e49330e6cc1d52d6ad3d96fd0d291a66b4f56 per REPOSITORY_MAP.md; this brief worked against
  whatever branch was checked out on disk, per its instruction not to modify any existing state)
Default branch and clean-tree status: default branch is main; checked-out branch
  feature/platform-control-plane, clean at both start and end of this session
  (`git status --short` empty; only node_modules/dist changed, both gitignored)
Runtime/package-manager versions: Node v22.23.2, npm 11.11.1 (machine reference values; repository
  pins neither today — see RUNTIME_MATRIX.md adoption-gap table)
Lockfile hash: sha256:bdf37ddafa90572d678ab4ee62289c4ff1253f27c6b5862fd9d54d34fb2495c
  (apps/hub-web/package-lock.json, computed this session)
Environment: Windows 10 Pro 10.0.19045, local shell (Git Bash), no CI runner
Scope tested: CI_BASELINE.md stages 1-6 and 10, as executable locally; see below for what could not
  be executed
```

### Stage-by-stage results

| Stage | Command | Result | Notes |
|---|---|---|---|
| 1. Frozen install | `npm ci` | **PASS** (after retry) | First attempt failed with `EPERM: operation not permitted, unlink ... lightningcss.win32-x64-msvc.node` — a Windows file-lock on a stale `node_modules` entry, not a lockfile problem. Removed `node_modules` with `rm -rf` (gitignored, no tracked content lost) and re-ran; second attempt installed 651 packages in 10s clean. |
| 2. Typecheck | `npm run check` (`tsc --noEmit`) | **PASS** | Exit 0, no output — no type errors. |
| 3. Lint | `npm run lint` | **NOT AVAILABLE** | `npm error Missing script: "lint"`. Confirmed separately: no ESLint (or other linter) config file exists anywhere in the repository, and no `eslint` package appears in `package.json` dependencies or devDependencies. This is a P0b gap, not something this brief fixed (hard rule: do not modify existing files). |
| 4. Test | `npm test` (`vitest run`) | **PASS** | 6 test files, 57 tests, all passed, 3.19s duration. (Master plan §2 recorded "15 tests" for hub-web's `main` branch intake snapshot; this session ran against `feature/platform-control-plane`, which has more tests — expected given it is ahead of `main`, not a discrepancy to reconcile here.) |
| 5. Build | `npm run build` (`vite build && esbuild ...`) | **PASS** | Client build: 1841 modules transformed, `dist/public/assets/index-*.js` 875.62 kB (249.88 kB gzip) — Vite warned this chunk exceeds its 500 kB default budget; non-blocking warning, not a failure. Server bundle: `dist/index.js` 122.9kb. Total build time ~6.6s. |
| 6. Dependency audit | `npm audit` | **RAN, findings recorded (advisory)** | 8 vulnerabilities: 5 moderate, 2 high, 1 critical. Named findings include `drizzle-orm <0.45.2` (high, SQL injection via improperly escaped identifiers, GHSA-gpj5-g38j-94v9) and a chain of `esbuild`/`vite`/`vitest`/`drizzle-kit` moderate findings (GHSA-67mh-4wv8-2f99). Matches the master plan §2 characterization of hub-web as having "high/critical dependency findings." No fix applied — out of this brief's scope (do not modify existing files/dependencies). |
| 7. License audit | — | **NOT EXECUTED** | Tool choice is OPEN per CI_BASELINE.md §7; no license-scanning tool is installed on this machine. |
| 8. History-aware secret scan | — | **NOT EXECUTED** | Tool choice is OPEN per CI_BASELINE.md §8; `gitleaks`, `trufflehog` and equivalent tools were checked for and are not installed on this machine (`command -v` returned nothing for gitleaks, trufflehog, semgrep, snyk, syft, license-checker). Installing a new scanning tool was judged out of scope for a brief that must "finish in one pass" without adding portfolio dependencies the CEO has not chosen — see the SAST/secret-scan tool-choice discussion below. **No secret-value content was read, printed, or otherwise inspected as part of this evidence.** |
| 9. SAST | — | **NOT EXECUTED** | Tool choice is OPEN per CI_BASELINE.md §9; same tool-availability check as above, no SAST engine installed. |
| 10. Artifact retention | `actions/upload-artifact@v4` step | **NOT EXECUTABLE LOCALLY** | This is a GitHub Actions runner step; it cannot run outside Actions. Verified the build output directory it would point at (`dist/`) exists and is populated by stage 5 above (`dist/index.js`, `dist/public/`). |

```text
Manual scenarios and observations: none — G5/G7 product-acceptance scope is out of this brief.
Security/negative-path results: not tested in this brief (G2 scope, not P0a item 2).
Migration/restore and RTO/RPO results: not applicable to this brief.
SLO/alert/degraded-mode results: not applicable to this brief.
Known limitations: lint, license-audit, secret-scan and SAST stages are not proven locally (see
  table above). The build's oversized-chunk warning is unaddressed. The workflow file has never
  executed in GitHub Actions.
Open P0/P1 issues: none newly opened by this brief; existing high/critical dependency findings and
  missing lint tooling are pre-existing and recorded above, not fixed here per the brief's
  do-not-modify-existing-files rule.
Reviewer: not yet reviewed — this is the implementer's own evidence record (V1 self-test), not a V5
  independent review.
CEO decision: not requested by this brief; P0a-C1 checkpoint decision is separate from this document.
Artifact/tag/checksum: no release artifact produced — this is a CI-definition proving run, not a
  release.
Evidence links: docs/platform/CI_BASELINE.md; apps/hub-web/.github/workflows/ci.yml
```

---

## Repository 2 — `products/booking-ticket-module` (CM01)

```text
Checkpoint ID: P0a-B2-CM01-2026-08-27
Product / service: CM01 — booking_ticket_module (Booking Claim & Case Management Module)
Repository and commit: Gutumrod/booking-ticket-module @ be37b0a0db6ade372797ce890b523aa18063475c
Default branch and clean-tree status: main, clean at both start and end of this session
  (`git status --short` empty; only node_modules/dist changed, both gitignored)
Runtime/package-manager versions: Node v22.23.2, npm 11.11.1 (machine reference values; repository
  pins neither today — see RUNTIME_MATRIX.md adoption-gap table)
Lockfile hash: sha256:17ec9f0436a83fa04e9553051864064dc589144d4e0b75e793b8ce718c5fa40
  (products/booking-ticket-module/package-lock.json, computed this session)
Environment: Windows 10 Pro 10.0.19045, local shell (Git Bash), no CI runner
Scope tested: CI_BASELINE.md stages 1-6 and 10, as executable locally; see below for what could not
  be executed
```

### Stage-by-stage results

| Stage | Command | Result | Notes |
|---|---|---|---|
| 1. Frozen install | `npm ci` | **PASS** | 248 packages added in 9s, no lockfile mismatch. |
| 2. Typecheck | `npm run typecheck` (`tsc -b`) | **PASS** | Exit 0, no output. |
| 3. Lint | `npm run lint` | **NOT AVAILABLE** | `npm error Missing script: "lint"`. Confirmed separately: `.eslintrc.cjs` exists in the repository root, but `eslint` does not appear anywhere in `package.json` (dependencies or devDependencies), and `node_modules/.bin/eslint` does not exist after `npm ci` — the config file is committed without the tool that reads it. Matches master plan work package CM-D ("add lint to scripts"). P0b gap, not fixed here. |
| 4. Test | `npm test` (`vitest run`) | **PASS** | 12 test files, 61 tests, all passed, 13.09s duration. Matches master plan §2's recorded "61 unit tests." |
| 5. Build | `npm run build` (`tsc -b && vite build`) | **PASS** | 63 modules transformed. `dist/assets/index-*.js` 199.24 kB (61.86 kB gzip), `dist/index.html` 0.47 kB. Built in 586ms. |
| 6. Dependency audit | `npm audit` | **RAN, findings recorded (advisory)** | 6 vulnerabilities: 1 moderate, 3 high, 2 critical. Named findings include `vitest <=3.2.5` (critical — remote code execution via the Vitest API server when listening on a malicious website, and arbitrary file read/execute via the UI server, GHSA-9crc-q9x8-hgqq / GHSA-5xrq-8626-4rwp) and `playwright <1.55.1` (high — installs browsers without verifying SSL certificate authenticity, GHSA-7mvr-c777-76hp). All findings are in devDependency toolchain packages (vitest, playwright, vite/esbuild chain), not in the shipped `dependencies` (`react`, `react-dom`). Matches master plan §2's characterization of CM01 as having "high/critical toolchain findings." No fix applied — out of this brief's scope. |
| 7. License audit | — | **NOT EXECUTED** | Same as hub-web — tool choice OPEN, nothing installed. This matters more concretely for CM01 since it is a one-time source product sold to buyers (L2 gate). |
| 8. History-aware secret scan | — | **NOT EXECUTED** | Same as hub-web — tool choice OPEN, nothing installed. No secret-value content was read, printed, or otherwise inspected. |
| 9. SAST | — | **NOT EXECUTED** | Same as hub-web — tool choice OPEN, nothing installed. |
| 10. Artifact retention | `actions/upload-artifact@v4` step | **NOT EXECUTABLE LOCALLY** | Same as hub-web — cannot run outside Actions. Verified `dist/` exists and is populated by stage 5 above. |

```text
Manual scenarios and observations: none — G5/G7 and L1 (clean-install-by-someone-else) product/buyer
  acceptance scope is out of this brief; this was a repeat install by the implementer, not an L1
  clean-install proof.
Security/negative-path results: not tested in this brief.
Migration/restore and RTO/RPO results: not applicable — source product, buyer owns persistence.
SLO/alert/degraded-mode results: not applicable — source product, no hosted uptime obligation.
Known limitations: lint, license-audit, secret-scan and SAST stages are not proven locally (see
  table above). The workflow file has never executed in GitHub Actions. This was not a clean-machine
  buyer simulation (L1) — it ran on the implementer's own working checkout.
Open P0/P1 issues: none newly opened by this brief; existing high/critical dependency findings and
  the eslint-config-without-eslint-dependency gap are pre-existing and recorded above, not fixed here.
Reviewer: not yet reviewed — this is the implementer's own evidence record (V1 self-test).
CEO decision: not requested by this brief.
Artifact/tag/checksum: no release artifact produced — this is a CI-definition proving run, not a
  release.
Evidence links: docs/platform/CI_BASELINE.md; products/booking-ticket-module/.github/workflows/ci.yml
```

---

## Baseline-SHA drift check

Both repositories' `HEAD` were re-checked with `git rev-parse HEAD` immediately after the last
command ran in each (build/audit), and compared against the value captured before any command ran:

| Repository | SHA at start | SHA at end | Moved? |
|---|---|---|---|
| `apps/hub-web` | `1b688111cbcddee38c221c81e9148f51e113469b` | `1b688111cbcddee38c221c81e9148f51e113469b` | No |
| `products/booking-ticket-module` | `be37b0a0db6ade372797ce890b523aa18063475c` | `be37b0a0db6ade372797ce890b523aa18063475c` | No |

Neither repository's tree carries any staged or unstaged change from this brief's work — `git status
--short` was empty in both at the end of the session. `node_modules` and `dist` output are gitignored
in both repositories and are not tracked changes.

---

## Tool-choice summary (also stated in `CI_BASELINE.md`)

Three CI stages have their tool selection marked **OPEN — CEO decision required** rather than
silently picked:

| Stage | Options considered | Implementer's recommendation |
|---|---|---|
| License audit | `license-checker` (free, npm-native) vs. FOSSA/`licensee`-class SaaS scanners (paid, stronger detection, external data exposure) vs. `pnpm licenses list` (built-in, no enforcement) | `license-checker` — matches the portfolio's no-new-paid-vendor posture so far and is sufficient for an SPDX-identifier-based allowlist; upgrade to a paid scanner only if license-text (not just declared SPDX) divergence becomes a real incident. |
| History-aware secret scan | `gitleaks` (free, single binary, has a maintained GitHub Action) vs. `trufflehog` (free, makes live verification calls against providers — a behavior difference worth a deliberate decision) vs. GitHub Advanced Security (paid, no separate tool, ties to GitHub product entitlements) | `gitleaks` — free, does not make outbound network calls to verify credentials (a property worth having for a security-sensitive scan step), and has an existing GitHub Action so adoption is a one-line workflow change once approved. |
| SAST | `semgrep` (free community ruleset, fast, JS/TS-strong) vs. `CodeQL` (deeper, GitHub-native, paid entitlement + slower first run) vs. `eslint-plugin-security` (free, weak, rides on the lint step) | `semgrep` — best coverage-to-cost ratio for a solo-operator budget; `eslint-plugin-security` is a reasonable interim stop-gap once lint itself is enabled, not a long-term substitute. |

These are recommendations, not decisions — none is enabled in either workflow file. Each recommendation
follows the §0 constraint: it is argued from tool properties (cost, network behavior, coverage,
existing-portfolio precedent), never from usage or demand.
