import { Module } from '@nestjs/common';
import { UserModule } from '@module/users';
import { MainController } from './main.controller';
import { AuthController } from './auth.controller';
import { UserController } from './user.controller';

@Module({ imports: [UserModule], controllers: [MainController, AuthController, UserController] })
export class ControllerModule {}
