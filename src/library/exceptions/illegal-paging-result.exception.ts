import { BaseException } from '@libs/exceptions/base.exception';
import { MultiLang } from '@libs/types';
import { HttpStatus } from '@nestjs/common';

export class IllegalPagingResultException extends BaseException {
  constructor(message = 'Illegal Paging Result') {
    super(message);

    this.message = message;
  }

  code: string = 'ILLEGAL_PAGING_RESULT';
  message: string = 'Illegal Paging Result';
  errorMessage: MultiLang = { en: 'Unmatched paging result format', id: 'Format hasil tidak sesuai' };
  details: MultiLang[] = [
    { en: 'The Result is not following the paging result format', id: 'Hasil tidak sesuai dengan format paging' },
  ];
  httpStatusCode: number = HttpStatus.INTERNAL_SERVER_ERROR;
}
