---
name: premium-web-ui-architecture
description: Architectural principles and spatial design systems for crafting premium, uncluttered web interfaces inspired by Apple, Linear, Vercel, Stripe, Raycast, and Anthropic. Teaches structural hierarchy, container scales, fluid typography, bento grids, button placement, section rhythm, and disciplined usage of 3D, Liquid Glass, and shaders.
---

# Premium Web UI Architecture

A comprehensive design playbook and spatial architecture system for building world-class, uncluttered digital products. Derived from the engineering and human interface guidelines of Apple, Linear, Vercel, Stripe, Raycast, Anthropic, and OpenAI.

---

## 🏛️ The Core Architectural Law

> **STRUCTURE FIRST → HIERARCHY SECOND → CONTENT THIRD → MATERIALS/STYLE FOURTH → MOTION LAST**

### The Critical Failure to Avoid
> ❌ **Antipattern:** "Add beautiful components, glass cards, and 3D effects first, then try to arrange them on the page."  
> This produces visual chaos: competing focal points, glass-on-glass stacking, inconsistent max-widths, and an interface that feels like a disjointed theme park of visual gimmicks.

> ✅ **The Architecture First Law:** "Design the information architecture, container hierarchy, and spatial rhythm *before* introducing visual materials. If a page does not work as a clean, high-contrast monochrome wireframe, visual effects will only magnify its structural flaws."

---

## 📐 The 21 Pillars of Premium UI Architecture

### 1. Page Architecture & Focal Points (Anthropic/OpenAI "Clinical" Aesthetic)
* **Single Focal Point Rule:** Every screen and section must have exactly **one dominant anchor** (a bold headline, a hero visualization, or an active interactive centerpiece).
* **Subtractive Design:** Remove unnecessary borders, shadows, and decorations. Let the content and high-contrast typography do the heavy lifting.
* **Scanning Arc:** Follow natural F-pattern / Z-pattern reading flows. Eye travels: `Context Pill → Headline → Core Narrative → Primary Action`.

### 2. Layout & Container Scale Systems
* **Unified Max-Width Architecture:** Never allow sections on the same page to jump erratically between arbitrary widths. Use 1140px to 1280px for standard reading.
* **Standard IdeaForge Container Hierarchy:**
  * `max-w-6xl` (1152px): Standard page content, feature grids, and comparison showcases.
  * `max-w-5xl` (1024px): Editorial narratives, reading journeys, and the IdeaForge origin story.
  * `max-w-md` / `max-w-lg` (448px–512px): Centered single-purpose surfaces (Auth gateway, prompt inputs).
* **Horizontal Centering:** Containers along the vertical axis must always be explicitly centered (`mx-auto` + `self-center` / `items-center` on flex parents).

### 3. Grid, Alignment & Spatial Columns (Framer/Linear Bento)
* **Bento UI & Asymmetric Grids:** Use CSS Grid (`grid-cols-12`) to build modular blocks (Bento layouts) that assign different spatial weights to primary vs. secondary features. Avoid plain flex-wrap layouts.
* **Strict Left-Edge and Center-Axis Alignment:** Elements within a section must align strictly to the container’s grid lines. Avoid rogue 5px–15px misalignments caused by ad-hoc padding.

### 4. Responsive Hierarchy & Mobile Stacking
* **Do Not Shrink — Restructure:** Mobile is an intentional vertical narrative, not a shrunken desktop viewport.
* **Responsive Hierarchy Rules:**
  1. Secondary and tertiary controls collapse into drawers or secondary tabs.
  2. Multi-column grids (`grid-cols-2`, `grid-cols-3`) collapse cleanly into `grid-cols-1`.
  3. Container Queries (`@container`) over Media Queries where applicable.
  4. Ensure zero horizontal overflow (`overflow-x-hidden`).

### 5. Navigation Architecture
* **Global Navigation Strata:** The navbar lives on a dedicated spatial plane (`z-50`). It must remain clean, predictable, and scannable.
* **Active Indicator Discipline:** Only the current section or page receives active pill lighting. Supporting navigation items remain quiet until hovered.
* **Contextual Actions in Navbar:** The navbar should house only brand identity, high-level routing, and exactly **one primary launch CTA** (`Launch Forge`).

