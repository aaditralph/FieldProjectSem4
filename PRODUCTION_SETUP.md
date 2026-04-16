# 🚀 Production Backend Setup - React Native App

## ✅ Current Status

### **Production Mode: ENABLED**
```
✅ Backend: Running on port 5000
✅ MongoDB: Connected
✅ Mock Mode: DISABLED (EXPO_PUBLIC_USE_MOCK=false)
✅ API URL: http://192.168.137.66:5000/api
✅ Expo: Running with production config
```

---

## 📋 Configuration Files

### **Frontend `.env`** (React Native App)
```env
# Backend API URL - Your computer's IP address
EXPO_PUBLIC_API_URL=http://192.168.137.66:5000/api

# Mock mode DISABLED for production
EXPO_PUBLIC_USE_MOCK=false
```

### **Backend `.env`** (Node.js Server)
```env
PORT=5000
MONGODB_URI=mongodb://admin:ewaste_secure_password_2024@localhost:27017/ewaste?authSource=admin
JWT_SECRET=ewaste_jwt_secret_key_2024_change_in_production
NODE_ENV=development
```

---

## 🔄 How It Works Now

### **Before (Mock Mode):**
```
React Native App → Mock API (src/api/mock.ts) → Fake Data
```

### **Now (Production Mode):**
```
React Native App → Real Backend (localhost:5000) → MongoDB → Real Data
```

---

## 🧪 Testing Production Mode

### **1. Test Backend Health**
```bash
curl http://192.168.137.66:5000/api/health
```

**Expected Response:**
```json
{
  "status": "OK",
  "message": "E-waste management system API is running",
  "timestamp": "2026-04-14T..."
}
```

### **2. Test OTP Endpoint**
```bash
curl -X POST http://192.168.137.66:5000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phone":"9876543210"}'
```

**Expected Response:**
```json
{
  "message": "OTP sent successfully",
  "otp": "1234"
}
```

### **3. Test from React Native App**

1. **Open Expo Go** on your phone
2. **Scan QR code** from terminal
3. **Login with any phone number**:
   - Enter: `9876543210`
   - Click "Send OTP"
   - Backend generates real OTP
   - **In development, OTP is returned in API response**
   - Enter the OTP
   - Click "Verify & Login"
4. **Should login successfully** and redirect to dashboard

---

## 📱 Phone Connection Setup

### **Important: Network Requirements**

Your phone **MUST** be on the **same WiFi network** as your computer.

### **Step 1: Find Your Computer's IP**
```bash
# Already configured: 192.168.137.66
# To verify:
ip addr show | grep "inet " | grep -v 127.0.0.1
```

### **Step 2: Test Phone Can Reach Backend**
On your phone's browser, open:
```
http://192.168.137.66:5000/api/health
```

**Should show:**
```json
{"status":"OK","message":"E-waste management system API is running",...}
```

If it **doesn't load**:
- Check phone and computer are on same WiFi
- Check firewall settings (see troubleshooting below)

### **Step 3: Update .env if IP Changed**
If your computer's IP changes, update:
```env
EXPO_PUBLIC_API_URL=http://YOUR_NEW_IP:5000/api
```

Then restart Expo:
```bash
npx expo start --clear
```

---

## 🔥 Running Services

### **Backend (Terminal 1):**
```bash
cd /home/infirio/Documents/ewaste/backend
npm start
```

**Should show:**
```
🚀 Server running on port 5000
📡 Local: http://localhost:5000/api
🌐 Network: http://192.168.137.66:5000/api
📱 Use the Network URL in your React Native app .env file
✅ MongoDB Connected: localhost
```

### **Expo (Terminal 2):**
```bash
cd /home/infirio/Documents/ewaste
npx expo start --clear
```

**Should show:**
```
› Metro waiting on exp://192.168.137.66:8081
› Scan the QR code above with Expo Go
```

---

## 🔒 Security Notes

### **Development (Current):**
- ✅ OTP returned in API response (for testing)
- ⚠️ JWT_SECRET is weak (change for production)
- ⚠️ MongoDB password is default (change for production)
- ⚠️ CORS allows all origins (restrict for production)

### **Production Deployment Checklist:**
1. **Change JWT_SECRET** to a strong random string:
   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

2. **Change MongoDB password** to something secure

3. **Use MongoDB Atlas** instead of localhost for cloud deployment

4. **Deploy backend** to Render.com, Heroku, or AWS

5. **Update frontend .env** with deployed backend URL:
   ```env
   EXPO_PUBLIC_API_URL=https://your-app.onrender.com/api
   ```

