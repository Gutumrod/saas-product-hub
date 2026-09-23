# R2 F-OP-01 AMENDMENT — CODEX VERDICT ROUND 2 (recorded)

Task: `WSTERA-CONTROL-TRUTH-SYNC-001` · Workflow `WF-DEV-01 v1.3.0 / LONG_RUN`
Reviewer: `agent-codex` via `codex exec -s read-only -m gpt-5.5`
Reviewed: 2026-09-23 (Asia/Bangkok)
Raw transcript: `D:/AI-Workspace/runtime/hermes-native/workspace/wstera-cts-001/fop-amendment/FOP-CODEX-VERDICT-R2.txt`
Raw exit: `CODEX_EXIT=0` · tokens used 112,844

## Verdict

```text
VERDICT: APPROVED_WITH_FINDINGS
REVISION_UNDER_REVIEW: 4ca08f2578335c887bc119c6546c8f9d9be1276b
FINDINGS: None requiring artifact change.
```

This is a **source/docs/tooling verdict only**. It is NOT deployment approval, NOT DB-migration
approval, NOT authorization to set the live-access guards, NOT runtime-skill installation approval,
and NOT live behaviour evidence. It does NOT authorize `LANE_A_PRODUCTION_RELEASE_V1`.

## Artifacts the reviewer measured

| Artifact | sha256 (reviewer-measured) | matches commander |
|---|---|---|
| `tools/lane-a-exact-file-postgres-apply.mjs` | `d87bd4aa938d0d0a853cea84289e182d29e2cafe6237ff2df3e4fb5a3a77398b` | ✅ |
| `tools/tests/fop-helper-verify.mjs` | `f62317c26923a0b41b143e48f0ed71ea8b8c5f8b1f4e2deb52ba89e4440f0b8c` | ✅ |
| `RUNBOOK-LANE-A-EXPAND-DEPLOY-CONTRACT-2026-09-23.md` | `1f2c203d643e8455f954fb94e19dbd6dcb4918a61d96526c9830428d20f8f082` | ✅ |
| `FINDING-MIGRATION-RUNNER-CONTRADICTS-BRIEF-2026-09-23.md` | `2391703b0152666b517abe6f4537cf6f920d91ea975216d8764a8a8264c70bf4` | ✅ |
| `FOP-01-AMENDMENT-EVIDENCE-PACKET-2026-09-23.md` | `3d320faacb761edaef48c68dae76ef59b4a7f630ad699527333a7206d3a07e63` | ✅ |

## Revisions verified

```text
planning HEAD        4ca08f2578335c887bc119c6546c8f9d9be1276b
hub-web HEAD         dd9a629eaa4e75c29fe0b8aa31698b5f9c4e1dae   clean
wstera-workflows     fb84b9d6517186246dacde2871937d98c52ec7a6   clean
0009 @ EXPAND        sha256 8f88a7d1e4d3777dd0c2adefa999f61799bd50dd1270407fa025f3c4068d3487
0010 @ CONTRACT      sha256 3963c6a6e6423f006889d87c735e86ef30831680964c19b096f23f2b091a7b30
0010 absent at EXPAND: PASS
```

## Round-1 findings closure

| Round-1 finding | Closure | Evidence the reviewer cited |
|---|---|---|
| **BLOCKING 1** — 0010 sequencing enforced only the 0009 apply record, not a live-Worker proof | **CLOSED** | the helper now requires `4a` a successful 0009 apply **and** `4b` a worker-live proof, and explicitly rejects the 0009 record as that proof — `lane-a-exact-file-postgres-apply.mjs:44-57`, `:969-989` |
| **BLOCKING 2** — the harness `PASS` claim did not reproduce in the reviewer's sandbox (22 failures caused by unspawnable child processes) | **CLOSED by code inspection** — runtime gate UNVERIFIED in that sandbox | the harness probes spawn once and reports `SKIP_UNSPAWNABLE`, never PASS/FAIL; a failing runnable case still exits non-zero — `fop-helper-verify.mjs:35-45`, `:105-114`, `:192-205`, `:1285-1298` |
| **HIGH 3** — the harness was not read-only; it wrote artifacts inside the tree | **CLOSED by code inspection** — runtime gate UNVERIFIED in that sandbox | scratch lives outside the repo and is removed in read-only mode — `fop-helper-verify.mjs:17-33`, `:120-133`, `:1304-1308`; porcelain before/after the reviewer's attempted run was unchanged |

## Reviewer's answer to the key question

> *Is F-OP-01 closed at the operator-contract / source-docs-tooling level?* — **Yes**, at the
> operator-contract/source-docs-tooling level. What remains is the Owner release authorization.

## Gates: reviewer-verified vs UNVERIFIED

Independently verified by the reviewer:

```text
node --check helper            -> PASS
node --check harness           -> PASS
git diff --check               -> PASS
secret scan (helper+harness)   -> PASS, 0 findings
migration identity extraction  -> PASS
0010 absence at EXPAND         -> PASS
```

UNVERIFIED by the reviewer (sandbox could not write to a temp directory, so `mkdtemp` was denied):

```text
full harness execution (default mode)
full harness execution (read-only mode)
```

The reviewer classified this correctly as **sandbox temp-write denial, not an artifact failure**,
and recorded that porcelain was unchanged before and after its attempted run.

Commander-measured in an environment with spawning and temp writes available:

```text
default mode     -> exit 0, FOP_HELPER_VERIFY_TOTAL: 44/44 PASS
read-only mode   -> exit 0, FOP_HELPER_VERIFY_TOTAL: 44/44 PASS, scratch removed on exit
porcelain before/after read-only run -> identical
```

**Standing caveat, stated plainly:** the two harness runtime gates are proven by the commander and
the reviewer, in two independent environments with different constraints. Neither environment
exhibits both a full harness run and the reviewer's independence. The reviewer verified those two
gates by code inspection and the commander verified them by execution. This split is recorded rather
than smoothed over: it is the same sandbox limitation recorded at earlier reviews of this task
(`spawn EPERM` / temp-write denial).

## Post-review immutability check (commander-measured)

| Repository | HEAD | dirty | parity |
|---|---|---|---|
| planning | `4ca08f2` | 0 | 0/0 |
| `hub-web` | `dd9a629` | 0 | 0/0 |
| `wstera-workflows` | `fb84b9d` | 0 | 0/0 |

Helper and harness hashes after the review are identical to the values the reviewer measured — the
review mutated nothing. The reviewer reported `FILES_MUTATED_BY_REVIEWER` as none, and the
read-only mode change means a reviewer running the harness no longer mutates the tree at all; that
defect (round-1 HIGH 3) is what this round closed.

## Non-claims

- Not deployment approval.
- Not DB-migration approval.
- Not authorization to set `LANE_A_LIVE_DB_AUTHORIZED` or `LANE_A_PRODUCTION_APPLY_AUTHORIZED`.
- Not runtime-skill installation approval.
- Not live behaviour evidence.
- Not authorization for `LANE_A_PRODUCTION_RELEASE_V1`.
- No database was contacted, no connection attempted, no migration applied, no deploy, no skill install.
