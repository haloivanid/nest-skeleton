import { User } from '@module/users/domain';
import { FastifyReply as FRep, FastifyRequest as FReq } from 'fastify';

declare module 'fastify' {
  export interface FastifyRequest extends FReq {
    user?: User;
    rawBody?: Buffer;
  }

  export type FastifyReply = FRep;
}
