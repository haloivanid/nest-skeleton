import { Module } from '@nestjs/common';
import { UserRepositoryModule } from '@module/users/repository';
import { CreateUserUseCase } from '@module/users/services/usecase';
import { UserLoginUseCase } from '@module/users/services/usecase/user-login.use-case';
import { CacheModule } from '@nestjs/cache-manager';
import { JwtService } from '@nestjs/jwt';
import { CryptModule } from '@libs/core/providers/crypt';
import { UserEmailMapper, UserMapper } from '@module/users/mapper';

@Module({
  imports: [CacheModule.register(), UserRepositoryModule, CryptModule.register()],
  providers: [JwtService, CreateUserUseCase, UserLoginUseCase, UserMapper, UserEmailMapper],
  exports: [CreateUserUseCase, UserLoginUseCase, UserRepositoryModule, UserEmailMapper],
})
export class UserModule {}
