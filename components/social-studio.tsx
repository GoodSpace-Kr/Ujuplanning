'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import {
  Check, ChevronDown, CircleCheck, Clock3, Eye, FileText, ImagePlus,
  Grid3X3, MoreHorizontal, Play, RotateCcw, Send, Settings2, Video,
} from 'lucide-react';
import './social-studio.css';

type Platform = 'blog' | 'instagram' | 'shorts';
type Phase = 'draft' | 'media' | 'writing' | 'review' | 'published' | 'feed';

const channels = [
  { id: 'blog', name: '네이버 블로그', detail: '브랜드 스토리', icon: '/brand-icons/naver.png' },
  { id: 'instagram', name: '인스타그램', detail: '피드 게시물', icon: '/brand-icons/instagram.png' },
  { id: 'shorts', name: '유튜브 쇼츠', detail: '숏폼 영상', icon: '/brand-icons/youtube.png' },
] as const;

const phaseLabels: Record<Phase, string> = {
  draft: '새 게시물 준비 중',
  media: '미디어 추가 중',
  writing: '게시물 작성 중',
  review: '게시 전 확인 중',
  published: '게시 완료',
  feed: '피드 게시 완료',
};

function ChannelIcon({ src, size = 18 }: { src: string; size?: number }) {
  return <Image src={src} alt="" width={size} height={size} unoptimized />;
}

const miniPosts = [
  'MINI 서비스 페스타 2024',
  '이국적인 드라이브 코스 TOP 3',
  'MINI 패밀리 위크',
  '데이트 드라이브 코스 TOP 3',
  '2024 서머 캠페인',
  '나만 알고 싶은 핫플레이스 코스 TOP 3',
];

function MiniCampaignTile({ index }: { index: number }) {
  return <div className={`mini-campaign-tile mini-campaign-tile-${index}`}><span>{miniPosts[index]}</span></div>;
}

function MiniAvatar({ className = '' }: { className?: string }) {
  return <span className={`social-mini-avatar ${className}`} aria-hidden="true"><span>MINI</span></span>;
}

function MiniInstagramProfile() {
  return (
    <div className="social-mini-profile">
      <header className="social-mini-profile-header">
        <MiniAvatar className="social-mini-profile-avatar" />
        <div className="social-mini-profile-detail">
          <div className="social-mini-profile-name"><strong>mini.bavarianmotors</strong><span>팔로우</span><span>메시지 보내기</span></div>
          <div className="social-mini-profile-counts"><span><strong>6</strong> 게시물</span><span><strong>1.5천</strong> 팔로워</span><span><strong>15</strong> 팔로잉</span></div>
          <p><strong>MINI 바바리안 모터스</strong><br />매일의 새로운 드라이브를 MINI와 함께.</p>
        </div>
      </header>
      <div className="social-mini-highlights" aria-label="스토리 하이라이트">
        {['이벤트', '드라이브', 'MINI 라이프', '서비스'].map((label, index) => (
          <span className="social-mini-highlight" key={label}><span className={`social-mini-highlight-dot social-mini-highlight-dot-${index}`} />{label}</span>
        ))}
      </div>
      <div className="social-mini-feed-tab"><Grid3X3 /><span>게시물</span></div>
      <div className="social-mini-feed-grid" aria-label="MINI 바바리안 모터스 게시물 6개">
        {miniPosts.map((post, index) => <MiniCampaignTile index={index} key={post} />)}
      </div>
    </div>
  );
}

function BlogEditor() {
  return (
    <div className="social-editor social-editor-blog">
      <div className="social-blog-document">
        <div className="social-editor-kicker"><span className="social-blog-mark">N</span><strong>블로그 글쓰기</strong><span>임시저장</span></div>
        <div className="social-compose-title"><span className="social-placeholder">제목을 입력하세요</span><strong>오륜스포츠, 경기장에서 시작되는 하루</strong></div>
        <div className="social-media-block social-blog-media">
          <div className="social-media-placeholder"><ImagePlus /><span>사진을 추가하는 중</span></div>
          <Image src="/ohrun-retouch.jpg" alt="경기장에서 달리는 아이의 오륜스포츠 캠페인 사진" width={1920} height={1080} unoptimized />
        </div>
        <div className="social-compose-copy">
          <p>처음 달려 나가는 순간의 표정에는 운동의 즐거움이 담겨 있습니다.</p>
          <p>오륜스포츠가 함께한 경기장의 하루를 사진으로 전합니다.</p>
        </div>
        <div className="social-blog-tags"><span>#오륜스포츠</span><span>#운동하는하루</span><span>#브랜드스토리</span></div>
      </div>
      <aside className="social-editor-settings">
        <div className="social-settings-heading"><Settings2 /><strong>발행 설정</strong></div>
        <div className="social-setting-row"><span>게시 위치</span><strong>오륜스포츠 공식 블로그</strong></div>
        <div className="social-setting-row"><span>카테고리</span><strong>브랜드 이야기 <ChevronDown /></strong></div>
        <div className="social-setting-row"><span>공개 설정</span><strong>전체 공개 <ChevronDown /></strong></div>
        <div className="social-setting-row"><span>발행 시점</span><strong>지금 발행 <ChevronDown /></strong></div>
        <div className="social-settings-note"><Clock3 /> 작성한 글을 확인한 뒤 발행합니다.</div>
      </aside>
    </div>
  );
}

