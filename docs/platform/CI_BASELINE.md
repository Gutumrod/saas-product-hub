# CI Baseline

**Satisfies:** P0a item 2 (`PORTFOLIO_PRODUCTION_MASTER_PLAN.md` §5) and G1 build integrity (§4).

**Status:** definition published under P0a-B2. Not yet installed portfolio-wide. Proven locally
(clean-clone command sequence, real output, no live CI run — see below and
`PHASE_P0a_B2_EVIDENCE.md`) on `apps/hub-web` and `products/booking-ticket-module` (CM01).

**Relationship to `RUNTIME_MATRIX.md`:** this document does not restate the runtime/package-manager
standard or the lockfile update policy. Every frozen-install command below assumes the package
manager, Node major version and lockfile-commit rule that `RUNTIME_MATRIX.md` defines. Where a
repository has not yet adopted that standard (see its adoption-gap row), the frozen-install stage
still runs against whatever manager/lockfile the repository has today — adoption of the standard
itself is P0b work, not a precondition for running the baseline.

**Hard limitation, stated once, applying to every stage below:** no repository in this portfolio has
a GitHub Actions workflow today, and this brief may not push. "Proof" therefore means the exact
command sequence a workflow will run, executed locally from a clean state with real captured output
— never a claim that a green Actions run occurred. See `PHASE_P0a_B2_EVIDENCE.md` for the actual runs.

---

## Stages

Each stage states: what it does, the npm command, the pnpm command, blocking or advisory, and what
counts as failure. "Blocking" means the job fails the workflow (and, once branch protection exists
under P0b, cannot be merged past). "Advisory" means the job runs and reports but does not fail the
build — its output is read by a human, not enforced automatically, until a policy decision promotes
it.

### 1. Frozen install

- **What it does:** installs dependencies from the committed lockfile only, refusing to resolve new
  versions or write a different lockfile.
- **npm:** `npm ci`
- **pnpm:** `pnpm install --frozen-lockfile`
- **Blocking.** Failure = the manifest and lockfile are out of sync (npm) or the lockfile does not
  satisfy the manifest (pnpm). Per `RUNTIME_MATRIX.md`, this is a G1 build-integrity failure, not a
  fallback-to-loose-install condition. A workflow must never retry with `npm install` on `npm ci`
  failure.
- Runs against the Node major version and package manager `RUNTIME_MATRIX.md` records or proposes for
  that repository.

### 2. Typecheck

- **What it does:** runs the TypeScript compiler in no-emit mode against the whole project, catching
  type errors CI would otherwise ship.
- **npm:** the repository's own typecheck script if one exists (`npm run typecheck`, `npm run check`,
  etc. — do not invent a script name a repository doesn't have); otherwise `npx tsc --noEmit` (or
  `tsc -b` for a project-references setup).
- **pnpm:** same, via `pnpm run <script>` / `pnpm exec tsc --noEmit`.
- **Blocking.** Failure = any type error. A repository with no TypeScript source is exempt, not
  failing — record which repositories that applies to at adoption time.

### 3. Lint

- **What it does:** static analysis for code-quality and correctness rules (unused variables, hook
  rules, forbidden patterns) beyond what the type checker catches.
- **npm:** `npm run lint` if the script exists; otherwise the repository has not adopted lint into CI
  yet — see the per-repository note below.
- **pnpm:** `pnpm run lint`.
- **Blocking**, once a repository has a working `lint` script with a real linter installed.
  **Advisory only** (or entirely absent from the workflow, with a placeholder comment) for a
  repository that lacks either — see the adoption note. Failure = the linter reports any error-level
  finding under the repository's own configured rule set; a workflow must not silently swallow a
  non-zero exit code.
