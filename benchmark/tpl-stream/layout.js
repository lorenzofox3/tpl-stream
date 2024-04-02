import { html } from '../../src/index.js';

const links = [
  { href: '/', name: 'Home' },
  { href: '/blog', name: 'Blog' },
  { href: '/about', name: 'About' },
];
const NavigationLink = ({ name, href, ...rest }) =>
  html`<li><a href="${href}" ${rest}}>${name}</a></li>`;

const Navigation = ({ currentPage = '/' }) =>
  html`<nav>
    <ul>
      ${links.map((linkDef) =>
        NavigationLink({
          ...linkDef,
          ['aria-current']: currentPage === linkDef.href ? 'page' : false,
        }),
      )}
    </ul>
  </nav>`;

export const Page = ({ title, content }) => html`
  <!doctype html>
  <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width,initial-scale=1" />
      <link href="/public/main.css" rel="stylesheet" type="text/css" />
      <link rel="icon" href="./public/favicon.ico" />
      <title>${title}</title>
    </head>
    <body>
      <header id="main-header">
        <img id="logo" alt="blog logo" src="/public/logo.webp" />
        <h1>${title}</h1>
        ${Navigation({ currentPage: '/blog' })}
      </header>
      <main>
        <p>
          Hi! I am Laurent and this is my dev blog. This is where I collect what
          I learn, what I experiment and what I find interesting.
        </p>
        ${content}
      </main>
      <footer><p>© Laurent RENARD. All Rights Reserved.</p></footer>
    </body>
  </html>
`;
