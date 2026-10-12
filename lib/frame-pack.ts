export type FramePack = { url: string; frames: number[] };

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
