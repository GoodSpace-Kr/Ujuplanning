import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

// All surfaces are generated locally: no photograph or video is used as the scene.
export async function mountParcelScene(host: HTMLDivElement) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = .98;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.VSMShadowMap;
  renderer.setClearColor('#d9c9af');
  host.appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#d9c9af');
  const camera = new THREE.PerspectiveCamera(34, 1, .1, 60);
  const textures: THREE.Texture[] = [];
  const materials: THREE.Material[] = [];
  const geometries: THREE.BufferGeometry[] = [];
  const material = <T extends THREE.Material>(value: T) => { materials.push(value); return value; };
  const geometry = <T extends THREE.BufferGeometry>(value: T) => { geometries.push(value); return value; };
  let seed = 7214;
  const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
  const canvasTexture = (w: number, h: number, paint: (ctx: CanvasRenderingContext2D) => void, color = true) => {
    const canvas = document.createElement('canvas'); canvas.width = w; canvas.height = h;
    paint(canvas.getContext('2d')!);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = color ? THREE.SRGBColorSpace : THREE.NoColorSpace;
    texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    textures.push(texture); return texture;
  };
  const kraft = canvasTexture(1024, 1024, ctx => {
    const image = ctx.createImageData(1024, 1024);
    for (let y = 0; y < 1024; y++) for (let x = 0; x < 1024; x++) {
      const n = (random() - .5) * 22 + Math.sin(y * 1.8) * 1.4 + Math.sin(x * .028 + y * .016) * 2;
      const i = (y * 1024 + x) * 4;
      image.data[i] = 174 + n; image.data[i + 1] = 135 + n; image.data[i + 2] = 83 + n; image.data[i + 3] = 255;
    }
    ctx.putImageData(image, 0, 0);
    for (let i = 0; i < 21000; i++) {
      const x = random() * 1024, y = random() * 1024;
      ctx.strokeStyle = random() > .5 ? 'rgba(245,222,174,.13)' : 'rgba(65,39,13,.09)';
      ctx.lineWidth = .45; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + random() * 9, y + random() * 2); ctx.stroke();
    }
  });
  const fiber = canvasTexture(512, 512, ctx => {
    const image = ctx.createImageData(512, 512);
    for (let i = 0; i < image.data.length; i += 4) { const n = 105 + random() * 50; image.data[i] = image.data[i + 1] = image.data[i + 2] = n; image.data[i + 3] = 255; }
    ctx.putImageData(image, 0, 0);
  }, false);
  fiber.wrapS = fiber.wrapT = THREE.RepeatWrapping; fiber.repeat.set(3, 3);
  const paper = material(new THREE.MeshStandardMaterial({ map: kraft, roughness: .94, bumpMap: fiber, bumpScale: .018, color: '#f1e5cf', envMapIntensity: .35 }));
  const cutEdge = material(new THREE.MeshStandardMaterial({ color: '#836343', roughness: 1 }));
  const ink = material(new THREE.MeshStandardMaterial({ color: '#64492f', roughness: 1 }));

  const environment = new RoomEnvironment();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const environmentMap = pmrem.fromScene(environment, .05);
  scene.environment = environmentMap.texture;
  scene.environmentIntensity = .20;
  environment.dispose(); pmrem.dispose();
  scene.add(new THREE.HemisphereLight('#fff6e0', '#927153', .65));
  const sun = new THREE.DirectionalLight('#fff0ce', 3.5);
  sun.position.set(-3.8, 7, 4); sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  Object.assign(sun.shadow.camera, { left: -6, right: 6, top: 6, bottom: -6, near: .5, far: 20 });
  sun.shadow.normalBias = .015; sun.shadow.bias = -.00015; sun.shadow.radius = 6; sun.shadow.blurSamples = 12;
  scene.add(sun);
  const fill = new THREE.DirectionalLight('#e7eefc', .18); fill.position.set(5, 3, 1); scene.add(fill);

  const mesh = (g: THREE.BufferGeometry, m: THREE.Material, x: number, y: number, z: number, cast = true) => {
    const value = new THREE.Mesh(g, m); value.position.set(x, y, z); value.castShadow = cast; value.receiveShadow = true; scene.add(value); return value;
  };
  const rounded = (w: number, h: number, d: number, radius = .025) => geometry(new RoundedBoxGeometry(w, h, d, 3, radius));
  // Separate lid flaps, cut edges, and a recessed seam give the box its scale.
  mesh(rounded(3.4, 1.6, 2.35), paper, 0, .82, 0);
  mesh(rounded(3.43, .035, 2.38, .008), cutEdge, 0, 1.627, 0);
  mesh(rounded(3.43, .034, 1.179, .012), paper, 0, 1.652, -.598);
  mesh(rounded(3.43, .034, 1.179, .012), paper, 0, 1.652, .598);
  const seam = mesh(geometry(new THREE.BoxGeometry(3.39, .005, .013)), ink, 0, 1.663, 0, false);
  seam.receiveShadow = false;
  // Hairline score marks and a lighter folded edge, not a heavy outline.
  for (const z of [-1.171, 1.171]) mesh(geometry(new THREE.BoxGeometry(3.36, .007, .006)), cutEdge, 0, 1.60, z, false);

  const frontPrint = canvasTexture(1536, 720, ctx => {
    ctx.fillStyle = '#4c3827'; ctx.font = '500 44px Arial, sans-serif'; ctx.fillText('A little box. A universe of possibilities.', 105, 122);
    ctx.font = '600 81px Arial, sans-serif'; ctx.fillText('uju planning', 106, 522);
    ctx.font = '400 19px Arial, sans-serif'; ctx.fillText('BRAND STRATEGY  /  CREATIVE STUDIO', 110, 574);
    ctx.strokeStyle = '#60472f'; ctx.lineWidth = 2; ctx.strokeRect(1254, 442, 123, 123);
    ctx.font = '400 34px Arial'; ctx.fillText('↑  ↑', 1270, 496); ctx.font = '400 14px Arial'; ctx.fillText('THIS WAY UP', 1269, 539);
  });
  const printMaterial = material(new THREE.MeshStandardMaterial({ map: frontPrint, transparent: true, roughness: .95, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -1 }));
  mesh(geometry(new THREE.PlaneGeometry(3.25, 1.48)), printMaterial, 0, .84, 1.177, false);
  const sidePrint = canvasTexture(768, 600, ctx => {
    ctx.fillStyle = '#513b29'; ctx.strokeStyle = '#513b29'; ctx.lineWidth = 2;
    ctx.font = '400 22px Arial'; ctx.fillText('FROM', 66, 408); ctx.fillText('TO', 66, 476);
    [425, 493].forEach(y => { ctx.beginPath(); ctx.moveTo(66, y); ctx.lineTo(475, y); ctx.stroke(); });
    for (let i = 0; i < 58; i++) ctx.fillRect(530 + i * 2.6, 386, random() > .5 ? 1 : 2, 110);
    ctx.font = '400 13px Arial'; ctx.fillText('UJU — 001 / SEOUL', 70, 556);
  });
  const side = mesh(geometry(new THREE.PlaneGeometry(2.25, 1.4)), material(new THREE.MeshStandardMaterial({ map: sidePrint, transparent: true, roughness: 1, depthWrite: false })), 1.702, .83, 0, false);
  side.rotation.y = Math.PI / 2;

  const tapeMap = canvasTexture(256, 2048, ctx => {
    ctx.fillStyle = '#edce3b'; ctx.fillRect(0, 0, 256, 2048);
    const shine = ctx.createLinearGradient(0, 0, 256, 0); shine.addColorStop(0, '#fff2aa35'); shine.addColorStop(.08, '#ffffff00'); shine.addColorStop(.9, '#ffffff00'); shine.addColorStop(1, '#8b620a22'); ctx.fillStyle = shine; ctx.fillRect(0, 0, 256, 2048);
    for (let y = 110; y < 2048; y += 490) {
      ctx.save(); ctx.translate(128, y); ctx.rotate(Math.PI / 2); ctx.fillStyle = '#252a26'; ctx.font = '600 66px Arial'; ctx.fillText('uju', 0, 22); ctx.font = '400 54px Arial'; ctx.fillText('planning', 114, 22); ctx.beginPath(); ctx.ellipse(405, 0, 24, 13, -.35, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    }
  });
  const tapeMaterial = material(new THREE.MeshPhysicalMaterial({ map: tapeMap, roughness: .36, metalness: 0, clearcoat: .3, clearcoatRoughness: .28, side: THREE.DoubleSide }));
  const path = new THREE.CatmullRomCurve3([
    new THREE.Vector3(.71, 1.08, 1.225), new THREE.Vector3(.71, 1.58, 1.225), new THREE.Vector3(.70, 1.692, 1.13),
    new THREE.Vector3(.70, 1.692, .62), new THREE.Vector3(.69, 1.705, .14), new THREE.Vector3(.57, 1.96, -.27),
    new THREE.Vector3(.30, 2.55, -.48), new THREE.Vector3(-.02, 3.15, -.42), new THREE.Vector3(-.26, 3.55, -.16),
  ], false, 'centripetal');
  const segments = 160, positions = new Float32Array((segments + 1) * 6), uvs = new Float32Array((segments + 1) * 4), indices: number[] = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments, point = path.getPointAt(t);
    for (let side = 0; side < 2; side++) {
      positions.set([point.x + (side - .5) * .43, point.y, point.z], i * 6 + side * 3);
      uvs.set([side, t], i * 4 + side * 2);
    }
    if (i < segments) { const a = i * 2; indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
  }
  const tapeGeometry = geometry(new THREE.BufferGeometry());
  tapeGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3)); tapeGeometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2)); tapeGeometry.setIndex(indices); tapeGeometry.computeVertexNormals();
  mesh(tapeGeometry, tapeMaterial, 0, 0, 0);

  const marbleMap = canvasTexture(1024, 1024, ctx => {
    ctx.fillStyle = '#e5e0d5'; ctx.fillRect(0, 0, 1024, 1024);
    for (let i = 0; i < 65; i++) {
      ctx.strokeStyle = `rgba(116,108,97,${.018 + random() * .027})`; ctx.lineWidth = .4 + random() * 2;
      let x = random() * 1400 - 250, y = random() * 1024;
      ctx.beginPath(); ctx.moveTo(x, y);
      for (let n = 0; n < 20; n++) { x += 30 + random() * 30; y += random() * 45 - 28; ctx.lineTo(x, y); } ctx.stroke();
    }
  });
  const table = mesh(geometry(new THREE.CylinderGeometry(5.6, 5.6, .14, 128)), material(new THREE.MeshStandardMaterial({ color: '#f5eee2', map: marbleMap, roughness: .69 })), -.8, -.09, .35);
  table.castShadow = false;
  // Broad baked contact shadow supplements the real directional shadow.
  const contactMap = canvasTexture(256, 256, ctx => {
    const g = ctx.createRadialGradient(128, 128, 20, 128, 128, 125); g.addColorStop(0, '#20130988'); g.addColorStop(.5, '#20130933'); g.addColorStop(1, '#20130900'); ctx.fillStyle = g; ctx.fillRect(0, 0, 256, 256);
  });
  const contact = mesh(geometry(new THREE.PlaneGeometry(4.7, 3.5)), material(new THREE.MeshBasicMaterial({ map: contactMap, transparent: true, depthWrite: false })), .05, -.012, .03, false); contact.rotation.x = -Math.PI / 2;
  const wood = canvasTexture(256, 1024, ctx => {
    ctx.fillStyle = '#b19770'; ctx.fillRect(0, 0, 256, 1024);
    for (let i = 0; i < 600; i++) { const x = random() * 256; ctx.strokeStyle = `rgba(${random() > .5 ? '65,39,13' : '237,212,159'},${random() * .10})`; ctx.lineWidth = .5 + random() * 2; ctx.beginPath(); ctx.moveTo(x, 0); ctx.bezierCurveTo(x + 5, 300, x - 7, 700, x + 2, 1024); ctx.stroke(); }
  });
  const woodMaterial = material(new THREE.MeshStandardMaterial({ map: wood, roughness: .86 }));
  for (let i = -8; i <= 8; i++) mesh(rounded(1.22, 8, .13, .018), woodMaterial, i * 1.24, 3, -4.2, false);
  // A quiet daylight gradient and window-frame shadow on the timber wall.
  const lightMap = canvasTexture(1024, 512, ctx => {
    const g = ctx.createRadialGradient(720, 60, 25, 720, 60, 640); g.addColorStop(0, '#fff0ba80'); g.addColorStop(1, '#fff0ba00'); ctx.fillStyle = g; ctx.fillRect(0, 0, 1024, 512);
    ctx.filter = 'blur(9px)'; ctx.fillStyle = '#4e35171c'; ctx.translate(0, 30); ctx.rotate(-.16); ctx.fillRect(120, 140, 1200, 16); ctx.fillRect(730, -100, 15, 800);
  });
  mesh(geometry(new THREE.PlaneGeometry(17, 8)), material(new THREE.MeshBasicMaterial({ map: lightMap, transparent: true, depthWrite: false })), 0, 3, -4.12, false);

  let frameId = 0, visible = true, reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let targetX = 0, targetY = 0, currentX = 0, currentY = 0;
  const basePositions = positions.slice();
  let sceneTime = 0, previousTime = 0;
  function render(time = 0) {
    frameId = 0;
    if (!visible || document.hidden) { previousTime = 0; return; }
    const dt = previousTime ? Math.min((time - previousTime) / 1000, .04) : 0; previousTime = time;
    sceneTime += dt;
    const easing = 1 - Math.exp(-dt * 5);
    currentX += (targetX - currentX) * easing; currentY += (targetY - currentY) * easing;
    const narrow = host.clientWidth / host.clientHeight < 1;
    camera.position.set(5.7 + currentX * .7, 4.6 + currentY * .4, 7.3 - currentX * .45);
    camera.position.multiplyScalar(narrow ? 1.14 : .84);
    camera.lookAt(0, 1.42, 0);
    if (!reducedMotion) {
      for (let i = 0; i <= segments; i++) {
        const weight = Math.pow(Math.max(0, (i / segments - .48) / .52), 2);
        for (let side = 0; side < 2; side++) {
          const at = i * 6 + side * 3;
          positions[at] = basePositions[at] + Math.sin(sceneTime * .65) * .035 * weight;
          positions[at + 2] = basePositions[at + 2] + Math.sin(sceneTime * .65 + .8) * .045 * weight;
        }
      }
      tapeGeometry.attributes.position.needsUpdate = true; tapeGeometry.computeVertexNormals();
    }
    renderer.render(scene, camera);
    if (!reducedMotion || Math.abs(currentX - targetX) + Math.abs(currentY - targetY) > .002) frameId = requestAnimationFrame(render);
  }
  function requestRender() { if (!frameId && visible && !document.hidden) frameId = requestAnimationFrame(render); }
  const resize = new ResizeObserver(() => { const w = host.clientWidth, h = host.clientHeight; renderer.setSize(w, h); camera.aspect = w / h; camera.updateProjectionMatrix(); requestRender(); }); resize.observe(host);
  const visibility = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (!visible) { cancelAnimationFrame(frameId); frameId = 0; previousTime = 0; } else requestRender(); }); visibility.observe(host);
  const move = (event: PointerEvent) => { if (event.pointerType === 'touch') return; const bounds = host.getBoundingClientRect(); targetX = (event.clientX - bounds.left) / bounds.width * 2 - 1; targetY = (event.clientY - bounds.top) / bounds.height * 2 - 1; requestRender(); };
  const leave = () => { targetX = targetY = 0; requestRender(); };
  const key = (event: KeyboardEvent) => { if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home'].includes(event.key)) return; event.preventDefault(); if (event.key === 'Home') { targetX = targetY = 0; } else { targetX = THREE.MathUtils.clamp(targetX + (event.key === 'ArrowRight' ? .35 : event.key === 'ArrowLeft' ? -.35 : 0), -1, 1); targetY = THREE.MathUtils.clamp(targetY + (event.key === 'ArrowDown' ? .35 : event.key === 'ArrowUp' ? -.35 : 0), -1, 1); } requestRender(); };
  const motionChange = () => { reducedMotion = motion.matches; requestRender(); };
  host.addEventListener('pointermove', move); host.addEventListener('pointerleave', leave); host.addEventListener('keydown', key); document.addEventListener('visibilitychange', requestRender); motion.addEventListener('change', motionChange);
  requestRender();
  return () => {
    cancelAnimationFrame(frameId); resize.disconnect(); visibility.disconnect();
    host.removeEventListener('pointermove', move); host.removeEventListener('pointerleave', leave); host.removeEventListener('keydown', key); document.removeEventListener('visibilitychange', requestRender); motion.removeEventListener('change', motionChange);
    geometries.forEach(value => value.dispose()); materials.forEach(value => value.dispose()); textures.forEach(value => value.dispose()); environmentMap.dispose(); sun.shadow.dispose(); renderer.dispose(); renderer.domElement.remove();
  };
}
