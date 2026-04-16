import { Injectable } from '@nestjs/common';
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';
import * as crypto from 'crypto';

// Single Responsibility Principle - только MFA логика
@Injectable()
export class MfaService {
  /**
   * Генерирует MFA секрет для пользователя
   */
  generateSecret(userEmail: string): { secret: string; qrCodeUrl: string } {
    const secret = speakeasy.generateSecret({
      name: `Smart OBD (${userEmail})`,
      issuer: 'Smart OBD Platform',
    });

    return {
      secret: secret.base32,
      qrCodeUrl: secret.otpauth_url,
    };
  }

  /**
   * Генерирует QR код для MFA setup
   */
  async generateQRCode(otpauthUrl: string): Promise<string> {
    return QRCode.toDataURL(otpauthUrl);
  }

  /**
   * Проверяет MFA код
   */
  verifyToken(secret: string, token: string): boolean {
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 2, // Allow 2 steps (60 seconds) tolerance
    });
  }

  /**
   * Генерирует backup коды
   */
  generateBackupCodes(count: number = 10): string[] {
    const codes: string[] = [];
    for (let i = 0; i < count; i++) {
      codes.push(crypto.randomBytes(4).toString('hex').toUpperCase());
    }
    return codes;
  }

  /**
   * Хеширует backup коды для безопасного хранения
   */
  async hashBackupCodes(codes: string[]): Promise<string[]> {
    const bcrypt = require('bcrypt');
    return Promise.all(codes.map((code) => bcrypt.hash(code, 10)));
  }

  /**
   * Проверяет backup код
   */
  async verifyBackupCode(code: string, hashedCodes: string[]): Promise<boolean> {
    const bcrypt = require('bcrypt');
    for (const hashedCode of hashedCodes) {
      if (await bcrypt.compare(code, hashedCode)) {
        return true;
      }
    }
    return false;
  }
}
