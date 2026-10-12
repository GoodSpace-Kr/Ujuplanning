import { decodeFrame, releaseFrame, type FrameImage } from './sequence-frames';

export type ScrollFrame = { image: CanvasImageSource; width: number; height: number; index: number };

/** Decode only complete local blobs: scroll seeks must never wait on HTTP ranges.
 * A small complete preview starts first, then a full-quality blob replaces it.
 * Keep the last painted shot during a seek or quality upgrade.
 */
export function createScrollVideo(options: {
  src: string; previewSrc?: string; count: number; fps: number; directory: string;
  onChange: () => void; onFailure: () => void;
}) {
  const { src, previewSrc, count, fps, directory, onChange, onFailure } = options;
  const video = document.createElement('video');
  video.muted = true;
  video.defaultMuted = true;
  video.playsInline = true;
  video.preload = 'none';
  video.setAttribute('aria-hidden', 'true');
  video.tabIndex = -1;
  video.style.cssText = 'position:fixed;left:-2px;top:-2px;width:1px;height:1px;opacity:0;pointer-events:none';
  document.body.appendChild(video);
  let snapshot = document.createElement('canvas');
  let context = snapshot.getContext('2d', { alpha: false });
  const stills = new Map<number, FrameImage>();
  const pendingStills = new Map<number, AbortController>();
  const attempts = new Map<number, number>();
  let desired = 0, rendered = -1, active = false, reduced = false;
  let started = false, failed = !context, disposed = false, seeking = false, pumpRaf = 0;
  let seekStarted = 0, seekMs = 0, maxSeekMs = 0, completedSeeks = 0;
  let downloadMs = 0, downloaded = false, forceSeek = false;
  let quality: 'none' | 'preview' | 'full' = 'none';
  let sourceQuality: 'preview' | 'full' = 'preview';
  let generation = 0, upgradeStarted = false, previewUrl = '';
  let upgradeAbort: AbortController | null = null;
  const downloadControllers = new Set<AbortController>();
  const blobUrls = new Set<string>();

  async function download(url: string, priority: RequestPriority, run: number) {
    // Fetch a complete static CDN object once; never route scrubbing through
    // the Worker that would read the whole MP4 again for every small range.
    const abort = new AbortController();
    downloadControllers.add(abort);
    if (priority === 'low') upgradeAbort = abort;
    const timeout = window.setTimeout(() => abort.abort(), 60_000);
    try {
      const response = await fetch(url, { signal: abort.signal, priority });
      if (!response.ok) throw new Error('Video unavailable');
      const blob = await response.blob();
      if (disposed || reduced || run !== generation || abort.signal.aborted) return null;
      if (!blob.size) throw new Error('Empty video');
      const local = URL.createObjectURL(new Blob([blob], { type: 'video/mp4' }));
      blobUrls.add(local);
      return local;
    } finally {
      window.clearTimeout(timeout);
      downloadControllers.delete(abort);
      if (upgradeAbort === abort) upgradeAbort = null;
    }
  }

  function install(local: string, level: 'preview' | 'full') {
    if (disposed || reduced) return;
    sourceQuality = level;
    downloaded = true;
    seeking = false;
    // loadeddata on a replacement source is frame zero. Do not flash it while
    // the visitor is looking at a later frame or holding the phone close-up.
    forceSeek = rendered >= 0;
    video.preload = 'auto';
    video.src = local;
    video.load();
  }

  function upgrade() {
    if (upgradeStarted || !previewSrc || disposed || reduced || !active) return;
    upgradeStarted = true;
    const run = generation;
    void download(src, 'low', run).then(local => {
      if (local) install(local, 'full');
    }).catch(() => { /* The complete preview stays playable if HD is unavailable. */ });
  }

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
    const run = ++generation;
    const start = performance.now();
    void download(previewSrc ?? src, 'high', run).then(local => {
      if (!local) return;
      downloadMs = performance.now() - start;
      if (previewSrc) previewUrl = local;
      install(local, previewSrc ? 'preview' : 'full');
    }).catch(() => { if (!disposed && run === generation && !reduced) fail(); });
  }

  function schedulePump() {
    if (!pumpRaf && !disposed) pumpRaf = requestAnimationFrame(() => { pumpRaf = 0; pump(); });
  }

  function pump() {
    // Metadata alone cannot supply a drawable frame. Seeking at that point can
    // interrupt the opening download (notably WebKit's initial range probe).
    if (disposed || !active || reduced || failed || document.hidden || seeking || video.seeking || video.readyState < 2) return;
    if (rendered === desired && !forceSeek) return;
    // Seek into the middle of a frame to avoid floating point/keyframe boundaries.
    const time = Math.min((desired + .25) / fps, Math.max(0, video.duration - .001));
    if (!Number.isFinite(time)) return;
    seeking = true;
    seekStarted = performance.now();
    video.currentTime = time;
  }

  function capture() {
    if (disposed || reduced || video.seeking || video.readyState < 2 || !video.videoWidth || !context) return;
    if (forceSeek && !seeking) { schedulePump(); return; }
    const index = Math.min(count - 1, Math.max(0, Math.floor(video.currentTime * fps + .001)));
    if (snapshot.width !== video.videoWidth || snapshot.height !== video.videoHeight) {
      // A new image identity makes consumers repaint an HD upgrade even if the
      // scroll frame itself has not changed.
      snapshot = document.createElement('canvas');
      snapshot.width = video.videoWidth; snapshot.height = video.videoHeight;
      context = snapshot.getContext('2d', { alpha: false });
    }
    if (!context) { fail(); return; }
    context.drawImage(video, 0, 0);
    rendered = index;
    if (seeking) { seekMs = performance.now() - seekStarted; maxSeekMs = Math.max(maxSeekMs, seekMs); completedSeeks++; }
    seeking = false; forceSeek = false; quality = sourceQuality;
    onChange();
    if (quality === 'preview') upgrade();
    // Let the consumer paint this decoded shot before starting the latest seek.
    schedulePump();
  }

  function fail() {
    if (disposed) return;
    if (sourceQuality === 'full' && previewUrl) {
      install(previewUrl, 'preview'); return;
    }
    failed = true; seeking = false;
    if (active) loadStill(desired);
  }
  video.addEventListener('loadedmetadata', schedulePump);
  video.addEventListener('loadeddata', capture);
  video.addEventListener('seeked', capture);
  video.addEventListener('canplay', schedulePump);
  video.addEventListener('error', fail);

  return {
    preload,
    request(frame: number, enabled: boolean, reducedMotion = false) {
      desired = Math.max(0, Math.min(count - 1, Math.round(frame)));
      active = enabled;
      if (reducedMotion && !reduced && started) {
        generation++;
        downloadControllers.forEach(abort => abort.abort());
        video.removeAttribute('src'); video.load(); started = false; seeking = false;
        blobUrls.forEach(url => URL.revokeObjectURL(url)); blobUrls.clear();
        previewUrl = ''; upgradeStarted = false; downloaded = false;
      }
      reduced = reducedMotion;
      if (!active) {
        // Do not let an unseen HD upgrade starve the next scene's small preview.
        if (upgradeAbort) { upgradeAbort.abort(); upgradeStarted = false; }
        return;
      }
      if (quality === 'preview' && !reduced) upgrade();
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
      return { loaded: downloaded ? count : 0, decoded: rendered >= 0 ? 1 : 0,
        seekMs, maxSeekMs, completedSeeks, downloadMs, quality, failed };
    },
    destroy() {
      disposed = true;
      cancelAnimationFrame(pumpRaf);
      generation++;
      downloadControllers.forEach(abort => abort.abort());
      video.removeEventListener('loadedmetadata', schedulePump);
      video.removeEventListener('loadeddata', capture);
      video.removeEventListener('seeked', capture);
      video.removeEventListener('canplay', schedulePump);
      video.removeEventListener('error', fail);
      video.pause(); video.removeAttribute('src'); video.load();
      video.remove();
      blobUrls.forEach(url => URL.revokeObjectURL(url)); blobUrls.clear();
      pendingStills.forEach(abort => abort.abort());
      stills.forEach(releaseFrame); stills.clear();
      snapshot.width = snapshot.height = 1;
    },
  };
}
