#!/usr/bin/env node
// Six-layer effective-privilege primitives — Lane-B reconstructed checks (U-R3).
//
// Specification: docs/platform/shared-runtime/CREDENTIAL-STRATEGY-LANE-B-2026-09-22.md
//   §1b (the six layers) · §3 (per-row "layer asserted") · §3.0 (qualified identity)
//   §3.1 (Contract A effective reach vs Contract B catalog inventory)
// contract revision: planning branch work/house-lane-b-longrun-plan-20260922 @ b80f813.
//
// OFFLINE. Nothing in this module opens a database connection. Every primitive is a
// pure function over already-measured catalog data; the live capture that produces that
// data lives in tools/shared-runtime/inventory/lane-b-effective-reach.mjs and is marked
// LIVE_DEFERRED_TO_A1_PREFLIGHT.
//
// BINDING CONSEQUENCES (contract §1b), encoded here so they cannot silently regress:
//   * has_table_privilege answers L2, not L4. Reach is L2 AND L3 on the SAME qualified
//     object, never inferred from either alone.
//   * has_schema_privilege answers L3, not L4.
//   * Contract A and Contract B are not alternatives; neither may be used to conclude
//     about the other (NEW-DEFECT-09).

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const REPO_ROOT = path.resolve(HERE, "../../..");

// ---------------------------------------------------------------------------
// The six layers (contract §1b)
// ---------------------------------------------------------------------------

export const LAYER = Object.freeze({
  CATALOG_PRESENCE: "L1",
  OBJECT_GRANT: "L2",
  SCHEMA_USAGE: "L3",
  EFFECTIVE_REACH: "L4",
  RLS_VISIBILITY: "L5",
  OWNERSHIP_CAPABILITY: "L6",
});

export const LAYERS = Object.freeze({
  L1: Object.freeze({
    id: "L1",
    name: "catalog presence",
    meaning: "the object exists in the catalog, independent of any caller's privilege",
    read_from: "pg_catalog.pg_class JOIN pg_catalog.pg_namespace (never information_schema.*)",
    primitive: "catalogPresence()",
    falsified_by: "an object present in the catalog but absent from the enumerated set",
  }),
  L2: Object.freeze({
    id: "L2",
    name: "object grant",
    meaning: "an ACL privilege on the object, direct or via inherited role membership",
    read_from: "has_table_privilege / has_sequence_privilege / has_function_privilege on the resolved OID",
    primitive: "objectGrant()",
    falsified_by: "a grant true where the model claims false, or false where the model claims true",
  }),
  L3: Object.freeze({
    id: "L3",
    name: "schema USAGE",
    meaning: "the caller may reference objects in the schema by qualified name",
    read_from: "has_schema_privilege(role, nspname, 'USAGE')",
    primitive: "schemaUsage()",
    falsified_by: "USAGE true on a schema the model claims unreachable, or false on one it claims reachable",
  }),
  L4: Object.freeze({
    id: "L4",
    name: "effective reach",
    meaning: "the caller can actually name and exercise the object: L2 AND L3 on the same qualified object",
    read_from: "conjunction of the L2 and L3 primitives on the same qualified identity",
    primitive: "effectiveReach()",
    falsified_by: "a qualified object reachable that is not in the set, or an asserted-reachable object that is not reachable",
  }),
  L5: Object.freeze({
    id: "L5",
    name: "RLS visibility",
    meaning: "which rows of a reachable relation the session may see",
    read_from: "pg_class.relrowsecurity + pg_roles.rolbypassrls, plus the behavioural control",
    primitive: "rlsMeasurability()",
    falsified_by: "a relation counted as a number while its rows are invisible",
  }),
  L6: Object.freeze({
    id: "L6",
    name: "ownership capability",
    meaning: "abilities derived from owning the object/schema (owner may ALTER/DROP/GRANT)",
    read_from: "pg_class.relowner / pg_namespace.nspowner + pg_has_role(member_of_owner)",
    primitive: "ownershipCapability()",
    falsified_by: "claiming a listed-grant ceiling while ownership-derived reach exists",
  }),
});

