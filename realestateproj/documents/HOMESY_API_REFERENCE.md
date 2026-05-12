# Homesy API Reference

**Version:** 1.0  
**Date:** April 15, 2026  
**Base URL:** `{{base_url}}` (e.g., `http://localhost:3000` or `https://api.homesy.com`)

---

## Overview

This document provides complete API reference for the Homesy Real Estate Project Management platform. All endpoints require authentication (except login) and most require tenant identification via headers.

**Source:** Postman Collection  
**Collection Name:** Real Estate Project Management API

---

## Authentication & Headers

### Required Headers

All authenticated endpoints require:

```
Authorization: Bearer <access_token>
x-tenant-id: <tenant_id>
```

**Exception:** SUPER_ADMIN requests omit the `x-tenant-id` header.

### Authentication Flow

1. **Login** → Receive `access_token`
2. Store token securely (Keychain/Keystore on mobile)
3. Include token in `Authorization` header for all subsequent requests
4. Include `x-tenant-id` header (except for SUPER_ADMIN)

---

## API Categories

The API is organized into 14 categories:

1. **Authentication** (2 endpoints) - Login, password management
2. **Users** (6 endpoints) - User CRUD operations
3. **Projects** (6 endpoints) - Project management
4. **Teams** (5 endpoints) - Team assignment and management
5. **Stages** (5 endpoints) - Project stage management
6. **Transactions** (6 endpoints) - Financial transactions
7. **Requests** (5 endpoints) - Material/resource procurement
8. **Complaints** (6 endpoints) - Issue tracking
9. **Project Chat** (5 endpoints) - In-app messaging
10. **Subcontracts** (6 endpoints) - Subcontractor work packages
11. **Documents & Images** (3 endpoints) - File uploads
12. **Invoices** (1 endpoint) - PDF invoice generation
13. **Global Configuration** (1 endpoint) - System constants/enums
14. **Tenant** (2 endpoints) - Multi-tenant management

**Total:** 58 endpoints

---

## 1. Authentication

### 1.1 Login

**Endpoint:** `POST /auth/login`  
**Description:** Authenticate user and receive access token  
**Authentication:** None required

**Headers:**
```
x-tenant-id: <tenant_id>
Content-Type: application/json
```

**Request Body:**
```json
{
  "username": "Superman",
  "password": "Password@1234"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_id",
    "name": "Superman",
    "role": "ADMIN",
    "status": "ACTIVE"
  }
}
```

**Mobile Implementation:**
- Store `token` in secure storage (Keychain/Keystore)
- Store `user` data for role-based UI rendering
- Store `tenant_id` for subsequent API calls

---

### 1.2 Set Password

**Endpoint:** `POST /auth/set-password`  
**Description:** Set or reset user password using OTP  
**Authentication:** None required

**Headers:**
```
x-tenant-id: <tenant_id>
Content-Type: application/json
```

**Request Body:**
```json
{
  "username": "Superman",
  "password": "Password@1234",
  "otp": "153348"
}
```

**Use Cases:**
- First-time user activation
- Password reset flow
- Mobile: After ADMIN activates account

---

## 2. Users

### 2.1 Get All Users

**Endpoint:** `GET /users`  
**Description:** Retrieve all users within tenant  
**Authentication:** Required  
**Roles:** SUPER_ADMIN, ADMIN

**Headers:**
```
Authorization: Bearer <token>
x-tenant-id: <tenant_id>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "user_id",
      "name": "John Doe",
      "username": "johndoe",
      "role": "SUPERVISOR",
      "status": "ACTIVE",
      "email": "john@example.com",
      "phone_no": "+1234567890",
      "image": "https://..."
    }
  ]
}
```

---

### 2.2 Get User by ID

**Endpoint:** `GET /users/:user_id`  
**Description:** Retrieve specific user details  
**Authentication:** Required

---

### 2.3 Create User

**Endpoint:** `POST /users`  
**Description:** Create a new user account  
**Authentication:** Required  
**Roles:** SUPER_ADMIN, ADMIN

**Request Body:**
```json
{
  "name": "Jane Doe",
  "username": "janedoe",
  "role": "SUPERVISOR",
  "phone_no": "+1234567890",
  "email": "jane@example.com"
}
```

