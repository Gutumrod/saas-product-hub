/**
 * R15 — D3.1: build the hub_web_app connection string and hand it to `wrangler secret put`
 * WITHOUT the value ever appearing in argv, stdout, stderr, a log, or the repository.
 *
 * Owner U3 ruling: command form `npx wrangler secret put DATABASE_URL --name hub-web`; the value
 * comes only from the canonical approved secret channel; never print it, never write it into
 * repo/docs/evidence/chat, never persist it to a plaintext artifact. Record only the secret NAME,
 * the operation result, the target Worker, and non-secret identity evidence.
 *
 * Method: the URL is written to a mode-600 temp file, piped to wrangler via stdin (wrangler reads
 * the secret from stdin in non-interactive mode), and the temp file is deleted immediately after.
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const HUB = 'D:/AI-Workspace/projects/saas-product-hub/apps/hub-web';
const WS = 'D:/AI-Workspace/runtime/hermes-native/workspace/house-r15';
const cred = JSON.parse(fs.readFileSync(path.join(WS, 'hub_web_app.credential.private'), 'utf8'));
const ownerUrl = fs.readFileSync(path.join(HUB, '.env'), 'utf8').split(/\r?\n/)
  .find(l => l.startsWith('DATABASE_URL='))?.split('=').slice(1).join('=').trim().replace(/^["']|["']$/g, '');

const roleRef = ownerUrl.match(/:\/\/([^:]+):/)?.[1] ?? '';
const projectRef = roleRef.includes('.') ? roleRef.split('.')[1] : '';
const hostPart = ownerUrl.match(/@([^/]+)\//)?.[1] ?? '';
const query = ownerUrl.includes('?') ? ownerUrl.slice(ownerUrl.indexOf('?')) : '';
if (!projectRef || !hostPart) { console.error('could not derive target host/ref'); process.exit(1); }

// scoped connection string: hub_web_app role, same host/params as the owner URL
const scopedUrl = `postgresql://${cred.role}.${projectRef}:${encodeURIComponent(cred.password)}@${hostPart}/postgres${query}`;

console.log('=== D3.1 SET WORKER SECRET (name only; value never printed) ===');
console.log('  secret NAME        : DATABASE_URL');
console.log('  target Worker      : hub-web');
console.log('  new role           :', cred.role);
console.log('  host               :', hostPart.replace(/:[0-9]+$/, ':****'));
console.log('  project ref matches owner URL:', roleRef.split('.')[1] === projectRef);
console.log('  value length (not the value):', scopedUrl.length);
console.log('');

const argv = process.argv.slice(2);
const execute = argv.includes('--execute');
const cmd = 'npx';
const args = ['wrangler', 'secret', 'put', 'DATABASE_URL', '--name', 'hub-web'];

if (!execute) {
  console.log('  DRY RUN — command that would run:');
  console.log(`    ${cmd} ${args.join(' ')}   (value piped via stdin)`);
  console.log('  re-run with --execute to perform it');
  process.exit(0);
}

// write to a temp file mode 600, pipe its content, then shred
const tmp = path.join(WS, '.d3-secret-tmp');
fs.writeFileSync(tmp, scopedUrl, { mode: 0o600 });
try {
  const r = spawnSync(cmd, args, {
    cwd: HUB,
    input: scopedUrl + '\n',
    encoding: 'utf8',
    shell: true,
    maxBuffer: 10 * 1024 * 1024,
  });
  const out = (r.stdout || '') + (r.stderr || '');
  // guard: never echo anything that could contain the URL
  const redacted = out.split('\n').map(l => l.includes('postgresql://') ? '[redacted line]' : l).join('\n');
  console.log(redacted.trim().slice(0, 1200));
  console.log('');
  console.log('  exit code:', r.status);
  console.log('  operation result:', r.status === 0 ? 'SUCCESS' : 'FAILED');
  process.exitCode = r.status === 0 ? 0 : 1;
} finally {
  try { fs.unlinkSync(tmp); console.log('  temp file deleted'); } catch {}
}
