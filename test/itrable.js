import { test } from 'zora';
import { renderAsString, html } from '../src/index.js';

test('iterable of templates are inlined', async ({ eq }) => {
  const ListItem = (value) => html`<li>${value}</li>`;
  function* items() {
    yield ListItem('item 1');
    yield ListItem('item 2');
    yield ListItem('item 3');
  }

  eq(
    await renderAsString(
      // prettier-ignore
      html`<ul>${items()}</ul>`,
    ),
    `<ul><li>item 1</li><li>item 2</li><li>item 3</li></ul>`,
  );
});

test('iterable of iterable are inlined', async ({ eq }) => {
  const ListItem = (value) => html`<li>${value}</li>`;
  function* iterable() {
    yield ListItem([html`item 1a`, html`item 1b`]);
    yield ListItem('item 2');
    yield ListItem('item 3');
  }

  eq(
    await renderAsString(
      // prettier-ignore
      html`<ul>${iterable()}</ul>`,
    ),
    `<ul><li>item 1aitem 1b</li><li>item 2</li><li>item 3</li></ul>`,
  );
});

test('iterable of literals are NOT escaped', async ({ eq }) => {
  function* iterable() {
    yield '<script>pwned</script>';
    yield '<li>item 2</li>';
    yield '<li>item 3</li>';
  }

  eq(
    await renderAsString(
      // prettier-ignore
      html`<ul>${iterable()}</ul>`,
    ),
    `<ul><script>pwned</script><li>item 2</li><li>item 3</li></ul>`,
  );
});
