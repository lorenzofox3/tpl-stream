import { html, raw, render, renderAsString } from '../src/index';

raw: {
  const wrapped: [string] = raw('<span></span>');
  // @ts-expect-error raw can only be a string
  raw(['foo']);
}

html: {
  html`<p>${'text'}</p>`;
  html`<p>${42}</p>`;
  html`<p>${true}</p>`;
  html`<a ${{ href: '/path', disabled: false }}></a>`;
  html`<p>${raw('<b>bold</b>')}</p>`;
  html`<div>${html`<span></span>`}</div>`;
  html`<p>${Promise.resolve('async')}</p>`;
  async function* asyncGen() {
    yield 'chunk';
  }
  html`<p>${asyncGen()}</p>`;

  // @ts-expect-error use raw() to pass unescaped strings, not a plain array
  html`<p>${['<script>xss</script>']}</p>`;
  // @ts-expect-error null is not a valid interpolation
  html`<p>${null}</p>`;
  // @ts-expect-error undefined is not a valid interpolation
  html`<p>${undefined}</p>`;
}

render: {
  const stream: ReadableStream<string> = render(html`<div></div>`);
  render(html`<div></div>`, { highWaterMark: 2 });
  // @ts-expect-error highWaterMark must be a number
  render(html`<div></div>`, { highWaterMark: 'big' });
}

renderAsString: {
  const result: Promise<string> = renderAsString(html`<div></div>`);
}
