import React, { useEffect, useRef, useState } from 'react';

type CursorContext = 'default' | 'link' | 'button' | 'hero-3d';

export const CustomCursor: React.FC = () => {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  // High-precision coordinates for dot and lerped trailing ring
  const mousePos = useRef({ x: -200, y: -200 });
  const ringPos = useRef({ x: -200, y: -200 });
  const currentContext = useRef<CursorContext>('default');
  const hasInitialized = useRef(false);

  const [context, setContext] = useState<CursorContext>('default');
  const [isClicking, setIsClicking] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    // High-precision rAF loop with frame-rate independent linear interpolation (lerp)
    const renderLoop = (currentTime: number) => {
      const dt = Math.min(Math.max((currentTime - lastTime) / 1000, 0.001), 0.1);
      lastTime = currentTime;

      // Exponential decay lerp factor (lambda = 18 delivers responsive, buttery smooth trail)
      const lerpFactor = 1 - Math.exp(-18 * dt);

      // Linear interpolation toward target mouse coordinates
      ringPos.current.x += (mousePos.current.x - ringPos.current.x) * lerpFactor;
      ringPos.current.y += (mousePos.current.y - ringPos.current.y) * lerpFactor;

      // Sub-pixel snapping when stationary to prevent micro-jitter
      const dx = mousePos.current.x - ringPos.current.x;
      const dy = mousePos.current.y - ringPos.current.y;
      if (Math.abs(dx) < 0.05 && Math.abs(dy) < 0.05) {
        ringPos.current.x = mousePos.current.x;
        ringPos.current.y = mousePos.current.y;
      }

      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringPos.current.x}px, ${ringPos.current.y}px, 0)`;
      }

      animId = requestAnimationFrame(renderLoop);
    };

    const updateCursorPosition = (clientX: number, clientY: number, target: EventTarget | null) => {
      mousePos.current = { x: clientX, y: clientY };

      // Instant pinpoint positioning for the center dot
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${clientX}px, ${clientY}px, 0)`;
      }

      // First cursor entrance: snap ring immediately so it doesn't fly in from off-screen
      if (!hasInitialized.current) {
        hasInitialized.current = true;
        ringPos.current = { x: clientX, y: clientY };
        if (ringRef.current) {
          ringRef.current.style.transform = `translate3d(${clientX}px, ${clientY}px, 0)`;
        }
      }

      if (!isVisible) {
        setIsVisible(true);
        document.documentElement.classList.add('custom-cursor-enabled');
      }

      // Context detection based on element under cursor
      let detectedContext: CursorContext = 'default';
      const element =
        target instanceof Element
          ? target
          : target && 'parentElement' in (target as Node) && (target as Node).parentElement instanceof Element
          ? (target as Node).parentElement
          : null;

      if (element && typeof element.closest === 'function') {
        if (element.closest('.canvas-3d-container, canvas, [data-cursor="3d"]')) {
          detectedContext = 'hero-3d';
        } else if (
          element.closest(
            'button, [role="button"], .btn, input[type="submit"], input[type="button"], [data-cursor="button"]'
          )
        ) {
          detectedContext = 'button';
        } else if (
          element.closest(
            'a, [role="link"], input, textarea, select, label[for], [role="checkbox"], [role="switch"], [data-cursor="pointer"]'
          )
        ) {
          detectedContext = 'link';
        }
      }

      if (currentContext.current !== detectedContext) {
        currentContext.current = detectedContext;
        setContext(detectedContext);
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      // If user is actively touch-tapping, do not show mouse cursor
      if (e.pointerType === 'touch') {
        setIsVisible(false);
        document.documentElement.classList.remove('custom-cursor-enabled');
        return;
      }

      updateCursorPosition(e.clientX, e.clientY, e.target);
    };

    const handleMouseMove = (e: MouseEvent) => {
      updateCursorPosition(e.clientX, e.clientY, e.target);
    };

    const handlePointerDown = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      setIsClicking(true);
    };

    const handlePointerUp = () => {
      setIsClicking(false);
    };

    const handleMouseLeave = (e: MouseEvent) => {
      // Only hide if the cursor actually exited the browser window boundaries
      if (
        e.clientY <= 0 ||
        e.clientX <= 0 ||
        e.clientX >= window.innerWidth ||
        e.clientY >= window.innerHeight
      ) {
        setIsVisible(false);
        document.documentElement.classList.remove('custom-cursor-enabled');
      }
    };

    const handleMouseEnter = (e: MouseEvent) => {
      if (hasInitialized.current) {
        updateCursorPosition(e.clientX, e.clientY, e.target);
      }
    };

    // Start render loop
    animId = requestAnimationFrame(renderLoop);

    // Attach listeners across window and document for complete coverage
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointerup', handlePointerUp);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      cancelAnimationFrame(animId);
      document.documentElement.classList.remove('custom-cursor-enabled');
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointerup', handlePointerUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [isVisible]);

  // Context-specific classes for the morphing trailing ring
  const getRingStyles = () => {
    switch (context) {
      case 'button':
        return 'w-14 h-14 -ml-7 -mt-7 border-2 border-indigo-400/90 bg-indigo-500/20 shadow-[0_0_24px_rgba(129,140,248,0.5)]';
      case 'link':
        return 'w-11 h-11 -ml-[22px] -mt-[22px] border-2 border-cyan-300/90 bg-cyan-400/20 shadow-[0_0_20px_rgba(34,211,238,0.45)]';
      case 'hero-3d':
        return 'w-16 h-16 -ml-8 -mt-8 border-2 border-cyan-400 bg-cyan-950/40 backdrop-blur-[2px] shadow-[0_0_25px_rgba(34,211,238,0.5)]';
      case 'default':
      default:
        return 'w-9 h-9 -ml-[18px] -mt-[18px] border-[1.5px] border-cyan-400/80 bg-cyan-400/[0.08] shadow-[0_0_14px_rgba(34,211,238,0.3)]';
    }
  };

  return (
    <div
      className={`pointer-events-none fixed inset-0 z-[9999999] overflow-hidden transition-opacity duration-150 select-none ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      aria-hidden="true"
    >
      {/* 1. Precision Center Dot: outer wrapper translated instantly, inner handles scale and click reaction */}
      <div
        ref={dotRef}
        className="fixed top-0 left-0 pointer-events-none will-change-transform"
        style={{ transform: 'translate3d(-200px, -200px, 0)' }}
      >
        <div
          className={`w-2.5 h-2.5 -ml-[5px] -mt-[5px] rounded-full bg-cyan-300 ring-2 ring-cyan-400/60 shadow-[0_0_12px_rgba(34,211,238,1)] transition-transform duration-100 ease-out pointer-events-none ${
            isClicking ? 'scale-75 bg-indigo-300 ring-indigo-400 shadow-[0_0_14px_rgba(129,140,248,1)]' : 'scale-100'
          }`}
        />
      </div>

      {/* 2. Fluid Trailing Ring: outer wrapper translated via lerp in rAF loop, inner handles morphing */}
      <div
        ref={ringRef}
        className="fixed top-0 left-0 pointer-events-none will-change-transform"
        style={{ transform: 'translate3d(-200px, -200px, 0)' }}
      >
        <div
          className={`rounded-full border transition-all duration-200 ease-out pointer-events-none flex items-center justify-center ${getRingStyles()} ${
            isClicking ? 'scale-90 border-indigo-300' : 'scale-100'
          }`}
        >
          {/* 3D Viewfinder crosshair overlay when hovering 3D canvas */}
          {context === 'hero-3d' && (
            <div className="relative flex flex-col items-center justify-center pointer-events-none select-none">
              <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-1.5 h-[1.5px] bg-cyan-400" />
              <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-[1.5px] bg-cyan-400" />
              <span className="absolute top-1/2 -left-1.5 -translate-y-1/2 h-1.5 w-[1.5px] bg-cyan-400" />
              <span className="absolute top-1/2 -right-1.5 -translate-y-1/2 h-1.5 w-[1.5px] bg-cyan-400" />
              <span className="text-[7px] font-mono tracking-widest text-cyan-300 font-bold uppercase">
                DRAG
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
