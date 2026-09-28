# Lane B capture preflight

`lane-b-effective-reach.mjs --capture` is the only executable capture entry point. It checks the explicit project ref and parses the database URL before constructing or connecting a PostgreSQL client. The project ref must equal the pinned LAB ref in `lane-b-capture-config.json`; the database hostname must be exactly `db.<ref>.supabase.co`. Production, every foreign ref, pooler hosts without an unambiguous project host, and mismatched ref/host pairs fail before connect.

## Inputs

| Variable | Required | Safe example |
|---|---:|---|
| `LANE_B_PROJECT_REF` | yes | `ykxlqnshaaxmzzocpjlj` |
| `LANE_B_DATABASE_URL` | yes | `postgresql://operator:<password>@db.ykxlqnshaaxmzzocpjlj.supabase.co:5432/postgres` (template only; never print or save the credential) |
| `LANE_B_STAGE` | no | `H3D-LIVE` |
| `LANE_B_CAPTURE_OUTPUT` | yes | `D:\AI-Workspace\runtime\relay\house-20260928\live-window-last-mile\lane-b-capture.json` |

Set the database URL through the operator's approved secret-input mechanism. Do not pass it as a command-line argument, echo it, or place it in a repository, transcript, or evidence file. The output path must be absolute and outside the repository worktree.

## Execution and cleanup

After preflight only, the tool requires a clean worktree, then creates a uniquely named temporary `lane_b_probe_*` role from the pinned generated H3D runbook: membership plus the exact stage grants. It has no password and expires after 15 minutes as a crash-safety bound; it is used only for catalog privilege queries. The `finally` path revokes its grants, drops it, and verifies that it is absent; if the first connection fails during cleanup, the tool attempts cleanup through a new connection to the already-validated target. A cleanup failure returns non-zero and writes no artifact.

The capture uses catalog `SELECT` queries only besides creation and teardown of this temporary measurement role. No customer or business rows are queried. The artifact contains these header fields: `project_ref`, credential-free `host`, `captured_at_utc`, `tool_git_sha`, and `output_sha256`. The digest is SHA-256 of the `data` object serialized as stable UTF-8 JSON with a trailing LF. No password or connection URL is written or logged.

Offline-only tests inject a client stub and count connection construction. They cover wrong refs (including production), mismatched hosts, valid preflight, and error cleanup. Run them with `node --test tools/shared-runtime/inventory/lane-b-effective-reach.capture.test.mjs` or through `npm run selftest` from `tools/shared-runtime`. Do not run `--capture` as part of source-only validation; that command opens a database connection after preflight.
