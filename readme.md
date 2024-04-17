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

const Greeting = ({name, classname}) => html`<p class="{classname}">${name}</p>`;

const htmlString = await renderAsString(Greeting({name: 'Lorenzofox', classname: 'primary'}))

```

when rendered, the HTML string will be ``'<p class="primary">Lorenzofox</p>'``
Interpolated expressions are automatically escaped whether they correspond to a text content or to an attribute.

Raw HTML can also be inserted by wrapping the string within an array:

```js
html`<p>${['<span>42</span>']}</p>`
```

### Composition

Multiple templates can be combined together to create more complex templates:

```js
const Tpl1 = ({title, content}) => html`<h1>${title}</h1><main>${content}</main>`;

const Tpl2 = ({name}) => html`<p>${name}</p>`;
    
const htmlString = await renderAsString(Tpl1({
    title:'some title',
    content: Tpl2({name:'Lorenzofox'})
}));

// <h1>some title</h1><main><p>Lorenzofox</p></main>
```

### Conditionals

When using conditional, via ternary expression for example, all the branches should be isomorphic (i.e. return the same type): the templates are compiled for optimisation and this is based on the interpretation of the first interpolated value:

```js
// don't
<p>${ foo ? html`<span>42</span>` : ''}</p>

// do
<p>${ foo ? html`<span>42</span>` : html``}</p>
```

### Containers

Interpolation can work on some _containers_: Promise, Iterable(Array), Streams(anything that implements AsyncIterator) or Objects
These containers must contain a template, a string or another container.

```js
html`<ul>${['foo', 'bar'].map(str => html`<li>${str}</li>`)}</ul>`

// or 

html`<p>${Promise.resolve(html`<span>42</span>`)}</p>`
```

An object container is always be interpreted as a map of attributes (there is no parsing context). 
key-value pairs whose value is strictly equal to ``false`` are ignored.

```js
html`<button ${{disabled:false, ['aria-controls']:'woot'}}>hello</button>`

// <button aria-controls="woot">hello</button>
```

### render

The ``render`` function takes a template as input and returns a ``ReadableStream``. The chunks are split every time there is a pending Promise: 

```js
<p>foo<span>${43}</span>woot<span>${Promise.resolve('woot')}</span></p>

// chunks: ['<p>foo<span>43</span>woot</span>', 'woot'</span></p>]
```

A template can be rendered as a string, by awaiting the Promise returned by ``renderAsString`` function. 

## Perceived speed

Streaming may also improve the _perceived_ speed as the browser renders the HTML (and possibly fetching some resources) while the server has not fully responded to the request.
This behaviour can be observed below: the database has an (exaggerated) latency of 1s when the server calls it to fetch the blog posts data. On the left side, the server has already started streaming the first part of the HTML, and the browser can already render the upper part of the document (and fetch the stylesheets and other resources) while the database is still responding. 

This library can be combined with techniques like [Out Of Order streaming](https://lamplightdev.com/blog/2024/01/10/streaming-html-out-of-order-without-javascript/) to improve the user experience even further. 



https://github.com/lorenzofox3/tpl-stream/assets/2402022/d0a52057-240f-4ee4-afe7-920acea8a1af



