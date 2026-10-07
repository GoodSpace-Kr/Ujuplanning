'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import {
  Bookmark,
  Brush,
  CarFront,
  Check,
  ChevronDown,
  CircleUserRound,
  Crop,
  Eraser,
  Eye,
  Film,
  Flag,
  Hand,
  Heart,
  House,
  Image as ImageIcon,
  Layers,
  LockKeyhole,
  Maximize2,
  MessageCircle,
  MoreHorizontal,
  MousePointer2,
  Pause,
  Pipette,
  Play,
  Plus,
  Repeat2,
  Search,
  Send,
  SlidersHorizontal,
  Type,
  Undo2,
  Volume2,
  VolumeX,
  ZoomIn,
} from 'lucide-react';
import './creative-studio.css';

const videoClips = [
  { name: '푸른 경기장', range: '00:00–00:04', frame: '/ohrun-frame-01.webp' },
  { name: '잔디 제작', range: '00:04–00:08', frame: '/ohrun-frame-02.webp' },
  { name: '겨울 경기장', range: '00:08–00:11', frame: '/ohrun-frame-03.webp' },
] as const;

export const CREATIVE_PAGES = [
  { id: 'video', title: '영상 편집', icon: Film, number: '01' },
  { id: 'photo', title: '사진 보정', icon: ImageIcon, number: '02' },
  { id: 'card', title: '카드뉴스', icon: Layers, number: '03' },
] as const;
export type CreativePageId = (typeof CREATIVE_PAGES)[number]['id'];

function VideoFrame({ frame }: { frame: string }) {
  return <Image className="creative-video-frame" src={frame} alt="" width={1280} height={720} unoptimized draggable={false} />;
}

