import { getPhoneCoverScale } from './hero-transition';

export const STUDIO_FRAMES = 241;
export const STUDIO_SOURCE = { width: 1920, height: 1080 };
// Measured on the supplied video's final frame, in 1920 × 1080 coordinates.
export const STUDIO_PHONE = { x: 764, y: 102, width: 391, height: 835 };
export const STUDIO_SCREEN = { x: 780, y: 118, width: 358, height: 803, radius: 51 };
const clamp = (n: number) => Math.max(0, Math.min(1, n));
const range = (p: number, a: number, b: number) => clamp((p - a) / (b - a));
const smooth = (p: number) => p * p * (3 - 2 * p);

export function studioTimeline(progress: number, reduced = false) {
  const p = clamp(progress);
  const forward = range(p, .02, .26);
  const reverse = range(p, .79, .965);
  const zoomIn = smooth(range(p, .28, .39));
  const zoomOut = smooth(range(p, .665, .775));
  const zoom = reduced ? (p >= .335 && p < .72 ? 1 : 0) : zoomIn * (1 - zoomOut);
  const frame = reduced
    ? (p < .26 || p >= .965 ? 0 : STUDIO_FRAMES - 1)
    : Math.round(forward * (1 - reverse) * (STUDIO_FRAMES - 1));
  return {
    frame,
    zoom,
    phase: p < .28 ? 'approach' : p < .39 ? 'expand' : p < .665 ? 'projects' : p < .79 ? 'contract' : 'return',
    opening: 1 - smooth(range(p, .025, .075)),
    projectOpacity: smooth(range(p, .377, .4)) * (1 - smooth(range(p, .66, .69))),
    projectIndex: Math.min(4, Math.floor(range(p, .40, .65) * 5)),
    projectProgress: range(p, .40, .65),
    returnCopy: smooth(range(p, .952, .985)),
  };
}

export function studioGeometry(width: number, height: number, zoom: number) {
  const base = Math.max(width / STUDIO_SOURCE.width, height / STUDIO_SOURCE.height);
  const baseX = (width - STUDIO_SOURCE.width * base) / 2;
  const baseY = (height - STUDIO_SOURCE.height * base) / 2;
  const centerX = baseX + (STUDIO_PHONE.x + STUDIO_PHONE.width / 2) * base;
  const centerY = baseY + (STUDIO_PHONE.y + STUDIO_PHONE.height / 2) * base;
  const scale = Math.pow(getPhoneCoverScale(width, height, STUDIO_SCREEN.width * base, STUDIO_SCREEN.height * base), zoom);
  // One transform for phone AND desk: the background is pushed out of view.
  const x = centerX + (baseX - centerX) * scale + (width / 2 - centerX) * zoom;
  const y = centerY + (baseY - centerY) * scale + (height / 2 - centerY) * zoom;
  return {
    x, y, width: STUDIO_SOURCE.width * base * scale, height: STUDIO_SOURCE.height * base * scale,
    screen: {
      x: x + STUDIO_SCREEN.x * base * scale,
      y: y + STUDIO_SCREEN.y * base * scale,
      width: STUDIO_SCREEN.width * base * scale,
      height: STUDIO_SCREEN.height * base * scale,
      radius: STUDIO_SCREEN.radius * base * scale,
    },
  };
}
