#!/usr/bin/env node
// H3D fixture SQL static checks (§10). No DB. Parses the three fixture SQL files
// for the structural safety properties the review requires and exits non-zero on
// any violation.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../docs/platform/shared-runtime/fixtures");
// strip line comments so prose in `-- …` never trips a keyword check
const stripComments = (s) => s.split("\n").map((l) => l.replace(/--.*$/, "")).join("\n");
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

// ---- precheck is evidence only ----
ok(/EVIDENCE ONLY/.test(rawPrecheck) && /NOT the seed guard/i.test(rawPrecheck), "precheck: labelled evidence-only, not a guard");
ok(!/\b(BEGIN|COMMIT|INSERT|DELETE|UPDATE|ALTER|LOCK|CREATE)\b/i.test(PRECHECK), "precheck: SELECT-only (no statement keyword outside comments)");

console.error(bad ? `\nSQL STATIC CHECK: ${bad} FAILURE(S)` : "\nSQL STATIC CHECK PASS");
process.exit(bad ? 1 : 0);