function VideoEditor({ active, reduced }: { active: boolean; reduced: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(11.3);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const syncPlayback = () => {
      if (active && !reduced && !document.hidden) {
        void video.play().catch(() => setPlaying(false));
      } else {
        video.pause();
      }
    };
    syncPlayback();
    document.addEventListener('visibilitychange', syncPlayback);
    return () => {
      document.removeEventListener('visibilitychange', syncPlayback);
      video.pause();
    };
  }, [active, reduced]);

  const togglePlayback = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) void video.play().catch(() => setPlaying(false));
    else video.pause();
  };

  const toggleSound = () => {
    const next = !muted;
    setMuted(next);
    if (videoRef.current) videoRef.current.muted = next;
  };

  const displayTime = (seconds: number) => `00:${String(Math.floor(seconds)).padStart(2, '0')}`;

  return (
    <div className="creative-editor">
      <div className="creative-editor-topbar" aria-hidden="true">
        <div className="creative-editor-brand"><span className="creative-editor-brand-mark"><Film /></span><strong>우주기획</strong><i /></div>
        <div className="creative-editor-project"><span>프로젝트</span><ChevronDown /><strong>오륜스포츠 영상</strong><span className="creative-editor-saved"><Check /> 저장됨</span></div>
        <span className="creative-editor-export">내보내기 <ChevronDown /></span>
      </div>

      <div className="creative-editor-body">
        <aside className="creative-editor-library" aria-label="영상 소스 목록">
          <div className="creative-editor-pane-head"><strong>미디어</strong><MoreHorizontal /></div>
          <div className="creative-editor-search"><Search /><span>파일 검색</span></div>
          <div className="creative-editor-library-tabs"><b>프로젝트</b><span>라이브러리</span></div>
          <div className="creative-editor-folder"><ChevronDown /><span>ohrun.mp4 · 장면</span><small>3</small></div>
          <div className="creative-editor-assets">
            {videoClips.map((clip, i) => (
              <div className={`creative-editor-asset ${i === 2 ? 'is-selected' : ''}`} key={clip.frame}>
                <div className="creative-editor-asset-thumb"><VideoFrame frame={clip.frame} /><Film /></div>
                <div><strong>{`0${i + 1}_${clip.name}`}</strong><small>{clip.range} · HD</small></div>
              </div>
            ))}
          </div>
          <div className="creative-editor-library-foot"><span>ASSETS</span><strong>03 / 03</strong></div>
        </aside>

        <div className="creative-editor-center">
          <div className="creative-editor-tools" aria-hidden="true">
            <span className="is-active"><MousePointer2 /></span><span><Crop /></span><span><Type /></span><span><SlidersHorizontal /></span>
            <i /><span><Undo2 /></span><small>맞춤</small><ChevronDown />
          </div>
          <div className="creative-editor-stage">
            <div className="creative-editor-stage-label"><span className="creative-editor-stage-dot" /> 프로그램 모니터 <strong>{String(Math.min(3, Math.floor(currentTime / 4) + 1)).padStart(2, '0')} / 03</strong></div>
            <div className="creative-preview">
              <video
                ref={videoRef}
                className="creative-editor-video"
                src="/ohrun.mp4"
                poster="/ohrun-frame-03.webp"
                preload="metadata"
                playsInline
                muted={muted}
                loop
                aria-label="오륜스포츠 브랜드 영상"
                onPlay={() => setPlaying(true)}
                onPause={() => setPlaying(false)}
                onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
                onLoadedMetadata={(event) => setDuration(event.currentTarget.duration || 11.3)}
              >
                <track kind="captions" src="/ohrun-captions.vtt" srcLang="ko" label="장면 설명" />
              </video>
              <span className="creative-preview-ratio">16:9</span>
              <div className="creative-preview-guides" aria-hidden="true" />
            </div>
            <div className="creative-playback">
              <span>{displayTime(currentTime)} <i>/</i> {displayTime(duration)}</span>
              <span className="creative-playback-controls"><span aria-hidden="true">Ⅰ◀</span><button type="button" onClick={togglePlayback} aria-label={playing ? '영상 일시정지' : '영상 재생'}>{playing ? <Pause size={13} fill="currentColor" /> : <Play size={13} fill="currentColor" />}</button><span aria-hidden="true">▶Ⅰ</span></span>
              <span><button type="button" onClick={toggleSound} aria-label={muted ? '영상 소리 켜기' : '영상 소리 끄기'}>{muted ? <VolumeX size={13} /> : <Volume2 size={13} />}</button><Maximize2 size={12} aria-hidden="true" /></span>
            </div>
          </div>
        </div>

        <aside className="creative-editor-inspector" aria-label="선택한 영상 클립 속성">
          <div className="creative-editor-pane-head"><strong>속성</strong><SlidersHorizontal /></div>
          <div className="creative-editor-inspector-tabs"><b>비디오</b><span>오디오</span><span>효과</span></div>
          <div className="creative-editor-selected"><span>03</span><div><strong>{videoClips[2].name}</strong><small>선택한 클립</small></div><ChevronDown /></div>
          <div className="creative-editor-property"><strong>변형</strong><ChevronDown /></div>
          <div className="creative-editor-input-row"><span>위치</span><b>X&nbsp; 0</b><b>Y&nbsp; 0</b></div>
          <div className="creative-editor-input-row"><span>크기</span><b>100%</b><b>100%</b></div>
          <div className="creative-editor-input-row"><span>회전</span><b>0°</b><b>↻</b></div>
          <div className="creative-editor-property creative-editor-property-bordered"><strong>색상 보정</strong><ChevronDown /></div>
          <div className="creative-editor-range"><span>노출 <small>+0.3</small></span><i><b style={{ left: '56%' }} /></i></div>
          <div className="creative-editor-range"><span>대비 <small>+12</small></span><i><b style={{ left: '63%' }} /></i></div>
          <div className="creative-editor-range"><span>채도 <small>+35</small></span><i><b style={{ left: '70%' }} /></i></div>
          <div className="creative-editor-property creative-editor-property-bordered"><strong>불투명도</strong><span>100%</span></div>
        </aside>
      </div>

      <div className="creative-editor-timeline" aria-label="영상 편집 타임라인">
        <div className="creative-editor-timeline-bar" aria-hidden="true">
          <strong>타임라인 <ChevronDown /></strong><span>시퀀스 01</span><i /><span>스냅 켜짐</span><span className="creative-editor-zoom">− <b /> +</span>
        </div>
        <div className="creative-editor-track-grid" aria-hidden="true">
          <div className="creative-editor-track-labels"><span>시간</span><span><Eye /><LockKeyhole /> V1 <small>영상</small></span><span><Eye /><LockKeyhole /> T1 <small>자막</small></span><span><Volume2 /><LockKeyhole /> A1 <small>오디오</small></span></div>
          <div className="creative-timeline">
            <div className="creative-ruler"><span>00:00</span><span>00:04</span><span>00:08</span><span>00:11</span></div>
            <div className="creative-clips">
              {videoClips.map((clip, i) => (
                <div key={clip.frame} className={`creative-clip creative-clip-${i}`}>
                  <VideoFrame frame={clip.frame} /><span>{clip.name}</span>
                </div>
              ))}
            </div>
            <div className="creative-subtitle-track"><Type size={10} /><span>경기장을 만드는 오륜스포츠의 장면</span></div>
            <div className="creative-audio-track"><Volume2 size={12} /><div>
              {Array.from({ length: 48 }, (_, i) => <i key={i} style={{ height: `${4 + ((i * 7 + (i % 3) * 9) % 17)}px`, animationDelay: `${i % 6 * -90}ms` }} />)}
            </div></div>
            <div className="creative-playhead" style={{ left: `${Math.min(currentTime / duration, 1) * 99}%` }}><i /></div>
          </div>
        </div>
        <div className="creative-editor-status"><span>1280 × 720&nbsp; · &nbsp;24 FPS&nbsp; · &nbsp;3 CLIPS</span><span className="creative-finished"><Check /> 편집 완료</span></div>
      </div>
    </div>
  );
}

