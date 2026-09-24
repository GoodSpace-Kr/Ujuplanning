'use client';

import { MousePointer2, type LucideIcon } from 'lucide-react';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type RefObject,
} from 'react';

export type ServiceDemoPage<Id extends string> = {
  id: Id;
  title: string;
  icon: LucideIcon;
  number: string;
};

export function useServiceDemoPlayback<Id extends string>(
  ref: RefObject<HTMLDivElement | null>,
  active: boolean,
  pages: readonly ServiceDemoPage<Id>[],
  holdMs = 2500,
) {
  const [page, setPage] = useState<Id>(pages[0].id);
  const [target, setTarget] = useState<Id>(pages[0].id);
  const [phase, setPhase] = useState<'idle' | 'moving' | 'clicking'>('idle');
  const [paused, setPaused] = useState(false);
  const [inView, setInView] = useState(false);
  const [visible, setVisible] = useState(false);
  const [reduced, setReduced] = useState(true);
  const [interaction, setInteraction] = useState(0);
  const resumeAt = useRef(0);
  const running = active && inView && visible && !reduced && !paused;

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onMotion = () => setReduced(motion.matches);
    const onVisibility = () => setVisible(!document.hidden);
    const observer = new IntersectionObserver(
      ([entry]) =>
        setInView(entry.isIntersecting && entry.intersectionRatio >= 0.15),
      { threshold: [0, 0.15] },
    );
    observer.observe(root);
    motion.addEventListener('change', onMotion);
    document.addEventListener('visibilitychange', onVisibility);
    onMotion();
    onVisibility();
    return () => {
      observer.disconnect();
      motion.removeEventListener('change', onMotion);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [ref]);

  useEffect(() => {
    if (!running) return;
    const next =
      pages[(pages.findIndex((item) => item.id === page) + 1) % pages.length]
        .id;
    const delay = Math.max(0, resumeAt.current - Date.now());
    const move = window.setTimeout(() => {
      setTarget(next);
      setPhase('moving');
    }, delay + holdMs);
    const click = window.setTimeout(
      () => setPhase('clicking'),
      delay + holdMs + 400,
    );
    const select = window.setTimeout(
      () => {
        setPage(next);
        setPhase('idle');
      },
      delay + holdMs + 560,
    );
    return () => {
      window.clearTimeout(move);
      window.clearTimeout(click);
      window.clearTimeout(select);
    };
  }, [page, running, interaction, pages, holdMs]);

  const select = useCallback((next: Id) => {
    resumeAt.current = Date.now() + 3500;
    setPage(next);
    setTarget(next);
    setPhase('idle');
    setInteraction((value) => value + 1);
  }, []);

  return {
    page,
    target,
    phase,
    running,
    paused,
    reduced,
    select,
    toggle: () => {
      setTarget(page);
      setPhase('idle');
      setPaused((value) => !value);
    },
  };
}

export function ServiceDemoNavigation<Id extends string>({
  pages,
  label,
  page,
  onSelect,
  panelId,
  target,
  phase,
  running,
}: {
  pages: readonly ServiceDemoPage<Id>[];
  label: string;
  page: Id;
  onSelect: (page: Id) => void;
  panelId: string;
  target: Id;
  phase: 'idle' | 'moving' | 'clicking';
  running: boolean;
}) {
  const ref = useRef<HTMLElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const nav = ref.current;
    if (!nav) return;
    const update = () => {
      const button = nav.querySelector<HTMLButtonElement>(
        `[data-page="${target}"]`,
      );
      if (!button) return;
      setPosition({
        x: button.offsetLeft + button.offsetWidth * 0.76,
        y: button.offsetTop + button.offsetHeight * 0.6,
      });
    };
    const observer = new ResizeObserver(update);
    observer.observe(nav);
    update();
    return () => observer.disconnect();
  }, [target]);
  return (
    <nav
      ref={ref}
      className="strategy-navigation"
      aria-label={label}
      data-cursor-target={target}
      data-cursor-phase={phase}
    >
      {pages.map(({ id, title, icon: Icon, number }) => (
        <button
          key={id}
          data-page={id}
          data-demo-click={running && target === id && phase === 'clicking'}
          type="button"
          aria-pressed={page === id}
          aria-controls={panelId}
          onClick={() => onSelect(id)}
        >
          <Icon aria-hidden="true" />
          <span>{title}</span>
          <small aria-hidden="true">{number}</small>
        </button>
      ))}
      <span
        className={`strategy-demo-cursor ${running ? 'is-visible' : ''} ${phase === 'clicking' ? 'is-clicking' : ''}`}
        style={{
          transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
        }}
        aria-hidden="true"
      >
        <i />
        <MousePointer2 />
      </span>
    </nav>
  );
}
