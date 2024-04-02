import { html } from '../../src/index.js';

const BlogPost = ({
  title,
  author,
  description,
  publicationDate,
  permalink,
}) => html`
  <article class="post-preview">
    <h3>${title}</h3>
    <p class="meta">
      Published by ${author} on <time>${publicationDate}</time>
    </p>
    <p>${description}</p>
    <a rel="bookmark" href="${permalink}">Read full article</a>
  </article>
`;

export const Blog = ({ posts }) =>
  html`<section>
    <h2>Latest articles</h2>
    ${posts.map(BlogPost)}
  </section>`;
