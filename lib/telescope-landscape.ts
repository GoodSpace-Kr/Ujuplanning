import * as THREE from 'three';
import { ImprovedNoise } from 'three/addons/math/ImprovedNoise.js';

const surfaceNoise = `
  float ujuHash(vec3 p){p=fract(p*.3183099+vec3(.1,.2,.3));p*=17.;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}
  float ujuNoise(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
    return mix(mix(mix(ujuHash(i),ujuHash(i+vec3(1,0,0)),f.x),mix(ujuHash(i+vec3(0,1,0)),ujuHash(i+vec3(1,1,0)),f.x),f.y),
      mix(mix(ujuHash(i+vec3(0,0,1)),ujuHash(i+vec3(1,0,1)),f.x),mix(ujuHash(i+vec3(0,1,1)),ujuHash(i+vec3(1,1,1)),f.x),f.y),f.z);}
`;

/** Surface variation is evaluated in world space, so there are no visible texture tiles. */
export function addNaturalSurface(material: THREE.MeshStandardMaterial, kind: 'stone' | 'paint' | 'metal') {
  const stone=kind==='stone';
  material.onBeforeCompile=shader=>{
    shader.vertexShader=shader.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 ujuPosition;')
      .replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\nujuPosition=(modelMatrix*vec4(transformed,1.)).xyz;');
    shader.fragmentShader=shader.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec3 ujuPosition;\n'+surfaceNoise)
      .replace('#include <color_fragment>', `#include <color_fragment>
        float broad=ujuNoise(ujuPosition*${stone?'2.2':'9.'});
        float grain=ujuNoise(ujuPosition*${stone?'95.':'230.'});
        diffuseColor.rgb*= ${stone?'.78+.22*broad+.07*grain':'.955+.035*broad+.015*grain'};
      `).replace('#include <roughnessmap_fragment>', `#include <roughnessmap_fragment>
        roughnessFactor=clamp(roughnessFactor+(grain-.5)*${stone?'.15':'.085'},.12,1.);
      `);
  };
  material.customProgramCacheKey=()=>`uju-natural-${kind}`;
  return material;
}

