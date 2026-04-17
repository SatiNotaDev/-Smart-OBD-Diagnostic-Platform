import { MfaService } from './mfa.service';
import * as speakeasy from 'speakeasy';

describe('MfaService', () => {
  let service: MfaService;

  beforeEach(() => {
    service = new MfaService();
  });

  describe('generateSecret', () => {
    it('should return secret and qrCodeUrl', () => {
      const result = service.generateSecret('user@test.com');
      expect(result.secret).toBeDefined();
      expect(result.qrCodeUrl).toContain('otpauth://');
    });
  });

  describe('generateQRCode', () => {
    it('should return a data URL', async () => {
      const { qrCodeUrl } = service.generateSecret('user@test.com');
      const dataUrl = await service.generateQRCode(qrCodeUrl);
      expect(dataUrl).toMatch(/^data:image\/png;base64,/);
    });
  });

  describe('verifyToken', () => {
    it('should verify a valid TOTP token', () => {
      const { secret } = service.generateSecret('user@test.com');
      const token = speakeasy.totp({ secret, encoding: 'base32' });
      expect(service.verifyToken(secret, token)).toBe(true);
    });

    it('should reject an invalid TOTP token', () => {
      const { secret } = service.generateSecret('user@test.com');
      expect(service.verifyToken(secret, '000000')).toBe(false);
    });
  });

  describe('generateBackupCodes', () => {
    it('should generate 10 codes by default', () => {
      const codes = service.generateBackupCodes();
      expect(codes).toHaveLength(10);
    });

    it('should generate specified number of codes', () => {
      const codes = service.generateBackupCodes(5);
      expect(codes).toHaveLength(5);
    });

    it('should generate hex-format uppercase codes', () => {
      const codes = service.generateBackupCodes();
      for (const code of codes) {
        expect(code).toMatch(/^[A-F0-9]{8}$/);
      }
    });
  });

  describe('backup code hashing and verification', () => {
    it('should hash and verify a backup code', async () => {
      const codes = service.generateBackupCodes(3);
      const hashed = await service.hashBackupCodes(codes);
      const result = await service.verifyBackupCode(codes[0], hashed);
      expect(result).toBe(true);
    });

    it('should reject an invalid backup code', async () => {
      const codes = service.generateBackupCodes(3);
      const hashed = await service.hashBackupCodes(codes);
      const result = await service.verifyBackupCode('INVALID1', hashed);
      expect(result).toBe(false);
    });
  });
});
