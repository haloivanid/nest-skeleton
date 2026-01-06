import { Module, OnApplicationBootstrap } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { RequestInterceptor, ResponseInterceptor } from '@libs/core/interceptors';
import { BaseExceptionFilter, NotFoundExceptionFilter } from '@libs/core/filters';
import { AppCtxModule } from '@libs/core/providers/app-ctx';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '@module/users/user.module';
import { typeormConfig } from '@conf/typeorm/typeorm.config';
import { ControllerModule } from './controllers/controller.module';
import { CqrsModule } from '@nestjs/cqrs';
import { AuthModule } from '@libs/core/auth';

@Module({
  imports: [
    AppCtxModule.register(),
    TypeOrmModule.forRoot(typeormConfig),
    CqrsModule.forRoot(),
    AuthModule,
    ControllerModule,
    UserModule,
  ],
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
    const ensureEnvs = [
      'DB_HOST',
      'DB_PORT',
      'DB_USERNAME',
      'DB_PASSWORD',
      'DB_NAME',
      'JWT_SECRET',
      'SALT_ROUND',
      'PII_SECRET',
      'PII_ACTIVE',
      'HMAC_SECRET',
      'MASTER_KEY',
      'DERIVE_KEY',
    ];

    ensureEnvs.forEach((env) => {
      if (!process.env[env]) {
        throw new Error(`Environment variable ${env} is not defined`);
      }
    });
  }
}
