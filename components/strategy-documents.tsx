'use client';

import { useEffect, useRef, useState } from 'react';
import { Pause, Play } from 'lucide-react';
import type * as Three from 'three';

const DOCUMENTS = [
  { title: '브랜드 분석', label: '01 · RESEARCH', subtitle: '시장에서 우리의 위치를 찾다' },
  { title: '마케팅 전략', label: '02 · STRATEGY', subtitle: '브랜드가 나아갈 방향을 정하다' },
  { title: '캠페인 실행 계획', label: '03 · ACTION PLAN', subtitle: '생각을 구체적인 실행으로' },
];

// High-resolution typeset textures keep Korean copy crisp on actual 3D sheets.
function drawDocument(index: number) {
  const base = document.createElement('canvas');
  base.width = 768;
  base.height = 1024;
  const ctx = base.getContext('2d')!;
  const lines: { value: string; x: number; y: number; size: number; color: string; weight: number; start: number }[] = [];
  let totalCharacters = 0;
  const text = (value: string, x: number, y: number, size = 30, color = '#43546f', weight = 500) => {
    ctx.font = `${weight} ${size}px Pretendard, "Apple SD Gothic Neo", sans-serif`;
    ctx.fillStyle = color;
    ctx.fillText(value, x, y);
  };
  const typedText = (value: string, x: number, y: number, size = 30, color = '#43546f', weight = 500) => {
    lines.push({ value, x, y, size, color, weight, start: totalCharacters });
    totalCharacters += value.length + 9; // A short pause between sentences.
  };
  const rule = (y: number) => {
    ctx.fillStyle = '#e8eef6';
    ctx.fillRect(58, y, 652, 2);
  };
  const block = (y: number, title: string, body: string) => {
    text(title, 60, y, 27, '#5479b6', 600);
    typedText(body, 60, y + 51, 34, '#283c59', 500);
  };

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, 768, 1024);
  text(DOCUMENTS[index].label, 58, 76, 23, '#6a8bbf', 600);
  text(DOCUMENTS[index].title, 55, 162, index === 2 ? 49 : 62, '#243b5b', 650);
  typedText(DOCUMENTS[index].subtitle, 58, 221, 28, '#6c7e97');
  rule(258);

  if (index === 0) {
    block(321, 'MARKET INSIGHT', '시장과 고객을 이해합니다');
    // The dimensional bars are rendered above this reserved chart area.
    text('시장', 131, 665, 26, '#6c7e97');
    text('고객', 321, 665, 26, '#6c7e97');
    text('브랜드', 501, 665, 26, '#6c7e97');
    rule(708);
    block(767, '핵심 발견', '우리만의 차별점 찾기');
    typedText('고객의 니즈에서 기회를 발견합니다.', 60, 893, 27, '#6c7e97');
  } else if (index === 1) {
    block(326, '01  브랜드 목표', '우리가 선택받는 이유');
    rule(414);
    block(479, '02  핵심 고객', '우리의 이야기가 필요한 사람');
    rule(567);
    block(632, '03  브랜드 메시지', '고객에게 전할 하나의 가치');
    ctx.fillStyle = '#eef4fd';
    ctx.beginPath();
    ctx.roundRect(48, 756, 672, 168, 20);
    ctx.fill();
    text('COMMUNICATION', 73, 802, 23, '#6084bc', 600);
    typedText('일관된 방향, 명확한 메시지', 73, 855, 31, '#304f7c', 600);
  } else {
    ['콘텐츠 기획', '채널별 실행', '성과 측정 및 개선'].forEach((label, i) => {
      const y = 337 + i * 161;
      ctx.fillStyle = '#edf3fc';
      ctx.beginPath();
      ctx.roundRect(58, y - 36, 70, 70, 15);
      ctx.fill();
      text(`0${i + 1}`, 73, y + 9, 29, '#5a80ba', 600);
      text(label, 154, y + 7, 36, '#283c59', 600);
      typedText(['메시지를 콘텐츠로 구체화', '고객과 만나는 접점 설계', '데이터로 다음 방향 결정'][i], 154, y + 62, 27, '#6c7e97');
    });
    rule(790);
    typedText('기획 → 실행 → 분석 → 개선', 58, 858, 31, '#5479b6', 600);
  }
  rule(960);
  text('UJU PLANNING', 58, 997, 21, '#91a0b5', 600);
  text(`0${index + 1}`, 671, 997, 22, '#91a0b5');
  const canvas = document.createElement('canvas');
  canvas.width = base.width;
  canvas.height = base.height;
  const output = canvas.getContext('2d')!;
  let lastFrame = '';
  const update = (seconds: number, still = false) => {
    // Cap texture changes at 12fps; the 3D motion remains independently smooth.
    const clock = Math.floor(seconds * 12) / 12;
    const cycle = clock % 22;
    const delay = [1.2, 0.35, 2.1][index];
    // Type, hold the complete document, then erase before the seamless next loop.
    const count = still ? totalCharacters : Math.floor(cycle < 19
      ? Math.max(0, Math.min(totalCharacters, (cycle - delay) * 18))
      : totalCharacters * (22 - cycle) / 3);
    const cursor = !still && count < totalCharacters && cycle < 19 && Math.floor(clock * 2) % 2 === 0;
    const signature = `${count}:${cursor}`;
    if (signature === lastFrame) return false;
    lastFrame = signature;
    output.setTransform(1, 0, 0, 1, 0, 0);
    output.drawImage(base, 0, 0);
    for (const line of lines) {
      const length = Math.max(0, Math.min(line.value.length, count - line.start));
      output.font = `${line.weight} ${line.size}px Pretendard, "Apple SD Gothic Neo", sans-serif`;
      output.fillStyle = line.color;
      const visibleText = line.value.slice(0, length);
      output.fillText(visibleText, line.x, line.y);
      if (cursor && count >= line.start && count < line.start + line.value.length) {
        output.fillStyle = '#5e8cdb';
        output.fillRect(line.x + output.measureText(visibleText).width + 4, line.y - line.size * 0.8, 2, line.size);
      }
    }
    return true;
  };
  update(0);
  return { canvas, update };
}

