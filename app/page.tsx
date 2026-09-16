'use client';

import { useEffect, useRef, useState, type MutableRefObject } from 'react';

type GlobeNode = {
  x: number;
  y: number;
  z: number;
  screenX: number;
  screenY: number;
  scale: number;
  alpha: number;
  sparkle: boolean;
};

type GlobePoint = {
  x: number;
  y: number;
  z: number;
  sparkle: boolean;
};

type GlobeEdge = {
  from: number;
  to: number;
  strength: number;
};

type Star = {
  x: number;
  y: number;
  size: number;
  alpha: number;
  twinkle: number;
  drift: number;
};

type GlobeMetrics = {
  centerX: number;
  centerY: number;
  radius: number;
};

type NetworkGlobeCanvasProps = {
  scrollProgressRef: MutableRefObject<number>;
};

const mockups = [
  {
    title: '목업이미지1',
    description: '어두운 화면 상태',
    image: '/mockup-scroll-01.png',
  },
  {
    title: '목업이미지2',
    description: '밝은 화면 상태',
    image: '/mockup-scroll-02.png',
  },
];

function NetworkGlobeCanvas({ scrollProgressRef }: NetworkGlobeCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const context = canvas.getContext('2d');

    if (!context) {
      return;
    }

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    let animationId = 0;
    let width = 0;
    let height = 0;
    let dpr = 1;
    let lastFrameTime = 0;
    let rotationAngle = -0.35;
    let smoothedProgress = scrollProgressRef.current;
    let stars: Star[] = [];
    const globePoints = Array.from({ length: 280 }, (_, index) => {
      const goldenAngle = Math.PI * (3 - Math.sqrt(5));
      const y = 1 - (index / 279) * 2;
      const radius = Math.sqrt(1 - y * y);
      const theta = index * goldenAngle;

      return {
        x: Math.cos(theta) * radius,
        y,
        z: Math.sin(theta) * radius,
        sparkle: index % 31 === 0 || index % 47 === 0,
      };
    });
    const globeEdges: GlobeEdge[] = [];
    const edgeKeys = new Set<string>();

    for (let index = 0; index < globePoints.length; index += 1) {
      const point = globePoints[index];
      const nearest = globePoints
        .map((otherPoint, otherIndex) => ({
          distance:
            (point.x - otherPoint.x) ** 2 +
            (point.y - otherPoint.y) ** 2 +
            (point.z - otherPoint.z) ** 2,
          index: otherIndex,
        }))
        .filter(({ index: otherIndex }) => otherIndex !== index)
        .sort((first, second) => first.distance - second.distance)
        .slice(0, 4);

      for (const neighbor of nearest) {
        const from = Math.min(index, neighbor.index);
        const to = Math.max(index, neighbor.index);
        const key = `${from}-${to}`;

        if (!edgeKeys.has(key)) {
          edgeKeys.add(key);
          globeEdges.push({
            from,
            to,
            strength: 0.18 + ((from + to) % 5) * 0.035,
          });
        }
      }
    }

    const createStars = () => {
      const starCount = Math.min(190, Math.max(90, Math.floor(width / 8)));

      stars = Array.from({ length: starCount }, (_, index) => {
        const seed = Math.sin(index * 928.31) * 10000;
        const nextSeed = Math.sin(index * 431.77) * 10000;
        const thirdSeed = Math.sin(index * 173.53) * 10000;
        const fourthSeed = Math.sin(index * 67.91) * 10000;

        return {
          x: seed - Math.floor(seed),
          y: (nextSeed - Math.floor(nextSeed)) * 0.78,
          size: 0.55 + (thirdSeed - Math.floor(thirdSeed)) * 1.55,
          alpha: 0.18 + (fourthSeed - Math.floor(fourthSeed)) * 0.56,
          twinkle: index * 0.31,
          drift: 0.4 + (index % 7) * 0.08,
        };
      });
    };

    const resizeCanvas = () => {
      const bounds = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      width = bounds.width;
      height = bounds.height;
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      createStars();
    };

    const getGlobeMetrics = (): GlobeMetrics => ({
      centerX: width / 2,
      centerY: height * 0.88 + 180,
      radius: Math.min(width * 0.405, height * 0.528),
    });

    const getForwardTilt = () =>
      Math.PI / 6 + smoothedProgress * (Math.PI / 7);

    const projectNode = (point: GlobePoint, rotation: number): GlobeNode => {
      const { centerX, centerY, radius } = getGlobeMetrics();
      const perspective = radius * 3.1;
      const forwardTilt = getForwardTilt();
      const rotationCos = Math.cos(rotation);
      const rotationSin = Math.sin(rotation);
      const x = radius * (point.x * rotationCos + point.z * rotationSin);
      const y = -radius * point.y * 0.78;
      const z = radius * (-point.x * rotationSin + point.z * rotationCos);
      const tiltedY = y * Math.cos(forwardTilt) + z * Math.sin(forwardTilt);
      const tiltedZ = z * Math.cos(forwardTilt) - y * Math.sin(forwardTilt);
      const scale = perspective / (perspective - tiltedZ);
      const depth = (tiltedZ / radius + 1) / 2;

      return {
        x,
        y: tiltedY,
        z: tiltedZ,
        screenX: centerX + x * scale,
        screenY: centerY + tiltedY * scale,
        scale,
        alpha: 0.24 + depth * 0.48,
        sparkle: point.sparkle,
      };
    };

    const drawLine = (
      first: GlobeNode,
      second: GlobeNode,
      lineAlpha: number,
    ) => {
      const averageDepth = (first.z + second.z) * 0.5;
      const { radius } = getGlobeMetrics();
      const depthAlpha = Math.max(0.16, (averageDepth / radius + 1) / 2);

      context.beginPath();
      context.moveTo(first.screenX, first.screenY);
      context.lineTo(second.screenX, second.screenY);
      context.strokeStyle = `rgba(56, 189, 248, ${lineAlpha * depthAlpha})`;
      context.lineWidth = 0.48 + Math.max(first.scale, second.scale) * 0.24;
      context.stroke();
    };

    const drawSaturnRing = (
      metrics: GlobeMetrics,
      time: number,
      layer: 'back' | 'front',
    ) => {
      const forwardTilt = getForwardTilt();
      const ringTilt = -0.46 + forwardTilt * 0.72;
      const ringPulse = motionQuery.matches
        ? 0
        : Math.sin(time * 0.0006) * metrics.radius * 0.012;
      const ringCenterY = metrics.centerY - 50;
      const ringStart = layer === 'back' ? Math.PI : 0;
      const ringEnd = layer === 'back' ? Math.PI * 2 : Math.PI;
      const baseAlpha = layer === 'back' ? 0.24 : 0.62;

      context.save();
      context.lineCap = 'round';

      for (let index = 0; index < 5; index += 1) {
        const spread = 1 + index * 0.068;
        const alpha = baseAlpha - index * 0.055;

        context.beginPath();
        context.ellipse(
          metrics.centerX,
          ringCenterY + ringPulse,
          metrics.radius * 1.72 * spread,
          metrics.radius * 0.28 * spread,
          ringTilt,
          ringStart,
          ringEnd,
        );
        context.strokeStyle = `rgba(125, 211, 252, ${alpha})`;
        context.lineWidth = layer === 'front' ? 2 - index * 0.18 : 1.25;
        context.stroke();
      }

      context.restore();
    };

    const draw = (time: number) => {
      const deltaTime = Math.min(time - lastFrameTime || 16, 34);

      lastFrameTime = time;
      smoothedProgress +=
        (scrollProgressRef.current - smoothedProgress) * 0.075;

      if (motionQuery.matches) {
        rotationAngle = -0.35;
      } else {
        rotationAngle += deltaTime * 0.000045;
      }

      context.clearRect(0, 0, width, height);
      context.fillStyle = '#000000';
      context.fillRect(0, 0, width, height);

      for (const star of stars) {
        const twinkle = motionQuery.matches
          ? 0.65
          : 0.65 + Math.sin(time * 0.0015 * star.drift + star.twinkle) * 0.35;
        const x = star.x * width;
        const y = star.y * height;

        context.beginPath();
        context.arc(x, y, star.size, 0, Math.PI * 2);
        context.fillStyle = `rgba(219, 234, 254, ${star.alpha * twinkle})`;
        context.fill();

        if (star.size > 1.45) {
          context.beginPath();
          context.arc(x, y, star.size * 3.2, 0, Math.PI * 2);
          context.fillStyle = `rgba(56, 189, 248, ${star.alpha * twinkle * 0.08})`;
          context.fill();
        }
      }

      const metrics = getGlobeMetrics();
      const rotation = rotationAngle;
      const nodes = globePoints.map((point) => projectNode(point, rotation));

      const horizonGradient = context.createRadialGradient(
        metrics.centerX,
        metrics.centerY,
        10,
        metrics.centerX,
        metrics.centerY,
        metrics.radius * 1.72,
      );
      horizonGradient.addColorStop(0, 'rgba(37, 99, 235, 0.2)');
      horizonGradient.addColorStop(0.58, 'rgba(14, 165, 233, 0.08)');
      horizonGradient.addColorStop(1, 'rgba(14, 165, 233, 0)');
      context.fillStyle = horizonGradient;
      context.fillRect(0, 0, width, height);

      context.lineCap = 'round';
      drawSaturnRing(metrics, time, 'back');

      for (const edge of globeEdges) {
        drawLine(nodes[edge.from], nodes[edge.to], edge.strength);
      }

      drawSaturnRing(metrics, time, 'front');

      for (let index = 0; index < nodes.length; index += 1) {
        const node = nodes[index];
          const pulse = motionQuery.matches
            ? 0.65
            : 0.65 + Math.sin(time * 0.002 + index * 0.27) * 0.35;
          const nodeRadius = node.sparkle ? 2.2 + pulse * 1.4 : 1.7;

          context.beginPath();
          context.arc(node.screenX, node.screenY, nodeRadius, 0, Math.PI * 2);
          context.fillStyle = node.sparkle
            ? `rgba(224, 242, 254, ${0.62 + pulse * 0.32})`
            : `rgba(59, 130, 246, ${node.alpha})`;
          context.fill();
      }

      if (!motionQuery.matches) {
        animationId = window.requestAnimationFrame(draw);
      }
    };

    resizeCanvas();
    draw(0);

    const handleResize = () => {
      resizeCanvas();
      draw(0);
    };

    window.addEventListener('resize', handleResize);

    if (!motionQuery.matches) {
      animationId = window.requestAnimationFrame(draw);
    }

    return () => {
      window.cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, [scrollProgressRef]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full"
      aria-hidden="true"
    />
  );
}

