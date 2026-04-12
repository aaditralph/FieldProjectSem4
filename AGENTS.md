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

## Common Mistakes

- Forgetting to add `DEFAULT_VENDOR_ID` after seed
- Using `localhost` for Android emulator (use `10.0.2.2`)
- Missing MongoDB before backend start
- Web dashboard CORS errors - backend must run first
- Different `DEFAULT_VENDOR_ID` in web dashboard if deployed separately

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