import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './modules/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { VehiclesModule } from './modules/vehicles/vehicles.module';
import { NotesModule } from './modules/notes/notes.module';
import { DiagnosticsModule } from './modules/diagnostics/diagnostics.module';
import { AiChatModule } from './modules/ai-chat/ai-chat.module';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';
import { RemindersModule } from './modules/reminders/reminders.module';
import { AdminModule } from './modules/admin/admin.module';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { SecurityMiddleware } from './common/middleware/security.middleware';

@Module({
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
  imports: [
    // Config Module - загрузка environment variables
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    // Rate limiting
    ThrottlerModule.forRoot([
      { name: 'short', ttl: 1000, limit: 10 },
      { name: 'medium', ttl: 60000, limit: 100 },
    ]),
    // Prisma Module - database
    PrismaModule,
    // Auth Module
    AuthModule,
    // Vehicles Module
    VehiclesModule,
    // Notes Module
    NotesModule,
    // Diagnostics Module
    DiagnosticsModule,
    // AI Chat Module
    AiChatModule,
    // Subscriptions Module
    SubscriptionsModule,
    // Reminders Module
    RemindersModule,
    // Admin Module
    AdminModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply middleware to all routes
    consumer.apply(SecurityMiddleware, LoggerMiddleware).forRoutes('*');
  }
}
