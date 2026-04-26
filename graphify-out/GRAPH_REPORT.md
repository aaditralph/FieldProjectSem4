# Graph Report - .  (2026-04-25)

## Corpus Check
- 101 files · ~74,578 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 259 nodes · 235 edges · 31 communities detected
- Extraction: 92% EXTRACTED · 8% INFERRED · 0% AMBIGUOUS · INFERRED: 19 edges (avg confidence: 0.82)
- Token cost: 2,300 input · 750 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Authentication & Login|Authentication & Login]]
- [[_COMMUNITY_Community Drives Management|Community Drives Management]]
- [[_COMMUNITY_Vendor Pickup & Pricing Logic|Vendor Pickup & Pricing Logic]]
- [[_COMMUNITY_Citizen Request Creation Flow|Citizen Request Creation Flow]]
- [[_COMMUNITY_Admin Dashboard & Request Assignment|Admin Dashboard & Request Assignment]]
- [[_COMMUNITY_Core Admin & OTP Mock Utilities|Core Admin & OTP Mock Utilities]]
- [[_COMMUNITY_Scheduling & Date Utilities|Scheduling & Date Utilities]]
- [[_COMMUNITY_iOS Native Integration|iOS Native Integration]]
- [[_COMMUNITY_Citizen Dashboard & Quick Actions|Citizen Dashboard & Quick Actions]]
- [[_COMMUNITY_Theme & Color Hooks|Theme & Color Hooks]]
- [[_COMMUNITY_Project Architecture & Documentation|Project Architecture & Documentation]]
- [[_COMMUNITY_Role-based Tab Layouts|Role-based Tab Layouts]]
- [[_COMMUNITY_Request Lifecycle Controllers|Request Lifecycle Controllers]]
- [[_COMMUNITY_Vendor UI & Request Cards|Vendor UI & Request Cards]]
- [[_COMMUNITY_Citizen Request List|Citizen Request List]]
- [[_COMMUNITY_Audit Logging & Reporting|Audit Logging & Reporting]]
- [[_COMMUNITY_Citizen Request Details|Citizen Request Details]]
- [[_COMMUNITY_Pricing Configuration API|Pricing Configuration API]]
- [[_COMMUNITY_Auth & Route Protection|Auth & Route Protection]]
- [[_COMMUNITY_Drive Card UI Utilities|Drive Card UI Utilities]]
- [[_COMMUNITY_UI Component Library|UI Component Library]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Request Store State|Request Store State]]
- [[_COMMUNITY_Category Selection UI|Category Selection UI]]
- [[_COMMUNITY_Global Screen Header|Global Screen Header]]

## God Nodes (most connected - your core abstractions)
1. `BMC E-Waste Citizen App` - 7 edges
2. `handleLogout()` - 6 edges
3. `ReactNativeDelegate` - 6 edges
4. `generateOTP()` - 5 edges
5. `loadDashboard()` - 4 edges
6. `loadRequests()` - 4 edges
7. `sendOtp()` - 4 edges
8. `login()` - 4 edges
9. `useColorScheme()` - 4 edges
10. `calculatePrice()` - 4 edges

## Surprising Connections (you probably didn't know these)
- `Request Store` --manages_state_for--> `BMC E-Waste Citizen App`  [INFERRED]
  src/store/requestStore.ts → AGENTS.md
- `BMC E-Waste Citizen App` --requires--> `MongoDB Setup`  [INFERRED]
  AGENTS.md → MONGODB_SETUP.md
- `BMC E-Waste Citizen App` --uses--> `OTP System`  [INFERRED]
  AGENTS.md → OTP_SYSTEM.md
- `BMC E-Waste Citizen App` --includes--> `Vendor Assignment System`  [INFERRED]
  AGENTS.md → VENDOR_ASSIGNMENT_SYSTEM.md
- `BMC E-Waste Citizen App` --deployable_via--> `Docker Setup`  [INFERRED]
  AGENTS.md → docker/README.md

## Communities

