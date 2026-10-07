'use client';

import { ChartNoAxesColumnIncreasing, CalendarDays, RefreshCw, Target } from 'lucide-react';
import { useState } from 'react';
import { createStrategySample, INITIAL_STRATEGY_SAMPLE, type StrategySample } from './strategy-demo-data';
import './strategy-documents.css';

const SCORE_LABELS = ['인지도', '선호도', '재구매', '추천'];

const CHANNELS = [
  { label: '검색', tone: 'blue' },
  { label: '콘텐츠', tone: 'teal' },
  { label: 'SNS', tone: 'gray' },
];

const AUDIENCES = [
  { label: '신규 탐색', share: 42 },
  { label: '비교 검토', share: 34 },
  { label: '재방문', share: 24 },
];

function BrandAnalysis({ sample }: { sample: StrategySample }) {
  const gaps = sample.scores.map(({ brand, market }) => brand - market);
  const strongestIndex = gaps.indexOf(Math.max(...gaps));
  const weakestIndex = gaps.indexOf(Math.min(...gaps));
  return (
    <>
      <div className="strategy-analysis-grid">
        <section className="strategy-comparison" aria-labelledby="strategy-brand-chart-title">
          <h6 id="strategy-brand-chart-title">브랜드 경쟁력 · 100점 기준</h6>
          <div className="strategy-comparison-head" aria-hidden="true"><span>지표</span><span>시장 평균 / 브랜드</span><span>격차</span></div>
          {sample.scores.map(({ market, brand }, index) => (
            <div className="strategy-comparison-row" key={SCORE_LABELS[index]} aria-label={`${SCORE_LABELS[index]}: 시장 평균 ${market}점, 브랜드 ${brand}점, 격차 ${brand - market}점`}>
              <span>{SCORE_LABELS[index]}</span>
              <span className="strategy-comparison-bars" aria-hidden="true">
                <i className="strategy-comparison-market" style={{ width: `${market}%` }} />
                <i className="strategy-comparison-brand" style={{ width: `${brand}%` }} />
              </span>
              <b>+{brand - market}</b>
            </div>
          ))}
        </section>
        <section className="strategy-audience" aria-labelledby="strategy-audience-title">
          <h6 id="strategy-audience-title">주요 고객군 · 상위 3개</h6>
          {AUDIENCES.map(({ label, share }) => (
            <div className="strategy-audience-row" key={label} aria-label={`${label} ${share}%`}>
              <span>{label}</span><b>{share}%</b>
              <span className="strategy-audience-track" aria-hidden="true"><i style={{ width: `${share}%` }} /></span>
            </div>
          ))}
          <div className="strategy-audience-row" aria-label={`브랜드 적합도 ${sample.affinity}점`}>
            <span>적합도</span><b>{sample.affinity}</b>
            <span className="strategy-audience-track" aria-hidden="true"><i style={{ width: `${sample.affinity}%` }} /></span>
          </div>
        </section>
      </div>
      <div className="strategy-report-summary"><span>진단 포인트</span><strong>{SCORE_LABELS[strongestIndex]} 차별화 · {SCORE_LABELS[weakestIndex]} 개선</strong><span className="strategy-positive">최대 격차 +{gaps[strongestIndex]}p</span></div>
    </>
  );
}

function MarketingStrategy({ sample }: { sample: StrategySample }) {
  return (
    <>
      <section className="strategy-report-section" aria-labelledby="strategy-allocation-title">
        <div className="strategy-report-section-heading"><h5 id="strategy-allocation-title">채널별 예산 배분</h5></div>
        <div className="strategy-allocation-bar" aria-hidden="true">
          {CHANNELS.map(({ label, tone }, index) => (
            <div key={label} className={`strategy-color-${tone}`} style={{ flex: sample.shares[index] }}><b>{sample.shares[index]}%</b></div>
          ))}
        </div>
        <table className="strategy-allocation-table">
          <thead><tr><th scope="col">채널</th><th scope="col">예산</th></tr></thead>
          <tbody>
            {CHANNELS.map(({ label, tone }, index) => (
              <tr key={label}><th scope="row"><i className={`strategy-color-${tone}`} />{label}</th><td>{sample.shares[index]}%</td></tr>
            ))}
          </tbody>
        </table>
      </section>
      <section className="strategy-marketing-funnel" aria-label="고객 여정 단계별 목표">
        <div><span>인지</span><strong>{sample.scores[0].brand}%</strong></div>
        <div><span>관심</span><strong>{Math.round(sample.scores[1].brand * .54)}%</strong></div>
        <div><span>전환</span><strong>{Math.round(sample.scores[2].brand * .22)}%</strong></div>
      </section>
    </>
  );
}

