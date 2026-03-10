# Database Setup Instructions

## 📋 ข้อมูลการเชื่อมต่อ

- **Server:** `10.102.10.51\SQLEXPRESS`
- **Database:** `SmartMapDB`
- **Authentication:** SQL Server Authentication
- **Login Name:** `SmartMapUser`
- **Password:** `SmartMap@2024!`

## 🚀 วิธีติดตั้งฐานข้อมูล

### ขั้นตอนที่ 1: สร้าง Login และ Database

1. เปิด **SQL Server Management Studio (SSMS)**
2. เชื่อมต่อกับ Server: `10.102.10.51\SQLEXPRESS`
3. เปิดไฟล์ `CreateDatabase.sql`
4. รันสคริปต์ทั้งหมด (กด F5 หรือ Execute)

สคริปต์นี้จะ:
- สร้าง Login `SmartMapUser` พร้อม password
- สร้าง Database `SmartMapDB`
- สร้าง User `SmartMapUser` ใน database
- ให้สิทธิ์ `db_owner` แก่ user

### ขั้นตอนที่ 2: สร้าง Tables

1. ใน SSMS เปลี่ยน context ไปที่ database `SmartMapDB`
2. เปิดไฟล์ `CreateTables.sql`
3. รันสคริปต์ทั้งหมด (กด F5 หรือ Execute)

สคริปต์นี้จะ:
- สร้าง Tables ทั้งหมด 7 ตาราง
- สร้าง Indexes และ Foreign Keys
- สร้าง Default Users (admin/admin123, user/user123)

## ✅ ตรวจสอบการติดตั้ง

รันคำสั่ง SQL นี้เพื่อตรวจสอบ:

```sql
USE SmartMapDB;
GO

-- ตรวจสอบ Tables
SELECT TABLE_NAME 
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_TYPE = 'BASE TABLE'
ORDER BY TABLE_NAME;

-- ตรวจสอบ Users
SELECT Username, Email, Role, IsActive 
FROM Users;

-- ตรวจสอบ Login
SELECT name, type_desc 
FROM sys.database_principals 
WHERE name = 'SmartMapUser';
```

## 📁 Folder Structure สำหรับไฟล์

หลังจากติดตั้งแล้ว ต้องสร้าง folder structure นี้:

```
SmartMap.API/
├── wwwroot/ (หรือ ContentRootPath)
│   └── uploads/
│       ├── maps/
│       │   └── {Year}/
│       │       └── {Month}/
│       ├── verify-seams/
│       │   └── {VerifySeamId}/
│       └── geophysic/
│           └── {HoleName}/
```

## 🔧 Connection String

Connection string ที่ใช้ใน `appsettings.json`:

```
Server=10.102.10.51\SQLEXPRESS;Database=SmartMapDB;User Id=SmartMapUser;Password=SmartMap@2024!;TrustServerCertificate=True;
```

## ⚠️ หมายเหตุ

1. **Security:** ใน production ควรเปลี่ยน password ให้แข็งแรงกว่า
2. **Permissions:** ตรวจสอบว่า Login มีสิทธิ์เพียงพอ
3. **Firewall:** ตรวจสอบว่า Firewall อนุญาตให้เชื่อมต่อได้
4. **Backup:** ควร backup database เป็นประจำ

## 🐛 Troubleshooting

### ปัญหา: Cannot connect to server
- ตรวจสอบว่า SQL Server รันอยู่
- ตรวจสอบ Network connectivity
- ตรวจสอบ Firewall rules

### ปัญหา: Login failed
- ตรวจสอบว่า Login ถูกสร้างแล้ว
- ตรวจสอบ password ว่าถูกต้อง
- ตรวจสอบว่า SQL Server Authentication เปิดอยู่

### ปัญหา: Permission denied
- ตรวจสอบว่า User มีสิทธิ์ `db_owner`
- ลองรันสคริปต์ CreateDatabase.sql อีกครั้ง
