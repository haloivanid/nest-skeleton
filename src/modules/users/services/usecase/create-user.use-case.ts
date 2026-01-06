import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateUserCommand } from '@module/users/services/command/create-user.command';
import { User, UserEmailValueObject, UserEntityCreationPayload } from '@module/users/domain';
import { entityId } from '@libs/utils/uid';
import { UserRepository } from '@module/users/repository';
import { UsersTypeormEntity } from '@db/entities/users.typeorm-entity';
import { UserEmailMapper, UserMapper } from '@module/users/mapper';
import { UserResponseDto } from '@module/users/dto/responses/user-response.dto';
import { UnauthorizedException } from '@nestjs/common';
import { CryptService } from '@libs/core/providers/crypt';

@CommandHandler(CreateUserCommand)
export class CreateUserUseCase implements ICommandHandler<CreateUserCommand, UserResponseDto> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly userMapper: UserMapper,
    private readonly userEmailMapper: UserEmailMapper,
    private readonly crypt: CryptService,
  ) {}

  async execute(command: CreateUserCommand) {
    const lookupEmail = this.userEmailMapper.fromRequestToLookup(command.dto.email);
    const existedUser = await this.userRepository.findOneByEmail(lookupEmail);
    if (existedUser) {
      throw new UnauthorizedException('User already exists');
    }

    const userEmail = UserEmailValueObject.create(command.dto.email);
    const payload: UserEntityCreationPayload = {
      id: entityId(),
      fields: {
        name: command.dto.name,
        email: userEmail,
        password: await this.crypt.toHash(command.dto.password),
        deletedAt: null,
      },
    };

    const user = User.create(payload);

    await this.userRepository.save<UsersTypeormEntity>(this.userMapper.fromDomainToRepositoryEntity(user));

    return this.userMapper.fromDomainToResponse(user);
  }
}
