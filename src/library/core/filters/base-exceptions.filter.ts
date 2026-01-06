import { ArgumentsHost, Catch, ExceptionFilter, Injectable } from '@nestjs/common';
import { BaseException } from '@libs/core/exceptions';
import { AppCtxService } from '@libs/core/providers/app-ctx/app-ctx.service';
import { FastifyReply } from 'fastify';

@Catch(BaseException)
@Injectable()
export class BaseExceptionFilter implements ExceptionFilter {
  constructor(private readonly appCtx: AppCtxService) {}

  catch(exception: BaseException, host: ArgumentsHost) {
    const context = this.appCtx.context;

    const [httpStatusNumber, data] = exception.getResponse(context.requestedLang);

    data.requestId = context.requestId;
    host.switchToHttp().getResponse<FastifyReply>().status(httpStatusNumber).send(data);
  }
}
