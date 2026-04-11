# BMC E-Waste Management System

A production-ready, full-stack e-waste management system built with React Native (Expo) and Node.js/Express/MongoDB.

## 🎯 Features

### Three User Roles
- **Citizen**: Create e-waste pickup requests, schedule pickups, join drives, track status, view receipts
- **Vendor**: View assigned pickups, verify OTP, complete pickups, record weight/condition
- **Admin**: Manage drives, configure pricing, view statistics and reports, audit logs

### Key Capabilities
- ✅ OTP-based authentication with JWT
- ✅ Real-time request tracking with audit timeline
- ✅ Automated pricing calculation (rate × weight × condition factor)
- ✅ OTP-based handover verification
- ✅ Scheduled pickups with time slots
- ✅ Community e-waste drives
- ✅ Complete audit logging for all actions
- ✅ Role-based access control
- ✅ Production-ready architecture

## 🛠 Tech Stack

### Backend
- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- bcryptjs for password hashing

### Frontend (Mobile App)
- React Native with Expo
- TypeScript
- Zustand (State Management)
- React Navigation
- Axios (API Client)
- Expo SecureStore (Token storage)
- dayjs (Date handling)

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- Expo Go app (for testing on mobile)

## 🚀 Quick Start

### 1. Setup Backend

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file (already created, update as needed)
# MONGODB_URI=mongodb://localhost:27017/ewaste
# JWT_SECRET=your_secret_key_here
# PORT=5000

# Start MongoDB (if running locally)
# Windows: mongod
# Mac/Linux: sudo systemctl start mongod

# Seed the database with initial data
npm run seed

# IMPORTANT: Copy the DEFAULT_VENDOR_ID from seed output
# Add it to backend/.env file:
# DEFAULT_VENDOR_ID=<paste_vendor_id_here>

# Start backend server
npm run dev
```

Backend will run at: `http://localhost:5000`

### 2. Setup Frontend (Mobile App)

```bash
# Navigate to project root
cd /home/infirio/Documents/ewaste

# Install dependencies (if not already done)
npm install

# Update .env file with backend URL
# EXPO_PUBLIC_API_URL=http://localhost:5000/api
# EXPO_PUBLIC_USE_MOCK=false

# Start Expo development server
npx expo start
```

Then:
- Press `w` to open in web browser
- Scan QR code with Expo Go app (iOS/Android)
- Press `i` for iOS simulator or `a` for Android emulator

## 👥 Test Credentials

After running `npm run seed` in backend:

| Role    | Phone       | Password    | OTP  |
|---------|-------------|-------------|------|
| Citizen | 9876543210  | password123 | 1234 |
| Vendor  | 9876543211  | password123 | 1234 |
| Admin   | 9876543212  | password123 | 1234 |

## 📁 Project Structure

```
ewaste/
├── backend/                    # Node.js/Express Backend
│   ├── src/
│   │   ├── config/            # Database configuration
│   │   ├── controllers/       # Route controllers
│   │   ├── middleware/        # Auth middleware
│   │   ├── models/            # Mongoose models
│   │   ├── routes/            # API routes
│   │   ├── utils/             # Helper functions
│   │   └── server.js          # Express app entry
│   ├── scripts/
│   │   └── seed.js            # Database seeder
│   └── package.json
│
├── src/                        # React Native Frontend
│   ├── api/                   # API client & endpoints
│   ├── components/            # Reusable UI components
│   ├── features/              # Feature-specific code
│   │   ├── auth/              # Authentication
│   │   ├── citizen/           # Citizen features
│   │   ├── vendor/            # Vendor features
│   │   └── admin/             # Admin features
│   ├── navigation/            # React Navigation setup
│   ├── store/                 # Zustand stores
│   ├── types/                 # TypeScript types
│   └── utils/                 # Utilities (pricing, scheduling)
│
├── app/                        # Expo Router screens
├── .env                        # Frontend environment variables
└── package.json
```

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/send-otp` - Send OTP to phone
- `POST /api/auth/login` - Login with phone + OTP
- `GET /api/auth/me` - Get current user (protected)

### Requests (Citizen)
- `POST /api/requests` - Create e-waste request
- `GET /api/requests` - Get user's requests
- `GET /api/requests/:id` - Get request details
- `POST /api/requests/:id/schedule` - Schedule pickup
- `POST /api/requests/:id/cancel` - Cancel request

### Vendor
- `GET /api/vendor/pickups` - Get assigned pickups
- `GET /api/vendor/pickups/:id` - Get pickup details
- `POST /api/vendor/pickups/:id/complete` - Complete pickup with OTP

### Drives
- `GET /api/drives` - List all drives (public)
- `POST /api/drives` - Create drive (admin only)
- `POST /api/drives/:id/join` - Join a drive
- `PUT /api/drives/:id` - Update drive (admin)
- `DELETE /api/drives/:id` - Delete drive (admin)

### Pricing
- `GET /api/pricing` - Get pricing config (public)
- `PUT /api/pricing` - Update pricing (admin only)

### Audit & Admin
- `POST /api/audit` - Log audit event
- `GET /api/audit/request/:id` - Get audit logs for request
- `GET /api/admin/stats` - Get dashboard stats (admin)
- `GET /api/admin/reports?period=daily` - Get reports (admin)

## 💰 Pricing Formula

```
Final Price = rate_per_kg(category) × weight(kg) × condition_factor

