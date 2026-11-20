# ReLoop — Multi-Category Pre-Owned Marketplace & Swapping Platform

ReLoop is a modern multi-category pre-owned marketplace and swapping platform built around giving unused products a **second life** (♻️). Rather than limiting users to single-category transactions or informal social media exchanges, ReLoop provides a structured, role-based platform where users can discover, trade, buy, sell, and swap second-hand goods across fashion, electronics, books, furniture, sporting goods, and more.

> **Scope Note:** This module covers **ONLY** the backend **Authentication & Authorization** module. In accordance with project boundaries, marketplace features such as listings, offers, orders, swaps, wishlist, wantlist, reviews, reports, notifications, payments, image uploads, and frontend UI are excluded.

---

## 🛠️ Technology Stack

| Layer | Technology | Details |
|---|---|---|
| **Runtime & Framework** | Node.js (v20+), Express.js | Layered architecture (`routes → controllers → services → Prisma`) |
| **Database** | PostgreSQL | Relational database modeling users, roles, and reset credentials |
| **ORM** | Prisma ORM | Type-safe queries, relational integrity, migrations (`prisma/migrations`) |
| **Auth & Security** | JWT (HS256), bcryptjs, HTTP-only cookies, Helmet | SameSite cookies, bcrypt cost factor 12, rate limiters, session revocation |
| **Validation** | Zod | Strict boundary schema validation on request payloads |
| **Testing** | Vitest, Supertest | Automated unit and route-level tests (in-memory mock database) |

---

## 📋 Prerequisites

- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **npm**: v9.0.0 or higher
- **PostgreSQL**: v14 or higher (local server, Docker container, or hosted provider such as Supabase / Neon)

---

## ⚙️ Environment Variables & Rules

Create your environment configuration from `backend/.env.example`:

```bash
cp backend/.env.example backend/.env
```

### Environment Rules & Validation
The backend enforces strict startup validation in `src/config/env.js`:
- `DATABASE_URL`: Required PostgreSQL connection string.
- `JWT_SECRET`: **Must be at least 32 characters long** in all non-test environments (`development` and `production`).
- `COOKIE_SAME_SITE`: Must be one of `'lax'`, `'strict'`, or `'none'`. Note that `'none'` **requires production mode** with secure HTTPS cookies.
- `ADMIN_PASSWORD`: **No default fallback**. Must be explicitly provided in the environment when executing the database seed.
- `TRUST_PROXY`: Reverse proxy hop count (default: `1`). Configures Express `app.set('trust proxy', ...)`.

Example `.env`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/reloop?schema=public"
JWT_SECRET="dev-super-secret-jwt-key-for-local-testing-reloop-auth"
PORT=5000
NODE_ENV=development
CLIENT_URL="http://localhost:5173"
TRUST_PROXY=1

COOKIE_NAME="reloop_token"
COOKIE_MAX_AGE_DAYS=7
COOKIE_SAME_SITE="lax"
RESET_TOKEN_TTL_MINUTES=60

ADMIN_NAME="Platform Admin"
ADMIN_EMAIL="admin@reloop.local"
ADMIN_PASSWORD="ChangeMe123!"
```

---

## 🚀 Setup & Installation Steps

### 1. Dependencies

Install backend dependencies:

```bash
npm --prefix backend install
```

### 2. Database Migration & Prisma Generation

Generate the Prisma Client and review/apply the initial migration:

```bash
# Generate Prisma Client (models User, PasswordResetToken)
npm --prefix backend run prisma:generate

