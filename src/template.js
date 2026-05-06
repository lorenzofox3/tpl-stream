export { html, raw };

function raw(value) {
  return [value];
}

function html(templateParts, ...values) {
  return gen({ templateParts, values });
}

function* gen({ templateParts, values }) {
  let str = templateParts[0];
  for (const [i, value] of values.entries()) {
    if (value?.[Symbol.iterator] && typeof value !== 'string') {
      yield str;
      str = templateParts[i + 1];
      yield* value;
    } else if (isAsync(value)) {
      yield str;
      str = templateParts[i + 1];
      yield value;
    } else {
      str +=
        (typeof value === 'object' && value !== null
          ? attributesFragment(value)
          : escape(String(value))) + templateParts[i + 1];
    }
  }
  if (str) {
    yield str;
  }
}

const attributesFragment = (value) =>
  Object.entries(value)
    .filter(([, value]) => value !== false)
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
