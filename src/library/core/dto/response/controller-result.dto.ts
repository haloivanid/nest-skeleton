import { MetaResponseDto } from '@libs/core/dto/response/meta-response.dto';
import { HttpStatus } from '@nestjs/common';

export class ControllerResult<T> {
  private constructor(
    public readonly data: T,
    public readonly httpStatus: HttpStatus = HttpStatus.OK,
    public readonly meta: MetaResponseDto | null = null,
  ) {}

  static builder<T>(data: T, httpStatus?: HttpStatus, meta?: MetaResponseDto) {
    return new ControllerResult<T>(data, httpStatus, meta);
  }
}
