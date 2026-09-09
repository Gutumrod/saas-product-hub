# BRIEF — H3C Live Harness Classifier Remediation

Date: 2026-09-09
Mode: WSTERA HOUSE / H3C PROOF HARNESS REMEDIATION ONLY

## Trigger

Final safe-mode run produced valid hosted Auth/runtime evidence but the gate returned FAIL.
Evidence: `evidence/H3C-FINAL-LIVE-PROOF-2026-09-09.json`.

Observed facts from live response:
- TOK-1..TOK-7 PASS; runtime role `ps01_line_runtime`; JWT lifetime 300s.
- POS-1/POS-2 and POS-AUTHZ-1..3 PASS; control token PASS.
- POS-GRANTS blocked only because privilege snapshot age exceeded 15 minutes at harness start.
- Internal/non-exposed schemas returned HTTP 406 + `PGRST106 Invalid schema`; this is an explicit Data API routing denial but current `failsClosed()` does not accept 406.
- Storage returned outer HTTP 400 with body `statusCode=403`, `Unauthorized`, `permission denied for schema storage`, `code=AccessDenied`; current storage classifier ignores this explicit denial.
- NEG-EXP-1 returned 200 only ~3 seconds after JWT `exp`; expiry behavior must be re-proved after a larger post-expiry margin.
## Authorized remediation

1. Harness classifier only: accept HTTP 406 with a known PostgREST routing-not-found code (including `PGRST106`) as fail-closed.
2. Storage classifier only: accept the observed strict explicit denial shape: outer 400 + `AccessDenied` + body `statusCode=403` + Unauthorized/permission-denied text.
3. Add offline self-tests for both classifier cases and preserve 2xx/5xx fail behavior.
4. Runner v3 stays outside repo; after expiry wait it refreshes the canonical privilege snapshot using linked Supabase CLI + `h3c-privilege-snapshot.sql` before issuing fresh runtime/control tokens.
5. Expired-token proof must wait at least 65 seconds beyond JWT `exp` before NEG-EXP-1.

## Hard guards

- WSTERA LAB only; production locked.
- No schema/runtime privilege redesign.
- No submit invocation; safe-read-only mode only.
- No migration and no fixture mutation.
- No H3C/HOUSE-A PASS unless every required probe is PASS under the explicit gate and teardown is complete.
- If NEG-EXP-1 still returns 2xx after the larger margin, stop and treat it as a real blocker; do not relax the gate.
