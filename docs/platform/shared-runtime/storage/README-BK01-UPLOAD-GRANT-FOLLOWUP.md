# BK01 deposit slip upload grant follow-up

สถานะ: **House grant source และ isolated PGlite proof พร้อมให้ review; ยังไม่ใช่ flow ที่ BK01 เรียกใช้งาน และยังไม่อนุญาต live apply**

## Source of truth

- `house_storage_upload_grants.sql` — House-owned grant registry, registration RPC, RLS helper, and atomic `storage.objects` insert trigger.
- `house_storage_upload_grants_rollback.sql` — guarded rollback; refuses to drop the registry while any grant rows remain.
- `DESIGN-BK01-DEPOSIT-SLIP-UPLOAD-GRANT-2026-09-28.md` — inspected BK01 upload path and storage policy assumptions.
- PGlite proof source: `tools/shared-runtime/storage-proof/proof.mjs`.

## Required BK01 integration before a live upload probe

1. In `authorize_deposit_slip_upload`, after the existing server-side path, MIME, size, and runtime-role checks, call `wstera_platform_internal.register_bk01_storage_upload_grant(...)` in the same Postgres transaction that returns the signed upload capability.
2. Pass the exact bucket, full object path, token hash, content type, and declared byte size. Keep the current BK01 path shape `<booking_uuid>/<grant_uuid>.<ext>` and return contract unchanged.
3. If registration fails, fail the authorization request and do not return a signed upload capability. Do not insert grants from a browser or issue grants with service-role credentials from product code.
4. Add source tests proving registration rollback when authorization fails, replay rejection, MIME/path/size binding, expiry, and cross-product denial. Re-run the BK01 frozen migration and policy checks without editing its frozen migration files.
5. Obtain the separate live window and reviewer approval before applying House SQL or issuing any live storage token. Verify the deployed Supabase Storage behavior with the exact signed-upload flow; this PGlite proof does not emulate signed URL authorization or hosted trigger timing.

The forward SQL refuses to run when `bk01_runtime` already has `USAGE` on `wstera_platform_internal`. This prevents rollback from revoking a pre-existing shared-schema grant. Capture and review that effective grant state before applying.

## Verified offline evidence

`storage-proof/proof.mjs` applies the complete House SQL to isolated PGlite and probes exact valid consume, duplicate rejection, MIME mismatch, oversize, expiry, wrong product role, and non-consumption after rejected probes. Evidence is stored outside the repository by the operator. It proves the SQL behavior in PGlite only; it does not prove a hosted Supabase project or a complete BK01 user flow.

## Rollback

Use `house_storage_upload_grants_rollback.sql` only after stopping issuance and draining or explicitly reviewing all grant rows. The script intentionally raises an exception while rows remain. Never remove that guard to make teardown succeed. Any live rollback requires a new snapshot and an authorized live window.
