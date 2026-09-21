# T2-WU02 — INDEPENDENT READ-ONLY QUALIFICATION: ADDITIVE MIGRATION AND RPC CHANGE

Work unit: `T2-WU02-MIGRATION-RPC-QUALIFICATION`
Correlation id: `wstera-cts-001-t2-wu02-20260921`
Task: `WSTERA-CONTROL-TRUTH-SYNC-001` · Stage: **T2** · Role class: `database_qualification`
Worker profile: `swarm-db` · Model/provider: `deepseek-v4.1-flash:cloud` / `ollama-cloud`

**This is a READ-ONLY qualification. There is NO live apply in this work unit and no database was
contacted.** No `.sql` file was created by this unit, no migration was written, no `db:push` was run,
no `psql`/SQL client/Wrangler/Supabase call was made, and no source or test file was modified. No
secret store was read and no secret value appears in this document.

Design under qualification: **section 5 only** of
`docs/platform/house-long-run/T1-SCOPE-CONTRACT-AND-DEPENDENCY-CLOSURE-2026-09-21.md:165-279`.
This document does not redesign that section, does not widen it, and does not approve it.

---

## 1. Qualification scope and method

### 1.1 What is being qualified

Exactly three proposed statements/objects, and nothing else:

| Design item | Design location | Proposal |
|---|---|---|
| Additive columns | `T1-SCOPE-CONTRACT-AND-DEPENDENCY-CLOSURE-2026-09-21.md:193-195` | `ALTER TABLE public.work_queue_items ADD COLUMN IF NOT EXISTS scope_type varchar(30), ADD COLUMN IF NOT EXISTS scope_key varchar(200);` |
| Additive index | `T1-SCOPE-CONTRACT-AND-DEPENDENCY-CLOSURE-2026-09-21.md:197-198` | `CREATE INDEX IF NOT EXISTS work_queue_scope_idx ON public.work_queue_items (scope_type, scope_key);` |
| Optional backfill | `T1-SCOPE-CONTRACT-AND-DEPENDENCY-CLOSURE-2026-09-21.md:221-227` | `UPDATE public.work_queue_items SET scope_type = 'product' WHERE scope_type IS NULL AND product_code IS NOT NULL AND product_id IS NOT NULL AND identity_state = 'canonical';` |
| Constraint requirement (no SQL given) | `T1-SCOPE-CONTRACT-AND-DEPENDENCY-CLOSURE-2026-09-21.md:206-212` | five-value `scope_type` vocabulary + one row-level consistency constraint |
| RPC change | `T1-SCOPE-CONTRACT-AND-DEPENDENCY-CLOSURE-2026-09-21.md:238-244` | add `p_scope_type text, p_scope_key text` after `p_owner_inbox_description` |
| Privilege re-issue | `T1-SCOPE-CONTRACT-AND-DEPENDENCY-CLOSURE-2026-09-21.md:269-271` | re-issue the full REVOKE/GRANT block "with the new 19-parameter signature" |

Explicitly **out of scope** of this qualification: T1 sections 2, 3, 4, 6, 7, 8 and 9; the T5
poll/ack design; and the T2-WU01 implementation already present in the hub-web worktree working tree.

### 1.2 Inspection root and revision pinning

- Inspection root: `D:/AI-Workspace/runtime/worktrees/hub-web-cts001`
- Pinned revision: `407130718646d13630b9789f68522a521fc74483`
  (`git rev-parse HEAD`, and `git log -1 --format='%H %ad %s' -- drizzle/migrations/` returns the same
  SHA for the migrations directory: `Mon Sep 21 06:45:15 2026 +0700`).
- `git status --porcelain=v1 -- drizzle/ server/control-plane/work-truth-migration.test.ts` returned
  **empty**: the entire `drizzle/` tree and the migration-contract test are at the pinned revision and
  are unmodified. This qualification therefore reads committed migration truth, not a draft.
- The hub-web worktree does contain uncommitted work in six files
  (`server/control-plane/identity.ts`, `identity.test.ts`, `work-event-schema.ts`,
  `work-event-schema.test.ts`, `server/webhooks/agentEvents.ts`, `agentEvents.test.ts`;
  `git diff --stat` = 6 files, 554 insertions, 6 deletions). That work is **T2-WU01**, not the object
  of this qualification. It is read here only where it fixes a value the design leaves undefined
  (see finding F4), and it is never treated as applied database truth.

### 1.3 Files actually read in this unit

Migration files (all in `drizzle/migrations/`, all read in full unless noted):

| File | Lines | sha256 |
|---|---|---|
| `0002_control_plane_schema.sql` | 147 | `4c2a0e17db02df7f26b83d69077a340c9aace5a332fd74f9f62e6da5f9350d84` |
| `0003_work_tracking_truth_pipeline.sql` | 42 | `63ada100c8a05c7eadb96fa6c13d5bda6ae4defd7e2af87594181c25e3b7f086` |
| `0004_add_unmapped_to_work_item_status.sql` | 22 | `fa4b1419ce3344964aa9e231dce385fd38bdbd7444d12aed263f7a67a4bae353` |
| `0005_atomic_work_event_rpc.sql` | 238 | `2f382324bf7da92d9004edc9e99da9844306d0e6813d9d48f10f2fbc61988f75` |
| `0006_canonical_product_id_work_truth.sql` | 289 | `041581565bca5ec4e855067ec7429a5b0919b1cafe9fd96cd77fdfe587d8c047` |
| `0007_shared_one_time_fulfillment.sql` | (header `:1-20`, constraint lines) | `55b27304f266e8d55be3d171ae5e95f661cdc9c6c00946a2a5417ac2e51257cc` |
| `0008_product_installations.sql` | 68 | `4e5fa1ee7b1987b43b26eb31ca90368f6651036798089a53c2af2b60b1f21606` |

Non-migration files read:

| File | Lines | sha256 |
|---|---|---|
| `drizzle/schema.ts` | 478 | `51ef3a53b06300fe42f268caa91d99c67110bd68c85a338ea3a7f30f5fca24ca` |
| `server/control-plane/work-truth-migration.test.ts` | 41 | `06db7ceb425e411819a21da51423a9e3b3505649c14a0274b3e1fecbb1c6f14f` |
| `server/webhooks/agentEvents.ts` (scope/RPC regions) | 378 in test; source regions `:60-110`, `:138-160`, `:180-260` | `17495250249b085f2c460c8429847ba4365792188730beb5ccc946eb720c6c2f` |
| `server/control-plane/identity.ts` (scope regions) | 213 | `9e3017a862742e1e202d7d4ba86a214d70b7512fa09179791f09afcd86566945` |
| `server/control-plane/work-event-schema.ts` (scope regions) | 250 | `908fb277f43f7a21cb2f366e14a0b7589188857f28a3e42275607437a21257ba` |
| `server/control-plane/work-queue-router.ts` (read paths) | `:201-208`, `:249`, `:282-284`, `:389-399` | `5fe325cfed290914dbd28b40ff55c394e5a5d2e3e7c823b53c85fbfe1d3e7a4f` |
| `package.json` (`:6-17` scripts) | — | `66b0a99fc4e4de028cc234c5b15a5f589eae481181a779a6f087f74993d54ea5` |
| `vitest.config.ts` (`:17`) | — | `a0de83b3967226a98302bbb34aa2e1321890dba9ac1d1c8ce8a6b7989af87e44` |
| `server/webhooks/agentEvents.test.ts`, `server/control-plane/identity.test.ts`, `server/fulfillment/fulfillment-controls.test.ts` (grep regions only) | — | not hashed (grep-only) |

All named input files were read successfully. **No named migration file failed to read.**

### 1.4 Exact commands run and their observed results

