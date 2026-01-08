import { DynamicModule, Global, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppCtxService } from '@libs/core/providers/app-ctx/app-ctx.service';
import { AppCtxMiddleware } from './app-ctx.middleware';

@Global()
@Module({})
export class AppCtxModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AppCtxMiddleware).forRoutes('*');
  }

  static register(): DynamicModule {
    return { module: AppCtxModule, providers: [AppCtxService], exports: [AppCtxService] };
  }
}