**Process:**
1. User is created with status `UNVERIFIED`
2. OTP is sent to user's email
3. ADMIN activates user via OTP flow (Set Password)
4. User status becomes `ACTIVE`

**Available Roles:**
- ADMIN
- SUPERVISOR
- SUBCONTRACTOR
- PURCHASE_MANAGER
- ACCOUNTS
- CUSTOMER

**Note:** Cannot create SUPER_ADMIN users (platform-level only)

---

### 2.4 Update User

**Endpoint:** `PUT /users/:user_id`  
**Description:** Update user details  
**Authentication:** Required  
**Roles:** SUPER_ADMIN, ADMIN

**Request Body:**
```json
{
  "name": "Jane Doe",
  "username": "janedoe",
  "phone_no": "+9876543210",
  "email": "jane@example.com",
  "image": "https://example.com/image.jpg"
}
```

**Note:** Cannot update `role` or `status` via this endpoint.

---

### 2.5 Check User Exists

**Endpoint:** `POST /users/check-user`  
**Description:** Check if user exists and send OTP for password reset  
**Authentication:** None required

**Request Body:**
```json
{
  "username": "johndoe"
}
```

---

### 2.6 Set User Status

**Endpoint:** `POST /users/set-user-status`  
**Description:** Update user status (activate/deactivate)  
**Authentication:** Required  
**Roles:** SUPER_ADMIN, ADMIN

**Request Body:**
```json
{
  "id": "user_id",
  "status": "ACTIVE"
}
```

**Valid Statuses:**
- `ACTIVE`
- `INACTIVE`
- `UNVERIFIED`

---

## 3. Projects

### 3.1 Create Project

**Endpoint:** `POST /projects`  
**Description:** Create a new project  
**Authentication:** Required  
**Roles:** SUPER_ADMIN, ADMIN

**Request Body:**
```json
{
  "title": "Residential Complex A",
  "p_status": "ONGOING",
  "customer": "customer_user_id",
  "location": "Downtown Area",
  "start_date": "2026-01-01",
  "end_date": "2026-12-31",
  "estimate": 500000,
  "image": "https://example.com/project.jpg"
}
```

**Date Format:** `YYYY-MM-DD`

**Valid Statuses:**
- `ONGOING`
- `COMPLETED`
- `ONHOLD`
- `ABANDONED`

---

### 3.2 Get All Projects

**Endpoint:** `GET /projects`  
**Description:** Retrieve all projects (role-scoped)  
**Authentication:** Required

**Data Scoping:**
- **SUPER_ADMIN:** All projects in current tenant
- **ADMIN:** All projects in their tenant
- **CUSTOMER:** Only their own projects
- **Other roles:** Only projects where they are team members

---

### 3.3 Get Project by ID

