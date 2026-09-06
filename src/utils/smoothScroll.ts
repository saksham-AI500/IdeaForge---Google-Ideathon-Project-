/**
 * IdeaForge Custom Smooth-Scroll Navigation Engine
 * 
 * Provides high-precision, easing-curved smooth scrolling that dynamically
 * accounts for the floating/sticky header dimensions, device breakpoints,
 * user interruption, and accessibility constraints (prefers-reduced-motion).
 */

export interface SmoothScrollOptions {
  /**
   * Additional pixel buffer below the sticky header.
   * Defaults to 16px for comfortable visual clearance.
   */
  buffer?: number;

  /**
   * Explicit pixel offset to use instead of dynamic header measurement.
   */
  offset?: number;

  /**
   * Animation duration in milliseconds.
   * If omitted, dynamically calculated based on scroll travel distance.
   */
  duration?: number;

  /**
   * Custom easing function (t between 0 and 1).
   * Defaults to cubic bezier ease-in-out curve.
   */
  easing?: (t: number) => number;

  /**
   * Whether to update window.history hash upon scrolling without harsh jump.
   * Defaults to true.
   */
  updateHash?: boolean;

  /**
   * Optional callback fired when scrolling completes or is interrupted.
   */
  onComplete?: (completed: boolean) => void;
}

// Cubic easeInOut curve for organic momentum and gentle deceleration
export const easeInOutCubic = (t: number): number => {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};

// Global reference for active animation frame and listeners to ensure cancelability
let activeAnimationId: number | null = null;
let activeCleanup: (() => void) | null = null;

/**
 * Accurately measures the current sticky header height and bottom clearance.
 * Inspects #main-navigation or fallback header element.
 */
export function getStickyHeaderHeight(): number {
  if (typeof window === 'undefined') return 80;

  // 1. Prioritize measuring the navigation pill container
  const nav = document.getElementById('main-navigation');
  if (nav) {
    const navRect = nav.getBoundingClientRect();
    if (navRect.bottom > 0) {
      return Math.round(navRect.bottom);
    }
  }

  // 2. Fallback to the header wrapper
  const header = document.querySelector('header');
  if (header) {
    const headerRect = header.getBoundingClientRect();
    if (headerRect.height > 0) {
      return Math.round(headerRect.height);
    }
  }

  // 3. Fallback based on responsive viewport width
  return window.innerWidth < 640 ? 76 : 88;
}

/**
 * Calculates the exact target scroll position for an element or anchor ID,
 * taking into account sticky header clearance and document boundaries.
 */
