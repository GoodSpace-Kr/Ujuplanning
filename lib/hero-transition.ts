const clamp = (value: number) => Math.min(1, Math.max(0, value));
const range = (value: number, start: number, end: number) => clamp((value - start) / (end - start));
const smooth = (value: number) => value * value * (3 - 2 * value);

// The first 70% preserves the original five-project sequence. The added scroll
// distance is reserved for the phone expansion and the service introduction.
export function getHeroTimeline(progress: number, projectCount: number, reducedMotion = false) {
  const p = clamp(progress);
  const intro = clamp(p / .7);
  const focus = clamp(intro / .28);
  const exit = smooth(range(p, .72, .93));
  const reducedExit = p >= .855 ? 1 : 0;
  return {
    focus,
    expansion: reducedMotion ? reducedExit : exit,
    worldScale: 1 + clamp((focus - .38) / .42) * 5.2,
    blackOpacity: clamp((focus - .62) / .14),
    phoneOpacity: range(intro, .3, .36) * (1 - (reducedMotion ? reducedExit : smooth(range(p, .89, .94)))),
    projectOpacity: range(intro, .36, .44),
    projectCopyOpacity: range(intro, .36, .44) * (1 - smooth(range(p, .72, .77))),
    surfaceOpacity: reducedMotion ? reducedExit : smooth(range(p, .76, .87)),
    headingOpacity: reducedMotion ? reducedExit : smooth(range(p, .865, .94)),
    projectIndex: Math.min(Math.max(0, projectCount - 1), Math.floor(range(intro, .36, 1) * projectCount)),
  };
}

export function getHeroFrame(width: number, height: number, focus: number, expansion: number) {
  const aspect = 434 / 883;
  let phoneHeight = Math.min(height * .74, 660);
  let phoneWidth = phoneHeight * aspect;
  if (phoneWidth > width * .62) {
    phoneWidth = width * .62;
    phoneHeight = phoneWidth / aspect;
  }
  // Enlarge the actual phone uniformly until its inset screen covers the viewport.
  const coverScale = Math.max(width / (phoneWidth * .884), height / (phoneHeight * .943)) * 1.03;
  const scale = 1 + (coverScale - 1) * expansion;
  const frameWidth = expansion > 0 ? phoneWidth * scale : width + (phoneWidth - width) * focus;
  const frameHeight = expansion > 0 ? phoneHeight * scale : height + (phoneHeight - height) * focus;
  return {
    width: frameWidth,
    height: frameHeight,
    left: (width - frameWidth) / 2,
    top: (height - frameHeight) / 2,
    radiusX: frameWidth * .135 * focus * (1 - expansion),
    radiusY: frameHeight * .065 * focus * (1 - expansion),
  };
}