function RetouchPhoto({ alt = '' }: { alt?: string }) {
  return (
    <Image
      className="creative-retouch-source"
      src="/ohrun-retouch.jpg"
      alt={alt}
      width={1920}
      height={1080}
      unoptimized
      draggable={false}
    />
  );
}

function PhotoRetouch() {
  return (
    <div className="creative-retouch">
      <div className="creative-retouch-topbar" aria-hidden="true">
        <div className="creative-retouch-brand"><span><ImageIcon /></span><strong>PHOTO STUDIO</strong></div>
        <div className="creative-retouch-file"><span>프로젝트</span><ChevronDown /><strong>오륜스포츠_컷.jpg</strong><small><Check /> 저장됨</small></div>
        <span className="creative-retouch-done">내보내기 <ChevronDown /></span>
      </div>
      <div className="creative-retouch-body">
        <div className="creative-retouch-tools" aria-hidden="true">
          <span className="is-active"><MousePointer2 /></span><span><Crop /></span><span><Brush /></span><span><Eraser /></span>
          <i /><span><Pipette /></span><span><Type /></span><span><Hand /></span><span><ZoomIn /></span>
        </div>
        <aside className="creative-retouch-library" aria-label="사진 작업 파일">
          <div className="creative-retouch-pane-head"><strong>작업 파일</strong><MoreHorizontal /></div>
          <div className="creative-retouch-search"><Search /><span>파일 검색</span></div>
          <div className="creative-retouch-folder"><ChevronDown /> 오륜스포츠 <small>01</small></div>
          <div className="creative-retouch-asset is-selected">
            <div><RetouchPhoto /></div>
            <span><strong>오륜스포츠_컷.jpg</strong><small>1920 × 1080</small></span>
          </div>
          <div className="creative-retouch-library-foot">1개 파일 · JPG</div>
        </aside>
        <div className="creative-retouch-center">
          <div className="creative-retouch-document-bar"><span><ImageIcon /> 오륜스포츠_컷.jpg <small>×</small></span><i /><strong>RGB / 8</strong></div>
          <div className="creative-retouch-stage">
            <div className="creative-retouch-stage-label"><span>캔버스</span><strong>밝기 · 채도 보정</strong></div>
            <div className="creative-retouch-preview" aria-label="사진 밝기와 채도 보정 미리보기">
              <RetouchPhoto alt="밝기와 채도가 차례로 보정되는 오륜스포츠 경기장 사진" />
            </div>
            <div className="creative-retouch-canvas-foot"><span><Eye /> 실시간 보정 미리보기</span><span>75% <ChevronDown /> <Maximize2 /></span></div>
          </div>
        </div>
        <aside className="creative-retouch-inspector" aria-label="사진 보정 설정과 레이어">
          <div className="creative-retouch-pane-head"><strong>속성</strong><SlidersHorizontal /></div>
          <div className="creative-retouch-tabs"><b>조정</b><span>레이어</span><span>정보</span></div>
          <div className="creative-retouch-histogram"><div className="creative-retouch-section-head"><strong>히스토그램</strong><ChevronDown /></div><div className="creative-retouch-histogram-bars" aria-hidden="true">{Array.from({ length: 30 }, (_, index) => <i key={index} style={{ height: `${13 + ((index * 17 + index % 5 * 11) % 44)}px` }} />)}</div><div className="creative-retouch-histogram-scale"><span>어두움</span><span>밝음</span></div></div>
          <div className="creative-retouch-section-head creative-retouch-section-divider"><strong>기본 보정</strong><ChevronDown /></div>
          <div className="creative-retouch-adjustments">
            <div className="creative-adjustment creative-adjustment-brightness"><span>밝기</span><i aria-hidden="true"><b /></i><small className="creative-adjustment-value"><span aria-hidden="true">0.0</span><span>+0.3</span></small></div>
            <div className="creative-adjustment"><span>대비</span><i aria-hidden="true"><b style={{ left: '62%' }} /></i><small>+12</small></div>
            <div className="creative-adjustment creative-adjustment-tone"><span>채도</span><i aria-hidden="true"><b /></i><small className="creative-adjustment-value"><span aria-hidden="true">0</span><span>+35</span></small></div>
            <div className="creative-adjustment"><span>색온도</span><i aria-hidden="true"><b style={{ left: '46%' }} /></i><small>−4</small></div>
          </div>
          <div className="creative-retouch-section-head creative-retouch-section-divider"><strong>레이어</strong><span>＋</span></div>
          <div className="creative-retouch-layer is-selected"><Eye /><span className="creative-retouch-layer-icon"><SlidersHorizontal /></span><span><strong>컬러 보정</strong><small>조정 레이어 · 100%</small></span></div>
          <div className="creative-retouch-layer"><Eye /><span className="creative-retouch-layer-photo"><RetouchPhoto /></span><span><strong>원본 사진</strong><small>배경 · 잠금</small></span><LockKeyhole /></div>
        </aside>
      </div>
      <div className="creative-retouch-status"><span>1920 × 1080&nbsp; · &nbsp;sRGB&nbsp; · &nbsp;JPG</span><span className="creative-finished"><Check /> 보정 완료</span></div>
    </div>
  );
}

