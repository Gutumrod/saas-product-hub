# HOUSE REVIEW — Claude H3C Independent Validation + Proof Pack

**Date:** 2026-09-08 (Asia/Bangkok)
**Reviewer:** WSTERA House / Secretary GPT
**Reviewed branch:** `origin/review/claude-h3c-proof-20260908`
**Reviewed SHA:** `5e4433b1826a28e07e5c1cab20b4ed264dff4d0d`
**Base:** `ec56365f5eb978367b5fc522879925b8347c6a8d`
**Status:** `CHANGES REQUIRED / DO NOT MERGE / NO LIVE H3C`

## Scope

This review independently inspected the branch diff, all seven deliverables, the proof harness, and the security-critical GoTrue claims used by Claude.

No WSTERA LAB mutation was performed. Production was not touched. The Claude branch was not merged.

## Branch integrity

- branch is exactly 1 commit ahead / 0 behind the requested base;
- 7 files added, 1,335 lines total;
- no unrelated tracked changes in the compare;
- `git diff --check` is clean;
- Claude worktree harness passes `node --check` and `--selftest`.

Static self-test success does not by itself validate the live-gate acceptance logic.## Independently verified Claude findings

### V-1 — GoTrue accepts custom string role values

At Supabase Auth commit `0907af9bd6be3c76f472c40a7dcc0dc34abeffaf`, `AccessTokenClaims.Role` is a string and `MinimumViableTokenSchema` validates `role` as `type: string` without the `anon|authenticated` enum shown in one public doc schema.

### V-2 — JWT `exp` can be capped while OAuth response expiry metadata remains uncapped

`GenerateAccessToken` computes `expiresAt` from project JWT expiry before the hook. The hook output can replace the signed claim set, including `exp`, but the function still returns the pre-hook `expiresAt.Unix()`. `AccessTokenResponse.ExpiresIn/ExpiresAt` are derived from that returned value.

Claude's warning to trust the signed JWT `exp`, not OAuth `expires_in/expires_at`, is therefore valid.

### V-3 — refresh invokes the hook again

Refresh token flow calls `GenerateAccessToken` again with `AuthenticationMethod = token_refresh`. Therefore removing the allowlist while a refresh session still exists can result in a subsequently issued normal `authenticated` token.

The rollback-order correction is valid in principle: invalidate the service identity / refresh authority before removing the narrow runtime-role grant or disabling the hook.### V-4 — non-public Postgres hook schemas are valid at GoTrue source level

GoTrue's current extensibility-point validation accepts arbitrary valid PostgreSQL schema identifiers in `pg-functions://postgres/<schema>/<function>` URIs; its own tests include schemas other than `auth`.

The remaining B-2 uncertainty is therefore hosted control-plane/UI acceptance, not a GoTrue runtime architecture limitation. House must still prove the hosted Dashboard or supported field-level config path accepts `wstera_platform_internal`.

## Required harness remediation

### H-01 — CRITICAL: false PASS with unproven authz controls

`finish()` only treats a `RUNTIME-BLOCKED` result as security-blocking when the category is `negative` or the id is `POS-AUTHZ-1`.

`POS-AUTHZ-2`, `POS-AUTHZ-3`, and `POS-CONTROL-1` can remain `RUNTIME-BLOCKED` while the overall harness can still return `PASS` if all other probes pass.

This contradicts the proof-pack acceptance statement that security-relevant blocked probes fail closed.

Required fix: define an explicit required-probe set and make every required probe non-PASS block the final PASS verdict.### H-02 — CRITICAL: positive submit probe can mutate LAB data

The harness always calls `ps01.submit_booking_request_v2_internal`. With real fixtures this is a mutating business operation and can create a booking request if authorization succeeds.

This contradicts the proof-pack claim that the harness is non-destructive/read-shaped.

Required fix: do not call the submit RPC by default. Either require an explicit destructive-test opt-in plus disposable fixtures and cleanup evidence, or keep H3C role-boundary proof read-only and prove the submit grant from H3B privilege evidence.

### H-03 — HIGH: direct table write negative probe is potentially mutating

`NEG-TBL-2` sends POST to the target table. If the isolation defect being tested actually exists, the probe itself could insert data.

Required fix: replace it with a demonstrably non-mutating write-authority probe, for example PATCH against a guaranteed-nonexistent primary key using a known valid column, or another method with proven transaction rollback semantics.

### H-04 — HIGH: positive boundary classifier accepts generic server failure

`boundaryReached()` treats most HTTP 5xx responses as proof that the RPC boundary was reached. A gateway/server failure can therefore be misclassified as PASS.

Required fix: fail on 5xx by default; only accept a non-2xx result as boundary proof when its response evidence unambiguously shows the target Postgres function executed.### H-05 — MEDIUM: project-ref precheck is tautological

`TOK-7` builds its search string using `CFG.url`, which already contains the configured project ref. The check therefore passes even if the token claims themselves do not contain that ref.

Required fix: validate project identity only from token/JWKS/issuer evidence, not from the expected target URL appended into the checked value.

### H-06 — MEDIUM: control token is decoded but not cryptographically verified

`POS-CONTROL-1` checks role/lifetime on the supplied control JWT but does not verify that token against the LAB JWKS and expected issuer before using it as proof that the hook is a no-op for non-allowlisted users.

Required fix: apply the same signature/issuer checks used for the runtime token before accepting the control result.

### H-07 — MEDIUM: rollback must account for already-issued narrow access token lifetime

Deleting/banning the service identity and removing refresh authority prevents privilege rebound, but an already-issued `ps01_line_runtime` JWT remains valid until its signed `exp` because PostgREST validates the JWT without checking current Auth-user existence.

Required fix: teardown evidence must record the last issued token expiry and either wait until it expires before declaring proof authority fully gone, or explicitly state that only narrow residual authority remains until that exact timestamp.## House verdict

Claude's architecture analysis is materially useful and the A4 refresh finding is accepted. The overall design is **not rejected**.

However the proof harness is currently capable of false PASS and contains operations that are not safely non-destructive. Therefore:

`CLAUDE H3C PROOF PACK = REMEDIATION REQUIRED`

`MERGE = NOT AUTHORIZED`

`LIVE H3C TOKEN PROOF = NOT AUTHORIZED`

After H-01 through H-07 are remediated on the same review branch, House will re-run static review and decide whether the branch can be adopted and whether H3C live activation may proceed.

## Authoritative source references

- Supabase Auth commit `0907af9bd6be3c76f472c40a7dcc0dc34abeffaf`, `internal/tokens/service.go`
- same commit, `internal/conf/configuration.go` and `configuration_test.go`
- same commit, `internal/hooks/hookspgfunc/hookspgfunc.go`
- canonical H3C/H3B/H3C1 files on `master@ec56365`
- reviewed Claude branch `5e4433b1826a28e07e5c1cab20b4ed264dff4d0d`