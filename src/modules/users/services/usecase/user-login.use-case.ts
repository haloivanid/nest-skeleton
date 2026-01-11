import { ICommandHandler, QueryBus, CommandHandler } from '@nestjs/cqrs';
import { UserRepository } from '@module/users/repository';
import { UserEmailMapper, UserMapper } from '@module/users/mapper';
import { Inject, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { CryptService } from '@libs/core/providers/crypt';
import { UserAuthStrategyDto } from '@libs/core/auth/strategy/user/user.auth-strategy.dto';
import { UserLoginCommand } from '@module/users/services/command';
import { UserPasswordAttemptQuery } from '../query';

@CommandHandler(UserLoginCommand)
export class UserLoginUseCase implements ICommandHandler<UserLoginCommand> {
  private readonly CACHE_KEY_PREFIX = 'auth-login';

  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly queryBus: QueryBus,
    private readonly userRepo: UserRepository,
    private readonly userMapper: UserMapper,
    private readonly userEmailMapper: UserEmailMapper,
    private readonly jwtService: JwtService,
    private readonly cryptService: CryptService,
  ) {}

  async execute(query: UserLoginCommand) {
    const key = this.generateCacheKey(query.dto.email);
    let accessToken = await this.cacheManager.get<string>(key);
    if (accessToken) {
      return { accessToken, cached: true };
    }

    const emailLookup = this.userEmailMapper.fromRequestToLookup(query.dto.email);
    const userRepoEntity = await this.userRepo.findOneByEmail(emailLookup);
    if (!userRepoEntity || userRepoEntity.deletedAt) {
      throw new UnauthorizedException('User not found');
    }

    const user = this.userMapper.fromRepositoryToDomain(userRepoEntity);
    await this.queryBus.execute(new UserPasswordAttemptQuery(query.dto.password, user));

    accessToken = this.jwtService.sign<UserAuthStrategyDto>({ id: user.id });
    await this.cacheManager.set(key, accessToken, 60 * 1000);

    return { accessToken, cached: false };
  }

  private generateCacheKey(info: string): string {
    return this.cryptService.toLookupData(`${this.CACHE_KEY_PREFIX}:${info}`).toString('hex');
  }
}