function InstagramEditor() {
  return (
    <div className="social-editor social-editor-instagram">
      <div className="social-instagram-preview">
        <div className="social-instagram-top"><ChannelIcon src="/brand-icons/instagram.png" size={16} /><strong>새 게시물</strong><MoreHorizontal /></div>
        <div className="social-media-block social-instagram-media">
          <div className="social-media-placeholder"><ImagePlus /><span>이미지를 추가하는 중</span></div>
          <MiniCampaignTile index={0} />
        </div>
        <div className="social-instagram-preview-foot"><span>1 / 1</span><span>정사각형 피드 미리보기</span></div>
      </div>
      <aside className="social-instagram-compose">
        <div className="social-account-row"><MiniAvatar /><div><strong>mini.bavarianmotors</strong><small>피드 게시물 작성</small></div><ChevronDown /></div>
        <div className="social-caption-box"><span className="social-placeholder">문구를 입력하세요...</span><div className="social-compose-copy"><p>MINI SERVICE FESTA 2024</p><p>MINI와 함께하는 특별한 서비스의 순간을 만나보세요.</p><span>#MINI #바바리안모터스 #MINI서비스페스타</span></div></div>
        <div className="social-setting-row"><span>위치 추가</span><strong>대한민국 <ChevronDown /></strong></div>
        <div className="social-setting-row"><span>태그</span><strong>MINI <ChevronDown /></strong></div>
        <div className="social-instagram-note"><Eye /> 이미지와 문구를 확인하고 게시합니다.</div>
      </aside>
    </div>
  );
}

function ShortsEditor({ active, reduced }: { active: boolean; reduced: boolean }) {
  return (
    <div className="social-editor social-editor-shorts">
      <div className="social-shorts-preview">
        <div className="social-media-block social-shorts-media">
          <div className="social-media-placeholder"><Video /><span>영상을 추가하는 중</span></div>
          <video src="/ohrun.mp4" poster="/ohrun-frame-02.webp" autoPlay={active && !reduced} muted loop playsInline preload="metadata" aria-label="오륜스포츠 캠페인 쇼츠 영상">
            <track kind="captions" src="/ohrun-captions.vtt" srcLang="ko" label="장면 설명" />
          </video>
          <div className="social-shorts-play"><Play fill="currentColor" /> 00:11</div>
        </div>
        <div className="social-shorts-preview-foot">SHORTS · 9:16 미리보기</div>
      </div>
      <aside className="social-shorts-compose">
        <div className="social-account-row"><span className="social-youtube-avatar"><ChannelIcon src="/brand-icons/youtube.png" size={20} /></span><div><strong>오륜스포츠</strong><small>쇼츠 업로드</small></div></div>
        <div className="social-shorts-field"><span>제목</span><div className="social-compose-copy">달리는 순간, 즐거움이 시작된다 | 오륜스포츠</div></div>
        <div className="social-shorts-field"><span>설명</span><div className="social-compose-copy">경기장에서 만난 특별한 하루.<br />#오륜스포츠 #운동하는하루 #Shorts</div></div>
        <div className="social-setting-row"><span>공개 상태</span><strong>공개 <ChevronDown /></strong></div>
        <div className="social-setting-row"><span>동영상</span><strong>ohrun.mp4 <Check /></strong></div>
        <div className="social-shorts-note"><Video /> 영상을 확인한 뒤 게시합니다.</div>
      </aside>
    </div>
  );
}

