import test from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { captureLiveWithPreflight, validateCaptureTarget } from "./lane-b-capture.mjs";

const stableJson = (value) => {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(",")}]`;
  if (value && typeof value === "object") return `{${Object.keys(value).filter((key) => value[key] !== undefined).sort().map((key) => `${JSON.stringify(key)}:${stableJson(value[key])}`).join(",")}}`;
  return JSON.stringify(value);
};

const config = {
  lab_project_ref: "ykxlqnshaaxmzzocpjlj",
  production_project_ref: "gyleqrjdzwwlqierdwcy",
  database_host_template: "db.{project_ref}.supabase.co",
  output_env: "OUT",
  project_ref_env: "REF",
  database_url_env: "URL",
  stage_env: "STAGE",
  default_stage: "H3D-LIVE",
};
const envFor = (ref = config.lab_project_ref, hostRef = config.lab_project_ref, output = path.join(os.tmpdir(), `lane-b-${crypto.randomUUID()}.json`)) => ({
  REF: ref,
  URL: `postgresql://operator:never-print@db.${hostRef}.supabase.co:5432/postgres`,
  OUT: output,
  STAGE: "H3D-LIVE",
});

test("rejects wrong and production project refs before creating a connection", async () => {
  for (const ref of ["otherproject123456789012", config.production_project_ref]) {
    let connects = 0;
    await assert.rejects(captureLiveWithPreflight({ env: envFor(ref), config, createClient: async () => { connects++; throw Error("unexpected"); } }), { code: "PROJECT_REF_REJECTED" });
    assert.equal(connects, 0);
  }
});

test("rejects a mismatched database host before creating a connection", async () => {
  let connects = 0;
  await assert.rejects(captureLiveWithPreflight({ env: envFor(config.lab_project_ref, config.production_project_ref), config, createClient: async () => { connects++; throw Error("unexpected"); } }), { code: "DATABASE_HOST_MISMATCH" });
  assert.equal(connects, 0);
  assert.throws(() => validateCaptureTarget({ projectRef: config.lab_project_ref, databaseUrl: `postgresql://operator:secret@db.${config.lab_project_ref}.supabase.co:6543/postgres`, config }), { code: "DATABASE_HOST_MISMATCH" });
});

test("matching pinned project and host reach the injected connection stub", async () => {
  assert.equal(validateCaptureTarget({ projectRef: config.lab_project_ref, databaseUrl: envFor().URL, config }).host, `db.${config.lab_project_ref}.supabase.co`);
  let connects = 0;
  const output = path.join(os.tmpdir(), `lane-b-capture-${crypto.randomUUID()}.json`);
  const client = { connect: async () => {}, query: async (sql) => {
    if (sql.includes("pg_roles") && sql.includes("SELECT 1")) return { rows: [] };
    if (sql.startsWith("CREATE ROLE") || sql.startsWith("GRANT") || sql.startsWith("REVOKE") || sql.startsWith("DROP ROLE")) return { rows: [] };
    if (sql.includes("current_user")) return { rows: [{ current_user: "capture_operator", current_database: "postgres", server_version: "17" }] };
    if (sql.includes("pg_namespace")) return { rows: [] };
    if (sql.includes("pg_class")) return { rows: [] };
    if (sql.includes("pg_proc")) return { rows: [] };
    if (sql.includes("pg_auth_members")) return { rows: [] };
    if (sql.includes("DROP ROLE")) return { rows: [] };
    if (sql.includes("has_table_privilege") || sql.includes("has_sequence_privilege")) return { rows: [{}] };
    return { rows: [] };
  }, end: async () => {} };
  const result = await captureLiveWithPreflight({
    env: envFor(config.lab_project_ref, config.lab_project_ref, output), config,
    getGitSha: () => "a".repeat(40),
    getGitStatus: () => "",
    createClient: async () => { connects++; return client; },
  });
  assert.equal(connects, 1);
  const artifact = JSON.parse(fs.readFileSync(result.outputPath, "utf8"));
  assert.equal(artifact.project_ref, config.lab_project_ref);
  assert.equal(artifact.host, `db.${config.lab_project_ref}.supabase.co`);
  assert.match(artifact.captured_at_utc, /Z$/);
  assert.equal(artifact.tool_git_sha, "a".repeat(40));
  assert.equal(artifact.output_sha256, crypto.createHash("sha256").update(`${stableJson(artifact.data)}\n`, "utf8").digest("hex"));
  assert.equal(artifact.temporary_role.verified_absent, true);
  assert.equal(JSON.stringify(artifact).includes("never-print"), false);
  fs.rmSync(output, { force: true });
});

test("capture errors still revoke and drop the temporary role in finally", async () => {
  const output = path.join(os.tmpdir(), `lane-b-capture-fail-${crypto.randomUUID()}.json`);
  const calls = [];
  const client = { connect: async () => {}, query: async (sql) => {
    calls.push(sql);
    if (sql.includes("pg_roles") && sql.includes("SELECT 1")) return { rows: [] };
    if (sql.startsWith("CREATE ROLE") || sql.startsWith("GRANT") || sql.startsWith("REVOKE") || sql.startsWith("DROP ROLE")) return { rows: [] };
    if (sql.includes("current_user")) throw Object.assign(Error("contains hidden connection fields"), { code: "STUB_FAILURE" });
    return { rows: [] };
  }, end: async () => {} };
  await assert.rejects(captureLiveWithPreflight({ env: envFor(config.lab_project_ref, config.lab_project_ref, output), config, getGitSha: () => "b".repeat(40), getGitStatus: () => "", createClient: async () => client }), { code: "STUB_FAILURE" });
  assert.ok(calls.some((sql) => sql.startsWith("CREATE ROLE")));
  assert.ok(calls.some((sql) => sql.startsWith("DROP ROLE")));
  assert.equal(calls.some((sql) => /never-print/.test(sql)), false);
  assert.equal(fs.existsSync(output), false);
});
