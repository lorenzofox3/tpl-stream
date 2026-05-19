export { html, raw };

function raw(value) {
  return [value];
}

function* html(templateParts, ...values) {
  const [firstPart, ...rest] = templateParts;

  yield firstPart;

  const pairs = values.map((value, index) => [value, rest[index]]);

  for (const [value, part] of pairs) {
    if (value?.[Symbol.iterator] && typeof value !== 'string') {
      yield* value;
      yield part;
    } else if (isAsync(value)) {
      yield* [value, part];
    } else {
      yield (typeof value === 'object' && value !== null
        ? attributesFragment(value)
        : isNil(value)
          ? ''
          : escape(String(value))) + part;
    }
  }
}

const attributesFragment = (value) =>
  Object.entries(value)
    .filter(([, value]) => value !== false)
    .map(([attr, value]) => `${escape(attr)}="${escape(value)}"`)
    .join(' ');

const isAsync = (value) =>
  value?.then !== undefined || value?.[Symbol.asyncIterator];

const isNil = (value) => value === null || value === undefined;

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
