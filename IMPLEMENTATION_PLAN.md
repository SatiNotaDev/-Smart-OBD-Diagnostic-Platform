# Smart OBD Diagnostic Platform - Implementation Plan

## Архитектурная схема

```
┌─────────────────────────────────────────────────┐
│          Presentation Layer (API/UI)            │
│  Controllers, Resolvers, React Components       │
└────────────────┬────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────┐
│         Application Layer (Use Cases)           │
│  Commands, Queries, Handlers, DTOs              │
└────────────────┬────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────┐
│            Domain Layer (Core Logic)            │
│  Entities, Value Objects, Domain Services       │
│  Strategies, Specifications, Events             │
└────────────────┬────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────┐
│        Infrastructure Layer (Adapters)          │
│  Repositories, AI Clients, Queue, Validators    │
└─────────────────────────────────────────────────┘
```

---

## Phase 1: Domain Layer Foundation (Недели 1-2)

### 1.1 Domain Entities & Value Objects

**Цель**: Создать базовые доменные модели с бизнес-логикой

```
backend/src/domain/
├── entities/
│   ├── diagnostic-session.entity.ts    # Агрегатный корень
│   ├── vehicle.entity.ts               # Сущность автомобиля
│   └── user.entity.ts                  # Сущность пользователя
└── value-objects/
    ├── dtc-code.vo.ts                  # Код ошибки OBD
    ├── diagnostic-metric.vo.ts         # Метрика диагностики
    ├── confidence-score.vo.ts          # Уровень уверенности (0-1)
    └── obd-data.vo.ts                  # Сырые данные OBD
```

**Ключевые принципы**:
- Сущности содержат идентичность и бизнес-логику
- Value Objects иммутабельны и валидируют себя
- Rich Domain Model (поведение, не только данные)
- Доменные инварианты

### 1.2 Domain Events

**Цель**: Событийная модель для связи между компонентами

```
backend/src/domain/events/
├── domain-event.interface.ts
├── event-publisher.interface.ts       # Порт для публикации
├── diagnostic-session-created.event.ts
├── diagnostic-completed.event.ts
├── rule-matched.event.ts
└── analysis-failed.event.ts
```

**Использование**: логирование, аналитика, будущее расширение

### 1.3 Specification Pattern

**Цель**: Композируемые, переиспользуемые условия диагностики

```
backend/src/domain/specifications/
├── specification.interface.ts         # Базовый интерфейс
├── and-specification.ts               # Логическое И
├── or-specification.ts                # Логическое ИЛИ
├── not-specification.ts               # Логическое НЕ
├── metric-threshold.specification.ts  # Порог метрики
├── dtc-present.specification.ts       # Наличие кода ошибки
├── metric-range.specification.ts      # Диапазон значений
└── time-window.specification.ts       # Временное окно
```

**Пример использования**:
```typescript
const overheating = new MetricThresholdSpecification('coolant_temp', 105)
  .and(new DtcPresentSpecification('P0217'))
  .or(new MetricTrendSpecification('coolant_temp', 'increasing'));

if (overheating.isSatisfiedBy(diagnosticData)) {
  // Применить стратегию перегрева
}
```

### 1.4 Strategy Pattern

**Цель**: Инкапсуляция различных диагностических гипотез

```
backend/src/domain/strategies/
├── diagnostic-strategy.interface.ts
├── engine-overheat.strategy.ts        # Перегрев двигателя
├── oxygen-sensor-degradation.strategy.ts  # Деградация кислородного датчика
├── misfire-detection.strategy.ts      # Пропуски зажигания
├── fuel-system-issue.strategy.ts      # Проблемы топливной системы
├── transmission-problem.strategy.ts   # Проблемы трансмиссии
└── strategy-registry.ts               # Регистр стратегий
```

**Интерфейс стратегии**:
```typescript
interface DiagnosticStrategy {
  name: string;
  evaluate(session: DiagnosticSession): StrategyResult;
  getConfidence(): number; // 0-1
  getMatchedRules(): Rule[];
}
```

### 1.5 Domain Services

**Цель**: Операции, которые не принадлежат конкретным сущностям

```
backend/src/domain/services/
├── confidence-calculator.service.ts   # Расчет итоговой уверенности
├── diagnostic-analyzer.service.ts     # Оркестрация анализа
├── rule-evaluator.service.ts          # Оценка правил
└── report-generator.service.ts        # Генерация отчета
```