export const LAYER_ORDER = Object.freeze(["L1", "L2", "L3", "L4", "L5", "L6"]);

export function layerOf(primitiveName) {
  for (const l of Object.values(LAYERS)) if (l.primitive === primitiveName) return l;
  return null;
}

// ---------------------------------------------------------------------------
// Qualified identity (contract §3.0) — no reconstructed check compares a bare relname
// ---------------------------------------------------------------------------

export function qualifiedName({ nspname, relname }) {
  if (!nspname || !relname) {
    throw new Error(
      "relation identity requires the exact pair (nspname, relname); a bare relname is forbidden (NEW-DEFECT-08)",
    );
  }
  return `${nspname}.${relname}`;
}

export function assertTargetIdentity(target) {
  if (!target || typeof target !== "object") throw new Error("relation target must be an object");
  if (!target.oid && (!target.nspname || !target.relname)) {
    throw new Error(
      "relation target must carry c.oid OR the pair (nspname, relname); a bare relname is forbidden (NEW-DEFECT-08)",
    );
  }
  return target;
}

export function sameRelation(a, b) {
  if (!a || !b) return false;
  if (a.oid != null && b.oid != null) return String(a.oid) === String(b.oid);
  return a.nspname === b.nspname && a.relname === b.relname;
}

// ---------------------------------------------------------------------------
// Catalog enumeration + privilege measurement SQL (contract §3.0)
// pg_catalog, not information_schema (which is privilege-filtered — NEW-DEFECT-06).
// ---------------------------------------------------------------------------

export const RELKIND = Object.freeze({ TABLE: ["r", "p"], SEQUENCE: ["S"], FOREIGN: ["f"] });

export const TABLE_PRIVILEGES = Object.freeze([
  "SELECT", "INSERT", "UPDATE", "DELETE", "TRUNCATE", "REFERENCES", "TRIGGER",
]);
export const SEQUENCE_PRIVILEGES = Object.freeze(["SELECT", "USAGE", "UPDATE"]);
export const FOREIGN_TABLE_PRIVILEGES = Object.freeze([
  "SELECT", "INSERT", "UPDATE", "DELETE", "TRUNCATE", "REFERENCES", "TRIGGER",
]);
export const WRITE_PRIVILEGES = Object.freeze(["INSERT", "UPDATE", "DELETE", "TRUNCATE"]);

export function privilegeSetFor(relkind) {
  if (RELKIND.SEQUENCE.includes(relkind)) return [...SEQUENCE_PRIVILEGES];
  if (RELKIND.FOREIGN.includes(relkind)) return [...FOREIGN_TABLE_PRIVILEGES];
  if (RELKIND.TABLE.includes(relkind)) return [...TABLE_PRIVILEGES];
  throw new Error(`unsupported relkind '${relkind}'`);
}

// $1 = text[] of schema names. r/p first, then S and f enumerated separately.
export const CATALOG_ENUMERATION_SQL = `
SELECT c.oid AS reloid, n.nspname AS nspname, c.relname AS relname, c.relkind AS relkind
FROM pg_catalog.pg_class c
JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = ANY($1)
  AND c.relkind IN ('r','p','S','f')
ORDER BY n.nspname, c.relkind, c.relname`;

export const SCHEMA_USAGE_SQL = `
SELECT n.nspname AS nspname, has_schema_privilege(current_user, n.nspname, 'USAGE') AS usage
FROM pg_catalog.pg_namespace n
WHERE n.nspname = ANY($1)`;

// The OID is passed to every privilege primitive — never a <schema>.<rel> string,
// which would resolve through the session search_path (NEW-DEFECT-08).
export function objectPrivilegeSql(relkind) {
  const fn = RELKIND.SEQUENCE.includes(relkind) ? "has_sequence_privilege" : "has_table_privilege";
  return `${fn}(current_user, c.oid, p)`;
}

// ---------------------------------------------------------------------------
// L1..L6 primitives — pure, offline, individually callable
// ---------------------------------------------------------------------------

