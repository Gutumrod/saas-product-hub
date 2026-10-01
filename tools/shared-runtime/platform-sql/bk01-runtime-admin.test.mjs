import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import { executePlatformSql } from './apply-platform-sql.mjs';
import { validHouseIssuerMemberships } from './bk01-runtime-membership.mjs';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const MANIFEST = JSON.parse(fs.readFileSync(path.join(ROOT,'tools/shared-runtime/platform-sql/manifest.json')));
const creator = overrides => ({ granted_role:'bk01_runtime', member:'postgres', grantor:'supabase_admin',
  admin_option:true, inherit_option:false, set_option:false, ...overrides });
const authenticator = overrides => ({ granted_role:'bk01_runtime', member:'authenticator', grantor:'postgres',
  admin_option:false, inherit_option:false, set_option:true, ...overrides });
async function plan(memberships, bootstrap=false, issuerMemberships=null) {
  const evidence = fs.mkdtempSync(path.join(os.tmpdir(),'bk01-admin-test-'));
  const output=[];
  try {
    await executePlatformSql(['plan'], { repoRoot:ROOT, manifest:MANIFEST,
      env:{ LANE_B_PROJECT_REF:'ykxlqnshaaxmzzocpjlj', PLATFORM_SQL_EVIDENCE_DIR:evidence,
        LANE_B_DATABASE_URL:'postgresql://postgres.ykxlqnshaaxmzzocpjlj:offline-test-password@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres?sslmode=verify-full' },
      stdout:x=>output.push(x), createClient:async()=>({ async connect(){}, async end(){}, async query(sql){
        if(sql.includes('WHERE rolname = ANY($1::text[])')) return {rows:['anon','authenticated','service_role','authenticator',
          'supabase_auth_admin','supabase_admin','postgres','ps01_line_runtime','ps01_runtime','ps01_runtime_login','ps01_migrator'].map(rolname=>({rolname}))};
        if(sql.includes("SELECT to_regclass('local_service_internal.schema_migrations')")) return {rows:[{ledger_exists:bootstrap,local_relations:22,local_functions:61,bk01_runtime_role_exists:true,
          ps01_runtime_login_role_exists:true,house_issuer_role_exists:Boolean(issuerMemberships),runtime_token_grants_exists:true}]};
        if(sql.includes('wstera_runtime_issuer_login')) return issuerMemberships ? {rows:[{rolname:'wstera_runtime_issuer_login',rolsuper:false,rolinherit:false,
          rolcreaterole:false,rolcreatedb:false,rolcanlogin:false,rolreplication:false,rolbypassrls:false,
          rolconfig:['statement_timeout=8s','lock_timeout=8s'],member_of_other_role:false,has_members:true,
          has_dependencies:false,memberships:issuerMemberships}]} : {rows:[]};
        if(sql.includes('AS member_of_other_role')) return {rows:[{rolname:'bk01_runtime',rolsuper:false,rolinherit:false,
          rolcreaterole:false,rolcreatedb:false,rolcanlogin:false,rolreplication:false,rolbypassrls:false,
          rolconfig:['statement_timeout=8s','lock_timeout=8s'],member_of_other_role:false,has_members:true,
          has_dependencies:bootstrap,memberships}]};
        if(sql.includes('runtime_issuer_clients'))return {rows:[{a:false,b:false,c:false,d:false}]};
        if(sql.includes('runtime_token_grants'))return {rows:[{constraint_ready:false,function_ready:false}]};
        if(sql.includes('storage_upload_runtime_roles'))return {rows:[{a:false,b:false,c:false,d:false,e:false}]};
        return {rows:[]};
      } }) });
    return output[0];
  } finally { fs.rmSync(evidence,{recursive:true,force:true}); }
}
test('A10 recovery accepts exactly the managed creator ADMIN row and plans bootstrap',async()=>{
  for(const grantor of ['supabase_admin','postgres']) {
    const p=await plan([creator({grantor})]); assert.equal(p.entries[0].applied,true);
    assert.equal(p.next.file,'supabase/shared-runtime/bk01-platform-bootstrap.sql');
  }
});
test('A10 rejects every creator membership field mutation independently',async()=>{
  for(const override of [{admin_option:false},{inherit_option:true},{set_option:true},
    {member:'authenticated'},{grantor:'authenticated'},{granted_role:'anon'}, {admin_option:undefined}]) {
    await assert.rejects(()=>plan([creator(override)]),{message:'EXISTING_BK01_RUNTIME_ROLE_CONFLICT'});
  }
});
test('A10 rejects missing, duplicate and additional membership rows',async()=>{
  for(const rows of [[],[creator(),creator()],[creator(),authenticator()],
    [creator(),creator({member:'bk01_runtime',granted_role:'anon'})]])
    await assert.rejects(()=>plan(rows),{message:'EXISTING_BK01_RUNTIME_ROLE_CONFLICT'});
});
test('A10 after bootstrap accepts creator plus exact authenticator row',async()=>{
  assert.equal((await plan([creator(),authenticator()],true)).next.file,'docs/platform/shared-runtime/migrations/house_runtime_issuer_role.sql');
});
test('A10 after bootstrap rejects altered authenticator or extra memberships',async()=>{
  for(const override of [{admin_option:true},{inherit_option:true},{set_option:false},{member:'authenticated'},{grantor:'authenticated'}])
    await assert.rejects(()=>plan([creator(),authenticator(override)],true),{message:'EXISTING_BK01_RUNTIME_ROLE_CONFLICT'});
  await assert.rejects(()=>plan([creator(),authenticator(),authenticator()],true),{message:'EXISTING_BK01_RUNTIME_ROLE_CONFLICT'});
});
test('GO6 accepts only the exact automatic creator ADMIN row for the House issuer role',()=>{
  const row={granted_role:'wstera_runtime_issuer_login',member:'postgres',grantor:'postgres',
    admin_option:true,inherit_option:false,set_option:false};
  assert.equal(validHouseIssuerMemberships([row]),true);
  for(const override of [{admin_option:false},{inherit_option:true},{set_option:true},
    {member:'authenticated'},{grantor:'authenticated'},{granted_role:'bk01_runtime'}])
    assert.equal(validHouseIssuerMemberships([{...row,...override}]),false);
  assert.equal(validHouseIssuerMemberships([]),false);
  assert.equal(validHouseIssuerMemberships([row,row]),false);
  assert.equal(validHouseIssuerMemberships([row,{...row,member:'authenticator'}]),false);
});
test('GO6 plans issuer only after the NOLOGIN role and exact creator ADMIN row exist',async()=>{
  const row={granted_role:'wstera_runtime_issuer_login',member:'postgres',grantor:'postgres',
    admin_option:true,inherit_option:false,set_option:false};
  assert.equal((await plan([creator(),authenticator()],true,[row])).next.file,
    'docs/platform/shared-runtime/migrations/house_runtime_issuer.sql');
});
