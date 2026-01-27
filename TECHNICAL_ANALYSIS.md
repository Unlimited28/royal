# 🏗️ ROYAL AMBASSADORS PLATFORM - COMPREHENSIVE TECHNICAL ANALYSIS

**Date:** January 27, 2026  
**Status:** Pre-Implementation Phase  
**Author:** Senior Technical Architect

---

## Table of Contents
1. [Codebase Analysis](#codebase-analysis)
2. [Gap Analysis](#gap-analysis)
3. [Domain Model Definition](#domain-model-definition)
4. [Phased Development Plan](#phased-development-plan)
5. [Backend Architecture Plan](#backend-architecture-plan)
6. [Security & Scalability Notes](#security--scalability-notes)

---

## 🔍 Codebase Analysis

### Frontend Status
- **Framework:** React 18.3 + TypeScript 5.9 + Vite 7.2
- **Build Status:** ✅ Production-ready (no compilation errors)
- **State:** 100% UI/UX implementation with ZERO backend integration
- **Verified:** All routes, layouts, role-based access, and navigation working correctly

### What EXISTS (Frontend-Only)

#### Routing & Navigation
- Consolidated router in `App.tsx` with 3 main layout types
- 40+ pages across 4 roles (Public, Ambassador, President, Admin)
- Protected routes via `ProtectedRoute.tsx` component
- Lazy-loaded components for performance

#### Authentication (Mock)
- `AuthContext.tsx` - JWT decode logic (frontend only)
- `authService.ts` - Login/logout with localStorage simulation
- `api.ts` - Axios client with Authorization header + token expiration handling
- **Critical:** Uses `ra_token` key in localStorage; manual JWT decode via `jwt-decode` library

#### Role-Based Access Control (UI-Level)
- 3 roles: `ambassador`, `president`, `superadmin`
- Role-based sidebar rendering in `DashboardLayout.tsx`
- `ProtectedRoute.tsx` enforces role-based route access
- **Issue:** No backend validation; purely frontend checks

#### Domain Models Defined (Types)
- `User`, `Exam`, `ExamResult`, `Payment`, `CampRegistration`, `Notification`, `Association`
- Basic interfaces in `src/types/index.ts` and Mongoose schemas in `src/schemas/`

#### Pages Implemented (UI Only)

| Role | Pages Count | Status |
|------|-----------|--------|
| Public | 6 pages | Placeholder content |
| Ambassador | 8 pages | Mock data via localStorage |
| President | 6 pages | Mock data via localStorage |
| Admin | 20+ pages | Mock data via localStorage |

#### Key Features (UI Shells)
1. **Exams:** Create (form), list, take exam interface, results publishing
2. **Payments:** Verification UI, receipt generation UI
3. **Camp Registrations:** List, upload Excel (UI only), payment status tracking
4. **Blog/Gallery/Notifications:** CRUD forms exist, no backend
5. **User Management:** User list, roles assignment (UI only)
6. **Finance Dashboard:** Stats displays, transaction list

#### Data Persistence (Current)
- `localStorage` for mock data (exams, approvals, registrations)
- **Example:** `localStorage.getItem('ogbc_exams')` - hardcoded strings throughout
- **Rank Hierarchy:** Defined in `utils/logic.ts` (11-level system)
- **Example Exam Logic:** `isEligible(userRank, targetRank)` - allows only next rank

### What DOES NOT EXIST (Backend-Dependent)

| Feature | Status | Gap |
|---------|--------|-----|
| **Authentication** | ❌ No backend auth | Mock JWT decode; no server validation, no refresh tokens |
| **User Management** | ❌ No persistence | No API endpoints for CRUD |
| **Exam System** | ❌ Incomplete | UI exists; no auto-grading logic, no result persistence |
| **Payments** | ❌ Incomplete | UI exists; no payment gateway integration, no receipt upload validation |
| **Camp Registration** | ❌ Incomplete | UI exists; no Excel parsing backend, no bulk import |
| **Blog/Gallery** | ❌ Skeletal | Placeholder pages; no CMS backend |
| **Notifications** | ❌ Skeletal | Mock list only; no real-time delivery |
| **Audit Logs** | ❌ Missing | Page exists; zero logic |
| **Email Notifications** | ❌ Missing | Not implemented anywhere |
| **Role-Based Permission Enforcement** | ❌ Missing | No guard decorators; no permission matrix |
| **Database Models** | ⚠️ Partial | Mongoose schemas exist but NOT linked to NestJS services |

### Code Quality Assessment

**Strengths:**
- ✅ Clean component structure (layout, pages, components separation)
- ✅ TypeScript typing is consistent
- ✅ Tailwind CSS properly applied (navy/gold branding)
- ✅ Error boundaries exist (`ErrorBoundary.tsx`)
- ✅ Toast notifications set up (`ToastContext.tsx`)
- ✅ E2E tests framework in place (Playwright)

**Concerns:**
- ⚠️ Services are 99% commented out (`adminService.ts`, `ambassadorService.ts`)
- ⚠️ `authService.ts` references old PHP endpoint: `/auth/login.php`
- ⚠️ Hardcoded mock data throughout pages
- ⚠️ No environment variable validation for backend URLs
- ⚠️ localStorage keys inconsistent (`ogbc_` vs `ra_`)
- ⚠️ No form validation beyond React inputs (no Zod/Yup enforcement)

---

## 📊 Gap Analysis: PRD vs Codebase

### What the PRD Requires (Inferred from UI)

**User Management:**
- Register new ambassadors
- Assign roles (ambassador, president, admin)
- Manage associations/organizations
- User status tracking (active, inactive, suspended)

**Authentication & Authorization:**
- JWT-based login
- Token refresh mechanism
- Password reset via email
- Email verification
- Role-based guards on all endpoints

**Exam System:**
- Create exams with questions (4-option multiple choice)
- Associate exam with rank requirement
- Ambassador takes exam (timed, auto-grade)
- Results published by admin
- Association president approves ambassadors before exam access

**Payments:**
- Ambassador submits payment proof (image/receipt)
- Admin verifies payment
- Generate receipt
- Track multiple payment types (membership, exam, camp)

**Camp Registrations:**
- Ambassador registers for annual camps
- Admin can bulk import registrations (Excel)
- Payment tracking per registration
- Camp year and type management

**Role Hierarchy:**
- **Ambassador:** Can take exams, register for camps, view results
- **Association President:** Approves ambassadors for exams, manages camp registrations
- **Super Admin:** Manages all users, organizations, finances, publishes results

### What CURRENTLY EXISTS

| Feature | Status | Completeness |
|---------|--------|--------------|
| User registration UI | ✅ Page exists | 5% - no backend call |
| User login UI | ✅ Page exists | 5% - mock JWT only |
| Role-based pages | ✅ All present | 100% - UI only |
| Exam creation form | ✅ Form exists | 10% - saves to localStorage |
| Exam taking interface | ✅ UI exists | 5% - no backend submission |
| Auto-grading logic | ❌ Missing | 0% |
| Results display | ✅ Page exists | 20% - mock data |
| Payment verification | ✅ Form exists | 10% - no file upload |
| Camp registration form | ✅ UI exists | 20% - mock list |
| Excel import UI | ✅ Button exists | 0% - no parsing logic |

### Critical Missing Components (MUST BUILD)

**Authentication & Security:**
- ❌ NestJS auth module with JWT strategy
- ❌ Password hashing (bcrypt integration in backend)
- ❌ Email verification flow
- ❌ Password reset mechanism
- ❌ Refresh token rotation
- ❌ Role-based access control guards

**Exam System (Core Domain):**
- ❌ Exam service with full CRUD
- ❌ Question bank management
- ❌ ExamAttempt tracking (when user starts exam)
- ❌ Answer submission + auto-grading engine
- ❌ Result persistence and publishing
- ❌ Exam approval workflow (president → admin)

**Payment Processing:**
- ❌ Payment schema + service
- ❌ File upload handler for receipts (AWS S3 or local storage)
- ❌ Receipt verification workflow
- ❌ Receipt generation (PDF creation)
- ❌ Payment status lifecycle (pending → verified → approved)

**Camp Management:**
- ❌ Camp schema
- ❌ CampRegistration service
- ❌ Excel/CSV parsing backend
- ❌ Bulk import validation
- ❌ Duplicate detection

**Organization Management:**
- ⚠️ Organization schema exists but not fully integrated
- ❌ President assignment per organization
- ❌ Hierarchical access control (president can only see own organization)

---

## 🧬 Domain Model Definition

### Core Entities & Relationships

```
User (Ambassador, President, SuperAdmin)
├── 1:1 → Profile (extended user info)
├── N:1 → Organization (Association)
├── N:N → Roles (via Role table)
└── 1:N → ExamAttempts
          └── 1:1 → ExamResult

Organization (Association, Conference)
├── 1:N → Users
├── 1:1 → President (User)
├── N:N → Roles (org-scoped)
└── 1:N → CampRegistrations

Exam
├── 1:N → Questions
├── 1:N → ExamAttempts
├── 1:N → Results
└── Many:Many → Organizations (accessible to specific orgs)

Question
├── N:1 → Exam
└── Embedded in ExamAttempt (snapshot at attempt time)

ExamAttempt
├── 1:1 → User
├── 1:1 → Exam
├── N:1 → Organization
├── startedAt, endedAt, status (in-progress, submitted, graded)
└── answers: [ { questionId, selectedOption, isCorrect } ]

ExamResult
├── 1:1 → ExamAttempt
├── score, passed, feedback
└── publishedAt, publishedBy (admin user)

Payment
├── 1:1 → User
├── 1:1 → Organization
├── type (membership, exam_fee, camp_fee)
├── status (pending, verified, approved, rejected)
└── receipt (S3 URL or file path)

Receipt (sub-document or separate)
├── File reference
├── uploadedAt, uploadedBy
├── verifiedAt, verifiedBy
└── amount, transactionRef

CampRegistration
├── 1:1 → User
├── 1:1 → Organization
├── 1:1 → Camp (year/type combo)
├── 1:1 → Payment (linked)
└── status (registered, paid, completed)

Role
├── name (Ambassador, President, Admin)
├── permissions [ "read:exam", "write:exam", "approve:exam" ]
├── organization (scoped to org or null for global)
└── isSystemRole (immutable flag)

AuditLog
├── userId, action (CREATE, UPDATE, DELETE)
├── entityType, entityId
├── changedFields, timestamp
└── ipAddress
```

### Key Business Rules (Domain Logic)

**Rank Progression (Critical):**
- 11-level hierarchy: Candidate → ... → Ambassador Plenipotentiary
- User must be at rank N to take exam for rank N+1
- President must approve before ambassador can access exam
- Can only take one exam at a time (in-progress exams block others)

**Exam Lifecycle:**
1. Admin creates exam with questions
2. Admin publishes exam for specific organization
3. Ambassador qualifies by rank
4. President approves ambassador for exam
5. Ambassador starts exam (time limit enforced server-side)
6. System auto-grades on submission
7. Admin publishes results (visible to ambassador)

**Payment Verification:**
1. Ambassador uploads receipt image
2. Admin reviews payment details
3. Admin verifies amount matches expected
4. Admin generates official receipt
5. Payment marked as approved (unlocks features)

**Camp Registration:**
1. Admin creates camp (year, type, fee)
2. Ambassadors register individually OR
3. President bulk uploads Excel with ambassador data
4. System validates records, creates registrations
5. Each registration linked to payment
6. Payment status determines registration status

---

## 🚀 Phased Development Plan

### PHASE 1: FOUNDATION (Weeks 1-4)
**Goal:** Working authentication, user management, and exam system (core revenue driver)

#### Features Delivered
1. User Registration & Login (JWT-based)
2. Email Verification
3. Role-Based Access Control (Guards & Decorators)
4. User Management Dashboard
5. Organization/Association Management
6. Exam CRUD (Admin)
7. Exam Taking Interface (Ambassador)
8. Auto-Grading Engine
9. Results Publishing & Display
10. Approval Workflow (President → Admin)

#### Backend Modules
- `auth/` (auth.controller, auth.service, jwt.strategy, auth.guard)
- `users/` (user.controller, user.service)
- `organizations/` (organization.controller, organization.service)
- `exams/` (exam.controller, exam.service)
- `questions/` (question.service, embedded in exam)
- `exam-attempts/` (examAttempt.controller, examAttempt.service)
- `results/` (result.service)
- `roles/` (role.service)
- `common/` (guards, decorators, filters, pipes)

#### Database Entities
- User
- Organization
- Role
- Exam
- Question
- ExamAttempt
- ExamResult
- AuditLog (basic)

#### Security Considerations
- ✅ JWT with expiration (15min access, 7-day refresh)
- ✅ Bcrypt password hashing (rounds: 12)
- ✅ Email verification before account activation
- ✅ Rate limiting on login (5 attempts/15min)
- ✅ Role guards on sensitive endpoints
- ✅ Exam start/end validation (prevent cheating: no exam retake during timed window)
- ✅ Audit logging for exam attempts and results
- ✅ Time-based exam expiration (server-enforced, not client)

#### Frontend Integration Points
- Store JWT in httpOnly cookie (if possible) OR localStorage with CSRF token
- Refresh token logic in API interceptor
- Display role-appropriate dashboards
- Render exam interface with countdown timer
- Show results in dashboard

#### Deliverables
- API spec (OpenAPI/Swagger)
- Database schema docs
- Authentication flow diagram
- Test suite (e2e for critical flows)

---

### PHASE 2: PAYMENTS & CAMP (Weeks 5-7)
**Goal:** Payment processing and camp registration (enables revenue collection)

#### Features Delivered
1. Payment Upload (Receipt Image)
2. Payment Verification Workflow
3. Receipt Generation (PDF)
4. Camp Management (Create, Edit)
5. Camp Registration (Individual)
6. Camp Registration Bulk Import (Excel)
7. Payment Linking (Registration ↔ Payment)
8. Finance Dashboard (Aggregated metrics)
9. Voucher System (if required)

#### Backend Modules
- `payments/` (payment.controller, payment.service, file.service)
- `camps/` (camp.controller, camp.service)
- `camp-registrations/` (campRegistration.controller, campRegistration.service)
- `file-upload/` (upload.service, validations)
- `finance/` (analytics.service)
- `receipts/` (receipt.service, PDF generation)
- `import/` (csv/excel parser)

#### Database Entities
- Payment
- Receipt (as sub-document or reference)
- Camp
- CampRegistration

#### Security Considerations
- ✅ File type validation (image/pdf only for receipts)
- ✅ File size limits (max 5MB)
- ✅ Virus scanning (optional: ClamAV integration)
- ✅ Payment tampering prevention (hash verification)
- ✅ Prevent duplicate registrations (unique constraint on user + camp)
- ✅ Excel upload rate limiting (max 1000 rows per import)
- ✅ Audit trail for all payment verifications
- ✅ Receipt generation only by verified admins

#### Frontend Integration Points
- Payment upload modal with drag-drop
- Verification status polling
- Receipt download
- Camp registration form
- Excel template download
- Finance dashboard charts

---

### PHASE 3: CONTENT & NOTIFICATIONS (Weeks 8-9)
**Goal:** Blog, gallery, notifications, system hardening

#### Features Delivered
1. Blog Post CRUD (Admin)
2. Blog Post Publishing (Status: Draft, Published, Archived)
3. Gallery Management (Admin uploads)
4. Notification System (Real-time via WebSocket or polling)
5. Email Notifications (Password reset, exam results, payments)
6. Audit Logs (Full system audit trail)
7. System Settings (Logo, colors, email templates)
8. Rate Limiting (Global)
9. Error Handling & Monitoring

#### Backend Modules
- `blog/` (blog.controller, blog.service)
- `gallery/` (gallery.controller, gallery.service)
- `notifications/` (notification.controller, notification.service, notification.gateway - WebSocket)
- `email/` (email.service, email templates)
- `audit/` (audit.service, audit.filter)
- `settings/` (settings.service)
- `monitoring/` (Sentry/LogRocket integration)

#### Database Entities
- BlogPost
- GalleryItem
- Notification
- AuditLog (expanded)
- SystemSettings

#### Security Considerations
- ✅ HTML sanitization for blog posts
- ✅ CORS for WebSocket connections
- ✅ Rate limiting by IP and user ID
- ✅ Email template injection prevention
- ✅ Audit log immutability (no updates/deletes)

---

## 🏗️ Backend Architecture Plan

### Technology Stack (Locked)
- **Runtime:** Node.js 18+
- **Framework:** NestJS 10+ (TypeScript-first, decorator-based)
- **Database:** MongoDB + Mongoose 8+
- **Authentication:** JWT (jsonwebtoken library)
- **Hashing:** bcrypt v5.1
- **Validation:** class-validator + class-transformer (DTOs)
- **File Upload:** multer + AWS S3 (or local FS)
- **Email:** nodemailer or SendGrid
- **Logging:** Winston or Pino
- **Testing:** Jest + Supertest

### NestJS Folder Structure (Best Practice)

```
backend/
├── src/
│   ├── main.ts                         # App entry point
│   ├── app.module.ts                   # Root module
│   ├── app.controller.ts               # Health check endpoint
│   ├── common/
│   │   ├── guards/
│   │   │   ├── jwt-auth.guard.ts
│   │   │   ├── role.guard.ts           # @Roles('admin') decorator
│   │   │   └── throttle.guard.ts
│   │   ├── decorators/
│   │   │   ├── roles.decorator.ts
│   │   │   ├── public.decorator.ts
│   │   │   └── user.decorator.ts       # @CurrentUser()
│   │   ├── filters/
│   │   │   └── http-exception.filter.ts
│   │   ├── pipes/
│   │   │   └── validation.pipe.ts
│   │   ├── interceptors/
│   │   │   └── transform.interceptor.ts
│   │   ├── dto/
│   │   │   ├── pagination.dto.ts
│   │   │   └── error-response.dto.ts
│   │   └── constants/
│   │       └── error-messages.ts
│   ├── auth/
│   │   ├── auth.controller.ts          # /auth/* endpoints
│   │   ├── auth.service.ts
│   │   ├── auth.module.ts
│   │   ├── strategies/
│   │   │   └── jwt.strategy.ts
│   │   ├── dto/
│   │   │   ├── login.dto.ts
│   │   │   ├── register.dto.ts
│   │   │   ├── refresh-token.dto.ts
│   │   │   └── reset-password.dto.ts
│   │   └── guards/
│   │       └── jwt-refresh.guard.ts
│   ├── users/
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   ├── users.module.ts
│   │   ├── schemas/
│   │   │   └── user.schema.ts
│   │   └── dto/
│   │       ├── create-user.dto.ts
│   │       ├── update-user.dto.ts
│   │       └── user-response.dto.ts
│   ├── organizations/
│   │   ├── organizations.controller.ts
│   │   ├── organizations.service.ts
│   │   ├── organizations.module.ts
│   │   ├── schemas/
│   │   │   └── organization.schema.ts
│   │   └── dto/
│   ├── exams/
│   │   ├── exams.controller.ts
│   │   ├── exams.service.ts
│   │   ├── exams.module.ts
│   │   ├── schemas/
│   │   │   ├── exam.schema.ts
│   │   │   ├── question.schema.ts
│   │   │   ├── exam-attempt.schema.ts
│   │   │   └── exam-result.schema.ts
│   │   ├── dto/
│   │   │   ├── create-exam.dto.ts
│   │   │   ├── submit-exam.dto.ts
│   │   │   └── publish-results.dto.ts
│   │   └── services/
│   │       ├── exam-grading.service.ts (auto-grade logic)
│   │       └── exam-validation.service.ts (rank eligibility)
│   ├── payments/
│   │   ├── payments.controller.ts
│   │   ├── payments.service.ts
│   │   ├── payments.module.ts
│   │   ├── schemas/
│   │   │   └── payment.schema.ts
│   │   ├── dto/
│   │   ├── services/
│   │   │   └── file-upload.service.ts (receipt handling)
│   │   └── validations/
│   │       └── receipt-validator.ts
│   ├── camps/
│   │   ├── camps.controller.ts
│   │   ├── camps.service.ts
│   │   ├── camps.module.ts
│   │   ├── schemas/
│   │   │   ├── camp.schema.ts
│   │   │   └── camp-registration.schema.ts
│   │   ├── dto/
│   │   ├── import/
│   │   │   └── excel-import.service.ts
│   │   └── validations/
│   │       └── registration-validator.ts
│   ├── notifications/
│   │   ├── notifications.controller.ts
│   │   ├── notifications.service.ts
│   │   ├── notifications.module.ts
│   │   ├── schemas/
│   │   │   └── notification.schema.ts
│   │   └── gateways/
│   │       └── notifications.gateway.ts (WebSocket)
│   ├── email/
│   │   ├── email.service.ts
│   │   ├── templates/
│   │   │   ├── verification-email.hbs
│   │   │   ├── password-reset.hbs
│   │   │   ├── exam-result.hbs
│   │   │   └── payment-receipt.hbs
│   │   └── email.module.ts
│   ├── audit/
│   │   ├── audit.service.ts
│   │   ├── audit.filter.ts
│   │   ├── schemas/
│   │   │   └── audit-log.schema.ts
│   │   └── audit.module.ts
│   ├── config/
│   │   ├── config.module.ts
│   │   ├── database.config.ts
│   │   ├── jwt.config.ts
│   │   └── file-upload.config.ts
│   └── database/
│       ├── seeders/
│       │   ├── seed.service.ts
│       │   └── initial-roles.seed.ts
│       └── migrations/
├── test/
│   ├── auth.e2e-spec.ts
│   ├── exams.e2e-spec.ts
│   └── payments.e2e-spec.ts
├── .env.example
├── .env.production
└── package.json
```

### Authentication Flow (Detailed)

#### 1. REGISTER
```
POST /auth/register
Body: { email, password, firstName, lastName, phone, church, organization }
→ Service validates email uniqueness
→ Hash password (bcrypt, 12 rounds)
→ Create user document (status: pending)
→ Generate email verification token
→ Send verification email
→ Return: { message: "Check email" }
```

#### 2. VERIFY EMAIL
```
GET /auth/verify-email?token=<token>
→ Validate token (checks hash, expiration)
→ Mark user as email_verified
→ Return: { message: "Email verified, login now" }
```

#### 3. LOGIN
```
POST /auth/login
Body: { email, password }
→ Validate email exists
→ Check email_verified flag
→ Compare password (bcrypt.compare())
→ If valid:
   → Generate JWT tokens:
      - Access token: 15min expiration, user data
      - Refresh token: 7-day expiration, tokenId
   → Save refresh token ID in User.refreshTokens[]
   → Return: { accessToken, refreshToken, user }
```

#### 4. REFRESH TOKEN
```
POST /auth/refresh
Body: { refreshToken }
→ Validate JWT signature
→ Check token ID exists in User.refreshTokens
→ Generate new access token
→ Optionally rotate refresh token
→ Return: { accessToken, refreshToken }
```

#### 5. LOGOUT
```
POST /auth/logout
Header: { Authorization: Bearer <token> }
→ Extract user ID from token
→ Remove refreshToken ID from User.refreshTokens
→ Return: { message: "Logged out" }
```

#### 6. RESET PASSWORD
```
POST /auth/forgot-password
Body: { email }
→ Generate password reset token (32-byte random)
→ Save token hash + expiration (10 min)
→ Send reset email
→ Return: { message: "Reset link sent" }

POST /auth/reset-password
Body: { token, newPassword }
→ Validate token, expiration
→ Hash new password
→ Update user password
→ Clear reset token
→ Return: { message: "Password reset" }
```

### API Design Pattern (RESTful)

```
/auth
  POST   /register                      # Public
  GET    /verify-email                  # Public
  POST   /login                         # Public
  POST   /refresh                       # Public (with refresh token)
  POST   /logout                        # Protected
  POST   /forgot-password               # Public
  POST   /reset-password                # Public

/users
  GET    /users                         # Admin only (list all)
  GET    /users/me                      # Protected (current user)
  GET    /users/:id                     # Admin or self
  POST   /users                         # Admin only (create)
  PATCH  /users/:id                     # Admin or self
  DELETE /users/:id                     # Admin only
  PATCH  /users/:id/role                # Admin only

/organizations
  GET    /organizations                 # Admin (all) | Others (own)
  GET    /organizations/:id             # Admin | President of org
  POST   /organizations                 # Admin only
  PATCH  /organizations/:id             # Admin | President of org
  DELETE /organizations/:id             # Admin only

/exams
  GET    /exams                         # Paginated, role-filtered
  GET    /exams/:id                     # Admin | Approved ambassadors
  POST   /exams                         # Admin only
  PATCH  /exams/:id                     # Admin only
  DELETE /exams/:id                     # Admin only
  
  POST   /exams/:id/start               # Ambassador (validate rank + approval)
  POST   /exams/:id/submit              # Ambassador (validate time limit)
  POST   /exams/:id/publish-results     # Admin only
  GET    /exams/:id/results             # Admin | Own result

/exam-approvals
  GET    /exam-approvals                # President (own org) | Admin
  POST   /exam-approvals                # President (own org)
  PATCH  /exam-approvals/:id            # President (own org)

/payments
  GET    /payments                      # Admin (all) | User (own)
  POST   /payments                      # Authenticated (upload receipt)
  PATCH  /payments/:id                  # Admin (verify/reject)
  GET    /payments/:id/receipt          # Admin | Owner (download)

/camps
  GET    /camps                         # Public list
  POST   /camps                         # Admin only
  PATCH  /camps/:id                     # Admin only
  DELETE /camps/:id                     # Admin only

/camp-registrations
  GET    /camp-registrations            # Org president | Admin
  POST   /camp-registrations            # Authenticated
  PATCH  /camp-registrations/:id        # Org president | Admin
  POST   /camp-registrations/import     # Org president | Admin (Excel)

/notifications
  GET    /notifications                 # Authenticated
  PATCH  /notifications/:id/read        # Authenticated
  DELETE /notifications/:id             # Authenticated
  WebSocket /notifications              # Real-time updates
```

### Error Handling Strategy

```typescript
// Global error response format
{
  success: false,
  error: {
    code: "INVALID_EXAM_RANK",
    message: "You must be at Senior Intern rank to take this exam",
    details: { requiredRank: "Envoy", currentRank: "Intern" },
    timestamp: "2024-01-27T10:30:00Z",
    requestId: "req_12345"  // For tracing
  }
}

// Custom exceptions
- BadRequestException (400) - Validation failures
- UnauthorizedException (401) - Auth failures
- ForbiddenException (403) - Permission denied
- NotFoundException (404) - Resource not found
- ConflictException (409) - Duplicate data
- InternalServerErrorException (500) - Server errors

// Global exception filter logs all errors to audit trail
```

### Validation Strategy (DTOs)

```typescript
// Example: CreateExamDto
import { IsString, IsNumber, IsEnum, ArrayMinSize, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateExamDto {
  @IsString()
  @MinLength(3)
  title: string;

  @IsString()
  description: string;

  @IsEnum(['Candidate', 'Assistant Intern', ...])
  targetRank: string;

  @IsNumber()
  @Min(15)
  @Max(180)
  duration_minutes: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  pass_score: number;

  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => QuestionDto)
  questions: QuestionDto[];
}

export class QuestionDto {
  @IsString()
  text: string;

  @ArrayMinSize(4)
  @ArrayMaxSize(4)
  @IsString({ each: true })
  options: string[];

  @IsNumber()
  @Min(0)
  @Max(3)
  correctAnswer: number;
}

// Global validation pipe applied to all endpoints
// Rejects with 400 on DTO validation failure
```

---

## 🔐 Security & Scalability Notes

### Password Security

| Aspect | Implementation |
|--------|-----------------|
| **Hashing** | bcrypt v5.1, 12 salt rounds (160ms/hash - acceptable for login) |
| **Storage** | Never store plaintext; password field marked `select: false` in schema |
| **Comparison** | Use bcrypt.compare() - prevents timing attacks |
| **Reset** | Token-based, 10-min expiration, one-time use |
| **Policy** | Enforce: min 8 chars, 1 uppercase, 1 number, 1 special char |

### Token Management

| Aspect | Implementation |
|--------|-----------------|
| **JWT Secrets** | Use strong random secrets (32+ bytes), stored in .env |
| **Access Token** | 15 minutes, contains: `{ userId, role, orgId, exp }` |
| **Refresh Token** | 7 days, contains: `{ userId, tokenId, exp }` |
| **Refresh Rotation** | Generate new refresh token on each refresh request |
| **Token ID Tracking** | Store tokenId in User.refreshTokens[] - allows revocation |
| **Logout** | Remove tokenId from User.refreshTokens (invalidates token) |
| **Storage** | Access token: httpOnly cookie (best) OR localStorage |
| **XSS Prevention** | Use CSP headers, sanitize inputs |

### Role Escalation Prevention

| Control | Implementation |
|---------|-----------------|
| **Role Assignment** | Only SuperAdmin can assign roles via dedicated endpoint |
| **Role Modification** | User cannot change own role; requires admin verification |
| **Guard Enforcement** | `@RoleGuard()` decorator checks database role, not JWT claim |
| **Organization Scoping** | President can only manage own org; verified at service layer |
| **Audit Trail** | Every role change logged with who, when, why |
| **JWT Claim Verification** | Always re-fetch user from DB in guards (don't trust JWT claims) |

### Rate Limiting

```
Per IP address:
- Login endpoint: 5 attempts / 15 minutes → 429 Too Many Requests
- Password reset: 3 attempts / 1 hour
- File upload: 10 requests / 1 hour
- API requests: 100 requests / 1 minute (per user)

Implementation: @RateLimit(limit: 5, timeWindow: '15m')
Using NestJS throttler module + RedisStore for distributed systems
```

### Data Integrity & Auditability

| Aspect | Implementation |
|--------|-----------------|
| **Immutable Audit Logs** | AuditLog documents are write-only, never updated/deleted |
| **Change Tracking** | Log before/after values for all sensitive fields |
| **User Attribution** | Every action linked to userId via JWT |
| **Timestamp** | Server-generated `createdAt`, `updatedAt` (client cannot set) |
| **Soft Deletes** | Sensitive data (users, exams) marked `deleted=true`, not removed |
| **Audit Queries** | Find all actions by user, entity, action type, date range |
| **Financial Records** | Payment records immutable after verification |

### Exam Integrity

| Control | Implementation |
|--------|-----------------|
| **Time Enforcement** | Server tracks exam start/end; client timeout is UX only |
| **Answer Submission** | Accept answers only if exam in "in-progress" state |
| **Question Integrity** | Question text hashed at exam publication; detect tampering |
| **Duplicate Attempts** | Only 1 active exam per user at a time |
| **Rank Validation** | Verify rank at exam start, not just at attempt creation |
| **IP Logging** | Log IP address for each exam attempt (detect cheating locations) |
| **Session Binding** | Exam session tied to user + IP + browser fingerprint |

### Scalability Considerations

| Concern | Solution |
|---------|----------|
| **Database Indexing** | Indexes on: email, userId, orgId, status, createdAt, exam_id |
| **Pagination** | All list endpoints limit 50 items default, max 500 |
| **Caching** | Redis cache for: exam questions, org data, user roles (TTL 5min) |
| **File Storage** | AWS S3 for payment receipts (not local FS on single server) |
| **Email Queue** | Queue email via Bull/BullMQ; retry with exponential backoff |
| **WebSocket Scaling** | Use Redis pub/sub for notification broadcast across servers |
| **Connection Pooling** | MongoDB connection pool size: 100+ in prod |
| **API Versioning** | Accept-Version header; breaking changes go to /v2/ |
| **Load Balancing** | Stateless design; JWT doesn't require sticky sessions |

### Compliance & Auditing

- ✅ GDPR: Support data export, deletion requests
- ✅ Nigeria Data Protection: Encrypt data at rest (MongoDB encryption)
- ✅ Financial Audit: Payment records immutable with full audit trail
- ✅ User Activity: Login/logout, exam access, payment verification all logged
- ✅ Admin Actions: All admin operations traceable to user
- ✅ Data Retention: Define retention policy per entity (e.g., logs after 1 year)

---

## 📌 Summary Table: PHASE 1 Scope

| Category | Item | Status | Notes |
|----------|------|--------|-------|
| **Auth** | JWT Login | ❌ Missing | Replace mock with real JWT |
| | Refresh Tokens | ❌ Missing | Implement rotation |
| | Email Verification | ❌ Missing | Send token via email |
| | Password Reset | ❌ Missing | 10-min token |
| **Users** | User CRUD | ❌ Missing | Admin only, except register |
| | Role Assignment | ❌ Missing | Admin assigns roles |
| | User Search/Filter | ❌ Missing | Pagination, search by email |
| **Orgs** | Org CRUD | ❌ Missing | Manage associations |
| | President Assignment | ❌ Missing | Link president to org |
| **Exams** | Exam CRUD | ⚠️ Partial | UI exists; no backend |
| | Question Management | ⚠️ Partial | UI exists; no backend |
| | Exam Taking | ⚠️ Partial | UI exists; submission validation missing |
| | Auto-Grading | ❌ Missing | Score calculation, pass/fail logic |
| | Results Publishing | ⚠️ Partial | UI exists; no backend publish workflow |
| | Approval Workflow | ⚠️ Partial | UI exists; no backend endpoints |
| **Common** | Global Exception Filter | ❌ Missing | Consistent error responses |
| | Role Guards | ❌ Missing | @Roles('admin') decorator |
| | Audit Logging | ❌ Missing | Log sensitive operations |
| | Rate Limiting | ❌ Missing | Prevent abuse |
| | Input Validation (DTOs) | ❌ Missing | class-validator + pipes |

---

## ⛔ Analysis Complete - Awaiting Approval

**Status:** Pre-Implementation Phase

### Next Steps (Awaiting Explicit Approval):
1. ✅ Confirm Phase 1 scope is acceptable
2. ✅ Approve technology stack (NestJS + MongoDB + JWT)
3. ✅ Authorize proceeding to code implementation
4. ✅ Clarify any requirements not explicit in analysis

### What WILL NOT Be Done Until Approved:
- ❌ Create NestJS project structure
- ❌ Write controllers or services
- ❌ Generate database schemas
- ❌ Implement authentication endpoints
- ❌ Write any production code

---

**Document Generated:** January 27, 2026  
**Analysis Status:** COMPLETE - AWAITING APPROVAL TO PROCEED
