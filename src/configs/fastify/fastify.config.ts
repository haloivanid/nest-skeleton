import { FastifyHttpOptions } from 'fastify';
import { Logger } from '@nestjs/common';
import { systemId } from '@libs/utils/uid';
const logger = new Logger('FastifyAdapter');

export const fastifyConfig: FastifyHttpOptions<any> = {
  trustProxy: true,
  genReqId: (_req) => systemId(),
  logger: {
    stream: {
      write(msg: string) {
        return logger.log(msg.trim());
      },
    },
  },
};
