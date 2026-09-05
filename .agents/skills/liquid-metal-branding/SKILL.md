---
name: liquid-metal-branding
description: >-
  Architectural and design guide for implementing liquid-metal, chrome, and specular reflection brand treatments inspired by paper-design/liquid-logo for IdeaForge. Covers interactive logo emblems, hero brand reveals, specular normal maps, lighting responsiveness, static fallbacks, and performance constraints.
metadata:
  category: Branding & Identity
  framework: WebGL / SVG Filters / liquid-logo
---

# Liquid Metal Branding

This skill guides the implementation of liquid-metal, molten chrome, and specular lighting treatments for IdeaForge's brand assets.

Primary Reference: [https://github.com/paper-design/liquid-logo](https://github.com/paper-design/liquid-logo)

---

## 1. Core Principle: Selective Brand Dignity

Molten liquid metal communicates the idea of a **forge** — raw creative concepts being liquefied, heated, hammered, and cooled into enduring form.

> [!WARNING]
> **Strict Restraint Rules**:
> 1. **Do NOT make the whole site chrome**: Liquid metal is reserved exclusively for the IdeaForge flame emblem and select flagship brand moments.
> 2. **Never compromise logo silhouette**: The geometric identity must remain instantly recognizable from all viewing angles.
> 3. **Avoid heavy continuous fluid physics**: Prefer normal-mapped specular reflection and matcap shaders over complex real-time Navier-Stokes fluid simulations.

---

## 2. Targeted Brand Applications

| Brand Asset | Treatment | Interaction |
| :--- | :--- | :--- |
| **Navbar Brand Emblem** | Micro Liquid Chrome | Subtle specular sheen shift on hover (`18px × 18px`). |
| **Hero Brand Ingot / Logo Reveal** | Sculpted Molten Chrome | Refracts environment lights (orange & cyan) on pointer move. |
| **Evolution V3 Achievement Seal** | Crystallized Polished Metal | Gilded chrome badge marking a verified idea breakthrough. |

---

## 3. Implementation Techniques

### A. WebGL Matcap / Environment Reflection (High Performance)
Map a custom high-contrast studio environment map (with warm amber and cold cyan light reflections) onto the IdeaForge 3D flame mesh:

```tsx
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function LiquidMetalFlameLogo() {
  const meshRef = useRef<THREE.Mesh>(null!);

  useFrame((state, delta) => {
    // Subtle breathing rotation
    const t = state.clock.getElapsedTime();
    meshRef.current.rotation.y = Math.sin(t * 0.5) * 0.15;
    meshRef.current.rotation.x = Math.cos(t * 0.4) * 0.08;
  });

  return (
    <mesh ref={meshRef}>
      {/* IdeaForge Extruded Flame Geometry */}
      <cylinderGeometry args={[1, 1.2, 0.4, 32]} />
      <meshStandardMaterial
        color="#ffffff"
        metalness={0.95}
        roughness={0.08}
        envMapIntensity={1.8}
      />
    </mesh>
  );
}
```

### B. High-Performance SVG Displacement & CSS Sheen Fallback
For ultra-lightweight UI contexts (such as the navigation bar) where running a full WebGL renderer would be wasteful:

```css
/* Liquid Metal Chrome Gradient with Dynamic Specular Reflection */
.liquid-chrome-emblem {
  background: linear-gradient(135deg, 
    #ffffff 0%, 
    #d1d5db 20%, 
    #4b5563 45%, 
    #FF8533 55%, 
    #1f2937 75%, 
    #9ca3af 100%
  );
  background-size: 200% 200%;
  box-shadow: 
    0 0 20px rgba(255, 107, 0, 0.4),
    inset 0 1px 1px rgba(255, 255, 255, 0.8),
    inset 0 -1px 2px rgba(0, 0, 0, 0.8);
  transition: background-position 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

.liquid-chrome-emblem:hover {
  background-position: 100% 100%;
}
```

---

## 4. Accessibility & Fallbacks

1. **Static Vector Fallback**:
   - Always render an embedded SVG inside `<noscript>` or when WebGL context initialization fails.
   - The fallback must use clean IdeaForge Ember Orange (`#FF6B00`) flat geometry with crisp vector scaling.
2. **prefers-reduced-motion**:
   - Disable interactive mouse-tracking fluid ripple and freeze specular shifts.
   - Maintain a pristine, stationary metallic sheen.
