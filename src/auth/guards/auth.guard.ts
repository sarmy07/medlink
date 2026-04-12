import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import authConfig from '../config/auth.config';
import type { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @Inject(authConfig.KEY)
    private readonly authConfiguration: ConfigType<typeof authConfig>,
    private readonly jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization.split(' ')[0];
    if (!token) throw new UnauthorizedException();

    try {
      const payload = await this.jwtService.signAsync(
        token,
        this.authConfiguration,
      );
      request['user'] = payload;
    } catch (error) {
      throw new UnauthorizedException('invalid token');
    }
    return true;
  }
}
