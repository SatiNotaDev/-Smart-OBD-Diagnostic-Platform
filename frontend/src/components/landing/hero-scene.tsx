"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Line } from "@react-three/drei";
import * as THREE from "three";

function ParticleField() {
  const count = 600;
  const mesh = useRef<THREE.Points>(null!);

  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 18;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 12;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10;
      const t = Math.random();
      if (t < 0.5) { col[i * 3] = 0; col[i * 3 + 1] = 0.44; col[i * 3 + 2] = 0.95; }
      else if (t < 0.8) { col[i * 3] = 0.31; col[i * 3 + 1] = 0.89; col[i * 3 + 2] = 0.76; }
      else { col[i * 3] = 0.47; col[i * 3 + 1] = 0.16; col[i * 3 + 2] = 0.79; }
    }
    return [pos, col];
  }, []);

  useFrame((state) => {
    if (mesh.current) {
      mesh.current.rotation.y = state.clock.elapsedTime * 0.03;
      mesh.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.02) * 0.05;
    }
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.06} vertexColors transparent opacity={0.85} sizeAttenuation />
    </points>
  );
}

function RealisticCar() {
  const group = useRef<THREE.Group>(null!);

  useFrame((state) => {
    if (group.current) {
      group.current.rotation.y = state.clock.elapsedTime * 0.07;
      group.current.position.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.03;
    }
  });

  // Sport sedan profile — right side (very detailed, 60+ points)
  const profileR: [number, number, number][] = [
    // Front bumper
    [-3.1, -0.35, 0.82], [-3.15, -0.2, 0.82], [-3.18, -0.05, 0.82],
    [-3.15, 0.1, 0.82], [-3.1, 0.2, 0.82], [-3.0, 0.3, 0.82],
    // Hood
    [-2.85, 0.38, 0.82], [-2.6, 0.44, 0.82], [-2.3, 0.48, 0.82],
    [-2.0, 0.5, 0.82], [-1.7, 0.52, 0.82], [-1.4, 0.53, 0.82],
    [-1.1, 0.53, 0.82],
    // A-pillar base
    [-0.95, 0.55, 0.8], [-0.85, 0.65, 0.78], [-0.75, 0.78, 0.76],
    [-0.65, 0.9, 0.74], [-0.55, 1.0, 0.72], [-0.45, 1.1, 0.7],
    [-0.35, 1.18, 0.68],
    // Roof
    [-0.2, 1.25, 0.66], [-0.05, 1.3, 0.64], [0.15, 1.33, 0.63],
    [0.35, 1.35, 0.62], [0.55, 1.35, 0.62], [0.75, 1.34, 0.62],
    [0.95, 1.32, 0.63], [1.1, 1.28, 0.64],
    // C-pillar
    [1.25, 1.22, 0.66], [1.4, 1.12, 0.68], [1.55, 1.0, 0.7],
    [1.65, 0.9, 0.72], [1.75, 0.8, 0.74], [1.85, 0.7, 0.76],
    // Trunk
    [1.95, 0.62, 0.78], [2.1, 0.57, 0.8], [2.3, 0.53, 0.82],
    [2.5, 0.5, 0.82], [2.7, 0.46, 0.82], [2.85, 0.4, 0.82],
    // Rear
    [3.0, 0.3, 0.82], [3.1, 0.2, 0.82], [3.15, 0.05, 0.82],
    [3.12, -0.1, 0.82], [3.05, -0.25, 0.82], [2.95, -0.35, 0.82],
    // Rear wheel arch
    [2.7, -0.42, 0.82], [2.4, -0.48, 0.82],
    [2.2, -0.55, 0.82], [2.05, -0.65, 0.82], [1.95, -0.72, 0.82],
    [1.85, -0.65, 0.82], [1.75, -0.55, 0.82], [1.6, -0.48, 0.82],
    [1.4, -0.45, 0.82],
    // Sill
    [1.0, -0.45, 0.82], [0.5, -0.45, 0.82], [0.0, -0.45, 0.82],
    [-0.5, -0.45, 0.82], [-1.0, -0.45, 0.82], [-1.3, -0.45, 0.82],
    // Front wheel arch
    [-1.5, -0.48, 0.82], [-1.65, -0.55, 0.82], [-1.75, -0.65, 0.82],
    [-1.85, -0.72, 0.82], [-1.95, -0.65, 0.82], [-2.05, -0.55, 0.82],
    [-2.2, -0.48, 0.82], [-2.4, -0.42, 0.82],
    [-2.7, -0.38, 0.82], [-2.95, -0.35, 0.82], [-3.1, -0.35, 0.82],
  ];

  const profileL = profileR.map(([x, y, z]) => [x, y, -z] as [number, number, number]);

  // Wheel arches (more detail)
  const frontArchR: [number, number, number][] = [
    [-2.35, -0.48, 0.83], [-2.25, -0.6, 0.83], [-2.15, -0.7, 0.83],
    [-2.05, -0.78, 0.83], [-1.95, -0.82, 0.83], [-1.85, -0.78, 0.83],
    [-1.75, -0.7, 0.83], [-1.65, -0.6, 0.83], [-1.55, -0.48, 0.83],
  ];
  const rearArchR: [number, number, number][] = [
    [1.45, -0.48, 0.83], [1.55, -0.6, 0.83], [1.65, -0.7, 0.83],
    [1.75, -0.78, 0.83], [1.85, -0.82, 0.83], [1.95, -0.78, 0.83],
    [2.05, -0.7, 0.83], [2.15, -0.6, 0.83], [2.3, -0.48, 0.83],
  ];
  const frontArchL = frontArchR.map(([x, y, z]) => [x, y, -z] as [number, number, number]);
  const rearArchL = rearArchR.map(([x, y, z]) => [x, y, -z] as [number, number, number]);

  // Character line (shoulder)
  const shoulderR: [number, number, number][] = [
    [-3.0, 0.3, 0.83], [-2.5, 0.42, 0.84], [-2.0, 0.48, 0.84],
    [-1.5, 0.5, 0.84], [-1.0, 0.52, 0.84], [-0.5, 0.52, 0.84],
    [0, 0.52, 0.84], [0.5, 0.52, 0.84], [1.0, 0.52, 0.84],
    [1.5, 0.52, 0.84], [2.0, 0.52, 0.84], [2.5, 0.48, 0.84],
    [3.0, 0.3, 0.83],
  ];
  const shoulderL = shoulderR.map(([x, y, z]) => [x, y, -z] as [number, number, number]);

  // Lower body line
  const lowerLineR: [number, number, number][] = [
    [-2.9, -0.1, 0.84], [-2.5, -0.08, 0.84], [-2.0, -0.05, 0.84],
    [-1.5, -0.03, 0.84], [-1.0, -0.02, 0.84], [0, -0.02, 0.84],
    [1.0, -0.02, 0.84], [1.5, -0.03, 0.84], [2.0, -0.05, 0.84],
    [2.5, -0.08, 0.84], [2.9, -0.1, 0.84],
  ];
  const lowerLineL = lowerLineR.map(([x, y, z]) => [x, y, -z] as [number, number, number]);

  // Door cut lines
  const frontDoorR: [number, number, number][] = [
    [-0.2, -0.45, 0.83], [-0.2, -0.1, 0.83], [-0.2, 0.2, 0.83], [-0.2, 0.52, 0.83],
  ];
  const rearDoorR: [number, number, number][] = [
    [0.7, -0.45, 0.83], [0.7, -0.1, 0.83], [0.7, 0.2, 0.83], [0.7, 0.52, 0.83],
  ];
  const frontDoorL = frontDoorR.map(([x, y, z]) => [x, y, -z] as [number, number, number]);
  const rearDoorL = rearDoorR.map(([x, y, z]) => [x, y, -z] as [number, number, number]);

  // Windows
  const windowFR: [number, number, number][] = [
    [-0.85, 0.6, 0.79], [-0.72, 0.78, 0.77], [-0.6, 0.92, 0.75],
    [-0.48, 1.04, 0.73], [-0.35, 1.15, 0.7], [-0.25, 1.22, 0.68],
    [-0.25, 0.6, 0.79], [-0.85, 0.6, 0.79],
  ];
  const windowRR: [number, number, number][] = [
    [-0.12, 0.6, 0.79], [-0.12, 1.25, 0.67], [0.2, 1.3, 0.65],
    [0.5, 1.33, 0.64], [0.8, 1.32, 0.64], [1.05, 1.27, 0.65],
    [1.2, 1.2, 0.67], [1.35, 1.08, 0.69], [1.5, 0.95, 0.71],
    [1.65, 0.8, 0.73], [1.8, 0.65, 0.75], [1.8, 0.6, 0.79],
    [-0.12, 0.6, 0.79],
  ];
  const windowFL = windowFR.map(([x, y, z]) => [x, y, -z] as [number, number, number]);
  const windowRL = windowRR.map(([x, y, z]) => [x, y, -z] as [number, number, number]);

  // Quarter window (small triangle behind rear window)
  const quarterR: [number, number, number][] = [
    [1.5, 0.6, 0.79], [1.5, 0.95, 0.72], [1.8, 0.6, 0.79], [1.5, 0.6, 0.79],
  ];
  const quarterL = quarterR.map(([x, y, z]) => [x, y, -z] as [number, number, number]);

  // Roof structure
  const roofR: [number, number, number][] = [
    [-0.2, 1.25, 0.58], [0.0, 1.3, 0.56], [0.3, 1.33, 0.55],
    [0.55, 1.35, 0.54], [0.8, 1.34, 0.54], [1.0, 1.32, 0.55], [1.1, 1.28, 0.56],
  ];
  const roofL = roofR.map(([x, y, z]) => [x, y, -z] as [number, number, number]);
  const roofCrosses: [number, number, number][][] = [
    [[-0.1, 1.28, 0.56], [-0.1, 1.28, -0.56]],
    [[0.3, 1.33, 0.55], [0.3, 1.33, -0.55]],
    [[0.6, 1.35, 0.54], [0.6, 1.35, -0.54]],
    [[0.9, 1.33, 0.55], [0.9, 1.33, -0.55]],
    [[1.1, 1.28, 0.56], [1.1, 1.28, -0.56]],
  ];

  // Hood lines (longitudinal + cross)
  const hoodLines: [number, number, number][][] = [
    [[-2.85, 0.39, 0.55], [-2.3, 0.47, 0.55], [-1.7, 0.51, 0.55], [-1.1, 0.53, 0.55]],
    [[-2.85, 0.39, -0.55], [-2.3, 0.47, -0.55], [-1.7, 0.51, -0.55], [-1.1, 0.53, -0.55]],
    [[-2.85, 0.39, 0.25], [-2.3, 0.48, 0.25], [-1.7, 0.52, 0.25], [-1.1, 0.54, 0.25]],
    [[-2.85, 0.39, -0.25], [-2.3, 0.48, -0.25], [-1.7, 0.52, -0.25], [-1.1, 0.54, -0.25]],
    [[-2.85, 0.39, 0], [-2.3, 0.48, 0], [-1.7, 0.52, 0], [-1.1, 0.54, 0]],
    // cross
    [[-2.6, 0.45, 0.7], [-2.6, 0.45, -0.7]],
    [[-2.2, 0.48, 0.7], [-2.2, 0.48, -0.7]],
    [[-1.8, 0.51, 0.7], [-1.8, 0.51, -0.7]],
    [[-1.4, 0.53, 0.7], [-1.4, 0.53, -0.7]],
  ];

  // Trunk lines
  const trunkLines: [number, number, number][][] = [
    [[2.0, 0.57, 0.55], [2.3, 0.53, 0.55], [2.6, 0.48, 0.55], [2.85, 0.4, 0.55]],
    [[2.0, 0.57, -0.55], [2.3, 0.53, -0.55], [2.6, 0.48, -0.55], [2.85, 0.4, -0.55]],
    [[2.0, 0.57, 0], [2.3, 0.53, 0], [2.6, 0.48, 0], [2.85, 0.4, 0]],
    [[2.15, 0.55, 0.65], [2.15, 0.55, -0.65]],
    [[2.45, 0.5, 0.65], [2.45, 0.5, -0.65]],
    [[2.75, 0.43, 0.6], [2.75, 0.43, -0.6]],
  ];

  // Windshield frame
  const windshield: [number, number, number][][] = [
    [[-0.9, 0.58, 0.76], [-0.9, 0.58, -0.76]],
    [[-0.35, 1.18, 0.6], [-0.35, 1.18, -0.6]],
    [[-0.9, 0.58, 0.76], [-0.35, 1.18, 0.6]],
    [[-0.9, 0.58, -0.76], [-0.35, 1.18, -0.6]],
  ];

  // Rear window frame
  const rearWin: [number, number, number][][] = [
    [[1.55, 0.95, 0.7], [1.55, 0.95, -0.7]],
    [[1.2, 1.2, 0.58], [1.2, 1.2, -0.58]],
    [[1.55, 0.95, 0.7], [1.2, 1.2, 0.58]],
    [[1.55, 0.95, -0.7], [1.2, 1.2, -0.58]],
  ];

  // Front grille (detailed)
  const grilleLines: [number, number, number][][] = [
    // Horizontal bars
    [[-3.16, 0.2, 0.5], [-3.16, 0.2, -0.5]],
    [[-3.17, 0.12, 0.48], [-3.17, 0.12, -0.48]],
    [[-3.17, 0.04, 0.45], [-3.17, 0.04, -0.45]],
    [[-3.17, -0.04, 0.42], [-3.17, -0.04, -0.42]],
    [[-3.16, -0.12, 0.38], [-3.16, -0.12, -0.38]],
    [[-3.14, -0.2, 0.33], [-3.14, -0.2, -0.33]],
    // Vertical bars
    [[-3.16, -0.2, 0.3], [-3.16, 0.2, 0.3]],
    [[-3.16, -0.2, 0.15], [-3.16, 0.2, 0.15]],
    [[-3.16, -0.2, 0], [-3.16, 0.2, 0]],
    [[-3.16, -0.2, -0.15], [-3.16, 0.2, -0.15]],
    [[-3.16, -0.2, -0.3], [-3.16, 0.2, -0.3]],
    // Grille surround
    [[-3.15, 0.22, 0.5], [-3.15, 0.22, -0.5], [-3.13, -0.22, -0.35], [-3.13, -0.22, 0.35], [-3.15, 0.22, 0.5]],
  ];

  // Rear panel
  const rearPanel: [number, number, number][][] = [
    [[3.12, 0.2, 0.7], [3.12, 0.2, -0.7]],
    [[3.12, 0.0, 0.72], [3.12, 0.0, -0.72]],
    [[3.1, -0.2, 0.7], [3.1, -0.2, -0.7]],
    [[3.12, -0.3, 0.6], [3.12, -0.3, -0.6]],
    // Tail light bar (connecting)
    [[3.13, 0.1, 0.65], [3.13, 0.1, 0.3]],
    [[3.13, 0.1, -0.65], [3.13, 0.1, -0.3]],
  ];

  // Side mirrors
  const mirrorR: [number, number, number][] = [
    [-0.85, 0.58, 0.83], [-0.92, 0.55, 0.95], [-0.98, 0.5, 0.98],
    [-0.98, 0.42, 0.98], [-0.92, 0.38, 0.95], [-0.85, 0.4, 0.83],
  ];
  const mirrorL = mirrorR.map(([x, y, z]) => [x, y, -z] as [number, number, number]);

  // Door handles
  const handles: [number, number, number][][] = [
    [[-0.55, 0.38, 0.84], [-0.35, 0.38, 0.84]],
    [[0.3, 0.38, 0.84], [0.5, 0.38, 0.84]],
    [[-0.55, 0.38, -0.84], [-0.35, 0.38, -0.84]],
    [[0.3, 0.38, -0.84], [0.5, 0.38, -0.84]],
  ];

  // Bottom/underside connectors
  const bottomLines: [number, number, number][][] = [
    [[-3.1, -0.35, 0.82], [-3.1, -0.35, -0.82]],
    [[3.0, -0.35, 0.82], [3.0, -0.35, -0.82]],
    [[-1.0, -0.45, 0.82], [-1.0, -0.45, -0.82]],
    [[0.0, -0.45, 0.82], [0.0, -0.45, -0.82]],
    [[1.0, -0.45, 0.82], [1.0, -0.45, -0.82]],
    // Front lip
    [[-3.15, -0.3, 0.75], [-3.15, -0.3, -0.75]],
    // Rear diffuser
    [[3.05, -0.3, 0.6], [3.05, -0.3, -0.6]],
    [[3.05, -0.3, 0.3], [3.05, -0.35, 0.3], [3.05, -0.35, -0.3], [3.05, -0.3, -0.3]],
  ];

  // Cross-sections (body shape at different points)
  const crossSectionPts = (x: number, w: number, h: number, roof: number): [number, number, number][] => [
    [x, -0.45, w], [x, -0.1, w + 0.02], [x, 0.2, w + 0.02],
    [x, 0.52, w], [x, roof, w * 0.75],
    [x, roof, -w * 0.75], [x, 0.52, -w],
    [x, 0.2, -(w + 0.02)], [x, -0.1, -(w + 0.02)], [x, -0.45, -w],
  ];

  const crossSections: [number, number, number][][] = [
    crossSectionPts(-0.5, 0.82, 0.45, 1.33),
    crossSectionPts(0.4, 0.82, 0.45, 1.35),
    crossSectionPts(1.2, 0.82, 0.45, 1.2),
  ];

  // Build all lines
  const primary: { pts: [number, number, number][]; w: number; o: number }[] = [
    { pts: profileR, w: 2.2, o: 0.8 },
    { pts: profileL, w: 2.2, o: 0.8 },
    { pts: frontArchR, w: 1.8, o: 0.7 },
    { pts: frontArchL, w: 1.8, o: 0.7 },
    { pts: rearArchR, w: 1.8, o: 0.7 },
    { pts: rearArchL, w: 1.8, o: 0.7 },
    { pts: shoulderR, w: 1.5, o: 0.5 },
    { pts: shoulderL, w: 1.5, o: 0.5 },
  ];

  const secondary: { pts: [number, number, number][]; w: number; o: number }[] = [
    { pts: lowerLineR, w: 1, o: 0.35 },
    { pts: lowerLineL, w: 1, o: 0.35 },
    { pts: frontDoorR, w: 1.2, o: 0.4 },
    { pts: rearDoorR, w: 1.2, o: 0.4 },
    { pts: frontDoorL, w: 1.2, o: 0.4 },
    { pts: rearDoorL, w: 1.2, o: 0.4 },
    { pts: windowFR, w: 1.5, o: 0.55 },
    { pts: windowRR, w: 1.5, o: 0.55 },
    { pts: windowFL, w: 1.5, o: 0.55 },
    { pts: windowRL, w: 1.5, o: 0.55 },
    { pts: quarterR, w: 1.2, o: 0.45 },
    { pts: quarterL, w: 1.2, o: 0.45 },
    { pts: roofR, w: 1.5, o: 0.5 },
    { pts: roofL, w: 1.5, o: 0.5 },
    { pts: mirrorR, w: 1.2, o: 0.5 },
    { pts: mirrorL, w: 1.2, o: 0.5 },
    ...crossSections.map((pts) => ({ pts, w: 0.8, o: 0.25 })),
  ];

  const detail: { pts: [number, number, number][]; w: number; o: number }[] = [
    ...roofCrosses.map((pts) => ({ pts, w: 1, o: 0.4 })),
    ...hoodLines.map((pts) => ({ pts, w: 0.8, o: 0.28 })),
    ...trunkLines.map((pts) => ({ pts, w: 0.8, o: 0.28 })),
    ...windshield.map((pts) => ({ pts, w: 1.3, o: 0.5 })),
    ...rearWin.map((pts) => ({ pts, w: 1.3, o: 0.5 })),
    ...grilleLines.map((pts) => ({ pts, w: 0.8, o: 0.35 })),
    ...rearPanel.map((pts) => ({ pts, w: 1, o: 0.4 })),
    ...handles.map((pts) => ({ pts, w: 1.5, o: 0.5 })),
    ...bottomLines.map((pts) => ({ pts, w: 0.8, o: 0.3 })),
  ];

  const allLines = [...primary, ...secondary, ...detail];

  return (
    <Float speed={0.6} rotationIntensity={0.02} floatIntensity={0.08}>
      <group ref={group} scale={0.72} position={[0, 1.4, 0]}>
        {allLines.map((line, i) => (
          <Line key={i} points={line.pts} color="#0070F3" lineWidth={line.w} transparent opacity={line.o} />
        ))}

        {/* Wheels — detailed with tire, rim, spokes */}
        {[[-1.9, -0.72, 0.83], [-1.9, -0.72, -0.83], [1.9, -0.72, 0.83], [1.9, -0.72, -0.83]].map((pos, i) => (
          <group key={`wh${i}`} position={pos as [number, number, number]}>
            {/* Tire */}
            <mesh><ringGeometry args={[0.32, 0.42, 32]} /><meshBasicMaterial color="#0070F3" transparent opacity={0.65} side={THREE.DoubleSide} /></mesh>
            {/* Rim outer */}
            <mesh><ringGeometry args={[0.28, 0.32, 24]} /><meshBasicMaterial color="#50E3C2" transparent opacity={0.45} side={THREE.DoubleSide} /></mesh>
            {/* Spokes (5-spoke) */}
            {[0, 1, 2, 3, 4].map((s) => {
              const a = (s / 5) * Math.PI * 2;
              return (
                <Line key={s} points={[[0, 0, 0], [Math.cos(a) * 0.28, Math.sin(a) * 0.28, 0]]} color="#0070F3" lineWidth={1.2} transparent opacity={0.5} />
              );
            })}
            {/* Center cap */}
            <mesh><circleGeometry args={[0.06, 12]} /><meshBasicMaterial color="#0070F3" transparent opacity={0.5} side={THREE.DoubleSide} /></mesh>
            {/* Lug bolts */}
            {[0, 1, 2, 3, 4].map((s) => {
              const a = (s / 5) * Math.PI * 2 + 0.3;
              return (
                <mesh key={`b${s}`} position={[Math.cos(a) * 0.12, Math.sin(a) * 0.12, 0]}>
                  <circleGeometry args={[0.02, 6]} />
                  <meshBasicMaterial color="#50E3C2" transparent opacity={0.6} side={THREE.DoubleSide} />
                </mesh>
              );
            })}
          </group>
        ))}

        {/* Headlights (LED strip style) */}
        {[0.55, -0.55].map((z, i) => (
          <group key={`hl${i}`}>
            <mesh position={[-3.16, 0.08, z]}><circleGeometry args={[0.14, 16]} /><meshBasicMaterial color="#ffffff" transparent opacity={0.8} side={THREE.DoubleSide} /></mesh>
            <mesh position={[-3.16, 0.08, z]}><ringGeometry args={[0.14, 0.17, 16]} /><meshBasicMaterial color="#50E3C2" transparent opacity={0.6} side={THREE.DoubleSide} /></mesh>
            {/* DRL strip */}
            <Line points={[[-3.14, 0.18, z * 0.9], [-3.1, 0.22, z * 0.8], [-3.0, 0.28, z * 0.7]]} color="#50E3C2" lineWidth={1.5} transparent opacity={0.7} />
          </group>
        ))}

        {/* Taillights (LED bar) */}
        {[0.55, -0.55].map((z, i) => (
          <group key={`tl${i}`}>
            <mesh position={[3.13, 0.1, z]}><boxGeometry args={[0.02, 0.12, 0.25]} /><meshBasicMaterial color="#FF0080" transparent opacity={0.7} /></mesh>
          </group>
        ))}
      </group>
    </Float>
  );
}

