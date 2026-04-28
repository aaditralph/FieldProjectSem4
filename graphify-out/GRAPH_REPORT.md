# Graph Report - .  (2026-04-26)

## Corpus Check
- 96 files · ~57,210 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 181 nodes · 136 edges · 16 communities detected
- Extraction: 89% EXTRACTED · 11% INFERRED · 0% AMBIGUOUS · INFERRED: 15 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 51|Community 51]]
- [[_COMMUNITY_Community 57|Community 57]]
- [[_COMMUNITY_Community 59|Community 59]]

## God Nodes (most connected - your core abstractions)
1. `generateOTP()` - 5 edges
2. `handleLogout()` - 3 edges
3. `loadDashboard()` - 3 edges
4. `loadRequests()` - 3 edges
5. `onRefresh()` - 3 edges
6. `approveDriveRequest()` - 3 edges
7. `sendOtp()` - 3 edges
8. `login()` - 3 edges
9. `useColorScheme()` - 3 edges
10. `calculatePrice()` - 3 edges

## Surprising Connections (you probably didn't know these)
- `RootLayout()` --calls--> `useColorScheme()`  [INFERRED]
  app/_layout.tsx → /home/aaditralph/Desktop/Projects/Field Project/Rewrite/FieldProjectSem4/hooks/use-color-scheme.web.ts
- `assignVendor()` --calls--> `generateOTP()`  [INFERRED]
  /home/aaditralph/Desktop/Projects/Field_Project/Rewrite/FieldProjectSem4/backend/src/controllers/adminController.js → /home/aaditralph/Desktop/Projects/Field_Project/Rewrite/FieldProjectSem4/src/api/mock.ts
- `sendOtp()` --calls--> `generateOTP()`  [INFERRED]
  /home/aaditralph/Desktop/Projects/Field Project/Rewrite/FieldProjectSem4/backend/src/controllers/authController.js → /home/aaditralph/Desktop/Projects/Field_Project/Rewrite/FieldProjectSem4/src/api/mock.ts
- `acceptPickup()` --calls--> `generateOTP()`  [INFERRED]
  /home/aaditralph/Desktop/Projects/Field_Project/Rewrite/FieldProjectSem4/backend/src/controllers/vendorController.js → /home/aaditralph/Desktop/Projects/Field_Project/Rewrite/FieldProjectSem4/src/api/mock.ts
- `handleSendOtp()` --calls--> `sendOtp()`  [INFERRED]
  /home/aaditralph/Desktop/Projects/Field Project/Rewrite/FieldProjectSem4/app/(auth)/login.tsx → /home/aaditralph/Desktop/Projects/Field Project/Rewrite/FieldProjectSem4/backend/src/controllers/authController.js

## Communities

### Community 0 - "Community 0"
Cohesion: 0.13
Nodes (6): joinDrive(), confirmComplete(), handleJoinDrive(), loadDrives(), onRefresh(), completeDrive()

### Community 1 - "Community 1"
Cohesion: 0.14
Nodes (4): goBack(), handleSubmit(), resetForm(), createRequest()

### Community 2 - "Community 2"
Cohesion: 0.18
Nodes (5): approveDriveRequest(), assignVendor(), handleApproveConfirm(), generateOTP(), acceptPickup()

### Community 3 - "Community 3"
Cohesion: 0.2
Nodes (5): login(), sendOtp(), generateToken(), handleLogin(), handleSendOtp()

### Community 4 - "Community 4"
Cohesion: 0.25
Nodes (3): calculateEstimatedPrice(), calculatePrice(), completePickup()

### Community 5 - "Community 5"
Cohesion: 0.36
Nodes (4): handleAssignVendor(), loadDashboard(), loadRequests(), loadVendors()

### Community 7 - "Community 7"
Cohesion: 0.33
Nodes (2): loadRequests(), onRefresh()

### Community 8 - "Community 8"
Cohesion: 0.4
Nodes (2): loadData(), onRefresh()

### Community 9 - "Community 9"
Cohesion: 0.33
Nodes (3): RootLayout(), useColorScheme(), useThemeColor()

### Community 10 - "Community 10"
Cohesion: 0.5
Nodes (2): loadRequests(), onRefresh()

### Community 12 - "Community 12"
Cohesion: 0.4
Nodes (2): VendorHomeScreen(), formatDate()

### Community 13 - "Community 13"
Cohesion: 0.5
Nodes (1): handleLogout()

### Community 44 - "Community 44"
Cohesion: 1.0
Nodes (1): Theme Constants

### Community 51 - "Community 51"
Cohesion: 1.0
Nodes (1): Request Store

### Community 57 - "Community 57"
Cohesion: 1.0
Nodes (1): StatCard Component

### Community 59 - "Community 59"
Cohesion: 1.0
Nodes (1): UI Component Library

## Knowledge Gaps
- **4 isolated node(s):** `Theme Constants`, `Request Store`, `StatCard Component`, `UI Component Library`
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 7`** (7 nodes): `dashboard.tsx`, `handleNewRequest()`, `handleTrackPickup()`, `handleViewDrives()`, `handleViewRequests()`, `loadRequests()`, `onRefresh()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 8`** (6 nodes): `drive-requests.tsx`, `formatDate()`, `handleApprovePress()`, `handleRejectPress()`, `loadData()`, `onRefresh()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 10`** (5 nodes): `requests.tsx`, `handleCreateRequest()`, `handleRequestPress()`, `loadRequests()`, `onRefresh()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 12`** (5 nodes): `index.tsx`, `VendorHomeScreen()`, `formatDate()`, `RequestCard()`, `RequestCard.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 13`** (4 nodes): `_layout.tsx`, `_layout.tsx`, `_layout.tsx`, `handleLogout()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 44`** (1 nodes): `Theme Constants`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 51`** (1 nodes): `Request Store`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 57`** (1 nodes): `StatCard Component`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 59`** (1 nodes): `UI Component Library`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `generateOTP()` connect `Community 2` to `Community 3`?**
  _High betweenness centrality (0.056) - this node is a cross-community bridge._
- **Why does `acceptPickup()` connect `Community 2` to `Community 4`?**
  _High betweenness centrality (0.043) - this node is a cross-community bridge._
- **Why does `completeDrive()` connect `Community 0` to `Community 4`?**
  _High betweenness centrality (0.035) - this node is a cross-community bridge._
- **Are the 4 inferred relationships involving `generateOTP()` (e.g. with `assignVendor()` and `approveDriveRequest()`) actually correct?**
  _`generateOTP()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Theme Constants`, `Request Store`, `StatCard Component` to the rest of the system?**
  _4 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.13 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.14 - nodes in this community are weakly interconnected._