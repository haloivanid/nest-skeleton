import { Injectable } from '@nestjs/common';
import { User, UserEntity } from '@module/users/domain';
import { UsersTypeormEntity } from '@db/entities';
import { UserResponseDto } from '@module/users/dto/responses/user-response.dto';
import { DeepConverter } from '@libs/utils/deep-converter';
import { UserEmailMapper } from './user-email.mapper';

@Injectable()
export class UserMapper {
  constructor(private readonly userEmailMapper: UserEmailMapper) {}

  fromDomainToRepositoryEntity(domain: User): UsersTypeormEntity {
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
    return User.create({
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
    return DeepConverter.withFactory<UsersTypeormEntity, UserResponseDto>({
      options: { autoClone: false, autoFromSameName: true },
    }).convert(repo);
  }
}
