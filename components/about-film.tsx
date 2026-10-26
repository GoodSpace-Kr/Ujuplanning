'use client';

import { useEffect, useRef, useState } from 'react';
import { Play } from 'lucide-react';
import { companyFilm } from '@/lib/about-content';

export function AboutFilm() {
  const [playing, setPlaying] = useState(false);
  const [thumbnailFailed, setThumbnailFailed] = useState(false);
  const player = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (playing) player.current?.focus({ preventScroll: true });
  }, [playing]);

  return <div className="about-film-player">
    {playing ? <iframe
      ref={player}
      src={`https://www.youtube-nocookie.com/embed/${companyFilm.id}?autoplay=1&rel=0&playsinline=1`}
      title={companyFilm.title}
      allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
      allowFullScreen
      referrerPolicy="strict-origin-when-cross-origin"
      tabIndex={0}
    /> : <button className="about-film-cover" onClick={() => setPlaying(true)} aria-label={`${companyFilm.title} 재생`}>
      {!thumbnailFailed && <img src={companyFilm.thumbnail} alt="" width="1280" height="720" loading="lazy" decoding="async" onError={() => setThumbnailFailed(true)} />}
      {thumbnailFailed && <span className="about-film-fallback">UJU PLANNING<br /><span>브랜드의 성장 여정</span></span>}
      <span className="about-film-play"><Play size={24} fill="currentColor" aria-hidden="true" /></span>
      <span className="about-film-cover-label">우주기획의 이야기 재생 <span aria-hidden="true">↗</span></span>
    </button>}
  </div>;
}
