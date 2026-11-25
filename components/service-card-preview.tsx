/* oxlint-disable next/no-img-element -- The artwork uses an existing small WebP preview. */
import {
  ArrowDown, CalendarDays, Check, Compass, Flag, Image as Photo, Layers,
  MessageCircle, Play, ScanLine, TrendingUp, Video,
} from 'lucide-react';
import images from '@/lib/work-images.generated.json';
import type { OfferingId } from '@/lib/services-content';
import './service-card-preview.css';

const briefSteps = [
  { label: '브랜드 방향', icon: Compass, tone: 'blue' },
  { label: '핵심 메시지', icon: MessageCircle, tone: 'violet' },
  { label: '채널 선택', icon: Layers, tone: 'teal' },
  { label: '실행 계획', icon: Flag, tone: 'apricot' },
] as const;

const weeks = [
  { visits: 48, conversions: 25 },
  { visits: 64, conversions: 39 },
  { visits: 74, conversions: 46 },
  { visits: 95, conversions: 63 },
];
const weekdays = ['월', '화', '수', '목', '금', '토', '일'];

function StrategyPreview() {
  return <>
    <span className="service-preview-title">캠페인 기획안 <Check /></span>
    <ul className="service-preview-checklist">
      {briefSteps.map(({ label, icon: Icon, tone }) => (
        <li key={label}><span className={`service-preview-icon icon-${tone}`}><Icon /></span>{label}</li>
      ))}
    </ul>
  </>;
}

function CreativePreview() {
  const frame = images.ohrun[0];

  return <>
    <span className="service-preview-title">브랜드 필름 <ScanLine /></span>
    <div className="service-preview-film-frame">
      <img src={frame.src} width={frame.width} height={frame.height} alt="" decoding="async" />
      <span className="service-preview-play"><Play /></span>
    </div>
    <div className="service-preview-film-track">
      <span>오륜스포츠</span>
      <div className="service-preview-film-timeline"><i /><i /><i /></div>
    </div>
  </>;
}

function PerformancePreview() {
  return <>
    <span className="service-preview-title">캠페인 리포트 <TrendingUp /></span>
    <div className="service-preview-chart">
      {weeks.map(({ visits, conversions }, index) => (
        <div className="service-preview-week" key={index}>
          <div className="service-preview-bars">
            <i style={{ height: `${visits}%` }} /><i style={{ height: `${conversions}%` }} />
          </div>
          <span>{index + 1}주</span>
        </div>
      ))}
    </div>
    <div className="service-preview-legend"><span>유입</span><span>전환</span></div>
  </>;
}

function SocialPreview() {
  return <>
    <span className="service-preview-title">콘텐츠 캘린더 <CalendarDays /></span>
    <div className="service-preview-weekdays">
      {weekdays.map((day, index) => <span key={day}>{day}<b>{index + 12}</b></span>)}
    </div>
    <ul className="service-preview-agenda">
      <li><span className="service-preview-icon icon-apricot"><Photo /></span>브랜드 소식 <small>피드</small></li>
      <li><span className="service-preview-icon icon-violet"><Video /></span>현장 스케치 <small>릴스</small></li>
    </ul>
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
