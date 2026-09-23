#!/usr/bin/env node
// Lane-B source-level gates (U-R3): G-NO-BARE-RELNAME, G-ALLOWLIST-SINGLE-SOURCE,
// G-REVOKE-MIRROR, G-NO-DROP-OWNED.
//
// Specification: docs/platform/shared-runtime/CREDENTIAL-STRATEGY-LANE-B-2026-09-22.md §6
// contract revision: planning branch work/house-lane-b-longrun-plan-20260922 @ b80f813.
//
// OFFLINE. Files only. No DB, no LAB. The gates read the Lane-B tool sources and the
// generated runbooks and fail on a source-level violation. Every gate carries a negative
// control that fails if the gate's logic is removed or weakened.
//
// The needles are assembled from fragments at runtime so this file does not itself
// contain the literals it forbids (it is inside its own scan set).

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  REPO_ROOT,
  ALLOWLIST_FIXTURE_REL,
  loadAllowlist,
  objectPrivilegeSql,
} from "../lib/six-layer-privileges.mjs";
import { mirrorRevoke } from "./generate-runbooks.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const RUNBOOK_DIR = path.resolve(REPO_ROOT, "docs/platform/shared-runtime/runbooks");

// The reconstructed Lane-B sources this gate owns. A missing entry is a gate failure:
// the gate proves the set it scanned, not whatever happened to exist.
export const LANE_B_TOOL_SOURCES = [
  "tools/shared-runtime/lib/six-layer-privileges.mjs",
  "tools/shared-runtime/lib/probe-contract.mjs",
  "tools/shared-runtime/lib/provenance.mjs",
  "tools/shared-runtime/h3d/generate-runbooks.mjs",
  "tools/shared-runtime/h3d/lane-b-gates.mjs",
  "tools/shared-runtime/inventory/lane-b-effective-reach.mjs",
];

// ---------------------------------------------------------------------------
// needles (fragment-assembled so this file is clean under its own scan)
// ---------------------------------------------------------------------------

const REL = ["rel", "name"].join("");
const NSP = ["nsp", "name"].join("");
const PRIV_FN = ["has_", "(?:table|sequence|function)", "_privilege"].join("");

const PRIMITIVE_STRING_ARG = new RegExp(
  `${PRIV_FN}\\s*\\(\\s*[^,()]+,\\s*['"\`]`,
  "i",
);
const RELNAME_LITERAL = new RegExp(`${REL}\\s*(?:=|===|==)\\s*['"\`]`);
const QUALIFIER = new RegExp(NSP);
const DROP_OWNED = new RegExp(["DROP", "\\s+OWNED"].join(""), "i");

const STMT_GRANT = /(^|\n)\s*(GRANT\s+[^;]+;)/gi;
const STMT_REVOKE = /(^|\n)\s*(REVOKE\s+[^;]+;)/gi;

function normaliseSpace(s) {
  return s.replace(/\s+/g, " ").trim();
}

// SQL comment strip with EOL normalisation (same semantics as sql-static-check.mjs).
export function stripSqlComments(s) {
  return s
    .replace(/\r\n?/g, "\n")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .split("\n")
    .map((l) => l.replace(/--.*$/, ""))
    .join("\n");
}

function isProseLine(line) {
  const t = line.trim();
  return t.startsWith("--") || t.startsWith("//") || t.startsWith("*");
}

// ---------------------------------------------------------------------------
// G-NO-BARE-RELNAME
// ---------------------------------------------------------------------------

/**
 * Scans source text for two defects:
 *  (a) a relation compared to a bare name string without the (nspname) qualifier on the
 *      same statement line;
 *  (b) an object privilege primitive whose object argument is a name string rather than
 *      a resolved OID (the search_path defect).
 */
