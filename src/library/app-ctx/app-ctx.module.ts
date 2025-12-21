import { DynamicModule, Module } from '@nestjs/common';
import { AppCtxService } from '@libs/app-ctx/app-ctx.service';

@Module({})
export class AppCtxModule {
  static register(): DynamicModule {
    return { module: AppCtxModule, providers: [AppCtxService], exports: [AppCtxService] };
  }
}
