# Smart Map - Database Design & System Architecture

## 🔌 Database Connection Information

- **Server:** `10.102.10.51\SQLEXPRESS`
- **Database:** `SmartMapDB`
- **Authentication:** SQL Server Authentication
- **Login Name:** `SmartMapUser`
- **Password:** `SmartMap@2024!`
- **Connection String:** 
  ```
  Server=10.102.10.51\SQLEXPRESS;Database=SmartMapDB;User Id=SmartMapUser;Password=SmartMap@2024!;TrustServerCertificate=True;
  ```

## 📋 สรุปความต้องการ (Requirements Summary)

### 1. ระบบ Map Upload (รายเดือน)
- อัพโหลดไฟล์รูป map ในแต่ละเดือน
- เก็บพิกัด 4 มุม (EastMin, EastMax, NorthMin, NorthMax) สำหรับ overlay บนแผนที่
- เก็บข้อมูล: ผู้อัพโหลด, เดือนที่อัพโหลด

### 2. ระบบ Verify Seam (หน้างาน)
- User ลงหน้างานบันทึกข้อมูล
- พิกัด: Easting, Northing, Elevation
- รูปถ่าย (ไม่จำกัดจำนวน) เก็บใน folder
- ข้อมูล: ผู้เพิ่มข้อมูล, ผู้ช่วย verify, รายละเอียดการ verify
- BlockName (ชื่อบล็อก)
- วันที่ verify, วันที่แก้ไข

### 3. ระบบ Geophysic
- เก็บข้อมูลในแต่ละหลุม (Hole)
- ข้อมูล: ชื่อหลุม, Easting, Northing, ผู้อัพโหลด, วันที่แก้ไข
- ไฟล์ PDF เก็บใน folder

### 4. ระบบสมาชิก
- Role: Admin, User

### 5. ระบบ Log การใช้งาน
- บันทึกกิจกรรมสำคัญของทุก user และ admin

---

## 🗄️ Database Schema Design

### Table 1: Users (ปรับปรุงจากเดิม)
```sql
Users
├── Id (int, PK, Identity)
├── Username (nvarchar(50), Unique, Not Null)
├── Email (nvarchar(100), Unique, Not Null)
├── Password (nvarchar(255), Not Null) -- Hashed
├── Role (nvarchar(20), Not Null) -- 'Admin' or 'User'
├── FullName (nvarchar(100), Null)
├── IsActive (bit, Default: 1)
├── CreatedAt (datetime, Default: GETDATE())
├── UpdatedAt (datetime, Null)
└── LastLoginAt (datetime, Null)
```

### Table 2: MonthlyMaps
```sql
MonthlyMaps
├── Id (int, PK, Identity)
├── Month (int, Not Null) -- 1-12
├── Year (int, Not Null)
├── FileName (nvarchar(255), Not Null) -- ชื่อไฟล์รูป
├── FilePath (nvarchar(500), Not Null) -- path ใน folder
├── FileSize (bigint, Null) -- ขนาดไฟล์ (bytes)
├── EastMin (decimal(18,3), Not Null) -- พิกัดมุมซ้ายล่าง (ทศนิยม 3 ตำแหน่ง)
├── EastMax (decimal(18,3), Not Null) -- พิกัดมุมขวาบน (ทศนิยม 3 ตำแหน่ง)
├── NorthMin (decimal(18,3), Not Null) -- พิกัดมุมซ้ายล่าง (ทศนิยม 3 ตำแหน่ง)
├── NorthMax (decimal(18,3), Not Null) -- พิกัดมุมขวาบน (ทศนิยม 3 ตำแหน่ง)
├── UploadedBy (int, FK -> Users.Id, Not Null)
├── UploadedAt (datetime, Default: GETDATE())
├── UpdatedAt (datetime, Null)
├── IsActive (bit, Default: 1)
└── Description (nvarchar(500), Null)
```

