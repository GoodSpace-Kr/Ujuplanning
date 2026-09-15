'use client';

import { useEffect, useRef, useState } from 'react';

const mockups = [
  {
    title: '목업이미지1',
    description: '어두운 화면 상태',
    image: '/mockup-scroll-01.png',
  },
  {
    title: '목업이미지2',
    description: '밝은 화면 상태',
    image: '/mockup-scroll-02.png',
  },
];

export default function Home() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    let frameId = 0;

    const updateActiveMockup = () => {
      if (!sectionRef.current) {
        return;
      }

      const bounds = sectionRef.current.getBoundingClientRect();
      const scrollableDistance = bounds.height - window.innerHeight;
      const rawProgress = Math.abs(bounds.top) / Math.max(scrollableDistance, 1);
      const nextIndex = rawProgress > 0.48 ? 1 : 0;

      setActiveIndex(nextIndex);
    };

    const requestUpdate = () => {
      window.cancelAnimationFrame(frameId);
      frameId = window.requestAnimationFrame(updateActiveMockup);
    };

    updateActiveMockup();
    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener('scroll', requestUpdate);
      window.removeEventListener('resize', requestUpdate);
    };
  }, []);

  return (
    <main className="bg-[#f5f7fb] text-[#151922]">
      <section className="grid min-h-svh place-items-center px-6 text-center">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold text-blue-600">Scroll threshold demo</p>
          <h1 className="mt-4 text-4xl font-bold leading-tight tracking-[-0.02em] md:text-6xl">
            스크롤 임계점에서
            <br />
            목업이 한 번 넘어가요
          </h1>
          <p className="mt-6 text-base leading-7 text-slate-500 md:text-lg">
            아래로 스크롤하면 왼쪽 목록과 오른쪽 폰 화면이 같은 타이밍으로
            부드럽게 전환됩니다.
          </p>
        </div>
      </section>

      <section ref={sectionRef} className="relative h-[220svh] bg-white">
        <div className="sticky top-0 grid min-h-svh items-center gap-10 overflow-hidden px-6 py-14 md:grid-cols-[0.8fr_1.2fr] md:px-16 lg:px-24">
          <div className="mx-auto w-full max-w-md">
            <p className="text-sm font-semibold text-blue-600">Mockup list</p>
            <h2 className="mt-4 text-3xl font-bold tracking-[-0.02em] md:text-5xl">
              목록과 폰 화면이
              <br />
              같이 바뀝니다
            </h2>

            <div className="mt-10 space-y-3">
              {mockups.map((mockup, index) => (
                <button
                  key={mockup.title}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className={`mockup-list-item ${
                    activeIndex === index ? 'is-active' : ''
                  }`}
                >
                  <span>{mockup.title}</span>
                  <small>{mockup.description}</small>
                </button>
              ))}
            </div>
          </div>

          <div className="relative flex min-h-[640px] items-center justify-center">
            <div className="absolute size-[580px] rounded-full bg-blue-200/35 blur-3xl" />

            <div className="scroll-phone" data-active={activeIndex}>
              <div className="scroll-phone-window">
                {mockups.map((mockup, index) => (
                  <img
                    key={mockup.title}
                    src={mockup.image}
                    alt=""
                    className={`scroll-phone-image image-${index}`}
                    aria-hidden="true"
                  />
                ))}
              </div>

              <img
                src="/phone-frame-demo.png"
                alt="스크롤 전환이 적용된 아이폰 목업"
                className="scroll-phone-frame"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="grid min-h-[70svh] place-items-center px-6 text-center">
        <p className="text-lg font-medium text-slate-500">
          임계점을 다시 위로 넘기면 첫 번째 목업으로 돌아갑니다.
        </p>
      </section>
    </main>
  );
}
