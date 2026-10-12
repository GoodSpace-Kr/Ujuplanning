/** Explicit byte ranges: Workers' static asset handler can return a whole 200
 * response to Range requests, which prevents reliable seeking in WebKit. */
export async function videoResponse(request: Request, asset: { bytes: number; etag: string }, read: () => Promise<ArrayBuffer>) {
  const { bytes, etag } = asset;
  const headers = new Headers({
    'Content-Type': 'video/mp4',
    'Accept-Ranges': 'bytes',
    'Cache-Control': 'public, max-age=31536000, immutable',
    ETag: etag,
    'X-Content-Type-Options': 'nosniff',
  });
  if (request.headers.get('if-none-match') === etag) return new Response(null, { status: 304, headers });
  let start = 0, end = bytes - 1, partial = false;
  const range = request.headers.get('range');
  const ifRange = request.headers.get('if-range');
  const match = !ifRange || ifRange === etag ? range?.match(/^bytes=(\d*)-(\d*)$/) : null;
  if (match && (match[1] || match[2])) {
    partial = true;
    if (!match[1]) start = Math.max(0, bytes - Number(match[2]));
    else {
      start = Number(match[1]);
      if (match[2]) end = Math.min(end, Number(match[2]));
    }
    if (!Number.isSafeInteger(start) || start >= bytes || start > end) {
      headers.set('Content-Range', `bytes */${bytes}`);
      return new Response(null, { status: 416, headers });
    }
    headers.set('Content-Range', `bytes ${start}-${end}/${bytes}`);
  }
  headers.set('Content-Length', String(end - start + 1));
  if (request.method === 'HEAD') return new Response(null, { status: partial ? 206 : 200, headers });
  const data = await read();
  if (data.byteLength !== bytes) return new Response('Media unavailable', { status: 502, headers: { 'Cache-Control': 'no-store' } });
  return new Response(partial ? data.slice(start, end + 1) : data, { status: partial ? 206 : 200, headers });
}
