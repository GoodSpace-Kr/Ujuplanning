'use client';

import { useEffect, useRef, useState } from 'react';

export function WorkNavigation({ items }: { items: { id: string; label: string }[] }) {
  const [active, setActive] = useState('');
  const navigation = useRef<HTMLElement>(null);

  useEffect(() => {
    const sections = items.map(item => document.getElementById(item.id)).filter((node): node is HTMLElement => !!node);
    let frame = 0;
    function update() {
      frame = 0;
      const guide = Math.min(window.innerHeight * .4, 340);
      const current = sections.find(section => {
        const bounds = section.getBoundingClientRect();
        return bounds.top <= guide && bounds.bottom > guide;
      });
      setActive(current?.id ?? '');
    }
    function schedule() { if (!frame) frame = requestAnimationFrame(update); }
    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, [items]);

  useEffect(() => {
    const nav = navigation.current;
    const link = nav?.querySelector<HTMLElement>('[aria-current="location"]');
    if (!nav || !link) return;
    // Keep the selected label visible on small screens without scrolling the page.
    const bounds = link.getBoundingClientRect();
    const viewport = nav.getBoundingClientRect();
    if (bounds.left < viewport.left || bounds.right > viewport.right) {
      nav.scrollLeft += bounds.left - viewport.left - (viewport.width - bounds.width) / 2;
    }
  }, [active]);

  return <div className="work-navigation">
    <div className="work-navigation-inner">
      <span className="work-navigation-label">SELECTED WORK <span>05</span></span>
      <nav ref={navigation} aria-label="프로젝트 바로가기" data-native-scroll>
        {items.map(item => <a key={item.id} href={`#${item.id}`} aria-current={active === item.id ? 'location' : undefined}>{item.label}</a>)}
      </nav>
    </div>
  </div>;
}
