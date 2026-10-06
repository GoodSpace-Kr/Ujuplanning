'use client';

import { useEffect } from 'react';
import { advanceScroll, isAutomaticScrollActive, normalizeWheelDelta, scrollDestination, subscribeScrollOwnership } from '@/lib/scroll-motion';

export function SmoothScroll() {
  useEffect(() => {
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    const root = document.documentElement;
    let frame = 0, lastTime = 0;
    let current = window.scrollY, target = current, written = current;

    function reset() {
      cancelAnimationFrame(frame);
      frame = 0;
      lastTime = 0;
      current = target = written = window.scrollY;
      root.dataset.scrollMotion = isAutomaticScrollActive() ? 'automatic' : motion.matches ? 'native' : 'idle';
    }

    function tick(time: number) {
      frame = 0;
      // Native navigation, focus, scroll restoration and other scripts take priority.
      if (motion.matches || isAutomaticScrollActive() || document.hidden || Math.abs(window.scrollY - written) > 1) {
        reset();
        return;
      }
      target = Math.min(target, Math.max(0, root.scrollHeight - window.innerHeight));
      current = advanceScroll(current, target, lastTime ? Math.min(time - lastTime, 50) : 16.67);
      lastTime = time;
      window.scrollTo({ top: current, left: window.scrollX, behavior: 'instant' });
      written = window.scrollY;
      if (current !== target) frame = requestAnimationFrame(tick);
      else reset();
    }

    function hasNativeScrollTarget(event: WheelEvent, delta: number) {
      const element = event.target instanceof Element ? event.target : null;
      if (element?.closest('input, textarea, select, [contenteditable="true"], [data-native-scroll]')) return true;
      for (let node = element; node && node !== document.body && node !== root; node = node.parentElement) {
        if (node.scrollHeight <= node.clientHeight + 1) continue;
        if (!/^(auto|scroll|overlay)$/.test(getComputedStyle(node).overflowY)) continue;
        if (delta < 0 ? node.scrollTop > 0 : node.scrollTop + node.clientHeight < node.scrollHeight - 1) return true;
      }
      return false;
    }

    function onWheel(event: WheelEvent) {
      if (event.defaultPrevented || !event.cancelable || motion.matches || isAutomaticScrollActive() ||
        event.ctrlKey || event.metaKey || event.shiftKey || Math.abs(event.deltaX) > Math.abs(event.deltaY)) {
        reset();
        return;
      }
      const delta = normalizeWheelDelta(event.deltaY, event.deltaMode, window.innerHeight);
      if (!delta || hasNativeScrollTarget(event, delta)) { reset(); return; }
      if (!frame || Math.abs(window.scrollY - written) > 1) reset();
      target = scrollDestination(current, target, delta, Math.max(0, root.scrollHeight - window.innerHeight));
      if (target === current) return;
      event.preventDefault();
      root.dataset.scrollMotion = 'gliding';
      if (!frame) frame = requestAnimationFrame(tick);
    }

    function onScroll() {
      if (!frame || Math.abs(window.scrollY - written) > 1) reset();
    }

    const unsubscribe = subscribeScrollOwnership(reset);
    reset();
    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('scroll', onScroll, { passive: true });
    // Touch devices keep their native inertia. Direct user input cancels any wheel tail.
    window.addEventListener('touchstart', reset, { passive: true });
    window.addEventListener('pointerdown', reset, { passive: true });
    window.addEventListener('keydown', reset, { capture: true });
    window.addEventListener('hashchange', reset);
    window.addEventListener('resize', reset);
    window.addEventListener('pageshow', reset);
    document.addEventListener('visibilitychange', reset);
    motion.addEventListener('change', reset);
    return () => {
      reset();
      unsubscribe();
      delete root.dataset.scrollMotion;
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('touchstart', reset);
      window.removeEventListener('pointerdown', reset);
      window.removeEventListener('keydown', reset, { capture: true });
      window.removeEventListener('hashchange', reset);
      window.removeEventListener('resize', reset);
      window.removeEventListener('pageshow', reset);
      document.removeEventListener('visibilitychange', reset);
      motion.removeEventListener('change', reset);
    };
  }, []);

  return null;
}
