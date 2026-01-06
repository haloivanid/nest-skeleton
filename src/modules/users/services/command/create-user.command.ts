import { Command } from '@nestjs/cqrs';
import { CreateUserDto } from '@module/users/dto';
import { UserResponseDto } from '@module/users/dto/responses/user-response.dto';

export class CreateUserCommand extends Command<UserResponseDto> {
  constructor(public readonly dto: CreateUserDto) {
    super();
  }
}
