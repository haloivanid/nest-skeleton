import { Command } from '@nestjs/cqrs';
import { UserLoginDto } from '@module/users/dto/requests/user-login.dto';
import { UserLoginResponseDto } from '@module/users/dto/responses/user-login-response.dto';

export class UserLoginCommand extends Command<UserLoginResponseDto> {
  constructor(public readonly dto: UserLoginDto) {
    super();
  }
}
