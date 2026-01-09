import { config } from 'dotenv';
config({ quiet: true });

import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { MainModule } from './main.module';
import { ConfigService } from '@nestjs/config';
import { ValidatedEnv } from '@conf/env/env.schema';
import { fastifyConfig } from '@conf/fastify';

const bootstrap = async () => {
  const app = await NestFactory.create<NestFastifyApplication>(MainModule, new FastifyAdapter(fastifyConfig), {
    bufferLogs: true,
    rawBody: true,
  });

  app.enableCors({ origin: true });

  const configService = app.get(ConfigService<ValidatedEnv, true>);
  const port = configService.get('PORT', { infer: true });

  await app.listen({ host: '0.0.0.0', port });
};

void bootstrap();
