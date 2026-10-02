import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import {validateRc3Manifest,validateLedgerPrefix,executeRc3PlatformSql} from './apply-platform-sql-rc3.mjs';
const bytes=fs.readFileSync(new URL('./manifest.rc3.json',import.meta.url));
const m=JSON.parse(bytes);
const hash=crypto.createHash('sha256').update(bytes).digest('hex');
const ledger=m.accepted_bk01_ledger.map(x=>({filename:x.filename,source_sha256:x.sha256}));
test('prefixes0..15 accepted; final requires all15',()=>{
  validateRc3Manifest(m);
  for(let n=0;n<=15;n++){
    validateLedgerPrefix(m,ledger.slice(0,n));
    if(n<15)assert.throws(()=>validateLedgerPrefix(m,ledger.slice(0,n),{final:true}),/EXISTING_BK01_LEDGER_CONFLICT/);
  }
  validateLedgerPrefix(m,ledger,{final:true});
});
test('checksum, skipped, extra, reordered and duplicate ledger rows rejected',()=>{
  const badHash=structuredClone(ledger);badHash[5].source_sha256='0'.repeat(64);
  const reordered=structuredClone(ledger);[reordered[5],reordered[6]]=[reordered[6],reordered[5]];
  for(const rows of [badHash,ledger.filter((_,i)=>i!==5),[...ledger,{...ledger.at(-1)}],reordered,[...ledger.slice(0,5),ledger[4],...ledger.slice(6)]])assert.throws(()=>validateLedgerPrefix(m,rows),/EXISTING_BK01_LEDGER_CONFLICT/);
});
test('bootstrap provenance, count and candidate status cannot silently drift',()=>{
  for(const mutate of [x=>x.booking_repository_sha=x.bk01_release.repository_sha,x=>x.bk01_release.migration_count=14,x=>x.accepted_bk01_ledger.pop(),x=>x.bk01_release.status=x.bk01_release.status==='PINNED'?'LOCAL_ONLY':'PINNED',x=>x.entries[1].sha256='0'.repeat(64)]){
    const changed=structuredClone(m);mutate(changed);assert.throws(()=>validateRc3Manifest(changed),/RC3_/);
  }
});
test('wrong selector/hash and candidate operational use fail before any connection',async()=>{
  let connections=0;const createClient=()=>{connections++;throw Error('UNEXPECTED_CONNECTION');};
  for(const [args,error] of [[['plan'],/EXPLICIT_RC3_MANIFEST_HASH_REQUIRED/],[['--manifest','manifest.rc3.json','--manifest-sha256','0'.repeat(64),'plan'],/MANIFEST_HASH_MISMATCH/],[['--manifest','manifest.rc3.json','--manifest-sha256',hash,'plan'],m.bk01_release.status==='LOCAL_ONLY'?/UNCOMMITTED_RC3_RELEASE_HOLD/:/BOOKING_RELEASE_ROOT_REQUIRED/]])await assert.rejects(()=>executeRc3PlatformSql(args,{createClient,env:{}}),error);
  assert.equal(connections,0);
});
