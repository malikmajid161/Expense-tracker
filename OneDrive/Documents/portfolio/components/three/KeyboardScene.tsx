"use client";

import { Canvas, useFrame, ThreeEvent } from "@react-three/fiber";
import { Html, Float, Environment } from "@react-three/drei";
import { useRef, useState, Suspense } from "react";
import type { Group, Mesh } from "three";
import { KEYCAPS, type KeyCap } from "@/lib/constants";

function KeyCapMesh({
  cap,
  position,
  onHover,
  onUnhover,
}: {
  cap: KeyCap;
  position: [number, number, number];
  onHover: (label: string, pos: [number, number, number]) => void;
  onUnhover: () => void;
}) {
  const ref = useRef<Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((_, delta) => {
    if (!ref.current) return;
    const target = hovered ? -0.18 : 0;
    ref.current.position.y += (target - ref.current.position.y) * Math.min(delta * 10, 1);
  });

  return (
    <group position={position}>
      {/* base / stem */}
      <mesh position={[0, -0.25, 0]}>
        <boxGeometry args={[0.38, 0.08, 0.38]} />
        <meshStandardMaterial color="#16161f" roughness={0.8} />
      </mesh>
      {/* keycap */}
      <mesh
        ref={ref}
        onPointerOver={(e: ThreeEvent<PointerEvent>) => {
          e.stopPropagation();
          setHovered(true);
          onHover(cap.label, position);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          setHovered(false);
          onUnhover();
          document.body.style.cursor = "";
        }}
        castShadow
      >
        <boxGeometry args={[0.42, 0.18, 0.42]} />
        <meshStandardMaterial
          color={cap.color}
          emissive={cap.color}
          emissiveIntensity={hovered ? 0.55 : 0.12}
          roughness={0.4}
          metalness={0.15}
          toneMapped={false}
        />
      </mesh>
      {/* label on keycap — billboard (no transform) so it always faces the camera */}
      <Html position={[0, 0.22, 0]} center distanceFactor={6}>
        <div
          style={{ color: cap.label === "JS" || cap.label === "Firebase" ? "#111" : "#fff" }}
          className="pointer-events-none select-none text-[9px] font-bold leading-none whitespace-nowrap"
        >
          {cap.label}
        </div>
      </Html>
    </group>
  );
}

function Keyboard() {
  const group = useRef<Group>(null);
  const [tooltip, setTooltip] = useState<{
    label: string;
    pos: [number, number, number];
  } | null>(null);

  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.getElapsedTime();
    group.current.rotation.x = -Math.PI / 4 + Math.sin(t * 0.4) * 0.03;
    group.current.rotation.z = Math.sin(t * 0.3) * 0.04;
  });

  const rowCount = KEYCAPS.length;
  const colCount = KEYCAPS[0].length;
  const spacing = 0.55;

  return (
    <group ref={group} rotation={[-Math.PI / 4, 0, 0]}>
      {/* Base plate */}
      <mesh position={[0, -0.35, 0]} receiveShadow>
        <boxGeometry args={[colCount * spacing + 0.4, 0.1, rowCount * spacing + 0.4]} />
        <meshStandardMaterial color="#0a0a10" metalness={0.7} roughness={0.4} />
      </mesh>
      {/* glowing under-rim */}
      <mesh position={[0, -0.41, 0]}>
        <boxGeometry args={[colCount * spacing + 0.5, 0.02, rowCount * spacing + 0.5]} />
        <meshStandardMaterial
          color="#7c3aed"
          emissive="#7c3aed"
          emissiveIntensity={0.5}
          toneMapped={false}
        />
      </mesh>

      {KEYCAPS.map((row, ri) =>
        row.map((cap, ci) => {
          const x = (ci - (colCount - 1) / 2) * spacing;
          const z = (ri - (rowCount - 1) / 2) * spacing;
          return (
            <KeyCapMesh
              key={`${ri}-${ci}`}
              cap={cap}
              position={[x, 0, z]}
              onHover={(label, pos) => setTooltip({ label, pos })}
              onUnhover={() => setTooltip(null)}
            />
          );
        })
      )}

      {/* Cat mascot */}
      <Float speed={2.5} rotationIntensity={0.3} floatIntensity={0.6}>
        <group position={[colCount * spacing * 0.4, 0.8, -rowCount * spacing * 0.5]}>
          <mesh>
            <sphereGeometry args={[0.22, 16, 16]} />
            <meshStandardMaterial color="#fde047" emissive="#fde047" emissiveIntensity={0.3} />
          </mesh>
          {/* ears */}
          <mesh position={[-0.12, 0.2, 0]} rotation={[0, 0, -0.3]}>
            <coneGeometry args={[0.07, 0.15, 8]} />
            <meshStandardMaterial color="#fde047" />
          </mesh>
          <mesh position={[0.12, 0.2, 0]} rotation={[0, 0, 0.3]}>
            <coneGeometry args={[0.07, 0.15, 8]} />
            <meshStandardMaterial color="#fde047" />
          </mesh>
          {/* eyes */}
          <mesh position={[-0.07, 0.02, 0.2]}>
            <sphereGeometry args={[0.025, 8, 8]} />
            <meshStandardMaterial color="#000" />
          </mesh>
          <mesh position={[0.07, 0.02, 0.2]}>
            <sphereGeometry args={[0.025, 8, 8]} />
            <meshStandardMaterial color="#000" />
          </mesh>
        </group>
      </Float>

      {tooltip && (
        <Html position={[tooltip.pos[0], 0.6, tooltip.pos[2]]} center>
          <div className="pointer-events-none rounded-full border border-white/20 bg-black/80 px-3 py-1 text-xs font-semibold text-white backdrop-blur whitespace-nowrap">
            {tooltip.label}
          </div>
        </Html>
      )}
    </group>
  );
}

export default function KeyboardScene() {
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 3.2, 4.5], fov: 42 }}
      style={{ width: "100%", height: "100%" }}
    >
      <Suspense fallback={null}>
        <ambientLight intensity={0.6} />
        <pointLight position={[4, 4, 4]} intensity={0.9} color="#c084fc" />
        <pointLight position={[-4, 3, 2]} intensity={0.7} color="#f0abfc" />
        <pointLight position={[0, 2, -4]} intensity={0.5} color="#67e8f9" />
        <Keyboard />
        <Environment preset="night" />
      </Suspense>
    </Canvas>
  );
}
