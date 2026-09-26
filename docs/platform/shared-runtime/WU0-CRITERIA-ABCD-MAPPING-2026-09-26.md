# WU-0 — ตารางเกณฑ์ (ก)–(ง) → งานที่มีอยู่ → สถานะ → เหลืออะไร

Task: `HOUSE-SHARED-RUNTIME-LANE-B-CLOSURE-001`
Unit: **WU-0 (อ่านอย่างเดียว — ยังไม่ลงมือ)**
บันทึก: 2026-09-26 · โดย Hermes (Windows) · controller/state-holder — mechanical record
บรีฟ: `06-Agent-Logs/WSTERA-House/briefs/BRIEF-HOUSE-LANE-B-RESUME-4-CRITERIA-2026-09-26.md` (Owner ล็อกเกณฑ์ 4 ข้อ)
เริ่มจากสถานะล่าสุด: `LANE_B = BLOCKED_SHARED_SURFACE_COLLISION / B0.2_RETRY_HELD` (2026-09-25) — ไม่ใช่ไฟล์ 09-22

> ทุกข้อความในตารางนี้ผูกกับหลักฐานบนดิสก์/repo ที่ระบุ path+revision · ข้อที่เป็นการตีความผมกำกับ `[ตีความ]` และข้อที่ยังพิสูจน์ไม่ได้กำกับ `[ยังไม่พิสูจน์]`

---

## 0. สถานะจริงที่วัดได้ตอนนี้ (2026-09-26)

| # | สิ่งที่วัด | ค่า |
|---|---|---|
| S1 | claim ของงานนี้ | `HOUSE-LANE-B-4CRIT__hermes__20260926T123516Z` push แล้ว (vault `048ebe4`) · ไม่มี claim อื่นใน Task ID นี้ |
| S2 | vault ที่เคยชนกัน (`hermes-native-vault`) | สะอาด · `git status --porcelain` = ว่าง · tip `d20d859` · remote parity ตรง |
| S3 | planning branch `work/house-lane-b-longrun-plan-20260922` | tip local = remote = `3b228e44e64b8affdb0b21a68c6ca76a2f9cb6c6` · worktree clean |
| S4 | execution branch `work/house-h3d-h5-20260909` | tip local = remote = `53346383faa2a87fac483a7a3bf5233a200e295d` · worktree clean |
| S5 | tooling offline ของ Lane B | `npm run selftest` **exit 0** · `h3d/sql-static-check.mjs` **exit 0** · `git diff --check` **exit 0** (รันซ้ำเองวันนี้) |
| S6 | เครื่องนี้มีความสามารถรัน LAB ไหม | **ไม่มี** `psql` · `pg_dump` · `docker` ใน PATH (รัน `which` แล้วไม่พบทั้งสาม) → ทุกอย่างที่ต้องต่อ LAB ต้องใช้ช่องทางอื่น/มีคนรันให้ |
| S7 | scanner ที่ทำให้ B0.2 ค้าง — canonical ปัจจุบัน | `skills/kanban-external-agent-dispatch/scripts/direct_external_executors.py` @ `73d274d9b2e03f75…` มีทั้ง `HARNESS_EVIDENCE_ROOTS=('.secretary-relay',)` และ `_is_fixture_shaped_phrase` |
| S8 | scanner ที่รันจริง (installed) | `data/skills/devops/kanban-external-agent-dispatch/scripts/direct_external_executors.py` @ `c29d09a061dd6edc…` — **ไม่มี** `_is_fixture_shaped_phrase` (0 hits) และ `execution_proof.py` ยังเป็น `b5a3bf83…` (pre-fix) ⇒ **canonical ≠ installed** |
| S9 | การชนกันของ surface (09-25) | ผู้เขียน protected skill รายอื่น **commit ไปแล้ว** `4262125` (Option C) — ไม่มี session เขียนไฟล์นั้นอยู่ตอนนี้ ⇒ เหตุที่ทำให้ `B0.2_RETRY_HELD` **หมดไปแล้ว** |

