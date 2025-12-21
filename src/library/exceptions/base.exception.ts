import { ResponseDto } from '@libs/dto';
import { MultiLang } from '@libs/types';

export abstract class BaseException extends Error {
  abstract httpStatusCode: number;
  abstract code: string;
  abstract message: string;
  abstract errorMessage: MultiLang;
  abstract details: MultiLang[];

  public getResponse(lang: string): [number, ResponseDto<null>] {
    const response = new ResponseDto<null>();
    response.success = false;
    response.data = null;
    response.meta = null;
    response.error = {
      code: this.code,
      message: this.errorMessage[lang],
      details: this.details.map((detail) => detail[lang]),
    };

    return [this.httpStatusCode, response];
  }
}
