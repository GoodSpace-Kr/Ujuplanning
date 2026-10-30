const clamp = (value: number) => Math.max(0, Math.min(1, value));
const smooth = (value: number) => value * value * (3 - 2 * value);

// Native document scrolling is never intercepted. Only the artwork responds
// to its section's position; the copy remains in the normal reading flow.
export function projectScenePose(top: number, height: number, viewport: number, compact = false, reduced = false) {
  const progress = clamp((viewport - top) / Math.max(1, viewport + height));
  if (reduced) return { progress, enter: 1, lift: 0, drift: 0, turn: 0, scale: 1 };
  const enter = smooth(clamp((progress - .08) / .4));
  const drift = Math.max(-1, Math.min(1, (progress - .5) * 2));
  const strength = compact ? .55 : 1;
  return {
    progress,
    enter,
    lift: ((1 - enter) * 100 - Math.max(0, drift) * 48) * strength,
    drift: drift * 42 * strength,
    turn: (1 - enter) * 3 * strength,
    scale: 1 - (1 - enter) * .09,
  };
}
