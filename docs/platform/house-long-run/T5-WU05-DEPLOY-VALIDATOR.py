"""T5-WU05 controlled production apply + deploy — DRY-RUN VALIDATOR.

Prepared, NOT executed. This script performs NO mutation by default: without --execute it
only prints the exact command sequence it would run and validates that every precondition
the B5 review set is satisfiable from the local repository.

With --execute WU05 is performed by the OPERATOR (Hermes) only after B5 approval, and only
for step 1 (code-only deploy with both capability configurations absent).
"""
import argparse
import subprocess
import sys
from pathlib import Path

REPO = Path(r'D:\AI-Workspace\projects\saas-product-hub')
HUB = REPO / 'apps' / 'hub-web'
FROZEN = 'e6d367ceb431a806eb4ab8a859f644a6af7efac3'


def run(cmd, cwd=None):
    p = subprocess.run(cmd, cwd=str(cwd or HUB), shell=True, capture_output=True, text=True)
    return p.returncode, (p.stdout or '').strip(), (p.stderr or '').strip()


def preconditions():
    checks = []
    rc, sha, _ = run('git rev-parse HEAD')
    checks.append(('frozen candidate SHA', rc == 0 and sha == FROZEN, sha))
    rc, st, _ = run('git status --porcelain')
    checks.append(('worktree clean', rc == 0 and st == '', st[:60] or '(clean)'))
    rc, up, _ = run('git rev-parse @{u}')
    checks.append(('upstream parity', rc == 0 and up == FROZEN, up))
    rc, br, _ = run('git branch --show-current')
    checks.append(('on closure branch', rc == 0 and br == 'work/house-platform-closure-20260919', br))
    return checks


STEPS = [
    ('0. PRE', [
        'cd apps/hub-web',
        'git fetch origin && git rev-parse HEAD && git status --porcelain',
        '# require: HEAD == frozen candidate, worktree clean, upstream equal',
    ]),
    ('1. ROLLBACK TARGET', [
        'npx wrangler deployments status',
        '# record the current production deployment id as the rollback target BEFORE deploying',
    ]),
    ('2. BUILD (from the frozen candidate)', [
        'npx tsc --noEmit',
        'npx vitest run',
        'npm run build',
        '# build must run the check:build-env gate; it must FAIL if required config is missing',
    ]),
    ('3. CONFIG ABSENCE CHECK (must both be ABSENT)', [
        '# verify by NAME ONLY - never print values',
        'npx wrangler secret list | grep -c PRODUCT_EVENT_SIGNERS   # expect 0',
        'npx wrangler secret list | grep -c BILLING_CORE_CONTROL   # expect 0',
    ]),
    ('4. DEPLOY (code only, capabilities inert)', [
        'npm run cf:deploy',
        '# capture the deployment id and version id returned for the artifact-identity record',
    ]),
    ('5. POST-DEPLOY SMOKE (WU06 script)', [
        'python D:/AI-Workspace/runtime/hermes-native/workspace/house-t5-wu06/wu06_live_proof.py',
        '# expect the 10 pre-deploy FAILs on redirect + security headers to flip to PASS',
    ]),
    ('6. ROLLBACK (only if step 5 regresses)', [
        'npx wrangler rollback <recorded-deployment-id>',
        '# re-run the smoke and confirm the pre-deploy state is restored',
    ]),
]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--execute', action='store_true', help='actually run (OPERATOR only, post-B5)')
    ap.add_argument('--step', default='0. PRE')
    args = ap.parse_args()

    print('=' * 74)
    print('WU05 CONTROLLED PRODUCTION APPLY + DEPLOY')
    print('mode:', 'EXECUTE' if args.execute else 'DRY RUN (no mutation)')
    print('=' * 74)
    print()
    print('PRECONDITIONS')
    ok = True
    for name, passed, detail in preconditions():
        print(f'  [{"PASS" if passed else "FAIL"}] {name:26s} {detail}')
        ok = ok and passed
    print()
    print('SEQUENCE')
    for label, cmds in STEPS:
        print(f'\n--- {label} ---')
        for c in cmds:
            print('   ', c)
    print()
    print('CAPABILITY ACTIVATION IS NOT PART OF THIS SCRIPT.')
    print('It is sequenced separately and requires its own approval + verification per stage.')
    print()
    if not ok:
        print('RESULT: precondition failure - DO NOT DEPLOY')
        return 1
    print('RESULT: preconditions satisfied' if args.execute else 'RESULT: dry run complete')
    return 0


if __name__ == '__main__':
    sys.exit(main())
