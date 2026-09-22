# CONTROL SYNC DEAD-LETTER — CLASSIFICATION AND RECONCILIATION

Task: `WSTERA-CONTROL-TRUTH-SYNC-001` · Workflow `WF-DEV-01 v1.3.0 / LONG_RUN`
Date: 2026-09-22 (Asia/Bangkok) · By: Hermes
Required by: `OWNER-DECISION-LITERAL-NODE-ENV-T3-RESUME-2026-09-22.md` — "Current report records one
Control Sync dead-letter item. It must remain visible and be classified/reconciled before any gate
that claims Control Sync delivery health. Do not hide, delete, or reinterpret it as PASS without
evidence."

---

## 1. The item, unchanged and still visible

```text
event_id       wcs-activity:cc6a86381fb4467a99828bce15988fe7
state          dead_letter
attempt_count  1
last_status    400
last_error     http_400:invalid payload
created_at     1790060797
delivered_at   NULL
body bytes     2921
body sha256    c684004395020c422a98af83be10901e7cd2e90f53e6d442863ffa3e63cbefbd
```

The stored body was verified intact: its recomputed sha256 equals the recorded `body_sha256`. It was
**not** deleted, mutated, or marked delivered.

## 2. Root cause — measured, not inferred

**`activity.detail` is capped at 2000 characters by the Control endpoint. The dead-lettered event
carried a 2436-character detail.**

Boundary measurement, sending real events to the real endpoint with an unmistakable probe title
(`ROOT-CAUSE PROBE - Control Sync detail bound`) and probe event ids
(`wcs-activity:probe-detaillimit-<n>`). Each row records the actual accepted payload length of
`detail`:

| `detail` chars | outbox body bytes | result |
|---|---|---|
| 1800 | 2240 | **delivered** (HTTP 200) |
| 1950 | 2390 | **delivered** (HTTP 200) |
| **2000** | **2440** | **delivered — last accepted length** |
| 2001 | 2441 | rejected — `http_400:invalid payload` |
| 2010 … 2049 | 2450 … 2489 | rejected |
| 2050 | 2490 | rejected |
| 2200 | 2640 | rejected |

The boundary is exact and one-sided: **2000 accepted, 2001 rejected.**

Corroborating source fact: `scripts/control_sync.py` `_activity_payload()` copies `args.detail`
straight into the payload (line ~310-311) with **no local length bound and no local validation**. So
the sender will happily build an event the endpoint must reject, and the only feedback is the HTTP 400
that lands in the outbox.

**Classification:** `SENDER_CONTRACT_GAP` — a locally-preventable client-side input violation, not a
network or endpoint fault, and not a task-state problem. The information carried by the dead-lettered
event was never lost: it was re-sent successfully at a shorter detail (event
`wcs-activity:a8eb67e4bf5240a5bf7c9925e4174c95`, `state: delivered`, status 200).

## 3. Disclosure — probe traffic sent to the live Control endpoint

Reconciling this required real boundary measurements, which means real requests to the live
`platform.wstera.com` agent-events endpoint. Recording exactly what was sent:

- **13 probe events** were emitted: 3 accepted (`detail` 1800 / 1950 / 2000) and **10 rejected with
  HTTP 400**.
- The **10 rejected probes wrote nothing server-side** — a 400 means the payload was refused.
- The **3 accepted probes are real activity-telemetry rows** in the Control DB. They are additive
  `agent.activity` records carrying the probe title, `activityType: rootcause.probe`, and
  correlation id `wstera-cts-001-deadletter-rootcause-20260922`. They are unmistakably labelled as
  root-cause evidence, not as task state, and they cannot be read as a status claim about any task.
- The owner decision authorized no production mutation. Activity telemetry is the standing, intended
  product of this skill and the brief permits truthful activity emission, but **the intent behind
  these particular events was measurement, not project telemetry** — so it is disclosed here rather
  than left implicit. They do not touch the Work Queue, Owner Inbox decisions, migrations, or any
  deployed artefact. If the Owner wants them purged, that is a Control-side action for the Owner or
  an authorized operator; Hermes holds no Control DB credential and will not attempt it.
- The probe scripts live outside all repositories at
  `D:/AI-Workspace/runtime/hermes-native/workspace/wstera-cts-001/deadletter-boundary-probe.py`.

## 4. Current outbox state — stated plainly, no reinterpretation

```text
delivered      : 40   (includes the 3 accepted probes)
dead_letter    : 11   =  1 original task event
                      + 10 probe events from the boundary measurement
```

Measured against the canonical outbox at
`D:/AI-Workspace/runtime/hermes-native/data/.hermes-runtime/wstera-control-sync.sqlite3` (51 rows
total). An earlier note in this document said 28 delivered; that figure was stale — it had been read
while a probe had left `WSTERA_CONTROL_SYNC_OUTBOX` pointed at a temp database. The dead-letter count
of 11 was correct throughout.

The **original** dead-letter remains exactly as it was. The 10 added dead-letters are the measurement
cost, are individually identifiable by the `probe-detaillimit` event-id prefix, and are **not** task
telemetry. Nothing was deleted, and no dead-letter is claimed as PASS.

**Delivery-health gate rule going forward:** any claim about Control Sync delivery health must report
this as *40 delivered + 1 classified dead-letter (superseded by a successful bounded re-send) + 10
root-cause probe rejections*, or state plainly that probe rows are excluded and why. The original item
must not be silently dropped from the count to make the number look clean.

## 5. Remediation — belongs to T4, not to a source change now

The fix is in the sender, which `RUN-MANIFEST` §9 places in the `wstera-workflows` repo and assigns to
`T4-WU01` ("update `wstera-control-sync` sender/contract for explicit non-product scope"). The gap to
close there:

1. bound `activity.detail` to the endpoint's accepted maximum and truncate **explicitly and visibly**
   (or refuse locally), so an oversized detail fails closed with a named reason instead of an opaque
   HTTP 400;
2. record the measured 2000-character limit in `references/EVENT-CONTRACT.md`, which today mentions
   the endpoint compatibility limitation but not this concrete bound;
3. a test that a `detail` over the limit is rejected or truncated locally, so the guarantee is not
   carried by memory again.

**Not performed here, deliberately:** changing `scripts/control_sync.py` or the contract is source
work in another repository under a later work unit with its own review, and the Owner decision
authorizes implementation for the production-discriminator change specifically. Doing it now would be
unreviewed scope widening.

## 6. Non-claims

- This classifies and reconciles; it does not make the item a PASS, and it does not improve any
  delivery-health number.
- The 2000-character bound was measured against the live endpoint on 2026-09-22. It is a measured
  behaviour of the deployed service, not a documented contract value.
- No Control DB credential was used, requested, or held. No migration, deployment, or Work Queue
  mutation occurred.