**Принципы**:
- Чистая доменная логика
- Нет зависимостей на инфраструктуру
- Возвращают доменные модели

---

## Phase 2: Application Layer (Недели 3-4)

### 2.1 Commands (CQRS - Запись)

**Цель**: Операции изменения состояния

```
backend/src/application/
├── commands/
│   ├── upload-diagnostic-data.command.ts
│   ├── create-vehicle.command.ts
│   ├── register-user.command.ts
│   └── retry-analysis.command.ts
└── handlers/
    ├── upload-diagnostic-data.handler.ts
    ├── create-vehicle.handler.ts
    ├── register-user.handler.ts
    └── retry-analysis.handler.ts
```

**Паттерн**:
- Команды - иммутабельные DTO
- Handlers оркеструют доменные операции
- Публикуют события после успеха

### 2.2 Queries (CQRS - Чтение)

**Цель**: Операции только для чтения

```
backend/src/application/
├── queries/
│   ├── get-diagnostic-session.query.ts
│   ├── get-vehicle-history.query.ts
│   ├── get-user-vehicles.query.ts
│   └── search-diagnostics.query.ts
└── handlers/
    ├── get-diagnostic-session.handler.ts
    ├── get-vehicle-history.handler.ts
    ├── get-user-vehicles.handler.ts
    └── search-diagnostics.handler.ts
```

**Принципы**:
- Могут обходить доменный слой
- Возвращают View Models
- Оптимизированы для чтения

### 2.3 DTOs & View Models

**Цель**: Контракт между слоями

```
backend/src/application/
├── dtos/
│   ├── upload-diagnostic-data.dto.ts
│   ├── create-vehicle.dto.ts
│   └── register-user.dto.ts
├── view-models/
│   ├── diagnostic-session.vm.ts
│   ├── vehicle-history.vm.ts
│   └── analysis-result.vm.ts
└── mappers/
    ├── diagnostic-session.mapper.ts
    └── vehicle.mapper.ts
```

### 2.4 Ports (Интерфейсы для Infrastructure)

**Цель**: Dependency Inversion Principle

```
backend/src/application/ports/
├── repositories/
│   ├── diagnostic-session.repository.port.ts
│   ├── vehicle.repository.port.ts
│   └── user.repository.port.ts
├── ai/
│   └── ai-explanation.port.ts
├── queue/
│   └── diagnostic-queue.port.ts
├── storage/
│   └── file-storage.port.ts
└── notification/
    └── notification.port.ts
```

**Ключевой момент**: Domain/Application зависят ТОЛЬКО от портов (интерфейсов), не от реализаций!

---

## Phase 3: Infrastructure Layer (Недели 5-8)

### 3.1 Anti-Corruption Layer (OBD Parsers)

**Цель**: Нормализация и валидация внешних данных OBD

```
backend/src/infrastructure/adapters/obd/
├── obd-parser.interface.ts
├── csv-obd-parser.ts                  # Парсер CSV
├── json-obd-parser.ts                 # Парсер JSON
├── obd-validator.ts                   # Валидация данных
├── obd-normalizer.ts                  # Нормализация единиц
└── dtc-decoder.ts                     # Декодер кодов ошибок
```

**Задачи**:
- Конвертация сырых форматов в доменные модели
- Проверка целостности данных
- Нормализация единиц измерения и таймштампов
- Декодирование DTC кодов в описания

### 3.2 Repository Adapters (Prisma)

**Цель**: Реализация портов репозиториев

```
backend/src/infrastructure/adapters/persistence/
├── prisma.service.ts
├── repositories/
│   ├── diagnostic-session.repository.ts
│   ├── vehicle.repository.ts
│   └── user.repository.ts
└── mappers/
    ├── diagnostic-session-prisma.mapper.ts
    └── vehicle-prisma.mapper.ts
```

**Задачи**:
- Реализация портов из application layer
- Маппинг между Prisma моделями и доменными сущностями
- Транзакции и управление соединениями
- Обработка ошибок и retry логика

### 3.3 AI Adapter (OpenAI)

**Цель**: Абстракция AI провайдера

```
backend/src/infrastructure/adapters/ai/
├── openai-explanation.adapter.ts      # Production
├── mock-explanation.adapter.ts        # Testing/Development
├── ai-prompt-builder.ts               # Построение промптов
├── ai-response-parser.ts              # Парсинг ответов
└── ai-config.ts                       # Конфигурация
```

**Ключевой принцип**: AI можно выключить или заменить без изменения бизнес-логики!

