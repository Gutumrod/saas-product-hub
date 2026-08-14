import { useState, useEffect } from "react";
import { 
  Calendar, 
  Clock, 
  QrCode, 
  Bell, 
  ArrowRight, 
  Check, 
  ChevronDown, 
  Menu, 
  X, 
  Sparkles,
  CheckCircle2,
  Globe,
  Sun,
  Moon
} from "lucide-react";
import { toast } from "sonner";
import { useTheme } from "@/contexts/ThemeContext";

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const { theme, toggleTheme } = useTheme();

  const [lang, setLang] = useState<"th" | "en">(() => {
    return (localStorage.getItem("sb_lang") as "th" | "en") || "th";
  });

  useEffect(() => {
    localStorage.setItem("sb_lang", lang);
  }, [lang]);

  const toggleLanguage = () => {
    const nextLang = lang === "th" ? "en" : "th";
    setLang(nextLang);
    toast.success(nextLang === "th" ? "เปลี่ยนเป็นภาษาไทยเรียบร้อย" : "Switched to English", {
      description: nextLang === "th" ? "ระบบจองคิวออนไลน์ ServiceBooking" : "ServiceBooking Online Scheduling System",
    });
  };

  const handleThemeToggle = () => {
    if (toggleTheme) {
      toggleTheme();
      const nextTheme = theme === "light" ? "Dark" : "Light";
      toast.success(theme === "light" ? "เปลี่ยนเป็นโหมดมืด (Dark Mode)" : "Switched to Light Mode", {
        description: `ServiceBooking ${nextTheme} Theme`,
      });
    }
  };

  const handleCta = (msgTh: string, msgEn: string) => {
    toast.success(lang === "th" ? msgTh : msgEn, {
      description: lang === "th" ? "ระบบจองคิวออนไลน์พร้อมเชื่อมต่อบัญชีของคุณทันที" : "Ready to connect your account instantly",
    });
  };

  const t = {
    th: {
      announcement: "เปิดร้านให้เป็นระบบ เริ่มต้นใช้งานฟรี 14 วันโดยไม่ต้องผูกบัตรเครดิต",
      announcementLink: "ดูแพ็กเกจราคา",
      navFeatures: "ความสามารถ",
      navWorkflow: "วิธีทำงาน",
      navPricing: "แพ็กเกจราคา",
      navFaq: "คำถามที่พบบ่อย",
      navCta: "เริ่มใช้งานฟรี",
      heroBadge: "ระบบจองคิวสำหรับร้านบริการยุคใหม่",
      heroTitle1: "ให้ลูกค้าจองเอง ร้านก็มี",
      heroTitle2: "เวลาทำงานของร้าน",
      heroSubtitle: "รวมคิว บริการ ช่าง เวลาเปิดร้าน และมัดจำ PromptPay ไว้ในระบบเดียว พร้อมแจ้งเตือนลูกค้าอัตโนมัติ เพื่อให้ธุรกิจบริการของคุณเดินหน้าอย่างราบรื่น",
      heroCtaPrimary: "เริ่มทดลองฟรี 14 วัน",
      heroCtaSecondary: "ดูฟีเจอร์ทั้งหมด",
      featuresTag: "ความสามารถที่สำคัญ",
      featuresTitle: "ทุกคิวที่ชัดเจน คืนเวลาที่กระจัดกระจาย",
      featuresDesc: "ออกแบบให้ใช้งานง่ายบนทุกอุปกรณ์ ไม่ต้องติดตั้งโปรแกรมซับซ้อน เริ่มต้นได้ทันทีใน 5 นาที",
      f1Title: "ระบบจองคิวอัตโนมัติ 24 ชั่วโมง",
      f1Desc: "ลูกค้าเลือกวัน เวลา และช่างที่ต้องการได้เองผ่านลิงก์เว็บเพจหรือ QR Code หน้าร้าน ระบบบล็อกเวลาไม่ให้คิวชนกันโดยอัตโนมัติ 100%",
      f2Title: "สแกนจ่ายมัดจำ PromptPay",
      f2Desc: "ลดปัญหาลูกค้าจองแล้วหายด้วยระบบออก QR Code มัดจำอัตโนมัติ ตรวจสอบสลิปได้ทันที",
      f3Title: "แจ้งเตือนผ่าน LINE OA",
      f3Desc: "ส่งข้อความยืนยันและเตือนนัดหมายล่วงหน้าอัตโนมัติ ช่วยลดอัตราการเบี้ยวนัดได้มากกว่า 85%",
      f4Title: "จัดการตารางช่างและเวลาเปิด-ปิด",
      f4Desc: "กำหนดวันหยุด พักเที่ยง หรือกะการทำงานของช่างแต่ละคนได้อย่างยืดหยุ่น ลูกค้าเห็นเฉพาะเวลาที่ว่างจริงเท่านั้น",
      workflowTag: "วิธีทำงานที่เรียบง่าย",
      workflowTitle: "จากข้อความแรก ถึงคิวที่จบสวย",
      workflowDesc: "ขั้นตอนง่ายๆ ที่ช่วยให้ร้านของคุณทำงานได้อย่างเป็นระบบในทุกๆ วัน",
      w1Num: "STEP 01",
      w1Title: "ลูกค้าเลือกเวลา",
      w1Desc: "ลูกค้ากดลิงก์เลือกบริการ วันเวลา และช่างที่ต้องการผ่านหน้าเว็บหรือ LINE ของร้านได้อย่างสะดวก",
      w2Num: "STEP 02",
      w2Title: "ระบบจัดคิวอัตโนมัติ",
      w2Desc: "ระบบตรวจสอบตารางว่างและออก QR Code มัดจำ PromptPay ทันทีโดยไม่ต้องรอแอดมินตอบแชท",
      w3Num: "STEP 03",
      w3Title: "นัดหมายเดินต่อเอง",
      w3Desc: "ระบบส่งข้อความยืนยันและแจ้งเตือนล่วงหน้า ช่างเตรียมตัวรับงาน ลูกค้ามาตรงเวลา ร้านมีกำไรเพิ่มขึ้น",
      pricingTag: "ราคาโปร่งใส",
      pricingTitle: "เลือกจังหวะที่พอดีกับร้านของคุณ",
      pricingDesc: "เริ่มต้นฟรี 14 วัน ไม่มีข้อผูกมัด ยกเลิกได้ตลอดเวลา",
      monthly: "รายเดือน",
      yearly: "รายปี (ประหยัด 20%)",
      popularBadge: "ยอดนิยม",
      plans: [
        {
          name: "Free Trial",
          description: "สัมผัสประสบการณ์จัดคิวเต็มรูปแบบ 14 วัน โดยไม่ต้องผูกบัตรเครดิต",
          monthly: "0 ฿",
          yearly: "0 ฿",
          period: "ฟรี 14 วัน",
          featured: false,
          cta: "เริ่มทดลองฟรี 14 วัน",
          features: [
            "รับคิวจองอัตโนมัติ 24/7",
            "เชื่อมต่อ LINE OA ของร้าน",
            "จัดการตารางช่างและบริการ",
            "แจ้งเตือนลูกค้าอัตโนมัติ",
            "PromptPay QR รับมัดจำอัตโนมัติ"
          ]
        },
        {
          name: "Basic",
          description: "เหมาะสำหรับร้านบริการ 1-2 สาขา ที่ต้องการระบบจัดคิวและมัดจำเสถียร",
          monthly: "490 ฿",
          yearly: "390 ฿",
          period: "ต่อเดือน",
          featured: false,
          cta: "เลือกแพ็กเกจ Basic",
          features: [
            "ทุกฟีเจอร์ใน Free Trial",
            "ไม่จำกัดจำนวนคิวต่อเดือน",
            "ระบบสลิปมัดจำอัตโนมัติ",
            "พิมพ์ใบเสร็จและสรุปยอดรายวัน",
            "รองรับการเพิ่มช่าง/บริการอิสระ"
          ]
        },
        {
          name: "Pro",
          description: "สำหรับร้านที่มีคิวหนาแน่น ต้องการระบบวิเคราะห์และฟีเจอร์ครบถ้วน",
          monthly: "990 ฿",
          yearly: "790 ฿",
          period: "ต่อเดือน",
          featured: true,
          cta: "เลือกแพ็กเกจ Pro",
          features: [
            "ทุกฟีเจอร์ใน Basic",
            "ระบบเตือนลูกค้าล่วงหน้าผ่าน LINE",
            "วิเคราะห์ช่วงเวลาที่ลูกค้าจองบ่อย",
            "รายงานยอดขายและสถิติช่างเชิงลึก",
            "ซัพพอร์ตดูแลเป็นพิเศษตลอด 24 ชม."
          ]
        }
      ],
      faqTag: "คำถามที่พบบ่อย",
      faqTitle: "คำถามที่พบบ่อย",
      faqDesc: "ทุกข้อสงสัยเกี่ยวกับการใช้งานระบบจองคิว ServiceBooking",
      faqs: [
        {
          q: "ต้องติดตั้ง LINE OA ของร้านตัวเองไหม?",
          a: "ใช่ครับ ระบบจะเชื่อมต่อกับ LINE Official Account ของร้านคุณ เพื่อให้ลูกค้ากดจองและรับแจ้งเตือนผ่าน LINE ได้ทันทีโดยไม่ต้องโหลดแอปเพิ่ม"
        },
        {
          q: "ลูกค้าจองคิวผ่านช่องทางไหนได้บ้าง?",
          a: "ลูกค้าสามารถจองผ่านลิงก์เว็บเพจหน้าร้าน หรือสแกน QR Code ที่หน้าร้านเพื่อเลือกบริการ วัน เวลา และช่างได้ด้วยตัวเองตลอด 24 ชั่วโมง"
        },
        {
          q: "PromptPay QR ช่วยลดปัญหาตัวหลุดได้อย่างไร?",
          a: "เมื่อลูกค้าเลือกจองคิว ระบบจะสร้าง QR Code PromptPay ยอดมัดจำทันที ลูกค้าโอนเงินแล้วระบบจะตรวจสอบสลิปอัตโนมัติ คิวจึงจะถูกยืนยัน 100%"
        },
        {
          q: "ถ้าใช้โควตาไม่พอในเดือนนั้นสามารถเปลี่ยนแผนได้ไหม?",
          a: "คุณสามารถอัปเกรดหรือลดแพ็กเกจได้ตลอดเวลาผ่านหน้าจัดการ โดยระบบจะคำนวณสัดส่วนค่าบริการตามจริงทันทีโดยไม่มีค่าธรรมเนียมแอบแฝง"
        }
      ],
      finalTitle: "พร้อมคืนเวลาให้ร้านของคุณแล้วหรือยัง?",
      finalDesc: "เริ่มต้นใช้งานฟรี 14 วัน ไม่ต้องใช้บัตรเครดิต ตั้งค่าง่ายใน 5 นาที พร้อมทีมงานซัพพอร์ตดูแลตลอดการใช้งาน",
      finalBtn: "เริ่มทดลองใช้งานฟรี",
      footerDesc: "ระบบจองคิวออนไลน์สำหรับร้านบริการท้องถิ่น ช่วยจัดการเวลา คิว และรายได้ให้เป็นระบบ",
      footerCol1: "ผลิตภัณฑ์",
      footerCol2: "บริษัท",
      footerCol3: "ความปลอดภัย",
      footerLinks: ["เกี่ยวกับเรา", "ติดต่อทีมงาน", "เงื่อนไขการให้บริการ", "นโยบายความเป็นส่วนตัว", "ความปลอดภัยของข้อมูล"],
      footerCopy: "Copyright © 2026 ServiceBooking Inc. All rights reserved.",
      footerNote: "ดีไซน์พิเศษสำหรับร้านบริการไทย"
    },
    en: {
      announcement: "Streamline your shop. Start a 14-day free trial, no credit card required.",
      announcementLink: "View pricing",
      navFeatures: "Features",
      navWorkflow: "Workflow",
      navPricing: "Pricing",
      navFaq: "FAQ",
      navCta: "Start Free",
      heroBadge: "Smart Scheduling for Modern Service Shops",
      heroTitle1: "Let customers book, ",
      heroTitle2: "gain your shop's time back",
      heroSubtitle: "Unified scheduling, service catalog, staff hours, and PromptPay deposits in one clean system with automated reminders to keep your business running seamlessly.",
      heroCtaPrimary: "Start 14-Day Free Trial",
      heroCtaSecondary: "Explore Features",
      featuresTag: "Powerful Capabilities",
      featuresTitle: "Crystal clear queues, zero scheduling chaos",
      featuresDesc: "Designed for effortless use across all devices. No complex setup—get started in under 5 minutes.",
      f1Title: "24/7 Automated Online Booking",
      f1Desc: "Clients select services, dates, and preferred staff via your shop link or store QR code. The system prevents double-booking 100%.",
      f2Title: "PromptPay QR Deposit Scanning",
      f2Desc: "Minimize no-shows with instant deposit QR generation and automatic receipt slip verification.",
      f3Title: "LINE OA Instant Notifications",
      f3Desc: "Send automated booking confirmations and reminder alerts directly via LINE, reducing no-show rates by over 85%.",
      f4Title: "Staff Rosters & Working Hours",
      f4Desc: "Flexible management for staff shifts, breaks, and days off. Clients only see genuinely available slots.",
      workflowTag: "Simple Workflow",
      workflowTitle: "From first message to completed service",
      workflowDesc: "A streamlined workflow that keeps your daily shop operations completely organized.",
      w1Num: "STEP 01",
      w1Title: "Client Selects Time",
      w1Desc: "Clients open your booking page or LINE to pick their preferred service, slot, and specialist.",
      w2Num: "STEP 02",
      w2Title: "Automated Scheduling",
      w2Desc: "The system checks availability and issues a PromptPay deposit QR instantly without manual replies.",
      w3Num: "STEP 03",
      w3Title: "Seamless Appointment",
      w3Desc: "Automated alerts keep staff prepared and clients punctual, driving higher revenue for your shop.",
      pricingTag: "Transparent Pricing",
      pricingTitle: "Choose the right rhythm for your business",
      pricingDesc: "Start free for 14 days. No commitment, cancel anytime.",
      monthly: "Monthly",
      yearly: "Yearly (Save 20%)",
      popularBadge: "Most Popular",
      plans: [
        {
          name: "Free Trial",
          description: "Experience full queue management for 14 days without a credit card.",
          monthly: "0 ฿",
          yearly: "0 ฿",
          period: "14 days free",
          featured: false,
          cta: "Start 14-Day Free Trial",
          features: [
            "24/7 automated booking queues",
            "Shop LINE OA integration",
            "Staff & service scheduling",
            "Automated client reminders",
            "PromptPay QR deposit collection"
          ]
        },
        {
          name: "Basic",
          description: "Ideal for 1-2 branch service shops needing reliable booking & deposits.",
          monthly: "490 ฿",
          yearly: "390 ฿",
          period: "per month",
          featured: false,
          cta: "Choose Basic Plan",
          features: [
            "Everything in Free Trial",
            "Unlimited monthly bookings",
            "Automated deposit slip matching",
            "Daily sales summary & receipts",
            "Independent staff & service setup"
          ]
        },
        {
          name: "Pro",
          description: "For busy shops requiring deep analytics and advanced automation.",
          monthly: "990 ฿",
          yearly: "790 ฿",
          period: "per month",
          featured: true,
          cta: "Choose Pro Plan",
          features: [
            "Everything in Basic",
            "Advanced LINE reminder sequences",
            "Peak booking hour analytics",
            "Staff performance & sales reports",
            "24/7 priority dedicated support"
          ]
        }
      ],
      faqTag: "Frequently Asked Questions",
      faqTitle: "Frequently Asked Questions",
      faqDesc: "Everything you need to know about using ServiceBooking",
      faqs: [
        {
          q: "Do I need my own shop LINE OA?",
          a: "Yes, the system connects with your shop's LINE Official Account so clients can book and receive alerts directly without downloading extra apps."
        },
        {
          q: "How can clients book appointments?",
          a: "Clients can book via your store web link or by scanning the QR code at your shop to pick services, times, and staff 24/7."
        },
        {
          q: "How does PromptPay QR reduce no-shows?",
          a: "When booking, a deposit QR code is generated immediately. Once paid, slip verification is automatic and the booking is confirmed 100%."
        },
        {
          q: "Can I switch plans later if my volume changes?",
          a: "Yes, you can upgrade or downgrade anytime in your dashboard with prorated adjustments and zero hidden fees."
        }
      ],
      finalTitle: "Ready to reclaim your shop's time?",
      finalDesc: "Start your 14-day free trial. No credit card required, 5-minute setup with full support.",
      finalBtn: "Start Free Trial",
      footerDesc: "Online booking system for local service businesses to manage time, queues, and revenue smoothly.",
      footerCol1: "Product",
      footerCol2: "Company",
      footerCol3: "Security",
      footerLinks: ["About Us", "Contact", "Terms of Service", "Privacy Policy", "Data Security"],
      footerCopy: "Copyright © 2026 ServiceBooking Inc. All rights reserved.",
      footerNote: "Crafted for Thai service businesses"
    }
  };

  const currentText = t[lang];

  return (
    <div className="site-shell">
      {/* Announcement Bar */}
      <div className="top-announcement">
        <div className="announcement-inner">
          <span>{currentText.announcement}</span>
          <a href="#pricing" className="announcement-link">{currentText.announcementLink} <ArrowRight size={13} /></a>
        </div>
      </div>

      {/* Header */}
      <header className="site-header">
        <div className="container header-inner">
          <a href="#" className="brand">
            <span className="brand-icon">SB</span>
            <span>ServiceBooking</span>
          </a>

          <nav className={`desktop-nav ${mobileMenuOpen ? "is-open" : ""}`}>
            <a href="#features" onClick={() => setMobileMenuOpen(false)}>{currentText.navFeatures}</a>
            <a href="#workflow" onClick={() => setMobileMenuOpen(false)}>{currentText.navWorkflow}</a>
            <a href="#pricing" onClick={() => setMobileMenuOpen(false)}>{currentText.navPricing}</a>
            <a href="#faq" onClick={() => setMobileMenuOpen(false)}>{currentText.navFaq}</a>
            
            {/* Mobile toggles */}
            <div className="flex md:hidden items-center gap-3 pt-2">
              <button className="mobile-control-button" onClick={toggleLanguage}>
                <Globe size={16} className="text-emerald-700" />
                <span>{lang === "th" ? "English (EN)" : "ภาษาไทย (TH)"}</span>
              </button>
              <button className="mobile-control-button" onClick={handleThemeToggle}>
                {theme === "light" ? <Moon size={16} className="text-emerald-700" /> : <Sun size={16} className="text-amber-500" />}
                <span>{theme === "light" ? (lang === "th" ? "โหมดมืด" : "Dark") : (lang === "th" ? "โหมดสว่าง" : "Light")}</span>
              </button>
            </div>

            <button className="nav-cta md:hidden mt-2" onClick={() => { setMobileMenuOpen(false); handleCta("เริ่มต้นใช้งานฟรี 14 วัน", "Start 14-Day Free Trial"); }}>
              {currentText.navCta} <ArrowRight size={14} />
            </button>
          </nav>

          <div className="flex items-center gap-2">
            {/* Theme Toggle Button Desktop */}
            <button 
              onClick={handleThemeToggle} 
              className="header-icon-button"
              title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
            >
              {theme === "light" ? <Moon size={16} className="text-emerald-700" /> : <Sun size={16} className="text-amber-500" />}
            </button>

            {/* Language Toggle Button Desktop */}
            <button 
              onClick={toggleLanguage} 
              className="header-language-button"
              title="Switch Language / เปลี่ยนภาษา"
            >
              <Globe size={14} className="text-emerald-700" />
              <span>{lang === "th" ? "EN" : "TH"}</span>
            </button>

            <button className="nav-cta hidden md:inline-flex" onClick={() => handleCta("เริ่มต้นใช้งานฟรี 14 วัน", "Start 14-Day Free Trial")}>
              {currentText.navCta} <ArrowRight size={14} />
            </button>
            <button className="menu-toggle md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Toggle menu">
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-badge">
            <Sparkles size={14} /> {currentText.heroBadge}
          </div>
          <h1 className="hero-title">
            {currentText.heroTitle1} <span>{currentText.heroTitle2}</span>
          </h1>
          <p className="hero-subtitle">
            {currentText.heroSubtitle}
          </p>
          <div className="hero-actions">
            <button className="btn-primary" onClick={() => handleCta("เริ่มทดลองใช้งานฟรี 14 วัน", "Start 14-Day Free Trial")}>
              {currentText.heroCtaPrimary} <ArrowRight size={16} />
            </button>
            <a href="#features" className="btn-secondary">
              {currentText.heroCtaSecondary}
            </a>
          </div>

          <div className="hero-preview" aria-label="Dashboard Preview">
            <div className="dashboard-window">
              <div className="dashboard-toolbar"><span className="traffic-lights"><i /><i /><i /></span><span className="dashboard-url">app.servicebooking.co / today</span><span className="dashboard-avatar">SB</span></div>
              <div className="dashboard-body">
                <aside className="dashboard-sidebar"><strong>ServiceBooking</strong><span className="sidebar-active">{lang === "th" ? "ภาพรวม" : "Overview"}</span><span>{lang === "th" ? "ตารางนัดหมาย" : "Appointments"}</span><span>{lang === "th" ? "บริการและช่าง" : "Services & Staff"}</span><span>{lang === "th" ? "ลูกค้า" : "Clients"}</span><span>{lang === "th" ? "รายงาน" : "Reports"}</span></aside>
                <div className="dashboard-content"><div className="dashboard-heading"><div><small>{lang === "th" ? "วันพฤหัสบดี 13 สิงหาคม 2026" : "Thursday, August 13, 2026"}</small><h3>{lang === "th" ? "สวัสดี, ร้านของคุณ" : "Hello, Your Shop"}</h3></div><button>{lang === "th" ? "+ เพิ่มคิวใหม่" : "+ New Booking"}</button></div><div className="dashboard-stats"><div><small>{lang === "th" ? "คิววันนี้" : "Today's Queues"}</small><b>24</b><em>{lang === "th" ? "+12% จากเมื่อวาน" : "+12% vs yesterday"}</em></div><div><small>{lang === "th" ? "รอยืนยัน" : "Pending"}</small><b>03</b><em>{lang === "th" ? "ต้องดำเนินการ" : "Action required"}</em></div><div><small>{lang === "th" ? "รายรับวันนี้" : "Today's Revenue"}</small><b>฿8,490</b><em>{lang === "th" ? "อัปเดตล่าสุด 10:24" : "Updated 10:24"}</em></div></div><div className="dashboard-table"><div className="table-head"><span>{lang === "th" ? "คิวถัดไป" : "Upcoming Queue"}</span><span>{lang === "th" ? "สถานะ" : "Status"}</span></div><div><span><b>10:30</b> {lang === "th" ? "ตัดผม — คุณมิน" : "Haircut — Min"}</span><mark>{lang === "th" ? "ยืนยันแล้ว" : "Confirmed"}</mark></div><div><span><b>11:00</b> {lang === "th" ? "ทรีตเมนต์ — คุณพลอย" : "Treatment — Ploy"}</span><mark style={{ color: "#9a6700", background: "#fff5d9" }}>{lang === "th" ? "รอยืนยัน" : "Pending"}</mark></div><div><span><b>11:30</b> {lang === "th" ? "ทำเล็บ — คุณออม" : "Nails — Aom"}</span><mark>{lang === "th" ? "ยืนยันแล้ว" : "Confirmed"}</mark></div></div></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Bento Grid */}
      <section id="features" className="section">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">{currentText.featuresTag}</span>
            <h2 className="section-title">{currentText.featuresTitle}</h2>
            <p className="section-desc">{currentText.featuresDesc}</p>
          </div>

          <div className="bento-grid">
            <div className="bento-card span-2">
              <div>
                <div className="bento-icon"><Calendar size={24} /></div>
                <h3>{currentText.f1Title}</h3>
                <p>{currentText.f1Desc}</p>
              </div>
              <div className="mt-8 pt-6 border-t border-emerald-100 flex items-center gap-4 text-xs font-semibold text-emerald-800">
                <span className="inline-flex items-center gap-1"><CheckCircle2 size={14} /> {lang === "th" ? "อัปเดตตารางเรียลไทม์" : "Real-time sync"}</span>
                <span className="inline-flex items-center gap-1"><CheckCircle2 size={14} /> {lang === "th" ? "ป้องกันคิวซ้อน" : "Zero double booking"}</span>
              </div>
            </div>

            <div className="bento-card">
              <div>
                <div className="bento-icon"><QrCode size={24} /></div>
                <h3>{currentText.f2Title}</h3>
                <p>{currentText.f2Desc}</p>
              </div>
            </div>

            <div className="bento-card">
              <div>
                <div className="bento-icon"><Bell size={24} /></div>
                <h3>{currentText.f3Title}</h3>
                <p>{currentText.f3Desc}</p>
              </div>
            </div>

            <div className="bento-card span-2">
              <div>
                <div className="bento-icon"><Clock size={24} /></div>
                <h3>{currentText.f4Title}</h3>
                <p>{currentText.f4Desc}</p>
              </div>
              <div className="mt-8 pt-6 border-t border-emerald-100 flex items-center gap-4 text-xs font-semibold text-emerald-800">
                <span className="inline-flex items-center gap-1"><CheckCircle2 size={14} /> {lang === "th" ? "จัดการหลายช่างได้พร้อมกัน" : "Multi-staff management"}</span>
                <span className="inline-flex items-center gap-1"><CheckCircle2 size={14} /> {lang === "th" ? "ตั้งค่าวันหยุดพิเศษง่ายๆ" : "Flexible custom holidays"}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section id="workflow" className="section section-alt">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">{currentText.workflowTag}</span>
            <h2 className="section-title">{currentText.workflowTitle}</h2>
            <p className="section-desc">{currentText.workflowDesc}</p>
          </div>

          <div className="workflow-steps">
            <div className="workflow-step">
              <span className="workflow-num">{currentText.w1Num}</span>
              <h3>{currentText.w1Title}</h3>
              <p>{currentText.w1Desc}</p>
            </div>
            <div className="workflow-step">
              <span className="workflow-num">{currentText.w2Num}</span>
              <h3>{currentText.w2Title}</h3>
              <p>{currentText.w2Desc}</p>
            </div>
            <div className="workflow-step">
              <span className="workflow-num">{currentText.w3Num}</span>
              <h3>{currentText.w3Title}</h3>
              <p>{currentText.w3Desc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="section">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">{currentText.pricingTag}</span>
            <h2 className="section-title">{currentText.pricingTitle}</h2>
            <p className="section-desc">{currentText.pricingDesc}</p>
          </div>

          <div className="pricing-toggle-wrap">
            <div className="pricing-toggle">
              <button className={billing === "monthly" ? "active" : ""} onClick={() => setBilling("monthly")}>
                {currentText.monthly}
              </button>
              <button className={billing === "yearly" ? "active" : ""} onClick={() => setBilling("yearly")}>
                {currentText.yearly}
              </button>
            </div>
          </div>

          <div className="pricing-grid">
            {currentText.plans.map((plan) => {
              const currentPrice = billing === "monthly" ? plan.monthly : plan.yearly;
              return (
                <div className={`pricing-card ${plan.featured ? "featured" : ""}`} key={plan.name}>
                  {plan.featured && <div className="pricing-badge">{currentText.popularBadge}</div>}
                  <div className="pricing-name">{plan.name}</div>
                  <div className="pricing-desc">{plan.description}</div>
                  <div className="pricing-price">
                    <span className="amount">{currentPrice}</span>
                    <span className="period">{plan.period}</span>
                  </div>
                  <ul className="pricing-features">
                    {plan.features.map((feat, i) => (
                      <li key={i}>
                        <Check size={16} />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                  <button 
                    className={`pricing-btn ${plan.featured ? "pricing-btn-solid" : "pricing-btn-outline"}`}
                    onClick={() => handleCta(`เลือกแพ็กเกจ ${plan.name}`, `Selected ${plan.name} Plan`)}
                  >
                    {plan.cta}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="section section-alt">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">{currentText.faqTag}</span>
            <h2 className="section-title">{currentText.faqTitle}</h2>
            <p className="section-desc">{currentText.faqDesc}</p>
          </div>

          <div className="faq-list">
            {currentText.faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div className={`faq-item ${isOpen ? "open" : ""}`} key={idx}>
                  <button className="faq-question" onClick={() => setOpenFaq(isOpen ? null : idx)}>
                    <span>{faq.q}</span>
                    <ChevronDown size={18} />
                  </button>
                  <div className="faq-answer">
                    <p>{faq.a}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="final-cta">
        <div className="container">
          <h2>{currentText.finalTitle}</h2>
          <p>{currentText.finalDesc}</p>
          <button className="btn-primary" onClick={() => handleCta("เริ่มต้นใช้งานฟรี 14 วันจากส่วนท้าย", "Start 14-Day Free Trial")}>
            {currentText.finalBtn} <ArrowRight size={16} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="site-footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-col">
              <div className="brand mb-4">
                <span className="brand-icon">SB</span>
                <span>ServiceBooking</span>
              </div>
              <p>{currentText.footerDesc}</p>
            </div>
            <div className="footer-col">
              <h4>{currentText.footerCol1}</h4>
              <ul>
                <li><a href="#features">{currentText.navFeatures}</a></li>
                <li><a href="#workflow">{currentText.navWorkflow}</a></li>
                <li><a href="#pricing">{currentText.navPricing}</a></li>
                <li><a href="#faq">{currentText.navFaq}</a></li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>{currentText.footerCol2}</h4>
              <ul>
                <li><a href="#" onClick={(e) => { e.preventDefault(); handleCta("เกี่ยวกับเรา", "About Us"); }}>{currentText.footerLinks[0]}</a></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); handleCta("ติดต่อทีมงาน", "Contact"); }}>{currentText.footerLinks[1]}</a></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); handleCta("เงื่อนไขการให้บริการ", "Terms of Service"); }}>{currentText.footerLinks[2]}</a></li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>{currentText.footerCol3}</h4>
              <ul>
                <li><a href="#" onClick={(e) => { e.preventDefault(); handleCta("นโยบายความเป็นส่วนตัว", "Privacy Policy"); }}>{currentText.footerLinks[3]}</a></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); handleCta("ความปลอดภัยของข้อมูล", "Data Security"); }}>{currentText.footerLinks[4]}</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <span>{currentText.footerCopy}</span>
            <span>{currentText.footerNote}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
