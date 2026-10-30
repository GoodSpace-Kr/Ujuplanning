const clamp = (value: number) => Math.max(0, Math.min(1, value));
const smooth = (value: number) => value * value * (3 - 2 * value);

// A short opening composition, then four moves separated by reading intervals.
// Everything is derived from position, so reversing the scroll retraces the scene.
const OPENING = .12;
const FINISH = .94;
const READING = .3;

export function projectJourney(progress: number, count = 5) {
  const p = clamp(progress);
  const travel = clamp((p - OPENING) / (FINISH - OPENING)) * Math.max(0, count - 1);
  const section = Math.floor(travel);
  const position = Math.min(count - 1, section + smooth(clamp((travel - section - READING) / (1 - READING))));
  return { position, active: Math.round(position), opening: smooth(clamp(p / OPENING)) };
}

export function projectScrollStop(index: number, count = 5) {
  if (index <= 0 || count <= 1) return 0;
  if (index >= count - 1) return FINISH;
  return OPENING + (FINISH - OPENING) * index / (count - 1);
}

export function projectArtworkPose(position: number, index: number, opening: number) {
  const distance = Math.max(-1.5, Math.min(1.5, index - position));
  const intro = index === 0 ? 1 - opening : 0;
  return {
    x: distance * 36 + intro * 18,
    y: distance * 25 + intro * 18,
    scale: 1 - Math.min(1, Math.abs(distance)) * .055 + intro * .045,
    rotation: distance * -1.6 + intro * -1.2,
    depth: distance * 16 + intro * 12,
    opacity: 1 - Math.min(1, Math.abs(distance)) * .36,
  };
}
