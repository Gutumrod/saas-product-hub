# BRIEF — Claude H3C Proof Pack Remediation

**Date:** 2026-09-08 (Asia/Bangkok)
**Mode:** INDEPENDENT REVIEW REMEDIATION / PREPARE ONLY
**Target branch:** `review/claude-h3c-proof-20260908`
**Current reviewed SHA:** `5e4433b1826a28e07e5c1cab20b4ed264dff4d0d`
**House review:** `evidence/HOUSE-REVIEW-CLAUDE-H3C-PROOF-PACK-2026-09-08.md`
**Status:** `FIX REVIEW FINDINGS / NO LIVE MUTATION / NO MERGE`

## Goal

Remediate the House findings in the H3C proof pack without changing the accepted H3C architecture, without touching WSTERA LAB, and without merging into master.

Work only on the existing Claude review branch. Preserve the original seven deliverables and update them where necessary so documentation and harness behavior agree exactly.

## Hard prohibitions

- no WSTERA LAB mutation;
- no Production access;
- no Auth Hook activation;
- no service identity creation;
- no allowlist/grant rows;
- no token/secret/signing material retrieval;
- no merge to master;
- no destructive live harness execution.## Required fixes

1. **H-01 false PASS:** replace implicit `securityBlocked` filtering with an explicit required-probe contract. `POS-AUTHZ-1`, `POS-AUTHZ-2`, `POS-AUTHZ-3`, `POS-CONTROL-1`, all required token checks, and all required negative probes must be `PASS` for final `PASS`. `RUNTIME-BLOCKED`, `NOT TESTABLE`, missing, duplicate, or unknown verdicts must not silently pass unless the matrix explicitly marks that probe advisory-only.

2. **H-02 submit mutation:** do not call `submit_booking_request_v2_internal` in default safe mode. Add an explicit operator opt-in if a controlled mutating proof is still desired, and require disposable fixtures + documented cleanup. Default H3C safe mode must remain non-mutating.

3. **H-03 table write probe:** remove unconditional POST-based mutation probing. Replace with a demonstrably non-mutating authority check, e.g. PATCH against a guaranteed-nonexistent primary key with a known valid column, or another method whose rollback semantics are proven before use.

4. **H-04 5xx classifier:** generic HTTP 5xx must never prove positive boundary reach. Accept non-2xx boundary evidence only when the response is specifically attributable to execution of the intended Postgres function.

5. **H-05 TOK-7:** remove `CFG.url` from the evidence being tested. Project identity must come from signed-token issuer/claims and LAB JWKS evidence.

6. **H-06 control token:** verify control JWT signature, issuer, and project identity before using it as proof of hook no-op behavior.

7. **H-07 teardown residual JWT:** update activation/rollback docs to record last runtime JWT `exp`; after service identity/session invalidation, do not claim all proof authority is gone until that access token expires or its rejection is otherwise proven.## Required tests

Expand `--selftest` so it proves the remediated gate behavior, not just helper functions.

Mandatory offline assertions:
- `POS-AUTHZ-2 = RUNTIME-BLOCKED` prevents final PASS;
- `POS-AUTHZ-3 = RUNTIME-BLOCKED` prevents final PASS;
- `POS-CONTROL-1 = RUNTIME-BLOCKED` prevents final PASS;
- a required negative probe missing from results prevents PASS;
- a required probe with an unknown verdict prevents PASS;
- generic 500 does not count as positive boundary reached;
- project-ref validation cannot pass solely because the configured target URL contains the expected ref;
- default mode never executes the submit RPC or another mutating HTTP probe.

Run:
- `node --check tools/shared-runtime/h3c/h3c-proof-harness.mjs`
- `node tools/shared-runtime/h3c/h3c-proof-harness.mjs --selftest`
- any additional offline tests added for gate logic.

## Documentation alignment

Update the final report, negative matrix, threat model, README, and hosted activation/rollback procedure wherever the old behavior or old cleanup claim is stated.

Do not soften findings by wording. If safe proof of a requested behavior is impossible without LAB mutation, mark it `RUNTIME-BLOCKED` and make that block final PASS.## B-2 clarification

House independently confirmed that current GoTrue source accepts valid non-`public` PostgreSQL schema names in `pg-functions://postgres/<schema>/<function>` and constructs a quoted hook function name from that URI.

Therefore keep B-2 classified narrowly as **hosted Dashboard/control-plane acceptance UNPROVEN**, not as a GoTrue runtime limitation.

Do not move the hook into `public` merely to satisfy UI examples.

## Completion contract

Before handoff:
- all H-01 through H-07 addressed explicitly;
- `git diff --check` clean;
- static/selftests pass;
- no secrets introduced;
- branch remains based on the same review line with no unrelated changes;
- commit and push the remediation to `origin/review/claude-h3c-proof-20260908`;
- do not merge;
- final response must include new SHA, changed-file list, test results, and a point-by-point H-01..H-07 disposition.

Stop after push and wait for WSTERA House review.