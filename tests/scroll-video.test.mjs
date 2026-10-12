import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, statSync } from 'node:fs';
import ts from 'typescript';

// Exercise the browser-independent queue with real delayed media events.
const source = readFileSync(new URL('../lib/scroll-video.ts', import.meta.url), 'utf8')
  .replace(/import .* from '\.\/sequence-frames';/, `const decodeFrame = async blob => ({ width: 960, height: 540, close() {} }); const releaseFrame = image => image.close();`);
const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
const { createScrollVideo } = await import(`data:text/javascript;base64,${Buffer.from(js).toString('base64')}`);
const settle = async () => { for (let i = 0; i < 8; i++) await new Promise(resolve => setImmediate(resolve)); };

function browser(t) {
  const saved = { document: globalThis.document, requestAnimationFrame: globalThis.requestAnimationFrame, cancelAnimationFrame: globalThis.cancelAnimationFrame, fetch: globalThis.fetch };
  const callbacks = new Map(), seeks = [], loads = [], requests = [];
  let next = 1, position = 0;
  const video = new EventTarget();
  Object.assign(video, { dataset: {}, style: {}, setAttribute() {}, remove() {}, readyState: 0, seeking: false, videoWidth: 1280, videoHeight: 720, duration: 241 / 24, buffered: { length: 1, start: () => 0, end: () => 241 / 24 }, load() { loads.push(this.src); }, pause() {}, removeAttribute() { this.src = ''; } });
  Object.defineProperty(video, 'currentTime', { get: () => position, set: value => { position = value; video.seeking = true; seeks.push(value); } });
  const canvas = { width: 0, height: 0, getContext: () => ({ drawImage() {} }) };
  globalThis.document = { hidden: false, body: { appendChild() {} }, createElement: tag => tag === 'video' ? video : canvas };
  globalThis.requestAnimationFrame = fn => { callbacks.set(next, fn); return next++; };
  globalThis.cancelAnimationFrame = id => callbacks.delete(id);
  globalThis.fetch = async url => { requests.push(url); return new Response(new Blob(['still'])); };
  t.after(() => Object.assign(globalThis, saved));
  return {
    video, seeks, loads, requests,
    flush() { const pending = [...callbacks.values()]; callbacks.clear(); pending.forEach(fn => fn(1)); },
    ready() { video.readyState = 2; video.dispatchEvent(new Event('loadedmetadata')); video.dispatchEvent(new Event('loadeddata')); },
    seeked() { video.seeking = false; video.dispatchEvent(new Event('seeked')); },
  };
}
const options = { src: '/film.mp4', count: 241, fps: 24, directory: '/stills', onChange() {}, onFailure() { assert.fail('unexpected failure'); } };

test('scroll seeks coalesce to the latest target, preserving the previous shot while decoding', t => {
  const b = browser(t), frames = createScrollVideo(options);
  frames.request(0, true); b.ready(); b.flush();
  assert.equal(frames.get(0).index, 0);
  frames.request(12, true); b.flush();
  frames.request(70, true); frames.request(150, true); b.flush();
  assert.equal(b.seeks.length, 1);
  assert.equal(frames.get(150).index, 0);
  assert.equal(frames.get(150, true), null);
  b.seeked();
  assert.equal(frames.get(12, true).index, 12);
  b.flush();
  assert.equal(b.seeks.length, 2);
  assert.equal(Math.floor(b.seeks[1] * 24), 150);
  b.seeked(); b.flush();
  assert.equal(frames.get(150, true).index, 150);
  frames.request(240, true); b.flush(); b.seeked();
  assert.equal(frames.get(240, true).index, 240);
  frames.request(0, true); b.flush(); b.seeked();
  assert.equal(frames.get(0, true).index, 0);
  frames.destroy();
});

test('inactive and reduced-motion scenes do not start a video download', async t => {
  const b = browser(t), frames = createScrollVideo(options);
  frames.request(120, false); b.flush(); assert.equal(b.loads.length, 0);
  frames.request(0, true, true); await settle();
  frames.request(240, true, true); await settle();
  assert.equal(b.loads.length, 0);
  assert.deepEqual(b.requests, ['/stills/0000.webp', '/stills/0240.webp']);
  assert.equal(frames.get(240, true).index, 240);
  frames.destroy();
});

test('a failed video uses only requested WebPs; unmount cancels queued seeks', async t => {
  const b = browser(t), frames = createScrollVideo(options);
  frames.request(40, true);
  b.video.dispatchEvent(new Event('error')); await settle();
  assert.equal(frames.get(40, true).index, 40);
  assert.deepEqual(b.requests, ['/stills/0040.webp']);
  frames.destroy(); b.flush();
  assert.equal(b.video.src, '');
  assert.equal(b.seeks.length, 0);
});

test('all videos have an early MP4 index and fit a quarter of the WebP transfer budget', () => {
  const media = JSON.parse(readFileSync(new URL('../lib/scroll-video.generated.json', import.meta.url)));
  for (const [name, variants] of Object.entries(media)) {
    const originals = JSON.parse(readFileSync(new URL(`../public/assets/${name}-sequence/manifest.json`, import.meta.url)));
    for (const [variant, info] of Object.entries(variants)) {
      const data = readFileSync(new URL(`../public${info.src}`, import.meta.url));
      assert.equal(data.length, info.bytes);
      assert.ok(data.indexOf('moov') < data.indexOf('mdat'));
      const previous = originals.variants[variant].bytes;
      assert.ok(info.bytes < previous * .25, `${name}/${variant}: ${info.bytes} vs ${previous}`);
    }
  }
  assert.ok(statSync(new URL('../public/fonts/pretendard-1.3.9/UjuText-019c5314bb5d.woff2', import.meta.url)).size < 120_000);
});
