"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";

function ParticleField() {
  const count = 500;
  const mesh = useRef<THREE.Points>(null!);

  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 10;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 10;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10;

      const t = Math.random();
      if (t < 0.33) {
        col[i * 3] = 0; col[i * 3 + 1] = 0.44; col[i * 3 + 2] = 0.95;
      } else if (t < 0.66) {
        col[i * 3] = 0.47; col[i * 3 + 1] = 0.16; col[i * 3 + 2] = 0.79;
      } else {
        col[i * 3] = 1; col[i * 3 + 1] = 0; col[i * 3 + 2] = 0.5;
      }
    }

    return [pos, col];
  }, []);

  useFrame((state) => {
    if (mesh.current) {
      mesh.current.rotation.y = state.clock.elapsedTime * 0.05;
      mesh.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.03) * 0.1;
    }
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.02}
        vertexColors
        transparent
        opacity={0.8}
        sizeAttenuation
      />
    </points>
  );
}

function GlowingSphere() {
  const mesh = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    if (mesh.current) {
      mesh.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime) * 0.05);
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.3} floatIntensity={0.5}>
      <mesh ref={mesh}>
        <icosahedronGeometry args={[1.5, 4]} />
        <meshBasicMaterial
          color="#0070F3"
          wireframe
          transparent
          opacity={0.15}
        />
      </mesh>
    </Float>
  );
}

function GradientRing() {
  const mesh = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    if (mesh.current) {
      mesh.current.rotation.z = state.clock.elapsedTime * 0.2;
      mesh.current.rotation.x = Math.PI / 3;
    }
  });

  return (
    <mesh ref={mesh} position={[0, 0, -1]}>
      <torusGeometry args={[2.5, 0.01, 16, 100]} />
      <meshBasicMaterial color="#7928CA" transparent opacity={0.4} />
    </mesh>
  );
}

export function HeroScene() {
  return (
    <div className="absolute inset-0 -z-10">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 60 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.5} />
        <ParticleField />
        <GlowingSphere />
        <GradientRing />
      </Canvas>
    </div>
  );
}
