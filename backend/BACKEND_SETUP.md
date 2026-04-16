# Backend Setup Guide

## 🎯 Что реализовано

### ✅ Authentication System (Full Stack)
- Email/Password registration & login
- Google OAuth integration
- JWT Access + Refresh tokens (httpOnly cookies)
- Email verification
- Password reset (forgot password flow)
- Multi-Factor Authentication (TOTP с QR кодом)
- MFA backup codes

### ✅ Architecture (SOLID Principles)
- **Single Responsibility**: Каждый сервис отвечает за одну задачу
  - `PasswordHasherService` - только хеширование
  - `TokenService` - только JWT токены
  - `MfaService` - только MFA логика
  - `EmailService` - только отправка email
  - `AuthService` - оркестрация auth flow

- **Interface Segregation**: Отдельные интерфейсы
  - `IPasswordHasher`
  - `ITokenGenerator`

- **Dependency Inversion**: Зависимость от абстракций, не реализаций

### ✅ Security Features
- Password hashing с bcrypt (12 rounds)
- JWT токены с коротким TTL (access: 15min, refresh: 7 days)
- httpOnly cookies (защита от XSS)
- Email verification обязательна
- MFA с TOTP (Google Authenticator compatible)
- Security headers middleware
- CORS настройка
- Global validation pipe

### ✅ Guards & Decorators
- `JwtAuthGuard` - глобальная защита всех routes
- `JwtRefreshGuard` - для refresh endpoint
- `GoogleAuthGuard` - для OAuth
- `RolesGuard` - role-based access control
- `EmailVerifiedGuard` - проверка верификации email
- `@Public()` - decorator для public routes
- `@CurrentUser()` - получение текущего пользователя
- `@Roles()` - ограничение по ролям

### ✅ Middleware
- `LoggerMiddleware` - HTTP request logging
- `SecurityMiddleware` - security headers

### ✅ Prisma Schema
Обновлена схема с полями:
- MFA (secret, backup codes, enabled flag)
- Email verification (token, expiry)
- Password reset (token, expiry)
- Refresh token storage
- User preferences (language, theme)
- Google OAuth (googleId)

---

## 🚀 Setup Instructions

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Setup Environment Variables
```bash
cp .env.example .env.local
```

Отредактируйте `.env.local`:
```bash
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/smart_obd"

# JWT Secrets (generate strong secrets!)
JWT_SECRET=$(openssl rand -base64 32)
JWT_REFRESH_SECRET=$(openssl rand -base64 32)

# Google OAuth (optional)
# Get from: https://console.cloud.google.com/
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret

# URLs
BACKEND_URL=http://localhost:3000
FRONTEND_URL=http://localhost:3001
```

### 3. Start PostgreSQL
```bash
docker-compose up postgres
```

### 4. Run Prisma Migrations
```bash
npx prisma generate
npx prisma migrate dev --name init
```

### 5. Start Development Server
```bash
npm run start:dev
```

Server will run on: **http://localhost:3000**

---

## 📡 API Endpoints

### Public Endpoints

#### POST `/api/auth/register`
Register new user
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "name": "John Doe",
  "preferredLanguage": "en" // "en" | "ru" | "fr"
}
```

#### POST `/api/auth/login`
Login user
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "mfaCode": "123456" // Optional, required if MFA enabled
}
```

Response:
```json
{
  "accessToken": "...",
  "refreshToken": "...",
  "user": {
    "id": "...",
    "email": "...",
    "name": "...",
    "role": "USER",
    "isEmailVerified": true,
    "mfaEnabled": false,
    "preferredLanguage": "en",
    "theme": "light"
  }
}
```

#### POST `/api/auth/refresh`
Refresh access token (requires refresh token in Authorization header)

#### GET `/api/auth/verify-email?token=xxx`
Verify email address

#### POST `/api/auth/forgot-password`
Request password reset
```json
{
  "email": "user@example.com"
}
```

#### POST `/api/auth/reset-password`
Reset password
```json
{
  "token": "reset-token-from-email",
  "newPassword": "NewSecurePass123!"
}
```

#### GET `/api/auth/google`
Initiate Google OAuth (redirects to Google)

#### GET `/api/auth/google/callback`
Google OAuth callback (auto-redirects to frontend)

---

### Protected Endpoints (Require JWT)

#### GET `/api/auth/me`
Get current user info

#### POST `/api/auth/logout`
Logout user (invalidates refresh token)

#### POST `/api/auth/mfa/setup`
Start MFA setup (returns QR code & backup codes)

Response:
```json
{
  "secret": "...",
  "qrCodeUrl": "data:image/png;base64,...",
  "backupCodes": ["XXXX-XXXX", "YYYY-YYYY", ...]
}
```

#### POST `/api/auth/mfa/verify`
Verify and enable MFA
```json
{
  "code": "123456"
}
```

#### POST `/api/auth/mfa/disable`
Disable MFA
```json
{
  "code": "123456"
}
```

---

## 🗂️ Project Structure