---

## 1. ตารางหลัก — เกณฑ์ (ก)–(ง) → งานที่มี → สถานะ → เหลืออะไร

### (ก) role ของโปรดักต์ A อ่าน/เขียน schema ของโปรดักต์ B ไม่ได้

| # | งานที่มีอยู่แล้ว | หลักฐาน (path @ revision) | สถานะ | เหลืออะไร |
|---|---|---|---|---|
| ก-1 | H1 effective-privilege inventory — วัดว่า role ของ PS01 ทุกตัวไม่มี USAGE บน `local_service`/`mt01`/`mt01_private`/`auth`/`storage` | `docs/platform/shared-runtime/evidence/H1-EFFECTIVE-PRIVILEGE-INVENTORY-2026-09-08.md` §Healthy Boundaries · `H3D-BASELINE-INVENTORY-2026-09-09.json.queries.effective_authority` | **มีหลักฐานวัดแล้ว** (4 role ของ PS01: `local_service_usage=false`) — แต่เป็นฝั่ง PS01 เท่านั้น | ต้องวัดฝั่ง A **และ** B ตามที่เกณฑ์เขียน (ในกรอบนี้ = BK01 ↔ PS01) |
| ก-2 | H5 preservation probes — BK01 (`local_service`) / MT01 baseline + "no `bk01_*` role", "`local_service_internal` absent" | `evidence/H5-BK01-MT01-READONLY-PROBES-2026-09-09.sql` · `evidence/H5-EXISTING-PRODUCT-REGRESSION-2026-09-09.md` §2–3 | **มีไฟล์แล้ว ยังไม่มีผลรัน** (`____` ทุกช่อง — ไฟล์นี้เป็น TEMPLATE) | ต้องมีคนรันบน LAB และกรอกผล |
| ก-3 | Bootstrap ของ BK01 มี boundary check ในตัว: ปฏิเสธถ้า `bk01_migrator`/`_login` มี `ps01`/`ps01_internal` USAGE หรือ `public CREATE` | `runtime/worktrees/bk01-r4-r5-20260922/supabase/shared-runtime/bk01-platform-bootstrap.sql:150-170` | **มีโค้ด** (static) | ไม่มีหลักฐานรันบน LAB (Junction A ไม่เคยผ่าน A2) |
| ก-4 | Lane-B six-layer effective-reach primitives + `checkForbiddenReachW` (L2∧L3, qualified identity/OID) + per-stage allowlist | `tools/shared-runtime/lib/six-layer-privileges.mjs` · `h3d/lane-b-gates.mjs` · `fixtures/lane-b-per-stage-allowlist.json` | **เขียนเสร็จ + selftest PASS** (offline) | ยังไม่เคยรันกับ ACL จริง — `--capture` exits 3 = deferred by design |
| ก-5 | **ช่องที่ยังไม่มีใครแตะ:** ฝั่ง BK01 **app runtime** ใช้ `service_role` (project-wide admin) 13 call sites | `apps/booking-{consumer,admin}/src/lib/supabase-admin.ts` (`SUPABASE_SERVICE_ROLE_KEY`, `schema:'local_service'`) · importers 4 ไฟล์ | **ยังไม่ทำ** — เป็น Gate 6 ของ assessment (`Bound BK01 privileged runtime`) | ตราบใดที่ BK01 ยังใช้ `service_role` ข้อ (ก) **ปิดไม่ได้จริง** เพราะ `service_role` เห็นได้ทุก schema `[ตีความจาก H1: service_role = project-wide]` |

**สรุป (ก):** มีเครื่องมือวัดครบ (ก-1/ก-3/ก-4) แต่ (ก) เป็น **FAIL โดยข้อเท็จจริงที่วัดได้**: BK01 ยังรันด้วย `service_role` และ bootstrap ในมือยัง**สร้าง direct DB LOGIN** ที่ H2 ห้ามไว้ — ยังไม่มี artifact ไหนพิสูจน์ (ก) ได้

---

