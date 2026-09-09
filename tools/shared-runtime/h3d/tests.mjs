#!/usr/bin/env node
// H3D offline test aggregator (§10). No DB. Runs every offline selftest + static
// check and a set of catalog-drift scenarios against the captured manifest JSON.
//
// The transaction / concurrency / failure-injection matrix (§10 "Transaction/
// concurrency") is DESIGNED but cannot be executed under the implementation-lane
// brief (no fixture-DML authorization). Its exact scenarios are enumerated in
// docs/platform/shared-runtime/evidence/H3D-FINAL-REMEDIATION-2026-09-09.md §"Concurrency / failure-injection matrix"
// and re-asserted structurally by sql-static-check.mjs.

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const EXPECTED = path.resolve(HERE, "../../../docs/platform/shared-runtime/fixtures/h3d-expected-catalog-manifest.json");

let fail = 0;
const run = (label, file, args = ["--selftest"]) => {
  try {
    execFileSync("node", [path.join(HERE, file), ...args], { stdio: ["ignore", "ignore", "inherit"] });
    console.log(`  PASS  ${label}`);
  } catch {
    console.error(`  FAIL  ${label}`);
    fail++;
  }
};

console.log("=== H3D offline test suite ===");
run("catalog-manifest --selftest", "catalog-manifest.mjs");
run("sql-static-check", "sql-static-check.mjs", []);
run("h3d-live-runner --selftest", "h3d-live-runner.mjs");
run("h3c-proof-harness --selftest", "../h3c/h3c-proof-harness.mjs");
run("h4-probe-harness --selftest", "../h4/h4-probe-harness.mjs");

// ---- catalog-drift scenarios against the captured expected manifest ----
console.log("--- catalog drift scenarios ---");
const expected = JSON.parse(fs.readFileSync(EXPECTED, "utf8"));
// catalog-manifest.mjs is a CLI script (no exports); its --selftest above already
// covers the pure drift-diff logic. Here we assert the captured expected manifest
// itself carries the exact shape the seed/teardown depend on, so a future real
// capture that drifts would visibly differ.
const need = (c, m) => { if (!c) { console.error(`  FAIL  ${m}`); fail++; } else console.log(`  PASS  ${m}`); };
const tg = Object.fromEntries(expected.triggers.map((t) => [`${t.table}.${t.name}`, t]));
need(tg["shops.trg_initialize_shop_subscription_after_insert"]?.enabled === "O", "expected manifest: shop-init trigger enabled");
need(tg["subscription_audit_log.trg_subscription_audit_immutable"]?.enabled === "O", "expected manifest: audit-immutable trigger enabled");
need(tg["pets.trg_enforce_pet_commercial_quota"] && tg["rooms.trg_enforce_room_commercial_quota"], "expected manifest: pet + room quota triggers present");
need(expected.starter_package.row?.id === "starter" && expected.starter_package.row.room_limit >= 1 && expected.starter_package.row.pet_history_limit >= 2,
  "expected manifest: starter package usable (room_limit>=1, pet_history_limit>=2)");
const fkByChild = {};
for (const fk of expected.graph_fks) (fkByChild[fk.child] ||= []).push(fk);
need(expected.graph_tables.includes("subscription_audit_log") && expected.graph_tables.includes("shop_subscriptions"),
  "expected manifest: audit + subscription tables are in the shop-rooted graph");
need(fkByChild.subscription_audit_log?.some((fk) => fk.parent === "shops" && fk.on_delete === "c"),
  "expected manifest: subscription_audit_log <- shops ON DELETE CASCADE (teardown must not rely on it)");
need(typeof expected.fingerprint === "string" && expected.fingerprint.length === 64, "expected manifest: has a sha256 fingerprint");

console.log(fail ? `\n${fail} FAILURE(S)` : "\nALL H3D OFFLINE TESTS PASS");
process.exit(fail ? 1 : 0);
