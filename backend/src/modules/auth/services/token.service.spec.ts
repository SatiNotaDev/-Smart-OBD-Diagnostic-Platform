import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { TokenService } from './token.service';

describe('TokenService', () => {
  let service: TokenService;
  let jwtService: JwtService;

  const mockConfig = {
    get: (key: string) => {
      const map: Record<string, string> = {
        JWT_SECRET: 'test-jwt-secret-min-32-chars-long!',
        JWT_REFRESH_SECRET: 'test-refresh-secret-min-32-chars!!',
      };
      return map[key];
    },
  } as ConfigService;

  beforeEach(() => {
    jwtService = new JwtService({});
    service = new TokenService(jwtService, mockConfig);
  });

  it('should generate an access token', () => {
    const token = service.generateAccessToken({
      sub: 'user-1',
      email: 'test@test.com',
      role: 'USER',
    });
    expect(token).toBeDefined();
    expect(typeof token).toBe('string');
  });

  it('should generate a refresh token', () => {
    const token = service.generateRefreshToken({
      sub: 'user-1',
      email: 'test@test.com',
    });
    expect(token).toBeDefined();
    expect(typeof token).toBe('string');
  });

  it('should verify a valid access token', () => {
    const token = service.generateAccessToken({
      sub: 'user-1',
      email: 'test@test.com',
      role: 'USER',
    });
    const payload = service.verifyToken(token);
    expect(payload.sub).toBe('user-1');
    expect(payload.email).toBe('test@test.com');
  });

  it('should verify a valid refresh token', () => {
    const token = service.generateRefreshToken({
      sub: 'user-1',
      email: 'test@test.com',
    });
    const payload = service.verifyToken(token, true);
    expect(payload.sub).toBe('user-1');
  });

  it('should throw on invalid token', () => {
    expect(() => service.verifyToken('invalid.token.here')).toThrow();
  });

  it('should generate a random hex token', () => {
    const token = service.generateRandomToken();
    expect(token).toMatch(/^[a-f0-9]{64}$/);
  });

  it('should generate unique random tokens', () => {
    const t1 = service.generateRandomToken();
    const t2 = service.generateRandomToken();
    expect(t1).not.toBe(t2);
  });
});
