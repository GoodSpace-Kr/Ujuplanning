import { StudioHero } from '@/components/studio-hero';
import { ServicesSection } from '@/components/services-section';
import { TelescopeStudy } from '@/components/telescope-study';
import { SiteFooter } from '@/components/site-footer';

export default function Home() {
  return (
    <>
      <main id="page-top" className="bg-white text-[#151922]">
        <StudioHero />
        <section className="studio-services-heading" aria-labelledby="services-intro-heading">
          <h2 id="services-intro-heading"><span>브랜드의 빈 우주를</span><span>발견하기 위해</span></h2>
        </section>
        {/* 7단계 브랜드 소개 및 3D 캔버스는 비활성 상태로 유지합니다. */}
        <ServicesSection />
        <TelescopeStudy />
      </main>
      <SiteFooter />
    </>
  );
}
