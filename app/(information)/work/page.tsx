import { ArrowDown, ArrowRight, ArrowUpRight, Plus } from 'lucide-react';
import { SiteFooter } from '@/components/site-footer';
import { WorkNavigation } from '@/components/work-navigation';
import { PortfolioImage, ProjectArtwork } from '@/components/project-artwork';
import { WorkReels } from '@/components/work-reels';
import { workProjects } from '@/lib/work-content';
import images from '@/lib/work-images.generated.json';
import media from '@/lib/service-media.generated.json';
import selected from '@/lib/project-media.generated.json';
import './work.css';

export const metadata = {
  title: 'WORK · 우주기획',
  description: '청호나이스 공식 블로그, 오션더힐 인스타그램과 릴스, BMW · MINI, 오륜스포츠, BYD. 우주기획이 함께 만든 실제 프로젝트를 만나보세요.',
};

type ProjectId = keyof typeof images;
function ProjectVisual({ id, alt }: { id: ProjectId; alt: string }) {
  if (id === 'chungho') return <div className="work-visual"><ProjectArtwork id="chungho" /></div>;
  if (id === 'ocean') return <figure className="work-visual work-ocean-landscape">
    <PortfolioImage variants={selected.oceanView} alt="바다에서 바라본 오션더힐의 풍경, 공식 릴스 속 장면" sizes="(max-width: 760px) 90vw, 600px" />
  </figure>;
  if (id === 'ohrun') return <figure className="work-visual work-visual-ohrun">
    <video controls playsInline preload="none" poster={images.ohrun[1].src} aria-label="오륜스포츠 광고 영상">
      <source src={`/api/scroll-video/${media.video.src.split('/').pop()}`} type="video/mp4" />
      <track kind="captions" src="/ohrun-captions.vtt" srcLang="ko" label="한국어" />
      브라우저가 동영상 재생을 지원하지 않습니다.
    </video>
  </figure>;
  return <figure className={`work-visual work-visual-${id}`}>
    <div className="work-visual-image"><PortfolioImage variants={images[id]} alt={alt} /></div>
    {id === 'bavarian' && <div className="work-content-strip" aria-label="BMW · MINI 콘텐츠 제작물">
      <img src={media.images['mini-campaign-grid.png']} alt="MINI 프로모션 콘텐츠 모음" width="1620" height="1076" loading="lazy" decoding="async" />
      <p>브랜드의 다양한 이야기를<br />하나의 채널 안에.</p>
    </div>}
  </figure>;
}

function BlogGallery() {
  return <div className="work-container work-deliverables">
    <div className="work-deliverables-heading"><h3>일상에서 읽고 싶은 이야기.</h3>
      <a className="work-source-link" href="https://blog.naver.com/chunghonais_official" target="_blank" rel="noopener noreferrer">공식 블로그 <ArrowUpRight size={17} aria-hidden="true" /></a>
    </div>
    <div className="work-blog-grid">
      {selected.blog.map(post => <a className="work-blog-post" href={post.url} key={post.id} target="_blank" rel="noopener noreferrer" aria-label={`${post.title} 게시물 보기 (새 탭)`}>
        <div className="work-blog-image"><PortfolioImage variants={post.images} alt={`청호나이스 공식 블로그 — ${post.title}`} sizes="(max-width: 600px) 90vw, (max-width: 1000px) 42vw, 560px" /></div>
        <div className="work-blog-caption"><div><time dateTime={post.date.replaceAll('.', '-')}>{post.date}</time><h4>{post.title}</h4></div><ArrowUpRight size={20} aria-hidden="true" /></div>
      </a>)}
    </div>
  </div>;
}

