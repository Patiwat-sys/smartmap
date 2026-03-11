# Smart Map API

ASP.NET Core Web API สำหรับ Smart Map Project

## 🗄️ Database Setup

ดูคำแนะนำการติดตั้งฐานข้อมูลใน `Database/README.md`

## 🚀 การรันโปรเจค

```bash
cd backend/SmartMap.API
dotnet restore
dotnet run
```

API จะรันที่:
- HTTP: `http://localhost:5000`
- HTTPS: `https://localhost:7000`

## 📁 Folder Structure สำหรับไฟล์

โปรแกรมจะสร้าง folder structure อัตโนมัติ:

```
SmartMap.API/
├── uploads/
│   ├── maps/
│   │   └── {Year}/
│   │       └── {Month}/
│   ├── verify-seams/
│   │   └── {VerifySeamId}/
│   └── geophysic/
│       └── {HoleName}/
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register

### Users (Admin only)
- `GET /api/users` - Get all users
- `GET /api/users/{id}` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/{id}` - Update user
- `DELETE /api/users/{id}` - Delete user

### Monthly Maps
- `GET /api/monthlymaps` - Get all maps (optional: ?year={year}&month={month})
- `GET /api/monthlymaps/{year}/{month}` - Get map by year/month
- `POST /api/monthlymaps` - Upload map (multipart/form-data)
- `PUT /api/monthlymaps/{id}` - Update map
- `DELETE /api/monthlymaps/{id}` - Delete map

### Verify Seams
- `GET /api/verifyseams` - Get all verify seams (optional: ?blockName={name}&status={status})
- `GET /api/verifyseams/{id}` - Get verify seam details
- `POST /api/verifyseams` - Create verify seam
- `PUT /api/verifyseams/{id}` - Update verify seam
- `DELETE /api/verifyseams/{id}` - Delete verify seam
- `POST /api/verifyseams/{id}/photos` - Upload photo (multipart/form-data)
- `DELETE /api/verifyseams/{id}/photos/{photoId}` - Delete photo
- `POST /api/verifyseams/{id}/verifiers` - Add verifier

### Geophysic Holes
- `GET /api/geophysicholes` - Get all holes (optional: ?holeName={name})
- `GET /api/geophysicholes/{id}` - Get hole details
- `POST /api/geophysicholes` - Upload hole data (multipart/form-data, PDF only)
- `PUT /api/geophysicholes/{id}` - Update hole data
- `DELETE /api/geophysicholes/{id}` - Delete hole

### Activity Logs
- `GET /api/activitylogs` - Get all logs (optional: ?userId={id}&actionType={type}&startDate={date}&endDate={date}&page={page}&pageSize={size})
- `GET /api/activitylogs/user/{userId}` - Get user logs
- `GET /api/activitylogs/stats` - Get activity statistics

## 🔐 Default Users

หลังจากรัน `CreateTables.sql` จะมี default users:

- **Admin:** username: `admin`, password: `admin123`
- **User:** username: `user`, password: `user123`

## 📊 Database Schema

ดูรายละเอียดใน `DATABASE_DESIGN.md` ที่ root ของโปรเจค

## 🛠️ Technologies

- ASP.NET Core 10.0
- Entity Framework Core
- SQL Server
- C#
