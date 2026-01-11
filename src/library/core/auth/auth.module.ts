import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserAuthStrategy } from '@libs/core/auth/strategy/user';
import { JwtModule } from '@nestjs/jwt';
import { UserRepositoryModule } from '@module/users/repository';
import { UserEmailMapper, UserMapper } from '@module/users/mapper';
import { CryptModule } from '@libs/core/providers/crypt';
import { ValidatedEnv } from '@conf/env';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<ValidatedEnv, true>) => ({
        secret: configService.get<string>('JWT_SECRET', { infer: true }),
        signOptions: { expiresIn: '1h' },
        verifyOptions: { algorithms: ['HS256'] },
      }),
    }),
    UserRepositoryModule,
    CryptModule.register(),
  ],
  providers: [UserAuthStrategy, UserMapper, UserEmailMapper],
  exports: [UserAuthStrategy, JwtModule],
})
export class AuthModule {}
