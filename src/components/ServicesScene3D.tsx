import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

export type CapabilityId =
  | 'workspace'
  | 'mentor'
  | 'evolution'
  | 'risk'
  | 'evidence'
  | 'timeline'
  | 'archive';

interface Capability3DTheme {
  primaryColor: string;
  accentColor: string;
  wireColor: string;
  geometryType: 'icosahedron' | 'torus' | 'octahedron' | 'dodecahedron' | 'knot' | 'sphere' | 'box';
  wireframe: boolean;
  particleCount: number;
  rotationSpeed: number;
  pulseIntensity: number;
  label: string;
}

const CAPABILITY_THEMES: Record<CapabilityId, Capability3DTheme> = {
  workspace: {
    primaryColor: '#38bdf8',
    accentColor: '#818cf8',
    wireColor: '#7dd3fc',
    geometryType: 'dodecahedron',
    wireframe: true,
    particleCount: 55,
    rotationSpeed: 0.6,
    pulseIntensity: 0.8,
    label: 'STRUCTURED REPOSITORIES',
  },
  mentor: {
    primaryColor: '#818cf8',
    accentColor: '#c084fc',
    wireColor: '#a78bfa',
    geometryType: 'icosahedron',
    wireframe: false,
    particleCount: 90,
    rotationSpeed: 1.2,
    pulseIntensity: 1.4,
    label: 'NEURAL GUIDANCE CORE',
  },
  evolution: {
    primaryColor: '#2dd4bf',
    accentColor: '#38bdf8',
    wireColor: '#5eead4',
    geometryType: 'torus',
    wireframe: false,
    particleCount: 75,
    rotationSpeed: 0.9,
    pulseIntensity: 1.1,
    label: 'DECISION BRANCH MATRIX',
  },
  risk: {
    primaryColor: '#fbbf24',
    accentColor: '#f87171',
    wireColor: '#fca5a5',
    geometryType: 'octahedron',
    wireframe: true,
    particleCount: 70,
    rotationSpeed: 1.4,
    pulseIntensity: 1.6,
    label: 'ASSUMPTION STRESS SCANNER',
  },
  evidence: {
    primaryColor: '#06b6d4',
    accentColor: '#10b981',
    wireColor: '#67e8f9',
    geometryType: 'knot',
    wireframe: false,
    particleCount: 80,
    rotationSpeed: 0.8,
    pulseIntensity: 1.3,
    label: 'TAVILY VERIFICATION ORBIT',
  },
  timeline: {
    primaryColor: '#a855f7',
    accentColor: '#6366f1',
    wireColor: '#c084fc',
    geometryType: 'sphere',
    wireframe: true,
    particleCount: 65,
    rotationSpeed: 0.7,
    pulseIntensity: 0.9,
    label: 'CHRONOLOGICAL LOG STREAM',
  },
  archive: {
    primaryColor: '#64748b',
    accentColor: '#38bdf8',
    wireColor: '#94a3b8',
    geometryType: 'box',
    wireframe: true,
    particleCount: 50,
    rotationSpeed: 0.5,
    pulseIntensity: 0.7,
    label: 'MULTI-IDEA INDEX MATRIX',
  },
};

interface VisualCoreProps {
  activeCapability: CapabilityId;
}

