# 🚀 Vendor Assignment & Status Tracking System

## Overview

This document describes the complete workflow for admin assigning tasks to vendors and tracking pickup status visible to all parties (Admin, Vendor, and Citizen).

---

## 📋 Workflow

### **1. Citizen Creates Request**
```
Citizen → Creates Request → Status: CREATED
```

### **2. Citizen Schedules Request** (Optional)
```
Citizen → Schedules Time → Status: SCHEDULED
```

### **3. Admin Assigns Vendor**
```
Admin → Views All Requests → Selects Request → Assigns Vendor → Status: IN_PROGRESS
```

### **4. Vendor Manages Pickup**
```
Vendor → Sees Assigned Pickups
     ↓
Vendor → Accepts Pickup → Status: IN_PROGRESS (logged)
     ↓
Vendor → Starts Pickup → Status: IN_PROGRESS (logged)  
     ↓
Vendor → Completes Pickup → Status: COMPLETED
```

### **5. Real-time Status Visibility**
```
✅ Citizen can see: Assigned vendor name, phone, and current status
✅ Admin can see: All assignments, vendor performance, status updates
✅ Vendor can see: Their assigned pickups with citizen details
```

---

## 🔧 Backend API Endpoints

### **Admin Endpoints**

#### 1. Get All Vendors
```http
GET /api/admin/vendors
Authorization: Bearer <admin_token>
```

**Response:**
```json
[
  {
    "_id": "vendor_id_1",
    "name": "Vendor A",
    "phone": "9876543210",
    "role": "VENDOR",
    "address": "Mumbai"
  }
]
```

#### 2. Get All Requests (with vendor assignments)
```http
GET /api/admin/requests
Authorization: Bearer <admin_token>
```

**Response:**
```json
[
  {
    "_id": "request_id",
    "category": "Laptop",
    "quantity": 2,
    "status": "IN_PROGRESS",
    "userId": {
      "name": "John Doe",
      "phone": "9876543210"
    },
    "assignedVendorId": {
      "name": "Vendor A",
      "phone": "9876543211"
    },
    "scheduledTime": "2026-04-15T10:00:00.000Z"
  }
]
```

#### 3. Assign Vendor to Request
```http
POST /api/admin/requests/:id/assign
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "vendorId": "vendor_id_1"
}
```

**Response:**
```json
{
  "_id": "request_id",
  "status": "IN_PROGRESS",
  "assignedVendorId": {
    "name": "Vendor A",
    "phone": "9876543211"
  },
  "userId": {
    "name": "John Doe",
    "phone": "9876543210"
  }
}
```

---

### **Vendor Endpoints**

#### 1. Get Assigned Pickups
```http
GET /api/vendor/pickups
Authorization: Bearer <vendor_token>
```

**Response:**
```json
[
  {
    "_id": "request_id",
    "category": "Laptop",
    "status": "IN_PROGRESS",
    "userId": {
      "name": "John Doe",
      "phone": "9876543210",
      "address": "123 Main St, Mumbai"
    },
    "scheduledTime": "2026-04-15T10:00:00.000Z",
    "otp": "1234"
  }
]
```

#### 2. Accept Pickup
```http
POST /api/vendor/pickups/:id/accept
Authorization: Bearer <vendor_token>
```

**Response:** Updated request object

#### 3. Start Pickup
```http
POST /api/vendor/pickups/:id/start
Authorization: Bearer <vendor_token>
```

**Response:** Updated request object

#### 4. Complete Pickup
```http
POST /api/vendor/pickups/:id/complete
Authorization: Bearer <vendor_token>
Content-Type: application/json

{
  "otp": "1234",
  "weight": 5.5,
  "condition": "WORKING"
}
```

**Response:**
```json
{
  "pickup": { ... },
  "transaction": { ... },
  "finalPrice": 550
}
```

---

## 📊 Status Flow

```
CREATED → SCHEDULED → IN_PROGRESS → COMPLETED
    ↓         ↓           ↓
    └→ CANCELLED    └→ CANCELLED
```

### **Status Descriptions:**

