import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import view from '@fastify/view';
import ejs from 'ejs';
import { getPosts } from '../blog-posts.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
export const ejsPlugin = async (instance) => {
  instance.register(view, {
    engine: {
      ejs,
    },
    root: __dirname,
  });

  instance.route({
    method: 'GET',
    url: '/',
    async handler(req, reply) {
      reply.type('text/html');
      const posts = await getPosts();
      return reply.view('./layout', {
        title: 'Blog',
        posts,
        currentPage: '/blog',
      });
    },
  });
};
