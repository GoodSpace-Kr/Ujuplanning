import { STUDIO_FRAMES } from './studio-journey';
import media from './scroll-video.generated.json';
import { createScrollVideo } from './scroll-video';
import { decodeFrame, releaseFrame, type FrameImage } from './sequence-frames';

export function createStudioFrames(onChange: () => void, onFailure: () => void) {
  const mobile = matchMedia('(max-width: 700px)').matches;
  const variant = mobile ? 'mobile' : 'desktop';
  const frames = createScrollVideo({
    count: STUDIO_FRAMES,
    src: media.studio[variant].src,
    previewSrc: media.studio.preview.src,
    fps: media.studio[variant].fps,
    directory: `/assets/studio-sequence/${variant}`,
    onChange,
    onFailure,
  });
  const abort = new AbortController();
  let detail: FrameImage | null = null, detailRequested = false, disposed = false;
  return {
    ...frames,
    get(frame: number, exact = false) {
      if (frame === STUDIO_FRAMES - 1 && detail) return { image: detail, width: detail.width, height: detail.height, index: frame };
      return frames.get(frame, exact);
    },
    preloadDetail() {
      if (detailRequested || disposed) return;
      detailRequested = true;
      fetch(`/assets/studio-sequence/${mobile ? 'desktop/0240.webp' : 'detail.webp'}`, { signal: abort.signal, priority: 'low' })
        .then(response => { if (!response.ok) throw new Error('Detail unavailable'); return response.blob(); })
        .then(decodeFrame).then(image => { if (disposed) releaseFrame(image); else { detail = image; onChange(); } })
        .catch(() => { /* The normal final frame remains usable if detail fails. */ });
    },
    destroy() {
      disposed = true; abort.abort(); frames.destroy();
      if (detail) releaseFrame(detail);
    },
  };
}