function CardNewsArtwork({ src, alt, position, number }: { src: string; alt: string; position: string; number?: string }) {
  return (
    <div className="creative-cardnews-artwork">
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 480px) 35vw, 300px"
        loading="eager"
        unoptimized
        draggable={false}
        style={{ objectPosition: `center ${position}` }}
      />
      {number && <span>{number} / 03</span>}
    </div>
  );
}

export function BavarianInstagramFeed() {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [following, setFollowing] = useState(false);
  return (
    <article className="creative-cardnews-card is-featured creative-feed" aria-label="바바리안모터스 인스타그램 피드 예시">
      <div className="creative-feed-topbar" aria-hidden="true">
        <Plus /><strong>Instagram</strong><span><ChevronDown /><Heart /></span>
      </div>
      <div className="creative-feed-stories" aria-label="브랜드 스토리">
        <div><span className="creative-feed-story-ring"><i className="creative-feed-story-bmw">BMW</i></span><small>BMW</small></div>
        <div><span className="creative-feed-story-ring"><span className="creative-feed-story-avatar creative-feed-story-promo"><CarFront aria-hidden="true" /></span></span><small>프로모션</small></div>
        <div><span className="creative-feed-story-ring"><span className="creative-feed-story-avatar creative-feed-story-golf"><Flag aria-hidden="true" /></span></span><small>골프컵</small></div>
      </div>
      <div className="creative-feed-post-header">
        <span className="creative-feed-avatar" aria-hidden="true">BMW</span>
        <strong>bmw_bavarianmotors</strong>
        <button type="button" onClick={() => setFollowing((value) => !value)}>{following ? '팔로잉' : '팔로우'}</button>
        <MoreHorizontal aria-hidden="true" />
      </div>
      <CardNewsArtwork src="/cardnews/bmw-color-lineup.jpg" alt="다섯 가지 BMW 컬러와 차량을 함께 표현한 캠페인 이미지" position="24.8%" />
      <div className="creative-feed-actions">
        <button type="button" aria-label={liked ? '좋아요 취소' : '좋아요'} aria-pressed={liked} onClick={() => setLiked((value) => !value)}><Heart fill={liked ? 'currentColor' : 'none'} /></button>
        <MessageCircle aria-hidden="true" /><Repeat2 aria-hidden="true" /><Send aria-hidden="true" />
        <button className="creative-feed-save" type="button" aria-label={saved ? '저장 취소' : '게시물 저장'} aria-pressed={saved} onClick={() => setSaved((value) => !value)}><Bookmark fill={saved ? 'currentColor' : 'none'} /></button>
      </div>
      <div className="creative-feed-caption">
        <b>좋아요 {174 + Number(liked)}개</b>
        <p><strong>bmw_bavarianmotors</strong> Always with our Customer<span>... 더 보기</span></p>
        <small>2024년 7월 24일</small>
      </div>
      <div className="creative-feed-bottom" aria-hidden="true"><House /><Play /><Send /><Search /><CircleUserRound /></div>
    </article>
  );
}

