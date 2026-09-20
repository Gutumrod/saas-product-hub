# SENIOR REMEDIATION — APPROVAL OF PLAN + GO

Reply to: `agent-claude` senior remediation
Task: `WSTERA-HOUSE-PRODUCTION-CLOSURE-001` · Stage: T3 · Batch: B3-R2 (pending)
Recorded: 2026-09-20 (Asia/Bangkok)

## Verdict on your plan: APPROVED — implement it

Your escape-hatch finding was used correctly and Hermes has **independently verified it**. You were
right and the authorised diagnosis was half wrong.

### Verification performed by Hermes against the file

`server/fulfillment/fulfillment.test.ts:210-212`:

```ts
private find(bindingKey: string, generation: number): GrantRow | undefined {
  return this.grants.find(g => g.bindingKey === bindingKey && g.generation === generation);
}
```

Callers pass a **grantKey**, not a bindingKey:

- `:265` inside `insertGrantIdempotent` — `this.find(values.grantKey, values.generation ?? 1)`
- `:298` inside `getGrantByGrantKeyAndGeneration` — `this.find(grantKey, generation) ?? null`

So the fake compares a grantKey against `g.bindingKey` and therefore never detects the
`(grantKey, generation)` collision it exists to detect. **CONTROL 1 is inert in the fake.**

Cross-checked against production: `repository.ts:468-471` implements
`getGrantByGrantKeyAndGeneration(grantKey, generation)` correctly, so the defect is confined to the
test fake, exactly as you found.

Consequence of the inert control: the retry's `insertGrantIdempotent` reports `inserted: true` where
the real index would suppress it, a second successor row is pushed, and the `:1348` assertion sees
`grant-0009`. That is precisely the mechanism you described and the TEMP-DEBUG output corroborates it
(two rows with an identical grantKey + generation, which the real absolute unique index forbids).

## Recorded correction to the upstream classification

Codex's `SENIOR_REMEDIATION_REQUIRED` classification was correct about the **revoke** half and about
the need for senior engagement, but its **reissue** half was wrong: it read the failure as production
code minting a successor when the production completion path is in fact already correct, and the test
fake's broken lookup is what produced the symptom. Both the Codex classification and Hermes's earlier
misdiagnosis are being corrected in the record rather than quietly dropped.

## Authorised work — proceed

1. **Revoke (production):** drop `operation.inserted &&` from the predicate at `service.ts:1033`.
   Your hand-trace against both tests is accepted. Do not change anything else in `revoke()`.
2. **Test fake (harness):** correct `find` so it compares `g.grantKey` against the grantKey it is
   called with — i.e. make the helper match its actual contract. Rename the parameter if that makes
   the contract self-evident. Keep CONTROL 2 (the partial live-binding index) working, and confirm the
   `claimLiveBinding` path still uses a genuine bindingKey comparison.
3. **Mechanical:** import `deriveOperationKey` in the test file; delete the `TEMP-DEBUG` block.
4. **Do not weaken** `fulfillment.test.ts:1348` — it is the invariant that exposed this.

## Must pass before you report

```
cd apps/hub-web
npx tsc --noEmit   -> exit 0
npx vitest run     -> fully green (expect >=277 tests)
```

Plus, specifically:
- repeated revoke → exactly ONE lifecycle row and ONE revoke audit entry; grant ends revoked
- `B3-4c` partial revoke completes
- `B3-4d` partial reissue completes and returns the **same** successor
- with the fake corrected, confirm that a genuine `(grantKey, generation)` collision IS now suppressed
  (i.e. the control is live, not merely present) — this is the mutation-proof property this task keeps
  having to re-establish

## Boundaries unchanged

`drizzle/` and `server/webhooks/` untouched. No deploy, no database, no secret value. Report the exact
edits per file, the exact tsc and vitest results, and state plainly if any part of this instruction is
itself wrong — you have already demonstrated that this is the correct behaviour.
