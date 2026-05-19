import { test } from 'zora';
import { renderAsString, html } from '../src/index.js';

test('object pairs result into html attributes', async ({ eq }) => {
  const htmlString = await renderAsString(
    html`<input ${{ type: 'number', step: 4, ['aria-hidden']: true }} />`,
  );
  eq(htmlString, `<input type="number" step="4" aria-hidden="true" />`);
});

test('attribute values are escaped', async ({ eq }) => {
  const htmlString = await renderAsString(
    // prettier-ignore
    html`<input ${{ type: 'number', step: '"niark', ['aria-hidden']: true }} />`,
  );
  eq(
    htmlString,
    `<input type="number" step="&quot;niark" aria-hidden="true" />`,
  );
});

test('attributes whose value is false are ignored', async ({ eq }) => {
  const htmlString = await renderAsString(
    // prettier-ignore
    html`<input ${{ type: 'number', step: false }} />`,
  );
  eq(htmlString, `<input type="number" />`);
});

test('attribute names are escaped', async ({ eq }) => {
  const htmlString = await renderAsString(
    // prettier-ignore
    html`<input ${{ 'value" onxss="injected': 'safe' }} />`,
  );
  eq(
    htmlString,
    `<input value&quot; onxss=&quot;injected="safe" />`,
  );
});
