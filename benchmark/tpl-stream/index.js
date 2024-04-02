import { render } from '../../src/index.js';
import { Page } from './layout.js';
import { getPosts } from '../blog-posts.js';
import { Blog } from './blog.js';

export const tplStreamPlugin = async (instance) => {
  instance.route({
    method: 'GET',
    url: '/',
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
};
