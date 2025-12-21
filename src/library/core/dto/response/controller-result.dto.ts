import { MetaResponseDto } from '@libs/core/dto/response/meta-response.dto';

export class ControllerResult<T> {
  private constructor(
    public readonly data: T,
    public readonly meta: MetaResponseDto | null,
  ) {}

  static builder<T>(data: T, meta?: MetaResponseDto) {
    return new ControllerResult<T>(data, meta || null);
  }
}