**Indexes:**
- Unique Index on (Year, Month) -- ไม่ให้มี map ซ้ำในเดือนเดียวกัน

### Table 3: VerifySeams
```sql
VerifySeams
├── Id (int, PK, Identity)
├── BlockName (nvarchar(100), Not Null) -- ชื่อบล็อก
├── Easting (decimal(18,3), Not Null) -- ทศนิยม 3 ตำแหน่ง
├── Northing (decimal(18,3), Not Null) -- ทศนิยม 3 ตำแหน่ง
├── Elevation (decimal(18,3), Null) -- ทศนิยม 3 ตำแหน่ง
├── VerifyDate (datetime, Not Null) -- วันที่ verify
├── CreatedBy (int, FK -> Users.Id, Not Null) -- ใครเป็นคน add
├── CreatedAt (datetime, Default: GETDATE())
├── UpdatedAt (datetime, Null)
├── UpdatedBy (int, FK -> Users.Id, Null) -- ใครแก้ไขล่าสุด
├── Status (nvarchar(20), Default: 'Pending') -- Pending, Verified, Rejected
├── Notes (nvarchar(1000), Null) -- รายละเอียดการ verify
└── IsActive (bit, Default: 1)
```

### Table 4: VerifySeamPhotos
```sql
VerifySeamPhotos
├── Id (int, PK, Identity)
├── VerifySeamId (int, FK -> VerifySeams.Id, Not Null)
├── FileName (nvarchar(255), Not Null)
├── FilePath (nvarchar(500), Not Null)
├── FileSize (bigint, Null)
├── UploadedBy (int, FK -> Users.Id, Not Null)
├── UploadedAt (datetime, Default: GETDATE())
├── DisplayOrder (int, Default: 0) -- สำหรับเรียงลำดับรูป
└── Description (nvarchar(500), Null)
```

### Table 5: VerifySeamVerifiers
```sql
VerifySeamVerifiers
├── Id (int, PK, Identity)
├── VerifySeamId (int, FK -> VerifySeams.Id, Not Null)
├── UserId (int, FK -> Users.Id, Not Null) -- ใครช่วย verify
├── VerifiedAt (datetime, Default: GETDATE())
├── VerificationNotes (nvarchar(500), Null) -- หมายเหตุการ verify
└── Status (nvarchar(20), Default: 'Verified') -- Verified, Rejected
```

**Indexes:**
- Index on VerifySeamId
- Index on UserId

### Table 6: GeophysicHoles
```sql
GeophysicHoles
├── Id (int, PK, Identity)
├── HoleName (nvarchar(100), Unique, Not Null) -- ชื่อหลุม
├── Easting (decimal(18,3), Not Null) -- ทศนิยม 3 ตำแหน่ง
├── Northing (decimal(18,3), Not Null) -- ทศนิยม 3 ตำแหน่ง
├── Elevation (decimal(18,3), Null) -- ทศนิยม 3 ตำแหน่ง
├── FileName (nvarchar(255), Not Null) -- ชื่อไฟล์ PDF
├── FilePath (nvarchar(500), Not Null) -- path ใน folder
├── FileSize (bigint, Null)
├── UploadedBy (int, FK -> Users.Id, Not Null)
├── UploadedAt (datetime, Default: GETDATE())
├── UpdatedAt (datetime, Null)
├── UpdatedBy (int, FK -> Users.Id, Null)
├── IsActive (bit, Default: 1)
└── Description (nvarchar(500), Null)
```

**Indexes:**
- Index on HoleName
- Index on UploadedBy

