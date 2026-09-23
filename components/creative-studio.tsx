'use client';

import Image from 'next/image';
import { CAMPAIGN_IMAGES } from './campaign-assets';
import {
  Check,
  Film,
  Image as ImageIcon,
  Layers,
  Play,
  Volume2,
} from 'lucide-react';
import './creative-studio.css';

const clips = ['브랜드의 시작', '디테일을 담다', '일상의 한 장면'];

export const CREATIVE_PAGES = [
  { id: 'video', title: '영상 편집', icon: Film, number: '01' },
  { id: 'photo', title: '사진 보정', icon: ImageIcon, number: '02' },
  { id: 'card', title: '카드뉴스', icon: Layers, number: '03' },
] as const;
export type CreativePageId = (typeof CREATIVE_PAGES)[number]['id'];

function ProductPhoto({ className = '', image = 0 }: { className?: string; image?: number }) {
  return (
    <Image
      className={`creative-photo ${className}`}
      src={CAMPAIGN_IMAGES[image].src}
      alt=""
      loading="lazy"
      width={1536}
      height={1024}
      unoptimized
      draggable={false}
    />
  );
}

function VideoEditor() {
  return (
    <div className="creative-editor">
      <div className="creative-preview">
        <div className="creative-preview-scenes">
          {CAMPAIGN_IMAGES.map((asset, index) => <div className={`creative-preview-scene creative-preview-scene-${index}`} key={asset.src}>
            <ProductPhoto image={index} />
            <small>{asset.label}</small>
          </div>)}
        </div>
        <span className="creative-preview-caption">
          일상에 스며드는, 브랜드의 장면
        </span>
        <span className="creative-preview-ratio">16:9</span>
      </div>
      <div className="creative-playback">
        <Play size={12} fill="currentColor" aria-hidden="true" />
        <span>브랜드 필름 / 시퀀스 01</span>
        <span>00:15</span>
      </div>
      <div className="creative-timeline" aria-hidden="true">
        <div className="creative-ruler">
          <span>00:00</span>
          <span>00:05</span>
          <span>00:10</span>
          <span>00:15</span>
        </div>
        <div className="creative-clips">
          {clips.map((clip, i) => (
            <div key={clip} className={`creative-clip creative-clip-${i}`}>
              <ProductPhoto image={i} />
              <span>{clip}</span>
            </div>
          ))}
        </div>
        <div className="creative-subtitle-track">
          <span>일상에 스며드는, 브랜드의 장면</span>
        </div>
        <div className="creative-audio-track">
          <Volume2 size={12} />
          <div>
            {Array.from({ length: 48 }, (_, i) => (
              <i
                key={i}
                style={{ height: `${4 + ((i * 7 + (i % 3) * 9) % 17)}px`, animationDelay: `${i % 6 * -90}ms` }}
              />
            ))}
          </div>
        </div>
        <div className="creative-playhead">
          <i />
        </div>
      </div>
      <div className="creative-workspace-footer">
        <span>3 CLIPS · 1 AUDIO</span>
        <span className="creative-finished">
          <Check /> 편집 완료
        </span>
      </div>
    </div>
  );
}

function PhotoRetouch() {
  return (
    <div className="creative-retouch">
      <div className="creative-retouch-photo">
        <ProductPhoto image={2} className="creative-photo-before" />
        <div className="creative-photo-after">
          <ProductPhoto image={2} />
        </div>
        <div className="creative-crop-frame" aria-hidden="true">
          <i />
          <i />
          <i />
          <i />
        </div>
        <span className="creative-photo-label creative-before-label">
          BEFORE
        </span>
        <span className="creative-photo-label creative-after-label">AFTER</span>
        <div className="creative-retouch-sweep" aria-hidden="true" />
      </div>
      <div className="creative-adjustment">
        <span>노출</span>
        <i aria-hidden="true">
          <b />
        </i>
        <small>+0.3</small>
      </div>
      <div className="creative-adjustment creative-adjustment-tone">
        <span>채도</span>
        <i aria-hidden="true">
          <b />
        </i>
        <small>+35</small>
      </div>
      <div className="creative-workspace-footer">
        <span>NAVY TONE · 1536 × 1024</span>
        <span className="creative-finished">
          <Check /> 보정 완료
        </span>
      </div>
    </div>
  );
}

