#!/usr/bin/env node
// Lane-B M/W role runbook generator (U-R3).
//
// Renders docs/platform/shared-runtime/runbooks/lane-b-role-<name>-{create,teardown}.sql
// from:
//   * the SOLE per-stage exception allowlist source (contract §1a projection)
//     docs/platform/shared-runtime/fixtures/lane-b-per-stage-allowlist.json
//   * the class/stage role specs below (contract §1/§2/§3), which contain NO forbidden
//     schema or relation list of their own.
//
// Because every forbidden-set assertion in the generated create-runbook closing block is
// expanded from the single allowlist source, and `--check` byte-compares the on-disk
// runbooks against a fresh render, no second constant list can survive (G-ALLOWLIST-SINGLE-SOURCE).
//
// Files only. NOT executed by U-R3. No LAB access.

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

import { loadAllowlist, exceptionFor, REPO_ROOT, ALLOWLIST_FIXTURE_REL } from "../lib/six-layer-privileges.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const RUNBOOK_DIR = path.resolve(REPO_ROOT, "docs/platform/shared-runtime/runbooks");

const STAGE_TAGS = { "H3D-A1": "a1", "H3D-LIVE": "live" };
const OWNER_CP = { "H3D-A1": "OWNER-CP-H3D-A1", "H3D-LIVE": "OWNER-CP-H3D-LIVE" };

// Class/stage intended grants (L2/L3) and membership (L6). No forbidden set here.
function roleSpec(stage, cls) {
  const tag = STAGE_TAGS[stage];
  if (!tag) throw new Error(`no role tag for stage ${stage}`);
  const isM = cls === "M";
  const role = isM ? `lane_b_measure_${tag}` : `lane_b_rw_${tag}`;
  const membership = isM ? null : "ps01_migrator";
  const grants = [];
  if (isM) {
    grants.push("GRANT USAGE ON SCHEMA ps01 TO " + role + ";");
    grants.push("GRANT USAGE ON SCHEMA ps01_internal TO " + role + ";");
    grants.push("GRANT SELECT ON ps01.commercial_packages TO " + role + ";");
  } else {
    // L6 ownership capability via membership (contract §1a).
    grants.push(`GRANT ${membership} TO ${role};`);
    if (stage === "H3D-LIVE") {
      grants.push(`GRANT USAGE ON SCHEMA wstera_platform_internal TO ${role};`);
      grants.push(
        `GRANT SELECT, INSERT, DELETE ON wstera_platform_internal.runtime_token_grants TO ${role};`,
      );
    }
  }
  return {
    stage,
    cls,
    tag,
    role,
    ownerCheckpoint: OWNER_CP[stage],
    bypassrls: isM,
    connectionLimit: isM ? 2 : 3,
    membership,
    grants,
    wpiSchemaUsage: !isM && stage === "H3D-LIVE",
    exception: isM ? [] : exceptionFor(loadAllowlist(), stage),
    intendedObjectGrants: isM
      ? [{ rel: "ps01.commercial_packages", privilege: "SELECT" }]
      : stage === "H3D-LIVE"
        ? [{ rel: "wstera_platform_internal.runtime_token_grants", privilege: "SELECT" }]
        : [],
  };
}

function fileSha256(absPath) {
  const buf = fs.readFileSync(absPath, "utf8").replace(/\r\n?/g, "\n");
  return crypto.createHash("sha256").update(buf).digest("hex");
}

function header(spec, kind, allowlistHash) {
  return [
    `-- lane-b-role-${spec.role}-${kind}.sql`,
    "-- GENERATED FILE — do not edit by hand. Regenerate with:",
    "--   node tools/shared-runtime/h3d/generate-runbooks.mjs --write",
    `-- SOLE allowlist source: ${ALLOWLIST_FIXTURE_REL}`,
    `--   sha256(${allowlistHash})`,
    "-- spec: docs/platform/shared-runtime/CREDENTIAL-STRATEGY-LANE-B-2026-09-22.md §1/§1a/§3 (planning b80f813)",
    `-- role class: ${spec.cls}   stage: ${spec.stage}   owning checkpoint: ${spec.ownerCheckpoint}`,
    "-- NOT executed by U-R3. Files only. Execute only inside the owning checkpoint window.",
  ];
}

