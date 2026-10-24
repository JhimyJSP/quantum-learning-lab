"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useGame } from "@/game/store";
import type { SpriteState } from "@/game/types";
import styles from "./Arena3D.module.css";

type Props = { onSelectCharacter?: (id: string) => void };
type Actor = {
  group: THREE.Group;
  body: THREE.Group;
  arm: THREE.Group;
  halo: THREE.Group;
  ring: THREE.Mesh<THREE.TorusGeometry, THREE.MeshBasicMaterial>;
  beam: THREE.Mesh<THREE.CylinderGeometry, THREE.MeshBasicMaterial>;
  projectile: THREE.Mesh<THREE.IcosahedronGeometry, THREE.MeshBasicMaterial>;
  position: THREE.Vector3;
  lastState: SpriteState;
  stateStarted: number;
};

const HEROES = [
  { id: "char_01", name: "Hadamard", color: 0x4ea8ff, x: -3.5, z: 1.7 },
  { id: "char_02", name: "Grover", color: 0xf4b740, x: -3.7, z: -0.3 },
  { id: "char_03", name: "Shor", color: 0x7cf29a, x: -2.6, z: -2.0 },
];

/** A presentation adapter: only reads the original combat store. */
export function Arena3D({ onSelectCharacter }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const selection = useRef(onSelectCharacter);
  selection.current = onSelectCharacter;
  const cameraActions = useRef<(action: string) => void>(() => undefined);
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    const container = host.current;
    if (!container) return;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
    } catch {
      setUnavailable(true);
      return;
    }
    setUnavailable(false);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.7));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.setAttribute("aria-label", "Arena tridimensional: Hadamard, Grover y Shor se enfrentan a Lorentz Butterfly. Arrastra para girar la cámara.");
    renderer.domElement.setAttribute("role", "img");
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x070b16);
    scene.fog = new THREE.FogExp2(0x070b16, 0.022);
    const camera = new THREE.PerspectiveCamera(43, 1, 0.1, 140);
    const view = { theta: 0.13, height: 6.9, radius: 13.3, zoom: 1 };
    let aspect = 1;
    const target = new THREE.Vector3(0, 0.65, -0.1);
    const updateCamera = () => {
      const fit = Math.max(1, Math.min(1.8, 1.35 / aspect));
      const radius = view.radius * view.zoom * fit;
      camera.position.set(Math.sin(view.theta) * radius, view.height * view.zoom * fit, Math.cos(view.theta) * radius);
      camera.lookAt(target);
    };
    cameraActions.current = action => {
      if (action === "reset") Object.assign(view, { theta: 0.13, height: 6.9, radius: 13.3, zoom: 1 });
      if (action === "in") view.zoom = Math.max(0.72, view.zoom - 0.1);
      if (action === "out") view.zoom = Math.min(1.45, view.zoom + 0.1);
      if (action === "left") view.theta = Math.max(-0.6, view.theta - 0.15);
      if (action === "right") view.theta = Math.min(0.65, view.theta + 0.15);
      updateCamera();
    };

    const geometries = new Set<THREE.BufferGeometry>();
    const materials = new Set<THREE.Material>();
    const geometry = <T extends THREE.BufferGeometry>(g: T): T => { geometries.add(g); return g; };
    const material = <T extends THREE.Material>(m: T): T => { materials.add(m); return m; };
    const metal = material(new THREE.MeshStandardMaterial({ color: 0x263747, metalness: 0.78, roughness: 0.42, flatShading: true }));
    const dark = material(new THREE.MeshStandardMaterial({ color: 0x101c2b, metalness: 0.6, roughness: 0.46, flatShading: true }));
    const floorMaterial = material(new THREE.MeshStandardMaterial({ color: 0x14202f, metalness: 0.72, roughness: 0.5 }));
    const glow = (color: number, opacity = 1) => material(new THREE.MeshBasicMaterial({ color, transparent: opacity < 1, opacity, depthWrite: opacity === 1 }));
    const bodyMaterial = (color: number) => material(new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.12, roughness: 0.38, metalness: 0.7, flatShading: true }));
    const box = geometry(new THREE.BoxGeometry(1, 1, 1));
    const sphere = geometry(new THREE.IcosahedronGeometry(1, 1));
    const octahedron = geometry(new THREE.OctahedronGeometry(1));
    const cylinder = geometry(new THREE.CylinderGeometry(1, 1, 1, 8));
    function mesh(parent: THREE.Object3D, geom: THREE.BufferGeometry, mat: THREE.Material, size: [number, number, number], position: [number, number, number]) {
      const object = new THREE.Mesh(geom, mat);
      object.scale.set(...size); object.position.set(...position);
      object.castShadow = true; object.receiveShadow = true;
      parent.add(object); return object;
    }
    function torus(parent: THREE.Object3D, radius: number, tube: number, color: number, opacity = 1) {
      const ring = new THREE.Mesh(geometry(new THREE.TorusGeometry(radius, tube, 7, 64)), glow(color, opacity));
      parent.add(ring); return ring;
    }
    const hemi = new THREE.HemisphereLight(0x96bfff, 0x101326, 2.1);
    scene.add(hemi);
    const key = new THREE.DirectionalLight(0xe9efff, 3.8);
    key.position.set(-3, 12, 6); key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.left = -10; key.shadow.camera.right = 10;
    key.shadow.camera.top = 10; key.shadow.camera.bottom = -10;
    key.shadow.normalBias = 0.03; key.shadow.bias = -0.0001;
    scene.add(key);
    const cyan = new THREE.PointLight(0x3698ff, 28, 18, 2);
    cyan.position.set(-5, 4, 3); scene.add(cyan);
    const crimson = new THREE.PointLight(0xff3767, 38, 17, 2);
    crimson.position.set(4, 4, -1); scene.add(crimson);

    // The fractured observatory is genuine geometry; no image backdrop is required.
    const island = new THREE.Group(); scene.add(island);
    mesh(island, geometry(new THREE.CylinderGeometry(6.6, 6.9, 0.46, 8)), floorMaterial, [1, 1, 1], [0, -0.32, 0]);
    mesh(island, geometry(new THREE.CylinderGeometry(6.9, 5.3, 0.65, 8)), dark, [1, 1, 1], [0, -0.86, 0]);
    const perimeter = torus(island, 6.45, 0.028, 0x4fa9dd, 0.7); perimeter.rotation.x = Math.PI / 2; perimeter.position.y = -0.075;
    const innerRing = torus(island, 4.6, 0.012, 0x668397, 0.38); innerRing.rotation.x = Math.PI / 2; innerRing.position.y = -0.07;
    const centerRing = torus(island, 1.3, 0.015, 0x83b3cc, 0.28); centerRing.rotation.x = Math.PI / 2; centerRing.position.y = -0.065;
    for (let i = -5; i <= 5; i++) {
      const width = Math.sqrt(Math.max(0, 6.1 ** 2 - i ** 2)) * 2;
      mesh(island, box, glow(0x42627f, 0.16), [width, 0.008, 0.012], [0, -0.075, i]);
      mesh(island, box, glow(0x42627f, 0.16), [0.012, 0.008, width], [i, -0.075, 0]);
    }
    for (let i = 0; i < 8; i++) {
      const angle = i / 8 * Math.PI * 2;
      const edge = mesh(island, box, metal, [0.55, 0.22, 1.25], [Math.sin(angle) * 6.5, -0.08, Math.cos(angle) * 6.5]);
      edge.rotation.y = angle;
      const strip = mesh(edge, box, glow(i % 2 ? 0xddbb76 : 0x69d0ff), [0.3, 0.055, 0.7], [0, 0.58, 0]);
      strip.castShadow = false;
    }
    for (let i = 0; i < 9; i++) {
      const angle = Math.PI * (0.57 + i / 9 * 0.9);
      const height = 1.8 + (i % 3) * 1.1;
      const pillar = mesh(scene, box, dark, [0.6, height, 0.6], [Math.cos(angle) * 8.7, height / 2 - 0.3, Math.sin(angle) * -8.7 - 3]);
      pillar.rotation.z = (i % 2 ? -1 : 1) * 0.08;
      mesh(pillar, box, glow(0x3b6ca0, 0.7), [0.06, 0.73, 1.015], [0, 0.05, 0.03]);
    }
    const planet = mesh(scene, geometry(new THREE.SphereGeometry(6.5, 32, 20)), material(new THREE.MeshStandardMaterial({ color: 0x1a344d, roughness: 1, emissive: 0x0c2342, emissiveIntensity: 0.5 })), [1, 1, 1], [9, 8, -28]);
    const planetRing = torus(scene, 9.1, 0.065, 0x4b7d9a, 0.35); planetRing.position.copy(planet.position); planetRing.rotation.set(1.05, 0.35, -0.3);
    const stars = new Float32Array(420 * 3);
    // Fixed star placement avoids a different scene on each rendering.
    for (let i = 0; i < 420; i++) {
      const a = i * 2.39996, b = Math.sin(i * 78.233) * 43758.5453;
      const r = 28 + (b - Math.floor(b)) * 35;
      stars[i * 3] = Math.cos(a) * r;
      stars[i * 3 + 1] = 4 + Math.abs(Math.sin(i * 1.73)) * 24;
      stars[i * 3 + 2] = -12 - Math.abs(Math.sin(a)) * r;
    }
    const starGeo = geometry(new THREE.BufferGeometry()); starGeo.setAttribute("position", new THREE.BufferAttribute(stars, 3));
    scene.add(new THREE.Points(starGeo, material(new THREE.PointsMaterial({ color: 0xabc9e8, size: 0.065, transparent: true, opacity: 0.65, sizeAttenuation: true }))));

    const actors = new Map<string, Actor>();
    const clickable: THREE.Object3D[] = [];
    HEROES.forEach((hero, index) => {
      const group = new THREE.Group(); group.position.set(hero.x, 0, hero.z); scene.add(group);
      const body = new THREE.Group(); group.add(body); body.rotation.y = 0.32;
      const armor = bodyMaterial(hero.color);
      const light = glow(hero.color);
      const visor = glow(index === 1 ? 0xffdf87 : index === 2 ? 0xb2ffd2 : 0xace5ff);
      const ring = torus(group, 0.63, 0.024, hero.color, 0.85); ring.rotation.x = Math.PI / 2; ring.position.y = 0.01;
      const pad = mesh(group, geometry(new THREE.CylinderGeometry(0.69, 0.75, 0.1, 6)), metal, [1, 1, 1], [0, -0.025, 0]);
      pad.rotation.y = Math.PI / 6;
      // Boots and segmented legs give each operative a clear humanoid silhouette.
      for (const side of [-1, 1]) {
        mesh(body, box, dark, [0.25, 0.18, 0.42], [side * 0.2, 0.14, 0.075]);
        mesh(body, box, metal, [0.2, 0.53, 0.22], [side * 0.2, 0.47, 0]);
        mesh(body, box, armor, [0.22, 0.1, 0.27], [side * 0.2, 0.66, 0.04]);
        mesh(body, box, dark, [0.22, 0.36, 0.25], [side * 0.2, 0.86, 0]);
      }
      mesh(body, box, dark, [0.58, 0.22, 0.34], [0, 0.99, 0]);
      const torso = mesh(body, geometry(new THREE.CylinderGeometry(index === 1 ? 0.47 : 0.38, 0.27, 0.67, 5)), armor, [1, 1, 0.65], [0, 1.35, 0]);
      torso.rotation.y = Math.PI / 5;
      mesh(body, box, dark, [0.36, 0.34, 0.05], [0, 1.36, 0.25]);
      const core = mesh(body, octahedron, light, [0.12, 0.16, 0.08], [0, 1.39, 0.3]); core.rotation.z = index * Math.PI / 4;
      mesh(body, cylinder, metal, [0.12, 0.15, 0.12], [0, 1.72, 0]);
      const helmet = mesh(body, index === 2 ? octahedron : box, metal, index === 2 ? [0.32, 0.35, 0.27] : [0.47, 0.42, 0.42], [0, 1.98, 0]);
      helmet.rotation.y = index === 1 ? 0.15 : 0;
      mesh(body, box, visor, [0.37, 0.075, 0.035], [0, 2.0, 0.228]);
      mesh(body, box, dark, [0.25, 0.13, 0.04], [0, 1.84, 0.23]);
      for (const side of [-1, 1]) {
        const shoulder = mesh(body, box, armor, [index === 1 ? 0.38 : 0.28, 0.2, 0.4], [side * 0.5, 1.6, 0]); shoulder.rotation.z = side * -0.16;
        mesh(body, sphere, metal, [0.115, 0.115, 0.115], [side * 0.48, 1.44, 0]);
        if (side === -1) {
          mesh(body, box, metal, [0.18, 0.52, 0.2], [-0.54, 1.13, 0]);
          mesh(body, box, light, [0.035, 0.29, 0.205], [-0.56, 1.14, 0]);
        }
      }
      const arm = new THREE.Group(); arm.position.set(0.48, 1.45, 0); body.add(arm);
      mesh(arm, box, metal, [0.18, 0.5, 0.22], [0.04, -0.24, 0.05]);
      mesh(arm, box, light, [0.185, 0.1, 0.23], [0.04, -0.37, 0.05]);
      mesh(arm, sphere, dark, [0.13, 0.15, 0.13], [0.04, -0.53, 0.05]);
      const halo = new THREE.Group(); halo.position.set(0, 1.5, -0.17); body.add(halo);
      if (index === 0) {
        const gate = torus(halo, 0.73, 0.023, hero.color, 0.8); gate.rotation.y = 0.32;
        for (let j = 0; j < 4; j++) { const shard = mesh(halo, octahedron, light, [0.08, 0.08, 0.05], [Math.sin(j * Math.PI / 2) * 0.73, Math.cos(j * Math.PI / 2) * 0.73, 0]); shard.rotation.z = j; }
      } else if (index === 1) {
        mesh(arm, cylinder, dark, [0.045, 1.2, 0.045], [0.1, 0.06, 0.12]);
        const lens = torus(arm, 0.22, 0.025, hero.color); lens.position.set(0.1, 0.71, 0.12);
        mesh(arm, octahedron, light, [0.11, 0.11, 0.08], [0.1, 0.71, 0.12]);
        for (let j = 0; j < 3; j++) mesh(halo, octahedron, armor, [0.16, 0.16, 0.12], [Math.sin(j * 2.1) * 0.72, Math.cos(j * 2.1) * 0.72, 0]);
      } else {
        const coat = mesh(body, geometry(new THREE.ConeGeometry(0.48, 1.05, 5, 1, true)), dark, [1, 1, 0.65], [0, 0.94, -0.13]); coat.rotation.z = Math.PI; coat.rotation.y = 0.3;
        mesh(arm, box, light, [0.055, 1.0, 0.12], [0.06, -0.02, 0.14]).rotation.z = -0.2;
        const orbit = torus(halo, 0.68, 0.018, hero.color, 0.6); orbit.rotation.x = 0.65; orbit.rotation.y = 0.7;
        const orbit2 = torus(halo, 0.68, 0.018, hero.color, 0.6); orbit2.rotation.x = -0.65; orbit2.rotation.y = -0.7;
      }
      const beam = new THREE.Mesh(geometry(new THREE.CylinderGeometry(0.035, 0.035, 1, 7)), glow(hero.color, 0.8)); beam.visible = false; scene.add(beam);
      const projectile = new THREE.Mesh(geometry(new THREE.IcosahedronGeometry(0.1, 1)), light); projectile.visible = false; scene.add(projectile);
      group.traverse(object => { if (object instanceof THREE.Mesh) { object.userData.characterId = hero.id; clickable.push(object); } });
      actors.set(hero.id, { group, body, arm, halo, ring, beam, projectile, position: group.position.clone(), lastState: "idle", stateStarted: 0 });
    });

    // Lorentz Butterfly: crystalline wings around an unstable luminous core.
    const boss = new THREE.Group(); boss.position.set(2.7, 1.55, -0.5); scene.add(boss);
    const bossBase = boss.position.clone();
    const bossMetal = material(new THREE.MeshStandardMaterial({ color: 0x4f1735, emissive: 0x5a1230, emissiveIntensity: 0.36, metalness: 0.65, roughness: 0.3, flatShading: true, side: THREE.DoubleSide }));
    const bossGlow = glow(0xff547a);
    const core = mesh(boss, geometry(new THREE.IcosahedronGeometry(0.52, 1)), bossMetal, [0.7, 1.3, 0.75], [0, 0, 0]);
    mesh(boss, octahedron, bossGlow, [0.13, 0.42, 0.15], [0, 0, 0.41]);
    mesh(boss, sphere, dark, [0.23, 0.25, 0.24], [0, 0.65, 0]);
    mesh(boss, box, bossGlow, [0.32, 0.035, 0.04], [0, 0.71, 0.21]);
    const wings: THREE.Group[] = [];
    [-1, 1].forEach(side => {
      const wing = new THREE.Group(); wing.position.x = side * 0.16; boss.add(wing); wings.push(wing);
      const shape = new THREE.Shape();
      shape.moveTo(0, 0); shape.lineTo(side * 1.95, 1.18); shape.lineTo(side * 1.55, -0.15); shape.lineTo(side * 0.45, -0.5); shape.closePath();
      const main = new THREE.Mesh(geometry(new THREE.ExtrudeGeometry(shape, { depth: 0.12, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.04, bevelSegments: 1, steps: 1 })), bossMetal); main.castShadow = true; wing.add(main);
      const lower = mesh(wing, octahedron, bossMetal, [0.75, 0.8, 0.13], [side * 0.72, -0.72, 0]); lower.rotation.z = side * 0.6;
      const vein = mesh(wing, box, glow(0xe14778, 0.95), [1.85, 0.035, 0.03], [side * 0.98, 0.48, 0.17]); vein.rotation.z = side * 0.46;
      for (let j = 0; j < 3; j++) mesh(wing, octahedron, glow(0xe469a4, 0.8), [0.08, 0.13, 0.035], [side * (0.5 + j * 0.38), 0.15 + j * 0.22, 0.2]);
    });
    const bossOrbit = torus(boss, 1.0, 0.015, 0xff547a, 0.55); bossOrbit.rotation.x = Math.PI / 2;
    const bossPad = torus(scene, 1.6, 0.025, 0xf54c79, 0.65); bossPad.rotation.x = Math.PI / 2; bossPad.position.set(bossBase.x, 0.01, bossBase.z);
    const shards = new THREE.Group(); boss.add(shards);
    for (let i = 0; i < 6; i++) {
      const shard = mesh(shards, octahedron, bossMetal, [0.1, 0.28, 0.08], [Math.cos(i) * 1.9, Math.sin(i) * 1.3, Math.sin(i * 2) * 0.65]); shard.rotation.z = i;
    }
    const enemyBeam = new THREE.Mesh(geometry(new THREE.CylinderGeometry(0.07, 0.07, 1, 7)), glow(0xff4b78, 0.8)); enemyBeam.visible = false; scene.add(enemyBeam);

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const drag = { active: false, x: 0, y: 0, distance: 0 };
    const canvas = renderer.domElement;
    const pointerDown = (event: PointerEvent) => {
      if (event.button !== 0) return;
      drag.active = true; drag.x = event.clientX; drag.y = event.clientY; drag.distance = 0;
      canvas.setPointerCapture(event.pointerId);
    };
    const pointerMove = (event: PointerEvent) => {
      if (!drag.active) return;
      const dx = event.clientX - drag.x, dy = event.clientY - drag.y;
      drag.distance += Math.abs(dx) + Math.abs(dy);
      view.theta = THREE.MathUtils.clamp(view.theta - dx * 0.003, -0.6, 0.65);
      view.height = THREE.MathUtils.clamp(view.height + dy * 0.02, 4.3, 10.3);
      drag.x = event.clientX; drag.y = event.clientY; updateCamera();
    };
    const pointerUp = (event: PointerEvent) => {
      if (!drag.active) return;
      drag.active = false;
      if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
      if (drag.distance > 7) return;
      const rect = canvas.getBoundingClientRect();
      pointer.set((event.clientX - rect.left) / rect.width * 2 - 1, -((event.clientY - rect.top) / rect.height) * 2 + 1);
      raycaster.setFromCamera(pointer, camera);
      const hit = raycaster.intersectObjects(clickable, false)[0];
      if (hit?.object.userData.characterId) selection.current?.(hit.object.userData.characterId as string);
    };
    const pointerCancel = () => { drag.active = false; };
    canvas.addEventListener("pointerdown", pointerDown);
    canvas.addEventListener("pointermove", pointerMove);
    canvas.addEventListener("pointerup", pointerUp);
    canvas.addEventListener("pointercancel", pointerCancel);
    const lost = (event: Event) => { event.preventDefault(); setUnavailable(true); };
    canvas.addEventListener("webglcontextlost", lost);
    const resize = new ResizeObserver(() => {
      const width = Math.max(1, container.clientWidth), height = Math.max(1, container.clientHeight);
      aspect = width / height; camera.aspect = aspect; camera.updateProjectionMatrix();
      renderer.setSize(width, height, false); updateCamera();
    });
    resize.observe(container);

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const origin = performance.now();
    let frame = 0;
    let enemyState: SpriteState = "idle", enemyStarted = 0;
    const start = new THREE.Vector3(), end = new THREE.Vector3(), direction = new THREE.Vector3();
    const yAxis = new THREE.Vector3(0, 1, 0);
    function alignBeam(beam: THREE.Mesh, from: THREE.Vector3, to: THREE.Vector3, thickness = 1) {
      direction.subVectors(to, from);
      beam.position.copy(from).add(to).multiplyScalar(0.5);
      beam.scale.set(thickness, direction.length(), thickness);
      beam.quaternion.setFromUnitVectors(yAxis, direction.normalize());
    }
    const animate = () => {
      frame = requestAnimationFrame(animate);
      const elapsed = (performance.now() - origin) / 1000;
      const motion = reduced.matches ? 0 : 1;
      const current = useGame.getState();
      HEROES.forEach((hero, i) => {
        const actor = actors.get(hero.id)!;
        const character = current.characters.find(item => item.id === hero.id);
        const state = character?.spriteState || "idle";
        if (state !== actor.lastState) { actor.lastState = state; actor.stateStarted = elapsed; }
        const age = elapsed - actor.stateStarted;
        const physical = state === "attack-physical", logical = state === "attack-logical", ultimate = state === "ultimate";
        const attacking = physical || logical || ultimate;
        const duration = ultimate ? 1.3 : 0.75;
        const p = Math.min(1, age / duration);
        actor.group.position.copy(actor.position);
        actor.group.position.x += physical ? Math.sin(p * Math.PI) * 0.9 * motion : state === "hit" ? Math.sin(age * 45) * 0.08 * motion : 0;
        actor.body.position.y = state === "dead" ? -0.35 : (logical || ultimate ? Math.sin(p * Math.PI) * 0.5 : Math.sin(elapsed * 1.5 + i) * 0.035) * motion;
        actor.body.rotation.z = state === "dead" ? -0.65 : state === "hit" ? Math.sin(age * 35) * 0.05 * motion : physical ? -Math.sin(p * Math.PI) * 0.15 * motion : 0;
        actor.arm.rotation.x = attacking ? -0.8 * Math.sin(p * Math.PI) * motion : Math.sin(elapsed * 1.4 + i) * 0.04 * motion;
        actor.halo.rotation.z = elapsed * (ultimate ? 3 : 0.22) * motion;
        actor.ring.material.opacity = character?.alive === false ? 0.12 : ultimate ? 0.7 + Math.sin(elapsed * 15) * 0.3 : 0.65;
        const ringScale = ultimate ? 1 + Math.sin(p * Math.PI) * 0.6 * motion : 1;
        actor.ring.scale.setScalar(ringScale);
        actor.group.scale.setScalar(state === "dead" ? 0.82 : 1);
        actor.beam.visible = attacking && !physical && age < duration && p > 0.15 && p < 0.92;
        actor.projectile.visible = physical && age < duration && p > 0.12;
        if (attacking) {
          start.copy(actor.group.position).add(new THREE.Vector3(0.4, 1.45, 0));
          end.copy(boss.position);
          alignBeam(actor.beam, start, end, ultimate ? 2.2 : 1);
          actor.projectile.position.lerpVectors(start, end, Math.min(1, p * 1.3));
        }
      });
      const state = current.enemy.spriteState;
      if (enemyState !== state) { enemyState = state; enemyStarted = elapsed; }
      const enemyAge = elapsed - enemyStarted;
      boss.position.copy(bossBase);
      boss.position.y += state === "dead" ? -0.8 : Math.sin(elapsed * 1.2) * 0.12 * motion;
      if (state === "hit") boss.position.x += Math.sin(enemyAge * 36) * 0.12 * motion;
      if (state === "attack-physical") boss.position.x -= Math.sin(Math.min(1, enemyAge / 0.7) * Math.PI) * 0.8 * motion;
      boss.rotation.z = state === "dead" ? -0.55 : Math.sin(elapsed * 0.8) * 0.025 * motion;
      boss.scale.setScalar(state === "dead" ? 0.6 : 1);
      core.rotation.y = elapsed * 0.35 * motion;
      wings.forEach((wing, i) => { wing.rotation.y = (i === 0 ? 1 : -1) * Math.sin(elapsed * (state === "attack-physical" ? 8 : 2.2)) * 0.22 * motion; });
      shards.rotation.z = elapsed * 0.1 * motion;
      bossOrbit.rotation.z = elapsed * 0.2 * motion;
      bossPad.material.opacity = state === "hit" ? 1 : state === "dead" ? 0.15 : 0.55;
      enemyBeam.visible = state === "attack-physical" && enemyAge < 0.65 && enemyAge > 0.14;
      if (enemyBeam.visible) {
        const victim = current.characters[current.enemy.intent.targetIndex ?? 0];
        const actor = victim && actors.get(victim.id);
        if (actor) { start.copy(boss.position); end.copy(actor.group.position).add(new THREE.Vector3(0, 1.3, 0)); alignBeam(enemyBeam, start, end); }
      }
      renderer.render(scene, camera);
    };
    updateCamera(); animate();
    return () => {
      cancelAnimationFrame(frame); resize.disconnect();
      cameraActions.current = () => undefined;
      canvas.removeEventListener("pointerdown", pointerDown); canvas.removeEventListener("pointermove", pointerMove);
      canvas.removeEventListener("pointerup", pointerUp); canvas.removeEventListener("pointercancel", pointerCancel);
      canvas.removeEventListener("webglcontextlost", lost);
      geometries.forEach(item => item.dispose()); materials.forEach(item => item.dispose());
      renderer.dispose();
      if (canvas.parentNode === container) container.removeChild(canvas);
    };
  }, []);

  return <div className={styles.arena}>
    <div className={styles.canvas} ref={host} />
    {unavailable && <div className={styles.fallback} role="status"><div className={styles.fallbackTeam}>{HEROES.map(hero => <span key={hero.id} style={{ color: `#${hero.color.toString(16).padStart(6, "0")}` }}><i /><strong>{hero.name}</strong></span>)}</div><strong>WebGL no está disponible en este navegador.</strong><p>El combate de cartas sigue activo. La escena 3D requiere aceleración gráfica.</p></div>}
    {!unavailable && <>
      <span className={styles.sceneLabel}>ARENA 3D <i /> OBSERVATORIO LORENTZ</span>
      <div className={styles.camera} role="group" aria-label="Cámara de la arena">
        <button type="button" aria-label="Girar cámara a la izquierda" title="Girar a la izquierda" onClick={() => cameraActions.current("left")}>↶</button>
        <button type="button" aria-label="Girar cámara a la derecha" title="Girar a la derecha" onClick={() => cameraActions.current("right")}>↷</button>
        <span />
        <button type="button" aria-label="Acercar cámara" title="Acercar" onClick={() => cameraActions.current("in")}>+</button>
        <button type="button" aria-label="Alejar cámara" title="Alejar" onClick={() => cameraActions.current("out")}>−</button>
        <button type="button" aria-label="Restablecer cámara" title="Restablecer cámara" onClick={() => cameraActions.current("reset")}>⌖</button>
      </div>
      <span className={styles.hint}>ARRASTRA PARA ORBITAR <b>·</b> TOCA UN OPERADOR PARA INSPECCIONARLO</span>
    </>}
  </div>;
}
