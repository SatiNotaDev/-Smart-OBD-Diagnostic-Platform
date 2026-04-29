import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './modules/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { VehiclesModule } from './modules/vehicles/vehicles.module';
import { NotesModule } from './modules/notes/notes.module';
import { DiagnosticsModule } from './modules/diagnostics/diagnostics.module';
import { AiChatModule } from './modules/ai-chat/ai-chat.module';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { SecurityMiddleware } from './common/middleware/security.middleware';

@Module({
  imports: [
    // Config Module - загрузка environment variables
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
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
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply middleware to all routes
    consumer.apply(SecurityMiddleware, LoggerMiddleware).forRoutes('*');
  }
}
