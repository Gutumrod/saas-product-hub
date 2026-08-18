# SaaS Product Hub — Enterprise Features Integration Brief (2026-08-16)

## Objective

`modules-hub/modules/enterprise-features` (CircuitBreaker + Tracer) was verified empty on an earlier check. It is not empty anymore — it was completed on 2026-08-14 and is marked `✅ Completed v0.3.0` in `modules-hub/modules/REGISTRY.md`. Two documents in this repo (`saas-product-hub`) still assert the old "empty module" finding and block `multi_tenant_ai` from claiming the feature. Bring both documents back in sync with reality, copy the module into the one product that was blocked on it, and leave the commercial-readiness call to a human — do not self-approve it.

## Verified baseline — do not assume a newer state

- `modules-hub` repo: `D:\AI-Workspace\projects\modules-hub`
- `modules-hub/modules/enterprise-features/` contains real, tested source: `core/circuit-breaker.ts` (86 lines, full CLOSED/OPEN/HALF_OPEN state machine + config validation), `core/tracer.ts` (51 lines, `NoopTracer` + `MemoryTracer`), `core/types.ts`, `index.ts`, `MODULE.md`, `DESIGN.md`, `examples/integration.example.ts`, unit tests for both (`tests/unit/circuit-breaker.test.ts`, `tests/unit/tracer.test.ts`), `package.json`, `VERSION` = `0.3.0`.
- Last commit touching that folder: `b1cbf83` (`chore: synchronize v0.3.0 module metadata`), dated 2026-08-14 09:00 +0700.
- `modules-hub/modules/REGISTRY.md` row 21 lists `Enterprise Features | enterprise-features | P1 | ✅ Completed | 0.3.0` — same status tier as every other finished module.
- `saas-product-hub/products/multi-tenant-ai/modules/` currently has 5 copied modules only: `ai-provider`, `auth-supabase`, `payment`, `subscription`, `tenant-context`. **No `enterprise-features` folder exists there.**
- `saas-product-hub/products/multi-tenant-ai/` has no application source outside `modules/` and `BRIEF.md` — this product is still at the "modules copied, not yet assembled into an app" stage. Do not invent app wiring that does not exist; scope is limited to making the module available and correcting the docs.
- Stale claim #1 — `saas-product-hub/products/multi-tenant-ai/BRIEF.md` lines 13–14 and 18 (full current text, do not paraphrase from memory, re-read the file before editing — it may have changed):
  ```
  - **`enterprise-features` (CircuitBreaker + UniversalTracer/OpenTelemetry) ไม่ได้ก็อปมา เพราะ module ว่างเปล่า** — เช็คแล้วโฟลเดอร์นี้ใน modules-hub มีแค่ `package-lock.json` 6 บรรทัด ไม่มีซอร์สโค้ดจริงเลย (commit ที่บอกว่า "เพิ่มแล้ว" ไม่ได้ commit โค้ดจริงมาด้วย)
  - แปลว่า blueprint เดิมที่พูดถึง "distributed tracing" ในไอเดียนี้ **ทำไม่ได้จนกว่าจะเขียน enterprise-features ขึ้นมาใหม่** — ถ้าจะขายเป็น "starter kit" ตอนนี้ ตัด tracing claim ออกจากบรีฟ หรือ scope แยกเป็นงานเขียนใหม่ต่างหาก
  ...
  - [ ] MVP scope (ไม่มี tracing ในเวอร์ชันแรก)
  ```
- Stale claim #2 — `saas-product-hub/docs/products/registry.yaml`, `multi_tenant_ai` entry: `modules:` list (lines ~156–159) omits `enterprise-features`; inline comment above `acceptance:` (lines ~160–162) says the module "is empty in modules-hub" and that the tracing claim must stay cut from the pitch.

Before any edit, re-run at least:

```powershell
git -C D:\AI-Workspace\projects\modules-hub status --short --branch
git -C D:\AI-Workspace\projects\saas-product-hub status --short --branch
```

If either working tree is dirty in a way that conflicts with this brief, or `modules-hub/modules/enterprise-features` no longer matches the baseline above, stop and report to the user/coordinator before editing. Do not overwrite another agent's in-progress work.

## Non-negotiable rules

1. `modules-hub` is a copy-and-own source library (see its own `INDEX.md`). **Never edit anything inside `modules-hub/modules/enterprise-features` to make it fit `multi-tenant-ai`.** Copy the folder out, then modify only the copy.
2. Copy the entire `enterprise-features` module folder verbatim (`core/`, `index.ts`, `MODULE.md`, `DESIGN.md`, `examples/`, `tests/`, `package.json`, `tsconfig.json`, `VERSION`) — do not cherry-pick individual files.
3. Do not add a relative import from `enterprise-features` into any other module folder, or vice versa. It must stay independently copyable.
4. Do not flip `acceptance.commercial` from `false` to `true` for `multi_tenant_ai` in `registry.yaml`. That gate covers more than this one module (see the other three `acceptance` fields still `false`/mixed for this product) — leave it as-is and let the user/coordinator make that call explicitly once the module is in place.
5. Do not touch `products/multi-tenant-ai/modules/{ai-provider,auth-supabase,payment,subscription,tenant-context}` — out of scope for this brief.
6. Do not run `npm ci`, upgrade dependencies, or regenerate lockfiles outside the copied module's own `package-lock.json`.
7. Do not push to `origin` on either repo. Local commit only; push is a user-authorized action.

