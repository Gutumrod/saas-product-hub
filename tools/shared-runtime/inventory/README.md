# Lane B capture preflight

`lane-b-effective-reach.mjs --capture` is the only executable capture entry point. It checks the explicit project ref and parses the database URL with the same `pg-connection-string` parser used by `pg` before constructing or connecting a PostgreSQL client. Preflight validates the effective host, port, user, and database that will be passed to `pg`; query parameters are rejected except `sslmode=verify-full`, which retains TLS verification. The project ref must equal the pinned LAB ref in `lane-b-capture-config.json`. Accepted targets are the direct `db.<ref>.supabase.co` host, or a Supavisor **session pooler** host matching `aws-<n>-<region>.pooler.supabase.com` on port `5432` with username exactly `postgres.<ref>`. The database must be `postgres`. Pooler transaction port `6543`, other suffixes, production/foreign refs, and a pooler username with a mismatched ref fail before connect.

## Inputs

| Variable | Required | Safe example |
|---|---:|---|
| `LANE_B_PROJECT_REF` | yes | `ykxlqnshaaxmzzocpjlj` |
| `LANE_B_DATABASE_URL` | yes | Direct: `postgresql://<operator>:<password>@db.ykxlqnshaaxmzzocpjlj.supabase.co:5432/postgres`; session pooler: `postgresql://postgres.ykxlqnshaaxmzzocpjlj:<password>@aws-<n>-<region>.pooler.supabase.com:5432/postgres` (templates only; never print or save the credential) |
| `LANE_B_STAGE` | no | `H3D-LIVE` |
| `LANE_B_CAPTURE_OUTPUT` | yes | `D:\AI-Workspace\runtime\relay\house-20260928\live-window-last-mile\lane-b-capture.json` |

Set the database URL through the operator's approved secret-input mechanism. Do not pass it as a command-line argument, echo it, or place it in a repository, transcript, or evidence file. The output path must be absolute and outside the repository worktree.

## Execution and cleanup

After preflight only, the tool requires a clean worktree, then creates a uniquely named temporary `lane_b_probe_*` role from the pinned generated H3D runbook: membership plus the exact stage grants. It has no password and expires after 15 minutes as a crash-safety bound; it is used only as the subject of catalog `has_*_privilege` queries on the operator/admin connection. The tool never logs in as the measurement role; if a probe requires that, stop and ask for a reviewed design. The `finally` path revokes its grants, drops it, and verifies that it is absent; if the first connection fails during cleanup, the tool attempts cleanup through a new connection to the already-validated target. A cleanup failure returns non-zero and writes no artifact.

The capture uses catalog `SELECT` queries only besides creation and teardown of this temporary measurement role. No customer or business rows are queried. The artifact contains these header fields: `project_ref`, credential-free `host`, `captured_at_utc`, `tool_git_sha`, and `output_sha256`. The digest is SHA-256 of the `data` object serialized as stable UTF-8 JSON with a trailing LF. No password or connection URL is written or logged.

Before every capture, run a read-only `SELECT rolname FROM pg_catalog.pg_roles WHERE rolname LIKE 'lane_b_probe_%' ORDER BY rolname` against the approved target. It must return zero rows; if any row exists, stop and report it—do not drop it manually.

Offline-only tests inject a client stub and count connection construction. They cover wrong refs (including production), direct and session-pooler targets, mismatched pooler refs, effective `user`/`host`/`port` override attempts, unknown and TLS-disabling query params, fake suffixes, transaction port rejection, error redaction, and error cleanup. Diagnostics redact credentials, hosts, resolved IP addresses, and the pinned LAB project ref. Run them with `node --test tools/shared-runtime/inventory/lane-b-effective-reach.capture.test.mjs` or through `npm run selftest` from `tools/shared-runtime`. Do not run `--capture` as part of source-only validation; that command opens a database connection after preflight.
