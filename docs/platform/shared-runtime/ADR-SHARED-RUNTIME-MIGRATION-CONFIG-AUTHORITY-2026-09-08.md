# ADR — Shared Runtime Migration and Configuration Authority

**Date:** 2026-09-08
**Status:** ACCEPTED by Owner execution approval
**Applies to:** WSTERA shared Supabase LAB and future shared Production runtimes
**Trigger evidence:** BK01 coexistence gate reproduced a live multi-repo migration-history collision after PS01 admission.

## Decision

A shared Supabase project has two distinct mutation planes:

1. **Platform-global lane** — the only authority for project-global state.
2. **Product-local lane** — one bounded migration identity, namespace and ledger per hosted product.

A product repository must never treat Supabase's project-global migration ledger or local `config.toml` as its exclusive deployment source of truth after the project hosts more than one product.

## Why This Decision Exists

WSTERA LAB currently hosts BK01 and PS01. After PS01 added its own platform bootstrap history, running BK01 `supabase db push --linked --dry-run` failed because the remote global migration ledger contained a version absent from the BK01 repository.

The correct response is not to copy PS01 migrations into BK01, run migration repair from BK01, or make each product mirror every other product's history. Those approaches couple independent repositories and give one product authority over another product's deployment metadata.

## Platform-Global Lane Owns

- Supabase project-global migration history created by platform bootstrap/change operations.
- Data API exposed-schema configuration.
- custom role creation and initial product-role grants.
- managed `auth`, `storage`, `cron`, `net`, and extension changes.
- database-wide privileges and schema bootstrap.
- registry of product-owned global resource names such as Storage buckets.

Global changes are reviewed and applied once through the platform authority. Product runners cannot apply them.

## Product-Local Lane Owns

Each product receives:

- explicit product-facing and internal schema ownership;
- a NOLOGIN migration group role;
- an independently rotatable LOGIN role that inherits only the product migration role;
- a product-local migration ledger and advisory lock;
- a migration validator that rejects writes outside owned namespaces;
- independent release/checksum evidence.

The product runner may reference an explicitly approved shared interface such as `auth.users`, but it cannot structurally mutate that shared schema.

## Current LAB Registry

| Product | Product schema | Internal schema | Migration role | Global Storage asset |
|---|---|---|---|---|
| BK01 | `local_service` | `local_service_internal` target | `bk01_migrator` target | `deposit-slips` (grandfathered legacy name) |
| PS01 | `ps01` | `ps01_internal` | `ps01_migrator` | `ps01-daily-report-photos` |

Current Data API exposed-schema set observed in LAB:

`public, graphql_public, local_service, ps01`

Internal product schemas remain unexposed by default.

## Forbidden Product Operations in Shared Environments

- `supabase db push` from an individual product repository.
- `supabase migration repair` by a product to reconcile another product's history.
- `supabase db pull` as a mechanism to absorb another product's migrations.
- `supabase config push` from a product-local `config.toml`.
- project-wide reset.
- product migration DDL against another product schema or shared managed surfaces.
- extension/role/database-global DDL from the product-local migration stream.

## Live Registry Update — 2026-09-08

During BK01 remediation, MT01 was independently admitted to WSTERA LAB through four new global migrations:

- `20260908083054_mt_mp_02_persistence_reference`
- `20260908083145_mt_mp_02_explicit_server_only_deny`
- `20260908083459_mt_mp_02_atomic_claims`
- `20260908084606_mt_mp_02_verification_probe_20260908`

Observed MT01 namespaces are `mt01` and `mt01_private`, currently owned by `postgres`. No `mt01*` custom database role was present at this snapshot.

These migrations did not reference `local_service`, `ps01`, `storage`, or Data API exposed-schema configuration. Their arrival while BK01 was being prepared is direct evidence that the shared-runtime migration plane must tolerate independently moving products without requiring each product repository to mirror the global migration ledger.

MT01 is therefore a current coexistence peer, but its own migration-role remediation remains MT01-owned scope and is not performed by BK01.
