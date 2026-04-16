import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ITokenGenerator } from '../interfaces/token-generator.interface';

// Single Responsibility Principle - только генерация токенов
@Injectable()
export class TokenService implements ITokenGenerator {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  generateAccessToken(payload: { sub: string; email: string; role: string }): string {
    return this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_SECRET'),
      expiresIn: '15m', // Short-lived access token
    });
  }

  generateRefreshToken(payload: { sub: string; email: string }): string {
    return this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: '7d', // Long-lived refresh token
    });
  }

  verifyToken(token: string, isRefresh = false): any {
    const secret = isRefresh
      ? this.configService.get('JWT_REFRESH_SECRET')
      : this.configService.get('JWT_SECRET');

    return this.jwtService.verify(token, { secret });
  }

  generateRandomToken(): string {
    return require('crypto').randomBytes(32).toString('hex');
  }
}
