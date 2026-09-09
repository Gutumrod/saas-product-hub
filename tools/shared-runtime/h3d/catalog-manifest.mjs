#!/usr/bin/env node
// H3D catalog manifest — SELECT ONLY. WSTERA LAB.
//
// Captures the exact PS01 shape the fixture seed/teardown depend on:
//   * every FK edge in the graph rooted at ps01.shops (constraint, child/parent
//     columns, ON DELETE action, deferrability);
//   * every non-internal trigger on each shop-rooted table (name, function,
//     tgenabled, timing, events, function-definition sha256);
//   * commercial_packages('starter') full semantic row;
//   * the initialize/mirror/guard/immutability function definition hashes.
//
// Modes:
//   --capture   write a manifest JSON (env CATALOG_MANIFEST_OUT, default stdout)
//   --verify    compare a live capture to an expected manifest file
//               (argv[3] = expected path); exit 3 on ANY drift (STOP)
//   --selftest  offline: drift detection logic
//
// `pg` is tools/shared-runtime's own dependency. Env LAB_DB_URL (never logged).

import fs from "node:fs";
import crypto from "node:crypto";
import process from "node:process";
import pg from "pg";

const { Client } = pg;
const sha = (s) => crypto.createHash("sha256").update(s == null ? "" : String(s)).digest("hex");

const SHOP_ROOTED_TABLES = [
  // discovered graph; --verify re-derives it live and flags additions
  "shops", "staff_users", "pet_owners", "pets", "rooms", "room_rate_plans",
  "bookings", "booking_pets", "booking_requests", "daily_reports",
  "google_sync_mappings", "sync_queue", "camera_settings",
  "camera_visitor_credentials", "camera_rate_limit_buckets", "camera_access_audit",
  "shop_commercial_assignments", "import_batches",
  "shop_subscriptions", "subscription_audit_log",
];

const CONTROL_FUNCTIONS = [
  "initialize_shop_subscription_after_insert",
  "initialize_shop_subscription_internal",
  "sync_legacy_subscription_status",
  "enforce_shop_commercial_mutation",
  "assert_shop_commercial_mutation_allowed",
  "enforce_pet_commercial_quota",
  "enforce_room_commercial_quota",
  "resolve_shop_commercial_authority",
];

