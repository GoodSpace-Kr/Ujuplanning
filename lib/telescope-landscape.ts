import * as THREE from 'three';

/** Entirely geometric landscape and procedural sky; no external image assets. */
export function addTelescopeLandscape(scene: THREE.Scene) {
  const group = new THREE.Group(); scene.add(group);
  const geometries: THREE.BufferGeometry[] = [];
  const materials: THREE.Material[] = [];
  const put = (g: THREE.BufferGeometry, m: THREE.Material) => {
    geometries.push(g); materials.push(m);
    const mesh = new THREE.Mesh(g, m); group.add(mesh); return mesh;
  };
  const sky = put(new THREE.SphereGeometry(150, 48, 24), new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, toneMapped: false,
    uniforms: {
      zenith: {value: new THREE.Color('#18273f')}, middle: {value: new THREE.Color('#61788f')},
      horizon: {value: new THREE.Color('#c69c95')}, sunset: {value: new THREE.Color('#f1c098')},
    },
    vertexShader: `varying vec3 vDirection; void main(){vDirection=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
    fragmentShader: `varying vec3 vDirection; uniform vec3 zenith,middle,horizon,sunset;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
      void main(){vec3 d=normalize(vDirection);float h=d.y;
        vec3 color=mix(horizon,middle,smoothstep(-.03,.22,h));color=mix(color,zenith,smoothstep(.16,.85,h));
        float glow=exp(-pow((h-.025)*8.,2.))*pow(max(0.,dot(normalize(d.xz),normalize(vec2(.98,.18)))),5.);
        color=mix(color,sunset,glow*.62);
        float cloud=noise(d.xz*8.+h*3.)*.6+noise(d.xz*19.)*.25;
        color=mix(color,middle*.8,smoothstep(.49,.67,cloud)*exp(-pow((h-.13)*6.,2.))*.22);
        gl_FragColor=vec4(color,1.);
        #include <colorspace_fragment>
      }`,
  })); sky.renderOrder = -10;

  const palettes = ['#718097', '#526880', '#374d61', '#253b47'];
  // Distinct real mesh ridges, with irregular silhouettes and softly shaded slopes.
  for (let layer = 0; layer < 4; layer++) {
    const inner = 92 - layer * 21, depth = 22, slices = 256, rows = 12;
    const vertices: number[] = [], colors: number[] = [], indices: number[] = [];
    const base = new THREE.Color(palettes[layer]);
    for (let row = 0; row <= rows; row++) for (let i = 0; i <= slices; i++) {
      const theta = i / slices * Math.PI * 2;
      const t = row / rows, radius = inner + depth * t;
      const ridge = .65 + .22*Math.sin(theta*7+layer) + .12*Math.sin(theta*17-layer*.7) + .055*Math.sin(theta*37+.5);
      const rise = Math.pow(Math.sin(t*Math.PI), .75);
      const height = -5 + rise * ridge * (14 - layer*2.5) + Math.sin(theta*9+t*7)*rise*.7;
      vertices.push(Math.cos(theta)*radius,height,Math.sin(theta)*radius);
      const shade = .85 + .15 * t + .055 * Math.sin(theta*5+t*9);
      colors.push(base.r*shade,base.g*shade,base.b*shade);
      if(row<rows&&i<slices){const a=row*(slices+1)+i,b=a+slices+1;indices.push(a,b,a+1,b,b+1,a+1);}
    }
    const g = new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));g.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));g.setIndex(indices);g.computeVertexNormals();
    put(g,new THREE.MeshStandardMaterial({vertexColors:true,roughness:1,metalness:0,side:THREE.DoubleSide,envMapIntensity:.1}));
  }
  // A low outdoor stone platform, with no ceiling, walls, window, or interior props.
  const deck = put(new THREE.CylinderGeometry(4.8,4.9,.18,128),new THREE.MeshStandardMaterial({color:'#555e61',roughness:.95,metalness:0}));deck.position.set(-.16,-1.50,0);
  const contact = put(new THREE.PlaneGeometry(2.3,2.3),new THREE.ShaderMaterial({
    transparent:true,depthWrite:false,uniforms:{},
    vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
    fragmentShader:`varying vec2 vUv;void main(){float d=length((vUv-.5)*2.);gl_FragColor=vec4(.035,.046,.059,.45*(1.-smoothstep(.06,1.,d)));}`,
  }));contact.rotation.x=-Math.PI/2;contact.position.set(-.16,-1.403,0);
  return () => {scene.remove(group);geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());};
}

export const TelescopeUniverseShader = {
  uniforms: {
    tDiffuse: {value:null}, aperture: {value:new THREE.Vector2(.5,.5)}, radius: {value:0},
    aspect: {value:1}, portal: {value:0}, fullUniverse: {value:0}, zoom: {value:0},
  },
  vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
  fragmentShader:`
    varying vec2 vUv; uniform sampler2D tDiffuse; uniform vec2 aperture;
    uniform float radius,aspect,portal,fullUniverse,zoom;
    float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
    float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
    float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*noise(p);p=mat2(1.6,-1.2,1.2,1.6)*p+3.7;a*=.5;}return v;}
    vec3 stars(vec2 uv,float scale,float threshold){vec2 grid=uv*scale,cell=floor(grid),f=fract(grid);float r=hash(cell);
      vec2 center=.15+.7*vec2(hash(cell+31.),hash(cell+79.));float d=length(f-center);
      float core=exp(-d*d/(.0008+.0018*r))*step(threshold,r);
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
