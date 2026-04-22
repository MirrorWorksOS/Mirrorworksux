import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

interface GlbViewerProps {
  src: string;
  className?: string;
}

export function GlbViewer({ src, className }: GlbViewerProps) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth;
    const height = mount.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#1a1f2b');

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 10000);
    camera.position.set(150, 120, 200);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);

    // PBR environment so metals/plastics look right
    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

    // Lights (augment the env map for crispness)
    const hemi = new THREE.HemisphereLight(0xffffff, 0x2a2f3a, 0.3);
    scene.add(hemi);
    const key = new THREE.DirectionalLight(0xffffff, 1.0);
    key.position.set(120, 180, 150);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xffffff, 0.35);
    fill.position.set(-150, 80, -100);
    scene.add(fill);

    // Subtle ground grid
    const grid = new THREE.GridHelper(600, 30, 0x3a4050, 0x2a2f3a);
    (grid.material as THREE.Material).opacity = 0.35;
    (grid.material as THREE.Material).transparent = true;
    scene.add(grid);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.rotateSpeed = 0.8;

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
            color: 0xb8bcc4,
            metalness: 0.65,
            roughness: 0.38,
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

        grid.position.y = -size * 0.5;
      },
      undefined,
      (err) => {
        console.error('GLB load failed:', err);
      },
    );

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
      pmrem.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, [src]);

  return <div ref={mountRef} className={className} />;
}