Condition Factors:
- WORKING: 1.0
- PARTIAL: 0.7
- SCRAP: 0.4
```

Default rates per category (configurable by admin):
- Mobile Phone: ₹100/kg
- Laptop: ₹150/kg
- Desktop Computer: ₹120/kg
- Television: ₹80/kg
- Printer: ₹90/kg
- Battery: ₹60/kg
- Other Electronics: ₹70/kg

## 🔒 Security Features

- JWT token authentication
- Password hashing with bcryptjs
- Role-based access control (RBAC)
- Secure token storage (SecureStore)
- Protected API routes
- Input validation
- CORS enabled
- Helmet for security headers

## 🌐 Deployment

### Deploy Backend to Render/Railway

1. Create account on [Render](https://render.com) or [Railway](https://railway.app)
2. Connect your GitHub repository
3. Set environment variables:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ewaste
   JWT_SECRET=your_production_secret
   NODE_ENV=production
   DEFAULT_VENDOR_ID=<vendor_id_from_seed>
   ```
4. Deploy

### Deploy Mobile App

1. Update `EXPO_PUBLIC_API_URL` in `.env` to your deployed backend URL
2. Build APK/IPA:
   ```bash
   eas build --platform android
   eas build --platform ios
   ```
3. Publish to app stores or distribute via Expo

## 📱 Usage Flow

### Citizen Flow
1. Login with phone + OTP
2. Create e-waste request (category, quantity, address)
3. Schedule pickup (choose date + time slot)
4. Receive OTP for handover
5. Show OTP to vendor during pickup
6. Track request status
7. View payment receipt after completion

### Vendor Flow
1. Login with phone + OTP
2. View assigned pickups
3. Visit pickup location
4. Verify citizen's OTP
5. Enter weight and condition
6. Complete pickup (auto-calculates price)
7. Payment recorded

### Admin Flow
1. Login with admin credentials
2. View dashboard statistics
3. Create/manage e-waste drives
4. Configure pricing per category
5. View all requests and audit logs
6. Generate reports

## 🐛 Troubleshooting

### Backend won't start
- Ensure MongoDB is running
- Check `.env` file has correct MongoDB URI
- Run `npm run seed` to initialize database

### Frontend can't connect to backend
- Verify `EXPO_PUBLIC_API_URL` in `.env`
- If using Android emulator, use `http://10.0.2.2:5000/api` instead of localhost
- Ensure backend is running on correct port

### OTP not working
- Default OTP for testing: `1234`
- Check backend console for generated OTP

### Database errors
- Run `npm run seed` to reset database
- Check MongoDB connection string

## 📝 Environment Variables

### Backend (backend/.env)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ewaste
JWT_SECRET=your_secret_key
NODE_ENV=development
DEFAULT_VENDOR_ID=<vendor_object_id>
```

### Frontend (.env)
```env
EXPO_PUBLIC_API_URL=http://localhost:5000/api
EXPO_PUBLIC_USE_MOCK=false
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is built for BMC E-Waste Management System.

## 📞 Support

For issues or questions, please check the troubleshooting section or create an issue in the repository.

---

**Built with ❤️ for sustainable e-waste management**