// Engine block — top left
function EngineBlock() {
  const group = useRef<THREE.Group>(null!);
  useFrame((state) => {
    if (group.current) {
      group.current.rotation.y = state.clock.elapsedTime * 0.18;
      group.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.25) * 0.12;
    }
  });

  // V6 engine block
  const blockL: [number, number, number][] = [
    [-0.7, -0.6, 0.45], [-0.7, 0.1, 0.45], [0.7, 0.1, 0.45], [0.7, -0.6, 0.45], [-0.7, -0.6, 0.45],
  ];
  const blockR: [number, number, number][] = [
    [-0.7, -0.6, -0.45], [-0.7, 0.1, -0.45], [0.7, 0.1, -0.45], [0.7, -0.6, -0.45], [-0.7, -0.6, -0.45],
  ];
  const cylLeft: [number, number, number][][] = [
    [[-0.5, 0.1, 0.44], [-0.5, 0.5, 0.6], [-0.3, 0.5, 0.6], [-0.3, 0.1, 0.44]],
    [[-0.1, 0.1, 0.44], [-0.1, 0.5, 0.6], [0.1, 0.5, 0.6], [0.1, 0.1, 0.44]],
    [[0.3, 0.1, 0.44], [0.3, 0.5, 0.6], [0.5, 0.5, 0.6], [0.5, 0.1, 0.44]],
  ];
  const cylRight: [number, number, number][][] = [
    [[-0.5, 0.1, -0.44], [-0.5, 0.5, -0.6], [-0.3, 0.5, -0.6], [-0.3, 0.1, -0.44]],
    [[-0.1, 0.1, -0.44], [-0.1, 0.5, -0.6], [0.1, 0.5, -0.6], [0.1, 0.1, -0.44]],
    [[0.3, 0.1, -0.44], [0.3, 0.5, -0.6], [0.5, 0.5, -0.6], [0.5, 0.1, -0.44]],
  ];
  const intake: [number, number, number][] = [
    [-0.4, 0.5, 0.3], [-0.2, 0.65, 0.2], [0, 0.75, 0], [0.2, 0.65, -0.2], [0.4, 0.5, -0.3],
  ];
  const exhaustR: [number, number, number][] = [
    [0.7, -0.3, 0.45], [0.9, -0.3, 0.5], [1.1, -0.35, 0.5], [1.3, -0.4, 0.45], [1.5, -0.4, 0.35],
  ];
  const exhaustL: [number, number, number][] = [
    [0.7, -0.3, -0.45], [0.9, -0.3, -0.5], [1.1, -0.35, -0.5], [1.3, -0.4, -0.45], [1.5, -0.4, -0.35],
  ];
  const belt: [number, number, number][] = [
    [-0.7, -0.2, 0.46], [-0.85, -0.1, 0.46], [-0.85, 0.15, 0.46], [-0.7, 0.25, 0.46],
  ];
  const oilPan: [number, number, number][] = [
    [-0.5, -0.6, 0.4], [-0.5, -0.8, 0.35], [0.5, -0.8, 0.35], [0.5, -0.6, 0.4],
  ];

  return (
    <Float speed={1.5} rotationIntensity={0.15} floatIntensity={0.3}>
      <group ref={group} position={[-4.5, 2.8, -1]} scale={0.5}>
        <Line points={blockL} color="#0070F3" lineWidth={1.5} transparent opacity={0.6} />
        <Line points={blockR} color="#0070F3" lineWidth={1.5} transparent opacity={0.6} />
        <Line points={[[-0.7, -0.6, 0.45], [-0.7, -0.6, -0.45]]} color="#0070F3" lineWidth={1} transparent opacity={0.4} />
        <Line points={[[-0.7, 0.1, 0.45], [-0.7, 0.1, -0.45]]} color="#0070F3" lineWidth={1} transparent opacity={0.4} />
        <Line points={[[0.7, 0.1, 0.45], [0.7, 0.1, -0.45]]} color="#0070F3" lineWidth={1} transparent opacity={0.4} />
        <Line points={[[0.7, -0.6, 0.45], [0.7, -0.6, -0.45]]} color="#0070F3" lineWidth={1} transparent opacity={0.4} />
        {cylLeft.map((pts, i) => <Line key={`cl${i}`} points={pts} color="#50E3C2" lineWidth={1.2} transparent opacity={0.55} />)}
        {cylRight.map((pts, i) => <Line key={`cr${i}`} points={pts} color="#50E3C2" lineWidth={1.2} transparent opacity={0.55} />)}
        <Line points={intake} color="#50E3C2" lineWidth={1.2} transparent opacity={0.5} />
        <Line points={exhaustR} color="#FF0080" lineWidth={1.2} transparent opacity={0.55} />
        <Line points={exhaustL} color="#FF0080" lineWidth={1.2} transparent opacity={0.55} />
        <Line points={belt} color="#0070F3" lineWidth={1} transparent opacity={0.4} />
        <Line points={oilPan} color="#0070F3" lineWidth={1} transparent opacity={0.4} />
        {/* Pulley */}
        <mesh position={[-0.78, 0.0, 0.47]}><ringGeometry args={[0.08, 0.15, 12]} /><meshBasicMaterial color="#0070F3" transparent opacity={0.5} side={THREE.DoubleSide} /></mesh>
      </group>
    </Float>
  );
}