### Community 0 - "Authentication & Login"
Cohesion: 0.21
Nodes (8): getMe(), login(), sendOtp(), calculatePrice(), generateOTP(), generateToken(), handleLogin(), handleSendOtp()

### Community 1 - "Community Drives Management"
Cohesion: 0.27
Nodes (8): createDrive(), deleteDrive(), getDrives(), joinDrive(), updateDrive(), handleJoinDrive(), loadDrives(), onRefresh()

### Community 2 - "Vendor Pickup & Pricing Logic"
Cohesion: 0.29
Nodes (7): calculateEstimatedPrice(), calculatePrice(), acceptPickup(), completePickup(), getPickupById(), getPickups(), startPickup()

### Community 3 - "Citizen Request Creation Flow"
Cohesion: 0.38
Nodes (8): decrementQuantity(), goBack(), handleCategorySelect(), handleContinueToAddress(), handlePickupTypeSelect(), handleSubmit(), incrementQuantity(), resetForm()

### Community 4 - "Admin Dashboard & Request Assignment"
Cohesion: 0.47
Nodes (7): calculateStats(), getStatusColor(), handleAssignVendor(), loadDashboard(), loadRequests(), loadVendors(), openAssignModal()

### Community 5 - "Core Admin & OTP Mock Utilities"
Cohesion: 0.31
Nodes (5): assignVendor(), getAllRequests(), getVendors(), delay(), generateOTP()

### Community 6 - "Scheduling & Date Utilities"
Cohesion: 0.39
Nodes (7): canCancel(), canReschedule(), formatDate(), formatDateTime(), getAvailableDates(), getAvailableTimeSlots(), getRelativeTime()

### Community 7 - "iOS Native Integration"
Cohesion: 0.31
Nodes (4): AppDelegate, ReactNativeDelegate, ExpoAppDelegate, ExpoReactNativeFactoryDelegate

### Community 8 - "Citizen Dashboard & Quick Actions"
Cohesion: 0.46
Nodes (6): handleNewRequest(), handleTrackPickup(), handleViewDrives(), handleViewRequests(), loadRequests(), onRefresh()

### Community 9 - "Theme & Color Hooks"
Cohesion: 0.25
Nodes (3): RootLayout(), useColorScheme(), useThemeColor()

### Community 10 - "Project Architecture & Documentation"
Cohesion: 0.25
Nodes (7): BMC E-Waste Citizen App, Docker Setup, MongoDB Setup, OTP System, Request Store, UI Design Principles, Vendor Assignment System

### Community 11 - "Role-based Tab Layouts"
Cohesion: 0.29
Nodes (1): handleLogout()

### Community 12 - "Request Lifecycle Controllers"
Cohesion: 0.48
Nodes (5): cancelRequest(), createRequest(), getRequestById(), getRequests(), scheduleRequest()

### Community 13 - "Vendor UI & Request Cards"
Cohesion: 0.33
Nodes (3): VendorHomeScreen(), formatDate(), RequestCard()

### Community 14 - "Citizen Request List"
Cohesion: 0.6
Nodes (4): handleCreateRequest(), handleRequestPress(), loadRequests(), onRefresh()

### Community 15 - "Audit Logging & Reporting"
Cohesion: 0.53
Nodes (4): getAdminStats(), getAuditLogsByRequest(), getReports(), logAudit()

### Community 16 - "Citizen Request Details"
Cohesion: 0.6
Nodes (3): formatDateTime(), handleCancel(), handleRefresh()

### Community 17 - "Pricing Configuration API"
Cohesion: 0.67
Nodes (2): getPricing(), updatePricing()

### Community 18 - "Auth & Route Protection"
Cohesion: 0.67
Nodes (2): authorize(), protect()

### Community 19 - "Drive Card UI Utilities"
Cohesion: 0.67
Nodes (2): formatDate(), formatTime()

### Community 20 - "UI Component Library"
Cohesion: 0.67
Nodes (4): StatCard Component, StatusBadge Component, Theme Constants, UI Component Library