export function scanBareRelname(text, file = "<text>") {
  const violations = [];
  text.split("\n").forEach((line, i) => {
    if (isProseLine(line)) return;
    if (PRIMITIVE_STRING_ARG.test(line)) {
      violations.push({
        gate: "G-NO-BARE-RELNAME",
        file,
        line: i + 1,
        rule: "object privilege primitive receives a name string, not a resolved OID",
        text: line.trim().slice(0, 120),
      });
    }
    if (RELNAME_LITERAL.test(line) && !QUALIFIER.test(line)) {
      violations.push({
        gate: "G-NO-BARE-RELNAME",
        file,
        line: i + 1,
        rule: "bare relname compared to a name string (no nspname qualifier on the same statement)",
        text: line.trim().slice(0, 120),
      });
    }
  });
  return violations;
}

// ---------------------------------------------------------------------------
// G-ALLOWLIST-SINGLE-SOURCE
// ---------------------------------------------------------------------------

/** No JS tool source may carry a literal always-forbidden schema name. */
export function scanAllowlistDuplication(sources) {
  const allowlist = loadAllowlist();
  const names = allowlist.always_forbidden_schemas;
  const violations = [];
  const wordPattern = (name) =>
    new RegExp(`(^|[^A-Za-z0-9_])${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}([^A-Za-z0-9_]|$)`);
  for (const [file, text] of Object.entries(sources)) {
    for (const n of names) {
      if (wordPattern(n).test(text)) {
        violations.push({
          gate: "G-ALLOWLIST-SINGLE-SOURCE",
          file,
          rule: `tool source carries a literal forbidden-schema name '${n}' (second allowlist list)`,
        });
      }
    }
  }
  return violations;
}

/** A generated create-runbook's forbidden set must equal the sole source's set, exactly once each. */
export function checkRunbookForbiddenSet(runbookText, forbiddenNames) {
  const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const found = [...runbookText.matchAll(/always-forbidden schema (\S+) is USAGE=true/g)].map((m) => m[1]);
  const foundSorted = [...found].sort();
  const expectedSorted = [...forbiddenNames].sort();
  const setEqual =
    foundSorted.length === expectedSorted.length && foundSorted.every((v, i) => v === expectedSorted[i]);
  // residual: every occurrence of a forbidden name must be inside one of the two derived
  // forms (the has_schema_privilege argument or the RAISE message). Anything else is a
  // second list, even on a line that also carries a derived assertion (same-line evasion).
  const residual = [];
  const lines = runbookText.split("\n");
  for (const n of forbiddenNames) {
    const present = new RegExp(`(^|[^A-Za-z0-9_])${esc(n)}([^A-Za-z0-9_]|$)`);
    const allowedRaise = new RegExp(`always-forbidden schema ${esc(n)}\\b`);
    const allowedSchema = new RegExp(`has_schema_privilege\\([^'"]*'${esc(n)}'`);
    for (const line of lines) {
      if (present.test(line) && !allowedRaise.test(line) && !allowedSchema.test(line)) {
        residual.push(n);
        break;
      }
    }
  }
  return { ok: setEqual && residual.length === 0, set_equal: setEqual, found: foundSorted, expected: expectedSorted, residual };
}

// ---------------------------------------------------------------------------
// G-RUNBOOK-PRIV-LIST-BOUND  (NEW-DEFECT-10)
// ---------------------------------------------------------------------------

/**
 * A generated runbook may render the per-stage exception privileges, but every rendered
 * privilege list must be exactly what the sole allowlist source (fixture) specifies for that
 * stage — and nothing else. `generate-runbooks.mjs --check` already proves *on-disk == render*;
 * this gate closes the residual hole it cannot see: a hand-authored list that is self-consistent
 * with itself (i.e. written into the file AND the generator left alone), which would still be a
 * second constant list living in a runbook.
 *
 * For every runbook it extracts each `ARRAY['P','P',...]` privilege literal and requires the set
 * to be a permitted set for that stage: either the stage's declared allowed set, its denied set,
 * or the full seven-privilege universe (the non-exception fallback). An unknown privilege token —
 * or a set that matches none of those — is a violation.
 */
