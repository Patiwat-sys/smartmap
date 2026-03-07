# Smart Map API

ASP.NET Core Web API สำหรับ Smart Map Project

## การรันโปรเจค

```bash
dotnet restore
dotnet run
```

API จะรันที่:
- HTTP: `http://localhost:5000`
- HTTPS: `https://localhost:7000`

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register

### Users (Admin only)
- `GET /api/users` - Get all users
- `GET /api/users/{id}` - Get user by ID
- `PUT /api/users/{id}` - Update user
- `DELETE /api/users/{id}` - Delete user

### Location Pins
- `GET /api/locationpins` - Get all location pins
- `GET /api/locationpins/{id}` - Get location pin by ID
- `POST /api/locationpins` - Create location pin
- `PUT /api/locationpins/{id}` - Update location pin
- `DELETE /api/locationpins/{id}` - Delete location pin

## Database

Database connection string อยู่ใน `appsettings.json`
ตอนนี้ใช้ mock data จะเชื่อมต่อ database จริงในภายหลัง