**Endpoint:** `GET /projects/:project_id`  
**Description:** Retrieve specific project details  
**Authentication:** Required

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "project_id",
    "title": "Residential Complex A",
    "p_status": "ONGOING",
    "customer": {
      "id": "customer_id",
      "name": "John Customer",
      "email": "customer@example.com",
      "phone_no": "+1234567890"
    },
    "location": "Downtown Area",
    "start_date": "2026-01-01",
    "end_date": "2026-12-31",
    "estimate": 500000,
    "progress": 45,
    "image": "https://..."
  }
}
```

---

### 3.4 Get Projects by Customer

**Endpoint:** `GET /projects/customer/:customer_id`  
**Description:** Retrieve all projects for a specific customer  
**Authentication:** Required

---

### 3.5 Get Projects by User

**Endpoint:** `GET /projects/user/:user_id`  
**Description:** Retrieve all projects where user is a team member  
**Authentication:** Required

**Use Case:** Mobile dashboard for field workers (SUPERVISOR, SUBCONTRACTOR, etc.)

---

### 3.6 Update Project

**Endpoint:** `PUT /projects`  
**Description:** Update project details  
**Authentication:** Required  
**Roles:** SUPER_ADMIN, ADMIN, SUPERVISOR

**Request Body:**
```json
{
  "id": "project_id",
  "title": "Residential Complex A - Updated",
  "p_status": "ONGOING",
  "location": "Downtown Area",
  "start_date": "2026-01-01",
  "end_date": "2026-12-31",
  "estimate": 550000,
  "progress": 50
}
```

---

## 4. Teams

### 4.1 Create Team

**Endpoint:** `POST /team`  
**Description:** Create a new team for a project  
**Authentication:** Required  
**Roles:** SUPER_ADMIN, ADMIN

**Request Body:**
```json
{
  "pid": "project_id",
  "members": ["user_id_1", "user_id_2", "user_id_3"]
}
```

---

### 4.2 Get All Teams

**Endpoint:** `GET /team`  
**Description:** Retrieve all teams within tenant  
**Authentication:** Required  
**Roles:** SUPER_ADMIN, ADMIN

---

### 4.3 Get Team by ID

**Endpoint:** `GET /team/:team_id`  
**Description:** Retrieve specific team details  
**Authentication:** Required

---

### 4.4 Get Team by Project

**Endpoint:** `GET /team/project/:project_id`  
**Description:** Retrieve team for a specific project  
**Authentication:** Required

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "team_id",
    "pid": "project_id",
    "members": [
      {
        "id": "user_id_1",
        "name": "John Doe",
        "username": "johndoe",
        "role": "SUPERVISOR",
        "email": "john@example.com",
        "phone_no": "+1234567890",
        "image": "https://..."
      }
    ]
  }
}
```

---

### 4.5 Update Team

**Endpoint:** `PUT /team/:team_id`  
**Description:** Update team members  
**Authentication:** Required  
**Roles:** SUPER_ADMIN, ADMIN, SUPERVISOR

**Request Body:**
```json
{
  "members": ["user_id_1", "user_id_2", "user_id_3", "user_id_4"],
  "pid": "project_id"
}
```

---

## 5. Stages

### 5.1 Create Stage

**Endpoint:** `POST /stage`  
**Description:** Create a new stage within a project  
**Authentication:** Required  
**Roles:** SUPER_ADMIN, ADMIN, SUPERVISOR

**Request Body:**
```json
{
  "pid": "project_id",
  "title": "Foundation Work",
  "start_date": "2026-01-15",
  "end_date": "2026-03-15",
  "estimate": 100000,
  "total_cost": 0,
  "s_status": "ONGOING",
  "members": ["user_id_1"]
}
```

**Business Rule:** Members added to stage are automatically added to project team if not already present.

---

### 5.2 Get Stages by Project

**Endpoint:** `GET /stage/project/:project_id`  
**Description:** Retrieve all stages for a project  
**Authentication:** Required

---

### 5.3 Get Stage by ID

**Endpoint:** `GET /stage/:stage_id`  
**Description:** Retrieve specific stage details  
**Authentication:** Required

---

### 5.4 Update Stage

**Endpoint:** `PUT /stage/:stage_id`  
**Description:** Update stage details  
**Authentication:** Required  
**Roles:** SUPER_ADMIN, ADMIN, SUPERVISOR

**Request Body:**
```json
{
  "title": "Foundation Work - Phase 1",
  "start_date": "2026-01-15",
  "end_date": "2026-03-20",
  "estimate": 120000,
  "total_cost": 95000,
  "s_status": "ONGOING",
  "members": ["user_id_1", "user_id_2"]
}
```

---

### 5.5 Delete Stage

**Endpoint:** `DELETE /stage/:stage_id`  
**Description:** Delete (soft delete) a stage  
**Authentication:** Required  
**Roles:** SUPER_ADMIN, ADMIN, SUPERVISOR

---

## 6. Transactions

### 6.1 Create Transaction

**Endpoint:** `POST /transaction`  
**Description:** Create a new financial transaction  
**Authentication:** Required  
**Roles:** SUPER_ADMIN, ADMIN, SUPERVISOR, ACCOUNTS

**Request Body:**
```json
{
  "pid": "project_id",
  "sid": "stage_id",
  "subcontract_id": "subcontract_id",
  "amount": 50000,
  "from": "Company Name",
  "to": "Vendor Name",
  "transaction_type": "REGULAR",
  "note": "Payment for materials",
  "payment_status": "SUCCESS",
  "payment_mode": "ONLINE"
}
```

