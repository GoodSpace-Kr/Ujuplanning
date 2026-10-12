import { StudioHero } from '@/components/studio-hero';
import { ServicesSection } from '@/components/services-section';
import { SiteFooter } from '@/components/site-footer';
import media from '@/lib/scroll-video.generated.json';
import { BrandProcess } from '@/components/brand-process';

export default function Home() {
  return (
    <>
      <link rel="preload" as="fetch" href={media.studio.preview.src} crossOrigin="anonymous" fetchPriority="high" media="(prefers-reduced-motion: no-preference)" />
      <main id="page-top" className="bg-white text-[#151922]">
        <StudioHero />
        {/* 7단계 브랜드 소개 및 3D 캔버스는 비활성 상태로 유지합니다. */}
        <ServicesSection />
        <BrandProcess />
      </main>
      <SiteFooter />
    </>
  );
}
