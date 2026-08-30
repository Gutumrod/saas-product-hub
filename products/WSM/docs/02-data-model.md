# WSM — WSTERA Supply Management — Data Model (Schema) v1 — LEGACY DRAFT

**Product ID:** WS01

> ⚠️ **Status: NEEDS REVISION BEFORE IMPLEMENTATION** — North Star ถูกปรับใหม่เมื่อ 2026-08-29 ให้รองรับ Demand → Supply → Gap → Allocation → Fulfillment, Factory Commitment, Production Batch และ Product ↔ Supplier/Factory แบบ many-to-many
>
> เอกสารนี้เก็บไว้เป็น draft อ้างอิงเดิมเท่านั้น ห้ามใช้สร้าง migration/schema จริงจนกว่าจะทำ Phase Map และ Data Model v2

> ออกแบบให้รองรับ North Star (6 แกน) + multi-tenant + Phase 4 ตั้งแต่ต้น
> หลักการ: ทุกตารางมี `tenant_id` (RLS) ยกเว้นตารางระบบของ SaaS เอง
> Stack: Supabase (Postgres) + Drizzle ORM

---

## 0. หลักการออกแบบ

1. **ทุกตาราง business มี `tenant_id`** → RLS แยกข้อมูล tenant เด็ดขาด
2. **ตารางระบบ (SaaS-level)** ไม่มี tenant_id → ใช้จัดการ tenant/plan/บิล SaaS
3. **สกุลเงิน** เก็บเป็น 3 ฟิลด์: `currency` (สกุลซื้อ), `currency_rate` (อัตรา ณ วันนั้น), `amount_thb` (แปลงแล้ว) — กันปัญหา rate เปลี่ยน
4. **ทุกตารางมี** `id (uuid)`, `created_at`, `updated_at`
5. **Soft delete** (`deleted_at`) แทน hard delete — กันข้อมูลหาย
6. **Stock ใช้ ledger (Stock Card)** ไม่ใช่แค่ตัวเลข — กันสต๊อกมั่ว, audit ได้

---

## 1. ตารางระบบ (SaaS-level — ไม่มี tenant_id)

### `saas_tenants` — ผู้นำเข้าแต่ละราย (ลูกค้า SaaS)
| ฟิลด์ | type | หมายเหตุ |
|------|------|---------|
| id | uuid PK | |
| name | text | ชื่อบริษัท/แบรนด์ |
| slug | text unique | สำหรับ subdomain/URL |
| plan | enum | free / pro / enterprise |
| status | enum | trial / active / suspended / cancelled |
| max_dealers | int | จำกัดตาม plan |
| max_skus | int | จำกัดตาม plan |
| settings | jsonb | กติกาจัดสรร, order window, auto-release ชั่วโมง |
| created_at / updated_at | timestamptz | |

### `saas_tenant_users` — ผู้ใช้ของแต่ละ tenant (admin/ตัวแทน)
| ฟิลด์ | type | หมายเหตุ |
|------|------|---------|
| id | uuid PK | |
| tenant_id | fk → saas_tenants | |
| user_id | fk → auth.users | Supabase auth |
| role | enum | tenant_admin / dealer / sub_dealer |
| status | enum | invited / active / suspended |
| created_at / updated_at | | |

### `saas_subscriptions` — บิล/plan ของ SaaS
| ฟิลด์ | type | หมายเหตุ |
|------|------|---------|
| id | uuid PK | |
| tenant_id | fk | |
| plan | enum | |
| price | numeric | |
| billing_cycle | enum | monthly / yearly |
| status | enum | active / past_due / cancelled |
| started_at / renews_at | timestamptz | |

---

## 2. ตาราง business (มี tenant_id)

### 2.1 สินค้า

#### `products` — สินค้า (SKU)
| ฟิลด์ | type | หมายเหตุ |
|------|------|---------|
| id | uuid PK | |
| tenant_id | fk | |
| sku | text | รหัสสินค้า |
| name | text | ชื่อ |
| category | text | หมวด |
| unit | text | ชิ้น/กล่อง/คู่ |
| cost_currency | enum | CNY/USD/THB |
| cost_price | numeric | ราคาทุน |
| retail_price | numeric | ราคาขายปลีก |
| image_url | text | |
| is_active | bool | |
| created_at / updated_at | | |

