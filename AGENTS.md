# BMC E-Waste Citizen App - UI Design Principles

## Overview

This document outlines the design principles and architecture for the redesigned citizen-facing UI in the BMC E-Waste Collection App. The app allows citizens to request e-waste pickup from BMC, with the option for home pickup or community drives.

---

## Design System

### Color Palette

| Purpose | Color | Hex Code |
|---------|-------|--------|
| Primary (Eco Green) | Emerald | `#10B981` |
| Primary Dark | Emerald 600 | `#059669` |
| Background | Slate 50 | `#F8FAFC` |
| Surface | White | `#FFFFFF` |
| Text Primary | Slate 900 | `#0F172A` |
| Text Secondary | Slate 500 | `#64748B` |
| Accent | Amber | `#F59E0B` |
| Error | Red | `#EF4444` |
| Success | Green | `#10B981` |

### Typography

- **Font**: System default (San Francisco on iOS)
- **Header**: 24-28px, Bold (700)
- **Subheader**: 18-20px, Semi-bold (600)
- **Body**: 14-16px, Regular (400)
- **Caption**: 12px, Medium (500)

### Spacing Scale

- `xs`: 4px
- `sm`: 8px  
- `md`: 12px
- `lg`: 16px
- `xl`: 20px
- `xxl`: 24px
- `xxxl`: 32px

### Border Radius

- `sm`: 6px
- `md`: 8px
- `lg`: 12px
- `xl`: 16px
- `full`: 9999px (pills)

---

## Screen Structure

### Tab Navigation

The citizen app uses bottom tab navigation with 4 tabs:

1. **Home** (Dashboard) - Eco stats, quick actions, recent activity
2. **Requests** - List of all pickup requests with filters
3. **Create** - Multi-step form to create new request
4. **Drives** - Community drive listings

### Screen Flow

```
Login → Dashboard (Home Tab)
         ├── Requests Tab → Request Details
         ├── Create Tab → [Type] → [Category] → [Quantity*] → [Address*] → Submit
         │                          (*Home Pickup only)
         └── Drives Tab → Join Drive
```

---

## Component Library

### Reusable Components

Located in `src/components/ui/`:

| Component | Purpose |
|-----------|---------|
| `StatCard.tsx` | Display statistics with icon and value |
| `StatusBadge.tsx` | Color-coded status indicator |
| `EmptyState.tsx` | Friendly empty state with CTA |
| `QuickActionButton.tsx` | Grid button for quick actions |
| `CategoryCard.tsx` | Category selection grid item |
| `RequestCard.tsx` | Request list item |
| `DriveCard.tsx` | Drive list item |
| `Header.tsx` | Screen header (used internally) |

### Icons

- Use **Ionicons** from `@expo/vector-icons`
- NO emojis as functional icons
- Consistent stroke width throughout

---

## Dashboard (Home Tab)

### Content Layout

1. **Welcome Header**
   - Greeting: "Welcome back, {Name}!"
   - Leaf icon (eco theme)

2. **Stats Grid** (2x2)
   - Recycled (kg) - fitness icon
   - CO2 Saved (kg) - leaf icon
   - Active (pickups) - car icon
   - Completed - checkmark icon

3. **Eco Impact Banner**
   - Full-width green card
   - Planet icon
   - Cumulative stats (kg recycled, CO2 saved)

4. **Quick Actions**
   - New Request
   - My Requests
   - Join Drive
   - Track Pickup

5. **Recent Activity**
   - Last 3 requests with status

---

## Create Request Form

### Step-by-Step Flow

**Step 1: Pickup Type**
- Two large cards: Home Pickup | Community Drive
- Icons: car | people

**Step 2: Category**
- Grid of 7 categories (2 columns)
- Categories: Mobile, Laptop, Computer, TV, Printer, Battery, Other
- Category icons for each type

**Step 3: Quantity** (Home Pickup only)
- Stepper control with +/- buttons
- Range: 1-10 items

**Step 4: Address** (Home Pickup only)
- Multi-line TextInput
- Placeholder: "Enter your complete address"

### Community Drive Shortcut

For Community Drive:
1. Select Type → 2. Select Category → Submit
- Skips quantity and address steps
- Automatically sets quantity=1
- Address defaults to "Community Drive Pickup"

---

## Requests Tab

### Features

- **Filter Tabs**: All | Pending | Scheduled | Completed | Cancelled
- **FlatList** of RequestCard components
- **Pull-to-refresh** enabled
- **Empty State** with CTA to create request

### RequestCard Display

- Category icon + name
- Status badge (color-coded)
- Quantity
- Address (truncated)
- Created date
- Scheduled date (if applicable)
- OTP for IN_PROGRESS requests

---

## Drives Tab

### Features

- **Filter Tabs**: Upcoming | All Drives
- **Info Banner**: Helper text about drives
- **FlatList** of DriveCard components
- **Pull-to-refresh** enabled

### DriveCard Display

- Location with icon
- Date and time
- Capacity progress bar
- Registered count
- Join button / Full badge

---

## Status Definitions

| Status | Color | Label |
|-------|-------|-------|
| CREATED | `#F59E0B` (Amber) | Pending |
| SCHEDULED | `#3B82F6` (Blue) | Scheduled |
| IN_PROGRESS | `#8B5CF6` (Purple) | In Progress |
| COMPLETED | `#10B981` (Green) | Completed |
| CANCELLED | `#EF4444` (Red) | Cancelled |

---

## API Integration

### Mock Mode

Set `EXPO_PUBLIC_USE_MOCK=true` in `.env` to use mock data for development.

### Store Structure

`useRequestStore` manages:
- `requests[]` - User's pickup requests
- `drives[]` - Available community drives
- `isLoading` - Loading state
- `error` - Error message

### Stats Calculation

```javascript
// Stats calculated from requests
activeCount = requests.filter(r => CREATED || SCHEDULED || IN_PROGRESS).length
completedCount = requests.filter(r => COMPLETED).length
totalRecycled = completedCount * 2 // kg estimate
co2Saved = totalRecycled * 0.5 // kg CO2
```

---

## Best Practices Followed

1. **No Emojis** - All icons from Ionicons
2. **Safe Areas** - Respected on all screens
3. **Touch Targets** - Minimum 44x44px
4. **Loading States** - ActivityIndicator during load
5. **Pull-to-Refresh** - On all list screens
6. **Error Handling** - Alert on failure
7. **Form Validation** - Required fields checked
8. **Empty States** - Friendly with CTA

---

## File Structure

```
app/(tabs)/citizen/
├── _layout.tsx        # Tab navigation
├── dashboard.tsx      # Home screen
├── requests.tsx       # My requests list
├── create.tsx          # Create request form
└── drives.tsx         # Community drives

src/components/ui/
├── StatCard.tsx
├── StatusBadge.tsx
├── EmptyState.tsx
├── QuickActionButton.tsx
├── CategoryCard.tsx
├── RequestCard.tsx
├── DriveCard.tsx
└── index.ts          # Export all

src/store/
└── requestStore.ts   # State management

constants/
└── theme.ts         # Colors, spacing, etc.
```

---

## Environment Variables

```
EXPO_PUBLIC_API_URL=http://192.168.1.45:3000/api
EXPO_PUBLIC_USE_MOCK=true
```

---

## Running the App

```bash
# Install dependencies
npm install

# Start Expo
npx expo start

# For production (mock disabled)
# Set EXPO_PUBLIC_USE_MOCK=false in .env
```