'use client';

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type MutableRefObject,
} from 'react';
// import { BrandSystemSection } from '@/components/brand-system-section';
import { ServicesSection } from '@/components/services-section';
import { getHeroFrame, getHeroTimeline } from '@/lib/hero-transition';

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

const projects = [
  {
    company: '청호나이스',
    label: '브랜딩 마케팅',
    image: '/project-chungho.png',
  },
  {
    company: 'BMW·MINI 바바리안모터스',
    label: '온라인·SNS 콘텐츠 운영',
    image: '/project-bavarian.png',
  },
  {
    company: '오션더힐',
    label: '쇼츠콘텐츠',
    image: '/project-ocean.png',
  },
  {
    company: '오륜스포츠',
    label: '통합 광고 대행',
  },
  {
    company: 'BYD',
    label: '공간 디자인 제작',
    image: '/project-byd.png',
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
  const heroFrameRef = useRef<HTMLDivElement | null>(null);
  const heroWorldRef = useRef<HTMLDivElement | null>(null);
  const heroProgressRef = useRef(0);
  const activeIndexRef = useRef(0);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const previousScrollRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);

    let scrollFrameId = 0;
    let styleFrameId = 0;
    let targetHeroProgress = 0;
    let renderedHeroProgress = 0;
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    const applyHeroStyles = (progress: number) => {
      const timeline = getHeroTimeline(progress, projects.length, motionQuery.matches);
      const frameProgress = timeline.focus;
      const heroShadow = frameProgress * .18;
      const panelBounds = heroPanelRef.current?.getBoundingClientRect();
      const panelWidth = panelBounds?.width ?? window.innerWidth;
      const panelHeight = panelBounds?.height ?? window.innerHeight;
      // Keep layout and the raster mask at phone size during the exit zoom.
      // Only the compositor transform changes, avoiding repeated mask resampling.
      const frame = getHeroFrame(panelWidth, panelHeight, frameProgress, 0);
      const expandedFrame = getHeroFrame(panelWidth, panelHeight, frameProgress, timeline.expansion);
      const dissolve = motionQuery.matches ? timeline.expansion : expandedFrame.dissolve;

      heroProgressRef.current = frameProgress;

      if (heroPanelRef.current) {
        heroPanelRef.current.style.setProperty(
          '--hero-focus-progress',
          String(frameProgress),
        );
        heroPanelRef.current.style.setProperty(
          '--hero-screen-black-opacity',
          String(timeline.blackOpacity),
        );
        heroPanelRef.current.style.setProperty(
          '--hero-phone-opacity',
          String(timeline.phoneOpacity),
        );
        heroPanelRef.current.style.setProperty(
          '--hero-project-opacity',
          String(timeline.projectOpacity),
        );
        heroPanelRef.current.style.setProperty('--hero-project-copy-opacity', String(timeline.projectCopyOpacity));
        heroPanelRef.current.style.setProperty('--hero-services-surface-opacity', String(dissolve));
        heroPanelRef.current.style.setProperty('--hero-services-heading-opacity', String(timeline.headingOpacity * dissolve));
      }

      if (heroFrameRef.current) {
        heroFrameRef.current.classList.toggle(
          'is-phone-shaped',
          timeline.phoneOpacity > 0.001,
        );
        heroFrameRef.current.style.left = `${frame.left}px`;
        heroFrameRef.current.style.top = `${frame.top}px`;
        heroFrameRef.current.style.width = `${frame.width}px`;
        heroFrameRef.current.style.height = `${frame.height}px`;
        heroFrameRef.current.style.borderRadius = `${frame.radiusX}px / ${frame.radiusY}px`;
        heroFrameRef.current.style.boxShadow = `0 30px 90px rgba(15, 23, 42, ${heroShadow})`;
        heroFrameRef.current.style.transform = `scale(${expandedFrame.width / frame.width})`;
        heroFrameRef.current.style.visibility = dissolve === 1 ? 'hidden' : 'visible';
      }

      if (heroWorldRef.current) {
        heroWorldRef.current.style.width = `${panelWidth}px`;
        heroWorldRef.current.style.height = `${panelHeight}px`;
        heroWorldRef.current.style.transform = `translate3d(${-frame.left}px, ${-frame.top}px, 0) scale(${timeline.worldScale})`;
      }

      if (activeIndexRef.current !== timeline.projectIndex) {
        activeIndexRef.current = timeline.projectIndex;
        setActiveIndex(timeline.projectIndex);
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
      if (motionQuery.matches || targetHeroProgress === 1 || targetHeroProgress === 0) {
        window.cancelAnimationFrame(styleFrameId);
        styleFrameId = 0;
        renderedHeroProgress = targetHeroProgress;
        applyHeroStyles(renderedHeroProgress);
        return;
      }
      if (!styleFrameId) {
        styleFrameId = window.requestAnimationFrame(animateHeroStyles);
      }
    };

    const updateOnScroll = () => {
      if (heroRef.current) {
        const heroBounds = heroRef.current.getBoundingClientRect();
        const heroScrollableDistance =
          heroBounds.height - (heroPanelRef.current?.offsetHeight ?? window.innerHeight);
        const rawHeroProgress = Math.min(
          Math.max(
            Math.abs(Math.min(heroBounds.top, 0)) /
              Math.max(heroScrollableDistance, 1),
            0,
          ),
          1,
        );
        targetHeroProgress = rawHeroProgress;

        requestStyleUpdate();
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
    motionQuery.addEventListener('change', requestUpdate);

    return () => {
      window.cancelAnimationFrame(scrollFrameId);
      window.cancelAnimationFrame(styleFrameId);
      window.removeEventListener('scroll', requestUpdate);
      window.removeEventListener('resize', requestUpdate);
      motionQuery.removeEventListener('change', requestUpdate);
      window.history.scrollRestoration = previousScrollRestoration;
    };
  }, []);

  return (
    <main className="bg-white text-[#151922]">
      <section ref={heroRef} className="relative h-[840svh] bg-white">
        <div
          ref={heroPanelRef}
          className="sticky top-0 grid min-h-svh place-items-center overflow-hidden bg-white px-6 text-center text-white"
          style={{
            '--hero-focus-progress': 0,
          } as CSSProperties}
        >
          <div
            ref={heroFrameRef}
            className="hero-transition-frame"
            style={{
              left: 0,
              top: 0,
              width: '100%',
              height: '100%',
              borderRadius: 0,
              boxShadow: '0 30px 90px rgba(15, 23, 42, 0)',
            }}
          >
            <div
              ref={heroWorldRef}
              className="hero-frame-world"
              style={{
                transform: 'scale(1)',
                transformOrigin: '50% 72%',
                willChange: 'transform',
              }}
            >
              <div className="hero-zoom-background" aria-hidden="true" />
              <NetworkGlobeCanvas scrollProgressRef={heroProgressRef} />

              <div className="absolute inset-0 grid place-items-center px-6 text-center">
                <div className="relative z-10 w-full max-w-[1100px] pb-[30svh]">
                  <p className="text-sm font-semibold text-[#2f67bf]">
                    우주기획
                  </p>
                  <h1 className="mt-4 text-[clamp(1.9rem,4.2vw,3.1rem)] font-bold leading-tight tracking-[-0.02em] [word-break:keep-all]">
                    당신의 브랜드에는,
                    <br />
                    아직 발견하지 못한 우주가 있습니다.
                  </h1>
                  <p className="mx-auto mt-6 max-w-[780px] text-base leading-7 text-pretty text-zinc-300 [word-break:keep-all] md:text-lg">
                    우주기획은 시장과 고객을 관찰해 브랜드의 가능성을 발견하고, 전략부터 콘텐츠, 광고, 행사까지 연결해 성장의 다음 항로를 만드는 종합광고대행사입니다.
                  </p>
                </div>
              </div>
            </div>

            <div className="hero-screen-black" aria-hidden="true" />
            <div className="project-phone-screen hero-project-screen">
              {projects.map((project, index) => {
                const state =
                  activeIndex === index
                    ? 'is-active'
                    : index < activeIndex
                      ? 'is-before'
                      : 'is-after';

                return (
                  <div
                    key={project.company}
                    className={`project-phone-panel ${state}`}
                  >
                    {project.image ? (
                      <img src={project.image} alt="" aria-hidden="true" />
                    ) : (
                      <div className="project-placeholder">
                        <span>ORYUN SPORTS</span>
                        <strong>기획 · 제작 · 촬영 · 편집</strong>
                        <small>옥외광고 송출까지 연결한 통합 캠페인</small>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <img
              src="/iphone-14-pro.png"
              alt=""
              className="hero-phone-shell"
              aria-hidden="true"
            />
          </div>

          <div className="hero-services-surface" aria-hidden="true" />
          <header className="hero-services-copy">
            <h2>고객의 브랜드의<br />빈 우주를 발견하기 위해</h2>
          </header>

          <div className="hero-project-copy-stage" aria-hidden="true">
            <div className="project-side project-side-left">
              {projects.map((project, index) => (
                <div
                  key={project.company}
                  className={`project-copy ${
                    activeIndex === index
                      ? 'is-active'
                      : index < activeIndex
                        ? 'is-before'
                        : 'is-after'
                  }`}
                >
                  <h2>{project.company}</h2>
                </div>
              ))}
            </div>

            <div />

            <div className="project-side project-side-right">
              {projects.map((project, index) => (
                <div
                  key={project.label}
                  className={`project-copy ${
                    activeIndex === index
                      ? 'is-active'
                      : index < activeIndex
                        ? 'is-before'
                        : 'is-after'
                  }`}
                >
                  <h3>{project.label}</h3>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      {/* 7단계 브랜드 소개 및 3D 캔버스: 추후 복구를 위해 보관 */}
      {/* <BrandSystemSection /> */}
      <ServicesSection />
    </main>
  );
}
