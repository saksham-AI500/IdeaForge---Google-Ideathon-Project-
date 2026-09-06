import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { Sparkles, Shield, Cpu, RotateCcw } from 'lucide-react';

export type EvolutionStageKey = 'v1' | 'v2' | 'v3';

interface EvolutionStageConfig {
  name: string;
  badge: string;
  tagline: string;
  coreColor: string;
  emissiveColor: string;
  wireColor: string;
  ringColor: string;
  geometryDetail: number;
  roughness: number;
  transmission: number;
  emissiveIntensity: number;
  particleCount: number;
  pulseSpeed: number;
}

const STAGE_CONFIGS: Record<EvolutionStageKey, EvolutionStageConfig> = {
  v1: {
    name: 'Fragile Spark',
    badge: 'STAGE 01 // HYPOTHESIS',
    tagline: 'Raw instinct & ungrounded assumptions',
    coreColor: '#38bdf8',
    emissiveColor: '#0284c7',
    wireColor: '#7dd3fc',
    ringColor: '#38bdf8',
    geometryDetail: 1,
    roughness: 0.25,
    transmission: 0.9,
    emissiveIntensity: 0.6,
    particleCount: 50,
    pulseSpeed: 1.5,
  },
  v2: {
    name: 'Stress-Test',
    badge: 'STAGE 02 // SILLICON SPARRING',
    tagline: 'Assumptions interrogated by Gemini',
    coreColor: '#818cf8',
    emissiveColor: '#4f46e5',
    wireColor: '#c084fc',
    ringColor: '#a855f7',
    geometryDetail: 2,
    roughness: 0.12,
    transmission: 0.85,
    emissiveIntensity: 1.2,
    particleCount: 85,
    pulseSpeed: 2.8,
  },
  v3: {
    name: 'Ironclad Core',
    badge: 'STAGE 03 // BATTLE-TESTED',
    tagline: 'Grounded in evidence & immutable rationale',
    coreColor: '#2dd4bf',
    emissiveColor: '#0f766e',
    wireColor: '#67e8f9',
    ringColor: '#2dd4bf',
    geometryDetail: 3,
    roughness: 0.04,
    transmission: 0.95,
    emissiveIntensity: 1.8,
    particleCount: 120,
    pulseSpeed: 1.0,
  },
};

// Procedural 3D Evolving Core Mesh
const CognitiveCore: React.FC<{
  stage: EvolutionStageKey;
  mousePos: React.MutableRefObject<{ x: number; y: number }>;
  scrollPos: React.MutableRefObject<number>;
}> = ({ stage, mousePos, scrollPos }) => {
  const config = STAGE_CONFIGS[stage];
  const groupRef = useRef<THREE.Group>(null!);
  const outerMeshRef = useRef<THREE.Mesh>(null!);
  const innerNucleusRef = useRef<THREE.Mesh>(null!);
  const wireframeRef = useRef<THREE.LineSegments>(null!);

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();

    if (groupRef.current) {
      // 1. Smooth mouse pointer interaction (damping / lerp)
      const targetRotX = mousePos.current.y * 0.45;
      const targetRotY = mousePos.current.x * 0.55;
      groupRef.current.rotation.x = THREE.MathUtils.lerp(
        groupRef.current.rotation.x,
        targetRotX,
        0.06
      );
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        targetRotY,
        0.06
      );

      // 2. Smooth scroll interaction: responsive twist on page scroll
      const scrollInfluence = (scrollPos.current * 0.0015);
      groupRef.current.rotation.z = Math.sin(t * 0.4) * 0.08 + scrollInfluence;
    }

    // 3. Inner nucleus counter-spin & energetic pulse
    if (innerNucleusRef.current) {
      innerNucleusRef.current.rotation.x -= delta * (stage === 'v2' ? 1.4 : 0.7);
      innerNucleusRef.current.rotation.y += delta * (stage === 'v2' ? 1.8 : 0.9);
      const pulse = Math.sin(t * config.pulseSpeed) * 0.08;
      innerNucleusRef.current.scale.set(1 + pulse, 1 + pulse, 1 + pulse);
    }

    // 4. Outer crystal breathing & rotation
    if (outerMeshRef.current) {
      outerMeshRef.current.rotation.y += delta * 0.25;
      outerMeshRef.current.rotation.x += delta * 0.12;
      const outerScale = stage === 'v3' ? 1.25 : stage === 'v2' ? 1.15 : 1.0;
      const breathing = Math.sin(t * 1.8) * 0.03;
      const finalScale = THREE.MathUtils.lerp(
        outerMeshRef.current.scale.x,
        outerScale + breathing,
        0.08
      );
      outerMeshRef.current.scale.set(finalScale, finalScale, finalScale);
    }

    // 5. Geodesic lattice structural spin
    if (wireframeRef.current) {
      wireframeRef.current.rotation.y -= delta * 0.18;
      wireframeRef.current.rotation.z += delta * 0.14;
    }
  });

  return (
    <group ref={groupRef}>
      {/* 1. Luminescent Inner Nucleus */}
      <mesh ref={innerNucleusRef}>
        <octahedronGeometry args={[0.7, stage === 'v3' ? 1 : 0]} />
        <meshStandardMaterial
          color={config.coreColor}
          emissive={config.emissiveColor}
          emissiveIntensity={config.emissiveIntensity}
          roughness={0.1}
          metalness={0.8}
        />
      </mesh>

      {/* 2. Outer Crystal Refraction Shell */}
      <mesh ref={outerMeshRef}>
        <icosahedronGeometry args={[1.35, config.geometryDetail]} />
        <meshPhysicalMaterial
          color={config.coreColor}
          emissive={config.emissiveColor}
          emissiveIntensity={config.emissiveIntensity * 0.4}
          roughness={config.roughness}
          metalness={0.2}
          transmission={config.transmission}
          ior={1.5}
          thickness={1.4}
          clearcoat={1.0}
          clearcoatRoughness={0.1}
          transparent
          opacity={0.88}
        />
      </mesh>

      {/* 3. Structural Geodesic Wireframe Lattice */}
      <lineSegments ref={wireframeRef}>
        <wireframeGeometry args={[new THREE.IcosahedronGeometry(1.6, config.geometryDetail)]} />
        <lineBasicMaterial
          color={config.wireColor}
          transparent
          opacity={stage === 'v3' ? 0.6 : stage === 'v2' ? 0.45 : 0.25}
          linewidth={1}
        />
      </lineSegments>
    </group>
  );
};

