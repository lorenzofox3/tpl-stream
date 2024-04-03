# tpl-steam

[![install size](https://packagephobia.com/badge?p=tpl-stream)](https://packagephobia.com/result?p=tpl-stream)

``tpl-stream`` is a template library that supports streaming. You can use it in your server, but not only, to generate html: it works everywhere as long as the runtime
implements [web streams](https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream).

It is very small compared to the alternatives and does not require any build process, while providing [very good performances](./benchmark).

## Installation

You can install from a package manager like [npm](https://www.npmjs.com/) by running the command

``npm install --save tpl-stream``

Or import the module from a CDN:

```js
import {render, html} from 'https://unpkg.com/tpl-stream/src/index.js';
```

## Usage

### Basics

You can define a template using the ``html`` [tagged template](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals#tagged_templates):

```js
import {html, renderAsString} from 'tpl-stream';

const Greeting = ({name, classname}) => html`<p class="{classname}">${name}</p>`;

const htmlString = await renderAsString(Greeting({name: 'Lorenzofox', classname: 'primary'}))

```

when rendered, the html string will be ``'<p class="primary">Lorenzofox</p>'``
Interpolated expressions are automatically escaped whether they correspond to a text content or to an attribute.

If you wish not to escape a string, you can put it inside an array:

```js
html`<p>${['<span>42</span>']}</p>`
```

### Composition

You can combine several templates to compose more complex templates:

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

When using conditional, via ternary expression for example, make sure all the branches are isomorphic: the templates are compiled for optimization and this based on the interpretation of the first interpolated value:

```js
// don't
<p>${ foo ? html`<span>42</span>` : ''}</p>

// do
<p>${ foo ? html`<span>42</span>` : html``}</p>
```

### Containers

You can interpolate some _containers_: Promise, Iterable(Array) or Objects
These containers must contain template, string or another container

```js
html`<ul>${['foo', 'bar'].map(str => html`<li>${str}</li>`)}</ul>`

// or 

html`<p>${Promise.resolve(html`<span>42</span>`)}</p>`
```

An object container will always be interpreted as a map of attributes (there is no parsing context). 
key value pairs whose value is strictly equal to ``false`` are ignore

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

You can also render as a string, by awaiting the Promise returned by ``renderAsString`` function 

## Perceived speed.

Note that streaming can also improve the _perceived_ speed as the browser renders the HTML (and eventually fetch some resources) while the server has not fully responded to the request.
This is the behavior you can observe below with an exaggerated latency of 1s. You can combine libraries such ``tpl-stream`` with techniques such [Out Of Order streaming](https://lamplightdev.com/) to improve the user experience even further. 

