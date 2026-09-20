# GATE COVERAGE FINDING — test files are outside every typecheck gate — WSTERA-HOUSE-PRODUCTION-CLOSURE-001

Discovered by: Hermes (orchestrator), while diagnosing why `tsc --noEmit` reported exit 0 while a
test file referenced an undefined identifier.
Stage: T3 · Recorded: 2026-09-20 (Asia/Bangkok)

## Finding

`apps/hub-web/tsconfig.json` sets:

```json
"include": ["client/src/**/*", "shared/**/*", "server/**/*"],
"exclude": ["node_modules", "build", "dist", "**/*.test.ts"]
```

So `npx tsc --noEmit` — which is `npm run check` — **never type-checks any `*.test.ts` file**.
`--listFiles` confirms it: `fulfillment.test.ts` is not in the program.

There is no second tsconfig for tests (`tsconfig.node.json` is for the build tooling, not tests), and
`vitest.config.ts` does not enable a typecheck mode. Measured consequence:

```
npx tsc --noEmit   -> exit 0
npx vitest run     -> ReferenceError: withoutComments is not defined
```

The undefined identifier `withoutComments` (called at `fulfillment.test.ts:1277`, declared only in
`fulfillment-controls.test.ts:369`) survived an "all gates green" typecheck because the file holding
the call is excluded from the checker entirely.

## Why this matters beyond the one bug

This is a **gate-coverage gap, not a code defect**, and it has been present for every review in this
task:

- B2's reviewer listed "Typecheck `npx tsc --noEmit`: PASS" as a meaningful check. It was: the
  production source really does typecheck. But it says **nothing** about the test suites, which is
  where this task's coverage claims live.
- Every "typecheck PASS" statement in the T1/T2/T3 evidence carries the same limitation. None of them
  are wrong; they are narrower than they read.
- The T2 remediation explicitly introduced source-contract tests containing substantial TypeScript
  (regex construction, balanced-slice walking, mutation probing). All of that is untypechecked.

The practical risk is precisely what happened: a test file can be left in a state that cannot run,
while the typecheck gate still reports success.

## What Hermes did NOT do

Hermes did not add a test tsconfig, did not change `npm run check`, and did not enable vitest
typecheck. Changing a build/test gate is a change to the project's verification contract; it would
alter what "green" means for every future stage and for other work in this repository. This document
records the gap for disposition instead.

## Disposition options for the Owner / later authority

1. **Add a `tsconfig.test.json`** (extending the base, including `**/*.test.ts`, excluding nothing
   relevant) and add a `check:tests` script. Lowest risk, additive, no change to existing gates.
2. **Enable vitest typecheck mode** (`test.typecheck`), which typechecks test files as part of
   `vitest run`. Also additive, but slower and it changes the meaning of the existing `test` script.
3. **Leave as-is** and require test files to be exercised by `vitest run` only, accepting that
   type-level errors in tests surface as runtime failures. This is the current behaviour and is what
   allowed the defect — it is a choice, not an accident, but it must be a *recorded* choice.

Hermes recommends option 1 as the minimal, non-breaking closure, and notes it is **out of this task's
locked manifest scope** (the manifest authorises T1–T6 House closure work, not changes to the
repository's verification contract).

## Effect on current evidence

Until this is dispositioned, every `tsc --noEmit` result in this task's evidence should be read as
**"production source typechecks; test files are not type-checked"**. The `vitest run` results remain
the binding evidence for test behaviour, and they are what Hermes has been verifying independently at
every step.
