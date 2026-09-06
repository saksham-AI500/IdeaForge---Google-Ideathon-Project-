import React, { useState, useRef, useEffect } from 'react';

interface MagneticLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  children: React.ReactNode;
  strength?: number; // Dampening factor (e.g., 0.25 - 0.35)
  maxOffset?: number; // Maximum translation in pixels
  elevationHover?: number; // Additional elevation on hover in pixels
  withSpotlight?: boolean; // Radial cursor spotlight effect inside button
  className?: string;
}

export const MagneticLink: React.FC<MagneticLinkProps> = ({
  children,
  strength = 0.28,
  maxOffset = 12,
  elevationHover = 3,
  withSpotlight = true,
  className = '',
  onMouseMove,
  onMouseLeave,
  onMouseEnter,
  ...anchorProps
}) => {
  const ref = useRef<HTMLAnchorElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [spotlight, setSpotlight] = useState({ x: 50, y: 50 });
  const [isInteractive, setIsInteractive] = useState(true);

  useEffect(() => {
    // Check for reduced motion preferences or touch-only devices
    if (typeof window !== 'undefined') {
      const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
      const isTouch = window.matchMedia?.('(pointer: coarse)')?.matches;
      if (prefersReducedMotion || isTouch) {
        setIsInteractive(false);
      }
    }
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!ref.current || !isInteractive) {
      onMouseMove?.(e);
      return;
    }

    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const deltaX = e.clientX - centerX;
    const deltaY = e.clientY - centerY;

    const rawX = deltaX * strength;
    const rawY = deltaY * strength;

    const clampedX = Math.max(Math.min(rawX, maxOffset), -maxOffset);
    const clampedY = Math.max(Math.min(rawY, maxOffset), -maxOffset);

    setOffset({ x: clampedX, y: clampedY });

    if (withSpotlight) {
      const percentX = Math.round(((e.clientX - rect.left) / rect.width) * 100);
      const percentY = Math.round(((e.clientY - rect.top) / rect.height) * 100);
      setSpotlight({ x: percentX, y: percentY });
    }

    onMouseMove?.(e);
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLAnchorElement>) => {
    setIsHovered(true);
    onMouseEnter?.(e);
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLAnchorElement>) => {
    setIsHovered(false);
    setOffset({ x: 0, y: 0 });
    onMouseLeave?.(e);
  };

  // Transform styles: when hovered and moving, snappy micro-adjustment; when leaving, smooth elastic spring back
  const transformStyle: React.CSSProperties = isInteractive
    ? {
        transform: isHovered
          ? `translate3d(${offset.x}px, ${offset.y - elevationHover}px, 0)`
          : 'translate3d(0, 0, 0)',
        transition: isHovered
          ? 'transform 0.1s cubic-bezier(0.2, 0.8, 0.4, 1), box-shadow 0.25s ease'
          : 'transform 0.45s cubic-bezier(0.25, 1, 0.5, 1), box-shadow 0.3s ease',
        willChange: 'transform, box-shadow',
      }
    : {};

  return (
    <a
      ref={ref}
      className={`relative inline-flex items-center justify-center select-none ${className}`}
      style={transformStyle}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...anchorProps}
    >
      {/* Interactive cursor spotlight sheen */}
      {withSpotlight && isHovered && isInteractive && (
        <span
          className="pointer-events-none absolute inset-0 rounded-[inherit] transition-opacity duration-300 opacity-100 mix-blend-overlay overflow-hidden"
          style={{
            background: `radial-gradient(circle 90px at ${spotlight.x}% ${spotlight.y}%, rgba(255, 255, 255, 0.35), transparent 70%)`,
          }}
          aria-hidden="true"
        />
      )}
      {children}
    </a>
  );
};
