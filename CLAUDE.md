# CLAUDE.md — Smart OBD Diagnostic Platform

This file provides context for AI assistants working on this codebase. It documents the project architecture, development conventions, and workflows to follow.

---

## Project Overview

**Smart OBD Diagnostic Platform** is a decision-support system for analyzing vehicle On-Board Diagnostic (OBD) data using rule-based logic with an AI-powered interpretation layer. It is a **production-oriented pet project** demonstrating architectural maturity, domain-driven design, and responsible AI usage.

The application:
- Accepts vehicle OBD logs (CSV / JSON format)
- Extracts DTC (Diagnostic Trouble Code) codes and diagnostic metrics
- Analyzes data using a configurable rule-based engine
- Calculates confidence levels for detected issues
- Uses AI strictly to **interpret and explain** results — not to make decisions
- Stores diagnostic history per vehicle

**Important constraint:** This is NOT a certified diagnostic tool. AI does not override rule-based logic. The application never provides a definitive diagnosis.

---

## Repository Structure

```
/
├── CLAUDE.md                   # This file
├── README.md                   # Project overview and architectural docs
├── LICENSE                     # MIT License
├── frontend/                   # Next.js 15 application
│   ├── src/app/
│   │   ├── layout.tsx          # Root layout with Geist font
│   │   ├── page.tsx            # Home page (stub — needs implementation)
│   │   └── globals.css         # Tailwind CSS global styles + theme vars
│   ├── public/                 # Static assets (SVGs)
│   ├── next.config.ts          # Next.js configuration
│   ├── tsconfig.json           # TypeScript config (ES2017, bundler resolution)
│   ├── eslint.config.mjs       # ESLint with next/core-web-vitals
│   └── postcss.config.mjs      # PostCSS for Tailwind CSS 4
└── backend/                    # NestJS application
    ├── src/
    │   ├── main.ts             # Bootstrap entry point (port 3000)
    │   └── app.module.ts       # Root NestJS module (currently empty stub)
    ├── prisma/
    │   └── schema.prisma       # PostgreSQL database schema
    ├── Dockerfile              # Multi-stage Docker build (node:20-alpine)
    ├── docker-compose.yml      # Local dev: PostgreSQL 15 + backend
    └── tsconfig.json           # TypeScript config (CommonJS, ES2021, outDir=./dist)
```

---

## Technology Stack

### Frontend
| Tool | Version | Purpose |
|------|---------|---------|
| Next.js | 15 (App Router) | React framework |
| React | 19 | UI library |
| TypeScript | 5 | Type safety |
| Tailwind CSS | 4 | Styling |
| shadcn/ui | — | Component library (planned) |
| TanStack Query | — | Server state management (planned) |
| Zod | — | Schema validation (planned) |
| Recharts | — | Data visualization (planned) |

### Backend
| Tool | Version | Purpose |
|------|---------|---------|
| NestJS | 11 | Backend framework |
| TypeScript | 5.9 | Type safety |
| Prisma ORM | 6.19 | Database access layer |
| PostgreSQL | 15 | Primary database |
| Redis + BullMQ | — | Async job queue (planned) |
| OpenAPI/Swagger | — | API documentation (planned) |
| RxJS | 7.8 | Reactive primitives (NestJS) |

### DevOps
| Tool | Purpose |
|------|---------|
| Docker | Containerization (multi-stage builds) |
| docker-compose | Local development environment |
| GitHub Actions | CI/CD (planned) |
| Vercel | Frontend deployment target |
| Fly.io / Railway | Backend deployment target |
| Supabase | Managed PostgreSQL (production) |
| Upstash | Managed Redis (production) |

---

## Architecture Principles

This project enforces **Hexagonal Architecture (Ports & Adapters)**. Always respect these boundaries when adding code:

```
[HTTP / CLI / Queue]   ← Adapters (input)
        ↓
[Application Layer]    ← Use cases / commands / queries (CQRS)
        ↓
[Domain Layer]         ← Pure business logic, no framework dependencies
        ↓
[Infrastructure]       ← Database, AI providers, external services (output adapters)
```

### Key patterns to preserve:

**Strategy Pattern** — Each diagnostic hypothesis is a separate strategy class. Do NOT add large `if/else` or `switch` blocks for diagnostic logic.

**Specification Pattern** — Complex rule conditions must be expressed as composable specification objects, not inline conditionals.