| Status | Description | Who Can Set |
|--------|-------------|-------------|
| **CREATED** | Request created by citizen | Citizen |
| **SCHEDULED** | Time slot selected | Citizen |
| **IN_PROGRESS** | Vendor assigned & working | Admin (assign), Vendor (accept/start) |
| **COMPLETED** | Pickup done & payment made | Vendor (complete) |
| **CANCELLED** | Request cancelled | Citizen (before completion) |

---

## 🎯 User Roles & Permissions

### **Admin**
- ✅ View all requests from all users
- ✅ View all vendors
- ✅ Assign vendors to requests
- ✅ See real-time status updates
- ✅ View audit logs
- ✅ Manage pricing

### **Vendor**
- ✅ View assigned pickups only
- ✅ Accept pickups
- ✅ Start pickups
- ✅ Complete pickups with OTP validation
- ✅ See citizen contact details
- ✅ View pickup history

### **Citizen**
- ✅ Create requests
- ✅ Schedule pickups
- ✅ See assigned vendor details
- ✅ Track status in real-time
- ✅ Cancel requests (before completion)
- ✅ View request history

---

## 📱 Frontend Implementation Guide

### **Admin Dashboard**

#### Assign Vendor Screen
```typescript
// 1. Fetch all vendors
const vendors = await adminApi.getVendors();

// 2. Fetch all requests
const requests = await adminApi.getRequests();

// 3. Assign vendor to request
await adminApi.assignVendor(requestId, vendorId);
```

**UI Components:**
- List of pending requests (CREATED/SCHEDULED status)
- Dropdown/modal to select vendor
- "Assign" button
- Success notification

---

### **Vendor Dashboard**

#### Pickup Management Screen
```typescript
// 1. Fetch assigned pickups
const pickups = await vendorApi.getPickups();

// 2. Accept pickup
await vendorApi.acceptPickup(pickupId);

// 3. Start pickup
await vendorApi.startPickup(pickupId);

// 4. Complete pickup
await vendorApi.completePickup(pickupId, { otp, weight, condition });
```

**UI Components:**
- List of assigned pickups
- Citizen details (name, phone, address)
- Action buttons based on status:
  - "Accept" button (when IN_PROGRESS)
  - "Start" button (when accepted)
  - "Complete" button (opens modal for OTP, weight, condition)

---

### **Citizen Dashboard**

#### Request Tracking Screen
```typescript
// 1. Fetch user's requests
const requests = await requestApi.getAll();

// 2. Each request shows:
//    - Status
//    - Assigned vendor name & phone (if assigned)
//    - Scheduled time
//    - Audit timeline
```

**UI Components:**
- List of user's requests
- Status badges with color coding
- Vendor info card (when assigned):
  - Vendor name
  - Vendor phone (call button)
- Real-time status updates

---

## 🔍 Audit Log Actions

All actions are logged for transparency:

| Action | Actor | Description |
|--------|-------|-------------|
| `request_created` | Citizen | New request created |
| `request_scheduled` | Citizen | Time slot selected |
| `request_cancelled` | Citizen | Request cancelled |
| `vendor_assigned` | Admin | Vendor assigned to request |
| `pickup_accepted` | Vendor | Vendor acknowledged assignment |
| `pickup_started` | Vendor | Vendor started pickup |
| `pickup_completed` | Vendor | Pickup completed |
| `payment_done` | Vendor | Payment processed |

---

## 🧪 Testing the Workflow

### **Test Scenario: Complete Pickup Flow**

#### 1. **Create Test Users**
```bash
# Use the seed script or create manually
# - 1 Admin account
# - 1 Vendor account  
# - 1 Citizen account
```

#### 2. **Citizen Creates Request**
```bash
# Login as citizen
POST /api/auth/send-otp {"phone": "9876543210"}
POST /api/auth/login {"phone": "9876543210", "otp": "1234"}

# Create request
POST /api/requests
{
  "category": "Laptop",
  "quantity": 2,
  "address": "123 Main St, Mumbai"
}
```

#### 3. **Admin Assigns Vendor**
```bash
# Login as admin
POST /api/auth/send-otp {"phone": "9999999999"}
POST /api/auth/login {"phone": "9999999999", "otp": "1234"}

# Get all vendors
GET /api/admin/vendors

# Assign vendor
POST /api/admin/requests/{requestId}/assign
{
  "vendorId": "{vendorId}"
}
```

