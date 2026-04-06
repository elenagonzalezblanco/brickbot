'use client';

import { useRef, useEffect, useState } from 'react';
import type { LegoModel } from '@/types';

// This component renders LDraw models using Three.js
// In production, it uses the LDrawLoader from Three.js addons
// For the MVP, we render a visual representation using basic Three.js primitives

interface LegoViewer3DProps {
  model: LegoModel;
  currentStep: number;
}

export default function LegoViewer3D({ model, currentStep }: LegoViewer3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    let cleanup: (() => void) | undefined;

    // Dynamic import of Three.js to avoid SSR issues
    const init = async () => {
      try {
        const THREE = await import('three');
        const { OrbitControls } = await import('three/addons/controls/OrbitControls.js');

        const container = containerRef.current;
        if (!container) return;

        // Scene setup
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0xf0f4f8);

        // Add gradient background
        const canvas = document.createElement('canvas');
        canvas.width = 2;
        canvas.height = 256;
        const ctx = canvas.getContext('2d')!;
        const gradient = ctx.createLinearGradient(0, 0, 0, 256);
        gradient.addColorStop(0, '#e8f0fe');
        gradient.addColorStop(1, '#f8f9fa');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 2, 256);
        const bgTexture = new THREE.CanvasTexture(canvas);
        scene.background = bgTexture;

        // Camera
        const aspect = container.clientWidth / container.clientHeight;
        const camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 10000);
        camera.position.set(200, 200, 200);

        // Renderer
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;
        container.innerHTML = '';
        container.appendChild(renderer.domElement);

        // Controls
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.target.set(0, 50, 0);
        controls.update();

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);

        const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
        dirLight.position.set(200, 400, 200);
        dirLight.castShadow = true;
        scene.add(dirLight);

        const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
        fillLight.position.set(-200, 200, -200);
        scene.add(fillLight);

        // Ground plate (green baseplate)
        const groundGeo = new THREE.BoxGeometry(300, 4, 300);
        const groundMat = new THREE.MeshPhongMaterial({ color: 0x237841 });
        const ground = new THREE.Mesh(groundGeo, groundMat);
        ground.position.y = -2;
        ground.receiveShadow = true;
        scene.add(ground);

        // Add studs to the baseplate
        for (let x = -140; x <= 140; x += 20) {
          for (let z = -140; z <= 140; z += 20) {
            const studGeo = new THREE.CylinderGeometry(5, 5, 3, 16);
            const studMat = new THREE.MeshPhongMaterial({ color: 0x2d9a50 });
            const stud = new THREE.Mesh(studGeo, studMat);
            stud.position.set(x, 1.5, z);
            scene.add(stud);
          }
        }

        // Parse LDraw-like content and create simplified 3D bricks
        const colorMap: Record<number, number> = {
          0: 0x05131d,   // Black
          1: 0x0055bf,   // Blue
          2: 0x237841,   // Green
          4: 0xc91a09,   // Red
          5: 0x8320b7,   // Purple
          6: 0x583927,   // Brown
          13: 0xfcb4d0,  // Pink
          14: 0xf2cd37,  // Yellow
          15: 0xffffff,  // White
          25: 0xfe8a18,  // Orange
          27: 0xbdc618,  // Lime
          71: 0xa0a5a9,  // Light Bluish Gray
          72: 0x6c6e68,  // Dark Bluish Gray
        };

        // Build bricks from the LDraw content line by line
        const lines = model.ldrawContent.split('\n');
        let stepCount = 0;
        const brickGroup = new THREE.Group();

        for (const line of lines) {
          const trimmed = line.trim();

          if (trimmed === '0 STEP') {
            stepCount++;
            continue;
          }

          // Parse type 1 lines (part references)
          if (trimmed.startsWith('1 ')) {
            // Only show bricks up to (and including) the current step
            if (stepCount > currentStep + 1) continue;

            const parts = trimmed.split(/\s+/);
            if (parts.length < 15) continue;

            const colorCode = parseInt(parts[1]);
            const x = parseFloat(parts[2]);
            const y = parseFloat(parts[3]);
            const z = parseFloat(parts[4]);
            const partFile = parts[14];

            const color = colorMap[colorCode] ?? 0x999999;

            // Determine brick size from part file name
            let width = 40;
            let height = 24;
            let depth = 20;

            if (partFile.includes('3001') || partFile.includes('2x4')) {
              width = 80; depth = 40;
            } else if (partFile.includes('3003') || partFile.includes('2x2')) {
              width = 40; depth = 40;
            } else if (partFile.includes('3004') || partFile.includes('1x2')) {
              width = 40; depth = 20;
            } else if (partFile.includes('3010') || partFile.includes('1x4')) {
              width = 80; depth = 20;
            } else if (partFile.includes('3622') || partFile.includes('1x3')) {
              width = 60; depth = 20;
            } else if (partFile.includes('3009') || partFile.includes('1x6')) {
              width = 120; depth = 20;
            } else if (partFile.includes('3005') || partFile.includes('1x1')) {
              width = 20; depth = 20;
            } else if (partFile.includes('3020')) {
              width = 80; depth = 40; height = 8;  // Plate 2x4
            } else if (partFile.includes('3022')) {
              width = 40; depth = 40; height = 8;  // Plate 2x2
            } else if (partFile.includes('3023')) {
              width = 40; depth = 20; height = 8;  // Plate 1x2
            } else if (partFile.includes('3024')) {
              width = 20; depth = 20; height = 8;  // Plate 1x1
            } else if (partFile.includes('3039') || partFile.includes('slope')) {
              width = 40; depth = 40; height = 24;
            } else if (partFile.includes('3040')) {
              width = 40; depth = 20; height = 24;  // Slope 1x2
            }

            // Create brick body
            const brickGeo = new THREE.BoxGeometry(width - 1, height - 1, depth - 1);
            const brickMat = new THREE.MeshPhongMaterial({
              color,
              shininess: 60,
              specular: 0x333333,
            });
            const brick = new THREE.Mesh(brickGeo, brickMat);
            brick.position.set(x, -y + height / 2, z);
            brick.castShadow = true;
            brick.receiveShadow = true;

            // Fade in bricks from the current step
            if (stepCount === currentStep + 1) {
              brickMat.transparent = true;
              brickMat.opacity = 0.85;
            }

            brickGroup.add(brick);

            // Add studs on top
            const studRows = Math.max(1, Math.round(depth / 20));
            const studCols = Math.max(1, Math.round(width / 20));

            for (let sr = 0; sr < studRows; sr++) {
              for (let sc = 0; sc < studCols; sc++) {
                const studGeo = new THREE.CylinderGeometry(4, 4, 3, 12);
                const studMat = new THREE.MeshPhongMaterial({
                  color,
                  shininess: 80,
                  specular: 0x444444,
                });
                const stud = new THREE.Mesh(studGeo, studMat);
                stud.position.set(
                  x - width / 2 + 10 + sc * 20,
                  -y + height + 1.5,
                  z - depth / 2 + 10 + sr * 20
                );
                if (stepCount === currentStep + 1) {
                  studMat.transparent = true;
                  studMat.opacity = 0.85;
                }
                brickGroup.add(stud);
              }
            }
          }
        }

        // Center the brick group
        scene.add(brickGroup);

        // Fit camera to the model
        const box = new THREE.Box3().setFromObject(brickGroup);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        camera.position.set(center.x + maxDim, center.y + maxDim * 0.8, center.z + maxDim);
        controls.target.copy(center);
        controls.update();

        setIsLoaded(true);

        // Animation loop
        let animId: number;
        const animate = () => {
          animId = requestAnimationFrame(animate);
          controls.update();
          renderer.render(scene, camera);
        };
        animate();

        // Handle resize
        const handleResize = () => {
          if (!container) return;
          const w = container.clientWidth;
          const h = container.clientHeight;
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          renderer.setSize(w, h);
        };
        window.addEventListener('resize', handleResize);

        cleanup = () => {
          cancelAnimationFrame(animId);
          window.removeEventListener('resize', handleResize);
          renderer.dispose();
          scene.clear();
        };
      } catch (e) {
        console.error('Error loading 3D viewer:', e);
        setError('Error al cargar el visor 3D. Asegúrate de que Three.js está instalado.');
      }
    };

    init();

    return () => {
      cleanup?.();
    };
  }, [model, currentStep]);

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-xl">
        <div className="text-center p-8">
          <div className="text-4xl mb-4">⚠️</div>
          <p className="text-gray-500">{error}</p>
          <p className="text-sm text-gray-400 mt-2">Ejecuta <code className="bg-gray-200 px-2 py-1 rounded">npm install</code> para instalar las dependencias</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      <div ref={containerRef} className="w-full h-full" />
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100/80">
          <div className="text-center">
            <div className="w-12 h-12 bg-lego-red rounded-xl animate-bounce mx-auto mb-3" />
            <p className="text-gray-500 text-sm">Cargando visor 3D...</p>
          </div>
        </div>
      )}
      {/* Controls hint */}
      {isLoaded && (
        <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-xl text-xs text-gray-500 shadow">
          🖱️ Arrastra para rotar · Scroll para zoom · Shift+arrastra para mover
        </div>
      )}
    </div>
  );
}
