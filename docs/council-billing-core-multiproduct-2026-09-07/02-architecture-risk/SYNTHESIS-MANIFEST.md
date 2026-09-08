# SYNTHESIS MANIFEST â€” Identity-Safe

## Input provenance
- Frozen Council brief SHA256: `bd47da9875666ba2ad0f0fac193b26c21f16cde279113f7e12a68a5865721477`
- Three valid independent expert candidates are present as Candidate A/B/C.
- All three completed independently from the same frozen brief and canonical evidence.
- One earlier failed operational run is excluded entirely; no failed draft/log/summary is synthesis input.
- Candidate labels are randomized and do not reveal expert identity.

## Candidate artifact hashes
- Candidate A SHA256: `fc741d1183f1ae27aefcc905c43786b90aa21e9b0cf0a30df29b3578067f02bd`
- Candidate B SHA256: `23f7176df2f5c27b51584cd2e699e3aa464aab675403066cd5a2d819b465f952`
- Candidate C SHA256: `a18aeedb94983b0f60db0f0b17b0ca7220a6b964b8a49aef8cd8f3418d47b66c`

## Post-expert Owner clarification â€” authoritative for final synthesis
After expert fan-out completed, Owner clarified the BK01 migration intent. This does not change the central architecture question; it tightens the required BK01 compatibility destination.

Required interpretation:
- BK01 remains protected from forced rewrite now.
- Existing BK01 billing is a capability baseline/reference implementation, not the shared core itself.
- Build the shared Billing Core as a capability superset of the reusable BK01 billing capabilities plus the multi-product capabilities BK01 never needed.
- Do not copy BK01-specific assumptions such as `shop_id`, `shop_users`, Basic/Pro, Booking entitlement rules, or monthly-only semantics into generic core contracts.
- New Products must use the shared core natively.
- BK01 should converge later through a central facade/adapter first, then capability-by-capability extraction only after parity, isolation, reconciliation, rollback, and regression evidence pass.
- Eventual target is one product-facing billing pattern for all WSTERA Products, while Product-specific business entitlement remains Product-owned.
- BK01 merchant/customer PromptPay deposits remain a separate financial domain and must never be merged into WSTERA SaaS subscription billing.

Owner Addendum source SHA256: `69f30453310eae1de5791ede2bb8c8d2529eec6b0f58d02a40fa26e552376965`.

Codex must synthesize from only the frozen brief, Candidate A/B/C, and this identity-safe manifest. Do not inspect raw expert files, audit mapping, task logs, prior failed output, or unrelated Council artifacts.
