import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersTypeormEntity } from '@db/entities/users.typeorm-entity';
import { UserRepository } from '@module/users/repository/user.repository';
import { UserTypeormAdapter } from '@module/users/repository/user.typeorm-adapter';

@Module({
  imports: [TypeOrmModule.forFeature([UsersTypeormEntity])],
  providers: [{ provide: UserRepository, useClass: UserTypeormAdapter }],
  exports: [UserRepository],
})
export class UserRepositoryModule {}
