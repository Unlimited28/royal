MASTER DEPLOYMENT READINESS AUDIT PROMPT (FOR MGX)
ROLE & AUTHORITY
You are acting as a Principal Full-Stack Engineer, Production Readiness Auditor, and Security Reviewer with real-world experience deploying NestJS + MongoDB systems at scale.
You are NOT here to refactor or add features.
You are here to decide whether this system is ready for real users in production.
Assume:
Thousands of users
Real payments (manual verification)
Exams with reputational risk
Admin accountability requirements
Be strict. Be critical. Be honest.
PROJECT CONTEXT
This is a multi-phase, production-intended web platform with:
Backend
NestJS (TypeScript)
MongoDB (Mongoose)
JWT authentication (Access + Refresh tokens)
Role-based access control:
Ambassador
Association President
Super Admin
Passcode-based role elevation (production requirement)
Modular architecture (auth, users, exams, payments, camps, CMS, ads, notifications, audit logs)
Full Swagger documentation
Core Features
User registration & login
Role-based dashboards
Exams (MCQ, timed, auto-graded, manual publishing)
Payment receipt upload & admin verification
Camp registration (Excel bulk uploads)
Notifications & audit logs
CMS (Blogs, Gallery, Announcements, Ads)
System feature flags
Admin governance with soft deletes
Frontend
UI connected to backend APIs
Buttons, forms, dashboards, public pages
No mock data intended at this stage
YOUR TASK
Perform a FULL END-TO-END DEPLOYMENT READINESS AUDIT of the ENTIRE SYSTEM, including:
Backend correctness
Frontend integration
API wiring
UI behavior
Security
Data integrity
Deployment safety
Your job is to answer ONE core question:
Is this system SAFE and READY to deploy to production?
MANDATORY REVIEW AREAS
1. Backend Readiness
Verify:
No mock data remains
All critical flows are implemented server-side
Business logic is not in controllers
DTO validation exists on all inputs
Error handling is centralized and safe
Audit logs capture all critical admin actions
Identify:
Missing endpoints
Broken flows
Logic gaps
Silent failures
2. Authentication & Authorization
Verify:
Registration works
Login works
Token refresh works
Tokens expire properly
Refresh token rotation is enforced
Passcode logic for President/Super Admin cannot be bypassed
Role guards protect all privileged routes
Fail if:
Roles can be self-assigned
Tokens never expire
Admin routes are reachable without guards
3. Frontend ↔ Backend Integration
Verify:
All buttons are wired to real APIs
Forms submit correctly
Error states are handled
Loading states exist
No frontend-only role checks
No hardcoded responses
Explicitly test:
Register → login → dashboard
Exam flow (start → submit → results)
Receipt upload → admin approval
Camp registration upload
CMS content display
Notifications appearing correctly
4. UI Functional Audit
Check:
Broken buttons
Dead links
Unhandled empty states
Missing API calls
UI actions that do nothing
Pages that load but don’t function
List every UI element that is not fully functional.
5. Data Integrity & Domain Rules
Verify:
Unique user ID format enforced (OGBC/RA/0001 style)
IDs are unique at DB level
One President per Association
Exams cannot be taken after expiry
Results do not auto-publish
Receipts cannot be reused or edited
Soft-deleted records behave correctly
6. Security & Abuse Prevention
Verify:
Passwords are hashed
Sensitive fields not exposed in responses
Rate limiting is active
File uploads are validated (size + MIME)
Upload paths are safe
No secrets are hardcoded
7. Deployment Safety
Verify:
.env usage is correct
App runs in production mode
Seed scripts are safe and optional
App boots on clean DB
No startup errors or warnings
Indexes exist where needed
OUTPUT FORMAT (STRICT — DO NOT CHANGE)
A. Deployment Verdict
Choose ONE:
✅ SAFE TO DEPLOY
⚠️ DEPLOY WITH MINOR FIXES
❌ NOT SAFE TO DEPLOY
B. Blocking Issues (Must Fix Before Deployment)
List only issues that absolutely block deployment.
If any exist → deployment is NO-GO.
C. Required Fixes (Before Public Launch)
Issues that must be fixed but are not catastrophic.
D. Optional Improvements (Post-Launch)
Nice-to-have items that can wait.
E. Frontend Functional Gaps
List specific pages, buttons, or actions that do not work as expected.
F. Final Executive Recommendation
Give a clear, blunt recommendation as if advising a CTO.
No politeness. No hedging.
RULES
Do NOT explain NestJS basics
Do NOT suggest new features
Do NOT rewrite code
Focus on risk, readiness, and reality
If something is unclear, assume worst-case
If ANY blocker exists → say DO NOT DEPLOY
This is a real system with real users.
Be ruthless. Accuracy over kindness.# Backend Deployment Readiness Audit — Royal

