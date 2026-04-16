# Smart OBD Platform - User-Centric Implementation Plan

## User Flow (Основная логика)

```
1. Регистрация / Вход (Email/Password или Google OAuth)
   ↓
2. Личный кабинет (Dashboard)
   ↓
3. Добавить машину (бренд, модель, год, VIN)
   ↓
4. Карточка машины с функциями:
   ├── 📝 Заметки (ремонты, наблюдения)
   ├── 🤖 AI Помощник (чат-консультант)
   └── 🔧 OBD Диагностика (загрузка кодов/данных)
```

---

## Phase 1: Authentication & User Management (Недели 1-2)

### 1.1 Backend - Auth Module

**Структура**:
```
backend/src/modules/auth/
├── auth.module.ts
├── auth.controller.ts
├── auth.service.ts
├── strategies/
│   ├── jwt.strategy.ts                # JWT валидация
│   ├── jwt-refresh.strategy.ts        # Refresh token
│   └── google.strategy.ts             # Google OAuth
├── guards/
│   ├── jwt-auth.guard.ts
│   ├── jwt-refresh.guard.ts
│   └── roles.guard.ts
├── decorators/
│   ├── current-user.decorator.ts
│   └── roles.decorator.ts
└── dto/
    ├── register.dto.ts
    ├── login.dto.ts
    └── auth-response.dto.ts
```

**Endpoints**:
```typescript
POST   /api/auth/register              # Email/Password регистрация
POST   /api/auth/login                 # Вход
POST   /api/auth/refresh               # Обновление токена
POST   /api/auth/logout                # Выход
GET    /api/auth/google                # Redirect на Google OAuth
GET    /api/auth/google/callback       # Callback от Google
GET    /api/auth/me                    # Текущий пользователь
```

**Prisma Models** (уже есть User в schema):
```prisma
model User {
  id            String    @id @default(uuid())
  email         String    @unique
  password      String?                 # Null для Google OAuth
  googleId      String?   @unique       # Google OAuth ID
  name          String?
  avatar        String?
  role          UserRole  @default(USER)
  refreshToken  String?                 # Для refresh token
  vehicles      Vehicle[]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}
```

**Технологии**:
- `@nestjs/jwt` - JWT токены
- `@nestjs/passport` - Аутентификация
- `passport-google-oauth20` - Google OAuth
- `bcrypt` - Хеширование паролей
- `class-validator` - Валидация DTO

**Логика**:
1. **Email/Password**:
   - Регистрация: хешировать пароль, создать user, вернуть JWT
   - Вход: проверить пароль, вернуть access + refresh токены
   
2. **Google OAuth**:
   - Редирект на Google
   - Callback: найти или создать user по googleId
   - Вернуть JWT токены
   
3. **Refresh Token**:
   - Сохранять в БД (hashed)
   - Обновлять access token по refresh токену
   - Инвалидация при logout

**Security**:
- httpOnly cookies для токенов
- CORS настройка
- Rate limiting на auth endpoints
- Password requirements (min 8 chars, etc.)

### 1.2 Frontend - Auth Pages

**Структура**:
```
frontend/src/
├── app/
│   ├── (auth)/
│   │   ├── layout.tsx                 # Auth layout (без header/sidebar)
│   │   ├── login/
│   │   │   └── page.tsx               # Страница входа
│   │   ├── register/
│   │   │   └── page.tsx               # Страница регистрации
│   │   └── google-callback/
│   │       └── page.tsx               # Google OAuth callback
│   └── (dashboard)/
│       └── layout.tsx                 # Protected layout
├── components/auth/
│   ├── login-form.tsx                 # Форма входа
│   ├── register-form.tsx              # Форма регистрации
│   ├── google-button.tsx              # "Sign in with Google"
│   └── logout-button.tsx
└── lib/
    ├── auth/
    │   ├── auth-context.tsx           # React Context
    │   ├── auth-provider.tsx          # Provider
    │   ├── use-auth.ts                # Hook для auth
    │   └── protected-route.tsx        # HOC для защищенных роутов
    └── api/
        └── auth-api.ts                # API методы
```

**UI Components**:
- Login форма: Email + Password + "Sign in with Google"
- Register форма: Email + Password + Confirm Password + "Sign up with Google"
- Google button (с иконкой)
- Error messages (Zod validation)
- Loading states

**Auth Context**:
```typescript
interface AuthContext {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterDto) => Promise<void>;
  loginWithGoogle: () => void;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
}
```

