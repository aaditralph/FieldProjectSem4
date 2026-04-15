# AGENTS.md - E-Cycler BMC Ticketing System

## Quick Start (Run in this order)

```bash
# 1. Start MongoDB
sudo systemctl start mongodb

# 2. Setup backend
cd backend
npm install
npm run seed  # Copy DEFAULT_VENDOR_ID from output!
echo "DEFAULT_VENDOR_ID=<paste_id_here>" >> .env
npm run dev   # Backend on http://localhost:5000

# 3. Start mobile app (new terminal)
npm install
npx expo start

# 4. Start BMC Web Dashboard (optional, another terminal)
cd bmc-web
npm install
npm run dev   # Web on http://localhost:3000
```

## Test Credentials (OTP: 1234 for all)
| Role | Phone |
|------|-------|
| Citizen | 9876543210 |
| Vendor | 9876543211 |
| Admin | 9876543212 |

## Architecture

**Two-package monorepo:**
- `/backend` - Node.js/Express API + MongoDB
- `/` (root) - Expo/React Native mobile app
- `/bmc-web` - React web dashboard (Vite + React + Zustand)

**No vendor bidding/payments** - Simple ticketing flow:
1. Citizen creates ticket with date/time slot + address + image (mobile app)
2. Admin views tickets, updates status (Created → Scheduled → In Progress → Completed)
3. Admin manages available date/time slots

## Critical Backend Notes

- **Required env vars**: `MONGODB_URI`, `JWT_SECRET`, `DEFAULT_VENDOR_ID`
- `DEFAULT_VENDOR_ID` only appears after first seed - must manually add to `.env`
- Images stored locally in `/backend/uploads/` - accessible at `http://localhost:5000/uploads/`
- DateSlot model manages ticket capacity per time slot
- CORS enabled for web dashboard on port 3000
- MongoDB connection string format: No duplicate `mongodb://` prefix (was: `mongodb://mongodb://...`, should be: `mongodb://...`)  
- Auth credentials: `mongodb://admin:ewaste_secure_password_2024@localhost:27017/ewaste?authSource=admin`
- Application user: `mongodb://ewaste_user:ewaste_password_2024@localhost:27017/ewaste`

## Environment Files Structure

**Backend** (`backend/.env`):
```bash
MONGODB_URI=mongodb://admin:ewaste_secure_password_2024@localhost:27017/ewaste?authSource=admin
JWT_SECRET=your_jwt_secret_here
DEFAULT_VENDOR_ID=from_seed_output
```

**Mobile App** (`.env` in root):
```bash
EXPO_PUBLIC_API_URL=http://YOUR_IP:5000/api  # NOT localhost
EXPO_PUBLIC_USE_MOCK=false  # Set 'true' for offline testing without backend
```

## Mobile App Structure

**Entry:** `app/_layout.tsx` (Expo Router)
**Auth flow:** `app/(auth)/login.tsx` → role-based tabs
**Screens:**
- Citizen: `app/(tabs)/citizen/` - tickets list, create, detail
- Admin: `app/(tabs)/admin/` - dashboard, dateslots management, ticket status update

## BMC Web Dashboard Structure

**Entry:** `bmc-web/src/main.tsx`
**Auth flow:** `bmc-web/src/pages/Login.tsx` → protected routes
**Pages:**
- `/` - Dashboard (stats)
- `/tickets` - Tickets list with filters
- `/tickets/:id` - Ticket detail
- `/date-slots` - Date slot CRUD

## Key Implementation Details

- **State**: Zustand stores in `src/store/`
- **API**: Axios client in `src/api/`
- **Types**: `src/types/index.ts`
- **Image upload**: `expo-image-picker` + FormData to `/api/upload`
- **Mock Mode**: Set `EXPO_PUBLIC_USE_MOCK=true` to test without backend running
- **Auth Token Storage**: Stored in `expo-secure-store` (SecureStore) - survives app restarts
- **Test OTP**: Always `1234` (hardcoded in mock and backend seed)

## Debugging Commands

**Clear ALL caches when weird errors occur:**
```bash
# Stop expo first, then run:
rm -rf .expo/
rm -rf node_modules/.cache
npx expo start --clear

# If entry.js corrupted (shows Bun console.log):
cat > expo-router/entry.js << 'EOF'
import "expo-router/entry";
EOF
```

## Critical Expo Go Fixes

### AppRegistryBinding Error (Global not installed)
**Cause:** New architecture incompatibility + corrupted entry file  
**Fix:**
1. Set `"newArchEnabled": false` in `app.json`
2. Ensure `babel.config.js` exists:
```js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: ['react-native-reanimated/plugin'],
  };
};
```
3. **CRITICAL:** Check `expo-router/entry.js` is not corrupted:
```js
// Should be ONLY this line, NOT a console.log:
import "expo-router/entry";
```
4. Clear cache: `npx expo start --clear`

### Request Detail Page Crash
**Error:** `cannot read property 'slice' of undefined`  
**Cause:** `currentRequest.id` is undefined when data loads  
**Fix:** Use optional chaining:
```typescript
// Change this:
{currentRequest.id.slice(-8)}
// To this:
{currentRequest.id?.slice?.(-8) || 'N/A'}
```
**Files:** `app/(tabs)/citizen/request/[id].tsx` line 236, `app/(tabs)/admin/request/[id].tsx` line 245

### Mobile App Won't Connect to Backend
**Cause:** Using `localhost` on device/emulator  
**Fix:** Use machine's IP address:
```bash
# Edit .env in project root:
EXPO_PUBLIC_API_URL=http://192.168.X.X:5000/api  # Your machine's IP
```
**Android Emulator:** Use `http://10.0.2.2:5000/api`  
**Requirement:** Phone/emulator must be on same WiFi network

## Common Mistakes

- Forgetting to add `DEFAULT_VENDOR_ID` after seed
- Using `localhost` for Android emulator (use `10.0.2.2`)
- Missing MongoDB before backend start
- Web dashboard CORS errors - backend must run first
- Different `DEFAULT_VENDOR_ID` in web dashboard if deployed separately
- Not clearing cache after fixing entry.js or babel config

## API Endpoints

- `POST /api/auth/login` - OTP auth
- `GET /api/auth/me` - Current user
- `GET /api/requests/available-slots` - Slot availability
- `POST /api/requests` - Create ticket
- `GET /api/requests` - List tickets
- `GET /api/requests/:id` - Ticket details
- `PUT /api/requests/:id/status` - Update status
- `GET/POST/PUT /api/admin/date-slots` - Slot management
- `POST /api/upload` - Image upload
- `GET /api/admin/stats` - Dashboard stats

## File Locations

- Backend: `backend/src/controllers/`, `backend/src/models/`, `backend/src/routes/`
- Mobile: `src/store/`, `app/(tabs)/{role}