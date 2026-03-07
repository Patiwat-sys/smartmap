# Smart Map Project

โปรเจค Smart Map เป็นระบบแผนที่ออนไลน์ที่รองรับการใช้งานบนมือถือและ iPad/Tablet

## โครงสร้างโปรเจค

- **backend/** - ASP.NET Core Web API (C#)
- **frontend/** - React + Vite

## Features

- 🔐 ระบบ Login/Register
- 🗺️ แผนที่พร้อมปักหมุดตำแหน่ง
- 👥 ระบบจัดการสมาชิกสำหรับ Admin
- 📱 Responsive Design รองรับมือถือและ Tablet
- 🎨 Bootstrap Theme สีฟ้าอ่อน

## การติดตั้งและรันโปรเจค

### ⚠️ สำคัญ: ต้องรัน Backend ก่อน Frontend!

### Backend (C#)

**เปิด Terminal/PowerShell ใหม่** และรัน:

```bash
cd backend/SmartMap.API
dotnet restore
dotnet run
```

Backend จะรันที่:
- HTTP: `http://localhost:5000`
- HTTPS: `https://localhost:7000`

**ตรวจสอบว่า Backend รันอยู่:** เปิด Browser ไปที่ `http://localhost:5000/api/users` ควรเห็น JSON response

### Frontend (React)

**เปิด Terminal/PowerShell อีกหน้าต่างหนึ่ง** และรัน:

```bash
cd frontend
npm install
npm run dev
```

Frontend จะรันที่ `http://localhost:5173`

### ⚠️ ถ้า Login ไม่ได้

1. ตรวจสอบว่า Backend รันอยู่ (ดู Terminal ที่รัน `dotnet run`)
2. ตรวจสอบ Console ใน Browser (กด F12)
3. ดูไฟล์ `TROUBLESHOOTING.md` สำหรับวิธีแก้ไขปัญหา

## Demo Accounts

- **Admin**: username: `admin`, password: `admin123`
- **User**: username: `user`, password: `user123`

## Database

Database จะถูกออกแบบและเชื่อมต่อในภายหลัง ตอนนี้ใช้ mock data

## Technologies

- Backend: ASP.NET Core 10.0, Entity Framework Core, SQL Server
- Frontend: React 19, Vite, Bootstrap, React Router, Leaflet Maps
- UI: Bootstrap with custom light blue theme
