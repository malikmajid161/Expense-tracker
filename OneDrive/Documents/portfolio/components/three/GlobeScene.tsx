"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import { useRef, Suspense, useMemo } from "react";
import * as THREE from "three";

function Globe() {
  const group = useRef<THREE.Group>(null);
  const atmos = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (group.current) group.current.rotation.y += delta * 0.18;
    if (atmos.current) {
      const t = state.clock.getElapsedTime();
      const mat = atmos.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.12 + Math.sin(t * 1.2) * 0.04;
    }
  });

  // Procedural Earth-like texture via canvas
  const earthTexture = useMemo(() => {
    if (typeof document === "undefined") return null;
    const size = 512;
    const canvas = document.createElement("canvas");
    canvas.width = size * 2;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    // Ocean
    const grad = ctx.createLinearGradient(0, 0, 0, size);
    grad.addColorStop(0, "#0a1628");
    grad.addColorStop(0.5, "#0f2440");
    grad.addColorStop(1, "#0a1628");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size * 2, size);

    // Continents — rough organic blobs
    ctx.fillStyle = "#a855f7";
    const blobs = 48;
    for (let i = 0; i < blobs; i++) {
      const x = Math.random() * size * 2;
      const y = Math.random() * size;
      const r = 15 + Math.random() * 55;
      ctx.beginPath();
      ctx.ellipse(x, y, r, r * (0.5 + Math.random() * 0.8), Math.random() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = "#ec4899";
    for (let i = 0; i < 30; i++) {
      const x = Math.random() * size * 2;
      const y = Math.random() * size;
      const r = 8 + Math.random() * 25;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
    // Glowing dots (cities)
    ctx.fillStyle = "#fef08a";
    for (let i = 0; i < 120; i++) {
      ctx.beginPath();
      ctx.arc(Math.random() * size * 2, Math.random() * size, 1.2, 0, Math.PI * 2);
      ctx.fill();
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    return tex;
  }, []);

  return (
    <group ref={group}>
      {/* Earth */}
      <mesh>
        <sphereGeometry args={[1.3, 64, 64]} />
        <meshStandardMaterial
          map={earthTexture ?? undefined}
          roughness={0.7}
          metalness={0.1}
          emissive="#1a0f3a"
          emissiveIntensity={0.2}
        />
      </mesh>
      {/* Glow atmosphere */}
      <mesh ref={atmos} scale={1.12}>
        <sphereGeometry args={[1.3, 64, 64]} />
        <meshBasicMaterial color="#a855f7" transparent opacity={0.15} side={THREE.BackSide} />
      </mesh>
      <mesh scale={1.25}>
        <sphereGeometry args={[1.3, 64, 64]} />
        <meshBasicMaterial color="#06b6d4" transparent opacity={0.06} side={THREE.BackSide} />
      </mesh>

      {/* Orbital rings */}
      <mesh rotation={[Math.PI / 2.2, 0, 0.3]}>
        <torusGeometry args={[1.8, 0.005, 16, 100]} />
        <meshBasicMaterial color="#a855f7" transparent opacity={0.5} />
      </mesh>
      <mesh rotation={[Math.PI / 1.6, 0.5, 0]}>
        <torusGeometry args={[2.1, 0.004, 16, 100]} />
        <meshBasicMaterial color="#ec4899" transparent opacity={0.4} />
      </mesh>
    </group>
  );
}

export default function GlobeScene() {
  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [0, 0, 4.2], fov: 45 }}
      style={{ width: "100%", height: "100%" }}
    >
      <Suspense fallback={null}>
        <ambientLight intensity={0.3} />
        <directionalLight position={[5, 3, 5]} intensity={1.2} color="#a855f7" />
        <directionalLight position={[-5, -2, 3]} intensity={0.7} color="#ec4899" />
        <Stars radius={50} depth={50} count={1800} factor={4} saturation={0} fade speed={1} />
        <Globe />
      </Suspense>
    </Canvas>
  );
}
