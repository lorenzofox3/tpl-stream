export { render, renderAsString };

// we use coroutine instead of async iterable to avoid Promise overhead (for perf)
function* _render(template, controller) {
  for (const chunk of template) {
    if (typeof chunk === 'string') {
      controller.enqueue(chunk);
    } else if (chunk?.[Symbol.iterator]) {
      yield* _render(chunk, controller);
    } else if (chunk?.then) {
      const resolved = yield chunk;
      if (typeof resolved === 'string') {
        controller.enqueue(resolved);
      } else {
        yield* _render(resolved, controller);
      }
    } else if (chunk?.[Symbol.asyncIterator]) {
      while (true) {
        const { value: resolved, done } = yield chunk.next();
        if (done === true) {
          break;
        }
        if (typeof resolved === 'string') {
          controller.enqueue(resolved);
        } else {
          yield* _render(resolved, controller);
        }
      }
    } else {
      throw new Error('Unsupported chunk');
    }
  }
}

function render(template, { highWaterMark = 1 } = {}) {
  const buffer = [];
  const iterable = _render(template, { enqueue: (val) => buffer.push(val) });
  let pendingValue;

  return new ReadableStream(
    {
      async pull(controller) {
        const chunk = pendingValue;
        pendingValue = undefined;
        return pump(chunk);

        async function pump(chunk) {
          const { value, done } = iterable.next(chunk);

          if (done) {
            if (buffer.length) controller.enqueue(buffer.join(''));
            return controller.close();
          }

          if (!value?.then) return pump(value);

          // Async boundary: flush buffered content and respect backpressure.
          if (buffer.length) {
            controller.enqueue(buffer.join(''));
            buffer.length = 0;
            if (controller.desiredSize <= 0) {
              pendingValue = await value;
              return;
            }
          }

          return pump(await value);
        }
      },
    },
    { highWaterMark },
  );
}

async function renderAsString(template) {
  const buffer = [];

  for await (const chunk of render(template)) {
    buffer.push(chunk);
  }

  return buffer.join('');
}
