# T3 SCHEMA/MIGRATION DRIFT ADJUDICATION — WSTERA-HOUSE-PRODUCTION-CLOSURE-001

Stage: T3 (shared one-time product fulfillment)
Raised by: T3-WU02A lane (worker flagged both, correctly refused to choose)
Adjudicated by: Hermes (orchestrator), under the locked contract
Recorded: 2026-09-20 (Asia/Bangkok)

## Why Hermes is deciding this and not escalating

The worker classified this as a contract decision outside its authority and did not touch either file
— correct behaviour. Hermes may resolve it because the locked Source of Truth already determines the
answer; this is not an open architecture question, it is an implementation drift against a decided
invariant.

Authority: Production Master Plan `:503-507` requires the capability to "deliver an artifact or
repository grant to a buyer … **record who received which immutable version**, and support revocation
and re-issue", with L4 at `:368` and R13 at `:894`. The schema's own inline contract states the same
invariant. Nothing here requires a new business/security decision.

## Finding 1 — live-grant unique index disagrees between schema and migration

| | Declaration |
|---|---|
| `drizzle/schema.ts:308-310` | `uniqueIndex("fulfillment_records_live_binding_unique").on(table.bindingKey).where(sql`"revokedAt" IS NULL`)` |
| `drizzle/migrations/0007_...sql:134-136` | `CREATE UNIQUE INDEX "fulfillment_records_live_grant_unique" ON fulfillment_records ("grantKey") WHERE "revokedAt" IS NULL` |

Different **name** and different **column** for the same stated invariant. Both `bindingKey`
(`schema.ts:244`) and `grantKey` exist as columns in both files, so neither is a typo for a missing
column — they are two different rules:

- `bindingKey` = derived from **(entitlement + recipient)** — "one live grant per binding"
- `grantKey` = derived from the **(entitlement + recipient + immutable version)** grant identity

### Adjudication

**The schema's `bindingKey` form is the correct invariant; the migration must be changed to match.**

Reasoning, against the locked contract:

1. `:503-507` requires the recipient be bound to an **immutable version**. If the live-grant
   uniqueness were keyed on `grantKey`, a second request naming a *different* `immutableVersion` for
   the same recipient would create a **second simultaneous live grant** for that recipient — exactly
   the failure the invariant exists to prevent. The schema's own comment says this in the same words.
2. `:503-507` also requires **reissue** and **revoke**. Revoke-then-reissue must be able to produce a
   new live grant for the same binding, which is why the index is partial
   (`WHERE "revokedAt" IS NULL`) rather than absolute. That requirement is satisfied by the
   `bindingKey` form and is unaffected by the change.
3. The `(grantKey, generation)` identity is already covered by a separate absolute unique index
   (`fulfillment_records_grant_generation_unique`), which is the correct place for
   "one row per distinct grant generation". Putting a *second* live-only rule on `grantKey` would be
   redundant with that index while leaving the binding rule unenforced.

So the migration must declare:

```sql
CREATE UNIQUE INDEX IF NOT EXISTS fulfillment_records_live_binding_unique
  ON fulfillment_records ("bindingKey")
  WHERE "revokedAt" IS NULL;
```

and the schema declaration stays exactly as it is. The repository's dedup insert must target
`(grantKey, generation)` for attempt idempotency and the `bindingKey` partial index for the
live-binding rule — two controls, two targets.

## Finding 2 — the migration declares four unique indexes the schema does not

Verified by Hermes by enumerating both files:

| Index in migration | In schema? |
|---|---|
| `fulfillment_records_grant_generation_unique` (0007:123) | ✅ `schema.ts:295-298` |
| `fulfillment_records_live_grant_unique` (0007:134) | ❌ (schema has the `liveBindingUnique` variant instead — Finding 1) |
| `fulfillment_recipients_binding_unique` (0007:153) | ❌ **missing from schema** |
| `fulfillment_deliveries_attempt_unique` (0007:187) | ❌ **missing from schema** |
| `fulfillment_deliveries_attempt_key_unique` (0007:190) | ❌ **missing from schema** |
| `fulfillment_lifecycle_operation_unique` (0007:212) | ❌ **missing from schema** |

The schema is the Drizzle source of truth that the runtime's repositories and `onConflictDoNothing`
targets are typed against; the migration is what actually runs. If they disagree, a conflict target
that typechecks against the schema will **not** be backed by a real index in the database, and the
idempotency guarantee silently disappears at runtime.

### Adjudication

**All four missing indexes must be declared in `drizzle/schema.ts`.** They are already the intended
design (the migration is the more complete artifact here), and the contract requires each of them:
recipient binding uniqueness (one recipient per binding), delivery attempt uniqueness (attempt
idempotency under retry), attempt-key uniqueness, and lifecycle-operation uniqueness (revoke/reissue
exactly once).

## Also flagged by the worker — informational, no action needed

`/apps/hub-web/` is ignored by the parent repo's `.gitignore` line 2, so `apps/hub-web` artifacts are
untracked in `saas-product-hub` and cannot be pinned by a parent-repo SHA. Confirmed by Hermes with
`git check-ignore`. This means the T3 AUTO_GATE cannot use a parent-repo SHA for these paths; the
review binding must come from the nested `hub-web` repository, exactly as B2 already did. Recorded so
B3 reads the gate correctly.

## Instruction to the continuation lane

Do not re-litigate any of the above. Apply:

1. migration `0007:134-136` → rename the index to `fulfillment_records_live_binding_unique` and
   change its column from `"grantKey"` to `"bindingKey"` (keep the `WHERE "revokedAt" IS NULL`
   predicate and the `IF NOT EXISTS` form).
2. `drizzle/schema.ts` → add the four missing unique index declarations listed in Finding 2, matching
   the migration's names and columns exactly.
3. Then implement the durable repository, targeting `(grantKey, generation)` for attempt idempotency
   and the `bindingKey` partial index for the live-binding rule.
