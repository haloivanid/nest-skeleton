import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { ControllerResult, ResponseDto } from '@libs/dto';
import { IllegalControllerResultException } from '@libs/exceptions';
import { IllegalPagingResultException } from '@libs/exceptions/illegal-paging-result.exception';
import { AppCtxService } from '@libs/app-ctx';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  constructor(private readonly appCtx: AppCtxService) {}

  intercept(_: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {
    const context = this.appCtx.context;

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
