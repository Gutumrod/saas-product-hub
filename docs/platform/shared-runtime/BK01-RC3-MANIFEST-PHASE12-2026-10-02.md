# BK01 RC3 manifest Phase 1–2 — offline execution contract

Owner authorized 2026-10-02: diagnose platform-admin RPC and D3 first; repair only
confirmed chain bug with180000, then versioned manifest and offline tool proof.
Claude retains claim/commit/push ownership. No LAB/production/GO/merge.

## Source-of-Truth References

- Booking RC3 `c750d4a83ccfa57356dd64334418fe98d3e01bc1`,
  `supabase/migrations/20260813092245_platform_admin_authorization.sql`,
  `scripts/rc-harness/e2e.mjs`, `scripts/rc-harness/gateway.mjs`,
  `scripts/lib/bk01-migration-policy.mjs`, `supabase/bk01-migrations/`.
- House `483244c275b26e5e2222dbe2391886af096c548f`,
  `tools/shared-runtime/platform-sql/{manifest.json,apply-platform-sql.mjs}`.
- Original bootstrap `32df434e1057a83ecbf0c290a659be42f24bbc55`;
  preserve order10/source/hash separately from product release provenance.
- Second Brain `06-Agent-Logs/WSTERA-House/PLAN-LAB-GO-BK01-2026-10-02.md`
  and `reports/REPORT-CODEX-HOUSE-BK01-RC3-PIN-PREFLIGHT-2026-10-02.md`.
- Direct reproduction in external completed simulated-chain cluster
  `HOUSE-BK01-RC3-OFFLINE/20261002T152409890Z/platform-admin-chain-reproduction.json`:
  RPC present, authorized real authenticated role fails42804 at column11 both
  bootstrap+15 ledger0 and RC3 ledger14. This is not a trial-only function.

## Route / scope / invariants

Bug diagnosis → migration remediation → manifest/tooling → offline regression.
Reuse Gate N/A under Module Reuse Policy §123: preserves existing RPC/bootstrap/
verification capability; no new service, function signature or product runtime.
Do not edit frozen legacy SQL or shared modules upstream. No app/UI changes.

## Tickets and acceptance

1. Diagnose D1 and D3. D1 confirmed above. For D3 compare actual client SDK
   File/multipart upload against the raw PNG PUT used by passing R3; canonical
   House Storage and harness fixture bytes share SHA256 a14dceef...b5c4d3.
   Report measured differences; no claim that raw PUT covers browser multipart.
2. Booking180000: CREATE OR REPLACE exact existing platform_admin_list_shops(),
   cast subscription plan and status to text for the existing composite type;
   preserve signature, SECURITY DEFINER, search_path, auth gate, owner and ACL.
   Existing PUBLIC revoke is repeated solely for migration-policy compliance;
   it must cause zero ACL delta. No runtime allowlist change (exact21). Reproduce
   red-before, green-after, non-admin denial, null LEFT JOIN fields, raw owner/ACL
   delta[], rollback restoring old function/body and red behavior, then reapply.
3. Version2 manifest separate from historical manifest.json. Preserve House
   stage paths/hashes/bootstrap source. Build accepted product ledger15 from
   pinned RC3 first14 + hash-bound candidate180000. Declare uncommitted overlay
   as LOCAL_ONLY and refuse operational use until controller publishes/re-pins
   product commit; never invent a new commit SHA. Support explicit manifest hash
   selection. Keep old manifest behavior intact. Final verification requires
   exact15 ledger entries and exact21 identities, independently of permissive
   intermediate prefix checks.
4. Real local PG proof via existing executePlatformSql dependency-injection seam:
   injected pg client always connects to newly owned loopback cluster, never
   supplied target configuration. Original target guard remains intact. Tool
   simulation receipts are external, labeled OFFLINE ONLY and forbidden as LAB
   history. Prove platform sequence and state checks with actual SQL, product
   runner through180000/no-op, release final gate, and old-manifest rejection.
   Exercise prefixes0..15 and reject checksum mismatch, skipped/extra/reordered/
   duplicate rows. Wrong manifest/provenance hashes fail before connection.

## Failure / closeout

Stop on source/hash/ACL/allowlist drift; preserve failed evidence and stop owned
cluster. No fallback, guard skip, hosted credentials or history rewriting.
Run relevant native tests/syntax/policy/SQL proofs, inspect exact diff and scan
curated content. Record uncommitted candidate hashes/full parent SHAs, D1/D3
facts, verified gates and required controller commit/re-pin/AGY review. Original
LAB history/recovery and fresh Owner GO remain separate Phase3 gates.
