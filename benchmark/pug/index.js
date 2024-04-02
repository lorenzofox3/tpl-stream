import pug from 'pug';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getPosts } from '../blog-posts.js';

const __dirname = dirname(fileURLToPath(import.meta.url)) + '/';
export const pugPlugin = async (instance) => {
  const render = pug.compileFile(join(__dirname, 'blog.pug'), {
    basedir: __dirname,
  });

  instance.route({
    method: 'GET',
    url: '/',
    async handler(req, reply) {
      reply.type('text/html');
      const posts = await getPosts();
      return render({
        title: 'Blog',
        currentPage: '/blog',
        posts,
      });
    },
  });
};
