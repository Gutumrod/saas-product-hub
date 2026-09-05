# Independent Expert Review: WSTERA Layer Model Strategy

**Review Target:** `docs/strategy/WSTERA-LAYER-MODEL.md`  
**Evaluation Framework:** `COUNCIL-BRIEF.md` (`llm-council-gate` v0.3.2)  
**Role:** Independent Expert (Candidate Review)  
**Constraint Check:** No files edited. No external expert opinions read. No final Council verdict issued.

---

### 1. Recommendation

**`REMEDIATE`**

**Rationale:**  
The core governing principleΓÇö*ΓÇ£First build products that humans can use safely and completely. Then make those same authoritative capabilities operable by authorized AI agentsΓÇ¥*ΓÇöis fundamentally sound, architecturally robust, and necessary to prevent premature AI vaporware. 

However, the strategy document contains critical ambiguities in:
1. Subjective threshold definitions (e.g., *"does not inflate scope materially"*), which invite scope creep under the guise of "good architecture."
2. The premature introduction of Layer 2 patterns into Layer 1 (specifically *"read vs propose vs execute separation"*).
3. Ambiguity regarding whether Layer 1 closeout is evaluated on a per-product basis or locked across the entire portfolio.
4. The total absence of objective, enforceable exit criteria for assigning the status `L1 COMPLETE ΓÇö AGENTIZATION ELIGIBLE`.

These gaps must be remediated with explicit, binding language before the document is accepted as an authoritative portfolio strategy baseline.

---

### 2. What is Strong / Should Remain

1. **Primacy of Product Authority (Lines 14ΓÇô16, 84ΓÇô85, 122):**  
   Retaining domain validation, invariant enforcement, state transitions, and audit logging strictly inside the product domainΓÇöand explicitly rejecting "AI clicking the UI"ΓÇöis the single most vital safeguard in the document.

2. **Strict Anti-Scope-Creep Prohibitions (Lines 58ΓÇô63):**  
   Explicitly forbidding the use of "Agent-ready" to justify adding AI orchestration, autonomous workflows, additional LLM providers, MCP surfaces, or speculative databases in Layer 1 establishes a necessary defense during PRD and Architecture reviews.

3. **User Intent to Audit Evidence Pipeline (Lines 80ΓÇô83):**  
   The target pattern (`User Intent ΓåÆ Authorized Agent ΓåÆ Product Capability Contract ΓåÆ Authoritative Business Action ΓåÆ Audit Evidence`) establishes a clean separation between cognitive intent and deterministic execution.

4. **Cross-Layer Governance Invariants 1 & 3 (Lines 122, 124):**  
   - *"A higher layer must not compensate for an incomplete lower layer."*  
   - *"Agent permission can never exceed the delegating user's authorized scope."*  
   These two rules provide clear defensive boundaries against common agent failure modes.

5. **Portfolio Transition Boundary (Lines 131ΓÇô136):**  
   Explicitly stating that current portfolio work remains strictly Layer 1 and that no existing pipeline gate is automatically expanded prevents unauthorized architectural refactoring.

---

### 3. Critical Risks / Contradictions

1. **Portfolio-Level vs. Per-Product Closeout Contradiction (Lines 66, 68ΓÇô74):**  
   - *Line 66:* *"After the portfolio build/launch cycle is complete, create a portfolio-level `LAYER-1-CLOSEOUT.md`."*  
   - *Line 68:* *"Each product intended to continue must receive an explicit state such as: `L1 COMPLETE ΓÇö AGENTIZATION ELIGIBLE`."*  
   - *Risk / Contradiction:* If closeout is strictly portfolio-level, does an early-finishing product (e.g., Pawstia or Booking) have to wait for late-finishing portfolio products (e.g., WSM or DocCraft) before entering Layer 2 planning? Alternatively, if products close out independently, Line 66 creates procedural confusion. `[Inference]`

