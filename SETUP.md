# E-Waste Management System - Setup Guide

## Quick Setup (5 minutes)

### Step 1: Install MongoDB

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install -y mongodb
sudo systemctl start mongodb
sudo systemctl enable mongodb
```

**Verify MongoDB is running:**
```bash
mongosh
# Should connect successfully
```

### Step 2: Setup Backend

```bash
cd backend
npm install

# Seed database (creates users and pricing)
npm run seed

# IMPORTANT: Copy the DEFAULT_VENDOR_ID from output
# Then add to backend/.env:
# DEFAULT_VENDOR_ID=<paste_id_here>

# Start backend
npm run dev
```

Backend running at: http://localhost:5000

### Step 3: Setup Frontend

```bash
cd /home/infirio/Documents/ewaste
npm install

# Update .env if needed (already configured for localhost)
# EXPO_PUBLIC_API_URL=http://localhost:5000/api

# Start Expo
npx expo start
```

### Step 4: Test the App

**Test Credentials (OTP: 1234 for all):**
- Citizen: 9876543210
- Vendor: 9876543211  
- Admin: 9876543212

**Complete Test Flow:**
1. Login as Citizen → Create Request → Schedule Pickup
2. Logout → Login as Vendor → See Pickup → Complete with OTP
3. Logout → Login as Citizen → See Completed Request
4. Logout → Login as Admin → View Stats & Reports

## Troubleshooting

**MongoDB connection failed:**
```bash
sudo systemctl status mongodb
sudo systemctl start mongodb
```

**Backend won't start:**
```bash
cd backend
rm -rf node_modules
npm install
npm run seed
npm run dev
```

**Port 5000 already in use:**
```bash
# Change PORT in backend/.env to 5001
# Update EXPO_PUBLIC_API_URL in .env to http://localhost:5001/api
```

**Expo can't connect:**
- Android emulator: Use `http://10.0.2.2:5000/api`
- Physical device: Use your computer's IP address

## Next Steps

1. Deploy backend to Render/Railway for production
2. Update `.env` with deployed backend URL
3. Build APK with `eas build --platform android`
4. Distribute to users

Enjoy! 🚀
