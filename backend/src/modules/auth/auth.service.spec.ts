import { UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';

function createMocks() {
  const mockUser = {
    id: 'u1',
    email: 'test@test.com',
    password: '$2b$12$hashedpassword',
    name: 'Test User',
    role: 'USER',
    isEmailVerified: true,
    mfaEnabled: false,
    mfaSecret: null,
    mfaBackupCodes: [],
    refreshToken: null,
    avatar: null,
    preferredLanguage: 'en',
    theme: 'dark',
    googleId: null,
  };

  const prisma = {
    user: {
      findUnique: jest.fn().mockResolvedValue(mockUser),
      findFirst: jest.fn().mockResolvedValue(mockUser),
      create: jest.fn().mockResolvedValue(mockUser),
      update: jest.fn().mockResolvedValue(mockUser),
    },
  } as any;

  const passwordHasher = {
    hash: jest.fn().mockResolvedValue('$hashed$'),
    compare: jest.fn().mockResolvedValue(true),
  } as any;

  const tokenService = {
    generateAccessToken: jest.fn().mockReturnValue('access-token'),
    generateRefreshToken: jest.fn().mockReturnValue('refresh-token'),
    verifyToken: jest.fn().mockReturnValue({ sub: 'u1', email: 'test@test.com' }),
    generateRandomToken: jest.fn().mockReturnValue('random-token-hex'),
  } as any;

  const mfaService = {
    verifyToken: jest.fn().mockReturnValue(true),
    verifyBackupCode: jest.fn().mockResolvedValue(false),
  } as any;

  const emailService = {
    sendVerificationEmail: jest.fn().mockResolvedValue(undefined),
    sendWelcomeEmail: jest.fn().mockResolvedValue(undefined),
    sendPasswordResetEmail: jest.fn().mockResolvedValue(undefined),
  } as any;

  return { mockUser, prisma, passwordHasher, tokenService, mfaService, emailService };
}

describe('AuthService', () => {
  let service: AuthService;
  let mocks: ReturnType<typeof createMocks>;

  beforeEach(() => {
    mocks = createMocks();
    service = new AuthService(
      mocks.prisma,
      mocks.passwordHasher,
      mocks.tokenService,
      mocks.mfaService,
      mocks.emailService,
    );
  });

  describe('register', () => {
    it('should register a new user', async () => {
      mocks.prisma.user.findUnique.mockResolvedValueOnce(null);
      const result = await service.register({
        email: 'new@test.com',
        password: 'Test@1234',
        name: 'New',
      });
      expect(result.message).toContain('Registration successful');
      expect(mocks.prisma.user.create).toHaveBeenCalled();
      expect(mocks.emailService.sendVerificationEmail).toHaveBeenCalled();
    });

    it('should throw ConflictException if email exists', async () => {
      await expect(
        service.register({ email: 'test@test.com', password: 'Test@1234' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('should return tokens on valid credentials', async () => {
      const result = await service.login({ email: 'test@test.com', password: 'Test@1234' });
      expect(result).toHaveProperty('accessToken', 'access-token');
      expect(result).toHaveProperty('refreshToken', 'refresh-token');
    });

    it('should throw on wrong password', async () => {
      mocks.passwordHasher.compare.mockResolvedValueOnce(false);
      await expect(
        service.login({ email: 'test@test.com', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw if email not verified', async () => {
      mocks.prisma.user.findUnique.mockResolvedValueOnce({
        ...mocks.mockUser,
        isEmailVerified: false,
      });
      await expect(
        service.login({ email: 'test@test.com', password: 'Test@1234' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should return requiresMfa when MFA enabled but no code', async () => {
      mocks.prisma.user.findUnique.mockResolvedValueOnce({
        ...mocks.mockUser,
        mfaEnabled: true,
      });
      const result = await service.login({ email: 'test@test.com', password: 'Test@1234' });
      expect(result).toEqual({ requiresMfa: true });
    });
  });

  describe('refreshToken', () => {
    it('should return new tokens for valid refresh token', async () => {
      mocks.prisma.user.findUnique.mockResolvedValueOnce({
        ...mocks.mockUser,
        refreshToken: 'valid-refresh',
      });
      const result = await service.refreshToken('valid-refresh');
      expect(result).toHaveProperty('accessToken');
    });

    it('should throw if refresh token does not match', async () => {
      mocks.prisma.user.findUnique.mockResolvedValueOnce({
        ...mocks.mockUser,
        refreshToken: 'stored-token',
      });
      await expect(service.refreshToken('different-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('verifyEmail', () => {
    it('should verify email with valid token', async () => {
      const result = await service.verifyEmail('random-token-hex');
      expect(result.message).toContain('verified');
      expect(mocks.prisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ isEmailVerified: true }),
        }),
      );
    });

    it('should throw on invalid token', async () => {
      mocks.prisma.user.findFirst.mockResolvedValueOnce(null);
      await expect(service.verifyEmail('bad-token')).rejects.toThrow(BadRequestException);
    });
  });

  describe('forgotPassword', () => {
    it('should send reset email for existing user', async () => {
      const result = await service.forgotPassword('test@test.com');
      expect(result.message).toContain('reset link');
      expect(mocks.emailService.sendPasswordResetEmail).toHaveBeenCalled();
    });

    it('should return same message for non-existing user', async () => {
      mocks.prisma.user.findUnique.mockResolvedValueOnce(null);
      const result = await service.forgotPassword('nobody@test.com');
      expect(result.message).toContain('reset link');
      expect(mocks.emailService.sendPasswordResetEmail).not.toHaveBeenCalled();
    });
  });

  describe('resetPassword', () => {
    it('should reset password and invalidate sessions', async () => {
      await service.resetPassword('valid-token', 'NewPass@1234');
      expect(mocks.prisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            refreshToken: null,
            resetPasswordToken: null,
          }),
        }),
      );
    });

    it('should throw on invalid/expired token', async () => {
      mocks.prisma.user.findFirst.mockResolvedValueOnce(null);
      await expect(service.resetPassword('bad', 'Pass@123')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('googleLogin', () => {
    it('should return tokens for existing google user', async () => {
      const result = await service.googleLogin({
        id: 'google-123',
        email: 'test@test.com',
        displayName: 'Test',
        photos: [],
      });
      expect(result).toHaveProperty('accessToken');
    });

    it('should create new user if no account exists', async () => {
      mocks.prisma.user.findUnique
        .mockResolvedValueOnce(null)   // googleId lookup
        .mockResolvedValueOnce(null);  // email lookup
      mocks.prisma.user.create.mockResolvedValueOnce({
        ...mocks.mockUser,
        googleId: 'g-new',
      });

      const result = await service.googleLogin({
        id: 'g-new',
        email: 'new@test.com',
        displayName: 'New',
        photos: [],
      });
      expect(result).toHaveProperty('accessToken');
      expect(mocks.prisma.user.create).toHaveBeenCalled();
    });

    it('should reject linking to password-protected account', async () => {
      mocks.prisma.user.findUnique
        .mockResolvedValueOnce(null)        // googleId lookup — not found
        .mockResolvedValueOnce(mocks.mockUser); // email lookup — found with password

      await expect(
        service.googleLogin({
          id: 'g-attacker',
          email: 'test@test.com',
          displayName: 'Attacker',
          photos: [],
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('logout', () => {
    it('should nullify refresh token', async () => {
      await service.logout('u1');
      expect(mocks.prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'u1' },
        data: { refreshToken: null },
      });
    });
  });
});
