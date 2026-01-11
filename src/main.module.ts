import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { RequestInterceptor, ResponseInterceptor } from '@libs/core/interceptors';
import { BaseExceptionFilter, NotFoundExceptionFilter } from '@libs/core/filters';
import { AppCtxModule } from '@libs/core/providers/app-ctx';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '@module/users/user.module';
import { createTypeOrmConfig } from '@conf/typeorm/typeorm.config';
import { ControllerModule } from './controllers/controller.module';
import { CqrsModule } from '@nestjs/cqrs';
import { AuthModule } from '@libs/core/auth';
import { validateEnv } from '@conf/env';
import { ExternalMailerModule } from '@ext/mailer';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnv, cache: true, envFilePath: ['.env.local', '.env'] }),
    AppCtxModule.register(),
    TypeOrmModule.forRootAsync({ useFactory: () => createTypeOrmConfig(process.env) }),
    CqrsModule.forRoot(),
    EventEmitterModule.forRoot(),
    ExternalMailerModule,
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
export class MainModule {}