const CREATE_VARS = [
  "-- Required psql variables (operator-supplied; never persisted in this repository):",
  "--   :'role_password'        one-time password generated inside the SQL-editor session (§1 inv. 2)",
  "--   :'window_valid_until'   window-end timestamp for VALID UNTIL (must be <= window end)",
];

export function renderCreate(spec, allowlist, allowlistHash) {
  const L = [];
  L.push(...header(spec, "create", allowlistHash));
  L.push(...CREATE_VARS);
  L.push("\\set ON_ERROR_STOP on", "BEGIN;", "");
  L.push(`CREATE ROLE ${spec.role}`);
  L.push("  LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION" + (spec.bypassrls ? " BYPASSRLS" : ""));
  L.push(`  CONNECTION LIMIT ${spec.connectionLimit}`);
  L.push("  VALID UNTIL :'window_valid_until'");
  L.push("  PASSWORD :'role_password';");
  L.push("");
  L.push("-- intended grants — each on its own line (G-REVOKE-MIRROR mirrors each one)");
  for (const g of spec.grants) L.push(g);
  L.push("");
  L.push("-- closing assertion: asserts behaviour and names the layer it asserts (contract §3)");
  L.push(...closingBlock(spec, allowlist));
  L.push("");
  L.push("COMMIT;");
  return L.join("\n") + "\n";
}

