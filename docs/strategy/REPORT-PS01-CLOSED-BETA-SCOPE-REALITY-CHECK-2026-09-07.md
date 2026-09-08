# REPORT — PS01 Closed-Beta Scope Reality Check

**Date:** 2026-09-07  
**Product:** Pawstia PMS (PS01)  
**Mode:** WSTERA BUILD-TO-SELL / HOUSE DECISION INPUT  
**Status:** PROPOSAL — no product scope has been changed yet

## Executive Summary

During PS-SR-02 free-hosting compatibility work, two existing Pawstia capabilities were re-examined against the actual 1-store Closed Beta objective:

1. Automated Daily Report media + LINE delivery
2. Public customer camera viewing

Both capabilities are implemented and tested, but their current complexity appears materially higher than what is required to prove the core PMS with the first real store.

The recommendation is **not to delete existing code**. The recommendation is to remove these capabilities from the Closed-Beta critical path until real-store demand proves they are worth their operational cost.

This decision also affects hosting strategy. The current Render Free recommendation was driven largely by the image-processing and long-lived camera-stream requirements. If those requirements are removed from Closed-Beta acceptance, the free-hosting decision must be re-evaluated before Phase B.

---

## 1. Daily Report — Current Reality

Current implementation accepts 1–4 photos, validates image type/content, processes them through `sharp`, stores media in Supabase Storage, creates a Daily Report, then supports LINE delivery and retry/reconciliation flows.
### Evidence

Relevant implementation:
- `products/PawSpace/lib/daily-report-media.ts`
- `products/PawSpace/app/api/daily-reports/route.ts`
- `products/PawSpace/lib/daily-report-storage.ts`
- `products/PawSpace/lib/line-worker.ts`

`prepareDailyReportImage()` currently:
- accepts multiple image formats;
- rejects oversized/invalid/mismatched content;
- decodes through `sharp`;
- rotates and resizes images;
- converts output for LINE use;
- computes a content hash.

A runtime probe on the real implementation using a simple 12 MP JPEG measured approximately **30 ms CPU** for image preparation alone.

### Product Question

For a first-store Closed Beta, the actual user need may be much simpler:

> Staff must remember to update the pet owner with a photo/status during the stay.

The store already has LINE as an established communication channel. Pawstia does not yet have evidence that the store needs Pawstia itself to own photo processing, storage, automated delivery, retries, and reconciliation.
### Recommended Closed-Beta Scope

Replace automated Daily Report delivery as a required capability with a **Daily Update Reminder / Completion Tracker**:

```text
Pet stay active
→ Pawstia reminds staff that customer update is due
→ Staff sends photo/message through the store's normal LINE workflow
→ Staff marks update completed
```

Suggested status:

- Existing automated Daily Report implementation: **KEEP CODE / NOT REQUIRED FOR CLOSED BETA**
- Automated LINE media delivery: **DEFERRED — validate with real store**
- Daily update reminder/tracker: **CORE CLOSED-BETA CANDIDATE**

This preserves the work already done while reducing storage, processing, hosting, integration, failure-recovery, and support requirements.

---

## 2. Camera — Current Reality

Phase 8 implemented bounded public access to one camera feed per tenant. A successful visitor code grants a signed `camera:view` session for exactly 30 minutes, and the Pawstia server proxies the upstream stream until session expiry.
### Evidence

Relevant implementation/evidence:
- `products/PawSpace/REVIEW-phase8-gate1-2026-08-21.md`
- `products/PawSpace/app/api/camera/access/[shopSlug]/route.ts`
- `products/PawSpace/app/api/camera/stream/[shopSlug]/route.ts`
- `products/PawSpace/lib/camera-access-server.ts`
- `products/PawSpace/supabase/migrations/20260821150000_phase8_camera_access.sql`

Current design assumes a server-reachable camera feed URL and actively proxies that feed through Pawstia.

The unresolved real-world questions are larger than the code itself:

1. What camera brands/protocols are actually used by target stores?
2. Can those cameras expose a usable feed without unsafe port-forwarding or extra hardware?
3. Will stores accept setup work, network changes, and ongoing troubleshooting?
4. Will stores actually want customers watching live video?
5. What privacy/operational issues arise when staff, other animals, or other customers appear in frame?
6. Who supports failures caused by camera hardware, router/NAT, ISP, DVR/NVR, or vendor apps?

There is currently no real-store evidence in the inspected Phase 8 material answering these questions.

### Recommended Closed-Beta Scope

- Camera code: **KEEP / DO NOT DELETE**
- Camera in Closed-Beta acceptance: **REMOVE**
- Camera in sales/marketing claims: **DO NOT CLAIM YET**
- Future status: **EXPERIMENTAL / VALIDATE WITH REAL STORE FIRST**
Before returning Camera to the roadmap as a committed capability, require evidence for:
- real merchant demand;
- actual camera inventory/protocol;
- one verified integration path;
- setup burden;
- support burden;
- privacy/security implications;
- willingness of the store to operate it.

---

## 3. Impact on PS-SR-02 Hosting Decision

The free-hosting audit previously recommended **Render Free + isolated Supabase Free staging** because current Pawstia contracts include:

- CPU-heavy `sharp` image processing for Daily Reports;
- up to 10 MiB source images;
- long-lived camera proxy streaming tied to a 30-minute session.

Those requirements were the main reasons Cloudflare Workers Free and Netlify Free were judged unsuitable for the **current full feature contract**.

Therefore, if House approves the proposed scope reduction:

> **PAUSE the Render selection. Do not start Phase B yet.**

Re-run the free-hosting compatibility gate using the actual Closed-Beta core scope. Cloudflare/Netlify/other free options may become viable once image automation and camera streaming are no longer release blockers.

This follows the Owner Free-First policy: do not let deferred features force infrastructure complexity or constrain provider choice before they have proven business value.
---

## 4. Planning / Implementation Provenance

Git history proves the following implementation commits:

- Daily Report media + LINE delivery: `2bee03f` — `feat(reports): implement Phase 6 daily report media + LINE delivery`
- Camera public visitor access: `5611c52` — `feat(camera): implement Phase 8 public visitor camera access`

Both commits are authored in Git as `Gutumrod`.

**Important:** Git authorship proves who committed the implementation. It does **not** prove who originally designed, proposed, approved, or instructed the feature scope.

The inspected repository does not contain a separate Phase 6 planning brief identifying a planner. The Phase 8 review records the locked controls but does not establish planning authorship.

Therefore this report does **not** attribute the scope decision to any specific agent/person without additional evidence.

---

## 5. Proposed Closed-Beta Core

Recommended first-store critical path:

- Shop onboarding
- Staff authentication / roles
- Rooms
- Customers / pet owners
- Pets
- Booking
- Check-in / active stay state
- Check-out
- Daily Update Reminder / completion visibility

Everything else must earn its place by removing a real merchant blocker or demonstrating real customer value.
---

## 6. House Decisions Requested

### HD-PS01-01 — Daily Update
Approve or reject:

> For 1-store Closed Beta, downgrade automated Daily Report media/LINE delivery from required capability to deferred capability, and use a simple staff Daily Update Reminder / completion tracker as the required workflow.

### HD-PS01-02 — Camera
Approve or reject:

> Remove camera viewing from Closed-Beta acceptance and sales claims. Keep existing implementation as experimental dormant capability pending real-store validation.

### HD-PS01-03 — Hosting Gate
If either scope change is approved:

> Re-open only the bounded Free Hosting Compatibility decision before PS-SR-02 Phase B. Do not assume Render remains the best free provider after the release requirements change.

---

## 7. Explicit Non-Actions

This report does **not** authorize:
- deleting Phase 6 or Phase 8 code;
- changing canonical Phase 13 evidence;
- modifying migrations;
- deploying to any provider;
- creating paid infrastructure;
- marketing camera support;
- changing product scope before House/Owner decision.

**Current action:** HOLD PS-SR-02 Phase B until the above scope decisions are resolved.