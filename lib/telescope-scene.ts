import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { SSAOPass } from 'three/addons/postprocessing/SSAOPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { FXAAShader } from 'three/addons/shaders/FXAAShader.js';

// A purpose-built refractor assembly. Studio cards exist only in the reflection
// environment: there is no room, floor, image backdrop, or prerecorded video.
export function mountTelescopeScene(host: HTMLDivElement) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  const dpr = Math.min(window.devicePixelRatio, 2);
  renderer.setPixelRatio(dpr);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.12;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#ffffff');
  const camera = new THREE.OrthographicCamera(-3, 3, 2, -2, .1, 35);
  const root = new THREE.Group(); scene.add(root);
  const geometries = new Set<THREE.BufferGeometry>();
  const materials = new Set<THREE.Material>();
  const textures = new Set<THREE.Texture>();
  const geo = <T extends THREE.BufferGeometry>(g: T): T => { geometries.add(g); return g; };
  const mat = <T extends THREE.Material>(m: T): T => { materials.add(m); return m; };
  const mesh = (parent: THREE.Object3D, g: THREE.BufferGeometry, m: THREE.Material, x = 0, y = 0, z = 0) => {
    const object = new THREE.Mesh(g, m); object.position.set(x, y, z); parent.add(object); return object;
  };
  let seed = 8029;
  const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
  function texture(w: number, h: number, paint: (c: CanvasRenderingContext2D) => void, color = true) {
    const canvas = document.createElement('canvas'); canvas.width = w; canvas.height = h; paint(canvas.getContext('2d')!);
    const t = new THREE.CanvasTexture(canvas); t.colorSpace = color ? THREE.SRGBColorSpace : THREE.NoColorSpace;
    t.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy()); textures.add(t); return t;
  }
  const microGrain = texture(512, 512, ctx => {
    const pixels = ctx.createImageData(512, 512);
    for (let i = 0; i < pixels.data.length; i += 4) { const v = 110 + random() * 35; pixels.data[i] = pixels.data[i + 1] = pixels.data[i + 2] = v; pixels.data[i + 3] = 255; }
    ctx.putImageData(pixels, 0, 0);
  }, false);
  microGrain.wrapS = microGrain.wrapT = THREE.RepeatWrapping; microGrain.repeat.set(4, 4);
  const brushedMap = texture(1024, 256, ctx => {
    ctx.fillStyle = '#888'; ctx.fillRect(0, 0, 1024, 256);
    for (let y = 0; y < 256; y++) { const v = 110 + random() * 40; ctx.fillStyle = `rgb(${v},${v},${v})`; ctx.fillRect(0, y, 1024, 1); }
  }, false);
  const carbonMap = texture(256, 256, ctx => {
    ctx.fillStyle = '#24282e'; ctx.fillRect(0, 0, 256, 256);
    for (let y = 0; y < 256; y += 16) for (let x = 0; x < 256; x += 16) {
      const odd = (x / 16 + y / 16) % 2;
      const g = ctx.createLinearGradient(x, y, x + (odd ? 16 : 0), y + (odd ? 0 : 16));
      g.addColorStop(0, '#15181e'); g.addColorStop(.45, '#3b4048'); g.addColorStop(1, '#1b1e25');
      ctx.fillStyle = g; ctx.fillRect(x, y, 16, 16);
      ctx.strokeStyle = '#ffffff08'; ctx.lineWidth = .6;
      for (let n = 2; n < 16; n += 3) { ctx.beginPath(); ctx.moveTo(x + (odd ? n : 0), y + (odd ? 0 : n)); ctx.lineTo(x + (odd ? n : 16), y + (odd ? 16 : n)); ctx.stroke(); }
    }
  }); carbonMap.wrapS = carbonMap.wrapT = THREE.RepeatWrapping; carbonMap.repeat.set(2, 5);
  const enamel = mat(new THREE.MeshPhysicalMaterial({ color: '#e9edf0', metalness: .13, roughness: .26, clearcoat: .65, clearcoatRoughness: .20, bumpMap: microGrain, bumpScale: .0011 }));
  const graphite = mat(new THREE.MeshStandardMaterial({ color: '#242a32', metalness: .72, roughness: .29, bumpMap: microGrain, bumpScale: .0015 }));
  const black = mat(new THREE.MeshStandardMaterial({ color: '#11161d', metalness: .35, roughness: .43 }));
  const anodized = mat(new THREE.MeshPhysicalMaterial({ color: '#344c70', metalness: .88, roughness: .25, clearcoat: .24, bumpMap: brushedMap, bumpScale: .0006 }));
  const aluminum = mat(new THREE.MeshPhysicalMaterial({ color: '#c0c8d2', metalness: 1, roughness: .23, anisotropy: .7, bumpMap: brushedMap, bumpScale: .0008 }));
  const polished = mat(new THREE.MeshStandardMaterial({ color: '#dce4ee', metalness: 1, roughness: .13 }));
  const rubber = mat(new THREE.MeshStandardMaterial({ color: '#11151b', roughness: .86, bumpMap: microGrain, bumpScale: .003 }));
  const carbon = mat(new THREE.MeshPhysicalMaterial({ map: carbonMap, metalness: .4, roughness: .3, clearcoat: .6, clearcoatRoughness: .3 }));
  const cavity = mat(new THREE.MeshStandardMaterial({ color: '#030710', roughness: .9 }));

  // High-dynamic-range reflection cards make metal and coated glass legible.
  const studio = new THREE.Scene(); studio.background = new THREE.Color('#161c28');
  function card(w: number, h: number, position: number[], color: string, strength: number) {
    const m = mat(new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(strength), side: THREE.DoubleSide }));
    const p = mesh(studio, geo(new THREE.PlaneGeometry(w, h)), m, position[0], position[1], position[2]); p.lookAt(0, 0, 0);
  }
  card(4, 7, [-4, 4, 3], '#fff5e5', 7);
  card(1.2, 6, [4, 2, 1], '#d3e4ff', 5);
  card(7, 3, [0, 6, -1], '#ffffff', 4);
  card(3, 4, [-2, 1, -5], '#8cacde', 2);
  card(.6, 4, [1, -.5, 5], '#ffffff', 3);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const environment = pmrem.fromScene(studio, .025, .1, 30);
  scene.environment = environment.texture; scene.environmentIntensity = .85; pmrem.dispose();
  scene.add(new THREE.HemisphereLight('#edf3ff', '#8c97a6', .65));
  const key = new THREE.DirectionalLight('#fff4e5', 3.1); key.position.set(-3, 6, 5); scene.add(key);
  const rim = new THREE.DirectionalLight('#c9dcff', 1.8); rim.position.set(3, 3, -5); scene.add(rim);
  const fill = new THREE.DirectionalLight('#ffffff', .4); fill.position.set(4, 1, 5); scene.add(fill);

  function cylinder(parent: THREE.Object3D, radius: number, length: number, m: THREE.Material, z: number, radiusBack = radius) {
    const g = geo(new THREE.CylinderGeometry(radius, radiusBack, length, 96)); g.rotateX(Math.PI / 2);
    return mesh(parent, g, m, 0, 0, z);
  }
  function profile(parent: THREE.Object3D, points: number[][], m: THREE.Material, z = 0) {
    const g = geo(new THREE.LatheGeometry(points.map(([r, t]) => new THREE.Vector2(r, t)), 128)); g.rotateX(Math.PI / 2);
    return mesh(parent, g, m, 0, 0, z);
  }
  function ring(parent: THREE.Object3D, radius: number, thickness: number, m: THREE.Material, z: number) {
    return mesh(parent, geo(new THREE.TorusGeometry(radius, thickness, 8, 128)), m, 0, 0, z);
  }
  function block(parent: THREE.Object3D, size: number[], position: number[], m: THREE.Material, bevel = .015) {
    return mesh(parent, geo(new RoundedBoxGeometry(size[0], size[1], size[2], 3, bevel)), m, position[0], position[1], position[2]);
  }
  const screwGeo = geo(new THREE.CylinderGeometry(.018, .018, .008, 12)); screwGeo.rotateX(Math.PI / 2);
  const slotGeo = geo(new THREE.BoxGeometry(.022, .004, .002));
  function screw(parent: THREE.Object3D, x: number, y: number, z: number, rotation = 0) {
    mesh(parent, screwGeo, polished, x, y, z);
    const slot = mesh(parent, slotGeo, black, x, y, z + .005); slot.rotation.z = rotation;
  }
  function knurl(parent: THREE.Object3D, radius: number, length: number, z: number, count = 96) {
    const teeth = new THREE.InstancedMesh(geo(new THREE.BoxGeometry(.011, .012, length)), graphite, count);
    const dummy = new THREE.Object3D();
    for (let i = 0; i < count; i++) { const a = i * Math.PI * 2 / count; dummy.position.set(Math.sin(a) * radius, Math.cos(a) * radius, z); dummy.rotation.z = -a; dummy.updateMatrix(); teeth.setMatrixAt(i, dummy.matrix); }
    parent.add(teeth);
  }
  const scope = new THREE.Group(); root.add(scope); scope.position.set(0, 1.16, 0); scope.rotation.set(0, 1.39, .19, 'ZYX');
  // Rolled lips and internal shell thickness, not overlapping solid cylinders.
  profile(scope, [[.438,-1.08],[.452,-1.065],[.455,-1.03],[.455,.67],[.452,.70],[.435,.715],[.418,.715],[.418,-1.08],[.438,-1.08]], enamel);
  profile(scope, [[.452,.63],[.493,.67],[.50,.72],[.50,.93],[.478,.955],[.435,.955],[.435,.64],[.452,.63]], anodized);
  ring(scope, .497, .006, polished, .755); ring(scope, .497, .007, black, .925);
  profile(scope, [[.505,.88],[.535,.90],[.55,.94],[.55,1.58],[.543,1.615],[.51,1.63],[.497,1.61],[.497,1.00],[.478,.97],[.478,.90],[.505,.88]], enamel);
  // The hood interior stays matte and reveals a series of light baffles.
  profile(scope, [[.496,1.59],[.496,1.01],[.474,.99],[.474,1.59],[.496,1.59]], cavity);
  profile(scope, [[.54,1.60],[.546,1.616],[.535,1.642],[.495,1.642],[.482,1.62],[.487,1.60],[.54,1.60]], graphite);
  ring(scope, .535, .004, aluminum, 1.633);
  for (let i = 0; i < 5; i++) ring(scope, .477 - i * .007, .010, black, 1.11 - i * .055);
  cylinder(scope, .44, .025, cavity, .84);
  // Optical doublet with convex surfaces and thin-film antireflection coating.
  function lens(z: number, radius: number, tint: string, thickness: number, transmission: number) {
    const points: number[][] = [[0, z + .025]];
    for (let i = 1; i <= 32; i++) { const r = radius * i / 32; points.push([r, z + .025 * (1 - (r / radius) ** 2)]); }
    for (let i = 32; i >= 0; i--) { const r = radius * i / 32; points.push([r, z - thickness - .014 * (1 - (r / radius) ** 2)]); }
    points.push([0, z + .025]);
    return profile(scope, points, mat(new THREE.MeshPhysicalMaterial({ color: tint, metalness: .02, roughness: .025, transmission, thickness, ior: 1.52, clearcoat: 1, clearcoatRoughness: .045, iridescence: .85, iridescenceIOR: 1.3, iridescenceThicknessRange: [180, 370], attenuationColor: new THREE.Color('#82b6a6'), attenuationDistance: 2, envMapIntensity: 1.55 })));
  }
  lens(1.22, .466, '#c2e8dc', .055, .94);
  lens(1.07, .455, '#99bacd', .042, .82);
  ring(scope, .469, .010, anodized, 1.247);
  ring(scope, .457, .004, polished, 1.249);
  for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; screw(scope, Math.sin(a) * .518, Math.cos(a) * .518, 1.644, a); }

  // Rear focuser, engraved distance marks, rotating collar, and compression ring.
  profile(scope, [[.44,-1.055],[.455,-1.085],[.455,-1.19],[.39,-1.22],[.32,-1.31],[.32,-1.43],[.27,-1.45],[.27,-1.04],[.44,-1.055]], graphite);
  ring(scope, .45, .006, aluminum, -1.10);
  cylinder(scope, .29, .44, aluminum, -1.55);
  cylinder(scope, .325, .20, graphite, -1.83); knurl(scope, .328, .15, -1.83, 112);
  ring(scope, .326, .009, anodized, -1.93);
  cylinder(scope, .19, .31, black, -2.07);
  cylinder(scope, .215, .09, rubber, -2.25); knurl(scope, .214, .06, -2.25, 72);
  const eyepieceGlass = mat(new THREE.MeshPhysicalMaterial({ color: '#16493f', roughness: .05, metalness: .65, clearcoat: 1, iridescence: .8 }));
  cylinder(scope, .16, .008, eyepieceGlass, -2.30);
  // Two-speed rack-and-pinion focus knobs, each built around its own axle.
  const axle = new THREE.Group(); scope.add(axle); axle.position.set(0, -.20, -1.30); axle.rotation.y = Math.PI / 2;
  cylinder(axle, .055, 1.04, polished, 0);
  for (const side of [-1, 1]) {
    cylinder(axle, .17, .12, graphite, side * .47); knurl(axle, .174, .10, side * .47, 64);
    cylinder(axle, .142, .016, anodized, side * .54); ring(axle, .14, .004, aluminum, side * .551);
  }
  cylinder(axle, .102, .105, anodized, .606); knurl(axle, .105, .077, .606, 48); cylinder(axle, .085, .015, polished, .668);

  // Two hinged tube clamps with bolt heads and a machined dovetail plate.
  for (const z of [-.72, .32]) {
    profile(scope, [[.458,z-.065],[.487,z-.065],[.495,z-.05],[.495,z+.05],[.487,z+.065],[.458,z+.065],[.458,z-.065]], graphite);
    block(scope, [.19,.19,.18], [0,-.52,z], graphite);
    block(scope, [.17,.08,.22], [.42,-.22,z], anodized, .008);
    const bolt = new THREE.Group(); scope.add(bolt); bolt.position.set(.45,-.26,z); bolt.rotation.x = Math.PI/2;
    cylinder(bolt, .026, .12, aluminum, 0); cylinder(bolt, .075, .05, graphite, .08); knurl(bolt,.077,.04,.08,32);
  }
  block(scope, [.35,.09,1.58], [0,-.65,-.18], anodized, .025);
  block(scope, [.24,.045,1.48], [0,-.715,-.18], aluminum, .008);
  // Smaller finder telescope with mounting shoe and three adjustment screws.
  const finder = new THREE.Group(); scope.add(finder); finder.position.set(.27,.59,-.42);
  block(scope,[.14,.18,.18],[.27,.43,-.42],graphite);
  cylinder(finder,.105,.70,graphite,0); cylinder(finder,.14,.26,enamel,.28); ring(finder,.136,.01,graphite,.414);
  cylinder(finder,.112,.009,eyepieceGlass,.413); cylinder(finder,.075,.21,black,-.435); knurl(finder,.078,.12,-.43,40);
  for (const z of [-.22,.15]) { ring(finder,.12,.019,anodized,z); for (let i=0;i<3;i++) { const a=i*Math.PI*2/3; const screwMount = new THREE.Group(); finder.add(screwMount); screwMount.position.set(Math.cos(a)*.145,Math.sin(a)*.145,z); screwMount.rotation.set(0,Math.PI/2,a); cylinder(screwMount,.025,.08,aluminum,0); } }

  // Textures are actual optical labels and ruler marks, not baked pictures.
  const label = texture(2048,512,ctx => {
    ctx.fillStyle='#26364d'; ctx.font='500 106px Arial'; ctx.fillText('UJU',70,185);
    ctx.font='400 40px Arial'; ctx.fillText('O B S E R V A T O R Y',73,253);
    ctx.fillStyle='#697688'; ctx.font='400 28px Arial'; ctx.fillText('APOCHROMATIC REFRACTOR',75,354); ctx.fillText('80 ED  /  480 mm  /  f 6.0',75,402);
    ctx.fillStyle='#496d9b'; ctx.fillRect(1390,142,7,212); ctx.font='500 52px Arial'; ctx.fillText('ED',1430,204); ctx.font='400 30px Arial'; ctx.fillText('EXTRA-LOW',1430,277); ctx.fillText('DISPERSION',1430,318);
  });
  const labelMaterial=mat(new THREE.MeshStandardMaterial({map:label,transparent:true,roughness:.35,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1}));
  // Curve the branding around the barrel, in the front-facing quadrant.
  const labelGeometry=geo(new THREE.PlaneGeometry(1.20,.38,48,1));
  const lp=labelGeometry.attributes.position;
  for(let i=0;i<lp.count;i++){const u=lp.getX(i),v=lp.getY(i),a=v/.456;lp.setXYZ(i,Math.sin(a)*.457,Math.cos(a)*.457,u-.17);}
  labelGeometry.computeVertexNormals(); const curvedLabel=mesh(scope,labelGeometry,labelMaterial); curvedLabel.rotation.z=Math.PI/2;
  const marks=texture(1024,256,ctx=>{
    ctx.strokeStyle='#394858';ctx.fillStyle='#394858';ctx.lineWidth=2;
    for(let i=0;i<=40;i++){const x=20+i*24;ctx.beginPath();ctx.moveTo(x,30);ctx.lineTo(x,i%5===0?116:80);ctx.stroke();if(i%5===0){ctx.font='400 27px Arial';ctx.fillText(String(i),x-8,153);}}
  });
  const markMesh=mesh(scope,geo(new THREE.PlaneGeometry(.40,.13)),mat(new THREE.MeshStandardMaterial({map:marks,transparent:true,depthWrite:false,roughness:.4})),.001,.292,-1.54);markMesh.rotation.x=-Math.PI/2;

  // Compact precision mount; the restrained tripod keeps attention on the optics.
  const mount=new THREE.Group();root.add(mount);mount.position.set(-.16,.46,0);
  block(mount,[.48,.37,.48],[0,.02,0],graphite,.065);
  const saddle=new THREE.Group();mount.add(saddle);saddle.rotation.x=Math.PI/2;
  cylinder(saddle,.30,.24,anodized,0);ring(saddle,.298,.009,aluminum,.125);
  const tension=new THREE.Group();mount.add(tension);tension.position.set(.37,.07,0);tension.rotation.y=Math.PI/2;
  cylinder(tension,.09,.2,graphite,0);knurl(tension,.094,.14,0,40);cylinder(tension,.071,.012,aluminum,.107);
  const head=new THREE.Group();root.add(head);head.position.set(-.16,.06,0);head.rotation.x=Math.PI/2;
  cylinder(head,.285,.35,graphite,0);ring(head,.281,.008,anodized,.10);ring(head,.281,.008,aluminum,-.13);
  mesh(root,geo(new THREE.CylinderGeometry(.30,.37,.22,64)),graphite,-.16,-.21,0);
  function rod(a:THREE.Vector3,b:THREE.Vector3,r1:number,r2:number,m:THREE.Material){const direction=b.clone().sub(a);const p=mesh(root,geo(new THREE.CylinderGeometry(r2,r1,direction.length(),48)),m);p.position.copy(a).add(b).multiplyScalar(.5);p.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),direction.normalize());return p;}
  for(let i=0;i<3;i++){
    const a=i*Math.PI*2/3+.38;
    const start=new THREE.Vector3(-.16+Math.cos(a)*.27,-.22,Math.sin(a)*.27);
    const end=new THREE.Vector3(-.16+Math.cos(a)*1.08,-1.37,Math.sin(a)*1.08);
    const mid=start.clone().lerp(end,.57);
    rod(start,mid,.085,.071,carbon);rod(mid,end,.055,.043,graphite);
    rod(start.clone().lerp(end,.54),start.clone().lerp(end,.63),.080,.075,anodized);
    rod(start.clone().lerp(end,.91),end,.062,.056,rubber);
    rod(new THREE.Vector3(-.16,-.75,0),start.clone().lerp(end,.58),.019,.019,aluminum);
  }
  mesh(root,geo(new THREE.CylinderGeometry(.13,.13,.07,48)),anodized,-.16,-.75,0);

  const target=new THREE.WebGLRenderTarget(1,1,{type:THREE.HalfFloatType,samples:4});
  const composer=new EffectComposer(renderer,target);
  const renderPass=new RenderPass(scene,camera);composer.addPass(renderPass);
  const ao=new SSAOPass(scene,camera,1,1,24);ao.kernelRadius=9;ao.minDistance=.001;ao.maxDistance=.025;composer.addPass(ao);
  const output=new OutputPass();composer.addPass(output);
  const fxaa=new ShaderPass(FXAAShader);composer.addPass(fxaa);
  host.appendChild(renderer.domElement);
  let frame=0,visible=true,alive=true;
  let yaw=.62,pitch=1.22,targetYaw=yaw,targetPitch=pitch;
  let drag:{x:number;y:number;id:number}|null=null;
  const motion=window.matchMedia('(prefers-reduced-motion: reduce)');
  function draw(){
    frame=0;if(!alive||!visible||document.hidden)return;
    const ease=motion.matches?1:.18;yaw+=(targetYaw-yaw)*ease;pitch+=(targetPitch-pitch)*ease;
    camera.position.set(10*Math.sin(pitch)*Math.sin(yaw),.28+10*Math.cos(pitch),10*Math.sin(pitch)*Math.cos(yaw));camera.lookAt(0,.28,0);
    composer.render();
    if(Math.abs(yaw-targetYaw)+Math.abs(pitch-targetPitch)>.0001)requestDraw();
  }
  function requestDraw(){if(alive&&visible&&!document.hidden&&!frame)frame=requestAnimationFrame(draw);}
  const resize=new ResizeObserver(()=>{const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;const aspect=w/h;const height=Math.max(3.9,5.25/aspect);camera.left=-height*aspect/2;camera.right=height*aspect/2;camera.top=height/2;camera.bottom=-height/2;camera.updateProjectionMatrix();renderer.setSize(w,h);composer.setSize(w,h);fxaa.uniforms.resolution.value.set(1/(w*dpr),1/(h*dpr));requestDraw();});resize.observe(host);
  const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;if(!visible){cancelAnimationFrame(frame);frame=0;}else requestDraw();});observer.observe(host);
  const down=(e:PointerEvent)=>{if(e.button!==0)return;drag={x:e.clientX,y:e.clientY,id:e.pointerId};host.setPointerCapture(e.pointerId);host.classList.add('is-dragging');};
  const move=(e:PointerEvent)=>{if(!drag||drag.id!==e.pointerId)return;targetYaw-=(e.clientX-drag.x)*.006;targetPitch=THREE.MathUtils.clamp(targetPitch+(e.clientY-drag.y)*.004,.55,1.7);drag.x=e.clientX;drag.y=e.clientY;requestDraw();};
  const up=()=>{if(drag&&host.hasPointerCapture(drag.id))host.releasePointerCapture(drag.id);drag=null;host.classList.remove('is-dragging');};
  const keyDown=(e:KeyboardEvent)=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home'].includes(e.key))return;e.preventDefault();if(e.key==='Home'){targetYaw=.62;targetPitch=1.22;}else{targetYaw+=e.key==='ArrowLeft'?-.12:e.key==='ArrowRight'?.12:0;targetPitch=THREE.MathUtils.clamp(targetPitch+(e.key==='ArrowUp'?-.08:e.key==='ArrowDown'?.08:0),.55,1.7);}requestDraw();};
  const visibilityChange=()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;}else requestDraw();};
  host.addEventListener('pointerdown',down);host.addEventListener('pointermove',move);host.addEventListener('pointerup',up);host.addEventListener('pointercancel',up);host.addEventListener('keydown',keyDown);document.addEventListener('visibilitychange',visibilityChange);motion.addEventListener('change',requestDraw);
  requestDraw();
  return()=>{alive=false;cancelAnimationFrame(frame);resize.disconnect();observer.disconnect();up();host.removeEventListener('pointerdown',down);host.removeEventListener('pointermove',move);host.removeEventListener('pointerup',up);host.removeEventListener('pointercancel',up);host.removeEventListener('keydown',keyDown);document.removeEventListener('visibilitychange',visibilityChange);motion.removeEventListener('change',requestDraw);composer.passes.forEach(p=>p.dispose());composer.dispose();geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());environment.dispose();renderer.dispose();renderer.domElement.remove();};
}
