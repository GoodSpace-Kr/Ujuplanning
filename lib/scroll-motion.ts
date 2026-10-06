// Keep the wheel glide and the timed phone animation from writing scrollY together.
let automaticScroll = false;
const ownershipListeners = new Set<() => void>();

export function isAutomaticScrollActive() { return automaticScroll; }
export function setAutomaticScrollActive(active: boolean) {
  if (automaticScroll === active) return;
  automaticScroll = active;
  ownershipListeners.forEach(listener => listener());
}
export function subscribeScrollOwnership(listener: () => void) {
  ownershipListeners.add(listener);
  return () => { ownershipListeners.delete(listener); };
}

export function normalizeWheelDelta(delta: number, mode: number, viewportHeight: number) {
  return delta * (mode === 1 ? 20 : mode === 2 ? viewportHeight : 1);
}

export function scrollDestination(current: number, target: number, delta: number, max: number) {
  // Reversing direction responds immediately instead of fighting residual momentum.
  const base = (target - current) * delta < 0 ? current : target;
  return Math.max(0, Math.min(max, base + delta));
}

export function advanceScroll(current: number, target: number, elapsedMs: number) {
  const next = current + (target - current) * (1 - Math.exp(-Math.max(0, elapsedMs) / 145));
  return Math.abs(target - next) < .5 ? target : next;
}