#### `product_variants` — ตัวเลือกสินค้า (สี/ไซซ์)
| ฟิลด์ | type | หมายเหตุ |
|------|------|---------|
| id | uuid PK | |
| tenant_id | fk | |
| product_id | fk → products | |
| name | text | เช่น "สีแดง ไซซ์ M" |
| sku | text | variant sku |
| cost_price / retail_price | numeric | ราคา variant (override ได้) |
| created_at / updated_at | | |

#### `product_tier_prices` — ราคาตามระดับตัวแทน
| ฟิลด์ | type | หมายเหตุ |
|------|------|---------|
| id | uuid PK | |
| tenant_id | fk | |
| product_id | fk | |
| tier | enum | vip / main / sub |
| price | numeric | ราคาตัวแทนระดับนี้ |
| created_at / updated_at | | |

### 2.2 ตัวแทน

#### `dealers` — ตัวแทน
| ฟิลด์ | type | หมายเหตุ |
|------|------|---------|
| id | uuid PK | |
| tenant_id | fk | |
| user_id | fk → saas_tenant_users | ลิงก์ผู้ใช้ |
| name | text | ชื่อตัวแทน/ร้าน |
| tier | enum | vip / main / sub |
| parent_dealer_id | fk → dealers (nullable) | สายงานแม่ทีม (Phase 4) |
| credit_limit | numeric | วงเงินเครดิตเทอม (Phase 4) |
| credit_terms | int | จำนวนวันเครดิต (Phase 4) |
| is_active | bool | |
| created_at / updated_at | | |

#### `dealer_quotas` — โควตาตัวแทน (ต่อสินค้า/รอบ)
| ฟิลด์ | type | หมายเหตุ |
|------|------|---------|
| id | uuid PK | |
| tenant_id | fk | |
| dealer_id | fk → dealers | |
| product_id | fk → products | |
| quota_limit | int | เพดานที่สั่งได้ |
| quota_used | int | ใช้ไปแล้ว |
| period | text | เช่น "2026-09" หรือ "PO-xxx" |
| created_at / updated_at | | |

### 2.3 PO & สินค้าเข้า

#### `purchase_orders` — ใบสั่งซื้อ (PO)
| ฟิลด์ | type | หมายเหตุ |
|------|------|---------|
| id | uuid PK | |
| tenant_id | fk | |
| po_number | text unique | เลข PO |
| supplier | text | โรงงาน/ซัพพลายเออร์ |
| status | enum | draft / ordered / in_production / shipped / in_transit / customs / received / cancelled |
| order_date | date | วันที่สั่ง |
| production_days | int | ระยะเวลาผลิต |
| production_done_date | date | วันที่ผลิตเสร็จ (คำนวณ) |
| ship_date | date | วันที่ออกเรือ/บิน |
| eta_date | date | วันที่คาดว่าเข้าไทย |
| arrival_date | date | วันที่ถึงคลังจริง |
| cost_currency | enum | |
| total_cost | numeric | ต้นทุนรวม |
| notes | text | |
| created_at / updated_at | | |

#### `po_items` — รายการสินค้าใน PO
| ฟิลด์ | type | หมายเหตุ |
|------|------|---------|
| id | uuid PK | |
| tenant_id | fk | |
| po_id | fk → purchase_orders | |
| product_id | fk → products | |
| variant_id | fk → product_variants (nullable) | |
| quantity | int | จำนวนสั่ง |
| unit_cost | numeric | ต้นทุน/ชิ้น |
| received_qty | int | รับเข้าแล้ว (Phase 1) |
| created_at / updated_at | | |

### 2.4 สต๊อก & คลัง

