# File Upload Setup Guide

## 📁 Folder Structure บน Windows Server

สร้าง folder structure นี้บน Windows Server:

```
C:\SmartMapFiles\
├── uploads\
│   ├── maps\
│   │   └── {Year}\
│   │       └── {Month}\
│   ├── verify-seams\
│   │   └── {VerifySeamId}\
│   └── geophysic\
│       └── {HoleName}\
```

## 🔧 การตั้งค่า Windows Server

### 1. สร้าง Folder

เปิด **Command Prompt (CMD)** หรือ **PowerShell** บน Windows Server และรัน:

#### สำหรับ Command Prompt (CMD):
```cmd
REM สร้าง folder หลัก
mkdir "C:\SmartMapFiles"

REM สร้าง subfolders
mkdir "C:\SmartMapFiles\uploads"
mkdir "C:\SmartMapFiles\uploads\maps"
mkdir "C:\SmartMapFiles\uploads\verify-seams"
mkdir "C:\SmartMapFiles\uploads\geophysic"
```

หรือใช้คำสั่งเดียว:
```cmd
mkdir "C:\SmartMapFiles\uploads\maps" "C:\SmartMapFiles\uploads\verify-seams" "C:\SmartMapFiles\uploads\geophysic"
```

#### สำหรับ PowerShell (ทางเลือก):
```powershell
# สร้าง folder หลัก
New-Item -ItemType Directory -Path "C:\SmartMapFiles" -Force

# สร้าง subfolders
New-Item -ItemType Directory -Path "C:\SmartMapFiles\uploads" -Force
New-Item -ItemType Directory -Path "C:\SmartMapFiles\uploads\maps" -Force
New-Item -ItemType Directory -Path "C:\SmartMapFiles\uploads\verify-seams" -Force
New-Item -ItemType Directory -Path "C:\SmartMapFiles\uploads\geophysic" -Force
```

### 2. ตั้งค่า Permissions

ให้สิทธิ์ IIS Application Pool เข้าถึง folder:

#### สำหรับ Command Prompt (CMD):
```cmd
REM วิธีที่ 1: ใช้ IIS_IUSRS (แนะนำ - ง่ายกว่า)
icacls "C:\SmartMapFiles" /grant "IIS_IUSRS:(OI)(CI)F" /T

REM วิธีที่ 2: ใช้ Application Pool Identity โดยตรง
REM แทน SmartMapAPI ด้วยชื่อ App Pool ของคุณ
icacls "C:\SmartMapFiles" /grant "IIS AppPool\SmartMapAPI:(OI)(CI)F" /T
```

#### สำหรับ PowerShell (ทางเลือก):
```powershell
# วิธีที่ 1: ใช้ IIS_IUSRS (แนะนำ - ง่ายกว่า)
icacls "C:\SmartMapFiles" /grant "IIS_IUSRS:(OI)(CI)F" /T

# วิธีที่ 2: ใช้ Application Pool Identity โดยตรง
# แทน SmartMapAPI ด้วยชื่อ App Pool ของคุณ
icacls "C:\SmartMapFiles" /grant "IIS AppPool\SmartMapAPI:(OI)(CI)F" /T
```

**หมายเหตุ:** คำสั่ง `icacls` ใช้ได้ทั้ง CMD และ PowerShell

### 3. ตรวจสอบ Permissions

#### สำหรับ Command Prompt (CMD):
```cmd
icacls "C:\SmartMapFiles"
```

#### สำหรับ PowerShell (ทางเลือก):
```powershell
icacls "C:\SmartMapFiles"
```

ควรเห็น IIS_IUSRS หรือ Application Pool Identity มีสิทธิ์ Full Control

## ⚙️ Configuration ใน appsettings.json

ตรวจสอบว่า `appsettings.json` มีการตั้งค่าถูกต้อง:

```json
{
  "FileUpload": {
    "BasePath": "C:\\SmartMapFiles",
    "MapsPath": "uploads/maps",
    "VerifySeamsPath": "uploads/verify-seams",
    "GeophysicPath": "uploads/geophysic",
    "MaxMapFileSize": 52428800,
    "MaxPhotoFileSize": 10485760,
    "MaxPdfFileSize": 52428800
  }
}
```

## 📊 File Size Limits

- **Map Files:** 50MB (52,428,800 bytes)
- **Photo Files:** 10MB (10,485,760 bytes)
- **PDF Files:** 50MB (52,428,800 bytes)

## 🔒 Security Features

1. **File Type Validation:**
   - Maps: .jpg, .jpeg, .png, .gif, .bmp
   - Photos: .jpg, .jpeg, .png, .gif, .bmp
   - PDFs: .pdf only

2. **File Size Validation:** ตรวจสอบขนาดไฟล์ก่อน upload

3. **Filename Sanitization:** ลบ special characters ออกจาก filename

4. **Path Traversal Protection:** ป้องกันการเข้าถึงไฟล์นอก folder ที่กำหนด

## 🌐 การเข้าถึงไฟล์ผ่าน Web

ไฟล์สามารถเข้าถึงได้ผ่าน:

1. **Static Files Middleware:**
   ```
   http://your-server/files/uploads/maps/2024/3/abc123_map.jpg
   http://your-server/files/uploads/verify-seams/1/def456_photo.jpg
   http://your-server/files/uploads/geophysic/HOLE-001/ghi789_hole.pdf
   ```

2. **API Endpoint:**
   ```
   GET /api/files/uploads/maps/2024/3/abc123_map.jpg
   ```

## 📝 File Naming Convention

ไฟล์จะถูกตั้งชื่อเป็น: `{GUID}_{OriginalFileName}`

ตัวอย่าง:
- Original: `map_january.jpg`
- Stored: `a1b2c3d4-e5f6-7890-abcd-ef1234567890_map_january.jpg`

## 🔄 Backup Recommendations

1. **Backup Database:** Backup SmartMapDB เป็นประจำ
2. **Backup Files:** Backup folder `C:\SmartMapFiles` เป็นประจำ
3. **Backup Schedule:** แนะนำ backup รายวันหรือรายสัปดาห์

## ✅ Testing

หลังจาก setup แล้ว ทดสอบ:

1. Upload map file ผ่าน API
2. Upload verify seam photo ผ่าน API
3. Upload geophysic PDF ผ่าน API
4. ตรวจสอบว่าไฟล์ถูกสร้างใน folder ที่ถูกต้อง
5. ทดสอบดูไฟล์ผ่าน web browser

## 🐛 Troubleshooting

### ปัญหา: Permission Denied
- ตรวจสอบว่า IIS Application Pool มีสิทธิ์เข้าถึง folder
- ตรวจสอบว่า folder path ถูกต้อง
- ลองรันคำสั่ง `icacls` อีกครั้ง

### ปัญหา: Folder ไม่ถูกสร้าง
- ตรวจสอบว่า path ถูกต้อง (C:\SmartMapFiles)
- ตรวจสอบว่า drive C: มีพื้นที่ว่างเพียงพอ
- ลองรันคำสั่ง `mkdir` อีกครั้ง

### ปัญหา: File ไม่แสดงใน Web
- ตรวจสอบว่า Static Files Middleware ถูก configure แล้ว
- ตรวจสอบว่า file path ใน database ถูกต้อง
- ตรวจสอบว่าไฟล์อยู่ใน folder ที่ถูกต้อง

### ปัญหา: Upload Failed
- ตรวจสอบ disk space
- ตรวจสอบ file size ไม่เกิน limit
- ตรวจสอบ file type ถูกต้อง
- ตรวจสอบ permissions ของ folder