---
name: liquid-glass-ui
description: >-
  Architectural and design guide for implementing optical liquid-glass refraction, chromatic specular rims, and blur surfaces inspired by liquid-glass-js for IdeaForge. Covers selective UI application (navigation, floating controls, buttons, cards), contrast preservation, performance rules, and graceful CSS/WebGL fallbacks.
metadata:
  category: UI & Materials
  framework: WebGL / CSS Shaders / liquid-glass-js
---

# Liquid Glass UI

This skill guides the design and implementation of optical liquid-glass refraction, chromatic specular rims, and tactile blur surfaces within IdeaForge.

Primary Reference: [https://github.com/dashersw/liquid-glass-js](https://github.com/dashersw/liquid-glass-js)

---

## 1. Core Philosophy: Glass as a Material, Not the Design

Liquid glass provides tangible physical weight, depth, and specular clarity to interface elements. 

> [!CAUTION]
> **Anti-Pattern Warning**:
> - Do NOT turn the entire website into frosted glass.
> - Do NOT use muddy black translucent cards with illegible text.
> - Do NOT stack multi-layered heavy blur filters that cripple mobile GPU fill rates.
> 
> Liquid glass must be used **selectively** on high-value interactive focal points.

---

## 2. Targeted Component Applications

| Component | Glass Style | Role in IdeaForge |
| :--- | :--- | :--- |
| **Floating Navbar** | Capsule / Pill Glass | Suspended navigation with subtle edge specular reflection. |
| **Hero CTA Buttons** | Chromatic Liquid Rim | Tactile call to action that refracts background lighting. |
| **Telemetry / Lineage Badges** | Micro Glass Chip | Small floating data chips with high-contrast monospace text. |
| **Modal / Evolution Overlay** | Deep Refraction Glass | High blur (24px–32px) backdrop that isolates active focus. |

---

## 3. Implementation Techniques

### A. CSS Optical Specular Rim Technique (`.liquid-glass`)
For lightweight, ultra-high-performance UI elements (buttons, pills, chips):

```css
/* Base Liquid Glass Token */
.liquid-glass {
  background: rgba(255, 255, 255, 0.02);
  background-blend-mode: luminosity;
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: none;
  box-shadow: 
    inset 0 1px 1px rgba(255, 255, 255, 0.12),
    0 12px 36px rgba(0, 0, 0, 0.5);
  position: relative;
  overflow: hidden;
}

/* Chromatic Edge Mask: Simulates 3D glass bevel refraction */
.liquid-glass::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 1.2px;
  background: linear-gradient(180deg,
    rgba(255, 255, 255, 0.45) 0%,
    rgba(255, 255, 255, 0.12) 25%,
    rgba(255, 255, 255, 0.0) 50%,
    rgba(255, 107, 0, 0.15) 75%,
    rgba(0, 194, 209, 0.35) 100%
  );
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
}

.liquid-glass:hover {
  background: rgba(255, 255, 255, 0.05);
  box-shadow: 
    inset 0 1px 2px rgba(255, 255, 255, 0.2),
    0 16px 48px rgba(0, 0, 0, 0.65);
}
```

### B. WebGL Refraction Shaders (`liquid-glass-js`)
When dynamic optical distortion of background elements is required (e.g. interactive lens hovering over 3D scenes):
- Bind the underlying canvas or DOM texture to a displacement shader.
- Apply a normal map with smooth rounded bevels.
- Tint the refraction channel with IdeaForge Ember Orange (`#FF6B00`) or Cyan (`#00C2D1`) at low alpha (< 0.08).

---

## 4. Legibility & Contrast Rules

1. **Text Contrast Guarantee**:
   - Never place unshadowed white text over light or unpredictable glass refractions.
   - Maintain minimum **4.5:1** contrast ratio. Use obsidian surface anchors (`#080b12` at 80% opacity) behind dense informational text.
2. **Tabular & Monospace Elements**:
   - For version badges (`V1`, `V2`, `V3`), pair glass pills with dark solid pill inserts (`bg-black/50`) to keep numbers instantly readable.
3. **Tint Coordination**:
   - Active / Sparring elements: Subtle Ember Orange refraction glow (`rgba(255, 107, 0, 0.15)`).
   - Grounded / Evidence elements: Subtle Cyan refraction glow (`rgba(0, 194, 209, 0.15)`).

---

## 5. Performance & Compatibility Discipline

- **Limit Blur Radii**: Keep `backdrop-filter: blur()` values between `12px` and `24px`. Going above `40px` causes severe frame drops on integrated GPUs.
- **Hardware Acceleration**: Always apply `transform: translateZ(0)` or `will-change: transform` to floating glass panels to isolate composite layers.
- **Fallback for Non-Supporting Browsers**:
  ```css
  @supports not (backdrop-filter: blur(10px)) {
    .liquid-glass {
      background: rgba(10, 14, 22, 0.95);
      border: 1px solid rgba(255, 255, 255, 0.15);
    }
  }
  ```