```
backend/src/
├── common/
│   └── middleware/
│       ├── logger.middleware.ts          # HTTP logging
│       └── security.middleware.ts        # Security headers
├── modules/
│   ├── prisma/
│   │   ├── prisma.module.ts
│   │   └── prisma.service.ts
│   └── auth/
│       ├── auth.module.ts
│       ├── auth.controller.ts
│       ├── auth.service.ts               # Main auth orchestration
│       ├── dto/
│       │   ├── register.dto.ts
│       │   ├── login.dto.ts
│       │   ├── forgot-password.dto.ts
│       │   ├── reset-password.dto.ts
│       │   ├── verify-mfa.dto.ts
│       │   └── auth-response.dto.ts
│       ├── services/                     # SOLID: Single Responsibility
│       │   ├── password-hasher.service.ts
│       │   ├── token.service.ts
│       │   ├── mfa.service.ts
│       │   └── email.service.ts
│       ├── interfaces/                   # SOLID: Interface Segregation
│       │   ├── password-hasher.interface.ts
│       │   └── token-generator.interface.ts
│       ├── strategies/
│       │   ├── jwt.strategy.ts
│       │   ├── jwt-refresh.strategy.ts
│       │   └── google.strategy.ts
│       ├── guards/
│       │   ├── jwt-auth.guard.ts
│       │   ├── jwt-refresh.guard.ts
│       │   ├── google-auth.guard.ts
│       │   ├── roles.guard.ts
│       │   └── email-verified.guard.ts
│       └── decorators/
│           ├── current-user.decorator.ts
│           ├── public.decorator.ts
│           └── roles.decorator.ts
├── app.module.ts
└── main.ts
```

---

## 🔐 How It Works

### Registration Flow
```
1. User submits email + password
2. Password hashed with bcrypt (12 rounds)
3. Generate email verification token
4. Save user to database (isEmailVerified: false)
5. Send verification email
6. User clicks link → email verified
7. User can now login
```

### Login Flow
```
1. User submits email + password
2. Validate credentials
3. Check if email verified
4. Check if MFA enabled
   → If MFA: require code
   → If no MFA: proceed
5. Generate access + refresh tokens
6. Save refresh token to database
7. Set httpOnly cookies
8. Return user data
```

### MFA Flow
```
1. User requests MFA setup (must be logged in)
2. Generate TOTP secret
3. Generate QR code
4. Generate 10 backup codes
5. User scans QR with Google Authenticator
6. User verifies with code
7. MFA enabled
8. Next login requires MFA code
```

### Token Refresh Flow
```
1. Access token expires (15 min)
2. Frontend sends refresh token
3. Validate refresh token
4. Generate new access + refresh tokens
5. Update refresh token in database
6. Set new cookies
```

---

## 🧪 Testing

### Manual Testing with cURL

#### Register
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!",
    "name": "Test User"
  }'
```

#### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!"
  }' \
  -c cookies.txt  # Save cookies
```

#### Get Current User (with cookies)
```bash
curl -X GET http://localhost:3000/api/auth/me \
  -b cookies.txt  # Load cookies
```

---

## 🔧 Configuration

### Google OAuth Setup
1. Go to https://console.cloud.google.com/
2. Create new project
3. Enable Google+ API
4. Create OAuth 2.0 Client ID
5. Add authorized redirect URI:
   - `http://localhost:3000/api/auth/google/callback` (dev)
   - `https://yourdomain.com/api/auth/google/callback` (prod)
6. Copy Client ID & Secret to `.env.local`

### Email Service Setup (Production)
В production нужно настроить email провайдера:
- SendGrid
- AWS SES
- Mailgun
- Gmail SMTP (для dev)

Обновить `EmailService` в `email.service.ts`

---

## 🚀 Next Steps

### Backend TODO:
- [ ] Implement rate limiting (express-rate-limit)
- [ ] Add Swagger/OpenAPI documentation
- [ ] Add unit tests (Jest)
- [ ] Add E2E tests
- [ ] Implement email provider (SendGrid/SES)
- [ ] Add Redis for session storage
- [ ] Implement BullMQ for background jobs

### Frontend TODO:
- [ ] Create auth context
- [ ] Build flip card login/register component
- [ ] Implement theme switcher (Bosch blue)
- [ ] Setup i18n (ru/en/fr)
- [ ] Create MFA setup flow
- [ ] Create dashboard

---

## 📚 Dependencies

```json
{
  "@nestjs/jwt": "JWT tokens",
  "@nestjs/passport": "Authentication strategies",
  "passport-jwt": "JWT strategy",
  "passport-google-oauth20": "Google OAuth",
  "bcrypt": "Password hashing",
  "speakeasy": "TOTP for MFA",
  "qrcode": "QR code generation",
  "cookie-parser": "Cookie handling",
  "class-validator": "DTO validation",
  "class-transformer": "DTO transformation"
}
```

---

## 💡 Tips

### Generate Strong JWT Secrets
```bash
openssl rand -base64 32
```

### View Database with Prisma Studio
```bash
npx prisma studio
```

### Reset Database
```bash
npx prisma migrate reset
```

### Check Logs
Logs are output to console with format:
```
[HTTP] GET /api/auth/me 200 - Mozilla/5.0... - 42ms
```

---

## ⚠️ Security Considerations

### Development
- Email verification tokens logged to console (не отправляются)
- Используйте `.env.local` для секретов (не коммитьте!)

### Production
- Используйте сильные JWT secrets (min 32 chars)
- Настройте HTTPS
- Настройте email провайдера
- Включите rate limiting
- Используйте Redis для session storage
- Настройте monitoring (Sentry)
- Backup database регулярно

---

✅ **Backend готов к использованию!**

Все endpoints работают, безопасность настроена, SOLID принципы соблюдены.
