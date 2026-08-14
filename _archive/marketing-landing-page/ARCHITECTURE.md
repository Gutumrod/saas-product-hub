# Architecture: SaaS Product Hub

## Boundary

`marketing-landing-page` คือ storefront แยกจาก `local-service-booking-saas` อย่างเด็ดขาด ไม่ share source code, database migration หรือ secret โดยตรง การเชื่อมต่อในอนาคตต้องผ่าน URL, public API contract หรือ auth/billing integration ที่ได้รับการอนุมัติ

## Current Stack

React 19, Vite, TypeScript, Tailwind CSS 4, shadcn/ui, Wouter และ Noto Sans Thai โดยเริ่มจาก static frontend ก่อนเพิ่ม backend/auth เมื่อ requirement พร้อม

## Proposed Structure

```text
client/src/
  App.tsx
  pages/
    Home.tsx
    Products.tsx
    ProductDetail.tsx
    NotFound.tsx
  components/
    layout/
    catalog/
    product/
    ui/
  contexts/
  hooks/
  lib/
  data/
    products.ts
    translations.ts
  types/
    product.ts
```

## Route Responsibilities

- `App.tsx`: route table และ providers เท่านั้น
- `Home`: positioning, featured products และ category entry
- `Products`: query state, search, filters และ catalog presentation
- `ProductDetail`: อ่าน slug, resolve product และ render shared template
- `data/products.ts`: typed catalog source ใน MVP
- `lib`: pure functions เช่น search/filter/format

## Data Flow

```text
Product catalog → normalize/validate → search/filter state → ProductCard
                                      → slug resolver → ProductDetail
                                      → CTA resolver → external product app
```

## Future Adapters

ออกแบบ repository interface ให้เปลี่ยนจาก local typed data ไป CMS/API ได้ภายหลัง โดย component ไม่ควรรู้ว่า data มาจากที่ใด และห้ามฝัง secret ใน client

## Non-functional Requirements

- mobile-first และไม่มี horizontal overflow
- keyboard/accessibility ครบ
- route fallback ไม่ทำให้ผู้ใช้ติดอยู่ในหน้า detail
- images/media ใช้ asset workflow ของ WebDev ไม่เก็บไฟล์ใหญ่ใน public
- logging ไม่เผยข้อมูลผู้ใช้หรือ secret
- test pure functions และ critical user flows

## Deployment Boundary

Storefront deploy แยกจาก product apps หากต้องใช้ proxy, database, auth หรือ payment ให้ประเมิน full-stack upgrade ก่อน ไม่เพิ่ม proxy ที่พึ่งพาเฉพาะ dev server
