/* oxlint-disable next/no-html-link-for-pages -- Keep native cross-page hash navigation consistent with the scroll-driven homepage and WORK page. */
import { ArrowDown, ArrowRight, ArrowUpRight, Compass, Film, MessagesSquare, Target } from 'lucide-react';
import { SiteFooter } from '@/components/site-footer';
import { ServicesNavigation } from '@/components/services-navigation';
import { ServicesVisual } from '@/components/services-visuals';
import { serviceOfferings } from '@/lib/services-content';
import './services.css';

export const metadata = {
  title: 'SERVICES · 우주기획',
  description: '브랜드 전략부터 영상·사진·콘텐츠 제작, 디지털 퍼포먼스, SNS·바이럴 마케팅까지. 우주기획은 브랜드에 필요한 전략과 실행을 하나의 방향으로 연결합니다.',
};

const icons = [Compass, Film, Target, MessagesSquare];

export default function ServicesPage() {
  return <>
    <div className="offering-page">
      <section className="offering-hero offering-container" aria-labelledby="offering-heading">
        <p className="offering-eyebrow">SERVICES</p>
        <div className="offering-hero-heading">
          <h1 id="offering-heading">전략부터 실행까지,<br /><span className="offering-gradient">하나의 방향으로.</span></h1>
          <div className="offering-hero-intro"><p>방향을 정하고, 콘텐츠를 만들고,<br />고객에게 전하고, 관계를 이어갑니다.<br />브랜드의 다음 걸음에 필요한 네 가지 연결.</p><a className="offering-text-link" href="#strategy">서비스 둘러보기 <ArrowDown size={17} aria-hidden="true" /></a></div>
        </div>
        <div className="offering-overview" aria-label="네 가지 서비스">
          {serviceOfferings.map((service, index) => {
            const Icon = icons[index];
            return <a className={`offering-overview-card offering-overview-${service.id}`} key={service.id} href={`#${service.id}`}>
              <div className="offering-overview-top"><span>{service.number} / {service.word}</span><ArrowUpRight size={17} aria-hidden="true" /></div>
              <div className="offering-overview-icon"><Icon size={43} strokeWidth={1.15} aria-hidden="true" /></div>
              <h2>{service.label}</h2><p>{service.short}</p>
            </a>;
          })}
        </div>
        <div className="offering-hero-footnote"><span>각자의 역할을, 하나의 브랜드 경험으로.</span><span>STRATEGY → CREATIVE → PERFORMANCE → SOCIAL</span></div>
      </section>

      <ServicesNavigation />
      <div className="offering-details">
        {serviceOfferings.map(service => <section className={`offering-detail offering-detail-${service.id}`} id={service.id} key={service.id} aria-labelledby={`${service.id}-heading`}>
          <div className="offering-container offering-detail-grid">
            <div className="offering-copy">
              <p className="offering-category"><span>{service.number}</span>{service.label}</p>
              <h2 id={`${service.id}-heading`}>{service.headline}</h2>
              <p className="offering-introduction">{service.introduction}</p>
              <dl className="offering-scope">{service.scopes.map(scope => <div key={scope.title}><dt>{scope.title}</dt><dd>{scope.description}</dd></div>)}</dl>
              <a className="offering-text-link" href={service.link.href}>{service.link.label}<ArrowUpRight size={17} aria-hidden="true" /></a>
            </div>
            <ServicesVisual id={service.id} />
          </div>
        </section>)}
      </div>

      <section className="offering-connection offering-container" aria-labelledby="connection-heading">
        <div><p className="offering-eyebrow">CONNECTED BY UJU</p><h2 id="connection-heading">필요한 부분부터,<br /><span className="offering-gradient">함께 연결합니다.</span></h2></div>
        <div className="offering-connection-copy"><p>브랜드의 상황마다 필요한 시작점은 다릅니다.<br />처음부터 방향을 정하는 일도, 이미 정해진 전략을<br className="offering-desktop-break" /> 콘텐츠와 광고로 옮기는 일도 함께할 수 있습니다.</p><p>지금의 고민과 목표를 들려주세요.<br />어떤 서비스를 어떻게 연결할지 함께 정리하겠습니다.</p><a className="offering-text-link" href="/about">우주기획이 일하는 방식 <ArrowUpRight size={17} aria-hidden="true" /></a></div>
      </section>

      <section className="offering-next" aria-labelledby="offering-next-heading"><div className="offering-container">
        <p className="offering-eyebrow">YOUR NEXT STEP</p><h2 id="offering-next-heading">어디서 시작할지 고민이라면,<br /><span className="offering-gradient">이야기부터 시작해요.</span></h2>
        <p>구체적인 기획서가 없어도 괜찮습니다.<br />브랜드의 고민을 듣고, 필요한 다음 단계를 함께 찾겠습니다.</p>
        <a className="offering-contact-link" href="/#contact">프로젝트 문의하기 <ArrowRight size={19} aria-hidden="true" /></a>
      </div></section>
    </div>
    <SiteFooter showInquiry={false} />
  </>;
}
