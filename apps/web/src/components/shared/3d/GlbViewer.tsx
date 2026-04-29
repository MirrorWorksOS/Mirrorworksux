import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

export type GlbViewerMode = 'orbit' | 'pan';

export interface GlbViewerApi {
  reset(): void;
  setMode(mode: GlbViewerMode): void;
}

interface GlbViewerProps {
  src: string;
  className?: string;
  background?: string;
  modelColor?: number;
  modelMetalness?: number;
  modelRoughness?: number;
  shadows?: boolean;
  gridColor?: [number, number];
  gridOpacity?: number;
  onReady?: (api: GlbViewerApi) => void;
}

export function GlbViewer({
  src,
  className,
  background = '#1a1f2b',
  modelColor = 0xb8bcc4,
  modelMetalness = 0.65,
  modelRoughness = 0.38,
  shadows = false,
  gridColor = [0x3a4050, 0x2a2f3a],
  gridOpacity = 0.35,
  onReady,
}: GlbViewerProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const onReadyRef = useRef(onReady);
  onReadyRef.current = onReady;

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth;
    const height = mount.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(background);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 10000);
    camera.position.set(150, 120, 200);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    if (shadows) {
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    }
    mount.appendChild(renderer.domElement);

    // PBR environment so metals/plastics look right
    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

    // Lights (augment the env map for crispness)
    const hemi = new THREE.HemisphereLight(0xffffff, 0x2a2f3a, 0.3);
    scene.add(hemi);
    const key = new THREE.DirectionalLight(0xffffff, 1.0);
    key.position.set(120, 180, 150);
    if (shadows) {
      key.castShadow = true;
      key.shadow.mapSize.set(1024, 1024);
      key.shadow.bias = -0.0005;
      key.shadow.normalBias = 0.02;
    }
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xffffff, 0.35);
    fill.position.set(-150, 80, -100);
    scene.add(fill);

    // Subtle ground grid
    const grid =
      gridOpacity > 0
        ? new THREE.GridHelper(600, 30, gridColor[0], gridColor[1])
        : null;
    if (grid) {
      (grid.material as THREE.Material).opacity = gridOpacity;
      (grid.material as THREE.Material).transparent = true;
      scene.add(grid);
    }

    // Optional shadow-receiving floor (only when shadows are on)
    const shadowPlane = shadows
      ? new THREE.Mesh(
          new THREE.PlaneGeometry(2000, 2000),
          new THREE.ShadowMaterial({ opacity: 0.18 }),
        )
      : null;
    if (shadowPlane) {
      shadowPlane.rotation.x = -Math.PI / 2;
      shadowPlane.receiveShadow = true;
      scene.add(shadowPlane);
    }

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.rotateSpeed = 0.8;
    controls.saveState();

    let model: THREE.Object3D | null = null;
    let disposed = false;

    const loader = new GLTFLoader();
    loader.load(
      src,
      (gltf) => {
        if (disposed) return;
        model = gltf.scene;

        // Override materials: brushed-steel PBR so environment lighting gives
        // real shading and specular highlights instead of flat white.
        model.traverse((obj) => {
          const mesh = obj as THREE.Mesh;
          if (!mesh.isMesh) return;
          const old = mesh.material as THREE.Material | THREE.Material[];
          if (Array.isArray(old)) old.forEach((m) => m.dispose());
          else old.dispose();
          mesh.material = new THREE.MeshStandardMaterial({
            color: modelColor,
            metalness: modelMetalness,
            roughness: modelRoughness,
            envMapIntensity: 1.0,
          });
          mesh.castShadow = true;
          mesh.receiveShadow = true;
        });

        scene.add(model);

        // Frame the model
        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3()).length();
        const center = box.getCenter(new THREE.Vector3());
        model.position.sub(center);

        camera.near = size / 100;
        camera.far = size * 100;
        camera.updateProjectionMatrix();
        camera.position.set(size * 0.6, size * 0.5, size * 0.9);
        controls.target.set(0, 0, 0);
        controls.update();
        controls.saveState();

        const floorY = -size * 0.5;
        if (grid) grid.position.y = floorY;
        if (shadowPlane) shadowPlane.position.y = floorY;

        if (shadows) {
          const r = size * 1.5;
          const cam = key.shadow.camera as THREE.OrthographicCamera;
          cam.left = -r;
          cam.right = r;
          cam.top = r;
          cam.bottom = -r;
          cam.near = 0.1;
          cam.far = size * 6;
          cam.position.copy(key.position);
          cam.updateProjectionMatrix();
        }
      },
      undefined,
      (err) => {
        console.error('GLB load failed:', err);
      },
    );

    // Imperative API for parent toolbars
    const api: GlbViewerApi = {
      reset() {
        controls.reset();
      },
      setMode(mode) {
        if (mode === 'pan') {
          controls.mouseButtons = {
            LEFT: THREE.MOUSE.PAN,
            MIDDLE: THREE.MOUSE.DOLLY,
            RIGHT: THREE.MOUSE.ROTATE,
          };
        } else {
          controls.mouseButtons = {
            LEFT: THREE.MOUSE.ROTATE,
            MIDDLE: THREE.MOUSE.DOLLY,
            RIGHT: THREE.MOUSE.PAN,
          };
        }
      },
    };
    onReadyRef.current?.(api);

    let raf = 0;
    const tick = () => {
      controls.update();
      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    };
    tick();

    const handleResize = () => {
      if (!mount) return;
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    const observer = new ResizeObserver(handleResize);
    observer.observe(mount);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      observer.disconnect();
      controls.dispose();
      if (model) {
        model.traverse((obj) => {
          if ((obj as THREE.Mesh).isMesh) {
            const mesh = obj as THREE.Mesh;
            mesh.geometry.dispose();
            const mat = mesh.material as THREE.Material | THREE.Material[];
            if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
            else mat.dispose();
          }
        });
      }
      if (shadowPlane) {
        shadowPlane.geometry.dispose();
        (shadowPlane.material as THREE.Material).dispose();
      }
      pmrem.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, [
    src,
    background,
    modelColor,
    modelMetalness,
    modelRoughness,
    shadows,
    gridColor,
    gridOpacity,
  ]);

  return <div ref={mountRef} className={className} />;
}
