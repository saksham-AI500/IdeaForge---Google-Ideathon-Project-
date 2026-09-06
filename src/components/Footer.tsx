import React from 'react';
import { LiquidLogo } from './LiquidLogo';
import { ArrowRight, ArrowUpRight, Globe, Sparkles } from 'lucide-react';
import { ScrollReveal } from './ScrollReveal';
import { smoothScrollTo } from '../utils/smoothScroll';
import { MagneticLink } from './MagneticLink';

interface FooterProps {
  onLaunch: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onLaunch }) => {
  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    smoothScrollTo(id, { updateHash: true });
  };

  return (
    <footer id="creator" className="relative border-t border-white/10 bg-[#07090e]/95 pt-20 pb-12 px-4 sm:px-6 z-10 overflow-hidden">
      <div className="max-w-6xl mx-auto flex flex-col gap-16">
        {/* ================================================================ */}
        {/* CREATOR SHOWCASE CARD (Primary Portfolio Destination)            */}
        {/* ================================================================ */}
        <ScrollReveal delay={0} distance={20}>
          <div className="relative rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-white/[0.01] p-8 sm:p-12 lg:p-14 backdrop-blur-xl shadow-2xl overflow-hidden">
            {/* Ambient radial glows */}
            <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-10">
              {/* Creator Intro & Product Narrative */}
              <div className="space-y-4 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full liquid-glass-pill text-xs font-mono text-cyan-300">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Creator & Systems Architect</span>
                </div>

                <div className="space-y-1">
                  <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white leading-tight">
                    Saksham Gupta
                  </h2>
                  <p className="text-xs sm:text-sm font-mono text-indigo-300 tracking-wide">
                    Designer & Engineer of IdeaForge
                  </p>
                </div>

                <p className="text-sm sm:text-base text-slate-300 font-normal leading-relaxed">
                  IdeaForge was designed and engineered by Saksham Gupta as a private, dialectic idea evolution engine for the Google Gen AI Academy. It bridges multi-turn AI challenge loops with structured version history, live Tavily reality checks, and user-isolated cloud persistence.
                </p>

                <p className="text-xs sm:text-sm text-slate-400 font-mono">
                  Explore the broader body of work, interface designs, and product architectures across the portfolio.
                </p>
              </div>

              {/* Action Zone: Prominent Portfolio CTA + Subtle Secondary Links */}
              <div className="flex flex-col items-start lg:items-end gap-5 w-full lg:w-auto flex-shrink-0">
                {/* Primary Prominent CTA: VIEW MY PORTFOLIO with soft magnetic attraction and elevation transition */}
                <MagneticLink
                  href="https://saksham-ai500.github.io/portfolio/"
                  target="_blank"
                  rel="noopener noreferrer"
                  id="creator-cta-portfolio"
                  strength={0.26}
                  maxOffset={10}
                  elevationHover={4}
                  withSpotlight={true}
                  className="group relative w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-bold text-sm sm:text-base text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 shadow-[0_10px_35px_rgba(99,102,241,0.45)] hover:shadow-[0_18px_45px_rgba(99,102,241,0.65)] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-[#090b10] cursor-pointer overflow-hidden"
                >
                  {/* Subtle micro-interaction shimmer */}
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

                  <span className="tracking-wide">VIEW MY PORTFOLIO</span>
                  <ArrowRight className="w-4 h-4 text-cyan-200 group-hover:translate-x-1.5 transition-transform duration-300" />
                </MagneticLink>

                {/* Subtle Secondary Links: LinkedIn & GitHub with subtle magnetic micro-interactions */}
                <div className="flex items-center gap-3 w-full sm:w-auto justify-start lg:justify-end">
                  <MagneticLink
                    href="https://www.linkedin.com/in/saksham-gupta-88933230b/"
                    target="_blank"
                    rel="noopener noreferrer"
                    id="creator-link-linkedin"
                    aria-label="Saksham Gupta on LinkedIn"
                    strength={0.16}
                    maxOffset={6}
                    elevationHover={2}
                    withSpotlight={false}
                    className="group inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] hover:border-indigo-500/40 text-slate-300 hover:text-white text-xs font-mono active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-indigo-400/50"
                  >
                    <svg className="w-3.5 h-3.5 fill-current text-slate-400 group-hover:text-indigo-400 transition-colors" viewBox="0 0 24 24">
                      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                    </svg>
                    <span>LinkedIn</span>
                    <ArrowUpRight className="w-3 h-3 text-slate-500 group-hover:text-slate-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all duration-200" />
                  </MagneticLink>

                  <MagneticLink
                    href="https://github.com/saksham-AI500"
                    target="_blank"
                    rel="noopener noreferrer"
                    id="creator-link-github"
                    aria-label="Saksham Gupta on GitHub"
                    strength={0.16}
                    maxOffset={6}
                    elevationHover={2}
                    withSpotlight={false}
                    className="group inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] hover:border-cyan-500/40 text-slate-300 hover:text-white text-xs font-mono active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
                  >
                    <svg className="w-3.5 h-3.5 fill-current text-slate-400 group-hover:text-cyan-400 transition-colors" viewBox="0 0 24 24">
                      <path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.1-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z" />
                    </svg>
                    <span>GitHub</span>
                    <ArrowUpRight className="w-3 h-3 text-slate-500 group-hover:text-slate-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all duration-200" />
                  </MagneticLink>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* ================================================================ */}
        {/* GLOBAL NAVIGATION & BRAND BAR                                    */}
        {/* ================================================================ */}
        <ScrollReveal delay={100} distance={16}>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 pb-10 border-b border-white/5">
            {/* Brand */}
            <div className="space-y-2 max-w-sm">
              <LiquidLogo size="md" />
              <p className="text-xs text-slate-400 font-normal leading-relaxed">
                An AI-powered idea evolution workspace. Watch ideas get better and remember why.
              </p>
            </div>

            {/* Quick Navigation Links */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-slate-300">
              <a
                href="#hero"
                onClick={(e) => handleScroll(e, 'hero')}
                className="hover:text-white transition-colors"
              >
                Home
              </a>
              <a
                href="#evolution"
                onClick={(e) => handleScroll(e, 'evolution')}
                className="hover:text-white transition-colors"
              >
                Evolution
              </a>
              <a
                href="#how-it-works"
                onClick={(e) => handleScroll(e, 'how-it-works')}
                className="hover:text-white transition-colors"
              >
                How It Works
              </a>
              <a
                href="#mentor"
                onClick={(e) => handleScroll(e, 'mentor')}
                className="hover:text-white transition-colors"
              >
                About
              </a>
              <a
                href="#creator"
                onClick={(e) => handleScroll(e, 'creator')}
                className="hover:text-white transition-colors text-indigo-400"
              >
                Creator
              </a>
              <button
                onClick={onLaunch}
                id="footer-btn-launch"
                className="px-4 py-1.5 rounded-full text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors cursor-pointer"
              >
                Launch IdeaForge
              </button>
            </div>
          </div>
        </ScrollReveal>

        {/* ================================================================ */}
        {/* BOTTOM METADATA & QUICK LINKS                                    */}
        {/* ================================================================ */}
        <ScrollReveal delay={150} distance={16}>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
              <span>IdeaForge</span>
              <span className="text-slate-600">·</span>
              <span>Google Gen AI Academy APAC Cohort 3</span>
            </div>

            <div className="flex items-center gap-5 text-xs font-mono">
              <a
                href="https://saksham-ai500.github.io/portfolio/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-slate-400 hover:text-cyan-400 transition-colors"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Portfolio</span>
                <ArrowUpRight className="w-3 h-3" />
              </a>

              <a
                href="https://www.linkedin.com/in/saksham-gupta-88933230b/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-slate-400 hover:text-indigo-400 transition-colors"
              >
                <span>LinkedIn</span>
                <ArrowUpRight className="w-3 h-3" />
              </a>

              <a
                href="https://github.com/saksham-AI500"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
              >
                <span>GitHub</span>
                <ArrowUpRight className="w-3 h-3" />
              </a>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </footer>
  );
};
