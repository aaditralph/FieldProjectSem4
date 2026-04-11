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
- `/` (root) - Expo/React Native mobile app (not a workspace)
- `/bmc-web` - React web dashboard for BMC (Vite + React + Zustand)

**No vendor bidding/payments** - Simple ticketing flow:
1. Citizen creates ticket with date/time slot + address + image (mobile app)
2. Admin views tickets, updates status (Created → Scheduled → In Progress → Completed) (mobile or web)
3. Admin manages available date/time slots in "Date Slots" tab (mobile or web)

## Critical Backend Notes

- **Required env vars**: `MONGODB_URI`, `JWT_SECRET`, `DEFAULT_VENDOR_ID`
- `DEFAULT_VENDOR_ID` only appears after first seed - must manually add to `.env`
- Images stored locally in `/backend/uploads/` (not S3) - accessible at `http://localhost:5000/uploads/`
- DateSlot model manages ticket capacity per time slot
- CORS enabled for web dashboard on port 3000

## Mobile App Structure

**Entry:** `app/_layout.tsx` (Expo Router)
**Auth flow:** `app/(auth)/login.tsx` → role-based tabs
**Screens:**
- Citizen: `app/(tabs)/citizen/` - index (list), create (form), request/[id] (detail)
- Admin: `app/(tabs)/admin/` - index (dashboard), dateslots (slot management), request/[id] (status update)

## BMC Web Dashboard Structure

**Entry:** `bmc-web/src/main.tsx`
**Auth flow:** `bmc-web/src/pages/Login.tsx` → protected routes
**Pages:**
- `/` - Dashboard (stats overview)
- `/tickets` - Tickets list with filters
- `/tickets/:id` - Ticket detail with status update
- `/date-slots` - Date slot management (CRUD + auto-generate)

## Key Implementation Details

- **State**: Zustand stores in `src/store/` - auth, request, date slots
- **API**: Axios client in `src/api/`, endpoints in `endpoints.ts`
- **Types**: `src/types/index.ts` (simplified from original pricing/category model)
- **Image upload**: Uses `expo-image-picker` + FormData to `/api/upload`

## Common Mistakes

- Forgetting to add `DEFAULT_VENDOR_ID` after seed
- Using `localhost` for Android emulator (use `10.0.2.2` instead)
- Missing MongoDB running before backend start
- Web dashboard CORS errors - backend must be running first
- Not using same `DEFAULT_VENDOR_ID` in web dashboard env if deployed separately

## API Endpoints

- `POST /api/auth/login` - OTP-based auth
- `GET /api/auth/me` - Get current user
- `GET /api/requests/available-slots` - Public slot availability
- `POST /api/requests` - Create ticket (checks slot capacity)
- `GET /api/requests` - List tickets (filterable by status)
- `GET /api/requests/:id` - Get ticket details
- `PUT /api/requests/:id/status` - Admin update status
- `GET/POST/PUT /api/admin/date-slots` - Slot management
- `POST /api/upload` - Image upload (multipart/form-data)
- `GET /api/admin/stats` - Dashboard statistics

## File Locations

- Backend controllers: `backend/src/controllers/`
- Backend models: `backend/src/models/`
- Backend routes: `backend/src/routes/`
- Mobile stores: `src/store/`
- Mobile screens: `app/(tabs)/{role}/`
- Web dashboard pages: `bmc-web/src/pages/`
- Web stores: `bmc-web/src/store/`
- Web services: `bmc-web/src/services/`
