# H3C — Supabase Auth Hook Custom Role Validation

**Date:** 2026-09-08
**Purpose:** resolve documentation ambiguity before H3C LAB mutation
**Verdict:** `CUSTOM POSTGRES ROLE CLAIM SUPPORTED BY CURRENT AUTH VALIDATOR`

## Ambiguity Found

The public Custom Access Token Hook documentation includes a rendered JSON Schema example where `role` appears constrained to `anon` / `authenticated`.

That conflicts with other Supabase documentation describing JWT `role` as the PostgreSQL role used by PostgREST and advanced setups using custom Postgres role names.

H3C was stopped before apply until the implementation was inspected.

## Current Supabase Auth Source

Repository: `supabase/auth`
Inspected default-branch source commit:
`0907af9bd6be3c76f472c40a7dcc0dc34abeffaf`

File:
`internal/tokens/service.go`

Source URL:
`https://github.com/supabase/auth/blob/0907af9bd6be3c76f472c40a7dcc0dc34abeffaf/internal/tokens/service.go`

The runtime access-token claims struct defines `Role string`.
The `MinimumViableTokenSchema` used by `validateTokenClaims()` defines `role` as JSON type `string` with no enum restriction.
Therefore current Auth validation accepts a custom string role claim such as `ps01_line_runtime`, provided all required claims remain present and valid.

## Consequence for H3C

The H3C design remains viable:
- Supabase Auth may issue the token;
- House hook may replace `role` with `ps01_line_runtime` for a strictly allowlisted LAB service identity;
- H3B PostgREST `authenticator` already has SET-only membership in that NOLOGIN role;
- token expiry may be shortened because `exp` remains a required integer claim.

This evidence does **not** prove hosted hook configuration or end-to-end issuance yet. It only removes the validator/design ambiguity.

## Safety Decision

Proceed only with the inert H3C support migration first.

Do not:
- enable hosted Auth Hook config yet;
- add a real runtime-token grant yet;
- provision or reuse a human account as the service identity;
- retire `ps01_runtime_login`;
- copy any Auth signing material into product runtime.

H3C end-to-end PASS still requires a real Auth-issued token and Data API positive/negative matrix.