/** L1 — catalog presence. enumeration: rows of CATALOG_ENUMERATION_SQL. */
export function catalogPresence(enumeration, target) {
  assertTargetIdentity(target);
  const rows = Array.isArray(enumeration) ? enumeration : [];
  return rows.some((r) => sameRelation(normaliseRow(r), target));
}

/** L2 — object grant, by resolved OID only. Returns true | false | "UNMEASURED". */
export function objectGrant(grantsByOid, target, privilege) {
  assertTargetIdentity(target);
  if (target.oid == null) {
    throw new Error("objectGrant requires the resolved OID; a bare relname is forbidden (NEW-DEFECT-08)");
  }
  const key = String(target.oid);
  const rec = grantsByOid ? grantsByOid[key] : undefined;
  if (!rec || !Array.isArray(rec.privileges)) return "UNMEASURED";
  return rec.privileges.includes(privilege);
}

/** L3 — schema USAGE for the target schema. Returns true | false | "UNMEASURED". */
export function schemaUsage(usageBySchema, nspname) {
  if (!nspname) throw new Error("schemaUsage requires an nspname");
  const v = usageBySchema ? usageBySchema[nspname] : undefined;
  if (v === undefined || v === null) return "UNMEASURED";
  return v === true;
}

/**
 * L4 — effective reach. L2 (object grant) AND L3 (schema USAGE) on the SAME qualified
 * object. `schemaUsageRef` must be for `object.nspname`; a mismatch throws instead of
 * silently combining two different objects (the NEW-DEFECT-08/-09 model error).
 * Returns true | false | "UNMEASURED".
 */
export function effectiveReach({ object, grant, schemaUsage: schemaUsageRef }) {
  assertTargetIdentity(object);
  if (!schemaUsageRef || schemaUsageRef.nspname !== object.nspname) {
    throw new Error(
      `effectiveReach requires L3 schema USAGE for the same qualified object (${object.nspname}); got '${schemaUsageRef && schemaUsageRef.nspname}'`,
    );
  }
  if (grant === "UNMEASURED" || schemaUsageRef.usage === "UNMEASURED") return "UNMEASURED";
  return grant === true && schemaUsageRef.usage === true;
}

/**
 * L5 — measurability of a row count. A count is evidence only if the session is proven
 * able to see every row. UNMEASURED is never 0-as-PASS (contract §4).
 */
export function rlsMeasurability({ selectReach, relrowsecurity, rolbypassrls }) {
  if (selectReach !== true) return "UNMEASURED";
  if (relrowsecurity === false || rolbypassrls === true) return "MEASURED";
  return "UNMEASURED";
}

export function rlsCountEvidence(count, measurability) {
  if (measurability !== "MEASURED") return { value: "UNMEASURED", count: null };
  if (count === null || count === undefined || count === "") return { value: "UNMEASURED", count: null };
  const n = Number(count);
  if (!Number.isFinite(n)) return { value: "UNMEASURED", count: null };
  return { value: n, count: n };
}

/** L6 — ownership capability: the caller owns the object or is a member of its owner. */
export function ownershipCapability({ ownerOfObject, targetRole, roleMemberships }) {
  if (!ownerOfObject || !targetRole) return false;
  if (ownerOfObject === targetRole) return true;
  return Array.isArray(roleMemberships) && roleMemberships.includes(ownerOfObject);
}

function normaliseRow(r) {
  return { oid: r.oid ?? r.reloid ?? null, nspname: r.nspname, relname: r.relname, relkind: r.relkind };
}

// ---------------------------------------------------------------------------
// Contract A vs Contract B (contract §3.1) — separate, labelled, non-interchangeable
// ---------------------------------------------------------------------------

export const CONTRACT = Object.freeze({
  A_EFFECTIVE_REACH: "A",
  B_CATALOG_INVENTORY: "B",
});

export function requireContract(result, expected, purpose) {
  if (!result || result.contract !== expected) {
    throw new Error(
      `${purpose} must use Contract ${expected}; got Contract ${result && result.contract}. ` +
        "The two contracts are not interchangeable (NEW-DEFECT-09).",
    );
  }
  return result;
}

/**
 * Contract A — effective-reach assertion (L4 = L2 AND L3). Accepts qualified identity,
 * schema USAGE, and the object privilege set. It does NOT accept a catalog enumeration
 * and cannot be used as an inventory.
 */
