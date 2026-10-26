import { ArrowDown, ArrowRight, ArrowUpRight } from 'lucide-react';
import { SiteFooter } from '@/components/site-footer';
import { AboutFilm } from '@/components/about-film';
import { aboutSteps, aboutStrengths, companyFilm } from '@/lib/about-content';
import './about.css';

export const metadata = {
  title: 'ABOUT · 우주기획',
  description: '브랜드의 가능성을 발견하고, 성장의 다음 항로를 만듭니다. 전략부터 콘텐츠, 광고와 고객 경험까지 연결하는 종합광고대행사 우주기획을 소개합니다.',
};

export default function AboutPage() {
  return <>
    <div className="about-page">
      <section className="about-hero about-container" aria-labelledby="about-heading">
        <p className="about-eyebrow">ABOUT UJU</p>
        <div className="about-hero-heading">
          <h1 id="about-heading">당신의 브랜드에는,<br />아직 발견하지 못한<br /><span className="about-gradient">우주가 있습니다.</span></h1>
          <div className="about-hero-intro">
            <p>시장과 고객을 관찰해 브랜드의 가능성을 발견하고,<br className="about-desktop-break" /> 전략부터 콘텐츠, 광고, 행사까지 연결합니다.<br className="about-desktop-break" /> 성장의 다음 항로를 만드는 종합광고대행사,<br className="about-desktop-break" /> 우주기획입니다.</p>
            <a className="about-text-link" href="#our-perspective">우주기획 알아보기 <ArrowDown size={17} aria-hidden="true" /></a>
          </div>
        </div>
        <figure className="about-hero-visual">
          <picture>
            <source media="(max-width: 760px)" srcSet="/assets/studio-sequence/mobile/0000.webp" />
            <img src="/assets/studio-sequence/desktop/0000.webp" width="1920" height="1080" alt="기획자의 시선 너머로 펼쳐진 촬영 현장을 표현한 브랜드 이미지" fetchPriority="high" />
          </picture>
          <figcaption><span>가능성을 보는 시선.<br />현실로 만드는 실행.</span><span>FROM PERSPECTIVE<br />TO POSSIBILITY</span></figcaption>
        </figure>
        <div className="about-hero-footnote"><span>우주기획의 시선을 담은 브랜드 비주얼</span><span>OBSERVE · DISCOVER · CONNECT · EXPAND</span></div>
      </section>

      <section className="about-perspective about-container" id="our-perspective" aria-labelledby="perspective-heading">
        <div className="about-perspective-copy">
          <p className="about-eyebrow">OUR PERSPECTIVE</p>
          <h2 id="perspective-heading">익숙한 브랜드를,<br /><span className="about-gradient">새로운 시선으로.</span></h2>
          <p>모든 브랜드에는 저마다의 우주가 있습니다. 아직 발견하지 못한 고객, 제대로 전달되지 않은 가치, 새로운 성장을 만들어낼 기회가 그 안에 있습니다.</p>
          <p>브랜드 안에서는 익숙함 때문에 보이지 않던 가능성. 우주기획은 시장과 고객을 깊이 관찰하며 그 가능성을 함께 찾아냅니다.</p>
          <p className="about-perspective-note">브랜드가 시장에서 어떻게 보이고,<br />누구에게 어떤 방식으로 선택받아야 하는지부터.</p>
        </div>
        <figure className="about-perspective-visual">
          <img src="/assets/telescope-sequence/desktop/0000.webp" width="1920" height="1080" loading="lazy" decoding="async" alt="망원경 너머의 새로운 가능성을 바라보는 브랜드 비주얼" />
          <figcaption>더 멀리 보기 위해, 더 깊이 들여다봅니다.</figcaption>
        </figure>
      </section>

      <section className="about-strengths" aria-labelledby="strengths-heading">
        <div className="about-container">
          <div className="about-section-heading">
            <div><p className="about-eyebrow">OUR STRENGTHS</p><h2 id="strengths-heading">좋은 방향을 찾고,<br />끝까지 연결하는 힘.</h2></div>
            <p>기획의 의도가 제작과 운영에서도 이어지도록.<br />우주기획은 전략과 실행을 함께 고민합니다.</p>
          </div>
          <div className="about-strength-list">
            {aboutStrengths.map((item, index) => <article className="about-strength" key={item.title}>
              <span className="about-index">0{index + 1}</span>
              <h3>{item.title}</h3><p>{item.description}</p><span className="about-strength-label">{item.label}</span>
            </article>)}
          </div>
          <a className="about-text-link" href="/work">실제로 연결한 프로젝트 보기 <ArrowUpRight size={18} aria-hidden="true" /></a>
        </div>
      </section>

      <section className="about-process about-container" aria-labelledby="process-heading">
        <div className="about-section-heading">
          <div><p className="about-eyebrow">HOW WE WORK</p><h2 id="process-heading">발견에서 확장까지,<br /><span className="about-gradient">우주기획의 4가지 과정.</span></h2></div>
          <p>브랜드를 이해하는 일에서 시작해,<br />더 넓은 시장으로 나아가는 일까지.</p>
        </div>
        <ol className="about-process-list">
          {aboutSteps.map((step, index) => <li className={`about-process-step about-process-${step.word.toLowerCase()}`} key={step.word}>
            <div className="about-process-photo"><img src={step.image} alt={step.alt} width={step.width} height={step.height} loading="lazy" decoding="async" /><span aria-hidden="true">0{index + 1}</span></div>
            <p className="about-process-word">{step.word}<ArrowRight size={17} aria-hidden="true" /></p>
            <h3>{step.title}</h3><p className="about-process-description">{step.description}</p>
          </li>)}
        </ol>
      </section>

      <section className="about-films" id="brand-film" aria-labelledby="film-heading">
        <div className="about-container">
          <div className="about-section-heading">
            <div><p className="about-eyebrow">UJU ON FILM</p><h2 id="film-heading">우주기획의 이야기를,<br />조금 더 가까이.</h2></div>
            <div className="about-film-intro"><p>브랜드의 성장을 어떻게 바라보는지,<br />우주기획 대표가 직접 이야기합니다.</p><a className="about-text-link" href={companyFilm.channelUrl} target="_blank" rel="noopener noreferrer">YouTube 채널 둘러보기 <ArrowUpRight size={17} aria-hidden="true" /><span className="about-sr-only"> (새 탭)</span></a></div>
          </div>
          <AboutFilm />
          <div className="about-film-caption"><div><span>FEATURED FILM</span><h3>{companyFilm.title}</h3></div><a href={companyFilm.watchUrl} target="_blank" rel="noopener noreferrer">YouTube에서 보기 <ArrowUpRight size={16} aria-hidden="true" /><span className="about-sr-only"> (새 탭)</span></a></div>
        </div>
      </section>

      <section className="about-next about-container" aria-labelledby="about-next-heading">
        <div><p className="about-eyebrow">LET’S FIND YOUR UNIVERSE</p><h2 id="about-next-heading">다음 가능성은,<br /><span className="about-gradient">당신의 브랜드 안에.</span></h2></div>
        <div className="about-next-action"><p>브랜드의 고민부터 아직 작은 아이디어까지.<br />함께 관찰하고, 발견하고, 연결하겠습니다.</p><a className="about-contact-link" href="/#contact">프로젝트 문의하기 <ArrowRight size={19} aria-hidden="true" /></a></div>
      </section>
    </div>
    <SiteFooter showInquiry={false} />
  </>;
}