**Технологии**:
- TanStack Query для API calls
- Zod для валидации форм
- React Hook Form для форм
- shadcn/ui компоненты (Button, Input, Card)
- Tailwind CSS

---

## Phase 2: User Dashboard (Недели 3-4)

### 2.1 Backend - User Module

**Структура**:
```
backend/src/modules/users/
├── users.module.ts
├── users.controller.ts
├── users.service.ts
├── users.repository.ts
└── dto/
    ├── update-profile.dto.ts
    └── user-response.dto.ts
```

**Endpoints**:
```typescript
GET    /api/users/profile              # Профиль текущего пользователя
PATCH  /api/users/profile              # Обновить профиль
PATCH  /api/users/profile/avatar       # Обновить аватар
DELETE /api/users/profile              # Удалить аккаунт
```

### 2.2 Frontend - Dashboard

**Структура**:
```
frontend/src/app/(dashboard)/
├── layout.tsx                         # Основной layout с header/sidebar
├── dashboard/
│   └── page.tsx                       # Главная страница (список машин)
├── profile/
│   └── page.tsx                       # Настройки профиля
└── settings/
    └── page.tsx                       # Настройки аккаунта
```

**Dashboard Components**:
```
frontend/src/components/
├── layout/
│   ├── header.tsx                     # Header с user menu
│   ├── sidebar.tsx                    # Навигация
│   └── user-menu.tsx                  # Dropdown с logout/profile
└── dashboard/
    ├── stats-card.tsx                 # Статистика (кол-во машин, диагностик)
    ├── recent-activity.tsx            # Последние действия
    └── quick-actions.tsx              # Быстрые действия
```

**UI**:
- Header: Logo + Navigation + User avatar/menu
- Sidebar: Мои машины, Диагностика, Профиль, Настройки
- Main area: Контент страницы
- Responsive (mobile menu)

---

## Phase 3: Vehicle Management (Недели 5-6)

### 3.1 Backend - Vehicle Module

**Структура**:
```
backend/src/modules/vehicles/
├── vehicles.module.ts
├── vehicles.controller.ts
├── vehicles.service.ts
├── vehicles.repository.ts
└── dto/
    ├── create-vehicle.dto.ts
    ├── update-vehicle.dto.ts
    └── vehicle-response.dto.ts
```

**Endpoints**:
```typescript
GET    /api/vehicles                   # Список машин пользователя
POST   /api/vehicles                   # Добавить машину
GET    /api/vehicles/:id               # Детали машины
PATCH  /api/vehicles/:id               # Обновить машину
DELETE /api/vehicles/:id               # Удалить машину
GET    /api/vehicles/:id/stats         # Статистика по машине
```

**Prisma Model** (расширить существующий):
```prisma
model Vehicle {
  id              String              @id @default(uuid())
  userId          String
  user            User                @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  // Основная информация
  brand           String
  model           String
  year            Int
  engineType      String
  vin             String?
  mileage         Int?                # Пробег
  color           String?
  licensePlate    String?
  
  // Фото
  photos          String[]            # URLs к фото
  
  // Связи
  notes           Note[]
  diagnostics     DiagnosticSession[]
  aiChats         AiChat[]
  
  createdAt       DateTime            @default(now())
  updatedAt       DateTime            @updatedAt
}

model Note {
  id          String   @id @default(uuid())
  vehicleId   String
  vehicle     Vehicle  @relation(fields: [vehicleId], references: [id], onDelete: Cascade)
  title       String
  content     String   @db.Text
  category    NoteCategory @default(GENERAL)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

enum NoteCategory {
  GENERAL       # Общие заметки
  REPAIR        # Ремонт
  MAINTENANCE   # Обслуживание
  OBSERVATION   # Наблюдения
  REMINDER      # Напоминания
}
```

### 3.2 Frontend - Vehicles Pages

**Структура**:
```
frontend/src/app/(dashboard)/
└── vehicles/
    ├── page.tsx                       # Список машин
    ├── new/
    │   └── page.tsx                   # Добавить машину
    └── [id]/
        ├── page.tsx                   # Карточка машины (redirect на overview)
        ├── layout.tsx                 # Layout с табами
        ├── overview/
        │   └── page.tsx               # Обзор
        ├── notes/
        │   └── page.tsx               # Заметки
        ├── assistant/
        │   └── page.tsx               # AI Помощник
        ├── diagnostics/
        │   └── page.tsx               # OBD Диагностика
        └── settings/
            └── page.tsx               # Настройки машины
```

