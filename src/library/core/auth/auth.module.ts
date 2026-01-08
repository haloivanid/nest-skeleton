import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from '@libs/core/auth/startegy/jwt.strategy';
import { JwtModule } from '@nestjs/jwt';
import { UserRepositoryModule } from '@module/users/repository';
import { UserEmailMapper, UserMapper } from '@module/users/mapper';
import { CryptModule } from '@libs/core/providers/crypt';
import { ValidatedEnv } from '@conf/env/env.schema';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<ValidatedEnv, true>) => ({
        secret: configService.get<string>('JWT_SECRET', { infer: true }),
        signOptions: { expiresIn: '1h' },
      }),
    }),
    UserRepositoryModule,
    CryptModule.register(),
  ],
  providers: [JwtStrategy, UserMapper, UserEmailMapper],
  exports: [JwtStrategy, JwtModule],
})
export class AuthModule {}