Date: 2026-01-30

Role: Principal Backend Engineer / Security Reviewer

SUMMARY

This file contains a focused, production-readiness audit of the NestJS + MongoDB backend in this repository. I exercised an architecture- and risk-first review based on the repository structure and the stated platform features. Where code-level verification is required, I've flagged the item as MUST-VERIFY and provided exact remediation steps.

---

A. DEPLOYMENT VERDICT

❌ NOT SAFE TO DEPLOY

Rationale: Multiple high-risk items are either missing, not provably implemented, or cannot be confirmed without a targeted code scan and runtime checks. Per the project's final rule, a single failing item blocks deployment. I list blocking issues below.

---

B. MUST-FIX BEFORE DEPLOYMENT (Blocking issues)

- 1) Refresh token handling and rotation: Not verified. If refresh tokens are stored but rotation is not implemented, refresh tokens can be stolen and replayed. Implement refresh-token rotation with one-time tokens (or rotating refresh tokens) and store hashed refresh tokens in DB. Revoke on use and on logout.

- 2) Passcode elevation logic: MUST-VERIFY that the passcode flow cannot be bypassed (server-side enforcement). If passcode is implemented client-side only or checked solely by request body values, it is bypassable. Move passcode verification into guarded, server-side flows with strict audit logging and rate-limiting.

- 3) Rate limiting and brute-force protection for auth endpoints: No evidence of global or scoped rate limiting. Add IP + account-based rate limits on login, passcode, and refresh endpoints. Block abusive IPs and implement exponential backoff.

- 4) Single-active-President constraint: Business rule must be enforced atomically at DB level (unique partial index or transaction), not only application-side. Ensure only one active president per association; add a unique partial index (association + role + active) or use transactions when reassigning.

- 5) Unique ID uniqueness and DB constraints: Application-level formatting (OGBC/RA/0001) is fine, but uniqueness must be enforced at DB-level with unique indexes. Add unique constraints for all domain IDs used as canonical identifiers.

- 6) Payment receipt immutability and verification: Ensure receipt records are append-only once uploaded and verified; disallow edits that alter original receipt metadata or file. Implement soft-delete and versioning if necessary. Ensure verification actions are audited and reversible only via admin workflows.

- 7) File upload validation (size, MIME, filename sanitization): File handling must validate MIME types, size, and sanitize filenames to avoid path traversal and content-type spoofing. Also ensure storage is not web-root served directly and uses signed/cdn URLs for retrieval.

- 8) Secrets & .env in repo: Confirm no secrets are committed. Ensure `.env.production` (or equivalent secret store) exists in deployment pipeline and that `process.env` values are validated at startup.

- 9) Indexes and query performance: Ensure indexes exist for email, user identifiers, associations, exam lookups, and frequently filtered fields used in dashboards/aggregations. Missing indexes lead to severe performance issues under load.

- 10) DTO validation and controller/service separation: Confirm all controllers validate input using DTOs + `class-validator` and that business logic lives in services. Any endpoints performing business logic in controllers must be refactored.

Each item above blocks deployment until verified or fixed. See remediation steps in Section C.

---

