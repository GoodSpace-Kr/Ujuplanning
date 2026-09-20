'use client';

import { useEffect, useRef, type RefObject } from 'react';
import * as THREE from 'three';

type Vec3 = [number, number, number];

const PHASE_COUNT = 7;
const POINT_COUNT = 300;
const LINE_SEGMENTS = 72;
const NODE_COUNT = 10;

const clamp = (value: number, minimum = 0, maximum = 1) =>
  Math.min(Math.max(value, minimum), maximum);

const smooth = (value: number) => {
  const next = clamp(value);
  return next * next * (3 - 2 * next);
};

const seededRandom = (seed: number) => {
  let value = seed >>> 0;

  return () => {
    value += 0x6d2b79f5;
    let result = value;
    result = Math.imul(result ^ (result >>> 15), result | 1);
    result ^= result + Math.imul(result ^ (result >>> 7), result | 61);
    return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
  };
};

const spherePoint = (index: number, total: number, radius: number): Vec3 => {
  const y = 1 - (index / Math.max(total - 1, 1)) * 2;
  const radial = Math.sqrt(Math.max(0, 1 - y * y));
  const angle = index * Math.PI * (3 - Math.sqrt(5));
  return [
    Math.cos(angle) * radial * radius,
    y * radius,
    Math.sin(angle) * radial * radius,
  ];
};

const channelNodes: Vec3[] = [
  [0, 0, 0],
  [-2.8, 1.6, 0.2],
  [-2.6, -1.35, -0.4],
  [-0.8, 2.35, -0.8],
  [1.55, 2.05, 0.4],
  [3.05, 0.75, -0.55],
  [2.6, -1.55, 0.55],
  [0.7, -2.45, -0.45],
  [-0.65, -1.15, 1.15],
  [1.45, 0.35, 1.35],
];

const roomEdges: [Vec3, Vec3][] = [
  [[-3.2, -2.2, -1.5], [3.2, -2.2, -1.5]],
  [[3.2, -2.2, -1.5], [3.2, 2.15, -1.5]],
  [[3.2, 2.15, -1.5], [-3.2, 2.15, -1.5]],
  [[-3.2, 2.15, -1.5], [-3.2, -2.2, -1.5]],
  [[-3.2, -2.2, 1.5], [3.2, -2.2, 1.5]],
  [[3.2, -2.2, 1.5], [3.2, 2.15, 1.5]],
  [[3.2, 2.15, 1.5], [-3.2, 2.15, 1.5]],
  [[-3.2, 2.15, 1.5], [-3.2, -2.2, 1.5]],
  [[-3.2, -2.2, -1.5], [-3.2, -2.2, 1.5]],
  [[3.2, -2.2, -1.5], [3.2, -2.2, 1.5]],
  [[3.2, 2.15, -1.5], [3.2, 2.15, 1.5]],
  [[-3.2, 2.15, -1.5], [-3.2, 2.15, 1.5]],
  [[-1.7, -1.25, 1.5], [1.7, -1.25, 1.5]],
  [[1.7, -1.25, 1.5], [1.7, 0.5, 1.5]],
  [[1.7, 0.5, 1.5], [-1.7, 0.5, 1.5]],
  [[-1.7, 0.5, 1.5], [-1.7, -1.25, 1.5]],
];

