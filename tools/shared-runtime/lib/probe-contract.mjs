#!/usr/bin/env node
// Executable trigger-DDL probe contract — contract §3b (closes NEW-DEFECT-05 / IF-02).
//
// Specification: docs/platform/shared-runtime/CREDENTIAL-STRATEGY-LANE-B-2026-09-22.md §3b
// contract revision: planning branch work/house-lane-b-longrun-plan-20260922 @ b80f813.
//
// The wrapper guarantees session termination on EVERY path — success, 42501, a
// lock/statement timeout abort, an unexpected rethrow, AND a throw from client.connect()
// — because connect() is INSIDE the outer guard whose finally always runs, and the
// bounded race prevents a wedged socket from hanging the wrapper.
//
// OFFLINE: this module is exercised by fake clients in selftest/`--selftest`. Nothing
// here connects unless a caller supplies a real connection and no fake client factory.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));

export const PROBE_BOUNDS = Object.freeze({
  lock_timeout: "4s",
  statement_timeout: "30s",
  idle_in_transaction_session_timeout: "30s",
});

export const TRIGGER_TABLE = "ps01.subscription_audit_log";
export const TRIGGER_NAME = "trg_subscription_audit_immutable";

/**
 * Bounded guaranteed teardown. `client.end()` runs on every exit path; the race means a
 * wedged socket cannot hang the wrapper. Errors from end() are swallowed (the session is
 * already being torn down).
 */
export async function endGuaranteed(client, ms = 5000) {
  if (!client || typeof client.end !== "function") return;
  await Promise.race([
    Promise.resolve()
      .then(() => client.end())
      .catch(() => {}),
    new Promise((resolve) => setTimeout(resolve, ms)),
  ]);
}

export async function defaultMakeClient(wRoleUrl) {
  const { default: pg } = await import("pg");
  return new pg.Client({ connectionString: wRoleUrl });
}

/**
 * Guaranteed-teardown wrapper. `connect()` is INSIDE the guard: a failure there is still
 * covered by the outer finally (the round-4 gap).
 */
export async function withRoleSession(wRoleUrl, fn, { makeClient = defaultMakeClient, endMs = 5000 } = {}) {
  const client = await makeClient(wRoleUrl);
  try {
    await client.connect(); // INSIDE the guard: a failure here is covered
    return await fn(client);
  } finally {
    await endGuaranteed(client, endMs); // success, error, timeout, and connect() failure
  }
}

function timeoutCode(code) {
  return typeof code === "string" && /^(55P03|57014)$/.test(code);
}

/**
 * Trigger-DDL capability probe (L6 ownership capability). Bounds identical to
 * docs/platform/shared-runtime/fixtures/h3d-authz-fixture-teardown.sql:21-23.
 * Returns { capable: true } | { capable: false, code: '42501' } |
 * { capable: 'UNMEASURED', code } ; unexpected errors rethrow and are still torn down.
 */
export async function probeTriggerDdl(wRoleUrl, opts = {}) {
  return withRoleSession(wRoleUrl, async (client) => {
    let result;
    try {
      await client.query("BEGIN");
      await client.query(`SET LOCAL lock_timeout = '${PROBE_BOUNDS.lock_timeout}'`);
      await client.query(`SET LOCAL statement_timeout = '${PROBE_BOUNDS.statement_timeout}'`);
      await client.query(
        `SET LOCAL idle_in_transaction_session_timeout = '${PROBE_BOUNDS.idle_in_transaction_session_timeout}'`,
      );
      await client.query(`ALTER TABLE ${TRIGGER_TABLE} DISABLE TRIGGER ${TRIGGER_NAME}`);
      await client.query(`ALTER TABLE ${TRIGGER_TABLE} ENABLE TRIGGER ${TRIGGER_NAME}`);
      result = { capable: true };
    } catch (e) {
      result = /42501/.test(e && e.code)
        ? { capable: false, code: e.code }
        : timeoutCode(e && e.code)
          ? { capable: "UNMEASURED", code: e.code }
          : (() => {
              throw e;
            })(); // unexpected error -> rethrown, still torn down by the outer finally
    } finally {
      try {
        await client.query("ROLLBACK");
      } catch {
        // No ROLLBACK possible (socket gone). PostgreSQL aborts the still-open server-side
        // transaction on client disconnect, so the DDL cannot persist.
      }
    }
    return result;
  }, opts);
}

// ---------------------------------------------------------------------------
// Offline selftest — every path must terminate the session (negative controls)
// ---------------------------------------------------------------------------

function makeFakeClient({ failConnect = false, failOn = null, code = null, hangEnd = false, record } = {}) {
  const calls = [];
  const client = {
    calls,
    async connect() {
      calls.push("connect");
      if (failConnect) throw Object.assign(new Error("connect failed"), { code: "ECONNREFUSED" });
    },
    async query(sql) {
      calls.push(sql);
      if (failOn && sql.includes(failOn)) throw Object.assign(new Error("probe failure"), { code });
      return { rows: [] };
    },
    async end() {
      calls.push("end");
      if (hangEnd) return new Promise(() => {});
      return undefined;
    },
  };
  return client;
}