#### `warehouses` — คลัง
| ฟิลด์ | type | หมายเหตุ |
|------|------|---------|
| id | uuid PK | |
| tenant_id | fk | |
| name | text | คลังหลัก/คลังพัก/คลังตัวแทน |
| type | enum | main / staging / dealer |
| dealer_id | fk → dealers (nullable) | ถ้าเป็นคลังตัวแทน |
| is_active | bool | |
| created_at / updated_at | | |

#### `stock_lots` — ล็อตสินค้า (Lot/Batch)
| ฟิลด์ | type | หมายเหตุ |
|------|------|---------|
| id | uuid PK | |
| tenant_id | fk | |
| product_id | fk | |
| variant_id | fk (nullable) | |
| warehouse_id | fk → warehouses | |
| po_id | fk → purchase_orders | ล็อตมาจาก PO ไหน |
| lot_number | text | เลขล็อต |
| quantity | int | จำนวนในล็อต |
| expiry_date | date (nullable) | วันหมดอายุ (เตือน) |
| received_date | date | วันที่รับเข้า |
| created_at / updated_at | | |

#### `stock_ledger` — Stock Card (ประวัติเข้า-ออกทุกครั้ง)
| ฟิลด์ | type | หมายเหตุ |
|------|------|---------|
| id | uuid PK | |
| tenant_id | fk | |
| product_id | fk | |
| variant_id | fk (nullable) | |
| warehouse_id | fk | |
| lot_id | fk → stock_lots (nullable) | |
| change_type | enum | receive / reserve / release / fulfill / adjust / return / damage |
| quantity_change | int | +เข้า / -ออก |
| balance_after | int | ยอดคงเหลือหลังรายการ |
| ref_type | text | order / po / adjustment |
| ref_id | uuid | อ้างอิงเอกสารต้นทาง |
| created_by | uuid | ใครทำ |
| created_at | timestamptz | |

> **หัวใจ:** สต๊อกปัจจุบัน = sum ของ stock_ledger ต่อ product/warehouse — ไม่มีตาราง "ยอดคงเหลือ" ที่มั่วได้

### 2.5 ออเดอร์ & การจอง

#### `orders` — ออเดอร์ตัวแทน
| ฟิลด์ | type | หมายเหตุ |
|------|------|---------|
| id | uuid PK | |
| tenant_id | fk | |
| order_number | text unique | |
| dealer_id | fk → dealers | |
| status | enum | draft / reserved / paid / partial_paid / fulfilled / shipped / cancelled / expired |
| order_type | enum | normal / preorder / dropship |
| total_amount | numeric | ยอดรวม |
| deposit_amount | numeric | ยอดมัดจำ |
| balance_due | numeric | ยอดค้าง |
| reserved_until | timestamptz | เวลาหมดล็อก (auto-release) |
| created_at / updated_at | | |

#### `order_items` — รายการในออเดอร์
| ฟิลด์ | type | หมายเหตุ |
|------|------|---------|
| id | uuid PK | |
| tenant_id | fk | |
| order_id | fk → orders | |
| product_id | fk | |
| variant_id | fk (nullable) | |
| quantity | int | |
| unit_price | numeric | ราคาตัวแทน (จาก tier) |
| line_total | numeric | |
| allocated_qty | int | ของที่จัดสรรแล้ว |
| fulfilled_qty | int | ของที่ส่งแล้ว |
| created_at / updated_at | | |

#### `allocations` — การจัดสรรของ (ของไม่พอ → ตัด/รอ)
| ฟิลด์ | type | หมายเหตุ |
|------|------|---------|
| id | uuid PK | |
| tenant_id | fk | |
| order_item_id | fk → order_items | |
| stock_lot_id | fk → stock_lots | |
| quantity | int | จำนวนที่จัดสรรจากล็อตนี้ |
| status | enum | allocated / fulfilled / released |
| created_at / updated_at | | |

### 2.6 การเงิน