### (ข) migration ของ A ไม่ทำฟังก์ชันของ B พัง (สาเหตุที่ Junction A ของ BK01 FAIL)

| # | งานที่มีอยู่แล้ว | หลักฐาน | สถานะ | เหลืออะไร |
|---|---|---|---|---|
| ข-1 | หลักฐานรากของความพัง (ของ BK01 ไม่ใช่ PS01): ownership transfer → `bk01_migrator` ไม่มี schema `auth` USAGE → `local_service.is_shop_member()` ตอบ `42501 permission denied for schema auth` | `bk01-r4-r5-20260922/docs/audit/BK01-SHARED-RUNTIME-JUNCTION-A-FAILURE-EVIDENCE-2026-09-08.md` §A2 Failure 1 | **พิสูจน์แล้ว (รันจริง 2026-09-08)** | ต้องแก้ที่ **BK01 bootstrap** — และมันยังไม่ถูกแก้เลย |
| ข-2 | **bootstrap blob ไม่เปลี่ยนตั้งแต่ FAIL** | blob `e49f3e2:…bootstrap.sql` = `f2562baa450079b0…` **เท่ากับ** `HEAD:…bootstrap.sql` · `git log` ไฟล์นี้มี commit เดียว (`4a694bc` 2026-09-08) | **ยังไม่ remediate** | นี่คือช่องที่ตรงกับ (ข) ตรง ๆ — งานเดียวที่ยังไม่มีเจ้าภาพ |
| ข-3 | รากเชิงกลไก (วัดจาก source): **16 ฟังก์ชัน** ของ `local_service` ถูกโอนไป `bk01_migrator` แล้วยังเรียก `auth.uid()` (ไม่นับ 3 signature ที่ bootstrap ยกเว้น) | parse จาก `supabase/migrations/*.sql` (60 ฟังก์ชันสุดท้าย · 17 ตัวเรียก `auth.*` · 16 ตัวเรียก `auth.uid()`) | **วัดแล้ว** | ต้องเลือกรูป remediate (ดู §4 ทางเลือกที่จอดไว้) |
| ข-4 | `verify-bk01-shared-runtime.mjs` ตรวจแค่ "ห้ามแตะ `ps01.`" — ไม่มี gate เรื่อง `auth` USAGE หรือ ownership-vs-auth | `bk01-r4-r5/scripts/verify-bk01-shared-runtime.mjs:40` | **มี gate บางส่วน** | ต้องเพิ่ม gate/หลักฐานเรื่อง ownership + auth dependency |

**สรุป (ข):** งานที่ต้องใช้ **คือแก้ `bk01-platform-bootstrap.sql`** (หรือออกแบบใหม่) แล้วพิสูจน์ซ้ำ — ของเดิมยังพังอยู่ 100% และไม่มีใครแตะไฟล์นี้ตั้งแต่ 09-08

---

### (ค) `pg_net`/`cron` ที่รั่วผ่าน PUBLIC ต้องถูกปิดที่ขอบเขตการรัน