### Community 21 - "Community 21"
Cohesion: 0.67
Nodes (1): Index()

### Community 22 - "Community 22"
Cohesion: 0.67
Nodes (1): AuthLayout()

### Community 23 - "Community 23"
Cohesion: 0.67
Nodes (1): PricingScreen()

### Community 24 - "Community 24"
Cohesion: 0.67
Nodes (1): ReportsScreen()

### Community 25 - "Community 25"
Cohesion: 0.67
Nodes (1): CompletedScreen()

### Community 26 - "Community 26"
Cohesion: 0.67
Nodes (1): seedData()

### Community 27 - "Community 27"
Cohesion: 0.67
Nodes (1): connectDB()

### Community 28 - "Request Store State"
Cohesion: 0.67
Nodes (1): calculateStats()

### Community 29 - "Category Selection UI"
Cohesion: 0.67
Nodes (1): CategoryCard()

### Community 30 - "Global Screen Header"
Cohesion: 0.67
Nodes (1): Header()

## Knowledge Gaps
- **6 isolated node(s):** `UI Design Principles`, `MongoDB Setup`, `OTP System`, `Vendor Assignment System`, `Docker Setup` (+1 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Role-based Tab Layouts`** (7 nodes): `_layout.tsx`, `_layout.tsx`, `_layout.tsx`, `_layout.tsx`, `_layout.tsx`, `_layout.tsx`, `handleLogout()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Pricing Configuration API`** (4 nodes): `pricingController.js`, `pricingController.js`, `getPricing()`, `updatePricing()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Auth & Route Protection`** (4 nodes): `authorize()`, `protect()`, `auth.js`, `auth.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Drive Card UI Utilities`** (4 nodes): `formatDate()`, `formatTime()`, `DriveCard.tsx`, `DriveCard.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 21`** (3 nodes): `index.tsx`, `index.tsx`, `Index()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 22`** (3 nodes): `_layout.tsx`, `_layout.tsx`, `AuthLayout()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 23`** (3 nodes): `pricing.tsx`, `pricing.tsx`, `PricingScreen()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 24`** (3 nodes): `reports.tsx`, `reports.tsx`, `ReportsScreen()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 25`** (3 nodes): `completed.tsx`, `CompletedScreen()`, `completed.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 26`** (3 nodes): `seed.js`, `seed.js`, `seedData()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 27`** (3 nodes): `db.js`, `connectDB()`, `db.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Request Store State`** (3 nodes): `requestStore.ts`, `calculateStats()`, `requestStore.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Category Selection UI`** (3 nodes): `CategoryCard()`, `CategoryCard.tsx`, `CategoryCard.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Global Screen Header`** (3 nodes): `Header()`, `Header.tsx`, `Header.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `generateOTP()` connect `Core Admin & OTP Mock Utilities` to `Authentication & Login`, `Vendor Pickup & Pricing Logic`?**
  _High betweenness centrality (0.011) - this node is a cross-community bridge._
- **Why does `sendOtp()` connect `Authentication & Login` to `Core Admin & OTP Mock Utilities`?**
  _High betweenness centrality (0.008) - this node is a cross-community bridge._
- **Why does `acceptPickup()` connect `Vendor Pickup & Pricing Logic` to `Core Admin & OTP Mock Utilities`?**
  _High betweenness centrality (0.007) - this node is a cross-community bridge._
- **Are the 5 inferred relationships involving `BMC E-Waste Citizen App` (e.g. with `MongoDB Setup` and `OTP System`) actually correct?**
  _`BMC E-Waste Citizen App` has 5 INFERRED edges - model-reasoned connections that need verification._
- **Are the 3 inferred relationships involving `generateOTP()` (e.g. with `assignVendor()` and `sendOtp()`) actually correct?**
  _`generateOTP()` has 3 INFERRED edges - model-reasoned connections that need verification._
- **What connects `UI Design Principles`, `MongoDB Setup`, `OTP System` to the rest of the system?**
  _6 weakly-connected nodes found - possible documentation gaps or missing edges._