// Brake assembly — top right
function BrakeAssembly() {
  const group = useRef<THREE.Group>(null!);
  useFrame((state) => {
    if (group.current) {
      group.current.rotation.z = state.clock.elapsedTime * 0.25;
    }
  });

  return (
    <Float speed={1.2} rotationIntensity={0.12} floatIntensity={0.25}>
      <group ref={group} position={[4.5, 2.8, -1]} scale={0.45}>
        {/* Disc — ventilated */}
        <mesh><ringGeometry args={[0.55, 1.3, 36]} /><meshBasicMaterial color="#0070F3" transparent opacity={0.45} side={THREE.DoubleSide} wireframe /></mesh>
        <mesh><ringGeometry args={[0.5, 0.55, 36]} /><meshBasicMaterial color="#0070F3" transparent opacity={0.6} side={THREE.DoubleSide} /></mesh>
        {/* Vent holes ring */}
        <mesh><ringGeometry args={[0.75, 0.8, 24]} /><meshBasicMaterial color="#0070F3" transparent opacity={0.35} side={THREE.DoubleSide} /></mesh>
        <mesh><ringGeometry args={[0.95, 1.0, 24]} /><meshBasicMaterial color="#0070F3" transparent opacity={0.3} side={THREE.DoubleSide} /></mesh>
        <mesh><ringGeometry args={[1.1, 1.15, 24]} /><meshBasicMaterial color="#0070F3" transparent opacity={0.25} side={THREE.DoubleSide} /></mesh>
        {/* Cross-drilled holes (decorative circles) */}
        {Array.from({ length: 12 }).map((_, i) => {
          const a = (i / 12) * Math.PI * 2;
          return <mesh key={i} position={[Math.cos(a) * 0.88, Math.sin(a) * 0.88, 0]}><circleGeometry args={[0.04, 8]} /><meshBasicMaterial color="#0070F3" transparent opacity={0.4} side={THREE.DoubleSide} /></mesh>;
        })}
        {/* Caliper (multi-piston) */}
        <group rotation={[0, 0, -0.3]}>
          <mesh position={[0, 1.15, 0.05]}><boxGeometry args={[0.55, 0.45, 0.2]} /><meshBasicMaterial color="#FF0080" wireframe transparent opacity={0.6} /></mesh>
          {/* Piston outlines */}
          <Line points={[[-0.15, 0.95, 0.06], [-0.15, 1.05, 0.06]]} color="#FF0080" lineWidth={1.5} transparent opacity={0.5} />
          <Line points={[[0.05, 0.95, 0.06], [0.05, 1.05, 0.06]]} color="#FF0080" lineWidth={1.5} transparent opacity={0.5} />
          <Line points={[[0.25, 0.95, 0.06], [0.25, 1.05, 0.06]]} color="#FF0080" lineWidth={1.5} transparent opacity={0.5} />
        </group>
        {/* Hub bolts */}
        {[0, 1, 2, 3, 4].map((i) => {
          const a = (i / 5) * Math.PI * 2;
          return <mesh key={`b${i}`} position={[Math.cos(a) * 0.35, Math.sin(a) * 0.35, 0]}><circleGeometry args={[0.04, 8]} /><meshBasicMaterial color="#50E3C2" transparent opacity={0.6} side={THREE.DoubleSide} /></mesh>;
        })}
        {/* Center */}
        <mesh><circleGeometry args={[0.12, 16]} /><meshBasicMaterial color="#0070F3" transparent opacity={0.4} side={THREE.DoubleSide} /></mesh>
      </group>
    </Float>
  );
}