| # | งานที่มีอยู่แล้ว | หลักฐาน | สถานะ | เหลืออะไร |
|---|---|---|---|---|
| ค-1 | H1 วัด ACL จริง: `net` schema USAGE = PUBLIC, `net._http_response`/`http_request_queue` = 7 สิทธิ์ PUBLIC, sequence = SELECT/USAGE/UPDATE; 12 ฟังก์ชัน `net.*` EXECUTE ได้ | `evidence/H1-EFFECTIVE-PRIVILEGE-INVENTORY-2026-09-08.md:55-77` · `H3D-BASELINE-INVENTORY…json.queries.public_managed_acls` (18 rows) | **พิสูจน์แล้ว** | — |
| ค-2 | H2 ตัดสินใจแล้ว: **neutralize ที่ execution boundary** ไม่แตะ managed ACL · canon = product role เป็น **NOLOGIN** · ไม่มี direct DB login | `DESIGN-H2-SHARED-RUNTIME-ISOLATION-EXECUTION-BOUNDARY-2026-09-08.md` §Decision, §Security Invariants 2–3 | **ล็อกแล้ว (ดีไซน์)** | — |
| ค-3 | หลักฐานว่า "ขอบเขตการรัน" ปิดได้จริง: H3C live proof **36 probe PASS** — `NEG-NET-1`, `NEG-NET-1b`, `NEG-CRON-1`, `NEG-AUTH-1`, `NEG-WPI-1`, `NEG-LS-1`, `NEG-MT-1` = explicit denial ทั้งหมด | `evidence/H3C-FINAL-LIVE-PROOF-ATTEMPT2-2026-09-09.json` (verdict=PASS) · `H3C-FINAL-CLOSURE-2026-09-09.md` | **PASS บน PS01 (2026-09-09)** | เป็นหลักฐานของ PS01 · ไม่ใช่ของ BK01 |
| ค-4 | ลบ custom PUBLIC รั่ว (`public.rls_auto_enable()`) — apply + verify แล้ว | `migrations/h3c_public_rls_auto_enable_acl_hardening.sql` · `evidence/H3C-H08-PUBLIC-RPC-BOUNDARY-POST-APPLY-2026-09-08.md` | **apply บน LAB แล้ว + PASS** | — (ส่วน `net`/`cron` ของ Supabase เอง ไม่ได้แตะโดยเจตนา) |
| ค-5 | **ช่องที่ยังไม่มี:** BK01 ไม่มีหลักฐาน execution-boundary แบบ H3C เลย — bootstrap ยังสร้าง `bk01_migrator_login` (LOGIN) | bootstrap `:13-14` · H2 invariant "no future `bk01_migrator_login`" | **ขัดกับ H2 · ยังไม่ remediate** | ต้องตัด LOGIN นั้นออก/แทนด้วยเส้น Data API แบบ H2 แล้วพิสูจน์ negative probes ชุดเดียวกับ H3C |
| ค-6 | `pg_net`/`cron` ถูก "ปิดที่ขอบเขตการรัน" สำหรับ BK01 หรือยัง | ไม่มี artifact | **ยังไม่มี** | งานนี้ยังไม่มีเจ้าภาพ — ตรงกับ (ค) |

**สรุป (ค):** กลไกพิสูจน์มีครบและเคย PASS บน PS01 (ค-3/ค-4) แต่ **BK01 ยังไม่มี** และ bootstrap ยังฝ่าฝืน H2 (ค-5) ⇒ (ค) ยังเป็น FAIL สำหรับ BK01

---

### (ง) รัน migration ไปข้างหน้าของ BK01 ซ้ำบน LAB แล้ว PS01 ยังทำงานได้

