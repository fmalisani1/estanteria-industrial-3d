"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

const SPEC = {
  width: 120,
  depth: 40,
  height: 190,
  tube: 2.5,
  shelfThickness: 2,
  shelfCount: 6,
  clearGap: 28,
  topOverhang: 10,
};

function woodTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 768;
  canvas.height = 256;
  const context = canvas.getContext("2d")!;
  const gradient = context.createLinearGradient(0, 0, canvas.width, 0);
  gradient.addColorStop(0, "#8e562e");
  gradient.addColorStop(0.45, "#b97843");
  gradient.addColorStop(1, "#965b32");
  context.fillStyle = gradient;
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.globalAlpha = 0.18;
  for (let index = 0; index < 95; index += 1) {
    const y = (index * 37) % canvas.height;
    const amplitude = 2 + (index % 6);
    context.beginPath();
    context.moveTo(0, y);
    for (let x = 0; x <= canvas.width; x += 24) {
      context.lineTo(x, y + Math.sin((x + index * 19) / 45) * amplitude);
    }
    context.strokeStyle = index % 4 === 0 ? "#3f2415" : "#f1c18d";
    context.lineWidth = index % 7 === 0 ? 2 : 1;
    context.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}

function labelSprite(text: string) {
  const canvas = document.createElement("canvas");
  canvas.width = 360;
  canvas.height = 112;
  const context = canvas.getContext("2d")!;
  context.fillStyle = "rgba(244, 242, 235, .94)";
  context.roundRect(6, 6, 348, 100, 18);
  context.fill();
  context.strokeStyle = "rgba(35, 35, 31, .2)";
  context.lineWidth = 2;
  context.stroke();
  context.fillStyle = "#262621";
  context.font = "600 43px Arial";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(text, 180, 57);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(31, 9.6, 1);
  sprite.renderOrder = 10;
  return sprite;
}

function line(points: THREE.Vector3[], material: THREE.LineBasicMaterial) {
  return new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), material);
}

function createDimensions() {
  const group = new THREE.Group();
  const material = new THREE.LineBasicMaterial({ color: 0x4f4d47, transparent: true, opacity: 0.8 });
  const { width, depth, height } = SPEC;

  const addMeasure = (
    start: THREE.Vector3,
    end: THREE.Vector3,
    label: string,
    labelPosition: THREE.Vector3,
    tickDirection: THREE.Vector3,
  ) => {
    group.add(line([start, end], material));
    const tick = tickDirection.clone().multiplyScalar(3.2);
    group.add(line([start.clone().sub(tick), start.clone().add(tick)], material));
    group.add(line([end.clone().sub(tick), end.clone().add(tick)], material));
    const sprite = labelSprite(label);
    sprite.position.copy(labelPosition);
    group.add(sprite);
  };

  addMeasure(
    new THREE.Vector3(-width / 2, 5, depth / 2 + 13),
    new THREE.Vector3(width / 2, 5, depth / 2 + 13),
    "120 cm",
    new THREE.Vector3(0, 5, depth / 2 + 13),
    new THREE.Vector3(0, 0, 1),
  );
  addMeasure(
    new THREE.Vector3(width / 2 + 14, 13, -depth / 2),
    new THREE.Vector3(width / 2 + 14, 13, depth / 2),
    "40 cm",
    new THREE.Vector3(width / 2 + 14, 13, 0),
    new THREE.Vector3(1, 0, 0),
  );
  addMeasure(
    new THREE.Vector3(-width / 2 - 14, 0, depth / 2 + 2),
    new THREE.Vector3(-width / 2 - 14, height, depth / 2 + 2),
    "190 cm",
    new THREE.Vector3(-width / 2 - 14, height / 2, depth / 2 + 2),
    new THREE.Vector3(1, 0, 0),
  );

  return group;
}