**Pipeline / Chain of Responsibility** — Diagnostic processing flows through isolated, independently testable stages:
`Validate → Normalize → Extract Metrics → Apply Rules → Calculate Confidence → Generate Report`

**Lightweight CQRS** — Commands modify state (upload diagnostic, create vehicle). Queries only read (get report, get history). No event sourcing.

**Adapter Pattern for AI** — AI provider accessed through an abstraction interface. Never call an AI SDK directly from domain logic. This enables mocking and provider switching.

**Anti-Corruption Layer for OBD data** — Raw OBD input (CSV/JSON) must be validated and normalized before entering domain logic. The domain layer only works with clean domain models.

**Domain Events** — Used for logging, analytics, future extensibility. Key events: `DiagnosticCompleted`, `RuleMatched`, `AnalysisFailed`.

---

## Database Schema

Managed via **Prisma ORM** against **PostgreSQL**. Schema file: `backend/prisma/schema.prisma`.

### Models

| Model | Key Fields | Relations |
|-------|-----------|-----------|
| `User` | id (UUID), email (unique), password, role | has many `Vehicle` |
| `Vehicle` | id, userId, brand, model, year, engineType, vin? | belongs to `User`, has many `DiagnosticSession` |
| `DiagnosticSession` | id, vehicleId, status, sourceType | belongs to `Vehicle`, has many `DiagnosticMetric`, `DtcCode`, one `AnalysisResult` |
| `DiagnosticMetric` | id, sessionId, name, value (Float), unit, timestamp | belongs to `DiagnosticSession` |
| `DtcCode` | id, sessionId, code, description, severity (Int) | belongs to `DiagnosticSession` |
| `DiagnosticRule` | id, key (unique), description, confidence (Float), active | standalone — configurable rules |
| `AnalysisResult` | id, sessionId (unique), summary, confidence | belongs to `DiagnosticSession` (1:1) |

### Enums
- `DiagnosticStatus`: `PENDING` | `PROCESSING` | `COMPLETED` | `FAILED`
- `DiagnosticSource`: `CSV` | `JSON` | `MANUAL`
- `UserRole`: `USER` | `ADMIN`

### Database Commands
```bash
# Run from backend/
npx prisma migrate dev --name <migration-name>   # Create and apply a migration
npx prisma migrate deploy                         # Apply migrations in production
npx prisma generate                               # Regenerate Prisma Client after schema changes
npx prisma studio                                 # Open visual database browser
```

Always run `npx prisma generate` after modifying `schema.prisma`.

---

## Development Setup

### Prerequisites
- Node.js 20+
- Docker + docker-compose
- npm

### Environment Variables

**Backend** requires a `.env.local` file in `backend/` (not committed):
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/smart_obd
```

Docker Compose uses this file via `env_file: .env.local`.

### Start Local Development

```bash
# 1. Start PostgreSQL (port 5433 on host)
cd backend
docker-compose up postgres

# 2. Start backend in watch mode
npm install
npm run start:dev

# 3. Start frontend (separate terminal)
cd frontend
npm install
npm run dev
```

Backend runs on `http://localhost:3000`.
Frontend runs on `http://localhost:3001` (Next.js default when 3000 is taken).

---

## Build Commands

### Backend
```bash
cd backend
npm run build          # Compile TypeScript → ./dist (nest build)
npm run start          # Run compiled: node dist/main.js
npm run start:dev      # Development with hot reload (nest start --watch)
```

### Frontend
```bash
cd frontend
npm run dev            # Next.js dev server
npm run build          # Production build
npm run start          # Start production server
npm run lint           # ESLint check
```

### Docker
```bash
cd backend
docker-compose up              # Start PostgreSQL + backend (uses built image)
docker-compose up --build      # Rebuild image before starting
docker-compose down            # Stop services
docker-compose down -v         # Stop and remove volumes (destroys DB data)
```

The backend Docker image uses a **multi-stage build**:
1. `builder` stage — installs all deps, compiles TypeScript
2. Runtime stage — copies `dist/` and `prisma/`, installs production deps only

---

## Project Status (as of March 2026)

**Completed:**
- [x] Technology stack selected and installed
- [x] Prisma schema with all domain models
- [x] Docker + docker-compose local environment
- [x] TypeScript configurations (frontend and backend)
- [x] Multi-stage Dockerfile for backend
- [x] Architectural vision documented in README.md

