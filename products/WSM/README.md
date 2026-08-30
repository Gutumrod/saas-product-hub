# WSM — WSTERA Supply Management

**Product ID:** WS01  
**Status:** North Star + Phase Map locked; implementation not started  
**Parent:** WSTERA SaaS Product Hub

WSM is a supply planning and dealer allocation SaaS for businesses that manage dealer demand, supply from one or more suppliers/factories, shortages, allocation, incoming inventory, and fulfillment.

Core product flow:

**Demand → Supply → Gap → Allocation → Fulfillment**

## Current documents

- `docs/01-north-star-architecture.md` — locked product destination / North Star
- `docs/02-data-model.md` — legacy draft; **do not implement from this file**
- `docs/03-phase-map.md` — locked development sequence from Phase 0 to Phase 8

## Current development position

**Phase 0 — Product & Domain Lock**

Completed: North Star and Phase Map.  
Next artifact: `docs/04-data-model-v2.md`.

## Core rule

Design the complete destination first, then implement in phases. Phase 1 must be a thin end-to-end loop: Dealer Booking → Demand → Supply → Gap → Allocation → Dealer Result.