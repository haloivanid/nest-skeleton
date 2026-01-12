import { Injectable } from '@nestjs/common';
import { User, UserEntity } from '@module/users/domain';
import { UsersTypeormEntity } from '@db/entities';
import { UserResponseDto } from '@module/users/dto/responses/user-response.dto';
import { UserEmailMapper } from './user-email.mapper';
import { DomainMapperBase } from '@libs/core/domain';

@Injectable()
export class UserMapper implements DomainMapperBase<User, UsersTypeormEntity> {
  constructor(private readonly userEmailMapper: UserEmailMapper) {}

  fromDomainToRepository(domain: User): UsersTypeormEntity {
    const user = domain.toObject();
    const entity = new UsersTypeormEntity();

    entity.id = user.id;
    entity.name = user.name;
    entity.email = this.userEmailMapper.fromRawToRepositoryEntity(user.email);
    entity.password = user.password;
    entity.deletedAt = user.deletedAt;

    return entity;
  }

  fromDomainToResponse(domain: User): UserResponseDto {
    const user = domain.toObject() as Record<keyof UserEntity, any>;
    return {
      id: user.id,
      name: user.name,
      email: this.userEmailMapper.fromUserToResponse(user.email),
      deletedAt: user.deletedAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  fromRepositoryToDomain(repo: UsersTypeormEntity): User {
    return new User({
      id: repo.id,
      createdAt: repo.createdAt,
      updatedAt: repo.updatedAt,
      fields: {
        name: repo.name,
        email: this.userEmailMapper.fromRepositoryEntityToDomain(repo.email),
        password: repo.password,
        deletedAt: repo.deletedAt,
      },
    });
  }

  fromRepositoryToResponse(repo: UsersTypeormEntity): UserResponseDto {
    return {
      id: repo.id,
      name: repo.name,
      email: this.userEmailMapper.fromRepositoryEntityToResponseUnMask(repo.email),
      deletedAt: repo.deletedAt,
      createdAt: repo.createdAt,
      updatedAt: repo.updatedAt,
    };
  }
}
