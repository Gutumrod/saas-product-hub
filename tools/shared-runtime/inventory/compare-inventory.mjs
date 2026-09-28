#!/usr/bin/env node
// Compare two lab-readonly-inventory.mjs outputs and classify every delta.
//
//   node compare-inventory.mjs <baseline.json> <current.json> [expected-delta-manifest.json]
//
// The manifest (optional) is a JSON array of allowed-delta descriptors:
//   [{ "path": "queries.recent_migrations", "reason": "H3E migration row" }, ...]
// A `path` match means "differences under this path are explained".
//
// Exit 0  => signatures equal, OR every delta is covered by the manifest.
// Exit 3  => at least one UNEXPLAINED delta. Prints them. STOP.
// Exit 2  => bad input.

import fs from "node:fs";
import process from "node:process";

const [, , basePath, curPath, manifestPath] = process.argv;
if (!basePath || !curPath) {
  console.error("usage: compare-inventory.mjs <baseline.json> <current.json> [manifest.json]");
  process.exit(2);
}
const base = JSON.parse(fs.readFileSync(basePath, "utf8"));
const cur = JSON.parse(fs.readFileSync(curPath, "utf8"));
const manifest = manifestPath ? JSON.parse(fs.readFileSync(manifestPath, "utf8")) : [];
const allowedPaths = manifest.map((m) => m.path);

function diff(a, b, path, acc) {
  if (JSON.stringify(a) === JSON.stringify(b)) return;
  const ta = a === null ? "null" : Array.isArray(a) ? "array" : typeof a;
  const tb = b === null ? "null" : Array.isArray(b) ? "array" : typeof b;
  if (ta !== tb || ta !== "object") {
    if (ta === "array" && tb === "array") {
      const n = Math.max(a.length, b.length);
      for (let i = 0; i < n; i++) diff(a[i], b[i], `${path}[${i}]`, acc);
      return;
    }
    acc.push({ path, baseline: a, current: b });
    return;
  }
  const keys = new Set([...Object.keys(a || {}), ...Object.keys(b || {})]);
  for (const k of keys) diff(a?.[k], b?.[k], path ? `${path}.${k}` : k, acc);
}

// timestamps and per-run fields are never compared
const STRIP = new Set([
  "captured_at", "label", "queries.identity", "signature", "signature_algo",
  "queries.sessions", "queries.line_runtime_privilege", "queries.proof_residue",
]);
function prune(obj) {
  const c = JSON.parse(JSON.stringify(obj));
  delete c.captured_at; delete c.label; delete c.signature; delete c.signature_algo;
  if (c.queries) {
    delete c.queries.identity;
    delete c.queries.sessions;
    delete c.queries.line_runtime_privilege;
    delete c.queries.proof_residue;
    delete c.queries.recent_migrations; // compared via global_migration_count + manifest
  }
  return c;
}

if (base.signature && cur.signature && base.signature === cur.signature) {
  console.log(`SIGNATURE MATCH  ${base.signature}`);
  process.exit(0);
}

const deltas = [];
diff(prune(base), prune(cur), "", deltas);

const explained = [];
const unexplained = [];
for (const d of deltas) {
  const hit = allowedPaths.find((p) => d.path === p || d.path.startsWith(p + ".") || d.path.startsWith(p + "["));
  if (hit) explained.push({ ...d, reason: manifest.find((m) => m.path === hit).reason });
  else unexplained.push(d);
}

console.log(`baseline signature: ${base.signature}`);
console.log(`current  signature: ${cur.signature}`);
console.log(`\nEXPLAINED deltas (${explained.length}):`);
for (const d of explained) console.log(`  ~ ${d.path}\n      ${JSON.stringify(d.baseline)} -> ${JSON.stringify(d.current)}   [${d.reason}]`);
console.log(`\nUNEXPLAINED deltas (${unexplained.length}):`);
for (const d of unexplained) console.log(`  ! ${d.path}\n      ${JSON.stringify(d.baseline)} -> ${JSON.stringify(d.current)}`);

if (unexplained.length) {
  console.error(`\nSTOP: ${unexplained.length} unexplained shared-surface delta(s). Do not proceed.`);
  process.exit(3);
}
console.log(`\nAll ${explained.length} delta(s) covered by the manifest. OK to proceed.`);
process.exit(0);
