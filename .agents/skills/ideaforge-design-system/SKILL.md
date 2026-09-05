---
name: ideaforge-design-system
description: >-
  The master design system and product identity skill for IdeaForge. Defines the core positioning, the 6-stage evolutionary lifecycle (Capture to Evolve), brand tokens, editorial typography, layering rules for combining 3D/glass/gradient/chrome libraries, motion and performance principles, and design standards inspired by Linear, Raycast, and Vercel.
metadata:
  category: Product & Design System
  framework: IdeaForge Brand Architecture
---

# IdeaForge Design System

This is the primary project-specific skill governing all visual, interaction, and architectural decisions across IdeaForge.

---

## 1. Product Identity & Core Concept

**IdeaForge** is an AI-powered idea journal and cognitive workspace built around one fundamental truth:

> ### **IDEAS EVOLVE.**
>
> **Definitive Positioning**:
> *“Most AI tools help you generate an idea.*  
> *IdeaForge helps you watch an idea get better — and remembers why.”*

### The Core 6-Stage Lifecycle
Every workflow and visual narrative in IdeaForge reflects this cognitive progression:

```
Capture ➔ Clarify ➔ Challenge ➔ Evidence ➔ Revise ➔ Evolve
```

1. **Capture**: Record the raw spark, intuitive insight, or unvarnished premise without premature bias.
2. **Clarify**: Strip ambiguity, deconstruct implicit assumptions, and define unit mechanics.
3. **Challenge**: Gemini 2.5 adversarial sparring agent attacks blind spots, fatal flaws, and unit economics.
4. **Evidence**: Autonomous web research (Tavily) retrieves empirical regulatory, market, and competitor benchmarks.
5. **Revise**: Synthesize critiques and empirical findings into structured mutations (`V1 → V2 → V3`).
6. **Evolve**: Commit verified breakthrough with persistent genetic lineage—preserving not just *what* changed, but *why* it changed.

---

## 2. Emotional Tone & Anti-Patterns

### How IdeaForge MUST Feel:
- **Intelligent & Focused**: Quiet confidence; content and ideas take center stage.
- **Calm & Sophisticated**: Deep obsidian spaces punctuated by purposeful light.
- **Technically Impressive**: Cutting-edge WebGL/Three.js executed with rigorous performance discipline.
- **Human**: A collaborative thinking partner that amplifies human conviction.

### How IdeaForge MUST NOT Feel:
- ❌ **NOT generic AI SaaS**: No generic purple gradients, robot illustrations, or bubbly chatbot avatars.
- ❌ **NOT a dashboard template**: No cluttered panels, generic KPI cards, or arbitrary data charts.
- ❌ **NOT a gaming or crypto UI**: No heavy neon wireframes, cyberpunk HUDs, or aggressive scanlines.
- ❌ **NOT excessive glassmorphism**: No muddy semi-transparent cards that compromise contrast.
- ❌ **NOT a random tech demo**: No disjointed 3D experiments running without product purpose.

---

## 3. Brand Tokens & Color Palette

IdeaForge balances the heat of the forge with the clarity of empirical truth:

```css
:root {
  /* Canvas & Void */
  --forge-bg: #04060a;          /* Ultimate void foundation */
  --forge-surface-1: #080b12;   /* Base workspace canvas */
  --forge-surface-2: #0d121c;   /* Elevated card / interactive tile */
  --forge-surface-3: #141c2b;   /* Active selection / popover */

  /* The Active Forge (Intellectual Combustion) */
  --forge-ember: #FF6B00;       /* Primary active energy */
  --forge-ember-hover: #FF8533; /* Lightened interaction state */
  --forge-ember-glow: rgba(255, 107, 0, 0.25);

  /* The Empirical Ground (Cooled Truth & Evidence) */
  --forge-cyan: #00C2D1;        /* Tavily research / verified data */
  --forge-cyan-light: #38BDF8;  /* Accent telemetry */
  --forge-cyan-glow: rgba(0, 194, 209, 0.25);

  /* Success & Lineage Verification */
  --forge-emerald: #06D6A0;     /* Breakthrough verified badge */

  /* Hairlines & Specular Borders */
  --forge-border-subtle: rgba(255, 255, 255, 0.06);
  --forge-border-default: rgba(255, 255, 255, 0.12);
  --forge-border-specular: rgba(255, 255, 255, 0.24);
}
```