### 3.4 Queue Adapter (BullMQ)

**Цель**: Асинхронная обработка

```
backend/src/infrastructure/adapters/queue/
├── bullmq.service.ts
├── diagnostic-queue.adapter.ts
├── processors/
│   └── diagnostic-processor.ts
└── jobs/
    └── analyze-diagnostic.job.ts
```

**Конфигурация**:
- Retry политики
- Timeout
- Dead Letter Queue
- Progress reporting

### 3.5 Pipeline (Chain of Responsibility)

**Цель**: Оркестрация этапов обработки

```
backend/src/infrastructure/pipeline/
├── pipeline-step.interface.ts
├── validation-step.ts                 # 1. Валидация
├── normalization-step.ts              # 2. Нормализация
├── rule-evaluation-step.ts            # 3. Оценка правил
├── confidence-calculation-step.ts     # 4. Расчет уверенности
├── ai-explanation-step.ts             # 5. AI объяснение
├── report-generation-step.ts          # 6. Генерация отчета
└── diagnostic-pipeline.ts             # Основной pipeline
```

**Преимущества**:
- Каждый шаг независим и тестируем
- Динамическое построение цепочки
- Обработка ошибок на каждом шаге
- Context передается через pipeline

### 3.6 Event Publisher

**Цель**: Инфраструктура для доменных событий

```
backend/src/infrastructure/events/
├── event-publisher.adapter.ts
├── event-handler.registry.ts
└── handlers/
    ├── diagnostic-completed.handler.ts
    └── logging.handler.ts
```

---

## Phase 4: Presentation Layer (Недели 9-10)

### 4.1 REST API Controllers

**Цель**: HTTP endpoints

```
backend/src/presentation/
├── controllers/
│   ├── diagnostics.controller.ts
│   ├── vehicles.controller.ts
│   ├── auth.controller.ts
│   └── users.controller.ts
├── interceptors/
│   ├── logging.interceptor.ts
│   └── transform.interceptor.ts
├── filters/
│   └── http-exception.filter.ts
└── guards/
    ├── jwt-auth.guard.ts
    └── roles.guard.ts
```

**Принципы**:
- Controllers тонкие, делегируют command/query handlers
- Swagger декораторы для документации
- Guards для аутентификации/авторизации
- Exception filters для обработки ошибок

### 4.2 Module Organization

**Цель**: Модульная структура NestJS

```
backend/src/modules/
├── diagnostics/
│   └── diagnostics.module.ts
├── vehicles/
│   └── vehicles.module.ts
├── auth/
│   └── auth.module.ts
├── users/
│   └── users.module.ts
├── shared/
│   └── shared.module.ts
└── config/
    └── config.module.ts
```

### 4.3 Configuration

**Цель**: Конфигурация приложения

```
backend/src/config/
├── app.config.ts
├── database.config.ts
├── redis.config.ts
├── ai.config.ts
└── jwt.config.ts
```

---

## Phase 5: Frontend (Недели 11-14)

### 5.1 Layout & Navigation

```
frontend/src/
├── app/
│   ├── layout.tsx                     # Root layout
│   └── page.tsx                       # Home page
└── components/
    └── layout/
        ├── header.tsx
        ├── sidebar.tsx
        └── footer.tsx
```

### 5.2 Authentication

```
frontend/src/
├── app/auth/
│   ├── login/page.tsx
│   └── register/page.tsx
└── lib/auth/
    ├── auth-context.tsx
    ├── auth-provider.tsx
    ├── use-auth.hook.ts
    └── protected-route.tsx
```

### 5.3 API Client (TanStack Query)

```
frontend/src/lib/
├── api/
│   ├── api-client.ts
│   ├── diagnostics-api.ts
│   ├── vehicles-api.ts
│   └── auth-api.ts
├── hooks/
│   ├── use-diagnostics.ts
│   └── use-vehicles.ts
└── react-query/
    └── query-client.ts
```

### 5.4 Vehicle Management

```
frontend/src/
├── app/vehicles/
│   ├── page.tsx                       # Список
│   ├── [id]/page.tsx                  # Детали
│   └── new/page.tsx                   # Создание
└── components/vehicles/
    ├── vehicle-list.tsx
    ├── vehicle-card.tsx
    └── vehicle-form.tsx
```

### 5.5 Diagnostic Upload & Results

