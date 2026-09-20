# T2 REMEDIATION ROUND 2 — precise defect list — WSTERA-HOUSE-PRODUCTION-CLOSURE-001

Stage: T2 · Review Batch: B2 (re-review pending)
Task: `WSTERA-HOUSE-PRODUCTION-CLOSURE-001`
Recorded: 2026-09-20 (Asia/Bangkok)

## Measured state (Hermes, in the project workspace)

```
cd apps/hub-web
npx vitest run  ->  Test Files 2 failed | 17 passed (19)
                    Tests 4 failed | 208 passed (212)
npx tsc --noEmit -> exit 0
```

Four failures, **all mechanical test-harness defects**. No production-code defect was found in this
round: `signerRegistry.ts`, `productEvents.ts` and `db.ts` are unchanged and still pass the B2
reviewer's substantive checks.

---

## R2-1 — `installIdempotency.test.ts:96` — extraction helper reads the wrong brace

**Symptom**
```
AssertionError: expected '\r\n  productId: number;\r\n  externa…' to contain '.insert(productInstallations)'
  at assertDbIdempotencyControl (installIdempotency.test.ts:96:16)
```

**Cause (verified).** `webhookWriterBody()` at `:67-74` does:
```
const signature = "export async function recordProductInstallationFromWebhook";
const start = source.indexOf(signature);
const brace = source.indexOf("{", start);     // <-- first brace after the NAME
```
The function signature is `recordProductInstallationFromWebhook(input: {` (`db.ts:224`), so the first
`{` is the **TypeScript parameter type literal**, not the function body. `balancedSlice` therefore
returns the parameter type (`productId: number; externalEventId: string; …`), and every body
assertion then runs against the wrong text.

**Required fix.** Resolve the body brace past the parameter list: from `start`, find the parameter
list's opening `(`, use the existing `balancedSlice` to consume the whole parameter list, and take the
next `{` after it as the body. Do not hardcode a character offset and do not use a line-based regex —
use the balanced-paren walk the file already has.

---

## R2-2 — `installIdempotency.test.ts:284` — mutation probe matches the wrong `uniqueIndex(`

**Symptom**
```
× MUTATION PROBE: the assertions fail when the unique index is deleted
  → expected 'import {\r\n  integer,\r\n  pgEnum,\r…' not to contain 'uniqueIndex('
```

**Cause (verified).** `drizzle/schema.ts` declares **three** unique indexes (lines 76, 106, 152).
The probe at `:278-286` removes only the installation index and then asserts
`expect(mutated).not.toContain("uniqueIndex(")` — which cannot hold while the other two remain. The
mutation itself succeeded; the probe's own precondition assertion is wrong.

**Required fix.** Assert the mutated text no longer contains the *installation* index specifically,
e.g. `expect(mutated).not.toContain("product_installations_event_unique")`, and keep the meaningful
part — `expect(() => assertSchemaUniqueIndexControl(mutated)).toThrow()`.

---

## R2-3 — `installIdempotency.test.ts:302` — column-reorder probe uses an LF pattern on CRLF source

**Symptom**
```
× MUTATION PROBE: the assertions fail if the index columns are reordered
  → expected '…' not to be '…'   // Object.is equality
```

**Cause (verified).** Both `drizzle/schema.ts` and `server/db.ts` are **CRLF** files (confirmed).
The replacement string at `:298-301` uses
`"table.productId,\n      table.externalEventId,"` with LF only, so `String.prototype.replace` finds
no match, `mutated === schemaSourceText`, and the `expect(mutated).not.toBe(schemaSourceText)`
guard fires.

**Required fix.** Make every mutation probe newline-agnostic. Either normalise the source once
(`const schemaSourceText = raw.replace(/\r\n/g, "\n")`) and operate on the normalised copy, or write
the patterns with `\r?\n`. Apply this consistently — the same LF assumption in the other probes is
latent and will bite the next time a file is reformatted.

**Note:** normalising newlines in the **fixture copy** is safe; do not normalise or rewrite the
**source under test** on disk.

---

## R2-4 — `productEvents.test.ts:429` — the (h2) test still asserts the mock's behaviour, not the handler's

**Symptom**
```
× productEvents.test.ts (30 tests | 1 failed)
  × (h2) a duplicate write is reported as deduplicated when the writer says it inserted nothing
    → at productEvents.test.ts:429:35
```

**Cause.** Round 1 removed the mock's own duplicate check, but the replacement (h2) test drives the
mock to return `{ inserted: false }` and then asserts the handler's response reports
`deduplicated: true`. That asserts only that the handler forwards the writer's flag — it is a
different test than the one the reviewer required, and it leaves the original question open in a new
form. Read the current file and reconcile the (h)/(h2) pair so that:

1. the handler tests assert **what the handler is responsible for** — that it forwards
   `productId` and `externalEventId` to the writer unchanged — and
2. the **database** control is proven by `installIdempotency.test.ts`, not simulated in the handler
   suite.

The point of B2 BLK-B2-1 is that no test may pass because a *mock* implements the control. Whatever
(h2) becomes, it must fail if the handler stops forwarding those two fields, and it must not depend
on the mock performing deduplication.

---

## Hard constraints for this round

- **Do not change production source.** `signerRegistry.ts`, `productEvents.ts`, `db.ts`,
  `drizzle/schema.ts` are all under B2 review and already accepted on substance. This round is
  test-only.
- Do not add a database harness, a new dependency, or a paid service.
- Do not weaken or delete the mutation probes — fix them. A probe that cannot fail is exactly the
  defect class B2 raised.
- Run and report **both**: `npx tsc --noEmit` (expect exit 0) and `npx vitest run` (expect all green,
  including the 29 pre-existing productEvents cases and the 6 control-plane/other suites).
- No secret value may appear in any file, assertion message, or failure output.