### 6. Action & Button Hierarchy (Stripe / Vercel Standard)
Every screen and section must enforce strict action tiering:
* **Primary Action (Weight 100):**
  * Solid brand accent (`bg-gradient-to-r from-[#FF6B00] to-[#FF8533]`).
  * Exactly **one** per visual scope.
  * Commands primary visual attention.
* **Secondary Action (Weight 40):**
  * Subtle outline or muted glass surface (`bg-white/[0.04] border border-white/10 hover:bg-white/[0.08]`).
  * Accompanying action that does not compete with the primary.
* **Tertiary Action (Weight 15):**
  * Quiet text link with directional arrow (`text-white/60 hover:text-white`).

### 7. Button Placement & Content Proximity
* **Proximity Rule:** Place actions directly beneath the content they govern. Never scatter buttons into arbitrary card corners merely because whitespace exists.
* **Reading Order Alignment:** In left-aligned editorial sections, buttons align left. In centered hero/callout sections, buttons align center.
* **Full-Width Mobile Rule:** On touch screens (`< 640px`), buttons expand to comfortable full-width touch targets (`py-3.5 sm:py-4`, `min-h-[48px]`).

### 8. Call-To-Action (CTA) Discipline
* **Contextual Readiness:** Place conversion CTAs where the user has completed a comprehension milestone (e.g. after understanding the 6-stage lifecycle).
* **Action Verbs:** Use `{verb} + {noun}` (e.g. `Launch Workspace`, `Explore Lineage`). Avoid ambiguous labels like `Submit`, `Go`, or `Click Here`.

### 9. Fluid Typography Hierarchy & Pairings
* **Fluid Scaling:** Use `clamp()` for text sizing so typography smoothly adapts between mobile and desktop without awkward breakpoint jumping.
* **The 4-Tier Typographic Scale:**
  1. **Display / Headline (`'Outfit'`):** High-contrast geometric sans-serif for confident, scannable statements (`text-4xl` to `text-7xl`, `font-extrabold`).
  2. **Editorial Thought (`'Instrument Serif'`):** Reserved strictly for reflective philosophy (`font-serif italic`).
  3. **Body Narrative (`'Inter'` or `'Geist'`):** Highly legible, neutral, unstyled body copy (`text-white/70`, `leading-relaxed`).
  4. **System Telemetry / Monospace:** Tabular numbers, version tags (`v2.4`), status pills (`font-mono text-xs uppercase tracking-wider`).

### 10. Section Spacing & Rhythmic Cadence
* **The 8px Base Scale:** Use multiples of 8px (`16px, 24px, 32px, 48px, 64px, 96px, 128px`).
* **Vertical Section Rhythm:**
  * Major Page Sections: `py-20 sm:py-28` (80px to 112px).
  * Section Headers to Content: `mb-12 sm:mb-16` (48px to 64px).
  * Cards / Component Internal Padding: `p-6 sm:p-10` (24px to 40px).
* **Preventing "Dead Space":** Negative space must feel intentional and structural. Anchor space with subtle micro-grids or spatial lighting.

### 11. Content Density & Cognitive Load
* **Progressive Disclosure:** Do not blast the user with 50 concepts simultaneously. Reveal depth through interactive tabs, diff toggles, and step-through progressions.
* **The 3-Second Comprehension Test:** A visitor must understand the purpose of a section within 3 seconds of scrolling into view.

### 12. Card & Surface Usage (Apple HIG Anti-Boxing Rule)
* **Apple HIG Principle:** *"Use negative space, alignment, and typography to group related information rather than boxing every single item into a card."*
* **When to Use Cards:** Only when content represents an encapsulated, independent object (e.g. an idea version, an active stage payload).
* **When NOT to Use Cards:** Section introductions, headlines, quotes, and reading narratives should live directly on the primary canvas.

### 13. Modals & Overlay Surfaces
* **Elevation Clarity:** Define strict surface tokens (`--surface-0`, `--surface-1`). Modals and drawers must be clearly elevated (`bg-[#090d16]/95 border border-white/10 shadow-2xl`).
* **Dismissibility:** Always provide both an escape key handler and a visible, high-contrast close control.

### 14. Floating & Sticky UI Architecture
* **Minimalist Footprint:** Floating controls (navbar, status pills) must never obscure content or capture accidental pointer events.
* **Pointer Events Discipline:** Use `pointer-events-none` on outer wrapper frames, re-enabling `pointer-events-auto` exclusively on interactive pills.

