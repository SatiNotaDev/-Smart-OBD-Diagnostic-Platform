# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Smart OBD Diagnostic Platform — a decision support system for analyzing vehicle OBD diagnostic data with explainable rule-based logic and AI-powered interpretation.

**Production-oriented pet project** demonstrating Hexagonal Architecture, domain-driven design, and responsible AI usage.

## Architecture

**Hexagonal Architecture (Ports & Adapters)** — domain logic is isolated from infrastructure.

Key patterns: Strategy (diagnostic hypotheses), Specification (composable rule conditions), Pipeline/Chain of Responsibility (diagnostic processing), Lightweight CQRS, Adapter (AI provider abstraction), Anti-Corruption Layer (OBD data validation).

AI is **interpretation-only**: explaining results, prioritizing issues, suggesting inspection steps. Never makes diagnostic decisions or overrides rule logic.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | NestJS 10 + TypeScript, Prisma 5, PostgreSQL 15 |
| Frontend | Next.js 16 (App Router) + React 19 + TypeScript |
| Styling | Tailwind CSS v4, custom shadcn/ui-style components |
| Forms | react-hook-form + Zod |
| Data fetching | TanStack Query (configured, not yet wired) |
| Auth | Passport JWT + Google OAuth 2.0, MFA via TOTP (speakeasy) |
| HTTP | Native fetch API (no axios — removed due to security vulnerability) |
| i18n | Custom context-based system (en/ru/fr) |
| Theme | next-themes (Bosch blue #007BC0, dark/light mode) |
| Docker | PostgreSQL 15 on port 5433, multi-stage Dockerfile |

## Development Commands

### Backend

```bash
cd backend
npm install
npm run start:dev              # Dev server with watch (port 3000)
npm run build                  # Compile TypeScript
npm run start                  # Production server

# Prisma
npx prisma generate            # Generate client after schema changes
npx prisma migrate dev         # Create + apply migration
npx prisma studio              # GUI for browsing data
npx prisma db push             # Push schema without creating migration

# Testing
npm test                       # Jest
npm run test:cov               # Coverage

# Docker
docker compose up postgres     # PostgreSQL only (port 5433)
docker compose up              # PostgreSQL + backend
```

### Frontend

```bash
cd frontend
npm install
npm run dev                    # Dev server (port 3001)
npm run build                  # Production build
npm run lint                   # ESLint
```

### Environment

Backend requires `backend/.env.local`:
```
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/smart_obd
JWT_SECRET=<min-32-chars>
JWT_REFRESH_SECRET=<min-32-chars>
# Optional: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
```

Frontend uses `NEXT_PUBLIC_API_URL` (defaults to `http://localhost:3000/api`).

## Backend Architecture

### Module Structure

- **AppModule** — root module, applies SecurityMiddleware + LoggerMiddleware globally
- **AuthModule** — complete auth system (14 endpoints under `/api/auth/`)
- **PrismaModule** — database service

### Auth System

**Endpoints** (all prefixed `/api/auth/`):
`POST register`, `POST login`, `POST logout`, `POST refresh`, `GET me`, `GET verify-email`, `POST forgot-password`, `POST reset-password`, `POST mfa/setup`, `POST mfa/verify`, `POST mfa/disable`, `GET google`, `GET google/callback`

**SOLID services** in `src/modules/auth/services/`:
- `PasswordHasherService` — bcrypt (12 rounds)
- `TokenService` — JWT generation (15m access / 7d refresh), httpOnly cookie setting
- `MfaService` — TOTP via speakeasy, QR generation, backup codes
- `EmailService` — sends verification/reset emails (console log in dev)

**Guards** in `src/modules/auth/guards/`:
- `JwtAuthGuard` (global APP_GUARD, respects `@Public()`)
- `JwtRefreshGuard`, `GoogleAuthGuard`, `RolesGuard`, `EmailVerifiedGuard`

**Decorators**: `@Public()`, `@CurrentUser(field?)`, `@Roles(...roles)`

**Google OAuth**: Loaded conditionally — if `GOOGLE_CLIENT_ID` is not set, GoogleStrategy is skipped (factory provider returns null).

### Prisma Schema

Core models: `User` → `Vehicle` → `DiagnosticSession` → `DiagnosticMetric` / `DtcCode` / `AnalysisResult`. Also: `Note`, `AiChat`, `ChatMessage`, `DiagnosticRule`.

User has: email verification fields, password reset fields, MFA fields (secret, backup codes), preferences (language, theme), optional Google ID.

### Middleware

- **SecurityMiddleware** — sets X-Content-Type-Options, X-Frame-Options, X-XSS-Protection, HSTS; removes X-Powered-By
- **LoggerMiddleware** — HTTP request/response logging

### Global Config (main.ts)

- Global prefix: `api`
- CORS: `http://localhost:3001` (configurable)
- `cookieParser()` middleware
- `ValidationPipe` with whitelist, forbidNonWhitelisted, transform

## Frontend Architecture

### API Client (`src/lib/api/api-client.ts`)

Native fetch wrapper with `credentials: "include"` for httpOnly cookies. Throws `ApiError` on non-2xx. No automatic token refresh — simple and predictable.

### Auth Context (`src/lib/auth/auth-context.tsx`)

Single initialization on mount via `useRef` guard (prevents double-fetch in React StrictMode). No retry loop on 401. Provides: `login`, `register`, `logout`, `googleLogin`, `refetchUser`.

### i18n (`src/lib/i18n/`)

Custom context with `useI18n()` hook. Dot-notation key access: `t("auth.login.title")`. Persisted to localStorage. Translation files in `translations/{en,ru,fr}.json`.

### Theme (`src/app/globals.css`)

CSS variables for Bosch blue theme. Light: `--primary: #007BC0`, dark: `--primary: #4DA6D6`. Includes flip-card animation CSS (perspective + rotateY).

### Auth UI (`src/components/auth/`)

Flip card component — login form on front, register form on back, with CSS 3D transform animation. Separate flows for forgot-password, reset-password, verify-email, MFA.

### Provider Nesting (`src/app/providers.tsx`)

`ThemeProvider` → `I18nProvider` → `AuthProvider`

## Key Decisions

- **No axios** — removed due to known security vulnerability. All HTTP via native fetch with `credentials: "include"`.
- **No automatic 401 retry** — the old axios interceptor caused infinite loops. Current approach: simple fetch, no retry on auth endpoints.
- **Google OAuth is optional** — backend starts normally without Google credentials.
- **httpOnly cookies** — tokens stored in cookies, not localStorage.
- **PostgreSQL only** — no SQLite. Docker Compose provides local PostgreSQL on port 5433.
- **Custom i18n** — not using next-intl or similar library. Simple JSON translations with context provider.
- **Custom UI components** — shadcn/ui-style (not installed via CLI), hand-built with Tailwind.

## Disclaimer

This application is not a certified diagnostic tool. Educational/demonstration purposes only. Does not replace professional mechanic diagnosis.