6. **Implement real SMS OTP** (Twilio, MSG91, etc.)

7. **Restrict CORS** to your app's domain

---

## 🐛 Troubleshooting

### **Error: "Network Error" or "Failed to load..."**

**Check 1: Is backend running?**
```bash
lsof -i :5000
```
Should show Node.js process.

**Check 2: Can you reach backend from computer?**
```bash
curl http://192.168.137.66:5000/api/health
```

**Check 3: Can you reach backend from phone?**
Open in phone browser: `http://192.168.137.66:5000/api/health`

**Check 4: Firewall blocking?**
```bash
# Allow port 5000
sudo ufw allow 5000/tcp

# Check status
sudo ufw status
```

**Check 5: Same WiFi network?**
- Phone and computer MUST be on same network
- Check your phone's WiFi settings

---

### **Error: "MongoDB connection failed"**

**Start MongoDB:**
```bash
# Option 1: Local MongoDB
sudo systemctl start mongod

# Option 2: Docker
cd /home/infirio/Documents/ewaste/docker
docker compose up -d
```

**Check MongoDB is running:**
```bash
lsof -i :27017
```

---

### **Error: "Invalid token" or "Unauthorized"**

This means the backend is working but authentication failed.

**Test login flow:**
1. Send OTP: `curl -X POST http://192.168.137.66:5000/api/auth/send-otp -H "Content-Type: application/json" -d '{"phone":"9876543210"}'`
2. Note the OTP returned
3. Login with that OTP in the app

---

### **Backend Logs Show Errors**

Check the backend terminal for error messages. Common issues:
- MongoDB not running
- Port 5000 already in use
- Invalid .env configuration

---

## 📊 Data Flow

### **Authentication Flow:**
```
1. User enters phone number in app
2. App calls: POST /api/auth/send-otp
3. Backend generates OTP (1234)
4. Backend creates/finds user in MongoDB
5. Backend returns OTP in response (development only)
6. User enters OTP in app
7. App calls: POST /api/auth/login
8. Backend validates OTP
9. Backend generates JWT token
10. Backend saves token to SecureStore
11. App navigates to dashboard
```

### **Data Operations:**
```
Citizen creates request → Backend → MongoDB → Returns request ID
Vendor completes pickup → Backend → MongoDB → Updates status
Admin views stats → Backend → MongoDB → Aggregates data
```

---

## 🎯 Quick Commands

### **Start Everything:**
```bash
# Terminal 1 - Backend
cd ~/Documents/ewaste/backend && npm start

# Terminal 2 - Frontend
cd ~/Documents/ewaste && npx expo start --clear
```

### **Stop Everything:**
```bash
pkill -f "node src/server.js"
pkill -f "expo start"
```

### **Restart Backend:**
```bash
pkill -f "node src/server.js"
cd ~/Documents/ewaste/backend && npm start
```

### **Restart Expo:**
```bash
pkill -f "expo start"
cd ~/Documents/ewaste && npx expo start --clear
```

---

## 📝 What Changed

| Setting | Before (Mock) | Now (Production) |
|---------|---------------|------------------|
| **EXPO_PUBLIC_USE_MOCK** | `true` | `false` |
| **Data Source** | `src/api/mock.ts` | MongoDB via backend |
| **Authentication** | Mock users | Real MongoDB users |
| **Requests** | Fake data | Real database records |
| **Drives** | Mock drives | Real drives collection |
| **Pickups** | Mock pickups | Real pickup data |
| **Stats** | Hardcoded | Real aggregation |

---

## ✅ Verification Checklist

- [x] Backend running on port 5000
- [x] MongoDB connected
- [x] Mock mode disabled (`EXPO_PUBLIC_USE_MOCK=false`)
- [x] API URL set to network IP (`192.168.137.66`)
- [x] Backend accessible from network
- [x] Expo running with production config
- [ ] Test login from phone
- [ ] Test creating a request
- [ ] Test viewing data in all screens

---

## 🚀 Next Steps

1. **Test the app** on your phone with real backend
2. **Verify all features** work (login, create requests, view data)
3. **Check MongoDB** to see real data being stored
4. **Deploy backend** to cloud (Render.com recommended)
5. **Update API URL** to deployed backend URL
6. **Implement real SMS** for production OTP

---

**Your app is now in PRODUCTION MODE!** 🎉

All data is real and stored in MongoDB. The app communicates with your backend server, which manages the database.

**Scan the QR code and test it out!**
