# tpl-stream

[![install size](https://packagephobia.com/badge?p=tpl-stream)](https://packagephobia.com/result?p=tpl-stream)

``tpl-stream`` is a Javascript template library that supports streaming. It helps to generate HTML in a server environment, but not only. It runs anywhere, as long as the runtime implements [web streams](https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream).

It is very small compared to the alternatives and does not require a build step, while providing [very good performance](./benchmark). More details can be found in [this blog post](https://lorenzofox.dev/posts/html-streaming-part-2/)

## Installation

The library can be installed from a package manager like [npm](https://www.npmjs.com/) by running the command

``npm install --save tpl-stream``

Or imported from a CDN:

```js
import {render, html} from 'https://unpkg.com/tpl-stream/src/index.js';
```

## Usage

### Basics

A template is defined using the ``html`` [tagged template](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals#tagged_templates):

```js
import {html, renderAsString} from 'tpl-stream';

const Greeting = ({name, classname}) => html`<p class="${classname}">${name}</p>`;

const htmlString = await renderAsString(Greeting({name: 'world', classname: 'primary'}));
// '<p class="primary">world</p>'
```

Interpolated expressions are automatically escaped whether they correspond to text content or an attribute value.

Raw HTML can be inserted with the ``raw`` function. This is the only way to bypass automatic escaping, making unsafe interpolations explicit:

```js
import {html, raw, renderAsString} from 'tpl-stream';

html`<p>${raw('<span>42</span>')}</p>`
```

> **Warning for JavaScript users:** any iterable value (e.g. a plain array) passed as an interpolation is yielded as-is without escaping. TypeScript users get a compile-time error when bypassing ``raw``; plain JavaScript offers no such guard, so take care not to interpolate unsanitised user input inside an iterable.

### Composition

Templates compose by nesting — any interpolated value can itself be a template:

```js
const Tpl1 = ({title, content}) => html`<h1>${title}</h1><main>${content}</main>`;

const Tpl2 = ({name}) => html`<p>${name}</p>`;

const htmlString = await renderAsString(Tpl1({
    title: 'some title',
    content: Tpl2({name: 'world'}),
}));

// <h1>some title</h1><main><p>world</p></main>
```

### Containers

Interpolation supports several _containers_: Promise, Iterable (Array), Streams (anything implementing AsyncIterator), or plain objects.
Containers must contain a template, a string, or another container.

```js
html`<ul>${['foo', 'bar'].map(str => html`<li>${str}</li>`)}</ul>`

// or

html`<p>${Promise.resolve(html`<span>42</span>`)}</p>`
```

A plain object is always interpreted as a map of HTML attributes. Key-value pairs whose value is strictly ``false`` are omitted.

```js
html`<button ${{disabled: false, ['aria-controls']: 'woot'}}>hello</button>`

// <button aria-controls="woot">hello</button>
```

### render

The ``render`` function takes a template and returns a ``ReadableStream``. Chunks are flushed at every async boundary (Promise or async iterator):

```js
const stream = render(html`<p>foo<span>${Promise.resolve('bar')}</span></p>`);

// chunks: ['<p>foo<span>', 'bar</span></p>']
```

``renderAsString`` collects all chunks into a single awaited string:

```js
const html = await renderAsString(template);
```

## Perceived speed

Streaming improves _perceived_ speed because the browser can start rendering and fetching sub-resources while the server is still generating the rest of the page.

The example below has an (exaggerated) 1s database latency. On the left, the server streams the initial HTML immediately so the browser can render the page header and fetch stylesheets before the data arrives.

This library pairs well with techniques like [Out Of Order streaming](https://lamplightdev.com/blog/2024/01/10/streaming-html-out-of-order-without-javascript/) for even better user experience.



https://github.com/lorenzofox3/tpl-stream/assets/2402022/d0a52057-240f-4ee4-afe7-920acea8a1af