function CardComposition() {
  return (
    <div className="creative-composition">
      <div className="creative-source-files">
        <div className="creative-source-file">
          <ProductPhoto image={1} />
          <span>
            <Film />
            영상 스틸
          </span>
          <Check />
        </div>
        <div className="creative-source-file">
          <ProductPhoto image={2} className="creative-photo-graded" />
          <span>
            <ImageIcon />
            보정 이미지
          </span>
          <Check />
        </div>
      </div>
      <div className="creative-card-stage">
        <article className="creative-news-side creative-news-side-left" aria-label="향기를 담은 카드뉴스">
          <small>01 / SCENT</small>
          <strong>하루에 더하는<br />작은 여유.</strong>
          <div><ProductPhoto image={0} /></div>
          <span>FIND YOUR SCENT</span>
        </article>
        <article className="creative-news-side creative-news-side-right" aria-label="움직임을 담은 카드뉴스">
          <small>03 / MOVE</small>
          <strong>새로운 걸음,<br />새로운 일상.</strong>
          <div><ProductPhoto image={2} className="creative-photo-graded" /></div>
          <span>MAKE YOUR MOVE</span>
        </article>
        <div
          className="creative-transfer creative-transfer-video"
          aria-hidden="true"
        >
          <ProductPhoto image={1} />
          <Film />
        </div>
        <div
          className="creative-transfer creative-transfer-photo"
          aria-hidden="true"
        >
          <ProductPhoto image={2} className="creative-photo-graded" />
          <ImageIcon />
        </div>
        <article className="creative-social" aria-label="일상의 취향을 담은 카드뉴스">
          <div className="creative-social-masthead"><span>THE EVERYDAY EDIT</span><span>02 / 03</span></div>
          <div className="creative-social-copy">
            <strong>
              <span className="creative-type-one">취향이 만드는</span>
              <br />
              <span className="creative-type-two">새로운 하루.</span>
            </strong>
            <p className="creative-type-body">듣고, 걷고, 나를 발견하는 순간.</p>
          </div>
          <div className="creative-social-media">
            <figure className="creative-card-frame creative-card-frame-video">
              <ProductPhoto image={1} />
              <figcaption><span>01</span> SOUND</figcaption>
            </figure>
            <figure className="creative-card-frame creative-card-frame-photo">
              <ProductPhoto image={2} className="creative-photo-graded" />
              <figcaption><span>02</span> MOVE</figcaption>
            </figure>
          </div>
          <div className="creative-social-footer">
            <span>MAKE IT YOURS.</span>
            <Check
              className="creative-complete"
              size={13}
              aria-label="카드뉴스 완성"
            />
          </div>
        </article>
      </div>
    </div>
  );
}

export function CreativeStudio({
  page,
  panelId,
  running,
  reduced,
}: {
  page: CreativePageId;
  panelId: string;
  running: boolean;
  reduced: boolean;
}) {
  const current = CREATIVE_PAGES.find((item) => item.id === page)!;
  const Icon = current.icon;
  return (
    <section
      className="creative-workspace"
      id={panelId}
      aria-label={current.title}
      data-running={running}
      data-still={reduced}
    >
      <div className="creative-workspace-content" key={page}>
        <header className="creative-workspace-heading">
          <h4>
            <Icon aria-hidden="true" />
            {current.title}
          </h4>
          <small>
            {page === 'video'
              ? 'BRAND FILM · 00:15'
              : page === 'photo'
                ? 'PRODUCT PHOTO'
                : 'BRAND STORY · 01'}
          </small>
        </header>
        {page === 'video' ? (
          <VideoEditor />
        ) : page === 'photo' ? (
          <PhotoRetouch />
        ) : (
          <CardComposition />
        )}
      </div>
    </section>
  );
}