export function assertEffectiveReachContract(opts = {}) {
  if (Object.prototype.hasOwnProperty.call(opts, "enumeration")) {
    throw new Error("Contract A (effective reach) must not be handed a catalog enumeration — use Contract B (NEW-DEFECT-09)");
  }
  const { object, schemaUsage: schemaUsageRef, grants, requiredPrivileges } = opts;
  assertTargetIdentity(object);
  if (!schemaUsageRef || schemaUsageRef.nspname !== object.nspname) {
    throw new Error(
      `Contract A requires L3 schema USAGE for the same qualified object (${object.nspname}); got '${schemaUsageRef && schemaUsageRef.nspname}'`,
    );
  }
  const privs = requiredPrivileges && requiredPrivileges.length ? requiredPrivileges : ["SELECT"];
  const perPrivilege = {};
  let allGranted = true;
  let unmeasured = false;
  for (const p of privs) {
    const g = objectGrant(grants, object, p);
    perPrivilege[p] = g;
    if (g === "UNMEASURED") unmeasured = true;
    else if (g !== true) allGranted = false;
  }
  const usage = schemaUsageRef.usage;
  const reach = effectiveReach({ object, grant: unmeasured ? "UNMEASURED" : allGranted, schemaUsage: { nspname: object.nspname, usage } });
  return Object.freeze({
    contract: CONTRACT.A_EFFECTIVE_REACH,
    layer: LAYER.EFFECTIVE_REACH,
    identity: qualifiedName(object),
    oid: object.oid ?? null,
    schema_usage: usage,
    object_privileges: perPrivilege,
    reach,
  });
}

/**
 * Contract B — catalog-surface inventory (L1 only). Accepts a catalog enumeration and
 * an expected qualified set. It does NOT accept grants or schema USAGE and deliberately
 * exposes no reach conclusion (NEW-DEFECT-09).
 */
export function inventoryCatalogSurface(opts = {}) {
  if (Object.prototype.hasOwnProperty.call(opts, "grants") || Object.prototype.hasOwnProperty.call(opts, "schemaUsage")) {
    throw new Error("Contract B (catalog inventory) must not be handed grants/schema USAGE — use Contract A (NEW-DEFECT-09)");
  }
  const { enumeration, expected } = opts;
  const rows = Array.isArray(enumeration) ? enumeration.map(normaliseRow) : [];
  const expectedRows = Array.isArray(expected) ? expected : [];
  const presentKeys = new Set(rows.map((r) => qualifiedName(r)));
  const expectedKeys = new Set(expectedRows.map((r) => qualifiedName(r)));
  const extra = [...presentKeys].filter((k) => !expectedKeys.has(k)).sort();
  const missing = [...expectedKeys].filter((k) => !presentKeys.has(k)).sort();
  return Object.freeze({
    contract: CONTRACT.B_CATALOG_INVENTORY,
    layer: LAYER.CATALOG_PRESENCE,
    present: [...presentKeys].sort(),
    expected: [...expectedKeys].sort(),
    extra,
    missing,
    ok: extra.length === 0 && missing.length === 0,
    // explicitly absent: this contract concludes nothing about reach.
    reach: undefined,
  });
}

// ---------------------------------------------------------------------------
// Sole allowlist source (contract §1a) — loaded, never duplicated
// ---------------------------------------------------------------------------

export const ALLOWLIST_FIXTURE_REL = "docs/platform/shared-runtime/fixtures/lane-b-per-stage-allowlist.json";

export function allowlistPath(root = REPO_ROOT) {
  return path.join(root, ALLOWLIST_FIXTURE_REL);
}

export function loadAllowlist(root = REPO_ROOT) {
  const p = allowlistPath(root);
  const doc = JSON.parse(fs.readFileSync(p, "utf8"));
  if (doc.fixture !== "lane-b-per-stage-allowlist") throw new Error(`${p} is not the lane-b per-stage allowlist`);
  if (!doc.stages || !doc.stages["H3D-A1"] || !doc.stages["H3D-LIVE"]) {
    throw new Error(`${p} must carry the H3D-A1 and H3D-LIVE per-stage exception rows`);
  }
  if (!Array.isArray(doc.always_forbidden_schemas)) throw new Error(`${p} must carry always_forbidden_schemas`);
  return doc;
}

