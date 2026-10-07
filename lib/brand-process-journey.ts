const clamp = (value: number) => Math.max(0, Math.min(1, value));

export const BRAND_EXPANSION_DURATION = 900;
export const BRAND_PROCESS_EXPANSION_START = 22;

// Reverse the photo diagonal first, then let every surrounding tile settle.
export function brandProcessIntroPhase(elapsed: number): 'moving' | 'mosaic' | 'steps' {
  if (elapsed < 1000) return 'moving';
  return elapsed < 2200 ? 'mosaic' : 'steps';
}

export function brandProcessIntroDelay(offset: number, viewport: number) {
  return Math.max(0, offset / Math.max(1, viewport) * 100 - BRAND_PROCESS_EXPANSION_START);
}

export function shouldStartBrandExpansion(previous: number, next: number, reduced: boolean, completed: boolean) {
  return !reduced && !completed && next > previous && next >= 0 && next < 1;
}

export function brandExpansionClock(elapsed: number, from = 0) {
  const start = clamp(from);
  return start + (1 - start) * clamp(elapsed / BRAND_EXPANSION_DURATION);
}

export function brandProcessJourney(offset: number, viewport: number, expansionStartVh = BRAND_PROCESS_EXPANSION_START, filmVh = 360, introDelay = 0) {
  const position = offset / Math.max(1, viewport) * 100 - introDelay;
  const rawExpansion = clamp((position - expansionStartVh) / 100);
  // Fractional svh anchor positions may land a fraction of a pixel short.
  const expansion = rawExpansion > .999 ? 1 : rawExpansion;
  return {
    expansion: expansion * expansion * (3 - 2 * expansion),
    film: clamp((position - expansionStartVh - 100) / filmVh),
  };
}

export function measureBrandProcess(section: HTMLElement) {
  const style = getComputedStyle(section);
  const viewport = section.querySelector<HTMLElement>('.brand-process-sticky')!.clientHeight;
  return brandProcessJourney(-section.getBoundingClientRect().top, viewport,
    parseFloat(style.getPropertyValue('--process-expansion-start')) || BRAND_PROCESS_EXPANSION_START,
    parseFloat(style.getPropertyValue('--process-film')) || 360,
    parseFloat(style.getPropertyValue('--process-delay')) || 0);
}
