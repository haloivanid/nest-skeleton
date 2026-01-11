import { CryptService } from '@libs/core/providers/crypt';
import { QueryHandler } from '@nestjs/cqrs';
import { UserPasswordAttemptQuery } from '@module/users/services/query';
import { Cache } from 'cache-manager';
import { Inject, UnauthorizedException } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

@QueryHandler(UserPasswordAttemptQuery)
export class UserPasswordAttemptUseCase {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
    private readonly crypt: CryptService,
  ) {}

  private readonly CACHE_KEY_PREFIX = 'password-attempt';
  private readonly MAX_PASSWORD_ATTEMPTS = 5;
  private readonly LOCK_TTL = 300;

  async execute(query: UserPasswordAttemptQuery) {
    const key = this.generateKey(query.user.id);
    await this.checkRateLimit(key);

    const isValid = await query.user.validatePassword(query.password, this.crypt.compareHash);
    if (!isValid) {
      await this.handleFailedAttempt(key);
      throw new UnauthorizedException('Invalid password');
    }

    await this.cache.del(key);
    return true;
  }

  private async checkRateLimit(key: string): Promise<void> {
    const attempts = await this.cache.get<number>(key);
    if (attempts && attempts >= this.MAX_PASSWORD_ATTEMPTS) {
      throw new UnauthorizedException('Too many password attempts. Please try again later.');
    }
  }

  private async handleFailedAttempt(key: string): Promise<void> {
    const attempts = (await this.cache.get<number>(key)) || 0;
    await this.cache.set(key, attempts + 1, this.LOCK_TTL * 1000);
  }

  private generateKey(info: string): string {
    return this.crypt.toLookupData(`${this.CACHE_KEY_PREFIX}:${info}`).toString('hex');
  }
}
