import { Injectable, NestMiddleware } from '@nestjs/common';
import { AppCtxService } from './app-ctx.service';

@Injectable()
export class AppCtxMiddleware implements NestMiddleware {
  constructor(private readonly appCtx: AppCtxService) {}

  use(_req: never, _res: never, next: () => void) {
    this.appCtx.run(() => {
      next();
    });
  }
}
