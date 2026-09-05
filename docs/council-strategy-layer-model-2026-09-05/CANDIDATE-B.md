# Independent Expert Review ΓÇö WSTERA Layer Model Strategy

**Inputs used:** `docs/strategy/WSTERA-LAYER-MODEL.md` and `docs/council-strategy-layer-model-2026-09-05/COUNCIL-BRIEF.md` only. No other files, no other experts' outputs, no edits. Inferences are labeled.

---

## 1. Recommendation

**ACCEPT WITH TARGETED AMENDMENTS** (equivalent to REMEDIATE-lite at strategy level): the Layer 1 / 2 / 3 model is coherent, correctly sequenced, and does not authorize work beyond its stated authority. Before Owner acceptance, amend the document in 6ΓÇô8 precise places to close definitional gaps ΓÇö chiefly: (a) define "material" scope inflation, (b) define the L1 closeout trigger and minimum evidence, (c) resolve the internal tension between "capability contracts that do not depend on UI clicking" and the anti-scope-creep rule. None of the gaps require redesigning the model; they require tightening its language.

## 2. What is strong / should remain

- **Authority containment is airtight.** The header ("Strategy direction only; does not authorize buildΓÇª"), the Portfolio Transition Rule, and the brief's own "does NOT authorizeΓÇª" clause are mutually consistent. Answering Council question 5: **I found no wording that authorizes Layer 2 work now.** The permissive list in Layer 2 ("may include") is safely conditioned by "Layer 2 begins only after explicit Owner release following Layer 1 closeout," and Governance rule 7 adds an independent review requirement.
- **The governing principle is the right one.** "Humans first, then agents on the same authoritative capabilities" directly prevents the classic failure of AI features masking incomplete foundations. Keep it verbatim.
- **The agent-readiness constraint is correctly subordinated.** "These are product-quality constraints first; future Agent compatibility is a secondary benefit" is the single most important sentence in Layer 1. Keep it.
- **The anti-scope-creep rule names concrete traps** (AI orchestration, autonomous workflows, extra providers, MCP surfaces, agent-specific databases, speculative APIs). Naming the traps makes the rule enforceable at gates, not just aspirational.
- **Cross-Layer Governance rules 1ΓÇô3 and 6 are the correct security spine:** no higher-layer compensation, product authority stays in the product, agent permission Γëñ delegating user scope, tenant/billing/security/audit boundaries never collapse.
- **"Layer 2 is not AI clicking the UI"** ΓÇö defining L2 as capability-contract operation rather than UI automation is the correct architectural decision and should remain.
- **Explicit binary closeout states** (`L1 COMPLETE ΓÇö AGENTIZATION ELIGIBLE` / `L1 INCOMPLETE ΓÇö LAYER 2 BLOCKED`) create a per-product, auditable gate rather than a vibes-based readiness claim.

## 3. Critical risks / contradictions

