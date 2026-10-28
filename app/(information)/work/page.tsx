import { ArrowDown, ArrowRight, ArrowUpRight, Plus } from 'lucide-react';
import { SiteFooter } from '@/components/site-footer';
import { WorkNavigation } from '@/components/work-navigation';
import { workProjects } from '@/lib/work-content';
import images from '@/lib/work-images.generated.json';
import media from '@/lib/service-media.generated.json';
import './work.css';

export const metadata = {
  title: 'WORK · 우주기획',
  description: '청호나이스, BMW · MINI 바바리안모터스, 오션더힐, 오륜스포츠, BYD. 전략부터 콘텐츠와 공간까지, 우주기획이 연결한 프로젝트를 만나보세요.',
};

type ProjectId = keyof typeof images;
function ProjectImage({ id, alt, hero = false }: { id: ProjectId; alt: string; hero?: boolean }) {
  const [small, large] = images[id];
  return <img src={large.src} srcSet={`${small.src} ${small.width}w, ${large.src} ${large.width}w`}
    sizes={hero ? '(max-width: 600px) 55vw, (max-width: 1200px) 40vw, 530px' : '(max-width: 760px) 92vw, (max-width: 1200px) 55vw, 680px'}
    width={large.width} height={large.height} alt={alt}
    loading={hero ? 'eager' : 'lazy'} fetchPriority={hero && id === 'bavarian' ? 'high' : 'auto'} decoding="async" />;
}

function ProjectVisual({ id, alt }: { id: ProjectId; alt: string }) {
  if (id === 'ohrun') return <figure className="work-visual work-visual-ohrun">
    <video controls playsInline preload="none" poster={images.ohrun[1].src} aria-label="오륜스포츠 광고 영상">
      <source src={`/api/scroll-video/${media.video.src.split('/').pop()}`} type="video/mp4" />
      <track kind="captions" src="/ohrun-captions.vtt" srcLang="ko" label="한국어" />
      브라우저가 동영상 재생을 지원하지 않습니다.
    </video>
    <figcaption><span>CAMPAIGN FILM</span><span>오륜스포츠 광고 영상</span></figcaption>
  </figure>;

  return <figure className={`work-visual work-visual-${id}`}>
    <div className="work-visual-image"><ProjectImage id={id} alt={alt} /></div>
    {id === 'bavarian' && <div className="work-content-strip" aria-label="BMW · MINI 콘텐츠 제작물">
      <img src={media.images['mini-campaign-grid.png']} alt="MINI 프로모션 콘텐츠 모음" width="1620" height="1076" loading="lazy" decoding="async" />
      <div><span>ONE BRAND.<br />MANY STORIES.</span><p>브랜드의 다양한 이야기를<br />하나의 채널 안에.</p></div>
    </div>}
    <figcaption><span>{id === 'chungho' ? 'BRAND COMMUNICATION' : id === 'bavarian' ? 'SOCIAL & CONTENTS' : id === 'ocean' ? 'SHORT-FORM CONTENTS' : 'SPATIAL EXPERIENCE'}</span><span>WOOJU PLANNING</span></figcaption>
  </figure>;
}

export default function WorkPage() {
  return <>
    <div className="work-page">
      <section className="work-hero work-container" aria-labelledby="work-heading">
        <p className="work-eyebrow">WORK</p>
        <div className="work-hero-heading">
          <h1 id="work-heading">아이디어에서 경험으로,<br /><span>우리가 연결한 일들.</span></h1>
          <div className="work-hero-introduction"><p>브랜드의 가능성을 발견하고,<br />콘텐츠와 캠페인, 공간으로 이어갑니다.<br />서로 다른 브랜드와 함께 만든 다섯 가지 이야기.</p>
            <a className="work-text-link" href="#selected-work">프로젝트 둘러보기 <ArrowDown size={17} aria-hidden="true" /></a>
          </div>
        </div>
        <div className="work-hero-gallery" aria-label="대표 프로젝트 미리보기">
          <a className="work-hero-shot work-hero-shot-one" href="#chungho"><ProjectImage id="chungho" alt="청호나이스 프로젝트 살펴보기" hero /><span>CHUNGHO NICE <ArrowUpRight size={17} aria-hidden="true" /></span></a>
          <a className="work-hero-shot work-hero-shot-two" href="#bavarian"><ProjectImage id="bavarian" alt="바바리안모터스 프로젝트 살펴보기" hero /><span>BMW · MINI <ArrowUpRight size={17} aria-hidden="true" /></span></a>
          <a className="work-hero-shot work-hero-shot-three" href="#ohrun"><ProjectImage id="ohrun" alt="오륜스포츠 프로젝트 살펴보기" hero /><span>OHRUN SPORTS <ArrowUpRight size={17} aria-hidden="true" /></span></a>
        </div>
        <div className="work-hero-caption"><span>다른 브랜드, 같은 몰입.</span><span>STRATEGY → CONTENTS → EXPERIENCE</span></div>
      </section>

      <div id="selected-work" className="work-anchor" />
      <WorkNavigation items={workProjects.map(project => ({ id: project.id, label: project.shortName }))} />

      <div className="work-cases">
        {workProjects.map((project, index) => <section id={project.id} className={`work-case work-case-${project.id}`} key={project.id} aria-labelledby={`${project.id}-heading`}>
          <div className="work-container work-case-grid">
            <div className="work-case-copy">
              <p className="work-case-category"><span>{String(index + 1).padStart(2, '0')}</span>{project.category}</p>
              <p className="work-case-brand">{project.name.replace('\n', ' ')}</p>
              <h2 id={`${project.id}-heading`}>{project.headline}</h2>
              <p className="work-case-description">{project.introduction}</p>
              <ul className="work-tags" aria-label="작업 분야">{project.tags.map(tag => <li key={tag}>{tag}</li>)}</ul>
              <details className="work-case-detail">
                <summary>작업 내용 살펴보기 <Plus size={18} aria-hidden="true" /></summary>
                <div className="work-case-detail-body"><h3>{project.focus}</h3><p>{project.approach}</p><ul>{project.scope.map(item => <li key={item}>{item}</li>)}</ul></div>
              </details>
            </div>
            <ProjectVisual id={project.id} alt={project.alt} />
          </div>
        </section>)}
      </div>

      <section className="work-next" aria-labelledby="work-next-heading">
        <div className="work-container">
          <p className="work-eyebrow">NEXT PROJECT</p>
          <h2 id="work-next-heading">다음 이야기는,<br /><span>당신의 브랜드와.</span></h2>
          <p>풀고 싶은 고민이 있다면, 아직 작은 아이디어여도 좋습니다.<br className="work-desktop-break" /> 우주기획과 함께 다음 가능성을 찾아보세요.</p>
          <a className="work-contact-link" href="/#contact">프로젝트 문의하기 <ArrowRight size={19} aria-hidden="true" /></a>
        </div>
      </section>
    </div>
    <SiteFooter showInquiry={false} />
  </>;
}
