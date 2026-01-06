import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { UserLoginQuery } from '@module/users/services/query/user-login.query';
import { UserRepository } from '@module/users/repository';
import { UserEmailMapper, UserMapper } from '@module/users/mapper';
import { Inject, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { createHash } from 'node:crypto';
import { CryptService } from '@libs/core/providers/crypt';
import { JwtPayloadDto } from '@libs/core/dto';

@QueryHandler(UserLoginQuery)
export class UserLoginUseCase implements IQueryHandler<UserLoginQuery> {
  private readonly CACHE_KEY_PREFIX = 'auth';

  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly userRepo: UserRepository,
    private readonly userMapper: UserMapper,
    private readonly userEmailMapper: UserEmailMapper,
    private readonly crypt: CryptService,
    private readonly jwtService: JwtService,
  ) {}

  async execute(query: UserLoginQuery) {
    const key = `${this.CACHE_KEY_PREFIX}:login:${query.dto.email}`;
    const sha256 = createHash('sha256').update(key).digest('hex');

    let accessToken = await this.cacheManager.get<string>(sha256);
    if (accessToken) {
      return { accessToken };
    }

    const emailLookup = this.userEmailMapper.fromRequestToLookup(query.dto.email);
    const userRepoEntity = await this.userRepo.findOneByEmail(emailLookup);
    if (!userRepoEntity) {
      throw new Error('User not found');
    }

    const attemptPassword = await this.crypt.compareHash(query.dto.password, userRepoEntity.password);
    if (!attemptPassword) {
      throw new UnauthorizedException('Invalid password');
    }

    const user = this.userMapper.fromRepositoryToDomain(userRepoEntity);
    const jwtPayload = new JwtPayloadDto(user.id);
    accessToken = this.jwtService.sign(jwtPayload.toObject(), { expiresIn: '1h' });

    await this.cacheManager.set(sha256, accessToken, 60 * 1000);
    return { accessToken };
  }
}
