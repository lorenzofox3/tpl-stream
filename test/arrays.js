import { test } from 'zora';
import { renderAsString, html } from '../src/index.js';

test('arrays of templates are inlined', async ({ eq }) => {
  const ListItem = (value) => html`<li>${value}</li>`;
  const items = ['item 1', 'item 2', 'item 3'];

  eq(
    await renderAsString(
      // prettier-ignore
      html`<ul>${items.map(ListItem)}</ul>`,
    ),
    `<ul><li>item 1</li><li>item 2</li><li>item 3</li></ul>`,
  );
});

test('arrays of arrays are inlined', async ({ eq }) => {
  const ListItem = (value) => html`<li>${value}</li>`;
  const items = [[html`item 1a`, html`item 1b`], 'item 2', 'item 3'];

  eq(
    await renderAsString(
      // prettier-ignore
      html`<ul>${items.map(ListItem)}</ul>`,
    ),
    `<ul><li>item 1aitem 1b</li><li>item 2</li><li>item 3</li></ul>`,
  );
});

test('arrays of literals are NOT escaped', async ({ eq }) => {
  const ListItem = (value) => value;
  const items = [
    '<script>pwned</script>',
    '<li>item 2</li>',
    '<li>item 3</li>',
  ];

  eq(
    await renderAsString(
      // prettier-ignore
      html`<ul>${items.map(ListItem)}</ul>`,
    ),
    `<ul><script>pwned</script><li>item 2</li><li>item 3</li></ul>`,
  );
});
