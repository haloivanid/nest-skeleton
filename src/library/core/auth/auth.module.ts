import { Module } from '@nestjs/common';
import { JwtStrategy } from '@libs/core/auth/startegy/jwt.strategy';
import { JwtModule } from '@nestjs/jwt';
import { UserRepositoryModule } from '@module/users/repository';
import { UserEmailMapper, UserMapper } from '@module/users/mapper';
import { CryptModule } from '@libs/core/providers/crypt';

@Module({
  imports: [
    JwtModule.register({ secret: process.env.JWT_SECRET, signOptions: { expiresIn: '1h' } }),
    UserRepositoryModule,
    CryptModule.register(),
  ],
  providers: [JwtStrategy, UserMapper, UserEmailMapper],
  exports: [JwtStrategy],
})
export class AuthModule {}
