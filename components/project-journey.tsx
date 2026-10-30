'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Pause, Play } from 'lucide-react';
import { projects } from '@/lib/site-content';
import { projectScenePose } from '@/lib/project-journey';
import selected from '@/lib/project-media.generated.json';
import images from '@/lib/work-images.generated.json';
import serviceMedia from '@/lib/service-media.generated.json';
import previews from '@/lib/project-previews.generated.json';
import { PortfolioImage, ProjectArtwork } from './project-artwork';
import './project-journey.css';

type Project = typeof projects[number];

function ProjectCopy({ project }: { project: Project }) {
  return <div className="journey-copy">
    <p className="journey-brand">{project.name.replace(/\n/g, ' ')}</p>
    <h2>{project.headline.split('\n').map((line, index) =>
      <span className={`journey-line${index > 0 ? ' journey-line-reveal' : ''}`} key={line}><span>{line}</span></span>)}</h2>
    <div className="journey-details">
      <p className="journey-category">{project.category}</p>
      <p className="journey-description">{project.description}</p>
      <a className="journey-link" href={`/work#${project.id}`} aria-label={`${project.name.replace(/\n/g, ' ')} 프로젝트 보기`}>
        프로젝트 보기 <ArrowUpRight size={17} strokeWidth={1.6} aria-hidden="true" />
      </a>
    </div>
  </div>;
}

// The phone reveals the same first composition as the normal-flow section.
// At the handoff only one copy is visible; the preview is never interactive.
export function ProjectOpening() {
  return <div className="project-opening" aria-hidden="true" inert>
    <div className="journey-scene journey-scene-chungho is-revealed">
      <ProjectCopy project={projects[0]} />
      <div className="journey-visual journey-chungho"><ProjectArtwork id="chungho" /></div>
    </div>
  </div>;
}

function JourneyVideo({ src, poster, label, className = '' }: {
  src: string; poster: string; label: string; className?: string;
}) {
  const host = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const manuallyPaused = useRef(false);
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const element = video.current!;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    let visible = false, disposed = false;
    const load = () => { if (!element.getAttribute('src')) element.src = src; };
    const synchronize = () => {
      if (visible && !document.hidden && !reduced.matches && !manuallyPaused.current) {
        load();
        element.play().catch(() => { if (!disposed) setPlaying(false); });
      } else element.pause();
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      synchronize();
    }, { threshold: .25 });
    observer.observe(host.current!);
    document.addEventListener('visibilitychange', synchronize);
    reduced.addEventListener('change', synchronize);
    return () => {
      disposed = true; observer.disconnect(); element.pause();
      document.removeEventListener('visibilitychange', synchronize);
      reduced.removeEventListener('change', synchronize);
    };
  }, [src]);

  return <div className={`journey-film ${className}`} ref={host}>
    <video ref={video} muted loop playsInline preload="none" poster={poster}
      aria-label={`${label} 미리보기`} onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)}
      onError={() => { setFailed(true); setPlaying(false); }} />
    {failed ? <a className="journey-film-control" href={`/work#${label === '오륜스포츠' ? 'ohrun' : 'ocean'}`}>영상 보기 <ArrowUpRight size={14} /></a>
      : <button type="button" className="journey-film-control" aria-label={`${label} ${playing ? '영상 일시정지' : '영상 재생'}`} onClick={() => {
        const element = video.current!;
        manuallyPaused.current = playing;
        if (playing) element.pause();
        else { if (!element.getAttribute('src')) element.src = src; element.play().catch(() => setPlaying(false)); }
      }}>{playing ? <Pause size={14} aria-hidden="true" /> : <Play size={14} aria-hidden="true" />}<span>{playing ? '일시정지' : '재생'}</span></button>}
  </div>;
}