**Transaction Types:**
- `ADVANCE`
- `REGULAR`
- `ADDITIONAL`

**Payment Statuses:**
- `SUCCESS`
- `FAILED`
- `INPROGRESS`

**Payment Modes:**
- `ONLINE`
- `CASH`
- `CHEQUE`
- `DD`
- `OTHERS`

---

### 6.2 Get Transactions by Project

**Endpoint:** `GET /transaction/project/:project_id`  
**Description:** Retrieve all transactions for a project  
**Authentication:** Required

---

### 6.3 Get Transactions by Stage

**Endpoint:** `GET /transaction/stage/:stage_id`  
**Description:** Retrieve all transactions for a stage  
**Authentication:** Required

---

### 6.4 Get Transaction by ID

**Endpoint:** `GET /transaction/:transaction_id`  
**Description:** Retrieve specific transaction details  
**Authentication:** Required

---

### 6.5 Update Transaction

**Endpoint:** `PUT /transaction/:transaction_id`  
**Description:** Update transaction details  
**Authentication:** Required  
**Roles:** SUPER_ADMIN, ADMIN, SUPERVISOR, ACCOUNTS

---

### 6.6 Delete Transaction

**Endpoint:** `DELETE /transaction/:transaction_id`  
**Description:** Delete a transaction  
**Authentication:** Required  
**Roles:** SUPER_ADMIN, ADMIN, SUPERVISOR, ACCOUNTS

---

## 7. Requests

### 7.1 Create Request

**Endpoint:** `POST /requests`  
**Description:** Create a new material/resource request  
**Authentication:** Required  
**Roles:** SUPER_ADMIN, ADMIN, SUPERVISOR, SUBCONTRACTOR, PURCHASE_MANAGER

**Request Body:**
```json
{
  "pid": "project_id",
  "sid": "stage_id",
  "title": "Cement Procurement",
  "description": "Need 100 bags of cement",
  "requested_by": "user_id",
  "request_status": "ONHOLD",
  "quantity": 100,
  "quantity_metric": "BAGS"
}
```

**Request Statuses:**
- `ONHOLD`
- `APPROVED`
- `REJECTED`
- `RECEIVED`

**Quantity Metrics:**
- `BAGS`
- `PACKS`
- `COUNT`
- `LITRE`
- `MILLILITRE`
- `KILOGRAM`
- `GRAM`

---

### 7.2 Get Requests by Project

**Endpoint:** `GET /requests/project/:project_id`  
**Description:** Retrieve all requests for a project  
**Authentication:** Required

---

### 7.3 Get Request by ID

**Endpoint:** `GET /requests/:request_id`  
**Description:** Retrieve specific request details  
**Authentication:** Required

**Response includes audit trail:**
```json
{
  "success": true,
  "data": {
    "id": "request_id",
    "title": "Cement Procurement",
    "updated_by": "user_id",
    "updated_at": "2026-04-15T10:30:00Z"
  }
}
```

---

### 7.4 Update Request

**Endpoint:** `PUT /requests/:request_id`  
**Description:** Update request details (includes approval/rejection)  
**Authentication:** Required  
**Roles:** SUPER_ADMIN, ADMIN, SUPERVISOR (for approval), All creators can edit

**Request Body:**
```json
{
  "title": "Cement Procurement - Updated",
  "description": "Need 120 bags of cement",
  "updated_by": "user_id",
  "request_status": "APPROVED",
  "quantity": 120,
  "quantity_metric": "BAGS"
}
```

---

### 7.5 Delete Request

**Endpoint:** `DELETE /requests/:request_id`  
**Description:** Delete a request  
**Authentication:** Required

---

## 8. Complaints

### 8.1 Create Complaint

**Endpoint:** `POST /complaints`  
**Description:** Create a new complaint/issue  
**Authentication:** Required  
**Roles:** SUPER_ADMIN, ADMIN, SUPERVISOR, CUSTOMER

