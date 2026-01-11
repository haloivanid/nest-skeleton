import { Body, Controller, HttpStatus, Post } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { CreateUserDtoSchema } from '@module/users/dto';
import { ControllerResult } from '@libs/core/dto';
import { CreateUserCommand, UserLoginCommand } from '@module/users/services/command';
import { requestDtoValidator } from '@libs/utils/zod';
import { UserLoginDtoSchema } from '@module/users/dto/requests/user-login.dto';

@Controller('/auth')
export class AuthController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post('/register')
  async register(@Body() body: Record<string, any>) {
    const requestBody = requestDtoValidator(body, CreateUserDtoSchema);
    return ControllerResult.builder(
      await this.commandBus.execute(new CreateUserCommand(requestBody)),
      HttpStatus.CREATED,
    );
  }

  @Post('/login')
  async login(@Body() body: Record<string, any>) {
    const requestBody = requestDtoValidator(body, UserLoginDtoSchema);
    const result = await this.commandBus.execute(new UserLoginCommand(requestBody));

    return ControllerResult.builder(result, result.cached ? HttpStatus.NOT_MODIFIED : HttpStatus.OK);
  }
}
