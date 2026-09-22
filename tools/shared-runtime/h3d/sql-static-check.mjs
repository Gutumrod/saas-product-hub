#!/usr/bin/env node
// H3D fixture SQL static checks (§10). No DB. Parses the three fixture SQL files
// for the structural safety properties the review requires and exits non-zero on
// any violation.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../docs/platform/shared-runtime/fixtures");
// strip line comments so prose in `-- …` never trips a keyword check
export const stripComments = (s) =>
  s.replace(/\/\*[\s\S]*?\*\//g, "").split("\n").map((l) => l.replace(/--.*$/, "")).join("\n");

export function parseLockTableStatements(sql) {
  const stripped = stripComments(sql);
  const stmtRe = /LOCK\s+TABLE\s+([^;]+);/gi;
  const locks = [];
  let stmtMatch;
  while ((stmtMatch = stmtRe.exec(stripped)) !== null) {
    const rawBody = stmtMatch[1].trim();
    const modeMatch = rawBody.match(/\s+IN\s+([A-Z\s]+?)\s+MODE\s*$/i);
    const mode = modeMatch ? modeMatch[1].trim().replace(/\s+/g, " ").toUpperCase() : null;
    const tablesPart = modeMatch ? rawBody.slice(0, modeMatch.index).trim() : rawBody;
    const tableTokens = tablesPart.split(",").map((t) => t.trim()).filter(Boolean);
    for (const token of tableTokens) {
      const cleanToken = token.replace(/^ONLY\s+/i, "").replace(/\s*\*$/, "").trim();
      const parts = cleanToken.split(".");
      const schema = parts.length > 1 ? parts[0] : null;
      const table = parts.length > 1 ? parts[1] : parts[0];
      locks.push({
        schema,
        table,
        fullTable: schema ? `${schema}.${table}` : table,
        mode,
        statement: stmtMatch[0],
      });
    }
  }
  return locks;
}

export function checkLockOrderSubsequence(seedSql, teardownSql) {
  const seedLocks = parseLockTableStatements(seedSql);
  const teardownLocks = parseLockTableStatements(teardownSql);
  const seedTables = seedLocks.map((l) => l.table);
  const teardownTables = teardownLocks.map((l) => l.table);

  const errors = [];
  const teardownIndices = new Map();
  teardownTables.forEach((t, idx) => {
    if (!teardownIndices.has(t)) teardownIndices.set(t, idx);
  });

  if (seedTables.length === 0) {
    errors.push("No LOCK TABLE statements found in seed SQL");
  }
  if (teardownTables.length === 0) {
    errors.push("No LOCK TABLE statements found in teardown SQL");
  }

  // 1. All tables locked in seed must exist in teardown lock list
  for (const t of seedTables) {
    if (!teardownIndices.has(t)) {
      errors.push(`Table '${t}' locked in seed is not in teardown lock list`);
    }
  }

  // 2. Relative order must be preserved: any pair in seed must appear in the same relative order in teardown
  const inversions = [];
  for (let i = 0; i < seedTables.length; i++) {
    for (let j = i + 1; j < seedTables.length; j++) {
      const tA = seedTables[i];
      const tB = seedTables[j];
      const idxA = teardownIndices.get(tA);
      const idxB = teardownIndices.get(tB);
      if (idxA !== undefined && idxB !== undefined && idxA >= idxB) {
        inversions.push({
          firstInSeed: tA,
          secondInSeed: tB,
          teardownIdxFirst: idxA,
          teardownIdxSecond: idxB,
        });
        errors.push(`Lock order inversion: seed locks '${tA}' before '${tB}', but teardown locks '${tB}' (idx ${idxB}) before '${tA}' (idx ${idxA})`);
      }
    }
  }

  return {
    ok: errors.length === 0,
    seedTables,
    teardownTables,
    inversions,
    errors,
  };
}

export function runSqlStaticCheck() {
  const rawSeed = fs.readFileSync(path.join(DIR, "h3d-authz-fixture-seed.sql"), "utf8");
  const rawTeardown = fs.readFileSync(path.join(DIR, "h3d-authz-fixture-teardown.sql"), "utf8");
  const rawPrecheck = fs.readFileSync(path.join(DIR, "h3d-authz-fixture-precheck.sql"), "utf8");
  const SEED = stripComments(rawSeed);
  const TEARDOWN = stripComments(rawTeardown);
  const PRECHECK = stripComments(rawPrecheck);

  let bad = 0;
  const ok = (c, m) => { if (!c) { console.error(`FAIL: ${m}`); bad++; } };

  // ---- both transactional files ----
  for (const [name, sql] of [["seed", SEED], ["teardown", TEARDOWN]]) {
    ok(/^\s*(\\set ON_ERROR_STOP on\s*)?BEGIN;/im.test(sql), `${name}: opens with BEGIN`);
    ok(/\bCOMMIT;\s*$/m.test(sql.trim()), `${name}: ends with COMMIT`);
    ok(sql.includes("\\set ON_ERROR_STOP on"), `${name}: \\set ON_ERROR_STOP on`);
    ok(/SET LOCAL lock_timeout/.test(sql), `${name}: bounded lock_timeout`);
    ok(/SET LOCAL statement_timeout/.test(sql), `${name}: bounded statement_timeout`);
    ok(/SET LOCAL idle_in_transaction_session_timeout/.test(sql), `${name}: bounded idle_in_transaction_session_timeout`);
    ok(/current_user <> 'postgres'/.test(sql) && /current_database\(\) <> 'postgres'/.test(sql), `${name}: asserts postgres session + DB`);
    ok(/pg_has_role\('postgres', 'ps01_migrator', 'MEMBER'\)/.test(sql), `${name}: asserts ps01_migrator membership (F09)`);
    ok(/SET CONSTRAINTS ALL IMMEDIATE/.test(sql), `${name}: forces deferred constraints immediate`);
    // no unscoped DELETE / UPDATE / TRUNCATE
    ok(!/\bDELETE FROM ps01\.\w+\s*;/i.test(sql), `${name}: no unscoped DELETE`);
    ok(!/\bUPDATE ps01\./i.test(sql), `${name}: no UPDATE of PS01 data`);
    ok(!/\bTRUNCATE\b/i.test(sql), `${name}: no TRUNCATE`);
    // every DELETE is id-scoped
    const deletes = sql.match(/DELETE FROM ps01\.[^;]+;/gi) || [];
    for (const d of deletes) ok(/WHERE\s+id\s*(=|IN)/i.test(d), `${name}: DELETE is id-scoped -> ${d.replace(/\s+/g, " ").slice(0, 70)}`);
  }

  // ---- seed specifics (§5) ----
  ok(/LOCK TABLE ps01\.shops\s+IN SHARE ROW EXCLUSIVE MODE/.test(SEED), "seed: SHARE ROW EXCLUSIVE on shops");
  for (const t of ["pet_owners", "pets", "rooms", "room_rate_plans", "shop_subscriptions", "subscription_audit_log"]) {
    ok(new RegExp(`LOCK TABLE ps01\\.${t}\\s+IN SHARE ROW EXCLUSIVE MODE`).test(SEED), `seed: SHARE ROW EXCLUSIVE on ${t}`);
  }
  ok(/FOR SHARE/.test(SEED) && /commercial_packages WHERE id = 'starter'/.test(SEED), "seed: pins starter package FOR SHARE");
  ok(/room_limit .* < 1/.test(SEED) && /pet_history_limit .* < 2/.test(SEED), "seed: starter limit assertions >=1 / >=2");
  ok(/pre-seed baseline is not empty/.test(SEED), "seed: asserts the empty pre-seed baseline");
  ok(/IS DISTINCT FROM \(2, 2, 2, 1, 1, 2, 2\)/.test(SEED), "seed: exact +8/+4 delta assertion");
  ok(/an unrelated shop-rooted table gained rows/.test(SEED), "seed: asserts every other graph table +0");
  ok(/trial_ends_at <> ss\.trial_started_at \+ interval '30 days'/.test(SEED), "seed: exact trial-window relationship");
  ok(/subscription semantics wrong/.test(SEED) && /audit row semantics wrong/.test(SEED), "seed: exact subscription + audit semantics");
  ok(/al\.previous_status IS NOT NULL/.test(SEED) && /al\.idempotency_key IS NOT NULL/.test(SEED), "seed: audit previous_* / idempotency null assertions");
  ok(/h3d_seed_manifest/.test(SEED) && /generated_ids/.test(SEED) && /txid_current\(\)/.test(SEED), "seed: emits a manifest with generated ids + txid");
  ok(!/ON CONFLICT/i.test(SEED), "seed: no ON CONFLICT");
  ok(/lower\(slug\) LIKE 'h3d-proof-%'/.test(SEED) && /upper\(line_user_id\) LIKE 'H3D-PROOF-%'/.test(SEED), "seed: case-normalised label collision check");

  // ---- teardown specifics (§6) ----
  ok(/LOCK TABLE ps01\.subscription_audit_log IN ACCESS EXCLUSIVE MODE/.test(TEARDOWN), "teardown: ACCESS EXCLUSIVE on subscription_audit_log, acquired directly");
  ok(TEARDOWN.indexOf("ACCESS EXCLUSIVE MODE") < TEARDOWN.indexOf("SHARE ROW EXCLUSIVE MODE"), "teardown: audit lock acquired before the other locks");
  ok(/:'manifest'::jsonb/.test(TEARDOWN) && /h3d-authz-fixture-seed-manifest/.test(TEARDOWN), "teardown: loads + validates the seed manifest");
  ok(/generated_ids'->>'subscription_a'/.test(TEARDOWN) && /generated_ids'->>'audit_a'/.test(TEARDOWN), "teardown: targets exact generated subscription + audit ids");
  ok(/an unexpected child row exists for a fixture shop/.test(TEARDOWN), "teardown: asserts zero non-fixture child rows before first DELETE");
  ok(/t\.tgenabled='O'/.test(TEARDOWN), "teardown: verifies immutable trigger began exactly enabled ('O')");
  ok(/ALTER TABLE ps01\.subscription_audit_log DISABLE TRIGGER trg_subscription_audit_immutable/.test(TEARDOWN)
     && /ALTER TABLE ps01\.subscription_audit_log ENABLE TRIGGER trg_subscription_audit_immutable/.test(TEARDOWN), "teardown: disable + re-enable the exact named trigger");
  ok(/DELETE FROM ps01\.subscription_audit_log WHERE id IN \(aud_a, aud_b\)/.test(TEARDOWN), "teardown: deletes exact audit ids, not shop ids");
  ok((TEARDOWN.match(/GET DIAGNOSTICS n = ROW_COUNT/g) || []).length >= 6, "teardown: ROW_COUNT check after every delete");
  ok(/DELETE FROM ps01\.shops WHERE id IN \(a, b\)[\s\S]{0,120}n <> 2/.test(TEARDOWN), "teardown: shop delete last, must affect exactly 2");
  ok(/counts not restored to the pre-seed baseline/.test(TEARDOWN), "teardown: restores exact pre-seed counts");
  ok(/immutable-audit trigger not re-enabled to state O/.test(TEARDOWN), "teardown: re-verifies trigger state after");
  // the shop DELETE must come after all children are proven zero
  ok(TEARDOWN.indexOf("an unexpected child row exists") < TEARDOWN.indexOf("DELETE FROM ps01.shops"), "teardown: child-zero assertion precedes shop delete");

  // ---- S5 / camera_access_audit scope checks ----
  ok(/LOCK TABLE ps01\.camera_access_audit\s+IN SHARE ROW EXCLUSIVE MODE/.test(SEED), "seed: SHARE ROW EXCLUSIVE on camera_access_audit");
  ok(/camera_access_audit.*WHERE shop_id IN/i.test(SEED), "seed: atomic precondition on camera_access_audit for fixture shops");
  ok(/camera_access_audit_baseline/.test(SEED) && /camera_access_audit_fixture_count/.test(SEED), "seed: records camera_access_audit baseline and count in manifest");
  ok(/LOCK TABLE ps01\.camera_access_audit\s+IN SHARE ROW EXCLUSIVE MODE/.test(TEARDOWN), "teardown: SHARE ROW EXCLUSIVE on camera_access_audit");
  ok(TEARDOWN.indexOf("camera_access_audit") < TEARDOWN.indexOf("DELETE FROM ps01.shops"), "teardown: camera_access_audit check precedes first DELETE");
  ok(/camera_access_audit_fixture_count/.test(TEARDOWN), "teardown: post-restoration asserts camera_access_audit residue is zero");

  // ---- lock-order subsequence verification (H3D-S §10) ----
  const lockOrder = checkLockOrderSubsequence(SEED, TEARDOWN);
  ok(lockOrder.ok, `seed lock order is an exact subsequence of teardown order: ${lockOrder.errors.join("; ")}`);

  // Unit check: verify that checkLockOrderSubsequence fails on inverted lock order fixture
  const invertedFixture = `
LOCK TABLE ps01.shops                  IN SHARE ROW EXCLUSIVE MODE;
LOCK TABLE ps01.subscription_audit_log IN SHARE ROW EXCLUSIVE MODE;
`;
  const invertedResult = checkLockOrderSubsequence(invertedFixture, TEARDOWN);
  ok(!invertedResult.ok, "lock order static check unit: fails on inverted lock order fixture");
  ok(invertedResult.inversions.length === 1
    && invertedResult.inversions[0].firstInSeed === "shops"
    && invertedResult.inversions[0].secondInSeed === "subscription_audit_log",
    "lock order static check unit: identifies exact inverted pair (shops, subscription_audit_log)");

  // Unit check: verify that checkLockOrderSubsequence fails on pre-fix seed lock ordering
  const preFixSeedFixture = `
LOCK TABLE ps01.shops                  IN SHARE ROW EXCLUSIVE MODE;
LOCK TABLE ps01.pet_owners             IN SHARE ROW EXCLUSIVE MODE;
LOCK TABLE ps01.pets                   IN SHARE ROW EXCLUSIVE MODE;
LOCK TABLE ps01.rooms                  IN SHARE ROW EXCLUSIVE MODE;
LOCK TABLE ps01.room_rate_plans        IN SHARE ROW EXCLUSIVE MODE;
LOCK TABLE ps01.shop_subscriptions     IN SHARE ROW EXCLUSIVE MODE;
LOCK TABLE ps01.subscription_audit_log IN SHARE ROW EXCLUSIVE MODE;
LOCK TABLE ps01.camera_access_audit    IN SHARE ROW EXCLUSIVE MODE;
`;
  const preFixResult = checkLockOrderSubsequence(preFixSeedFixture, TEARDOWN);
  ok(!preFixResult.ok, "lock order static check unit: fails on pre-fix seed lock ordering");
  ok(preFixResult.inversions.length === 10, "lock order static check unit: detects 10 inversions in pre-fix seed ordering");

  // ---- precheck is evidence only ----
  ok(/EVIDENCE ONLY/.test(rawPrecheck) && /NOT the seed guard/i.test(rawPrecheck), "precheck: labelled evidence-only, not a guard");
  ok(!/\b(BEGIN|COMMIT|INSERT|DELETE|UPDATE|ALTER|LOCK|CREATE)\b/i.test(PRECHECK), "precheck: SELECT-only (no statement keyword outside comments)");

  console.error(bad ? `\nSQL STATIC CHECK: ${bad} FAILURE(S)` : "\nSQL STATIC CHECK PASS");
  return bad;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const bad = runSqlStaticCheck();
  process.exit(bad ? 1 : 0);
}