- **Repository-specific findings from this brief's proving run:** `apps/hub-web` has no `lint` script
  and no ESLint (or other linter) configuration or dependency at all. `products/booking-ticket-module`
  has an `.eslintrc.cjs` committed but no `lint` script in `package.json` and no `eslint` package in
  its `devDependencies` — the config file exists without the tool that reads it. Neither proving
  repository can run this stage as blocking today; both workflows below carry lint as a commented
  placeholder. Closing this is P0b work (see the evidence document's "required P0b changes" list).

### 4. Test

- **What it does:** runs the repository's unit/integration test suite.
- **npm:** `npm test` (both proving repositories already run `vitest run` under this script).
- **pnpm:** `pnpm test`.
- **Blocking.** Failure = any failing test or a non-zero exit code from the test runner, including a
  runner crash. A repository with no test script and no tests is a G1 gap to close under P0b, not a
  reason to omit the stage from the workflow — the step still runs and fails loudly on `npm test`'s
  "missing script" error, which is the correct signal.

### 5. Build

- **What it does:** produces the deployable production artifact the same way a release would.
- **npm:** `npm run build`.
- **pnpm:** `pnpm run build`.
- **Blocking.** Failure = a non-zero exit code from the build command, or (advisory warning, not
  blocking by default) an oversized-bundle warning from the bundler — a repository may choose to
  promote a bundle-size budget to blocking later; that is a per-repository decision, not part of this
  baseline.

### 6. Dependency audit

- **What it does:** checks resolved dependencies against known-vulnerability advisory databases.
- **npm:** `npm audit --omit=dev` for the production dependency graph plus a separate
  `npm audit` (no `--omit`) run to also see dev-only findings, since a compromised dev tool can still
  poison CI or a contributor's machine.
- **pnpm:** `pnpm audit --prod` and `pnpm audit`.
- **Advisory today, blocking once the exception process exists.** The master plan (G1) requires "no
  unaccepted high/critical dependency finding remains," with any exception naming reachability, a
  compensating control, an owner, and an expiry/re-review date. That exception ledger does not exist
  yet in this portfolio, so a workflow that hard-fails on any high/critical finding today would block
  every repository immediately (both proving repositories currently report high/critical findings —
  see the evidence document). Mark the check blocking only after a repository's P0b work records its
  exception ledger; until then it runs and reports, and its raw output is read at every release
  checkpoint per G1.

### 7. License audit

- **What it does:** scans direct and transitive dependency licenses against a portfolio allowlist,
  catching a license that forbids redistribution before it ships in a buyer artifact (critical for
  MT01, CM01, HC01) or exposes the portfolio to a copyleft obligation it did not intend to accept.
- **Requirement:** every dependency's license is checked against an explicit allowlist; an unknown or
  disallowed license fails the check with the package name and license identifier.
- **Tool choice — OPEN, CEO decision required.** No license-scanning tool is installed on the
  machine this brief ran on, and no allowlist exists in any portfolio document read for this brief.
  Realistic options:
  - `license-checker` (npm package, `npx license-checker`) — free, npm-native, simple
    allow/deny-list JSON config, no network dependency beyond install; weaker at catching license text
    that diverges from the declared SPDX identifier in `package.json`.
  - `licensee` / FOSSA-style SaaS scanners — stronger license-text detection and a maintained
    knowledge base, but paid and adds an external service dependency, which cuts against the
    self-hosted, buyer-facing nature of the one-time products (MT01, CM01, HC01) — sending their
    dependency tree to a third party before a license is finalized is itself a decision the CEO should
    make, not one this brief makes for them.
  - `pnpm licenses list` — built into pnpm already, zero extra dependency, but only lists what it
    finds; it does not enforce an allowlist on its own, so it would still need a policy script wrapped
    around it.
  Until the CEO picks a tool and approves the allowlist, workflows below carry this stage as a
  commented placeholder, not an enabled step referencing an undecided tool.

### 8. History-aware secret scan

- **What it does:** scans the full git history (not only the current diff) for committed secrets —
  API keys, tokens, private keys, connection strings — because a secret removed from the current tip
  but still reachable in history is still a live compromise.
- **Requirement:** scans every commit reachable from the default branch, not only the latest commit
  or the PR diff, and fails on a real finding rather than reporting and continuing.
- **Tool choice — OPEN, CEO decision required.** No secret-scanning tool is installed on the machine
  this brief ran on. Realistic options:
  - `gitleaks` — free, single static binary, fast, widely used, has a GitHub Action
    (`gitleaks/gitleaks-action`) that already does full-history scanning; false-positive rate depends
    on the ruleset and needs a `.gitleaks.toml` allowlist for known-safe patterns (test fixtures,
    example env values).
  - `trufflehog` — free, also does verified-secret checking (actually tries the credential against
    the provider API for some secret types, which reduces false positives but means it makes live
    network calls during a scan — a meaningful behavior difference to weigh for a security-sensitive
    portfolio).
  - GitHub Advanced Security secret scanning — no separate tool to install, but is a paid GitHub
    feature at the private-repository tier and depends on GitHub product entitlements this brief has
    no visibility into.
  Until the CEO picks a tool, workflows below carry this stage as a commented placeholder naming the
  requirement (full git history, not just the diff) rather than referencing an unselected action.
  **Note on this brief's own scope:** this brief did not run any secret scanner against either proving
  repository's history — see `PHASE_P0a_B2_EVIDENCE.md` for what that means for this specific run.

### 9. SAST (static application security testing)

- **What it does:** pattern- and dataflow-based static analysis for security bugs (injection,
  unsafe deserialization, hardcoded crypto, SSRF-prone patterns) that a type checker and a
  style-focused linter do not catch.
- **Requirement:** runs against the application source (excluding vendored module copies, which are
  covered by the vendored-module drift/checksum control instead — see `RUNTIME_MATRIX.md`) and fails
  on a new high/critical finding.
- **Tool choice — OPEN, CEO decision required.** No SAST engine is installed on the machine this
  brief ran on. Realistic options:
  - `semgrep` (CLI, free "community" ruleset or paid Semgrep Cloud) — fast, JS/TS-strong ruleset,
    easy local reproduction of a CI finding, free tier is genuinely usable without a paid plan.
  - `CodeQL` (GitHub Advanced Security) — deeper dataflow analysis, native GitHub PR integration, but
    ties the portfolio to GitHub Advanced Security entitlements the same way secret scanning option 3
    does, and has a slower first-run cost (query compilation) that matters for a solo-operator
    workflow budget.
  - `eslint-plugin-security` bundled into the existing lint step — the lightest option, effectively
    free once lint itself is enabled, but it is pattern-matching on the AST only, materially weaker
    than either dedicated SAST engine above; realistic as a stop-gap, not a long-term replacement.
  Until the CEO decides, workflows below carry this stage as a commented placeholder.

### 10. Artifact retention

- **What it does:** uploads the built production artifact (and, once produced, the SBOM and
  provenance metadata G1 requires) as a workflow artifact so a release can be traced back to the
  exact build that produced it, without rebuilding from source to inspect what shipped.
- **npm/pnpm:** same GitHub Actions step regardless of package manager —
  `actions/upload-artifact@v4` pointed at the build output directory (`dist/` for both proving
  repositories).
- **Blocking or advisory:** advisory — a failed upload should not fail the whole pipeline (the build
  itself already passed by the time this step runs), but it should be visibly flagged, since a
  missing artifact silently breaks traceability for that release.
- **Where applicable:** hosted products (BK01, PS01, LK01, DC01) additionally need their deploy
  target's own artifact/version record (e.g. a Cloudflare Workers deployment ID); one-time products
  (MT01, CM01, HC01) need the release archive itself retained, which is the L3 packaging rung in the
  master plan, not a CI-artifact substitute for it. Both proving repositories in this brief are
  library/app builds without a configured deploy target, so only the CI-artifact-upload half applies
  to them; the deploy-target record is P0b/P2+ work per repository.

---

## Adoption under P0b

A repository adopts this baseline by:

1. Copying the relevant proving workflow (`apps/hub-web/.github/workflows/ci.yml` for an npm
   project with this shape, or the CM01 workflow as a second npm example) and adjusting only what its
   own manifest requires — script names, build output path, and whether it is npm or pnpm per
   `RUNTIME_MATRIX.md`.
2. Running the full sequence from a clean clone before the workflow is trusted, exactly as this brief
   did locally — not assuming a workflow file that has never executed is correct.
3. Closing that repository's own blocking gaps recorded in `PHASE_P0a_B2_EVIDENCE.md` and the master
   plan's P0b item 2 (missing test entrypoints, lint script/tooling, high/critical findings) before
   marking any stage blocking that the repository cannot yet pass.
4. Recording the result as a `P0b-C1` evidence file per `EVIDENCE_TEMPLATE.md`.

**What P0b-C1 requires as evidence**, restated from the master plan checkpoint definition and applied
to this baseline specifically:

- The workflow above (or the repository's adjusted copy of it) is committed to that repository and
  its required checks are enabled on the default branch — not merely present as a file.
- Every stage that is enabled as blocking in that repository's workflow has actually passed on the
  exact commit named in the evidence record; a stage left as an advisory or a commented placeholder is
  listed as such, not silently omitted from the record.
- No unaccepted high/critical dependency finding remains open for that repository (or each is recorded
  with the reachability/compensating-control/owner/expiry fields G1 requires).
- The three OPEN tool choices above (license audit, secret scan, SAST) are either still OPEN — in
  which case the evidence record says so and those stages stay commented placeholders, not silently
  dropped from the checklist — or the CEO has decided them, in which case the repository's workflow
  enables the chosen tool and its evidence is included.
- Threat model, release owner and security/release policy files (master plan P0b items 3 and 5) exist
  alongside the CI adoption; this baseline does not substitute for them.
