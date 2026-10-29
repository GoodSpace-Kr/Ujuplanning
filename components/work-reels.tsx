/* oxlint-disable jsx-a11y/media-has-caption -- The original client reels include Korean subtitles burned into the video. */
'use client';

import { useState } from 'react';
import { ArrowUpRight, Play } from 'lucide-react';
import selected from '@/lib/project-media.generated.json';
import { PortfolioImage } from './project-artwork';

export function WorkReels() {
  const [active, setActive] = useState<string | null>(null);
  const [failed, setFailed] = useState<string | null>(null);

  return <div className="work-reels">
    {selected.reels.map(reel => <figure className="work-reel" key={reel.id}>
      <div className="work-reel-screen">
        {active === reel.id && failed !== reel.id ? <video
          controls autoPlay playsInline preload="none"
          src={`/api/scroll-video/${reel.video.src.split('/').pop()}`}
          poster={reel.poster[1].src} aria-label={reel.title}
          onError={() => setFailed(reel.id)}
        /> : <button className="work-reel-play" type="button" onClick={() => { setFailed(null); setActive(reel.id); }} aria-label={`${reel.title} 영상 재생`}>
          <PortfolioImage variants={reel.poster} alt={reel.title} sizes="(max-width: 600px) 85vw, 400px" />
          <span><Play size={22} fill="currentColor" strokeWidth={0} aria-hidden="true" />영상 보기</span>
        </button>}
      </div>
      <figcaption>
        <div><p>{reel.title}</p><time dateTime={reel.date.replaceAll('.', '-')}>{reel.date}</time></div>
        <a href={reel.url} target="_blank" rel="noopener noreferrer" aria-label={`${reel.title} 인스타그램 원문 보기 (새 탭)`}><ArrowUpRight size={21} aria-hidden="true" /></a>
      </figcaption>
      {failed === reel.id && <p className="work-reel-error">영상을 불러오지 못했어요. <a href={reel.url} target="_blank" rel="noopener noreferrer">인스타그램에서 보기</a></p>}
    </figure>)}
  </div>;
}
