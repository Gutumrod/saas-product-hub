import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {pathToFileURL,fileURLToPath} from 'node:url';

const here=path.dirname(fileURLToPath(import.meta.url));
const hash=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
const git=(root,...args)=>execFileSync('git',['-C',root,...args],{windowsHide:true});
const candidate='20261002180000_bk01_platform_admin_return_types.sql';
export async function buildRc3Manifest(root){
  if(!path.isAbsolute(root))throw Error('ABSOLUTE_BOOKING_ROOT_REQUIRED');
  const pin=git(root,'rev-parse','HEAD').toString().trim();
  const names=fs.readdirSync(path.join(root,'supabase/bk01-migrations')).filter(x=>x.endsWith('.sql')).sort();
  if(names.length!==15||names.at(-1)!==candidate)throw Error('RC3_REMEDIATED_STREAM_REQUIRED');
  const tracked=new Set(git(root,'ls-tree','-r','--name-only',pin,'--','supabase/bk01-migrations').toString().trim().split('\n'));
  const accepted=[];
  for(const filename of names){
    const source='supabase/bk01-migrations/'+filename,rollback='supabase/rollback/'+filename.replace(/\.sql$/,'.rollback.sql');
    const forwardBytes=fs.readFileSync(path.join(root,source)),rollbackBytes=fs.readFileSync(path.join(root,rollback));
    const committed=tracked.has(source);
    if(committed){
      if(!forwardBytes.equals(git(root,'show',pin+':'+source))||!rollbackBytes.equals(git(root,'show',pin+':'+rollback)))throw Error('BOOKING_MIGRATION_WORKTREE_DRIFT');
    }else if(filename!==candidate||pin!=='c750d4a83ccfa57356dd64334418fe98d3e01bc1')throw Error('UNAUTHORIZED_CANDIDATE_OVERLAY');
    accepted.push({filename,sha256:hash(forwardBytes.toString().replace(/\r\n/g,'\n')),file_sha256:hash(forwardBytes),source:committed?'commit':'uncommitted-candidate',rollback:{filename:rollback,sha256:hash(rollbackBytes)}});
  }
  const allowlistSource='scripts/lib/bk01-runtime-allowlist.mjs';
  if(!fs.readFileSync(path.join(root,allowlistSource)).equals(git(root,'show',pin+':'+allowlistSource)))throw Error('ALLOWLIST_SOURCE_DRIFT');
  const {BK01_RUNTIME_EFFECTIVE_FUNCTIONS}=await import(pathToFileURL(path.join(root,allowlistSource)));
  const original=JSON.parse(fs.readFileSync(path.join(here,'manifest.json')));
  return {...original,version:2,bk01_release:{repository_sha:pin,status:accepted.every(x=>x.source==='commit')?'PINNED':'LOCAL_ONLY',migration_count:15,last_filename:candidate,allowlist_source_sha256:hash(git(root,'show',pin+':'+allowlistSource)),effective_execute_identities:[...BK01_RUNTIME_EFFECTIVE_FUNCTIONS].sort()},accepted_bk01_ledger:accepted};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  buildRc3Manifest(process.argv[2]).then(m=>process.stdout.write(JSON.stringify(m,null,2)+'\n')).catch(e=>{process.stderr.write(e.message+'\n');process.exitCode=1;});
}
