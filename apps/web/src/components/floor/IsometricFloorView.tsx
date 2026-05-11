/**
 * IsometricFloorView — 3D isometric Three.js scene of the shop floor.
 *
 * Each machine renders as a coloured BoxGeometry block on a grid floor.
 * Status drives the colour using the same semantics as LiveFloorView.
 * Pointer hover highlights the block and surfaces machine details in an
 * HTML overlay; click triggers a toast for the same info.
 *
 * Raw Three.js (no R3F) — pattern lifted from ExecutionModelViewer.
 */

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { toast } from 'sonner';
import type { Machine } from '@/types/entities';
import type { MachineStatus } from '@/types/common';

interface IsometricFloorViewProps {
  machines: Machine[];
  className?: string;
}

// Three.js needs numeric hex, so we duplicate the LiveFloorView semantics here
// rather than parsing CSS custom properties at runtime.
const STATUS_COLOR: Record<MachineStatus, number> = {
  running: 0x16a34a,
  idle: 0xf59e0b,
  down: 0xef4444,
  maintenance: 0x2563eb,
  setup: 0x9ca3af,
};

const STATUS_LABEL: Record<MachineStatus, string> = {
  running: 'Running',
  idle: 'Idle',
  down: 'Down',
  maintenance: 'Maintenance',
  setup: 'Setup',
};

const COLS = 4;
const CELL = 1.8; // grid spacing in world units
const BLOCK_W = 1;
const BLOCK_H = 0.6;
const BLOCK_D = 1;

interface HoverInfo {
  machine: Machine;
  x: number;
  y: number;
}

export function IsometricFloorView({ machines, className }: IsometricFloorViewProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<HoverInfo | null>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount || machines.length === 0) return;

    let disposed = false;
    let frameId = 0;

    // Wait for mount to have a size before initialising.
    const start = () => {
      if (disposed) return;
      if (mount.clientWidth === 0 || mount.clientHeight === 0) {
        frameId = requestAnimationFrame(start);
        return;
      }
      cleanup = init(mount, machines, setHover);
    };

    let cleanup: (() => void) | null = null;
    start();

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      cleanup?.();
    };
  }, [machines]);

  return (
    <div ref={mountRef} className={className} style={{ position: 'relative' }}>
      {hover ? (
        <div
          className="pointer-events-none absolute z-10 rounded-md border border-white/10 bg-[var(--neutral-900,_#171717)] px-3 py-2 text-xs text-white shadow-lg"
          style={{
            left: hover.x + 12,
            top: hover.y + 12,
            transform: 'translate3d(0,0,0)',
          }}
        >
          <p className="font-semibold">{hover.machine.name}</p>
          <p className="opacity-70">{hover.machine.workCenter}</p>
          <p className="mt-1">
            <span
              className="inline-block h-2 w-2 rounded-full align-middle"
              style={{
                backgroundColor: `#${STATUS_COLOR[hover.machine.status]
                  .toString(16)
                  .padStart(6, '0')}`,
              }}
            />
            <span className="ml-2 align-middle">
              {STATUS_LABEL[hover.machine.status]}
              {hover.machine.currentJobNumber
                ? ` · ${hover.machine.currentJobNumber}`
                : ''}
            </span>
          </p>
        </div>
      ) : null}
    </div>
  );
}

