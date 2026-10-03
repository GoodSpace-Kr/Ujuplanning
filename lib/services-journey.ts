const clamp = (value: number) => Math.min(1, Math.max(0, value));
const ease = (value: number) => { const t = clamp(value); return t * t * (3 - 2 * t); };
const range = (p: number, from: number, to: number) => ease((p - from) / (to - from));
const mix = (a: number, b: number, t: number) => a + (b - a) * t;

// Each arrival is followed by a reading interval. Navigation lands in that interval.
export const SERVICE_STOPS = [.28, .51, .73, .96] as const;
const ARRIVALS = [[.07, .23], [.34, .48], [.56, .70], [.78, .92]] as const;
export const SERVICE_PAGE = { width: 1080, height: 740 };

export function servicesJourney(progress: number, compact = false, reduced = false) {
  const p = clamp(progress);
  const arrivals = ARRIVALS.map(([from, to]) => range(p, from, to));
  let activeIndex = 0;
  for (let i = 1; i < arrivals.length; i++) if (arrivals[i] >= .5) activeIndex = i;

  const entry = arrivals[0];
  let x = mix(.77, .695, entry);
  let y = mix(.96, .55, entry);
  let scale = mix(1.42, 1, entry);
  let crossing = 0;
  for (let i = 1; i < arrivals.length; i++) {
    const t = arrivals[i];
    x += (i % 2 ? -.39 : .39) * t;
    y += (i % 2 ? -.05 : .05) * t;
    // A shallow diagonal arc keeps the page moving as a single continuous object.
    const arc = 4 * t * (1 - t);
    y += .12 * arc;
    scale -= .055 * arc;
    crossing = Math.max(crossing, arc);
  }

  const intro = {
    opacity: 1 - range(p, .07, .15),
    y: -.38 * range(p, .07, .23),
  };
  const copies = ARRIVALS.map(([from, to], index) => {
    const enter = range(p, mix(from, to, .40), to);
    const next = ARRIVALS[index + 1];
    const leave = next ? range(p, next[0], mix(next[0], next[1], .38)) : 0;
    return {
      opacity: enter * (1 - leave),
      x: (index % 2 ? 1 : -1) * .025 * (1 - enter + leave),
      y: .50 * (1 - enter) - .43 * leave,
    };
  });

  if (compact) {
    x = .5 + (x - .5) * .12;
    y = mix(.90, .73, entry) + crossing * .025;
    scale = mix(1.35, 1, entry) - crossing * .035;
  }
  if (reduced) {
    const showIntro = p < .18;
    intro.opacity = showIntro ? 1 : 0;
    intro.y = 0;
    x = compact ? .5 : activeIndex % 2 ? .305 : .695;
    y = compact ? .73 : .53;
    scale = 1;
    copies.forEach((copy, index) => {
      copy.opacity = !showIntro && index === activeIndex ? 1 : 0;
      copy.x = copy.y = 0;
    });
  }
  return { activeIndex, x, y, scale, intro, copies };
}

export function servicePageScale(width: number, height: number, compact: boolean) {
  return Math.min(width * (compact ? .92 : .57) / SERVICE_PAGE.width,
    height * (compact ? .47 : .80) / SERVICE_PAGE.height, 1.15);
}