---

## 4. Editorial Typography Hierarchy

Typography in IdeaForge must reflect editorial authority and modern software craftsmanship:

- **Display & Headings**: `'Outfit'`, sans-serif — Geometric, modern, highly legible at massive scale.
- **Body & Product Text**: `'Inter'` or `'Geist'`, sans-serif — High neutral readability, optimized for dense technical critique.
- **Editorial Quotations & Manifestos**: `'Instrument Serif'`, serif — Humanistic, thoughtful, contemplative.
- **Data, Citations & Version Tags**: Monospace with tabular numbers (`V1`, `V2`, `V3`, timestamps, unit margins).

---

## 5. How to Combine the Four Visual Libraries

IdeaForge uses four specialized visual references as **complementary architectural layers**:

```
┌─────────────────────────────────────────────────────────────┐
│ 4. LIQUID LOGO       ➔ Brand Identity (Emblem, Reveal)      │
├─────────────────────────────────────────────────────────────┤
│ 3. LIQUID GLASS      ➔ Interface Material (Nav, CTA, Badges)│
├─────────────────────────────────────────────────────────────┤
│ 2. SHADER GRADIENT   ➔ Environment & Atmosphere (Backdrop)  │
├─────────────────────────────────────────────────────────────┤
│ 1. REACT THREE FIBER ➔ 3D Spatial Foundation (Lattice Core) │
└─────────────────────────────────────────────────────────────┘
```

### Layer Composition Guidelines:
- **Hero Section**:
  - `R3F`: Central 3D Idea Lattice (interactive nucleus).
  - `ShaderGradient / Atmosphere`: Deep background ambient glow (Ember + Cyan).
  - `Liquid Logo`: Specular metallic flame brand insignia.
  - `Liquid Glass`: Floating navigation capsule and primary CTA button.
- **Content & Cycle Sections**:
  - Predominantly clean semantic HTML/CSS and responsive Tailwind layout.
  - Subtle micro-glass badges and interactive state cards.
- **Interactive Lineage Explorer**:
  - High-contrast tabular diff engine comparing `V1 → V2 → V3`.
- **Launch CTA Section**:
  - Floating liquid-glass refractive card with chromatic rim lighting.

> [!IMPORTANT]
> **The Cohesion Mandate**:
> Choose the **minimum combination** needed for each section.
> The visitor must experience **ONE COHESIVE PRODUCT**, never a collage of four separate web experiments.

---

## 6. Motion & Interaction Standards

Motion in IdeaForge is purposeful, responsive, and grounded:

1. **What Motion Communicates**:
   - **Arrival**: Smooth entrance (`y: 20 -> 0, opacity: 0 -> 1`) using cubic-bezier easing (`[0.16, 1, 0.3, 1]`).
   - **Evolution**: Step transitions morph cleanly across layout coordinates.
   - **Feedback**: Instant micro-interactions on hover/active states (scale `0.98` on click, subtle border illumination).
2. **What Motion Avoids**:
   - No constant unprompted bouncing or looping distraction.
   - No slow, tedious transitions (> 600ms) that make the tool feel sluggish.
3. **Accessibility**:
   - Always honor `prefers-reduced-motion: reduce`.
   - Replace continuous rotations with clean, static, high-contrast layouts.

---

## 7. Performance Discipline

1. **Device Pixel Ratio (DPR)**: Cap WebGL canvas DPR at `1.75`.
2. **Offscreen Throttling**: Use `IntersectionObserver` to halt requestAnimationFrame loops when components leave the viewport.
3. **Context Sharing**: Avoid creating multiple independent WebGL `<canvas>` elements on the same screen.
4. **Mobile Fallback**: Simplify 3D geometry counts and disable expensive multi-pass blurs on mobile devices.
5. **Zero Interaction Latency**: Ensure the main thread remains free for input responsiveness.
