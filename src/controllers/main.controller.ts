import { Controller, Get } from '@nestjs/common';
import { ControllerResult } from '@libs/core/dto';
import { AppCtxService } from '@libs/core/providers/app-ctx';

@Controller()
export class MainController {
  constructor(private readonly appCtx: AppCtxService) {}

  @Get()
  root() {
    return ControllerResult.builder({ message: 'Hello World!' });
  }
}