export function checkRunbookPrivilegeLists(runbookText, stage) {
  const UNIVERSE = ["SELECT", "INSERT", "UPDATE", "DELETE", "TRUNCATE", "REFERENCES", "TRIGGER"];
  // Sequence privilege primitives are a distinct per-kind set (contract §3a), not a table set.
  const SEQUENCE_SET = ["SELECT", "USAGE", "UPDATE"];
  const permitted = [];
  if (stage && Array.isArray(stage.allowed_privileges) && stage.allowed_privileges.length) {
    permitted.push([...stage.allowed_privileges].sort());
  }
  if (stage && Array.isArray(stage.denied_privileges) && stage.denied_privileges.length) {
    permitted.push([...stage.denied_privileges].sort());
  }
  permitted.push([...UNIVERSE].sort());
  permitted.push([...SEQUENCE_SET].sort());

  const violations = [];
  const arrays = [...runbookText.matchAll(/ARRAY\[([^\]]*)\]/g)].map((m) => m[1]);
  for (const body of arrays) {
    const toks = [...body.matchAll(/'([A-Z_]+)'/g)].map((m) => m[1]);
    if (toks.length === 0) continue;
    const known = new Set([...UNIVERSE, ...SEQUENCE_SET]);
    const unknown = toks.filter((t) => !known.has(t));
    if (unknown.length) {
      violations.push({ rule: `privilege list carries non-privilege token(s): ${unknown.join(",")}` });
      continue;
    }
    const sorted = [...toks].sort();
    const matches = permitted.some(
      (p) => p.length === sorted.length && p.every((v, i) => v === sorted[i]),
    );
    if (!matches) {
      violations.push({
        rule: `privilege list [${sorted.join(",")}] matches neither the stage's allowed set, its denied set, nor the full universe`,
      });
    }
  }
  return { ok: violations.length === 0, violations };
}

// ---------------------------------------------------------------------------
// G-REVOKE-MIRROR / G-NO-DROP-OWNED
// ---------------------------------------------------------------------------

export function parseGrants(text) {
  const stripped = stripSqlComments(text);
  return [...stripped.matchAll(STMT_GRANT)].map((m) => normaliseSpace(m[2]));
}

export function parseRevokes(text) {
  const stripped = stripSqlComments(text);
  return [...stripped.matchAll(STMT_REVOKE)].map((m) => normaliseSpace(m[2]));
}

export function checkRevokeMirror({ createText, teardownText, file = "<pair>" }) {
  const violations = [];
  const grants = parseGrants(createText);
  const revokes = parseRevokes(teardownText);
  const expectedRevokes = grants.map((g) => mirrorRevoke(g));
  if (grants.length === 0) {
    violations.push({ gate: "G-REVOKE-MIRROR", file, rule: "create runbook declares no grant to mirror" });
  }
  if (revokes.length !== grants.length) {
    violations.push({
      gate: "G-REVOKE-MIRROR",
      file,
      rule: `revoke count ${revokes.length} != grant count ${grants.length}`,
    });
  }
  for (const exp of expectedRevokes) {
    const n = revokes.filter((r) => r === exp).length;
    if (n !== 1) {
      violations.push({ gate: "G-REVOKE-MIRROR", file, rule: `grant not mirrored exactly once: ${exp} (found ${n})` });
    }
  }
  if (parseGrants(teardownText).length > 0) {
    violations.push({ gate: "G-REVOKE-MIRROR", file, rule: "teardown contains a GRANT" });
  }
  return { ok: violations.length === 0, grants, revokes, violations };
}

export function scanDropOwned(text, file = "<text>") {
  const stripped = stripSqlComments(text);
  const violations = [];
  stripped.split("\n").forEach((line, i) => {
    if (DROP_OWNED.test(line)) {
      violations.push({ gate: "G-NO-DROP-OWNED", file, line: i + 1, rule: `${["DROP", "OWNED"].join(" ")} is forbidden (F9)`, text: line.trim().slice(0, 120) });
    }
  });
  return violations;
}