export function stageAllowlist(allowlist, stage) {
  const row = allowlist && allowlist.stages ? allowlist.stages[stage] : undefined;
  if (!row) {
    throw new Error(
      `no per-stage exception row for '${stage}' — contract §1a is the SOLE allowlist source; ` +
        "an unknown stage STOPs rather than falling back to a second list (G-ALLOWLIST-SINGLE-SOURCE)",
    );
  }
  return row;
}

export function exceptionFor(allowlist, stage) {
  const row = stageAllowlist(allowlist, stage);
  return Array.isArray(row.exceptions) ? row.exceptions : [];
}

// ---------------------------------------------------------------------------
// Executable checks built on the primitives
// ---------------------------------------------------------------------------

/** Forbidden-reach (W): always-forbidden schemas must be L3-false. */
export function checkAlwaysForbiddenSchemas({ allowlist, usageBySchema }) {
  const violations = [];
  for (const s of allowlist.always_forbidden_schemas) {
    const u = schemaUsage(usageBySchema, s);
    if (u !== false) violations.push({ schema: s, layer: LAYER.SCHEMA_USAGE, usage: u, rule: "always-forbidden schema must be USAGE=false" });
  }
  return { layer: LAYER.SCHEMA_USAGE, violations, ok: violations.length === 0 };
}

/**
 * Forbidden reach (W) for wstera_platform_internal — L1 enumerate, L2 per-kind by OID,
 * L3 schema USAGE, L4 only from L2 AND L3. The allowlist is the stage's §1a row.
 */
export function checkForbiddenReachW({ allowlist, stage, enumeration, grantsByOid, usageBySchema }) {
  const row = stageAllowlist(allowlist, stage);
  const exceptions = exceptionFor(allowlist, stage);
  const violations = [];
  const checks = [];
  const inSchema = (enumeration || []).map(normaliseRow).filter((r) => r.nspname === "wstera_platform_internal");

  const schemaU = schemaUsage(usageBySchema, "wstera_platform_internal");
  const expectedSchemaUsage = row.wstera_platform_internal_schema_usage === true;
  if (schemaU !== expectedSchemaUsage) {
    violations.push({
      layer: LAYER.SCHEMA_USAGE,
      schema: "wstera_platform_internal",
      usage: schemaU,
      expected: expectedSchemaUsage,
      rule: "schema USAGE must match the §1a stage row",
    });
  }
  checks.push({ layer: LAYER.SCHEMA_USAGE, schema: "wstera_platform_internal", usage: schemaU, expected: expectedSchemaUsage });

  const matchedExceptionOids = new Set();
  for (const rel of inSchema) {
    const ex = exceptions.find((e) => e.nspname === rel.nspname && e.relname === rel.relname);
    const privs = privilegeSetFor(rel.relkind);
    for (const p of privs) {
      const g = objectGrant(grantsByOid, rel, p);
      const label = qualifiedName(rel);
      if (ex) {
        const allowed = Array.isArray(ex.allowed_privileges) && ex.allowed_privileges.includes(p);
        const denied = Array.isArray(ex.denied_privileges) && ex.denied_privileges.includes(p);
        if (allowed && g !== true) {
          violations.push({ layer: LAYER.OBJECT_GRANT, relation: label, privilege: p, grant: g, expected: true, rule: "§1a exception allowed privilege must be true" });
        }
        if (denied && g !== false) {
          violations.push({ layer: LAYER.OBJECT_GRANT, relation: label, privilege: p, grant: g, expected: false, rule: "§1a exception denied privilege must be false" });
        }
        if (allowed && g === true) matchedExceptionOids.add(String(rel.oid));
      } else if (g !== false) {
        violations.push({ layer: LAYER.OBJECT_GRANT, relation: label, privilege: p, grant: g, expected: false, rule: "every non-exception relation must be false on its whole per-kind privilege set" });
      }
    }
  }
  for (const ex of exceptions) {
    if (!inSchema.some((r) => r.nspname === ex.nspname && r.relname === ex.relname)) {
      violations.push({ layer: LAYER.CATALOG_PRESENCE, relation: qualifiedName(ex), rule: "§1a exception relation is absent from the catalog enumeration" });
    }
  }
  return {
    stage,
    contract: CONTRACT.A_EFFECTIVE_REACH,
    layer: LAYER.EFFECTIVE_REACH,
    violations,
    checks,
    ok: violations.length === 0,
  };
}

