# SOL RECOMMENDATION — DUAL-LANE OWNER RULINGS

Date: 2026-09-24
Task: `WSTERA-HOUSE-DUAL-LANE-CONVERGENCE-001`
Source packet: `OWNER-PACKET-DUAL-LANE-PARKED-2026-09-24.md`
Status: `SOL_RECOMMENDATION_ONLY / OWNER_APPROVAL_REQUIRED`

## 1. Corrections to the Owner packet

### A-3 is not a missing decision

`LANE_A_PRODUCTION_RELEASE_V1` was already approved once and was actually opened.
The W0 report records that authority and then records W0 FAIL before W1.

The governing V3 contract says the release is approved once and every later window is conditional
on the prior one passing. A W0 FAIL stops progression; it does not itself revoke the prior approval.

Recommendation:
- do not ask Owner to approve A-3 again;
- preserve the existing release authorization;
- require A0 remediation + W0 requalification before W1 can resume.

### B-3 is a real current-state correction

The non-BUILD scope-guard repair is absent from both the installed protected skill and committed
vault source. It therefore cannot be treated as already closed.
## 2. Recommended Lane-A rulings

### A-0 — incident remediation

Recommended: choose **(a) delete the temporary CLI login role**.

Reason:
- the exposed credential belongs to that temporary CLI role;
- deleting the role revokes that credential at its source;
- there is no evidence that the primary Control DB password itself was exposed;
- rotating unrelated credentials would widen blast radius without evidence.

After deletion:
- verify the role is no longer usable/present through the safest available non-secret check;
- run the existing session-hygiene / secret-scan path;
- do not reuse the exposed credential.

### A-1 — backup / recovery posture

Recommended: choose **(a) forward-fix-only**, with the reviewed rollback/forward-fix contract.

Basis:
- 0009 is EXPAND-only; no table/column drop, no truncate/delete; its only data write is a bounded
  backfill and its rollback deliberately preserves that backfill;
- 0010 removes exactly one superseded 17-argument function overload, no CASCADE, and has an explicit
  restore-0006 recovery path;
- both are executed transactionally with preconditions/postconditions and dry-run before real apply.

This is an explicit acceptance that no platform recovery point exists; it is not a claim that backup exists.

### A-2 — operator / credential provisioning

Recommended:
- human operator = Owner at the keyboard;
- Hermes remains orchestrator/gate controller and must not invent or persist credentials;
- credential source class = existing approved out-of-band secret source;
- construct/inject `LANE_A_CONTROL_DATABASE_URL` only in the authorized production process environment;
- never place it in argv, repository, docs, evidence, or logs.
## 3. Recommended Lane-B rulings

### B-1 — protected-skill authorization

Recommended: authorize a bounded protected-skill remediation, but **only after source/live reconciliation**.

Required order:
1. inventory and classify the current vault dirty state without reset/clean/stash;
2. prove which files constitute the installed v2.5.5 release from manifest/backups/release evidence;
3. reconstruct or identify a clean canonical source revision matching the installed v2.5.5 baseline;
4. only then edit protected components;
5. commit/push the canonical source revision before installation;
6. install atomically only after tests + verifier + independent review pass.

Do not patch the installed runtime as the source of truth.

### B-2 — scanner ruling

Recommended: choose **Option A**.

Bounded change:
- detect the psql client-variable reference from the raw matched text using the proven colon-quote
  identifier discriminator;
- do not exempt the review stage;
- do not bypass wrapper-log scanning;
- do not create a broad synthetic-secret exemption.

Require negative controls for Stripe live/test, OpenAI project key, GitHub PAT, Slack token,
opaque assignment, 32-hex value, and non-psql colon string.

### B-3 — scope-guard correction

Recommended: choose **(a) include it in B0 protected remediation**.

Reason:
- it lives in the same protected executor component;
- it independently prevents the same non-BUILD review path from completing;
- the earlier repair is absent from both installed and committed canonical state;
- splitting it into another task would leave B1 predictably blocked after the other two repairs.

The repaired guard must exclude harness-owned `.secretary-relay/**` evidence while still detecting
a worker's own ignored scratch writes outside that evidence root.
## 4. Lane-B bounded remediation sequence after approval

1. source/live reconciliation;
2. provenance-contract repair:
   - executor and driver hash the same canonical stdout bytes;
   - preserve provenance validation;
   - cover output-file present/absent, trailing newline, UTF-8, tamper detection;
3. restore/fix non-BUILD scope guard with harness-evidence exclusion + ignored-scratch negative control;
4. targeted tests + canonical Relay verifier;
5. re-run Codex classification with a sanitized prompt;
6. only an admissible `SEND_TO_CLAUDE` may open Claude scanner remediation;
7. Claude performs only the bounded Option-A scanner fix;
8. scanner negative controls + full Relay verifier;
9. independent review of the protected Relay revision;
10. re-freeze Lane-B candidate and dispatch R2.

Any new defect fingerprint follows the approved Lane-B gate contract.
No ordinary trial-and-error beyond its repair budget.

## 5. Recommended Owner decision set

Recommended Owner decisions are therefore:

```text
A-0 = (a) DELETE temporary CLI login role; treat exposed temporary credential as revoked only after verification.
A-1 = (a) accept forward-fix-only posture under the already-reviewed transaction/rollback contract.
A-2 = Owner is the human operator; use the existing approved out-of-band secret source and runtime-only env injection.
A-3 = NO NEW APPROVAL REQUIRED; existing LANE_A_PRODUCTION_RELEASE_V1 remains in force but is parked until A0/W0 passes.

B-1 = authorize bounded protected-skill reconciliation + remediation, source-first; never patch live runtime as SoT.
B-2 = Option A scanner remediation after admissible SEND_TO_CLAUDE.
B-3 = (a) include the missing non-BUILD scope-guard repair in the same bounded protected remediation.
```

This document is a Sol recommendation only. It does not create Owner authority.
