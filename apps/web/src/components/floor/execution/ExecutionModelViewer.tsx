import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

interface ExecutionModelViewerProps {
  src: string;
  className?: string;
  rotate?: boolean;
}

export function ExecutionModelViewer({ src, className, rotate = true }: ExecutionModelViewerProps) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount || !src) return;

    let disposed = false;
    let cleanup: (() => void) | null = null;

    const loader = new GLTFLoader();
    loader.load(
      src,
      (gltf) => {
        if (disposed) return;
        const presentation = buildPresentationModel(gltf.scene);
        const tryStart = () => {
          if (disposed) return;
          if (mount.clientWidth === 0 || mount.clientHeight === 0) {
            requestAnimationFrame(tryStart);
            return;
          }
          cleanup = renderRotatingIso(mount, presentation, rotate);
        };
        tryStart();
      },
      undefined,
      (err) => {
        console.error('GLB load failed:', err);
      },
    );

    return () => {
      disposed = true;
      cleanup?.();
    };
  }, [src, rotate]);

  return <div ref={mountRef} className={className} />;
}

function buildPresentationModel(source: THREE.Object3D): THREE.Group {
  const group = new THREE.Group();
  source.updateWorldMatrix(true, true);

  source.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (!mesh.isMesh || !mesh.geometry) return;

    const cloned = mesh.clone();
    cloned.geometry = mesh.geometry.clone();
    cloned.matrixAutoUpdate = false;
    cloned.matrix.copy(mesh.matrixWorld);

    cloned.material = new THREE.MeshStandardMaterial({
      color: 0xd4d8df,
      metalness: 0.55,
      roughness: 0.4,
      flatShading: false,
    });
    cloned.castShadow = false;
    cloned.receiveShadow = false;
    group.add(cloned);

    const edges = new THREE.EdgesGeometry(mesh.geometry, 30);
    const lines = new THREE.LineSegments(
      edges,
      new THREE.LineBasicMaterial({ color: 0x111827, transparent: true, opacity: 0.45 }),
    );
    lines.applyMatrix4(mesh.matrixWorld);
    group.add(lines);
  });

  return group;
}

function renderRotatingIso(mount: HTMLDivElement, model: THREE.Group, rotate: boolean) {
  const isDark = () =>
    typeof document !== 'undefined' && document.documentElement.classList.contains('dark');

  const lightLineHex = 0x111827;
  const darkLineHex = 0xe5e7eb;
  const lightFillHex = 0xd4d8df;
  const darkFillHex = 0x6b7280;

  const width = mount.clientWidth;
  const height = mount.clientHeight;
  if (width === 0 || height === 0) return () => {};

  const scene = new THREE.Scene();

  const cloned = model.clone();
  cloned.traverse((obj) => {
    if ((obj as THREE.Mesh).isMesh) {
      const m = obj as THREE.Mesh;
      m.material = (m.material as THREE.Material).clone();
    }
    if ((obj as THREE.LineSegments).isLineSegments) {
      const l = obj as THREE.LineSegments;
      l.material = (l.material as THREE.Material).clone();
    }
  });
  applyTheme(cloned, isDark() ? darkLineHex : lightLineHex, isDark() ? darkFillHex : lightFillHex);
  scene.add(cloned);

  const ambient = new THREE.AmbientLight(0xffffff, 0.55);
  scene.add(ambient);
  const keyLight = new THREE.DirectionalLight(0xffffff, 0.85);
  keyLight.position.set(4, 6, 5);
  scene.add(keyLight);
  const rimLight = new THREE.DirectionalLight(0xfff3c4, 0.4);
  rimLight.position.set(-4, 2, -3);
  scene.add(rimLight);

  const box = new THREE.Box3().setFromObject(cloned);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  cloned.position.sub(center);

  const aspect = width / height;
  const maxDim = Math.max(size.x, size.y, size.z) || 1;
  const frustum = maxDim * 1.05;

  const camera = new THREE.OrthographicCamera(
    (-frustum * aspect) / 2,
    (frustum * aspect) / 2,
    frustum / 2,
    -frustum / 2,
    -maxDim * 10,
    maxDim * 10,
  );

  const dir = new THREE.Vector3(1, 0.8, 1).normalize();
  camera.position.copy(dir).multiplyScalar(maxDim * 4);
  camera.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setClearColor(0x000000, 0);
  renderer.setSize(width, height);
  mount.appendChild(renderer.domElement);
  renderer.render(scene, camera);

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
    renderer.render(scene, camera);
  };
  const observer = new ResizeObserver(handleResize);
  observer.observe(mount);

  const themeObserver = new MutationObserver(() => {
    applyTheme(cloned, isDark() ? darkLineHex : lightLineHex, isDark() ? darkFillHex : lightFillHex);
    renderer.render(scene, camera);
  });
  if (typeof document !== 'undefined') {
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  }

  let frameId = 0;
  if (rotate) {
    let last = performance.now();
    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      cloned.rotation.y += dt * 0.25;
      renderer.render(scene, camera);
      frameId = requestAnimationFrame(tick);
    };
    frameId = requestAnimationFrame(tick);
  }

  let dragging = false;
  let lastX = 0;
  let lastY = 0;
  const onDown = (e: PointerEvent) => {
    dragging = true;
    lastX = e.clientX;
    lastY = e.clientY;
    cancelAnimationFrame(frameId);
    renderer.domElement.setPointerCapture(e.pointerId);
  };
  const onMove = (e: PointerEvent) => {
    if (!dragging) return;
    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;
    lastX = e.clientX;
    lastY = e.clientY;
    cloned.rotation.y += dx * 0.01;
    cloned.rotation.x += dy * 0.01;
    renderer.render(scene, camera);
  };
  const onUp = (e: PointerEvent) => {
    dragging = false;
    renderer.domElement.releasePointerCapture(e.pointerId);
  };
  renderer.domElement.style.touchAction = 'none';
  renderer.domElement.style.cursor = 'grab';
  renderer.domElement.addEventListener('pointerdown', onDown);
  renderer.domElement.addEventListener('pointermove', onMove);
  renderer.domElement.addEventListener('pointerup', onUp);
  renderer.domElement.addEventListener('pointercancel', onUp);

  return () => {
    cancelAnimationFrame(frameId);
    renderer.domElement.removeEventListener('pointerdown', onDown);
    renderer.domElement.removeEventListener('pointermove', onMove);
    renderer.domElement.removeEventListener('pointerup', onUp);
    renderer.domElement.removeEventListener('pointercancel', onUp);
    observer.disconnect();
    themeObserver.disconnect();
    cloned.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (mesh.isMesh) {
        mesh.geometry.dispose();
        (mesh.material as THREE.Material).dispose();
      }
      const line = obj as THREE.LineSegments;
      if (line.isLineSegments) {
        line.geometry.dispose();
        (line.material as THREE.Material).dispose();
      }
    });
    renderer.dispose();
    if (renderer.domElement.parentNode === mount) {
      mount.removeChild(renderer.domElement);
    }
  };
}

function applyTheme(group: THREE.Group, lineHex: number, fillHex: number) {
  group.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (mesh.isMesh && mesh.material) {
      const mat = mesh.material as THREE.MeshStandardMaterial;
      if (mat.color) mat.color.setHex(fillHex);
    }
    const line = obj as THREE.LineSegments;
    if (line.isLineSegments) {
      (line.material as THREE.LineBasicMaterial).color.setHex(lineHex);
    }
  });
}
