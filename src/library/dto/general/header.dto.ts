import { FastifyRequest } from 'fastify';

export class GeneralHeaderDto {
  acceptLanguage: 'id' | 'en';

  static builder(req: FastifyRequest) {
    const header = new GeneralHeaderDto();

    const knownLang = ['id', 'en'];
    const requestedLang = req.headers['accept-language'] || 'en';
    header.acceptLanguage = knownLang.includes(requestedLang) ? (requestedLang as 'id' | 'en') : ('en' as 'id' | 'en');

    return header;
  }
}
