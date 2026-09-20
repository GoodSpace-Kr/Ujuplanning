'use client';

import { useEffect, useRef, useState } from 'react';
import { Camera, Check, MapPin } from 'lucide-react';
import type * as Three from 'three';
import './experience-studio.css';

const STAGES = [
  { key: 'plan', title: '공간과 동선 설계', detail: '브랜드가 머무는 공간을 구상합니다' },
  { key: 'build', title: '제작과 현장 운영', detail: '설계한 경험을 현장에서 완성합니다' },
  { key: 'record', title: '브랜드의 순간 기록', detail: '공간의 이야기를 콘텐츠로 이어갑니다' },
];

function signCanvas(kind: 'wall' | 'welcome') {
  const canvas = document.createElement('canvas');
  canvas.width = kind === 'wall' ? 1024 : 384;
  canvas.height = kind === 'wall' ? 640 : 768;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#f6f9fd';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const text = (value: string, x: number, y: number, size: number, color = '#283c59', weight = 500) => {
    ctx.font = `${weight} ${size}px Pretendard, "Apple SD Gothic Neo", sans-serif`;
    ctx.fillStyle = color;
    ctx.fillText(value, x, y);
  };
  if (kind === 'wall') {
    text('UJU · BRAND EXPERIENCE', 76, 109, 29, '#6a8bbf');
    text('일상에서 만나는', 70, 276, 91);
    text('새로운 브랜드 경험', 70, 396, 91);
    ctx.fillStyle = '#d9e5f5';
    ctx.fillRect(76, 476, 862, 2);
    text('우주기획', 76, 554, 36, '#5479b6');
  } else {
    text('POP-UP', 39, 96, 30, '#6a8bbf');
    text('향기로', 36, 226, 57);
    text('만나는', 36, 306, 57);
    text('새로운 일상', 36, 386, 49);
    text('WELCOME', 39, 558, 24, '#6c7e97');
    text('→', 39, 652, 84, '#5479b6');
    text('우주기획', 39, 721, 24, '#6c7e97');
  }
  return canvas;
}