export function selftest() {
  let bad = 0;
  const ok = (c, m) => {
    if (!c) {
      process.stderr.write(`FAIL ${m}\n`);
      bad++;
    }
  };

  const run = async () => {
    // 1. connect() throws -> end() STILL runs (would fail if connect were outside the guard)
    {
      const c = makeFakeClient({ failConnect: true });
      let threw = false;
      try {
        await withRoleSession("postgres://x", async () => "nope", { makeClient: async () => c });
      } catch {
        threw = true;
      }
      ok(threw, "connect() throw propagates");
      ok(c.calls.includes("end"), "connect() throw STILL tears the session down (outer finally)");
    }
    // 2. fn throws -> end() runs
    {
      const c = makeFakeClient();
      let threw = false;
      try {
        await withRoleSession("postgres://x", async () => { throw new Error("boom"); }, { makeClient: async () => c });
      } catch {
        threw = true;
      }
      ok(threw && c.calls.includes("end"), "fn throw tears the session down");
    }
    // 3. success -> end() runs
    {
      const c = makeFakeClient();
      const r = await withRoleSession("postgres://x", async () => 42, { makeClient: async () => c });
      ok(r === 42 && c.calls.includes("end"), "success tears the session down");
    }
    // 4. wedged end() -> bounded race returns (does not hang)
    {
      const c = makeFakeClient({ hangEnd: true });
      const t0 = Date.now();
      await withRoleSession("postgres://x", async () => 1, { makeClient: async () => c, endMs: 40 });
      ok(Date.now() - t0 < 1000, "wedged end() is bounded by the race");
    }
    // 5. 42501 -> capable false, torn down
    {
      const c = makeFakeClient({ failOn: "DISABLE TRIGGER", code: "42501" });
      const r = await probeTriggerDdl("postgres://x", { makeClient: async () => c });
      ok(r.capable === false && r.code === "42501", "42501 -> capable:false");
      ok(c.calls.includes("end"), "42501 tears the session down");
    }
    // 6. 55P03 / 57014 -> UNMEASURED, torn down
    for (const code of ["55P03", "57014"]) {
      const c = makeFakeClient({ failOn: "DISABLE TRIGGER", code });
      const r = await probeTriggerDdl("postgres://x", { makeClient: async () => c });
      ok(r.capable === "UNMEASURED" && r.code === code, `${code} -> UNMEASURED`);
      ok(c.calls.includes("end"), `${code} tears the session down`);
    }
    // 7. unexpected error -> rethrow + torn down
    {
      const c = makeFakeClient({ failOn: "ENABLE TRIGGER", code: "40001" });
      let threw = false;
      try {
        await probeTriggerDdl("postgres://x", { makeClient: async () => c });
      } catch {
        threw = true;
      }
      ok(threw, "unexpected error rethrows");
      ok(c.calls.includes("end"), "unexpected error still tears the session down");
    }
    // 8. positive: exact bounds + statements + ROLLBACK
    {
      const c = makeFakeClient();
      const r = await probeTriggerDdl("postgres://x", { makeClient: async () => c });
      const q = c.calls.filter((x) => typeof x === "string");
      ok(r.capable === true, "clean probe -> capable:true");
      ok(q.includes("BEGIN"), "probe opens a transaction");
      ok(q.includes(`SET LOCAL lock_timeout = '4s'`), "lock_timeout bound is 4s");
      ok(q.includes(`SET LOCAL statement_timeout = '30s'`), "statement_timeout bound is 30s");
      ok(q.includes(`SET LOCAL idle_in_transaction_session_timeout = '30s'`), "idle_in_transaction_session_timeout bound is 30s");
      ok(q.some((s) => s.includes("DISABLE TRIGGER")), "probe disables the exact trigger");
      ok(q.some((s) => s.includes("ENABLE TRIGGER")), "probe re-enables the exact trigger");
      ok(q.includes("ROLLBACK"), "probe rolls back");
      ok(c.calls.indexOf("end") === c.calls.length - 1, "end() is the last action");
    }
    // 9. bounds match the real teardown bounds (read from the fixture, not hard-coded twice)
    {
      const teardown = fs.readFileSync(path.resolve(HERE, "../../../docs/platform/shared-runtime/fixtures/h3d-authz-fixture-teardown.sql"), "utf8");
      ok(teardown.includes(`lock_timeout = '${PROBE_BOUNDS.lock_timeout}'`), "real teardown lock_timeout matches probe");
      ok(teardown.includes(`statement_timeout = '${PROBE_BOUNDS.statement_timeout}'`), "real teardown statement_timeout matches probe");
      ok(teardown.includes(`idle_in_transaction_session_timeout = '${PROBE_BOUNDS.idle_in_transaction_session_timeout}'`), "real teardown idle timeout matches probe");
    }
  };

  return run().then(() => {
    process.stderr.write(bad ? `\nPROBE-CONTRACT SELFTEST: ${bad} FAILURE(S)\n` : "\nPROBE-CONTRACT SELFTEST PASS (guaranteed teardown on every path)\n");
    return bad;
  });
}

export default { PROBE_BOUNDS, endGuaranteed, withRoleSession, probeTriggerDdl };

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (process.argv.includes("--selftest")) {
    selftest().then((bad) => process.exit(bad ? 1 : 0));
  } else {
    process.stderr.write("usage: probe-contract.mjs --selftest\n");
    process.exit(2);
  }
}
