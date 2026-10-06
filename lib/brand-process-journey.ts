const clamp = (value: number) => Math.max(0, Math.min(1, value));

export const BRAND_EXPANSION_DURATION = 1200;

export function shouldStartBrandExpansion(previous: number, next: number, reduced: boolean, completed: boolean) {
  return !reduced && !completed && next > previous && next >= 0 && next < 1;
}

export function brandExpansionClock(elapsed: number, from = 0) {
  const start = clamp(from);
  return start + (1 - start) * clamp(elapsed / BRAND_EXPANSION_DURATION);
}

export function brandProcessJourney(offset: number, viewport: number, readingVh = 465, filmVh = 360) {
  const position = offset / Math.max(1, viewport) * 100;
  const rawExpansion = clamp((position - readingVh) / 100);
  // Fractional svh anchor positions may land a fraction of a pixel short.
  const expansion = rawExpansion > .999 ? 1 : rawExpansion;
  return {
    reading: clamp((position - 85) / (readingVh - 85)),
    expansion: expansion * expansion * (3 - 2 * expansion),
    film: clamp((position - readingVh - 100) / filmVh),
  };
}

export function measureBrandProcess(section: HTMLElement) {
  const style = getComputedStyle(section);
  const viewport = section.querySelector<HTMLElement>('.brand-process-sticky')!.clientHeight;
  return brandProcessJourney(-section.getBoundingClientRect().top, viewport,
    parseFloat(style.getPropertyValue('--process-reading')) || 465,
    parseFloat(style.getPropertyValue('--process-film')) || 360);
}
