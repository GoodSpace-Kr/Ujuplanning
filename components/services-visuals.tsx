/* oxlint-disable next/no-img-element -- These WebP assets are already resized, compressed and served with responsive sources from Cloudflare. */
import { CirclePlay, MessageCircle } from 'lucide-react';
import images from '@/lib/work-images.generated.json';
import media from '@/lib/service-media.generated.json';
import photos from '@/lib/service-photos.generated.json';
import type { OfferingId } from '@/lib/services-content';

const imageSizes = '(max-width: 554px) calc(100vw - 44px), (max-width: 760px) 510px, (max-width: 1100px) 45vw, (max-width: 1364px) 43vw, 584px';

function WorkImage({ id, alt }: { id: keyof typeof images; alt: string }) {
  const [small, large] = images[id];
  return <img src={large.src} srcSet={`${small.src} ${small.width}w, ${large.src} ${large.width}w`} sizes={imageSizes} width={large.width} height={large.height} alt={alt} loading="lazy" decoding="async" />;
}

export function ServicesVisual({ id }: { id: OfferingId }) {
  if (id === 'strategy' || id === 'performance') {
    const [small, large] = photos[id];
    return <figure className={`offering-visual offering-visual-${id} offering-photo`}>
      <img
        src={large.src}
        srcSet={`${small.src} ${small.width}w, ${large.src} ${large.width}w`}
        sizes={imageSizes}
        width={large.width}
        height={large.height}
        alt={id === 'strategy' ? '브랜드 자료와 무드보드를 함께 검토하는 기획 회의 장면' : '데이터 분석 그래프가 표시된 노트북을 촬영한 사진'}
        loading="lazy"
        decoding="async"
      />
    </figure>;
  }

  if (id === 'creative') return <figure className="offering-visual offering-visual-creative offering-film-frame">
    <WorkImage id="ohrun" alt="오륜스포츠 광고 영상의 달리는 아이 장면" />
    <span aria-hidden="true"><CirclePlay size={16} /> BRAND FILM</span>
  </figure>;

  return <figure className="offering-visual offering-visual-social">
    <img src={media.images['mini-campaign-grid.png']} width="1620" height="1076" alt="BMW · MINI 바바리안모터스의 MINI 채널 콘텐츠 모음" loading="lazy" decoding="async" />
    <figcaption aria-hidden="true"><span>ONE BRAND. MANY STORIES.</span><MessageCircle size={16} /></figcaption>
  </figure>;
}