function init(
  mount: HTMLDivElement,
  machines: Machine[],
  setHover: (h: HoverInfo | null) => void,
): () => void {
  const width = mount.clientWidth;
  const height = mount.clientHeight;

  const scene = new THREE.Scene();
  scene.background = null;

  const rows = Math.ceil(machines.length / COLS);
  const gridW = COLS * CELL;
  const gridD = rows * CELL;

  // ─── Floor plane ──────────────────────────────────────────────────────
  const floorGeo = new THREE.PlaneGeometry(gridW + CELL, gridD + CELL);
  const floorMat = new THREE.MeshStandardMaterial({
    color: 0x1f2937,
    roughness: 0.95,
    metalness: 0.05,
  });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  // Light grid lines on the floor for depth cueing
  const gridHelper = new THREE.GridHelper(
    Math.max(gridW + CELL, gridD + CELL),
    Math.max(COLS, rows) + 1,
    0x374151,
    0x374151,
  );
  (gridHelper.material as THREE.Material).transparent = true;
  (gridHelper.material as THREE.Material).opacity = 0.4;
  gridHelper.position.y = 0.001;
  scene.add(gridHelper);

  // ─── Machine blocks ───────────────────────────────────────────────────
  const blockGeo = new THREE.BoxGeometry(BLOCK_W, BLOCK_H, BLOCK_D);
  const blocks: THREE.Mesh[] = [];
  // Map mesh.uuid → machine for picking
  const blockMachine = new Map<string, Machine>();

  machines.forEach((m, i) => {
    const col = i % COLS;
    const row = Math.floor(i / COLS);
    const x = (col - (COLS - 1) / 2) * CELL;
    const z = (row - (rows - 1) / 2) * CELL;

    const mat = new THREE.MeshStandardMaterial({
      color: STATUS_COLOR[m.status],
      roughness: 0.55,
      metalness: 0.15,
      emissive: 0x000000,
    });
    const mesh = new THREE.Mesh(blockGeo, mat);
    mesh.position.set(x, BLOCK_H / 2, z);
    mesh.userData.baseColor = STATUS_COLOR[m.status];
    scene.add(mesh);
    blocks.push(mesh);
    blockMachine.set(mesh.uuid, m);
  });

  // ─── Lights ───────────────────────────────────────────────────────────
  const ambient = new THREE.AmbientLight(0xffffff, 0.55);
  scene.add(ambient);
  const key = new THREE.DirectionalLight(0xffffff, 0.9);
  key.position.set(5, 8, 4);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xfff3c4, 0.35);
  rim.position.set(-4, 3, -3);
  scene.add(rim);

  // ─── Camera: isometric (x≈35.264°, y=45°) ─────────────────────────────
  const aspect = width / height;
  const frustum = Math.max(gridW, gridD) * 1.4;
  const camera = new THREE.OrthographicCamera(
    (-frustum * aspect) / 2,
    (frustum * aspect) / 2,
    frustum / 2,
    -frustum / 2,
    -100,
    100,
  );
  // True isometric direction: (1,1,1) gives yaw 45° and pitch ≈ 35.264°
  // (the canonical isometric projection angle).
  const isoDir = new THREE.Vector3(1, 1, 1).normalize();
  camera.position.copy(isoDir).multiplyScalar(20);
  camera.lookAt(0, 0, 0);

  // ─── Renderer ─────────────────────────────────────────────────────────
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setClearColor(0x000000, 0);
  renderer.setSize(width, height);
  mount.appendChild(renderer.domElement);

  const render = () => renderer.render(scene, camera);
  render();

  // ─── Picking ──────────────────────────────────────────────────────────
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  let hovered: THREE.Mesh | null = null;

  const setHovered = (mesh: THREE.Mesh | null) => {
    if (hovered === mesh) return;
    if (hovered) {
      const mat = hovered.material as THREE.MeshStandardMaterial;
      mat.emissive.setHex(0x000000);
      hovered.scale.setScalar(1);
    }
    hovered = mesh;
    if (hovered) {
      const mat = hovered.material as THREE.MeshStandardMaterial;
      mat.emissive.setHex(0x444444);
      hovered.scale.setScalar(1.08);
      renderer.domElement.style.cursor = 'pointer';
    } else {
      renderer.domElement.style.cursor = 'default';
    }
    render();
  };

  const pickAt = (clientX: number, clientY: number): THREE.Mesh | null => {
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(blocks, false);
    return hits[0]?.object instanceof THREE.Mesh ? (hits[0].object as THREE.Mesh) : null;
  };

  const onMove = (e: PointerEvent) => {
    const mesh = pickAt(e.clientX, e.clientY);
    setHovered(mesh);
    if (mesh) {
      const machine = blockMachine.get(mesh.uuid);
      const rect = mount.getBoundingClientRect();
      if (machine) {
        setHover({
          machine,
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
      }
    } else {
      setHover(null);
    }
  };
  const onLeave = () => {
    setHovered(null);
    setHover(null);
  };
  const onClick = (e: PointerEvent) => {
    const mesh = pickAt(e.clientX, e.clientY);
    if (!mesh) return;
    const machine = blockMachine.get(mesh.uuid);
    if (!machine) return;
    toast(`${machine.name} — ${STATUS_LABEL[machine.status]}`, {
      description: machine.currentJobNumber
        ? `${machine.workCenter} · Job ${machine.currentJobNumber}`
        : machine.workCenter,
    });
  };

  renderer.domElement.addEventListener('pointermove', onMove);
  renderer.domElement.addEventListener('pointerleave', onLeave);
  renderer.domElement.addEventListener('click', onClick);

  // ─── Resize ───────────────────────────────────────────────────────────
  const handleResize = () => {
    const w = mount.clientWidth;
    const h = mount.clientHeight;
    if (w === 0 || h === 0) return;
    const a = w / h;
    camera.left = (-frustum * a) / 2;
    camera.right = (frustum * a) / 2;
    camera.top = frustum / 2;
    camera.bottom = -frustum / 2;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
    render();
  };
  const observer = new ResizeObserver(handleResize);
  observer.observe(mount);

  // ─── Cleanup ──────────────────────────────────────────────────────────
  return () => {
    renderer.domElement.removeEventListener('pointermove', onMove);
    renderer.domElement.removeEventListener('pointerleave', onLeave);
    renderer.domElement.removeEventListener('click', onClick);
    observer.disconnect();
    blocks.forEach((b) => {
      (b.material as THREE.Material).dispose();
    });
    blockGeo.dispose();
    floorGeo.dispose();
    floorMat.dispose();
    (gridHelper.material as THREE.Material).dispose();
    gridHelper.geometry.dispose();
    renderer.dispose();
    if (renderer.domElement.parentNode === mount) {
      mount.removeChild(renderer.domElement);
    }
  };
}