// ---------------------------------------------------------------------------
// Run over the real artifacts
// ---------------------------------------------------------------------------

function readOrThrow(abs) {
  if (!fs.existsSync(abs)) throw new Error(`required file missing: ${path.relative(REPO_ROOT, abs)}`);
  return fs.readFileSync(abs, "utf8");
}

function runbookPairs() {
  const allowlist = loadAllowlist();
  const pairs = [];
  for (const stage of Object.keys(allowlist.stages)) {
    for (const cls of ["M", "W"]) {
      const role = cls === "M"
        ? `lane_b_measure_${stage === "H3D-A1" ? "a1" : "live"}`
        : `lane_b_rw_${stage === "H3D-A1" ? "a1" : "live"}`;
      const create = path.join(RUNBOOK_DIR, `lane-b-role-${role}-create.sql`);
      const teardown = path.join(RUNBOOK_DIR, `lane-b-role-${role}-teardown.sql`);
      pairs.push({ stage, cls, role, create, teardown });
    }
  }
  return pairs;
}

export function runGates() {
  const violations = [];
  const allowlist = loadAllowlist();
  const names = allowlist.always_forbidden_schemas;

  // --- sources ---
  const sources = {};
  for (const rel of LANE_B_TOOL_SOURCES) sources[rel] = readOrThrow(path.resolve(REPO_ROOT, rel));
  for (const [rel, text] of Object.entries(sources)) violations.push(...scanBareRelname(text, rel));
  violations.push(...scanAllowlistDuplication(sources));
  for (const [rel, text] of Object.entries(sources)) violations.push(...scanDropOwned(text, rel));

  // objectPrivilegeSql must emit the OID, never a name string (direct assertion)
  if (!/\.oid\b/.test(objectPrivilegeSql("r")) || !/\.oid\b/.test(objectPrivilegeSql("S"))) {
    violations.push({ gate: "G-NO-BARE-RELNAME", file: "lib/six-layer-privileges.mjs", rule: "objectPrivilegeSql does not pass the OID" });
  }

  // --- runbooks ---
  const pairReport = [];
  for (const p of runbookPairs()) {
    const createText = readOrThrow(p.create);
    const teardownText = readOrThrow(p.teardown);
    const relCreate = path.relative(REPO_ROOT, p.create);
    const relTeardown = path.relative(REPO_ROOT, p.teardown);

    violations.push(...scanDropOwned(createText, relCreate));
    violations.push(...scanDropOwned(teardownText, relTeardown));
    violations.push(...scanBareRelname(createText, relCreate));
    violations.push(...scanBareRelname(teardownText, relTeardown));

    if (p.cls === "W") {
      const mirror = checkRevokeMirror({ createText, teardownText, file: relTeardown });
      violations.push(...mirror.violations);
      const fset = checkRunbookForbiddenSet(createText, names);
      if (!fset.ok) {
        violations.push({
          gate: "G-ALLOWLIST-SINGLE-SOURCE",
          file: relCreate,
          rule: `forbidden set mismatch vs sole source (set_equal=${fset.set_equal}, residual=${fset.residual.join(",") || "none"})`,
        });
      }
      pairReport.push({ role: p.role, grants: mirror.grants.length, revokes: mirror.revokes.length, forbidden_set: fset.found });
    }
  }
  return { ok: violations.length === 0, violations, pairReport, forbidden_schemas: names };
}

// ---------------------------------------------------------------------------
// Selftest — negative controls that must fail when the gate logic is removed
// ---------------------------------------------------------------------------