| # | งานที่มีอยู่แล้ว | หลักฐาน | สถานะ | เหลืออะไร |
|---|---|---|---|---|
| ง-1 | Migration ไปข้างหน้าของ BK01 ล็อกอยู่ (ยังไม่ apply) — stream `supabase/bk01-migrations/` มี 1 ไฟล์ | `house-swarm-1-wuc-db @ 4ee39be`: `supabase/bk01-migrations/20260926120000_bk01_entitlement_packs.sql` (2,165 บรรทัด) | **เขียนเสร็จ · policy check PASS วันนี้ (`node scripts/check-bk01-migration-policy.mjs` → 1/1 accept)** | รอ apply (ต้องมี LAB window) |
| ง-2 | ลำดับ apply ที่วางไว้: apply **ได้เฉพาะเมื่อ Lane B ผ่าน** | `BRIEF-HOUSE-SWARM-1-ADDENDUM-B…` ข้อ 2 · `ADDENDUM-D` · `STATUS-HOUSE` Log 09-26 | **ล็อกแล้ว** | — |
| ง-3 | หลักฐานว่า PS01 ไม่พังหลังของ A แตะ DB — มีแบบ **probe อย่างเดียว** | `evidence/H5-BK01-MT01-READONLY-PROBES.sql` §B5 `is_shop_member(nil)` · §4 `compare-inventory.mjs` vs `H3D-BASELINE-INVENTORY` | **ไฟล์พร้อม · ยังไม่รัน** | ต้องมีคนรัน + เก็บ signature |
| ง-4 | Regression เต็มของ PS01 (browser/staff/LINE smoke) | `evidence/H5-EXISTING-PRODUCT-REGRESSION-2026-09-09.md` §1 (ทุกช่อง `____`) · PS01 worktree `ps01-h3d-data-api-20260909 @ c169e5d` | **TEMPLATE เท่านั้น** | H3D live smoke ของ PS01 เองก็ยัง **BLOCKED** (ต้อง toggle hosted Auth hook) ⇒ ง-4 แขวนอยู่บน ง-5 |
| ง-5 | PS01 live smoke ทำไม่ได้เพราะต้องมีคนเปิด Custom Access Token Hook ใน Dashboard | `evidence/H3D-LIVE-ACTION-REQUIRED-2026-09-09.md` §2–3 | **BLOCKED (operator)** | ต้องมี Owner/operator ทำ 2 toggle — **เข้าเงื่อนไข "หยุดถาม Owner"** |
| ง-6 | BK01 migration runner: บังคับ login เป็น `bk01_migrator_login` + ตรวจ `ps01_usage`/`local_service` owner ก่อน apply | `scripts/bk01-migrate.mjs:28-33, 89-118` | **มีโค้ด** | โค้ดนี้จะ **fail ทันที** ถ้า bootstrap ในมือถูก apply (ยังไม่มี `bk01_migrator_login`) — และถ้า apply bootstrap เดิม PS01/PS01 ยังไม่พัง แต่ BK01 ตัวเองพัง ⇒ ง ต้องรอ ข |

**สรุป (ง):** ตัว migration พร้อมพอสมควร (ง-1) แต่ **ง ยังพิสูจน์ไม่ได้ตอนนี้ เพราะ 3 เหตุ:** (1) `psql`/`pg_dump` ไม่มีบนเครื่องนี้ (S6) (2) PS01 live smoke ยัง BLOCKED (ง-5) (3) BK01 bootstrap ยังพัง (ข-2) ทำให้ "ของ A" ที่จะรันยังไม่ควรขึ้น

---

## 2. งานที่ "ไม่จำเป็นต่อ 4 ข้อ" → จอด (พร้อมเหตุผล)

| # | งาน | เหตุผลที่จอด |
|---|---|---|
| J-1 | **B0.2 / B0.3 + repair ladder ของ `execution_proof` + scanner** (ทั้งสาย Relay-tooling) | เป็นเรื่อง**เครื่องมือ agent ไม่ใช่ขอบเขตการรันของ LAB** — ไม่ช่วยข้อไหนใน (ก)–(ง) · หลักฐาน: `REPAIR1-…` gate 10/10 PASS, focused Codex review `APPROVED` แล้ว (`BLOCKER-SHARED-SURFACE-COLLISION…` §1) และเหตุที่ค้าง (การชนกัน) **หมดไปแล้ว** (S9) ⇒ ไม่ใช่ blocker ของ 4 ข้อ |
| J-2 | Non-BUILD scope guard ที่ **ไม่ยอมรับ deliverable ที่เป็นไฟล์** (`write_scope` ไม่ถูกอ่าน) | ช่องของ **harness** เท่านั้น · บรีฟตัดขอบเขตข้อ 2 บอกให้ใช้ทางลัดได้ · ไม่เกี่ยวกับ LAB |
| J-3 | **B1/B3 ของ dual-lane brief (`BRIEF-HOUSE-DUAL-LANE-CONVERGENCE-2026-09-24.md`)** — R2 review + live checkpoints H3D-A1/H3D-LIVE/H3E/H4 | เป็น**สายเก่า**ที่ใหญ่กว่า 4 ข้อ (ต้องผ่าน R2 + H3D-A1/LIVE/H3E/H4) · บรีฟปัจจุบันตัดเหลือ 4 ข้อ ⇒ B1/B3 จอด · หลักฐาน: dual-lane §6 "Lane B terminal criteria" |
| J-4 | H3E (retire `ps01_runtime_login`) + H4 (disposable product) + H5 เต็มรูป | เกิน 4 ข้อ · H3E เป็นการ**แก้ role บน LAB** ซึ่งเข้าเงื่อนไขหยุดถาม Owner อยู่แล้ว · H4/H5 เป็นของสาย HOUSE-A เดิม |
| J-5 | PS01 LINE runtime proof ด้วย JWT (H3C/H3D live smoke เต็มรูป) | **ไม่จอดทั้งหมด** — ใช้เป็นหลักฐานของ (ง) ได้ · แต่ "เต็มรูป" (submit RPC, LINE identity จริง) จอด เพราะเกินความจำเป็น · ใช้เฉพาะ context/quote + negative matrix |

