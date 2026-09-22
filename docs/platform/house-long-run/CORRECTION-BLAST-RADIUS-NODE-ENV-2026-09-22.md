# CORRECTION — blast radius of the deployed-Worker `NODE_ENV` finding (supersedes §2.2 as written)

Task: `WSTERA-CONTROL-TRUTH-SYNC-001` · Workflow `WF-DEV-01 v1.3.0 / LONG_RUN`
Date: 2026-09-22 (Asia/Bangkok) · Raised by: Hermes
Corrects: `OWNER-HOLD-PRODUCTION-TRUTH-GATE-INERT-2026-09-22.md` §2.2 ("Blast radius")

## Why this correction exists

The §2.2 table asserted that the demo/fixture paths were generally "reachable" on production.
Re-measuring the deployed binding list during T3-WU02E verification showed that claim was
**overstated** and the Owner would be misled by it. The correction is recorded rather than the
original table being silently rewritten, so the change in what was claimed is auditable.

## What was measured

Cloudflare API, deployed version `5dc81232-c116-4722-a6c1-74c15ad50385`:

```text
WSTERA_CONTROL_SUPABASE_URL        PRESENT
WSTERA_CONTROL_SECRET_KEY          PRESENT
NODE_ENV                           ABSENT
```

`server/control-plane/adapters/control-db.ts:14` is:

```text
if (!ENV.wsteraControlSupabaseUrl || !ENV.wsteraControlSecretKey) return null;
```

So on the deployed Worker **`getControlDb()` returns a real client**. The `if (!db)` branch — the
only branch that carries the demo fixture sets — **is not the normal production path**. It is
reached only if the control-db environment variables vanish or are misconfigured.

The finding that `ENV.isProduction` is false still stands unchanged, and so does the conclusion that
every `isProduction`-gated branch is inert. What was wrong was the size of the resulting exposure.

## Corrected exposure, branch by branch

The `isProduction`-gated branches fall into two classes, and they carry very different risk.

### Class 1 — the `!db` branch: fixture leakage, but not normally reachable

| File | Non-production fallback on `!db` | Reachable on deployed prod? |
|---|---|---|
| `owner-inbox-router.ts` `list` | `DEMO_INBOX_ITEMS` | only if the control-db vars are absent/misconfigured |
| `owner-inbox-router.ts` `get` | a demo item | same |
| `owner-inbox-router.ts` `decide` | fabricated `{ ok:true, status:"decided" }` | same |
| `owner-inbox-router.ts` `acknowledge` | fabricated `{ ok:true, status:"acknowledged" }` | same |
| `agent-activity-router.ts` `list` / `summary` | empty + `mode:"simulation"` (no fixture rows) | same |
| `portfolio-gates-router.ts` `list` | empty + `mode:"simulation"` (no fixture rows) | same |
| `work-queue-router.ts` `list` / `summary` / `updateStatus` | `SIMULATION_WORK_ITEMS` | same |
| `agentEvents.ts` (ingest) | 200 `ok:true` with in-memory dedup only | same |

**Correct classification:** a latent config-dependency risk on the `!db` path. It is *not* an
actively-substituting live path today, because the control-db vars are configured.

### Class 2 — the datastore-error branch: **this one is genuinely reachable**

| File | Non-production fallback on datastore error | Returns fixtures? | Reachable on deployed prod? |
|---|---|---|---|
| `owner-inbox-router.ts` `list` | `DEMO_INBOX_ITEMS` with `mode:"demo_fallback"` | **yes — demo inbox rows** | **YES**, on any Control datastore error |
| `agent-activity-router.ts` `list` | empty + `mode:"demo_fallback"` | no | YES — mislabels an error as demo |
| `portfolio-gates-router.ts` `list` | empty + `mode:"demo_fallback"` | no | YES — mislabels an error as demo |
| `work-queue-router.ts` `list` | returns `degraded` **unconditionally** (no `isProduction` gate on this branch) | no | n/a — already correct |

**Correct classification:** this is the real exposure. `owner-inbox-router.ts` `list` returns the
demo inbox fixture set on a Control datastore error, and that branch has no production gate that
works. `agent-activity` and `portfolio-gates` do not leak rows but label an errored read as
`demo_fallback`, which is the "production UI must never present demo/simulation state" problem the
Brief forbids.

Note the contrast that makes this actionable: `work-queue-router.ts`'s error branch is the one place
that is already correct **because it returns `degraded` without testing `isProduction` at all**.

## What this changes for the Owner decision

It does not change the options in the hold document; it sharpens the risk statement and the urgency.

1. **Option 1 (set `NODE_ENV=production`) remains the recommended fix**, and its value is now
   clearer: it is what converts both classes to correct behaviour at once. Class 2 is the part that
   is reachable *today*, on nothing worse than a Control datastore error.
2. A **narrower fix is also available and cheaper than option 1** if the Owner prefers not to touch
   a production variable: gate the three error branches (and the `!db` branches) on the *presence of
   the datastore configuration* — or simply return `degraded` unconditionally, exactly as
   `work-queue-router.ts`'s error branch already does. That removes Class 2 exposure without
   requiring any deployment variable. It does not fix Class 1's latent config risk, and it is
   source work needing its own review.
3. **Option 3 (source-only claim)** is now weaker than it looked: the exposure is not purely
   hypothetical, it is one datastore error away on the inbox read path.

## Non-claims

- No code was executed inside the live Worker. The reachability claims above are derived from the
  deployed version's binding list plus the committed source, not from a live fault injection.
- Whether the Control datastore has in fact errored in production is **not** known and is not
  claimed. The point is that the branch is reachable, not that it has fired.
- This correction is not an independent review.
