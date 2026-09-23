#!/usr/bin/env node
// Lane-B effective-reach + catalog-inventory executable checks (U-R3).
//
// Specification: docs/platform/shared-runtime/CREDENTIAL-STRATEGY-LANE-B-2026-09-22.md
//   §3 (per-row layer asserted) · §3.0 (qualified identity) · §3.1 (two labelled contracts)
// contract revision: planning branch work/house-lane-b-longrun-plan-20260922 @ b80f813.
//
// OFFLINE. `--evaluate` and `--selftest` run over already-measured catalog data and open
// no database connection. The only path that would touch LAB is `--capture`, which is
// marked LIVE_DEFERRED_TO_A1_PREFLIGHT and refuses to run in this unit.
//
// The two conclusions here are deliberately separate and labelled:
//   Contract A — effective reach  = L2 object grant AND L3 schema USAGE on the same object
//   Contract B — catalog inventory = L1 presence only; it never concludes about reach
// Conflating them was NEW-DEFECT-09.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  CONTRACT,
  LAYER,
  loadAllowlist,
  qualifiedName,
  sameRelation,
  objectGrant,
  effectiveReach,
  catalogPresence,
  assertEffectiveReachContract,
  inventoryCatalogSurface,
  requireContract,
  checkAlwaysForbiddenSchemas,
  checkForbiddenReachW,
  checkForbiddenWritePrivileges,
  acceptedExposureEffectiveReach,
  acceptedExposureCatalogInventory,
  RELKIND,
} from "../lib/six-layer-privileges.mjs";

export const DEFERRED = "LIVE_DEFERRED_TO_A1_PREFLIGHT";

function productUniverse(enumeration) {
  return (enumeration || []).filter((r) => r.nspname === "ps01" && [...RELKIND.TABLE].includes(r.relkind));
}

/**
 * Offline evaluation of one measured dataset. Each block is tagged with the single layer
 * (or contract) it concludes at; no block concludes about a layer it did not read.
 */
export function evaluateMeasured(dataset) {
  const allowlist = loadAllowlist();
  const stage = dataset.stage;
  if (!stage || !allowlist.stages[stage]) {
    throw new Error(
      `dataset.stage '${stage}' is not a §1a stage — a check that concludes about an unnamed stage is forbidden (G-ALLOWLIST-SINGLE-SOURCE)`,
    );
  }
  const enumeration = dataset.enumeration || [];
  const grantsByOid = dataset.grantsByOid || {};
  const usageBySchema = dataset.usageBySchema || {};

  const alwaysForbidden = checkAlwaysForbiddenSchemas({ allowlist, usageBySchema });
  const contractA = acceptedExposureEffectiveReach({ allowlist, enumeration, grantsByOid, usageBySchema });
  const contractB = acceptedExposureCatalogInventory({ allowlist, enumeration });
  // The forbidden-reach row is asserted for the dataset's own stage only: a LIVE session
  // must not be judged against A1's (narrower) exception row or vice versa.
  const forbiddenReach = {};
  forbiddenReach[stage] = checkForbiddenReachW({ allowlist, stage, enumeration, grantsByOid, usageBySchema });
  const forbiddenWrite = checkForbiddenWritePrivileges({ universe: productUniverse(enumeration), grantsByOid });

  const violations = [];
  const collect = (block, label) => {
    if (!block.ok) for (const v of block.violations) violations.push({ block: label, ...v });
  };
  collect(alwaysForbidden, "always-forbidden schemas (L3)");
  collect(contractA, "accepted exposure — Contract A effective reach (L4)");
  collect(forbiddenWrite, "no real-table write privilege (L2)");
  for (const [s, block] of Object.entries(forbiddenReach)) collect(block, `forbidden reach (W) — ${s}`);

  return Object.freeze({
    stage,
    contract_a_effective_reach: contractA,
    contract_b_catalog_inventory: contractB,
    always_forbidden_schemas: alwaysForbidden,
    forbidden_reach: forbiddenReach,
    forbidden_write: forbiddenWrite,
    violations,
    ok: violations.length === 0,
  });
}

// ---------------------------------------------------------------------------
// Deferred live capture — written, marked, NOT run in this unit
// ---------------------------------------------------------------------------

