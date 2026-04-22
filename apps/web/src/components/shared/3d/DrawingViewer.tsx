import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

interface DrawingViewerProps {
  src: string;
  className?: string;
}

type ViewKey = 'front' | 'top' | 'side' | 'iso';

const VIEW_LABELS: Record<ViewKey, string> = {
  front: 'Front',
  top: 'Top',
  side: 'Side',
  iso: 'Isometric',
};

const VIEW_DIRECTIONS: Record<ViewKey, THREE.Vector3> = {
  front: new THREE.Vector3(0, 0, 1),
  top: new THREE.Vector3(0, 1, 0),
  side: new THREE.Vector3(1, 0, 0),
  iso: new THREE.Vector3(1, 0.8, 1).normalize(),
};

function createEdgeModel(source: THREE.Object3D): THREE.Group {
  const group = new THREE.Group();
  source.updateWorldMatrix(true, true);
  source.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (!mesh.isMesh || !mesh.geometry) return;
    const edges = new THREE.EdgesGeometry(mesh.geometry, 20);
    const lines = new THREE.LineSegments(
      edges,
      new THREE.LineBasicMaterial({ color: 0x111827 }),
    );
    lines.applyMatrix4(mesh.matrixWorld);
    group.add(lines);
  });
  return group;
}

function renderView(
  mount: HTMLDivElement,
  edges: THREE.Group,
  view: ViewKey,
) {
  const width = mount.clientWidth;
  const height = mount.clientHeight;
  if (width === 0 || height === 0) return () => {};

  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#ffffff');

  const cloned = edges.clone();
  cloned.traverse((obj) => {
    const line = obj as THREE.LineSegments;
    if (line.isLine || line.isLineSegments) {
      line.material = new THREE.LineBasicMaterial({ color: 0x111827 });
    }
  });
  scene.add(cloned);

  const box = new THREE.Box3().setFromObject(cloned);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  cloned.position.sub(center);

  const aspect = width / height;
  const maxDim = Math.max(size.x, size.y, size.z);
  const frustum = maxDim * 1.25;

  const camera = new THREE.OrthographicCamera(
    (-frustum * aspect) / 2,
    (frustum * aspect) / 2,
    frustum / 2,
    -frustum / 2,
    -maxDim * 10,
    maxDim * 10,
  );

  const dir = VIEW_DIRECTIONS[view];
  camera.position.copy(dir).multiplyScalar(maxDim * 4);
  camera.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(width, height);
  mount.appendChild(renderer.domElement);
  renderer.render(scene, camera);

  const handleResize = () => {
    const w = mount.clientWidth;
    const h = mount.clientHeight;
    const a = w / h;
    camera.left = (-frustum * a) / 2;
    camera.right = (frustum * a) / 2;
    camera.top = frustum / 2;
    camera.bottom = -frustum / 2;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
    renderer.render(scene, camera);
  };
  const observer = new ResizeObserver(handleResize);
  observer.observe(mount);

  return () => {
    observer.disconnect();
    renderer.dispose();
    cloned.traverse((obj) => {
      const line = obj as THREE.LineSegments;
      if (line.isLineSegments) {
        line.geometry.dispose();
        (line.material as THREE.Material).dispose();
      }
    });
    if (renderer.domElement.parentNode === mount) {
      mount.removeChild(renderer.domElement);
    }
  };
}

export function DrawingViewer({ src, className }: DrawingViewerProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    let cleanupFns: Array<() => void> = [];
    let disposed = false;

    const loader = new GLTFLoader();
    loader.load(
      src,
      (gltf) => {
        if (disposed) return;
        const edges = createEdgeModel(gltf.scene);

        const panels = root.querySelectorAll<HTMLDivElement>('[data-view]');
        panels.forEach((panel) => {
          const view = panel.dataset.view as ViewKey;
          const cleanup = renderView(panel, edges, view);
          cleanupFns.push(cleanup);
        });
      },
      undefined,
      (err) => console.error('Drawing load failed:', err),
    );

    return () => {
      disposed = true;
      cleanupFns.forEach((fn) => fn());
      cleanupFns = [];
    };
  }, [src]);

  return (
    <div ref={rootRef} className={className}>
      <div className="grid grid-cols-2 grid-rows-2 gap-px bg-[var(--border)] h-full">
        {(Object.keys(VIEW_LABELS) as ViewKey[]).map((view) => (
          <div key={view} className="relative bg-white">
            <div
              data-view={view}
              className="absolute inset-0"
            />
            <div className="absolute top-2 left-2 text-[10px] font-medium uppercase tracking-wider text-[var(--neutral-500)] pointer-events-none">
              {VIEW_LABELS[view]}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