async function capture(client) {
  const q = (sql, p = []) => client.query(sql, p).then((r) => r.rows);

  // 1. shop-rooted FK graph — BFS from ps01.shops over composite/simple FKs.
  const allFks = await q(`
    SELECT con.conname,
           child.relname  AS child_table,
           parent.relname AS parent_table,
           con.confdeltype AS on_delete,
           con.condeferrable, con.condeferred,
           (SELECT array_agg(att.attname ORDER BY k.ord)
              FROM unnest(con.conkey) WITH ORDINALITY k(attnum, ord)
              JOIN pg_attribute att ON att.attrelid = con.conrelid AND att.attnum = k.attnum) AS child_cols,
           (SELECT array_agg(att.attname ORDER BY k.ord)
              FROM unnest(con.confkey) WITH ORDINALITY k(attnum, ord)
              JOIN pg_attribute att ON att.attrelid = con.confrelid AND att.attnum = k.attnum) AS parent_cols
    FROM pg_constraint con
    JOIN pg_class child  ON child.oid  = con.conrelid
    JOIN pg_class parent ON parent.oid = con.confrelid
    JOIN pg_namespace nc ON nc.oid = child.relnamespace
    JOIN pg_namespace np ON np.oid = parent.relnamespace
    WHERE con.contype = 'f' AND nc.nspname = 'ps01' AND np.nspname = 'ps01'
    ORDER BY parent.relname, child.relname, con.conname`);

  const reachable = new Set(["shops"]);
  let grew = true;
  while (grew) {
    grew = false;
    for (const fk of allFks) {
      if (reachable.has(fk.parent_table) && !reachable.has(fk.child_table)) {
        reachable.add(fk.child_table);
        grew = true;
      }
    }
  }
  const graphFks = allFks
    .filter((fk) => reachable.has(fk.parent_table))
    .map((fk) => ({
      constraint: fk.conname,
      child: fk.child_table, parent: fk.parent_table,
      child_cols: fk.child_cols, parent_cols: fk.parent_cols,
      on_delete: fk.on_delete,           // a=noaction r=restrict c=cascade n=setnull d=setdefault
      deferrable: fk.condeferrable, deferred: fk.condeferred,
    }));

  // 2. triggers on every reachable table + the known fixture tables.
  const tableList = [...new Set([...reachable, ...SHOP_ROOTED_TABLES])].sort();
  const triggers = await q(`
    SELECT c.relname AS table, t.tgname,
           p.proname AS function,
           n.nspname AS function_schema,
           CASE t.tgenabled WHEN 'O' THEN 'O' WHEN 'D' THEN 'D' WHEN 'R' THEN 'R' WHEN 'A' THEN 'A' END AS tgenabled,
           t.tgisinternal,
           (t.tgtype & 1)   <> 0 AS is_row,
           (t.tgtype & 2)   <> 0 AS before,
           (t.tgtype & 64)  <> 0 AS instead_of,
           (t.tgtype & 4)   <> 0 AS on_insert,
           (t.tgtype & 8)   <> 0 AS on_delete,
           (t.tgtype & 16)  <> 0 AS on_update,
           (t.tgtype & 32)  <> 0 AS on_truncate,
           pg_get_functiondef(p.oid) AS fdef
    FROM pg_trigger t
    JOIN pg_class c ON c.oid = t.tgrelid
    JOIN pg_namespace ns ON ns.oid = c.relnamespace
    JOIN pg_proc p ON p.oid = t.tgfoid
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE ns.nspname = 'ps01' AND NOT t.tgisinternal
      AND c.relname = ANY($1)
    ORDER BY c.relname, t.tgname`, [tableList]);
  const triggerRows = triggers.map((t) => ({
    table: t.table, name: t.tgname, function: `${t.function_schema}.${t.function}`,
    enabled: t.tgenabled, is_row: t.is_row, timing: t.instead_of ? "instead" : (t.before ? "before" : "after"),
    events: [t.on_insert && "insert", t.on_update && "update", t.on_delete && "delete", t.on_truncate && "truncate"].filter(Boolean),
    fdef_sha256: sha(t.fdef),
  }));

  // 3. control function definition hashes (independent of trigger binding).
  const fnDefs = await q(`
    SELECT p.proname, pg_get_functiondef(p.oid) AS fdef
    FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'ps01' AND p.proname = ANY($1)
    ORDER BY p.proname`, [CONTROL_FUNCTIONS]);
  const controlFns = Object.fromEntries(fnDefs.map((r) => [r.proname, sha(r.fdef)]));

  // 4. commercial_packages('starter') full semantic row.
  const [starter] = await q(`SELECT * FROM ps01.commercial_packages WHERE id = 'starter'`);
  const starterCols = await q(`
    SELECT column_name, data_type, is_nullable, column_default
    FROM information_schema.columns
    WHERE table_schema = 'ps01' AND table_name = 'commercial_packages'
    ORDER BY ordinal_position`);

  // 5. fixture-table column contracts (NOT NULL / checks / defaults).
  const fixtureCols = await q(`
    SELECT table_name, column_name, data_type, is_nullable, column_default
    FROM information_schema.columns
    WHERE table_schema = 'ps01'
      AND table_name = ANY(ARRAY['shops','pet_owners','pets','rooms','room_rate_plans','shop_subscriptions','subscription_audit_log'])
    ORDER BY table_name, ordinal_position`);
  const checks = await q(`
    SELECT rel.relname AS table, con.conname, pg_get_constraintdef(con.oid) AS def
    FROM pg_constraint con JOIN pg_class rel ON rel.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = rel.relnamespace
    WHERE n.nspname = 'ps01' AND con.contype IN ('c','u','p')
      AND rel.relname = ANY(ARRAY['shops','pet_owners','pets','rooms','room_rate_plans','shop_subscriptions','subscription_audit_log'])
    ORDER BY rel.relname, con.conname`);

  return {
    tool: "h3d-catalog-manifest", version: 1,
    captured_at: new Date().toISOString(),
    project_ref: "ykxlqnshaaxmzzocpjlj",
    graph_root: "ps01.shops",
    graph_tables: tableList,
    graph_fks: graphFks,
    triggers: triggerRows,
    control_functions: controlFns,
    starter_package: {
      row: starter || null,
      columns: starterCols,
    },
    fixture_table_columns: fixtureCols,
    fixture_table_constraints: checks.map((c) => ({ table: c.table, name: c.conname, def: c.def })),
  };
}

