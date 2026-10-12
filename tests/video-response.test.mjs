import test from 'node:test';
import assert from 'node:assert/strict';
import { videoResponse } from '../lib/video-response.ts';

const bytes = Uint8Array.from({ length: 100 }, (_, i) => i);
const asset = { bytes: 100, etag: '"movie-v1"' };
const request = (headers = {}, method = 'GET') => new Request('https://example.com/api/scroll-video/movie.mp4', { headers, method });
const read = async () => bytes.buffer;

test('initial, middle, suffix and open-ended requests return exact 206 byte ranges', async () => {
  for (const [range, start, end] of [['bytes=0-1', 0, 1], ['bytes=25-49', 25, 49], ['bytes=-10', 90, 99], ['bytes=80-', 80, 99], ['bytes=90-200', 90, 99]]) {
    const response = await videoResponse(request({ Range: range }), asset, read);
    assert.equal(response.status, 206);
    assert.equal(response.headers.get('content-range'), `bytes ${start}-${end}/100`);
    assert.equal(Number(response.headers.get('content-length')), end - start + 1);
    assert.deepEqual(new Uint8Array(await response.arrayBuffer()), bytes.slice(start, end + 1));
  }
});

test('invalid intervals fail without reading data; HEAD and 304 also avoid reading', async () => {
  const unread = () => { assert.fail('must not read the media'); };
  for (const range of ['bytes=100-', 'bytes=70-20', 'bytes=-0', 'bytes=9999999999999999999999-']) {
    const response = await videoResponse(request({ Range: range }), asset, unread);
    assert.equal(response.status, 416);
    assert.equal(response.headers.get('content-range'), 'bytes */100');
  }
  const head = await videoResponse(request({}, 'HEAD'), asset, unread);
  assert.equal(head.headers.get('content-length'), '100');
  assert.equal((await head.arrayBuffer()).byteLength, 0);
  assert.equal((await videoResponse(request({ 'If-None-Match': asset.etag }), asset, unread)).status, 304);
});

test('unsupported ranges and changed If-Range validators correctly return the full representation', async () => {
  for (const headers of [{ Range: 'bytes=1-2,5-6' }, { Range: 'bytes=1-2', 'If-Range': '"old"' }, {}]) {
    const response = await videoResponse(request(headers), asset, read);
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('accept-ranges'), 'bytes');
    assert.deepEqual(new Uint8Array(await response.arrayBuffer()), bytes);
  }
});
