import React, { useState } from 'react';

interface LiquidLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

export const LiquidLogo: React.FC<LiquidLogoProps> = ({
  size = 'md',
  showText = true,
  className = '',
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  return (
    <div
      className={`inline-flex items-center gap-2.5 select-none group cursor-pointer ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      id="brand-liquid-logo"
    >
      <div className={`relative ${iconSizes[size]} flex items-center justify-center`}>
        {/* Ambient liquid glow behind the emblem */}
        <div
          className={`absolute inset-0 rounded-xl bg-gradient-to-tr from-indigo-600/40 via-purple-500/20 to-cyan-400/40 blur-md transition-all duration-700 ${
            isHovered ? 'opacity-100 scale-125' : 'opacity-50 scale-100'
          }`}
        />

        {/* Liquid chrome emblem container */}
        <div className="relative w-full h-full rounded-xl overflow-hidden liquid-glass-pill flex items-center justify-center p-1.5 border border-white/20 transition-transform duration-300 group-hover:scale-105">
          <svg
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full transform transition-transform duration-500 group-hover:rotate-12"
          >
            <defs>
              <linearGradient id="chrome-grad-1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="30%" stopColor="#94a3b8" />
                <stop offset="55%" stopColor="#cbd5e1" />
                <stop offset="75%" stopColor="#818cf8" />
                <stop offset="100%" stopColor="#e2e8f0" />
              </linearGradient>
              <linearGradient id="core-glow" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#4f46e5" />
                <stop offset="50%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#a855f7" />
              </linearGradient>
              <filter id="liquid-glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="0.8" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Outer morphing faceted shield / anvil */}
            <path
              d="M16 3L26 8.5V17C26 23.2 21.7 28.5 16 30C10.3 28.5 6 23.2 6 17V8.5L16 3Z"
              fill="url(#chrome-grad-1)"
              fillOpacity="0.2"
              stroke="url(#chrome-grad-1)"
              strokeWidth="1.6"
              strokeLinejoin="round"
            />

            {/* Inner dynamic spark of idea evolution */}
            <path
              d="M16 8L18.5 13.5L24 16L18.5 18.5L16 24L13.5 18.5L8 16L13.5 13.5L16 8Z"
              fill="url(#core-glow)"
              filter="url(#liquid-glow)"
              className="transition-all duration-300 group-hover:opacity-100"
            />

            {/* Polished highlight specular ridge */}
            <path
              d="M10 10L16 6L22 10"
              stroke="#ffffff"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeOpacity="0.8"
            />
          </svg>
        </div>
      </div>

      {showText && (
        <div className="flex flex-col">
          <span
            className={`font-display font-bold tracking-tight text-white flex items-center gap-1.5 ${textSizes[size]}`}
          >
            <span>Idea</span>
            <span className="liquid-chrome-text font-extrabold">Forge</span>
          </span>
          <span className="text-[10px] tracking-wider text-slate-400 font-mono -mt-1 hidden sm:block">
            IDEA EVOLUTION
          </span>
        </div>
      )}
    </div>
  );
};