#### `payments` — การชำระเงิน
| ฟิลด์ | type | หมายเหตุ |
|------|------|---------|
| id | uuid PK | |
| tenant_id | fk | |
| order_id | fk → orders | |
| dealer_id | fk | |
| amount | numeric | |
| method | enum | cash / transfer / credit / deposit |
| slip_url | text (nullable) | รูปสลิป |
| slip_status | enum | pending / approved / rejected / auto_verified (Phase 4) |
| status | enum | pending / confirmed / refunded |
| confirmed_by | uuid (nullable) | admin อนุมัติ |
| created_at / updated_at | | |

#### `invoices` — ใบเสร็จ/ใบกำกับภาษี
| ฟิลด์ | type | หมายเหตุ |
|------|------|---------|
| id | uuid PK | |
| tenant_id | fk | |
| order_id | fk | |
| invoice_number | text unique | |
| type | enum | receipt / tax_invoice / credit_note |
| total_amount | numeric | |
| tax_amount | numeric | |
| status | enum | draft / issued / void |
| issued_at | timestamptz | |
| created_at / updated_at | | |

### 2.7 Fulfillment & ขนส่ง (Phase 3+)

#### `shipments` — การจัดส่ง
| ฟิลéd | type | หมายเหตุ |
|------|------|---------|
| id | uuid PK | |
| tenant_id | fk | |
| order_id | fk | |
| type | enum | bulk / dropship |
| carrier | text | Flash/J&T/Kerry/ไปรษณีย์ |
| tracking_number | text | |
| status | enum | pending / packed / shipped / delivered |
| dropship_customer_name | text (nullable) | ชื่อลูกค้าปลายทาง |
| dropship_customer_address | text (nullable) | |
| shipped_at / delivered_at | timestamptz | |
| created_at / updated_at | | |

---

## 3. ความสัมพันธ์หลัก (ER สรุป)

```
saas_tenants 1─N saas_tenant_users
saas_tenants 1─N saas_subscriptions

saas_tenants 1─N products 1─N product_variants
products 1─N product_tier_prices

saas_tenants 1─N dealers (self-ref parent_dealer_id → สายงาน)
dealers 1─N dealer_quotas

saas_tenants 1─N purchase_orders 1─N po_items
saas_tenants 1─N warehouses
saas_tenants 1─N stock_lots (→ product, warehouse, po)
saas_tenants 1─N stock_ledger

saas_tenants 1─N orders 1─N order_items
order_items 1─N allocations (→ stock_lots)
orders 1─N payments
orders 1─N invoices
orders 1─N shipments
```

---

## 4. หมายเหตุการออกแบบ (ทำไมถึงเป็นแบบนี้)

1. **`stock_ledger` เป็น source of truth** — ไม่มีตารางยอดคงเหลือที่มั่วได้, audit ทุกการเคลื่อนไหว
2. **`allocations` แยกจาก order_items** — รองรับของไม่พอ/ตัดบางส่วน/หลายล็อต (FIFO)
3. **`dealer_quotas` มี period** — รองรับโควตาต่อรอบ/ต่อ PO ได้
4. **`payments.slip_status`** — รองรับ AI slip verification (Phase 4) โดยไม่ต้องรื้อ
5. **`shipments` มี dropship fields** — รองรับ dropship (Phase 3) ตั้งแต่ schema
6. **`saas_tenants.settings` (jsonb)** — เก็บกติจาจัดสรร/order window/auto-release ชั่วโมง แบบยืดหยุ่น ไม่ต้องเพิ่มคอลัมน์ทุกครั้ง
7. **สกุลเงิน 3 ฟิลด์** — กันปัญหา rate เปลี่ยน (ซื้อ CNY ขาย THB)

---

## 5. Configurable Business Rules (ลูกค้าเลือกเอง — ระบบรองรับทุกทางเลือก)

> ⚠️ **หลักการ:** กติกาเหล่านี้ **เราไม่ได้ตัดสินใจให้ลูกค้า** — tenant แต่ละรายตั้งค่าเอง
> ระบบต้องรองรับทุกทางเลือกที่ลูกค้าจะเลือก เก็บใน `saas_tenants.settings` (jsonb)
> หรือตาราง policy แยก (ถ้าซับซ้อน) → tenant A เลือกแบบหนึ่ง, tenant B เลือกอีกแบบได้

