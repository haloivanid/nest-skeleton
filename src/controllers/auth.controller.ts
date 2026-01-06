import { Body, Controller, Post } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateUserDtoSchema } from '@module/users/dto';
import { ControllerResult } from '@libs/core/dto';
import { CreateUserCommand } from '@module/users/services/command';
import { requestDtoValidator } from '@libs/utils/zod';
import { UserLoginDtoSchema } from '@module/users/dto/requests/user-login.dto';
import { UserLoginQuery } from '@module/users/services/query/user-login.query';

@Controller('/auth')
export class AuthController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post('/register')
  async register(@Body() body: Record<string, any>) {
    const requestBody = requestDtoValidator(body, CreateUserDtoSchema);
    return ControllerResult.builder(await this.commandBus.execute(new CreateUserCommand(requestBody)));
  }

  @Post('/login')
  async login(@Body() body: Record<string, any>) {
    const requestBody = requestDtoValidator(body, UserLoginDtoSchema);
    return ControllerResult.builder(await this.queryBus.execute(new UserLoginQuery(requestBody)));
  }
}
