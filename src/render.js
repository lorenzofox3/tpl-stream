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
      yield* _render(
        typeof resolved === 'string' ? [resolved] : resolved,
        controller,
      );
    } else if (chunk?.[Symbol.asyncIterator]) {
      while (true) {
        const { value: resolved, done } = yield chunk.next();
        if (done === true) {
          break;
        }
        yield* _render(
          typeof resolved === 'string' ? [resolved] : resolved,
          controller,
        );
      }
    } else {
      throw new Error('Unsupported chunk');
    }
  }
}

function render(template) {
  return new ReadableStream({
    start(controller) {
      const buffer = [];
      const iterable = _render(template, {
        enqueue: (val) => buffer.push(val),
      });

      return pump();

      async function pump(chunk) {
        const { value } = iterable.next(chunk);

        if (value?.then) {
          if (buffer.length) {
            controller.enqueue(buffer.join(''));
          }
          const asyncChunk = await value;
          buffer.length = 0;
          return pump(asyncChunk);
        }

        if (buffer.length) {
          controller.enqueue(buffer.join(''));
        }

        controller.close();
      }
    },
  });
}

async function renderAsString(template) {
  const buffer = [];

  for await (const chunk of render(template)) {
    buffer.push(chunk);
  }

  return buffer.join('');
}
