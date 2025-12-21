import { Module, OnApplicationBootstrap } from '@nestjs/common';
import { MainController } from './main.controller';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { RequestInterceptor, ResponseInterceptor } from '@libs/core/interceptors';
import { BaseExceptionFilter, NotFoundExceptionFilter } from '@libs/core/filters';
import { AppCtxModule } from '@libs/core/app-ctx';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '@module/users/user.module';
import { typeormConfig } from '@conf/typeorm/typeorm.config';

@Module({
  controllers: [MainController],
  imports: [AppCtxModule.register(), TypeOrmModule.forRoot(typeormConfig), UserModule],
  providers: [
    { provide: APP_INTERCEPTOR, useClass: RequestInterceptor },
    { provide: APP_INTERCEPTOR, useClass: ResponseInterceptor },
    { provide: APP_FILTER, useClass: BaseExceptionFilter },
    { provide: APP_FILTER, useClass: NotFoundExceptionFilter },
  ],
})
export class MainModule implements OnApplicationBootstrap {
  onApplicationBootstrap() {
    this.envValidation();
  }

  private envValidation() {
    const ensureEnvs = ['DB_HOST', 'DB_PORT', 'DB_USERNAME', 'DB_PASSWORD', 'DB_NAME'];
    ensureEnvs.forEach((env) => {
      if (!process.env[env]) {
        throw new Error(`Environment variable ${env} is not defined`);
      }
    });
  }
}