/** No real-table write privilege (M, W): all four write privileges false on the universe. */
export function checkForbiddenWritePrivileges({ universe, grantsByOid }) {
  const violations = [];
  for (const rel of universe || []) {
    for (const p of WRITE_PRIVILEGES) {
      const g = objectGrant(grantsByOid, rel, p);
      if (g !== false) {
        violations.push({ layer: LAYER.OBJECT_GRANT, relation: qualifiedName(rel), privilege: p, grant: g, expected: false });
      }
    }
  }
  return { layer: LAYER.OBJECT_GRANT, violations, ok: violations.length === 0 };
}

/** Accepted exposure — Contract A (effective reach) for the managed net surface. */
export function acceptedExposureEffectiveReach({ allowlist, enumeration, grantsByOid, usageBySchema }) {
  const expected = allowlist.accepted_exposure.effective_reach_contract_a.relation_set;
  const expectedKeys = new Set(expected.map((e) => qualifiedName(e)));
  const results = [];
  const violations = [];
  for (const rel of (enumeration || []).map(normaliseRow)) {
    const key = qualifiedName(rel);
    if (!["cron", "net"].includes(rel.nspname)) continue;
    const privs = privilegeSetFor(rel.relkind);
    const grants = {};
    let anyGranted = false;
    let unmeasured = false;
    for (const p of privs) {
      const g = objectGrant(grantsByOid, rel, p);
      grants[p] = g;
      if (g === "UNMEASURED") unmeasured = true;
      else if (g === true) anyGranted = true;
    }
    const usage = schemaUsage(usageBySchema, rel.nspname);
    const reach = effectiveReach({ object: rel, grant: unmeasured ? "UNMEASURED" : anyGranted, schemaUsage: { nspname: rel.nspname, usage } });
    results.push({ contract: CONTRACT.A_EFFECTIVE_REACH, layer: LAYER.EFFECTIVE_REACH, identity: key, reach, schema_usage: usage, object_privileges: grants });
    if (reach === true && !expectedKeys.has(key)) {
      violations.push({ relation: key, rule: "reachable relation outside the documented effective-reach set" });
    }
  }
  for (const e of expected) {
    const r = results.find((x) => x.identity === qualifiedName(e));
    if (r && r.reach !== true) {
      violations.push({ relation: qualifiedName(e), reach: r.reach, rule: "documented effective-reach relation is not L2 AND L3 reachable" });
    }
  }
  return { contract: CONTRACT.A_EFFECTIVE_REACH, layer: LAYER.EFFECTIVE_REACH, results, violations, ok: violations.length === 0 };
}

/** Accepted exposure — Contract B (catalog inventory) for the managed cron/net surface. */
export function acceptedExposureCatalogInventory({ allowlist, enumeration }) {
  const expected = allowlist.accepted_exposure.catalog_inventory_contract_b.relation_set;
  const scoped = (enumeration || []).map(normaliseRow).filter((r) => ["cron", "net"].includes(r.nspname));
  const inv = inventoryCatalogSurface({ enumeration: scoped, expected });
  return requireContract(inv, CONTRACT.B_CATALOG_INVENTORY, "accepted exposure — catalog inventory");
}

export default {
  LAYER,
  LAYERS,
  CONTRACT,
  loadAllowlist,
  stageAllowlist,
  catalogPresence,
  objectGrant,
  schemaUsage,
  effectiveReach,
  rlsMeasurability,
  rlsCountEvidence,
  ownershipCapability,
  assertEffectiveReachContract,
  inventoryCatalogSurface,
};