export function selftest() {
  let bad = 0;
  const ok = (c, m) => {
    if (!c) {
      process.stderr.write(`FAIL ${m}\n`);
      bad++;
    }
  };

  // G-NO-BARE-RELNAME negative controls
  ok(scanBareRelname(`const x = r.${REL} === 'shops';`).length >= 1, "bare relname literal is flagged (negative control)");
  ok(scanBareRelname(`const x = r.${NSP} === 'ps01' && r.${REL} === 'shops';`).length === 0, "qualified pair is not flagged");
  const Q = String.fromCharCode(39);
  const badPriv = ["has_", "table", "_privilege(current_user, "].join("") + Q + "ps01.shops" + Q + ", " + Q + "SELECT" + Q + ");";
  ok(badPriv.includes(["has_", "table", "_privilege"].join("")), "needle sanity: control string is the privilege primitive");
  ok(scanBareRelname(badPriv).length >= 1, "privilege primitive with a name string is flagged (negative control)");
  const goodPriv = ["has_", "table", "_privilege(current_user, c.oid, "].join("") + Q + "SELECT" + Q + ");";
  ok(scanBareRelname(goodPriv).length === 0, "privilege primitive with an OID is not flagged");

  // G-ALLOWLIST-SINGLE-SOURCE negative controls
  const fakeSource = ["const list = ['" + ["local", "_service"].join("") + "', '" + ["m", "t01"].join("") + "'];"].join("\n");
  const dup = scanAllowlistDuplication({ "fake.mjs": fakeSource });
  ok(dup.length >= 1, "a second literal forbidden-schema list in a tool source is flagged (negative control)");
  const clean = { "fake.mjs": "const list = loadAllowlist().always_forbidden_schemas;" };
  ok(scanAllowlistDuplication(clean).length === 0, "reading the sole source is not flagged");

  const realAllowlist = loadAllowlist();
  const names = realAllowlist.always_forbidden_schemas;
  // mutation of a REAL create runbook: drop one derived assertion -> set mismatch must fail
  {
    const p = path.join(RUNBOOK_DIR, "lane-b-role-lane_b_rw_a1-create.sql");
    const text = fs.readFileSync(p, "utf8");
    ok(checkRunbookForbiddenSet(text, names).ok, "real W create runbook forbidden set equals the sole source");
    const mutated = text.split("\n").filter((l) => !l.includes(names[0])).join("\n");
    ok(!checkRunbookForbiddenSet(mutated, names).ok, "removing one forbidden-schema assertion is flagged (negative control)");
    const secondList = text + "\n-- " + names.join(" ") + "\n";
    ok(!checkRunbookForbiddenSet(secondList, names).ok, "a residual second forbidden-name list is flagged (negative control)");
  }

  // G-RUNBOOK-PRIV-LIST-BOUND negative controls (NEW-DEFECT-10)
  {
    const allowlist = loadAllowlist();
    const liveStage = ((allowlist.stages || {})["H3D-LIVE"] || {}).exceptions?.[0];
    const liveText = fs.readFileSync(
      path.join(RUNBOOK_DIR, "lane-b-role-lane_b_rw_live-create.sql"),
      "utf8",
    );
    ok(
      checkRunbookPrivilegeLists(liveText, liveStage).ok,
      "real H3D-LIVE runbook privilege lists are bound to the sole source",
    );
    // mutation: widen the allowed set with a privilege the stage must NOT hold -> must be flagged
    const widened = liveText.replace(
      "ARRAY['SELECT','INSERT','DELETE']",
      "ARRAY['SELECT','INSERT','DELETE','UPDATE']",
    );
    ok(widened !== liveText, "needle sanity: the allowed-set literal is present exactly as expected");
    ok(
      !checkRunbookPrivilegeLists(widened, liveStage).ok,
      "widening an allowed privilege set is flagged (mutation negative control)",
    );
    // mutation: a hand-authored extra list outside any permitted set -> must be flagged
    const extra = liveText + "\n-- ARRAY['SELECT','UPDATE']\n";
    ok(
      !checkRunbookPrivilegeLists(extra, liveStage).ok,
      "a hand-authored extra privilege list is flagged (mutation negative control)",
    );
    // mutation: a non-privilege token smuggled into a list -> must be flagged
    const bogus = liveText.replace(
      "ARRAY['SELECT','INSERT','DELETE']",
      "ARRAY['SELECT','INSERT','DELETE','SUPERUSER']",
    );
    ok(
      !checkRunbookPrivilegeLists(bogus, liveStage).ok,
      "a non-privilege token in a list is flagged (mutation negative control)",
    );
  }

  // G-REVOKE-MIRROR negative controls against a REAL pair
  {
    const createPath = path.join(RUNBOOK_DIR, "lane-b-role-lane_b_rw_live-create.sql");
    const teardownPath = path.join(RUNBOOK_DIR, "lane-b-role-lane_b_rw_live-teardown.sql");
    const createText = fs.readFileSync(createPath, "utf8");
    const teardownText = fs.readFileSync(teardownPath, "utf8");
    ok(checkRevokeMirror({ createText, teardownText }).ok, "real W live runbook pair mirrors every grant");
    const lines = teardownText.split("\n");
    const revokeIdx = lines.findIndex((l) => /^\s*REVOKE\s/.test(l));
    ok(revokeIdx >= 0, "real teardown has a REVOKE line to mutate");
    const mutated = lines.filter((_, i) => i !== revokeIdx).join("\n");
    ok(!checkRevokeMirror({ createText, teardownText: mutated }).ok, "removing one mirrored REVOKE is flagged (negative control)");
  }
  {
    // an unmatched extra revoke must also fail
    const createText = "BEGIN;\nGRANT SELECT ON ps01.t TO r;\nCOMMIT;\n";
    const teardownText = "BEGIN;\nREVOKE SELECT ON ps01.t FROM r;\nREVOKE SELECT ON ps01.other FROM r;\nDROP ROLE r;\nCOMMIT;\n";
    ok(!checkRevokeMirror({ createText, teardownText }).ok, "an extra unmatched REVOKE is flagged (negative control)");
  }

  // G-NO-DROP-OWNED negative controls
  ok(scanDropOwned("DROP ROLE r;").length === 0, "DROP ROLE is not a role-ownership drop");
  ok(scanDropOwned(["DROP", "OWNED BY r;"].join(" ")).length >= 1, `${["DROP", "OWNED"].join(" ")} is flagged (negative control)`);

  // real artifacts are clean
  const report = runGates();
  ok(report.ok, `real Lane-B artifacts pass all four gates (${report.violations.length} violation(s))`);
  if (!report.ok) for (const v of report.violations) process.stderr.write(`  - ${v.gate} ${v.file}: ${v.rule}\n`);

  process.stderr.write(
    bad
      ? `\nLANE-B GATES SELFTEST: ${bad} FAILURE(S)\n`
      : `\nLANE-B GATES SELFTEST PASS (G-NO-BARE-RELNAME, G-ALLOWLIST-SINGLE-SOURCE, G-RUNBOOK-PRIV-LIST-BOUND, G-REVOKE-MIRROR, G-NO-DROP-OWNED)\n`,
  );
  return bad;
}

export default { runGates, selftest, LANE_B_TOOL_SOURCES, scanBareRelname, checkRevokeMirror, scanDropOwned };

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const mode = process.argv[2] || "--selftest";
  if (mode === "--selftest") {
    process.exit(selftest() ? 1 : 0);
  } else if (mode === "--check") {
    const r = runGates();
    for (const v of r.violations) process.stderr.write(`VIOLATION ${v.gate} ${v.file}: ${v.rule}\n`);
    process.stderr.write(r.ok ? "\nLANE-B GATES PASS\n" : `\nLANE-B GATES: ${r.violations.length} VIOLATION(S)\n`);
    process.exit(r.ok ? 0 : 1);
  } else {
    process.stderr.write("usage: lane-b-gates.mjs --selftest | --check\n");
    process.exit(2);
  }
}