export function liveCapturePlan() {
  return {
    status: DEFERRED,
    note:
      "U-R3 has no LAB access. This plan is the executable contract for the A1 preflight; " +
      "it is not run here and produces no evidence labelled LAB.",
    steps: [
      "provenance §5: measure connection_ref from the pooler user/host and database_ref_evidence after connect; STOP unless both equal LAB_REF",
      "L1: enumerate r/p/S/f in {ps01, ps01_internal, wstera_platform_internal, cron, net} from pg_catalog by (nspname, relname) and oid",
      "L2: has_table_privilege/has_sequence_privilege on the resolved oid for each per-kind privilege",
      "L3: has_schema_privilege(current_user, nspname, 'USAGE') for every enumerated schema plus the always-forbidden set",
      "L5: relrowsecurity + rolbypassrls to decide count measurability (never 0-as-PASS)",
      "feed the captured dataset to `lane-b-effective-reach.mjs --evaluate <file>`",
    ],
    catalog_enumeration_sql: CATALOG_ENUM_SQL_HINT,
  };
}

const CATALOG_ENUM_SQL_HINT =
  "SELECT c.oid AS reloid, n.nspname AS nspname, c.relname AS relname, c.relkind AS relkind " +
  "FROM pg_catalog.pg_class c JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace " +
  "WHERE n.nspname = ANY($1) AND c.relkind IN ('r','p','S','f') ORDER BY n.nspname, c.relkind, c.relname";

// ---------------------------------------------------------------------------
// Selftest — offline, with negative controls
// ---------------------------------------------------------------------------

const R = (oid, nspname, relname, relkind) => ({ oid, nspname, relname, relkind });
const G = (target, privileges) => [String(target.oid), { nspname: target.nspname, relname: target.relname, privileges }];

const WPI_EXCEPTION = R("900", "wstera_platform_internal", "runtime_token_grants", "r");
const WPI_OTHER = R("901", "wstera_platform_internal", "runtime_tokens", "r");
const PS01_CP = R("100", "ps01", "commercial_packages", "r");
const PS01_SHOPS = R("101", "ps01", "shops", "r");
const NET_HR = R("200", "net", "_http_response", "r");
const NET_Q = R("201", "net", "http_request_queue", "r");
const NET_SEQ = R("202", "net", "http_request_queue_id_seq", "S");
const CRON_JOB = R("300", "cron", "job", "r");

const TABLES = ["SELECT", "INSERT", "UPDATE", "DELETE", "TRUNCATE", "REFERENCES", "TRIGGER"];
const SEQ = ["SELECT", "USAGE", "UPDATE"];

// The always-forbidden set is read from the sole source (§1a projection), never
// re-listed here (G-ALLOWLIST-SINGLE-SOURCE).
function forbiddenUsage() {
  const o = {};
  for (const s of loadAllowlist().always_forbidden_schemas) o[s] = false;
  return o;
}

function baseDataset(overrides = {}) {
  const enumeration = [
    PS01_CP, PS01_SHOPS,
    WPI_EXCEPTION,
    NET_HR, NET_Q, NET_SEQ,
    CRON_JOB,
  ];
  const grantsByOid = Object.fromEntries([
    G(PS01_CP, ["SELECT"]),
    G(PS01_SHOPS, ["SELECT"]),
    G(WPI_EXCEPTION, ["SELECT", "INSERT", "DELETE"]),
    G(NET_HR, TABLES),
    G(NET_Q, TABLES),
    G(NET_SEQ, SEQ),
    G(CRON_JOB, ["SELECT"]),
  ]);
  const usageBySchema = {
    ps01: true,
    ps01_internal: true,
    wstera_platform_internal: true,
    cron: false,
    net: true,
    ...forbiddenUsage(),
  };
  return { role: "lane_b_rw_live", stage: "H3D-LIVE", enumeration, grantsByOid, usageBySchema, ...overrides };
}

