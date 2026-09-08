# BRIEF — Claude H3C Independent Validation + Proof Pack

**Date:** 2026-09-08 (Asia/Bangkok)
**Mode:** WSTERA HOUSE / INDEPENDENT REVIEW + PREPARE ONLY
**Environment:** WSTERA LAB only (`ykxlqnshaaxmzzocpjlj`)
**Owner:** WSTERA House / Secretary GPT
**Executor:** Claude Desktop
**Final reviewer:** Secretary GPT

## Mission

Independently audit the current H3C Auth-issued runtime-token architecture and prepare a complete, executable proof pack for the next House-controlled run.

Claude is not being asked to approve its own work or mutate WSTERA LAB. The purpose is to spend a long uninterrupted run on source-level verification, threat analysis, hosted-Supabase compatibility, and exact test preparation so Secretary GPT can review and execute the live gate later.

## Starting State

- H3B `ps01_line_runtime` boundary is already applied in LAB.
- H3C inert support objects are already applied in LAB.
- Auth Hook is NOT enabled.
- runtime-token allowlist is empty.
- no H3C service identity exists.
- `ps01_runtime_login` remains enabled.
- H3C end-to-end is NOT PASS.
- BK01 remains quarantined.

## Mandatory Source of Truth

Read these before forming conclusions:

1. `ADR-SHARED-RUNTIME-MIGRATION-CONFIG-AUTHORITY-2026-09-08.md`
2. `DESIGN-H2-SHARED-RUNTIME-ISOLATION-EXECUTION-BOUNDARY-2026-09-08.md`
3. `BRIEF-H3C-AUTH-ISSUED-RUNTIME-TOKEN-PROOF-2026-09-08.md`
4. `evidence/H3B-POST-APPLY-RUNTIME-BOUNDARY-2026-09-08.md`
5. `evidence/H3C-AUTH-HOOK-ROLE-VALIDATION-2026-09-08.md`
6. `evidence/H3C1-INERT-SUPPORT-POST-APPLY-2026-09-08.md`
7. `migrations/h3c_auth_runtime_token_support.sql`
8. `migrations/h3c_auth_runtime_token_support_rollback.sql`
9. `REPORT-SHARED-RUNTIME-SECURITY-ADVISOR-HANDOFF-2026-09-08.md`
10. BK01 Junction A platform handoff/report for the original isolation failure.

Also inspect current Supabase official documentation and current `supabase/auth` source where relevant. Record exact source URLs/commits used.

Do not trust an older brief over current repository state, current official documentation, or current implementation source. If they conflict, report the conflict explicitly.

## Git / Branch Rules

- Start from current `origin/master` after confirming this brief exists.
- Create a new branch: `review/claude-h3c-proof-20260908`.
- Do not work directly on `master`.
- Do not modify or merge another agent's branch.
- Keep all Claude-created artifacts scoped under shared-runtime docs/test-support paths.
- Do not rewrite canonical evidence to make results look green.
- At completion, commit and push only the Claude branch.
- Report base SHA, final SHA, divergence, and clean-tree status.

## Hard Prohibitions

Claude MUST NOT:
- apply any Supabase migration;
- enable/disable Auth Hooks;
- create/delete Auth users or service identities;
- insert/update/delete runtime-token allowlist rows;
- change roles, grants, ACLs, exposed schemas, Storage, cron, extensions, or Auth config;
- use `supabase config push`;
- obtain, print, copy, decode to disk, or commit private signing material, legacy JWT secret, DB password, service-role secret, PAT, refresh token, or access token;
- touch Production;
- disable `ps01_runtime_login`;
- readmit BK01.

## Work Package A — Independent Architecture Audit

Audit the H3C design as if preparing to reject it.

Verify at minimum:
- whether hosted Supabase Auth can issue a JWT whose `role` claim is a custom existing PostgreSQL role;
- whether current GoTrue/Auth token validation accepts arbitrary string roles in practice;
- whether PostgREST `authenticator` can SET the reviewed NOLOGIN role with the H3B PostgreSQL 17 membership semantics;
- whether a five-minute `exp` cap in the hook is valid and refresh behavior can accidentally restore broader authority;
- whether the proposed hook return shape preserves every required claim;
- whether `SECURITY INVOKER` plus the current `supabase_auth_admin` grants are sufficient and safer than SECURITY DEFINER.

Do not stop at documentation examples. Trace current implementation source where needed and cite the exact commit/revision.

Deliver a clear verdict for every point: VERIFIED / CONTRADICTED / UNPROVEN.

## Work Package B — Hosted Auth Activation / Rollback Path

Find the safest supported hosted-Supabase method to enable exactly one PostgreSQL Custom Access Token Hook and later disable it without broad configuration drift.

Required output:
- exact supported control surface: Dashboard, Management API, CLI, or another official mechanism;
- exact field names / endpoint / request shape where publicly documented;
- how to read or preserve the previous value before change;
- exact rollback sequence;
- whether changing only this hook can affect other Auth settings;
- whether `supabase config push` can be avoided completely.

