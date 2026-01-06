import { config } from 'dotenv';
config({ quiet: true });

import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { MainModule } from './main.module';
import { fastifyConfig } from '@conf/fastify';

void (async () => {
  const adapter = new FastifyAdapter(fastifyConfig);
  const app = await NestFactory.create<NestFastifyApplication>(MainModule, adapter, { bufferLogs: true });

  app.enableCors({ origin: true });

  await app.listen({ host: '0.0.0.0', port: +(process.env.PORT || 3000) });
})();