export function StrategyDocuments() {
  const hostRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false);
  const restartRef = useRef<(() => void) | null>(null);
  const [paused, setPaused] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let disposed = false;
    let cleanup: (() => void) | undefined;

    const initialize = async () => {
      const THREE = await import('three');
      if (disposed) return;
      let renderer: Three.WebGLRenderer;
      try {
        renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      } catch {
        return; // The readable HTML document remains available without WebGL.
      }
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      host.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(30, 16 / 7, 0.1, 60);
      camera.position.set(0, 0, 13);
      scene.add(new THREE.HemisphereLight(0xffffff, 0xa4b9db, 2.4));
      const light = new THREE.DirectionalLight(0xffffff, 3.2);
      light.position.set(-4, 7, 10);
      scene.add(light);
      const materials: Three.Material[] = [];
      const geometries: Three.BufferGeometry[] = [];
      const textures: Three.Texture[] = [];
      const geometry = <T extends Three.BufferGeometry>(value: T) => { geometries.push(value); return value; };
      const material = <T extends Three.Material>(value: T) => { materials.push(value); return value; };

      const shape = new THREE.Shape();
      const w = 3.38, h = 4.5, r = 0.13;
      shape.moveTo(-w / 2 + r, -h / 2);
      shape.lineTo(w / 2 - r, -h / 2);
      shape.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r);
      shape.lineTo(w / 2, h / 2 - r);
      shape.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2);
      shape.lineTo(-w / 2 + r, h / 2);
      shape.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r);
      shape.lineTo(-w / 2, -h / 2 + r);
      shape.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);
      const paperGeometry = geometry(new THREE.ExtrudeGeometry(shape, {
        depth: 0.075, bevelEnabled: true, bevelSegments: 3, steps: 1, bevelSize: 0.025, bevelThickness: 0.025,
      }));
      const paperMaterial = material(new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.4 }));
      const blueMaterial = material(new THREE.MeshStandardMaterial({ color: '#8ab4ef', roughness: 0.3, metalness: 0.08 }));
      const backingMaterial = material(new THREE.MeshStandardMaterial({ color: '#e2edff', roughness: 0.55 }));
      let documentArt = DOCUMENTS.map((_, index) => drawDocument(index));

      const documents = DOCUMENTS.map((_, index) => {
        const group = new THREE.Group();
        const backing = new THREE.Mesh(paperGeometry, backingMaterial);
        backing.position.set(0.1, -0.1, -0.16);
        backing.rotation.z = -0.018;
        group.add(backing);
        group.add(new THREE.Mesh(paperGeometry, paperMaterial));
        const texture = new THREE.CanvasTexture(documentArt[index].canvas);
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.generateMipmaps = false;
        texture.minFilter = THREE.LinearFilter;
        texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
        textures.push(texture);
        const face = new THREE.Mesh(geometry(new THREE.PlaneGeometry(3.24, 4.32)), material(new THREE.MeshBasicMaterial({ map: texture })));
        face.position.z = 0.106;
        group.add(face);
        scene.add(group);
        return group;
      });

      const bars = [0.42, 0.7, 1.02].map((height, i) => {
        const bar = new THREE.Mesh(geometry(new THREE.BoxGeometry(0.48, height, 0.18)), blueMaterial);
        bar.position.set(-0.91 + i * 0.81, -0.45 + height / 2, 0.18);
        documents[0].add(bar);
        return { mesh: bar, height };
      });

      // A soft studio shadow makes the floating depth visible without heavy shadow maps.
      const shadowCanvas = document.createElement('canvas');
      shadowCanvas.width = shadowCanvas.height = 128;
      const shadowContext = shadowCanvas.getContext('2d')!;
      const gradient = shadowContext.createRadialGradient(64, 64, 1, 64, 64, 64);
      gradient.addColorStop(0, 'rgba(65, 101, 159, 0.19)');
      gradient.addColorStop(1, 'rgba(65, 101, 159, 0)');
      shadowContext.fillStyle = gradient;
      shadowContext.fillRect(0, 0, 128, 128);
      const shadowTexture = new THREE.CanvasTexture(shadowCanvas);
      textures.push(shadowTexture);
      const shadow = new THREE.Mesh(geometry(new THREE.PlaneGeometry(11, 1)), material(new THREE.MeshBasicMaterial({ map: shadowTexture, transparent: true, depthWrite: false })));
      shadow.position.set(0, -2.45, -1.2);
      scene.add(shadow);

      let compact = false;
      let inView = false;
      let frame = 0;
      let lastTime = 0;
      let elapsed = 0;
      const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
      pausedRef.current = motion.matches;
      setPaused(motion.matches);

      const render = () => {
        const reducedMotion = motion.matches && pausedRef.current;
        const settle = (delay: number, duration: number) => {
          const progress = reducedMotion ? 1 : Math.max(0, Math.min(1, (elapsed - delay) / duration));
          return 1 - Math.pow(1 - progress, 3);
        };
        documents.forEach((group, i) => {
          const side = i - 1;
          // One small entrance, then a stable reading surface instead of perpetual bobbing.
          const entrance = settle(i * 0.12, 1.4);
          group.position.set(
            side * (compact ? 1.45 : 3.6),
            (i === 1 ? 0 : 0.07) - (1 - entrance) * 0.14,
            i === 1 ? 0.7 : -0.3,
          );
          group.scale.setScalar(compact && i !== 1 ? 0.87 : 1);
          group.rotation.set(-0.035, side * -0.13, side * -0.025);
          if (documentArt[i].update(elapsed, reducedMotion)) textures[i].needsUpdate = true;
        });
        bars.forEach(({ mesh, height }, i) => {
          const scale = 0.8 + settle(0.4 + i * 0.12, 1) * 0.2;
          mesh.scale.y = scale;
          mesh.position.y = -0.45 + height * scale / 2;
        });
        renderer.render(scene, camera);
      };
      const shouldAnimate = () => inView && !pausedRef.current && !document.hidden;
      const tick = (time: number) => {
        frame = 0;
        if (!shouldAnimate()) { lastTime = 0; return; }
        if (lastTime) elapsed += Math.min((time - lastTime) / 1000, 0.05);
        lastTime = time;
        render();
        frame = requestAnimationFrame(tick);
      };
      const restart = () => {
        if (frame) cancelAnimationFrame(frame);
        frame = 0;
        lastTime = 0;
        render();
        if (shouldAnimate()) frame = requestAnimationFrame(tick);
      };
      restartRef.current = restart;
      const resize = () => {
        const { width, height } = host.getBoundingClientRect();
        if (!width || !height) return;
        compact = width < 760;
        const aspect = width / height;
        const viewHeight = Math.max(5.9, (compact ? 4.7 : 11.8) / aspect);
        camera.aspect = aspect;
        camera.position.z = viewHeight / (2 * Math.tan(Math.PI / 12)) + 0.9;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
        render();
      };
      const resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(host);
      const intersectionObserver = new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; restart(); });
      intersectionObserver.observe(host);
      const onMotionChange = () => { pausedRef.current = motion.matches; setPaused(motion.matches); restart(); };
      const onContextLost = (event: Event) => { event.preventDefault(); inView = false; restart(); setReady(false); };
      renderer.domElement.addEventListener('webglcontextlost', onContextLost);
      document.addEventListener('visibilitychange', restart);
      motion.addEventListener('change', onMotionChange);
      resize();
      setReady(true);

      // Replace fallback font textures when the site's Korean font finishes loading.
      void document.fonts.ready.then(() => {
        if (disposed) return;
        documentArt = DOCUMENTS.map((_, index) => drawDocument(index));
        for (let i = 0; i < DOCUMENTS.length; i++) {
          textures[i].image = documentArt[i].canvas;
          textures[i].needsUpdate = true;
        }
        render();
      });
      cleanup = () => {
        cancelAnimationFrame(frame);
        resizeObserver.disconnect();
        intersectionObserver.disconnect();
        document.removeEventListener('visibilitychange', restart);
        motion.removeEventListener('change', onMotionChange);
        renderer.domElement.removeEventListener('webglcontextlost', onContextLost);
        restartRef.current = null;
        geometries.forEach((item) => item.dispose());
        materials.forEach((item) => item.dispose());
        textures.forEach((item) => item.dispose());
        renderer.dispose();
        renderer.domElement.remove();
      };
    };
    void initialize().catch(() => { cleanup?.(); if (!disposed) setReady(false); });
    return () => { disposed = true; cleanup?.(); };
  }, []);

  return (
    <>
      <div className="strategy-documents" role="img" aria-label="은은한 블루 그라데이션 위에 놓인 브랜드 분석, 마케팅 전략, 캠페인 실행 계획 3D 문서에 문장이 한 줄씩 타이핑되는 기획서">
        <div className={`strategy-document-fallback ${ready ? 'is-hidden' : ''}`} aria-hidden="true">
          <small>UJU PLANNING · STRATEGY</small>
          <strong>마케팅 전략</strong>
          <p>브랜드가 나아갈 방향을 정하다</p>
          <dl><dt>01 브랜드 목표</dt><dd>우리가 선택받는 이유</dd><dt>02 핵심 고객</dt><dd>우리의 이야기가 필요한 사람</dd><dt>03 브랜드 메시지</dt><dd>고객에게 전할 하나의 가치</dd></dl>
        </div>
        <div ref={hostRef} className={`strategy-documents-canvas ${ready ? 'is-ready' : ''}`} aria-hidden="true" />
      </div>
      {ready && <button className="strategy-motion-toggle" type="button" aria-label={paused ? '기획서 애니메이션 재생' : '기획서 애니메이션 일시정지'} onClick={() => {
        pausedRef.current = !pausedRef.current;
        setPaused(pausedRef.current);
        restartRef.current?.();
      }}>{paused ? <Play size={14} /> : <Pause size={14} />}<span>{paused ? '재생' : '일시정지'}</span></button>}
    </>
  );
}
