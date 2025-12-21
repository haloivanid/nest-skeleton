import { ErrorResponseDto } from '@libs/dto/response/error-response.dto';
import { MetaResponseDto } from '@libs/dto/response/meta-response.dto';

export class ResponseDto<T> {
  requestId: string;
  success: boolean;
  data: T | null;
  meta: MetaResponseDto | null;
  error: ErrorResponseDto | null;
}