export default function WorkPage() {
  return <>
    <div className="work-page">
      <section className="work-hero work-container" aria-labelledby="work-heading">
        <div className="work-hero-heading">
          <h1 id="work-heading">아이디어에서 경험으로,<br /><span>우리가 연결한 일들.</span></h1>
          <div className="work-hero-introduction"><p>브랜드의 이야기를 일상에 전하고,<br />머무르고 싶은 순간을 만듭니다.</p>
            <a className="work-text-link" href="#selected-work">프로젝트 둘러보기 <ArrowDown size={17} aria-hidden="true" /></a>
          </div>
        </div>
        <div className="work-hero-gallery" aria-label="대표 프로젝트 미리보기">
          <a className="work-hero-shot work-hero-shot-one" href="#chungho"><PortfolioImage variants={selected.blog[0].images} alt="청호나이스 여름 홈캉스 콘텐츠" sizes="(max-width: 760px) 45vw, 340px" eager /><span>청호나이스 <ArrowUpRight size={17} aria-hidden="true" /></span></a>
          <a className="work-hero-shot work-hero-shot-two" href="#bavarian"><PortfolioImage variants={images.bavarian} alt="BMW · MINI 바바리안모터스 프로젝트" sizes="(max-width: 760px) 50vw, 530px" eager /><span>BMW · MINI <ArrowUpRight size={17} aria-hidden="true" /></span></a>
          <a className="work-hero-shot work-hero-shot-three" href="#ocean"><PortfolioImage variants={selected.oceanView} alt="바다 앞에 자리한 오션더힐" sizes="(max-width: 760px) 45vw, 340px" eager /><span>오션더힐 <ArrowUpRight size={17} aria-hidden="true" /></span></a>
        </div>
      </section>

      <div id="selected-work" className="work-anchor" />
      <WorkNavigation items={workProjects.map(project => ({ id: project.id, label: project.shortName }))} />

      <div className="work-cases">
        {workProjects.map(project => <section id={project.id} className={`work-case work-case-${project.id}`} key={project.id} aria-labelledby={`${project.id}-heading`}>
          <div className="work-container work-case-grid">
            <div className="work-case-copy">
              <p className="work-case-category">{project.category}</p>
              <p className="work-case-brand">{project.name.replace('\n', ' ')}</p>
              <h2 id={`${project.id}-heading`}>{project.headline}</h2>
              <p className="work-case-description">{project.introduction}</p>
              {(project.id === 'chungho' || project.id === 'ocean') && <p className="work-period">운영 기간 <span>{project.id === 'chungho' ? '2023.09 — 2024.08' : '2026.03 — 현재'}</span></p>}
              <ul className="work-tags" aria-label="작업 분야">{project.tags.map(tag => <li key={tag}>{tag}</li>)}</ul>
              <details className="work-case-detail">
                <summary>작업 내용 살펴보기 <Plus size={18} aria-hidden="true" /></summary>
                <div className="work-case-detail-body"><h3>{project.focus}</h3><p>{project.approach}</p><ul>{project.scope.map(item => <li key={item}>{item}</li>)}</ul></div>
              </details>
            </div>
            <ProjectVisual id={project.id} alt={project.alt} />
          </div>
          {project.id === 'chungho' && <BlogGallery />}
          {project.id === 'ocean' && <div className="work-container work-deliverables">
            <div className="work-deliverables-heading"><h3>함께 머문 순간이, 콘텐츠가 되도록.</h3><a className="work-source-link" href="https://www.instagram.com/oceanthehill/" target="_blank" rel="noopener noreferrer">공식 인스타그램 <ArrowUpRight size={17} aria-hidden="true" /></a></div>
            <WorkReels />
          </div>}
        </section>)}
      </div>

      <section className="work-next" aria-labelledby="work-next-heading">
        <div className="work-container">
          <h2 id="work-next-heading">다음 이야기는,<br /><span>당신의 브랜드와.</span></h2>
          <p>풀고 싶은 고민이 있다면, 아직 작은 아이디어여도 좋습니다.<br className="work-desktop-break" /> 우주기획과 함께 다음 가능성을 찾아보세요.</p>
          <a className="work-contact-link" href="/#contact">프로젝트 문의하기 <ArrowRight size={19} aria-hidden="true" /></a>
        </div>
      </section>
    </div>
    <SiteFooter showInquiry={false} />
  </>;
}