export default function Home() {
  const heroRef = useRef<HTMLElement | null>(null);
  const heroPanelRef = useRef<HTMLDivElement | null>(null);
  const canvasWrapRef = useRef<HTMLDivElement | null>(null);
  const heroProgressRef = useRef(0);
  const sectionRef = useRef<HTMLElement | null>(null);
  const activeIndexRef = useRef(0);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    let scrollFrameId = 0;
    let styleFrameId = 0;
    let targetHeroProgress = 0;
    let renderedHeroProgress = 0;

    const applyHeroStyles = (progress: number) => {
      const heroScaleX = 1 - progress * 0.33;
      const heroScaleY = 1 - progress * 0.18;
      const canvasScale = 1 + progress * 0.42;
      const heroRadius = progress * 32;
      const heroShadow = progress * 0.18;

      heroProgressRef.current = progress;

      if (heroPanelRef.current) {
        heroPanelRef.current.style.borderRadius = `${heroRadius}px`;
        heroPanelRef.current.style.boxShadow = `0 30px 90px rgba(15, 23, 42, ${heroShadow})`;
        heroPanelRef.current.style.transform = `scale(${heroScaleX}, ${heroScaleY})`;
      }

      if (canvasWrapRef.current) {
        canvasWrapRef.current.style.transform = `scale(${canvasScale})`;
      }
    };

    const animateHeroStyles = () => {
      renderedHeroProgress +=
        (targetHeroProgress - renderedHeroProgress) * 0.16;
      applyHeroStyles(renderedHeroProgress);

      if (Math.abs(targetHeroProgress - renderedHeroProgress) > 0.001) {
        styleFrameId = window.requestAnimationFrame(animateHeroStyles);
      } else {
        renderedHeroProgress = targetHeroProgress;
        applyHeroStyles(renderedHeroProgress);
        styleFrameId = 0;
      }
    };

    const requestStyleUpdate = () => {
      if (!styleFrameId) {
        styleFrameId = window.requestAnimationFrame(animateHeroStyles);
      }
    };

    const updateOnScroll = () => {
      if (heroRef.current) {
        const heroBounds = heroRef.current.getBoundingClientRect();
        const heroScrollableDistance =
          heroBounds.height - window.innerHeight;
        const rawHeroProgress = Math.min(
          Math.max(
            Math.abs(Math.min(heroBounds.top, 0)) /
              Math.max(heroScrollableDistance, 1),
            0,
          ),
          1,
        );
        targetHeroProgress = 1 - Math.pow(1 - rawHeroProgress, 2.4);

        requestStyleUpdate();
      }

      if (sectionRef.current) {
        const bounds = sectionRef.current.getBoundingClientRect();
        const scrollableDistance = bounds.height - window.innerHeight;
        const rawProgress =
          Math.abs(bounds.top) / Math.max(scrollableDistance, 1);
        const nextIndex = rawProgress > 0.48 ? 1 : 0;

        if (activeIndexRef.current !== nextIndex) {
          activeIndexRef.current = nextIndex;
          setActiveIndex(nextIndex);
        }
      }
    };

    const requestUpdate = () => {
      window.cancelAnimationFrame(scrollFrameId);
      scrollFrameId = window.requestAnimationFrame(updateOnScroll);
    };

    applyHeroStyles(0);
    updateOnScroll();
    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate);

    return () => {
      window.cancelAnimationFrame(scrollFrameId);
      window.cancelAnimationFrame(styleFrameId);
      window.removeEventListener('scroll', requestUpdate);
      window.removeEventListener('resize', requestUpdate);
    };
  }, []);

  return (
    <main className="bg-white text-[#151922]">
      <section ref={heroRef} className="relative h-[165svh] bg-white">
        <div
          ref={heroPanelRef}
          className="sticky top-0 grid min-h-svh place-items-center overflow-hidden bg-black px-6 text-center text-white"
          style={{
            borderRadius: 0,
            boxShadow: '0 30px 90px rgba(15, 23, 42, 0)',
            transform: 'scale(1)',
            transformOrigin: 'center center',
            willChange: 'transform, border-radius, box-shadow',
          }}
        >
          <div
            ref={canvasWrapRef}
            className="absolute inset-0"
            style={{
              transform: 'scale(1)',
              transformOrigin: '50% 62%',
              willChange: 'transform',
            }}
          >
            <NetworkGlobeCanvas scrollProgressRef={heroProgressRef} />
          </div>

          <div className="relative z-10 max-w-2xl pb-[30svh]">
            <p className="text-sm font-semibold text-sky-300/90">
              Scroll threshold demo
            </p>
            <h1 className="mt-4 text-[1.9rem] font-bold leading-tight tracking-[-0.02em] md:text-[3.1rem]">
              스크롤 임계점에서
              <br />
              목업이 한 번 넘어가요
            </h1>
            <p className="mt-6 text-base leading-7 text-zinc-300 md:text-lg">
              아래로 스크롤하면 왼쪽 목록과 오른쪽 폰 화면이 같은 타이밍으로
              부드럽게 전환됩니다.
            </p>
          </div>
        </div>
      </section>

      <section ref={sectionRef} className="relative h-[220svh] bg-white">
        <div className="sticky top-0 grid min-h-svh items-center gap-10 overflow-hidden px-6 py-14 md:grid-cols-[0.8fr_1.2fr] md:px-16 lg:px-24">
          <div className="mx-auto w-full max-w-md">
            <p className="text-sm font-semibold text-blue-600">Mockup list</p>
            <h2 className="mt-4 text-[1.6rem] font-bold tracking-[-0.02em] md:text-[2.45rem]">
              목록과 폰 화면이
              <br />
              같이 바뀝니다
            </h2>

            <div className="mt-10 space-y-3">
              {mockups.map((mockup, index) => (
                <button
                  key={mockup.title}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className={`mockup-list-item ${
                    activeIndex === index ? 'is-active' : ''
                  }`}
                >
                  <span>{mockup.title}</span>
                  <small>{mockup.description}</small>
                </button>
              ))}
            </div>
          </div>

          <div className="relative flex min-h-[640px] items-center justify-center">
            <div className="absolute size-[580px] rounded-full bg-blue-200/35 blur-3xl" />

            <div className="scroll-phone" data-active={activeIndex}>
              <div className="scroll-phone-window">
                {mockups.map((mockup, index) => (
                  <img
                    key={mockup.title}
                    src={mockup.image}
                    alt=""
                    className={`scroll-phone-image image-${index}`}
                    aria-hidden="true"
                  />
                ))}
              </div>

              <img
                src="/phone-frame-demo.png"
                alt="스크롤 전환이 적용된 아이폰 목업"
                className="scroll-phone-frame"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="grid min-h-[70svh] place-items-center px-6 text-center">
        <p className="text-lg font-medium text-slate-500">
          임계점을 다시 위로 넘기면 첫 번째 목업으로 돌아갑니다.
        </p>
      </section>
    </main>
  );
}