```
$ cd /d/AI-Workspace/runtime/worktrees/hub-web-cts001
$ git rev-parse HEAD
407130718646d13630b9789f68522a521fc74483                                   # exit 0

$ git status --porcelain=v1 -- drizzle/ server/control-plane/work-truth-migration.test.ts
(no output)                                                                  # exit 0

$ git log -1 --format='%H %ad %s' -- drizzle/migrations/
407130718646d13630b9789f68522a521fc74483 Mon Sep 21 06:45:15 2026 +0700 feat(db): 0008_product_installations ...  # exit 0

$ ls -la drizzle/migrations/
0001..0008 .sql files only; directory mtime Sep 21 15:19                  # exit 0

$ grep -rn "ingest_agent_work_event_atomic" --exclude-dir=node_modules --exclude-dir=.git .
./drizzle/migrations/0005_atomic_work_event_rpc.sql:36,214,220,225,234
./drizzle/migrations/0006_canonical_product_id_work_truth.sql:32,265,271,276,285
./server/webhooks/agentEvents.ts:222
./server/webhooks/agentEvents.test.ts:30
(+ 5 docs/ references)                                                      # exit 0

$ grep -n "GRANT\|REVOKE\|ENABLE ROW LEVEL\|CREATE POLICY" drizzle/migrations/*.sql
0001_rbac_roles.sql:22,30,36,48
0002_control_plane_schema.sql:123,124,125,126,129,130,131,132
0005_atomic_work_event_rpc.sql:214,220,225,234
0006_canonical_product_id_work_truth.sql:265,271,276,285                  # exit 0

$ grep -c "work_queue_items" drizzle/schema.ts
0                                                                           # exit 1

$ grep -rn "DROP FUNCTION\|NOT VALID\|CONCURRENTLY\|CHECK (" drizzle/migrations/*.sql
0001:52  WITH CHECK (true);
0002:129,130,131,132  ... WITH CHECK (true);
0007:113,114,115,193  CONSTRAINT ... CHECK (...)
(no DROP FUNCTION, no NOT VALID, no CONCURRENTLY anywhere)                  # exit 0

$ grep -n "COMMIT\|BEGIN\|dblink\|PRAGMA\|AUTONOMOUS" drizzle/migrations/0006_canonical_product_id_work_truth.sql
64:BEGIN / 99:  BEGIN / 193:      BEGIN
(no COMMIT, no autonomous-transaction construct)                            # exit 0

$ grep -cn "CHECK\|DROP" drizzle/migrations/0006_canonical_product_id_work_truth.sql
0                                                                           # exit 1 (0 matches)

$ find drizzle -type f
drizzle/migrations/0001..0008 .sql; drizzle/schema.ts
(no drizzle/migrations/meta, no __drizzle_migrations journal, no 0009*)     # exit 0

$ sed -n '32,50p' drizzle/migrations/0006...sql | grep -c "^  p_"
17                                                                          # exit 0

$ grep -n "\.from(\|\.select(\|\.eq(\|\.order(\|\.limit(" server/control-plane/work-queue-router.ts
201-204: select("*") from work_queue_items order by created_at desc limit
206-208: optional .eq("status"), .eq("execution_state"), .eq("product_code")
(no filter on scope_type / scope_key)                                       # exit 0
```

### 1.5 Non-claims

Applied-state truth for the WSTERA Control database is **NOT INSPECTED** in this unit and could not
be: no credential was sought, no connection was attempted, and no packet authority exists for one.
Every statement below about the database is a statement about **migration source at revision
`4071307`**, not about an applied schema. A migration file in the repository is not proof that it was
applied. This document asserts no `PRODUCTION_READY`, no `LIVE_PROVEN`, no `OPERATED_STABLE`, and no
PASS of its own; verification belongs to the commander.

---

## 2. Additivity and safety review

### 2.1 Column addition — pass at source level

`drizzle/migrations/0003_work_tracking_truth_pipeline.sql:25-37` establishes the local convention for
adding columns to this table: one `ALTER TABLE` with multiple `ADD COLUMN IF NOT EXISTS` clauses,
every new column nullable (or with a `DEFAULT` when a value is genuinely derivable). The proposed
column statement (`T1…:193-195`) follows that convention exactly. Both new columns are nullable and
neither carries a `NOT NULL DEFAULT`, matching design requirement 5 (`T1…:211-212`). This is correct
and is the right shape: a `DEFAULT` would fabricate a scope for every pre-existing row, and
`NOT NULL` without a default would fail the migration outright on a non-empty table.

`IF NOT EXISTS` makes re-running the statement a no-op, which is the duplicate-tolerance convention
declared in `0008_product_installations.sql:12` (`Every statement is IF NOT EXISTS /
duplicate-tolerant so a re-run is a no-op`). Additive at source level: **confirmed.**

Residual property worth naming (F7): `ADD COLUMN IF NOT EXISTS` tolerates an *existing* column of a
**different type or length**. If an earlier attempt created `scope_type` as `varchar(50)` or `text`,
the re-run reports success while the applied shape is not the one the migration intends, and no
`CHECK` or `varchar(30)` bound would be in force. The same latent property exists today at
`0006_canonical_product_id_work_truth.sql:26-27`. It is a re-run hazard, not a first-apply defect.

### 2.2 Table lock and rewrite cost

Plain `ALTER TABLE … ADD COLUMN` of a nullable column with no default is a catalogue-only change in
PostgreSQL (no table rewrite, no per-row write). `ADD COLUMN … NOT NULL DEFAULT <constant>` is also
metadata-only since PostgreSQL 11, but the design correctly avoids a default anyway for semantic
reasons. `product_code varchar(20)` (`0003:26`) and `product_id varchar(100)` (`0006:27`) are the
precedent. Lock: brief `ACCESS EXCLUSIVE` for the catalogue update, which is the minimum PostgreSQL
allows for DDL and is not avoidable. **Acceptable.**

### 2.3 Index addition

`CREATE INDEX IF NOT EXISTS work_queue_scope_idx` is proposed at `T1…:197-198`. A non-`CONCURRENTLY`
`CREATE INDEX` holds a `SHARE` lock that blocks writes on `work_queue_items` for the duration of the
build. Two qualification points:

1. **No read path requires this index (F6).** The only `work_queue_items` reads are
   `server/control-plane/work-queue-router.ts:201-204` (`select("*") … order by created_at desc limit
   N`) with optional filters on `status`, `execution_state` and `product_code` (`:206-208`), plus
   `:249` (by `id`), `:282-284` (status/execution_state/updated_at, optional product_code) and
   `:389-399` (by `id` + `revision`). **No query filters or orders by `scope_type` or `scope_key`.**
   The index is speculative at this revision and, by the folder's own precedent (`0003:39-42` adds
   indexes only for named query patterns), should be justified or omitted. `work_queue_product_id_idx`
   (`0006:29-30`) is the same shape and was added alongside a concrete read need.
2. `CREATE INDEX CONCURRENTLY` is **not** used anywhere in this migration folder (grep above: zero
   matches), and it cannot run inside a transaction block, so it would change how the whole migration
   is applied. Introducing it here would be a first-of-kind change to the folder's apply procedure.
   Recommendation: keep the plain form if the index is kept, and state the target table's current row
   count in the migration evidence so the lock duration is bounded and reviewable.

### 2.4 Backfill

Designed at `T1…:221-227`. It targets only rows where `product_code IS NOT NULL AND product_id IS NOT
NULL AND identity_state = 'canonical'` and `scope_type IS NULL`. Three observations:

1. Rows matching that predicate are exactly the rows the current RPC was permitted to write: the
   product gate at `0006_canonical_product_id_work_truth.sql:70-78` admits a task only when
   `p_identity_state = 'canonical'` AND `p_product_code IS NOT NULL` AND `v_product_id IS NOT NULL`,
   and both write paths persist those values (`0006:159-160` UPDATE; `0006:205` INSERT). So the
   backfill's predicate tracks the invariant it claims to track. **Consistent.**
2. It is an `UPDATE`, i.e. a data write, and it is therefore **outside** the "ADDITIVE ONLY. No ALTER
   of any existing object" declaration that this folder's migrations use to describe themselves
   (`0008:11`). The design already flags this as an open decision
   (`T1…:233-234`, and Q2 at `T1…:618`), which is the correct disposition — but the migration text
   must state explicitly whether a data `UPDATE` is in or out of its additive claim, or the claim is
   unverifiable by a reviewer.
3. The backfill is written as a separate statement, not nested in the `ALTER TABLE`. That is correct:
   it must be ordered **after** the column exists and **before** any `CHECK` constraint is added, and
   it must be a no-op on re-run (`scope_type IS NULL` predicate on the first line makes it
   idempotent).

### 2.5 Destructive operations — none proposed

The design contains no `DROP TABLE`, `DROP COLUMN`, `DROP TYPE`, `TRUNCATE` or row deletion, and no
`ALTER TYPE … ADD VALUE`. That last omission is deliberate and valuable: `0004_add_unmapped_to_work_item_status.sql:11-17`
documents that a PostgreSQL enum value **cannot be removed** once added, so an enum-based scope
vocabulary would be permanently irreversible. Avoiding it is the correct choice and is reflected in
the rollback strategy in section 8 below.

**Section 2 verdict: additive at source level, with F6 (unjustified index) and F7 (re-run type
tolerance) recorded as findings.**

---

## 3. Constraint and vocabulary review

### 3.1 The vocabulary is fixed and bounded

The locked five values, in the Brief's own order and casing (`T1…:48-52`, from
`BRIEF-WSTERA-CONTROL-TRUTH-SYNC-AND-PRODUCTION-MOCK-REMOVAL-2026-09-21.md:98`):

```
product | house | platform | workflow_infrastructure | shared_runtime
```

Length check against the proposed `varchar(30)` (`T1…:194`): longest value
`workflow_infrastructure` = 23 characters; `shared_runtime` = 14. All five fit. **No truncation risk
for any legal value.**