```
frontend/src/
├── app/diagnostics/
│   ├── upload/page.tsx
│   └── [id]/page.tsx
└── components/diagnostics/
    ├── file-upload.tsx                # Drag & Drop
    ├── upload-form.tsx
    ├── analysis-status.tsx            # Progress
    ├── analysis-result.tsx
    ├── report-summary.tsx
    ├── dtc-list.tsx                   # Коды ошибок
    ├── metric-chart.tsx               # Recharts
    ├── confidence-indicator.tsx
    └── ai-explanation.tsx
```

### 5.6 UI Components (shadcn/ui)

```
frontend/src/components/ui/
├── button.tsx
├── card.tsx
├── input.tsx
├── select.tsx
├── dialog.tsx
├── badge.tsx
├── alert.tsx
└── spinner.tsx
```

---

## Phase 6: Testing (Недели 15-16)

### Backend Tests

```
backend/src/
├── domain/entities/__tests__/
├── domain/specifications/__tests__/
├── domain/strategies/__tests__/
├── application/handlers/__tests__/
├── infrastructure/adapters/__tests__/
└── presentation/controllers/__tests__/

backend/test/
└── e2e/
    ├── diagnostics.e2e-spec.ts
    └── auth.e2e-spec.ts
```

### Frontend Tests

```
frontend/src/
├── components/__tests__/
├── lib/hooks/__tests__/
└── lib/validators/__tests__/
```

### E2E Tests

```
e2e/tests/
├── diagnostic-upload.spec.ts
├── vehicle-management.spec.ts
└── authentication.spec.ts
```

**Test Pyramid**:
- 70% Unit Tests
- 20% Integration Tests
- 10% E2E Tests

---

## Phase 7: DevOps (Недели 17-18)

### CI/CD

```
.github/workflows/
├── backend-ci.yml                     # Lint, Test, Build
├── frontend-ci.yml
├── deploy-backend.yml
└── deploy-frontend.yml
```

### Docker Production

```
/docker-compose.prod.yml
/backend/Dockerfile
/frontend/Dockerfile
/nginx/nginx.conf
```

### Monitoring

```
backend/src/infrastructure/
├── logging/
│   ├── logger.service.ts
│   └── log-context.ts
└── monitoring/
    ├── metrics.service.ts
    └── health.controller.ts
```

---

## Последовательность реализации

### ✅ Недели 1-2: Domain Layer
- Начать с Value Objects и Entities
- Реализовать Specifications
- Построить Diagnostic Strategies
- Создать Domain Services
- **Нет внешних зависимостей!**

### ✅ Недели 3-4: Application Layer
- Определить Ports (интерфейсы)
- Реализовать Commands и Queries
- Создать Handlers и DTOs
- Unit тесты для handlers

### ✅ Недели 5-6: Infrastructure (Часть 1)
- Prisma repositories
- Anti-corruption layer (OBD parsers)
- Event publisher
- Integration тесты

### ✅ Недели 7-8: Infrastructure (Часть 2)
- BullMQ queue adapter
- Pipeline реализация
- AI adapter (OpenAI)
- Mock adapters для тестирования

### ✅ Недели 9-10: Backend API
- NestJS controllers
- Организация модулей
- Guards и interceptors
- Swagger документация

### ✅ Недели 11-12: Frontend (Часть 1)
- Authentication flow
- API client setup
- Vehicle management
- Layout и navigation

### ✅ Недели 13-14: Frontend (Часть 2)
- Diagnostic upload
- Визуализация результатов
- Charts и metrics
- AI explanation display

### ✅ Недели 15-16: Testing
- E2E tests
- Performance optimization
- Error handling
- Документация

### ✅ Недели 17-18: DevOps
- CI/CD pipelines
- Docker production
- Monitoring и logging
- Production deployment

---

## Ключевые архитектурные решения

### 1. Hexagonal Architecture Границы

```
Domain Layer
  ↓ зависит от
Application Layer (через Ports)
  ↑ реализуют
Infrastructure Layer
  ↑ использует
Presentation Layer
```

**Правило**: Domain НЕ знает о Infrastructure!

### 2. Strategy Pattern

Каждая стратегия:
- Инкапсулирует одну гипотезу
- Возвращает confidence score (0-1)
- Использует Specifications для условий
- Регистрируется в StrategyRegistry
- Выбирается на основе симптомов/DTC кодов

### 3. Specification Pattern

```typescript
// Пример композиции
const overheating = new MetricThresholdSpecification('coolant_temp', 105)
  .and(new DtcPresentSpecification('P0217'))
  .or(new MetricTrendSpecification('coolant_temp', 'increasing'));

if (overheating.isSatisfiedBy(diagnosticData)) {
  return new EngineOverheatStrategy().evaluate(session);
}
```

