import { Injectable } from '@nestjs/common';
import { HashingProvider } from './hashing.provider';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class BcryptProvider extends HashingProvider {
  async hash(password: string): Promise<string> {
    return await bcrypt.hash(password, 10);
  }

  async compare(password: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }
}
