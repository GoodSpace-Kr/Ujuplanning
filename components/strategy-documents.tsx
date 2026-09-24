'use client';

import { ChartNoAxesColumnIncreasing, CalendarDays, Target } from 'lucide-react';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { createStrategySample, INITIAL_STRATEGY_SAMPLE, interpolateStrategySample, type StrategySample } from './strategy-demo-data';
import './strategy-documents.css';

export const STRATEGY_PAGES = [
  { id: 'analysis', title: '브랜드 분석', icon: ChartNoAxesColumnIncreasing, number: '01' },
  { id: 'marketing', title: '마케팅 전략', icon: Target, number: '02' },
  { id: 'campaign', title: '캠페인 실행 계획', icon: CalendarDays, number: '03' },
] as const;

export type StrategyPageId = (typeof STRATEGY_PAGES)[number]['id'];

type Metric = { label: string; value: string; unit: string };

function metricsFor(sample: StrategySample): Record<StrategyPageId, Metric[]> {
  return {
  analysis: [
    { label: '분석 브랜드', value: String(sample.brands), unit: '개' },
    { label: '고객 세그먼트', value: String(sample.segments), unit: '그룹' },
    { label: '브랜드 적합도', value: String(sample.affinity), unit: '/ 100' },
  ],
  marketing: [
    { label: '핵심 목표', value: String(sample.goals), unit: '개' },
    { label: '우선 채널', value: '3', unit: '개' },
    { label: '예산 배분', value: '100', unit: '%' },
  ],
  campaign: [
    { label: '캠페인 기간', value: '4', unit: '주' },
    { label: '콘텐츠 계획', value: String(sample.contentTotal), unit: '건' },
    { label: '운영 채널', value: '3', unit: '개' },
  ],
  };
}

const SCORE_LABELS = ['인지도', '선호도', '재구매', '추천'];

const CHANNELS = [
  { label: '검색', goal: '신규 유입', tone: 'blue' },
  { label: '콘텐츠', goal: '브랜드 이해', tone: 'teal' },
  { label: 'SNS', goal: '고객 관계', tone: 'gray' },
];

function BrandAnalysis({ sample }: { sample: StrategySample }) {
  return (
    <>
      <section className="strategy-report-section" aria-labelledby="strategy-brand-chart-title">
        <div className="strategy-report-section-heading">
          <h5 id="strategy-brand-chart-title">브랜드 경쟁력</h5>
          <span>100점 기준</span>
        </div>
        <div className="strategy-chart-legend" aria-hidden="true">
          <span><i className="strategy-color-gray" />시장 평균</span>
          <span><i className="strategy-color-blue" />브랜드</span>
        </div>
        <div className="strategy-score-chart">
          <div className="strategy-score-axis" aria-hidden="true"><span>100</span><span>50</span><span>0</span></div>
          {sample.scores.map(({ market, brand }, index) => {
            const label = SCORE_LABELS[index];
            return (
            <figure className="strategy-score-group" key={label} aria-label={`${label}: 시장 평균 ${market}점, 브랜드 ${brand}점`}>
              <div className="strategy-score-columns" aria-hidden="true">
                <div className="strategy-score-bar strategy-color-gray" style={{ height: `${market}%`, '--bar-delay': `${index * 65}ms` } as CSSProperties} />
                <div className="strategy-score-bar strategy-color-blue" style={{ height: `${brand}%`, '--bar-delay': `${index * 65 + 80}ms` } as CSSProperties}><b>{brand}</b></div>
              </div>
              <figcaption aria-hidden="true">{label}</figcaption>
            </figure>
          ); })}
        </div>
      </section>
      <div className="strategy-report-summary"><span>추천 지표</span><strong>추천 의향</strong><span className="strategy-positive">시장 대비 +{sample.scores[3].brand - sample.scores[3].market}p</span></div>
    </>
  );
}

function MarketingStrategy({ sample }: { sample: StrategySample }) {
  return (
    <>
      <section className="strategy-report-section" aria-labelledby="strategy-allocation-title">
        <div className="strategy-report-section-heading"><h5 id="strategy-allocation-title">채널별 예산 배분</h5><span>합계 100%</span></div>
        <div className="strategy-allocation-bar" aria-hidden="true">
          {CHANNELS.map(({ label, tone }, index) => (
            <div key={label} className={`strategy-color-${tone}`} style={{ flex: sample.shares[index] }}><b>{sample.shares[index]}%</b></div>
          ))}
        </div>
        <table className="strategy-allocation-table">
          <thead><tr><th scope="col">채널</th><th scope="col">목표</th><th scope="col">비중</th></tr></thead>
          <tbody>
            {CHANNELS.map(({ label, goal, tone }, index) => (
              <tr key={label}><th scope="row"><i className={`strategy-color-${tone}`} />{label}</th><td>{goal}</td><td>{sample.shares[index]}%</td></tr>
            ))}
          </tbody>
        </table>
      </section>
      <div className="strategy-report-summary"><span>핵심 흐름</span><strong>인지 → 관심 → 전환</strong></div>
    </>
  );
}

