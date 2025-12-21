import { BaseException } from '@libs/core/exceptions/base.exception';
import { HttpStatus } from '@nestjs/common';
import { MultiLang } from '@libs/types';

export class IllegalControllerResultException extends BaseException {
  constructor(message = 'Illegal Controller Result') {
    super(message);

    this.message = message;
  }

  code: string = 'ILLEGAL_CONTROLLER_RESULT';
  message: string = 'Illegal Controller Result';
  errorMessage: MultiLang = { en: 'Illegal Controller Result', id: 'Ilegal Hasil pada Controller' };
  details: MultiLang[] = [
    {
      en: 'Controller result must be instanceof ControllerResult',
      id: 'Hasil Controller harus instanceof ControllerResult',
    },
  ];
  httpStatusCode: number = HttpStatus.INTERNAL_SERVER_ERROR;
}
