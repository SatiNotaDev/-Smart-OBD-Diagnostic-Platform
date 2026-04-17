import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PasswordHasherService } from './services/password-hasher.service';
import { TokenService } from './services/token.service';
import { MfaService } from './services/mfa.service';
import { EmailService } from './services/email.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto, MfaSetupResponseDto } from './dto/auth-response.dto';

/**
 * Auth Service - оркестрирует authentication логику
 * Dependency Inversion Principle - зависит от абстракций (интерфейсов)
 * Single Responsibility - координация auth flow
 */
@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly passwordHasher: PasswordHasherService,
    private readonly tokenService: TokenService,
    private readonly mfaService: MfaService,
    private readonly emailService: EmailService,
  ) {}

  /**
   * Регистрация нового пользователя
   */
  async register(dto: RegisterDto): Promise<{ message: string }> {
    // Проверка существующего пользователя
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Хеширование пароля
    const hashedPassword = await this.passwordHasher.hash(dto.password);

    // Генерация email verification token
    const emailVerifyToken = this.tokenService.generateRandomToken();
    const emailVerifyExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Создание пользователя
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        name: dto.name,
        preferredLanguage: dto.preferredLanguage || 'en',
        emailVerifyToken,
        emailVerifyExpiry,
      },
    });

    // Отправка verification email
    await this.emailService.sendVerificationEmail(user.email, emailVerifyToken);

    return {
      message: 'Registration successful. Please check your email to verify your account.',
    };
  }

  /**
   * Вход пользователя
   */
  async login(dto: LoginDto): Promise<AuthResponseDto | { requiresMfa: boolean }> {
    // Поиск пользователя
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Проверка пароля
    const isPasswordValid = await this.passwordHasher.compare(dto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Проверка email verification
    if (!user.isEmailVerified) {
      throw new UnauthorizedException('Please verify your email before logging in');
    }

    // Проверка MFA
    if (user.mfaEnabled) {
      if (!dto.mfaCode) {
        return { requiresMfa: true };
      }

      const isMfaValid = this.mfaService.verifyToken(user.mfaSecret, dto.mfaCode);

      if (!isMfaValid) {
        // Проверить backup код
        const isBackupCodeValid = await this.mfaService.verifyBackupCode(
          dto.mfaCode,
          user.mfaBackupCodes,
        );

        if (!isBackupCodeValid) {
          throw new UnauthorizedException('Invalid MFA code');
        }

        // Удалить использованный backup код
        await this.removeUsedBackupCode(user.id, dto.mfaCode);
      }
    }

    // Генерация токенов
    return this.generateAuthResponse(user);
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<AuthResponseDto> {
    try {
      const payload = this.tokenService.verifyToken(refreshToken, true);

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user || user.refreshToken !== refreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      return this.generateAuthResponse(user);
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  /**
   * Верификация email
   */
  async verifyEmail(token: string): Promise<{ message: string }> {
    const user = await this.prisma.user.findFirst({
      where: {
        emailVerifyToken: token,
        emailVerifyExpiry: { gt: new Date() },
      },
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired verification token');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified: true,
        emailVerifyToken: null,
        emailVerifyExpiry: null,
      },
    });

    await this.emailService.sendWelcomeEmail(user.email, user.name || 'User');

    return { message: 'Email verified successfully' };
  }

  /**
   * Forgot password - отправка reset email
   */
  async forgotPassword(email: string): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      // Не раскрываем существование пользователя
      return { message: 'If the email exists, a password reset link has been sent' };
    }

    const resetToken = this.tokenService.generateRandomToken();
    const resetExpiry = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: resetToken,
        resetPasswordExpiry: resetExpiry,
      },
    });

    await this.emailService.sendPasswordResetEmail(user.email, resetToken);

    return { message: 'If the email exists, a password reset link has been sent' };
  }

  /**
   * Reset password
   */
  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    const user = await this.prisma.user.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordExpiry: { gt: new Date() },
      },
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const hashedPassword = await this.passwordHasher.hash(newPassword);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpiry: null,
        refreshToken: null, // Invalidate all sessions
      },
    });

    return { message: 'Password reset successfully' };
  }

  /**
   * Setup MFA для пользователя
   */
  async setupMfa(userId: string): Promise<MfaSetupResponseDto> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.mfaEnabled) {
      throw new BadRequestException('MFA is already enabled');
    }

    const { secret, qrCodeUrl } = this.mfaService.generateSecret(user.email);
    const backupCodes = this.mfaService.generateBackupCodes();
    const hashedBackupCodes = await this.mfaService.hashBackupCodes(backupCodes);

    // Сохраняем секрет (но еще не активируем MFA)
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        mfaSecret: secret,
        mfaBackupCodes: hashedBackupCodes,
      },
    });

    const qrCode = await this.mfaService.generateQRCode(qrCodeUrl);

    return {
      secret,
      qrCodeUrl: qrCode,
      backupCodes, // Возвращаем НЕ хешированные коды для показа пользователю
    };
  }

  /**
   * Подтверждение и активация MFA
   */
  async verifyAndEnableMfa(userId: string, code: string): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user || !user.mfaSecret) {
      throw new BadRequestException('MFA setup not initiated');
    }

    const isValid = this.mfaService.verifyToken(user.mfaSecret, code);

    if (!isValid) {
      throw new BadRequestException('Invalid MFA code');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { mfaEnabled: true },
    });

    return { message: 'MFA enabled successfully' };
  }

  /**
   * Отключение MFA
   */
  async disableMfa(userId: string, code: string): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user || !user.mfaEnabled) {
      throw new BadRequestException('MFA is not enabled');
    }

    const isValid = this.mfaService.verifyToken(user.mfaSecret, code);

    if (!isValid) {
      throw new BadRequestException('Invalid MFA code');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        mfaEnabled: false,
        mfaSecret: null,
        mfaBackupCodes: [],
      },
    });

    return { message: 'MFA disabled successfully' };
  }

  /**
   * Google OAuth login
   */
  async googleLogin(profile: any): Promise<AuthResponseDto> {
    let user = await this.prisma.user.findUnique({
      where: { googleId: profile.id },
    });

    if (!user) {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: profile.email },
      });

      if (existingUser && existingUser.password) {
        // Password-protected account exists — refuse auto-link to prevent account takeover
        throw new UnauthorizedException(
          'An account with this email already exists. Please log in with your password first, then link Google in settings.',
        );
      }

      if (existingUser) {
        // OAuth-only account without password — safe to link
        user = await this.prisma.user.update({
          where: { id: existingUser.id },
          data: {
            googleId: profile.id,
            isEmailVerified: true,
          },
        });
      } else {
        user = await this.prisma.user.create({
          data: {
            email: profile.email,
            googleId: profile.id,
            name: profile.displayName,
            avatar: profile.photos?.[0]?.value,
            isEmailVerified: true,
          },
        });
      }
    }

    return this.generateAuthResponse(user);
  }

  /**
   * Logout
   */
  async logout(userId: string): Promise<{ message: string }> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });

    return { message: 'Logged out successfully' };
  }

  /**
   * Вспомогательный метод - генерация auth response
   */
  private async generateAuthResponse(user: any): Promise<AuthResponseDto> {
    const payload = { sub: user.id, email: user.email, role: user.role };

    const accessToken = this.tokenService.generateAccessToken(payload);
    const refreshToken = this.tokenService.generateRefreshToken({ sub: user.id, email: user.email });

    // Сохранить refresh token
    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        mfaEnabled: user.mfaEnabled,
        preferredLanguage: user.preferredLanguage,
        theme: user.theme,
      },
    };
  }

  /**
   * Удалить использованный backup код
   */
  private async removeUsedBackupCode(userId: string, usedCode: string): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    const updatedCodes = [];
    for (const hashedCode of user.mfaBackupCodes) {
      const bcrypt = require('bcrypt');
      if (!(await bcrypt.compare(usedCode, hashedCode))) {
        updatedCodes.push(hashedCode);
      }
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { mfaBackupCodes: updatedCodes },
    });
  }
}
