export { render, renderAsString };

// we use coroutine instead of async iterable to avoid Promise overhead (for perf)
function* _render({ template, enqueue }) {
  if (typeof template === 'string') {
    return enqueue(template);
  }

  for (const chunk of template) {
    if (typeof chunk === 'string') {
      enqueue(chunk);
    } else if (chunk?.[Symbol.iterator]) {
      yield* _render({ template: chunk, enqueue });
    } else if (chunk?.then) {
      const resolved = yield chunk;
      yield* _render({ template: resolved, enqueue });
    } else if (chunk?.[Symbol.asyncIterator]) {
      while (true) {
        const { value: resolved, done } = yield chunk.next();
        if (done === true) {
          break;
        }
        yield* _render({ template: resolved, enqueue });
      }
    } else {
      throw new Error('Unsupported chunk');
    }
  }
}

function render(template, { highWaterMark = 1024 } = {}) {
  const buffer = [];
  const iterable = _render({
    template,
    enqueue: (val) => buffer.push(val),
  });
  let pendingValue;

  return new ReadableStream(
    {
      async pull(controller) {
        return pump(pendingValue);

        async function pump(chunk) {
          const { value, done } = iterable.next(chunk);

          if (done) {
            if (buffer.length > 0) {
              controller.enqueue(buffer.join(''));
              buffer.length = 0;
            }

            controller.close();
            return;
          }

          if (value?.then) {
            if (buffer.length) {
              controller.enqueue(buffer.join(''));
              buffer.length = 0;
            }

            pendingValue = await value;

            if (controller.desiredSize <= 0) {
              return;
            }

            return pump(pendingValue);
          }
        }
      },
    },
    { highWaterMark, size: (chunk) => chunk.length }, // as we work on strings we approximate the byteLength with the string length
  );
}

async function renderAsString(template) {
  const buffer = [];

  for await (const chunk of render(template)) {
    buffer.push(chunk);
  }

  return buffer.join('');
}
