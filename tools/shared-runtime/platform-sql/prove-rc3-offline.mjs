// Adapted from owned offline-preflight kit (2026-10-02); Phase2 real-tool/180000 proof.
// Offline rehearsal only: creates its own fresh loopback cluster; accepts no DB URL.
import fs from 'node:fs';
import path from 'node:path';
import net from 'node:net';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {pathToFileURL} from 'node:url';
import {execFileSync, spawnSync} from 'node:child_process';

const HOUSE = '483244c275b26e5e2222dbe2391886af096c548f';
const BOOTSTRAP = '32df434e1057a83ecbf0c290a659be42f24bbc55';
if (process.argv.length < 3) throw Error('Usage: node bk01-rc3-offline-preflight.mjs EXTERNAL_CONFIG_JSON [--check-only]');
const config = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const keys = ['rcRoot','houseRoot','bootstrapRoot','pgBin','evidenceRoot'];
assert.deepEqual(Object.keys(config).sort(), [...keys].sort(), 'Only offline path settings accepted; no target/URL/environment options');
for (const key of keys) assert.ok(path.isAbsolute(config[key]), `${key}: absolute path required`);
const manifestBytes=fs.readFileSync(path.join(config.houseRoot,'tools/shared-runtime/platform-sql/manifest.rc3.json'));
const RC=JSON.parse(manifestBytes).bk01_release.repository_sha;
const git = (root, ...args) => execFileSync('git', ['-C', root, ...args], {windowsHide:true});
assert.equal(git(config.rcRoot,'rev-parse','HEAD').toString().trim(), RC, 'RC pin mismatch');
// Candidate checkout is explicitly hash-bound by the version2 manifest, not immutable.
assert.equal(git(config.bootstrapRoot,'rev-parse','HEAD').toString().trim(),BOOTSTRAP);
const wrapper=await import(pathToFileURL(path.join(config.houseRoot,'tools/shared-runtime/platform-sql/apply-platform-sql-rc3.mjs')));
const release=wrapper.validateRc3Manifest(JSON.parse(manifestBytes));
wrapper.validateReleaseSources(release,config.rcRoot);
if(release.bk01_release.status==='PINNED'){
  assert.equal(git(config.rcRoot,'status','--porcelain=v1','--untracked-files=all').toString().trim(),'','Clean published release required');
  assert.equal(git(config.houseRoot,'status','--porcelain=v1','--untracked-files=all').toString().trim(),'','Clean published tool required');
}
const wrongLedgerHash=structuredClone(release);wrongLedgerHash.accepted_bk01_ledger[14].sha256='0'.repeat(64);
assert.throws(()=>wrapper.validateReleaseSources(wrongLedgerHash,config.rcRoot),/BOOKING_RELEASE_LEDGER_HASH_MISMATCH/);
const wrongIdentity=structuredClone(release);wrongIdentity.bk01_release.effective_execute_identities[0]='local_service.unapproved()';
assert.throws(()=>wrapper.validateReleaseSources(wrongIdentity,config.rcRoot),/ALLOWLIST_IDENTITY_PROVENANCE_CONFLICT/);
const object = (root, sha, file) => git(root, 'show', `${sha}:${file}`);
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const manifest = JSON.parse(object(config.houseRoot,HOUSE,'tools/shared-runtime/platform-sql/manifest.json'));
const sources = [];
for (const entry of manifest.entries) {
  const sourceSha = entry.repository === 'booking' ? BOOTSTRAP : HOUSE;
  const root = entry.repository === 'booking' ? config.rcRoot : config.houseRoot;
  const bytes = object(root,sourceSha,entry.path);
  assert.equal(hash(bytes),entry.sha256, `Manifest source hash mismatch: ${entry.path}`);
  sources.push({...entry,sourceSha,bytes});
}
const productNames = release.accepted_bk01_ledger.slice(0,14).map(x=>'supabase/bk01-migrations/'+x.filename);
assert.equal(productNames.at(-1),'supabase/bk01-migrations/20261002170000_bk01_g10_line_binding_audit_truncate.sql');
const cleanEnv = Object.fromEntries(Object.entries(process.env).filter(([k]) => /^(PATH|PATHEXT|SYSTEMROOT|WINDIR|COMSPEC|TEMP|TMP|APPDATA|LOCALAPPDATA|USERPROFILE|PROGRAMFILES|SYSTEMDRIVE)$/i.test(k)));
const pgVersion = execFileSync(path.join(config.pgBin,'postgres.exe'),['--version'],{windowsHide:true,encoding:'utf8',env:cleanEnv});
assert.match(pgVersion,/17\.11/);
if (process.argv.includes('--check-only')) { console.log('PASS offline source/path/manifest guards; connectionAttempted=false'); process.exit(0); }
const require = createRequire(path.join(config.rcRoot,'scripts/rc-harness/package.json'));
const postgres = require('postgres');
const {provePlatformAdmin,platformAdminSnapshot,assertAdminRepairDelta}=await import(pathToFileURL(path.join(config.rcRoot,'scripts/proofs/bk01-platform-admin-return-types.mjs')));
const {Client}=createRequire(path.join(config.houseRoot,'tools/shared-runtime/package.json'))('pg');
const {executePlatformSql}=await import(pathToFileURL(path.join(config.houseRoot,'tools/shared-runtime/platform-sql/apply-platform-sql.mjs')));
const {validateBk01RuntimeEffectiveExecuteSet} = await import(pathToFileURL(path.join(config.rcRoot,'scripts/lib/bk01-runtime-allowlist.mjs')));
const stamp = new Date().toISOString().replace(/[-:.]/g,'');
const evidence = path.join(config.evidenceRoot,stamp);
assert.ok(!fs.existsSync(evidence),'Fresh evidence required');
fs.mkdirSync(path.join(evidence,'operator'),{recursive:true});
fs.mkdirSync(path.join(evidence,'sources'));
const json = (name,value) => fs.writeFileSync(path.join(evidence,name),JSON.stringify(value,null,2));
const port = await new Promise((resolve,reject) => { const server=net.createServer(); server.on('error',reject); server.listen(0,'127.0.0.1',()=>{const p=server.address().port;server.close(()=>resolve(p));}); });
const data = path.join(evidence,'data');
let running=false;
const stages=[];
const summary={status:'FAIL',scope:'OFFLINE_SIMULATION',releaseStatus:release.bk01_release.status,manifestSha256:hash(manifestBytes),rcSha:RC,houseSqlSourceSha:HOUSE,houseToolHead:git(config.houseRoot,'rev-parse','HEAD').toString().trim(),bootstrapSha:BOOTSTRAP,labConnectionAttempted:false,stages,
  limitations:['Managed Auth/Storage and PS01 roles are local fixtures; this is not a live LAB clone or hosted proof.',
    'House20/30/40 execute the real platform tool via injected real pg loopback client; simulation receipts are never LAB history.',
    'Owner/ACL restore is proved in a second local database using existing cluster roles. Hosted role reconstruction, Storage bytes and approved deletion replay remain separate GO gates.']};
