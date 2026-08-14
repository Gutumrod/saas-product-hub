# Content Model: Product Catalog

## Product Record

```ts
type Product = {
  id: string;
  slug: string;
  status: 'draft' | 'coming-soon' | 'active' | 'archived';
  category: string;
  featured?: boolean;
  name: { th: string; en: string };
  tagline: { th: string; en: string };
  description: { th: string; en: string };
  audience: { th: string[]; en: string[] };
  features: Array<{ title: LocaleText; body: LocaleText; icon?: string }>;
  workflow?: Array<{ step: number; title: LocaleText; body: LocaleText }>;
  pricing?: PricingConfig;
  cta: { label: LocaleText; type: 'detail' | 'trial' | 'demo' | 'external'; href?: string };
  visual?: { src: string; alt: LocaleText };
  seo?: { title: LocaleText; description: LocaleText };
};

type LocaleText = { th: string; en: string };
```

## Content Rules

- `id` คงที่; `slug` lowercase และเปลี่ยนเมื่อจำเป็นเท่านั้น
- product ต้องมี TH/EN ครบก่อน status `active`
- status `coming-soon` ห้ามใช้ CTA สมัครจริงโดยไม่มีปลายทาง
- ราคาใช้ข้อมูล approved เท่านั้น
- ห้ามใส่ review, rating, testimonial หรือโลโก้ลูกค้าที่ไม่มีหลักฐาน
- visual ทุกชิ้นต้องมี alt TH/EN และสิทธิ์ใช้งานชัดเจน

## Review Workflow

Draft → content owner review → pricing/legal review (ถ้ามี) → approved → publish → periodic review

## Initial ServiceBooking Entry

ใช้ข้อมูลที่ตรวจสอบแล้วจาก product owner เท่านั้น เช่น service booking, LINE automation, deposit/PromptPay และ subscription plan ห้ามเติม claim ตัวเลขหรือ testimonial ที่ยังไม่ได้รับอนุมัติ
