import { FRAME_COUNT, clamp01, sequenceFrame, coverCrop } from './sequence-math';

type FrameImage = ImageBitmap | HTMLImageElement;
type SequenceStatus = 'loading' | 'ready' | 'failed';

export function mountTelescopeSequence(host: HTMLElement, onStatus: (status: SequenceStatus) => void) {
  const section = host.closest<HTMLElement>('.telescope-study')!;
  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  const context = canvas.getContext('2d', { alpha: false });
  if (!context) { onStatus('failed'); return () => {}; }
  host.appendChild(canvas);
  const mobile = matchMedia('(max-width: 700px)').matches;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const variant = mobile ? 'mobile' : 'desktop';
  const cacheLimit = mobile ? 8 : 10;
  const blobs = new Map<number, Blob>();
  const decoded = new Map<number, FrameImage>();
  const pending = new Set<number>();
  const attempts = new Map<number, number>();
  const abort = new AbortController();
  let disposed = false, active = false, decoding = false, ready = false;
  let raf = 0, desired = 0, rendered = -1, progress = 0, lastTime = 0;
  let viewWidth = 1, viewHeight = 1;

  function release(image: FrameImage) {
    if ('close' in image) image.close();
    else image.src = '';
  }

  function paint(frame: number) {
    const image = decoded.get(frame);
    if (!image || disposed) return;
    const crop = coverCrop(image.width, image.height, viewWidth, viewHeight, frame);
    context!.drawImage(image, crop.x, crop.y, crop.width, crop.height, 0, 0, canvas.width, canvas.height);
    rendered = frame;
    decoded.delete(frame);
    decoded.set(frame, image);
    const position = frame / (FRAME_COUNT - 1);
    section.style.setProperty('--journey-opening', String(1 - clamp01(position / 0.18)));
    section.style.setProperty('--journey-ending', String(clamp01((position - 0.88) / 0.12)));
    host.dataset.frame = String(frame);
    host.dataset.decoded = String(decoded.size);
    if (!ready) { ready = true; onStatus('ready'); }
  }

  function drawBestAvailable() {
    if (decoded.has(desired)) { if (rendered !== desired) paint(desired); return; }
    let nearest = rendered;
    for (const frame of decoded.keys()) {
      if (nearest < 0 || Math.abs(frame - desired) < Math.abs(nearest - desired)) nearest = frame;
    }
    if (nearest >= 0 && nearest !== rendered) paint(nearest);
  }

  async function decode(blob: Blob): Promise<FrameImage> {
    if (typeof createImageBitmap === 'function') return createImageBitmap(blob);
    const url = URL.createObjectURL(blob);
    const image = new Image();
    image.src = url;
    try { await image.decode(); return image; }
    finally { URL.revokeObjectURL(url); }
  }

  // Compressed frames can be retained; only a small moving window is decoded.
  async function pumpDecode() {
    if (decoding || disposed || !active) return;
    decoding = true;
    try {
      while (!disposed && active) {
        const candidates = motion.matches ? [desired] : [desired, desired + 1, desired - 1, desired + 2, desired - 2];
        const frame = candidates.find(index => blobs.has(index) && !decoded.has(index));
        if (frame === undefined) break;
        try {
          const image = await decode(blobs.get(frame)!);
          if (disposed) { release(image); break; }
          decoded.set(frame, image);
          while (decoded.size > cacheLimit) {
            const oldest = [...decoded.keys()].find(index => index !== rendered && index !== desired)!;
            release(decoded.get(oldest)!);
            decoded.delete(oldest);
          }
          drawBestAvailable();
        } catch {
          blobs.delete(frame);
          if (frame === desired && !ready) onStatus('failed');
          pumpFetch();
        }
      }
    } finally { decoding = false; }
  }

  function priorities() {
    if (motion.matches) return [desired, 0, FRAME_COUNT - 1];
    const order = [desired, 0, FRAME_COUNT - 1];
    for (let offset = 1; offset <= 12; offset++) order.push(desired + offset, desired - offset);
    // Sparse coverage first makes a fast scroll or a jump to the end responsive.
    for (let index = 0; index < FRAME_COUNT; index += 8) order.push(index);
    for (let offset = 13; offset < FRAME_COUNT; offset++) order.push(desired + offset, desired - offset);
    return order.filter(index => index >= 0 && index < FRAME_COUNT);
  }

  function pumpFetch() {
    if (disposed || !active || document.hidden) return;
    const queue = priorities();
    while (pending.size < 4) {
      const frame = queue.find(index => !blobs.has(index) && !pending.has(index) && (attempts.get(index) || 0) < 2);
      if (frame === undefined) break;
      pending.add(frame);
      attempts.set(frame, (attempts.get(frame) || 0) + 1);
      fetch(`/assets/telescope-sequence/${variant}/${String(frame).padStart(4, '0')}.webp`, { signal: abort.signal })
        .then(response => { if (!response.ok) throw new Error('Frame unavailable'); return response.blob(); })
        .then(blob => { if (!disposed) { blobs.set(frame, blob); host.dataset.loaded = String(blobs.size); } })
        .catch(() => { if (!disposed && !ready && frame === desired && attempts.get(frame) === 2) onStatus('failed'); })
        .finally(() => { pending.delete(frame); if (!disposed) { void pumpDecode(); pumpFetch(); } });
    }
  }

  function measureProgress() {
    const rect = section.getBoundingClientRect();
    return clamp01(-rect.top / Math.max(1, section.offsetHeight - host.clientHeight));
  }

  function tick(time: number) {
    raf = 0;
    if (!active || disposed || document.hidden) return;
    const target = measureProgress();
    const dt = lastTime ? Math.min(time - lastTime, 50) : 16;
    lastTime = time;
    progress = motion.matches ? target : progress + (target - progress) * (1 - Math.exp(-dt / 65));
    if (Math.abs(target - progress) < 0.0002) progress = target;
    desired = sequenceFrame(progress, motion.matches);
    drawBestAvailable();
    pumpFetch();
    void pumpDecode();
    if (progress !== target) raf = requestAnimationFrame(tick);
  }

  function schedule() { if (!raf && active && !disposed) { lastTime = 0; raf = requestAnimationFrame(tick); } }
  function resize() {
    viewWidth = host.clientWidth || 1;
    viewHeight = host.clientHeight || 1;
    const ratio = Math.min(devicePixelRatio || 1, 2, (mobile ? 960 : 1920) / viewWidth, (mobile ? 540 : 1080) / viewHeight);
    canvas.width = Math.max(1, Math.round(viewWidth * ratio));
    canvas.height = Math.max(1, Math.round(viewHeight * ratio));
    if (rendered >= 0) paint(rendered);
    schedule();
  }

  const observer = new IntersectionObserver(([entry]) => {
    active = entry.isIntersecting;
    if (active) { progress = measureProgress(); schedule(); }
    else { cancelAnimationFrame(raf); raf = 0; }
  }, { rootMargin: '700px' });
  observer.observe(section);
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(host);
  window.addEventListener('scroll', schedule, { passive: true });
  document.addEventListener('visibilitychange', schedule);
  motion.addEventListener('change', schedule);
  resize();

  return () => {
    disposed = true;
    abort.abort();
    observer.disconnect();
    resizeObserver.disconnect();
    cancelAnimationFrame(raf);
    window.removeEventListener('scroll', schedule);
    document.removeEventListener('visibilitychange', schedule);
    motion.removeEventListener('change', schedule);
    decoded.forEach(release);
    decoded.clear();
    blobs.clear();
    canvas.remove();
  };
}