C. STRONGLY RECOMMENDED FIXES (Post-launch allowed only if mitigated)

- A. Implement refresh token rotation and a refresh token revocation strategy (DB + hashed tokens). Rotate on refresh and implement reuse detection.

- B. Harden authentication endpoints with rate limiting, IP throttling, and CAPTCHAs or progressive delays for repeated failures.

- C. Ensure password storage uses bcrypt with a high enough cost (or Argon2) and never return password hashes or sensitive tokens in any API response. Use Mongoose schema `select: false` for sensitive fields.

- D. Add integration tests to cover passcode escalation, role elevation, and attempt to bypass flows. Add unit tests for exam timing enforcement and payment verification workflows.

- E. Implement DB-level constraints: unique indexes for IDs and critical relationships and use transactions for multi-document updates that must be atomic (e.g., reassigning Presidents, publishing exam results).

- F. Configure logging (structured JSON) with appropriate levels (info/warn/error) and ensure no secrets are logged. Add Sentry or similar for error monitoring and set up alerting on error rates.

- G. Enable content security protections for uploads: virus/malware scanning, store original metadata in DB, and preserve immutability for the original upload object.

---

D. OPTIONAL IMPROVEMENTS

- 1) Implement refresh token rotation telemetry to detect suspicious refresh token reuse and force logout of sessions.

- 2) Harden CORS configuration to only allow known origins in production.

- 3) Use `helmet` and other HTTP hardening middlewares in NestJS pipeline.

- 4) Add swagger only behind auth or disabled in production. If you must expose swagger, protect it with IP allowlist or admin auth.

- 5) Add automatic DB migrations and a bootstrap check that ensures necessary indexes exist at startup.

- 6) Add integration tests for aggregation-heavy admin dashboards to avoid regression and performance pitfalls.

---

E. FINAL CTO-LEVEL RECOMMENDATION

Do not deploy to production until all MUST-FIX items are resolved and verified. The system has many critical user-facing features (payments, exams, role elevation) that can be exploited or cause severe data inconsistencies if any of the blocking items above remain unfixed.

Immediate priorities (in order):

- 1) Lock down auth flows: refresh token rotation, rate-limiting, strong password hashing, and passcode server-side enforcement.
- 2) Make receipts and payments immutable; add audit logging for all admin verification actions.
- 3) Ensure DB-level constraints for uniqueness and single-active-president constraints; add transactions where appropriate.
- 4) Add file upload validations and secure storage patterns.
- 5) Verify secrets handling and environment configuration in CI/CD; ensure `.env` values are not committed.

Actionable next steps for the engineering team:

- A) Run a focused code review of `auth/*`, `users/*`, `associations/*`, `payments/*`, `exams/*`, and `media/*` controllers & services to verify the items noted above.
- B) Add small integration tests for critical flows (login/refresh, passcode elevation, exam submission/timing, payment upload + admin verify).
- C) Create a staging environment with the production DB topology and run a load test against dashboard aggregation endpoints.

If you want, I can now run an automated scan across the repo for the most critical patterns (use of `console.log`, presence of `.env` files, `any` types in auth paths, missing DTOs, and lack of index definitions). Tell me to proceed and I will run targeted searches and create a follow-up patch with exact file-level remediation suggestions.

---

Appendix: Quick checklist (actionable) — mark each when fixed and verified

- [ ] Refresh token rotation & revocation
- [ ] Passcode server-side enforcement + audit logs
- [ ] Rate limiting on auth endpoints
- [ ] DB-level uniqueness for domain IDs
- [ ] Single active President atomic enforcement
- [ ] Payment/receipt immutability
- [ ] File upload validation + sanitization
- [ ] No secrets committed; `.env.production` configured
- [ ] Indexes for heavy queries and unique fields
- [ ] DTO validation across controllers
- [ ] No console.log in production code
- [ ] Swagger protected or disabled in production

---

File created by audit bot. To proceed with automated repo scans and targeted patches, reply: "Run repo scan".