export function ExperienceStudio() {
  const rootRef = useRef<HTMLElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const wideRef = useRef<HTMLCanvasElement>(null);
  const detailRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const root = rootRef.current, host = hostRef.current;
    if (!root || !host) return;
    let disposed = false;
    let cleanup: (() => void) | undefined;

    const initialize = async () => {
      const THREE = await import('three');
      if (disposed) return;
      let renderer: Three.WebGLRenderer;
      try { renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true }); } catch { return; }
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFShadowMap;
      host.appendChild(renderer.domElement);
      const scene = new THREE.Scene();
      const camera = new THREE.OrthographicCamera(-5, 5, 3, -3, .1, 60);
      camera.position.set(8, 6.8, 10);
      camera.lookAt(0, 1.05, 0);
      scene.add(new THREE.HemisphereLight('#ffffff', '#bbcce4', 2.2));
      const light = new THREE.DirectionalLight('#ffffff', 2.4);
      light.position.set(-3, 8, 7);
      light.castShadow = true;
      light.shadow.mapSize.set(1024, 1024);
      Object.assign(light.shadow.camera, { left: -6, right: 6, top: 6, bottom: -6, near: .1, far: 25 });
      light.shadow.normalBias = .035;
      light.shadow.bias = -.0003;
      scene.add(light);
      const geometries: Three.BufferGeometry[] = [];
      const materials: Three.Material[] = [];
      const textures: Three.Texture[] = [];
      const geo = <T extends Three.BufferGeometry>(value: T) => { geometries.push(value); return value; };
      const mat = <T extends Three.Material>(value: T) => { materials.push(value); return value; };
      const white = mat(new THREE.MeshStandardMaterial({ color: '#f7f9fd', roughness: .68 }));
      const blue = mat(new THREE.MeshStandardMaterial({ color: '#b0c9ef', roughness: .6 }));
      const pale = mat(new THREE.MeshStandardMaterial({ color: '#dce7f5', roughness: .75 }));
      const cube = (parent: Three.Object3D, w: number, h: number, d: number, x: number, y: number, z: number, material = white) => {
        const mesh = new THREE.Mesh(geo(new THREE.BoxGeometry(w, h, d)), material);
        mesh.position.set(x, y, z);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        parent.add(mesh);
        return mesh;
      };
      const ground = new THREE.Mesh(geo(new THREE.PlaneGeometry(11, 9)), mat(new THREE.ShadowMaterial({ color: '#56759f', opacity: .13 })));
      ground.rotation.x = -Math.PI / 2;
      ground.position.y = -.015;
      ground.receiveShadow = true;
      scene.add(ground);
      const floor = cube(scene, 6.4, .18, 4.5, 0, .09, 0, pale);
      const walls = new THREE.Group();
      walls.position.y = .18;
      scene.add(walls);
      cube(walls, 6.05, 2.95, .13, 0, 1.475, -2.05);
      cube(walls, .13, 2.95, 1.7, -3, 1.475, -1.25);
      // Architectural details use real geometry; printed content stays on crisp textures.
      for (let i = 0; i < 8; i++) cube(walls, .026, 2.75, .032, -2.88 + i * .13, 1.475, -1.947, pale);
      const wallTexture = new THREE.CanvasTexture(signCanvas('wall'));
      const welcomeTexture = new THREE.CanvasTexture(signCanvas('welcome'));
      [wallTexture, welcomeTexture].forEach(texture => {
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
        textures.push(texture);
      });
      const label = (parent: Three.Object3D, texture: Three.Texture, w: number, h: number, x: number, y: number, z: number) => {
        const mesh = new THREE.Mesh(geo(new THREE.PlaneGeometry(w, h)), mat(new THREE.MeshBasicMaterial({ map: texture })));
        mesh.position.set(x, y, z);
        parent.add(mesh);
        return mesh;
      };
      label(walls, wallTexture, 3.85, 2.4, .78, 1.62, -1.974);
      const photoTexture = new THREE.TextureLoader().load('/creative-product.png', () => {
        if (disposed) { photoTexture.dispose(); return; }
        photoTexture.colorSpace = THREE.SRGBColorSpace;
        photoTexture.repeat.set(.46, 1);
        photoTexture.offset.set(.36, 0);
        captured = false;
        render();
      });
      photoTexture.colorSpace = THREE.SRGBColorSpace;
      textures.push(photoTexture);
      cube(walls, 1.24, 1.95, .055, -1.92, 1.62, -1.96, blue);
      label(walls, photoTexture, 1.12, 1.83, -1.92, 1.62, -1.923);

      const displays = new THREE.Group();
      displays.position.y = .18;
      scene.add(displays);
      cube(displays, 1.25, .86, 1.05, -1.62, .43, .1);
      cube(displays, 1.34, .06, 1.14, -1.62, .89, .1, pale);
      cube(displays, .88, 1.22, .78, -.28, .61, -.72, blue);
      cube(displays, .96, .06, .86, -.28, 1.25, -.72);
      const counter = new THREE.Group();
      counter.position.set(.9, .18, 1.05);
      scene.add(counter);
      cube(counter, 1.85, .92, .74, 0, .46, 0);
      cube(counter, 1.98, .065, .84, 0, .9525, 0, pale);
      // Flat information cards resting on the welcome counter.
      [-.48, -.18, .12].forEach(x => {
        const card = cube(counter, .22, .015, .3, x, .995, .06, blue);
        card.rotation.y = -.12;
      });
      const sign = new THREE.Group();
      sign.position.set(2.48, .18, .44);
      sign.rotation.y = -.13;
      scene.add(sign);
      cube(sign, .68, .06, .5, 0, .03, 0, pale);
      cube(sign, .06, .55, .06, 0, .33, 0, blue);
      cube(sign, .79, 1.58, .06, 0, 1.33, 0);
      label(sign, welcomeTexture, .75, 1.5, 0, 1.33, .033);

      const outlinePoints = [new THREE.Vector3(-3.2, .195, 2.25), new THREE.Vector3(3.2, .195, 2.25), new THREE.Vector3(3.2, .195, -2.25), new THREE.Vector3(-3.2, .195, -2.25)];
      const outline = new THREE.LineLoop(geo(new THREE.BufferGeometry().setFromPoints(outlinePoints)), mat(new THREE.LineDashedMaterial({ color: '#779fdc', dashSize: .13, gapSize: .09, transparent: true })));
      outline.computeLineDistances();
      scene.add(outline);
      const stops = [new THREE.Vector3(0, .193, 2.1), new THREE.Vector3(-2.45, .193, 1.5), new THREE.Vector3(-2.45, .193, -.7), new THREE.Vector3(1.35, .193, -.7), new THREE.Vector3(2.1, .193, 1.7)];
      const pathPoints: Three.Vector3[] = [];
      for (let i = 0; i < stops.length - 1; i++) for (let j = 0; j < 30; j++) pathPoints.push(stops[i].clone().lerp(stops[i + 1], j / 29));
      const routeGeometry = geo(new THREE.BufferGeometry().setFromPoints(pathPoints));
      const route = new THREE.Line(routeGeometry, mat(new THREE.LineBasicMaterial({ color: '#6c97d4' })));
      scene.add(route);

      let frame = 0, last = 0, elapsed = 0, inView = false, contextLost = false, captured = false;
      const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
      const ease = (t: number) => { const p = Math.max(0, Math.min(1, t)); return p * p * (3 - 2 * p); };
      const capture = () => {
        // These thumbnails are part of the scene's recording sequence, not external images.
        [wideRef.current, detailRef.current].forEach((canvas, index) => {
          const ctx = canvas?.getContext('2d');
          if (!canvas || !ctx) return;
          const source = renderer.domElement;
          const crop = index ? .7 : 1;
          const sw = source.width * crop, sh = source.height * crop;
          ctx.fillStyle = '#edf2f8';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          const ratio = Math.min(canvas.width / sw, canvas.height / sh);
          const w = sw * ratio, h = sh * ratio;
          ctx.drawImage(source, (source.width - sw) / 2, (source.height - sh) / 2, sw, sh, (canvas.width - w) / 2, (canvas.height - h) / 2, w, h);
        });
      };
      function render() {
        if (disposed || contextLost) return;
        const t = motion.matches ? 18 : elapsed % 22;
        const reset = 1 - ease((t - 20) / 2);
        const build = (start: number, length: number) => Math.max(.001, ease((t - start) / length) * reset);
        floor.scale.y = build(.15, 1.4);
        walls.scale.y = build(2, 2.6);
        walls.visible = walls.scale.y > .002;
        displays.scale.y = build(5, 1.7);
        displays.visible = displays.scale.y > .002;
        counter.scale.y = build(6.2, 1.7);
        counter.visible = counter.scale.y > .002;
        sign.scale.y = build(7.5, 1.5);
        sign.visible = sign.scale.y > .002;
        outline.material.opacity = 1 - .75 * ease((t - 4) / 2);
        routeGeometry.setDrawRange(0, Math.floor(pathPoints.length * ease((t - 10) / 4) * reset));
        light.intensity = 2.15 + .4 * ease((t - 9) / 2);
        root!.dataset.phase = t < 2 ? 'plan' : t < 10 ? 'build' : t < 16 ? 'open' : t < 20 ? 'record' : 'reset';
        renderer.render(scene, camera);
        if (t >= 16 && t < 20 && !captured) { capture(); captured = true; }
        if (t < 16 || t >= 20) captured = false;
      }
      const shouldAnimate = () => inView && !document.hidden && !motion.matches && !contextLost;
      const tick = (time: number) => {
        frame = 0;
        if (!shouldAnimate()) { last = 0; return; }
        if (last) elapsed += Math.min((time - last) / 1000, .05);
        last = time;
        render();
        frame = requestAnimationFrame(tick);
      };
      const restart = () => {
        cancelAnimationFrame(frame);
        frame = 0; last = 0;
        render();
        if (shouldAnimate()) frame = requestAnimationFrame(tick);
      };
      const resize = () => {
        const { width, height } = root.getBoundingClientRect();
        const compact = width < 760;
        root.dataset.compact = String(compact);
        root.style.setProperty('--experience-scale', String(Math.max(0, Math.min((width - 24) / (compact ? 660 : 1080), (height - 28) / (compact ? 880 : 520)))));
        // Use layout dimensions, before the presentation scale, for crisp rendering.
        const w = host.clientWidth, h = host.clientHeight;
        if (!w || !h) return;
        const aspect = w / h, viewHeight = Math.max(6.1, 8.6 / aspect);
        camera.left = -viewHeight * aspect / 2; camera.right = viewHeight * aspect / 2;
        camera.top = viewHeight / 2; camera.bottom = -viewHeight / 2;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
        captured = false;
        render();
      };
      const sizes = new ResizeObserver(resize);
      sizes.observe(root);
      const intersection = new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; restart(); });
      intersection.observe(root);
      const onContextLost = (event: Event) => { event.preventDefault(); contextLost = true; cancelAnimationFrame(frame); setReady(false); };
      renderer.domElement.addEventListener('webglcontextlost', onContextLost);
      document.addEventListener('visibilitychange', restart);
      motion.addEventListener('change', restart);
      cleanup = () => {
        cancelAnimationFrame(frame);
        sizes.disconnect(); intersection.disconnect();
        document.removeEventListener('visibilitychange', restart);
        motion.removeEventListener('change', restart);
        renderer.domElement.removeEventListener('webglcontextlost', onContextLost);
        geometries.forEach(item => item.dispose()); materials.forEach(item => item.dispose()); textures.forEach(item => item.dispose());
        renderer.dispose(); renderer.domElement.remove();
      };
      resize();
      setReady(true);
      void document.fonts.ready.then(() => {
        if (disposed) return;
        wallTexture.image = signCanvas('wall'); welcomeTexture.image = signCanvas('welcome');
        wallTexture.needsUpdate = welcomeTexture.needsUpdate = true;
        captured = false;
        render();
      });
    };
    void initialize().catch(() => { cleanup?.(); if (!disposed) setReady(false); });
    return () => { disposed = true; cleanup?.(); };
  }, []);

  return <figure ref={rootRef} className="experience-studio" data-phase="plan" data-ready={ready}
    aria-label="팝업 공간의 도면 위에 브랜드 벽면, 전시대와 안내 사인이 조립되고 방문 동선을 따라 현장 운영과 사진 기록으로 이어지는 3D 애니메이션">
    <div className="experience-stage" aria-hidden="true">
      <div className="experience-plan">
        <div className="experience-plan-heading"><MapPin size={16} /><span>브랜드 경험 설계</span></div>
        <small>POP-UP PROJECT</small>
        <h4>브랜드를 만나는<br />하나의 공간</h4>
        <div className="experience-plan-drawing">
          <svg viewBox="0 0 210 105" fill="none"><path d="M12 90 V12 H198 V90 H132 M88 90 H12" stroke="#a8bfdf" strokeWidth="2" /><path d="M25 25 H65 V49 H25 Z M89 25 H119 V49 H89 Z M128 63 H174 V80 H128 Z" fill="#e4edf9" stroke="#b0c9ef" /><path d="M109 94 V65 H76 V38 H167 V51" stroke="#779fdc" strokeDasharray="4 4" /><text x="142" y="32" fill="#6c7e97" fontSize="10">브랜드 월</text><text x="25" y="67" fill="#6c7e97" fontSize="10">전시 공간</text></svg>
        </div>
        <ol>{STAGES.map((stage, i) => <li key={stage.key} className={`experience-step experience-step-${stage.key}`}><span className="experience-step-number">0{i + 1}</span><div><strong>{stage.title}</strong><p>{stage.detail}</p></div><Check size={13} /></li>)}</ol>
        <div className="experience-plan-footer">우주기획</div>
      </div>
      <div className="experience-venue">
        {!ready && <div className="experience-fallback"><MapPin size={30} /><strong>브랜드가 경험이 되는 공간</strong><span>공간 설계 · 제작 · 현장 운영 · 기록</span></div>}
        <div ref={hostRef} className="experience-canvas" />
        <div className="experience-open"><span />공간 오픈</div>
        <div className="experience-camera-frame"><i /><i /><i /><i /><span><Camera size={14} />현장 기록</span></div>
      </div>
      <div className="experience-records">
        <div><canvas ref={wideRef} width={320} height={190} /><span>공간의 전체 모습</span></div>
        <div><canvas ref={detailRef} width={320} height={190} /><span>브랜드의 디테일</span></div>
      </div>
    </div>
  </figure>;
}
