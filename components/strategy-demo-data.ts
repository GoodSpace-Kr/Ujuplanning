export type StrategySample = {
  brands: number;
  segments: number;
  affinity: number;
  scores: { market: number; brand: number }[];
  goals: number;
  shares: [number, number, number];
  contentTotal: number;
  contentDone: number;
};

export const INITIAL_STRATEGY_SAMPLE: StrategySample = {
  brands: 24,
  segments: 3,
  affinity: 78,
  scores: [{ market: 42, brand: 68 }, { market: 56, brand: 82 }, { market: 48, brand: 72 }, { market: 54, brand: 90 }],
  goals: 3,
  shares: [40, 35, 25],
  contentTotal: 12,
  contentDone: 8,
};

export function createStrategySample(random = Math.random): StrategySample {
  const integer = (min: number, max: number) => min + Math.floor(random() * (max - min + 1));
  const search = integer(30, 48);
  const content = integer(25, 38);
  const contentTotal = integer(12, 24);
  return {
    brands: integer(22, 48),
    segments: integer(3, 6),
    affinity: integer(72, 94),
    scores: Array.from({ length: 4 }, () => ({ market: integer(35, 62), brand: integer(64, 95) })),
    goals: integer(3, 5),
    shares: [search, content, 100 - search - content],
    contentTotal,
    contentDone: Math.round(contentTotal * integer(40, 88) / 100),
  };
}

export function interpolateStrategySample(from: StrategySample, to: StrategySample, progress: number): StrategySample {
  const mix = (a: number, b: number) => Math.round(a + (b - a) * progress);
  const search = mix(from.shares[0], to.shares[0]);
  const content = mix(from.shares[1], to.shares[1]);
  // Keep displayed totals and chart proportions consistent throughout the tween.
  return {
    brands: mix(from.brands, to.brands),
    segments: mix(from.segments, to.segments),
    affinity: mix(from.affinity, to.affinity),
    scores: from.scores.map((score, index) => ({ market: mix(score.market, to.scores[index].market), brand: mix(score.brand, to.scores[index].brand) })),
    goals: mix(from.goals, to.goals),
    shares: [search, content, 100 - search - content],
    contentTotal: mix(from.contentTotal, to.contentTotal),
    contentDone: mix(from.contentDone, to.contentDone),
  };
}
