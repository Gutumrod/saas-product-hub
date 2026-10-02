# BK01 RC3 +180000 — Phase 1–2 offline review package

LOCAL_ONLY. Claude holds claim and publishes commits. No LAB/production/GO/merge.

## Source-of-Truth References

- Execution contract: `BK01-RC3-MANIFEST-PHASE12-2026-10-02.md` in this directory.
- Booking parent `c750d4a83ccfa57356dd64334418fe98d3e01bc1`; first14 migrations
  and runtime allowlist source are bound to that commit.180000 is an explicitly
  uncommitted hash-bound candidate, not part of that published SHA.
- House SQL/historical tool/manifest `483244c275b26e5e2222dbe2391886af096c548f`;
  original bootstrap `32df434e1057a83ecbf0c290a659be42f24bbc55`.
- `tools/shared-runtime/platform-sql/manifest.rc3.json`, `build-rc3-manifest.mjs`,
  `apply-platform-sql-rc3.mjs`, `prove-rc3-offline.mjs`, `rc3-manifest.test.mjs`.
- Booking design: `docs/operations/BK01-180000-PLATFORM-ADMIN-RETURN-TYPES.md`.
- Durable closeout: Second Brain
  `06-Agent-Logs/WSTERA-House/reports/REPORT-CODEX-HOUSE-BK01-MANIFEST-PHASE12-2026-10-02.md`.

## Diagnosis before manifest lock

D1 is in the real legacy→bootstrap+15 chain, not trial-only. It fails42804
column11 at baseline ledger0 and RC3 ledger14. Casting only plan reproduces the
same error at column12.180000 changes only plan/status SELECT expressions to
`::text`; CREATE OR REPLACE preserves owner/OID/ACL/auth/signature/security/search_path.
Repeated PUBLIC REVOKE is a policy requirement and measured ACL delta is empty.
The old legacy SQL and runtime allowlist stay byte-identical. Final ledger is15.

D3 is a measured trial Storage fixture defect: actual pinned SDK `File` produces
multipart330 bytes for a PNG68-byte fixture. Trial gateway stores HTTP envelope
MIME/size as object metadata, causing500 `No matching unused product storage grant`.
On the same RC3 chain/grant/path, raw PNG PUT succeeds200 and consumes the grant.
The passing R3 uses raw PUT; it does not cover browser multipart. Do not weaken
the canonical SQL grant checks or add a D3 migration. Hosted Storage/browser
acceptance remains unverified. Trial gateway/parser repair belongs to a separate
owner task; this package leaves the active trial stack untouched.

## Manifest and chain

Keep historical `manifest.json` unchanged. Version2 retains its House stages and
bootstrap source/hash, with separate `bk01_release` metadata. The15 accepted ledger
entries contain forward LF-normalized ledger hashes, raw file hashes and rollback
hashes. First14 are committed; candidate180000 is explicitly marked. CLI refuses
LOCAL_ONLY before connection. The existing dependency-injection seam is used only
for the guarded owned-cluster rehearsal; canonical target validation still runs.

Forward-only sequence after baseline bootstrap+15: House20 issuer →30 H3C →40
Storage, then these product files through the existing non-superuser runner:

```text
20260926120000_bk01_entitlement_packs.sql
20260927120000_bk01_runtime_route_rpcs.sql
20260927130000_bk01_trial_line_bind.sql
20260928120000_bk01_house_upload_grants.sql
20260930120000_bk01_link_token_no_extensions.sql
20261001023000_bk01_queue_release.sql
20261001130000_bk01_sql_consolidate.sql
20261001140000_bk01_pack_notify_group67.sql
20261002120000_bk01_council_p0.sql
20261002130000_bk01_p0_alert_context.sql
20261002140000_bk01_review_f1_f2.sql
20261002150000_bk01_p1_g09_g10.sql
20261002160000_bk01_g10_line_binding_audit.sql
20261002170000_bk01_g10_line_binding_audit_truncate.sql
20261002180000_bk01_platform_admin_return_types.sql
```

Prefix0..15 validation supports intermediate state. `verify-release` additionally
requires complete House stages, all15 ordered filename/hash rows and exactly21
effective EXECUTE identities bound to pinned allowlist source. Count alone cannot
pass. Historical tool rejects final ledger15 as expected; do not change its history.

## Reproduce offline

