# SYNTHESIS MANIFEST — BK01 Business/Market Gate

Run: WSTERA Product Destination Council — Canonical Run 01
Gate: Business/Market Gate — BK01 Booking by WSTERA
Date: 2026-09-04
Procedure: `llm-council-gate` v0.3.2

## Purpose

This manifest is the identity-safe input for the Codex synthesizer. It contains NO agent names, NO Candidate→Expert mapping, and NO identity clues. Codex must treat Candidate A/B/C as anonymous independent expert answers.

## Inputs to Codex

1. Frozen brief: `COUNCIL-BRIEF.md`
2. Candidate A: `CANDIDATE-A.md`
3. Candidate B: `CANDIDATE-B.md`
4. Candidate C: `CANDIDATE-C.md`
5. This manifest

## Evidence provenance (identity-safe)

- Three independent expert answers were collected for the BK01 Business/Market Gate.
- All three required current external evidence (Thai booking market, target payer/user, competitors, current pricing, free/status-quo alternatives, reason to pay, retention/repeat usage, acquisition/sales friction) with URL/source/date.
- External evidence was fetched on 2026-09-04 by the experts (e.g. EikQueue, SeeU, OneRun, Fresha, Booksy, LINE OA, SlipOK, Suriya, Bookio, ZERVA).
- Claims not externally verifiable are labeled UNVERIFIED by the experts.
- No expert issued a gate verdict; the synthesizer (Codex) issues the verdict.

## Candidate labels

- Candidate A, Candidate B, Candidate C are anonymous labels. They carry no identity information.
- All three candidates answered the same frozen brief independently.

## Source categories referenced by candidates (identity-safe)

- Thai booking SaaS competitors and pricing (EikQueue, SeeU, OneRun, Suriya, Bookio, ZERVA).
- International booking platforms (Fresha, Booksy).
- LINE OA Thailand pricing and merchant-owned LINE cost model.
- PromptPay/slip verification provider costs (SlipOK).
- Free/status-quo alternatives (LINE/manual/calendar workflows).
- Thai hair/barber/beauty/nail market size and digital adoption.
- BK01 product repo state (verified live by experts on 2026-09-04).

## Integrity

- Candidate mapping was generated only after all raw answers were persisted.
- Identity was stripped from all candidates; verified no identity leak.
- This manifest contains no agent names or mapping.

## Output contract for Codex

Codex must produce:
1. Problem understood
2. Verified facts
3. Consensus / majority / dissent with real ratios
4. Missing evidence / unresolved questions
5. Synthesizer recommendation
6. Why this recommendation
7. Rejected alternatives + why
8. Gate verdict + blockers
9. Confidence 0-100
10. Business/Market document pack or exact document changes
11. Thai OWNER-BRIEF per contract
