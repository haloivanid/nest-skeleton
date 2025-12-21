import { EnvConfig } from '@conf/env';
EnvConfig.init();

import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { MainModule } from './main.module';
import { fastifyConfig } from '@conf/fastify';

void (async () => {
  const adapter = new FastifyAdapter(fastifyConfig);
  const app = await NestFactory.create<NestFastifyApplication>(MainModule, adapter, { bufferLogs: true });

  app.enableCors({ origin: true });

  await app.listen({ host: '0.0.0.0', port: EnvConfig.known.SERVER_PORT });
})();
