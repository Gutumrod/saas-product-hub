# SYNTHESIS MANIFEST — MT01 Business/Market Gate

Run: WSTERA Product Destination Council — Canonical Run 01
Gate: Business/Market Gate — MT01 Multi-Tenant AI Starter Kit
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

- Three independent expert answers were collected for the MT01 Business/Market Gate.
- All three required current external evidence (competitors, current pricing, licensing model, target buyer alternatives, build-vs-buy economics, willingness/reason to pay, distribution/sales friction) with URL/source/date.
- External evidence was fetched on 2026-09-04 by the experts.
- Claims not externally verifiable are labeled UNVERIFIED by the experts.
- No expert issued a gate verdict; the synthesizer (Codex) issues the verdict.

## Candidate labels

- Candidate A, Candidate B, Candidate C are anonymous labels. They carry no identity information.
- All three candidates answered the same frozen brief independently.

## Source categories referenced by candidates (identity-safe)

- Paid one-time starter-kit competitors and their current pricing/license terms (e.g. ShipFast, Supastarter, MakerKit, SaaS Pegasus, FastReact, VibeReady, Achromatic, nextjs-boilerplate, LaunchFast, ZeroDrag).
- Free/open-source starter-kit floor (e.g. nextjs/saas-starter, Open SaaS, BoxyHQ, MakerKit Lite, LastSaaS, and GitHub topic scans).
- Build-vs-buy economics and market structure (market maps, cost-benefit analyses).
- Distribution economics (Lemon Squeezy, Gumroad merchant-of-record fees).
- Licensing norms for the category (one-time, no-resale, AS-IS, update windows).
- MT01 product repo state (verified live by experts on 2026-09-04).

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