function createShelf() {
  const group = new THREE.Group();
  const { width, depth, height, tube, shelfThickness, shelfCount, clearGap, topOverhang } = SPEC;
  const metal = new THREE.MeshStandardMaterial({ color: 0x111211, roughness: 0.7, metalness: 0.55 });
  const timber = new THREE.MeshStandardMaterial({ map: woodTexture(), color: 0xc28752, roughness: 0.58 });
  const screw = new THREE.MeshStandardMaterial({ color: 0x4b4b47, roughness: 0.35, metalness: 0.82 });

  const box = (
    size: [number, number, number],
    position: [number, number, number],
    material: THREE.Material,
  ) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material);
    mesh.position.set(...position);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);
    return mesh;
  };

  const postX = width / 2 - tube / 2;
  const postZ = depth / 2 - tube / 2;
  for (const x of [-postX, postX]) {
    for (const z of [-postZ, postZ]) box([tube, height, tube], [x, height / 2, z], metal);
  }

  const stackHeight = shelfCount * shelfThickness + (shelfCount - 1) * clearGap;
  const bottomOffset = height - topOverhang - stackHeight;
  for (let index = 0; index < shelfCount; index += 1) {
    const shelfY = bottomOffset + shelfThickness / 2 + index * (shelfThickness + clearGap);
    box([width - tube * 2, shelfThickness, depth - tube * 2], [0, shelfY, 0], timber);
    const supportY = shelfY - shelfThickness / 2 - tube / 2;
    box([tube, tube, depth - tube], [-postX, supportY, 0], metal);
    box([tube, tube, depth - tube], [postX, supportY, 0], metal);
  }

  box([tube, tube, depth], [-postX, height - tube / 2, 0], metal);
  box([tube, tube, depth], [postX, height - tube / 2, 0], metal);

  // Two discreet 3 × 5 cm wall-mounting tabs on the rear uprights.
  for (const x of [-postX, postX]) {
    box([3, 5, 0.38], [x, height - 7.5, -depth / 2 - 0.19], metal);
    const head = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.28, 20), screw);
    head.rotation.x = Math.PI / 2;
    head.position.set(x, height - 7.5, -depth / 2 - 0.45);
    head.castShadow = true;
    group.add(head);
  }

  return group;
}

type ShelfViewerProps = {
  showDimensions: boolean;
  resetSignal: number;
};

export default function ShelfViewer({ showDimensions, resetSignal }: ShelfViewerProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const dimensionsRef = useRef<THREE.Group | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;
    const mount = mountRef.current;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xe8e5dd);
    scene.fog = new THREE.Fog(0xe8e5dd, 330, 620);

    const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 900);
    camera.position.set(205, 145, 245);

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    mount.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 92, 0);
    controls.enableDamping = true;
    controls.dampingFactor = 0.07;
    controls.minDistance = 130;
    controls.maxDistance = 520;
    controls.maxPolarAngle = Math.PI / 2 - 0.03;
    controls.saveState();
    controlsRef.current = controls;

    scene.add(new THREE.HemisphereLight(0xffffff, 0x5a554c, 2.2));
    const key = new THREE.DirectionalLight(0xfff7e6, 3.6);
    key.position.set(110, 240, 150);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    key.shadow.camera.left = -150;
    key.shadow.camera.right = 150;
    key.shadow.camera.top = 240;
    key.shadow.camera.bottom = -30;
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xb9d1dc, 1.15);
    fill.position.set(-140, 120, -90);
    scene.add(fill);

    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(650, 650),
      new THREE.MeshStandardMaterial({ color: 0xd9d5cc, roughness: 0.95 }),
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.15;
    floor.receiveShadow = true;
    scene.add(floor);

    const grid = new THREE.GridHelper(500, 50, 0xb6b0a5, 0xc9c4bb);
    grid.position.y = 0.05;
    const gridMaterials = Array.isArray(grid.material) ? grid.material : [grid.material];
    gridMaterials.forEach((item) => { item.transparent = true; item.opacity = 0.32; });
    scene.add(grid);

    scene.add(createShelf());
    const dimensions = createDimensions();
    dimensions.visible = showDimensions;
    dimensionsRef.current = dimensions;
    scene.add(dimensions);

    const resize = () => {
      const { clientWidth, clientHeight } = mount;
      camera.aspect = clientWidth / Math.max(clientHeight, 1);
      camera.updateProjectionMatrix();
      renderer.setSize(clientWidth, clientHeight, false);
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(mount);
    resize();

    let frame = 0;
    const render = () => {
      controls.update();
      renderer.render(scene, camera);
      frame = requestAnimationFrame(render);
    };
    render();

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      controls.dispose();
      scene.traverse((object) => {
        if (!(object instanceof THREE.Mesh || object instanceof THREE.Line || object instanceof THREE.Sprite)) return;
        object.geometry?.dispose();
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        materials.forEach((item) => {
          if ("map" in item && item.map instanceof THREE.Texture) item.map.dispose();
          item.dispose();
        });
      });
      renderer.dispose();
      renderer.domElement.remove();
      controlsRef.current = null;
      dimensionsRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (dimensionsRef.current) dimensionsRef.current.visible = showDimensions;
  }, [showDimensions]);

  useEffect(() => {
    if (resetSignal > 0) controlsRef.current?.reset();
  }, [resetSignal]);

  return <div className="three-mount" ref={mountRef} aria-label="Modelo 3D interactivo de la estantería" />;
}
