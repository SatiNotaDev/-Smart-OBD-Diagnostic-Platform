import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly configService: ConfigService) {
    const clientID = configService.get('GOOGLE_CLIENT_ID');
    const clientSecret = configService.get('GOOGLE_CLIENT_SECRET');

    // Skip strategy initialization if Google OAuth is not configured
    if (!clientID || !clientSecret) {
      console.warn('⚠️  Google OAuth not configured. Google login will be disabled.');
      return;
    }

    super({
      clientID,
      clientSecret,
      callbackURL: `${configService.get('BACKEND_URL')}/api/auth/google/callback`,
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { id, displayName, emails, photos } = profile;

    const user = {
      id,
      email: emails[0].value,
      displayName,
      photos,
    };

    done(null, user);
  }
}
