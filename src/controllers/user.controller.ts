import { ControllerResult } from '@libs/core/dto';
import { AppCtxService } from '@libs/core/providers/app-ctx';
import { Controller, Get, Patch, Post, Put, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Controller('/me')
@UseGuards(AuthGuard('user'))
export class UserController {
  constructor(private readonly appCtx: AppCtxService) {}

  @Get()
  getProfile() {
    return ControllerResult.builder({ content: this.appCtx.context.userAgent });
  }

  @Put()
  updateProfile() {
    throw new Error('Method not implemented.');
  }

  @Post('/request-update')
  requestUpdate() {
    throw new Error('Method not implemented.');
  }

  @Post('/change-email/request')
  requestChangeEmail() {
    throw new Error('Method not implemented.');
  }

  @Patch('/change-email')
  updateEmail() {
    throw new Error('Method not implemented.');
  }

  @Patch('/change-password')
  updatePassword() {
    throw new Error('Method not implemented.');
  }
}
