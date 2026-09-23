#!/usr/bin/env node
// Target/provenance helper — contract §5 (U-R3, brief §1.1).
//
// Specification: docs/platform/shared-runtime/CREDENTIAL-STRATEGY-LANE-B-2026-09-22.md §5
// contract revision: planning branch work/house-lane-b-longrun-plan-20260922 @ b80f813.
//
// Every Lane-B connection must MEASURE its target before issuing a gate query and record
// the measured value, not a constant. A mismatch with LAB_REF STOPs (exit non-zero) and no
// gate output may be labelled LAB.
//
// OFFLINE. The connection-side parse is pure. The database-side evidence mechanism is a
// candidate only and is marked LIVE_DEFERRED_TO_A1_PREFLIGHT: §5 lets the implementing
// unit select it, subject to a live-readability check at the A1 preflight, which U-R3
// does not perform.

export const LAB_REF = "ykxlqnshaaxmzzocpjlj";

export const PROVENANCE_DEFERRED = "LIVE_DEFERRED_TO_A1_PREFLIGHT";

const REF_RE = /^[a-z0-9]{20}$/;

export function refFromPoolerUser(user) {
  if (typeof user !== "string") return null;
  const m = /\.([a-z0-9]{20})$/.exec(user.trim());
  return m ? m[1] : null;
}

export function refFromHost(host) {
  if (typeof host !== "string") return null;
  const m = /^db\.([a-z0-9]{20})\.supabase\.(?:co|com|net)$/.exec(host.trim());
  return m ? m[1] : null;
}

/**
 * Parse the project ref from the actual connection parameters. User and host must agree
 * when both carry a ref. Missing/ambiguous -> STOP before connecting.
 * Returns { ref, sources }.
 */
export function parseConnectionRef({ user, host } = {}) {
  const fromUser = refFromPoolerUser(user);
  const fromHost = refFromHost(host);
  const sources = { user: fromUser, host: fromHost };
  if (fromUser && fromHost && fromUser !== fromHost) {
    throw new Error(`connection ref disagreement: pooler user says '${fromUser}', host says '${fromHost}' — STOP`);
  }
  const ref = fromUser || fromHost || null;
  if (!ref || !REF_RE.test(ref)) {
    throw new Error("connection_ref is missing/ambiguous from the connection parameters — STOP before connecting");
  }
  return { ref, sources };
}

/**
 * Assert the measured target before any gate query. `databaseRefEvidence` is read AFTER
 * connecting (mechanism deferred); a mismatch with LAB_REF STOPs.
 */
export function assertMeasuredTarget({ connectionParams, databaseRefEvidence, labRef = LAB_REF } = {}) {
  const { ref: connectionRef, sources } = parseConnectionRef(connectionParams || {});
  if (connectionRef !== labRef) {
    throw new Error(`connection_ref '${connectionRef}' != LAB_REF '${labRef}' — STOP, no gate output labelled LAB`);
  }
  if (databaseRefEvidence === undefined || databaseRefEvidence === null || databaseRefEvidence === "") {
    throw new Error("database_ref_evidence is missing — STOP (a constant connection ref is not provenance)");
  }
  if (String(databaseRefEvidence) !== labRef) {
    throw new Error(`database_ref_evidence '${databaseRefEvidence}' != LAB_REF '${labRef}' — STOP (schema-identical foreign database?)`);
  }
  return Object.freeze({
    ok: true,
    connection_ref: connectionRef,
    connection_ref_sources: sources,
    database_ref_evidence: String(databaseRefEvidence),
    lab_ref: labRef,
  });
}

/**
 * Candidate database-side evidence query. Its discriminating power between two
 * schema-identical projects is NOT verified here — `LIVE_DEFERRED_TO_A1_PREFLIGHT`.
 */
