import fastify from 'fastify';
import fastifyStatic from '@fastify/static';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tplStreamPlugin } from './tpl-stream/index.js';
import { pugPlugin } from './pug/index.js';
import { ejsPlugin } from './ejs/index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = fastify({
  logger: true,
});

app.register(fastifyStatic, {
  root: join(__dirname, 'public'),
  prefix: '/public/',
});

app.register(tplStreamPlugin, { prefix: '/tpl-stream' });
app.register(pugPlugin, { prefix: '/pug' });
app.register(ejsPlugin, { prefix: '/ejs' });

app.listen({ port: 3000 });
