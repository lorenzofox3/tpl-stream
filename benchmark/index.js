import fastify from 'fastify';
import { render } from '../src/index.js';
import { Page } from './tpl-stream/layout.js';
import { getPosts } from './blog-posts.js';
import { Blog } from './tpl-stream/blog.js';
import fastifyStatic from '@fastify/static';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = fastify({
  logger: true,
});

app.register(fastifyStatic, {
  root: join(__dirname, 'public'),
  prefix: '/public/',
});

app.register(async (instance) => {
  instance.route({
    method: 'GET',
    url: '/tpl-stream',
    async handler(req, reply) {
      reply.type('text/html');
      return render(
        Page({
          title: 'Blog',
          content: getPosts().then((posts) => Blog({ posts })),
        }),
      );
    },
  });
});

app.listen({ port: 3000 });