---

## 3. งานที่ต้อง**ทำ** เพื่อปิด 4 ข้อ — เรียงตามลำดับที่ต้องเดิน

| ลำดับ | งาน | ปิดข้อ | ต้องมี Owner? | หมายเหตุ |
|---|---|---|---|---|
| **1** | **แก้/ออกแบบใหม่ `bk01-platform-bootstrap.sql`** ให้ (i) ไม่สร้าง direct DB LOGIN (H2 invariant) (ii) ฟังก์ชันที่เรียก `auth.uid()` ยังทำงานได้หลัง ownership transfer (16 ตัว) | (ข) เป็นหลัก, ปลด (ก)(ค)(ง) | ❌ ไม่ (source-only) | **งานวิกฤตที่ยังไม่มีเจ้าภาพ** · ห้าม merge branch · ต้องมี pre/post signature + Booking regression probe |
| **2** | กำหนด **BK01 runtime identity** แทน `service_role` (Gate 6) + execution-boundary negative probes ชุดเดียวกับ H3C | (ก), (ค) | ❌ ไม่ (source) / ✅ ใช่ ตอนสร้าง role บน LAB | ถ้าไม่ทำ (ก) ปิดไม่ได้ |
| **3** | ทำ **H5 probe pack** ให้เป็นของ BK01+PS01 (ไม่ใช่ template) + ระบุวิธีรันเมื่อไม่มี `psql` | (ก),(ง) | ❌ ไม่ | ต้องแก้ปัญหาข้อ S6 ก่อน |
| **4** | **LAB live window**: apply bootstrap ใหม่ → apply BK01 forward migration → negative probes → PS01 regression → snapshot เทียบ | (ก),(ข),(ค),(ง) | ✅ **ต้องขอ Owner** (role/grant/Auth/window) | ยังทำไม่ได้จนกว่า 1–3 เสร็จ |
| **5** | รายงานเดียว PASS/FAIL ต่อข้อ + raw evidence · ตัดสินโดยคนละ agent กับผู้ลงมือ | ทั้ง 4 | ❌ ไม่ | บรีฟข้อ 4 |

---

## 4. จุดที่ต้องตัดสินใจ (ผมไม่ตัดเอง)

1. **(ข) รูป remediate** — มีอย่างน้อย 3 ทาง: (a) ไม่โอน ownership ของฟังก์ชันที่พึ่ง `auth.*` (คงไว้ `postgres`), (b) `GRANT USAGE ON SCHEMA auth` แล้วพิสูจน์ว่า grant ติดจริงบน managed schema (Junction A พบว่า "ไม่ติด"), (c) ย้าย 16 ฟังก์ชันไปเรียกผ่าน RPC ที่ไม่ต้องพึ่ง `auth.*` — **ทั้งสามทางแก้ security contract** ⇒ ตามบรีฟข้อ "หยุดถาม Owner" และ Lane-B contract §8.9
2. **`bk01_runtime` role** — policy validator allowlist ชื่อ `bk01_runtime` ไว้แล้ว (`scripts/lib/bk01-migration-policy.mjs`) แต่ยังไม่มี role นี้จริง ⇒ ต้องตัดสินว่า (ค)/(ก) จะปิดด้วย role นี้หรือแบบ H3C (`ps01_line_runtime` แบบ NOLOGIN + hook)
3. **จะทำ BK01 (ข) ก่อน หรือทำ PS01 live smoke (ง-5) ก่อน** — ผมเสนอ: **(ข) ก่อน** เพราะเป็น source-only ไม่ต้องรอ Owner และเป็นสาเหตุ Fail ของ Junction A

