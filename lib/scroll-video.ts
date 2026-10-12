import { decodeFrame, releaseFrame, type FrameImage } from './sequence-frames';

export type ScrollFrame = { image: CanvasImageSource; width: number; height: number; index: number };

/** A paused, range-seekable video supplies the existing canvas choreography.
 * Only one seek runs at a time; intermediate scroll targets are discarded.
 * Keep a stable canvas copy so a pending decoder never flashes a blank frame.
 */
export function createScrollVideo(options: {
  src: string; count: number; fps: number; directory: string;
  onChange: () => void; onFailure: () => void;
}) {
  const { src, count, fps, directory, onChange, onFailure } = options;
  const video = document.createElement('video');
  video.muted = true;
  video.defaultMuted = true;
  video.playsInline = true;
  video.preload = 'none';
  video.setAttribute('aria-hidden', 'true');
  video.tabIndex = -1;
  video.style.cssText = 'position:fixed;left:-2px;top:-2px;width:1px;height:1px;opacity:0;pointer-events:none';
  document.body.appendChild(video);
  const snapshot = document.createElement('canvas');
  const context = snapshot.getContext('2d', { alpha: false });
  const stills = new Map<number, FrameImage>();
  const pendingStills = new Map<number, AbortController>();
  const attempts = new Map<number, number>();
  let desired = 0, rendered = -1, active = false, reduced = false;
  let started = false, failed = !context, disposed = false, seeking = false, pumpRaf = 0;
  let seekStarted = 0, seekMs = 0, completedSeeks = 0;

  function loadStill(frame: number) {
    if (disposed || stills.has(frame) || pendingStills.has(frame) || (attempts.get(frame) ?? 0) >= 2) return;
    // Error/reduced-motion fallback is bounded, never another 474-frame preload.
    if (pendingStills.size >= 1) return;
    const abort = new AbortController();
    pendingStills.set(frame, abort);
    attempts.set(frame, (attempts.get(frame) ?? 0) + 1);
    fetch(`${directory}/${String(frame).padStart(4, '0')}.webp`, { signal: abort.signal })
      .then(response => { if (!response.ok) throw new Error('Still unavailable'); return response.blob(); })
      .then(decodeFrame)
      .then(image => {
        if (disposed) { releaseFrame(image); return; }
        stills.set(frame, image);
        while (stills.size > 3) {
          const first = stills.keys().next().value!;
          releaseFrame(stills.get(first)!); stills.delete(first);
        }
        onChange();
      })
      .catch(() => { if (!disposed && attempts.get(frame) === 2) onFailure(); })
      .finally(() => { pendingStills.delete(frame); if (!disposed && active && (reduced || failed)) loadStill(desired); });
  }

  function preload() {
    if (disposed || started || failed || reduced) return;
    started = true;
    video.preload = 'auto';
    video.src = src.replace('/assets/scroll-video/', '/api/scroll-video/');
    video.load();
  }

  function schedulePump() {
    if (!pumpRaf && !disposed) pumpRaf = requestAnimationFrame(() => { pumpRaf = 0; pump(); });
  }

  function pump() {
    // Metadata alone cannot supply a drawable frame. Seeking at that point can
    // interrupt the opening download (notably WebKit's initial range probe).
    if (disposed || !active || reduced || failed || document.hidden || seeking || video.seeking || video.readyState < 2) return;
    if (rendered === desired) return;
    // Seek into the middle of a frame to avoid floating point/keyframe boundaries.
    const time = Math.min((desired + .25) / fps, Math.max(0, video.duration - .001));
    if (!Number.isFinite(time)) return;
    seeking = true;
    seekStarted = performance.now();
    video.currentTime = time;
  }

  function capture() {
    if (disposed || reduced || video.seeking || video.readyState < 2 || !video.videoWidth || !context) return;
    const index = Math.min(count - 1, Math.max(0, Math.floor(video.currentTime * fps + .001)));
    if (snapshot.width !== video.videoWidth) {
      snapshot.width = video.videoWidth; snapshot.height = video.videoHeight;
    }
    context.drawImage(video, 0, 0);
    rendered = index;
    if (seeking) { seekMs = performance.now() - seekStarted; completedSeeks++; }
    seeking = false;
    onChange();
    // Let the consumer paint this decoded shot before starting the latest seek.
    schedulePump();
  }

  function fail() {
    if (disposed) return;
    failed = true; seeking = false;
    if (active) loadStill(desired);
  }
  video.addEventListener('loadedmetadata', schedulePump);
  video.addEventListener('loadeddata', capture);
  video.addEventListener('seeked', capture);
  video.addEventListener('error', fail);

  return {
    preload,
    request(frame: number, enabled: boolean, reducedMotion = false) {
      desired = Math.max(0, Math.min(count - 1, Math.round(frame)));
      active = enabled;
      if (reducedMotion && !reduced && started) {
        video.removeAttribute('src'); video.load(); started = false; seeking = false;
      }
      reduced = reducedMotion;
      if (!active) return;
      if (reduced || failed) loadStill(desired);
      else { preload(); schedulePump(); }
    },
    get(frame: number, exact = false): ScrollFrame | null {
      const still = stills.get(frame);
      if (still) return { image: still, width: still.width, height: still.height, index: frame };
      if (rendered >= 0 && (!exact || rendered === frame)) return { image: snapshot, width: snapshot.width, height: snapshot.height, index: rendered };
      return null;
    },
    stats() {
      let seconds = 0;
      for (let i = 0; i < video.buffered.length; i++) seconds += video.buffered.end(i) - video.buffered.start(i);
      return { loaded: Math.min(count, Math.round(seconds * fps)), decoded: rendered >= 0 ? 1 : 0, seekMs, completedSeeks, failed };
    },
    destroy() {
      disposed = true;
      cancelAnimationFrame(pumpRaf);
      video.removeEventListener('loadedmetadata', schedulePump);
      video.removeEventListener('loadeddata', capture);
      video.removeEventListener('seeked', capture);
      video.removeEventListener('error', fail);
      video.pause(); video.removeAttribute('src'); video.load();
      video.remove();
      pendingStills.forEach(abort => abort.abort());
      stills.forEach(releaseFrame); stills.clear();
      snapshot.width = snapshot.height = 1;
    },
  };
}
