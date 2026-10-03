'use client';

import { useEffect, useRef, useState } from 'react';
import { STUDIO_FRAMES, STUDIO_EXIT_END, STUDIO_EXIT_START, studioExitProgress, shouldStartStudioExit, studioGeometry, studioTimeline } from '@/lib/studio-journey';
import { createStudioFrames } from '@/lib/studio-frames';
import './studio-hero.css';

const projects = [
  { name: '청호나이스', category: '브랜딩 마케팅', headline: '브랜드의 강점을,\n고객의 일상 가까이.', description: '브랜드가 가진 가치를 명확한 메시지와 콘텐츠로 전합니다.', tags: ['브랜드 메시지', '콘텐츠 기획', '마케팅 커뮤니케이션'] },
  { name: 'BMW · MINI\n바바리안모터스', category: '온라인·SNS 콘텐츠 운영', headline: '브랜드의 감각을\n하나의 채널 경험으로.', description: '브랜드의 개성과 이야기를 온라인 콘텐츠와 SNS 운영으로 연결합니다.', tags: ['채널 기획', '콘텐츠 제작', 'SNS 운영'] },
  { name: '오션더힐', category: '숏폼 콘텐츠', headline: '공간의 매력을,\n짧고 선명한 장면으로.', description: '공간의 분위기와 경험을 발견하고, 시선을 사로잡는 숏폼으로 담습니다.', tags: ['콘텐츠 기획', '영상 촬영', '숏폼 편집'] },
  { name: '오륜스포츠', category: '통합 광고 대행', headline: '기획부터 송출까지,\n하나의 방향으로.', description: '기획·제작·촬영·편집과 옥외광고 송출을 연결하는 통합 캠페인입니다.', tags: ['캠페인 기획', '영상 제작', '옥외광고'] },
  { name: 'BYD', category: '공간 디자인 제작', headline: '브랜드를 만나는\n공간의 경험.', description: '브랜드의 메시지가 실제 공간에서도 일관되게 느껴지도록 디자인하고 제작합니다.', tags: ['공간 기획', '공간 디자인', '제작'] },
];