function CardComposition() {
  const cards = [
    {
      src: '/cardnews/bmw-march-promotion.jpg',
      alt: '도심을 달리는 BMW 세단과 3월 프로모션 안내',
      position: '30.3%',
      number: '01',
      category: 'PROMOTION',
      title: 'BMW 3월 프로모션',
      description: '새로운 달의 드라이빙 혜택',
    },
    {
      src: '/cardnews/bmw-color-lineup.jpg',
      alt: '다섯 가지 BMW 컬러와 차량을 함께 표현한 캠페인 이미지',
      position: '24.8%',
      number: '02',
      category: 'CAMPAIGN',
      title: 'Always with our customer',
      description: '컬러로 만나는 BMW의 이야기',
    },
    {
      src: '/cardnews/bmw-golf-cup.jpg',
      alt: '골프 코스를 내려다본 BMW GOLF CUP 2024 이미지',
      position: '26.2%',
      number: '03',
      category: 'EVENT',
      title: 'BMW GOLF CUP 2024',
      description: '함께 펼치는 최고의 순간',
    },
  ] as const;
  return (
    <div className="creative-cardnews" aria-label="바바리안모터스 카드뉴스 3종">
      <div className="creative-cardnews-intro">
        <span>BMW · BAVARIAN MOTORS</span>
        <span>CAMPAIGN CONTENT / 03</span>
      </div>
      <div className="creative-cardnews-stage">
        {cards.map((card, index) => index === 1 ? (
          <BavarianInstagramFeed key={card.src} />
        ) : (
          <article className="creative-cardnews-card" key={card.src}>
            <CardNewsArtwork src={card.src} alt={card.alt} position={card.position} number={card.number} />
            <div className="creative-cardnews-copy">
              <small>{card.category}</small>
              <strong>{card.title}</strong>
              <p>{card.description}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

export function CreativeStudio({
  page,
  panelId,
  active,
  running,
  reduced,
}: {
  page: CreativePageId;
  panelId: string;
  active: boolean;
  running: boolean;
  reduced: boolean;
}) {
  const current = CREATIVE_PAGES.find((item) => item.id === page)!;
  const Icon = current.icon;
  return (
    <section
      className="creative-workspace"
      id={panelId}
      aria-label={current.title}
      data-page={page}
      data-running={running}
      data-still={reduced}
    >
      <div className="creative-workspace-content" key={page}>
        <header className="creative-workspace-heading">
          <h4>
            <Icon aria-hidden="true" />
            {current.title}
          </h4>
          <small>
            {page === 'video'
              ? 'OHRUN FILM · 00:11'
              : page === 'photo'
                ? 'OHRUN SPORTS · PHOTO EDIT'
                : 'BMW CAMPAIGN · 3 CARDS'}
          </small>
        </header>
        {page === 'video' ? (
          <VideoEditor active={active} reduced={reduced} />
        ) : page === 'photo' ? (
          <PhotoRetouch />
        ) : (
          <CardComposition />
        )}
      </div>
    </section>
  );
}
