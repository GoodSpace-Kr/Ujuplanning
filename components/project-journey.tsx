'use client';

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react';
import { projects } from '@/lib/site-content';
import { projectArtworkPose, projectJourney, projectScrollStop } from '@/lib/project-journey';
import { ProjectArtwork } from './project-artwork';
import './project-journey.css';

export type ProjectJourneyHandle = { update: (progress: number) => void };

export const ProjectJourney = forwardRef<ProjectJourneyHandle, {
  visible: boolean;
  onNavigate: (progress: number) => void;
}>(function ProjectJourney({ visible, onNavigate }, ref) {
  const rootRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);
  const updateRef = useRef<(progress: number) => void>(() => {});
  const currentRef = useRef(0);
  const [active, setActive] = useState(0);
  const [native, setNative] = useState(false);
  const [loadedThrough, setLoadedThrough] = useState(0);
  const [entered, setEntered] = useState<number[]>([]);

  useImperativeHandle(ref, () => ({ update: progress => {
    progressRef.current = progress;
    updateRef.current(progress);
  } }), []);

  useEffect(() => {
    const root = rootRef.current!, viewport = viewportRef.current!, track = trackRef.current!;
    const cards = Array.from(track.querySelectorAll<HTMLElement>('.journey-card'));
    const compact = matchMedia('(max-width: 760px)');
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    let nativeMode = false, stride = 0, animationFrame = 0;

    function select(index: number) {
      if (currentRef.current === index) return;
      currentRef.current = index;
      setActive(index);
    }
    function paint(progress: number) {
      if (nativeMode) return;
      const state = projectJourney(progress, projects.length);
      track.style.transform = `translate3d(${-state.position * stride}px, 0, 0)`;
      cards.forEach((card, index) => {
        const pose = projectArtworkPose(state.position, index, state.opening);
        card.style.setProperty('--image-x', `${pose.x}px`);
        card.style.setProperty('--image-y', `${pose.y}px`);
        card.style.setProperty('--image-scale', String(pose.scale));
        card.style.setProperty('--image-rotation', `${pose.rotation}deg`);
        card.style.setProperty('--image-depth', `${pose.depth}px`);
        card.style.setProperty('--scene-opacity', String(pose.opacity));
      });
      root.style.setProperty('--journey-progress', String(state.position / (projects.length - 1)));
      select(state.active);
    }
    function onNativeScroll() {
      if (!nativeMode || animationFrame) return;
      animationFrame = requestAnimationFrame(() => {
        animationFrame = 0;
        const index = Math.max(0, Math.min(projects.length - 1, Math.round(viewport.scrollLeft / Math.max(1, stride))));
        root.style.setProperty('--journey-progress', String(index / (projects.length - 1)));
        select(index);
      });
    }
    function measure() {
      const nextNative = compact.matches || reduced.matches;
      const switched = nativeMode !== nextNative;
      nativeMode = nextNative;
      setNative(nativeMode);
      stride = cards[1].offsetLeft - cards[0].offsetLeft;
      if (nativeMode) {
        track.style.removeProperty('transform');
        cards.forEach(card => card.removeAttribute('style'));
        if (switched) viewport.scrollLeft = currentRef.current * stride;
        onNativeScroll();
      } else {
        viewport.scrollLeft = 0;
        paint(progressRef.current);
      }
    }
    updateRef.current = paint;
    const observer = new ResizeObserver(measure);
    observer.observe(viewport);
    const visibility = new IntersectionObserver(([entry]) => {
      root.dataset.inView = String(entry.isIntersecting);
    });
    visibility.observe(root);
    compact.addEventListener('change', measure);
    reduced.addEventListener('change', measure);
    viewport.addEventListener('scroll', onNativeScroll, { passive: true });
    measure();
    return () => {
      updateRef.current = () => {};
      observer.disconnect();
      visibility.disconnect();
      cancelAnimationFrame(animationFrame);
      compact.removeEventListener('change', measure);
      reduced.removeEventListener('change', measure);
      viewport.removeEventListener('scroll', onNativeScroll);
    };
  }, []);

  useEffect(() => {
    if (!visible) return;
    setEntered(previous => previous.includes(active) ? previous : [...previous, active]);
    setLoadedThrough(previous => Math.max(previous, Math.min(projects.length - 1, active + 1)));
  }, [active, visible]);

  function navigate(index: number) {
    const next = Math.max(0, Math.min(projects.length - 1, index));
    if (!native) { onNavigate(projectScrollStop(next, projects.length)); return; }
    const viewport = viewportRef.current!, track = trackRef.current!;
    const cards = track.querySelectorAll<HTMLElement>('.journey-card');
    viewport.scrollTo({ left: cards[next].offsetLeft - cards[0].offsetLeft,
      behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  }

  return <div ref={rootRef} className={`project-journey${visible ? ' is-visible' : ''}`} inert={!visible}
    role="region" aria-label="우주기획 대표 프로젝트" aria-roledescription="캐러셀">
    <div ref={viewportRef} className="journey-viewport" id="project-gallery" data-native-scroll={native || undefined}
      onKeyDown={event => {
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
          event.preventDefault(); navigate(active + (event.key === 'ArrowRight' ? 1 : -1));
        }
      }}>
      <div ref={trackRef} className="journey-track">
        {projects.map((project, index) => <article key={project.id}
          className={`journey-card${active === index ? ' is-current' : ''}${entered.includes(index) ? ' has-entered' : ''}`}
          aria-label={`${index + 1} / ${projects.length} · ${project.name.replace(/\n/g, ' ')}`}
          aria-roledescription="슬라이드" aria-hidden={active !== index} inert={active !== index}>
          <div className="journey-copy">
            <p className="journey-brand">{project.name.replace(/\n/g, ' ')}</p>
            <h2>{project.headline.split('\n').map((line, i) =>
              <span className={`journey-line${i > 0 ? ' journey-line-reveal' : ''}`} key={line}><span>{line}</span></span>)}</h2>
            <div className="journey-details">
              <p className="journey-category">{project.category}</p>
              <p className="journey-description">{project.description}</p>
              <a className="journey-link" href={`/work#${project.id}`} aria-label={`${project.name.replace(/\n/g, ' ')} 프로젝트 보기`}>
                프로젝트 보기 <ArrowUpRight size={17} strokeWidth={1.6} aria-hidden="true" />
              </a>
            </div>
          </div>
          <div className="journey-visual"><div className="journey-float">
            <ProjectArtwork id={project.id} ready={index <= loadedThrough} />
          </div></div>
        </article>)}
      </div>
    </div>
    <div className="journey-navigation">
      <div className="journey-pagination" aria-label="프로젝트 선택">
        {projects.map((project, index) => <button type="button" key={project.id}
          aria-label={`${project.name.replace(/\n/g, ' ')} 보기`} aria-current={active === index ? 'true' : undefined}
          aria-controls="project-gallery" onClick={() => navigate(index)}>
          <span>{String(index + 1).padStart(2, '0')}</span>
        </button>)}
      </div>
      <div className="journey-progress" aria-hidden="true"><span /></div>
      <div className="journey-arrows">
        <button type="button" aria-label="이전 프로젝트" aria-controls="project-gallery" disabled={active === 0} onClick={() => navigate(active - 1)}><ArrowLeft size={19} aria-hidden="true" /></button>
        <button type="button" aria-label="다음 프로젝트" aria-controls="project-gallery" disabled={active === projects.length - 1} onClick={() => navigate(active + 1)}><ArrowRight size={19} aria-hidden="true" /></button>
      </div>
    </div>
  </div>;
});
