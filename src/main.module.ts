import { Module } from '@nestjs/common';
import { MainController } from './main.controller';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { RequestInterceptor, ResponseInterceptor } from '@libs/interceptors';
import { BaseExceptionFilter } from '@libs/filters';
import { AppCtxModule } from '@libs/app-ctx';

@Module({
  controllers: [MainController],
  imports: [AppCtxModule.register()],
  providers: [
    { provide: APP_INTERCEPTOR, useClass: RequestInterceptor },
    { provide: APP_INTERCEPTOR, useClass: ResponseInterceptor },
    { provide: APP_FILTER, useClass: BaseExceptionFilter },
  ],
})
export class MainModule {}
