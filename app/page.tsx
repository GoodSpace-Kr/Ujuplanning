import { StudioHero } from '@/components/studio-hero';
import { ServicesSection } from '@/components/services-section';
import { TelescopeStudy } from '@/components/telescope-study';
import { SiteFooter } from '@/components/site-footer';

export default function Home() {
  return (
    <>
      <main id="page-top" className="bg-white text-[#151922]">
        <StudioHero />
        {/* 7단계 브랜드 소개 및 3D 캔버스는 비활성 상태로 유지합니다. */}
        <ServicesSection />
        <TelescopeStudy />
      </main>
      <SiteFooter />
    </>
  );
}