/** Geometric outdoor landscape and procedural atmospheric sky; no background picture. */
export function addTelescopeLandscape(scene: THREE.Scene, onUpdate: () => void) {
  const group=new THREE.Group(); scene.add(group);
  const geometries:THREE.BufferGeometry[]=[], materials:THREE.Material[]=[];
  const textures:THREE.Texture[]=[]; let alive=true;
  const put=(g:THREE.BufferGeometry,m:THREE.Material)=>{geometries.push(g);materials.push(m);const mesh=new THREE.Mesh(g,m);group.add(mesh);return mesh;};
  scene.fog=new THREE.FogExp2('#9d9290',.011);
  const sky=put(new THREE.SphereGeometry(150,48,24),new THREE.ShaderMaterial({
    side:THREE.BackSide,depthWrite:false,toneMapped:false,
    uniforms:{sun:{value:new THREE.Vector3(1,.16,-.35).normalize()}},
    vertexShader:`varying vec3 vDirection;void main(){vDirection=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
    fragmentShader:`varying vec3 vDirection;uniform vec3 sun;
      ${surfaceNoise}
      float fbm(vec3 p){float sum=0.,weight=.55;for(int i=0;i<5;i++){sum+=weight*ujuNoise(p);p=p*2.03+7.1;weight*=.47;}return sum;}
      void main(){vec3 d=normalize(vDirection);float h=max(0.,d.y);
        vec3 sky=mix(vec3(.44,.29,.215),vec3(.10,.145,.215),smoothstep(.0,.55,h));
        sky=mix(sky,vec3(.027,.05,.086),smoothstep(.45,1.,h));
        float facing=max(0.,dot(d,sun));
        float glow=pow(facing,9.);sky+=vec3(.52,.24,.075)*glow;
        sky+=vec3(2.1,1.0,.35)*pow(facing,720.);
        vec3 cloudPoint=d/(max(.065,h+.14));cloudPoint.xz*=vec2(1.,2.3);
        float cloud=fbm(cloudPoint*2.4+vec3(4.,0.,18.));
        float veil=smoothstep(.33,.68,cloud)*smoothstep(-.04,.10,d.y)*(1.-smoothstep(.55,.85,h));
        vec3 cloudColor=mix(vec3(.09,.105,.14),vec3(.66,.34,.18),pow(facing,3.));
        sky=mix(sky,cloudColor,veil*.68);
        float wisps=fbm(vec3(d.x*11.,d.y*45.,d.z*12.)+31.);
        sky+=vec3(.1,.065,.048)*smoothstep(.52,.70,wisps)*exp(-pow((h-.12)*4.,2.));
        gl_FragColor=vec4(sky,1.);
        #include <colorspace_fragment>
      }`,
  }));sky.renderOrder=-10;
  const noise=new ImprovedNoise();
  const relief=(x:number,z:number)=>noise.noise(x,z,3.8)*.6+noise.noise(x*2.1,z*2.1,9.4)*.26+noise.noise(x*4.4,z*4.4,5.3)*.1+noise.noise(x*9.1,z*9.1,1.7)*.04;
  // One continuous terrain field avoids the concentric, folded-paper mountain bands.
  const terrain=new THREE.PlaneGeometry(300,300,256,256);terrain.rotateX(-Math.PI/2);
  const terrainPoints=terrain.attributes.position,terrainColors:number[]=[];
  const earth=new THREE.Color('#555a55');
  for(let i=0;i<terrainPoints.count;i++){
    const x=terrainPoints.getX(i),z=terrainPoints.getZ(i),r=Math.hypot(x,z);
    const warp=relief(x*.011+8,z*.011)*13;
    const broad=relief((x+warp)*.023+23,z*.023+12);
    const near=THREE.MathUtils.smoothstep(r,22,75);
    const height=-5+near*(8+18*broad+relief(x*.10,z*.10)*.45);
    terrainPoints.setY(i,height);
    const variation=.8+relief(x*.04,z*.04)*.27;
    terrainColors.push(earth.r*variation,earth.g*variation,earth.b*variation);
  }
  terrain.setAttribute('color',new THREE.Float32BufferAttribute(terrainColors,3));terrain.computeVertexNormals();
  put(terrain,addNaturalSurface(new THREE.MeshStandardMaterial({vertexColors:true,roughness:1,metalness:0,side:THREE.DoubleSide,envMapIntensity:.3}),'stone'));
  // Continuous ground extends outside the frame; there is no miniature display plinth.
  const groundGeometry=new THREE.PlaneGeometry(100,100,192,192);groundGeometry.rotateX(-Math.PI/2);
  const points=groundGeometry.attributes.position;
  for(let i=0;i<points.count;i++){
    const x=points.getX(i),z=points.getZ(i),r=Math.hypot(x,z);
    const edge=THREE.MathUtils.smoothstep(r,5,22);
    points.setY(i,-1.406-edge*6+relief(x*.55,z*.55)*.035*(1-edge));
  }
  groundGeometry.computeVertexNormals();
  const groundMaterial=addNaturalSurface(new THREE.MeshStandardMaterial({color:'#696355',roughness:.92,metalness:0,envMapIntensity:.35}),'stone');
  const ground=put(groundGeometry,groundMaterial);
  ground.receiveShadow=true;
  const loader=new THREE.TextureLoader();
  for(const [slot,file] of [['map','ground-color.jpg'],['normalMap','ground-normal.jpg'],['roughnessMap','ground-roughness.jpg']] as const){
    loader.loadAsync(`/assets/telescope/${file}`).then(texture=>{
      if(!alive){texture.dispose();return;}
      texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.repeat.set(40,40);texture.anisotropy=8;
      if(slot==='map'){texture.colorSpace=THREE.SRGBColorSpace;groundMaterial.color.set('#b4b0a8');}
      textures.push(texture);groundMaterial[slot]=texture;groundMaterial.normalScale.set(.65,.65);groundMaterial.needsUpdate=true;onUpdate();
    }).catch(()=>{/* Keep the procedural ground when a material map is unavailable. */});
  }
  return {sky,dispose:()=>{alive=false;scene.remove(group);scene.fog=null;textures.forEach(t=>t.dispose());geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());}};
}

export const TelescopeFilmShader={
  uniforms:{tDiffuse:{value:null},strength:{value:1}},
  vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
  fragmentShader:`uniform sampler2D tDiffuse;uniform float strength;varying vec2 vUv;
    void main(){vec3 color=texture2D(tDiffuse,vUv).rgb;
      float luminance=dot(color,vec3(.2126,.7152,.0722));
      vec3 graded=mix(vec3(luminance),color,.90);
      graded=mix(graded*vec3(.94,.98,1.035),graded*vec3(1.035,1.01,.965),smoothstep(.12,.70,luminance));
      float vignette=1.-.19*smoothstep(.18,.76,length((vUv-.5)*vec2(1.,.9)));
      float grain=fract(sin(dot(gl_FragCoord.xy,vec2(12.9898,78.233)))*43758.5453)-.5;
      graded=graded*vignette+grain*.0045;
      gl_FragColor=vec4(mix(color,graded,strength),1.);
    }`,
};

export const TelescopeUniverseShader = {
  uniforms: {
    tDiffuse: {value:null}, aperture: {value:new THREE.Vector2(.5,.5)}, radius: {value:0},
    aspect: {value:1}, portal: {value:0}, fullUniverse: {value:0}, zoom: {value:0},
  },
  vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
  fragmentShader:`
    varying vec2 vUv; uniform sampler2D tDiffuse; uniform vec2 aperture;
    uniform float radius,aspect,portal,fullUniverse,zoom;
    float hash(vec2 p){vec3 p3=fract(vec3(p.xyx)*.1031);p3+=dot(p3,p3.yzx+33.33);return fract((p3.x+p3.y)*p3.z);}
    float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
    float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*noise(p);p=mat2(1.6,-1.2,1.2,1.6)*p+3.7;a*=.5;}return v;}
    vec3 stars(vec2 uv,float scale,float threshold){vec2 grid=uv*scale,cell=floor(grid),f=fract(grid);float r=hash(cell);
      vec2 center=.15+.7*vec2(hash(cell+31.),hash(cell+79.));float d=length(f-center);
      float starRadius=.025+.04*r;float core=(1.-smoothstep(starRadius,starRadius+max(.015,fwidth(d)),d))*step(threshold,r);
      float halo=exp(-d*d/.016)*step(.999,r)*.12;
      return mix(vec3(.69,.80,1.),vec3(1.,.89,.74),hash(cell+10.))*(core+halo)*(.45+r*.4);}
    void main(){vec4 original=texture2D(tDiffuse,vUv);
      vec2 uv=(vUv-.5)*vec2(aspect,1.)/(1.+zoom*.1);
      float cloud=fbm(uv*3.2+5.);float stripe=exp(-pow((uv.y-uv.x*.3+.04)*2.8,2.));
      float dust=pow(fbm(uv*7.5+24.),2.)*stripe;
      vec3 universe=vec3(.015,.026,.055)+vec3(.045,.070,.115)*cloud;
      universe+=vec3(.18,.17,.24)*dust*.72;
      universe*=1.-smoothstep(.52,.77,fbm(uv*10.+50.))*stripe*.32;
      universe+=stars(uv+5.,115.,.986)+stars(uv+17.,225.,.995)*.64+stars(uv+31.,365.,.998)*.40;
      float d=length((vUv-aperture)*vec2(aspect,1.));
      float mask=1.-smoothstep(max(.0001,radius*.97),max(.0002,radius*1.025),d);
      float edge=1.-smoothstep(radius*.65,max(.0002,radius),d);
      universe*=mix(.60+.40*edge,1.,fullUniverse);
      universe*=1.-.12*smoothstep(.25,1.,length(uv));
      float blend=mix(mask*portal,1.,fullUniverse);
      gl_FragColor=vec4(mix(original.rgb,universe,clamp(blend,0.,1.)),1.);
    }`,
};