function closingBlock(spec, allowlist) {
  const L = [];
  const ex = spec.exception[0] || null;
  const q = (s) => `'${s}'`;
  const role = q(spec.role);
  L.push("DO $lane_b$");
  L.push("DECLARE");
  L.push("  r record;");
  L.push("  p text;");
  L.push("  privs text[];");
  L.push("  is_exception boolean;");
  L.push(`  allowed text[] := ${ex ? sqlArray(ex.allowed_privileges) : "ARRAY[]::text[]"};`);
  L.push(`  denied  text[] := ${ex ? sqlArray(ex.denied_privileges) : "ARRAY[]::text[]"};`);
  L.push("BEGIN");
  L.push(`  -- This block runs in the creating class-P session, so every assertion names the`);
  L.push(`  -- created role explicitly (it is the role's behaviour being asserted, not the session's).`);
  // ATTRIBUTE
  L.push("  -- ATTRIBUTE (class shape)");
  L.push(`  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = ${role}`);
  L.push(`                   AND rolcanlogin AND NOT rolsuper AND NOT rolcreatedb AND NOT rolcreaterole`);
  L.push(`                   AND NOT rolreplication AND rolbypassrls = ${spec.bypassrls}) THEN`);
  L.push(`    RAISE EXCEPTION 'lane-b ATTRIBUTE assertion failed for %', ${role};`);
  L.push("  END IF;");
  // L6
  L.push("");
  L.push("  -- L6 ownership capability (membership), exactly as the class requires");
  L.push(`  IF pg_has_role(${role}, 'ps01_migrator', 'MEMBER') IS DISTINCT FROM ${spec.membership ? "true" : "false"} THEN`);
  L.push("    RAISE EXCEPTION 'L6: ps01_migrator membership assertion failed';");
  L.push("  END IF;");
  // L3
  L.push("");
  L.push("  -- L3 schema USAGE (exactly as the class/stage requires)");
  L.push(`  IF has_schema_privilege(${role}, 'ps01', 'USAGE') IS DISTINCT FROM true THEN RAISE EXCEPTION 'L3: ps01 USAGE false'; END IF;`);
  L.push(`  IF has_schema_privilege(${role}, 'ps01_internal', 'USAGE') IS DISTINCT FROM true THEN RAISE EXCEPTION 'L3: ps01_internal USAGE false'; END IF;`);
  L.push(`  IF has_schema_privilege(${role}, 'wstera_platform_internal', 'USAGE') IS DISTINCT FROM ${spec.wpiSchemaUsage} THEN RAISE EXCEPTION 'L3: wstera_platform_internal USAGE mismatch'; END IF;`);
  for (const s of allowlist.always_forbidden_schemas) {
    L.push(`  IF has_schema_privilege(${role}, '${s}', 'USAGE') IS DISTINCT FROM false THEN RAISE EXCEPTION 'L3: always-forbidden schema ${s} is USAGE=true'; END IF;`);
  }
  // L2 intended
  if (spec.intendedObjectGrants.length) {
    L.push("");
    L.push("  -- L2 object grant true for each intended object grant");
    for (const g of spec.intendedObjectGrants) {
      L.push(`  IF has_table_privilege(${role}, to_regclass('${g.rel}')::oid, '${g.privilege}') IS DISTINCT FROM true THEN RAISE EXCEPTION 'L2: intended ${g.privilege} on ${g.rel} missing'; END IF;`);
    }
  }
  // L4 exception
  if (ex) {
    L.push("");
    L.push("  -- L4 effective reach = L2 AND L3 on the SAME qualified object (exception relation only)");
    L.push(`  IF NOT (has_schema_privilege(${role}, '${ex.nspname}', 'USAGE')`);
    L.push(`            AND has_table_privilege(${role}, to_regclass('${ex.nspname}.${ex.relname}')::oid, 'SELECT')) THEN`);
    L.push(`    RAISE EXCEPTION 'L4: exception relation ${ex.nspname}.${ex.relname} is not L2 AND L3 reachable';`);
    L.push("  END IF;");
  }
  // forbidden reach WPI
  L.push("");
  L.push("  -- forbidden reach (W): L1 enumerate pg_catalog, L2 per-kind by OID, L3 already asserted above");
  L.push("  FOR r IN SELECT c.oid, n.nspname, c.relname, c.relkind");
  L.push("             FROM pg_catalog.pg_class c JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace");
  L.push("            WHERE n.nspname = 'wstera_platform_internal' AND c.relkind IN ('r','p','S','f') LOOP");
  L.push(
    "    is_exception := " +
      (ex ? `(r.nspname = '${ex.nspname}' AND r.relname = '${ex.relname}')` : "false") +
      ";",
  );
  L.push("    privs := CASE WHEN r.relkind = 'S' THEN ARRAY['SELECT','USAGE','UPDATE']");
  L.push("                 ELSE ARRAY['SELECT','INSERT','UPDATE','DELETE','TRUNCATE','REFERENCES','TRIGGER'] END;");
  L.push("    FOREACH p IN ARRAY privs LOOP");
  L.push("      IF r.relkind = 'S' THEN");
  if (ex) {
    L.push("        IF is_exception AND p = ANY(allowed) THEN");
    L.push(`          IF has_sequence_privilege(${role}, r.oid, p) IS DISTINCT FROM true THEN RAISE EXCEPTION 'L2: exception sequence % missing %', r.relname, p; END IF;`);
    L.push(`        ELSIF has_sequence_privilege(${role}, r.oid, p) IS DISTINCT FROM false THEN RAISE EXCEPTION 'forbidden reach: % %', r.relname, p; END IF;`);
  } else {
    L.push(`        IF has_sequence_privilege(${role}, r.oid, p) IS DISTINCT FROM false THEN RAISE EXCEPTION 'forbidden reach: % %', r.relname, p; END IF;`);
  }
  L.push("      ELSE");
  if (ex) {
    L.push("        IF is_exception AND p = ANY(allowed) THEN");
    L.push(`          IF has_table_privilege(${role}, r.oid, p) IS DISTINCT FROM true THEN RAISE EXCEPTION 'L2: exception relation % missing %', r.relname, p; END IF;`);
    L.push("        ELSIF is_exception AND p = ANY(denied) THEN");
    L.push(`          IF has_table_privilege(${role}, r.oid, p) IS DISTINCT FROM false THEN RAISE EXCEPTION 'L2: exception relation % must deny %', r.relname, p; END IF;`);
    L.push(`        ELSIF has_table_privilege(${role}, r.oid, p) IS DISTINCT FROM false THEN RAISE EXCEPTION 'forbidden reach: % %', r.relname, p; END IF;`);
  } else {
    L.push(`        IF has_table_privilege(${role}, r.oid, p) IS DISTINCT FROM false THEN RAISE EXCEPTION 'forbidden reach: % %', r.relname, p; END IF;`);
  }
  L.push("      END IF;");
  L.push("    END LOOP;");
  L.push("  END LOOP;");
  L.push("END");
  L.push("$lane_b$;");
  return L;
}

function sqlArray(items) {
  return `ARRAY[${items.map((x) => `'${x}'`).join(",")}]`;
}

