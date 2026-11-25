/* oxlint-disable next/no-img-element -- The artwork uses an existing small WebP preview. */
import images from '@/lib/work-images.generated.json';
import type { OfferingId } from '@/lib/services-content';
import './service-card-preview.css';

const briefSteps = ['브랜드 방향', '핵심 메시지', '채널 선택', '실행 계획'];
const chartHeights = [30, 45, 39, 60, 70, 87];
const calendarDays = Array.from({ length: 21 }, (_, index) => index + 1);

function StrategyPreview() {
  return <div className="service-preview-panel service-preview-brief">
    <span className="service-preview-title">캠페인 기획안</span>
    <ul className="service-preview-checklist">
      {briefSteps.map(step => <li key={step}><i />{step}</li>)}
    </ul>
  </div>;
}

function CreativePreview() {
  const frame = images.ohrun[0];

  return <div className="service-preview-panel service-preview-film">
    <div className="service-preview-film-frame">
      <img src={frame.src} width={frame.width} height={frame.height} alt="" decoding="async" />
      <span className="service-preview-play" />
    </div>
    <span className="service-preview-title">브랜드 필름</span>
    <div className="service-preview-film-timeline"><i /><i /><i /></div>
  </div>;
}

function PerformancePreview() {
  return <div className="service-preview-panel service-preview-report">
    <span className="service-preview-title">캠페인 리포트</span>
    <div className="service-preview-chart">
      {chartHeights.map(height => <i key={height} style={{ height: `${height}%` }} />)}
    </div>
    <div className="service-preview-report-tags"><span>유입</span><span>전환</span></div>
  </div>;
}

function SocialPreview() {
  return <>
    <div className="service-preview-panel service-preview-calendar">
      <span className="service-preview-title">콘텐츠 캘린더</span>
      <div className="service-preview-days">
        {calendarDays.map(day => <span key={day}>{day}</span>)}
      </div>
    </div>
    <span className="service-preview-publish">게시 예정</span>
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
    <div className="service-preview-art"><Preview /></div>
  </div>;
}