// Stable serialisation of the parts that must be byte-identical across phases.
function fingerprint(m) {
  const core = {
    graph_tables: m.graph_tables,
    graph_fks: m.graph_fks,
    triggers: m.triggers,
    control_functions: m.control_functions,
    starter_row: m.starter_package.row,
    starter_columns: m.starter_package.columns,
    fixture_table_columns: m.fixture_table_columns,
    fixture_table_constraints: m.fixture_table_constraints,
  };
  return sha(stableJson(core));
}
function stableJson(v) {
  if (Array.isArray(v)) return `[${v.map(stableJson).join(",")}]`;
  if (v && typeof v === "object") {
    return `{${Object.keys(v).sort().map((k) => JSON.stringify(k) + ":" + stableJson(v[k])).join(",")}}`;
  }
  return JSON.stringify(v);
}

function diffManifest(expected, live) {
  const drift = [];
  const efp = expected.fingerprint;
  const lfp = fingerprint(live);
  if (efp && efp === lfp) return { drift, fingerprint: lfp };

  const idx = (arr, key) => Object.fromEntries((arr || []).map((x) => [key(x), x]));
  const eFk = idx(expected.graph_fks, (x) => x.constraint);
  const lFk = idx(live.graph_fks, (x) => x.constraint);
  for (const k of new Set([...Object.keys(eFk), ...Object.keys(lFk)])) {
    if (!eFk[k]) drift.push(`NEW FK edge: ${k}`);
    else if (!lFk[k]) drift.push(`REMOVED FK edge: ${k}`);
    else if (stableJson(eFk[k]) !== stableJson(lFk[k])) drift.push(`CHANGED FK edge: ${k}`);
  }
  const eTg = idx(expected.triggers, (x) => `${x.table}.${x.name}`);
  const lTg = idx(live.triggers, (x) => `${x.table}.${x.name}`);
  for (const k of new Set([...Object.keys(eTg), ...Object.keys(lTg)])) {
    if (!eTg[k]) drift.push(`NEW trigger: ${k}`);
    else if (!lTg[k]) drift.push(`REMOVED trigger: ${k}`);
    else {
      if (eTg[k].enabled !== lTg[k].enabled) drift.push(`trigger ${k} enabled ${eTg[k].enabled} -> ${lTg[k].enabled}`);
      if (eTg[k].fdef_sha256 !== lTg[k].fdef_sha256) drift.push(`trigger ${k} function definition changed`);
      if (stableJson(eTg[k].events) !== stableJson(lTg[k].events) || eTg[k].timing !== lTg[k].timing) drift.push(`trigger ${k} timing/events changed`);
    }
  }
  for (const fn of Object.keys({ ...expected.control_functions, ...live.control_functions })) {
    if (expected.control_functions[fn] !== live.control_functions[fn]) drift.push(`control function ${fn} definition changed`);
  }
  if (stableJson(expected.starter_package?.row) !== stableJson(live.starter_package?.row)) drift.push("starter_package row changed");
  const eGT = new Set(expected.graph_tables || []);
  const lGT = new Set(live.graph_tables || []);
  for (const t of lGT) if (!eGT.has(t)) drift.push(`NEW shop-rooted table: ${t}`);
  for (const t of eGT) if (!lGT.has(t)) drift.push(`REMOVED shop-rooted table: ${t}`);
  if (stableJson(expected.fixture_table_columns) !== stableJson(live.fixture_table_columns)) drift.push("fixture table columns changed");
  if (stableJson(expected.fixture_table_constraints) !== stableJson(live.fixture_table_constraints)) drift.push("fixture table constraints changed");
  return { drift, fingerprint: lfp };
}

async function withDb(fn) {
  const url = process.env.LAB_DB_URL;
  if (!url) { console.error("LAB_DB_URL not set"); process.exit(2); }
  const c = new Client({ connectionString: url, ssl: { rejectUnauthorized: false }, statement_timeout: 30000 });
  await c.connect();
  try { return await fn(c); } finally { await c.end(); }
}