function CampaignPlan({ sample }: { sample: StrategySample }) {
  const progress = Math.round(sample.contentDone / sample.contentTotal * 100);
  const stages = [
    { label: '분석·기획', start: 0, span: 1, tone: 'gray', progress: 100, status: '완료' },
    { label: '콘텐츠 제작', start: 1, span: 2, tone: 'blue', progress, status: `${progress}%` },
    { label: '검수·승인', start: 2, span: 1, tone: 'teal', progress: 50, status: '진행' },
    { label: '광고 송출', start: 2, span: 2, tone: 'blue', progress: 0, status: '예정' },
    { label: '성과 리뷰', start: 3, span: 1, tone: 'gray', progress: 0, status: '예정' },
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
        <span>콘텐츠 제작 현황</span><strong>{sample.contentDone} / {sample.contentTotal}건</strong>
        <progress className="strategy-progress-track" aria-label="콘텐츠 제작 진행률" max={sample.contentTotal} value={sample.contentDone} />
        <span className="strategy-positive">{progress}% 완료</span>
        <div className="strategy-campaign-status-list">
          <div><span>검수 대기</span><b>{Math.min(2, sample.contentTotal - sample.contentDone)}건</b></div>
          <div><span>운영 채널</span><b>3개</b></div>
          <div><span>캠페인 목표</span><b>{sample.goals}개</b></div>
        </div>
      </div>
    </>
  );
}

export function StrategyDocuments({ active }: { active: boolean }) {
  const [sample, setSample] = useState(INITIAL_STRATEGY_SAMPLE);
  const refresh = () => {
    setSample(createStrategySample());
  };
  const metrics = [
    { label: '분석 브랜드', value: sample.brands, unit: '개' },
    { label: '고객 세그먼트', value: sample.segments, unit: '그룹' },
    { label: '브랜드 적합도', value: sample.affinity, unit: '점' },
    { label: '우선 운영 채널', value: 3, unit: '개' },
    { label: '콘텐츠 완료', value: `${sample.contentDone}/${sample.contentTotal}`, unit: '건' },
  ];

  return (
    <section className="strategy-report strategy-dashboard" aria-label="전략기획 통합 대시보드" data-motion={active ? 'playing' : 'idle'}>
      <div className="strategy-dashboard-utility">
        <div className="strategy-dashboard-breadcrumb"><span>UJU PLANNING</span><i />브랜드 성장 설계</div>
        <div className="strategy-dashboard-utility-meta"><span>최근 4주</span><span className="strategy-dashboard-status"><i />데모 데이터</span></div>
      </div>
      <div className="strategy-report-content strategy-dashboard-content">
        <header className="strategy-dashboard-header">
          <div><span className="strategy-dashboard-eyebrow">STRATEGY INTELLIGENCE</span><h4>브랜드 성장 대시보드</h4><p>브랜드 분석부터 마케팅 전략, 캠페인 실행까지 한눈에 확인합니다.</p></div>
          <button type="button" onClick={refresh} aria-label="예시 데이터 새로고침"><RefreshCw aria-hidden="true" />새로고침</button>
        </header>
        <dl className="strategy-dashboard-metrics">
          {metrics.map(({ label, value, unit }) => (
            <div key={label}>
              <dt>{label}</dt><dd>{value}<small>{unit}</small></dd>
            </div>
          ))}
        </dl>
        <div className="strategy-dashboard-grid">
          <article className="strategy-dashboard-card" aria-labelledby="strategy-analysis-heading">
            <header className="strategy-dashboard-card-header"><div><ChartNoAxesColumnIncreasing aria-hidden="true" /><span>01</span><h5 id="strategy-analysis-heading">브랜드 분석</h5></div></header>
            <BrandAnalysis sample={sample} />
          </article>
          <article className="strategy-dashboard-card" aria-labelledby="strategy-marketing-heading">
            <header className="strategy-dashboard-card-header"><div><Target aria-hidden="true" /><span>02</span><h5 id="strategy-marketing-heading">마케팅 전략</h5></div></header>
            <MarketingStrategy sample={sample} />
          </article>
          <article className="strategy-dashboard-card strategy-dashboard-campaign" aria-labelledby="strategy-campaign-heading">
            <header className="strategy-dashboard-card-header"><div><CalendarDays aria-hidden="true" /><span>03</span><h5 id="strategy-campaign-heading">캠페인 실행 계획</h5></div></header>
            <CampaignPlan sample={sample} />
          </article>
        </div>
      </div>
    </section>
  );
}