2. **Subjective Boundary Loophole: "Materially" (Lines 39, 62):**  
   - *Text:* *"where doing so does not inflate scope materially"* (Line 39) and *"adds material implementation scope"* (Line 62).  
   - *Risk:* "Material" is undefined. Engineering teams routinely argue that adding event brokers, draft state tables, or schema versioning abstractions is "standard architecture" rather than material scope expansion.

3. **Architectural Contradiction: "Propose vs. Execute" in Layer 1 (Line 47 vs. Line 89):**  
   - *Line 47 (L1 Preferred Foundations):* Lists *"read vs propose vs execute separation where material"*.  
   - *Line 89 (L2 Capabilities):* Lists *"propose / preview operations"* as an L2 capability.  
   - *Risk / Contradiction:* Forcing L1 human products to implement dual-phase "propose vs. execute" staging mechanics when a standard, direct CRUD transaction suffices for human users forces Layer 2 semantics into Layer 1 codebases prematurely.

4. **Missing Identity Primitives for Dual-Attribution Audit:**  
   - Line 51 requires *"audit logs and immutable history"*, but does not specify that the L1 actor schema must support recording both the *delegating human principal* and the *acting execution mechanism* (direct user vs. delegated agent). Retrofitting actor tables in Layer 2 would require costly database migrations.

5. **Premature Cross-Product Detail in Layer 3 (Lines 118ΓÇô119):**  
   - Citing specific cross-product agent workflows across Booking, Order, Claim, Billing, Support, DocCraft, and WSM invites architects to design cross-product event buses and shared schemas during Layer 1, violating the premise that Layer 3 is not current scope. `[Inference]`

---

### 4. Layer 1 Boundary Assessment

- **Human Operability & AI Independence:**  
  The document succeeds in defining Layer 1 as completely viable without AI (`Lines 20, 35`). It properly routes all work through the existing gate pipeline (`Lines 22ΓÇô33`).
- **Agent-Readiness Constraints as Sound Engineering:**  
  Most preferred foundations (`Lines 43ΓÇô54`)ΓÇödeterministic authoritative actions, stable UUIDs, tenant isolation, RBAC, idempotency keys, machine-readable structured errors, and non-UI coupled domain service logicΓÇöare standard high-quality SaaS foundations, not speculative agent overhead.
- **Vulnerabilities in L1:**  
  The boundary leaks when it asks L1 to account for "propose vs. execute" (`Line 47`). L1 should only build propose/preview workflows if the *human business process* independently requires a draft/review state (e.g., quotation drafting or invoice approval). If a human does not need a draft state, adding one solely for future agents is scope inflation.

---

### 5. Layer 2 Boundary Assessment

- **Authority & Delegation Model:**  
  Layer 2 correctly frames agents as clients of the product's capability contracts rather than autonomous entities that bypass the product (`Lines 81ΓÇô85`). 
- **Enforcement Gaps:**  
  1. *Authentication & Credential Scoping:* Layer 2 mentions *"scoped credentials / tokens"* (`Line 93`), but does not mandate automated expiration, scope narrowing, or instant revocation mechanics.  
  2. *Human-in-the-Loop (HITL) Thresholds:* While *"approval-required actions for high-impact operations"* is mentioned (`Lines 48, 90`), Layer 2 lacks a formal requirement that each capability contract explicitly declare its execution tier:
     - Tier 0: Read-only (safe for autonomous execution)
     - Tier 1: Reversible write / Low impact (autonomous execution with notification)
     - Tier 2: Irreversible write / Financial / Destructive (mandatory human approval prior to commit)
  3. *Contract Parity:* Layer 2 must explicitly mandate that agent capabilities execute the exact same domain service validation code paths as human UI actions to prevent "agent backdoor" logic.

---

### 6. Layer 3 Boundary Assessment

- **Risk of Premature Horizon:**  
  Cross-product multi-agent choreography introduces distributed transactions, multi-tenant permission compounding, split-brain race conditions, and cascaded failure domains. 
- **Strategic Boundary:**  
  Layer 3 should remain strictly conceptual. The document must explicitly prohibit any architectural work, shared data layers, global agent relays, or cross-product messaging infrastructure in current gates. Layer 3 must be formally quarantined until Layer 2 demonstrates verifiable production metrics (low error rates, reliable audit trails, zero cross-tenant leakages) across at least two independent products.