**Components**:
```
frontend/src/components/vehicles/
├── vehicle-list.tsx                   # Grid/List view
├── vehicle-card.tsx                   # Карточка в списке
├── vehicle-form.tsx                   # Форма создания/редактирования
├── vehicle-header.tsx                 # Header с фото + основной инфо
├── vehicle-tabs.tsx                   # Табы навигации
└── vehicle-stats.tsx                  # Статистика
```

**UI - Список машин**:
```
┌────────────────────────────────────────┐
│  Мои машины             [+ Добавить]   │
├────────────────────────────────────────┤
│  ┌──────┐  ┌──────┐  ┌──────┐         │
│  │ BMW  │  │ Audi │  │Toyota│         │
│  │ X5   │  │  A4  │  │Camry │         │
│  │ 2020 │  │ 2018 │  │ 2015 │         │
│  └──────┘  └──────┘  └──────┘         │
└────────────────────────────────────────┘
```

**UI - Форма добавления**:
- Brand (dropdown с популярными марками)
- Model (input)
- Year (number)
- Engine Type (select: Бензин/Дизель/Гибрид/Электро)
- VIN (optional)
- Mileage (optional)
- Photos upload (drag & drop)

---

## Phase 4: Vehicle Card - Overview & Notes (Недели 7-8)

### 4.1 Notes Module (Backend)

**Структура**:
```
backend/src/modules/notes/
├── notes.module.ts
├── notes.controller.ts
├── notes.service.ts
├── notes.repository.ts
└── dto/
    ├── create-note.dto.ts
    ├── update-note.dto.ts
    └── note-response.dto.ts
```

**Endpoints**:
```typescript
GET    /api/vehicles/:vehicleId/notes             # Все заметки машины
POST   /api/vehicles/:vehicleId/notes             # Создать заметку
GET    /api/notes/:id                             # Детали заметки
PATCH  /api/notes/:id                             # Обновить заметку
DELETE /api/notes/:id                             # Удалить заметку
GET    /api/notes?category=REPAIR                 # Фильтр по категории
```

### 4.2 Frontend - Vehicle Overview

**Overview Page**:
```
┌────────────────────────────────────────────────┐
│  [Photo]  BMW X5 2020                          │
│           Бензин • VIN: WBXXX • 45,000 km      │
├────────────────────────────────────────────────┤
│  Обзор | Заметки | AI Помощник | Диагностика   │
├────────────────────────────────────────────────┤
│  📊 Статистика                                  │
│  ├─ Всего диагностик: 12                       │
│  ├─ Последняя диагностика: 3 дня назад         │
│  ├─ Активных проблем: 0                        │
│  └─ Заметок: 8                                 │
│                                                 │
│  📝 Последние заметки                           │
│  ├─ [REPAIR] Замена масла - 1 неделю назад     │
│  ├─ [OBSERVATION] Странный звук... - 2 недели  │
│  └─ [Показать все]                             │
│                                                 │
│  🔧 Последние диагностики                       │
│  ├─ 2024-04-10: Все в порядке ✓                │
│  └─ [Показать все]                             │
└────────────────────────────────────────────────┘
```

### 4.3 Frontend - Notes Page

**Notes Components**:
```
frontend/src/components/vehicles/notes/
├── notes-list.tsx                     # Список заметок
├── note-card.tsx                      # Карточка заметки
├── note-form.tsx                      # Форма создания/редактирования
├── note-filter.tsx                    # Фильтр по категориям
└── note-editor.tsx                    # Rich text editor
```

**UI**:
```
┌────────────────────────────────────────────────┐
│  Заметки                        [+ Добавить]   │
│  Фильтр: [Все ▼] [Ремонт] [Обслуживание] ...  │
├────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────┐  │
│  │ 🔧 REPAIR | Замена масла                 │  │
│  │ 10.04.2024                               │  │
│  │ Заменено масло 5W-30, новый фильтр...   │  │
│  │ [Редактировать] [Удалить]                │  │
│  └──────────────────────────────────────────┘  │
│                                                 │
│  ┌──────────────────────────────────────────┐  │
│  │ 👁️ OBSERVATION | Странный звук          │  │
│  │ 03.04.2024                               │  │
│  │ Слышу свист при ускорении...             │  │
│  └──────────────────────────────────────────┘  │
└────────────────────────────────────────────────┘
```