// Gearbox — bottom left
function Gearbox() {
  const group = useRef<THREE.Group>(null!);
  useFrame((state) => {
    if (group.current) {
      group.current.rotation.y = state.clock.elapsedTime * 0.14;
      group.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.18) * 0.12;
    }
  });

  const caseTop: [number, number, number][] = [
    [-0.9, 0.4, 0.35], [-0.5, 0.55, 0.35], [0.0, 0.5, 0.35],
    [0.5, 0.4, 0.3], [0.9, 0.2, 0.25], [0.9, -0.4, 0.2],
    [0.5, -0.55, 0.3], [0.0, -0.55, 0.35], [-0.5, -0.5, 0.35],
    [-0.9, -0.4, 0.35], [-0.9, 0.4, 0.35],
  ];
  const caseBottom = caseTop.map(([x, y, z]) => [x, y, -z] as [number, number, number]);

  // Internal gears
  const gears: { pos: [number, number, number]; r: number; teeth: number }[] = [
    { pos: [-0.4, 0.0, 0], r: 0.25, teeth: 10 },
    { pos: [0.0, 0.0, 0], r: 0.3, teeth: 12 },
    { pos: [0.4, 0.0, 0], r: 0.2, teeth: 8 },
    { pos: [0.15, 0.28, 0], r: 0.15, teeth: 7 },
  ];

  const inputShaft: [number, number, number][] = [[-1.3, 0.0, 0], [-0.9, 0.0, 0]];
  const outputShaft: [number, number, number][] = [[0.9, 0.0, 0], [1.4, 0.0, 0]];
  const selector: [number, number, number][] = [
    [-0.2, 0.55, 0.0], [-0.2, 0.75, 0.0], [0.0, 0.85, 0.0], [0.2, 0.75, 0.0],
  ];

  return (
    <Float speed={1.3} rotationIntensity={0.18} floatIntensity={0.3}>
      <group ref={group} position={[-4.5, -2.2, -1]} scale={0.5}>
        <Line points={caseTop} color="#0070F3" lineWidth={1.5} transparent opacity={0.55} />
        <Line points={caseBottom} color="#0070F3" lineWidth={1.5} transparent opacity={0.55} />
        {/* Connect sides */}
        {[[-0.9, 0.4], [0.9, 0.2], [0.9, -0.4], [-0.9, -0.4]].map(([x, y], i) => (
          <Line key={i} points={[[x, y, 0.35], [x, y, -0.35]]} color="#0070F3" lineWidth={0.8} transparent opacity={0.3} />
        ))}
        {/* Gears */}
        {gears.map((g, i) => (
          <mesh key={i} position={g.pos}><ringGeometry args={[g.r * 0.3, g.r, g.teeth]} /><meshBasicMaterial color="#50E3C2" wireframe transparent opacity={0.55} side={THREE.DoubleSide} /></mesh>
        ))}
        {/* Shafts */}
        <Line points={inputShaft} color="#50E3C2" lineWidth={2} transparent opacity={0.6} />
        <Line points={outputShaft} color="#50E3C2" lineWidth={2} transparent opacity={0.6} />
        <Line points={selector} color="#FF0080" lineWidth={1.2} transparent opacity={0.5} />
      </group>
    </Float>
  );
}

