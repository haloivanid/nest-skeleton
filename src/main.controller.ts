import { Controller, Get } from '@nestjs/common';
import { ControllerResult } from '@libs/dto';
import { AppCtxService } from '@libs/app-ctx';

@Controller()
export class MainController {
  constructor(private readonly appCtx: AppCtxService) {}

  @Get()
  root() {
    return ControllerResult.builder({ message: 'Hello World!' });
  }
}
