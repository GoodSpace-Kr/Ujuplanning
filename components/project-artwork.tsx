/* oxlint-disable next/no-img-element -- Local WebP variants are pre-optimized and served through responsive srcsets. */
import selected from '@/lib/project-media.generated.json';
import images from '@/lib/work-images.generated.json';
import serviceMedia from '@/lib/service-media.generated.json';
import './project-artwork.css';

type ImageVariant = { src: string; width: number; height: number };

export function PortfolioImage({ variants, alt, sizes = '(max-width: 760px) 90vw, 600px', eager = false }: {
  variants: ImageVariant[]; alt: string; sizes?: string; eager?: boolean;
}) {
  const large = variants[variants.length - 1];
  return <img src={large.src} srcSet={variants.map(image => `${image.src} ${image.width}w`).join(', ')}
    sizes={sizes} width={large.width} height={large.height} alt={alt}
    loading={eager ? 'eager' : 'lazy'} decoding="async" />;
}

export function ProjectArtwork({ id, ready = true }: { id: keyof typeof images; ready?: boolean }) {
  return <div className={`project-artwork project-artwork-${id}`}>
    {ready && (id === 'chungho' ? <>
      <div className="project-artwork-card"><PortfolioImage variants={selected.blog[1].images} alt="청호나이스 홈카페 커피 레시피 콘텐츠" sizes="(max-width: 760px) 45vw, 340px" eager /></div>
      <div className="project-artwork-card"><PortfolioImage variants={selected.blog[0].images} alt="청호나이스 여름 홈캉스 콘텐츠" sizes="(max-width: 760px) 50vw, 430px" eager /></div>
      <div className="project-artwork-card"><PortfolioImage variants={selected.chunghoDetail} alt="에스프레카페와 안마의자를 소개하는 청호나이스 블로그 콘텐츠" sizes="(max-width: 760px) 35vw, 280px" eager /></div>
    </> : id === 'ocean' ? <>
      {selected.reels.map(reel => <div className="project-artwork-reel" key={reel.id}>
        <PortfolioImage variants={reel.poster} alt={reel.title} sizes="(max-width: 760px) 35vw, 300px" eager />
      </div>)}
    </> : id === 'bavarian' ? <>
      <div className="project-artwork-wide"><PortfolioImage variants={images.bavarian} alt="BMW · MINI 바바리안모터스" eager /></div>
      <img className="project-artwork-mini" src={serviceMedia.images['mini-campaign-grid.png']} alt="MINI 프로모션 콘텐츠 모음" width="1620" height="1076" decoding="async" />
    </> : <PortfolioImage variants={images[id]} alt={id === 'byd' ? 'BYD 브랜드 전시 공간' : '오륜스포츠 광고 영상의 한 장면'} eager />)}
  </div>;
}