// Connected Dual Gyro Orbital Rings with Satellite Nodes
const OrbitalRings: React.FC<{ stage: EvolutionStageKey }> = ({ stage }) => {
  const ring1Ref = useRef<THREE.Group>(null!);
  const ring2Ref = useRef<THREE.Group>(null!);
  const sat1Ref = useRef<THREE.Mesh>(null!);
  const sat2Ref = useRef<THREE.Mesh>(null!);
  const config = STAGE_CONFIGS[stage];

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();
    if (ring1Ref.current) {
      ring1Ref.current.rotation.z += delta * 0.35;
      ring1Ref.current.rotation.x += delta * 0.12;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.y += delta * 0.28;
      ring2Ref.current.rotation.z -= delta * 0.18;
    }

    // Satellite node orbit positions
    if (sat1Ref.current) {
      sat1Ref.current.position.x = Math.cos(t * 1.5) * 2.3;
      sat1Ref.current.position.y = Math.sin(t * 1.5) * 2.3;
    }
    if (sat2Ref.current) {
      sat2Ref.current.position.x = Math.cos(t * -1.2) * 2.8;
      sat2Ref.current.position.z = Math.sin(t * -1.2) * 2.8;
    }
  });

  return (
    <>
      {/* Primary Gyro Ring */}
      <group ref={ring1Ref} rotation={[Math.PI / 3, 0, 0]}>
        <mesh>
          <torusGeometry args={[2.3, 0.012, 16, 100]} />
          <meshBasicMaterial
            color={config.ringColor}
            transparent
            opacity={stage === 'v3' ? 0.5 : 0.3}
          />
        </mesh>
        {/* Orbital Satellite Node */}
        <mesh ref={sat1Ref}>
          <sphereGeometry args={[0.06, 12, 12]} />
          <meshStandardMaterial
            color="#ffffff"
            emissive={config.ringColor}
            emissiveIntensity={2.0}
          />
        </mesh>
      </group>

      {/* Secondary Counter-Gyro Ring */}
      <group ref={ring2Ref} rotation={[-Math.PI / 4, Math.PI / 4, 0]}>
        <mesh>
          <torusGeometry args={[2.8, 0.01, 16, 100]} />
          <meshBasicMaterial
            color={stage === 'v2' ? '#c084fc' : config.ringColor}
            transparent
            opacity={0.25}
          />
        </mesh>
        {/* Secondary Satellite Node */}
        <mesh ref={sat2Ref}>
          <sphereGeometry args={[0.05, 12, 12]} />
          <meshStandardMaterial
            color="#ffffff"
            emissive={stage === 'v2' ? '#c084fc' : config.ringColor}
            emissiveIntensity={1.8}
          />
        </mesh>
      </group>
    </>
  );
};