---

### 7. Required Minimum `L1 COMPLETE ΓÇö AGENTIZATION ELIGIBLE` Criteria

Before any product can be assigned `L1 COMPLETE ΓÇö AGENTIZATION ELIGIBLE`, it must satisfy an explicit, testable checklist. Merely "finishing the build" is insufficient:

1. **Production Human Operational Baseline:** The product is deployed, actively used by humans, and capable of handling 100% of core business workflows without any external AI dependency.
2. **Strict Multi-Tenant Isolation:** Tenant boundary enforcement is verified by negative automated security test suites (e.g., verifying that cross-tenant data requests return strict authorization errors).
3. **Decoupled Headless Domain Contracts:** All authoritative mutations are encapsulated in headless domain services or APIs with machine-readable schemas, completely decoupled from UI controllers, session state, or HTML scraping.
4. **Enforced Idempotency & Replay Safety:** State-altering endpoints accept idempotency keys and safely handle duplicate transmissions without double-execution.
5. **Structured Machine-Readable Errors:** Domain errors return structured, deterministic error codes and typed payloads rather than localized, free-text human strings.
6. **Dual-Attribution Audit Trail:** Audit logging records tenant ID, human principal ID, caller/actor ID, immutable timestamp, and structured parameter diffs.
7. **Domain Invariant Self-Enforcement:** Invariants (e.g., inventory limits, booking collisions, billing rules) are enforced at the database or domain transaction boundary, never relying on caller sanity.
8. **Formal Pipeline Closeout Sign-off:** The product has formally passed Launch Validation and Release Closeout with audit evidence filed in the portfolio repository.

---

### 8. Scope-Creep Traps to Forbid

To ensure developers and architects do not introduce Layer 2 work under the guise of Layer 1 "readiness," the document should explicitly forbid:

1. **Speculative Tool Schema / MCP Creation:** Authoring Model Context Protocol (MCP) servers, OpenAPI tool wrappers, or LLM function declarations during Layer 1.
2. **Artificial "Draft" Staging Entities:** Creating shadow tables or multi-stage propose/commit databases for operations that human users execute in a single step.
3. **Agent Framework Dependencies:** Installing or scaffolding agent orchestrators (e.g., LangChain, AutoGen, CrewAI, LlamaIndex) or LLM SDKs in Layer 1 repositories.
4. **Vector / Semantic Infrastructure:** Provisioning vector extensions (e.g., `pgvector`), embeddings pipelines, or vector databases unless semantic search is an explicit, human-facing Layer 1 requirement in the approved PRD.
5. **Bifurcated Business Logic:** Developing specialized "agent-only" API routes that duplicate or bypass standard human web application services.
6. **Premature Cross-Product Messaging Buses:** Setting up shared cross-product Kafka topics, event meshes, or message brokers intended for Layer 3 agent coordination.

---

### 9. Suggested Exact Document Changes

#### Change 1: Clarify Closeout Granularity (Lines 64ΓÇô74)
*Current:*
```markdown
## Layer 1 Closeout

After the portfolio build/launch cycle is complete, create a portfolio-level `LAYER-1-CLOSEOUT.md`.

Each product intended to continue must receive an explicit state such as:

`L1 COMPLETE ΓÇö AGENTIZATION ELIGIBLE`

or

`L1 INCOMPLETE ΓÇö LAYER 2 BLOCKED`
```
*Proposed:*
```markdown
## Layer 1 Closeout

Layer 1 closeout is evaluated on a per-product basis upon completion of that product's release closeout. 

When a product achieves operational launch, its status is recorded in `LAYER-1-CLOSEOUT.md` with an explicit state:

`L1 COMPLETE ΓÇö AGENTIZATION ELIGIBLE`
or
`L1 INCOMPLETE ΓÇö LAYER 2 BLOCKED`

A portfolio-level synthesis report will summarize the state of all products once the portfolio build cycle concludes. An eligible product may only enter Layer 2 planning after explicit Owner authorization.
```

