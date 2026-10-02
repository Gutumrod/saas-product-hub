// Versioned release envelope. Historical manifest/tool/target guards stay intact.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {executePlatformSql} from './apply-platform-sql.mjs';

const here=path.dirname(fileURLToPath(import.meta.url));
const hash=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
const fail=code=>{throw Error(code);};
export function validateRc3Manifest(m){
  const old=JSON.parse(fs.readFileSync(path.join(here,'manifest.json')));
  if(m?.version!==2||m.booking_repository_sha!==old.booking_repository_sha||JSON.stringify(m.entries)!==JSON.stringify(old.entries))fail('RC3_PLATFORM_PROVENANCE_CONFLICT');
  const r=m.bk01_release;
  if(!r||!['LOCAL_ONLY','PINNED'].includes(r.status)||!/^[a-f0-9]{40}$/.test(r.repository_sha)||r.migration_count!==15||r.last_filename!=='20261002180000_bk01_platform_admin_return_types.sql'||!/^[a-f0-9]{64}$/.test(r.allowlist_source_sha256)||!Array.isArray(r.effective_execute_identities)||r.effective_execute_identities.length!==21||new Set(r.effective_execute_identities).size!==21)fail('RC3_RELEASE_INVALID');
  if(!Array.isArray(m.accepted_bk01_ledger)||m.accepted_bk01_ledger.length!==15)fail('RC3_RELEASE_INVALID');
  let prior='';
  for(const item of m.accepted_bk01_ledger){
    if(!/^[0-9]{14}_bk01_[a-z0-9_]+\.sql$/.test(item.filename)||item.filename<=prior||!['commit','uncommitted-candidate'].includes(item.source)||![item.sha256,item.file_sha256,item.rollback?.sha256].every(x=>/^[a-f0-9]{64}$/.test(x||''))||item.rollback.filename!=='supabase/rollback/'+item.filename.replace(/\.sql$/,'.rollback.sql'))fail('RC3_RELEASE_INVALID');
    prior=item.filename;
  }
  if(prior!==r.last_filename||m.accepted_bk01_ledger.slice(0,14).some(x=>x.source!=='commit')||(r.status==='PINNED')!==m.accepted_bk01_ledger.every(x=>x.source==='commit'))fail('RC3_RELEASE_INVALID');
  return m;
}
export function validateLedgerPrefix(m,rows,{final=false}={}){
  if(!Array.isArray(rows)||rows.length>m.accepted_bk01_ledger.length||(final&&rows.length!==m.bk01_release.migration_count))fail('EXISTING_BK01_LEDGER_CONFLICT');
  rows.forEach((row,i)=>{const expected=m.accepted_bk01_ledger[i];if(row.filename!==expected.filename||row.source_sha256!==expected.sha256)fail('EXISTING_BK01_LEDGER_CONFLICT');});
}
export function validateReleaseSources(m,root){
  if(!root||!path.isAbsolute(root))fail('BOOKING_RELEASE_ROOT_REQUIRED');
  const git=(...args)=>execFileSync('git',['-C',root,...args],{windowsHide:true,stdio:['ignore','pipe','ignore']});
  if(git('rev-parse','HEAD').toString().trim()!==m.bk01_release.repository_sha)fail('BOOKING_RELEASE_SHA_MISMATCH');
  for(const item of m.accepted_bk01_ledger){
    for(const [file,expected] of [['supabase/bk01-migrations/'+item.filename,item.file_sha256],[item.rollback.filename,item.rollback.sha256]]){
      const bytes=fs.readFileSync(path.join(root,file));if(hash(bytes)!==expected)fail('BOOKING_RELEASE_HASH_MISMATCH');
      if(file.startsWith('supabase/bk01-migrations/')&&hash(bytes.toString().replace(/\r\n/g,'\n'))!==item.sha256)fail('BOOKING_RELEASE_LEDGER_HASH_MISMATCH');
      if(item.source==='commit'&&!bytes.equals(git('show',m.bk01_release.repository_sha+':'+file)))fail('BOOKING_RELEASE_HASH_MISMATCH');
    }
  }
  const bytes=git('show',m.bk01_release.repository_sha+':scripts/lib/bk01-runtime-allowlist.mjs');
  if(hash(bytes)!==m.bk01_release.allowlist_source_sha256)fail('ALLOWLIST_SOURCE_HASH_MISMATCH');
  // Bind expected identities to immutable source rather than a caller-supplied count.
  const declared=[...bytes.toString().split('export function')[0].matchAll(/'local_service\.[^'\n]+'/g)].map(x=>x[0].slice(1,-1));
  if(JSON.stringify([...new Set(declared)].sort())!==JSON.stringify([...m.bk01_release.effective_execute_identities].sort()))fail('ALLOWLIST_IDENTITY_PROVENANCE_CONFLICT');
}
export async function executeRc3PlatformSql(argv,deps={}){
  if(argv[0]!=='--manifest'||argv[1]!=='manifest.rc3.json'||argv[2]!=='--manifest-sha256'||!/^[a-f0-9]{64}$/.test(argv[3]||''))fail('EXPLICIT_RC3_MANIFEST_HASH_REQUIRED');
  const bytes=fs.readFileSync(path.join(here,argv[1]));if(hash(bytes)!==argv[3])fail('MANIFEST_HASH_MISMATCH');
  const manifest=validateRc3Manifest(JSON.parse(bytes));
  // Unpublished SQL can only run through an explicit local test seam; CLI cannot.
  if(manifest.bk01_release.status!=='PINNED'&&!(deps.offlineSimulation===true&&typeof deps.createClient==='function'))fail('UNCOMMITTED_RC3_RELEASE_HOLD');
  const env=deps.env||process.env;validateReleaseSources(manifest,env.BK01_RELEASE_REPO_ROOT);
  const args=argv.slice(4),final=args[0]==='verify-release';
  if(final&&args.length!==1)fail('USAGE_VERIFY_RELEASE');
  let result;
  await executePlatformSql(final?['plan']:args,{...deps,env,manifest:{...manifest,version:1},stdout:value=>{result=value;if(!final)(deps.stdout||console.log)(value);}});
  if(final){
    if(result.next!==null)fail('PLATFORM_CHAIN_INCOMPLETE');
    const createClient=deps.createClient;
    // The production connection config must still pass the canonical target guard.
    const {validateCaptureTarget,defaultCreateClient}=await import('../inventory/lane-b-capture.mjs');
    const config=JSON.parse(fs.readFileSync(path.join(here,'../inventory/lane-b-capture-config.json')));
    const target=validateCaptureTarget({projectRef:env[config.project_ref_env],databaseUrl:env[config.database_url_env],config});
    const client=await (createClient||defaultCreateClient)(target.connectionConfig);
    try{
      await client.connect();await client.query('BEGIN READ ONLY');
      const {rows}=await client.query('select filename,source_sha256 from local_service_internal.schema_migrations order by migration_id');validateLedgerPrefix(manifest,rows,{final:true});
      const actual=(await client.query("select p.oid::regprocedure::text identity from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='local_service' and has_function_privilege('bk01_runtime',p.oid,'EXECUTE') order by 1")).rows.map(x=>x.identity);
      if(JSON.stringify(actual)!==JSON.stringify([...manifest.bk01_release.effective_execute_identities].sort()))fail('RC3_EFFECTIVE_EXECUTE_CONFLICT');
      await client.query('ROLLBACK');result={status:'PASS',scope:deps.offlineSimulation?'OFFLINE_SIMULATION':'PINNED_PREFLIGHT',releaseSha:manifest.bk01_release.repository_sha,releaseStatus:manifest.bk01_release.status,ledgerCount:rows.length,effectiveExecuteCount:actual.length};(deps.stdout||console.log)(result);
    }finally{await client.end();}
  }
  return result;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))executeRc3PlatformSql(process.argv.slice(2)).catch(e=>{process.stderr.write(/^[A-Z0-9_]+$/.test(e.message)?e.message+'\n':'RC3_PREFLIGHT_FAILED\n');process.exitCode=1;});
