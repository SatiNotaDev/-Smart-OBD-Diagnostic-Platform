import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly resend: Resend | null;
  private readonly fromEmail: string;
  private readonly frontendUrl: string;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    this.resend = apiKey ? new Resend(apiKey) : null;
    this.fromEmail = this.configService.get<string>('EMAIL_FROM') || 'Smart OBD <noreply@smartobd.com>';
    this.frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3001';

    if (!this.resend) {
      this.logger.warn('RESEND_API_KEY not set — emails will be logged to console');
    }
  }

  async sendVerificationEmail(email: string, token: string): Promise<void> {
    const verificationUrl = `${this.frontendUrl}/verify-email?token=${token}`;

    const subject = 'Verify your email — Smart OBD';
    const html = `
      <div style="font-family: -apple-system, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
        <h2 style="color: #007BC0; margin-bottom: 16px;">Verify Your Email</h2>
        <p>Click the button below to verify your email address and activate your account.</p>
        <a href="${verificationUrl}" style="display: inline-block; background: #007BC0; color: #fff; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin: 16px 0;">Verify Email</a>
        <p style="color: #666; font-size: 14px;">If you didn't create an account, you can ignore this email.</p>
        <p style="color: #666; font-size: 12px;">Link: ${verificationUrl}</p>
      </div>
    `;

    await this.send(email, subject, html);
  }

  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    const resetUrl = `${this.frontendUrl}/reset-password?token=${token}`;

    const subject = 'Reset your password — Smart OBD';
    const html = `
      <div style="font-family: -apple-system, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
        <h2 style="color: #007BC0; margin-bottom: 16px;">Reset Password</h2>
        <p>You requested a password reset. Click the button below to set a new password.</p>
        <a href="${resetUrl}" style="display: inline-block; background: #007BC0; color: #fff; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin: 16px 0;">Reset Password</a>
        <p style="color: #666; font-size: 14px;">This link expires in 1 hour. If you didn't request this, ignore this email.</p>
        <p style="color: #666; font-size: 12px;">Link: ${resetUrl}</p>
      </div>
    `;

    await this.send(email, subject, html);
  }

  async sendWelcomeEmail(email: string, name: string): Promise<void> {
    const subject = 'Welcome to Smart OBD!';
    const html = `
      <div style="font-family: -apple-system, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
        <h2 style="color: #007BC0; margin-bottom: 16px;">Welcome, ${name}!</h2>
        <p>Your email has been verified. You're all set to start using Smart OBD Diagnostic Platform.</p>
        <a href="${this.frontendUrl}/vehicles" style="display: inline-block; background: #007BC0; color: #fff; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin: 16px 0;">Go to Dashboard</a>
        <p style="color: #666; font-size: 14px;">Add your first vehicle and run a diagnostic scan.</p>
      </div>
    `;

    await this.send(email, subject, html);
  }

  private async send(to: string, subject: string, html: string): Promise<void> {
    if (!this.resend) {
      this.logger.log(`📧 [DEV] ${subject} → ${to}`);
      this.logger.debug(html);
      return;
    }

    try {
      await this.resend.emails.send({
        from: this.fromEmail,
        to,
        subject,
        html,
      });
      this.logger.log(`Email sent: ${subject} → ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}: ${error.message}`);
    }
  }
}