function ProjectVisual({ id }: { id: Project['id'] }) {
  if (id === 'chungho') return <div className="journey-visual journey-chungho"><ProjectArtwork id={id} /></div>;
  if (id === 'bavarian') return <div className="journey-visual journey-bavarian">
    <div className="journey-showroom"><PortfolioImage variants={images.bavarian} alt="BMW · MINI 바바리안모터스 전시장" sizes="(max-width: 760px) 90vw, 700px" /></div>
    <div className="journey-bmw-card"><img src={serviceMedia.images['cardnews/bmw-color-lineup.jpg']} width="800" height="1000" alt="BMW 컬러 라인업 콘텐츠" loading="lazy" decoding="async" /></div>
    <div className="journey-mini-card"><img src={serviceMedia.images['mini-campaign-grid.png']} width="1620" height="1076" alt="MINI 프로모션 콘텐츠" loading="lazy" decoding="async" /></div>
  </div>;
  if (id === 'ocean') return <div className="journey-visual journey-ocean">
    <div className="journey-ocean-view"><PortfolioImage variants={selected.oceanView} alt="오션더힐 바다 앞 풍경" sizes="(max-width: 760px) 35vw, 360px" /></div>
    {selected.reels.map((reel, index) => <JourneyVideo key={reel.id} className={`journey-reel journey-reel-${index}`}
      src={`/api/scroll-video/${previews[index].src.split('/').pop()}`} poster={reel.poster[0].src} label={reel.title} />)}
  </div>;
  if (id === 'ohrun') return <div className="journey-visual journey-ohrun">
    <JourneyVideo src={`/api/scroll-video/${serviceMedia.video.src.split('/').pop()}`} poster={images.ohrun[1].src} label="오륜스포츠" />
  </div>;
  return <div className="journey-visual journey-byd">
    <div className="journey-orbits" aria-hidden="true"><i /><i /><i /></div>
    <div className="journey-space-photo"><PortfolioImage variants={images.byd} alt="BYD 차량과 브랜드 전시 공간" sizes="(max-width: 760px) 90vw, 920px" /></div>
  </div>;
}

export function ProjectJourney() {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = rootRef.current!;
    const scenes = Array.from(root.querySelectorAll<HTMLElement>('.journey-scene'));
    const compact = matchMedia('(max-width: 760px)');
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;
    function paint() {
      frame = 0;
      scenes.forEach(scene => {
        const bounds = scene.getBoundingClientRect();
        if (bounds.bottom < -100 || bounds.top > innerHeight + 200) return;
        const pose = projectScenePose(bounds.top, bounds.height, innerHeight, compact.matches, reduced.matches);
        scene.style.setProperty('--scene-enter', String(pose.enter));
        scene.style.setProperty('--scene-lift', `${pose.lift}px`);
        scene.style.setProperty('--scene-drift', `${pose.drift}px`);
        scene.style.setProperty('--scene-turn', `${pose.turn}deg`);
        scene.style.setProperty('--scene-scale', String(pose.scale));
        const openingReady = scene.id !== 'project-chungho' || root.previousElementSibling?.hasAttribute('data-projects-ready');
        if (bounds.top < innerHeight * .78 && openingReady) scene.classList.add('is-revealed');
        scene.dataset.inView = String(bounds.bottom > 0 && bounds.top < innerHeight);
      });
    }
    const schedule = () => { if (!frame) frame = requestAnimationFrame(paint); };
    const resize = new ResizeObserver(schedule);
    resize.observe(root);
    paint();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    reduced.addEventListener('change', schedule);
    return () => {
      cancelAnimationFrame(frame); resize.disconnect();
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      reduced.removeEventListener('change', schedule);
    };
  }, []);

  return <section ref={rootRef} className="project-journey" aria-label="우주기획 대표 프로젝트" id="projects">
    {projects.map(project => <article className={`journey-scene journey-scene-${project.id}`} id={`project-${project.id}`} key={project.id}>
      <ProjectCopy project={project} />
      <ProjectVisual id={project.id} />
    </article>)}
  </section>;
}