#### 4. **Vendor Accepts & Completes**
```bash
# Login as vendor
POST /api/auth/send-otp {"phone": "9876543211"}
POST /api/auth/login {"phone": "9876543211", "otp": "1234"}

# View assigned pickups
GET /api/vendor/pickups

# Accept pickup
POST /api/vendor/pickups/{requestId}/accept

# Complete pickup
POST /api/vendor/pickups/{requestId}/complete
{
  "otp": "1234",
  "weight": 5.5,
  "condition": "WORKING"
}
```

#### 5. **Citizen Views Status**
```bash
# Login as citizen
GET /api/requests

# Should show:
# - Status: COMPLETED
# - Assigned vendor details
# - Payment info
```

---

## 📝 Implementation Status

### ✅ **Backend (Complete)**
- [x] Admin controller with assign vendor logic
- [x] Admin routes (get vendors, get requests, assign)
- [x] Vendor accept pickup endpoint
- [x] Vendor start pickup endpoint
- [x] Vendor complete pickup endpoint (existing)
- [x] Audit logging for all actions
- [x] Authorization checks (admin/vendor/citizen)
- [x] Request model with assignedVendorId field

### 🚧 **Frontend (To Implement)**
- [ ] Admin screen to view requests & assign vendors
- [ ] Admin screen to view all vendors
- [ ] Vendor screen with accept/start/complete buttons
- [ ] Citizen screen showing assigned vendor info
- [ ] Real-time status updates (polling or WebSocket)
- [ ] Vendor selection modal/dropdown for admin
- [ ] Status badges with color coding

---

## 🎨 UI/UX Recommendations

### **Admin Dashboard**
- **Card-based layout** showing pending requests
- **Modal/Dialog** for vendor selection
- **Success toast** notification after assignment
- **Filter** by status (CREATED, SCHEDULED, IN_PROGRESS, COMPLETED)
- **Search** by citizen name or phone

### **Vendor Dashboard**
- **List view** with citizen details
- **Action buttons** that change based on status:
  - Blue "Accept" button
  - Orange "Start" button
  - Green "Complete" button
- **OTP input** modal for completion
- **Weight & condition** form
- **Navigation** to citizen location (Google Maps integration)

### **Citizen Dashboard**
- **Status timeline** showing progress
- **Vendor card** with name, phone, call button
- **Color-coded badges**:
  - Gray: CREATED
  - Blue: SCHEDULED
  - Orange: IN_PROGRESS
  - Green: COMPLETED
  - Red: CANCELLED
- **Pull to refresh** for status updates

---

## 🔐 Security Considerations

1. **Authorization Checks**
   - Admin can only access admin routes
   - Vendor can only see/modify their assigned pickups
   - Citizen can only see their own requests

2. **OTP Validation**
   - Required for pickup completion
   - Prevents unauthorized completions

3. **Audit Logging**
   - All actions logged with actor info
   - Timestamps for accountability
   - Meta data for context

4. **Data Validation**
   - Vendor must exist and have VENDOR role
   - Request must be in assignable status
   - Weight must be positive number
   - Condition must be valid enum

---

## 🚀 Next Steps

1. **Implement Admin UI**
   - Create request list screen
   - Add vendor assignment modal
   - Show real-time status

2. **Update Vendor UI**
   - Add accept/start buttons
   - Show citizen contact info
   - Improve completion flow

3. **Enhance Citizen UI**
   - Show assigned vendor details
   - Add status timeline
   - Real-time updates

4. **Add Notifications**
   - Push notification when vendor assigned
   - SMS when pickup started
   - Email when completed

5. **Performance Optimization**
   - Pagination for large lists
   - Caching for vendor list
   - WebSocket for real-time updates

---

## 📞 Support

For questions or issues:
- Check audit logs for debugging
- Review API responses for error messages
- Test endpoints with curl/Postman first
- Check MongoDB for data integrity

---

**This system provides complete transparency and accountability for the e-waste pickup workflow!** 🎉