**Features**:
- CRUD заметок
- Категории с иконками
- Rich text editor (markdown или WYSIWYG)
- Фильтр по категориям
- Поиск по заметкам
- Сортировка (дата, название)

---

## Phase 5: AI Assistant (Недели 9-10)

### 5.1 Backend - AI Chat Module

**Структура**:
```
backend/src/modules/ai-chat/
├── ai-chat.module.ts
├── ai-chat.controller.ts
├── ai-chat.service.ts
├── ai-chat.repository.ts
├── providers/
│   ├── openai.provider.ts             # OpenAI integration
│   └── ai-provider.interface.ts       # Абстракция
└── dto/
    ├── send-message.dto.ts
    ├── chat-message.dto.ts
    └── chat-response.dto.ts
```

**Prisma Models**:
```prisma
model AiChat {
  id          String       @id @default(uuid())
  vehicleId   String
  vehicle     Vehicle      @relation(fields: [vehicleId], references: [id], onDelete: Cascade)
  title       String       @default("Новый чат")
  messages    ChatMessage[]
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
}

model ChatMessage {
  id        String   @id @default(uuid())
  chatId    String
  chat      AiChat   @relation(fields: [chatId], references: [id], onDelete: Cascade)
  role      MessageRole  # USER or ASSISTANT
  content   String   @db.Text
  createdAt DateTime @default(now())
}

enum MessageRole {
  USER
  ASSISTANT
  SYSTEM
}
```

**Endpoints**:
```typescript
GET    /api/vehicles/:vehicleId/chats              # Список чатов
POST   /api/vehicles/:vehicleId/chats              # Создать чат
GET    /api/chats/:chatId                          # История чата
POST   /api/chats/:chatId/messages                 # Отправить сообщение
DELETE /api/chats/:chatId                          # Удалить чат
PATCH  /api/chats/:chatId/title                    # Переименовать чат
```

**AI Logic**:
```typescript
// System prompt с контекстом машины
const systemPrompt = `
Ты - AI помощник для автовладельца.
Машина: ${vehicle.brand} ${vehicle.model} ${vehicle.year}
Двигатель: ${vehicle.engineType}
Пробег: ${vehicle.mileage} км

Твоя задача:
- Отвечать на вопросы о машине
- Помогать с диагностикой проблем
- Давать рекомендации по обслуживанию
- НЕ заменяешь профессионального механика
- Всегда предупреждай о необходимости обращения к специалисту
`;

// Включать последние заметки и диагностики в контекст
const context = {
  recentNotes: await getRecentNotes(vehicleId, 5),
  recentDiagnostics: await getRecentDiagnostics(vehicleId, 3),
};
```

**OpenAI Provider**:
- Model: `gpt-4-turbo` или `gpt-3.5-turbo`
- Streaming responses (SSE)
- Prompt engineering с контекстом машины
- Rate limiting (по user)
- Fallback на mock в dev

### 5.2 Frontend - AI Assistant Page

**Components**:
```
frontend/src/components/vehicles/ai-assistant/
├── chat-sidebar.tsx                   # Список чатов
├── chat-window.tsx                    # Окно чата
├── message-list.tsx                   # Список сообщений
├── message-item.tsx                   # Сообщение
├── message-input.tsx                  # Input для сообщения
└── chat-suggestions.tsx               # Suggested questions
```

**UI**:
```
┌────────────────────────────────────────────────┐
│  AI Помощник                                    │
├──────────┬─────────────────────────────────────┤
│ Чаты     │  BMW X5 2020 - Общие вопросы        │
│          │                                     │
│ [+ Новый]│  ┌─────────────────────────────┐   │
│          │  │ Ты: Почему может стучать    │   │
│ ○ Общие  │  │     двигатель при запуске?  │   │
│   вопросы│  └─────────────────────────────┘   │
│          │                                     │
│ ○ Диагно-│  ┌─────────────────────────────┐   │
│   стика  │  │ AI: Стук при запуске может  │   │
│   P0301  │  │     быть вызван...          │   │
│          │  │     1. Низкое давление масла│   │
│          │  │     2. Износ гидрокомпенсат.│   │
│          │  └─────────────────────────────┘   │
│          │                                     │
│          │  Предложения:                      │
│          │  • Какое масло выбрать?            │
│          │  • Когда менять свечи?             │
│          │                                     │
│          │  [Введите сообщение...]   [Send]   │
└──────────┴─────────────────────────────────────┘
```