function createPointTargets() {
  const random = seededRandom(8231);
  const targets = Array.from({ length: PHASE_COUNT }, () =>
    new Float32Array(POINT_COUNT * 3),
  );

  for (let index = 0; index < POINT_COUNT; index += 1) {
    const offset = index * 3;
    const chaosRadius = 0.45 + random() * 4.6;
    const theta = random() * Math.PI * 2;
    const phi = Math.acos(2 * random() - 1);
    targets[0][offset] = Math.sin(phi) * Math.cos(theta) * chaosRadius;
    targets[0][offset + 1] = Math.cos(phi) * chaosRadius * 0.72;
    targets[0][offset + 2] = Math.sin(phi) * Math.sin(theta) * chaosRadius * 0.72;

    const directionT = index / Math.max(POINT_COUNT - 1, 1);
    const directionX = -4.4 + directionT * 8.8;
    const lane = (index % 9) - 4;
    const convergence = 0.16 + Math.abs(directionX) / 4.4;
    targets[1].set(
      [
        directionX,
        lane * 0.22 * convergence,
        Math.sin(index * 0.71) * 0.12 * convergence,
      ],
      offset,
    );

    const orbit = index % 4;
    const orbitAngle =
      (Math.floor(index / 4) / Math.ceil(POINT_COUNT / 4)) * Math.PI * 2 +
      orbit * 0.46;
    const orbitRadius = 1.45 + orbit * 0.62;
    targets[2].set(
      [
        Math.cos(orbitAngle) * orbitRadius,
        Math.sin(orbitAngle) * orbitRadius * (0.5 + orbit * 0.04),
        Math.sin(orbitAngle + orbit) * 0.75 + (orbit - 1.5) * 0.16,
      ],
      offset,
    );

    const funnelT = index / Math.max(POINT_COUNT - 1, 1);
    const funnelAngle = funnelT * Math.PI * 15 + (index % 5) * 0.12;
    const funnelRadius = 3.75 * Math.pow(1 - funnelT, 1.15) + 0.16;
    targets[3].set(
      [
        Math.cos(funnelAngle) * funnelRadius,
        2.75 - funnelT * 5.5,
        Math.sin(funnelAngle) * funnelRadius * 0.62,
      ],
      offset,
    );

    const node = channelNodes[index % channelNodes.length];
    const cloudRadius = 0.08 + random() * 0.4;
    const cloudAngle = random() * Math.PI * 2;
    targets[4].set(
      [
        node[0] + Math.cos(cloudAngle) * cloudRadius,
        node[1] + Math.sin(cloudAngle) * cloudRadius,
        node[2] + (random() - 0.5) * 0.45,
      ],
      offset,
    );

    const roomEdge = roomEdges[index % roomEdges.length];
    const edgeT = (Math.floor(index / roomEdges.length) % 19) / 18;
    targets[5].set(
      [
        THREE.MathUtils.lerp(roomEdge[0][0], roomEdge[1][0], edgeT),
        THREE.MathUtils.lerp(roomEdge[0][1], roomEdge[1][1], edgeT),
        THREE.MathUtils.lerp(roomEdge[0][2], roomEdge[1][2], edgeT),
      ],
      offset,
    );

    targets[6].set(spherePoint(index, POINT_COUNT, 2.8), offset);
  }

  return targets;
}

const writeSegment = (
  array: Float32Array,
  index: number,
  from: Vec3,
  to: Vec3,
) => array.set([...from, ...to], index * 6);