const DynamicCapabilityCore: React.FC<VisualCoreProps> = ({ activeCapability }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const wireMeshRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Group>(null);
  const targetScale = useRef(1);

  const theme = CAPABILITY_THEMES[activeCapability];

  // Transient scale punch on capability switch
  useEffect(() => {
    targetScale.current = 1.25;
    const timer = setTimeout(() => {
      targetScale.current = 1.0;
    }, 250);
    return () => clearTimeout(timer);
  }, [activeCapability]);

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();

    if (meshRef.current) {
      meshRef.current.rotation.x += delta * theme.rotationSpeed * 0.5;
      meshRef.current.rotation.y += delta * theme.rotationSpeed * 0.7;

      // Elastic breathing
      const breathe = 1 + Math.sin(t * theme.pulseIntensity * 2) * 0.05;
      const currentScale = THREE.MathUtils.lerp(meshRef.current.scale.x, targetScale.current * breathe, 0.1);
      meshRef.current.scale.set(currentScale, currentScale, currentScale);
    }

    if (wireMeshRef.current) {
      wireMeshRef.current.rotation.x -= delta * theme.rotationSpeed * 0.3;
      wireMeshRef.current.rotation.y += delta * theme.rotationSpeed * 0.4;
      const wireScale = (meshRef.current?.scale.x || 1) * 1.15;
      wireMeshRef.current.scale.set(wireScale, wireScale, wireScale);
    }

    if (ringRef.current) {
      ringRef.current.rotation.z += delta * 0.3;
      ringRef.current.rotation.x = Math.sin(t * 0.5) * 0.2;
    }
  });

  const geometry = useMemo(() => {
    switch (theme.geometryType) {
      case 'icosahedron':
        return <icosahedronGeometry args={[1.2, 2]} />;
      case 'torus':
        return <torusGeometry args={[0.9, 0.35, 24, 48]} />;
      case 'octahedron':
        return <octahedronGeometry args={[1.3, 0]} />;
      case 'dodecahedron':
        return <dodecahedronGeometry args={[1.2, 0]} />;
      case 'knot':
        return <torusKnotGeometry args={[0.8, 0.25, 64, 16]} />;
      case 'sphere':
        return <sphereGeometry args={[1.15, 24, 24]} />;
      case 'box':
      default:
        return <boxGeometry args={[1.35, 1.35, 1.35]} />;
    }
  }, [theme.geometryType]);

  return (
    <group>
      {/* Primary Dimensional Solid / Glass Core */}
      <mesh ref={meshRef}>
        {geometry}
        <meshPhysicalMaterial
          color={theme.primaryColor}
          emissive={theme.accentColor}
          emissiveIntensity={0.65}
          roughness={0.15}
          metalness={0.25}
          transmission={0.6}
          transparent
          opacity={0.88}
        />
      </mesh>

      {/* Outer Geometric Wireframe Cage */}
      <mesh ref={wireMeshRef}>
        {geometry}
        <meshBasicMaterial
          color={theme.wireColor}
          wireframe
          transparent
          opacity={0.35}
        />
      </mesh>

      {/* Orbiting Resonator Ring */}
      <group ref={ringRef}>
        <mesh rotation={[Math.PI / 2.5, 0, 0]}>
          <torusGeometry args={[1.9, 0.015, 16, 64]} />
          <meshBasicMaterial color={theme.accentColor} transparent opacity={0.4} />
        </mesh>
        <mesh rotation={[-Math.PI / 3, 0, 0]}>
          <torusGeometry args={[2.2, 0.012, 16, 64]} />
          <meshBasicMaterial color={theme.primaryColor} transparent opacity={0.25} />
        </mesh>
      </group>
    </group>
  );
};

interface ParticleDustProps {
  count: number;
  color: string;
}

const ParticleDust: React.FC<ParticleDustProps> = ({ count, color }) => {
  const pointsRef = useRef<THREE.Points>(null);

  const [positions] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const r = 2.0 + Math.random() * 2.2;

      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
    }
    return [pos];
  }, [count]);

  useFrame((_, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.08;
      pointsRef.current.rotation.x += delta * 0.04;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.035}
        color={color}
        transparent
        opacity={0.65}
        sizeAttenuation
      />
    </points>
  );
};

interface ServicesScene3DProps {
  activeCapability: CapabilityId;
}

export const ServicesScene3D: React.FC<ServicesScene3DProps> = ({ activeCapability }) => {
  const theme = CAPABILITY_THEMES[activeCapability];

  return (
    <div className="canvas-3d-container relative w-full h-[260px] sm:h-[320px] lg:h-[360px] flex items-center justify-center select-none overflow-hidden rounded-3xl border border-white/10 bg-slate-950/40 backdrop-blur-xl shadow-2xl">
      {/* 3D Canvas */}
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [0, 0, 4.8], fov: 42 }}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
      >
        <ambientLight intensity={0.9} />
        <directionalLight position={[4, 6, 4]} intensity={2.0} color="#ffffff" />
        <pointLight position={[-4, -2, -2]} intensity={2.2} color={theme.accentColor} />
        <pointLight position={[3, -2, 3]} intensity={1.8} color={theme.primaryColor} />

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          enableDamping
          dampingFactor={0.07}
          rotateSpeed={0.7}
        />

        <Float speed={2} rotationIntensity={0.25} floatIntensity={0.45}>
          <DynamicCapabilityCore activeCapability={activeCapability} />
          <ParticleDust count={theme.particleCount} color={theme.primaryColor} />
        </Float>
      </Canvas>

      {/* Floating Status Pill */}
      <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-10 pointer-events-none">
        <div className="liquid-glass-pill px-3 py-1 rounded-full text-[10px] font-mono text-slate-300 border border-white/10 flex items-center gap-1.5 shadow-md backdrop-blur-md">
          <span
            className="w-1.5 h-1.5 rounded-full animate-pulse"
            style={{ backgroundColor: theme.primaryColor }}
          />
          <span className="tracking-wider">{theme.label}</span>
        </div>
      </div>

      {/* Bottom Subtle Interaction Hint */}
      <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 z-10 pointer-events-none">
        <span className="text-[10px] font-mono text-slate-400/80 bg-black/40 px-2.5 py-1 rounded-md border border-white/5 backdrop-blur-sm">
          Interactive WebGL · Drag to Rotate
        </span>
      </div>

      {/* Radial Atmospheric Vignette */}
      <div className="pointer-events-none absolute inset-0 bg-radial from-transparent via-transparent to-slate-950/70" />
    </div>
  );
};
