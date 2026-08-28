# Runtime Matrix

**Satisfies:** P0a item 3 (`PORTFOLIO_PRODUCTION_MASTER_PLAN.md` §5).

**Verification method:** manifests were enumerated per repository with
`find <repo> -iname package.json` excluding `node_modules`, `.next`, `.open-next` and `.vite` rather
than by manual inspection of expected locations, and each result was then read directly. Build- and
cache-directory exclusions matter: a bare enumeration also returns generated stubs that are not
manifests (see the hub-web note below). Lockfiles and `.nvmrc`/`.node-version`
files were enumerated the same way. Nothing is inferred from the master plan or `registry.yaml`.

> Corrected 2026-08-27 after `REVIEW-P0a-B1-2026-08-27.md` returned `REMEDIATE`. The first version
> of this document enumerated manifests by inspecting expected locations, and consequently made
> three false existence claims (LK01 "no `package.json` exists anywhere", MT01 and HC01 "the only
> `package.json` found is nested at `server/`"). The `find`-based method above is the fix, and the
> per-repository rows below now distinguish application manifests from vendored module manifests.

## Manifest scope

Two different kinds of `package.json` exist in this portfolio and they are not governed the same
way:

- **Application manifests** — the manifest(s) that build and run the deployable product. The
  portfolio runtime standard below governs these.
- **Vendored module manifests** — per-module copies taken from `modules-hub` and committed into a
  product (`vendor/modules/*` in LK01, `modules/*` in MT01 and HC01). They are library sources
  carried inside the product, not independently deployed services.

Counts observed this session (excluding `node_modules`, `.next`, `.open-next`, `.vite`):

| Repo | Total `package.json` | Application manifests | Vendored module manifests |
|---|---|---|---|
| `hub-web` | 1 | 1 root | 0 |
| BK01 `booking` | 3 | 1 root + 2 workspace apps | 0 |
| PS01 `pawspace` | 1 | 1 root | 0 |
| LK01 `wstera_link` | 10 | 0 | 10 (`vendor/modules/`) |
| DC01 `doccraft` | 1 | 1 root | 0 |
| MT01 `multi_tenant_ai` | 8 | 1 (`server/`) | 7 (`modules/`) |
| CM01 `booking_ticket_module` | 1 | 1 root | 0 |
| HC01 `headless_commerce` | 6 | 1 (`server/`, on `feat/reference-server`) | 5 (`modules/`) |

Not counted as manifests: `apps/hub-web/client/.vite/deps/package.json` and two
`client/.vite/deps_temp_*/package.json` siblings. Each contains only `{"type": "module"}`, they are
Vite dependency-cache stubs, and `client/.vite/` is gitignored in that repository
(`apps/hub-web/.gitignore:10`, confirmed with `git check-ignore -v`). An earlier revision of this
document counted them as hub-web application manifests. They are excluded because they are generated
build cache, not source.

**No vendored module manifest declares `packageManager` or `engines`** — verified across all 22 of
them. Every vendored module does, however, carry its own committed `package-lock.json` (npm): 10 in
LK01, 7 in MT01, 5 in HC01. This does not change the runtime standard below, but it does widen the
lockfile policy's surface — see the vendored-lockfile clause in that section.

## Per-repository findings

The table below covers **application manifests only**, per the scope split above.

| Repo | Package manager (`packageManager` field) | Node/engines constraint | Lockfile present | `.nvmrc` / `.node-version` |
|---|---|---|---|---|
| `hub-web` (`apps/hub-web`) | none — no `packageManager` field in `package.json` | none — no `engines` field | `package-lock.json` (npm) | none |
| BK01 `booking` | none — no `packageManager` field in root `package.json` (root is an npm-workspaces manifest for `apps/booking-consumer` and `apps/booking-admin`; neither nested app has its own `packageManager`/`engines` field either) | none | `package-lock.json` (npm) | none |
| PS01 `pawspace` (on disk `products/PawSpace`) | `pnpm@11.21.0` (exact, pinned) | none — no `engines` field | `pnpm-lock.yaml` | none |
| LK01 `wstera_link` (on disk `products/WSTERA-Link`) | not applicable — **no application manifest exists.** No root `package.json` and no application code; the 10 `package.json` files present are all vendored module manifests under `vendor/modules/`, none of which declares `packageManager`. | none — no application `engines` field; no vendored module declares one either | none at application level (each vendored module carries its own `package-lock.json`) | none |
| DC01 `doccraft` (on disk `products/DocCraft`) | `pnpm@11.21.0` (exact, pinned) | none — no `engines` field | `pnpm-lock.yaml` | none |
| MT01 `multi_tenant_ai` | not applicable at repo root — no root `package.json`. The single application manifest is `server/package.json`, which has **no `packageManager` field and no `engines` field**. (7 further manifests exist under `modules/` and are vendored module copies, not application manifests.) | none | `server/package-lock.json` (npm); no root-level lockfile | none |
| CM01 `booking_ticket_module` | none — no `packageManager` field | none — no `engines` field | `package-lock.json` (npm) | none |
| HC01 `headless_commerce` | not applicable at repo root — no root `package.json`. The single application manifest is `server/package.json` (present on the `feat/reference-server` branch currently checked out, not on default branch `master`), which has **no `packageManager` field and no `engines` field**. (5 further manifests exist under `modules/` and are vendored module copies, not application manifests.) | none | `server/package-lock.json` (npm); no root-level lockfile | none |

Honest summary: **no repository in the portfolio pins a Node major version**, anywhere — no
`engines.node` field and no `.nvmrc`/`.node-version` file exists in any of the eight repositories
checked. This now holds across every manifest found by the `find`-based enumeration, application and
vendored alike (31 manifests total — 9 application, 22 vendored), not only the application manifests. Only two repositories (PS01, DC01) pin a package manager at all, and both pin the exact
same value, `pnpm@11.21.0` — which is also the exact pnpm CLI version installed on the machine this
session ran on (`pnpm -v` → `11.21.0`). This is worth flagging plainly: it is at least equally likely
that both repos simply record "whatever pnpm was on the machine when `packageManager` was last
generated" as that it reflects a deliberate portfolio-wide choice. **UNVERIFIED:** whether `pnpm@11.21.0`
was a deliberate pin or an artifact of the authoring machine's installed pnpm version — no commit
message or doc found in-session addresses this.

Machine reference values captured this session (not a portfolio standard, just what is on the audit
host): `node -v` → `v22.23.2`; `npm -v` → `11.11.1`; `pnpm -v` → `11.21.0`.

## Portfolio standard (proposed under P0a item 3)

Chosen only from what the repositories actually use today, per the brief's instruction — majority
wins, and the count is stated:

- **Package manager: npm.** Lockfile evidence: `package-lock.json` is present in `hub-web`, BK01,
  CM01, and both one-time products' nested servers (MT01 `server/`, HC01 `server/`) — **5 of 7**
  repositories that have any application code and any lockfile at all use npm. `pnpm-lock.yaml`
  appears in exactly 2 (PS01, DC01). LK01 has no application code and is excluded from the count. On
  a strict majority-of-application-lockfiles basis, **npm wins 5–2**. Vendored module lockfiles are
  excluded from this count by the manifest-scope rule above, but they do not cut against it: all 22
  are `package-lock.json` (npm), with no `pnpm-lock.yaml` anywhere among them.
- **Package manager version: not pinned anywhere today.** No repository declares an exact npm
  version via `packageManager`. Recommendation: adopt `packageManager: "npm@11.11.1"` (the version
  installed on the current build/audit host) as the starting pin, reviewed at the next Node LTS
  transition. This is a proposal for P0b adoption, not a claim that any repo currently has it.
- **Node major version: no repository declares one today**, so "majority wins" has no data to work
  from — this is a gap, not a choice between competing existing pins. Recommendation, stated as an
  engineering-maturity choice per the brief's §0 constraint (not a usage/demand judgment): pin
  **Node 22 (the current Active LTS line as of this session, and the version already running on the
  build host)**. Do not silently pin an older LTS just because it's already deployed somewhere —
  none of the eight repositories currently declare any Node version, so there is no existing
  portfolio behavior to preserve either way.
- PS01 and DC01's existing `pnpm@11.21.0` pin is **not** proposed to be forced onto npm — see the
  adoption-gap table below for how those two repositories are treated instead.

### Lockfile update policy

- **CI runs a frozen install.** npm repositories run `npm ci` (which fails if `package.json` and
  `package-lock.json` are out of sync — the npm equivalent of `--frozen-lockfile`). pnpm repositories
  run `pnpm install --frozen-lockfile`. A CI job that falls back to a non-frozen install on lockfile
  mismatch is a G1 build-integrity failure, not a convenience.
- **The lockfile is committed always**, for every repository that has one, with no exceptions. A
  repository with a `package.json` and no committed lockfile (none of the eight today, but this
  applies going forward) fails P0b-C1's "no failing required check" condition once CI exists.
  LK01 has neither today because it has no application code yet; once code lands, this rule applies
  to it immediately.
- **Vendored module lockfiles.** LK01, MT01 and HC01 carry 22 committed `package-lock.json` files
  inside vendored module copies. CI is not required to run a frozen install per vendored module —
  they are library sources built through their host application, not independently deployed. What is
  required: they stay committed, they are never regenerated as a side effect of an application
  install, and they are covered by the vendored-module drift/checksum control the master plan
  requires under P1 item 8. Treating a vendored lockfile as if it were an application lockfile, or
  silently deleting it to "clean up", both break that control. Whether any vendored module is built
  independently in CI is a P0b decision for each of the three repositories, not settled here.
- **Update cadence:** dependency updates are reviewed on a regular cadence (monthly is a reasonable
  default, not fixed by this document) plus immediately on a known high/critical advisory per R5 in
  the master plan's risk register. Routine version bumps are not urgent; a disclosed high/critical
  finding is.
- **Who approves:** the CEO, consistent with "release authority: CEO" recorded in
  `REPOSITORY_MAP.md` for every repository in this portfolio — no repository document found in this
  session names a different lockfile-update approver.

### Adoption gap table

| Repo | Package manager compliant with proposed standard (npm)? | Node major pin present? | Gap to close under P0b |
|---|---|---|---|
| `hub-web` | Yes (npm, unpinned version) | No | Add `packageManager: "npm@<pinned>"` and `engines.node` |
| BK01 `booking` | Yes (npm, unpinned version) | No | Add `packageManager` and `engines.node` to root and both workspace apps |
| PS01 `pawspace` | No — pins `pnpm@11.21.0` | No | Decide at P0b: migrate to npm for portfolio consistency, or record an explicit accepted exception for pnpm (engineering-maturity reason only, per §0) plus add `engines.node` |
| LK01 `wstera_link` | Not applicable — no code yet | Not applicable | Adopt the standard when application code is first added, not before |
| DC01 `doccraft` | No — pins `pnpm@11.21.0` | No | Same choice as PS01 |
| MT01 `multi_tenant_ai` | Yes (npm, unpinned version, nested `server/` only) | No | Add `packageManager` and `engines.node` to `server/package.json`; decide whether a root workspace manifest should exist |
| CM01 `booking_ticket_module` | Yes (npm, unpinned version) | No | Add `packageManager` and `engines.node` |
| HC01 `headless_commerce` | Yes (npm, unpinned version, nested `server/` only) | No | Add `packageManager` and `engines.node` to `server/package.json`; decide whether a root workspace manifest should exist — blocked anyway behind HC01's open L0 scope decision (§10) |

No repository in the portfolio fully complies with the proposed standard today. This is expected —
the P0a step is to define the standard; P0b is where each repository actually adopts it.
