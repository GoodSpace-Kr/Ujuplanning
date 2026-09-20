'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Bookmark, CalendarDays, Check, Heart, MessageCircle, MoreHorizontal, Play, Send } from 'lucide-react';
import './social-studio.css';

function Instagram({ size = 16 }: { size?: number }) {
  return <Image src="/brand-icons/instagram.png" alt="" width={size} height={size} unoptimized />;
}

function Youtube({ size = 16 }: { size?: number }) {
  return <Image src="/brand-icons/youtube.png" alt="" width={size} height={size} unoptimized />;
}

function ChannelPhoto({ className = '' }: { className?: string }) {
  return <Image className={className} src="/creative-product.png" alt="" width={1536} height={1024} unoptimized loading="lazy" draggable={false} />;
}

export function SocialStudio() {
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
      root.style.setProperty('--social-scale', String(Math.max(0, Math.min((width - 24) / (compact ? 660 : 1080), (height - 36) / (compact ? 960 : 540)))));
    };
    const intersection = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting));
    const sizes = new ResizeObserver(resize);
    intersection.observe(root);
    sizes.observe(root);
    motion.addEventListener('change', onMotion);
    document.addEventListener('visibilitychange', onVisibility);
    onMotion();
    onVisibility();
    resize();
    return () => {
      intersection.disconnect();
      sizes.disconnect();
      motion.removeEventListener('change', onMotion);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return <figure ref={rootRef} className="social-studio" data-running={inView && visible && !reduced} data-still={reduced}
    aria-label="콘텐츠 일정에 따라 인스타그램·네이버 블로그·유튜브 쇼츠를 발행하고, 댓글과 저장, 크리에이터 협업으로 브랜드 이야기가 확산되는 애니메이션">
    <div className="social-stage" aria-hidden="true">
      <div className="social-paper social-blog">
        <div className="social-heading"><span><Image src="/brand-icons/naver.png" alt="" width={16} height={16} unoptimized />네이버 블로그</span><MoreHorizontal size={16} /></div>
        <div className="social-blog-body">
          <small>우주기획 · BRAND JOURNAL</small>
          <h4 className="social-blog-title">일상에 향기를 더하는 방법</h4>
          <ChannelPhoto />
          <p className="social-blog-line social-blog-line-one">좋아하는 향으로 시작하는 하루.</p>
          <p className="social-blog-line social-blog-line-two">익숙한 공간에도 새로운 기분을 더해요.</p>
          <div className="social-blog-rule" />
          <span className="social-blog-tag">#일상의기록</span><span className="social-blog-tag">#나만의취향</span>
        </div>
        <div className="social-footer"><span>우주기획</span><span className="social-published"><Check size={11} />발행 완료</span></div>
      </div>

      <div className="social-paper social-instagram">
        <div className="social-heading"><span><Instagram size={17} />인스타그램</span><MoreHorizontal size={16} /></div>
        <div className="social-feed-window">
          <div className="social-feed-track">
            {[0, 1].map(index => <div className={`social-post social-post-${index}`} key={index}>
              <div className="social-account"><span className="social-avatar">U</span><span>ujuplanning</span><small>{index === 0 ? '오늘의 이야기' : '함께 만드는 이야기'}</small></div>
              <div className="social-feed-image"><ChannelPhoto /><span>{index === 0 ? 'SCENT OF YOUR DAY' : 'YOUR EVERYDAY MOMENT'}</span></div>
              <div className="social-reactions"><Heart className="social-like" /><MessageCircle /><Send className="social-share" /><Bookmark className="social-save" /></div>
              <p className="social-feed-caption">{index === 0 ? '오늘의 취향을, 한 장의 이야기로.' : '서로의 일상에서 발견하는 새로운 취향.'}</p>
              <small className="social-feed-hashtag">#우주기획 #브랜드스토리 #일상의향기</small>
              <div className="social-comment"><span>daily.note</span><p>다음 이야기도 기대돼요.</p><Heart size={10} /></div>
            </div>)}
          </div>
        </div>
        <div className="social-footer"><span>우주기획</span><span className="social-published"><Check size={11} />게시 완료</span></div>
      </div>

      <div className="social-paper social-shorts">
        <div className="social-heading"><span><Youtube size={18} />유튜브 쇼츠</span></div>
        <div className="social-short-video">
          <ChannelPhoto />
          <div className="social-short-title"><small>우주기획</small><p>당신의 하루에<br />어울리는 향</p></div>
          <div className="social-short-actions"><Heart /><MessageCircle /><Send /></div>
          <div className="social-short-progress"><i /></div>
        </div>
        <div className="social-footer"><span><Play size={10} />오늘의 짧은 기록</span><span>0:15</span></div>
      </div>

      <div className="social-paper social-creator">
        <div className="social-heading"><span>크리에이터 협업</span><small>제품 제공</small></div>
        <div className="social-creator-body"><ChannelPhoto /><div><small>CREATOR NOTE</small><p>향기로 기록하는<br />나의 하루</p><span><Send size={11} />이야기 공유하기</span></div></div>
        <div className="social-footer"><span>브랜드 × 크리에이터</span><Check size={12} /></div>
      </div>

      <div className="social-paper social-calendar">
        <div className="social-calendar-title"><CalendarDays size={15} /><span>콘텐츠 일정</span><small>이번 주</small></div>
        <div className="social-calendar-days">
          {[{ day: '월', title: '피드', Icon: Instagram }, { day: '수', title: '블로그', Icon: Bookmark }, { day: '금', title: '쇼츠', Icon: Youtube }].map(({ day, title, Icon }, i) => <div className={`social-calendar-day social-day-${i}`} key={day}><small>{day}</small><span><Icon size={12} />{title}<Check size={11} /></span></div>)}
        </div>
      </div>
    </div>
  </figure>;
}
