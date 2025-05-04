import { templateCache } from './cache.js';

export { html };

function html(templateParts, ...values) {
  if (!templateCache.has(templateParts)) {
    templateCache.set(templateParts, compile(templateParts, ...values));
  }

  return templateCache.get(templateParts)(...values);
}

const { constructor: GeneratorFunction } = function* () {};

const zip = (arr1, arr2) => arr1.map((item, index) => [item, arr2[index]]);

const compile = (templateParts, ...values) => {
  const src = buildSource(templateParts, ...values);
  const args = [
    'utils',
    ...Array.from({ length: values.length }, (_, i) => 'arg' + i),
  ];
  const gen = new GeneratorFunction(...args, src);
  return (...values) => gen({ escape, attributesFragment }, ...values);
};

const buildSource = (templateParts, ...values) => {
  const [first, ...rest] = templateParts;
  const tuples = zip(rest, values);
  return (
    tuples.reduce((src, [tplPart, value], i) => {
      if (value?.[Symbol.iterator] && typeof value !== 'string') {
        return src + `;yield *arg${i};yield \`${tplPart}\``;
      }

      if (isAsync(value)) {
        return src + `;yield arg${i}; yield \`${tplPart}\``;
      }

      if (typeof value === 'object') {
        return src + `+utils.attributesFragment(arg${i}) + \`${tplPart}\``;
      }

      return src + `+utils.escape(String(arg${i})) + \`${tplPart}\``;
    }, `yield \`${first}\``) + ';'
  );
};

const attributesFragment = (value) =>
  Object.entries(value)
    .filter(([_, value]) => value !== false)
    .map(([attr, value]) => `${attr}="${escape(value)}"`)
    .join(' ');

const isAsync = (value) =>
  value?.then !== undefined || value?.[Symbol.asyncIterator];

const escapeMap = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

const htmlEntities = /[&<>"']/g;
const escape = (value) => {
  if (/[&<>"']/.test(value)) {
    return value.replace(htmlEntities, (char) => escapeMap[char]);
  }

  return value;
};