### 4. Pipeline Architecture

```
Upload OBD Data
  ↓
Validation (Anti-Corruption Layer)
  ↓
Normalization
  ↓
Async Processing (BullMQ)
  ↓
Rule Evaluation (Specifications + Strategies)
  ↓
Confidence Calculation
  ↓
AI Explanation (Optional, Adapter Pattern)
  ↓
Report Generation
```

### 5. AI Integration

```typescript
interface AiExplanationPort {
  explain(context: DiagnosticContext): Promise<Explanation>;
}

// Production
class OpenAiExplanationAdapter implements AiExplanationPort { ... }

// Testing
class MockExplanationAdapter implements AiExplanationPort { ... }

// Offline
class DisabledExplanationAdapter implements AiExplanationPort { ... }
```

**Принцип**: Система работает БЕЗ AI! AI только объясняет.

---

## Точки расширения

### Добавить новую Diagnostic Strategy
1. Создать класс, реализующий `DiagnosticStrategy`
2. Зарегистрировать в `StrategyRegistry`
3. Добавить Specifications для условий
4. Написать unit тесты
5. Deploy (без изменения существующего кода!)

### Добавить новый источник OBD данных
1. Создать parser, реализующий `ObdParser`
2. Добавить в parser factory
3. Обновить validation
4. Deploy

### Сменить AI провайдера
1. Реализовать `AiExplanationPort`
2. Обновить конфигурацию
3. Deploy (без изменения application кода!)

---

## Риски и митигация

### Технические риски

**Риск**: Сбои AI API
- **Митигация**: Adapter pattern с fallback на mock/offline режим
- **Стратегия**: Circuit breaker, graceful degradation

**Риск**: Сбои очереди
- **Митигация**: Dead letter queue, retry policies, мониторинг
- **Стратегия**: Job idempotency, timeout handling

**Риск**: Производительность БД
- **Митигация**: Индексы, оптимизация запросов, пагинация
- **Стратегия**: Read replicas для масштабирования

### Архитектурные риски

**Риск**: Over-engineering для MVP
- **Митигация**: Инкрементальная реализация, валидация с пользователями
- **Стратегия**: Начать с core features, отложить сложные стратегии

**Риск**: Нарушение границ слоев
- **Митигация**: Строгие правила зависимостей, architecture тесты
- **Стратегия**: Code review, ArchUnit тесты

---

## Production Readiness Checklist

### Security ✓
- [ ] JWT authentication с refresh tokens
- [ ] Password hashing (bcrypt)
- [ ] Input validation (class-validator, Zod)
- [ ] Rate limiting
- [ ] CORS configuration
- [ ] SQL injection prevention (Prisma)
- [ ] XSS prevention
- [ ] File upload size limits

### Performance ✓
- [ ] Database indexes
- [ ] Query optimization
- [ ] Caching (Redis)
- [ ] API pagination
- [ ] Background jobs (BullMQ)
- [ ] Image optimization

### Observability ✓
- [ ] Structured logging (Winston)
- [ ] Error tracking
- [ ] Health checks
- [ ] Metrics collection
- [ ] Request tracing

### Deployment ✓
- [ ] Docker multi-stage builds
- [ ] CI/CD pipelines
- [ ] Database migrations
- [ ] Environment variables
- [ ] Zero-downtime deployment
- [ ] Rollback strategy

---

## Критически важные файлы для старта

### Backend Foundation (начать с этих файлов)

1. **Domain Layer**
   - `/backend/src/domain/entities/diagnostic-session.entity.ts` (агрегатный корень)
   - `/backend/src/domain/specifications/specification.interface.ts` (основа для правил)
   - `/backend/src/domain/strategies/diagnostic-strategy.interface.ts` (основа для стратегий)

2. **Application Layer**
   - `/backend/src/application/ports/repositories/diagnostic-session.repository.port.ts` (DIP)

3. **Infrastructure Layer**
   - `/backend/src/infrastructure/pipeline/diagnostic-pipeline.ts` (оркестрация)

Эти файлы устанавливают архитектурный фундамент проекта!

---

## Примерная оценка времени

- **MVP (Core Features)**: 8-10 недель
- **Production Ready**: 16-18 недель
- **С полировкой и оптимизацией**: 20+ недель

**Рекомендация**: Начать с Domain Layer и двигаться наружу (inside-out approach).
