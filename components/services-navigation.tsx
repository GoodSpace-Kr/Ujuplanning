'use client';

import { useEffect, useRef, useState } from 'react';

const items = [
  { id: 'strategy', label: '전략기획' },
  { id: 'creative', label: '영상·사진·콘텐츠' },
  { id: 'performance', label: '디지털 퍼포먼스' },
  { id: 'social', label: 'SNS·바이럴' },
];

export function ServicesNavigation() {
  const [active, setActive] = useState('');
  const navigation = useRef<HTMLElement>(null);

  useEffect(() => {
    const sections = items.map(item => document.getElementById(item.id));
    let frame = 0;
    function update() {
      frame = 0;
      const guide = Math.min(innerHeight * .4, 340);
      const current = sections.find(section => {
        const bounds = section?.getBoundingClientRect();
        return bounds && bounds.top <= guide && bounds.bottom > guide;
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
  }, []);

  useEffect(() => {
    const nav = navigation.current;
    const selected = nav?.querySelector<HTMLElement>('[aria-current="location"]');
    if (!nav || !selected) return;
    const bounds = selected.getBoundingClientRect();
    const viewport = nav.getBoundingClientRect();
    if (bounds.left < viewport.left || bounds.right > viewport.right) {
      nav.scrollLeft += bounds.left - viewport.left - (viewport.width - bounds.width) / 2;
    }
  }, [active]);

  return <div className="offering-navigation">
    <div className="offering-container offering-navigation-inner">
      <span className="offering-navigation-label">OUR SERVICES <span>04</span></span>
      <nav ref={navigation} aria-label="서비스 바로가기" data-native-scroll>
        {items.map(item => <a key={item.id} href={`#${item.id}`} aria-current={active === item.id ? 'location' : undefined}>{item.label}</a>)}
      </nav>
    </div>
  </div>;
}