**Request Body:**
```json
{
  "pid": "project_id",
  "sid": "stage_id",
  "uid": "user_id",
  "title": "Quality Issue",
  "description": "Concrete quality is not as per specification",
  "images": [
    "/uploads/images/tenant-1/image1.jpg",
    "/uploads/images/tenant-1/image2.jpg"
  ]
}
```

**Note:** Images must be uploaded first via `/documents/upload-image`, then URLs added to complaint.

---

### 8.2 Get Complaints by Project

**Endpoint:** `GET /complaints/project/:project_id`  
**Description:** Retrieve all complaints for a project  
**Authentication:** Required

---

### 8.3 Get Complaints by Stage

**Endpoint:** `GET /complaints/stage/:stage_id`  
**Description:** Retrieve all complaints for a stage  
**Authentication:** Required

---

### 8.4 Get Complaint by ID

**Endpoint:** `GET /complaints/:complaint_id`  
**Description:** Retrieve specific complaint details  
**Authentication:** Required

---

### 8.5 Update Complaint

**Endpoint:** `PUT /complaints/:complaint_id`  
**Description:** Update complaint details (including status and images)  
**Authentication:** Required  
**Roles:** SUPER_ADMIN, ADMIN, SUPERVISOR

**Request Body:**
```json
{
  "title": "Quality Issue - Resolved",
  "description": "Concrete quality issue has been resolved",
  "uid": "user_id",
  "c_status": "CLOSED",
  "images": [
    "/uploads/images/tenant-1/image1.jpg",
    "/uploads/images/tenant-1/image2.jpg",
    "/uploads/images/tenant-1/image3.jpg"
  ]
}
```

**Complaint Statuses:**
- `OPEN`
- `CLOSED`

---

### 8.6 Delete Complaint

**Endpoint:** `DELETE /complaints/:complaint_id`  
**Description:** Delete a complaint  
**Authentication:** Required

---

## 9. Project Chat

### 9.1 Create Chat Message

**Endpoint:** `POST /projectchat`  
**Description:** Create a new chat message (comment)  
**Authentication:** Required

**Request Body:**
```json
{
  "pid": "project_id",
  "sid": "stage_id",
  "uid": "user_id",
  "comment": "Work is progressing well",
  "images": ["/uploads/images/tenant-1/progress.jpg"]
}
```

---

### 9.2 Get Chat by Project

**Endpoint:** `GET /projectchat/project/:project_id`  
**Description:** Retrieve all chat messages for a project  
**Authentication:** Required

---

### 9.3 Get Chat by Stage

**Endpoint:** `GET /projectchat/stage/:stage_id`  
**Description:** Retrieve all chat messages for a stage  
**Authentication:** Required

---

### 9.4 Get Chat by ID

**Endpoint:** `GET /projectchat/:chat_id`  
**Description:** Retrieve specific chat message  
**Authentication:** Required

---

### 9.5 Delete Chat Message

**Endpoint:** `DELETE /projectchat/:chat_id`  
**Description:** Delete a chat message  
**Authentication:** Required

---

## 10. Subcontracts

### 10.1 Create Subcontract

**Endpoint:** `POST /subcontract`  
**Description:** Create a new subcontract work package  
**Authentication:** Required  
**Roles:** SUPER_ADMIN, ADMIN, SUPERVISOR

**Request Body:**
```json
{
  "pid": "project_id",
  "sid": "stage_id",
  "uid": "user_id",
  "title": "Electrical Work",
  "description": "Complete electrical installation for foundation stage",
  "estimate": 30000,
  "total_cost": 0,
  "progress": 0
}
```

---

### 10.2 Get Subcontracts by Project

**Endpoint:** `GET /subcontract/project/:project_id`  
**Description:** Retrieve all subcontracts for a project  
**Authentication:** Required

---

### 10.3 Get Subcontracts by Stage

**Endpoint:** `GET /subcontract/stage/:stage_id`  
**Description:** Retrieve all subcontracts for a stage  
**Authentication:** Required

---

### 10.4 Get Subcontract by ID

**Endpoint:** `GET /subcontract/:subcontract_id`  
**Description:** Retrieve specific subcontract details  
**Authentication:** Required

---

### 10.5 Update Subcontract