### Table 7: ActivityLogs
```sql
ActivityLogs
├── Id (int, PK, Identity)
├── UserId (int, FK -> Users.Id, Not Null)
├── ActionType (nvarchar(50), Not Null) -- 'Login', 'UploadMap', 'CreateVerifySeam', 'UploadGeophysic', etc.
├── EntityType (nvarchar(50), Null) -- 'MonthlyMap', 'VerifySeam', 'GeophysicHole', etc.
├── EntityId (int, Null) -- ID ของ entity ที่เกี่ยวข้อง
├── Description (nvarchar(500), Null) -- รายละเอียดกิจกรรม
├── IpAddress (nvarchar(50), Null)
├── UserAgent (nvarchar(255), Null)
├── CreatedAt (datetime, Default: GETDATE())
└── Status (nvarchar(20), Default: 'Success') -- Success, Failed, Error
```

**Indexes:**
- Index on UserId
- Index on CreatedAt (สำหรับ query ตามวันที่)
- Index on ActionType

---

## 📁 Folder Structure สำหรับไฟล์

```
SmartMap/
├── uploads/
│   ├── maps/
│   │   └── {Year}/
│   │       └── {Month}/
│   │           └── {FileName}
│   ├── verify-seams/
│   │   └── {VerifySeamId}/
│   │       └── {FileName}
│   └── geophysic/
│       └── {HoleName}/
│           └── {FileName}
```

---

## 🔄 Entity Relationship Diagram (ERD)

```
Users (1) ────< (Many) MonthlyMaps
Users (1) ────< (Many) VerifySeams (CreatedBy)
Users (1) ────< (Many) VerifySeams (UpdatedBy)
Users (1) ────< (Many) VerifySeamVerifiers
Users (1) ────< (Many) VerifySeamPhotos
Users (1) ────< (Many) GeophysicHoles (UploadedBy)
Users (1) ────< (Many) GeophysicHoles (UpdatedBy)
Users (1) ────< (Many) ActivityLogs

VerifySeams (1) ────< (Many) VerifySeamPhotos
VerifySeams (1) ────< (Many) VerifySeamVerifiers
```

---

## 🎯 API Endpoints ที่ต้องสร้าง

### Monthly Maps
- `GET /api/monthlymaps` - ดึงรายการ map ทั้งหมด
- `GET /api/monthlymaps/{year}/{month}` - ดึง map ตามปี/เดือน
- `POST /api/monthlymaps` - อัพโหลด map ใหม่
- `PUT /api/monthlymaps/{id}` - แก้ไข map
- `DELETE /api/monthlymaps/{id}` - ลบ map

### Verify Seams
- `GET /api/verifyseams` - ดึงรายการ verify seams
- `GET /api/verifyseams/{id}` - ดึงรายละเอียด verify seam
- `POST /api/verifyseams` - สร้าง verify seam ใหม่
- `PUT /api/verifyseams/{id}` - แก้ไข verify seam
- `DELETE /api/verifyseams/{id}` - ลบ verify seam
- `POST /api/verifyseams/{id}/photos` - อัพโหลดรูปถ่าย
- `DELETE /api/verifyseams/{id}/photos/{photoId}` - ลบรูปถ่าย
- `POST /api/verifyseams/{id}/verifiers` - เพิ่มผู้ verify
- `GET /api/verifyseams?blockName={blockName}` - ค้นหาตาม BlockName

### Geophysic Holes
- `GET /api/geophysicholes` - ดึงรายการหลุมทั้งหมด
- `GET /api/geophysicholes/{id}` - ดึงรายละเอียดหลุม
- `POST /api/geophysicholes` - อัพโหลดข้อมูลหลุมใหม่
- `PUT /api/geophysicholes/{id}` - แก้ไขข้อมูลหลุม
- `DELETE /api/geophysicholes/{id}` - ลบข้อมูลหลุม
- `GET /api/geophysicholes?holeName={name}` - ค้นหาตามชื่อหลุม

### Activity Logs
- `GET /api/activitylogs` - ดึง log ทั้งหมด (Admin only)
- `GET /api/activitylogs/user/{userId}` - ดึง log ของ user
- `GET /api/activitylogs?actionType={type}` - ดึง log ตาม action type
- `GET /api/activitylogs?startDate={date}&endDate={date}` - ดึง log ตามช่วงวันที่