### 5.1 กติกาที่ต้องเป็น configurable (ลูกค้าเลือกเอง)

| # | กติกา | ทางเลือกที่ระบบต้องรองรับ | เก็บที่ไหน |
|---|-------|--------------------------|-----------|
| 1 | **จัดสรรของไม่พอ** | ตัดบางส่วน / รอของรอบหน้า / แจ้งตัวแทนให้เลือก / ยกเลิกออเดอร์ | settings.allocation_policy |
| 2 | **ยกเลิกออเดอร์** | คืนโควตา / ไม่คืน / คืนมัดจำ / ไม่คืนมัดจำ / ยกเลิกได้ถึงสถานะไหน | settings.cancel_policy |
| 3 | **สินค้าคืน/เสียหาย** | รับคืน / ไม่รับคืน / ใครรับผิดชอบค่าขนส่ง | settings.return_policy |
| 4 | **สกุลเงิน** | อัตรา ณ วัน PO / วันขาย / ฟิกเรต / ตั้งเรตเองต่อรอบ | settings.currency_policy |
| 5 | **Virtual stock vs โควตา** | ตัวไหนชนะ / จองของลอยได้เท่าไหร่ / จำกัดต่อตัวแทน | settings.virtual_stock_policy |
| 6 | **รอบสั่ง (order window)** | เปิด-ปิดช่วงไหน / นอกเวลาสั่งได้ไหม / ต่อรอบหรือต่อ PO | settings.order_window |
| 7 | **เพดาน** | ขั้นต่ำ/สูงสุดต่อตัวแทน / เพดานรวมต่อรอบ | settings.order_limits |
| 8 | **Auto-release** | ล็อกกี่ชั่วโมง / ไม่โอนหลุดจองเมื่อไหร่ / แจ้งเตือนก่อนหลุด | settings.auto_release |

### 5.2 ตัวอย่างโครงสร้าง `saas_tenants.settings` (jsonb)

```json
{
  "allocation_policy": "partial_cut",        // partial_cut | wait_next | ask_dealer | cancel
  "cancel_policy": {
    "refund_quota": true,
    "refund_deposit": false,
    "max_status_to_cancel": "reserved"       // ยกเลิกได้ถึงสถานะไหน
  },
  "return_policy": {
    "accept_returns": true,
    "shipping_cost_by": "dealer"             // dealer | tenant
  },
  "currency_policy": "at_po_date",            // at_po_date | at_sale_date | fixed | manual
  "virtual_stock_policy": {
    "allow_preorder": true,
    "max_preorder_per_dealer": 50,
    "quota_wins": true                        // true = โควตาชนะ virtual stock
  },
  "order_window": {
    "open_day": 1,
    "close_day": 5,
    "allow_outside_window": false
  },
  "order_limits": {
    "min_per_dealer": 10,
    "max_per_dealer": 50,
    "max_total_per_round": 500
  },
  "auto_release": {
    "lock_hours": 48,
    "notify_before_hours": 6
  }
}
```

> **ผลต่อ schema:** `saas_tenants.settings` (jsonb) รองรับทุกกติกาแบบยืดหยุ่น
> ไม่ต้องเพิ่มคอลัมน์ทุกครั้งที่ลูกค้าขอ feature ใหม่ — ถ้ากติกาไหนซับซ้อนมาก
> (เช่น allocation หลายขั้น) ค่อยแยกเป็นตาราง policy แยก

### 5.3 หลักการออกแบบ (สำคัญ)
1. **ไม่ hardcode กติกาในโค้ด** — ทุกกติกาอ่านจาก settings ของ tenant นั้น
2. **default มีค่า** — tenant ใหม่ได้ค่า default ที่สมเหตุผล ไปแก้ทีหลังได้
3. **validate ตอนตั้งค่า** — กันลูกค้าตั้งค่าที่ขัดกัน (เช่น เพดานขั้นต่ำ > ขั้นสูงสุด)
4. **log การเปลี่ยน** — รู้ว่าใครเปลี่ยนกติกาเมื่อไหร่ (audit)
