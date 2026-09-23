# BACKLOG — LANE B FOLLOW-UP HARDENING (non-blocking)

Date: 2026-09-23
Task: `HOUSE-SHARED-RUNTIME-LANE-B-CLOSURE-001`
Authority: Owner instruction — record these four as follow-up hardening/backlog, do **not**
block U-R2 on them.
Status of every item below: **OPEN — backlog only. Not a blocker for U-R2.**

Context: these are the limitations found while turning the OpenCode provider-auth fix into a
repo-owned managed contract
(`RUNTIME-HARDENING-OPENCODE-PROVIDER-CONTRACT-2026-09-23.md` §9), plus Owner-confirmed
scope exclusions for the current phase.

---

## FU-01 — Deployment is manual (no automatic apply on machine bootstrap)

**Observation.** The contract is repo-owned and applyable (`opencode_contract.py apply`), but
nothing runs it automatically. A freshly provisioned or reinstalled machine still has a
broken/absent live config until a human runs `apply`.

**Impact.** Recovery is proven (§5.1 of the hardening record) but requires a deliberate
operator step. Nothing detects the condition at machine level before a dispatch is attempted.

**Candidate scope (later).** A bootstrap/idempotent install step that applies the canonical
config on provisioning, with the same credential-free guarantee and the same fail-closed
verify.

**Explicitly NOT authorized now** (Owner: no boot installer in this phase).

---

## FU-02 — Verifier coverage is tied to the Lane B launcher

**Observation.** The fail-closed `verify` runs inside the Lane-B dispatch launcher
(`…\.hermes-runtime\lane-b-relay\run-u-r1-dispatch.sh`), which lives outside the repository.
There is no scheduler/cron hook and no harness-level enforcement that runs `verify` before
**every** OpenCode invocation regardless of who invokes it.

**Impact.** A dispatch that does not go through the Lane-B launcher bypasses the drift check.
The contract file itself is repo-owned, but its *enforcement point* is lane-specific.

**Candidate scope (later).** Move the preflight into the shared executor path (or a
harness-level guard) so the contract is enforced for any OpenCode dispatch, not only this
lane.

**Explicitly NOT authorized now** (Owner: no universal launcher in this phase).

---

## FU-03 — `external_directory: allow` is broader than required

**Observation.** The permission is a wildcard over all external directories. It is required
in kind — the Relay card legitimately lists a read-only source tree outside the workspace, and
without it OpenCode auto-rejects the read and aborts the step
(`BLOCKER-…-OPCODE-PROVIDER-AUTH-2026-09-23.md` §12.1 defect 3) — but it is broader than the
actual need.

**Impact.** Defence-in-depth only. Not a correctness issue: the authoritative write-scope
boundary remains the adapter's own clean-before/diff-after allowed-path gate, so widening the
read permission did not widen any write capability.

**Candidate scope (later).** Narrow the resource to the specific allowed read roots the
adapter can compute from the card, keeping the wildcard off.

---

## FU-04 — Structural comparison instead of byte comparison

**Observation.** `opencode_contract.py verify` compares **structure** (parsed JSON, with the
permission list compared order-insensitively and extra keys reported). It does not compare
file bytes or hashes.

**Impact.** This is intentional — byte comparison would make idempotent `apply` thrash the
file over whitespace/key-order differences, and would fail on harmless formatting drift. The
cost is that a comment-only or whitespace-only divergence is not reported, and the contract's
"in sync" verdict is a statement about semantics, not about the exact bytes on disk.

**Candidate scope (later).** Optionally record the canonical file's sha256 in the hardening
record and report it alongside the structural verdict, so byte-level provenance is available
without making byte-equality the pass condition.

---

## FU-05 — No direct automated Hermes → Sol transport for `SOL_VERIFY_OR_RESOLVE`

**Observation.** `SOL_VERIFY_OR_RESOLVE` is a defined authority path, but there is no automated
channel from Hermes to Sol. Measured: Sol has no CLI, no Hermes profile, and no kanban
assignee; the direct executor registry contains `agent-opencode`, `agent-codex`,
`agent-claude`, `agent-qwen`, `agent-agy` only; S-Bridge `notify` targets Telegram and accepts
only the fixed state set (`ACCEPTED`, `BLOCKED`, `CHANGES_REQUIRED`, `DONE`,
`OWNER_DECISION_REQUIRED`, `READY_FOR_GPT_REVIEW`, `REMEDIATION`) — no Sol-review state.

**Impact.** A Sol gate currently needs a human to carry the request and return the verdict.
The Lane-B Sol review on 2026-09-23 worked this way (request committed as a transport artifact,
Owner notified via S-Bridge).

**Candidate scope (later).** Add a Sol-review request/handoff state to the bridge, or a
dedicated Sol transport. **Excluded from scope now** by Sol's explicit instruction: the
authority contract must not be changed to work around the missing transport.

**Explicitly NOT authorized now** (Owner/Sol: preserve as follow-up infrastructure item).

---

## Scope exclusions carried with this backlog

The Owner excluded these from the current phase; they remain out of scope until separately
authorized:

- boot installer / provisioning automation (FU-01)
- scheduler / cron drift check (FU-02)
- universal launcher / harness-level enforcement (FU-02)

Everything else in this file is backlog, not a hold. **U-R2 proceeds.**
