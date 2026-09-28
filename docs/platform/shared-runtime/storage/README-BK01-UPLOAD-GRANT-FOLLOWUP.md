# BK01 deposit slip upload grant follow-up

สถานะ: **House allowlist grant source, BK01 follow-up migration และ isolated PGlite proofs อยู่บน candidate branches เพื่อ independent review; ยังไม่อนุญาต live apply**

## Source of truth

- `house_storage_upload_grants.sql` — House-owned runtime-role map, `(product_code,bucket_id)` allowlist, grant registry, registration RPC, RLS helper, and atomic `storage.objects` insert trigger.
- `house_storage_upload_grants_rollback.sql` — guarded rollback; refuses to drop the registry while any grant rows remain.
- `DESIGN-BK01-DEPOSIT-SLIP-UPLOAD-GRANT-2026-09-28.md` — inspected BK01 upload path and storage policy assumptions.
- PGlite proof source: `tools/shared-runtime/storage-proof/proof.mjs`.

## Required BK01 integration before a live upload probe

1. The House RPC is `wstera_platform_internal.register_storage_upload_grant(p_bucket_id,p_object_path,p_grant_token_hash,p_content_type,p_size_bytes,p_expires_at)`. It accepts no product argument: the RPC derives product from `request.jwt.claim.role` through the House-owned `storage_upload_runtime_roles` mapping, then requires that `(product_code,bucket_id)` exists in `storage_upload_bucket_allowlist`. BK01 calls it from the existing `SECURITY DEFINER` authorization RPC, so House grants registration EXECUTE only to `bk01_migrator` (the function owner), never directly to `bk01_runtime`; the request role claim remains the authenticated BK01 runtime identity.
2. Initial House configuration is only `bk01_runtime -> bk01` and `(bk01,deposit-slips)`. A product with no mapped runtime role, an unknown bucket, or a role/bucket pair absent from the allowlist fails closed. House storage policy and consume trigger use the same mapping and pair. Product configuration is House-owned; BK01 receives no table access. `bk01_runtime` receives only House schema usage plus the narrow Storage policy helper, and `USAGE` on `storage` with `INSERT` on `storage.objects`; registration is not executable by that role. Forward SQL stops if these Storage privileges pre-exist so rollback cannot silently revoke unrelated grants.
3. In `authorize_deposit_slip_upload`, after existing server-side path, MIME, size, booking and runtime-role checks, call the House RPC in the same Postgres transaction that returns the signed upload capability. Pass `deposit-slips`, the full object path, token hash, content type, byte size, and expiry. Keep BK01 path shape `<booking_uuid>/<grant_uuid>.<ext>` and return contract unchanged.
4. If registration fails, fail the authorization request and do not return a signed upload capability. Do not insert grants from a browser or issue grants with service-role credentials from product code.
5. `20260928120000_bk01_house_upload_grants.sql` is the appended BK01 migration; the three frozen migrations remain unchanged. It calls the House RPC from the existing SECURITY DEFINER authorization RPC and preserves that RPC's return shape. It adds no local_service function identity, so the explicit `bk01_runtime` allowlist remains eleven RPCs plus eight accepted PUBLIC exceptions.
6. Offline proof requirements: a different bucket is rejected; BK01 cannot request another product's bucket; a hypothetical mapped product with its own allowlisted bucket can register and consume a grant while BK01 stays isolated; full BK01 chain + House SQL + appended migration applies in PGlite; guarded rollback refuses live grants/configuration.
7. Obtain separate live-window and reviewer approval before applying House/BK01 SQL or issuing a live storage token. PGlite does not emulate signed URL authorization or hosted Storage trigger timing.

The forward SQL refuses to run when `bk01_runtime` or `bk01_migrator` already has `USAGE` on `wstera_platform_internal`, or when BK01 already has the `storage` schema usage/object insert privilege this migration needs. This prevents rollback from revoking pre-existing grants. Capture and review those effective grants before applying. Rollback refuses while grant rows remain or while any non-seed runtime-role/bucket configuration remains; remove only reviewed House-owned additions before retrying.

## Verified offline evidence

`storage-proof/proof.mjs` applies the complete House SQL to isolated PGlite and probes exact valid consume, duplicate rejection, MIME mismatch, oversize, expiry, unknown role, unknown bucket, BK01-to-other-product denial, hypothetical product allowlist, and guarded rollback. The BK01 repository's Lane B proof applies its complete chain, a hash-pinned House SQL fixture, and the appended integration migration together. Evidence is stored outside the repository by the operator. These prove SQL behavior in PGlite only; they do not prove a hosted Supabase project or signed URL behavior.

## Rollback

Use `house_storage_upload_grants_rollback.sql` only after stopping issuance and draining or explicitly reviewing all grant rows. The script intentionally raises an exception while rows remain. Never remove that guard to make teardown succeed. Any live rollback requires a new snapshot and an authorized live window.