**Features**:
- Множественные чаты (как в ChatGPT)
- Streaming responses
- Markdown рендеринг (code blocks, lists)
- Контекст машины в каждом чате
- Suggested questions
- Экспорт чата в PDF/текст
- Loading states

**Технологии**:
- SSE (Server-Sent Events) для streaming
- `react-markdown` для рендеринга
- Auto-scroll к новым сообщениям
- Typing indicator

---

## Phase 6: OBD Diagnostics (Недели 11-13)

### 6.1 Backend - Diagnostics Module (Simplified)

**Структура**:
```
backend/src/modules/diagnostics/
├── diagnostics.module.ts
├── diagnostics.controller.ts
├── diagnostics.service.ts
├── diagnostics.repository.ts
├── parsers/
│   ├── obd-parser.interface.ts
│   ├── csv-parser.ts                  # Парсер CSV
│   └── json-parser.ts                 # Парсер JSON
├── analyzers/
│   ├── dtc-analyzer.ts                # Анализ кодов ошибок
│   └── metric-analyzer.ts             # Анализ метрик
└── dto/
    ├── upload-diagnostic.dto.ts
    ├── diagnostic-response.dto.ts
    └── analysis-result.dto.ts
```

**Endpoints**:
```typescript
GET    /api/vehicles/:vehicleId/diagnostics       # История диагностик
POST   /api/vehicles/:vehicleId/diagnostics/upload # Загрузить OBD данные
GET    /api/diagnostics/:id                       # Детали диагностики
GET    /api/diagnostics/:id/analysis              # Результат анализа
DELETE /api/diagnostics/:id                       # Удалить диагностику
POST   /api/diagnostics/:id/retry                 # Повторный анализ
```

**Prisma Models** (расширить):
```prisma
model DiagnosticSession {
  id          String             @id @default(uuid())
  vehicleId   String
  vehicle     Vehicle            @relation(fields: [vehicleId], references: [id], onDelete: Cascade)
  
  status      DiagnosticStatus   @default(PENDING)
  sourceType  DiagnosticSource   # CSV, JSON, MANUAL
  fileName    String?            # Имя загруженного файла
  
  // OBD данные
  metrics     DiagnosticMetric[]
  dtcs        DtcCode[]
  
  // Результат анализа
  result      AnalysisResult?
  
  createdAt   DateTime           @default(now())
  updatedAt   DateTime           @updatedAt
}

model DiagnosticMetric {
  id        String            @id @default(uuid())
  sessionId String
  session   DiagnosticSession @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  
  name      String            # Название метрики (coolant_temp, rpm, etc.)
  value     Float             # Значение
  unit      String            # Единица измерения
  timestamp DateTime          # Время записи
}

model DtcCode {
  id          String            @id @default(uuid())
  sessionId   String
  session     DiagnosticSession @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  
  code        String            # Код ошибки (P0301)
  description String            # Описание
  severity    DtcSeverity       # Критичность
  status      DtcStatus         # ACTIVE, CLEARED, PENDING
}

model AnalysisResult {
  id              String            @id @default(uuid())
  sessionId       String            @unique
  session         DiagnosticSession @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  
  summary         String            @db.Text  # Краткое описание
  issues          Json              # Найденные проблемы
  recommendations String            @db.Text  # Рекомендации
  confidence      Float             # Уверенность (0-1)
  
  aiExplanation   String?           @db.Text  # AI интерпретация
  
  createdAt       DateTime          @default(now())
}

enum DtcSeverity {
  INFO
  WARNING
  ERROR
  CRITICAL
}

enum DtcStatus {
  ACTIVE
  PENDING
  CLEARED
}
```

**Upload Logic**:
```typescript
// 1. Upload файл (CSV/JSON)
// 2. Parse и validate
// 3. Сохранить в БД
// 4. Запустить анализ (async с BullMQ)
// 5. AI интерпретация результатов
// 6. Сохранить AnalysisResult
```

