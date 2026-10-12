export type FramePack = { url: string; frames: number[] };

// Consume each complete WebP as bytes arrive. Waiting for response.arrayBuffer()
// would make a slow connection wait for an entire pack before showing any shot.
export async function consumeFramePack(response: Response, count: number, onFrame: (index: number, blob: Blob) => void) {
  if (!response.body) {
    unpackFrames(await response.arrayBuffer(), count).forEach((blob, frame) => onFrame(frame, blob));
    return;
  }
  const reader = response.body.getReader();
  let buffer = new Uint8Array(0), started = false;
  const seen = new Set<number>();
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      const combined = new Uint8Array(buffer.length + value.length);
      combined.set(buffer); combined.set(value, buffer.length); buffer = combined;
      let offset = 0;
      if (!started) {
        if (buffer.length < 4) continue;
        if (String.fromCharCode(...buffer.subarray(0, 4)) !== 'UJU1') throw new Error('Invalid frame pack');
        started = true; offset = 4;
      }
      const view = new DataView(buffer.buffer);
      while (offset + 8 <= buffer.length) {
        const index = view.getUint32(offset, true), size = view.getUint32(offset + 4, true);
        if (index >= count || size === 0 || seen.has(index)) throw new Error('Invalid frame data');
        if (offset + 8 + size > buffer.length) break;
        seen.add(index);
        onFrame(index, new Blob([buffer.slice(offset + 8, offset + 8 + size)], { type: 'image/webp' }));
        offset += 8 + size;
      }
      buffer = buffer.slice(offset);
    }
    if (!started || buffer.length) throw new Error('Truncated frame pack');
  } catch (error) {
    await reader.cancel().catch(() => {});
    throw error;
  } finally { reader.releaseLock(); }
}

export function unpackFrames(data: ArrayBuffer, count: number): Map<number, Blob> {
  const bytes = new Uint8Array(data);
  if (bytes.length < 4 || String.fromCharCode(...bytes.subarray(0, 4)) !== 'UJU1') throw new Error('Invalid frame pack');
  const view = new DataView(data);
  const frames = new Map<number, Blob>();
  let offset = 4;
  while (offset < bytes.length) {
    if (offset + 8 > bytes.length) throw new Error('Truncated frame header');
    const index = view.getUint32(offset, true), size = view.getUint32(offset + 4, true);
    offset += 8;
    if (index >= count || size === 0 || offset + size > bytes.length || frames.has(index)) throw new Error('Invalid frame data');
    frames.set(index, new Blob([data.slice(offset, offset + size)], { type: 'image/webp' }));
    offset += size;
  }
  return frames;
}

// Decode the closest frame that has actually arrived, even after a large jump.
export function decodeOrder(desired: number, available: Iterable<number>, count: number) {
  const frames = [...available];
  const nearest = frames.reduce((best, i) => Math.abs(i - desired) < Math.abs(best - desired) ? i : best, frames[0] ?? desired);
  return [...new Set([desired, nearest, desired + 1, desired - 1, desired + 2, desired - 2, 0, count - 1])]
    .filter(i => i >= 0 && i < count);
}
