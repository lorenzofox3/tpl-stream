import { test } from 'zora';
import { html, renderAsString } from '../src/index.js';

test('html content is interpolated', async ({ eq }) => {
  eq(await renderAsString(html`<p>${'Lorenzofox'}</p>`), `<p>Lorenzofox</p>`);
  eq(
    await renderAsString(
      // prettier-ignore
      html`${42}${43}<p>${'Lorenzofox'}</p>${true}${'some content'}`,
    ),
    `4243<p>Lorenzofox</p>truesome content`,
  );
});

test('attributes are interpolated', async ({ eq }) => {
  eq(
    await renderAsString(html`<input type="${'number'}" step="${4}" />`),
    `<input type="number" step="4" />`,
  );
});

test('interpolated html is escaped (HTML contexts)', async ({ eq }) => {
  eq(
    await renderAsString(
      html`<p>${'<script>window.alert("bim")</script>'}</p>`,
    ),
    `<p>&lt;script&gt;window.alert(&quot;bim&quot;)&lt;/script&gt;</p>`,
  );
});

test('interpolated attributes are escaped (HTML attribute Contexts)', async ({
  eq,
}) => {
  eq(
    await renderAsString(html`<p id="${'">bim'}"></p>`),
    `<p id="&quot;&gt;bim"></p>`,
  );
});
