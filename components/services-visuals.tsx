/* oxlint-disable next/no-img-element -- These WebP assets are already resized, compressed and served with responsive sources from Cloudflare. */
import { ArrowDown, ArrowRight, Check, CirclePlay, Compass, Image as ImageIcon, MessageCircle, MousePointer2, RefreshCw, Search, Target } from 'lucide-react';
import images from '@/lib/work-images.generated.json';
import media from '@/lib/service-media.generated.json';
import type { OfferingId } from '@/lib/services-content';

function WorkImage({ id, alt }: { id: keyof typeof images; alt: string }) {
  const [small, large] = images[id];
  return <img src={large.src} srcSet={`${small.src} ${small.width}w, ${large.src} ${large.width}w`} sizes="(max-width: 760px) 80vw, 550px" width={large.width} height={large.height} alt={alt} loading="lazy" decoding="async" />;
}

export function ServicesVisual({ id }: { id: OfferingId }) {
  if (id === 'strategy') return <figure className="offering-visual offering-visual-strategy" aria-label="관찰에서 방향과 메시지로 이어지는 브랜드 전략 구성도">
    <div className="offering-strategy-stage" aria-hidden="true">
      <div className="offering-research-note"><Search size={16} /><span>브랜드 · 시장 · 고객</span><div className="offering-note-lines"><i /><i /><i /></div></div>
      <div className="offering-strategy-sheet">
        <div className="offering-sheet-top"><span>UJU PLANNING</span><span>STRATEGY NOTE</span></div>
        <span className="offering-sheet-kicker">브랜드의 방향을 찾는 일</span>
        <strong>무엇을,<br />누구에게,<br /><em>어떻게 전할까.</em></strong>
        <div className="offering-sheet-rule" />
        <div className="offering-sheet-row"><span>01</span><span>관찰</span><small>브랜드와 고객 이해</small></div>
        <div className="offering-sheet-row"><span>02</span><span>방향</span><small>가능성과 목표 정리</small></div>
        <div className="offering-sheet-row"><span>03</span><span>메시지</span><small>선택받을 이유 설계</small></div>
        <div className="offering-sheet-bottom"><span>FROM INSIGHT TO DIRECTION</span><Compass size={23} strokeWidth={1.2} /></div>
      </div>
      <div className="offering-strategy-tag"><Check size={14} /> 하나의 명확한 방향</div>
    </div>
    <figcaption><span>BRAND & MARKETING STRATEGY</span><span>방향을 설계하는 과정</span></figcaption>
  </figure>;

  if (id === 'creative') return <figure className="offering-visual offering-visual-creative">
    <div className="offering-creative-stage">
      <div className="offering-film-frame"><WorkImage id="ohrun" alt="오륜스포츠 광고 영상의 달리는 아이 장면" /><span aria-hidden="true"><CirclePlay size={16} /> BRAND FILM</span></div>
      <div className="offering-creative-bottom"><div className="offering-photo-frame"><WorkImage id="ocean" alt="오션더힐 공간을 담은 콘텐츠 제작 이미지" /><span aria-hidden="true">SHORT-FORM</span></div>
        <div className="offering-creative-note"><ImageIcon size={22} strokeWidth={1.3} aria-hidden="true" /><p>하나의 메시지,<br />다양한 표현.</p><span>FILM · PHOTO · DESIGN</span></div>
      </div>
    </div>
    <figcaption><span>FILM, PHOTO & CONTENTS</span><span>오륜스포츠 · 오션더힐 제작 이미지</span></figcaption>
  </figure>;

  if (id === 'performance') return <figure className="offering-visual offering-visual-performance" aria-label="목표와 매체를 설정하고 소재와 운영을 개선하는 광고 운영 흐름">
    <div className="offering-performance-stage" aria-hidden="true">
      <div className="offering-campaign-sheet">
        <div className="offering-campaign-header"><div><span>CAMPAIGN PLANNING</span><strong>광고의 다음 행동을 설계합니다.</strong></div><Target size={26} strokeWidth={1.3} /></div>
        <div className="offering-campaign-goal"><span>시작은 목표부터</span><div><span>인지</span><ArrowRight size={13} /><span>유입</span><ArrowRight size={13} /><span>전환</span></div></div>
        <div className="offering-platforms"><span>네이버</span><span>Google</span><span>Meta</span></div>
        <ArrowDown className="offering-flow-arrow" size={19} strokeWidth={1.4} />
        <div className="offering-campaign-actions"><div><MousePointer2 size={19} strokeWidth={1.5} /><strong>고객의 행동</strong><span>어디에서 반응하는가</span></div><div><RefreshCw size={19} strokeWidth={1.5} /><strong>다음 실행</strong><span>무엇을 개선할 것인가</span></div></div>
        <div className="offering-campaign-foot"><span>소재 기획</span><i /><span>광고 운영</span><i /><span>분석과 개선</span></div>
      </div>
    </div>
    <figcaption><span>DIGITAL PERFORMANCE</span><span>캠페인 운영 흐름</span></figcaption>
  </figure>;

  return <figure className="offering-visual offering-visual-social">
    <div className="offering-social-stage">
      <div className="offering-social-planner" aria-hidden="true"><span>CONTENT PLAN</span><strong>브랜드의 이야기가<br />꾸준히 이어지도록.</strong><div><span>기획 <Check size={12} /></span><span>제작 <Check size={12} /></span><span>발행 <ArrowRight size={12} /></span></div></div>
      <div className="offering-social-feed"><img src={media.images['mini-campaign-grid.png']} width="1620" height="1076" alt="BMW · MINI 바바리안모터스의 MINI 채널 콘텐츠 모음" loading="lazy" decoding="async" /><div aria-hidden="true"><span>ONE BRAND. MANY STORIES.</span><MessageCircle size={16} /></div></div>
      <div className="offering-social-chip" aria-hidden="true"><span /> 콘텐츠에서 관계로</div>
    </div>
    <figcaption><span>SOCIAL & VIRAL MARKETING</span><span>BMW · MINI 채널 콘텐츠</span></figcaption>
  </figure>;
}