# Apply database migration (requires PostgreSQL)
npm --prefix backend run prisma:migrate
```

The initial migration SQL is stored in [`backend/prisma/migrations/20261119090000_init/migration.sql`](file:///d:/Rebika/ReLoop/backend/prisma/migrations/20261119090000_init/migration.sql).

### 3. Seed Platform Admin Account

Seed the system administrator account specified in Section 46 of the project specification:

```bash
npm --prefix backend run seed
```

- **Email:** `admin@reloop.local` (from `ADMIN_EMAIL`)
- **Password:** Read from `ADMIN_PASSWORD` (no default in code)
- **Role:** `ADMIN`
- **Security Check:** The seed script strictly refuses to promote any existing non-admin user to `ADMIN`.

### 4. Start Development Server

Start the Express API server:

```bash
npm --prefix backend run dev
```

The API will be available at **http://localhost:5000/api/v1**.

---

## 🧪 Testing & Verification

The test suite consists of **automated unit and route-level tests** executed via Vitest and Supertest using an in-memory database mock for offline isolation and rapid feedback:

```bash
npm --prefix backend test
```

### Test Coverage Highlights (43 Tests):
- **Registration**: Valid register, duplicate email conflict (409), weak password validation (400), password max 72-byte enforcement, confirm password mismatch, role injection prevention (client cannot self-assign `ADMIN`), and blocked public registration of `ADMIN_EMAIL`.
- **Authentication & Login**: Successful login with HTTP-only cookie, wrong password rejected with generic error (401), timing difference mitigation for unknown emails via dummy bcrypt compare, account deactivation block (403), session restore (`/auth/me`), and cookie clearing on logout.
- **Session Revocation**: User deactivated mid-session is immediately blocked (403), expired JWTs rejected (401, `SESSION_EXPIRED`), and tokens issued before `passwordChangedAt` are invalidated (401, `SESSION_EXPIRED`).
- **Password Management**: Uniform response on forgot-password (prevents enumeration), cleanup of expired tokens upon new request, single-use token verification, atomic token consumption (rejection on double-use), rejection of expired/used/invalid reset tokens, and authenticated change-password validation (rejects wrong current password and identical new password).
- **Authorization & Role Guards**: Forged-role JWT payloads are ignored (server checks DB role), `GET /api/v1/admin/ping` returns 401 for unauthenticated requests, 403 for `USER` role, and 200 for `ADMIN` role.
- **Ownership Helper**: Resource ownership verification (`ownerField` vs `req.user.id`) requiring explicit `ownerField`, rejecting null resources even for `ADMIN`, and configurable Admin bypass.
- **Seed Security**: Refusal to promote existing non-admin users to `ADMIN`.
- **Profile Updates**: Enforces HTTPS for `avatarUrl`.

---

## 📖 Authentication & Authorization API Reference

Base URL: `/api/v1`

| Method | Endpoint | Access Level | Description & Purpose |
|---|---|---|---|
| `POST` | `/auth/register` | Public | Register new user. Enforces `role: USER`. Blocks public registration of `ADMIN_EMAIL`. Enforces max 72 bytes. Hashes password with bcrypt, sets HTTP-only JWT cookie. Rate-limited. |
| `POST` | `/auth/login` | Public | Authenticates credentials, checks `isActive`, sets HTTP-only SameSite cookie. Generic error and dummy bcrypt compare for bad credentials. Rate-limited (keyed by IP + email, skips successful requests). |
| `POST` | `/auth/logout` | Public | Clears authentication cookie and terminates session. |
| `GET` | `/auth/me` | Authenticated | Returns current authenticated user's session profile (safe fields only). Rejects tokens issued before `passwordChangedAt`. |
| `POST` | `/auth/forgot-password` | Public | Cleans up expired tokens, creates single-use hashed reset token. Uniform generic response with dummy bcrypt compare for non-existent emails. Rate-limited. |
| `POST` | `/auth/reset-password` | Public | Validates short-lived reset token and atomically consumes it inside a transaction. Updates password and sets `passwordChangedAt`. Rate-limited. |
| `GET` | `/users/me` | Authenticated | Fetches profile of currently logged-in user. |
| `PATCH` | `/users/me` | Authenticated | Updates user profile fields (`name`, `phone`, `location`, `avatarUrl`). Requires `avatarUrl` to use HTTPS. |
| `PATCH` | `/users/me/password` | Authenticated | Authenticated password change. Requires `currentPassword` verification and distinct `newPassword`. Sets `passwordChangedAt`. Rate-limited. |
| `GET` | `/admin/ping` | `ADMIN` only | Health-check endpoint demonstrating server-side role guard enforcement. |

---

## 🗂️ Project Structure

```text
ReLoop/
├── backend/
│   ├── prisma/
│   │   ├── migrations/
│   │   │   ├── 20261119090000_init/
│   │   │   │   └── migration.sql  # Initial PostgreSQL migration DDL
│   │   │   └── migration_lock.toml
│   │   ├── schema.prisma          # PostgreSQL models: User, UserRole, PasswordResetToken
│   │   └── seed.js                # Seeds default ADMIN account from environment variables
│   ├── src/
│   │   ├── config/
│   │   │   ├── env.js             # Strict environment validation (fails fast if secrets missing or < 32 chars)
│   │   │   └── prisma.js          # Shared PrismaClient singleton
│   │   ├── controllers/
│   │   │   ├── adminController.js # Admin verification endpoints
│   │   │   ├── authController.js  # Registration, login, logout, password recovery
│   │   │   └── userController.js  # User profile & authenticated password change
│   │   ├── middleware/
│   │   │   ├── auth.js            # authenticate (iat vs passwordChangedAt check) & authorizeRoles middlewares
│   │   │   ├── errorHandler.js    # Standardized Spec Section 19 error handling
│   │   │   ├── rateLimiter.js     # IP and IP+email rate limiting on sensitive auth endpoints
│   │   │   └── validate.js        # Zod request boundary validation middleware
│   │   ├── routes/
│   │   │   ├── adminRoutes.js     # Protected admin endpoints
│   │   │   ├── authRoutes.js      # Public and session auth routes
│   │   │   ├── userRoutes.js      # Authenticated user routes
│   │   │   └── index.js           # API v1 aggregator
│   │   ├── services/
│   │   │   ├── authService.js     # Authentication business logic & JWT/cookie utilities
│   │   │   ├── mailerService.js   # Mailer abstraction (console logger in development)
│   │   │   └── userService.js     # Profile updates & password modification
│   │   ├── utils/
│   │   │   ├── errors.js          # AppError classes (BadRequest, Unauthorized, Forbidden, etc.)
│   │   │   ├── ownership.js       # Reusable resource ownership check (Spec Section 27)
│   │   │   └── response.js        # Standardized Spec Section 19 JSON response helpers
│   │   ├── validators/
│   │   │   ├── authValidator.js   # Zod validation schemas for auth endpoints
│   │   │   └── userValidator.js   # Zod validation schemas for user/profile endpoints
│   │   ├── app.js                 # Express application configuration (Helmet, CORS, cookies, trust proxy)
│   │   └── server.js              # Server lifecycle & graceful shutdown
│   ├── tests/
│   │   ├── admin.test.js          # Role-based route tests, forged-role rejection, seed security
│   │   ├── auth.test.js           # Registration, login, session, password reset, double-use tests
│   │   ├── mockPrisma.js          # In-memory database mock for offline testing
│   │   ├── ownership.test.js      # Unit tests for checkOwnership helper
│   │   ├── setup.js               # Test environment configuration
│   │   └── user.test.js           # User profile, HTTPS avatar, and token invalidation tests
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   └── vitest.config.js
│
├── .gitignore
├── package.json                   # Root workspace scripts
└── README.md
```

---

## 🔒 Security Hardening Implemented

1. **Password Max Byte-Length (72 Bytes)**: Validated via `Buffer.byteLength` in Zod schemas to align with bcrypt truncation boundaries.
2. **Timing Attack Mitigation**: Non-existent accounts on `/login` and `/forgot-password` perform a dummy cost-12 bcrypt comparison so timing is indistinguishable from existing accounts.
3. **Session Revocation via `passwordChangedAt`**: Every password change or reset updates `passwordChangedAt`. The `authenticate` middleware rejects any JWT issued prior to that timestamp (`SESSION_EXPIRED`).
4. **Atomic Token Consumption**: Password reset tokens are consumed using `updateMany({ where: { id, used: false }, data: { used: true } })` inside a transaction, rejecting replay or race conditions.
5. **Session Invalidation on Deactivation**: `authenticate` checks the database on every protected request, immediately revoking access if `isActive === false`.
6. **No Client Role Trust**: JWT role claims are never used to authorize actions; user roles are loaded from the database record.
7. **Rate Limiting**: Brute-force protection on `/login` (keyed by IP + email, skips successful logins), `/register`, `/forgot-password`, `/reset-password`, and `/me/password`.
8. **HTTPS Validation**: Profile `avatarUrl` inputs must strictly be valid `https://` URLs when not null.
9. **Ownership Helper Rigor**: `checkOwnership` strictly requires an explicit `ownerField` string and rejects `null` resources immediately, even for `ADMIN`.
10. **Environment Strictness**: Requires `JWT_SECRET >= 32` characters in all non-test environments; validates `COOKIE_SAME_SITE` and ensures `'none'` requires production mode; refuses default fallback for `ADMIN_PASSWORD`.
