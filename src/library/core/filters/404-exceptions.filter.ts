import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { MultiLang } from '@libs/types';
import { ResponseDto } from '@libs/core/dto';
import { FastifyReply, FastifyRequest } from 'fastify';
import { systemId } from '@libs/utils/uid';
import { AppCtxService } from '../providers/app-ctx/app-ctx.service';

/**
 * Exception filter for handling 404 Not Found exceptions.
 * Before it was handled by RequestInterceptor
 * @class
 * @implements {ExceptionFilter}
 */
@Catch(NotFoundException)
@Injectable()
export class NotFoundExceptionFilter implements ExceptionFilter {
  constructor(private readonly appCtx: AppCtxService) {}

  catch(_: NotFoundException, host: ArgumentsHost): void {
    const http = host.switchToHttp();
    const request = http.getRequest<FastifyRequest>();
    const res = http.getResponse<FastifyReply>();

    const requestId = request.id || systemId();
    const requestedLang = request.headers['accept-language'] || 'en';

    res.header('X-Request-Id', requestId);
    res.header('accept-language', requestedLang);

    const httpStatusCode: number = HttpStatus.NOT_FOUND;
    const code: string = 'NOT_FOUND_EXCEPTION';
    const errorMessage: MultiLang = { en: 'Not Found', id: 'Tidak Ditemukan' };
    const details: MultiLang[] = [{ en: 'Method Not Found', id: 'Metode Tidak Ditemukan' }];

    const response = new ResponseDto<null>();
    response.requestId = requestId;
    response.success = false;
    response.data = null;
    response.meta = null;
    response.error = {
      code,
      message: errorMessage[requestedLang],
      details: details.map((detail) => detail[requestedLang]),
    };

    res.status(httpStatusCode).send(response);
    this.appCtx.reset();
  }
}