function createLineTargets(points: Float32Array[]) {
  const targets = Array.from({ length: PHASE_COUNT }, () =>
    new Float32Array(LINE_SEGMENTS * 6),
  );

  for (let index = 0; index < LINE_SEGMENTS; index += 1) {
    const pointA = (index * 17) % POINT_COUNT;
    const pointB = (index * 17 + 29) % POINT_COUNT;
    writeSegment(
      targets[0],
      index,
      [points[0][pointA * 3], points[0][pointA * 3 + 1], points[0][pointA * 3 + 2]],
      [points[0][pointB * 3], points[0][pointB * 3 + 1], points[0][pointB * 3 + 2]],
    );

    const lineY = ((index % 12) - 5.5) * 0.18;
    const lineZ = ((Math.floor(index / 12) % 3) - 1) * 0.14;
    writeSegment(targets[1], index, [-4.2, lineY * 1.7, lineZ], [4.2, lineY * 0.35, lineZ * 0.4]);

    const orbit = index % 4;
    const orbitSegment = Math.floor(index / 4);
    const orbitSegments = Math.ceil(LINE_SEGMENTS / 4);
    const startAngle = (orbitSegment / orbitSegments) * Math.PI * 2;
    const endAngle = ((orbitSegment + 1) / orbitSegments) * Math.PI * 2;
    const radius = 1.45 + orbit * 0.62;
    writeSegment(
      targets[2],
      index,
      [Math.cos(startAngle) * radius, Math.sin(startAngle) * radius * (0.5 + orbit * 0.04), Math.sin(startAngle + orbit) * 0.75],
      [Math.cos(endAngle) * radius, Math.sin(endAngle) * radius * (0.5 + orbit * 0.04), Math.sin(endAngle + orbit) * 0.75],
    );

    const funnelT = index / LINE_SEGMENTS;
    const funnelNext = (index + 1) / LINE_SEGMENTS;
    const fromAngle = funnelT * Math.PI * 12;
    const toAngle = funnelNext * Math.PI * 12;
    const fromRadius = 3.7 * Math.pow(1 - funnelT, 1.15) + 0.15;
    const toRadius = 3.7 * Math.pow(1 - funnelNext, 1.15) + 0.15;
    writeSegment(
      targets[3],
      index,
      [Math.cos(fromAngle) * fromRadius, 2.7 - funnelT * 5.4, Math.sin(fromAngle) * fromRadius * 0.62],
      [Math.cos(toAngle) * toRadius, 2.7 - funnelNext * 5.4, Math.sin(toAngle) * toRadius * 0.62],
    );

    writeSegment(
      targets[4],
      index,
      channelNodes[index % NODE_COUNT],
      channelNodes[(index * 3 + 1) % NODE_COUNT],
    );
    writeSegment(targets[5], index, roomEdges[index % roomEdges.length][0], roomEdges[index % roomEdges.length][1]);

    if (index < LINE_SEGMENTS / 2) {
      const angle = (index / 36) * Math.PI * 2;
      const nextAngle = ((index + 1) / 36) * Math.PI * 2;
      writeSegment(
        targets[6],
        index,
        [Math.cos(angle) * 3.4, Math.sin(angle) * 1.25, 0],
        [Math.cos(nextAngle) * 3.4, Math.sin(nextAngle) * 1.25, 0],
      );
    } else {
      writeSegment(
        targets[6],
        index,
        channelNodes[index % NODE_COUNT],
        channelNodes[(index * 5 + 3) % NODE_COUNT],
      );
    }
  }

  return targets;
}

function createNodeTargets() {
  const random = seededRandom(551);
  const stageNodes: Vec3[] = [
    [-3.2, -2.2, 1.5], [3.2, -2.2, 1.5], [-3.2, 2.15, 1.5],
    [3.2, 2.15, 1.5], [-1.7, -1.25, 1.5], [1.7, -1.25, 1.5],
    [-1.7, 0.5, 1.5], [1.7, 0.5, 1.5], [0, -2.2, -1.5], [0, 2.15, -1.5],
  ];

  return Array.from({ length: PHASE_COUNT }, (_, phase) =>
    Array.from({ length: NODE_COUNT }, (_, index): Vec3 => {
      if (phase === 0) {
        return [(random() - 0.5) * 8, (random() - 0.5) * 5.2, (random() - 0.5) * 3.5];
      }
      if (phase === 1) return [-3.6 + index * 0.8, index % 2 ? 0.18 : -0.18, 0];
      if (phase === 2) {
        const angle = (index / NODE_COUNT) * Math.PI * 2;
        return [Math.cos(angle) * 2.65, Math.sin(angle) * 1.45, Math.sin(angle) * 0.75];
      }
      if (phase === 3) {
        const t = index / (NODE_COUNT - 1);
        const radius = 3.2 * (1 - t) + 0.25;
        const angle = t * Math.PI * 5;
        return [Math.cos(angle) * radius, 2.3 - t * 4.6, Math.sin(angle) * radius * 0.55];
      }
      if (phase === 4) return channelNodes[index];
      if (phase === 5) return stageNodes[index];
      return spherePoint(index, NODE_COUNT, 2.85);
    }),
  );
}

