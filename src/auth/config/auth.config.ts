import { registerAs } from '@nestjs/config';

export default registerAs('auth', () => ({
  secret: process.env.SECRET,
  expiresIn: process.env.SECRET_EXPIRES ?? '1h',
  refresh_secret: process.env.REFRESH_SECRET,
  refresh_secret_Expires: process.env.REFRESH_SECRET_EXPIRES ?? '1d',
}));
