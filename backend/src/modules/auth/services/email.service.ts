import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

// Single Responsibility Principle - только отправка email
@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(private readonly configService: ConfigService) {}

  /**
   * Отправляет email верификации
   */
  async sendVerificationEmail(email: string, token: string): Promise<void> {
    const verificationUrl = `${this.configService.get('FRONTEND_URL')}/auth/verify-email?token=${token}`;

    // TODO: Интеграция с email провайдером (SendGrid, AWS SES, etc.)
    // Для dev окружения просто логируем
    this.logger.log(`
      📧 Email Verification
      To: ${email}
      URL: ${verificationUrl}
    `);

    // В production использовать:
    // await this.emailProvider.send({
    //   to: email,
    //   subject: 'Verify your email',
    //   template: 'verify-email',
    //   context: { verificationUrl },
    // });
  }

  /**
   * Отправляет email для сброса пароля
   */
  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    const resetUrl = `${this.configService.get('FRONTEND_URL')}/auth/reset-password?token=${token}`;

    this.logger.log(`
      📧 Password Reset
      To: ${email}
      URL: ${resetUrl}
    `);

    // В production использовать email провайдер
  }

  /**
   * Отправляет welcome email после регистрации
   */
  async sendWelcomeEmail(email: string, name: string): Promise<void> {
    this.logger.log(`
      📧 Welcome Email
      To: ${email}
      Name: ${name}
    `);
  }
}
