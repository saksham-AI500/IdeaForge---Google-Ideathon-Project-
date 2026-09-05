---
name: r3f-3d-experience
description: >-
  Provides comprehensive architectural guidance for building high-performance, interactive 3D WebGL scenes using React Three Fiber (@react-three/fiber) and Three.js within IdeaForge. Covers camera choreography, lighting, custom shaders, pointer/scroll interactions, responsive canvas sizing, React 19 compatibility, and WebGL performance safeguards.
metadata:
  category: 3D & Graphics
  framework: Three.js / React Three Fiber
---

# React Three Fiber (R3F) 3D Experience

This skill guides the creation of production-grade, interactive 3D WebGL scenes for IdeaForge using **React Three Fiber** and **Three.js**.

Primary Reference: [https://github.com/pmndrs/react-three-fiber](https://github.com/pmndrs/react-three-fiber)

---

## 1. Environment & Dependency Alignment

Before adding or executing R3F code in the project, verify dependency alignment in `frontend/package.json`:

```json
{
  "dependencies": {
    "react": "^19.2.8",
    "react-dom": "^19.2.8",
    "three": "^0.185.1"
  }
}
```

> [!IMPORTANT]
> **React 19 Compatibility Rule**:
> - `@react-three/fiber` **v9** is required for **React 19**.
> - `@react-three/fiber` **v8** only pairs with **React 18** and will fail peer dependency resolution in React 19.
> - When using R3F in React 19, ensure you install `@react-three/fiber@^9.0.0` or use a direct Three.js canvas abstraction (such as `EvolutionCanvas3D`) to guarantee zero version conflicts and maximum runtime control.

---

## 2. Core Scene Architecture

Every R3F scene in IdeaForge must adhere to the declarative component hierarchy:

```tsx
import React, { useRef, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

export function IdeaForgeScene() {
  return (
    <div className="relative w-full h-full min-h-[400px]">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 45 }}
        dpr={[1, 1.75]} // Cap DPR to 1.75 to prevent GPU throttling on high-res displays
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[5, 5, 5]} color="#FF6B00" intensity={2.5} />
        <pointLight position={[-5, -5, 3]} color="#00C2D1" intensity={2.0} />

        <Suspense fallback={null}>
          <EvolutionLatticeCore />
        </Suspense>
      </Canvas>
    </div>
  );
}
```

---

## 3. The IdeaForge Visual Language in 3D

3D elements in IdeaForge must represent **Idea Evolution** (not generic floating shapes):

1. **The Evolution Core (Nucleus)**:
   - Faceted crystalline geometry (e.g., `IcosahedronGeometry`, `DodecahedronGeometry`).
   - Material: `MeshPhysicalMaterial` with subtle transmission, low roughness (0.15–0.25), and high clearcoat (1.0).
   - Dynamic breathing pulse tied to time or scroll depth.

2. **Thought-Vector Constellations (Particles & Rings)**:
   - Counter-rotating orbital rings representing constraint pathways.
   - Particle nodes created via `BufferGeometry` with additive blending (`THREE.AdditiveBlending`).
   - Color coordination: IdeaForge Ember Orange (`#FF6B00`) and Empirical Cyan (`#00C2D1`).

---

## 4. Interaction Patterns

### A. Pointer Inertia & Parallax
Do not snap rotation directly to pointer coordinates. Always smooth transitions using frame delta or linear interpolation (lerp):

```tsx
function InteractiveObject() {
  const meshRef = useRef<THREE.Mesh>(null!);
  const targetRotation = useRef({ x: 0, y: 0 });

  useFrame((state, delta) => {
    // Read normalized pointer (-1 to +1)
    targetRotation.current.x = -state.pointer.y * 0.4;
    targetRotation.current.y = state.pointer.x * 0.6;

    // Smooth lerp with delta independence
    meshRef.current.rotation.x = THREE.MathUtils.damp(
      meshRef.current.rotation.x,
      targetRotation.current.x,
      4,
      delta
    );
    meshRef.current.rotation.y = THREE.MathUtils.damp(
      meshRef.current.rotation.y,
      targetRotation.current.y,
      4,
      delta
    );
  });

  return (
    <mesh ref={meshRef}>
      <icosahedronGeometry args={[1.5, 1]} />
      <meshStandardMaterial color="#FF8533" wireframe />
    </mesh>
  );
}
```

### B. Scroll-Linked Transformation
Synchronize 3D properties with window scroll using Lenis or native scroll offsets:
- `V1 Stage (Top of page)`: Loose, volatile wireframe with open vertices.
- `V2 Stage (Middle of page)`: Tension rings tighten, cyan evidence vectors connect.
- `V3 Stage (Breakthrough)`: Faceted, solid, luminous crystalline lattice.

---

## 5. Performance & Mobile Safeguards

1. **Device Pixel Ratio (DPR) Cap**:
   - Always set `dpr={[1, 1.75]}` on `<Canvas />`. Never allow unrestricted `dpr={window.devicePixelRatio}` on 3x displays (e.g., iPhone/Retina MacBook).
2. **Offscreen Throttling**:
   - Wrap canvas in an `IntersectionObserver` or use R3F's `frameloop="demand"` when static. Stop the rendering loop when the component is scrolled out of view.
3. **Mobile Simplification**:
   - Detect mobile viewport (`window.innerWidth < 768px`).
   - Reduce particle counts by 50% (e.g., 60 nodes instead of 120+).
   - Disable expensive post-processing bloom or depth of field on mobile.
4. **prefers-reduced-motion Support**:
   - Query `window.matchMedia('(prefers-reduced-motion: reduce)')`.
   - Freeze continuous auto-rotation and disable aggressive orbital shifts. Keep lighting and material reflections subtle and static.
5. **Memory & Resource Disposal**:
   - In direct Three.js implementations, always call `.dispose()` on all geometries, materials, and textures in the `useEffect` cleanup return function.
