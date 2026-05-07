"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Environment, ContactShadows } from "@react-three/drei";
import { useRef, Suspense } from "react";
import type { Group } from "three";

function DeveloperCharacter() {
  const group = useRef<Group>(null);

  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.getElapsedTime();
    group.current.position.y = Math.sin(t * 1.2) * 0.08;
    group.current.rotation.y = Math.sin(t * 0.4) * 0.12;
  });

  return (
    <group ref={group} position={[0, -0.6, 0]}>
      {/* Desk */}
      <mesh position={[0, -0.7, 0]} receiveShadow castShadow>
        <boxGeometry args={[3.2, 0.12, 1.6]} />
        <meshStandardMaterial color="#1a1a24" roughness={0.6} metalness={0.2} />
      </mesh>
      {/* Desk legs */}
      {[
        [-1.4, -1.2, -0.65],
        [1.4, -1.2, -0.65],
        [-1.4, -1.2, 0.65],
        [1.4, -1.2, 0.65],
      ].map((p, i) => (
        <mesh key={i} position={p as [number, number, number]}>
          <boxGeometry args={[0.12, 1, 0.12]} />
          <meshStandardMaterial color="#0f0f18" />
        </mesh>
      ))}

      {/* Laptop base */}
      <mesh position={[0, -0.6, 0.15]} rotation={[-0.05, 0, 0]}>
        <boxGeometry args={[1.2, 0.05, 0.8]} />
        <meshStandardMaterial color="#2a2a3a" metalness={0.8} roughness={0.3} />
      </mesh>
      {/* Laptop screen */}
      <mesh position={[0, -0.1, -0.22]} rotation={[-0.25, 0, 0]}>
        <boxGeometry args={[1.2, 0.75, 0.04]} />
        <meshStandardMaterial color="#1a1a2a" metalness={0.9} roughness={0.2} />
      </mesh>
      <mesh position={[0, -0.1, -0.2]} rotation={[-0.25, 0, 0]}>
        <planeGeometry args={[1.1, 0.68]} />
        <meshStandardMaterial
          color="#a855f7"
          emissive="#a855f7"
          emissiveIntensity={1.2}
          toneMapped={false}
        />
      </mesh>

      {/* Character body */}
      <mesh position={[0, 0.4, 0.5]}>
        <capsuleGeometry args={[0.32, 0.5, 8, 16]} />
        <meshStandardMaterial color="#a855f7" roughness={0.5} />
      </mesh>
      {/* Head */}
      <mesh position={[0, 1.1, 0.5]} castShadow>
        <sphereGeometry args={[0.28, 32, 32]} />
        <meshStandardMaterial color="#f5d0b0" roughness={0.7} />
      </mesh>
      {/* Hair */}
      <mesh position={[0, 1.28, 0.5]}>
        <sphereGeometry args={[0.3, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#1a1a2a" roughness={0.8} />
      </mesh>
      {/* Eyes */}
      <mesh position={[-0.1, 1.1, 0.74]}>
        <sphereGeometry args={[0.03, 16, 16]} />
        <meshStandardMaterial color="#0a0a0a" />
      </mesh>
      <mesh position={[0.1, 1.1, 0.74]}>
        <sphereGeometry args={[0.03, 16, 16]} />
        <meshStandardMaterial color="#0a0a0a" />
      </mesh>
      {/* Glasses */}
      <mesh position={[-0.1, 1.1, 0.76]}>
        <torusGeometry args={[0.07, 0.01, 16, 32]} />
        <meshStandardMaterial color="#06b6d4" emissive="#06b6d4" emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[0.1, 1.1, 0.76]}>
        <torusGeometry args={[0.07, 0.01, 16, 32]} />
        <meshStandardMaterial color="#06b6d4" emissive="#06b6d4" emissiveIntensity={0.5} />
      </mesh>

      {/* Arms reaching to laptop */}
      <mesh position={[-0.45, 0.15, 0.25]} rotation={[0, 0, 0.4]}>
        <capsuleGeometry args={[0.09, 0.45, 8, 16]} />
        <meshStandardMaterial color="#ec4899" />
      </mesh>
      <mesh position={[0.45, 0.15, 0.25]} rotation={[0, 0, -0.4]}>
        <capsuleGeometry args={[0.09, 0.45, 8, 16]} />
        <meshStandardMaterial color="#ec4899" />
      </mesh>
      {/* Hands */}
      <mesh position={[-0.3, -0.15, 0.1]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial color="#f5d0b0" />
      </mesh>
      <mesh position={[0.3, -0.15, 0.1]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial color="#f5d0b0" />
      </mesh>

      {/* Floating code particles */}
      {[...Array(8)].map((_, i) => (
        <Float
          key={i}
          speed={2}
          rotationIntensity={0.8}
          floatIntensity={1.5}
          position={[
            Math.cos(i * 0.8) * 1.6,
            0.6 + Math.sin(i) * 0.4,
            Math.sin(i * 0.8) * 1.2 - 0.5,
          ]}
        >
          <mesh>
            <boxGeometry args={[0.12, 0.12, 0.12]} />
            <meshStandardMaterial
              color={i % 3 === 0 ? "#a855f7" : i % 3 === 1 ? "#ec4899" : "#06b6d4"}
              emissive={i % 3 === 0 ? "#a855f7" : i % 3 === 1 ? "#ec4899" : "#06b6d4"}
              emissiveIntensity={0.6}
              toneMapped={false}
            />
          </mesh>
        </Float>
      ))}
    </group>
  );
}

export default function DeveloperScene() {
  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [0, 0.8, 3.8], fov: 40 }}
      style={{ width: "100%", height: "100%" }}
    >
      <Suspense fallback={null}>
        <ambientLight intensity={0.4} />
        <pointLight position={[3, 3, 3]} intensity={2} color="#a855f7" />
        <pointLight position={[-3, 2, 2]} intensity={1.5} color="#ec4899" />
        <pointLight position={[0, -2, 2]} intensity={1} color="#06b6d4" />
        <DeveloperCharacter />
        <ContactShadows
          position={[0, -1.25, 0]}
          opacity={0.5}
          scale={6}
          blur={2.4}
          far={2}
        />
        <Environment preset="city" />
      </Suspense>
    </Canvas>
  );
}
