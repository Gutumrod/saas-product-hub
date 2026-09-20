# T5 CANDIDATE FREEZE — SINGLE SOURCE OF TRUTH — WSTERA-HOUSE-PRODUCTION-CLOSURE-001

Task: `WSTERA-HOUSE-PRODUCTION-CLOSURE-001` · Stage T5 · Recorded: 2026-09-20 (Asia/Bangkok)

**This file is the ONLY authoritative statement of the T5 candidate revision.** Other T5 documents
reference this file by name instead of repeating a SHA, so a candidate move cannot leave them stale.

## Frozen candidate

| Item | Value |
|---|---|
| Repository | `Gutumrod/hub-web` |
| Branch | `work/house-platform-closure-20260919` |
| **Frozen revision** | **`679ff279e5ff2a9a3006bea79ccc6ccde90715ec`** |
| Remote parity | upstream equals the same SHA (verified) |
| Worktree | clean (verified) |
| Coordination revision | `Gutumrod/saas-product-hub` `work/house-production-closure-longrun-20260919` |

## Freeze verification performed at this revision (re-run, not asserted)

```
cd apps/hub-web
git rev-parse HEAD                      -> 679ff279e5ff2a9a3006bea79ccc6ccde90715ec
git status --short                      -> empty
git rev-parse @{u}                      -> same SHA
npx tsc --noEmit                        -> exit 0
npx vitest run                          -> 25 files, 366 tests, all passing
```

## Revision history of this candidate (history only — never current evidence)

| Revision | Role |
|---|---|
| `32daeea` | initial T4 delivery |
| `93fedeb` | T4 B4 R1 remediation |
| `390ad0f` | T4 B4 R2 remediation |
| `381fef3` | T4 final (B4 BATCH_APPROVED) |
| `15b1579` | T5-WU02 hardening |
| `0bde138` | T5 B5 R1 remediation |
| `0e4494d` | scanner-fixture fix |
| `61acf52` | B5 R2 remediation + import-closure guard |
| `e6d367c` | B5 R3 remediation: allowlisted-module blind spot closed |
| **`679ff27`** | **B5 R5 remediation: external-import declaration + outbound-call guard + narrowed claim — FROZEN CANDIDATE** |

## Freeze rule

No further source change is permitted before WU05. If any material change occurs, this file must be
updated **and** the B5 pre-deploy review re-run against the new revision. Any T5 document that names a
different revision than this one is stale by definition — report it, do not reconcile it silently.

## Deploy gate state

Per the B5 reviews, a code-only deploy is approvable once this record and the readiness/qualification
documents all bind to this revision and WU05 re-verifies exact SHA, clean status, remote parity, and
builds from this exact candidate. **Capability activation is not approved** and must be sequenced per
the reviewed order.