#### Change 2: Clarify "Propose vs Execute" and Replace "Materially" (Lines 39, 47, 62)
*Current Line 39:*
```markdown
Layer 1 must not build Agent features merely to prepare for Layer 2. However, new or materially refactored capabilities should preserve contracts that make later agent operation safe and practical where doing so does not inflate scope materially.
```
*Proposed Line 39:*
```markdown
Layer 1 must not build Agent features merely to prepare for Layer 2. However, new or refactored capabilities should preserve contracts that make later agent operation safe and practical, provided this does not add net-new tables, external dependencies, or speculative endpoints not required by the Layer 1 PRD.
```

*Current Line 47:*
```markdown
- read vs propose vs execute separation where material
```
*Proposed Line 47:*
```markdown
- read vs execute separation (propose/draft workflows are restricted to capabilities where the human business process explicitly requires draft/review states)
```

*Current Line 62:*
```markdown
If an Agent-specific requirement adds material implementation scope, defer it to Layer 2 unless an existing Layer 1 requirement independently needs the same contract.
```
*Proposed Line 62:*
```markdown
If an Agent-specific requirement adds any implementation tasks not strictly required to serve human users in Layer 1, defer it to Layer 2 without exception.
```

#### Change 3: Insert Objective Eligibility Section (After Line 74)
*Insert new subsection 2.1:*
```markdown
### Minimum Eligibility Criteria for Layer 2

A product cannot be designated `L1 COMPLETE ΓÇö AGENTIZATION ELIGIBLE` without meeting all of the following verifiable criteria:
1. Active, verified human production usage with zero AI dependency.
2. Automated negative test verification of tenant data isolation.
3. Headless domain service contracts decoupled from UI/session state.
4. Idempotency key support on all state-mutating operations.
5. Structured, typed machine-readable domain error codes.
6. Immutable audit logging capturing tenant ID, principal ID, caller ID, and diffs.
7. Complete domain invariant enforcement within database/service transactions.
8. Approved Release Closeout evidence signed off by Architecture and Risk gates.
```

#### Change 4: Establish Formal Layer 3 Quarantine (Lines 111ΓÇô114)
*Current:*
```markdown
Layer 3 is a future horizon, not current scope.
```
*Proposed:*
```markdown
Layer 3 is a conceptual horizon only and is formally quarantined. No architecture, database schemas, cross-product event buses, or code abstractions may be introduced in Layer 1 or Layer 2 to accommodate Layer 3. Layer 3 discussions will only open after Layer 2 agentic operations have operated in production with validated audit safety in at least two independent products.
```

---

### 10. Open Questions for Owner

1. **Progression Cadence:** May an individual product that satisfies all `L1 COMPLETE ΓÇö AGENTIZATION ELIGIBLE` criteria advance to Layer 2 scoping independently, or is Layer 2 strictly blocked until *every* active product in the WSTERA portfolio completes Layer 1?
2. **Agent Execution Topology:** Will Layer 2 agents run as tenant-isolated sidecars within each product's infrastructure boundary, or will they be hosted in a centralized portfolio Agent Relay service? *(Clarifying this prevents architects from guessing and pre-engineering communication layers during L1).*
3. **HITL Authority Matrix:** Will the determination of which actions require human approval (HITL) vs. autonomous execution be defined centrally by WSTERA portfolio governance, or delegated to individual product tenant administrators via policy settings?

---

### 11. Confidence 0ΓÇô100

**`95 / 100`**

**Justification:**  
The conceptual foundation of the Layer Model is exceptionally strong, directly addressing the industry-wide antipattern of building fragile AI wrappers on unvalidated foundations. The identified risks (subjective phrasing, closeout timing ambiguities, premature propose/execute staging, and lack of objective exit criteria) are structural and easily remedied via the proposed text adjustments. Confidence is not 100 solely because Owner operational intent regarding portfolio vs. per-product transition cadence requires explicit clarification.