export function renderTeardown(spec, allowlist, allowlistHash) {
  const L = [];
  L.push(...header(spec, "teardown", allowlistHash));
  L.push("\\set ON_ERROR_STOP on", "BEGIN;", "");
  L.push("-- 1. REVOKE every grant from the create file, one line each (G-REVOKE-MIRROR)");
  // object grants first (reverse order), then membership (contract §3 teardown order)
  const objectGrants = spec.grants.filter((g) => !g.startsWith(`GRANT ${"ps01_migrator"} `));
  const membershipGrants = spec.grants.filter((g) => g.startsWith(`GRANT ${"ps01_migrator"} `));
  for (const g of [...objectGrants].reverse()) L.push(mirrorRevoke(g));
  if (membershipGrants.length) {
    L.push("");
    L.push("-- 2. REVOKE ownership membership where granted (L6)");
    for (const g of membershipGrants) L.push(mirrorRevoke(g));
  }
  L.push("");
  L.push("-- 3. terminate the role's sessions");
  L.push(`SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE usename = '${spec.role}';`);
  L.push("");
  L.push("-- 4. drop the role (role-drop only; owner reassignment is not used — F9: refused by non-superuser postgres)");
  L.push(`DROP ROLE ${spec.role};`);
  L.push("");
  L.push("-- 5. closing assertion: L1 — catalog presence of the role itself is false");
  L.push("DO $lane_b_assert$");
  L.push("BEGIN");
  L.push(`  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = '${spec.role}') THEN`);
  L.push(`    RAISE EXCEPTION 'L1: role ${spec.role} still present after DROP';`);
  L.push("  END IF;");
  L.push("END");
  L.push("$lane_b_assert$;");
  L.push("");
  L.push("COMMIT;");
  return L.join("\n") + "\n";
}

/** GRANT x TO y; -> REVOKE x FROM y; (the mirror pair, key preserved) */
export function mirrorRevoke(grantSql) {
  const m = /^GRANT\s+(.*?)\s+TO\s+(.+);$/.exec(grantSql.trim());
  if (!m) throw new Error(`cannot mirror non-GRANT statement: ${grantSql}`);
  return `REVOKE ${m[1]} FROM ${m[2]};`;
}

export function renderAll(allowlist = loadAllowlist()) {
  const allowlistHash = fileSha256(path.resolve(REPO_ROOT, ALLOWLIST_FIXTURE_REL));
  const out = new Map();
  for (const stage of Object.keys(STAGE_TAGS)) {
    for (const cls of ["M", "W"]) {
      const spec = roleSpec(stage, cls);
      const createPath = path.join(RUNBOOK_DIR, `lane-b-role-${spec.role}-create.sql`);
      const teardownPath = path.join(RUNBOOK_DIR, `lane-b-role-${spec.role}-teardown.sql`);
      out.set(createPath, renderCreate(spec, allowlist, allowlistHash));
      out.set(teardownPath, renderTeardown(spec, allowlist, allowlistHash));
    }
  }
  return out;
}

function normaliseEol(s) {
  return s.replace(/\r\n?/g, "\n");
}

function main() {
  const mode = process.argv[2] || "--check";
  const rendered = renderAll();
  if (mode === "--write") {
    fs.mkdirSync(RUNBOOK_DIR, { recursive: true });
    for (const [p, content] of rendered) {
      fs.writeFileSync(p, content);
      process.stderr.write(`written ${path.relative(REPO_ROOT, p)}\n`);
    }
    process.exit(0);
  }
  if (mode === "--check") {
    let bad = 0;
    for (const [p, content] of rendered) {
      const rel = path.relative(REPO_ROOT, p);
      if (!fs.existsSync(p)) {
        process.stderr.write(`MISSING ${rel}\n`);
        bad++;
        continue;
      }
      if (normaliseEol(fs.readFileSync(p, "utf8")) !== normaliseEol(content)) {
        process.stderr.write(`DRIFT ${rel} (on-disk != render from the sole allowlist source)\n`);
        bad++;
      }
    }
    process.stderr.write(bad ? `\nRUNBOOK GENERATOR CHECK: ${bad} FAILURE(S)\n` : "\nRUNBOOK GENERATOR CHECK PASS (runbooks derive from the sole allowlist source)\n");
    process.exit(bad ? 1 : 0);
  }
  process.stderr.write("usage: generate-runbooks.mjs --write | --check\n");
  process.exit(2);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