**Pending implementation:**
- [ ] NestJS feature modules (users, vehicles, diagnostics, auth, rules)
- [ ] Hexagonal architecture folder structure in backend
- [ ] REST API endpoints with Swagger docs
- [ ] Database migrations
- [ ] Authentication (JWT + httpOnly cookies + refresh tokens)
- [ ] Role-based access control (USER / ADMIN)
- [ ] OBD file upload and parsing (CSV/JSON)
- [ ] Rule engine implementation
- [ ] BullMQ async job queue for diagnostic processing
- [ ] AI adapter for result interpretation
- [ ] Frontend UI components (shadcn/ui, TanStack Query, Recharts)
- [ ] Test infrastructure (Jest for backend, Vitest or Jest for frontend)
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Rate limiting and input validation

---

## Planned Backend Module Structure

When implementing NestJS modules, follow this folder structure to respect Hexagonal Architecture:

```
backend/src/
├── modules/
│   ├── auth/
│   │   ├── domain/             # Entities, value objects, ports
│   │   ├── application/        # Commands, queries, handlers
│   │   ├── infrastructure/     # Adapters: JWT, bcrypt, Prisma repo
│   │   └── presentation/       # HTTP controllers
│   ├── users/
│   ├── vehicles/
│   ├── diagnostics/
│   │   ├── domain/
│   │   │   ├── strategies/     # One class per diagnostic strategy
│   │   │   ├── specifications/ # Composable rule specifications
│   │   │   └── pipeline/       # Processing pipeline steps
│   │   ├── application/
│   │   ├── infrastructure/
│   │   └── presentation/
│   └── rules/
├── shared/
│   ├── domain/                 # Base entity, domain event base class
│   └── infrastructure/         # Prisma service, shared utilities
└── app.module.ts
```

---

## Code Conventions

### TypeScript
- Strict mode enabled on both frontend and backend
- Use `interface` for domain contracts/ports, `type` for unions and utility types
- Use `class` for NestJS services, controllers, and domain entities
- Avoid `any` — use `unknown` and narrow properly

### NestJS (Backend)
- One module per domain concept
- Inject dependencies through constructor injection (NestJS DI)
- Controllers are thin — delegate to application layer services immediately
- Domain services must have no NestJS decorators (keep domain pure)
- Use `@Injectable()` only on infrastructure and application layer classes

### Prisma
- Never use Prisma Client directly in domain or application layer — always through a repository port
- Repository interfaces live in domain layer; Prisma implementations in infrastructure layer

### AI Usage
- AI provider must implement a port interface (e.g., `IAiInterpretationPort`)
- Never call OpenAI SDK (or any LLM SDK) directly from a use case or domain service
- AI results are supplementary context only — they do not alter rule-based conclusions

### Git
- Branch naming: `feat/<issue-number>/<short-description>` (e.g., `feat/1/dockerfile-schema-prisma`)
- Commit messages: use conventional commits style (`feat:`, `fix:`, `chore:`, `docs:`, `refactor:`)
- Never commit `.env` or `.env.local` files
- Development branches for Claude agents: `claude/<description>-<session-id>`

---

## Security Requirements

When implementing features, enforce:
- **JWT** access tokens with short TTL + **httpOnly cookie** refresh tokens
- **Password hashing** with bcrypt (never store plaintext)
- **RBAC**: USER can only access their own vehicles/diagnostics; ADMIN has full access
- **Rate limiting** on authentication endpoints and file upload
- **File size limits** on OBD log uploads
- **Input validation** with class-validator (NestJS) and Zod (frontend)
- **Parameterized queries** only — Prisma handles this automatically, never use raw SQL with user input

---

## Testing Guidelines

No test infrastructure exists yet. When setting up:

### Backend (Jest)
```bash
# In backend/
npm install --save-dev jest @types/jest ts-jest
```
- Unit tests for: domain entities, strategy classes, specification classes, pipeline steps
- Integration tests for: repository implementations (using test DB or Prisma mock)
- E2E tests for: API endpoints

### Frontend (Jest or Vitest)
- Unit tests for utility functions and hooks
- Component tests with React Testing Library

Test files should live alongside source files: `*.spec.ts` / `*.test.ts`.

---

## Deployment Notes

| Component | Platform | Notes |
|-----------|----------|-------|
| Frontend | Vercel | Auto-deploys from `main` branch |
| Backend | Fly.io or Railway | Uses `backend/Dockerfile` |
| Database | Supabase | Managed PostgreSQL; use `prisma migrate deploy` |
| Queue | Upstash | Managed Redis for BullMQ |

Production environment variables must be set on each platform separately. Never hardcode secrets.