**Analysis Logic** (упрощенная версия):
```typescript
// DTC Analyzer
const dtcSeverity = {
  'P0301': { severity: 'ERROR', description: 'Cylinder 1 Misfire' },
  'P0420': { severity: 'WARNING', description: 'Catalyst System Low Efficiency' },
  // ... база кодов
};

// Metric Analyzer
const thresholds = {
  coolant_temp: { max: 105, warning: 95 },
  engine_load: { max: 100, warning: 90 },
  // ... пороги
};

// Simple rule-based analysis
function analyze(session: DiagnosticSession): AnalysisResult {
  const issues = [];
  
  // Проверить DTCs
  for (const dtc of session.dtcs) {
    if (dtcSeverity[dtc.code]) {
      issues.push({
        type: 'DTC',
        code: dtc.code,
        severity: dtcSeverity[dtc.code].severity,
        description: dtcSeverity[dtc.code].description,
      });
    }
  }
  
  // Проверить метрики
  for (const metric of session.metrics) {
    if (thresholds[metric.name]) {
      if (metric.value > thresholds[metric.name].max) {
        issues.push({
          type: 'METRIC',
          name: metric.name,
          value: metric.value,
          threshold: thresholds[metric.name].max,
          severity: 'ERROR',
        });
      }
    }
  }
  
  return {
    summary: generateSummary(issues),
    issues,
    recommendations: generateRecommendations(issues),
    confidence: calculateConfidence(issues),
  };
}
```

### 6.2 Frontend - Diagnostics Page

**Components**:
```
frontend/src/components/vehicles/diagnostics/
├── diagnostics-list.tsx               # История диагностик
├── diagnostic-card.tsx                # Карточка диагностики
├── upload-form.tsx                    # Форма загрузки
├── file-dropzone.tsx                  # Drag & Drop
├── analysis-result.tsx                # Результат анализа
├── dtc-list.tsx                       # Список кодов ошибок
├── dtc-item.tsx                       # Карточка DTC
├── metric-chart.tsx                   # График метрик (Recharts)
└── recommendations.tsx                # Рекомендации
```

**UI - Upload Page**:
```
┌────────────────────────────────────────────────┐
│  OBD Диагностика                 [+ Загрузить] │
├────────────────────────────────────────────────┤
│  Загрузите OBD данные                          │
│                                                 │
│  ┌──────────────────────────────────────────┐  │
│  │     📁 Перетащите файл сюда              │  │
│  │        или кликните для выбора           │  │
│  │                                          │  │
│  │     Поддерживаемые форматы:              │  │
│  │     CSV, JSON (до 10MB)                  │  │
│  └──────────────────────────────────────────┘  │
│                                                 │
│  Примеры форматов:                             │
│  • CSV: timestamp,rpm,coolant_temp,...         │
│  • JSON: { "metrics": [...], "dtcs": [...] }   │
└────────────────────────────────────────────────┘
```

**UI - Analysis Result**:
```
┌────────────────────────────────────────────────┐
│  Диагностика от 15.04.2024                     │
├────────────────────────────────────────────────┤
│  📊 Общая оценка: ⚠️ Требуется внимание       │
│  Уверенность: 85%                              │
│                                                 │
│  🔴 Критические проблемы (1)                    │
│  ┌──────────────────────────────────────────┐  │
│  │ P0301 - Пропуски зажигания, цилиндр 1   │  │
│  │ Рекомендация: Проверить свечи, катушки  │  │
│  └──────────────────────────────────────────┘  │
│                                                 │
│  ⚠️ Предупреждения (2)                          │
│  • P0420 - Низкая эффективность катализатора   │
│  • Температура охлаждайки: 98°C (норма: <95°C) │
│                                                 │
│  📈 Метрики                                     │
│  [График с Recharts - RPM, Temp, Load...]     │
│                                                 │
│  🤖 AI Интерпретация                            │
│  На основе анализа данных, наиболее вероятная  │
│  причина пропусков - износ свечей зажигания... │
│                                                 │
│  📋 Рекомендации                                │
│  1. Проверить свечи зажигания (цилиндр 1)      │
│  2. Диагностика катушки зажигания              │
│  3. Проверить компрессию в цилиндрах           │
│  4. Рекомендуется обратиться к механику        │
└────────────────────────────────────────────────┘
```

**Features**:
- Drag & Drop upload
- CSV/JSON validation
- Progress bar при загрузке
- История всех диагностик
- Визуализация метрик (Recharts - line chart)
- DTC коды с severity badges
- AI интерпретация
- Экспорт отчета (PDF)
- Возможность добавить заметку к диагностике

---

## Phase 7: Polish & Production (Недели 14-16)

### 7.1 Testing

