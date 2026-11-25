/* oxlint-disable next/no-img-element -- The artwork uses an existing small WebP preview. */
import {
  ArrowDown, Flag, Image as Photo, Layers, MessageCircle, Users,
} from 'lucide-react';
import { CreativeFilmPreview } from '@/components/creative-film-preview';
import serviceMedia from '@/lib/service-media.generated.json';
import type { OfferingId } from '@/lib/services-content';
import './service-card-preview.css';

const strategyFindings = [
  { label: '추천 전략', result: '러닝 체험단', icon: Flag },
  { label: '고객', result: '입문 러너', icon: Users },
  { label: '채널', result: '인스타그램 릴스', icon: Layers },
  { label: '핵심 메시지', result: '첫 러닝을 가볍게', icon: MessageCircle },
] as const;

const weekdays = ['월', '화', '수', '목', '금', '토', '일'];
const conversionTrend = 'M12 64 C38 64 48 44 74 44 S110 36 136 36 S170 12 198 12';

function StrategyPreview() {
  return <>
    <div className="strategy-analysis-heading">
      <span className="strategy-analysis-loading">브랜드 분석 중<span className="strategy-analysis-dots">···</span></span>
      <span className="strategy-analysis-result" id="strategy-preview-result">
        분석 완료 <span className="sr-only">러닝 캠페인 예시</span>
      </span>
    </div>
    <ul className="service-preview-checklist" id="strategy-preview-findings">
      {strategyFindings.map(({ label, result, icon: Icon }, index) => (
        <li key={label}>
          <div className="strategy-analysis-finding">
            <Icon aria-hidden="true" />
            <span className="sr-only">{label} </span>
            {index === 0 ? <><strong>{result}</strong><small aria-hidden="true">추천</small></> : <span>{result}</span>}
          </div>
        </li>
      ))}
    </ul>
  </>;
}

function CreativePreview() {
  return <>
    <div className="film-status">
      <span className="film-editing">컷 편집 중</span>
      <span className="film-finished">편집 완료</span>
    </div>
    <div className="service-preview-film-frame">
      <img src="/ohrun-frame-03.webp" width="1280" height="720" alt="" decoding="async" />
      <CreativeFilmPreview />
      <div className="film-rough-cut film-editing">
        <img src="/ohrun-frame-01.webp" width="1280" height="720" alt="" decoding="async" />
        <img src="/ohrun-frame-02.webp" width="1280" height="720" alt="" decoding="async" />
      </div>
    </div>
    <div className="film-footer">
      <div className="film-editing film-timeline"><i /><i /><i /></div>
      <span className="film-finished" id="creative-preview-result">오륜스포츠 브랜드 필름</span>
    </div>
  </>;
}

function PreviewStatus({ pending, complete }: { pending: string; complete: string }) {
  return <div className="preview-status preview-layers">
    <span className="preview-pending">{pending}</span>
    <span className="preview-complete">{complete}</span>
  </div>;
}

function PerformancePreview() {
  return <>
    <PreviewStatus pending="성과 집계 중" complete="성과 리포트 · 예시" />
    <div className="performance-plot">
      <svg viewBox="0 0 210 82" aria-hidden="true">
        <defs>
          <linearGradient id="conversion-area" x1="0" y1="0" x2="0" y2="1" gradientUnits="objectBoundingBox">
            <stop stopColor="#80b4e4" stopOpacity=".30" />
            <stop offset="1" stopColor="#80b4e4" stopOpacity=".02" />
          </linearGradient>
        </defs>
        <path d="M12 20H198 M12 47H198 M12 74H198" stroke="#d9e5ef" strokeDasharray="2 4" fill="none" />
        <path d={`${conversionTrend} V74 H12 Z`} fill="url(#conversion-area)" />
        <path d={conversionTrend} fill="none" stroke="#abc6de" strokeWidth="2.5" />
        <path className="performance-trace" d={conversionTrend} pathLength="1" fill="none" stroke="#437eb7" strokeLinecap="round" strokeWidth="2.5" />
        <g className="preview-complete">
          <circle cx="198" cy="12" r="8" fill="#dbeafa" />
          <circle cx="198" cy="12" r="3.5" fill="#346da5" />
        </g>
      </svg>
      <div className="performance-axis"><span>1주</span><span>2주</span><span>3주</span><span>4주</span></div>
    </div>
    <div className="preview-summary preview-layers">
      <span className="preview-pending">주간 전환 추이</span>
      <span className="preview-complete" id="performance-preview-result"><span className="sr-only">주간 성과 예시. </span>4주차 전환 최다</span>
    </div>
  </>;
}

function SocialPreview() {
  return <>
    <PreviewStatus pending="피드 발행 준비 중" complete="피드 발행 완료" />
    <div className="social-publish-stage preview-layers">
      <div className="social-planner preview-pending">
        <div className="social-week">{weekdays.map(day => <span key={day}>{day}</span>)}</div>
        <div className="social-slot"><Photo />캠페인 피드</div>
        <div className="social-slot"><MessageCircle />브랜드 소식</div>
      </div>
      <img className="social-published preview-complete" src={serviceMedia.images['mini-campaign-grid.png']}
        width="1620" height="1076" alt="" decoding="async" />
    </div>
    <div className="preview-summary" id="social-preview-result">MINI 캠페인 피드</div>
  </>;
}

const previews = {
  strategy: StrategyPreview,
  creative: CreativePreview,
  performance: PerformancePreview,
  social: SocialPreview,
};

export function ServiceCardPreview({ id }: { id: OfferingId }) {
  const Preview = previews[id];

  return <div className={`service-preview service-preview-${id}`} aria-hidden="true">
    <div className="service-preview-art">
      <div className="service-preview-panel"><Preview /></div>
    </div>
    <span className="service-preview-arrow"><ArrowDown /></span>
  </div>;
}
