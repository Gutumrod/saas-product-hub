# CODEX REVIEW — LANE-B CONTROLLER PACKAGE — ROUND 3

Reviewed SHA: `c6c5467d0898f2033b8f5f14786a48e69b71f6f4`

Execution source checked: `D:\AI-Workspace\runtime\worktrees\house-h3d-h5-20260909` at `2b1af861aa608f08abb0bd8224821b9ca5ac9981`.

Verdict: **FAIL**

Mutation: **None to the package files or execution source.** This review file is the only requested deliverable written. No package fix was applied, no new package SHA exists, and nothing was pushed.

## Review basis

The target branch was at the requested SHA with a clean worktree before this review and remote parity `0/0`. The only REV3 package changes since `47eab10` are the specified revisions to A and C; B is unchanged. The H1 privilege inventory, runner source, teardown SQL, and operator pack were read from the stated execution baseline. No LAB, Supabase, Auth, or secret access was performed.

## Round-2 finding dispositions

- **NEW-DEFECT-01 — CLOSED:** C now records each of the seven non-operator files with its individual last-change SHA, correctly showing the Design document at `c0d95b532ffc447b59cbc72c3cfa5c3cca1a0df8` and the other six at `7ab7b6c471c227b24364b7d92d32ae7bfb421f07`; its `d6707c0..2b1af86` per-file log check is empty for all seven (C:36-74). Independent source verification produced the same results.
- **NEW-DEFECT-02 — CLOSED as a policy-table correction:** A now makes the W boundary stage-specific and gives H3D-LIVE exactly one named `wstera_platform_internal` exception, while retaining H3D-A1's no-exception row (A:77-110). The cited H1 net objects and privileges are accurate: `net._http_response` and `net.http_request_queue` have the listed seven PUBLIC privileges; `net.http_request_queue_id_seq` has `SELECT, USAGE, UPDATE`; schema `net` has `USAGE`; and H1 records 12 executable functions (H1:55-77). The operational gate that is supposed to prove this exception is still under-specified; see NEW-DEFECT-06 below.
- **NEW-DEFECT-03 — PARTIALLY CLOSED:** A now names all four required table write privileges (`INSERT`, `UPDATE`, `DELETE`, `TRUNCATE`) and describes a metadata-only check (A:256-264). However, its relation universe is internally wrong: it tells M to check the §1a base-reach relations and tells W to check everything outside fixtures/exception, while §1a explicitly accepts inherited `net` write reach for M/W. That makes the new false-write assertion stop on the accepted `net` relations instead of separating forbidden product writes from accepted managed-surface exposure. See NEW-DEFECT-07.
- **NEW-DEFECT-04 — CLOSED:** A clearly separates the required safe operator sequence from current runner behaviour (A:161-199). The current-behaviour description matches the source: `Ledger.cleanupAll()` uses `Promise.allSettled` over ledger items (runner:534-555), normal `--run` invokes it in `finally` (runner:918-924), and `--teardown-only` registers/cleans only the supplied identity/grant resources (runner:981-989). The statement that hook disable and expiry wait are external operator actions is also consistent with the operator pack:99-103.
- **NEW-DEFECT-05 — PARTIALLY CLOSED:** A adds `lock_timeout`, `statement_timeout`, rollback/finally requirements, and timeout classification (A:266). The 4s lock bound matches the real teardown, but the cited teardown uses a 30s statement timeout, not 10s (fixture teardown:21-23); 10s may be a reasonable stricter bound for this two-DDL probe, but it is not a matching bound as claimed. More importantly, the package still provides no actual wrapper, driver contract, or executable error-path implementation: “run inside a try/finally ... rollback (or closes the connection)” remains an instruction, not a verifiable guaranteed-rollback execution model. This is insufficient for the round-2 requirement that harmlessness not rest on prose alone.

## Further NEW-DEFECT findings

### NEW-DEFECT-06 — MEDIUM — the H3D-LIVE exception gate cannot prove an exhaustive object boundary

File: `docs/platform/shared-runtime/CREDENTIAL-STRATEGY-LANE-B-2026-09-22.md:265,301-308`

The exception table is textually exact, but the corresponding forbidden-reach assertion says to check “every other relation `information_schema.tables` lists” under `wstera_platform_internal`. `information_schema.tables` is privilege-filtered, so a relation for which the role has no visibility/privilege may not be listed at all. The check therefore cannot prove that no other `wstera_platform_internal` object is reachable. It also does not explicitly assert `UPDATE`, `TRUNCATE`, `REFERENCES`, and `TRIGGER` are false on the allowed `runtime_token_grants` table; “exactly `SELECT/INSERT/DELETE`” is prose, not a complete negative assertion.

Impact: the stage-specific table resolves the written contradiction, but the gate can pass without proving the “one table only, exact privilege set” boundary that the package says it consumes. The H3D-LIVE exception must be enumerated from a catalog relation set that is not silently filtered, and every non-allowed table privilege must be asserted false.

Required fix: make the H3D-LIVE allowlist executable and exact: enumerate all relations in the target schema from an appropriate catalog query, assert only `runtime_token_grants` is allowed, assert `SELECT/INSERT/DELETE = true` and all other relevant table privileges = false on that table, and assert no privilege on every other relation. Keep H3D-A1's allowlist empty.

### NEW-DEFECT-07 — MEDIUM — the revised all-privilege write check includes accepted managed-surface writes in its forbidden set

File: `docs/platform/shared-runtime/CREDENTIAL-STRATEGY-LANE-B-2026-09-22.md:85-94,128-135,256-264`

The §1a text explicitly records inherited PUBLIC write reach on `net` as accepted, bounded exposure for every M/W role. The revised window-open check nevertheless says that M must assert all four write privileges false for every relation in the §1a base-reach list, and that W must assert them false outside its fixture set and stage exception. That includes the accepted `net` relations (`net._http_response` and `net.http_request_queue`) and their write privileges.

Impact: a correctly shaped M/W role with the documented inherited `net` exposure will fail the window-open check before any gate runs. The check is therefore not executable as the effective-boundary contract currently states. The accepted managed surface needs a separate positive/zero-delta/static-use control, not a false “no write privilege” assertion.

Required fix: define the forbidden-write relation set as product/data relations only, explicitly exclude the accepted `cron`/`net` base exposure (and the H3D-LIVE named exception), and add separate assertions that the accepted managed surfaces are exactly the documented ones and are not used or changed by the tool. Do not weaken the four-privilege coverage for genuinely forbidden relations.

## Conclusion

REV3 closes the false per-file shared-SHA claim and accurately corrects the runner-order description. It does not yet provide an executable exact exception gate, an executable guaranteed-rollback trigger probe, or a coherent window-open write relation set. Do not release this package to AGY or authorize the next live checkpoint from `c6c5467`.
