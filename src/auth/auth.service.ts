import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginDto } from './dtos/login.dto';
import { UsersService } from 'src/users/users.service';
import { HashingProvider } from './providers/hashing.provider';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { RegisterDto } from './dtos/register.dto';
import { JwtService } from '@nestjs/jwt';
import authConfig from './config/auth.config';
import type { ConfigType } from '@nestjs/config';
import { RefreshTokenDto } from './dtos/refresh.token.dto';

@Injectable()
export class AuthService {
  constructor(
    @Inject(authConfig.KEY)
    private readonly authConfiguration: ConfigType<typeof authConfig>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly hashingProvider: HashingProvider,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.userRepo.findOne({
      where: {
        email: dto.email,
      },
    });
    if (existing) throw new ConflictException('email in use');

    const hashed = await this.hashingProvider.hash(dto.password);

    const user = this.userRepo.create({
      ...dto,
      password: hashed,
    });

    const { password, ...rest } = user;
    await this.userRepo.save(user);

    return {
      message: 'user registered',
      user: rest,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.userRepo.findOne({
      where: {
        email: dto.email,
      },
    });

    if (!user) throw new NotFoundException('user not found');
    const isValid = await this.hashingProvider.compare(
      dto.password,
      user.password,
    );
    if (!isValid) throw new BadRequestException('invalid credentials');

    return await this.generateTokens(user);
  }

  async refresh(userId: string, dto: RefreshTokenDto) {
    const user = await this.userRepo.findOne({
      where: {
        id: userId,
      },
    });
    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('access denied');
    }

    const match = await this.hashingProvider.compare(
      dto.refreshToken,
      user.refreshToken,
    );
    if (!match) throw new UnauthorizedException('access denied');

    return this.generateTokens(user);
  }

  async logout(userId: string) {
    await this.userRepo.update(userId, { refreshToken: null });
    return {
      message: 'logged out',
    };
  }

  private async generateTokens(user: any) {
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.authConfiguration.secret,
        expiresIn: this.authConfiguration.expiresIn as any,
      }),
      this.jwtService.signAsync(payload, {
        secret: this.authConfiguration.refresh_secret,
        expiresIn: this.authConfiguration.refresh_secret_Expires as any,
      }),
    ]);

    const hashed = await this.hashingProvider.hash(refreshToken);
    await this.userRepo.update(user.id, { refreshToken: hashed });

    return { accessToken, refreshToken };
  }
}