If no field-level supported automation exists, say so and provide a precise Dashboard operator procedure instead. Do not invent undocumented API fields.

Do not activate anything during this review.

## Work Package C — Threat Model / Failure Modes

Threat-model the complete H3C chain:

`service identity -> Supabase Auth -> Custom Access Token Hook -> JWT -> PostgREST authenticator -> ps01_line_runtime -> three RPCs`

At minimum examine:
- service identity compromise;
- refresh-token persistence after a five-minute access token expires;
- stolen token replay;
- allowlist grant accidentally left enabled;
- hook failure affecting ordinary users;
- role-name injection or unexpected database roles;
- privilege escalation through PUBLIC/managed `net` privileges;
- calling unintended SECURITY DEFINER functions;
- bypass through exposed `public`, `local_service`, or `ps01` APIs;
- cross-product access to BK01/MT01/PS01-internal surfaces.

For each failure mode, identify preventive control, detection evidence, rollback/recovery, and whether it blocks H3C.

## Work Package D — End-to-End Proof Harness

Prepare a non-secret proof harness that Secretary GPT can run later after House explicitly provisions the LAB-only identity/token.

The harness must:
- accept endpoint/key/token only through environment variables or secure operator input;
- never print full tokens or secrets;
- decode only non-sensitive JWT claims needed for evidence;
- verify issuer, audience/role, expiry window, and expected project identity;
- call the exact three allowlisted PS01 Customer LINE RPCs;
- run the mandatory negative Data API probes;
- produce machine-readable PASS/FAIL evidence plus a human-readable summary;
- fail closed on missing prerequisites or unexpected success.

Prefer a self-contained PowerShell or Node script suitable for the existing Windows House workflow. Do not require Docker.

Do not execute the live token proof during Claude's run.

## Work Package E — Negative Matrix Design

The proof pack must define exact expected failures for:
- non-allowlisted PS01 RPC;
- direct read/write against PS01 tables not granted to the runtime role;
- `ps01_internal` access;
- BK01 `local_service` access;
- `mt01` / `mt01_private` access;
- `public` privileged/helper RPCs outside contract;
- Data API attempts addressing `net`, `cron`, `auth`, `storage`, `extensions`, or `wstera_platform_internal`;
- expired token;
- token with invalid signature;
- token carrying an ungranted/foreign PostgreSQL role.

Design probes to be non-destructive. A negative probe must not create real booking/customer/business data merely to prove denial.

Unexpected HTTP/SQL success is a gate failure, not a warning.

## Work Package F — Security-Advisor Intersection Review

Read `REPORT-SHARED-RUNTIME-SECURITY-ADVISOR-HANDOFF-2026-09-08.md` and determine which existing findings can invalidate H3C evidence even if the new token role itself is narrow.

Focus on:
- externally callable SECURITY DEFINER functions;
- `local_service.shop_public_profile`;
- `public.rls_auto_enable()`;
- PS01 mutable search-path helpers;
- managed `pg_net` / PUBLIC privilege behavior.

Do not remediate these findings in this branch.

Return only:
- whether each finding intersects H3C;
- what must be added to the negative matrix;
- what must be closed before final Shared-Runtime Platform Isolation PASS;
- what can remain a separately owned remediation without invalidating H3C itself.

## Required Deliverables

Create at minimum:

1. `evidence/CLAUDE-H3C-INDEPENDENT-REVIEW-2026-09-08.md`
2. `evidence/CLAUDE-H3C-HOSTED-AUTH-ACTIVATION-ROLLBACK-2026-09-08.md`
3. `evidence/CLAUDE-H3C-THREAT-MODEL-2026-09-08.md`
4. a runnable proof harness under `tools/shared-runtime/h3c/`;
5. a README beside the harness with prerequisites, environment-variable names, expected outputs, and cleanup procedure.

If the committed H3C support SQL has a defect, do not edit the canonical migration in place. Create a proposed patch/diff artifact and explain exactly why it is required.

All findings must distinguish:
- VERIFIED FACT;
- SOURCE/DOC CONFLICT;
- INFERENCE;
- BLOCKER;
- RECOMMENDATION.

## Acceptance Contract

Claude's run is complete only when:
- all mandatory sources were inspected;
- current official Supabase docs and implementation source were cross-checked;
- every architecture claim has evidence or is explicitly marked unproven;
- hosted activation and rollback are precise enough for an operator to execute without guessing;
- the proof harness covers the full positive/negative matrix and fails closed;
- no secret/token/private key appears in Git diff or generated evidence;
- no live LAB mutation occurred;
- no Production access occurred;
- branch tests/static checks relevant to created scripts pass;
- branch is committed, pushed, and clean.

Final handoff must state one of:
- `H3C READY FOR HOUSE LIVE PROOF`;
- `H3C REMEDIATION REQUIRED BEFORE LIVE PROOF`;
- `H3C ARCHITECTURE REJECTED`.

Do not declare Shared-Runtime Platform Isolation PASS. Only Secretary GPT / House may issue that gate after independent review plus live proof.
