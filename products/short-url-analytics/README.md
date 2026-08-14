# Short URL + Analytics System v2

เว็บแอป local สำหรับย่อ URL, redirect ด้วย short code, และเก็บ analytics ลง SQLite

## Requirements

- Python 3.10+
- Windows PowerShell หรือ terminal ที่รัน Python ได้

## Setup

```powershell
pip install -r requirements.txt
```

## Run

```powershell
python -m uvicorn app.main:app --reload --port 8000
```

เปิดใช้งาน:

- Web UI: http://localhost:8000
- API Docs: http://localhost:8000/docs

## Test

```powershell
python -m pytest -q
```

## API Summary

- `POST /api/shorten` สร้าง short link
- `GET /{short_code}` redirect ไป URL ต้นทางและบันทึก click log
- `GET /api/analytics/{short_code}` ดูสถิติของ short link
- `GET /api/links` ดูรายการลิงก์ทั้งหมดสำหรับ dashboard

## Database

ค่าเริ่มต้นใช้ไฟล์ `shortener.db` ใน root โปรเจกต์ ระบบจะสร้างตารางอัตโนมัติเมื่อแอปเริ่มทำงาน

สำหรับ test หรือกรณีอยากใช้ DB แยก ตั้ง env var ได้:

```powershell
$env:SHORTENER_DB_PATH="D:\path\to\shortener-test.db"
```
