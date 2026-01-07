import { Controller, Get, Patch, Post, Put, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Controller('/me')
@UseGuards(AuthGuard('jwt'))
export class UserController {
  constructor() {}

  @Get()
  getProfile() {
    throw new Error('Method not implemented.');
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