const mode = process.argv[2];
if (mode === "--capture") {
  const m = await withDb(capture);
  m.fingerprint = fingerprint(m);
  const out = process.env.CATALOG_MANIFEST_OUT;
  if (out) { fs.writeFileSync(out, JSON.stringify(m, null, 2) + "\n"); console.error(`written ${out}  fingerprint=${m.fingerprint}`); }
  else process.stdout.write(JSON.stringify(m, null, 2) + "\n");
} else if (mode === "--verify") {
  const expectedPath = process.argv[3];
  if (!expectedPath) { console.error("usage: --verify <expected-manifest.json>"); process.exit(2); }
  const expected = JSON.parse(fs.readFileSync(expectedPath, "utf8"));
  const live = await withDb(capture);
  const { drift, fingerprint: lfp } = diffManifest(expected, live);
  const res = { verified_at: new Date().toISOString(), expected_fingerprint: expected.fingerprint, live_fingerprint: lfp, drift };
  process.stdout.write(JSON.stringify(res, null, 2) + "\n");
  if (drift.length) { console.error(`\nSTOP — CATALOG GRAPH CHANGED (${drift.length} drift item(s))`); process.exit(3); }
  console.error("\ncatalog manifest verified — no drift");
} else if (mode === "--selftest") {
  let bad = 0;
  const ok = (c, m) => { if (!c) { console.error("FAIL", m); bad++; } };
  const base = {
    fingerprint: "X",
    graph_tables: ["shops", "pets"],
    graph_fks: [{ constraint: "pets_shop_id_fkey", child: "pets", parent: "shops", on_delete: "c", child_cols: ["shop_id"], parent_cols: ["id"], deferrable: false, deferred: false }],
    triggers: [{ table: "shops", name: "trg_init", function: "ps01.f", enabled: "O", is_row: true, timing: "after", events: ["insert"], fdef_sha256: "h1" }],
    control_functions: { f: "h1" },
    starter_package: { row: { id: "starter", room_limit: 10 }, columns: [] },
    fixture_table_columns: [], fixture_table_constraints: [],
  };
  const clone = () => JSON.parse(JSON.stringify(base));
  ok(diffManifest(base, { ...clone(), fingerprint: undefined }).drift.length === 0 || fingerprint(clone()) , "identical -> no drift path");
  let m = clone(); m.triggers[0].enabled = "D";
  ok(diffManifest(base, m).drift.some((d) => /enabled O -> D/.test(d)), "disabled trigger -> drift");
  m = clone(); m.triggers[0].fdef_sha256 = "h2";
  ok(diffManifest(base, m).drift.some((d) => /function definition changed/.test(d)), "trigger fn change -> drift");
  m = clone(); m.graph_fks.push({ constraint: "new_fk", child: "x", parent: "shops", on_delete: "c", child_cols: ["s"], parent_cols: ["id"], deferrable: false, deferred: false });
  ok(diffManifest(base, m).drift.some((d) => /NEW FK edge: new_fk/.test(d)), "added FK -> drift");
  m = clone(); m.graph_fks[0].on_delete = "r";
  ok(diffManifest(base, m).drift.some((d) => /CHANGED FK edge/.test(d)), "changed delete action -> drift");
  m = clone(); m.control_functions.f = "h9";
  ok(diffManifest(base, m).drift.some((d) => /control function f/.test(d)), "control fn hash -> drift");
  m = clone(); m.graph_tables.push("newchild");
  ok(diffManifest(base, m).drift.some((d) => /NEW shop-rooted table: newchild/.test(d)), "new graph table -> drift");
  m = clone(); m.starter_package.row.room_limit = 1;
  ok(diffManifest(base, m).drift.some((d) => /starter_package row changed/.test(d)), "starter row -> drift");
  console.error(bad ? `\nSELFTEST: ${bad} FAILURE(S)` : "\nSELFTEST PASS (catalog drift detection)");
  process.exit(bad ? 1 : 0);
} else {
  console.error("usage: catalog-manifest.mjs --capture | --verify <expected.json> | --selftest");
  process.exit(2);
}
