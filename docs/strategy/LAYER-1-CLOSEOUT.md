# LAYER-1-CLOSEOUT — Portfolio Register

**Purpose:** Portfolio closeout template/register for the WSTERA Layer Model (Layer 1).
**Authority:** `docs/strategy/WSTERA-LAYER-MODEL.md` — Owner Decision D2 (L1 closeout authority) and D3 (current closeout cycle).
**Status:** TEMPLATE / REGISTER — no product is marked complete by this file.

## Rules

- `L1 COMPLETE` is NOT automatic. Required authority chain: (1) product provides objective Layer 1 closeout evidence; (2) Council reviews against the Layer 1 closeout contract; (3) Council issues its recommendation; (4) Owner is Final Authority and signs the final L1 state.
- Allowed final states: `L1 COMPLETE — AGENTIZATION ELIGIBLE`, `L1 INCOMPLETE`, `L1 BLOCKED`, `NOT CONTINUING`.
- `AGENTIZATION ELIGIBLE` means sufficiently authoritative and well-governed to begin a separate Layer 2 evaluation. It does NOT mean already Agent-enabled, and it does NOT authorize any Agent work.
- Products not yet formally evaluated must use `NOT YET EVALUATED`.
- Minimum evidence contract: see `docs/strategy/WSTERA-LAYER-MODEL.md` → "L1 COMPLETE — Minimum Evidence Contract" (15 criteria).

## Current Layer 1 Closeout Cycle (Owner Decision D3)

Canonical products governed by the WSTERA Product Destination pipeline:
DC01, BK01, PS01, WS01, LK01, MT01, CM01.

Products outside this canonical cycle are not automatically included.

---

## Register

| Product ID | Product name | L1 state | Council review date | Evidence references | Unresolved blockers | Agentization eligibility | Owner decision | Owner decision date |
|---|---|---|---|---|---|---|---|---|
| DC01 | DocCraft | NOT YET EVALUATED | — | — | — | — | — | — |
| BK01 | Booking | NOT YET EVALUATED | — | — | — | — | — | — |
| PS01 | Pawstia | NOT YET EVALUATED | — | — | — | — | — | — |
| WS01 | WSTERA Supply Management | NOT YET EVALUATED | — | — | — | — | — | — |
| LK01 | WSTERA Link | NOT YET EVALUATED | — | — | — | — | — | — |
| MT01 | Multi-Tenant AI Starter Kit | NOT YET EVALUATED | — | — | — | — | — | — |
| CM01 | Booking Claim & Case Management | NOT YET EVALUATED | — | — | — | — | — | — |

---

## Per-Product Closeout Record Template

Use one block per product when a formal Layer 1 closeout is performed.

```markdown
## <Product ID> — <Product name>

- **L1 state:** <L1 COMPLETE — AGENTIZATION ELIGIBLE | L1 INCOMPLETE | L1 BLOCKED | NOT CONTINUING>
- **Council review date:** YYYY-MM-DD
- **Evidence references:** <paths to gate evidence, release evidence, verification, runtime state>
- **Unresolved blockers:** <list, or "none">
- **Agentization eligibility:** <eligible / not eligible / not applicable>
- **Owner decision:** <signed state>
- **Owner decision date:** YYYY-MM-DD

### Minimum Evidence Contract check
<For each of the 15 criteria in WSTERA-LAYER-MODEL.md, record PASS / FAIL / N/A with evidence path.>
```

---

## Notes

- This register must NOT falsely mark products complete now. Initial states reflect only known evidence or use `NOT YET EVALUATED` until each product undergoes formal Layer 1 closeout.
- A product later intentionally discontinued, deferred indefinitely, or removed from the active portfolio may be marked `NOT CONTINUING`; that state must be explicit and Owner-approved.
- No Agent work is authorized merely by receiving `AGENTIZATION ELIGIBLE`.
