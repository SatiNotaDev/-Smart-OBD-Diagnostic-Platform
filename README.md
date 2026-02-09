# Smart OBD Diagnostic Platform

Decision Support System for analyzing vehicle OBD diagnostic data  
with explainable rule-based logic and an AI-powered interpretation layer.

This project is designed as a **production-oriented pet project** to demonstrate
architectural thinking, modern design patterns, and responsible use of AI —
not a standard CRUD or MVC application.

---

## Project Goal

The goal of this project is to demonstrate the ability to:
- design complex domain-driven systems
- apply architectural and behavioral patterns intentionally
- isolate business logic from infrastructure concerns
- use AI in an explainable and controlled way
- deliver a production-ready system (CI/CD, Docker, deployment)

---

## What the Application Does

- accepts vehicle OBD logs (CSV / JSON)
- extracts DTC codes and diagnostic metrics
- analyzes data using a rule-based engine
- calculates confidence levels for detected issues
- visualizes diagnostic parameters over time
- uses AI **only to interpret and explain results**
- stores diagnostic history per vehicle

This application **does not provide a diagnosis** and **does not replace a mechanic**.

---

## Architectural Patterns (Core Value of the Project)

### Hexagonal Architecture (Ports & Adapters)

The system is built using Hexagonal Architecture to isolate domain logic from:
- HTTP controllers
- database implementation
- background jobs and queues
- AI providers

The domain layer has no knowledge of:
- how data is stored
- which AI provider is used
- how requests enter the system

---

### Strategy Pattern — Diagnostic Strategies

Each diagnostic hypothesis is implemented as a separate strategy.

Benefits:
- no large `if / else` or `switch` blocks
- easy extensibility without modifying existing logic
- compliance with the Open / Closed Principle

---

### Specification Pattern — Rule Conditions

Complex diagnostic conditions are expressed through composable specifications.

Benefits:
- readable domain logic
- reusable conditions
- clean and testable rule evaluation

---

### Pipeline / Chain of Responsibility — Diagnostic Processing

The diagnostic process is implemented as a processing pipeline:
Validate
→ Normalize
→ Extract Metrics
→ Apply Rules
→ Calculate Confidence
→ Generate Report



Each step:
- is isolated
- is independently testable
- can be replaced or extended without side effects

---

### Lightweight CQRS

- Commands modify system state  
  (upload diagnostic, create vehicle)
- Queries only read data  
  (get diagnostic report, get history)

No event sourcing and no unnecessary complexity.

---

### Adapter Pattern — AI Layer

The AI provider is accessed through an abstraction layer.

This allows:
- switching between OpenAI, mock, or local LLM
- testing without real AI calls
- completely disabling AI without breaking core logic

---

### Anti-Corruption Layer — OBD Data

OBD logs are treated as an external and unreliable data source.

Only normalized and validated domain models are allowed
to enter the core domain logic, regardless of input format.

---

### Domain Events (Minimal Usage)

Domain events are used for:
- logging
- analytics
- future extensibility

Examples:
- `DiagnosticCompleted`
- `RuleMatched`
- `AnalysisFailed`

---

## Technology Stack

### Frontend
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui
- TanStack Query
- Zod
- Recharts

### Backend
- NestJS
- TypeScript
- Prisma ORM
- PostgreSQL
- Redis + BullMQ
- OpenAPI (Swagger)

### DevOps
- Docker
- docker-compose
- GitHub Actions (CI/CD)

---

## Repository Structure

├── frontend
│ ├── app
│ ├── src
│ │ ├── components
│ │ ├── features
│ │ ├── services
│ │ └── schemas
│ └── middleware.ts
│
├── backend
│ ├── src
│ │ ├── auth
│ │ ├── users
│ │ ├── vehicles
│ │ ├── diagnostics
│ │ │ ├── ingestion
│ │ │ ├── parser
│ │ │ ├── rules
│ │ │ ├── analyzer
│ │ │ └── reports
│ │ ├── ai
│ │ ├── jobs
│ │ └── common
│ └── prisma
│
├── docker-compose.yml
├── .github/workflows
└── README.md

---

## Diagnostic Processing Flow
Upload OBD data
→ Validation
→ Normalization
→ Async processing
→ Rule evaluation
→ Confidence calculation
→ AI explanation
→ Report generation


All heavy processing is executed **asynchronously**.

---

## AI Usage Policy

AI is used **strictly for interpretation**, including:
- explaining diagnostic results
- prioritizing detected issues
- suggesting inspection steps

AI does **not**:
- make diagnostic decisions
- override rule-based logic
- provide guarantees or conclusions

---

## Security

- JWT with refresh tokens
- httpOnly cookies
- Role-based access control
- Rate limiting
- File size limits
- Input validation

---

## CI / CD

Pipeline stages:
1. Lint
2. Tests
3. Build
4. Docker image
5. Deploy

---

## Deployment

| Component | Platform |
|---------|----------|
| Frontend | Vercel |
| Backend | Fly.io / Railway |
| Database | Supabase |
| Redis | Upstash |

---

## Disclaimer

This application:
- is not a certified diagnostic tool
- provides no guarantees
- is intended for educational and demonstration purposes only

---

## Summary

This project is not:
- a tutorial CRUD application
- a generic MVC example
- an AI gimmick

It is a demonstration of **architectural maturity**,  
domain-driven thinking, and responsible software engineering.

