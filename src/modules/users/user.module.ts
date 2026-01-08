import { Module } from '@nestjs/common';
import { UserRepositoryModule } from '@module/users/repository';
import { CreateUserUseCase, UserPasswordAttemptUseCase } from '@module/users/services/usecase';
import { UserLoginUseCase } from '@module/users/services/usecase/user-login.use-case';
import { CacheModule } from '@nestjs/cache-manager';
import { CryptModule } from '@libs/core/providers/crypt';
import { UserEmailMapper, UserMapper } from '@module/users/mapper';
import { AuthModule } from '@libs/core/auth';

@Module({
  imports: [AuthModule, CacheModule.register(), UserRepositoryModule, CryptModule.register()],
  providers: [CreateUserUseCase, UserLoginUseCase, UserPasswordAttemptUseCase, UserMapper, UserEmailMapper],
  exports: [CreateUserUseCase, UserLoginUseCase, UserPasswordAttemptUseCase, UserRepositoryModule, UserEmailMapper],
})
export class UserModule {}
