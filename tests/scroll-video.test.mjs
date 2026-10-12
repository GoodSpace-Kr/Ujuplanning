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
  const saved = { document: globalThis.document, requestAnimationFrame: globalThis.requestAnimationFrame, cancelAnimationFrame: globalThis.cancelAnimationFrame, window: globalThis.window, fetch: globalThis.fetch };
  const callbacks = new Map(), seeks = [], loads = [], requests = [];
  let next = 1, position = 0;
  const video = new EventTarget();
  Object.assign(video, { dataset: {}, style: {}, setAttribute() {}, remove() {}, readyState: 0, seeking: false, videoWidth: 1280, videoHeight: 720, duration: 241 / 24, buffered: { length: 1, start: () => 0, end: () => 241 / 24 }, load() { loads.push(this.src); }, pause() {}, removeAttribute() { this.src = ''; } });
  Object.defineProperty(video, 'currentTime', { get: () => position, set: value => { position = value; video.seeking = true; seeks.push(value); } });
  const canvas = () => ({ width: 0, height: 0, getContext: () => ({ drawImage() {} }) });
  globalThis.window = { setTimeout, clearTimeout };
  globalThis.document = { hidden: false, body: { appendChild() {} }, createElement: tag => tag === 'video' ? video : canvas() };
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

test('metadata does not interrupt the first frame download with a redundant seek', async t => {
  const b = browser(t), frames = createScrollVideo(options);
  frames.request(0, true); await settle();
  assert.ok(b.video.src.startsWith('blob:'));
  b.video.readyState = 1;
  b.video.dispatchEvent(new Event('loadedmetadata')); b.flush();
  assert.equal(b.seeks.length, 0);
  b.ready(); b.flush();
  assert.equal(b.seeks.length, 0);
  assert.equal(frames.get(0, true).index, 0);
  frames.destroy();
});

test('scroll seeks coalesce to the latest target, preserving the previous shot while decoding', async t => {
  const b = browser(t), frames = createScrollVideo(options);
  frames.request(0, true); await settle(); b.ready(); b.flush();
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
  assert.ok(b.requests.includes('/stills/0040.webp'));
  assert.ok(b.requests.every(url => url === '/film.mp4' || url === '/stills/0040.webp'));
  frames.destroy(); b.flush();
  assert.equal(b.video.src, '');
  assert.equal(b.seeks.length, 0);
});

test('all videos have an early MP4 index and fit a quarter of the WebP transfer budget', () => {
  const media = JSON.parse(readFileSync(new URL('../lib/scroll-video.generated.json', import.meta.url)));
  for (const [name, variants] of Object.entries(media)) {
    const originals = JSON.parse(readFileSync(new URL(`../public/assets/${name}-sequence/manifest.json`, import.meta.url)));
    for (const [variant, info] of Object.entries(variants)) {
      if (variant === 'preview') { assert.ok(info.bytes < 400_000); continue; }
      const data = readFileSync(new URL(`../public${info.src}`, import.meta.url));
      assert.equal(data.length, info.bytes);
      assert.ok(data.indexOf('moov') < data.indexOf('mdat'));
      const previous = originals.variants[variant].bytes;
      assert.ok(info.bytes < previous * .25, `${name}/${variant}: ${info.bytes} vs ${previous}`);
    }
  }
  assert.ok(statSync(new URL('../public/fonts/pretendard-1.3.9/UjuText-019c5314bb5d.woff2', import.meta.url)).size < 120_000);
});


test('cold load downloads a whole preview before seeking; no ranges or new requests during scrubbing', async t => {
  const b = browser(t);
  let finishPreview;
  globalThis.fetch = (url, init) => {
    b.requests.push({ url, init });
    if (url === '/preview.mp4') return new Promise(resolve => { finishPreview = () => resolve(new Response(new Blob(['preview']))); });
    return new Promise((_, reject) => init.signal.addEventListener('abort', () => reject(new Error('Aborted')))); // HD never arrives.
  };
  const frames = createScrollVideo({ ...options, previewSrc: '/preview.mp4' });
  frames.request(20, true); b.flush();
  assert.equal(b.loads.length, 0);
  assert.equal(b.seeks.length, 0);
  finishPreview(); await settle(); b.ready(); b.flush(); b.seeked();
  assert.ok(b.video.src.startsWith('blob:'));
  for (const frame of [60, 120, 200, 240, 90, 0]) {
    frames.request(frame, true); b.flush(); b.seeked();
    assert.equal(frames.get(frame, true).index, frame);
  }
  assert.deepEqual(b.requests.map(r => r.url), ['/preview.mp4', '/film.mp4']);
  assert.ok(b.requests.every(r => !r.init.headers?.Range));
  assert.equal(frames.stats().quality, 'preview');
  assert.equal(frames.stats().loaded, 241);
  frames.destroy();
  assert.equal(b.requests.at(-1).init.signal.aborted, true);
});

test('quality upgrade preserves the current scene, never flashes frame zero, and repaints HD', async t => {
  const b = browser(t);
  let finishHD;
  globalThis.fetch = url => url === '/preview.mp4'
    ? Promise.resolve(new Response(new Blob(['preview'])))
    : new Promise(resolve => { finishHD = () => resolve(new Response(new Blob(['hd']))); });
  const frames = createScrollVideo({ ...options, previewSrc: '/preview.mp4' });
  frames.request(120, true); await settle(); b.video.videoWidth = 640; b.ready(); b.flush(); b.seeked();
  const previousImage = frames.get(120, true).image;
  finishHD(); await settle();
  b.video.currentTime = 0; b.video.seeking = false; b.video.videoWidth = 1280;
  b.ready();
  assert.equal(frames.get(120, true).index, 120);
  assert.equal(frames.get(120, true).image, previousImage);
  b.flush(); b.seeked();
  assert.equal(frames.get(120, true).index, 120);
  assert.notEqual(frames.get(120, true).image, previousImage);
  assert.equal(frames.stats().quality, 'full');
  frames.destroy();
});

test('unmount before download finishes cannot install a stale video source', async t => {
  const b = browser(t);
  let finish;
  globalThis.fetch = () => new Promise(resolve => { finish = () => resolve(new Response(new Blob(['film']))); });
  const frames = createScrollVideo(options);
  frames.preload(); frames.destroy(); const loads = b.loads.length;
  finish(); await settle(); b.flush();
  assert.equal(b.loads.length, loads);
  assert.equal(b.video.src, '');
});