function CampaignPlan({ sample }: { sample: StrategySample }) {
  const progress = Math.round(sample.contentDone / sample.contentTotal * 100);
  const stages = [
    { label: '기획', start: 0, span: 1, tone: 'gray', progress: 100, status: '완료' },
    { label: '제작', start: 1, span: 2, tone: 'blue', progress, status: `${progress}%` },
    { label: '송출', start: 2, span: 2, tone: 'teal', progress: 0, status: '예정' },
  ];
  return (
    <>
      <section className="strategy-report-section" aria-labelledby="strategy-schedule-title">
        <div className="strategy-report-section-heading"><h5 id="strategy-schedule-title">실행 타임라인</h5><span>4주 계획</span></div>
        <div className="strategy-schedule">
          <div className="strategy-schedule-header"><span>단계</span>{[1, 2, 3, 4].map((week) => <span key={week}>W{week}</span>)}</div>
          {stages.map(({ label, start, span, tone, status, progress: stageProgress }) => (
            <div className="strategy-schedule-row" key={label}>
              <strong>{label}</strong>
              <figure className="strategy-schedule-track" aria-label={`${label}: ${start + 1}주차부터 ${start + span}주차, ${status}`}>
                <span className={`strategy-color-${tone}`} style={{ gridColumn: `${start + 1} / span ${span}` }} aria-hidden="true"><i style={{ transform: `scaleX(${stageProgress / 100})` }} /><b>{status}</b></span>
              </figure>
            </div>
          ))}
        </div>
      </section>
      <div className="strategy-report-summary strategy-progress-summary">
        <span>제작 진행률</span><strong>{sample.contentDone} / {sample.contentTotal}건</strong>
        <progress className="strategy-progress-track" aria-label="콘텐츠 제작 진행률" max={sample.contentTotal} value={sample.contentDone} />
        <span className="strategy-positive">{progress}%</span>
      </div>
    </>
  );
}

export function StrategyDocuments({ page, panelId, running }: { page: StrategyPageId; panelId: string; running: boolean }) {
  const [sample, setSample] = useState(INITIAL_STRATEGY_SAMPLE);
  const currentSample = useRef(sample);
  useEffect(() => {
    if (!running) return;
    let frame = 0;
    let timer = 0;
    const refresh = () => {
      const from = currentSample.current;
      const to = createStrategySample();
      const start = performance.now();
      let previous = 0;
      const animate = (now: number) => {
        const progress = Math.min((now - start) / 800, 1);
        if (now - previous >= 32 || progress === 1) {
          const next = interpolateStrategySample(from, to, progress * progress * (3 - 2 * progress));
          currentSample.current = next;
          setSample(next);
          previous = now;
        }
        if (progress < 1) frame = window.requestAnimationFrame(animate);
        else timer = window.setTimeout(refresh, 800);
      };
      frame = window.requestAnimationFrame(animate);
    };
    timer = window.setTimeout(refresh, 300);
    return () => { window.clearTimeout(timer); window.cancelAnimationFrame(frame); };
  }, [page, running]);
  const currentPage = STRATEGY_PAGES.find((item) => item.id === page)!;
  const Icon = currentPage.icon;
  return (
    <section className="strategy-report" id={panelId} aria-label={currentPage.title} data-running={running}>
      <div className="strategy-report-content" key={page}>
        <header className="strategy-report-header">
          <div><Icon aria-hidden="true" /><h4>{currentPage.title}</h4></div>
          <small>예시 데이터</small>
        </header>
        <dl className="strategy-metrics">
          {metricsFor(sample)[page].map(({ label, value, unit }, index) => (
            <div key={label} style={{ '--metric-delay': `${index * 70}ms` } as CSSProperties}>
              <dt>{label}</dt><dd>{value}<small>{unit}</small></dd>
            </div>
          ))}
        </dl>
        {page === 'analysis' ? <BrandAnalysis sample={sample} /> : page === 'marketing' ? <MarketingStrategy sample={sample} /> : <CampaignPlan sample={sample} />}
      </div>
    </section>
  );
}
