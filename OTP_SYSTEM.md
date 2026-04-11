# 🔐 Mock SMS OTP System

## How It Works

The app now uses a **Mock SMS OTP system** that simulates real SMS delivery for development and testing.

### User Flow:

1. **Enter Phone Number** → User enters any 10-digit phone number
2. **Auto-Registration** → New users are automatically created on first login
3. **OTP Generation** → Backend generates a 4-digit OTP
4. **Mock SMS Display** → OTP shown in alert (simulates SMS receipt)
5. **Verification** → User enters OTP to complete login
6. **Access Granted** → Redirected to role-based dashboard

---

## 🎯 Key Features

### ✅ Auto-Registration
- **No signup page needed** - Login is the first screen
- **Automatic user creation** on first OTP request
- **Default role**: CITIZEN
- **Default name**: `User XXXX` (last 4 digits of phone)

### ✅ Mock OTP System
- OTP is displayed in an alert dialog
- Simulates receiving an SMS
- In production, integrates with SMS gateway (Twilio, MSG91, etc.)

### ✅ Development Mode
```
OTP for all users: 1234
```

---

## 🔧 Backend Implementation

### Auto-Registration Logic

**File**: `backend/src/controllers/authController.js`

```javascript
// Find or create user (auto-registration)
let user = await User.findOne({ phone });

if (!user) {
  // Auto-create user with default role CITIZEN
  user = await User.create({
    name: `User ${phone.slice(-4)}`,
    phone,
    role: 'CITIZEN',
    address: 'Not provided',
  });
  
  console.log(`✅ New user auto-registered: ${phone}`);
}
```

### OTP Generation

**File**: `backend/src/utils/helpers.js`

```javascript
const generateOTP = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};
```

---

## 📱 Frontend Implementation

### Login Screen Flow

**File**: `app/(auth)/login.tsx`

1. **Phone Input Step**:
   - User enters 10-digit phone number
   - Clicks "Send OTP"
   - Backend creates user if not exists
   - OTP generated and returned

2. **OTP Verification Step**:
   - Alert shows OTP (mock SMS)
   - User enters OTP
   - Backend verifies OTP
   - JWT token issued
   - User redirected to dashboard

### Mock SMS Alert

```typescript
Alert.alert(
  '📱 OTP Received (Mock SMS)',
  `Your BMC E-Waste OTP is: ${otpCode}\n\n(In production, this will be sent via SMS)`,
  [{ text: 'OK', style: 'default' }]
);
```

---

## 🧪 Testing

### Test with Any Phone Number

1. Enter any 10-digit number: `9876543210`
2. Click "Send OTP"
3. Alert shows OTP (e.g., `1234`)
4. Enter the OTP
5. Click "Verify & Login"
6. ✅ Logged in as Citizen!

### Pre-configured Demo Accounts

These accounts are created by the seed script with specific roles:

| Phone | Role | Use Case |
|-------|------|----------|
| 9876543210 | CITIZEN | Test citizen features |
| 9876543211 | VENDOR | Test vendor features |
| 9876543212 | ADMIN | Test admin features |

**OTP for all**: `1234`

---

## 🚀 Production SMS Integration

When ready for production SMS:

### Option 1: Twilio

```bash
npm install twilio
```

```javascript
// backend/src/services/smsService.js
const twilio = require('twilio');

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const sendSMS = async (phone, message) => {
  return await client.messages.create({
    body: message,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: `+91${phone}`,
  });
};
```

### Option 2: MSG91 (India)

```bash
npm install msg91
```

```javascript
const msg91 = require('msg91')(process.env.MSG91_AUTH_KEY);

const sendSMS = async (phone, message) => {
  return await msg91.send(phone, message);
};
```

### Update Auth Controller

```javascript
// Replace console.log with actual SMS
const otp = generateOTP();

// Store OTP in database with expiry
user.otp = otp;
user.otpExpiry = Date.now() + 5 * 60 * 1000; // 5 minutes
await user.save();

// Send via SMS
await sendSMS(phone, `Your BMC E-Waste OTP is: ${otp}`);

res.json({ 
  message: 'OTP sent successfully',
  // Don't return OTP in production!
});
```

---

## 🔒 Security Considerations

### Current (Development)
- ✅ OTP returned in API response
- ✅ Any 4-digit OTP accepted
- ✅ No OTP expiry
- ✅ No rate limiting

### Production Requirements
- ❌ Don't return OTP in API response
- ❌ Store hashed OTP in database
- ❌ Implement OTP expiry (5 minutes)
- ❌ Add rate limiting (max 3 attempts)
- ❌ Implement cooldown between requests (60 seconds)
- ❌ Log all OTP attempts
- ❌ Block suspicious activity

---

## 📊 User Registration Flow

```
User opens app
    ↓
Login screen (first screen)
    ↓
Enters phone number
    ↓
Backend checks if user exists
    ↓
    ├─ YES → Generate OTP
    └─ NO  → Create user → Generate OTP
    ↓
OTP sent via SMS (mock in dev)
    ↓
User enters OTP
    ↓
Backend verifies OTP
    ↓
JWT token issued
    ↓
User redirected to role-based dashboard
```

---

## 🎨 UI/UX Features

### Login Screen Elements:
- ✅ Clean, professional design
- ✅ BMC E-Waste branding
- ✅ Two-step process (Phone → OTP)
- ✅ Mock SMS alert with clear explanation
- ✅ Instructions on how it works
- ✅ Demo account references
- ✅ Loading states
- ✅ Error handling
- ✅ Back navigation (change phone number)

### User-Friendly Messages:
- "📱 OTP Received (Mock SMS)"
- "Your BMC E-Waste OTP is: 1234"
- "(In production, this will be sent via SMS)"

---

## 🛠️ Configuration

### Environment Variables

**Frontend** (`.env`):
```env
EXPO_PUBLIC_API_URL=http://localhost:5000/api
EXPO_PUBLIC_USE_MOCK=false
```

**Backend** (`backend/.env`):
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ewaste
JWT_SECRET=your_secret_key
NODE_ENV=development
```

### SMS Gateway Variables (Production)
```env
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=+1234567890

# OR

MSG91_AUTH_KEY=your_key
```

---

## ✅ Checklist

- [x] Auto-registration on first OTP request
- [x] Mock SMS OTP display via alert
- [x] Login as first screen (no signup page)
- [x] Default role: CITIZEN
- [x] Clear user instructions
- [x] Demo accounts documented
- [x] Error handling
- [x] Loading states
- [ ] Production SMS integration
- [ ] OTP expiry mechanism
- [ ] Rate limiting
- [ ] OTP attempt tracking

---

## 🆘 Troubleshooting

### "Failed to send OTP"
- Check backend is running on port 5000
- Verify MongoDB is connected
- Check network connection

### "Invalid OTP"
- Use `1234` for testing
- Make sure OTP is 4 digits
- Check backend logs for generated OTP

### "User not found"
- Auto-registration should create user
- Check MongoDB connection
- Verify phone number is 10 digits

---

## 📚 Related Files

- `app/(auth)/login.tsx` - Login screen UI
- `src/store/authStore.ts` - Authentication state management
- `backend/src/controllers/authController.js` - OTP & login logic
- `backend/src/utils/helpers.js` - OTP generation
- `backend/src/models/User.js` - User model

---

**Last Updated**: April 10, 2026