export function StudioHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const projectsRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'failed'>('loading');
  const [activeProject, setActiveProject] = useState(0);
  const [showProjects, setShowProjects] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    if (!section || !stage || !canvas) return;
    const context = canvas.getContext('2d', { alpha: false });
    if (!context) { setStatus('failed'); return; }
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    let disposed = false, active = true, ready = false;
    let raf = 0, lastTime = 0, progress = 0, viewWidth = 1, viewHeight = 1;
    let currentProject = 0, projectsVisible = false;
    let paintedFrame = -1, paintedZoom = -1, paintedImage: unknown;
    let autoExit = false, exitElapsed = 0, previousScroll = 0;
    let exitFrom = STUDIO_EXIT_START, touchY = 0, reverseIntent = 0;
    const frames = createStudioFrames(schedule, () => { if (!disposed && !ready) setStatus('failed'); });

    function measure() {
      return Math.max(0, Math.min(1, -section!.getBoundingClientRect().top / Math.max(1, section!.offsetHeight - stage!.clientHeight)));
    }
    function schedule() {
      if (!disposed && active && !document.hidden && !raf) raf = requestAnimationFrame(render);
    }
    function cancelExit() {
      autoExit = false;
      previousScroll = measure();
      section!.dataset.autoExit = 'cancelled';
      schedule();
    }
    function scrollToProgress(value: number) {
      const top = window.scrollY + section!.getBoundingClientRect().top;
      const scrollY = top + value * Math.max(1, section!.offsetHeight - stage!.clientHeight);
      window.scrollTo({ top: scrollY, behavior: 'instant' });
      previousScroll = value;
    }
    function startExit(from: number) {
      autoExit = true;
      exitElapsed = 0;
      reverseIntent = 0;
      lastTime = 0;
      progress = exitFrom = Math.max(STUDIO_EXIT_START, Math.min(from, STUDIO_EXIT_END));
      section!.dataset.autoExit = 'running';
      scrollToProgress(progress);
      schedule();
    }
    function onScroll() {
      const next = measure();
      if (autoExit) {
        // Trackpad/touch momentum and browser scroll rounding must not cancel
        // the animation. The animation clock owns this interval until finished.
        schedule();
        return;
      } else if (shouldStartStudioExit(previousScroll, next, motion.matches)) {
        startExit(Math.max(STUDIO_EXIT_START, progress));
        return;
      }
      previousScroll = next;
      schedule();
    }
    function onWheel(event: WheelEvent) {
      if (event.ctrlKey) return;
      const position = measure();
      if (!autoExit && event.deltaY > 0 && shouldStartStudioExit(position, position + .00001, motion.matches)) startExit(position);
      if (!autoExit) return;
      reverseIntent = event.deltaY < 0 ? reverseIntent - event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? viewHeight : 1) : 0;
      if (reverseIntent >= 24) cancelExit();
      else if (event.cancelable) event.preventDefault();
    }
    function onTouchStart(event: TouchEvent) { touchY = event.touches[0]?.clientY ?? 0; }
    function onTouchMove(event: TouchEvent) {
      const nextY = event.touches[0]?.clientY ?? touchY;
      const delta = touchY - nextY;
      touchY = nextY;
      if (!autoExit || event.touches.length !== 1) return;
      if (delta < -2) cancelExit();
      else if (delta > 0 && event.cancelable) event.preventDefault();
    }
    function onKeyDown(event: KeyboardEvent) {
      if (!autoExit || event.target instanceof HTMLElement && event.target.closest('input, textarea, select, [contenteditable="true"]')) return;
      if (['Escape', 'ArrowUp', 'PageUp', 'Home', 'Tab'].includes(event.key) || event.key === ' ' && event.shiftKey) cancelExit();
      else if (['ArrowDown', 'PageDown', ' ', 'End'].includes(event.key)) event.preventDefault();
    }
    function onMotionChange() { if (autoExit) cancelExit(); schedule(); }
    function onDirectNavigation() { if (autoExit) cancelExit(); }
    function onPointerDown(event: PointerEvent) {
      if (event.clientX >= document.documentElement.clientWidth || event.target instanceof HTMLElement && event.target.closest('a')) onDirectNavigation();
    }
    function render(time: number) {
      raf = 0;
      if (disposed || !active || document.hidden) return;
      let target = measure();
      const dt = lastTime ? Math.min(50, time - lastTime) : 16;
      lastTime = time;
      if (autoExit) {
        exitElapsed += dt;
        progress = target = studioExitProgress(exitElapsed, exitFrom);
        scrollToProgress(progress);
        if (progress >= STUDIO_EXIT_END) {
          autoExit = false;
          section!.dataset.autoExit = 'complete';
        }
      } else progress = motion.matches ? target : progress + (target - progress) * (1 - Math.exp(-dt / 75));
      if (Math.abs(progress - target) < .00003) progress = target;
      const state = studioTimeline(progress, motion.matches);
      frames.request(state.frame, true);
      if (progress > .18 && progress < .8) frames.preloadDetail();
      // Never zoom an earlier frame if the visitor jumped ahead before loading.
      const loaded = frames.get(state.frame, state.zoom > 0);
      const zoom = loaded?.index === STUDIO_FRAMES - 1 ? state.zoom : 0;
      const geometry = studioGeometry(viewWidth, viewHeight, zoom);
      if (loaded && (loaded.index !== paintedFrame || zoom !== paintedZoom || loaded.image !== paintedImage)) {
        const ratioX = canvas!.width / viewWidth;
        const ratioY = canvas!.height / viewHeight;
        context!.setTransform(ratioX, 0, 0, ratioY, 0, 0);
        context!.drawImage(loaded.image, geometry.x, geometry.y, geometry.width, geometry.height);
        paintedFrame = loaded.index;
        paintedZoom = zoom;
        paintedImage = loaded.image;
        if (!ready) { ready = true; setStatus('ready'); }
      }
      const projectOpacity = loaded?.index === STUDIO_FRAMES - 1 ? state.projectOpacity : 0;
      const screen = geometry.screen;
      if (projectsRef.current) {
        projectsRef.current.style.clipPath = `inset(${screen.y}px ${viewWidth - screen.x - screen.width}px ${viewHeight - screen.y - screen.height}px ${screen.x}px round ${screen.radius}px)`;
        projectsRef.current.style.opacity = String(projectOpacity);
      }
      section!.style.setProperty('--studio-opening', String(state.opening));
      section!.style.setProperty('--studio-return', String(state.returnCopy));
      section!.style.setProperty('--studio-project-progress', String(state.projectProgress));
      section!.dataset.phase = state.phase;
      section!.dataset.frame = String(paintedFrame);
      section!.dataset.zoom = zoom.toFixed(4);
      section!.dataset.decoded = String(frames.stats().decoded);
      if (currentProject !== state.projectIndex) { currentProject = state.projectIndex; setActiveProject(currentProject); }
      if (projectsVisible !== (projectOpacity > .5)) { projectsVisible = projectOpacity > .5; setShowProjects(projectsVisible); }
      if (autoExit || target !== progress) schedule();
    }
    function resize() {
      viewWidth = stage!.clientWidth || 1;
      viewHeight = stage!.clientHeight || 1;
      const ratio = Math.min(devicePixelRatio || 1, 2);
      canvas!.width = Math.round(viewWidth * ratio);
      canvas!.height = Math.round(viewHeight * ratio);
      paintedFrame = -1;
      if (autoExit) scrollToProgress(progress);
      schedule();
    }
    function visibility() {
      if (document.hidden) { cancelAnimationFrame(raf); raf = 0; frames.request(studioTimeline(progress).frame, false); }
      else { lastTime = 0; schedule(); }
    }
    const observer = new IntersectionObserver(([entry]) => {
      active = entry.isIntersecting;
      if (active) { lastTime = 0; schedule(); }
      else { cancelAnimationFrame(raf); raf = 0; frames.request(studioTimeline(progress).frame, false); }
    }, { rootMargin: '200px' });
    observer.observe(section);
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(stage);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('pointerdown', onPointerDown, { passive: true });
    window.addEventListener('hashchange', onDirectNavigation);
    document.addEventListener('visibilitychange', visibility);
    motion.addEventListener('change', onMotionChange);
    progress = previousScroll = measure();
    resize();
    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      observer.disconnect(); resizeObserver.disconnect(); frames.destroy();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('hashchange', onDirectNavigation);
      document.removeEventListener('visibilitychange', visibility);
      motion.removeEventListener('change', onMotionChange);
    };
  }, []);

  return (
    <section ref={sectionRef} className={`studio-hero ${status === 'ready' ? 'is-ready' : ''}`} aria-label="우주기획 소개와 프로젝트">
      <div ref={stageRef} className="studio-stage">
        <picture className="studio-poster" aria-hidden="true">
          <source media="(max-width:700px)" srcSet="/assets/studio-sequence/mobile/0000.webp" />
          <img src="/assets/studio-sequence/desktop/0000.webp" width="1920" height="1080" alt="" fetchPriority="high" />
        </picture>
        <canvas ref={canvasRef} className="studio-canvas" aria-label="촬영·기획 현장에서 책상 위 휴대폰으로 다가간 뒤, 프로젝트 소개를 마치고 다시 현장으로 돌아오는 장면" role="img" />
        <header className="studio-intro">
          <p className="studio-brand">우주기획</p>
          <h1>당신의 브랜드에는,<br />아직 발견하지 못한<br className="studio-mobile-break" /> 우주가 있습니다.</h1>
          <p className="studio-description">시장과 고객을 관찰해 브랜드의 가능성을 발견하고,<br />전략부터 콘텐츠, 광고까지 성장의 다음 항로를 만듭니다.</p>
        </header>
        <div ref={projectsRef} className="studio-projects" aria-hidden={!showProjects}>
          <div className="studio-project-top"><span>UJU PLANNING</span><span>SELECTED PROJECTS</span></div>
          {projects.map((project, index) => (
            <article key={project.name} className={`studio-project ${activeProject === index ? 'is-active' : ''}`} aria-hidden={activeProject !== index}>
              <div className="studio-project-title">
                <p className="studio-project-number">PROJECT {String(index + 1).padStart(2, '0')} <span>/ 05</span></p>
                <h2>{project.name}</h2>
                <p className="studio-project-category">{project.category}</p>
              </div>
              <div className="studio-project-copy">
                <h3>{project.headline}</h3>
                <p>{project.description}</p>
                <ul>{project.tags.map(tag => <li key={tag}>{tag}</li>)}</ul>
              </div>
            </article>
          ))}
          <div className="studio-project-bottom"><span>{String(activeProject + 1).padStart(2, '0')}</span><div className="studio-project-track"><span /></div><span>05</span></div>
        </div>
        <p className="studio-return-copy">가능성을 발견하고,<br />브랜드의 다음 장면을 만듭니다.</p>
        {status !== 'ready' && <p className="studio-status" role="status">{status === 'failed' ? '영상을 불러오지 못했어요. 새로고침해 주세요.' : '장면을 준비하고 있어요.'}</p>}
        <p className="studio-scroll" aria-hidden="true">SCROLL TO EXPLORE</p>
      </div>
    </section>
  );
}
