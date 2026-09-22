# T3-WU02E — PRODUCTION BUNDLE PROOF (no simulation text reaches the deployed asset)

Task: `WSTERA-CONTROL-TRUTH-SYNC-001` · Workflow `WF-DEV-01 v1.3.0 / LONG_RUN`
Stage: **T3** · Work Unit: **`T3-WU02` sub-unit E**
Revision proven: `87903fecc9d8ee1932ca32bc8ae9f65edffd6ea4`
Date: 2026-09-22 (Asia/Bangkok)

---

## 1. Why this proof exists

Sub-unit E removed the unconditional simulation claims from four Control Plane tabs. The
remaining question a reviewer must be able to answer is: **does any simulation text still reach the
asset that production actually serves?** Reading the source is not enough — dead components, other
tabs and shared strings could still carry it.

This proof builds the real client bundle at the committed revision and inspects the emitted asset.

## 2. Method

```bash
cd D:/AI-Workspace/runtime/worktrees/hub-web-cts001
npx --no-install vite build
```

Build result: `✓ built in 3.38s`, emitting `dist/public/assets/index-BH3hE34e.js` (923.36 kB).
`dist/` is gitignored (`.gitignore:6  dist/`), so the build does not pollute the worktree — verified
with `git check-ignore` and `git status --porcelain` (clean afterwards).

## 3. Result — grep counts over the built asset

| String | Occurrences in the production bundle |
|---|---|
| `SIMULATION SANDBOX` | **0** |
| `In-Memory Demo` | **0** |
| `Simulated Recovery` | **0** |
| `NO TRUTH MODE` | **4** |

Reading:

- The three strings that were the hard-coded claims of `BillingTab.tsx:25/32`,
  `CustomersTab.tsx:59`, `OperationsTab.tsx:49` and `OverviewTab.tsx:72` appear **zero** times in
  the shipped bundle. The claims are gone from what production serves, not merely from one file.
- `NO TRUTH MODE` appears **4** times — the four neutral replacements (three tabs without a truth
  mode, plus `OverviewTab`'s unresolved-query branch). The truthful label is what shipped.

## 4. `ComponentShowcase.tsx` — dead code, not a gap

The `t3-wu02c` worker's closing note listed simulation references in
`client/src/components/control-plane/ComponentShowcase.tsx:190/222/1406`, which is outside every
work unit's scope. Measured:

| Check | Command | Result |
|---|---|---|
| Any reference anywhere in the repo | `grep -rn "ComponentShowcase" . --include=*.ts --include=*.tsx --include=*.json --include=*.html` (excl. `node_modules`, excl. the file itself) | **no matches — zero importers** |
| Dynamic/glob import that could pull it in | `grep -rn "import.meta.glob\|React.lazy\|lazy(" client/src` | **no matches — no dynamic mechanism** |
| Present in the shipped bundle | `grep -c "ComponentShowcase" dist/public/assets/*.js` | **0** |

Conclusion: `ComponentShowcase.tsx` is **not reachable from the production dependency closure** and
is tree-shaken out of the built asset entirely. Per Brief §10 ("Test fixtures may remain only outside
production dependency closure") and the manifest's T3 acceptance ("production import/runtime closure
cannot select demo fixtures … as live data"), it is correctly out of scope — **no scope widening is
required for it** and none was taken.

This is recorded rather than dismissed because the previous sub-unit (`WU02C`) under-scoped for
exactly this class of reason. Here the measurement says dead code, so the answer is "no defect", but
the answer is based on the bundle, not on an assumption.

## 5. Gate re-confirmation at the proven revision

```text
npm run check      (tsc --noEmit)  → exit 0
npx vitest run                     → exit 0   (26 files, 430/430)
git status --porcelain             → clean
git rev-parse HEAD                 → 87903fecc9d8ee1932ca32bc8ae9f65edffd6ea4
git rev-parse origin/work/...      → 87903fecc9d8ee1932ca32bc8ae9f65edffd6ea4   (parity 0/0)
```

Note on the runner: the lane's declared grep check previously FAILed on this project because vitest
emits ANSI colour codes between `Tests` and the count. The gate above uses the runner's **exit code**,
which is the reliable signal. Recorded so the harness defect is not repeated.

## 6. Non-claims

- This proves the **client bundle**. It does not prove the deployed Worker's runtime behaviour — see
  `OWNER-HOLD-PRODUCTION-TRUTH-GATE-INERT-2026-09-22.md` for the separately measured blocker that
  `ENV.isProduction` is false on the deployed Worker.
- The build was produced locally, not deployed. No production mutation occurred.
- The bundle hash is of a **local build of the committed revision**, not of any deployed asset.
