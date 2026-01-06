import { CallHandler, ExecutionContext, HttpStatus, Injectable, NestInterceptor } from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { ControllerResult, ResponseDto } from '@libs/core/dto';
import { IllegalControllerResultException } from '@libs/core/exceptions';
import { IllegalPagingResultException } from '@libs/core/exceptions/illegal-paging-result.exception';
import { AppCtxService } from '@libs/core/providers/app-ctx';
import { FastifyReply } from 'fastify';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  constructor(private readonly appCtx: AppCtxService) {}

  intercept(httpCtx: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {
    const res = httpCtx.switchToHttp().getResponse<FastifyReply>();
    const context = this.appCtx.context;

    res.status(HttpStatus.OK);

    return next.handle().pipe(
      map((returnedData) => {
        if (!(returnedData instanceof ControllerResult)) {
          throw new IllegalControllerResultException();
        }

        if (returnedData.meta && !Array.isArray(returnedData.data)) {
          throw new IllegalPagingResultException();
        }

        const responseDto = new ResponseDto();
        responseDto.requestId = context.requestId;
        responseDto.success = true;
        responseDto.data = returnedData.data;
        responseDto.meta = returnedData.meta;
        responseDto.error = null;

        return responseDto;
      }),
    );
  }
}
