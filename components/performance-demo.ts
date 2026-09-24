export const PERFORMANCE_DURATION = 3000;

export function getPerformanceMotion(elapsed: number) {
  const time = Math.max(0, Math.min(PERFORMANCE_DURATION, elapsed));
  const progress = Math.min(1, Math.max(0, (time - 1200) / 1800));
  return {
    time,
    progress,
    growth: 1 - (1 - progress) ** 3,
    marker: Math.min(1, time / 450),
    resultMarker: Math.min(1, Math.max(0, (time - 250) / 500)),
    image: time < 650 ? 0 : time < 1300 ? 1 : 2,
  };
}