---

## 5. ข้อที่ผมยืนยันไม่ได้ (ยังไม่พิสูจน์)

- (ก) ระดับ **BK01 ↔ PS01** — ไม่มีหลักฐานวัดฝั่ง BK01 เลย (มีแต่ฝั่ง PS01)
- (ข) — ไม่มี artifact ไหนพิสูจน์ว่า remediate แล้ว (bootstrap blob ยังเท่าเดิม)
- (ค) — ไม่มีหลักฐาน execution-boundary ของ BK01
- (ง) — ไม่เคย apply migration ไปข้างหน้าของ BK01 บน LAB เลย (ยังล็อก)
- ข้อที่ 4 ของบรีฟ ("ตัดสินโดยคนละ agent กับผู้ลงมือ") — ยังไม่ได้ตกลงว่าใครเป็น reviewer

## 6. Non-claims

WU-0 นี้ **อ่านอย่างเดียว** — ไม่มีการเชื่อม LAB, ไม่มี DB contact, ไม่สร้าง/ลบ role หรือ grant, ไม่แตะ Auth, ไม่ apply migration, ไม่ deploy, ไม่แตะ `gyleqrjdzwwlqierdwcy`, ไม่แตะไฟล์ของ session อื่น, ไม่ merge branch
ที่รันจริงมี 3 คำสั่ง offline บน execution worktree (S5) + `node scripts/check-bk01-migration-policy.mjs` (read-only static) + probe scanner ในหน่วยความจำ (อ่านไฟล์ canonical เท่านั้น ไม่เขียนอะไร)

## 7. Evidence index

| Artifact | Path / ค่า |
|---|---|
| บรีฟ 4 ข้อ | `vault/06-Agent-Logs/WSTERA-House/briefs/BRIEF-HOUSE-LANE-B-RESUME-4-CRITERIA-2026-09-26.md` |
| claim | `vault/06-Agent-Logs/_claims/HOUSE-LANE-B-4CRIT__hermes__20260926T123516Z.md` @ vault `048ebe4` |
| Junction A FAIL | `bk01-r4-r5-20260922/docs/audit/BK01-SHARED-RUNTIME-JUNCTION-A-FAILURE-EVIDENCE-2026-09-08.md` |
| bootstrap (ไม่เปลี่ยนตั้งแต่ FAIL) | blob `f2562baa450079b0fa17987b91299caeec603e9b` (@`e49f3e2` = @HEAD) |
| H2 design | `house-lane-b…/docs/platform/shared-runtime/DESIGN-H2-…-2026-09-08.md` |
| H1 ACL inventory | `evidence/H1-EFFECTIVE-PRIVILEGE-INVENTORY-2026-09-08.md` |
| H3C live proof (36 PASS) | `evidence/H3C-FINAL-LIVE-PROOF-ATTEMPT2-2026-09-09.json` |
| H3D/H5 template | `evidence/H3D-LIVE-ACTION-REQUIRED-2026-09-09.md` · `evidence/H5-EXISTING-PRODUCT-REGRESSION-2026-09-09.md` |
| BK01 forward migration | `house-swarm-1-wuc-db @ 4ee39be` · `supabase/bk01-migrations/20260926120000_bk01_entitlement_packs.sql` |
| canonical vs installed scanner | canonical `73d274d9…` · installed `c29d09a0…` |
| tooling offline gates | `npm run selftest` exit 0 · `sql-static-check.mjs` exit 0 · `git diff --check` exit 0 |