**Backend Tests**:
```
backend/src/
├── modules/auth/__tests__/
│   ├── auth.service.spec.ts
│   └── auth.controller.spec.ts
├── modules/vehicles/__tests__/
└── modules/diagnostics/__tests__/

backend/test/e2e/
├── auth.e2e-spec.ts
├── vehicles.e2e-spec.ts
└── diagnostics.e2e-spec.ts
```

**Frontend Tests**:
```
frontend/src/
├── components/__tests__/
├── lib/auth/__tests__/
└── app/__tests__/
```

### 7.2 DevOps

**CI/CD**:
```
.github/workflows/
├── backend-ci.yml                     # Lint, Test, Build
├── frontend-ci.yml
├── deploy-staging.yml
└── deploy-production.yml
```

**Docker Production**:
```
docker-compose.prod.yml
backend/Dockerfile
frontend/Dockerfile
```

**Environment Setup**:
```
backend/.env.production
├── DATABASE_URL
├── REDIS_URL
├── JWT_SECRET
├── JWT_REFRESH_SECRET
├── GOOGLE_CLIENT_ID
├── GOOGLE_CLIENT_SECRET
├── OPENAI_API_KEY
└── FRONTEND_URL
```

### 7.3 Monitoring & Logging

**Backend**:
```
backend/src/infrastructure/
├── logging/
│   ├── logger.service.ts              # Winston
│   └── log.middleware.ts
├── monitoring/
│   ├── health.controller.ts           # /health endpoint
│   └── metrics.service.ts             # Prometheus metrics
└── errors/
    ├── error-handler.ts
    └── app-exceptions.ts
```

**Features**:
- Structured logging (Winston)
- Health checks
- Error tracking (Sentry)
- Performance monitoring
- Request logging

---

## Технологический стек (финальный)

### Backend
```json
{
  "framework": "NestJS",
  "language": "TypeScript",
  "database": "PostgreSQL",
  "orm": "Prisma",
  "cache": "Redis",
  "queue": "BullMQ",
  "auth": "@nestjs/jwt + @nestjs/passport",
  "oauth": "passport-google-oauth20",
  "ai": "OpenAI SDK",
  "validation": "class-validator + class-transformer",
  "testing": "Jest + Supertest",
  "logging": "Winston"
}
```

### Frontend
```json
{
  "framework": "Next.js 14 (App Router)",
  "language": "TypeScript",
  "styling": "Tailwind CSS",
  "components": "shadcn/ui",
  "forms": "React Hook Form + Zod",
  "api": "TanStack Query (React Query)",
  "charts": "Recharts",
  "markdown": "react-markdown",
  "http": "Axios",
  "testing": "Jest + React Testing Library"
}
```

### DevOps
```json
{
  "containerization": "Docker + docker-compose",
  "ci-cd": "GitHub Actions",
  "hosting-backend": "Fly.io / Railway",
  "hosting-frontend": "Vercel",
  "database": "Supabase (PostgreSQL)",
  "redis": "Upstash",
  "monitoring": "Sentry",
  "logging": "Winston"
}
```

---

## Database Schema (финальная)

