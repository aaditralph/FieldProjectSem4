# Graph Report - FieldProjectSem4  (2026-04-25)

## Corpus Check
- 72 files · ~70,180 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 228 nodes · 209 edges · 18 communities detected
- Extraction: 76% EXTRACTED · 24% INFERRED · 0% AMBIGUOUS · INFERRED: 51 edges (avg confidence: 0.83)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 63|Community 63]]
- [[_COMMUNITY_Community 64|Community 64]]
- [[_COMMUNITY_Community 65|Community 65]]

## God Nodes (most connected - your core abstractions)
1. `Mock SMS OTP System` - 12 edges
2. `Production Mode Setup` - 12 edges
3. `Vendor Assignment Workflow` - 12 edges
4. `Docker MongoDB Configuration` - 7 edges
5. `Backend Complete` - 6 edges
6. `Three User Roles (Citizen, Vendor, Admin)` - 6 edges
7. `ReactNativeDelegate` - 5 edges
8. `BMC E-Waste Management System` - 5 edges
9. `generateOTP()` - 4 edges
10. `calculatePrice()` - 4 edges

## Surprising Connections (you probably didn't know these)
- `calculatePrice()` --semantically_similar_to--> `calculatePrice()`  [INFERRED] [semantically similar]
  backend/src/utils/helpers.js → src/utils/pricing.ts
- `Three User Roles (Citizen, Vendor, Admin)` --semantically_similar_to--> `Request Status Flow`  [INFERRED] [semantically similar]
  README.md → VENDOR_ASSIGNMENT_SYSTEM.md
- `Three User Roles (Citizen, Vendor, Admin)` --semantically_similar_to--> `User Roles and Permissions`  [INFERRED] [semantically similar]
  README.md → VENDOR_ASSIGNMENT_SYSTEM.md
- `Vendor Assignment Workflow` --semantically_similar_to--> `Citizen Usage Flow`  [INFERRED] [semantically similar]
  VENDOR_ASSIGNMENT_SYSTEM.md → README.md
- `Vendor Assignment Workflow` --semantically_similar_to--> `Vendor Usage Flow`  [INFERRED] [semantically similar]
  VENDOR_ASSIGNMENT_SYSTEM.md → README.md

## Communities

### Community 0 - "Community 0"
Cohesion: 0.13
Nodes (22): Auto-Registration Feature, Development Mode OTP, Helpers.js OTP Generation, JWT Authentication, Login.tsx Frontend, Mock SMS OTP System, MSG91 SMS Integration, OTP Generation (+14 more)

### Community 1 - "Community 1"
Cohesion: 0.16
Nodes (18): Auth Controller Backend, API Endpoints, Backend Complete, Admin Usage Flow, Citizen Usage Flow, Deployment Guide, BMC E-Waste Management System, Pricing Formula (+10 more)

### Community 2 - "Community 2"
Cohesion: 0.13
Nodes (6): assignVendor(), generateOTP(), calculateEstimatedPrice(), calculatePrice(), acceptPickup(), completePickup()

### Community 3 - "Community 3"
Cohesion: 0.16
Nodes (5): goBack(), handleCategorySelect(), handleSubmit(), resetForm(), createRequest()

### Community 4 - "Community 4"
Cohesion: 0.15
Nodes (3): formatDate(), VendorHomeScreen(), formatDate()

### Community 5 - "Community 5"
Cohesion: 0.2
Nodes (4): joinDrive(), handleJoinDrive(), loadDrives(), onRefresh()

### Community 6 - "Community 6"
Cohesion: 0.22
Nodes (7): login(), sendOtp(), calculatePrice(), generateOTP(), generateToken(), handleLogin(), handleSendOtp()

### Community 7 - "Community 7"
Cohesion: 0.29
Nodes (10): MongoDB Docker Quickstart, Database Backup and Restore, Docker MongoDB Configuration, MongoDB Connection Strings, Database Credentials, Production Environment Variables, MongoDB Connection, Database Models (+2 more)

### Community 8 - "Community 8"
Cohesion: 0.36
Nodes (4): handleAssignVendor(), loadDashboard(), loadRequests(), loadVendors()

### Community 9 - "Community 9"
Cohesion: 0.32
Nodes (4): AppDelegate, ReactNativeDelegate, ExpoAppDelegate, ExpoReactNativeFactoryDelegate

### Community 10 - "Community 10"
Cohesion: 0.4
Nodes (2): loadRequests(), onRefresh()

### Community 11 - "Community 11"
Cohesion: 0.33
Nodes (3): RootLayout(), useColorScheme(), useThemeColor()

### Community 12 - "Community 12"
Cohesion: 0.5
Nodes (2): loadRequests(), onRefresh()

### Community 14 - "Community 14"
Cohesion: 0.4
Nodes (5): AuthStore State Management, Expo Router Navigation, Frontend Infrastructure, Zustand State Management Stores, Frontend Implementation Guide

### Community 15 - "Community 15"
Cohesion: 0.5
Nodes (1): handleLogout()

### Community 63 - "Community 63"
Cohesion: 1.0
Nodes (1): OTP Validation Fix

### Community 64 - "Community 64"
Cohesion: 1.0
Nodes (1): Login Navigation Fix

### Community 65 - "Community 65"
Cohesion: 1.0
Nodes (1): MongoDB Atlas Setup

## Knowledge Gaps
- **9 isolated node(s):** `OTP Validation Fix`, `Login Navigation Fix`, `MongoDB Atlas Setup`, `CORS Configuration`, `Testing Workflow` (+4 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 10`** (6 nodes): `dashboard.tsx`, `handleNewRequest()`, `handleViewDrives()`, `handleViewRequests()`, `loadRequests()`, `onRefresh()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 12`** (5 nodes): `requests.tsx`, `handleCreateRequest()`, `handleRequestPress()`, `loadRequests()`, `onRefresh()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 15`** (4 nodes): `_layout.tsx`, `_layout.tsx`, `_layout.tsx`, `handleLogout()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 63`** (1 nodes): `OTP Validation Fix`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 64`** (1 nodes): `Login Navigation Fix`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 65`** (1 nodes): `MongoDB Atlas Setup`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Production Mode Setup` connect `Community 0` to `Community 1`, `Community 7`?**
  _High betweenness centrality (0.023) - this node is a cross-community bridge._
- **Why does `Mock SMS OTP System` connect `Community 0` to `Community 1`, `Community 14`?**
  _High betweenness centrality (0.016) - this node is a cross-community bridge._
- **Why does `Backend Complete` connect `Community 1` to `Community 0`, `Community 7`?**
  _High betweenness centrality (0.016) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `Production Mode Setup` (e.g. with `Mock Mode Solution` and `Backend Complete`) actually correct?**
  _`Production Mode Setup` has 3 INFERRED edges - model-reasoned connections that need verification._
- **Are the 5 inferred relationships involving `Vendor Assignment Workflow` (e.g. with `OTP Generation` and `Pricing Formula`) actually correct?**
  _`Vendor Assignment Workflow` has 5 INFERRED edges - model-reasoned connections that need verification._
- **Are the 3 inferred relationships involving `Docker MongoDB Configuration` (e.g. with `MongoDB Setup` and `MongoDB Connection`) actually correct?**
  _`Docker MongoDB Configuration` has 3 INFERRED edges - model-reasoned connections that need verification._
- **Are the 4 inferred relationships involving `Backend Complete` (e.g. with `Quick Setup Guide` and `Tech Stack`) actually correct?**
  _`Backend Complete` has 4 INFERRED edges - model-reasoned connections that need verification._