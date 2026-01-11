import { Module } from '@nestjs/common';
import { UserRepositoryModule } from '@module/users/repository';
import { CreateUserUseCase, UserPasswordAttemptUseCase } from '@module/users/services/usecase';
import { UserLoginUseCase } from '@module/users/services/usecase/user-login.use-case';
import { CacheModule } from '@nestjs/cache-manager';
import { AuthModule } from '@libs/core/auth';
import { UserMapperModule } from './mapper';
import { CryptModule } from '@libs/core/providers/crypt';

@Module({
  imports: [CacheModule.register(), CryptModule.register(), AuthModule, UserRepositoryModule, UserMapperModule],
  providers: [CreateUserUseCase, UserLoginUseCase, UserPasswordAttemptUseCase],
  exports: [CreateUserUseCase, UserLoginUseCase, UserPasswordAttemptUseCase],
})
export class UserModule {}
