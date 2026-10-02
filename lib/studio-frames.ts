import { STUDIO_FRAMES } from './studio-journey';

type FrameImage = ImageBitmap | HTMLImageElement;

// Keep compressed frames for reverse scrolling, but bound decoded image memory.
export function createStudioFrames(onChange: () => void, onFailure: () => void) {
  const mobile = matchMedia('(max-width: 700px)').matches;
  const directory = mobile ? 'mobile' : 'desktop';
  const blobs = new Map<number, Blob>();
  const images = new Map<number, FrameImage>();
  const pending = new Set<number>();
  const attempts = new Map<number, number>();
  const abort = new AbortController();
  let desired = 0, decoding = false, active = false, disposed = false;
  let detail: FrameImage | null = null, detailRequested = false;
  const limit = mobile ? 8 : 10;

  function release(image: FrameImage) { if ('close' in image) image.close(); else image.src = ''; }
  async function decode(blob: Blob): Promise<FrameImage> {
    if (typeof createImageBitmap === 'function') return createImageBitmap(blob);
    const url = URL.createObjectURL(blob);
    const image = new Image();
    image.src = url;
    try { await image.decode(); return image; } finally { URL.revokeObjectURL(url); }
  }
  function priorities() {
    const order = [desired, 0, STUDIO_FRAMES - 1];
    for (let step = 1; step < STUDIO_FRAMES; step++) order.push(desired + step, desired - step);
    return order.filter(index => index >= 0 && index < STUDIO_FRAMES);
  }
  async function pumpDecode() {
    if (decoding || disposed || !active) return;
    decoding = true;
    try {
      while (!disposed && active) {
        const order = [desired, desired + 1, desired - 1, desired + 2, desired - 2, 0, STUDIO_FRAMES - 1];
        const frame = order.find(i => blobs.has(i) && !images.has(i));
        if (frame === undefined) break;
        try {
          const image = await decode(blobs.get(frame)!);
          if (disposed) { release(image); break; }
          images.set(frame, image);
          while (images.size > limit) {
            const oldest = [...images.keys()].find(i => i !== desired && i !== 0 && i !== STUDIO_FRAMES - 1)!;
            release(images.get(oldest)!);
            images.delete(oldest);
          }
          onChange();
        } catch { blobs.delete(frame); pumpFetch(); }
      }
    } finally { decoding = false; }
  }
  function pumpFetch() {
    if (!active || disposed || document.hidden) return;
    const order = priorities();
    while (pending.size < 5) {
      const frame = order.find(i => !blobs.has(i) && !pending.has(i) && (attempts.get(i) || 0) < 2);
      if (frame === undefined) break;
      pending.add(frame);
      attempts.set(frame, (attempts.get(frame) || 0) + 1);
      fetch(`/assets/studio-sequence/${directory}/${String(frame).padStart(4, '0')}.webp`, { signal: abort.signal })
        .then(response => { if (!response.ok) throw new Error('Frame unavailable'); return response.blob(); })
        .then(blob => { if (!disposed) blobs.set(frame, blob); })
        .catch(() => { if (!disposed && frame === desired && attempts.get(frame) === 2) onFailure(); })
        .finally(() => { pending.delete(frame); if (!disposed) { void pumpDecode(); pumpFetch(); } });
    }
  }
  function preloadDetail() {
    if (detailRequested || disposed) return;
    detailRequested = true;
    fetch(`/assets/studio-sequence/${mobile ? 'desktop/0240.webp' : 'detail.webp'}`, { signal: abort.signal })
      .then(response => { if (!response.ok) throw new Error('Detail unavailable'); return response.blob(); })
      .then(decode).then(image => { if (disposed) release(image); else { detail = image; onChange(); } })
      .catch(() => { /* The normal final frame remains usable if detail fails. */ });
  }
  return {
    request(frame: number, enabled: boolean) {
      desired = frame;
      active = enabled;
      if (active) { pumpFetch(); void pumpDecode(); }
    },
    get(frame: number, exact = false): { image: FrameImage; index: number } | null {
      if (frame === STUDIO_FRAMES - 1 && detail) return { image: detail, index: frame };
      let index = frame;
      if (!images.has(frame)) {
        if (exact || !images.size) return null;
        index = [...images.keys()].reduce((best, i) => Math.abs(i - frame) < Math.abs(best - frame) ? i : best);
      }
      const image = images.get(index)!;
      images.delete(index); images.set(index, image);
      return { image, index };
    },
    preloadDetail,
    stats: () => ({ loaded: blobs.size, decoded: images.size }),
    destroy() {
      disposed = true; abort.abort(); images.forEach(release); images.clear(); blobs.clear();
      if (detail) release(detail);
    },
  };
}
