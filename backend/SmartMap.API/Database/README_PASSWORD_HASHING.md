# Password Hashing Implementation

## ✅ Password Hashing ได้ถูก implement แล้ว

ระบบใช้ **BCrypt** สำหรับ hashing passwords ด้วย work factor 12

## 🔐 Default User Passwords

Default users ที่สร้างจาก `CreateTables.sql`:

- **Admin:** username: `admin`, password: `admin123` (จะถูก hash อัตโนมัติเมื่อ login ครั้งแรก)
- **User:** username: `user`, password: `user123` (จะถูก hash อัตโนมัติเมื่อ login ครั้งแรก)

## 🔄 Auto-Upgrade สำหรับ Existing Users

ถ้าคุณมี users ที่มี plain text passwords อยู่แล้ว:

- **ระบบจะ auto-upgrade อัตโนมัติ** เมื่อ user login ครั้งแรก
- ไม่ต้องทำอะไรเพิ่มเติม - ระบบจะจัดการให้เอง
- Password จะถูก hash และบันทึกใหม่ทันทีหลังจาก login สำเร็จ

## 📝 การทำงานของระบบ

### ตอน Register:
- Password จะถูก hash ด้วย BCrypt ก่อนบันทึกลง database
- เก็บเฉพาะ hash ไม่เก็บ plain text

### ตอน Login:
- ระบบจะ verify password ด้วย BCrypt
- ถ้า password ใน database ยังเป็น plain text (legacy) ระบบจะ:
  1. เปรียบเทียบ plain text ก่อน
  2. ถ้าตรงกัน จะ auto-upgrade เป็น hashed
  3. บันทึก hash ใหม่ลง database

### Security Features:
- BCrypt ใช้ salt อัตโนมัติ (แต่ละ hash จะแตกต่างกัน)
- Work factor 12 = 2^12 = 4,096 iterations (สมดุลระหว่าง security และ performance)
- Password verification ใช้ constant-time comparison

## 🛠️ API Endpoints

### Register
```json
POST /api/auth/register
{
  "username": "newuser",
  "email": "newuser@example.com",
  "password": "password123"
}
```
Password จะถูก hash อัตโนมัติ

### Login
```json
POST /api/auth/login
{
  "username": "admin",
  "password": "admin123"
}
```
ระบบจะ verify password ด้วย BCrypt

## ⚠️ หมายเหตุ

1. **Password Strength:** ตอนนี้ระบบตรวจสอบว่า password ต้องมีอย่างน้อย 6 ตัวอักษร
2. **Plain Text Detection:** ระบบสามารถ detect และ upgrade plain text passwords อัตโนมัติ
3. **Security:** BCrypt hashes ไม่สามารถ reverse engineering ได้ (one-way hash)

## 🔍 ตรวจสอบ Password Hash

Password hash จะมีรูปแบบ: `$2a$12$...` (BCrypt format)

ตัวอย่าง:
```
$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYqJqZ5q5Xe
```

- `$2a$` = BCrypt algorithm version
- `12` = Work factor (2^12 iterations)
- ส่วนที่เหลือ = Salt + Hash