export function calculateScrollTarget(
  target: string | HTMLElement,
  options: SmoothScrollOptions = {}
): { targetY: number; targetElement: HTMLElement | null; targetId: string } {
  const buffer = options.buffer ?? 16;
  const headerHeight = options.offset !== undefined ? options.offset : getStickyHeaderHeight();
  const effectiveOffset = headerHeight + buffer;

  let targetId = '';
  let element: HTMLElement | null = null;

  if (typeof target === 'string') {
    targetId = target.replace(/^#/, '').trim();
    if (targetId === 'hero' || targetId === 'top' || targetId === '') {
      return { targetY: 0, targetElement: document.getElementById('hero'), targetId: 'hero' };
    }
    element = document.getElementById(targetId) || document.querySelector(target);
  } else if (target instanceof HTMLElement) {
    element = target;
    targetId = element.id || '';
    if (targetId === 'hero' || targetId === 'top') {
      return { targetY: 0, targetElement: element, targetId };
    }
  }

  if (!element) {
    return { targetY: 0, targetElement: null, targetId };
  }

  // Calculate element's top position relative to document
  const rect = element.getBoundingClientRect();
  const scrollTop = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
  const elementAbsoluteTop = rect.top + scrollTop;

  // Target scroll position stops section just beneath the sticky header with buffer
  const calculatedY = Math.max(0, elementAbsoluteTop - effectiveOffset);

  // Bound to maximum scrollable document height
  const maxScroll = Math.max(
    0,
    document.documentElement.scrollHeight - window.innerHeight
  );
  const targetY = Math.min(calculatedY, maxScroll);

  return { targetY: Math.round(targetY), targetElement: element, targetId };
}

/**
 * Custom smooth-scroll execution engine with requestAnimationFrame.
 */
export function smoothScrollTo(
  target: string | HTMLElement,
  options: SmoothScrollOptions = {}
): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(false);
      return;
    }

    // Cancel any ongoing smooth scroll animation immediately
    if (activeAnimationId !== null) {
      cancelAnimationFrame(activeAnimationId);
      activeAnimationId = null;
    }
    if (activeCleanup) {
      activeCleanup();
      activeCleanup = null;
    }

    const { targetY, targetElement, targetId } = calculateScrollTarget(target, options);

    // Check user preference for reduced motion
    const prefersReducedMotion =
      window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const startY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
    const distance = targetY - startY;

    // If already at target position, resolve immediately
    if (Math.abs(distance) < 2) {
      if (options.updateHash && targetId && targetId !== 'hero') {
        try {
          history.pushState(null, '', `#${targetId}`);
        } catch {
          // ignore state errors in restricted iframes
        }
      } else if (options.updateHash && targetId === 'hero') {
        try {
          history.pushState(null, '', window.location.pathname);
        } catch {
          // ignore
        }
      }
      options.onComplete?.(true);
      resolve(true);
      return;
    }

    // If reduced motion is preferred, jump instantly without animation
    if (prefersReducedMotion) {
      window.scrollTo(0, targetY);
      if (options.updateHash && targetId) {
        try {
          history.pushState(null, '', targetId === 'hero' ? window.location.pathname : `#${targetId}`);
        } catch {
          // ignore
        }
      }
      options.onComplete?.(true);
      resolve(true);
      return;
    }

    // Compute dynamic duration based on travel distance:
    // Min 350ms, Max 800ms
    const travelAbs = Math.abs(distance);
    const calculatedDuration = Math.min(800, Math.max(350, Math.round(Math.sqrt(travelAbs) * 22)));
    const duration = options.duration ?? calculatedDuration;
    const easing = options.easing ?? easeInOutCubic;

    let startTime: number | null = null;
    let completed = false;

    // Gracefully handle user interruption (wheel, touch, or arrow keys)
    const handleUserInterruption = (e: Event) => {
      // Ignore key events not related to scrolling
      if (e instanceof KeyboardEvent) {
        const scrollKeys = ['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Space', 'Home', 'End'];
        if (!scrollKeys.includes(e.key)) return;
      }

      teardown(false);
    };

    const interruptionEvents = ['wheel', 'touchstart', 'touchmove', 'keydown'];
    interruptionEvents.forEach((evt) => {
      window.addEventListener(evt, handleUserInterruption, { passive: true, capture: true });
    });

    const teardown = (isSuccess: boolean) => {
      if (completed) return;
      completed = true;

      if (activeAnimationId !== null) {
        cancelAnimationFrame(activeAnimationId);
        activeAnimationId = null;
      }

      interruptionEvents.forEach((evt) => {
        window.removeEventListener(evt, handleUserInterruption, true);
      });

      activeCleanup = null;

      if (isSuccess && options.updateHash && targetId) {
        try {
          history.pushState(
            null,
            '',
            targetId === 'hero' ? window.location.pathname : `#${targetId}`
          );
        } catch {
          // ignore
        }
      }

      // Enhance keyboard accessibility by gently moving focus if appropriate
      if (isSuccess && targetElement && targetId !== 'hero') {
        if (!targetElement.hasAttribute('tabindex')) {
          targetElement.setAttribute('tabindex', '-1');
        }
        targetElement.focus({ preventScroll: true });
      }

      options.onComplete?.(isSuccess);
      resolve(isSuccess);
    };

    activeCleanup = () => teardown(false);

    // Animation frame loop
    const step = (currentTime: number) => {
      if (startTime === null) {
        startTime = currentTime;
      }

      const elapsed = currentTime - startTime;
      const progress = Math.min(1, elapsed / duration);
      const easedProgress = easing(progress);

      const currentY = Math.round(startY + distance * easedProgress);
      window.scrollTo(0, currentY);

      if (progress < 1) {
        activeAnimationId = requestAnimationFrame(step);
      } else {
        // Ensure final landing is pixel-exact at the calculated target
        window.scrollTo(0, targetY);
        teardown(true);
      }
    };

    activeAnimationId = requestAnimationFrame(step);
  });
}

/**
 * Convenience click handler for internal navigation anchors and buttons.
 */
export function handleSmoothScrollClick(
  e: React.MouseEvent<HTMLElement>,
  target: string,
  options?: SmoothScrollOptions
): void {
  e.preventDefault();
  smoothScrollTo(target, options);
}