**Endpoint:** `PUT /subcontract/:subcontract_id`  
**Description:** Update subcontract details (including progress %)  
**Authentication:** Required  
**Roles:** SUPER_ADMIN, ADMIN, SUPERVISOR

**Request Body:**
```json
{
  "title": "Electrical Work - Phase 1",
  "description": "Complete electrical installation",
  "estimate": 35000,
  "total_cost": 28000,
  "progress": 80
}
```

---

### 10.6 Delete Subcontract

**Endpoint:** `DELETE /subcontract/:subcontract_id`  
**Description:** Delete a subcontract  
**Authentication:** Required

---

## 11. Documents & Images

### 11.1 Upload Image

**Endpoint:** `POST /documents/upload-image`  
**Description:** Upload image file (multipart form-data)  
**Authentication:** Required  
**Content-Type:** `multipart/form-data`

**Form Data:**
```
file: <image_file>
type: IMAGE | PROJECT_ICON | PROFILE_ICON | COMPLAINT_IMAGE
pid: <project_id> (optional)
sid: <stage_id> (optional)
```

**Response:**
```json
{
  "success": true,
  "data": {
    "url": "/uploads/images/tenant-1/20260415094428093-uuid.png",
    "type": "IMAGE"
  }
}
```

**Image Types:**
- `IMAGE` - General project/stage photos
- `PROJECT_ICON` - Project cover image
- `PROFILE_ICON` - User avatar
- `COMPLAINT_IMAGE` - Complaint attachments

**Mobile Implementation:**
1. Compress image (max 1920px width, 80% quality)
2. Upload as multipart form-data
3. Server returns relative URL
4. Prepend `BASE_URL` before displaying (e.g., `https://api.homesy.com/uploads/images/...`)

---

### 11.2 Get Documents by Project

**Endpoint:** `GET /documents/project/:project_id`  
**Description:** Retrieve all documents for a project  
**Authentication:** Required

---

### 11.3 Get Documents by Stage

**Endpoint:** `GET /documents/stage/:stage_id`  
**Description:** Retrieve all documents for a stage  
**Authentication:** Required

---

## 12. Invoices

### 12.1 Generate Invoice

**Endpoint:** `GET /invoices/transaction/:transaction_id`  
**Description:** Generate PDF invoice from transaction  
**Authentication:** Required  
**Roles:** SUPER_ADMIN, ADMIN, SUPERVISOR, ACCOUNTS

**Response:**
```json
{
  "success": true,
  "data": {
    "invoice_url": "/uploads/invoices/tenant-1/invoice-12345.pdf",
    "invoice_number": "INV-2026-001",
    "transaction_id": "transaction_id"
  }
}
```

**Mobile Implementation:**
- Download PDF to device
- Display in PDF viewer
- Share via system share sheet (WhatsApp, Email, etc.)

---

## 13. Global Configuration

### 13.1 Get Global Config

**Endpoint:** `GET /globalconfig`  
**Description:** Retrieve system constants, enums, and configuration  
**Authentication:** Required

**Response:**
```json
{
  "success": true,
  "data": {
    "roles": ["SUPER_ADMIN", "ADMIN", "SUPERVISOR", "SUBCONTRACTOR", "PURCHASE_MANAGER", "ACCOUNTS", "CUSTOMER"],
    "user_statuses": ["ACTIVE", "INACTIVE", "UNVERIFIED"],
    "project_statuses": ["ONGOING", "COMPLETED", "ONHOLD", "ABANDONED"],
    "stage_statuses": ["ONGOING", "COMPLETED", "ONHOLD", "ABANDONED"],
    "complaint_statuses": ["OPEN", "CLOSED"],
    "request_statuses": ["ONHOLD", "APPROVED", "REJECTED", "RECEIVED"],
    "transaction_types": ["ADVANCE", "REGULAR", "ADDITIONAL"],
    "payment_statuses": ["SUCCESS", "FAILED", "INPROGRESS"],
    "payment_modes": ["ONLINE", "CASH", "CHEQUE", "DD", "OTHERS"],
    "quantity_metrics": ["BAGS", "PACKS", "COUNT", "LITRE", "MILLILITRE", "KILOGRAM", "GRAM"]
  }
}
```

