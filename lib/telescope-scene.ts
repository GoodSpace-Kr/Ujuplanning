import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { SSAOPass } from 'three/addons/postprocessing/SSAOPass.js';
import { BokehPass } from 'three/addons/postprocessing/BokehPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { FXAAShader } from 'three/addons/shaders/FXAAShader.js';
import { addTelescopeLandscape, addNaturalSurface, TelescopeFilmShader, TelescopeUniverseShader } from './telescope-landscape';
import { getTelescopeJourney } from './telescope-journey';

// Real geometry, procedural materials and a scroll-driven optical journey.
// Soft powder-coated surfaces share a pastel sky environment; no image replaces the telescope.
export function mountTelescopeScene(host: HTMLDivElement) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  const dpr = Math.min(window.devicePixelRatio, 2);
  renderer.setPixelRatio(dpr);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled=false;
  renderer.shadowMap.autoUpdate=false;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#dce8f5');
  const camera = new THREE.PerspectiveCamera(39, 1, .012, 190);
  const root = new THREE.Group(); scene.add(root);
  const geometries = new Set<THREE.BufferGeometry>();
  const materials = new Set<THREE.Material>();
  const textures = new Set<THREE.Texture>();
  const geo = <T extends THREE.BufferGeometry>(g: T): T => { geometries.add(g); return g; };
  const mat = <T extends THREE.Material>(m: T): T => { materials.add(m); return m; };
  const mesh = (parent: THREE.Object3D, g: THREE.BufferGeometry, m: THREE.Material, x = 0, y = 0, z = 0) => {
    const object = new THREE.Mesh(g, m); object.position.set(x, y, z); object.castShadow=true; object.receiveShadow=true; parent.add(object); return object;
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
  const enamel=mat(new THREE.MeshPhysicalMaterial({color:'#fff9f0',metalness:0,roughness:.78,clearcoat:0,specularIntensity:.20,bumpMap:microGrain,bumpScale:.00045}));
  const graphite=mat(new THREE.MeshStandardMaterial({color:'#8ca9d0',metalness:0,roughness:.82,bumpMap:microGrain,bumpScale:.00035}));
  const black=mat(new THREE.MeshStandardMaterial({color:'#839ab9',metalness:0,roughness:.83}));
  const anodized=mat(new THREE.MeshPhysicalMaterial({color:'#bbcade',metalness:0,roughness:.74,clearcoat:0,specularIntensity:.22}));
  const aluminum=mat(new THREE.MeshPhysicalMaterial({color:'#d3ddec',metalness:.025,roughness:.71,specularIntensity:.25}));
  const polished=mat(new THREE.MeshStandardMaterial({color:'#e4e9f1',metalness:0,roughness:.73}));
  const rubber=mat(new THREE.MeshStandardMaterial({color:'#8c9fbc',roughness:.91,bumpMap:microGrain,bumpScale:.00045}));
  const cavity=mat(new THREE.MeshStandardMaterial({color:'#536e91',roughness:.92}));

  addNaturalSurface(enamel,'paint');addNaturalSurface(graphite,'paint');
  scene.add(new THREE.HemisphereLight('#edf4ff','#b7c5dc',.72));
  const key=new THREE.DirectionalLight('#fff3e3',1.65);
  key.position.set(-3,7,-6);key.target.position.set(0,.2,0);scene.add(key,key.target);
  key.castShadow=false;key.shadow.mapSize.set(2048,2048);
  Object.assign(key.shadow.camera,{left:-5,right:5,top:5,bottom:-5,near:1,far:30});
  key.shadow.bias=-.00008;key.shadow.normalBias=.008;key.shadow.radius=5;key.shadow.blurSamples=8;
  const fill=new THREE.DirectionalLight('#dceaff',.8);fill.position.set(5,3,4);scene.add(fill);

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
    const teeth = new THREE.InstancedMesh(geo(new THREE.BoxGeometry(.007, .006, length)), graphite, count);
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
  const eyepieceGlass = mat(new THREE.MeshPhysicalMaterial({ color: '#5e8bb2', roughness: .22, metalness: .08, clearcoat: .35, clearcoatRoughness: .3, iridescence: .16 }));
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
  mesh(root,geo(new THREE.CylinderGeometry(.225,.245,1.03,96)),graphite,-.16,-.815,0);
  mesh(root,geo(new THREE.CylinderGeometry(.40,.44,.10,96)),black,-.16,-1.355,0);
  const landscape = addTelescopeLandscape(scene);
  // Broad, low-contrast sky illumination keeps pastel colors in the shaded surfaces.
  root.visible=false;
  const pmrem=new THREE.PMREMGenerator(renderer);
  const environment=pmrem.fromScene(scene,.12,.1,190);pmrem.dispose();
  scene.environment=environment.texture;scene.environmentIntensity=.40;
  root.visible=true;renderer.shadowMap.needsUpdate=true;

  const target=new THREE.WebGLRenderTarget(1,1,{type:THREE.HalfFloatType,samples:4});
  const composer=new EffectComposer(renderer,target);
  const renderPass=new RenderPass(scene,camera);composer.addPass(renderPass);
  const ao=new SSAOPass(scene,camera,1,1,24);ao.kernelRadius=4;ao.minDistance=.0004;ao.maxDistance=.004;composer.addPass(ao);
  const bokeh=new BokehPass(scene,camera,{focus:7,aperture:.0006,maxblur:.007});composer.addPass(bokeh);
  const bokehUniforms=bokeh.uniforms as Record<string,THREE.IUniform>;
  const output=new OutputPass();composer.addPass(output);
  const fxaa=new ShaderPass(FXAAShader);composer.addPass(fxaa);
  const film=new ShaderPass(TelescopeFilmShader);composer.addPass(film);
  const universe=new ShaderPass(TelescopeUniverseShader);composer.addPass(universe);
  host.appendChild(renderer.domElement);
  const section=host.closest('section')!;
  const sticky=host.parentElement!;
  const motion=window.matchMedia('(prefers-reduced-motion: reduce)');
  let frame=0,visible=true,alive=true,current=0,requested=0;
  scope.updateWorldMatrix(true,false);
  const eyeLocal=new THREE.Vector3(0,0,-2.306);
  const eyeWorld=scope.localToWorld(eyeLocal.clone());
  const eyeRimWorld=scope.localToWorld(eyeLocal.clone().add(new THREE.Vector3(0,.145,0)));
  const projectedEye=new THREE.Vector3(),projectedRim=new THREE.Vector3();
  function progress(){const bounds=section.getBoundingClientRect();requested=THREE.MathUtils.clamp(-bounds.top/Math.max(1,bounds.height-sticky.clientHeight),0,1);}
  function draw(){
    frame=0;if(!alive||!visible||document.hidden)return;
    progress();
    current=motion.matches||requested===0||requested===1?requested:current+(requested-current)*.14;
    const state=getTelescopeJourney(current,motion.matches);
    const portrait=camera.aspect<1?1.12:1;
    const distance=state.distance*(1+(portrait-1)*(1-state.approach));
    const cameraLocal=eyeLocal.clone().add(new THREE.Vector3(-3.7*(1-state.alignment),.95*(1-state.alignment),-distance));
    const aimLocal=eyeLocal.clone().add(new THREE.Vector3(0,.10*(1-state.alignment),1.10*(1-state.alignment)));
    camera.position.copy(scope.localToWorld(cameraLocal));camera.lookAt(scope.localToWorld(aimLocal));camera.updateMatrixWorld();
    bokehUniforms.focus.value=camera.position.distanceTo(eyeWorld)+.30*(1-state.approach);
    bokehUniforms.aperture.value=.0006*(1-state.portal);
    bokeh.enabled=state.portal<.98;
    projectedEye.copy(eyeWorld).project(camera);projectedRim.copy(eyeRimWorld).project(camera);
    const radius=.5*Math.hypot((projectedRim.x-projectedEye.x)*camera.aspect,projectedRim.y-projectedEye.y);
    universe.uniforms.aperture.value.set(projectedEye.x*.5+.5,projectedEye.y*.5+.5);
    universe.uniforms.radius.value=radius;universe.uniforms.aspect.value=camera.aspect;
    universe.uniforms.portal.value=state.portal;universe.uniforms.fullUniverse.value=state.fullUniverse;universe.uniforms.zoom.value=state.approach;
    section.style.setProperty('--journey-opening',String(state.openingOpacity));section.style.setProperty('--journey-ending',String(state.endingOpacity));
    composer.render();
    if(Math.abs(current-requested)>.00015)requestDraw();
  }
  function requestDraw(){if(alive&&visible&&!document.hidden&&!frame)frame=requestAnimationFrame(draw);}
  const resize=new ResizeObserver(()=>{const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h);composer.setSize(w,h);fxaa.uniforms.resolution.value.set(1/(w*dpr),1/(h*dpr));requestDraw();});resize.observe(host);
  const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;if(!visible){cancelAnimationFrame(frame);frame=0;}else requestDraw();});observer.observe(host);
  const visibilityChange=()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;}else requestDraw();};
  window.addEventListener('scroll',requestDraw,{passive:true});document.addEventListener('visibilitychange',visibilityChange);motion.addEventListener('change',requestDraw);
  progress();current=requested;requestDraw();
  return()=>{alive=false;cancelAnimationFrame(frame);resize.disconnect();observer.disconnect();window.removeEventListener('scroll',requestDraw);document.removeEventListener('visibilitychange',visibilityChange);motion.removeEventListener('change',requestDraw);composer.passes.forEach(p=>p.dispose());composer.dispose();landscape.dispose();root.traverse(o=>{if(o instanceof THREE.InstancedMesh)o.dispose();});geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());environment.dispose();key.shadow.dispose();renderer.dispose();renderer.domElement.remove();};
}