export function BrandSystemCanvas({
  progressRef,
}: {
  progressRef: RefObject<number>;
}) {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x05070a, 0.045);
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.set(0, 0, 11.5);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setClearColor(0x05070a, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    renderer.domElement.setAttribute('aria-hidden', 'true');
    mount.appendChild(renderer.domElement);

    const root = new THREE.Group();
    scene.add(root);
    scene.add(new THREE.HemisphereLight(0xa7dcff, 0x05070a, 1.35));
    const keyLight = new THREE.DirectionalLight(0xffffff, 3.4);
    keyLight.position.set(4, 5, 7);
    scene.add(keyLight);
    const blueLight = new THREE.PointLight(0x48b8ff, 18, 18, 2);
    blueLight.position.set(-2.5, 1.2, 3.5);
    scene.add(blueLight);
    const warmLight = new THREE.PointLight(0xffc081, 7, 15, 2);
    warmLight.position.set(3.5, -2.2, 2.2);
    scene.add(warmLight);

    const pointTargets = createPointTargets();
    const pointPositions = pointTargets[0].slice();
    const pointGeometry = new THREE.BufferGeometry();
    const pointAttribute = new THREE.BufferAttribute(pointPositions, 3);
    pointGeometry.setAttribute('position', pointAttribute);
    const pointMaterial = new THREE.PointsMaterial({
      color: 0xb9e6ff, size: 0.045, sizeAttenuation: true, transparent: true,
      opacity: 0.88, blending: THREE.AdditiveBlending, depthWrite: false,
    });
    root.add(new THREE.Points(pointGeometry, pointMaterial));

    const lineTargets = createLineTargets(pointTargets);
    const linePositions = lineTargets[0].slice();
    const lineGeometry = new THREE.BufferGeometry();
    const lineAttribute = new THREE.BufferAttribute(linePositions, 3);
    lineGeometry.setAttribute('position', lineAttribute);
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x77caff, transparent: true, opacity: 0.24,
      blending: THREE.AdditiveBlending, depthWrite: false,
    });
    root.add(new THREE.LineSegments(lineGeometry, lineMaterial));

    const coreMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x8fd8ff, emissive: 0x0d4c75, emissiveIntensity: 1.25,
      metalness: 0.58, roughness: 0.12, transmission: 0.36, thickness: 1.2,
      transparent: true, opacity: 0.9, clearcoat: 1, clearcoatRoughness: 0.08,
    });
    const core = new THREE.Mesh(new THREE.IcosahedronGeometry(0.68, 4), coreMaterial);
    root.add(core);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: 0x63c7ff, transparent: true, opacity: 0.1,
      blending: THREE.AdditiveBlending, depthWrite: false,
    });
    const coreGlow = new THREE.Mesh(new THREE.SphereGeometry(0.92, 32, 32), glowMaterial);
    root.add(coreGlow);

    const nodeTargets = createNodeTargets();
    const nodeGeometry = new THREE.SphereGeometry(0.12, 20, 20);
    const nodeMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xdaf3ff, emissive: 0x2f9bd4, emissiveIntensity: 1.7,
      metalness: 0.35, roughness: 0.1, transmission: 0.25,
      transparent: true, opacity: 0.94, clearcoat: 1,
    });
    const nodes = new THREE.InstancedMesh(nodeGeometry, nodeMaterial, NODE_COUNT);
    root.add(nodes);

    const orbitRings = Array.from({ length: 3 }, (_, index) => {
      const material = new THREE.MeshBasicMaterial({
        color: 0x8fd8ff, transparent: true, opacity: 0,
        blending: THREE.AdditiveBlending, depthWrite: false,
      });
      const ring = new THREE.Mesh(new THREE.TorusGeometry(1.75 + index * 0.58, 0.012, 8, 160), material);
      ring.rotation.x = 1.08 + index * 0.14;
      ring.rotation.y = index * 0.48;
      root.add(ring);
      return ring;
    });

    const panelGeometry = new THREE.BoxGeometry(1.05, 0.6, 0.045);
    const panels = Array.from({ length: 6 }, () => {
      const material = new THREE.MeshPhysicalMaterial({
        color: 0xaadfff, metalness: 0.35, roughness: 0.16, transmission: 0.62,
        thickness: 0.45, transparent: true, opacity: 0, side: THREE.DoubleSide,
        clearcoat: 1, depthWrite: false,
      });
      const panel = new THREE.Mesh(panelGeometry, material);
      root.add(panel);
      return panel;
    });

    const matrix = new THREE.Matrix4();
    const position = new THREE.Vector3();
    const pointerTarget = new THREE.Vector2();
    const pointerCurrent = new THREE.Vector2();
    const stagePositions: Vec3[] = [
      [-2.15, 1.05, 0.8], [0, 1.05, 0.8], [2.15, 1.05, 0.8],
      [-2.15, -0.45, 0.8], [0, -0.45, 0.8], [2.15, -0.45, 0.8],
    ];
    let animationId = 0;
    let renderedProgress = progressRef.current;
    let cameraBaseZ = 11.5;

    const resize = () => {
      const bounds = mount.getBoundingClientRect();
      renderer.setSize(Math.max(bounds.width, 1), Math.max(bounds.height, 1), false);
      camera.aspect = Math.max(bounds.width, 1) / Math.max(bounds.height, 1);
      cameraBaseZ = camera.aspect < 0.82 ? 14.5 : 11.5;
      camera.updateProjectionMatrix();
    };
    const handlePointerMove = (event: PointerEvent) => {
      const bounds = mount.getBoundingClientRect();
      pointerTarget.set(
        ((event.clientX - bounds.left) / bounds.width - 0.5) * 0.28,
        ((event.clientY - bounds.top) / bounds.height - 0.5) * 0.2,
      );
    };
    const handlePointerLeave = () => pointerTarget.set(0, 0);

    const render = (time: number) => {
      renderedProgress += (progressRef.current - renderedProgress) * 0.075;
      const stepProgress = clamp(
        renderedProgress * PHASE_COUNT - 0.5,
        0,
        PHASE_COUNT - 1,
      );
      const fromStep = Math.min(Math.floor(stepProgress), PHASE_COUNT - 1);
      const toStep = Math.min(fromStep + 1, PHASE_COUNT - 1);
      const mix = smooth(stepProgress - fromStep);

      for (let index = 0; index < pointPositions.length; index += 1) {
        pointPositions[index] = THREE.MathUtils.lerp(pointTargets[fromStep][index], pointTargets[toStep][index], mix);
      }
      pointAttribute.needsUpdate = true;
      for (let index = 0; index < linePositions.length; index += 1) {
        linePositions[index] = THREE.MathUtils.lerp(lineTargets[fromStep][index], lineTargets[toStep][index], mix);
      }
      lineAttribute.needsUpdate = true;

      for (let index = 0; index < NODE_COUNT; index += 1) {
        const from = nodeTargets[fromStep][index];
        const to = nodeTargets[toStep][index];
        position.set(
          THREE.MathUtils.lerp(from[0], to[0], mix),
          THREE.MathUtils.lerp(from[1], to[1], mix),
          THREE.MathUtils.lerp(from[2], to[2], mix),
        );
        const scale = 0.72 + Math.sin(time * 0.0014 + index) * 0.08;
        matrix.makeScale(scale, scale, scale);
        matrix.setPosition(position);
        nodes.setMatrixAt(index, matrix);
      }
      nodes.instanceMatrix.needsUpdate = true;

      const orbitPresence = Math.max(
        1 - Math.abs(stepProgress - 2) * 0.82,
        clamp((stepProgress - 5.25) / 0.75) * 0.72,
      );
      orbitRings.forEach((ring, index) => {
        (ring.material as THREE.MeshBasicMaterial).opacity = orbitPresence * (0.2 - index * 0.035);
        if (!motionQuery.matches) ring.rotation.z = time * (0.00007 + index * 0.000018) * (index % 2 ? -1 : 1);
      });

      const panelPresence = clamp((stepProgress - 1.35) / 0.65) * (1 - clamp((stepProgress - 5.8) / 0.8) * 0.35);
      panels.forEach((panel, index) => {
        const angle = (index / panels.length) * Math.PI * 2 + time * 0.00012;
        const orbitPosition = new THREE.Vector3(Math.cos(angle) * 2.7, Math.sin(angle) * 1.35, Math.sin(angle) * 0.72);
        const stagePosition = new THREE.Vector3(...stagePositions[index]);
        const stageMix = smooth(clamp((stepProgress - 4.55) / 0.45));
        panel.position.lerpVectors(orbitPosition, stagePosition, stageMix);
        panel.rotation.set(
          THREE.MathUtils.lerp(0.25, 0, stageMix),
          THREE.MathUtils.lerp(-angle * 0.18, 0, stageMix),
          THREE.MathUtils.lerp(angle + Math.PI / 2, 0, stageMix),
        );
        (panel.material as THREE.MeshPhysicalMaterial).opacity = panelPresence * (stageMix > 0.5 ? 0.28 : 0.2);
      });

      const coreScales = [0.34, 0.78, 0.9, 0.5, 0.76, 0.68, 1.08];
      const coreScale = THREE.MathUtils.lerp(coreScales[fromStep], coreScales[toStep], mix);
      core.scale.setScalar(coreScale);
      coreGlow.scale.setScalar(coreScale * 1.15);
      glowMaterial.opacity = 0.07 + coreScale * 0.08;
      coreMaterial.emissiveIntensity = 0.8 + coreScale * 0.9;

      const finalZoom = smooth(clamp((stepProgress - 5.1) / 0.9));
      camera.position.z = THREE.MathUtils.lerp(cameraBaseZ, cameraBaseZ + 2.1, finalZoom);
      camera.position.y = THREE.MathUtils.lerp(0, 0.25, finalZoom);
      pointerCurrent.lerp(pointerTarget, 0.055);
      root.rotation.x = -0.08 - pointerCurrent.y;
      root.rotation.y = pointerCurrent.x + (motionQuery.matches ? 0 : time * 0.000035);
      root.rotation.z = Math.sin(renderedProgress * Math.PI) * 0.025;
      renderer.render(scene, camera);
      animationId = window.requestAnimationFrame(render);
    };

    resize();
    window.addEventListener('resize', resize);
    mount.addEventListener('pointermove', handlePointerMove);
    mount.addEventListener('pointerleave', handlePointerLeave);
    animationId = window.requestAnimationFrame(render);

    return () => {
      window.cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
      mount.removeEventListener('pointermove', handlePointerMove);
      mount.removeEventListener('pointerleave', handlePointerLeave);
      pointGeometry.dispose();
      pointMaterial.dispose();
      lineGeometry.dispose();
      lineMaterial.dispose();
      core.geometry.dispose();
      coreMaterial.dispose();
      coreGlow.geometry.dispose();
      glowMaterial.dispose();
      nodeGeometry.dispose();
      nodeMaterial.dispose();
      panelGeometry.dispose();
      panels.forEach((panel) => (panel.material as THREE.Material).dispose());
      orbitRings.forEach((ring) => {
        ring.geometry.dispose();
        (ring.material as THREE.Material).dispose();
      });
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [progressRef]);

  return <div ref={mountRef} className="brand-system-canvas" aria-hidden="true" />;
}
