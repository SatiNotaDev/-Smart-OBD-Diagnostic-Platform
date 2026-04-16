export class AuthResponseDto {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    name: string | null;
    avatar: string | null;
    role: string;
    isEmailVerified: boolean;
    mfaEnabled: boolean;
    preferredLanguage: string;
    theme: string;
  };
}

export class MfaSetupResponseDto {
  secret: string;
  qrCodeUrl: string;
  backupCodes: string[];
}
