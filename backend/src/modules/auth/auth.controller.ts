import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Req,
  Res,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyMfaDto } from './dto/verify-mfa.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { Public } from './decorators/public.decorator';
import { CurrentUser } from './decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * POST /auth/register
   * Регистрация нового пользователя
   */
  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  /**
   * POST /auth/login
   * Вход пользователя
   */
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) response: Response) {
    const result = await this.authService.login(dto);

    // Если требуется MFA
    if ('requiresMfa' in result) {
      return result;
    }

    // Установить httpOnly cookies для токенов
    this.setAuthCookies(response, result.accessToken, result.refreshToken);

    return result;
  }

  /**
   * POST /auth/refresh
   * Обновление access token через refresh token
   */
  @Public()
  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
    const refreshToken = request.get('Authorization')?.replace('Bearer', '').trim();
    const result = await this.authService.refreshToken(refreshToken);

    this.setAuthCookies(response, result.accessToken, result.refreshToken);

    return result;
  }

  /**
   * POST /auth/logout
   * Выход пользователя
   */
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@CurrentUser('id') userId: string, @Res({ passthrough: true }) response: Response) {
    await this.authService.logout(userId);

    // Удалить cookies
    response.clearCookie('accessToken');
    response.clearCookie('refreshToken');

    return { message: 'Logged out successfully' };
  }

  /**
   * GET /auth/me
   * Получить текущего пользователя
   */
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getCurrentUser(@CurrentUser() user: any) {
    return user;
  }

  /**
   * GET /auth/verify-email
   * Верификация email по токену
   */
  @Public()
  @Get('verify-email')
  async verifyEmail(@Query('token') token: string) {
    return this.authService.verifyEmail(token);
  }

  /**
   * POST /auth/forgot-password
   * Отправка email для сброса пароля
   */
  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
  }

  /**
   * POST /auth/reset-password
   * Сброс пароля
   */
  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.token, dto.newPassword);
  }

  /**
   * POST /auth/mfa/setup
   * Начало настройки MFA
   */
  @UseGuards(JwtAuthGuard)
  @Post('mfa/setup')
  async setupMfa(@CurrentUser('id') userId: string) {
    return this.authService.setupMfa(userId);
  }

  /**
   * POST /auth/mfa/verify
   * Подтверждение и активация MFA
   */
  @UseGuards(JwtAuthGuard)
  @Post('mfa/verify')
  @HttpCode(HttpStatus.OK)
  async verifyMfa(@CurrentUser('id') userId: string, @Body() dto: VerifyMfaDto) {
    return this.authService.verifyAndEnableMfa(userId, dto.code);
  }

  /**
   * POST /auth/mfa/disable
   * Отключение MFA
   */
  @UseGuards(JwtAuthGuard)
  @Post('mfa/disable')
  @HttpCode(HttpStatus.OK)
  async disableMfa(@CurrentUser('id') userId: string, @Body() dto: VerifyMfaDto) {
    return this.authService.disableMfa(userId, dto.code);
  }

  /**
   * GET /auth/google
   * Инициация Google OAuth
   */
  @Public()
  @UseGuards(GoogleAuthGuard)
  @Get('google')
  async googleAuth() {
    // Guard автоматически редиректит на Google
  }

  /**
   * GET /auth/google/callback
   * Callback после Google OAuth
   */
  @Public()
  @UseGuards(GoogleAuthGuard)
  @Get('google/callback')
  async googleAuthCallback(@Req() request: Request, @Res() response: Response) {
    const result = await this.authService.googleLogin(request.user);

    this.setAuthCookies(response, result.accessToken, result.refreshToken);

    // Редирект на frontend dashboard
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
    response.redirect(`${frontendUrl}/dashboard?auth=success`);
  }

  /**
   * Вспомогательный метод - установка auth cookies
   */
  private setAuthCookies(response: Response, accessToken: string, refreshToken: string) {
    response.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    response.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  }
}