export function selftest() {
  let bad = 0;
  const ok = (c, m) => {
    if (!c) {
      process.stderr.write(`FAIL ${m}\n`);
      bad++;
    }
  };
  const throws = (fn, m) => {
    let t = false;
    try { fn(); } catch { t = true; }
    ok(t, m);
  };

  // --- primitives: six distinct layers, reach = L2 AND L3 on the same object ---
  ok(LAYER.CATALOG_PRESENCE === "L1" && LAYER.OBJECT_GRANT === "L2" && LAYER.SCHEMA_USAGE === "L3"
    && LAYER.EFFECTIVE_REACH === "L4" && LAYER.RLS_VISIBILITY === "L5" && LAYER.OWNERSHIP_CAPABILITY === "L6",
    "six distinct layers L1..L6 exist");
  ok(effectiveReach({ object: NET_HR, grant: true, schemaUsage: { nspname: "net", usage: true } }) === true, "L4 true when L2 AND L3 both true");
  ok(effectiveReach({ object: CRON_JOB, grant: true, schemaUsage: { nspname: "cron", usage: false } }) === false, "L4 false when L2 true but L3 false (cron)");
  ok(effectiveReach({ object: NET_HR, grant: false, schemaUsage: { nspname: "net", usage: true } }) === false, "L4 false when L3 true but L2 false");
  throws(() => effectiveReach({ object: NET_HR, grant: true, schemaUsage: { nspname: "cron", usage: true } }),
    "L4 rejects an L3 reading from a different schema (NEW-DEFECT-08/-09)");
  throws(() => objectGrant({}, { nspname: "net", relname: "x" }, "SELECT"),
    "L2 object grant requires a resolved OID (bare relname forbidden)");
  throws(() => qualifiedName({ relname: "x" }), "qualified identity requires nspname + relname");
  ok(sameRelation(NET_HR, { oid: "200" }) === true, "sameRelation matches by OID");
  ok(catalogPresence([NET_HR], { oid: "200" }) === true, "L1 catalog presence by OID");
  ok(catalogPresence([NET_HR], { nspname: "net", relname: "nope" }) === false, "L1 presence false for an absent identity");

  // --- two labelled contracts, not interchangeable ---
  const a = assertEffectiveReachContract({
    object: NET_HR,
    schemaUsage: { nspname: "net", usage: true },
    grants: baseDataset().grantsByOid,
    requiredPrivileges: ["SELECT"],
  });
  ok(a.contract === CONTRACT.A_EFFECTIVE_REACH && a.layer === LAYER.EFFECTIVE_REACH && a.reach === true, "Contract A labels and concludes reach");
  const inv = inventoryCatalogSurface({ enumeration: [NET_HR, CRON_JOB], expected: [NET_HR, CRON_JOB] });
  ok(inv.contract === CONTRACT.B_CATALOG_INVENTORY && inv.layer === LAYER.CATALOG_PRESENCE && inv.reach === undefined, "Contract B labels catalog presence and exposes no reach");
  throws(() => assertEffectiveReachContract({ enumeration: [NET_HR] }), "Contract A rejects a catalog enumeration (NEW-DEFECT-09)");
  throws(() => inventoryCatalogSurface({ enumeration: [], grants: {} }), "Contract B rejects grants (NEW-DEFECT-09)");
  throws(() => inventoryCatalogSurface({ enumeration: [], schemaUsage: {} }), "Contract B rejects schema USAGE (NEW-DEFECT-09)");
  throws(() => requireContract(inv, CONTRACT.A_EFFECTIVE_REACH, "test"), "requireContract refuses the wrong contract");

  // --- positive: a correctly shaped H3D-LIVE dataset passes every block ---
  {
    const report = evaluateMeasured(baseDataset());
    ok(report.ok, `well-shaped H3D-LIVE dataset passes (${report.violations.length} violation(s))`);
    if (!report.ok) for (const v of report.violations) process.stderr.write(`  - ${v.block}: ${JSON.stringify(v)}\n`);
    ok(report.contract_a_effective_reach.results.some((r) => r.identity === "net._http_response" && r.reach === true), "Contract A: net reach is true");
    ok(report.contract_a_effective_reach.results.some((r) => r.identity === "cron.job" && r.reach === false), "Contract A: cron.job L2 grant is NOT reach (L3 false)");
    ok(report.contract_b_catalog_inventory.present.includes("cron.job"), "Contract B: cron.job is catalog-present");
    ok(!report.contract_b_catalog_inventory.present.includes("cron.job") || report.contract_b_catalog_inventory.reach === undefined, "Contract B concludes nothing about reach");
    ok(report.forbidden_reach["H3D-LIVE"].ok, "H3D-LIVE forbidden-reach row passes with the §1a exception");
  }
  // --- positive: H3D-A1 (no wstera_platform_internal USAGE) ---
  {
    const d = baseDataset({
      stage: "H3D-A1",
      enumeration: [PS01_CP, WPI_EXCEPTION, NET_HR, NET_Q, NET_SEQ, CRON_JOB],
      usageBySchema: { ...baseDataset().usageBySchema, wstera_platform_internal: false },
      grantsByOid: Object.fromEntries([
        G(PS01_CP, ["SELECT"]), G(WPI_EXCEPTION, []), G(NET_HR, TABLES), G(NET_Q, TABLES), G(NET_SEQ, SEQ), G(CRON_JOB, ["SELECT"]),
      ]),
    });
    const report = evaluateMeasured(d);
    ok(report.forbidden_reach["H3D-A1"].ok, "H3D-A1 forbidden-reach row passes with WPI USAGE false and no grants");
    ok(report.ok, `H3D-A1 dataset passes (${report.violations.length} violation(s))`);
  }

  // --- negative controls: each mutation must be caught ---
  {
    const d = baseDataset({ usageBySchema: { ...baseDataset().usageBySchema, cron: true } });
    const r = evaluateMeasured(d);
    ok(!r.ok && r.violations.some((v) => v.block.includes("Contract A")), "cron USAGE=true is caught as a Contract A reachability change (negative control)");
  }
  {
    const b = baseDataset();
    const d = baseDataset({ grantsByOid: { ...b.grantsByOid, ...Object.fromEntries([G(WPI_EXCEPTION, ["SELECT", "INSERT", "DELETE", "UPDATE"])]) } });
    const r = evaluateMeasured(d);
    ok(!r.ok && r.violations.some((v) => v.block.includes("forbidden reach")), "exception relation with UPDATE=true is caught (negative control)");
  }
  {
    const b = baseDataset();
    const d = baseDataset({ enumeration: [...b.enumeration, WPI_OTHER], grantsByOid: { ...b.grantsByOid, ...Object.fromEntries([G(WPI_OTHER, ["SELECT"])]) } });
    const r = evaluateMeasured(d);
    ok(!r.ok && r.violations.some((v) => v.block.includes("forbidden reach")), "a second WPI relation with a grant is caught (negative control)");
  }
  {
    const forbidden = loadAllowlist().always_forbidden_schemas;
    const d = baseDataset({ usageBySchema: { ...baseDataset().usageBySchema, [forbidden[0]]: true } });
    const r = evaluateMeasured(d);
    ok(!r.ok && r.violations.some((v) => v.block.includes("always-forbidden")), "an always-forbidden schema with USAGE=true is caught (negative control)");
  }
  {
    const b = baseDataset();
    const d = baseDataset({ grantsByOid: { ...b.grantsByOid, ...Object.fromEntries([G(PS01_SHOPS, ["SELECT", "INSERT"])]) } });
    const r = evaluateMeasured(d);
    ok(!r.ok && r.violations.some((v) => v.block.includes("write")), "a ps01 table with INSERT=true is caught (negative control)");
  }
  {
    const d = baseDataset({ enumeration: baseDataset().enumeration.filter((x) => x.relname !== "runtime_token_grants") });
    const r = evaluateMeasured(d);
    ok(!r.ok, "a missing §1a exception relation is caught (negative control)");
  }

  // --- deferred live path is marked and never runs here ---
  ok(liveCapturePlan().status === DEFERRED, "live capture is marked LIVE_DEFERRED_TO_A1_PREFLIGHT");
  ok(!/pg\.Client|new Client|connect\(/.test(liveCapturePlan().steps.join(" ")), "the deferred plan does not open a session");

  process.stderr.write(
    bad
      ? `\nLANE-B EFFECTIVE-REACH SELFTEST: ${bad} FAILURE(S)\n`
      : `\nLANE-B EFFECTIVE-REACH SELFTEST PASS (Contract A effective reach + Contract B catalog inventory separated)\n`,
  );
  return bad;
}

export default { evaluateMeasured, liveCapturePlan, selftest, DEFERRED };

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const mode = process.argv[2] || "--selftest";
  if (mode === "--selftest") {
    process.exit(selftest() ? 1 : 0);
  } else if (mode === "--evaluate") {
    const file = process.argv[3];
    if (!file) {
      process.stderr.write("usage: lane-b-effective-reach.mjs --evaluate <measured-dataset.json>\n");
      process.exit(2);
    }
    const dataset = JSON.parse(fs.readFileSync(path.resolve(file), "utf8"));
    const report = evaluateMeasured(dataset);
    process.stdout.write(JSON.stringify(report, null, 2) + "\n");
    process.exit(report.ok ? 0 : 1);
  } else if (mode === "--capture") {
    process.stderr.write(
      `\n${DEFERRED}: U-R3 has no LAB access and did not run a capture.\n` +
        "The executable capture contract at the A1 preflight is:\n" +
        liveCapturePlan().steps.map((s) => `  - ${s}`).join("\n") +
        "\n",
    );
    process.exit(3); // not an error in U-R3: explicitly deferred, never run
  } else {
    process.stderr.write("usage: lane-b-effective-reach.mjs --selftest | --evaluate <file> | --capture\n");
    process.exit(2);
  }
}