Install Booking root and House `tools/shared-runtime` locked dependencies with
`npm ci --no-audit --no-fund`. Use PostgreSQL17.11 binaries already available locally.
Create EXTERNAL_CONFIG_JSON outside repositories with exactly these absolute paths:

```json
{
  "rcRoot": "D:/AI-Workspace/runtime/worktrees/bk01-rc3-manifest180000-20261002",
  "houseRoot": "D:/AI-Workspace/runtime/worktrees/platform-bk01-rc3-manifest-20261002",
  "bootstrapRoot": "D:/AI-Workspace/runtime/relay/house-20261001/go5/booking-bootstrap-32df",
  "pgBin": "D:/AI-Workspace/runtime/portable/platform-sql-a10-pg17/pgsql/bin",
  "evidenceRoot": "D:/AI-Workspace/runtime/relay/house-20261002/codex/HOUSE-BK01-MANIFEST-PHASE2"
}
```

From the House candidate checkout:

```powershell
node tools/shared-runtime/platform-sql/prove-rc3-offline.mjs EXTERNAL_CONFIG_JSON --check-only
node tools/shared-runtime/platform-sql/prove-rc3-offline.mjs EXTERNAL_CONFIG_JSON
npm --prefix tools/shared-runtime run test:platform-sql
```

The proof accepts no connection URL, creates a fresh UTF8/UTC loopback cluster,
verifies the managed fixture, uses real non-superuser House/product operators and
stops its own cluster in finally. PG17 bootstrap superuser is named supabase_admin
before creating governed roles so creator membership matches canonical guards.
It does not patch membership rows or relax guards. External tool receipts are
explicitly OFFLINE-NOT-LAB; dummy policy URL is validated but never used for a socket.
Do not copy these receipts to original LAB history.

Proofs: actual tool apply20/30/40; prefix plans0..15; checksum/skipped/extra/reordered
tool rejection; duplicate row23505; D1 red/green/null LEFT JOIN/role denial;
plan-only mutation shows column12; raw catalog rollback diff[]; reapply/no-op;
exact21 allowlist; surface/arity gates; baseline and final pg_dump restores.
Dump comparison preserves owner/ACL and compares data/ledger/schema/RLS/policies/
triggers/definitions/default/column grants. Known raw ACL-default representations
and varchar-array cast rendering differences remain in evidence with narrowly
normalized semantic comparison; this is not a claim of raw dump byte equivalence.

D3 separate Booking proof `scripts/proofs/bk01-d3-offline-storage.mjs` accepts only
clusterEvidence/evidenceRoot/pgBin/trialGateway absolute paths; it starts a separate
gateway on an ephemeral port against its verified owned rehearsal cluster. It adds
the managed fixture metadata column when absent, removes it and its own objects/
grant at closeout, stops its own processes, and never alters active trial services.

## Publish and review handoff

Controller publishes Booking migration/rollback/proofs/test inventory updates first.
Generate manifest against a clean checkout of that new full commit:

```powershell
node tools/shared-runtime/platform-sql/build-rc3-manifest.mjs ABSOLUTE_BOOKING_CHECKOUT
```

Controller saves exact stdout to `manifest.rc3.json`, verifies status PINNED/all15
sources commit, records raw manifest SHA256, publishes House tooling, then repeats
offline proof on clean Booking/House checkouts. Bootstrap remains at original32df.
Operational selector is explicitly `--manifest manifest.rc3.json --manifest-sha256
<actual raw hash>` followed by plan/apply/rollback or verify-release. This documents
the interface; Phase1–2 does not authorize running it against LAB.

AGY reviews exact published SHAs, source/hash provenance,14→15 final contract,
180000 owner/ACL preservation, all positive/negative/restore evidence and the D3
wire-format limitation. Source/local PASS does not close hosted/browser gates.

## Stop and recovery

Stop on any target/source/hash/ledger/state/ACL/allowlist/restore drift. Preserve
failure evidence; no reapply of bootstrap/15 and no guessed history repair. LAB
has no PITR: before any future mutation require verified pg_dump custom archive+
hash, role/owner/ACL reconstruction recipe and local restore comparison. Portable
no-owner/no-acl dump alone is insufficient. Stop writes, capture failed state and
let controller choose reviewed pg_dump restoration with financial/deletion/Storage
byte reconciliation;180000 rollback here is only a local red/green regression.
Original LAB5/10/15 history acceptance, actual LAB snapshot recovery, hosted flows,
independent review and fresh Owner GO remain Phase3 HOLD.
