import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateUserCommand } from '@module/users/services/command/create-user.command';
import { User, UserEmailValueObject, UserEntityFields } from '@module/users/domain';
import { UserRepository } from '@module/users/repository';
import { UserEmailMapper, UserMapper } from '@module/users/mapper';
import { UnauthorizedException } from '@nestjs/common';
import { CryptService } from '@libs/core/providers/crypt';

@CommandHandler(CreateUserCommand)
export class CreateUserUseCase implements ICommandHandler<CreateUserCommand> {
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

    const userName = command.dto.name.trim().toLowerCase();
    const userEmail = UserEmailValueObject.create(command.dto.email);
    const payload: UserEntityFields = {
      name: userName,
      email: userEmail,
      password: await this.crypt.toHash(command.dto.password),
      deletedAt: null,
    };

    const user = User.register(payload);

    const savedUser = await this.userRepository.writeDomainToRepository(user);

    return this.userMapper.fromRepositoryToResponse(savedUser);
  }
}
