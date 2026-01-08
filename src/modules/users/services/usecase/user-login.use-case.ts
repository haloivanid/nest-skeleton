import { IQueryHandler, QueryBus, QueryHandler } from '@nestjs/cqrs';
import { UserRepository } from '@module/users/repository';
import { UserEmailMapper, UserMapper } from '@module/users/mapper';
import { Inject, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { JwtPayloadDto } from '@libs/core/dto';
import { CryptService } from '@libs/core/providers/crypt';
import { UserLoginQuery, UserPasswordAttemptQuery } from '@module/users/services/query';

@QueryHandler(UserLoginQuery)
export class UserLoginUseCase implements IQueryHandler<UserLoginQuery> {
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

  async execute(query: UserLoginQuery) {
    const key = this.generateCacheKey(query.dto.email);
    let accessToken = await this.cacheManager.get<string>(key);
    if (accessToken) {
      return { accessToken };
    }

    const emailLookup = this.userEmailMapper.fromRequestToLookup(query.dto.email);
    const userRepoEntity = await this.userRepo.findOneByEmail(emailLookup);
    if (!userRepoEntity) {
      throw new UnauthorizedException('User not found');
    }

    const user = this.userMapper.fromRepositoryToDomain(userRepoEntity);
    await this.queryBus.execute(new UserPasswordAttemptQuery(query.dto.password, user));

    accessToken = this.jwtService.sign(new JwtPayloadDto(user.id).toObject());
    await this.cacheManager.set(key, accessToken, 60 * 1000);

    return { accessToken };
  }

  private generateCacheKey(info: string): string {
    return this.cryptService.toLookupData(`${this.CACHE_KEY_PREFIX}:${info}`);
  }
}
