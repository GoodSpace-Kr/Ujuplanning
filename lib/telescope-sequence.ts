import { FRAME_COUNT, clamp01, sequenceFrame, coverCrop } from './sequence-math';

import { createScrollVideo } from './scroll-video';
import media from './scroll-video.generated.json';
type SequenceStatus = 'loading' | 'ready' | 'failed';

export function mountTelescopeSequence(host: HTMLElement, onStatus: (status: SequenceStatus) => void, externalProgress?: () => number) {
  const section = host.closest<HTMLElement>('.telescope-study')!;
  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  const context = canvas.getContext('2d', { alpha: false });
  if (!context) { onStatus('failed'); return () => {}; }
  host.appendChild(canvas);
  const mobile = matchMedia('(max-width: 700px)').matches;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const variant = mobile ? 'mobile' : 'desktop';
  let disposed = false, active = false, ready = false;
  let paintedImage: CanvasImageSource | null = null;
  let raf = 0, desired = 0, rendered = -1, progress = 0, lastTime = 0;
  let viewWidth = 1, viewHeight = 1;
  const frames = createScrollVideo({
    count: FRAME_COUNT,
    src: media.telescope[variant].src,
    previewSrc: media.telescope.preview.src,
    fps: media.telescope[variant].fps,
    directory: `/assets/telescope-sequence/${variant}`,
    onChange: () => { drawBestAvailable(); },
    onFailure: () => { if (!ready) onStatus('failed'); },
  });
  if (!motion.matches) frames.preload();

  function paint(frame: number) {
    const shot = frames.get(frame, true);
    if (!shot || disposed) return;
    const crop = coverCrop(shot.width, shot.height, viewWidth, viewHeight, frame);
    context!.drawImage(shot.image, crop.x, crop.y, crop.width, crop.height, 0, 0, canvas.width, canvas.height);
    rendered = frame; paintedImage = shot.image;
    const position = frame / (FRAME_COUNT - 1);
    section.style.setProperty('--journey-opening', String(1 - clamp01(position / 0.18)));
    section.style.setProperty('--journey-ending', String(clamp01((position - 0.88) / 0.12)));
    host.dataset.frame = String(frame);
    host.dataset.loaded = String(frames.stats().loaded);
    host.dataset.decoded = String(frames.stats().decoded);
    host.dataset.seekMs = frames.stats().seekMs.toFixed(1);
    host.dataset.seeks = String(frames.stats().completedSeeks);
    host.dataset.quality = frames.stats().quality;
    host.dataset.downloadMs = frames.stats().downloadMs.toFixed(0);
    host.dataset.maxSeekMs = frames.stats().maxSeekMs.toFixed(1);
    host.dataset.mediaError = frames.stats().downloadError;
    host.dataset.receivedBytes = String(frames.stats().receivedBytes);
    if (!ready) { ready = true; onStatus('ready'); }
  }

  function drawBestAvailable() {
    if (!active || disposed) return;
    const loaded = frames.get(desired);
    if (loaded && (loaded.index !== rendered || loaded.image !== paintedImage)) paint(loaded.index);
  }

  function measureProgress() {
    if (externalProgress) return externalProgress();
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
    frames.request(desired, true, motion.matches);
    if (progress !== target) raf = requestAnimationFrame(tick);
  }

  function schedule() { if (!raf && active && !disposed) { lastTime = 0; raf = requestAnimationFrame(tick); } }
  function resize() {
    viewWidth = host.clientWidth || 1;
    viewHeight = host.clientHeight || 1;
    const ratio = Math.min(devicePixelRatio || 1, 2, media.telescope[variant].width / viewWidth, media.telescope[variant].height / viewHeight);
    canvas.width = Math.max(1, Math.round(viewWidth * ratio));
    canvas.height = Math.max(1, Math.round(viewHeight * ratio));
    if (rendered >= 0) paint(rendered);
    schedule();
  }

  const observer = new IntersectionObserver(([entry]) => {
    active = entry.isIntersecting;
    if (active) { progress = measureProgress(); schedule(); }
    else { cancelAnimationFrame(raf); raf = 0; frames.request(desired, false); }
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
    frames.destroy();
    observer.disconnect();
    resizeObserver.disconnect();
    cancelAnimationFrame(raf);
    window.removeEventListener('scroll', schedule);
    document.removeEventListener('visibilitychange', schedule);
    motion.removeEventListener('change', schedule);
    canvas.remove();
  };
}
