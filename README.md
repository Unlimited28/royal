# Royal Ambassadors Digital Portal

This repository is organized as a monorepo for production readiness.

## Directory Structure

- `/frontend`: React application (Vite, TypeScript, Tailwind CSS).
- `/backend`: NestJS application (TypeScript, MongoDB/Mongoose).
- `/database`: Database schemas, seed scripts, and configuration.

## Getting Started

### Prerequisites

- Node.js (v18+)
- MongoDB (Running locally or accessible via URI)

### Installation

Install dependencies for all components:

```bash
# In /frontend
npm install

# In /backend
npm install
```

### Running Locally

1. **Setup Environment**:
   Copy `.env.example` to `.env` in the root and configure your variables (MongoDB URI, JWT secrets, etc.).

2. **Start Backend**:
   ```bash
   cd backend
   npm run start:dev
   ```

3. **Start Frontend**:
   ```bash
   cd frontend
   npm run dev
   ```

The application will be available at `http://localhost:3000`.

## Production Hardening

The system includes:
- IP-based rate limiting on sensitive endpoints.
- Strict DTO validation and whitelisting.
- CORS origin locking.
- Secure file upload handling.
- Fail-fast environment variable validation.
- Health monitoring via `/api/health`.
