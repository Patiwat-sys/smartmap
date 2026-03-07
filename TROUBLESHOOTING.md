# แก้ไขปัญหา Login Failed

## ปัญหา: Login failed. Please try again.

### วิธีแก้ไข:

#### 1. ตรวจสอบว่า Backend รันอยู่หรือไม่

**เปิด Terminal ใหม่** และรัน:
```bash
cd backend/SmartMap.API
dotnet run
```

คุณควรเห็นข้อความ:
```
Now listening on: http://localhost:5000
```

**สำคัญ:** Backend ต้องรันอยู่ก่อนที่จะ login ได้!

#### 2. ตรวจสอบ Port

- Backend ควรรันที่: `http://localhost:5000`
- Frontend ควรรันที่: `http://localhost:5173`

#### 3. ทดสอบ Backend โดยตรง

เปิด Browser ไปที่:
- http://localhost:5000/api/users

ควรเห็น JSON response ถ้า backend รันอยู่

#### 4. ตรวจสอบ Console ใน Browser

เปิด Developer Tools (F12) ใน Browser และดู Console tab
- ถ้าเห็น error "Network Error" = Backend ไม่ได้รัน
- ถ้าเห็น error อื่น = ดู error message

#### 5. Demo Accounts

- **Admin**: username: `admin`, password: `admin123`
- **User**: username: `user`, password: `user123`

#### 6. ลำดับการรัน

1. **รัน Backend ก่อน:**
   ```bash
   cd backend/SmartMap.API
   dotnet run
   ```

2. **รัน Frontend (เปิด Terminal ใหม่):**
   ```bash
   cd frontend
   npm run dev
   ```

3. **เปิด Browser:** http://localhost:5173

#### 7. ถ้ายังไม่ได้

ลองเปลี่ยน port ใน `backend/SmartMap.API/Properties/launchSettings.json`:
```json
"applicationUrl": "http://localhost:5000"
```

และอัปเดต URL ใน `frontend/src/pages/Login.jsx` ให้ตรงกับ port ที่ backend รัน
