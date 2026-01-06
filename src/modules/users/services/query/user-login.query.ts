import { Query } from '@nestjs/cqrs';
import { UserLoginDto } from '@module/users/dto/requests/user-login.dto';
import { UserLoginResponseDto } from '@module/users/dto/responses/user-login-response.dto';

export class UserLoginQuery extends Query<UserLoginResponseDto> {
  constructor(public readonly dto: UserLoginDto) {
    super();
  }
}