**Mobile Implementation:**
- Fetch on app launch
- Store in local cache
- Use for dropdown options in forms

---

## 14. Tenant Management

### 14.1 Create Tenant

**Endpoint:** `POST /tenants`  
**Description:** Create a new tenant organization  
**Authentication:** Required  
**Roles:** SUPER_ADMIN only

**Headers:**
```
Authorization: Bearer <token>
```

**Note:** No `x-tenant-id` header for SUPER_ADMIN operations

**Request Body:**
```json
{
  "name": "ABC Construction",
  "contact": "9567812063",
  "email": "abc@construction.com"
}
```

---

### 14.2 List All Tenants

**Endpoint:** `GET /tenants`  
**Description:** Retrieve all tenants  
**Authentication:** Required  
**Roles:** SUPER_ADMIN only

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "tenant_id",
      "name": "ABC Construction",
      "contact": "9567812063",
      "email": "abc@construction.com",
      "created_at": "2026-04-15T10:30:00Z"
    }
  ]
}
```

---

## Mobile-Specific Implementation Notes

### Error Handling

All error responses follow this format:

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

**HTTP Status Codes:**
- `200` - Success
- `400` - Bad Request (validation error)
- `401` - Unauthorized (invalid/expired token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Server Error

**Mobile Error Handling:**
- `401` → Logout user, redirect to login
- `403` → Show "Access Denied" toast
- `500` → Show "Something went wrong. Please try again."
- Network error → Show "No internet connection" with retry button

---

### Offline Queue Strategy

For offline support, queue these operations locally:

**Queue-able Operations:**
- Create/Update/Delete: Projects, Stages, Transactions, Requests, Complaints, Subcontracts
- Image uploads (store locally, upload when online)
- Team updates

**Non-queue-able (require immediate server response):**
- Login/Authentication
- User activation (OTP flow)
- Invoice generation (requires server-side PDF generation)

**Sync Flow:**
1. User performs action offline
2. Store in local queue with timestamp
3. Show "Queued for sync" indicator
4. When online, process queue in chronological order
5. Handle conflicts (last-write-wins for MVP)
6. Update UI with server responses

---

### Push Notifications

**Registration Endpoint:** (Not in Postman collection - needs to be added)

```
POST /users/register-device
Body: { "fcm_token": "device_token" }
```

**Unregister Endpoint:**

```
POST /users/unregister-device
Body: { "fcm_token": "device_token" }
```

**Notification Payload Structure:**

```json
{
  "title": "New Complaint Filed",
  "body": "Quality Issue on Project ABC",
  "data": {
    "type": "complaint",
    "project_id": "project_id",
    "complaint_id": "complaint_id",
    "deep_link": "homesy://projects/project_id/complaints/complaint_id"
  }
}
```

---

## Missing Endpoints (To Be Implemented)

Based on the PRD requirements, these endpoints are missing from the Postman collection:

1. **Project Deletion**
   - `DELETE /projects/:project_id`

2. **Document Deletion**
   - `DELETE /documents/:document_id`

3. **Push Notification Device Registration**
   - `POST /users/register-device`
   - `POST /users/unregister-device`

4. **Bulk Operations (Future)**
   - Batch user creation
   - Bulk transaction import

---

## Next Steps for Backend Team

### Critical: RBAC Implementation

**All endpoints need role-based access control:**

1. Add middleware to verify:
   - Token validity
   - Tenant access (except SUPER_ADMIN)
   - Role permissions per endpoint

2. Data scoping by role:
   - SUPER_ADMIN: All data in selected tenant
   - ADMIN: All data in their tenant
   - CUSTOMER: Only their projects
   - Others: Only assigned projects

3. Operation permissions:
   - Create/Edit/Delete restrictions per role
   - Approval flows (ADMIN/SUPERVISOR approve requests)

### API Enhancements

1. Add pagination to list endpoints
2. Add filtering/sorting query parameters
3. Add search functionality
4. Implement rate limiting
5. Add API versioning (e.g., `/v1/projects`)

### Documentation

1. Add response schemas to all endpoints
2. Add error response examples
3. Document pagination parameters
4. Add example cURL commands

---

**End of API Reference**
