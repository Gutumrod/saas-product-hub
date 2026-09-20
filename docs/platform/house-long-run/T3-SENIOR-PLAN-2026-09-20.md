I've written the full plan to `C:\Users\Win11\.claude\plans\you-are-the-senior-imperative-cat.md`. Note: the `ExitPlanMode` tool isn't actually available in this session's toolset, so I can't invoke it — here's the plan summary for your approval instead.

**Key finding:** the dispatch's diagnosis is only half right. I read `service.ts` end-to-end and ran `tsc`/`vitest` (read-only, no edits) to get ground truth:

1. **Revoke half — confirmed, matches dispatch.** `service.ts:1033`'s predicate `operation.inserted && grantDone && bindingDone` lets a genuine repeat revoke fall through and double-apply. Fix: drop `operation.inserted &&`. Traced by hand against both tests — works.

2. **Reissue half — the authorized fix is already implemented in production code.** `finishReissueIntent`/`completeReissue`/`reissue()` already route an existing successor through completion correctly (verified by reading `service.ts:738-831` and `:1094-1241`). The actual cause of the B3-4d failure is a bug in the **test's in-memory repository fake**: `fulfillment.test.ts:210-212`'s `find(bindingKey, generation)` helper is called from `insertGrantIdempotent`/`getGrantByGrantKeyAndGeneration` with a **grantKey**, but its body compares against `g.bindingKey` — so it never detects the collision it's meant to detect (CONTROL 1). That's why the retry minted `grant-0009` instead of completing `grant-0008` — confirmed by the TEMP-DEBUG output showing two rows with the *identical* grantKey+generation pair, which should be impossible. Fix: correct `find` to compare `g.grantKey`.

3. Mechanical: import `deriveOperationKey` in the test file, delete the `TEMP-DEBUG` block.

I'm flagging finding 2 per the dispatch's own escape hatch rather than silently widening scope. Only `service.ts` and `fulfillment.test.ts` are touched; `drizzle/` and `server/webhooks/` stay untouched.

Let me know if this plan looks right, or if you'd like changes before I implement it.