// Quantum Thought Sparks / Coherent Field
const QuantumSparks: React.FC<{ stage: EvolutionStageKey }> = ({ stage }) => {
  const pointsRef = useRef<THREE.Points>(null!);
  const count = STAGE_CONFIGS[stage].particleCount;

  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const c1 = new THREE.Color(STAGE_CONFIGS[stage].coreColor);
    const c2 = new THREE.Color(STAGE_CONFIGS[stage].ringColor);
    const white = new THREE.Color('#ffffff');

    for (let i = 0; i < count; i++) {
      const radius = 1.9 + Math.random() * 2.0;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      pos[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = radius * Math.cos(phi);

      const mixed = c1.clone().lerp(c2, Math.random()).lerp(white, Math.random() * 0.4);
      col[i * 3] = mixed.r;
      col[i * 3 + 1] = mixed.g;
      col[i * 3 + 2] = mixed.b;
    }
    return [pos, col];
  }, [count, stage]);

  useFrame((state, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.12;
      pointsRef.current.rotation.x += delta * 0.06;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={stage === 'v3' ? 0.08 : 0.06}
        vertexColors
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};

export const HeroScene: React.FC = () => {
  const [stage, setStage] = useState<EvolutionStageKey>('v1');
  const mousePos = useRef({ x: 0, y: 0 });
  const scrollPos = useRef(0);

  // Smooth mouse movement tracking across window
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Normalize from -1 to 1
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = -(e.clientY / window.innerHeight) * 2 + 1;
      mousePos.current = { x: nx, y: ny };
    };

    const handleScroll = () => {
      scrollPos.current = window.scrollY;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const activeConfig = STAGE_CONFIGS[stage];

  return (
    <div className="canvas-3d-container relative w-full h-[400px] sm:h-[460px] lg:h-[490px] flex items-center justify-center select-none">
      {/* Three.js Canvas */}
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [0, 0, 5.2], fov: 42 }}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
      >
        <ambientLight intensity={0.85} />
        <directionalLight position={[5, 8, 5]} intensity={1.8} color="#ffffff" />
        <pointLight position={[-4, -3, -2]} intensity={2.5} color={activeConfig.ringColor} />
        <pointLight position={[3, -2, 4]} intensity={2.0} color={activeConfig.coreColor} />

        {/* Orbit Controls with Damping (silky smooth drag) */}
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          enableDamping
          dampingFactor={0.06}
          rotateSpeed={0.8}
        />

        <Float speed={2} rotationIntensity={0.3} floatIntensity={0.5}>
          <CognitiveCore stage={stage} mousePos={mousePos} scrollPos={scrollPos} />
          <OrbitalRings stage={stage} />
          <QuantumSparks stage={stage} />
        </Float>
      </Canvas>

      {/* Floating Status Badge at top right */}
      <div className="absolute top-2 sm:top-4 right-2 sm:right-4 z-20 pointer-events-none">
        <div className="liquid-glass-pill px-3 py-1 rounded-full text-[10px] font-mono text-slate-300 border border-white/10 flex items-center gap-1.5 shadow-lg backdrop-blur-md">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>REALTIME 3D · DRAG TO ROTATE</span>
        </div>
      </div>

      {/* Stage Evolution Control Bar */}
      <div className="absolute bottom-2 sm:bottom-4 z-20 w-full px-4 flex flex-col items-center gap-2">
        <div className="liquid-glass-surface p-1.5 rounded-2xl border border-white/10 shadow-2xl backdrop-blur-xl flex items-center gap-1 sm:gap-2">
          {(['v1', 'v2', 'v3'] as EvolutionStageKey[]).map((stgKey) => {
            const isSelected = stage === stgKey;
            const item = STAGE_CONFIGS[stgKey];
            return (
              <button
                key={stgKey}
                onClick={() => setStage(stgKey)}
                id={`btn-3d-stage-${stgKey}`}
                className={`px-3 sm:px-4 py-1.5 rounded-xl text-xs font-mono transition-all duration-300 cursor-pointer flex items-center gap-1.5 sm:gap-2 ${
                  isSelected
                    ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white font-semibold shadow-[0_0_16px_rgba(99,102,241,0.5)] scale-102'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                {stgKey === 'v1' && <Sparkles className="w-3.5 h-3.5 text-cyan-300" />}
                {stgKey === 'v2' && <Cpu className="w-3.5 h-3.5 text-indigo-300" />}
                {stgKey === 'v3' && <Shield className="w-3.5 h-3.5 text-emerald-300" />}
                <span>{item.name}</span>
              </button>
            );
          })}
        </div>

        {/* Micro subtitle describing the active stage */}
        <div className="text-[11px] font-mono text-slate-400 text-center tracking-wide drop-shadow">
          <span className="text-cyan-400 font-semibold">{activeConfig.badge}:</span>{' '}
          <span>{activeConfig.tagline}</span>
        </div>
      </div>

      {/* Subtle vignette shadow framing */}
      <div className="pointer-events-none absolute inset-0 bg-radial from-transparent via-transparent to-[#07090e]/80" />
    </div>
  );
};
