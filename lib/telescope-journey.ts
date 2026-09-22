const clamp = (value: number) => Math.min(1, Math.max(0, value));
const smooth = (value: number) => value * value * (3 - 2 * value);
const between = (value: number, start: number, end: number) => smooth(clamp((value - start) / (end - start)));

export function getTelescopeJourney(progress: number, reducedMotion = false) {
  const p = clamp(progress);
  const approach = reducedMotion ? 0 : between(p, .12, .80);
  const alignment = reducedMotion ? 0 : between(p, .12, .44);
  return {
    approach,
    alignment,
    distance: Math.exp(Math.log(7.2) * (1 - approach) + Math.log(.065) * approach),
    portal: reducedMotion ? between(p, .52, .72) : between(p, .53, .76),
    fullUniverse: reducedMotion ? between(p, .52, .72) : between(p, .80, .88),
    openingOpacity: 1 - between(p, .10, .28),
    endingOpacity: between(p, .87, .96),
  };
}
