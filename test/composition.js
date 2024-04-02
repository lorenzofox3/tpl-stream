import { test } from 'zora';
import { renderAsString, html } from '../src/index.js';

test(`templates can be composed together`, async ({ eq }) => {
  eq(
    await renderAsString(html`<p>foo ${html`<span>${42}</span>`}</p>`),
    '<p>foo <span>42</span></p>',
  );
});

test(`composition can be done by functions`, async ({ eq }) => {
  const Tpl1 = ({ title, content }) =>
    // prettier-ignore
    html`<h1>${title}</h1><main>${content}</main>`;

  const Tpl2 = ({ name }) => html`<p>${name}</p>`;

  const htmlString = await renderAsString(
    Tpl1({
      title: 'some title',
      content: Tpl2({ name: 'Lorenzofox' }),
    }),
  );

  eq(htmlString, '<h1>some title</h1><main><p>Lorenzofox</p></main>');
});
