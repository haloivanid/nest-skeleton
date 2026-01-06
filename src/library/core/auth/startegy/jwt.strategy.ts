import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy, StrategyOptionsWithRequest } from 'passport-jwt';
import { FastifyRequest } from 'fastify';
import { User } from '@module/users/domain';
import { UserRepository } from '@module/users/repository';
import { UserMapper } from '@module/users/mapper';
import { ValidatedEnv } from '@conf/env/env.schema';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly userMapper: UserMapper,
    private readonly configService: ConfigService<ValidatedEnv, true>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET', { infer: true }),
      passReqToCallback: true,
    } as StrategyOptionsWithRequest);
  }

  async validate(req: FastifyRequest, payload: any): Promise<User> {
    const userData = await this.userRepo.findOneBy({ id: payload.sub, email: payload.email });
    if (!userData) {
      throw new UnauthorizedException();
    }

    const user = this.userMapper.fromRepositoryToDomain(userData);
    (req as any).user = user;
    return user;
  }
}
