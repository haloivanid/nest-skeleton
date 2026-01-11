import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy, StrategyOptionsWithRequest } from 'passport-jwt';
import { FastifyRequest } from 'fastify';
import { User } from '@module/users/domain';
import { UserRepository } from '@module/users/repository';
import { UserMapper } from '@module/users/mapper';
import { ValidatedEnv } from '@conf/env';
import { AppCtxService } from '@libs/core/providers/app-ctx';
import { UserAuthStrategyDto, UserAuthStrategyDtoSchema } from './user.auth-strategy.dto';

@Injectable()
export class UserAuthStrategy extends PassportStrategy(Strategy, 'user') {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly userMapper: UserMapper,
    private readonly configService: ConfigService<ValidatedEnv, true>,
    private readonly appCtx: AppCtxService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET', { infer: true }),
      passReqToCallback: true,
    } as StrategyOptionsWithRequest);
  }

  async validate(req: FastifyRequest, payload: UserAuthStrategyDto): Promise<User> {
    const validatePayload = UserAuthStrategyDtoSchema.safeParse(payload);
    if (!validatePayload.success) {
      throw new UnauthorizedException();
    }

    const userData = await this.userRepo.findOneBy({ id: payload.id });
    if (!userData) {
      throw new UnauthorizedException();
    }

    const user = this.userMapper.fromRepositoryToDomain(userData);
    this.appCtx.setActorId(user.id);
    req.user = user;
    return user;
  }
}
