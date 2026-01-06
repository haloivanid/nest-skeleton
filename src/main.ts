import { config } from 'dotenv';
config({ quiet: true });

import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { MainModule } from './main.module';
import { fastifyConfig } from '@conf/fastify';
import { ConfigService } from '@nestjs/config';
import { ValidatedEnv } from '@conf/env/env.schema';

void (async () => {
  const adapter = new FastifyAdapter(fastifyConfig);
  const app = await NestFactory.create<NestFastifyApplication>(MainModule, adapter, { bufferLogs: true });

  app.enableCors({ origin: true });

  // Get validated PORT from ConfigService
  const configService = app.get(ConfigService<ValidatedEnv, true>);
  const port = configService.get('PORT', { infer: true });

  await app.listen({ host: '0.0.0.0', port });
})();