export function databaseRefEvidenceSql() {
  return {
    deferred: PROVENANCE_DEFERRED,
    note:
      "database-side value that must differ between two schema-identical projects; " +
      "the mechanism is selected/verified at the A1 preflight under LIVE_DEFERRED_TO_A1_PREFLIGHT",
    sql: "SELECT current_setting('cluster_name', true) AS database_ref_evidence",
  };
}

// ---------------------------------------------------------------------------
// Offline selftest — negative controls
// ---------------------------------------------------------------------------

export function selftest() {
  let bad = 0;
  const ok = (c, m) => {
    if (!c) {
      process.stderr.write(`FAIL ${m}\n`);
      bad++;
    }
  };

  ok(refFromPoolerUser(`lane_b_measure_a1.${LAB_REF}`) === LAB_REF, "ref from pooler user suffix");
  ok(refFromHost(`db.${LAB_REF}.supabase.co`) === LAB_REF, "ref from db host");
  ok(refFromHost("db.other.supabase.co") === null, "non-matching host -> null");

  // agreement
  const parsed = parseConnectionRef({ user: `postgres.${LAB_REF}`, host: `db.${LAB_REF}.supabase.co` });
  ok(parsed.ref === LAB_REF && parsed.sources.user === LAB_REF && parsed.sources.host === LAB_REF, "agreeing user+host");
  // disagreement -> STOP
  {
    let threw = false;
    try { parseConnectionRef({ user: `postgres.${LAB_REF}`, host: "db.zzzzzzzzzzzzzzzzzzzz.supabase.co" }); } catch { threw = true; }
    ok(threw, "user/host ref disagreement STOPs");
  }
  // missing -> STOP
  {
    let threw = false;
    try { parseConnectionRef({ user: "postgres", host: "localhost" }); } catch { threw = true; }
    ok(threw, "missing ref STOPs before connecting");
  }
  // measured target positive
  ok(assertMeasuredTarget({ connectionParams: { user: `postgres.${LAB_REF}`, host: `db.${LAB_REF}.supabase.co` }, databaseRefEvidence: LAB_REF }).ok,
    "measured target agrees -> ok");
  // connection ref mismatch -> STOP
  {
    let threw = false;
    try {
      assertMeasuredTarget({ connectionParams: { user: `postgres.${LAB_REF}`, host: `db.${LAB_REF}.supabase.co` }, databaseRefEvidence: "other" });
    } catch { threw = true; }
    ok(threw, "database_ref_evidence mismatch STOPs");
  }
  // constant database-side evidence is rejected
  {
    let threw = false;
    try {
      assertMeasuredTarget({ connectionParams: { user: `postgres.otherrefaaaaaaaaaaaa`, host: "" }, databaseRefEvidence: "otherrefaaaaaaaaaaaa" });
    } catch { threw = true; }
    ok(threw, "connection_ref != LAB_REF STOPs even if database ref equals it");
  }
  {
    let threw = false;
    try { assertMeasuredTarget({ connectionParams: { user: `postgres.${LAB_REF}`, host: "" }, databaseRefEvidence: "" }); } catch { threw = true; }
    ok(threw, "empty database evidence STOPs (constant is not provenance)");
  }
  ok(databaseRefEvidenceSql().deferred === PROVENANCE_DEFERRED, "database-side mechanism is marked LIVE_DEFERRED_TO_A1_PREFLIGHT");

  process.stderr.write(bad ? `\nPROVENANCE SELFTEST: ${bad} FAILURE(S)\n` : "\nPROVENANCE SELFTEST PASS\n");
  return bad;
}

export default { LAB_REF, parseConnectionRef, assertMeasuredTarget, databaseRefEvidenceSql };

if (process.argv[1] && process.argv[1].replace(/\\/g, "/").endsWith("lib/provenance.mjs")) {
  if (process.argv.includes("--selftest")) process.exit(selftest() ? 1 : 0);
  else {
    process.stderr.write("usage: provenance.mjs --selftest\n");
    process.exit(2);
  }
}
