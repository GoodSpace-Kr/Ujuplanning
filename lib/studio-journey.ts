import { getPhoneCoverScale } from './hero-transition';

export const STUDIO_FRAMES = 241;
export const STUDIO_SOURCE = { width: 1920, height: 1080 };
// Measured on the supplied video's final frame, in 1920 × 1080 coordinates.
export const STUDIO_PHONE = { x: 764, y: 102, width: 391, height: 835 };
export const STUDIO_SCREEN = { x: 780, y: 118, width: 358, height: 803, radius: 51 };
const clamp = (n: number) => Math.max(0, Math.min(1, n));
const range = (p: number, a: number, b: number) => clamp((p - a) / (b - a));
const smooth = (p: number) => p * p * (3 - 2 * p);

export const STUDIO_ENTRY_START = .39;
export const STUDIO_ENTRY_END = .6;
export const STUDIO_ENTRY_DURATION = 2000;

export function shouldStartStudioEntry(previous: number, next: number, reduced = false) {
  return !reduced && previous < STUDIO_ENTRY_END && next > previous &&
    next >= STUDIO_ENTRY_START && next < STUDIO_ENTRY_END;
}

export function studioEntryProgress(elapsed: number, from = STUDIO_ENTRY_START) {
  return Math.min(STUDIO_ENTRY_END, Math.max(STUDIO_ENTRY_START, from) +
    (STUDIO_ENTRY_END - STUDIO_ENTRY_START) * clamp(elapsed / STUDIO_ENTRY_DURATION));
}

export function studioTimeline(progress: number, reduced = false) {
  const p = clamp(progress);
  // The timeline ends on the fifth project. The sticky stage then releases
  // straight into services, with no contraction or return to the studio.
  const forward = range(p, .03, STUDIO_ENTRY_START);
  const zoom = reduced ? (p >= .5 ? 1 : 0) : smooth(range(p, .42, .585));
  const frame = reduced
    ? (p < STUDIO_ENTRY_START ? 0 : STUDIO_FRAMES - 1)
    : Math.round(forward * (STUDIO_FRAMES - 1));
  return {
    frame,
    zoom,
    phase: p < .42 ? 'approach' : p < .585 ? 'expand' : 'projects',
    opening: 1 - smooth(range(p, .0375, .1125)),
    projectOpacity: smooth(range(p, .566, STUDIO_ENTRY_END)),
    projectIndex: Math.min(4, Math.floor(range(p, STUDIO_ENTRY_END, .975) * 5)),
    projectProgress: range(p, STUDIO_ENTRY_END, .975),
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
