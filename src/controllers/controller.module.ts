import { Module } from '@nestjs/common';
import { UserModule } from '@module/users';
import { AppCtxModule } from '@libs/core/providers/app-ctx';
import { MainController } from './main.controller';
import { AuthController } from './auth.controller';
import { UserController } from './user.controller';

@Module({
  imports: [AppCtxModule.register(), UserModule],
  controllers: [MainController, AuthController, UserController],
})
export class ControllerModule {}
