import { PasswordHasherService } from './password-hasher.service';

describe('PasswordHasherService', () => {
  let service: PasswordHasherService;

  beforeEach(() => {
    service = new PasswordHasherService();
  });

  it('should hash a password', async () => {
    const hash = await service.hash('Test@1234');
    expect(hash).toBeDefined();
    expect(hash).not.toBe('Test@1234');
  });

  it('should return true for correct password', async () => {
    const hash = await service.hash('Test@1234');
    const result = await service.compare('Test@1234', hash);
    expect(result).toBe(true);
  });

  it('should return false for wrong password', async () => {
    const hash = await service.hash('Test@1234');
    const result = await service.compare('Wrong@1234', hash);
    expect(result).toBe(false);
  });

  it('should produce different hashes for same password', async () => {
    const hash1 = await service.hash('Test@1234');
    const hash2 = await service.hash('Test@1234');
    expect(hash1).not.toBe(hash2);
  });
});