- **R1 ΓÇö The double hedge in the agent-readiness constraint.** "Should preserve contractsΓÇª **where doing so does not inflate scope materially**." "Should" + "materially" (undefined) gives gate reviewers no test to apply. Two reviewers can reach opposite conclusions on the same requirement. This is the highest-risk wording because it sits exactly on the scope-creep boundary the document exists to police.
- **R2 ΓÇö Internal tension on capability contracts.** Layer 1 "preferred foundations" include "capability contracts that do not depend on UI clicking," while the anti-scope-creep rule forbids "speculative APIs that are not required for the current product." Read strictly, the first demands service-level reachability of every authoritative action; the second forbids building APIs nobody currently calls. Most SaaS backends already expose such interfaces, so in practice the tension is small ΓÇö but the document does not say that, and the phrase could be cited to justify an API-building program in Layer 1. *(Partially inference: grounded in the two sentences quoted, the practical interpretation is mine.)*
- **R3 ΓÇö `L1 COMPLETE ΓÇö AGENTIZATION ELIGIBLE` has no earning criteria.** The states are named but nothing defines the evidence that earns them. Council question 4 anticipates this; without minimum criteria the closeout becomes a subjective Owner attestation, which weakens exactly the authority the model tries to protect.
- **R4 ΓÇö The closeout trigger is undefined.** "After the portfolio build/launch cycle is complete" ΓÇö a portfolio is never finished; products are added continuously. What counts as "the cycle"? Without a trigger, Layer 2's precondition is unenforceable.
- **R5 ΓÇö Disposition of non-continuing products is undefined.** "Each product **intended to continue** must receive an explicit state" ΓÇö products *not* intended to continue have no defined state (sunset? frozen? excluded?), which leaves an ambiguity an agentization program could later exploit.
- **R6 ΓÇö Audit principal identity gap.** Governance rule 3 constrains *permission* to the delegating user, and L2 lists "agent identity," but no governance rule requires audit evidence to record **both** the delegating user and the acting agent identity. Without this, rule 4 ("AI recommendation and authoritative execution must be distinguishable") has no enforced substrate at the audit layer.
- **R7 ΓÇö Minor scope wording inconsistency.** Purpose says "make **those same** authoritative capabilities operable" (reads as: all products), while Layer 2 says "make **approved product capabilities** operable" (reads as: a subset, approved per capability). Probably the same intent, but the looser reading invites "everything is eligible by default."

## 4. Layer 1 boundary assessment

**Coherent, with three tightening needs.** L1 is correctly defined as the existing pipeline (Product Gate ΓåÆ ΓÇª ΓåÆ release closeout) plus the human-operability bar ("authoritative system of record and workflow system without AI dependency"). The agent-readiness constraint is appropriately conditional and explicitly subordinated to product quality, and the anti-scope-creep rule is concrete. Three issues keep it from being fully self-enforcing: (1) the "should/materially" hedge (R1) makes the constraint advisory; (2) the preferred-foundations list mixes items that are ordinary SaaS quality bars anyway (stable IDs, tenant/actor scope, permission boundaries, audit logs, structured errors, state machines) with items that are genuinely additive (read vs propose vs execute separation, approval workflows for high-impact actions, capability contracts beyond current need) without distinguishing them (R2); (3) closeout trigger and criteria are undefined (R3/R4). Also note: nothing in L1's list of preferred foundations contradicts the brief's pipeline boundaries ΓÇö the constraints attach to *how* current capabilities are built, not to new capability categories.

**Verdict: no boundary violation found; requires definitional amendments, not structural change.**

## 5. Layer 2 boundary assessment

**Coherent and correctly gated.** The operating pattern (`User Intent ΓåÆ Authorized Agent ΓåÆ Product Capability Contract ΓåÆ Authoritative Business Action ΓåÆ Audit Evidence`) keeps validation, permissions, invariants, state transitions, and auditability inside the product ΓÇö consistent with Governance rules 2, 3, and 5. The capability list (read tools, propose/preview, bounded execute, agent identity, scoped credentials, execution receipts) is the right inventory and does not leak downward into L1 because of the begin-gate. Two weaknesses:

1. **The four examples (Booking, Pawstia, WSM, DocCraft) are unlabeled.** Nothing says they are illustrative rather than a commitment, priority order, or first-wave list. *(Inference: the document nowhere states an L2 sequencing, but the examples' prominence invites that reading.)*
2. **No containment language.** L2 grants agents bounded execute authority over production business systems; the document has approval/idempotency/override but no strategy-level requirement for blast-radius controls (per-agent rate/quota limits, kill-switch, per-tenant opt-in). One sentence at strategy level suffices; the design belongs to the future L2 program review under Governance rule 7.

Also confirm explicitly that L2 will require its own program charter ΓÇö the brief correctly notes this review authorizes no L2 dispatch, and the doc's Governance rule 7 implies it, but a strategy baseline should say it in one line.

## 6. Layer 3 boundary assessment

**Correctly conceptual ΓÇö keep it that way.** "Future horizon, not current scope" plus Governance rule 6 (no collapse of tenant/billing/security/audit boundaries) is the right posture. Answering Council question 6: **yes, Layer 3 should remain conceptual until Layer 2 has production evidence in at least one product.** The named product list in the L3 section ("Booking, Order, Claim/Case, Billing, Support, DocCraft, WSMΓÇª") is harmless as illustration but is the only place where cross-product commitments could be inferred; it should stay clearly hypothetical. No structural change needed ΓÇö one clarifying sentence (see ┬º9).

## 7. Required minimum `L1 COMPLETE ΓÇö AGENTIZATION ELIGIBLE` criteria

Grounded in the L1 pipeline items the document itself enumerates. A product earns the state only when **all** of the following are evidenced in the closeout record:

1. **Gate completeness:** Product Gate, Business/Market Gate, Architecture Gate, and Risk/Invariant Gate (where applicable) and Pre-Build Gate all passed with evidence archived; no gate passed by waiver that remains unresolved.
2. **Verification:** implementation verified by the product's defined test/verification procedure; zero open Critical/High defects; known limitations recorded in a register.
3. **Billing/entitlement:** integration implemented and evidenced (entitlement boundaries actually enforced, not merely coded).
4. **Operational readiness:** deployed, monitored, backup/restore verified, support/escalation path documented.
5. **Launch validation:** pilot/launch validation performed with real usage and outcomes recorded.
6. **Human completeness (the core test):** every core user workflow is completable by an authorized human **without AI dependency** ΓÇö demonstrated, not asserted.
7. **Authority and security evidence:** authN/authZ, tenant isolation, and role/permission boundaries tested; audit logging covers high-impact/irreversible actions with actor and tenant scope recorded; immutable history exists where decisions matter.
8. **Contract baseline (quality bar, not agent work):** authoritative actions reachable through deterministic service interfaces with stable identifiers; mutations idempotent or retry-safe where material; structured machine-readable errors; documented business state machines.
9. **Owner-signed closeout** citing evidence references, auditable by Council.

Criterion 8 is deliberately drawn from the "ordinary SaaS quality bar" subset of the preferred foundations; it must **not** be administered as a demand for new agent-facing APIs (see ┬º8).

## 8. Scope-creep traps to forbid

These should be explicitly forbidden or recognized at gates during L1:

1. Using "Agent-ready" to justify new endpoints, tables, providers, or services that no current human workflow needs.
2. Building MCP surfaces, tool manifests, or agent capability schemas now.
3. Implementing agent identity, delegated tokens, or scoped agent credentials in L1.
4. Adding AI suggestion/copilot/automation features to products under L1 budget.
5. Refactoring stable, working capabilities purely to "expose contracts" absent an independent L1 requirement.
6. Treating the Layer 2 examples as a commitment, priority order, or first-wave plan.
7. A tri-modal (read/propose/execute) UX redesign under L1 ΓÇö approval flows belong in L1 only where the domain independently requires them.
8. Sneaking cross-product integration into L1 scope ("it's technically in our product").
9. Writing agent-facing documentation/specs now.
10. Delaying or descoping current gate/launch work to "wait for better agentization" ΓÇö the inverse trap: using the layer model as an excuse to stall L1.
11. Arguing that a requirement is "not *material* scope" to slip an agent-specific contract past a gate ΓÇö until "material" is defined, this exact argument is available (R1).

## 9. Suggested exact document changes

Targeted amendments; none change the model's structure:

1. **Layer 1 agent-readiness constraint ΓÇö replace the hedge with a test.**
   From: "should preserve contracts that make later agent operation safe and practical where doing so does not inflate scope materially."
   To: "must preserve, and must not degrade, contracts that make later agent operation safe and practical. An agent-readiness contract may be added in Layer 1 only if (a) an existing Layer 1 requirement independently needs the same contract, or (b) it requires no new scope beyond code structure, naming, and documentation of behavior the capability already has. Any other agent-readiness work is Layer 2 scope. The applying gate must record which condition applied."
2. **Split the preferred foundations list.** Relabel the ordinary quality-bar subset (stable identifiers, tenant/actor scope, role/permission boundaries, idempotent mutations, structured errors, audit logs/immutable history, business state machines, deterministic actions) as **"Layer 1 quality baselines ΓÇö required where applicable."** Relabel the additive subset (read vs propose vs execute separation, approval-required actions, capability contracts beyond current need, observable evidence beyond current need) as **"conditional ΓÇö only when an independent Layer 1 requirement exists."**
3. **Resolve the contracts tension.** After "capability contracts that do not depend on UI clicking," add: "This means authoritative actions must remain reachable through the product's existing service interfaces and must not be reachable only through UI interaction. It does not require building new APIs beyond current product requirements."
4. **Define the closeout trigger.** Replace "After the portfolio build/launch cycle is complete" with: "After every product in the current portfolio cycle has reached an explicit L1 closeout state or a documented Owner-approved deferral."
5. **Add closeout criteria and sign-off.** In Layer 1 Closeout, add: "The complete state requires the minimum criteria defined in the closeout record (gate evidence, verification with no open Critical/High defects, billing/entitlement evidence, operational readiness, launch validation, human-completable workflows without AI, security and audit evidence, contract baseline). `L1 COMPLETE ΓÇö AGENTIZATION ELIGIBLE` requires Owner sign-off citing evidence references." Add the missing disposition: "Products not intended to continue receive `L1 CLOSED ΓÇö NOT CONTINUING` with their retirement/sunset state."
6. **Label the L2 examples.** After the examples list: "These examples are illustrative only and do not constitute a priority order, first-wave plan, or commitment."
7. **Add L2 containment line.** In Layer 2: "The Layer 2 program must define containment policy ΓÇö per-agent rate and quota limits, blast-radius limits, kill-switch, and per-tenant opt-in ΓÇö before any execute capability is enabled."
8. **Add audit principal rule.** Add to Cross-Layer Governance: "8. Audit evidence must identify both the delegating user and the acting agent identity, and must distinguish AI-proposed content from authoritatively executed actions." *(Merges with existing rule 4; renumber accordingly.)*
9. **Pin Layer 3.** In Layer 3, add: "No Layer 3 design or implementation work may begin until Layer 2 has production evidence in at least one product."
10. **Align Purpose wording.** In Purpose, change "make those same authoritative capabilities operable" to "make approved capabilities of those products operable" (or equivalent) so Purpose matches Layer 2's "approved product capabilities" (R7).

## 10. Open questions for Owner

1. Which products are in scope for the first L1 closeout cycle, and what is the disposition path for products not continuing?
2. Who signs `L1 COMPLETE ΓÇö AGENTIZATION ELIGIBLE` ΓÇö Owner alone, or Owner with Council-auditable evidence references?
3. Does "portfolio build/launch cycle" mean the current 2026 cycle only, and do products added later always enter at L1 regardless of portfolio phase?
4. Should already-launched products (if any) be assessed against L1 closeout retroactively, or only those still in the pipeline?
5. Does Layer 2 require a separate program charter with its own budget/gate cadence, and is L2 reviewed per capability or per program?
6. Is agent operation intended to be per-tenant opt-in, and does that expectation need to constrain L1 tenancy design now? *(Only if the answer is "yes, per-tenant opt-in" does this create any L1 obligation ΓÇö and even then only via existing multi-tenancy work.)*
7. Is the "independently needed" test for agent-readiness contracts to be documented per-gate decision, and who arbitrates disputes under the materiality rule?

## 11. Confidence

**85 / 100.** The layer model is structurally sound and its authority/anti-creep provisions are unusually disciplined for a strategy draft; my confidence in the *coherence and safety* verdict is high. The remaining uncertainty is in interpreting a few hedged phrases ("shouldΓÇª materially," "capability contracts," the closeout trigger) whose practical meaning I've inferred from context rather than from an authoritative definition ΓÇö hence not higher. The recommended amendments are low-risk and address exactly those ambiguities.

---
*This expert review issues no verdict and authorizes nothing. Per the brief: no product gate is reopened; no architecture, implementation, Agent Relay, migration, deployment, Layer 2/3 work, or WS01/LK01/CM01 dispatch is authorized by this output.*
