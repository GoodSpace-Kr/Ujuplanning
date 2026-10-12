import { decodeOrder, unpackFrames, type FramePack } from './frame-pack';

export type FrameImage = ImageBitmap | HTMLImageElement;

export function releaseFrame(image: FrameImage) {
  if ('close' in image) image.close(); else image.src = '';
}

export async function decodeFrame(blob: Blob): Promise<FrameImage> {
  if (typeof createImageBitmap === 'function') return createImageBitmap(blob);
  const url = URL.createObjectURL(blob);
  const image = new Image();
  image.src = url;
  try { await image.decode(); return image; } finally { URL.revokeObjectURL(url); }
}

export function createSequenceFrames(options: {
  count: number;
  directory: string;
  packs: FramePack[];
  decodedLimit: number;
  onChange: () => void;
  onFailure: () => void;
}) {
  const { count, directory, packs, decodedLimit, onChange, onFailure } = options;
  const blobs = new Map<number, Blob>();
  const images = new Map<number, FrameImage>();
  const pendingPacks = new Set<number>(), completedPacks = new Set<number>();
  const pendingFrames = new Set<number>();
  const packAttempts = new Map<number, number>(), frameAttempts = new Map<number, number>();
  const controller = new AbortController();
  let desired = 0, active = false, disposed = false, decoding = false, reduced = false;

  async function pumpDecode() {
    if (decoding || !active || disposed || document.hidden) return;
    decoding = true;
    try {
      while (active && !disposed && !document.hidden) {
        const order = decodeOrder(desired, blobs.keys(), count);
        const frame = order.find(i => blobs.has(i) && !images.has(i));
        if (frame === undefined) break;
        try {
          const image = await decodeFrame(blobs.get(frame)!);
          if (disposed) { releaseFrame(image); break; }
          images.set(frame, image);
          const keep = decodeOrder(desired, blobs.keys(), count);
          while (images.size > decodedLimit) {
            const oldest = [...images.keys()].find(i => !keep.includes(i));
            if (oldest === undefined) break;
            releaseFrame(images.get(oldest)!);
            images.delete(oldest);
          }
          onChange();
        } catch {
          blobs.delete(frame);
          pumpFetch();
        }
      }
    } finally { decoding = false; }
  }

  function fetchFrame(frame: number) {
    pendingFrames.add(frame);
    frameAttempts.set(frame, (frameAttempts.get(frame) ?? 0) + 1);
    fetch(`${directory}/${String(frame).padStart(4, '0')}.webp`, { signal: controller.signal })
      .then(response => { if (!response.ok) throw new Error('Frame unavailable'); return response.blob(); })
      .then(blob => { if (!disposed) blobs.set(frame, blob); })
      .catch(() => { if (!disposed && frame === desired && frameAttempts.get(frame) === 2 && !blobs.has(frame)) onFailure(); })
      .finally(() => { pendingFrames.delete(frame); if (!disposed) { void pumpDecode(); pumpFetch(); } });
  }

  function pumpFetch() {
    if (!active || disposed || document.hidden) return;
    // A dedicated lane for the requested shot avoids waiting behind background
    // packs after fast scrolling or direct anchor navigation.
    if (!pendingFrames.size && !blobs.has(desired) && (frameAttempts.get(desired) ?? 0) < 2) fetchFrame(desired);
    if (reduced) return;
    const order = packs.map((_, index) => index).sort((a, b) => {
      const rank = (i: number) => i === 0 ? -2 : packs[i].frames.includes(desired) ? -1 : Math.min(...packs[i].frames.map(frame => Math.abs(frame - desired)));
      return rank(a) - rank(b);
    });
    while (pendingPacks.size < 2) {
      const index = order.find(i => !pendingPacks.has(i) && !completedPacks.has(i) && (packAttempts.get(i) ?? 0) < 2);
      if (index === undefined) break;
      pendingPacks.add(index);
      packAttempts.set(index, (packAttempts.get(index) ?? 0) + 1);
      fetch(packs[index].url, { signal: controller.signal })
        .then(response => { if (!response.ok) throw new Error('Pack unavailable'); return response.arrayBuffer(); })
        .then(data => {
          const frames = unpackFrames(data, count);
          if (packs[index].frames.some(frame => !frames.has(frame))) throw new Error('Incomplete pack');
          if (!disposed) { frames.forEach((blob, frame) => blobs.set(frame, blob)); completedPacks.add(index); }
        })
        .catch(() => { /* Keep individual-frame fallback available on a stale deployment. */ })
        .finally(() => { pendingPacks.delete(index); if (!disposed) { void pumpDecode(); pumpFetch(); } });
    }
    // If an old deploy/CDN lacks a pack, recover its frames without a blank film.
    if (!pendingFrames.size) {
      const failed = order.filter(i => !completedPacks.has(i) && !pendingPacks.has(i) && (packAttempts.get(i) ?? 0) >= 2);
      const fallback = failed.flatMap(i => packs[i].frames).find(i => !blobs.has(i) && (frameAttempts.get(i) ?? 0) < 2);
      if (fallback !== undefined) fetchFrame(fallback);
    }
  }

  return {
    request(frame: number, enabled: boolean, reducedMotion = false) {
      desired = Math.max(0, Math.min(count - 1, Math.round(frame)));
      active = enabled; reduced = reducedMotion;
      if (active) { pumpFetch(); void pumpDecode(); }
    },
    get(frame: number, exact = false): { image: FrameImage; index: number } | null {
      if (!images.size || exact && !images.has(frame)) return null;
      const index = images.has(frame) ? frame : [...images.keys()].reduce((best, i) => Math.abs(i - frame) < Math.abs(best - frame) ? i : best);
      const image = images.get(index)!;
      images.delete(index); images.set(index, image);
      return { image, index };
    },
    stats: () => ({ loaded: blobs.size, decoded: images.size }),
    destroy() {
      disposed = true; controller.abort(); images.forEach(releaseFrame); images.clear(); blobs.clear();
    },
  };
}
