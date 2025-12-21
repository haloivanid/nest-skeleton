import { Module } from '@nestjs/common';
import { UserController } from '@module/users/user.controller';
import { UserRepositoryModule } from '@module/users/repository';

@Module({ imports: [UserRepositoryModule], controllers: [UserController] })
export class UserModule {}
