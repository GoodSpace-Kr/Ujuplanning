import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
import { consumeFramePack, unpackFrames, decodeOrder } from '../lib/frame-pack.ts';

const manifests = JSON.parse(readFileSync(new URL('../lib/sequence-packs.generated.json', import.meta.url)));
const source = readFileSync(new URL('../lib/sequence-frames.ts', import.meta.url), 'utf8')
  .replace("'./frame-pack'", JSON.stringify(new URL('../lib/frame-pack.ts', import.meta.url).href));
const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
const { createSequenceFrames } = await import(`data:text/javascript;base64,${Buffer.from(js).toString('base64')}`);
const packData = (indices) => {
  const bytes = Buffer.alloc(4 + indices.length * 9);
  bytes.write('UJU1');
  indices.forEach((frame, i) => { bytes.writeUInt32LE(frame, 4 + i * 9); bytes.writeUInt32LE(1, 8 + i * 9); bytes[12 + i * 9] = frame; });
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
};
const settle = async () => { for (let i = 0; i < 12; i++) await new Promise(resolve => setImmediate(resolve)); };

test('every desktop/mobile WebP is preserved byte-for-byte with over 90% fewer bulk requests', async () => {
  for (const [sequence, count] of [['studio', 241], ['telescope', 233]]) {
    for (const variant of ['desktop', 'mobile']) {
      const packs = manifests[sequence][variant];
      const seen = new Set();
      assert.ok(packs.length < count / 10);
      for (const pack of packs) {
        const file = readFileSync(new URL(`../public${pack.url}`, import.meta.url));
        const frames = unpackFrames(file.buffer.slice(file.byteOffset, file.byteOffset + file.byteLength), count);
        assert.deepEqual([...frames.keys()], pack.frames);
        for (const [index, blob] of frames) {
          assert.ok(!seen.has(index)); seen.add(index);
          const original = readFileSync(new URL(`../public/assets/${sequence}-sequence/${variant}/${String(index).padStart(4, '0')}.webp`, import.meta.url));
          assert.deepEqual(Buffer.from(await blob.arrayBuffer()), original);
        }
      }
      assert.equal(seen.size, count);
    }
  }
});

test('truncated or corrupt packs fail without returning partial images', () => {
  assert.throws(() => unpackFrames(new ArrayBuffer(2), 241));
  assert.throws(() => unpackFrames(packData([241]), 241));
  assert.throws(() => unpackFrames(packData([1, 1]), 241));
  assert.throws(() => unpackFrames(packData([0]).slice(0, -1), 241));
});

test('streaming paints complete frames before the download ends, including split headers', async () => {
  const bytes = new Uint8Array(packData([0, 12, 24]));
  let controller;
  const stream = new ReadableStream({ start(c) { controller = c; } });
  const received = [];
  const consuming = consumeFramePack(new Response(stream), 25, (frame) => received.push(frame));
  controller.enqueue(bytes.slice(0, 2)); await settle(); assert.deepEqual(received, []);
  controller.enqueue(bytes.slice(2, 13)); await settle(); assert.deepEqual(received, [0]);
  controller.enqueue(bytes.slice(13, 24)); await settle(); assert.deepEqual(received, [0, 12]);
  controller.enqueue(bytes.slice(24)); controller.close(); await consuming;
  assert.deepEqual(received, [0, 12, 24]);
  await assert.rejects(() => consumeFramePack(new Response(bytes.slice(0, -1)), 25, () => {}));
});

test('a fast jump decodes an available nearby frame before waiting for exact neighbours', () => {
  assert.deepEqual(decodeOrder(113, [0, 96, 108, 120, 240], 241).slice(0, 2), [113, 108]);
});

function mockBrowser(t, fetcher) {
  const saved = { fetch: globalThis.fetch, document: globalThis.document, createImageBitmap: globalThis.createImageBitmap };
  const released = [];
  globalThis.document = { hidden: false };
  globalThis.fetch = fetcher;
  globalThis.createImageBitmap = async blob => ({ width: 1920, height: 1080, close() { released.push(blob); } });
  t.after(() => Object.assign(globalThis, saved));
  return released;
}

test('an urgent frame loads while packs are pending; decoded memory stays bounded and is released', async t => {
  const requests = [];
  const resolvers = new Map();
  const released = mockBrowser(t, (url, options) => {
    requests.push({ url, signal: options.signal });
    return new Promise(resolve => resolvers.set(url, resolve));
  });
  const frames = createSequenceFrames({ count: 25, directory: '/frames', packs: [
    { url: '/overview', frames: [0, 12, 24] },
    { url: '/part1', frames: Array.from({ length: 11 }, (_, i) => i + 1) },
    { url: '/part2', frames: Array.from({ length: 11 }, (_, i) => i + 13) },
  ], decodedLimit: 8, onChange() {}, onFailure() { assert.fail('unexpected failure'); } });
  frames.request(0, true);
  assert.equal(requests.length, 3);
  resolvers.get('/frames/0000.webp')(new Response(new Blob(['first'])));
  await settle();
  assert.equal(frames.get(0, true).index, 0);
  frames.request(19, true);
  assert.ok(resolvers.has('/frames/0019.webp'));
  resolvers.get('/overview')(new Response(packData([0, 12, 24])));
  await settle();
  assert.equal(frames.get(19).index, 24);
  resolvers.get('/part1')(new Response(packData(Array.from({ length: 11 }, (_, i) => i + 1))));
  await settle();
  resolvers.get('/part2')(new Response(packData(Array.from({ length: 11 }, (_, i) => i + 13))));
  await settle();
  for (let i = 0; i < 25; i++) {
    frames.request(i, true); await settle();
    assert.equal(frames.get(i, true).index, i);
    assert.ok(frames.stats().decoded <= 8);
  }
  frames.destroy();
  assert.ok(requests.every(r => r.signal.aborted));
  assert.ok(released.length >= 25);
  // A response completing after unmount cannot resurrect the cache.
  resolvers.get('/frames/0019.webp')(new Response(new Blob(['late'])));
  await settle();
  assert.deepEqual(frames.stats(), { loaded: 0, decoded: 0 });
});

test('reduced motion and inactive sections do not fetch a whole movie', async t => {
  const urls = [];
  mockBrowser(t, async url => { urls.push(url); return new Response(new Blob(['frame'])); });
  const frames = createSequenceFrames({ count: 241, directory: '/frames', packs: manifests.studio.desktop, decodedLimit: 8, onChange() {}, onFailure() {} });
  frames.request(0, false); await settle(); assert.equal(urls.length, 0);
  frames.request(0, true, true); await settle();
  frames.request(240, true, true); await settle();
  assert.deepEqual(urls, ['/frames/0000.webp', '/frames/0240.webp']);
  frames.destroy();
});

test('missing packs retry twice then fall back to individual frames', async t => {
  const urls = [];
  mockBrowser(t, async url => { urls.push(url); return url === '/missing' ? new Response('', { status: 404 }) : new Response(new Blob(['frame'])); });
  const frames = createSequenceFrames({ count: 3, directory: '/frames', packs: [{ url: '/missing', frames: [0, 1, 2] }], decodedLimit: 8, onChange() {}, onFailure() {} });
  frames.request(0, true); await settle();
  assert.equal(urls.filter(u => u === '/missing').length, 2);
  assert.equal(frames.stats().loaded, 3);
  frames.destroy();
});