---

## 🔐 Permission & Authorization

### Admin สามารถ:
- จัดการสมาชิกทั้งหมด
- อัพโหลด/แก้ไข/ลบ Monthly Maps
- อัพโหลด/แก้ไข/ลบ Verify Seams
- อัพโหลด/แก้ไข/ลบ Geophysic Holes
- ดู Activity Logs ทั้งหมด
- Verify Verify Seams

### User สามารถ:
- ดู Monthly Maps
- สร้าง/แก้ไข/ลบ Verify Seams ของตัวเอง
- อัพโหลดรูปถ่ายใน Verify Seams ของตัวเอง
- Verify Verify Seams ของคนอื่น (เพิ่มเป็น verifier)
- ดู Geophysic Holes
- ดู Activity Logs ของตัวเอง

---

## 📊 Business Rules

1. **Monthly Maps:**
   - ไม่สามารถอัพโหลด map ซ้ำในเดือนเดียวกันได้
   - ต้องมีพิกัด 4 มุมครบถ้วน
   - ไฟล์ต้องเป็นรูปภาพ (jpg, png, etc.)

2. **Verify Seams:**
   - ต้องมี BlockName
   - ต้องมีพิกัด Easting, Northing
   - สามารถมีรูปถ่ายได้ไม่จำกัด
   - สามารถมีผู้ verify หลายคน

3. **Geophysic Holes:**
   - ชื่อหลุมต้องไม่ซ้ำ
   - ไฟล์ต้องเป็น PDF
   - ต้องมีพิกัด Easting, Northing

4. **Activity Logs:**
   - บันทึกทุก action ที่สำคัญ
   - เก็บ IP Address และ User Agent
   - ไม่สามารถแก้ไขหรือลบได้ (Read-only)

---

## 🎨 Frontend Pages ที่ต้องสร้าง

1. **Monthly Maps Management**
   - หน้าแสดงรายการ map ทั้งหมด (Calendar view)
   - หน้าอัพโหลด map ใหม่
   - หน้าแก้ไข map

2. **Verify Seams Management**
   - หน้าแสดงรายการ verify seams (Map view + List view)
   - หน้าสร้าง verify seam ใหม่
   - หน้ารายละเอียด verify seam (แสดงรูปถ่าย, ผู้ verify)
   - หน้าอัพโหลดรูปถ่าย

3. **Geophysic Holes Management**
   - หน้าแสดงรายการหลุมทั้งหมด
   - หน้าอัพโหลดข้อมูลหลุมใหม่
   - หน้าแก้ไขข้อมูลหลุม

4. **Activity Logs**
   - หน้าแสดง log ทั้งหมด (Admin)
   - หน้าแสดง log ของตัวเอง (User)
   - Filter ตามวันที่, action type, user

---

## ✅ สรุปความเข้าใจ

ฉันเข้าใจว่าคุณต้องการระบบที่:

1. **จัดการ Map รายเดือน** - อัพโหลดรูป map พร้อมพิกัด 4 มุมเพื่อ overlay บนแผนที่
2. **ระบบ Verify Seam** - บันทึกข้อมูลหน้างานพร้อมรูปถ่าย, พิกัด, และผู้ verify
3. **ระบบ Geophysic** - เก็บข้อมูลหลุมพร้อมไฟล์ PDF
4. **ระบบสมาชิก** - แบ่งเป็น Admin และ User
5. **ระบบ Log** - บันทึกกิจกรรมทั้งหมด

ทั้งหมดนี้จะต้อง:
- เก็บไฟล์ใน folder structure ที่เป็นระเบียบ
- มีการจัดการ permissions
- รองรับการ query และ filter ข้อมูล
- มี UI ที่ใช้งานง่าย

**พร้อมที่จะเริ่มสร้างฐานข้อมูลและ API แล้วหรือยัง?** 🚀
