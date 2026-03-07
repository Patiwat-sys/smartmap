# วิธีทดสอบ Backend

## 1. รัน Backend
```bash
cd backend/SmartMap.API
dotnet run
```

Backend จะรันที่:
- HTTP: http://localhost:5000
- HTTPS: https://localhost:7000

## 2. ทดสอบ API ด้วย Browser หรือ Postman

เปิด browser ไปที่:
- http://localhost:5000/api/users (ควรเห็น JSON response)

หรือทดสอบ Login API:
- URL: http://localhost:5000/api/auth/login
- Method: POST
- Headers: Content-Type: application/json
- Body (JSON):
```json
{
  "username": "user",
  "password": "user123"
}
```

## 3. ตรวจสอบว่า Backend รันอยู่

ดูที่ terminal ควรเห็นข้อความ:
```
Now listening on: http://localhost:5000
```

## 4. ถ้ายังไม่ได้ ให้ตรวจสอบ

1. ตรวจสอบว่า port 5000 ไม่ถูกใช้งานโดยโปรแกรมอื่น
2. ตรวจสอบ firewall
3. ลองเปลี่ยน port ใน launchSettings.json