```prisma
// User & Auth
model User {
  id            String    @id @default(uuid())
  email         String    @unique
  password      String?
  googleId      String?   @unique
  name          String?
  avatar        String?
  role          UserRole  @default(USER)
  refreshToken  String?
  vehicles      Vehicle[]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

// Vehicles
model Vehicle {
  id            String              @id @default(uuid())
  userId        String
  user          User                @relation(fields: [userId], references: [id], onDelete: Cascade)
  brand         String
  model         String
  year          Int
  engineType    String
  vin           String?
  mileage       Int?
  color         String?
  licensePlate  String?
  photos        String[]
  notes         Note[]
  diagnostics   DiagnosticSession[]
  aiChats       AiChat[]
  createdAt     DateTime            @default(now())
  updatedAt     DateTime            @updatedAt
}

// Notes
model Note {
  id        String       @id @default(uuid())
  vehicleId String
  vehicle   Vehicle      @relation(fields: [vehicleId], references: [id], onDelete: Cascade)
  title     String
  content   String       @db.Text
  category  NoteCategory @default(GENERAL)
  createdAt DateTime     @default(now())
  updatedAt DateTime     @updatedAt
}

// AI Chat
model AiChat {
  id        String        @id @default(uuid())
  vehicleId String
  vehicle   Vehicle       @relation(fields: [vehicleId], references: [id], onDelete: Cascade)
  title     String        @default("Новый чат")
  messages  ChatMessage[]
  createdAt DateTime      @default(now())
  updatedAt DateTime      @updatedAt
}

model ChatMessage {
  id        String      @id @default(uuid())
  chatId    String
  chat      AiChat      @relation(fields: [chatId], references: [id], onDelete: Cascade)
  role      MessageRole
  content   String      @db.Text
  createdAt DateTime    @default(now())
}

// Diagnostics
model DiagnosticSession {
  id         String             @id @default(uuid())
  vehicleId  String
  vehicle    Vehicle            @relation(fields: [vehicleId], references: [id], onDelete: Cascade)
  status     DiagnosticStatus   @default(PENDING)
  sourceType DiagnosticSource
  fileName   String?
  metrics    DiagnosticMetric[]
  dtcs       DtcCode[]
  result     AnalysisResult?
  createdAt  DateTime           @default(now())
  updatedAt  DateTime           @updatedAt
}

model DiagnosticMetric {
  id        String            @id @default(uuid())
  sessionId String
  session   DiagnosticSession @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  name      String
  value     Float
  unit      String
  timestamp DateTime
}

model DtcCode {
  id          String            @id @default(uuid())
  sessionId   String
  session     DiagnosticSession @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  code        String
  description String
  severity    DtcSeverity
  status      DtcStatus
}

model AnalysisResult {
  id              String            @id @default(uuid())
  sessionId       String            @unique
  session         DiagnosticSession @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  summary         String            @db.Text
  issues          Json
  recommendations String            @db.Text
  confidence      Float
  aiExplanation   String?           @db.Text
  createdAt       DateTime          @default(now())
}

// Enums
enum UserRole {
  USER
  ADMIN
}

enum NoteCategory {
  GENERAL
  REPAIR
  MAINTENANCE
  OBSERVATION
  REMINDER
}

enum MessageRole {
  USER
  ASSISTANT
  SYSTEM
}

enum DiagnosticStatus {
  PENDING
  PROCESSING
  COMPLETED
  FAILED
}

enum DiagnosticSource {
  CSV
  JSON
  MANUAL
}

enum DtcSeverity {
  INFO
  WARNING
  ERROR
  CRITICAL
}

enum DtcStatus {
  ACTIVE
  PENDING
  CLEARED
}
```

---

## Roadmap (16 недель)

| Недели | Фаза | Задачи |
|--------|------|--------|
| 1-2 | Auth | Backend (JWT, Google OAuth), Frontend (Login/Register) |
| 3-4 | Dashboard | User profile, Dashboard layout, Settings |
| 5-6 | Vehicles | CRUD vehicles, List view, Vehicle form |
| 7-8 | Notes | CRUD notes, Categories, Rich text editor |
| 9-10 | AI Assistant | Chat backend (OpenAI), Chat UI, Streaming |
| 11-13 | Diagnostics | OBD upload, Parsing, Analysis, Visualization |
| 14-16 | Production | Testing, CI/CD, Monitoring, Deploy |

---

## MVP Scope (8 недель)

Если нужен быстрый MVP, сократить до:

**Must Have**:
- ✅ Auth (Email + Google)
- ✅ Vehicles CRUD
- ✅ Notes (basic)
- ✅ OBD upload + basic analysis
- ✅ AI Assistant (basic chat)

**Nice to Have** (отложить):
- ⏸️ Rich text editor для заметок
- ⏸️ Множественные AI чаты
- ⏸️ Сложная диагностическая логика (Strategy/Specification patterns)
- ⏸️ Advanced charts
- ⏸️ PDF export

---

## С чего начать?

### Шаг 1: Setup проекта (день 1)
```bash
# Backend
cd backend
npm install @nestjs/jwt @nestjs/passport passport passport-jwt
npm install passport-google-oauth20 bcrypt
npm install class-validator class-transformer

# Frontend
cd frontend
npm install @tanstack/react-query axios react-hook-form zod
npm install @radix-ui/react-* (shadcn/ui components)
```

### Шаг 2: Обновить Prisma schema (день 1)
- Добавить `googleId`, `refreshToken` в User
- Добавить новые поля в Vehicle
- Создать Note, AiChat, ChatMessage модели
- Запустить миграцию

### Шаг 3: Auth Module (дни 2-5)
- Настроить JWT Strategy
- Реализовать Google OAuth
- Создать Auth Controller/Service
- Frontend: Login/Register pages

### Шаг 4: Далее по плану...

Хочешь начать с конкретной фазы? Могу сгенерировать код для любого модуля!
