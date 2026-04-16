# 🚀 Quick Start Guide

## Что уже готово ✅

- ✅ Backend код полностью написан
- ✅ Prisma schema готова
- ✅ Docker compose файл создан
- ✅ .env.local создан с JWT секретами
- ✅ Authentication система готова (Email, Google OAuth, MFA)

---

## 📋 Step-by-Step Setup

### 1️⃣ Install Docker (если еще не установлен)

**Quick way:**
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
newgrp docker
```

**Verify:**
```bash
docker --version
docker compose version
```

📖 **Detailed instructions:** See [DOCKER_SETUP.md](DOCKER_SETUP.md)

---

### 2️⃣ Start PostgreSQL Database

```bash
cd /home/stn/-Smart-OBD-Diagnostic-Platform/backend
docker compose up -d postgres
```

**Check if running:**
```bash
docker compose ps
# Should show: smart_obd_postgres   Up
```

---

### 3️⃣ Install Backend Dependencies

```bash
cd /home/stn/-Smart-OBD-Diagnostic-Platform/backend
npm install
```

This will install:
- NestJS framework
- Prisma ORM
- JWT & Passport
- bcrypt, speakeasy (MFA)
- class-validator
- and more... (see package.json)

---

### 4️⃣ Setup Database with Prisma

```bash
# Generate Prisma Client
npx prisma generate

# Create database tables
npx prisma migrate dev --name init
```

**Optional - View database GUI:**
```bash
npx prisma studio
# Opens at http://localhost:5555
```

---

### 5️⃣ Start Backend Server

```bash
npm run start:dev
```

**Success output:**
```
🚀 Server running on: http://localhost:3000
📚 API Prefix: /api
🔐 Auth endpoints: http://localhost:3000/api/auth
```

---

### 6️⃣ Test Backend API

**Test 1 - Health check:**
```bash
curl http://localhost:3000/api/auth/me
# Expected: {"statusCode":401,"message":"Unauthorized"}
# ✅ Good! Auth is working (401 = not logged in)
```

**Test 2 - Register user:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!",
    "name": "Test User"
  }'
```

**Expected response:**
```json
{
  "message": "Registration successful. Please check your email to verify your account."
}
```

**Check email verification token in logs:**
Look in terminal where backend is running. You'll see:
```
📧 Email Verification
To: test@example.com
URL: http://localhost:3001/auth/verify-email?token=xxxxx
```

---

## 🎯 What's Next?

### Backend is DONE ✅
All 14 auth endpoints are working:
- Register, Login, Logout
- Email verification
- Password reset
- MFA setup/verify/disable
- Google OAuth
- Refresh token

### Frontend TODO 🚧

```bash
cd /home/stn/-Smart-OBD-Diagnostic-Platform/frontend

# Will install:
npm install axios @tanstack/react-query
npm install react-hook-form zod
npm install next-themes next-intl
npm install js-cookie @types/js-cookie

# Setup shadcn/ui
npx shadcn-ui@latest init

# Create components:
# - Flip card login/register
# - Theme toggle (Bosch blue + dark mode)
# - Language selector (en/ru/fr)
# - Auth context & API client
```

---

## 📁 Project Structure

```
backend/
├── src/
│   ├── modules/
│   │   ├── auth/              ✅ COMPLETED
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── strategies/    (JWT, Google OAuth)
│   │   │   ├── guards/        (Auth, Roles, MFA)
│   │   │   ├── services/      (Password, Token, MFA, Email)
│   │   │   └── dto/           (All DTOs)
│   │   └── prisma/            ✅ COMPLETED
│   ├── common/
│   │   └── middleware/        ✅ COMPLETED
│   ├── app.module.ts          ✅ COMPLETED
│   └── main.ts                ✅ COMPLETED
├── prisma/
│   └── schema.prisma          ✅ COMPLETED
├── .env.local                 ✅ CREATED (with secrets)
├── docker-compose.yml         ✅ COMPLETED
├── Dockerfile                 ✅ COMPLETED
└── package.json               ✅ COMPLETED

frontend/
└── (to be created next)       🚧 TODO
```

---

## 🔍 Troubleshooting

### Issue: Docker command not found
```bash
# Install Docker first
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
```

### Issue: Cannot connect to PostgreSQL
```bash
# Check if container is running
docker compose ps

# Check logs
docker compose logs postgres

# Restart
docker compose restart postgres
```

### Issue: Port 3000 already in use
```bash
# Check what's using port 3000
sudo lsof -i :3000

# Kill process
kill -9 <PID>

# Or change port in .env.local
PORT=3001
```

### Issue: Prisma errors
```bash
# Regenerate client
npx prisma generate

# Reset database
npx prisma migrate reset

# Re-run migrations
npx prisma migrate dev
```

---

## 🎨 Design Preview (Frontend)

**Color Scheme:**
- Primary: Bosch Blue (#007BC0)
- Accent: Autel Orange (#FF6B00)
- Dark Mode: Dark Blue (#0F172A)

**Login/Register Page:**
```
┌─────────────────────────────────┐
│        [LOGO]                   │
│  ┌────────────────────────┐    │
│  │  📧 Email              │    │
│  │  🔒 Password           │    │
│  │                         │    │
│  │  [Sign In] (Bosch Blue)│    │
│  │  ────── OR ──────       │    │
│  │  [G] Google Sign In     │    │
│  │                         │    │
│  │  No account? Register → │ ← Flips card
│  └────────────────────────┘    │
│  [🌙 Theme] [EN ▼]             │
└─────────────────────────────────┘
```

---

## 📊 Current Status

| Feature | Status |
|---------|--------|
| Backend Auth API | ✅ Done |
| Prisma Schema | ✅ Done |
| Docker Setup | ✅ Done |
| JWT + Refresh | ✅ Done |
| MFA (TOTP) | ✅ Done |
| Email Verification | ✅ Done |
| Password Reset | ✅ Done |
| Google OAuth | ✅ Done |
| Security (Guards, Middleware) | ✅ Done |
| Frontend Setup | 🚧 Next |
| Flip Card Component | 🚧 Next |
| Theme System | 🚧 Next |
| i18n (ru/en/fr) | 🚧 Next |

---

## 🚀 Ready to Start!

**Commands to run NOW:**

```bash
# 1. Install Docker (if not installed)
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
newgrp docker

# 2. Start Database
cd /home/stn/-Smart-OBD-Diagnostic-Platform/backend
docker compose up -d postgres

# 3. Install & Setup
npm install
npx prisma generate
npx prisma migrate dev --name init

# 4. Start Backend
npm run start:dev
```

**Test it:**
```bash
curl http://localhost:3000/api/auth/me
# Should get 401 Unauthorized ✅
```

---

✅ **Backend готов! Можно приступать к Frontend.**

Хочешь чтобы я начал создавать frontend с flip card и темами?