function run(name,exe,args,cwd=config.rcRoot,extra={}) {
  // pg_ctl's server child can retain pipe handles on Windows; use the explicit PG log.
  const result=spawnSync(exe,args,{cwd,env:{...cleanEnv,...extra},windowsHide:true,encoding:'utf8',timeout:300000,maxBuffer:20*1024*1024,
    stdio:path.basename(exe).toLowerCase()==='pg_ctl.exe'?'ignore':['ignore','pipe','pipe']});
  fs.writeFileSync(path.join(evidence,'operator',name+'.stdout.log'),result.stdout??'');
  fs.writeFileSync(path.join(evidence,'operator',name+'.stderr.log'),result.stderr??'');
  const receipt={exit:result.status,at:new Date().toISOString(),error:result.error?.code??null};
  json('operator/'+name+'.exit.json',receipt);
  assert.equal(result.status,0,`${name} failed; preserve state/evidence and inspect operator logs`);
  return result.stdout;
}
const pg=(name,exe,args)=>run(name,path.join(config.pgBin,exe+'.exe'),args,config.rcRoot,
  ['psql','pg_dump','pg_restore'].includes(exe)?{PGOPTIONS:'-c search_path=public,extensions'}:{});
const psql=(name,user,args,db='postgres')=>pg(name,'psql',['-h','127.0.0.1','-p',String(port),'-U',user,'-d',db,'-v','ON_ERROR_STOP=1','-q',...args]);
function applySql(name,bytes,user='postgres',tx='wrap') {
  const file=path.join(evidence,'sources',name+'.sql');fs.writeFileSync(file,bytes);
  psql(name,user,[...(tx==='wrap'?['-1']:[]),'-f',file]);
  stages.push({name,sha256:hash(bytes),at:new Date().toISOString(),status:'PASS'});
}
const connect=(db='postgres')=>postgres(`postgresql://fixture_admin@127.0.0.1:${port}/${db}`,{max:1,prepare:false,onnotice:()=>{},connection:{statement_timeout:'15000',lock_timeout:'3000'}});
const schemas=['local_service','local_service_internal','auth','storage','wstera_platform_internal'];
const quote=x=>'"'+x.replaceAll('"','""')+'"';
const canonicalConstraint=definition=>definition.replace(/ARRAY\[((?:\('[^']*'::character varying\)::text)(?:, \('[^']*'::character varying\)::text)*)\]/g,
  (_,items)=>`(ARRAY[${items.replace(/\('([^']*)'::character varying\)::text/g,"'$1'::character varying")}])::text[]`);
