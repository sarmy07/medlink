import { Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-google-oauth20';
import googleConfig from '../config/google.config';
import type { ConfigType } from '@nestjs/config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    @Inject(googleConfig.KEY)
    private readonly googleConfiguration: ConfigType<typeof googleConfig>,
  ) {
    super({
      clientID: googleConfiguration.clientId!,
      clientSecret: googleConfiguration.clientSecret!,
      callbackURL: googleConfiguration.callbackUrl!,
      scope: ['email', 'profile'],
    });
    console.log('CALLBACK URL:', googleConfiguration.callbackUrl);
  }

  async validate(accessToken: string, refreshToken: string, profile: any) {
    const user = {
      email: profile.emails?.[0]?.value,
      firstName: profile.name?.givenName,
      lastName: profile.name?.familyName,
      avatar: profile.photos?.[0]?.value,
      googleId: profile.id,
    };

    // console.log('GOOGLE USER FROM STRATEGY:', user);

    return user;
  }
}
