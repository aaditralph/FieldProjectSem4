# EXPLANATION.md - BMC E-Waste Application Feature Specification

This document outlines all features, data flows, and backend connections for the BMC E-Waste Collection Application. This is a comprehensive guide for understanding **what the system does**, not how it looks.

---

## Table of Contents

1. [Application Overview](#1-application-overview)
2. [User Roles](#2-user-roles)
3. [Authentication System](#3-authentication-system)
4. [Citizen Features](#4-citizen-features)
5. [Vendor Features](#5-vendor-features)
6. [Admin Features](#6-admin-features)
7. [API Endpoints](#7-api-endpoints)
8. [Data Models](#8-data-models)
9. [State Management](#9-state-management)
10. [Backend Connection](#10-backend-connection)
11. [Environment Configuration](#11-environment-configuration)
12. [Feature-to-Endpoint Mapping](#12-feature-to-endpoint-mapping)

---

## 1. Application Overview

**BMC E-Waste Collection System** is a full-stack mobile application that enables citizens to request e-waste pickup from the Brihanmumbai Municipal Corporation (BMC). The system supports:

- **Home Pickup**: Direct collection from citizen's address
- **Community Drives**: Scheduled collection events at community locations
- **Vendor Management**: Assigned pickups for BMC-registered vendors
- **Admin Dashboard**: Pricing configuration and analytics

### Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend | Expo (React Native) with Expo Router |
| Backend | Express.js with Node.js |
| Database | MongoDB with Mongoose |
| Authentication | JWT tokens with SecureStore |
| State Management | Zustand |

---

## 2. User Roles

The system supports three distinct roles:

### CITIZEN
- Regular users who want to dispose of e-waste
- Can create pickup requests
- Can join community drives
- View their request history and eco impact stats

### VENDOR
- BMC-registered collection agents
- Accept assigned pickups
- Complete pickups with weight/condition recording
- View completed pickup history

### ADMIN
- BMC administrators
- Configure pricing rates
- Assign vendors to requests
- View analytics and reports

---

## 3. Authentication System

### Login Flow

```
1. User enters 10-digit phone number
2. App calls POST /api/auth/send-otp
3. Backend generates 4-digit OTP (stored in memory with 5-minute expiry)
4. Backend sends SMS (mocked - displays OTP in dev mode)
5. User enters OTP
6. App calls POST /api/auth/login with phone + otp
7. Backend validates OTP and:
   - Creates new user if phone not registered (auto-registration)
   - Returns JWT token + user data
8. App stores JWT token in SecureStore
9. All subsequent requests include JWT in Authorization header
```

### Token Management

- **Storage**: expo-secure-store
- **Header Format**: `Authorization: Bearer <token>`
- **Expiry**: JWT tokens expire after 7 days
- **401 Handling**: Auto-logout and redirect to login

---

## 4. Citizen Features

### 4.1 Dashboard (Home Tab)

**Purpose**: Central hub showing eco impact and quick actions

**Data Displayed**:
- User greeting with name
- Stats grid:
  - `totalRecycled`: Sum of completed request quantities (in kg)
  - `co2Saved`: Calculated as `totalRecycled * 0.5` (kg CO2)
  - `activeCount`: Number of requests with status CREATED, SCHEDULED, or IN_PROGRESS
  - `completedCount`: Number of completed requests
- Quick action buttons for navigation
- Recent Activity: Last 3 requests

**Store**: `useRequestStore` - `fetchDashboardStats()` and `fetchRecentRequests()`

---

### 4.2 Create Request

**Purpose**: Multi-step form to create new pickup request

**Step 1: Pickup Type**
- Options: `HOME_PICKUP` or `DRIVE`
- Required field

**Step 2: Category**
- Options: `Mobile Phone`, `Laptop`, `Desktop Computer`, `Television`, `Printer`, `Battery`, `Other Electronics`
- Required field

**Step 3: Quantity** (Home Pickup only)
- Range: 1-10 items
- Uses stepper control (+/-)

**Step 4: Address** (Home Pickup only)
- Multi-line text input
- Required field

**Step 5: Drive Selection** (Community Drive only)
- List of available drives
- User selects one drive

**Submission**:
- Calls `POST /api/requests`
- Creates request with status `CREATED`
- Redirects to request details

**Store**: `useRequestStore` - `createRequest()`

---

### 4.3 My Requests (Requests Tab)

**Purpose**: List all pickup requests with filtering

**Filter Tabs**:
- `ALL`: All requests
- `PENDING`: Status CREATED
- `SCHEDULED`: Status SCHEDULED
- `COMPLETED`: Status COMPLETED
- `CANCELLED`: Status CANCELLED

**Features**:
- Pull-to-refresh enabled
- FlatList with RequestCard components
- Empty state with CTA

**Request Card Display**:
- Category icon and name
- Status badge (color-coded)
- Quantity
- Address (truncated to 30 chars)
- Created date
- Scheduled date (if SCHEDULED)
- OTP (if IN_PROGRESS)

**Store**: `useRequestStore` - `fetchRequests(filter?)`

---

### 4.4 Request Details

**Purpose**: Full request information page

**Sections**:
- Status badge with color
- Category icon and name
- Quantity
- Address
- Created date
- Scheduled date (if applicable)
- OTP display (for IN_PROGRESS)
- Status timeline

**Actions**:
- Cancel button (if CREATED or SCHEDULED)
- Calls `POST /api/requests/:id/cancel`

**Store**: `useRequestStore` - `cancelRequest(id)`

---

### 4.5 Community Drives (Drives Tab)

**Purpose**: Browse and join community drives

**Filter Tabs**:
- `UPCOMING`: Drives with date in future
- `ALL`: All drives

**Drive Card Display**:
- Location
- Date and time
- Capacity progress bar (registeredCount / capacity)
- Registered count
- Action: Join button or "Full" badge

**Join Action**:
- Calls `POST /api/drives/:id/join`
- Creates new request linked to drive
- Quantity defaults to 1

**Store**: `useRequestStore` - `fetchDrives()` and `joinDrive(id)`

---

## 5. Vendor Features

### 5.1 Pickup Management

**Purpose**: View and manage assigned pickups

**Features**:
- List of assigned pickups (status CREATED or SCHEDULED)
- Pull-to-refresh
- Accept pickup button
- Request details view

**Accept Action**:
- Calls `POST /api/vendor/pickups/:id/accept`
- Updates status to IN_PROGRESS
- Generates OTP

**Store**: `useVendorStore` - `fetchPickups()` and `acceptPickup(id)`

---

### 5.2 Complete Pickup

**Purpose**: Mark pickup as completed with details

**Required Data**:
- OTP: 4-digit code from citizen
- Weight: Weight in kg (numeric)
- Condition: `WORKING`, `PARTIAL`, or `SCRAP`

**Calculation**:
```
Final Price = Base Price * Weight * Condition Factor
```

**Condition Factors**:
- WORKING: 1.0 (100%)
- PARTIAL: 0.7 (70%)
- SCRAP: 0.4 (40%)

**Completion Action**:
- Calls `POST /api/vendor/pickups/:id/complete`
- Updates request status to COMPLETED
- Records weight, condition, final price

**Store**: `useVendorStore` - `completePickup(id, data)`

---

### 5.3 Completed Pickups

**Purpose**: View completed pickup history

**Features**:
- List of completed pickups (placeholder implementation)
- Date, category, weight, final price

**Store**: `useVendorStore` - `fetchCompletedPickups()`

---

## 6. Admin Features

### 6.1 Dashboard

**Purpose**: Overview of system stats and pending actions

**Stats Grid**:
- `totalRequests`: All requests count
- `completedRequests`: Completed count
- `pendingRequests`: Pending scheduling count
- `totalAmount`: Sum of all completed pickup payments

**Pending Assignments**:
- List of requests needing vendor assignment
- Assign vendor modal

**Assign Action**:
- Calls `POST /api/admin/requests/:id/assign`
- Select vendor from dropdown
- Updates request with assigned vendor

**Store**: `useAdminStore` - `fetchStats()` and `assignVendor(requestId, vendorId)`

---

### 6.2 Pricing Management

**Purpose**: Configure rates per category

**Display**:
- Category name
- Rate per kg (base price)
- Condition multipliers:
  - Working factor
  - Partial factor
  - Scrap factor

**Update Action**:
- Calls `PUT /api/pricing`
- Updates rate per kg and/or condition factors

**Store**: `useAdminStore` - `fetchPricing()` and `updatePricing(config)`

---

### 6.3 Reports

**Purpose**: Analytics and export (placeholder)

**Features**:
- Date range filter
- Report types:
  - Collection summary
  - Category breakdown
  - Vendor performance

**Store**: `useAdminStore` - `fetchReports()`

---

## 7. API Endpoints

### Authentication (`/api/auth`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/send-otp` | Send OTP to phone | None |
| POST | `/login` | Login with phone + OTP | None |
| GET | `/me` | Get current user | JWT |

### Requests (`/api/requests`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/` | Create new request | JWT |
| GET | `/` | Get all requests (with filters) | JWT |
| GET | `/:id` | Get request by ID | JWT |
| POST | `/:id/schedule` | Schedule a request | JWT |
| POST | `/:id/cancel` | Cancel a request | JWT |

### Drives (`/api/drives`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | Get all drives | JWT |
| POST | `/` | Create new drive (Admin) | JWT |
| POST | `/:id/join` | Join a drive | JWT |
| PUT | `/:id` | Update drive (Admin) | JWT |
| DELETE | `/:id` | Delete drive (Admin) | JWT |

### Vendor (`/api/vendor`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/pickups` | Get assigned pickups | JWT |
| GET | `/pickups/:id` | Get pickup details | JWT |
| POST | `/pickups/:id/accept` | Accept pickup | JWT |
| POST | `/pickups/:id/complete` | Complete pickup | JWT |

### Transactions (`/api/transactions`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/request/:requestId` | Get transaction for request | JWT |
| POST | `/:id/mark-paid` | Mark as paid (Admin) | JWT |

### Audit (`/api/audit`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/request/:requestId` | Get audit logs | JWT |
| POST | `/` | Create audit log | JWT |

### Pricing (`/api/pricing`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | Get all pricing configs | JWT |
| PUT | `/` | Update pricing config (Admin) | JWT |

### Admin (`/api/admin`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/stats` | Get dashboard stats | JWT |
| GET | `/reports` | Get reports | JWT |
| GET | `/requests` | Get all requests | JWT |
| GET | `/vendors` | Get all vendors | JWT |
| POST | `/requests/:id/assign` | Assign vendor | JWT |

---

## 8. Data Models

### User

```javascript
{
  name: String (required),
  phone: String (required, unique, 10 digits),
  email: String,
  role: 'CITIZEN' | 'VENDOR' | 'ADMIN' (default: 'CITIZEN'),
  address: String,
  createdAt: Date
}
```

### Request

```javascript
{
  userId: ObjectId (ref: User),
  category: String (enum: e-waste categories),
  quantity: Number (min: 1),
  address: String,
  status: String (enum: 'CREATED' | 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'),
  scheduledTime: Date,
  imageUrl: String,
  otp: String (4 digits),
  assignedVendorId: ObjectId (ref: User),
  type: 'HOME_PICKUP' | 'DRIVE',
  driveId: ObjectId (ref: Drive),
  createdAt: Date,
  updatedAt: Date
}
```

### Drive

```javascript
{
  location: String,
  date: Date,
  capacity: Number,
  registeredCount: Number,
  createdAt: Date
}
```

### Pickup

```javascript
{
  requestId: ObjectId (ref: Request),
  otp: String,
  weight: Number,
  condition: 'WORKING' | 'PARTIAL' | 'SCRAP',
  completedAt: Date,
  finalPrice: Number
}
```

### Transaction

```javascript
{
  requestId: ObjectId (ref: Request),
  amount: Number,
  status: 'PENDING' | 'PAID' | 'FAILED',
  upiRef: String,
  createdAt: Date
}
```

### AuditLog

```javascript
{
  action: String,
  actorRole: 'CITIZEN' | 'VENDOR' | 'ADMIN',
  actorId: ObjectId (ref: User),
  timestamp: Date,
  meta: Object
}
```

### PricingConfig

```javascript
{
  category: String,
  ratePerKg: Number,
  conditionFactors: {
    WORKING: Number,
    PARTIAL: Number,
    SCRAP: Number
  }
}
```

---

## 9. State Management

### Store Files

| Store | File | Purpose |
|-------|------|----------|
| Auth | `src/store/authStore.ts` | User authentication state |
| Requests | `src/store/requestStore.ts` | Citizen requests, drives |
| Vendor | `src/store/vendorStore.ts` | Vendor pickups |
| Admin | `src/store/adminStore.ts` | Admin stats, pricing |

### Auth Store (`authStore.ts`)

**State**:
```typescript
{
  user: User | null,
  token: string | null,
  isLoading: boolean,
  isAuthenticated: boolean
}
```

**Actions**:
- `sendOTP(phone)`: Call POST /api/auth/send-otp
- `login(phone, otp)`: Call POST /api/auth/login
- `loadUser()`: Load stored token and user on app start
- `logout()`: Clear auth state

---

### Request Store (`requestStore.ts`)

**State**:
```typescript
{
  requests: Request[],
  drives: Drive[],
  stats: DashboardStats,
  isLoading: boolean,
  error: string | null
}
```

**Actions**:
- `fetchDashboardStats()`: Get user stats for dashboard
- `fetchRecentRequests()`: Get last 3 requests
- `createRequest(data)`: POST /api/requests
- `fetchRequests(filter?)`: GET /api/requests with optional status filter
- `fetchRequestById(id)`: GET /api/requests/:id
- `cancelRequest(id)`: POST /api/requests/:id/cancel
- `fetchDrives(filter?)`: GET /api/drives with date filter
- `joinDrive(id)`: POST /api/drives/:id/join

---

### Vendor Store (`vendorStore.ts`)

**State**:
```typescript
{
  pickups: Request[],
  completedPickups: Request[],
  isLoading: boolean,
  error: string | null
}
```

**Actions**:
- `fetchPickups()`: GET /api/vendor/pickups
- `acceptPickup(id)`: POST /api/vendor/pickups/:id/accept
- `completePickup(id, data)`: POST /api/vendor/pickups/:id/complete
- `fetchCompletedPickups()`: GET /api/vendor/pickups?status=COMPLETED

---

### Admin Store (`adminStore.ts`)

**State**:
```typescript
{
  stats: AdminStats,
  pricing: PricingConfig[],
  reports: Report[],
  requests: Request[],
  vendors: User[],
  isLoading: boolean,
  error: string | null
}
```

**Actions**:
- `fetchStats()`: GET /api/admin/stats
- `fetchRequests()`: GET /api/admin/requests
- `assignVendor(requestId, vendorId)`: POST /api/admin/requests/:id/assign
- `fetchPricing()`: GET /api/pricing
- `updatePricing(config)`: PUT /api/pricing
- `fetchReports()`: GET /api/admin/reports
- `fetchVendors()`: GET /api/admin/vendors

---

## 10. Backend Connection

### API Client (`src/api/client.ts`)

**Configuration**:
- Base URL: `EXPO_PUBLIC_API_URL` from .env
- Timeout: 15 seconds
- Content-Type: application/json

**Request Interceptor**:
- Retrieves token from SecureStore
- Adds `Authorization: Bearer <token>` header

**Response Interceptor**:
- Handles 401: Clears token, redirects to login
- Handles errors: Shows Alert with message

---

### Mock Mode

When `EXPO_PUBLIC_USE_MOCK=true`:
- All API calls route to mock functions
- Returns in-memory mock data
- Simulates network delay (300-500ms)
- Useful for development without backend

**Mock Data**:
- 5 sample requests
- 3 sample drives
- 2 sample vendors

---

## 11. Environment Configuration

### Frontend (.env)

```bash
EXPO_PUBLIC_API_URL=http://192.168.29.247:5000/api
EXPO_PUBLIC_USE_MOCK=false  # or true for development
```

### Backend (backend/.env)

```bash
MONGODB_URI=mongodb://root:password@localhost:27017/ewaste
JWT_SECRET=your_jwt_secret_key
PORT=5000
NODE_ENV=development
OTP_EXPIRY=300  # seconds
```

---

## 12. Feature-to-Endpoint Mapping

### Citizen Features

| Feature | API Call | Store Action |
|---------|----------|--------------|
| Login | POST /api/auth/login | authStore.login() |
| Send OTP | POST /api/auth/send-otp | authStore.sendOTP() |
| View Dashboard Stats | GET /api/requests | requestStore.fetchDashboardStats() |
| View Recent Requests | GET /api/requests | requestStore.fetchRecentRequests() |
| Create Request | POST /api/requests | requestStore.createRequest() |
| View My Requests | GET /api/requests | requestStore.fetchRequests() |
| View Request Details | GET /api/requests/:id | requestStore.fetchRequestById() |
| Cancel Request | POST /api/requests/:id/cancel | requestStore.cancelRequest() |
| View Drives | GET /api/drives | requestStore.fetchDrives() |
| Join Drive | POST /api/drives/:id/join | requestStore.joinDrive() |

### Vendor Features

| Feature | API Call | Store Action |
|---------|----------|--------------|
| View Pickups | GET /api/vendor/pickups | vendorStore.fetchPickups() |
| Accept Pickup | POST /api/vendor/pickups/:id/accept | vendorStore.acceptPickup() |
| Complete Pickup | POST /api/vendor/pickups/:id/complete | vendorStore.completePickup() |
| View History | GET /api/vendor/pickups?status=COMPLETED | vendorStore.fetchCompletedPickups() |

### Admin Features

| Feature | API Call | Store Action |
|---------|----------|--------------|
| View Stats | GET /api/admin/stats | adminStore.fetchStats() |
| View All Requests | GET /api/admin/requests | adminStore.fetchRequests() |
| Assign Vendor | POST /api/admin/requests/:id/assign | adminStore.assignVendor() |
| View Pricing | GET /api/pricing | adminStore.fetchPricing() |
| Update Pricing | PUT /api/pricing | adminStore.updatePricing() |
| View Reports | GET /api/admin/reports | adminStore.fetchReports() |
| View Vendors | GET /api/admin/vendors | adminStore.fetchVendors() |

---

## 13. Status Workflow

### Request Lifecycle (Home Pickup)

```
CREATED → SCHEDULED → IN_PROGRESS → COMPLETED
                     ↓
                   CANCELLED
```

**Transitions**:
- CREATED → SCHEDULED: Admin assigns vendor
- SCHEDULED → IN_PROGRESS: Vendor accepts pickup
- IN_PROGRESS → COMPLETED: Vendor completes with weight/condition
- CREATED/SCHEDULED → CANCELLED: Citizen cancels

### Request Lifecycle (Community Drive)

```
CREATED → SCHEDULED → IN_PROGRESS → COMPLETED
                     ↓
                   CANCELLED
```

**Transitions**:
- Similar to Home Pickup but tied to Drive entity

---

## 14. Error Handling

### API Errors

| Code | Meaning | Handling |
|------|---------|----------|
| 400 | Bad Request | Show Alert with error message |
| 401 | Unauthorized | Clear token, redirect to login |
| 403 | Forbidden | Show Alert "Access denied" |
| 404 | Not Found | Show Alert "Resource not found" |
| 500 | Server Error | Show Alert "Server error, try again" |

### Form Validation

| Field | Rule |
|-------|------|
| Phone | Exactly 10 digits |
| OTP | Exactly 4 digits |
| Category | Required, from enum |
| Quantity | 1-10 |
| Address | Required, min 10 chars |
| Drive | Required for DRIVE type |

---

## 15. Pricing Calculation

### Formula

```
Final Price = RatePerKg(category) * Weight * ConditionFactor
```

### Default Rates (INR/kg)

| Category | Rate |
|-----------|------|
| Mobile Phone | 100 |
| Laptop | 150 |
| Desktop Computer | 120 |
| Television | 80 |
| Printer | 90 |
| Battery | 60 |
| Other Electronics | 70 |

### Condition Factors

| Condition | Factor | Description |
|-----------|--------|-------------|
| WORKING | 1.0 | Fully functional |
| PARTIAL | 0.7 | Partially functional |
| SCRAP | 0.4 | Non-functional/parts |

---

## 16. Key Implementation Patterns

### Optimistic Updates

Request creation uses optimistic update pattern:
1. Immediately update local state
2. API call in background
3. Rollback on failure

### Pull-to-Refresh

All list screens implement pull-to-refresh:
- Uses RefreshControl
- Calls fetch action on pull
- Shows loading indicator

### Loading States

Every async operation shows loading:
- isLoading state in store
- ActivityIndicator in UI
- Disable buttons during loading

### Empty States

List screens show friendly empty state:
- Icon representing empty
- Message explaining empty
- CTA to create first item

---

## Summary

This application is a complete e-waste management system with:

1. **Three user roles**: Citizen, Vendor, Admin
2. **Phone/OTP authentication** with auto-registration
3. **Request lifecycle**: Create → Schedule → Accept → Complete
4. **Two pickup types**: Home Pickup and Community Drive
5. **Pricing system**: Category-based rates with condition multipliers
6. **Audit trail**: All actions logged for compliance

Each feature maps to specific API endpoints, store actions, and data flows documented above.