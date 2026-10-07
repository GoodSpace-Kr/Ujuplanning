'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import './site-header.css';

const links = [
  ['HOME', '/'], ['WORK', '/work'], ['SERVICES', '/services'],
  ['ABOUT', '/about'], ['CONTACT', '/contact'],
];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [immersive, setImmersive] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (pathname !== '/') { setImmersive(false); return; }
    const studio = document.querySelector<HTMLElement>('.studio-hero');
    const process = document.querySelector<HTMLElement>('.brand-process');
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;
    const update = () => {
      frame = 0;
      const studioBounds = studio?.getBoundingClientRect();
      const inStudio = !!studioBounds && studioBounds.top <= 0 && studioBounds.bottom > 0 && studio?.dataset.phase !== 'projects';
      const filmRegion = motion.matches ? process?.querySelector<HTMLElement>('.brand-process-gallery') : process;
      const filmBounds = filmRegion?.getBoundingClientRect();
      const stageHeight = process?.querySelector<HTMLElement>(motion.matches ? '.brand-process-card-3' : '.brand-process-sticky')?.clientHeight ?? window.innerHeight;
      const inFilm = !!filmBounds && filmBounds.top <= 0 && filmBounds.bottom >= stageHeight &&
        (motion.matches || !!process?.hasAttribute('data-expanding'));
      const hidden = inStudio || inFilm;
      setImmersive(current => current === hidden ? current : hidden);
      if (hidden) setOpen(false);
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    // Animation phases can finish without another wheel event.
    const observer = new MutationObserver(schedule);
    if (studio) observer.observe(studio, { attributes: true, attributeFilter: ['data-phase'] });
    if (process) observer.observe(process, { attributes: true, attributeFilter: ['data-expanding'] });
    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    window.addEventListener('hashchange', schedule);
    motion.addEventListener('change', schedule);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      window.removeEventListener('hashchange', schedule);
      motion.removeEventListener('change', schedule);
    };
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setOpen(false); toggle.current?.focus(); }
    };
    window.addEventListener('keydown', close);
    return () => window.removeEventListener('keydown', close);
  }, [open]);

  return (
    <>
    <span id="site-top" className="uju-top-anchor" aria-hidden="true" />
    <header className={`uju-header${immersive ? ' is-immersive' : ''}`} inert={immersive} aria-hidden={immersive || undefined} onBlur={event => {
      if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
    }}>
      <div className="uju-header-inner">
        <a className="uju-header-brand" href="/" aria-label="우주기획 홈">우주기획</a>
        <nav id="site-navigation" className={`uju-header-nav${open ? ' is-open' : ''}`} aria-label="전체 메뉴">
          {links.map(([label, href]) => <a key={href} href={href} aria-current={pathname === href ? 'page' : undefined}>{label}</a>)}
        </nav>
        <div className="uju-header-actions">
          <a className="uju-header-contact" href={pathname === '/' ? '#contact' : '/#contact'} onClick={() => setOpen(false)}>문의하기</a>
          <button ref={toggle} className="uju-header-toggle" type="button" aria-label={open ? '메뉴 닫기' : '메뉴 열기'} aria-expanded={open} aria-controls="site-navigation" onClick={() => setOpen(!open)}>
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>
    </header>
    </>
  );
}