export function SocialStudio({ active }: { active: boolean }) {
  const [platform, setPlatform] = useState<Platform>('instagram');
  const [phase, setPhase] = useState<Phase>('draft');
  const [sequence, setSequence] = useState(0);
  const [reduced, setReduced] = useState(false);
  const [completed, setCompleted] = useState<Record<Platform, boolean>>({ blog: false, instagram: false, shorts: false });
  const timers = useRef<number[]>([]);

  useEffect(() => {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(motion.matches);
    update();
    motion.addEventListener('change', update);
    return () => motion.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    timers.current.forEach(window.clearTimeout);
    timers.current = [];
    if (!active || reduced) return;
    timers.current = [
      window.setTimeout(() => setPhase('draft'), 0),
      window.setTimeout(() => setPhase('media'), 480),
      window.setTimeout(() => setPhase('writing'), 1250),
      window.setTimeout(() => setPhase('review'), 2950),
      window.setTimeout(() => {
        setPhase('published');
        setCompleted((current) => ({ ...current, [platform]: true }));
      }, 4050),
    ];
    return () => timers.current.forEach(window.clearTimeout);
  }, [active, platform, sequence, reduced]);

  useEffect(() => {
    if (!active || reduced || platform !== 'instagram' || phase !== 'published') return;
    const reveal = window.setTimeout(() => setPhase('feed'), 850);
    return () => window.clearTimeout(reveal);
  }, [active, platform, phase, reduced]);

  const selectPlatform = (next: Platform) => {
    setPhase('draft');
    setPlatform(next);
    setSequence((current) => current + 1);
  };

  const finish = () => {
    timers.current.forEach(window.clearTimeout);
    timers.current = [];
    setPhase('published');
    setCompleted((current) => ({ ...current, [platform]: true }));
  };

  const current = channels.find((channel) => channel.id === platform)!;
  const displayPhase = reduced ? (platform === 'instagram' ? 'feed' : 'published') : phase;
  const step = displayPhase === 'published' || displayPhase === 'feed' ? 3 : displayPhase === 'writing' || displayPhase === 'review' ? 2 : displayPhase === 'media' ? 1 : 0;
  const completedCount = Object.values(completed).filter(Boolean).length + Number(reduced && !completed[platform]);
  const showInstagramFeed = platform === 'instagram' && displayPhase === 'feed';

  return (
    <section className="social-studio" data-platform={platform} data-phase={displayPhase} aria-label="SNS 채널 게시물 작성과 발행 예시">
      <aside className="social-channel-rail">
        <span className="social-rail-eyebrow">CHANNELS</span>
        <nav aria-label="SNS 채널 메뉴">
          {channels.map((channel, index) => (
            <button key={channel.id} type="button" aria-current={platform === channel.id ? 'page' : undefined} onClick={() => selectPlatform(channel.id)}>
              <span className="social-channel-icon"><ChannelIcon src={channel.icon} /></span>
              <span className="social-channel-label"><strong>{channel.name}</strong><small>{channel.detail}</small></span>
              {(completed[channel.id] || (reduced && platform === channel.id)) && <CircleCheck className="social-channel-check" aria-label="게시 완료" />}
              <small className="social-channel-number">0{index + 1}</small>
            </button>
          ))}
        </nav>
        <div className="social-rail-summary"><span>오늘의 게시물</span><strong>{completedCount} / 3 완료</strong></div>
      </aside>

      <section className="social-workspace" aria-label={`${current.name} 게시물 작성 화면`}>
        <header className="social-workspace-header">
          <div><span className="social-workspace-eyebrow">CONTENT WORKSPACE / 0{channels.findIndex((channel) => channel.id === platform) + 1}</span><h4><ChannelIcon src={current.icon} size={20} />{current.name}</h4></div>
          <div className="social-workspace-actions"><span className={`social-phase-label ${displayPhase === 'published' || displayPhase === 'feed' ? 'is-complete' : ''}`} aria-live="polite">{displayPhase === 'published' || displayPhase === 'feed' ? <Check /> : <Clock3 />}{phaseLabels[displayPhase]}</span><button type="button" className="social-replay" onClick={() => selectPlatform(platform)} aria-label="작성 과정 다시 보기"><RotateCcw /></button></div>
        </header>
        <div className="social-workspace-progress" aria-label="게시 작업 진행 상황">
          {[{ label: '미디어 선택', icon: ImagePlus }, { label: '게시물 작성', icon: FileText }, { label: '발행 완료', icon: Send }].map(({ label, icon: Icon }, index) => <div className={step > index ? 'is-complete' : step === index ? 'is-current' : ''} key={label}><span>{step > index ? <Check /> : <Icon />}</span>{label}</div>)}
        </div>
        <div className="social-workspace-content" key={`${platform}-${sequence}`}>
          {showInstagramFeed ? (
            <div className="social-instagram-result" aria-label="게시된 MINI 바바리안 모터스 인스타그램 피드">
              <span className="social-instagram-result-label"><CircleCheck /> 게시 완료 · 피드 형성</span>
              <MiniInstagramProfile />
            </div>
          ) : (
            <>
              {platform === 'blog' ? <BlogEditor /> : platform === 'instagram' ? <InstagramEditor /> : <ShortsEditor active={active} reduced={reduced} />}
              <div className="social-editor-bottom"><span><CircleCheck /> {platform === 'blog' ? '블로그 글' : platform === 'instagram' ? '피드 게시물' : '쇼츠 영상'}을 확인하고 발행합니다.</span><button type="button" onClick={finish} disabled={displayPhase === 'draft' || displayPhase === 'media' || displayPhase === 'published'}>{displayPhase === 'published' ? <><Check /> 게시 완료</> : <><Send /> 게시하기</>}</button></div>
              <output className="social-confirmation"><CircleCheck /><span><strong>{current.name} 게시 완료</strong><small>게시물 작성과 발행 단계를 마쳤습니다.</small></span></output>
            </>
          )}
        </div>
      </section>
    </section>
  );
}