Layer-boundary check: the parser admits a `scopeType` up to 50 characters
(`server/control-plane/work-event-schema.ts:57` `scopeType: z.string().trim().max(50).optional().nullable()`)
while the column is `varchar(30)` (`T1…:194`). Because the design also requires a DB-level
vocabulary constraint (longest legal value 23), no legal value can ever reach the column with more
than 30 characters, so the mismatch is currently harmless — but the two layers disagree about the
bound and that disagreement is unnecessary. Recorded as **F5 (LOW)**: align `varchar(30)` with the
parser bound or tighten the parser to the vocabulary at parse time. `scope_key` is already aligned:
`varchar(200)` (`T1…:195`) versus `max(200)` (`work-event-schema.ts:58`).

### 3.2 CHECK constraint versus enum type — prefer CHECK

The design requires a DB-level constraint restricted to the five values (`T1…:206-207`) but does not
give the SQL. Both mechanisms are available; they are not equivalent here:

| Mechanism | Evidence | Consequence |
|---|---|---|
| New enum type + column typed to it | `0008:30-40` shows PostgreSQL has no `CREATE TYPE IF NOT EXISTS`, so this folder needs a `DO $$ … EXCEPTION WHEN duplicate_object THEN NULL; END $$;` wrapper to stay re-runnable | Adds a type object; `ALTER TYPE … ADD VALUE` is irreversible (`0004:11-17`) |
| `CHECK (scope_type IS NULL OR scope_type IN (...))` | No `CHECK` constraint exists on `work_queue_items` anywhere today (grep above: the only `CHECK` occurrences in `drizzle/migrations/` are `WITH CHECK` on RLS policies at `0001:52`, `0002:129-132`, and two named constraints on a different table at `0007:113-115`, `:193`) | Constraint is droppable and replaceable without touching data — directly supports the rollback plan in section 8 |

**Recommendation: a named, NULL-tolerant `CHECK` constraint.** Rationale is evidence-backed: the
enum route reintroduces the exact irreversibility `0004:11-17` documents, and the vocabulary is a
contract term (`T1…:59`) that a future revision may need to extend or correct. Name it explicitly
(e.g. a `…_scope_type_check` identifier) so section 8's rollback can drop it by name.

### 3.3 The row-level consistency constraint — required, but unspecified (F3, MEDIUM)

`T1…:208-212` requires that these two storage states be impossible:

- `scope_type = 'product'` with `product_code IS NULL`;
- any non-product `scope_type` with a non-null `product_code` **or** non-null `product_id`.

The design gives **no SQL for this constraint**. Two things must be true of the text that is
eventually written, and neither can be verified from the design as it stands:

1. **It must be NULL-tolerant on `scope_type`.** Legacy rows keep `scope_type IS NULL` by design
   (`T1…:230-234`), and such rows must not be rejected or become unwritable. A constraint written as
   a bare `scope_type IN (…)` or as an unconditional `NOT NULL` would fail the migration on any
   non-empty table or lock out legacy rows.
2. **It must be ordered after the backfill.** If it is added before the backfill, every legacy
   product row is momentarily in the "scope_type NULL" state — which is fine if and only if the
   constraint is NULL-tolerant (see 1). Ordering backfill → constraint keeps the window minimal.

Legacy violating rows are a real possibility, not hypothetical: `0006:133-138` explicitly tolerates a
row with a non-null `product_code` and a **NULL** `product_id` (the second immutability check fires
only when `product_id IS NULL AND product_code IS NOT NULL`), and `0003:26-27` declares `product_code`
nullable with `identity_state NOT NULL DEFAULT 'unresolved'` — so rows reachable by paths other than
the RPC can exist in states the new constraint will inspect. A plain `ADD CONSTRAINT … CHECK` takes
`ACCESS EXCLUSIVE` and validates the whole table; on legacy data that violates it, it **fails and
aborts the migration**. If any such row can exist, the safe sequence is
`ADD CONSTRAINT … CHECK (…) NOT VALID;` followed by `VALIDATE CONSTRAINT` — note that `NOT VALID` is
used **nowhere** in this folder today (grep above: zero matches), so introducing it is a deliberate
first-of-kind choice that must be stated.

### 3.4 `identity_state` is not part of the proposed vocabulary constraint (F4, MEDIUM)

This is the sharpest gap found in section 3. The design under qualification never states which value
is written into `identity_state` for a non-product row, and never proposes a constraint on that
column. Meanwhile:

- `0003_work_tracking_truth_pipeline.sql:27` declares `identity_state varchar(30) NOT NULL DEFAULT
  'unresolved'` — a free-form `varchar` with **no `CHECK` and no enum**, and no constraint was added
  by `0006` (`grep -c "CHECK\|DROP" 0006…` → `0`).
- The applied T2-WU01 work in the same worktree has already introduced a third state value,
  `identity_state = "non_product_scope"`, at `server/control-plane/identity.ts:36`
  (`export type IdentityState = "canonical" | "unresolved" | "non_product_scope";`) and
  `identity.ts:173`, and the handler asserts it reaches the RPC at
  `server/webhooks/agentEvents.test.ts:191` (`expect(rpcArgs.p_identity_state).toBe("non_product_scope")`).
  `"non_product_scope"` is 18 characters, so it fits `varchar(30)`.

Consequences the migration text must therefore settle, none of which are settled by the design:

1. The RPC gate at `0006:71` is `IF p_identity_state IS DISTINCT FROM 'canonical' … THEN RAISE
   'product_identity_invalid'`. The proposed non-product branch (`T1…:252-254`) requires
   `p_identity_state` **not** `canonical`. `'non_product_scope'` satisfies that. **No conflict** —
   but the design should state the required value rather than an inequality, so the RPC and the
   handler cannot drift.
2. `varchar(30)` is the only bound on the value today. The new vocabulary constraint covers
   `scope_type` but not `identity_state`, so a future state name longer than 30 characters would fail
   at the database with `22001 string_data_right_truncation` rather than fail closed in the RPC.
3. `NOT NULL DEFAULT 'unresolved'` at `0003:27` means a `NULL` `p_identity_state` on a task-bearing
   event aborts the INSERT/UPDATE with `23502` before any scope logic runs. That is pre-existing
   behaviour, unchanged by this design, and should be preserved rather than relied upon.

### 3.5 A legacy product row cannot be flipped to non-product scope — a preserved protection

Worth recording explicitly because it is the failure mode the constraint is meant to prevent, and it
is already prevented one layer up. A legacy row with `product_id` set that receives a non-product
event carrying a NULL product identity hits `0006:126-131`:

```
IF v_existing_work.product_id IS NOT NULL AND (
     v_existing_work.product_id IS DISTINCT FROM v_product_id
     OR v_existing_work.product_code IS DISTINCT FROM p_product_code
   ) THEN
  RAISE EXCEPTION 'product_identity_conflict: …'
```

`product_id IS DISTINCT FROM NULL` is `true`, so the mutation aborts. **The design must not weaken
this check and must not reorder it after the new scope checks** (it currently precedes the revision
check at `0006:142`). The design states only that the new immutability rule is additional
(`T1…:260-263`); that is the correct intent and needs to be a hard constraint on the migration text.

**Section 3 verdict: vocabulary is well-chosen and the `CHECK`-over-enum recommendation is
evidence-backed; the row-level constraint and the `identity_state` vocabulary are materially
under-specified (F3, F4).**

---

## 4. RPC signature and privilege review

### 4.1 The real, current privilege block (quoted from 0006)

`drizzle/migrations/0006_canonical_product_id_work_truth.sql:260-288`, read in this unit, verbatim
(statement bodies quoted with their exact lines):

```
260  -- R2-FINAL-2: Executable privilege hardening (NOT commented out).
261  -- These statements MUST execute after the function is created.
262  -- They restrict execution to the Supabase backend service_role only.
263
264  -- Revoke default public execution grant
265  REVOKE EXECUTE ON FUNCTION public.ingest_agent_work_event_atomic(
266    text, text, text, jsonb, jsonb, text, timestamptz, jsonb,
267    text, text, text, text, text, text, boolean, text, text
268  ) FROM PUBLIC;
269
270  -- Explicitly revoke from Supabase anonymous and authenticated roles
271  REVOKE EXECUTE ON FUNCTION public.ingest_agent_work_event_atomic(
272    text, text, text, jsonb, jsonb, text, timestamptz, jsonb,
273    text, text, text, text, text, text, boolean, text, text
274  ) FROM anon;
275
276  REVOKE EXECUTE ON FUNCTION public.ingest_agent_work_event_atomic(
277    text, text, text, jsonb, jsonb, text, timestamptz, jsonb,
278    text, text, text, text, text, text, boolean, text, text
279  ) FROM authenticated;
280
281  -- Grant execution ONLY to the Supabase backend service_role.
282  -- (This is the Postgres role used by the server-side Supabase client.
283   --  It is NOT the same as wstera_owner, which is an application-level
284   --  authorization role checked in TRPC/RBAC middleware.)
285  GRANT EXECUTE ON FUNCTION public.ingest_agent_work_event_atomic(
286    text, text, text, jsonb, jsonb, text, timestamptz, jsonb,
287    text, text, text, text, text, text, boolean, text, text
288  ) TO service_role;
```