async function snapshot(db) {
  const tables=await db`select n.nspname schema,c.relname name from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname=any(${schemas}) and c.relkind in ('r','p') order by 1,2`;
  const rows=[];
  for(const t of tables) { const [r]=await db.unsafe(`select count(*)::text count,md5(coalesce(string_agg(to_jsonb(t)::text,E'\\n' order by to_jsonb(t)::text),'')) hash from ${quote(t.schema)}.${quote(t.name)} t`); rows.push({...t,...r}); }
  // Expand SQL NULL ACL to PostgreSQL's actual default privileges. pg_dump may
  // restore explicit owner-only defaults as NULL; keep raw representation too.
  const namespaces=await db`select nspname,pg_get_userbyid(nspowner) owner,nspacl::text raw_acl,array(select x::text from aclexplode(coalesce(nspacl,acldefault('n',nspowner))) x order by x.grantor,x.grantee,x.privilege_type,x.is_grantable) acl from pg_namespace where nspname=any(${schemas}) order by 1`;
  const relations=await db`select n.nspname schema,c.relname,c.relkind,pg_get_userbyid(c.relowner) owner,c.relacl::text raw_acl,array(select x::text from aclexplode(coalesce(c.relacl,acldefault(case when c.relkind='S' then 'S'::"char" else 'r'::"char" end,c.relowner))) x order by x.grantor,x.grantee,x.privilege_type,x.is_grantable) acl,c.relrowsecurity,c.relforcerowsecurity from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname=any(${schemas}) order by 1,2`;
  const functions=await db`select p.oid::regprocedure::text identity,pg_get_userbyid(p.proowner) owner,p.proacl::text raw_acl,array(select x::text from aclexplode(coalesce(p.proacl,acldefault('f',p.proowner))) x order by x.grantor,x.grantee,x.privilege_type,x.is_grantable) acl,pg_get_functiondef(p.oid) definition from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname=any(${schemas}) order by 1`;
  const columns=await db`select table_schema,table_name,column_name,data_type,is_nullable,column_default,ordinal_position from information_schema.columns where table_schema=any(${schemas}) order by 1,2,7`;
  const constraints=await db`select n.nspname schema,c.relname relation,k.conname,pg_get_constraintdef(k.oid) definition,k.convalidated from pg_constraint k join pg_class c on c.oid=k.conrelid join pg_namespace n on n.oid=c.relnamespace where n.nspname=any(${schemas}) order by 1,2,3`;
  const triggers=await db`select n.nspname schema,c.relname relation,t.tgname,pg_get_triggerdef(t.oid) definition from pg_trigger t join pg_class c on c.oid=t.tgrelid join pg_namespace n on n.oid=c.relnamespace where not t.tgisinternal and n.nspname=any(${schemas}) order by 1,2,3`;
  const policies=await db`select schemaname,tablename,policyname,permissive,roles,cmd,qual,with_check from pg_policies where schemaname=any(${schemas}) order by 1,2,3`;
  const columnAcl=await db`select n.nspname schema,c.relname,a.attname,array(select x::text from aclexplode(a.attacl) x order by x.grantor,x.grantee,x.privilege_type,x.is_grantable) acl from pg_attribute a join pg_class c on c.oid=a.attrelid join pg_namespace n on n.oid=c.relnamespace where n.nspname=any(${schemas}) and a.attnum>0 and not a.attisdropped order by 1,2,3`;
  const defaultAcl=await db`select pg_get_userbyid(d.defaclrole) owner,n.nspname schema,d.defaclobjtype,array(select x::text from aclexplode(d.defaclacl) x order by x.grantor,x.grantee,x.privilege_type,x.is_grantable) acl from pg_default_acl d join pg_namespace n on n.oid=d.defaclnamespace where n.nspname=any(${schemas}) order by 1,2,3`;
  const ledger=await db`select migration_id,filename,source_sha256 from local_service_internal.schema_migrations order by 1`;
  return {rows,namespaces,relations,functions,columns,constraints,triggers,policies,columnAcl,defaultAcl,ledger};
}
async function dumpRestore(name,db) {
  const before=await snapshot(db);json(name+'-before.json',before);
  const dump=path.join(evidence,name+'.dump');
  // Preserve owners and ACLs in this local drill; portable no-owner/no-acl is not sufficient.
  pg(name+'-dump','pg_dump',['-h','127.0.0.1','-p',String(port),'-U','fixture_admin','-d','postgres','--format=custom','-f',dump]);
  const restoredDb=name.replaceAll('-','_');
  await db.unsafe(`CREATE DATABASE ${restoredDb} TEMPLATE template0 OWNER postgres`);
  pg(name+'-restore','pg_restore',['-h','127.0.0.1','-p',String(port),'-U','fixture_admin','-d',restoredDb,'--exit-on-error',dump]);
  const target=connect(restoredDb);
  try {
    const after=await snapshot(target);json(name+'-restored.json',after);
    const rawConstraintDiff=after.constraints.filter((x,i)=>x.definition!==before.constraints[i]?.definition);
    const rawAclRepresentationDiff=[];
    for(const kind of ['namespaces','relations','functions']) after[kind].forEach((x,i)=>{if(x.raw_acl!==before[kind][i]?.raw_acl)rawAclRepresentationDiff.push({kind,index:i,before:before[kind][i]?.raw_acl,after:x.raw_acl});});
    const withoutRaw=rows=>rows.map(({raw_acl,...rest})=>rest);
    const canonical=x=>({...x,namespaces:withoutRaw(x.namespaces),relations:withoutRaw(x.relations),functions:withoutRaw(x.functions),constraints:x.constraints.map(c=>({...c,definition:canonicalConstraint(c.definition)}))});
    assert.deepEqual(canonical(after),canonical(before),'Restore schema/data/ledger/owner/ACL mismatch');
    if(name==='final') {
      const identities=(await target`select p.oid::regprocedure::text identity from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='local_service' and has_function_privilege('bk01_runtime',p.oid,'EXECUTE') order by 1`).map(x=>x.identity);
      validateBk01RuntimeEffectiveExecuteSet(identities);assert.equal(identities.length,21);
    }
    return {status:'PASS',dumpSha256:hash(fs.readFileSync(dump)),ownerAclDiff:[],canonicalDiff:[],rawAclRepresentationDiff,rawConstraintDiff,existingClusterRoles:true};
  } finally {await target.end();}
}
try {
  pg('initdb','initdb',['-D',data,'-U','fixture_admin','-E','UTF8','--locale=C','--auth=trust']);
  fs.appendFileSync(path.join(data,'postgresql.conf'),`\nport=${port}\nlisten_addresses='127.0.0.1'\ntimezone='UTC'\n`);
  pg('start','pg_ctl',['-D',data,'-l',path.join(evidence,'postgres.log'),'-w','start']);running=true;
  psql('creator','fixture_admin',['-c','CREATE ROLE postgres LOGIN SUPERUSER; ALTER DATABASE postgres OWNER TO postgres;']);
  // PG17 automatic creator memberships use the bootstrap superuser as grantor.
  // Name that fixture role like managed Supabase BEFORE creating governed roles.
  // Preserve canonical guards; never rewrite membership rows to make them pass.
  psql('managed-superuser-name','postgres',['-c','ALTER ROLE fixture_admin RENAME TO supabase_admin; CREATE ROLE fixture_admin LOGIN SUPERUSER;']);
  const replay=object(config.rcRoot,RC,'scripts/proofs/bk01-p1-g09-g10-replay.mjs').toString();
  const fixture=replay.match(/const fixture=`([\s\S]*?)`;/)?.[1];assert.ok(fixture,'Reviewed managed fixture anchor missing');
  applySql('managed-fixture',Buffer.from(fixture));
  applySql('platform-baseline-roles',Buffer.from('CREATE ROLE supabase_auth_admin NOLOGIN; ALTER ROLE supabase_admin NOLOGIN; CREATE ROLE ps01_line_runtime NOLOGIN NOINHERIT; CREATE ROLE ps01_runtime NOLOGIN NOINHERIT; CREATE ROLE ps01_runtime_login NOLOGIN NOINHERIT; CREATE ROLE ps01_migrator NOLOGIN NOINHERIT;'));
  const legacy=git(config.rcRoot,'ls-tree','-r','--name-only',RC,'--','supabase/migrations').toString().trim().split('\n').filter(x=>x.endsWith('.sql')).sort();
  for(const file of legacy) applySql('legacy-'+path.basename(file,'.sql'),object(config.rcRoot,RC,file));
  applySql('canonical-h3c-baseline',object(config.houseRoot,HOUSE,'docs/platform/shared-runtime/migrations/h3c_auth_runtime_token_support.sql'));
  psql('non-superuser','postgres',['-c','REVOKE ALL ON SCHEMA extensions FROM PUBLIC; ALTER ROLE postgres NOSUPERUSER CREATEROLE BYPASSRLS;']);
  for(const entry of sources.filter(x=>x.order<=15)) applySql('order'+entry.order,entry.bytes,'postgres',entry.tx);
  psql('operator','fixture_admin',['-c',`CREATE ROLE operator LOGIN CREATEROLE BYPASSRLS; GRANT bk01_migrator TO operator WITH INHERIT FALSE,SET TRUE; REVOKE CREATE ON DATABASE postgres FROM PUBLIC; REVOKE CREATE ON SCHEMA public FROM PUBLIC;`]);
  const db=connect();
  try {
    const [baseline]=await db`select (select count(*)::int from local_service_internal.schema_migrations) ledger_count,to_regclass('wstera_platform_internal.runtime_issuer_clients') issuer_clients,to_regclass('wstera_platform_internal.storage_upload_grants') storage_grants,(select rolsuper from pg_roles where rolname='postgres') operator_super`;
    assert.equal(baseline.ledger_count,0);assert.equal(baseline.issuer_clients,null);assert.equal(baseline.storage_grants,null);assert.equal(baseline.operator_super,false);
    const roles=await db`select rolname,rolcanlogin,rolinherit,rolsuper,rolbypassrls from pg_roles where rolname in ('bk01_runtime','bk01_migrator','wstera_runtime_issuer_login') order by 1`;
    assert.equal(roles.length,3);for(const r of roles) assert.ok(!r.rolcanlogin&&!r.rolinherit&&!r.rolsuper&&!r.rolbypassrls);
    const memberships=await db`select r.rolname role,m.rolname member,a.admin_option,a.inherit_option,a.set_option from pg_auth_members a join pg_roles r on r.oid=a.roleid join pg_roles m on m.oid=a.member where r.rolname in ('bk01_runtime','bk01_migrator','wstera_runtime_issuer_login') order by 1,2`;
    for(const role of ['bk01_runtime','wstera_runtime_issuer_login']) assert.ok(memberships.some(x=>x.role===role&&x.member==='postgres'&&x.admin_option));
    json('baseline-state.json',{baseline,roles,memberships,status:'SIMULATED_BOOTSTRAP_PLUS_15'});
    summary.baselineRecovery=await dumpRestore('baseline',db);
    pg('roles-backup','pg_dumpall',['-h','127.0.0.1','-p',String(port),'-U','fixture_admin','--roles-only','--no-role-passwords','-f',path.join(evidence,'roles.sql')]);
    const toolDir=path.join(evidence,'OFFLINE-NOT-LAB-tool-receipts');fs.mkdirSync(toolDir);
    const toolEnv={LANE_B_PROJECT_REF:'ykxlqnshaaxmzzocpjlj',LANE_B_DATABASE_URL:'postgresql://postgres.ykxlqnshaaxmzzocpjlj:offline-test-password@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres?sslmode=verify-full',BK01_REPO_ROOT:config.bootstrapRoot,BK01_RELEASE_REPO_ROOT:config.rcRoot,PLATFORM_SQL_EVIDENCE_DIR:toolDir};
    const deps={env:toolEnv,repoRoot:config.houseRoot,offlineSimulation:true,createClient:async()=>new Client({host:'127.0.0.1',port,user:'postgres',database:'postgres'}),stdout:value=>json('tool-last-output.json',value)};
    const selector=['--manifest','manifest.rc3.json','--manifest-sha256',hash(manifestBytes)];
    for(const entry of sources.filter(x=>x.order>15)){
      const plan=await wrapper.executeRc3PlatformSql([...selector,'plan'],deps);assert.equal(plan.next.file,entry.path);
      await wrapper.executeRc3PlatformSql([...selector,'apply','--file',entry.path,'--confirm',entry.sha256],deps);
      stages.push({name:'actual-platform-tool-order'+entry.order,status:'PASS',sha256:entry.sha256});
    }
    summary.actualPlatformTool=true;
    const env={BK01_PLATFORM_DATABASE_URL:`postgresql://operator@127.0.0.1:${port}/postgres`,BK01_OPERATOR_LOGINS:'operator',BK01_SHARED_RUNTIME_ENV:'local',BK01_RELEASE_ID:'BK01-RC3-OFFLINE',BK01_P0_LOCAL_URL:`postgresql://operator@127.0.0.1:${port}/postgres`,BK01_P0_DATA_DIR:data,BK01_P0_EVIDENCE_DIR:path.join(evidence,'operator')};
    for(const file of productNames) {
      const before=await snapshot(db);
      run('apply-'+path.basename(file,'.sql'),process.execPath,['scripts/bk01-migrate.mjs','apply','--through',path.basename(file)],config.rcRoot,env);
      const after=await snapshot(db);json('operator/after-'+path.basename(file,'.sql')+'.json',after);
      const prefixPlan=await wrapper.executeRc3PlatformSql([...selector,'plan'],deps);
      assert.equal(prefixPlan.existingMigrationLedger.rows,after.ledger.length);
      stages.push({name:file,sourceSha:RC,sha256:hash(object(config.rcRoot,RC,file)),status:'PASS',ledger:after.ledger.length});
      if(file.includes('20261002170000')) {const delta=before.functions.filter(x=>x.identity.startsWith('local_service.')).filter(x=>{const next=after.functions.find(y=>y.identity===x.identity);return !next||x.owner!==next.owner||x.raw_acl!==next.raw_acl;});assert.deepEqual(delta,[]);summary.sql170000OwnerAclDelta=delta;}
    }
    summary.d1Before=await provePlatformAdmin(db);json('d1-before.json',summary.d1Before);
    summary.d1PlanOnlyMutation=await provePlatformAdmin(db,{planOnlyMutation:true});
    const before180000=await platformAdminSnapshot(db);json('180000-before-catalog.json',before180000);
    const last=release.accepted_bk01_ledger.at(-1);
    run('apply-180000',process.execPath,['scripts/bk01-migrate.mjs','apply','--through',last.filename],config.rcRoot,env);
    assertAdminRepairDelta(before180000,await platformAdminSnapshot(db));summary.sql180000OwnerAclDelta=[];
    summary.d1After=await provePlatformAdmin(db,{repaired:true});json('d1-after.json',summary.d1After);
    // Local rollback regression only: remove its exact owned ledger row atomically.
    await db.begin(async tx=>{await tx.unsafe('SET LOCAL ROLE bk01_migrator');await tx.unsafe(fs.readFileSync(path.join(config.rcRoot,last.rollback.filename),'utf8'));await tx`delete from local_service_internal.schema_migrations where filename=${last.filename} and source_sha256=${last.sha256}`;});
    assert.deepEqual(await platformAdminSnapshot(db),before180000);summary.rollbackRawCatalogDiff=[];
    summary.d1Rollback=await provePlatformAdmin(db);json('d1-rollback.json',summary.d1Rollback);
    run('reapply-180000',process.execPath,['scripts/bk01-migrate.mjs','apply','--through',last.filename],config.rcRoot,env);
    assertAdminRepairDelta(before180000,await platformAdminSnapshot(db));await provePlatformAdmin(db,{repaired:true});
    productNames.push('supabase/bk01-migrations/'+last.filename);
    summary.releaseGate=await wrapper.executeRc3PlatformSql([...selector,'verify-release'],deps);
    // Corrupt only this freshly owned rehearsal database; restore the original
    // ledger byte-for-byte in finally. Each negative gets separate tool history.
    const savedLedger=await db`select * from local_service_internal.schema_migrations order by migration_id`;
    summary.realLedgerNegativeGates=[];
    for(const kind of ['checksum','skipped','extra','reordered']){
      try{
        if(kind==='checksum')await db`update local_service_internal.schema_migrations set source_sha256=${'0'.repeat(64)} where migration_id=${savedLedger[5].migration_id}`;
        if(kind==='skipped')await db`delete from local_service_internal.schema_migrations where migration_id=${savedLedger[5].migration_id}`;
        if(kind==='extra')await db`insert into local_service_internal.schema_migrations ${db({...savedLedger.at(-1),migration_id:'20261002190000',filename:'20261002190000_bk01_unapproved.sql'})}`;
        if(kind==='reordered')await db`update local_service_internal.schema_migrations set migration_id='00000000000000' where migration_id=${savedLedger[5].migration_id}`;
        const negativeDir=path.join(evidence,'negative-'+kind);fs.mkdirSync(negativeDir);
        await assert.rejects(()=>wrapper.executeRc3PlatformSql([...selector,'plan'],{...deps,env:{...toolEnv,PLATFORM_SQL_EVIDENCE_DIR:negativeDir}}),e=>e.message==='EXISTING_BK01_LEDGER_CONFLICT');
        summary.realLedgerNegativeGates.push({kind,status:'PASS',code:'EXISTING_BK01_LEDGER_CONFLICT'});
      }finally{
        await db.begin(async tx=>{await tx`delete from local_service_internal.schema_migrations`;await tx`insert into local_service_internal.schema_migrations ${tx(savedLedger)}`;});
        assert.deepEqual(await db`select * from local_service_internal.schema_migrations order by migration_id`,savedLedger);
      }
    }
    await assert.rejects(()=>db`insert into local_service_internal.schema_migrations ${db(savedLedger[0])}`,e=>e.code==='23505');
    summary.realLedgerNegativeGates.push({kind:'duplicate',status:'PASS',code:'23505'});
    await assert.rejects(()=>executePlatformSql(['plan'],deps),e=>e.message==='EXISTING_BK01_LEDGER_CONFLICT');summary.historicalManifestRejects15=true;
    if(release.bk01_release.status==='LOCAL_ONLY'){
      await assert.rejects(()=>wrapper.executeRc3PlatformSql([...selector,'plan'],{...deps,offlineSimulation:false}),e=>e.message==='UNCOMMITTED_RC3_RELEASE_HOLD');summary.uncommittedOperationalHold=true;
    }
    const beforeNoop=await snapshot(db);
    const noop=run('runner-noop',process.execPath,['scripts/bk01-migrate.mjs','apply'],config.rcRoot,env);
    const noopRows=noop.trim().split('\n').map(line=>JSON.parse(line));
    assert.ok(noopRows.some(x=>x.event==='bk01.migration.complete'&&x.appliedNow===0),'Runner did not report an actual no-op');
    assert.deepEqual(await snapshot(db),beforeNoop,'Runner no-op changed catalog/data/ledger');
    run('surface',process.execPath,['scripts/proofs/bk01-p0-surface-gate.mjs'],config.rcRoot,env);
    run('rpc-arity',process.execPath,['scripts/proofs/bk01-app-rpc-catalog-gate.mjs'],config.rcRoot,env);
    const final=await snapshot(db);assert.equal(final.ledger.length,productNames.length);
    for(const row of final.ledger) assert.equal(row.source_sha256,release.accepted_bk01_ledger.find(x=>x.filename===row.filename).sha256);
    const identities=(await db`select p.oid::regprocedure::text identity from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='local_service' and has_function_privilege('bk01_runtime',p.oid,'EXECUTE') order by 1`).map(x=>x.identity);
    validateBk01RuntimeEffectiveExecuteSet(identities);assert.equal(identities.length,21);json('allowlist.json',identities);
    const [storage]=await db`select has_schema_privilege('bk01_runtime','storage','USAGE') usage,has_table_privilege('bk01_runtime','storage.objects','INSERT') insert,has_function_privilege('bk01_migrator','wstera_platform_internal.register_storage_upload_grant(text,text,text,text,bigint,timestamptz)','EXECUTE') register`;
    assert.ok(storage.usage&&storage.insert&&storage.register);
    summary.allowlistCount=identities.length;summary.ledgerCount=final.ledger.length;summary.storageAcl=storage;
    summary.finalRecovery=await dumpRestore('final',db);
    const candidateFiles=['tools/shared-runtime/platform-sql/manifest.rc3.json','tools/shared-runtime/platform-sql/apply-platform-sql-rc3.mjs','tools/shared-runtime/platform-sql/build-rc3-manifest.mjs','tools/shared-runtime/platform-sql/prove-rc3-offline.mjs'];
    summary.houseCandidateFileHashes=Object.fromEntries(candidateFiles.map(file=>[file,hash(fs.readFileSync(path.join(config.houseRoot,file)))]));
    summary.bookingCandidateFileHashes=Object.fromEntries(['supabase/bk01-migrations/'+last.filename,last.rollback.filename,'scripts/proofs/bk01-platform-admin-return-types.mjs'].map(file=>[file,hash(fs.readFileSync(path.join(config.rcRoot,file)))]));
    summary.toolReceiptsAreNotLabHistory=true;
    summary.status='PASS';
  } finally {await db.end();}
} catch(error) { summary.error=error.message;process.exitCode=1; }
finally {
  if(running) {try {pg('stop','pg_ctl',['-D',data,'-m','fast','-w','stop']);summary.clusterStopped=true;} catch(error) {summary.status='FAIL';summary.cleanupError=error.message;process.exitCode=1;}}
  json('summary.json',summary);
  console.log(JSON.stringify({status:summary.status,evidence,rcSha:RC,allowlistCount:summary.allowlistCount,error:summary.error,labConnectionAttempted:false}));
}
