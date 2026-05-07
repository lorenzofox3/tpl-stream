import { test } from 'zora';
import { render, html } from '../src/index.js';

// An async iterator (not just async iterable) whose next() calls are tracked.
// render.js calls chunk.next() directly so the object must expose next() itself.
function makeTrackedAsyncIter(items) {
  const nextCalls = [];
  let i = 0;
  const iter = {
    [Symbol.asyncIterator]() {
      return this;
    },
    next() {
      nextCalls.push(i);
      return Promise.resolve(
        i < items.length
          ? { value: items[i++], done: false }
          : { value: undefined, done: true },
      );
    },
  };
  return { iter, nextCalls };
}

// Waits one macrotask so that any queued microtask cascades can settle first.
const tick = () => new Promise((r) => setTimeout(r, 0));

test('fast producer does not race ahead of a slow consumer', async ({ eq }) => {
  const { iter, nextCalls } = makeTrackedAsyncIter(['a', 'b', 'c']);
  const stream = render(html`${iter}`, { highWaterMark: 1 });
  const reader = stream.getReader();

  for (let consumed = 0; consumed < 3; consumed++) {
    await reader.read();
    // Simulate a slow consumer — give the event loop a full turn.
    await tick();

    // With backpressure the producer should be at most 1 call ahead.
    // Without backpressure all next() calls fire eagerly before the first read.
    eq(
      nextCalls.length <= consumed + 2,
      true,
      `after ${consumed + 1} reads: next() called ${nextCalls.length} times (want ≤ ${consumed + 2})`,
    );
  }

  await reader.read(); // drain done signal
});

test('async generator body does not advance past yield while consumer is idle', async ({
  eq,
}) => {
  const log = [];

  // Four items so we can check 2-levels-ahead without hitting the 1-look-ahead
  // that is inherent in knowing when to flush the buffer.
  async function* source() {
    log.push('before-a'); yield 'a';
    log.push('before-b'); yield 'b';
    log.push('before-c'); yield 'c';
    log.push('before-d'); yield 'd';
  }

  const stream = render(html`${source()}`, { highWaterMark: 1 });
  const reader = stream.getReader();

  await reader.read(); // 'a'
  await tick();
  // With 1-look-ahead: log = ['before-a', 'before-b'] — 'before-c' not yet reached.
  // With eager impl: entire generator runs upfront → 'before-c' IS there → test fails.
  eq(log.includes('before-c'), false, 'before-c should not be in log after reading a');

  await reader.read(); // 'b'
  await tick();
  // With 1-look-ahead: log = ['before-a', 'before-b', 'before-c'] — 'before-d' not yet.
  eq(log.includes('before-d'), false, 'before-d should not be in log after reading b');

  await reader.read(); // 'c'
  await reader.read(); // 'd'
  await reader.read(); // done
});

test('all content is delivered in order', async ({ eq }) => {
  const { iter } = makeTrackedAsyncIter(['b', 'c']);
  const chunks = [];

  for await (const chunk of render(html`a${iter}d`)) {
    chunks.push(chunk);
  }

  eq(chunks.join(''), 'abcd');
});

test('stream closes after all items are consumed', async ({ eq }) => {
  const { iter } = makeTrackedAsyncIter(['x', 'y']);
  const reader = render(html`${iter}`).getReader();

  const values = [];
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    values.push(value);
  }

  eq(values.join(''), 'xy');
});

test('slow consumer receives all data via pipeTo', async ({ eq }) => {
  const { iter } = makeTrackedAsyncIter(['p', 'q', 'r']);
  const received = [];

  const writable = new WritableStream({
    async write(chunk) {
      received.push(chunk);
      await tick(); // slow writer
    },
  });

  await render(html`${iter}`).pipeTo(writable);

  eq(received.join(''), 'pqr');
});

test('adapts to desiredSize — buffers more bytes per pull when highWaterMark is larger', async ({
  eq,
}) => {
  const { iter, nextCalls } = makeTrackedAsyncIter(['a', 'b', 'c', 'd']);

  // highWaterMark: 2 means 2 bytes. '' (0 bytes) doesn't reduce desiredSize, so pull()
  // keeps going: 'a' (1 byte, desiredSize=1) then 'b' (1 byte, desiredSize=0) — 3 next()
  // calls total. With HWM=1 byte the stream stops after 'a' (2 next() calls).
  const stream = render(html`${iter}`, { highWaterMark: 2 });
  const reader = stream.getReader();

  // Let the initial pull() run to completion (all Promise.resolve microtasks settle).
  await tick();

  eq(
    nextCalls.length >= 3,
    true,
    `expected ≥3 next() calls to fill HWM=2 bytes, got ${nextCalls.length}`,
  );

  // '', 'a', and 'b' are already queued — reads should be immediate.
  await reader.read(); // '' — empty static part of html`${iter}`
  eq((await reader.read()).value, 'a');
  eq((await reader.read()).value, 'b');

  while (!(await reader.read()).done) {}
});

test('sync-only templates are unaffected', async ({ eq }) => {
  const chunks = [];

  for await (const chunk of render(html`<p>${'hello'} ${'world'}</p>`)) {
    chunks.push(chunk);
  }

  eq(chunks.join(''), '<p>hello world</p>');
});
