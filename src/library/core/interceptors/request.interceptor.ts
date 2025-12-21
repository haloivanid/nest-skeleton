import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { FastifyReply, FastifyRequest } from 'fastify';
import { AppCtxService } from '@libs/core/app-ctx';
import { time } from '@libs/utils';

@Injectable()
export class RequestInterceptor implements NestInterceptor {
  constructor(private readonly appCtx: AppCtxService) {}
  intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {
    const http = context.switchToHttp();
    const request = http.getRequest<FastifyRequest>();
    const response = http.getResponse<FastifyReply>();

    this.appCtx.setRequestId(request.id);
    this.appCtx.setRequestedLang(request.headers['accept-language']);
    this.appCtx.setIp(request.ip);
    this.appCtx.setUserAgent(request.headers['user-agent'] as string);
    this.appCtx.setTimestamp(time().unix());

    response.header('X-Request-Id', request.id);
    response.header('Accept-Language', request.headers['accept-language']);

    return next.handle();
  }
}