## Work packages

### A. Copy the module into the product

**Allowed paths**
- Read from: `D:\AI-Workspace\projects\modules-hub\modules\enterprise-features\`
- Write to: `D:\AI-Workspace\projects\saas-product-hub\products\multi-tenant-ai\modules\enterprise-features\`

**Required change**
```powershell
Copy-Item -Recurse -Path "D:\AI-Workspace\projects\modules-hub\modules\enterprise-features" -Destination "D:\AI-Workspace\projects\saas-product-hub\products\multi-tenant-ai\modules\enterprise-features"
```
Then, inside the copy only: read `MODULE.md` and `examples/integration.example.ts` (already describe the intended usage pattern — `CircuitBreaker.execute()` wrapping a call, `MemoryTracer`/`NoopTracer` for spans). Do not write new integration code into the product's own app layer — there is no app layer yet in this product. The module being present and typechecking/testing clean in place is the deliverable for this package.

**Acceptance**
```powershell
Push-Location "D:\AI-Workspace\projects\saas-product-hub\products\multi-tenant-ai\modules\enterprise-features"
npm install
npm run typecheck
npm test
Pop-Location
```
Both must pass with the same results as the source module in `modules-hub` (circuit-breaker + tracer unit tests green, 0 type errors).

### B. Correct `products/multi-tenant-ai/BRIEF.md`

**Allowed paths**
- `saas-product-hub/products/multi-tenant-ai/BRIEF.md`

**Required change**
- Re-read the file fresh (line numbers above are from the 2026-08-16 verification pass and may have shifted).
- Update the `## Modules ที่ก็อปมา` list to add `enterprise-features` (with a short description matching `MODULE.md`'s scope line: "CircuitBreaker + Tracer contracts, framework-agnostic, no OpenTelemetry adapter yet").
- Replace the `## ⚠️ รู้ไว้ก่อนเขียนบรีฟ` section's two bullets — the "module ว่างเปล่า" finding is no longer true. State plainly that the module was completed 2026-08-14 (v0.3.0) and has been copied in as of this brief. Keep the caveat that `MODULE.md` itself states: it does **not** include an OpenTelemetry adapter — `MemoryTracer`/`NoopTracer` are the only implementations shipped, so any "distributed tracing" marketing claim still needs a host-written OTel adapter before it's true, not just the module's presence.
- Update the top `**สถานะ:**` line — it currently reads "พร้อมแต่ตัดฟีเจอร์ออก 1 อย่าง" (ready but with one feature cut). Reword to reflect the module is now available, without asserting the product is commercially ready (that's package C's call, not this brief's).
- Update the `- [ ] MVP scope (ไม่มี tracing ในเวอร์ชันแรก)` TODO line to drop the "ไม่มี tracing" parenthetical, or note it's now optional-include rather than blocked.

**Acceptance**
Manual read-through: no remaining sentence in the file claims the module is empty or unwritten.

### C. Correct `docs/products/registry.yaml`

**Allowed paths**
- `saas-product-hub/docs/products/registry.yaml`

**Required change**
- In the `multi_tenant_ai` entry's `modules:` list, add `- "enterprise-features"`.
- Replace the inline comment above `acceptance:` for this entry (currently says the module is empty and the tracing claim must stay cut) with a note that the module was completed 2026-08-14 and copied in on this date; commercial-readiness is still an open decision for a human (do not change `commercial: false` yourself — see rule 4).
- Update the file's top `# Last Updated:` header to `2026-08-16`.

**Acceptance**
```powershell
Push-Location "D:\AI-Workspace\projects\saas-product-hub"
python -c "import yaml; yaml.safe_load(open('docs/products/registry.yaml', encoding='utf-8'))" 2>$null; if ($LASTEXITCODE -ne 0) { Write-Output "INVALID YAML" } else { Write-Output "valid" }
Pop-Location
```
(Any working YAML linter/parser is fine if `python`/`pyyaml` isn't available locally — the point is the file must still parse after the edit.)

## Reporting back

When all three packages pass acceptance, report per-package pass/fail plus the exact diffs (git diff, not a summary) for `BRIEF.md` and `registry.yaml`, and the test/typecheck output for package A. Do not commit or push without the user's explicit go-ahead — leave the working tree ready for review.
