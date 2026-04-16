# 📱 Fix: "Failed to Send OTP" on Phone

## Problem

When testing on your physical phone, you get **"Failed to send OTP"** error because:

- Your `.env` has `EXPO_PUBLIC_API_URL=http://localhost:5000/api`
- `localhost` on your **phone** ≠ `localhost` on your **computer**
- Your phone can't reach your computer's localhost

---

## ✅ Solution 1: Use Mock Mode (Recommended for Testing)

I've already enabled this for you! The app now uses **mock data** instead of calling the backend.

### Current Configuration:
```env
EXPO_PUBLIC_USE_MOCK=true
```

### What This Does:
- ✅ OTP works without backend
- ✅ All features work with mock data
- ✅ No network connection needed
- ✅ Perfect for UI/UX testing

### How to Test:
1. Reload the app (press `r` in Metro terminal)
2. Enter any phone number: `9876543210`
3. Click "Send OTP"
4. Mock OTP `1234` will appear in alert
5. Login successfully! ✅

---

## 🔧 Solution 2: Connect to Real Backend from Phone

If you want to test with the **real backend**, follow these steps:

### Step 1: Find Your Computer's IP Address

```bash
# On your computer, run:
ip addr show | grep "inet " | grep -v 127.0.0.1
```

Look for something like: `192.168.137.66` or `10.0.0.5`

### Step 2: Update Frontend .env

Edit `/home/infirio/Documents/ewaste/.env`:

```env
# Replace with YOUR computer's IP address
EXPO_PUBLIC_API_URL=http://192.168.137.66:5000/api

EXPO_PUBLIC_USE_MOCK=false
```

### Step 3: Ensure Backend Allows External Connections

Your backend should already be listening on all interfaces (`0.0.0.0`), but verify:

```bash
# Check if backend is accessible
curl http://YOUR_IP:5000/api/health
```

### Step 4: Make Sure Phone and Computer Are on Same WiFi

- Both devices must be on the **same network**
- Check your phone's WiFi settings

### Step 5: Restart Expo

```bash
# Stop current Expo (Ctrl+C)
# Restart with:
npx expo start --clear
```

### Step 6: Test from Phone

1. Open app on phone
2. Enter phone: `9876543210`
3. Click "Send OTP"
4. Should work! ✅

---

## 🔍 Troubleshooting

### "Network Error" or "Failed to send OTP"

**Check 1: Can your phone reach your computer?**
```bash
# From your phone's browser, try:
http://YOUR_IP:5000/api/health
```

If it doesn't load:
- Firewall might be blocking port 5000
- Phone and computer not on same network

**Check 2: Is backend running?**
```bash
# On your computer:
lsof -i :5000
```

Should show the Node.js process.

**Check 3: Test API from computer**
```bash
curl http://localhost:5000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phone":"9876543210"}'
```

Should return: `{"message":"OTP sent successfully","otp":"1234"}`

### Firewall Issues (Ubuntu)

```bash
# Allow port 5000
sudo ufw allow 5000/tcp

# Check firewall status
sudo ufw status
```

### Backend Not Listening on External IP

Update `backend/src/server.js`:

```javascript
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 API URL: http://YOUR_IP:${PORT}/api`);
});
```

---

## 🎯 Recommended Workflow

### For Development & Testing:
```env
EXPO_PUBLIC_USE_MOCK=true
```
- Fast testing
- No backend needed
- All UI features work

### For Integration Testing:
```env
EXPO_PUBLIC_USE_MOCK=false
EXPO_PUBLIC_API_URL=http://YOUR_IP:5000/api
```
- Test real API calls
- Test database operations
- Test authentication flow

### For Production:
```env
EXPO_PUBLIC_USE_MOCK=false
EXPO_PUBLIC_API_URL=https://your-backend.onrender.com/api
```
- Deployed backend
- Real SMS OTP
- Production database

---

## 📊 Current Status

| Component | Status | Details |
|-----------|--------|---------|
| **Mock Mode** | ✅ Enabled | Works on phone immediately |
| **Backend** | ✅ Running | Port 5000 on your computer |
| **MongoDB** | ✅ Connected | Database ready |
| **Phone Access** | ⚠️ Mock Mode | Use mock or update IP |

---

## 🚀 Quick Fix (What I Did)

I changed your `.env` to use mock mode:

**Before:**
```env
EXPO_PUBLIC_USE_MOCK=false  ❌ Can't reach backend from phone
```

**After:**
```env
EXPO_PUBLIC_USE_MOCK=true   ✅ Works on phone now!
```

---

## ✅ Next Steps

1. **Reload the app** on your phone
2. Try logging in with any phone number
3. Mock OTP will appear in alert
4. Test all features!

When you're ready to test with the real backend, follow **Solution 2** above.

---

**Need help?** Check the backend logs in the terminal where you ran `npm start`.
