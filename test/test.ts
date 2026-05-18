import { html, raw, render, renderAsString, HTMLTemplate } from '../src/index';

raw: {
  const wrapped: [string] = raw('<span></span>');
  // @ts-expect-error raw can only be a string
  raw(['foo']);
  // @ts-expect-error unsafe container resolving to string
  html`<p>${Promise.resolve('async')}</p>`;
  html`<p>${Promise.resolve(raw('async'))}</p>`;

  async function* asyncGen() {
    yield 'chunk';
  }
  // @ts-expect-error unsafe container resolving to string
  html`<p>${asyncGen()}</p>`;
  html`<p>
    ${(async function* otherGen() {
      yield raw('hello ');
    })()}
  </p>`;
  // @ts-expect-error use raw() to pass unescaped strings, not a plain array
  html`<p>${['<script>xss</script>']}</p>`;
}

html: {
  html`<p>${'text'}</p>`;
  html`<p>${42}</p>`;
  html`<p>${true}</p>`;
  html`<a ${{ href: '/path', disabled: false }}></a>`;
  html`<p>${raw('<b>bold</b>')}</p>`;
  html`<div>${html`<span></span>`}</div>`;
  html`<p>${Promise.resolve(html`<b>bold</b>`)}</p>`;
  async function* asyncTemplateGen() {
    yield html`<li>item</li>`;
  }
  html`<ul>
    ${asyncTemplateGen()}
  </ul>`;

  html`<div>${Promise.resolve([html`<h1>a</h1>`, html`<p>b</p>`])}</div>`;

  // @ts-expect-error null is not a valid interpolation
  html`<p>${null}</p>`;
  // @ts-expect-error undefined is not a valid interpolation
  html`<p>${undefined}</p>`;
}

objects: {
  html`<input ${{ type: 'number', step: 4, ['aria-hidden']: true }} />`;
  html`<input
    ${{ type: 'number', step: '"escaped"', ['aria-hidden']: true }}
  />`;
  // false attribute values are valid (runtime ignores them)
  html`<input ${{ type: 'number', step: false }} />`;
}

render: {
  const stream: ReadableStream<string> = render(html`<div></div>`);
  render(html`<div></div>`, { highWaterMark: 512 });
  // @ts-expect-error highWaterMark must be a number
  render(html`<div></div>`, { highWaterMark: 'big' });

  // getReader() returns a reader typed to string chunks
  const reader: ReadableStreamDefaultReader<string> = render(
    html`<p></p>`,
  ).getReader();
  const chunk: ReadableStreamReadResult<string> = await reader.read();

  // pipeTo accepts a WritableStream<string>
  render(html`<p></p>`).pipeTo(new WritableStream<string>());

  // for-await iteration yields string chunks
  for await (const c of render(html`<p></p>`)) {
    const _s: string = c;
  }
}

renderAsString: {
  const result: Promise<string> = renderAsString(html`<div></div>`);
}

arrayValues: {
  const ListItem = (value: HTMLTemplate | HTMLTemplate[]) =>
    html`<li>${value}</li>`;
  const items = [html`item 1`, html`item 2`, html`'item 3`];
  html`<ul>
    ${items.map(ListItem)}
  </ul>`;
  const otherItems = [
    [html`item 1a`, html`item 1b`],
    html`item 2`,
    html`item 3`,
  ];
  html`<ul>
    ${otherItems.map(ListItem)}
  </ul>`;
}

composition: {
  // templates compose inline
  html`<p>foo ${html`<span>${42}</span>`}</p>`;

  // typed function components
  const Layout = ({
    title,
    content,
  }: {
    title: string;
    content: HTMLTemplate;
  }) =>
    html`<h1>${title}</h1>
      <main>${content}</main>`;
  const Card = ({ name }: { name: string }): HTMLTemplate =>
    html`<p>${name}</p>`;
  renderAsString(Layout({ title: 'hello', content: Card({ name: 'world' }) }));
}

iterable: {
  const ListItem = (value: string | HTMLTemplate | HTMLTemplate[]) =>
    html`<li>${value}</li>`;

  function* syncTemplates() {
    yield ListItem('item 1');
    yield ListItem('item 2');
    yield ListItem('item 3');
  }
  html`<ul>
    ${syncTemplates()}
  </ul>`;

  function* syncNested() {
    yield ListItem([html`item 1a`, html`item 1b`]);
    yield ListItem('item 2');
    yield ListItem('item 3');
    yield raw('item 3');
  }
  html`<ul>
    ${syncNested()}
  </ul>`;

  // sync generator yielding strings is unsafe (strings are not escaped)
  function* syncStrings() {
    yield '<script>pwned</script>';
  }
  // prettier-ignore
  // @ts-expect-error sync Generator<string> is not a valid HTMLValue
  html`<ul>${syncStrings()}</ul>`;
}
