import { FastifyHttpOptions } from 'fastify';
import { Logger } from '@nestjs/common';
import { randomUUID } from 'node:crypto';

const log = new Logger('FastifyAdapter');

export const fastifyConfig: FastifyHttpOptions<any> = {
  trustProxy: true,
  genReqId: (_req) => randomUUID(),
  logger: {
    stream: {
      write(msg: string) {
        return log.debug(msg.trim());
      },
    },
  },
};
