ปิด B5 R5 finding แล้ว และยืนยันว่า reviewer ถูกต้องตาม source เดิม

แก้ไข:

- [control-plane.test.ts](D:/AI-Workspace/projects/saas-product-hub/apps/hub-web/server/control-plane/control-plane.test.ts)
  - external imports ถูกเก็บใน closure และต้องอยู่ใน explicit allowlist
  - เพิ่ม guard สำหรับ `fetch(` และ HTTP client imports
  - เพิ่ม mutation probes:
    - undeclared external import
    - generic outbound `fetch`
  - probes เดิม direct DB, neutral helper, provider ยังผ่านตามคาด
  - ปรับ test claim ให้จำกัดอยู่ที่ static import closure

- [CONTROL-READ-CORRELATION-DESIGN-2026-09-20.md](D:/AI-Workspace/projects/saas-product-hub/apps/hub-web/docs/control-plane/CONTROL-READ-CORRELATION-DESIGN-2026-09-20.md)
  - ระบุขอบเขต proof ชัดเจน
  - dynamic imports, runtime DI และ bundler substitution อยู่นอก proof

Gates:

```text
npx tsc --noEmit
Exit code: 0
```

```text
npx vitest run
Test Files 25 passed (25)
Tests 366 passed (366)
Exit code: 0
```

`git diff --check` ผ่าน และแก้เฉพาะสอง path ที่ได้รับอนุญาต ไม่มี deploy, migration, Cloudflare หรือ database access.