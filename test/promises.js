import { test } from 'zora';
import { renderAsString, html } from '../src/index.js';

test(`Promise that resolves a template is inserted`, async ({ eq }) => {
  const htmlString = await renderAsString(
    html`<div>${Promise.resolve(html`<h1>hello world</h1>`)}</div>`,
  );
  eq(htmlString, `<div><h1>hello world</h1></div>`);
});

test(`Promise that resolves a literal is NOT escaped`, async ({ eq }) => {
  const htmlString = await renderAsString(
    html`<div>${Promise.resolve(`<h1>hello world</h1>`)}</div>`,
  );
  eq(htmlString, `<div><h1>hello world</h1></div>`);
});

test(`Promise that resolves an array is inlined`, async ({ eq }) => {
  const htmlString = await renderAsString(
    // prettier-ignore
    html`<div>${Promise.resolve([
        html`<h1>hello world</h1>`,
        html`<p>how are you?</p>`,
      ])}</div>`,
  );
  eq(htmlString, `<div><h1>hello world</h1><p>how are you?</p></div>`);
});
