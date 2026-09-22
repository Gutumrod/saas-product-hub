# T4-WU03 — SOURCE / INSTALL PARITY PLAN AND INSTALLATION EVIDENCE

Task: `WSTERA-CONTROL-TRUTH-SYNC-001` · Workflow `WF-DEV-01 v1.3.0 / LONG_RUN`
Stage: **T4** — "Hermes Control Sync integration" (`RUN-MANIFEST` §9)
Date: 2026-09-22 (Asia/Bangkok) · By: Hermes (Long-Run Orchestrator / State Holder)
Status: **parity plan + evidence only. NO INSTALLATION PERFORMED.**

---

## 1. Why no installation was performed

`RUN-MANIFEST` §9 is explicit:

> "do not install revised skill over the runtime copy until exact revision has passed required
> review/installation gate."

and the Owner decision (`OWNER-DECISION-LITERAL-NODE-ENV-T3-RESUME-2026-09-22.md`) authorizes
"source implementation + tests + evidence + exact revision commit/push only", explicitly **not**
"runtime-skill production activation beyond already-authorized local/test verification".

R2 has **not** run. Therefore the revised source stays on its branch and the installed runtime copy
is deliberately left untouched.

---

## 2. Measured parity at this checkpoint

Source = `D:/AI-Workspace/runtime/worktrees/wstera-control-sync-t4/runtime-skills/devops/wstera-control-sync`
(frozen at branch `work/wstera-control-truth-sync-001-t4`, revision
`5770bd8104c42abe64647615105930ccabfb3979`, base `e711b94`).

Installed = `D:/AI-Workspace/runtime/hermes-native/data/skills/devops/wstera-control-sync`
(plain runtime directory, not a git repository).

| File | Source sha256 | Installed sha256 | Parity |
|---|---|---|---|
| `scripts/control_sync.py` | `e47a05499ea86f6ab92c8ffb6022a24f5e74e16239614202ddf885a851794177` | `ad330dd5d4c3571c85a7ae33ba820157fd392c7c938d05fba746abfa66ad4e1c` | **DIFFERS — expected** |
| `references/EVENT-CONTRACT.md` | `20ca70c407547f3c32c6920771a0a7dd422ca43fa7c5d8902a2916ac30568bd0` | `e763e48821a90f314fb0d81a40580431cd2b2f6dd008c8b2555d4a424a1c448f` | **DIFFERS — expected** |
| `tests/test_control_sync.py` | `cdaeb4599d52ee0809a8fa87996a18973ffe9fb8dedcda92851cdf9e8b6b008d` | `9a8c054b35286f56982d8204e7e80141d60bb98d249780c32d0abd94a704493e` | **DIFFERS — expected** |
| `SKILL.md` | `e1d239032c837c93dccf74f61685383c6972afa689ddcee771125254ab438630` | same | **MATCH** |

All three differences are the intended T4-WU01/T4-WU02 change (sender bound, contract record, and the
test suite that covers it) and no other file drifted. The installed `tests/` directory also holds a
`__pycache__` produced by running it locally — runtime noise, not source.

`SKILL.md` matching while the others differ is itself meaningful evidence: this stage changed the
sender, its contract reference and its tests, and did **not** silently alter the skill's declared
interface or version.

Installed `doctor` re-checked at this checkpoint and still healthy: `endpoint_configured=true`,
`endpoint_https=true`, `secret_configured=true`, `secret_value_exposed=false`, `version 0.1.0`.

---

## 3. 🔴 Consequence that must stay visible until installation

**The installed runtime sender still has no `activity.detail` bound.**

```text
grep -c MAX_ACTIVITY_DETAIL_CHARS <installed>/scripts/control_sync.py  → 0
```

So the root cause classified in `CONTROL-SYNC-DEAD-LETTER-CLASSIFICATION-2026-09-22.md` **remains live
for any governed run that emits through the installed copy**, including this run. The bound exists only
in source. A long `detail` can still be accepted by the sender, rejected by the endpoint with HTTP 400,
and land in the durable outbox as a dead-letter.

This run's own mitigation is procedural, not installed: Hermes keeps emitted `detail` under the
measured limit. **The dead-letter count in this run's evidence must therefore not be read as "fixed"
— the fix is not deployed.**

This is precisely the state `CONTROL-SYNC-POLICY.md` requires to be shown rather than hidden: "the
missing generic-work path must not be hidden by a fake PASS."

The installed copy also still carries its older `tests/test_control_sync.py` (the local `__pycache__`
present there is runtime noise, not source).

---

## 4. Installation procedure for when the gate opens

To be executed **only** after R2 approves the exact revisions above. Ordered, verifiable, reversible:

1. **Freeze and record** the exact source revision to install: branch, commit SHA, and the sha256 of
   every file to be copied. Re-verify the SHAs immediately before copying, so the installed artefact
   is provably the reviewed one.
2. **Back up** the current installed `scripts/control_sync.py` and `references/EVENT-CONTRACT.md` to a
   timestamped location outside the skills tree, and record their sha256 (already recorded in §2, which
   is the rollback target).
3. **Copy only the reviewed files.** Do not copy the worktree's `tests/` directory into the runtime
   skill unless that is the intended contract for this skill; state explicitly which paths are being
   installed.
4. **Verify byte parity** after copying: every installed file's sha256 must equal the source's, using
   the same comparison table as §2. Parity is the installation proof — not the absence of an error.
5. **Re-run the installed copy's own tests** and `doctor`, confirming `endpoint_configured=true`,
   `endpoint_https=true`, and `secret_value_exposed=false`.
6. **Behaviour check without network**: dry-run an over-limit `detail` through the installed sender and
   confirm the truncation marker and the stderr warning fire, exactly as verified at source.
7. **Record installation evidence**: source revision, destination path, per-file sha256 before/after,
   test and doctor output, timestamp, and the operator identity.
8. **Rollback**: restore the backed-up files and re-verify §2's recorded sha256. State the rollback
   trigger conditions before installing, not after.

**Installation must not be bundled with any other change**, so that a rollback is unambiguous.

---

## 5. What T4 did NOT cover, stated plainly

- The sender's **generic non-product Work Queue scope** remains blocked by the Control RPC gap
  (migration `0006` rejects any task projection without a canonical product identity, per
  `EVENT-CONTRACT.md`'s "Known server compatibility patch"). That is a Control-side/patch problem, not
  something the T4 sender work resolves, and no fake Product code was invented.
- `wstera-workflows` repository governance (its own evidence/implementation record requirements) was
  not satisfied in this stage; only the skill source and its contract reference and tests were changed.
- The installed copy remains the older revision until §4 runs.

## 6. Non-claims

- No file was installed, overwritten, or deleted in the runtime skill directory.
- No production deployment, DB mutation, or Cloudflare change.
- The `projects/wstera-workflows` worktree, which holds unrelated untracked work, was not touched; all
  work happened in the isolated worktree `wstera-control-sync-t4`.
- This document is not an independent review.
