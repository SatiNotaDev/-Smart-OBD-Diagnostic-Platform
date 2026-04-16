import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PasswordHasherService } from './services/password-hasher.service';
import { TokenService } from './services/token.service';
import { MfaService } from './services/mfa.service';
import { EmailService } from './services/email.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: {
          expiresIn: '15m',
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    PasswordHasherService,
    TokenService,
    MfaService,
    EmailService,
    JwtStrategy,
    JwtRefreshStrategy,
    // GoogleStrategy conditionally loaded
    {
      provide: GoogleStrategy,
      useFactory: (configService: ConfigService) => {
        const clientID = configService.get('GOOGLE_CLIENT_ID');
        const clientSecret = configService.get('GOOGLE_CLIENT_SECRET');

        if (!clientID || !clientSecret) {
          console.warn('⚠️  Google OAuth credentials not found. Skipping GoogleStrategy.');
          return null;
        }

        return new GoogleStrategy(configService);
      },
      inject: [ConfigService],
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard, // Глобальный guard - все routes защищены по умолчанию
    },
  ],
  exports: [AuthService, TokenService],
})
export class AuthModule {}