### 15. Interaction Hierarchy & Feedback
* **Instant Tactile States:** Every interactive control must provide immediate visual feedback:
  * `Hover`: Subtle luminance increase (`bg-white/[0.08]`, border brightening).
  * `Active / Press`: Micro-scale reduction (`active:scale-[0.98]`).
  * `Focus-Visible`: Crisp focus ring for keyboard navigation (`focus:ring-2 focus:ring-[#FF6B00]/40`).

### 16. Motion Hierarchy & Restraint
* **Motion Has a Job:** Motion should only be used to communicate: Arrival, Transformation, or Progression.
* **Prefers-Reduced-Motion:** Always provide instant or static fallbacks when `prefers-reduced-motion: reduce` is detected. Avoid layout-triggering animations; stick to `transform` and `opacity`.

### 17. Accessibility & Keyboard First (Superhuman/Raycast)
* **Contrast Ratios:** Text must meet WCAG AA contrast (minimum 4.5:1 for body, 3:1 for large display headlines).
* **Keyboard Navigation:** Ensure semantic HTML elements are used, and logical Tab order is preserved. Never remove the default focus outline without a high-contrast replacement.

### 18. Performance & WebGL Safeguards
* **Device Pixel Ratio (DPR):** Cap WebGL canvas DPR at `Math.min(window.devicePixelRatio, 1.75)` to prevent GPU throttling.
* **Single Active Render Loop:** Ensure only one 3D canvas is rendering continuously at a given time. Pause or throttle offscreen scenes.

### 19. Visual Restraint & Clutter Elimination
* **The "One Effect Per Component" Rule:** Let the content be the hero. Visual materials must quietly support, never scream. If a card has an interactive diff, do not also give it an animated border, a pulsing 3D icon, and a rainbow gradient.

### 20. Mobile Adaptation Standards
* **Vertical Linearity:** Mobile is a continuous vertical scroll. Zero horizontal overflow.
* **Touch Targets:** Minimum 44px x 44px touch targets for all buttons and interactive controls.
* **Safe-Area Insets:** Ensure generous top padding (`pt-36` to `pt-40`) to clear floating glass navbars on notch displays.

### 21. Cross-Page Design Cohesion
* All pages in the product suite (`Home`, `About`, `Services`, `Creator`, `Auth`) must share:
  * Identical background token (`#04060a`).
  * Identical spatial lighting coordinates.
  * Unified navbar with active route awareness.
  * Matching typography scale and button radii.

---

## 🔬 IdeaForge-Specific Architectural System

### The Central Product Story
IdeaForge is an AI-powered idea evolution workspace. It is built on a 6-stage evolutionary lifecycle:
```
CAPTURE → CLARIFY → CHALLENGE → EVIDENCE → REVISE → EVOLVE
```
The central concept is **WHAT CHANGED + WHY IT CHANGED**.

### Brand Personality & Visual Tone
* **What it MUST feel like:**
  * **Premium**: Sophisticated luxury dark palette (`#04060a` obsidian, 24px micro-grid).
  * **Intelligent & Spatial**: High-density typography, editorial serif reflections, deep depth layers.
  * **Calm & Focused**: Ample breathing room, disciplined cards, no visual shouting.
* **What it MUST NOT feel like:**
  * ❌ *Crowded or messy.*
  * ❌ *Cyberpunk / neon / gaming aesthetic.*
  * ❌ *Template-driven or generic SaaS landing page.*

---

## 🎨 Four Approved Visual Technologies: Usage Matrix

| Technology | Architectural Role | When to Use | When NOT to Use |
| :--- | :--- | :--- | :--- |
| **React Three Fiber (R3F)** | **Spatial / 3D Foundation** | Hero evolution lattice, interactive version transformation, craft ingot. | Never place behind dense paragraphs or inside repeated list cards. |
| **ShaderGradient** | **Atmosphere & Depth** | Background spatial depth blooms, ambient color lighting. | Never animate aggressively or use high-contrast distracting colors. |
| **Liquid Glass** | **Functional Interface Material** | Floating navigation bar, active selection pills, primary action buttons. | **Never stack glass-on-glass.** Never wrap plain text in heavy glass cards. |
| **Liquid Metal** | **Brand Moments** | IdeaForge flame insignia, identity emblems, logo marks. | Never use for body content, card borders, or general UI containers. |

> ⚠️ **The Stacking Warning:** Never combine all four visual technologies in a single component. Effects do not create hierarchy. **Layout creates hierarchy.**