// Suspension — bottom right
function Suspension() {
  const group = useRef<THREE.Group>(null!);
  useFrame((state) => {
    if (group.current) {
      group.current.rotation.y = state.clock.elapsedTime * 0.12;
      group.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
    }
  });

  // MacPherson strut
  const strut: [number, number, number][] = [
    [0, -0.8, 0], [0, -0.5, 0], [0.05, -0.3, 0], [0.05, 0.3, 0], [0, 0.5, 0], [0, 0.8, 0],
  ];
  // Spring coils
  const spring: [number, number, number][] = [];
  for (let i = 0; i < 20; i++) {
    const t = i / 20;
    const y = -0.4 + t * 0.8;
    const x = Math.cos(t * Math.PI * 5) * 0.15;
    const z = Math.sin(t * Math.PI * 5) * 0.15;
    spring.push([x, y, z]);
  }
  // Lower control arm
  const lca: [number, number, number][] = [
    [-0.6, -0.75, 0.3], [0, -0.8, 0], [0.6, -0.75, -0.3],
  ];
  // Tie rod
  const tieRod: [number, number, number][] = [
    [-0.5, -0.6, -0.2], [0.0, -0.65, 0], [0.5, -0.6, 0.2],
  ];
  // Top mount
  const topMount: [number, number, number][] = [
    [-0.2, 0.8, -0.1], [0, 0.85, 0], [0.2, 0.8, 0.1], [0, 0.75, 0], [-0.2, 0.8, -0.1],
  ];
  // Knuckle
  const knuckle: [number, number, number][] = [
    [-0.15, -0.9, -0.1], [-0.15, -0.7, -0.1], [0.15, -0.7, 0.1], [0.15, -0.9, 0.1], [-0.15, -0.9, -0.1],
  ];

  return (
    <Float speed={1.1} rotationIntensity={0.12} floatIntensity={0.25}>
      <group ref={group} position={[4.5, -2.2, -1]} scale={0.5}>
        <Line points={strut} color="#0070F3" lineWidth={2} transparent opacity={0.6} />
        <Line points={spring} color="#50E3C2" lineWidth={1.5} transparent opacity={0.6} />
        <Line points={lca} color="#0070F3" lineWidth={1.5} transparent opacity={0.55} />
        <Line points={tieRod} color="#0070F3" lineWidth={1.2} transparent opacity={0.45} />
        <Line points={topMount} color="#FF0080" lineWidth={1.2} transparent opacity={0.5} />
        <Line points={knuckle} color="#0070F3" lineWidth={1.5} transparent opacity={0.55} />
        {/* Hub */}
        <mesh position={[0, -0.8, 0]}><ringGeometry args={[0.15, 0.25, 16]} /><meshBasicMaterial color="#0070F3" transparent opacity={0.5} side={THREE.DoubleSide} /></mesh>
        {/* Bushings */}
        <mesh position={[-0.6, -0.75, 0.3]}><circleGeometry args={[0.06, 10]} /><meshBasicMaterial color="#50E3C2" transparent opacity={0.5} side={THREE.DoubleSide} /></mesh>
        <mesh position={[0.6, -0.75, -0.3]}><circleGeometry args={[0.06, 10]} /><meshBasicMaterial color="#50E3C2" transparent opacity={0.5} side={THREE.DoubleSide} /></mesh>
      </group>
    </Float>
  );
}

export function HeroScene() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none">
      <Canvas
        camera={{ position: [0, 1.2, 7.5], fov: 48 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.5} />
        <ParticleField />
        <RealisticCar />
        <EngineBlock />
        <BrakeAssembly />
        <Gearbox />
        <Suspension />
      </Canvas>
    </div>
  );
}