The identical block, with the identical 17-type list, exists one migration earlier at
`0005_atomic_work_event_rpc.sql:214-217` (`FROM PUBLIC`), `:220-223` (`FROM anon`), `:225-228`
(`FROM authenticated`) and `:234-237` (`TO service_role`). Each type list contains exactly 17
entries, matching the 17 parameters declared at `0006:33-49` (verified by counting `^  p_` lines in
that range: `17`). `0006:260-262` states the operational rule in the file's own words: *"These
statements MUST execute after the function is created."*

### 4.2 Does a changed signature force a re-issue of the whole block? — Yes, unambiguously

`REVOKE EXECUTE ON FUNCTION` and `GRANT EXECUTE ON FUNCTION` in PostgreSQL are **identity-sensitive**:
the `FUNCTION` reference is resolved by name **plus the argument type list**. The 17-type list at
`0006:266-267` names one specific function. A 19-parameter `ingest_agent_work_event_atomic` is a
**different function object** whose default ACL is untouched by those statements. PostgreSQL's
built-in default for a newly created function grants `EXECUTE` to `PUBLIC`, which is precisely what
`0006:264`'s comment ("Revoke default public execution grant") exists to remove.

Therefore: **a changed signature forces the entire REVOKE/GRANT block to be re-issued with the new
19-type list.** `CREATE OR REPLACE FUNCTION` reissues the ACL only when the identity is the same;
changing the parameter list changes the identity, so the new object arrives with default grants while
the old statements silently continue to govern the old object. Nothing in the design contradicts
this: `T1…:269-271` states it correctly (*"the full REVOKE/GRANT block (`0006:265-288`) is re-issued
with the new 19-parameter signature"*). **The design's intent on this point is correct and is the
single most important requirement in section 5.**

The order of statements is also load-bearing. `CREATE OR REPLACE FUNCTION` must run **before** the
REVOKE/GRANT block: a `REVOKE … ON FUNCTION (…19 types…)` naming a function that does not yet exist
raises `42883 undefined_function`, and whether that aborts the migration or is only logged depends on
the apply harness — an ambiguity the migration must not leave open.

### 4.3 Overloaded / partially revoked function — the concrete risk (F1, HIGH)

The design says at `T1…:248` that the function's product gate is *"Replace[d]"*, and at
`T1…:238` that it *"gains two parameters, additively"*. Those two statements describe **different
mechanisms**, and the mechanism PostgreSQL will actually use is the second one: an added parameter
list produces an **overload**, not a replacement. After the proposed migration is applied, two
functions would coexist:

| Function | ACL after the proposed migration | Behaviour |
|---|---|---|
| `ingest_agent_work_event_atomic(<17 types>)` from `0006:32-49` | Unchanged — still `service_role`-only by `0006:265-288` | **No scope enforcement.** Writes `work_queue_items` rows with `scope_type`/`scope_key` left NULL |
| `ingest_agent_work_event_atomic(<19 types>)` proposed | Whatever the new block sets | Enforces the three-way scope gate |

Three distinct failure modes follow, all of them real:

1. **Contract bypass (the serious one).** A caller that posts the 17-argument shape still resolves to
   the old function, which has no scope gate at all. The Brief's rule that *"no new ambiguous
   unscoped task may be accepted"* (`T1…:44`) and the design's own fail-closed requirement
   (`T1…:255-257`) are then bypassable by any client that has not moved to the new arity — including
   a stale deployed Worker revision, since PostgREST resolves the RPC by name and argument set. A row
   created this way carries `scope_type IS NULL` and satisfies the "unresolved/legacy" predicate the
   design reserves for pre-migration rows (`T1…:230-232`), so the bypass is **indistinguishable in
   storage from legitimate legacy data**.
2. **Privilege gap if the block is not re-issued.** If the migration creates the 19-parameter function
   and omits or mistypes the REVOKE/GRANT block, the new function keeps its default `PUBLIC` execute
   grant, and `anon`/`authenticated` can call it — a direct privilege regression against the
   `service_role`-only posture asserted at `0006:260-262` and implemented at `0006:265-288`.
3. **Partial revocation.** If only some of the four statements are re-issued with the 19-type list
   (e.g. `FROM PUBLIC` updated but `FROM anon` left at 17 types), the result is a function that is
   revoked from `PUBLIC` but still reachable by `anon`/`authenticated`, or vice versa. The block is
   all-or-nothing; it must be re-issued as a unit.

**Mitigation the migration text must carry.** Either (a) retire the superseded overload explicitly
with `DROP FUNCTION IF EXISTS public.ingest_agent_work_event_atomic(<17-type list>);` after the new
function exists and its grants are in place, or (b) keep the overload deliberately and state, with
evidence, why a 17-argument caller cannot reach the Control database. Option (a) is safe from a
dependency standpoint at this revision: no database object references the function — the repository-wide
grep above finds the name only in the two migration files, one handler (`agentEvents.ts:222`), one
test (`agentEvents.test.ts:30`) and documentation, and no view, trigger or default expression
references it. The `DROP` must be ordered **after** the new function is created and granted and (see
section 8) after the client deploy, or a still-17-arity caller gets `42883 undefined_function`.

### 4.4 `SECURITY DEFINER`, `search_path` and return shape

The design preserves `SECURITY DEFINER` with `SET search_path = pg_catalog, public`
(`T1…:269-270`, matching `0006:52-53`), and preserves the success return shape
(`T1…:272-273`, matching `0006:93`, `:113`, `:256`). Both are correct and must not be "improved" while
the signature is being touched: `SET search_path` is what makes the `SECURITY DEFINER` elevation safe.

### 4.5 Error-tag naming is unspecified in the design (F2, MEDIUM)

`T1…:256-257` requires the fail-closed branch to `RAISE EXCEPTION` *"with a new non-retryable tag"*
without naming it. The handler maps RPC errors by **substring match** on the message text
(`server/webhooks/agentEvents.ts:69-85`), and the applied T2-WU01 work already expects two specific
tags at `agentEvents.ts:90-91`:

```
90      message.includes("scope_identity_invalid") ||
91      message.includes("scope_identity_conflict")
```

Consequences:

1. The RPC's emitted tag string and the handler's matched substring must be written to match
   **exactly**. If the RPC raises a tag the handler does not know, the failure falls through to the
   500 branch at `agentEvents.ts:96-101` — a retryable persistence failure instead of a non-retryable
   422, which is a fail-open outcome for an integrity violation.
2. Substring matching means one tag must not be a substring of another in a way that mis-routes an
   unrelated error. `scope_identity_invalid` / `scope_identity_conflict` do not collide with the
   existing `product_identity_invalid` / `product_identity_conflict` branches at
   `agentEvents.ts:83-84`, and `scope_identity_conflict` is not a superstring of any of them — so the
   applied choice is safe. The **design** names no tag at all, which is why this must be pinned in the
   migration text and asserted by a test rather than left to implementation drift.
3. The product-branch tags must not be renamed. `0006:76` and `0006:130`/`:136` emit
   `product_identity_invalid` and `product_identity_conflict`, both asserted by the existing contract
   test at `work-truth-migration.test.ts:21`, and the design leaves the product gate unchanged.

**Section 4 verdict: the design correctly identifies that the full REVOKE/GRANT block must be
re-issued with the new arity — that requirement is mandatory and this qualification confirms it. The
material gap is that the design describes a replacement while PostgreSQL will create an overload, so
the superseded 17-argument function survives as an un-scoped write path (F1, HIGH).**

---

## 5. RLS and least-privilege effect

### 5.1 What the design changes about RLS

Nothing. The design adds two nullable columns, one index, one optional backfill and an additive RPC
signature. It proposes no `ALTER TABLE … ENABLE/DISABLE ROW LEVEL SECURITY`, no `CREATE POLICY`, no
`DROP POLICY` and no `ALTER POLICY`. **RLS effect of the design: none.** That is the correct
disposition and it matches this folder's own safety convention, which `0008:11` states as
`no grants, no RLS change`.

### 5.2 The RLS posture the new columns inherit

Read from source, not assumed:

| Object | Evidence | Posture |
|---|---|---|
| `work_queue_items` RLS | `0002_control_plane_schema.sql:123` `ALTER TABLE work_queue_items ENABLE ROW LEVEL SECURITY;` | Enabled |
| Policy | `0002:129` `CREATE POLICY wq_service_all ON work_queue_items FOR ALL TO service_role USING (true) WITH CHECK (true);` | One policy, `service_role` only, `FOR ALL` |
| `anon` / `authenticated` | Absent from `0002:123-132` entirely | **No policy at all** on `work_queue_items` |
| `owner_inbox_items` RLS | `0002:124`, policy `0002:130` | Same pattern |
| `agent_activity_events` RLS | `0002:126`, policy `0002:132` | Same pattern |
| `portfolio_gates` RLS | `0002:125`, policy `0002:131` | Same pattern |

With row-level security enabled and no policy granting `anon` or `authenticated`, those roles see zero
rows of `work_queue_items` regardless of which columns exist. Adding columns therefore cannot widen
row visibility. **Least-privilege effect on the read path: neutral.**

### 5.3 Two honest limits on this section

1. **Column privileges vs table privileges.** PostgreSQL grants a new column no privileges of its own;
   a holder of a table-level privilege automatically covers new columns. Critically, **no
   `GRANT SELECT/INSERT/UPDATE ON work_queue_items` to any role appears anywhere in
   `drizzle/migrations/`** — the grep in section 1.4 lists only `ENABLE ROW LEVEL SECURITY`, the four
   policy statements, and the function-level REVOKE/GRANT block. Table-level privileges therefore come
   from the Supabase project's defaults or from out-of-band grants, **neither of which is visible in
   repository source.** Whether the applied database's `service_role` holds the table privileges the
   policy assumes, and whether any other role holds a table-level grant that the RLS policy then
   constrains, is an **applied-state question that is NOT INSPECTED** in this work unit and cannot be
   answered from `4071307`. A reviewer must not read "no RLS change" as "the ACL is proven correct".
2. **Columns are not the attack surface; the function is.** The only privilege statement the design
   does touch is the function ACL (`T1…:269-271`), and that is where the real least-privilege risk
   sits — see section 4.3. The column-level analysis above is secondary to it.

**Section 5 verdict: no RLS or policy effect from the design at source level; the columns inherit a
`service_role`-only posture on `work_queue_items` (`0002:123,129`). The applied table-level ACL is not
inspectable here and must be verified at T6.**

---

## 6. Idempotency, revision and atomicity effect

The design asserts at `T1…:264-266` that the revision rule, idempotency and event-id/payload conflict
detection are untouched. This section tests that assertion against the four mechanisms separately.

### 6.1 Exact revision N→N+1 — untouched

Mechanism in the real file, `0006_canonical_product_id_work_truth.sql:140-145`:

```
140      -- Exact revision contract: an existing task at N accepts only N + 1.
141      -- Skipped or stale revisions abort the entire transaction.
142      IF v_incoming_rev <> v_existing_work.revision + 1 THEN
143        RAISE EXCEPTION 'revision_conflict: current=% incoming=% expected=%',
144          v_existing_work.revision, v_incoming_rev, v_existing_work.revision + 1;
145      END IF;
```

with the new-task half at `0006:186-189` (`IF v_incoming_rev <> 1 THEN … 'revision_conflict: new
task incoming=% expected=1'`), and the compare-and-swap enforcement at `0006:176` (`WHERE id =
v_existing_work.id AND revision = v_existing_work.revision;`) plus the lost-race check at
`0006:178-182` (`GET DIAGNOSTICS v_updated_count = ROW_COUNT; IF v_updated_count = 0 THEN … 'concurrency_conflict'
…'`). `v_incoming_rev` is derived once at `0006:66` (`v_incoming_rev := (p_task->>'revision')::int;`).

The design touches none of these statements: `T1…:264-265` says the revision rule "and the concurrency
CAS (`0006:176-182`) are untouched", and the proposed changes are limited to the scope gate, the two
write statements' column lists, and the immutability check. The `revision` predicate is positional
inside the `UPDATE`'s `WHERE` and is not a column-list member, so adding two `SET` targets cannot
disturb it. **Confirmation: the N→N+1 rule and the CAS are structurally insulated from this change.**
One constraint the migration text must honour: the new scope-immutability checks must be inserted
**before** the revision check at `:142`, preserving the existing order (identity conflicts at
`:126-138` are reported ahead of revision conflicts). Reordering would change observable error
outcomes.

### 6.2 Event-id idempotency — untouched

`0006:80-94`. The read at `:85-87` (`SELECT event_id, processed_at, payload INTO v_existing_event
FROM public.agent_activity_events WHERE event_id = p_event_id;`) is backed by the unique constraint
declared at `0002_control_plane_schema.sql:102` (`event_id varchar(255) UNIQUE NOT NULL,   --
idempotency key`). On a hit with an identical payload, `:93` returns
`jsonb_build_object('ok', true, 'deduplicated', true)`. The concurrent-replay path is the inner
`EXCEPTION WHEN unique_violation` block at `:99-114`, which re-reads and returns the same
deduplicated shape at `:113`.

The design adds no statement to this region and no new early return. The scope gate proposed at
`T1…:248-257` executes **before** the idempotency read (it replaces the block at `0006:70-78`, which
is above `:85`), so a duplicate event with a valid scope still short-circuits at `:93`. **Confirmation:
event-id idempotency is untouched.** Note the ordering consequence the design must state: because the
scope gate sits above the idempotency read, a **retransmission** of an already-processed event that
carries a now-invalid scope would abort with the new scope error instead of returning the
`deduplicated: true` response. That is a behaviour worth an explicit decision in the migration text,
not an accident.

### 6.3 Event-id/payload conflict detection — untouched

`0006:89-94`, first branch:

```
89   IF v_existing_event.event_id IS NOT NULL THEN
90     IF v_existing_event.payload IS DISTINCT FROM p_payload THEN
91       RAISE EXCEPTION 'event_id_payload_conflict: event_id=%', p_event_id;
92     END IF;
93     RETURN jsonb_build_object('ok', true, 'deduplicated', true);
94   END IF;
```

and the same comparison repeated inside the `unique_violation` handler at `:110-112`. The contract is
stated in the file at `:81-84`: *"Reuse of an event_id with different canonical payload is a
non-retryable integrity conflict, not a successful deduplication."* The design does not modify
`:89-94` or `:106-113`, does not change the comparison operand (`p_payload`), and does not add a
`RETURN … 'error' …` shape — the existing contract test pins the last of those at
`work-truth-migration.test.ts:29` (`expect(sql).not.toContain("RETURN jsonb_build_object('error'")`).

One interaction the migration text must respect: the design's `T1…:149` adds scope data to the stored
envelope (`agentEvents.ts:211-215` in the applied work nests `workScope` inside the payload that is
passed as `p_payload`). That **changes what `p_payload` contains**, which changes the byte-comparison
surface at `:90`. Two events with the same `event_id` whose only difference is the `workScope`
sub-object will now be a conflict where previously the scope fields were absent from the payload
entirely. This is a **consequence of WU01's payload change, not of the migration**, and it is
consistent with the file's stated contract (a changed logical payload must allocate a new `event_id`)
— but it must be stated, because it means the deployed sender's retry behaviour is now
payload-sensitive in a new way. Recorded as **F8 (LOW)**.

### 6.4 Single-transaction atomicity — untouched

The whole body is one `LANGUAGE plpgsql` function (`0006:50-51`) with a single `BEGIN` at `:64`, one
`RETURN` on each terminal path (`:93`, `:113`, `:256`), and `RAISE EXCEPTION` for every failure. The
only `COMMIT`/autonomous-transaction constructs in the file are absent: grep for
`COMMIT|BEGIN|dblink|PRAGMA|AUTONOMOUS` returns exactly `64:BEGIN`, `99:  BEGIN`, `193:      BEGIN` —
the latter two being exception-block openers, not transaction boundaries. Every durable effect — the
audit insert at `:100-105`, the `work_queue_items` `UPDATE`/`INSERT` at `:152-176`/`:193-223` and the
Owner Inbox insert at `:236-249` — commits or rolls back with the caller's transaction.

The design adds two parameters and (proposed) two `SET` targets; it adds no new transaction boundary,
no second function call, and no side effect outside this function. Adding `scope_type = p_scope_type,
scope_key = p_scope_key` to the `SET` list and the `INSERT` column list **cannot** create partial
atomicity, because both statements are already inside the one function body. **Confirmation: single-
transaction atomicity is untouched by the design.**

Ordering constraint the design must preserve: the new scope checks must not be placed after the audit
insert at `:100-105`. The audit insert is deliberately early so that a later abort rolls it back; a
check placed after it would still be atomic, but it would make a rejected event consume a
`unique_violation` retry path before failing — wasteful and harder to reason about. Keep all gates
above `:85`.

**Section 6 verdict: all four invariants — revision N→N+1, event-id idempotency, event-id/payload
conflict detection and single-transaction atomicity — are confirmed untouched by the design, subject
to the ordering constraints stated above (gates above `0006:85`; scope immutability before `0006:142`)
and to the two behaviour notes recorded as F8.**

---

## 7. Owner Inbox effect identity

### 7.1 Mechanism as it exists

Effect identity is `owner_inbox_items.source_event_id`, established in two migrations:

- `0005_atomic_work_event_rpc.sql:27-28` adds the column:
  `ALTER TABLE public.owner_inbox_items ADD COLUMN IF NOT EXISTS source_event_id text;`
  (the base table at `0002:51-65` has no such column).
- `0005:30-34` creates the enforcement:
  `CREATE UNIQUE INDEX IF NOT EXISTS uq_owner_inbox_source_event_id ON public.owner_inbox_items
  (source_event_id) WHERE source_event_id IS NOT NULL;` — the partial predicate excludes legacy rows
  with a NULL `source_event_id` from uniqueness enforcement.

The RPC-side logic is `0006:226-253`, reached from within the `IF v_task_id IS NOT NULL` block opened
at `:117` and closed at `:254`:

```
229    IF p_execution_state = 'waiting_owner' OR p_trigger_owner_inbox = true THEN
231      SELECT id INTO v_existing_inbox_id
232      FROM public.owner_inbox_items
233      WHERE source_event_id = p_event_id;
235      IF v_existing_inbox_id IS NULL THEN
```

with the insert at `:236-249` supplying `p_event_id` directly as the `source_event_id` value, and the
comment at `:227-228` stating the contract: *"Uses immutable source_event_id for effect identity.
Deduplication is by source_event_id (unique index), NOT by status."* The check spans **any** status —
`0006:251-252` confirms: *"If v_existing_inbox_id IS NOT NULL, the inbox effect already exists
(regardless of its current status)."* Note also that `owner_inbox_items.status` may legitimately move
to `decided`/`acknowledged` (`0002:46-48` enumerates the enum; `owner-inbox-router.ts` performs those
transitions), which is exactly why the dedup key must be the immutable event id and not the status.

### 7.2 Effect of the design on this mechanism: none — confirmed

The design touches this region in no way. `T1…:267-268` states it as a preserve-requirement, and the
proposed changes are confined to: the scope gate (replacing `0006:70-78`), two column lists in the
`UPDATE` at `:152-176` and the `INSERT` at `:194-210`, and the immutability region at `:126-138`. None
of those is in `:226-253`, and none of them alters `v_work_id`, `p_event_id`, `p_execution_state` or
`p_trigger_owner_inbox` — the four inputs the inbox block reads.

**Confirmation: one Owner Inbox effect per source event id is preserved.** Specifically:

- The gate at `:229` is conditioned on `p_execution_state` and `p_trigger_owner_inbox`, **not** on
  scope. A task with non-product scope therefore reaches the inbox block exactly as a product task
  does. That matters for the manifest's T6 live-proof item *"Owner hold produces one Inbox item"*
  (`RUN-MANIFEST-WSTERA-CONTROL-TRUTH-SYNC-001.md:214`), and for the T2 required case *"Owner Inbox
  effect remains idempotent"* (`:127`).
- The uniqueness guarantee is enforced twice, and both enforcement points survive: the explicit
  `SELECT` guard at `:231-233` (application-level, any status) and the unique partial index at
  `0005:32-34` (database-level, the backstop on a concurrent insert).
- The effect is created inside the same function body as the work projection, so a scope rejection
  anywhere above `:254` rolls the inbox effect back with everything else. There is no path in the
  design that can create an inbox effect and then abort.
- `work_queue_item_id` (`0002:58`, `REFERENCES work_queue_items(id) ON DELETE SET NULL`) is populated
  from `v_work_id` at `0006:245`, which the design does not change.

### 7.3 One thing the design must not do

The design must **not** extend scope-immutability or scope-validity checks to the inbox block, and
must not add any new `owner_inbox_items` column. Effect identity is keyed on the event id alone; a
scope-aware secondary key would create a second identity for the same effect and break the "one effect
per source event id" guarantee. `T1…:267-268` correctly says the mechanism is untouched; that
statement should also be a prohibition on the migration text, not merely a description.

**Section 7 verdict: one Owner Inbox effect per source event id is confirmed preserved, on the
strength of `0005:27-34` and `0006:226-253`, neither of which the design modifies.**

---

## 8. Rollback and forward-fix plan

This plan is written to **assume no irreversible operation**. Every step is either data-preserving or
explicitly identified as optional and lossy, with the lossy variant rejected.

### 8.1 Object inventory and reversibility

| Object the design creates | Reversible? | How |
|---|---|---|
| `work_queue_items.scope_type`, `scope_key` columns | Yes, data-preserving to keep | Keep them on rollback; nullable and unread by reverted code |
| `work_queue_scope_idx` index | Yes | `DROP INDEX IF EXISTS work_queue_scope_idx;` — no data effect |
| Scope vocabulary + consistency `CHECK` constraint(s) | Yes, if named and if `CHECK` (not enum) | `ALTER TABLE public.work_queue_items DROP CONSTRAINT IF EXISTS <name>;` — no data effect |
| New 19-parameter function overload | Yes | `DROP FUNCTION IF EXISTS public.ingest_agent_work_event_atomic(<19-type list>);` |
| Backfill `UPDATE` | **Not reversible** (the pre-state was NULL, which is recoverable only by another `UPDATE` that would also wipe legitimate post-migration values) | Do not attempt to reverse; see 8.3 |

**No irreversible operation is required by this rollback.** In particular: no `DROP COLUMN` is needed,
no `DROP TABLE` is proposed anywhere in the design, and no `ALTER TYPE … ADD VALUE` is proposed — which
is the one migration pattern in this folder that genuinely cannot be undone, as
`0004_add_unmapped_to_work_item_status.sql:11-17` documents in its own header
(*"PostgreSQL DOES NOT support `ALTER TYPE … DROP VALUE`. Enum values cannot be removed once added."*).
Choosing a named `CHECK` over an enum (section 3.2) is what keeps the rollback surface non-lossy.

### 8.2 Rollback — the recommended minimal form

Rollback is **three statement groups and no data loss**, in this order:

```
1) DROP FUNCTION IF EXISTS public.ingest_agent_work_event_atomic(
     text, text, text, jsonb, jsonb, text, timestamptz, jsonb,
     text, text, text, text, text, text, boolean, text, text, text, text);
2) ALTER TABLE public.work_queue_items DROP CONSTRAINT IF EXISTS <scope_check_name>;
3) DROP INDEX IF EXISTS public.work_queue_scope_idx;
```

The columns are **deliberately retained** in the rollback. They are nullable, they are read by nobody
once the function and the client are reverted, and retaining them makes a forward re-apply a no-op
rather than a re-derivation. Dropping them is optional and lossy (it discards every backfilled value
and every scope written since apply); it should not be part of the default rollback.

Ordering constraint on the rollback of the function (see 8.4): the `DROP` in step 1 removes the
19-argument entry point. A client that still sends 19 arguments then receives `42883
undefined_function`. The current client sends 19 arguments — `server/webhooks/agentEvents.ts:242-243`
passes `p_scope_type` and `p_scope_key` — so **a database rollback of the function must be paired with
a Worker rollback to the prior revision, in the same change window.** Rolling back the function alone
breaks ingestion.

Note the deliberate asymmetry: if the superseded 17-argument overload was **kept** (option (b) of
section 4.3), the function rollback is unnecessary — a client reverting to the 17-argument shape keeps
working against the retained overload. That is the strongest argument for keeping the overload during
the transition and retiring it in a later, separately reviewed migration.

### 8.3 Forward-fix

The design is re-runnable by construction: `ADD COLUMN IF NOT EXISTS`, `CREATE INDEX IF NOT EXISTS`
and a `WHERE scope_type IS NULL` backfill are all no-ops on a second run, matching the declared
convention at `0008:12`. That makes forward-fix cheap and it means a defect found after apply does not
require a reversal.

The highest-risk defect identified by this qualification (section 4.3) has a **standalone,
idempotent, non-destructive forward-fix**: if the 19-parameter function ends up with default `PUBLIC`
grants, or with a partially re-issued block, the correction is to run the four REVOKE/GRANT statements
with the correct 19-type list against the already-created function. No `ALTER`, no re-creation, no
data movement. This is the whole reason the privilege block must be re-issued as a unit: a partial
re-issue is fixable in seconds by re-running the block, whereas a *missing* re-issue is a live
privilege exposure until someone notices.

Forward-fix sequence if the new function must be corrected without downtime:

```
1) CREATE OR REPLACE FUNCTION public.ingest_agent_work_event_atomic(<19 params>) … ;   -- corrected body
2) REVOKE EXECUTE … (<19 types>) FROM PUBLIC;
3) REVOKE EXECUTE … (<19 types>) FROM anon;
4) REVOKE EXECUTE … (<19 types>) FROM authenticated;
5) GRANT  EXECUTE … (<19 types>) TO service_role;
```

`CREATE OR REPLACE` on the same identity preserves the ACL, so this sequence is safe to re-run; steps
2-5 are idempotent and must be re-run anyway if step 1 changed nothing but step 2-5 were the defect.

### 8.4 Deploy/apply ordering (the one thing most likely to be got wrong)

Because the signature change is an overload rather than a replacement, the safe ordering is:

1. Apply the additive schema migration (columns, index, optional backfill, named `CHECK`).
2. Create the 19-parameter function; immediately re-issue the full REVOKE/GRANT block with the
   19-type list (never split across steps; never before the `CREATE`).
3. Deploy the Worker revision that sends the 19 arguments.
4. *Only then*, in a later reviewed change, `DROP FUNCTION` the superseded 17-argument overload.

Reversing steps 3 and 4 (dropping the old overload before the new Worker is live) produces a window in
which every ingestion call raises `42883 undefined_function`. This ordering constraint must be stated
in the migration file and in the T6 apply procedure; it is currently absent from the design
(`T1…:238-273` describes the change but not its apply ordering relative to the client deploy).

### 8.5 Validation-before-commit, without a live database

Nothing in this work unit contacted a database, so this is a **recommendation for the apply step, not a
performed check**: the folder's own precedent for a first-of-kind DDL change is a rolled-back
transaction dry run. `0008_product_installations.sql:9-10` records exactly that —
*"dry-run verified in a rolled-back transaction (BEGIN -> DDL -> assertions -> ROLLBACK) before
applying."* The same pattern (`BEGIN; <DDL>; <assertions>; ROLLBACK;`) is the appropriate pre-apply
proof for the constraint, which is the only proposed object that can fail against existing data.

**Section 8 verdict: a rollback and forward-fix strategy exists that assumes no irreversible
operation — the columns are retained rather than dropped, the vocabulary is a droppable `CHECK` rather
than an un-droppable enum value, the function can be dropped and re-created, and every correcting
statement is idempotent. The strategy's one hard constraint is apply/deploy ordering (§8.4).**

---

## 9. Migration-contract test impact

### 9.1 What the existing contract test actually does

`server/control-plane/work-truth-migration.test.ts` (41 lines, sha256
`06db7ceb425e411819a21da51423a9e3b3505649c14a0274b3e1fecbb1c6f14f`) reads exactly one file, by a
hard-coded path resolved at `:5-8`:

```
5  const migrationPath = path.resolve(
6    process.cwd(),
7    "drizzle/migrations/0006_canonical_product_id_work_truth.sql",
8  );
```

`migrationSql()` at `:10-12` does a single `fs.readFileSync(migrationPath, "utf8")`, and all three
tests assert with `toContain` against that one string:

| Test | Lines | Assertions |
|---|---|---|
| `persists immutable product_id on both UPDATE and INSERT paths` | `:15-22` | `:17` `ADD COLUMN IF NOT EXISTS product_id varchar(100)`; `:18` `product_id = v_product_id`; `:19` `product_code, product_id, identity_state`; `:20` `p_product_code, v_product_id, p_identity_state`; `:21` `product_identity_conflict` |
| `keeps replay integrity strict and maps new-task races explicitly` | `:24-30` | `:26` `event_id_payload_conflict`; `:27` `EXCEPTION WHEN unique_violation THEN`; `:28` `concurrency_conflict: task was created concurrently`; `:29` negative assertion `not.toContain("RETURN jsonb_build_object('error'")` |
| `keeps SECURITY DEFINER fail-closed` | `:32-40` | `:34` `SECURITY DEFINER`; `:35` `SET search_path = pg_catalog, public`; `:36` `) FROM PUBLIC;`; `:37` `) FROM anon;`; `:38` `) FROM authenticated;`; `:39` `) TO service_role;` |

The test is registered with vitest (`vitest.config.ts:17` includes `server/**/*.test.ts`). Grep for
`drizzle/migrations` across `server/` shows this file is the **only** control-plane test that reads a
migration; `server/fulfillment/fulfillment-controls.test.ts` reads `0007` for a different subsystem and
is unaffected.

### 9.2 Impact of the design on the existing test — the test will keep passing, and that is the problem

Impact on each existing assertion:

- `:17-21` (product-identity contract) — the design leaves the product path unchanged, so these hold.
- `:26-29` (replay integrity) — unchanged region (`0006:80-114`); these hold.
- `:34-35` (`SECURITY DEFINER`, `search_path`) — preserved by `T1…:269`; these hold.
- `:36-39` (privilege suffixes) — **these will still pass even if the privilege block is wrong.**

That last point is the finding. `:36-39` assert only the **suffix text** of the four statements
(`") FROM PUBLIC;"`, `") FROM anon;"`, `") FROM authenticated;"`, `") TO service_role;"`). Those
suffixes are identical for a 17-type list and a 19-type list. So:

- A migration that re-issues the block with the **wrong arity** passes the suite.
- A migration that **omits** the block entirely for the new function still passes, because the test
  only ever reads `0006` (`:5-8`) — the file containing the *old* block.
- A migration that introduces an entirely new file (the proposed
  `0009_work_scope_identity.sql`, `T1…:189`) is **read by no test at all**.

**The existing migration-contract test therefore provides false-negative coverage for exactly the
control this qualification flags as highest-risk (section 4.3). Recorded as F9 (MEDIUM).**

### 9.3 Required test additions for the new migration

The design says new assertions "must cover" the additive columns, the five-value constraint and the new
RPC parameters (`T1…:315`). This qualification sharpens that requirement:

1. `migrationPath` must be **added to**, not replaced — keep the `0006` contract pinned and add a second
   path constant for the new migration. Replacing `:5-8` would silently delete the only regression
   guard on the existing product-identity contract.
2. The privilege test must assert the **full statement**, not the suffix — specifically the complete
   19-entry type list on all four REVOKE/GRANT statements — and must assert that the four statements
   are present for the **new** arity. A suffix-only assertion is what allowed this gap to exist.
3. Assert the presence of an explicit `DROP FUNCTION IF EXISTS … (<17 types>)` **or** an explicit
   documented decision to retain the overload. Either outcome is acceptable; silence is not, because
   silence is the un-scoped write path described in section 4.3.
4. Assert the vocabulary constraint text contains all five locked values and tolerates `NULL`
   (section 3.3 item 1).
5. Assert the scope error tag string the RPC raises equals the substring the handler matches at
   `server/webhooks/agentEvents.ts:90-91` (section 4.5). This is a cross-file contract that no current
   test pins.
6. Assert every proposed statement is re-runnable (`IF NOT EXISTS` / `IS NULL` guard), matching
   `0008:12`.

**Section 9 verdict: the existing contract test is unaffected in the sense that it keeps passing, but
it cannot detect the arity defect this qualification flags (F9). New assertions must pin the full
19-type privilege statements and must not replace the existing `0006` pin.**

---

## 10. Findings, risks and qualification verdict

### 10.1 Verdict

**Verdict: `QUALIFIED_WITH_FINDINGS`**

Bounded meaning of this verdict: the additive migration and RPC **design intent** at
`T1-SCOPE-CONTRACT-AND-DEPENDENCY-CLOSURE-2026-09-21.md:165-279` is sound and additive at source level
at revision `4071307`, the four preserved invariants (revision N→N+1, event-id idempotency,
event-id/payload conflict detection, single-transaction atomicity) and the Owner Inbox effect identity
are confirmed untouched, and a non-lossy rollback/forward-fix strategy exists. The design is **not**
qualified as a migration file ready to write: findings F1, F2, F3, F4, F9 and F10 are conditions that
must be closed in the migration text and its contract test first. F1 is the blocking-class finding and
is the reason this is not `QUALIFIED_NO_BLOCKING_FINDING`.

This verdict does not authorise any migration, any apply, any deploy, or any database contact. It is
not a PASS of the stage and does not approve the design.

### 10.2 Findings, each with severity and the supporting file and line

| # | Severity | Finding | Supporting file and line |
|---|---|---|---|
| **F1** | **HIGH** | The signature change creates an **overload**, not a replacement. `CREATE OR REPLACE FUNCTION` with an added parameter list leaves `ingest_agent_work_event_atomic(<17 types>)` in place with its `service_role` grant intact and **no scope gate**, so the new fail-closed scope contract is bypassable by any 17-argument caller, and such bypass rows land with `scope_type IS NULL` — indistinguishable from legitimate legacy rows. The design describes a replacement (`T1…:248`) while proposing an addition (`T1…:238`). The migration must either `DROP FUNCTION IF EXISTS` the superseded 17-type signature (after the new function is created and granted, and after the client deploy) or explicitly justify retaining it. No database object references the function, so the `DROP` is dependency-safe. | `0006_canonical_product_id_work_truth.sql:32-49` (17-parameter declaration); `0006…:265-288` (the block that grants the old overload to `service_role`); `T1-SCOPE-CONTRACT-AND-DEPENDENCY-CLOSURE-2026-09-21.md:238`, `:248`, `:255-257` |
| **F2** | **MEDIUM** | The design requires a new non-retryable scope error tag but **names no tag** (`T1…:256-257`). The handler routes RPC errors by substring match, so an unnamed tag that the handler does not recognise falls through to the retryable 500 branch instead of a non-retryable 422 — a fail-open outcome for an integrity violation. The applied WU01 work already expects `scope_identity_invalid` / `scope_identity_conflict`. The RPC tag string must be pinned and asserted by a test. | `server/webhooks/agentEvents.ts:69-85` (substring dispatch), `:90-91` (the two tags the handler matches), `:96-101` (the 500 fallthrough); `T1…:256-257` |
| **F3** | **MEDIUM** | The row-level consistency constraint required by the design is **never given as SQL**. It must be NULL-tolerant on `scope_type` (legacy rows keep NULL by design) and must be ordered after the backfill. A plain `ADD CONSTRAINT … CHECK` takes `ACCESS EXCLUSIVE` and scans the whole table; if any existing row violates it the migration **fails and aborts**. Legacy rows with `product_code` set and `product_id` NULL are explicitly tolerated by the current RPC, so they can exist. If any such row can violate, `NOT VALID` + `VALIDATE CONSTRAINT` is the safe sequence — a pattern used nowhere in this folder today. | `T1…:208-212` (the requirement, no SQL); `0006…:133-138` (code-without-id legacy rows tolerated); `0003_work_tracking_truth_pipeline.sql:26-27` (nullable `product_code`); grep result: zero `NOT VALID`, zero `CHECK` on `work_queue_items` |
| **F4** | **MEDIUM** | The design never states which value a **non-product row writes into `identity_state`**, and proposes no constraint on that column — yet the applied WU01 work emits `"non_product_scope"`. `identity_state` is a free `varchar(30) NOT NULL DEFAULT 'unresolved'` with no `CHECK`, so the only bound on the new state vocabulary is a column width. The design's RPC rule is an inequality (`p_identity_state` not `canonical`, `T1…:254`) rather than an enumerated value, which leaves RPC and handler free to drift. | `0003…:27` (`identity_state varchar(30) NOT NULL DEFAULT 'unresolved'`, no `CHECK`); `server/control-plane/identity.ts:36` (`"non_product_scope"`); `server/webhooks/agentEvents.test.ts:191`; `T1…:252-254` |
| **F5** | **LOW** | Layer-bound disagreement on the `scope_type` bound: the parser accepts up to **50** characters while the proposed column is **`varchar(30)`**. Harmless today only because the longest legal vocabulary value is 23 characters and a DB constraint is also proposed; still an unnecessary mismatch. `scope_key` is already aligned at 200/200. | `T1…:194` (`varchar(30)`); `server/control-plane/work-event-schema.ts:57` (`max(50)`); `:58` (`scope_key max(200)`) |
| **F6** | **LOW** | `work_queue_scope_idx (scope_type, scope_key)` is **speculative**: no read path filters or orders by either column. The existing reads select all columns ordered by `created_at`, filtered optionally by `status`, `execution_state`, `product_code`. The folder's precedent adds indexes alongside a concrete query need. Either justify the index with a named read path or omit it. | `T1…:197-198`; `server/control-plane/work-queue-router.ts:201-204`, `:206-208`, `:249`, `:282-284`, `:389-399`; precedent `0003…:39-42`, `0006…:29-30` |
| **F7** | **LOW** | `ADD COLUMN IF NOT EXISTS` does **not** verify an existing column's type or length. If an earlier attempt created `scope_type` with a different type/bound, the re-run reports success with the wrong applied shape and no constraint in force. A pre-existing latent property of this folder's convention, not a first-apply defect. The migration should assert the applied column type explicitly after the `ALTER`. | `T1…:193-195`; same latent property at `0006…:26-27`; re-run convention at `0008…:12` |
| **F8** | **LOW** | The applied WU01 payload change nests `workScope` inside the payload passed as `p_payload`, which **widens the byte-comparison surface** of the event-id/payload conflict check: two events with the same `event_id` differing only in scope data are now a conflict where they previously were not. Consistent with the contract the RPC documents, but it changes retry semantics for the deployed sender and must be stated explicitly. | `server/webhooks/agentEvents.ts:211-215` (`workScope` nested into the audit payload), `:222` (`p_payload: auditPayload`); `0006…:90-91`, `:110-112` (the comparison); `0006…:81-84` (the stated contract) |
| **F9** | **MEDIUM** | The migration-contract test provides **false-negative coverage** for the highest-risk control: `:36-39` assert only statement **suffixes** (`") FROM PUBLIC;"`, `") FROM anon;"`, `") FROM authenticated;"`, `") TO service_role;"`), which are identical for a 17-type and a 19-type list, and the test reads **only** `0006` (`:5-8`) — so a wrong-arity block, a missing block for the new function, and an entirely new migration file all pass. New assertions must pin the **full 19-entry type list** on all four statements against the new file, must keep the existing `0006` pin, and must assert the scope error tag matches the handler's matched substring. | `server/control-plane/work-truth-migration.test.ts:5-8`, `:36-39`; `T1…:315`; `server/webhooks/agentEvents.ts:90-91` |
| **F10** | **MEDIUM** | The proposed file name `0009_work_scope_identity.sql` carries **no target-database declaration**. This folder contains migrations for **two different databases**: `0002`, `0003`, `0004`, `0005`, `0006` declare `WSTERA LAB & CONTROL Supabase (SEPARATE project from hub-web product DB)`; `0007` and `0008` declare the opposite and warn explicitly that `0007`/`0008` "must never be applied" to the other project. The new file is numerically after two migrations that target the other database, so naive in-order application is wrong, and there is **no `__drizzle_migrations` journal** under `drizzle/` to disambiguate. `db:push` is `drizzle-kit generate && drizzle-kit migrate`, which without a journal would attempt to reconcile the entire schema. The migration must declare its target database and its predecessor explicitly, and the `db:push` prohibition must hold. | `0002…:2`, `0003…:2`, `0005…:3`, `0006…:3` (CONTROL target); `0007…:2-3`, `0008…:2-4` (product-DB target and the two-way warning); `0008…:14-17` (no journal; what `db:push` would do); `package.json:16`; `find drizzle -type f` (no journal, no `0009`); `T1…:189` |
| **F11** | **LOW** | The design supplies **no rollback block**. Every migration in this folder that a reviewer would use as precedent carries one in the same file: `0002…:7` and the commented `DROP` block at `:137-147`; `0003…:8-22`; `0008…:19-23` (drop in reverse dependency order); `0004…:9-17` (irreversibility disclosure). Section 8 above supplies the missing plan; it must be written into the migration file. | `T1…:187-273` (no rollback statement anywhere in the design); precedent files above |
| **F12** | **LOW** | Apply/deploy **ordering** is unspecified in the design. Because the change is an overload, the correct order is: schema → new function + full privilege block → client deploy → retire the old overload. Dropping the old arity before the new client is live produces `42883 undefined_function` on every ingestion call. | `T1…:238-273` (ordering absent); `server/webhooks/agentEvents.ts:242-243` (the client already sends 19 arguments); `0006…:260-262` (`MUST execute after the function is created`) |

### 10.3 Risks carried forward — not findings against this design

| # | Type | Item | Why it is not a finding here |
|---|---|---|---|
| R-A | Applied-state unknown | Whether the migration-contract test's assumptions about `0006` hold **in the applied database** at the moment of apply; and whether table-level ACLs beyond the RLS policy exist on `work_queue_items`. | Not inspectable in a read-only source qualification with no DB contact. Must be verified at T6 before apply. |
| R-B | Design gap outside this unit's object | The `identity_state` third value exists only in the **uncommitted** T2-WU01 working tree; it is not at the pinned revision. | T2-WU01 is a different work unit. Recorded here only because F4 depends on the value the RPC will receive. |
| R-C | Downstream contract | Whether the Control Sync sender emits scope fields, whether an in-flight unscoped outbox item would be rejected post-deploy, and the sender-side revision binding. | Out of the allowed inspection root and out of this work unit's object. |
| R-D | Ordering of the backfill decision | Whether the backfill is included in the same migration, and how rows left with `scope_type IS NULL` are surfaced. | Explicitly reserved by the design (`T1…:233-234`; Q2 `:618`; Q3 `:619`) to a reviewer/Owner boundary. This qualification does not answer it. |

### 10.4 Explicit statements required by this work unit

- A new document exists at
  `docs/platform/house-long-run/T2-WU02-MIGRATION-RPC-QUALIFICATION-2026-09-21.md` (this file).
- **No `.sql` file was created** by this unit. The planning worktree
  `D:/AI-Workspace/runtime/worktrees/wstera-control-truth-sync-001` contains only the 14 pre-existing
  tracked `.sql` files listed by `git ls-files "*.sql"`, and `git status --porcelain=v1
  --untracked-files=no` returns zero modified tracked files.
- **No database was contacted.** No connection string was read or sought, no `psql`/`pg`/Supabase
  client call was made, no `db:push` was run, no dry-run was executed, and no credential or secret
  store was accessed.
- **No source or test file was modified.** In the hub-web worktree, `drizzle/` and
  `server/control-plane/work-truth-migration.test.ts` were confirmed clean at
  `407130718646d13630b9789f68522a521fc74483` before and after inspection; the six modified files in
  that worktree are pre-existing T2-WU01 work and were not touched, staged, committed or pushed.
- The only file written by this work unit is this document.
- This document asserts no `PRODUCTION_READY`, no `LIVE_PROVEN`, no `OPERATED_STABLE`, and no PASS. It
  does not approve the design, does not authorise a migration, and does not authorise any production
  mutation. Verdict verification belongs to the commander.
