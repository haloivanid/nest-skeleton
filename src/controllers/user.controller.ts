import { Controller, Get, Patch, Post, Put, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Controller('/me')
@UseGuards(AuthGuard('jwt'))
export class UserController {
  constructor() {}

  @Get()
  getProfile() {}

  @Put()
  updateProfile() {}

  @Post('/request-update')
  requestUpdate() {}

  @Post('/change-email/request')
  requestChangeEmail() {}

  @Patch('/change-email')
  updateEmail() {}

  @Patch('/change-password')
  updatePassword() {}
}
