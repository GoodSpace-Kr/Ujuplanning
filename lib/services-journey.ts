export const SERVICE_PAGE = { width: 1080, height: 740 } as const;

const clamp = (value: number) => Math.min(1, Math.max(0, value));
const smoothstep = (value: number) => { const t = clamp(value); return t * t * (3 - 2 * t); };
export const SERVICE_TITLE_TYPING_END = .25;
const SERVICE_TITLE_EXIT_START = .35;

export function serviceTitleCharacterCount(progress: number, total: number) {
  return Math.floor(clamp(progress / SERVICE_TITLE_TYPING_END) * total);
}

// The copy follows the document scroll. The nearest service to the visible
// reading area determines which workspace is shown beside it.
export function activeServiceIndex(centers: number[], visibleCenter: number) {
  let active = 0;
  let nearest = Number.POSITIVE_INFINITY;
  centers.forEach((center, index) => {
    const distance = Math.abs(center - visibleCenter);
    if (distance < nearest) {
      active = index;
      nearest = distance;
    }
  });
  return active;
}

export function serviceCopyPose(center: number, visibleCenter: number, panelHeight: number) {
  const distance = Math.max(-1, Math.min(1, (center - visibleCenter) / Math.max(panelHeight, 1)));
  const away = Math.abs(distance);
  return {
    offset: distance * 84,
    scale: 1 - away * .055,
    opacity: 1 - away * .78,
  };
}

export function servicePageScale(width: number, height: number) {
  return Math.min(
    Math.max(0, width - 32) / SERVICE_PAGE.width,
    Math.max(0, height - 48) / SERVICE_PAGE.height,
    1,
  );
}

export function serviceEntryPose(
  progress: number,
  viewportWidth: number,
  viewportHeight: number,
  visualLeft: number,
  visualTop: number,
  visualWidth: number,
  visualHeight: number,
) {
  const p = clamp(progress);
  const settledScale = servicePageScale(visualWidth, visualHeight);
  const peekScale = Math.min(settledScale * 1.2, viewportWidth * 1.06 / SERVICE_PAGE.width);
  const settle = smoothstep(p);
  const startX = viewportWidth / 2;
  const endX = visualLeft + visualWidth / 2;
  const startY = viewportHeight * .7 + SERVICE_PAGE.height * peekScale / 2;
  const endY = visualHeight / 2;
  const globalX = startX + (endX - startX) * settle;
  const globalY = startY + (endY - startY) * settle;
  return {
    x: globalX - visualLeft,
    y: p >= 1 ? endY : globalY - visualTop,
    scale: peekScale + (settledScale - peekScale) * settle,
    opacity: smoothstep((progress + .1) / .1),
    titleScale: .8 + .2 * smoothstep(p / SERVICE_TITLE_TYPING_END),
    titleOpacity: 1 - smoothstep((p - SERVICE_TITLE_EXIT_START) / .22),
    titleOffset: -viewportHeight * .1 * smoothstep((p - SERVICE_TITLE_EXIT_START) / .22),
  };
}
