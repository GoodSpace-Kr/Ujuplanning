'use client';

import { useState } from 'react';
import { ArrowRight, Images } from 'lucide-react';

import { Button } from '@/components/ui/button';

const services = [
  {
    title: '전략기획',
    description: '브랜드·시장 분석, 마케팅 전략, 캠페인 기획',
  },
  {
    title: '영상·사진 제작',
    description:
      '브랜드 영상, 광고 영상, 숏폼, 인터뷰, 행사 스케치, 제품 촬영',
  },
  {
    title: '콘텐츠 크리에이티브',
    description: '콘텐츠 기획, 디자인, 카피라이팅, 카드뉴스와 광고 소재 제작',
  },
  {
    title: '디지털 퍼포먼스',
    description: '네이버·구글·메타 광고 운영, 매체 전략, 성과 분석과 개선',
  },
  {
    title: 'SNS·바이럴 마케팅',
    description: 'SNS 채널 운영, 블로그, 인플루언서, 체험단과 확산 콘텐츠',
  },
  {
    title: '브랜드 경험·BTL·행사',
    description: '전시, 팝업, 프로모션, 브랜드 행사와 현장 운영',
  },
];

export default function Home() {
  const [activeTitle, setActiveTitle] = useState<string | null>(null);
  const activeService = services.find((service) => service.title === activeTitle);

  return (
    <main className="relative min-h-svh overflow-hidden bg-black text-white">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[url('/space-background.png')] bg-cover bg-center opacity-70"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.08),rgba(0,0,0,0.58)_38%,rgba(0,0,0,0.9)_100%)]"
      />
      <div aria-hidden="true" className="absolute inset-0 bg-black/48" />

      <header className="relative z-10 flex h-20 items-center justify-between px-6 sm:px-10 lg:px-16">
        <a href="#" className="flex items-center gap-3 text-sm font-medium">
          <span className="h-0 w-0 border-x-[8px] border-b-[14px] border-x-transparent border-b-white" />
          <span className="text-white/86">우주기획</span>
        </a>
        <nav className="hidden items-center gap-8 text-sm text-white/52 md:flex">
          <a href="#services" className="transition hover:text-white">
            Services
          </a>
          <a href="#projects" className="transition hover:text-white">
            Projects
          </a>
          <a href="#contact" className="transition hover:text-white">
            Contact
          </a>
        </nav>
      </header>

      <section className="relative z-10 grid min-h-[calc(100svh-80px)] grid-cols-1 items-center gap-14 px-6 pb-14 pt-8 sm:px-10 lg:grid-cols-[minmax(320px,0.86fr)_minmax(180px,0.55fr)_minmax(410px,0.94fr)] lg:gap-8 lg:px-16 lg:pb-20 lg:pt-0">
        <div className="max-w-[620px]">
          <p className="mb-7 text-sm font-medium text-white/48">UJU Planning</p>
          <h1 className="text-[clamp(3.25rem,7vw,6.7rem)] font-semibold leading-[0.94] tracking-normal text-white">
            당신의 브랜드에서
            <br />
            아직 찾지 못한 우주
          </h1>
          <p className="mt-7 text-[clamp(1.05rem,1.55vw,1.35rem)] font-medium text-white/42">
            우주기획이 찾습니다
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Button
              size="lg"
              className="h-11 rounded-full bg-white px-5 text-[0.95rem] text-black hover:bg-white/86"
            >
              프로젝트 문의
              <ArrowRight aria-hidden="true" className="ml-1 size-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-11 rounded-full border-white/18 bg-white/4 px-5 text-[0.95rem] text-white hover:bg-white/10 hover:text-white"
            >
              <Images aria-hidden="true" className="mr-1 size-4" />
              프로젝트 보기
            </Button>
          </div>
        </div>

        <div aria-hidden="true" className="hidden min-h-[460px] lg:block" />

        <aside
          id="services"
          className="grid w-full gap-8 lg:grid-cols-[minmax(188px,0.76fr)_minmax(220px,1fr)] lg:items-center"
          onMouseLeave={() => setActiveTitle(null)}
        >
          <div className="space-y-1">
            {services.map((service) => (
              <button
                key={service.title}
                type="button"
                onFocus={() => setActiveTitle(service.title)}
                onMouseEnter={() => setActiveTitle(service.title)}
                className="block w-full border-l border-white/9 py-3 pl-5 text-left text-[clamp(1rem,1.35vw,1.2rem)] font-medium text-white/52 transition duration-200 hover:border-white/70 hover:text-white focus-visible:border-white focus-visible:text-white focus-visible:outline-none"
              >
                {service.title}
              </button>
            ))}
          </div>

          <div className="min-h-[156px] border-l border-white/10 pl-6 lg:min-h-[220px] lg:pl-8">
            <p
              aria-live="polite"
              className={`max-w-[360px] pt-3 text-[clamp(1rem,1.2vw,1.12rem)] font-medium leading-8 text-white/80 transition duration-200 ${
                activeService ? 'opacity-100' : 'opacity-0'
              }`}
            >
              {activeService?.description ?? ''}
            </p>
          </div>
        </aside>
      </section>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-6 bottom-8 z-10 h-px bg-white/10 sm:inset-x-10 lg:inset-x-16"
      />
    </main>
  );
}
