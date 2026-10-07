import { brandExpansionClock, BRAND_EXPANSION_DURATION, BRAND_PROCESS_EXPANSION_START, shouldStartBrandExpansion } from './brand-process-journey';
import { isAutomaticScrollActive, normalizeWheelDelta, setAutomaticScrollActive } from './scroll-motion';

// Advance the native scroll position over the existing expansion interval.
// The card and telescope sequence therefore keep a single, reversible timeline.
export function mountProcessExpansion(section: HTMLElement) {
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const sticky = section.querySelector<HTMLElement>('.brand-process-sticky')!;
  let frame = 0, running = false, completed = false;
  let elapsed = 0, lastTime = 0, from = 0, reverseIntent = 0, touchY = 0;

  function geometry() {
    const viewport = sticky.clientHeight;
    const style = getComputedStyle(section);
    const expansionStart = (parseFloat(style.getPropertyValue('--process-expansion-start')) || BRAND_PROCESS_EXPANSION_START)
      + (parseFloat(style.getPropertyValue('--process-delay')) || 0);
    const top = section.getBoundingClientRect().top;
    return { viewport, origin: window.scrollY + top, expansionStart, position: (-top / Math.max(1, viewport) * 100 - expansionStart) / 100 };
  }
  let previous = geometry().position;

  function stop(state: 'complete' | 'cancelled') {
    if (!running) return;
    running = false;
    completed = true;
    cancelAnimationFrame(frame);
    frame = 0;
    section.dataset.autoExpand = state;
    setAutomaticScrollActive(false);
    previous = geometry().position;
  }

  function tick(time: number) {
    frame = 0;
    if (!running) return;
    if (document.hidden || motion.matches) { stop('cancelled'); return; }
    elapsed += lastTime ? Math.min(50, time - lastTime) : 0;
    lastTime = time;
    const value = brandExpansionClock(elapsed, from);
    const { origin, viewport, expansionStart } = geometry();
    const destination = origin + (expansionStart / 100 + value) * viewport;
    window.scrollTo({ top: value === 1 ? Math.ceil(destination) : destination, behavior: 'instant' });
    previous = geometry().position;
    if (elapsed >= BRAND_EXPANSION_DURATION) stop('complete');
    else frame = requestAnimationFrame(tick);
  }

  function start(position: number) {
    if (running || isAutomaticScrollActive() || section.dataset.phase !== 'steps') return;
    running = true;
    from = Math.max(0, Math.min(1, position));
    elapsed = lastTime = reverseIntent = 0;
    section.dataset.autoExpand = 'running';
    setAutomaticScrollActive(true);
    frame = requestAnimationFrame(tick);
  }

  function onScroll() {
    const next = geometry().position;
    if (running) return;
    // Only rearm after deliberately returning to the mosaic, not from endpoint rounding.
    if (next < -.03) completed = false;
    if (shouldStartBrandExpansion(previous, next, motion.matches, completed)) start(next);
    previous = next;
  }
  function onWheel(event: WheelEvent) {
    if (event.ctrlKey || event.metaKey || event.shiftKey || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
    const { position, viewport } = geometry();
    if (!running && event.deltaY > 0 && shouldStartBrandExpansion(position, position + .000001, motion.matches, completed)) start(position);
    if (!running) return;
    reverseIntent = event.deltaY < 0 ? reverseIntent - normalizeWheelDelta(event.deltaY, event.deltaMode, viewport) : 0;
    if (reverseIntent >= 24) stop('cancelled');
    else if (event.cancelable) event.preventDefault();
  }
  function onTouchStart(event: TouchEvent) { touchY = event.touches[0]?.clientY ?? 0; }
  function onTouchMove(event: TouchEvent) {
    if (event.touches.length !== 1) return;
    const next = event.touches[0].clientY;
    const delta = touchY - next;
    touchY = next;
    if (!running) return;
    if (delta < -2) stop('cancelled');
    else if (event.cancelable) event.preventDefault();
  }
  function onKeyDown(event: KeyboardEvent) {
    if (!running || event.target instanceof HTMLElement && event.target.closest('input, textarea, select, [contenteditable="true"]')) return;
    if (['Escape', 'ArrowUp', 'PageUp', 'Home', 'Tab'].includes(event.key) || event.key === ' ' && event.shiftKey) stop('cancelled');
    else if (['ArrowDown', 'PageDown', ' ', 'End'].includes(event.key)) event.preventDefault();
  }
  function onDirectNavigation() { stop('cancelled'); previous = geometry().position; }
  function onPointerDown(event: PointerEvent) {
    if (event.clientX >= document.documentElement.clientWidth || event.target instanceof HTMLElement && event.target.closest('a')) onDirectNavigation();
  }
  function onVisibility() { if (document.hidden) onDirectNavigation(); }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('wheel', onWheel, { passive: false, capture: true });
  window.addEventListener('touchstart', onTouchStart, { passive: true });
  window.addEventListener('touchmove', onTouchMove, { passive: false, capture: true });
  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('pointerdown', onPointerDown);
  window.addEventListener('hashchange', onDirectNavigation);
  window.addEventListener('resize', onDirectNavigation);
  document.addEventListener('visibilitychange', onVisibility);
  motion.addEventListener('change', onDirectNavigation);
  return () => {
    stop('cancelled');
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('wheel', onWheel, { capture: true });
    window.removeEventListener('touchstart', onTouchStart);
    window.removeEventListener('touchmove', onTouchMove, { capture: true });
    window.removeEventListener('keydown', onKeyDown);
    window.removeEventListener('pointerdown', onPointerDown);
    window.removeEventListener('hashchange', onDirectNavigation);
    window.removeEventListener('resize', onDirectNavigation);
    document.removeEventListener('visibilitychange', onVisibility);
    motion.removeEventListener('change', onDirectNavigation);
  };
}
