'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Check, Crop, Film, Image as ImageIcon, Layers, Play, Volume2 } from 'lucide-react';
import './creative-studio.css';

const PHOTO = '/creative-product.png';
const clips = ['브랜드의 시작', '디테일을 담다', '일상의 한 장면'];

function ProductPhoto({ className = '' }: { className?: string }) {
  return <Image className={`creative-photo ${className}`} src={PHOTO} alt="" loading="lazy" width={1536} height={1024} unoptimized draggable={false} />;
}

// CSS perspective keeps the actual typeset Korean content sharp on each 3D surface.
// All animations share one clock and pause together, including when offscreen.
export function CreativeStudio() {
  const rootRef = useRef<HTMLElement>(null);
  const [reduced, setReduced] = useState(false);
  const [inView, setInView] = useState(false);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onMotion = () => setReduced(motion.matches);
    const onVisibility = () => setVisible(!document.hidden);
    const resize = () => {
      const { width, height } = root.getBoundingClientRect();
      const compact = width < 760;
      root.dataset.compact = String(compact);
      root.style.setProperty('--studio-scale', String(Math.min((width - 24) / (compact ? 660 : 1080), (height - 44) / (compact ? 820 : 500))));
    };
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting));
    const sizes = new ResizeObserver(resize);
    observer.observe(root);
    sizes.observe(root);
    motion.addEventListener('change', onMotion);
    document.addEventListener('visibilitychange', onVisibility);
    onMotion();
    onVisibility();
    resize();
    return () => {
      observer.disconnect();
      sizes.disconnect();
      motion.removeEventListener('change', onMotion);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return <>
    <figure ref={rootRef} className="creative-studio" data-running={inView && visible && !reduced} data-still={reduced}
      aria-label="영상의 클립과 자막을 편집하고, 제품 사진을 보정한 뒤 카드뉴스 세 장을 완성해 위아래로 펼쳐 보여주는 우주기획의 콘텐츠 제작 애니메이션">
      <div className="creative-stage" aria-hidden="true">
        <div className="creative-panel creative-editor">
          <div className="creative-panel-heading"><span><Film /> 영상 편집</span><small>BRAND FILM · 00:15</small></div>
          <div className="creative-editor-body">
            <div className="creative-preview">
              <ProductPhoto />
              <span className="creative-preview-caption">일상에 스며드는, 브랜드의 장면</span>
              <span className="creative-preview-ratio">16:9</span>
            </div>
            <div className="creative-playback"><Play size={12} fill="currentColor" /><span>브랜드 필름 / 시퀀스 01</span><span>00:15</span></div>
            <div className="creative-timeline">
              <div className="creative-ruler"><span>00:00</span><span>00:05</span><span>00:10</span><span>00:15</span></div>
              <div className="creative-clips">{clips.map((clip, i) => <div key={clip} className={`creative-clip creative-clip-${i}`}><ProductPhoto /><span>{clip}</span></div>)}</div>
              <div className="creative-subtitle-track"><span>일상에 스며드는, 브랜드의 장면</span></div>
              <div className="creative-audio-track"><Volume2 size={12} /><div>{Array.from({ length: 48 }, (_, i) => <i key={i} style={{ height: `${4 + ((i * 7 + i % 3 * 9) % 17)}px` }} />)}</div></div>
              <div className="creative-playhead"><i /></div>
            </div>
          </div>
          <div className="creative-panel-footer"><span>우주기획</span><span>기획의 문장을, 움직이는 장면으로</span></div>
        </div>

        <div className="creative-panel creative-retouch">
          <div className="creative-panel-heading"><span><ImageIcon /> 사진 보정</span><Crop size={14} /></div>
          <div className="creative-retouch-photo">
            <ProductPhoto className="creative-photo-before" />
            <div className="creative-photo-after"><ProductPhoto /></div>
            <div className="creative-crop-frame"><i /><i /><i /><i /></div>
            <div className="creative-retouch-sweep" />
          </div>
          <div className="creative-adjustment"><span>노출</span><i><b /></i><small>+0.3</small></div>
          <div className="creative-adjustment creative-adjustment-tone"><span>색감</span><i><b /></i><small>BLUE</small></div>
          <div className="creative-panel-footer"><span>우주기획</span><span>빛과 색을 세심하게</span></div>
        </div>

        <div className="creative-cards">
          <div className="creative-panel creative-social creative-social-back">
            <div className="creative-panel-heading"><span><Layers /> 카드뉴스</span><small>03</small></div>
            <ProductPhoto />
            <div className="creative-social-copy"><small>YOUR EVERYDAY</small><strong>오래 기억되는<br />브랜드의 순간</strong><p>하나의 메시지, 다양한 콘텐츠.</p></div>
            <div className="creative-panel-footer"><span>우주기획</span><Check size={13} /></div>
          </div>
          <div className="creative-panel creative-social creative-social-middle">
            <div className="creative-panel-heading"><span><Layers /> 카드뉴스</span><small>02</small></div>
            <ProductPhoto />
            <div className="creative-social-copy"><small>THE DETAIL</small><strong>작은 디테일이<br />만드는 차이</strong><p>빛과 색, 문장의 온도까지.</p></div>
            <div className="creative-panel-footer"><span>우주기획</span><Check size={13} /></div>
          </div>
          <div className="creative-panel creative-social creative-social-front">
            <div className="creative-panel-heading"><span><Layers /> 카드뉴스</span><small>01</small></div>
            <ProductPhoto />
            <div className="creative-social-copy"><small>BRAND STORY</small><strong><span className="creative-type-one">일상을 채우는</span><br /><span className="creative-type-two">새로운 시선</span></strong><p className="creative-type-body">브랜드의 이야기를 시작합니다.</p></div>
            <div className="creative-panel-footer"><span>우주기획</span><Check className="creative-complete" size={13} /></div>
          </div>
        </div>
        <div className="creative-flow"><span className="creative-flow-video">01 영상 편집</span><i /><span className="creative-flow-photo">02 사진 보정</span><i /><span className="creative-flow-card">03 카드뉴스 제작</span></div>
      </div>
    </figure>

  </>;
}
