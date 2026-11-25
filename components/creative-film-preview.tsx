'use client';

import { useEffect, useRef } from 'react';
import serviceMedia from '@/lib/service-media.generated.json';

export function CreativeFilmPreview() {
  const film = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = film.current;
    const link = video?.closest('a');
    if (!video || !link) return;

    const motion = window.matchMedia('(hover: hover) and (prefers-reduced-motion: no-preference)');
    let active = false;
    const sync = () => {
      const showFilm = motion.matches && !document.hidden && link.matches(':hover, :focus-visible');
      if (active === showFilm) return;
      active = showFilm;
      if (showFilm) {
        video.currentTime = 0;
        void video.play().catch(() => { /* The poster remains visible when playback is unavailable. */ });
      } else {
        video.pause();
      }
    };

    const events = ['pointerenter', 'pointerleave', 'focus', 'blur'] as const;
    events.forEach(event => link.addEventListener(event, sync));
    motion.addEventListener('change', sync);
    document.addEventListener('visibilitychange', sync);
    sync();
    return () => {
      events.forEach(event => link.removeEventListener(event, sync));
      motion.removeEventListener('change', sync);
      document.removeEventListener('visibilitychange', sync);
      video.pause();
    };
  }, []);

  return <video
    ref={film}
    className="film-delivery"
    src={serviceMedia.video.src.replace('/assets/service-media/', '/api/scroll-video/')}
    poster="/ohrun-frame-03.webp"
    preload="none"
    playsInline
    muted
    disablePictureInPicture
    onPlaying={event => { event.currentTarget.dataset.playing = 'true'; }}
    onPause={event => { delete event.currentTarget.dataset.playing; }}
    onEnded={event => { delete event.currentTarget.dataset.playing; }}
    onError={event => { delete event.currentTarget.dataset.playing; }}
  >
    <track kind="captions" src="/ohrun-captions.vtt" srcLang="ko" label="장면 설명" />
  </video>;
}
